import { spawn } from "node:child_process";
import path from "node:path";
import { promises as fs } from "node:fs";
import type { Platform } from "@/lib/types/downloader";

// ── Paths ───────────────────────────────────────────────────────────────────

const YTDLP =
  "C:\\Users\\bui van\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\yt-dlp.exe";
const FFMPEG =
  "C:\\Users\\bui van\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-full_build\\bin\\ffmpeg.exe";
const DOWNLOAD_ROOT = path.join(process.cwd(), "tmp", "downloads");

// ── Config ──────────────────────────────────────────────────────────────────

/** Max wall-clock seconds a single yt-dlp invocation may run (download heavy). */
const DOWNLOAD_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
/** Max wall-clock seconds for the metadata probe (resolve phase). */
const RESOLVE_TIMEOUT_MS = 30 * 1000; // 30 seconds
/** Number of retry attempts on failure (not on rate-limit). */
const MAX_RETRIES = 2;
/** Back-off between retries (milliseconds). */
const RETRY_BACKOFF_MS = 1500;

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: number;
  platform: Platform;
  sourceUrl: string;
  formats: FormatOption[];
}

export interface FormatOption {
  id: string;
  label: string;
  ext: string;
  quality: string;
  size: string | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function formatSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "Chưa rõ";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1000) return `${(mb / 1000).toFixed(1)} GB`;
  return `${Math.round(mb)} MB`;
}

// ── Platform detection ────────────────────────────────────────────────────────

function detectPlatform(url: string): Platform {
  const u = url.toLowerCase();
  if (u.includes("tiktok.com") || u.includes("vm.tiktok.com")) return "tiktok";
  if (u.includes("facebook.com") || u.includes("fb.watch")) return "facebook";
  if (u.includes("instagram.com")) return "instagram";
  return "youtube";
}

// ── Format building ──────────────────────────────────────────────────────────

function buildFormats(info: any, platform: Platform): FormatOption[] {
  const formats: FormatOption[] = [];
  const hasAudio = info.formats?.some(
    (f: any) => f.acodec && f.acodec !== "none",
  );

  if (platform === "youtube") {
    const availHeights: Set<number> = new Set();
    for (const f of info.formats || []) {
      if (f.height && f.height >= 480) availHeights.add(f.height);
    }
    const heights = [...availHeights].sort((a, b) => b - a).slice(0, 3);

    for (const h of heights) {
      formats.push({
        id: `ytq_${h}`,
        label: `MP4 ${h}p`,
        ext: "mp4",
        quality: `${h}p`,
        size: null,
      });
    }

    if (formats.length === 0) {
      formats.push({
        id: "ytq_best",
        label: "MP4 Chất lượng cao nhất",
        ext: "mp4",
        quality: "best",
        size: null,
      });
    }
  } else {
    // TikTok / Facebook / Instagram
    formats.push({
      id: "social_best",
      label: "MP4 Chất lượng cao",
      ext: "mp4",
      quality: "best",
      size: null,
    });
  }

  if (hasAudio) {
    formats.push({
      id: "audio_mp3",
      label: "MP3 Âm thanh",
      ext: "mp3",
      quality: "audio",
      size: null,
    });
  }

  return formats;
}

// ── yt-dlp runner with timeout + retry ──────────────────────────────────────

interface RunResult {
  stdout: string;
  stderr: string;
}

async function runYtDlp(
  args: string[],
  timeoutMs: number = DOWNLOAD_TIMEOUT_MS,
): Promise<RunResult> {
  let lastErr: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        await sleep(RETRY_BACKOFF_MS * attempt);
      }
      return await spawnYtDlp(args, timeoutMs);
    } catch (err) {
      lastErr = err as Error;

      // Don't retry on hard errors (unsupported URL, private video, etc.)
      const msg = lastErr.message.toLowerCase();
      if (
        msg.includes("unsupported url") ||
        msg.includes("no extractor") ||
        msg.includes("private") ||
        msg.includes("login required") ||
        msg.includes("age") ||
        msg.includes("sign in") ||
        msg.includes("copyright") ||
        msg.includes("removed") ||
        msg.includes("deleted")
      ) {
        throw lastErr;
      }
    }
  }

  throw lastErr ?? new Error("yt-dlp failed after retries.");
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function spawnYtDlp(args: string[], timeoutMs: number): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(YTDLP, args, {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    let timer: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (timer) { clearTimeout(timer); timer = null; }
      child.stdout?.off("data", onStdout);
      child.stderr?.off("data", onStderr);
      child.removeAllListeners();
    };

    const onStdout = (d: Buffer) => { stdout += d.toString(); };
    const onStderr = (d: Buffer) => { stderr += d.toString(); };

    child.stdout!.on("data", onStdout);
    child.stderr!.on("data", onStderr);

    timer = setTimeout(() => {
      cleanup();
      child.kill("SIGKILL");
      reject(new Error("Tải video mất quá nhiều thời gian. Vui lòng thử lại."));
    }, timeoutMs);

    child.on("error", (err) => {
      cleanup();
      reject(new Error(`Không thể khởi chạy yt-dlp: ${err.message}`));
    });

    child.on("close", (code) => {
      cleanup();
      if (timer) clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(parseYtDlpError(stderr || stdout)));
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

// ── Error parsing ────────────────────────────────────────────────────────────

function parseYtDlpError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("unsupported url") || m.includes("no extractor"))
    return "Link này không được hỗ trợ. Hãy thử link từ YouTube, TikTok, Facebook hoặc Instagram.";
  if (m.includes("private") || m.includes("login required"))
    return "Video này bị đặt chế độ riêng tư. Không thể tải.";
  if (m.includes("copyright") || m.includes("removed") || m.includes("deleted"))
    return "Video đã bị xóa hoặc bị chặn bởi vi phạm bản quyền.";
  if (m.includes("geo") || m.includes("country") || m.includes("region"))
    return "Video bị giới hạn theo khu vực địa lý.";
  if (m.includes("too many requests") || m.includes("429") || m.includes("rate limit"))
    return "Quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.";
  if (m.includes("live") || m.includes("is live"))
    return "Không thể tải video đang phát trực tiếp (Livestream).";
  if (m.includes("sign in") || m.includes("age"))
    return "Video yêu cầu xác minh độ tuổi hoặc đăng nhập.";
  if (m.includes("timeout") || m.includes("timed out"))
    return "Kết nối quá chậm. Vui lòng thử lại.";
  return `Lỗi tải video: ${msg.slice(0, 150)}`;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Probe a URL — returns metadata only, no file download.
 */
export async function extractVideoInfo(url: string): Promise<VideoInfo> {
  await ensureDir(DOWNLOAD_ROOT);

  const args = [
    "-j",
    "--no-playlist",
    "--no-warnings",
    "--socket-timeout", "15",
    "--retries", "3",
    "--fragment-retries", "3",
    url,
  ];

  const { stdout } = await runYtDlp(args, RESOLVE_TIMEOUT_MS);
  const info = JSON.parse(stdout);
  const platform = detectPlatform(url);

  return {
    title: info.title || "Video không có tiêu đề",
    thumbnail: info.thumbnail || "",
    duration: info.duration || 0,
    platform,
    sourceUrl: url,
    formats: buildFormats(info, platform),
  };
}

/**
 * Download a video file to disk and return the local path.
 */
export async function downloadFile(
  sourceUrl: string,
  formatId: string,
): Promise<{ filePath: string; filename: string }> {
  const sessionId = Buffer.from(`${sourceUrl}-${formatId}`).toString("hex").slice(0, 40);
  const downloadDir = path.join(DOWNLOAD_ROOT, sessionId);

  await fs.rm(downloadDir, { recursive: true, force: true });
  await ensureDir(downloadDir);

  const outTemplate = path.join(downloadDir, "%(title)s.%(ext)s");
  const platform = detectPlatform(sourceUrl);
  const args: string[] = buildDownloadArgs(platform, formatId, outTemplate, sourceUrl);

  await runYtDlp([...args, sourceUrl], DOWNLOAD_TIMEOUT_MS);

  const files = await fs.readdir(downloadDir);
  if (files.length === 0) {
    throw new Error("Tải file thất bại: yt-dlp không tạo ra file nào.");
  }

  const filename = files[0]!;
  return { filePath: path.join(downloadDir, filename), filename };
}

// ── Download argument builder ────────────────────────────────────────────────

function buildDownloadArgs(
  platform: Platform,
  formatId: string,
  outTemplate: string,
  sourceUrl: string,
): string[] {
  const base = [
    "--no-playlist",
    "--no-warnings",
    "--socket-timeout", "15",
    "--retries", "3",
    "--fragment-retries", "3",
    "-o", outTemplate,
  ];

  if (formatId === "audio_mp3") {
    return [
      ...base,
      "-f", "bestaudio/best",
      "--extract-audio",
      "--audio-format", "mp3",
      "--audio-quality", "0",
      "--ffmpeg-location", FFMPEG,
    ];
  }

  if (formatId === "social_best") {
    if (platform === "tiktok") {
      return [
        ...base,
        "-f", "download_addr-0/best",
        "--ffmpeg-location", FFMPEG,
      ];
    }
    return [
      ...base,
      "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best",
      "--merge-output-format", "mp4",
      "--ffmpeg-location", FFMPEG,
    ];
  }

  if (formatId.startsWith("ytq_")) {
    const h = formatId === "ytq_best" ? null : parseInt(formatId.replace("ytq_", ""), 10);
    const sel = h
      ? `bestvideo[height<=${h}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${h}]+bestaudio/best[height<=${h}]`
      : `bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best`;
    return [
      ...base,
      "-f", sel,
      "--merge-output-format", "mp4",
      "--ffmpeg-location", FFMPEG,
    ];
  }

  // Generic fallback
  return [
    ...base,
    "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
    "--merge-output-format", "mp4",
    "--ffmpeg-location", FFMPEG,
  ];
}
