import type { Platform } from "@/lib/types/downloader";

// ── Config ───────────────────────────────────────────────────────────────────

export const MOCK_AD_GATE_SECONDS = 5;

// ── Types ────────────────────────────────────────────────────────────────────

export interface MockFormatOption {
  id: string;
  label: string;
  ext: string;
  quality: string;
  size: string;
}

export interface MockResolveResponse {
  ok: true;
  title: string;
  thumbnail: string;
  duration: string;
  platform: Platform;
  formats: MockFormatOption[];
  adGateSeconds: number;
}

// ── Implementation ───────────────────────────────────────────────────────────

export function createMockResolve(url: string): MockResolveResponse {
  const platform = detectPlatform(url);

  if (platform === "unknown") {
    throw new Error(
      "Link chưa được hỗ trợ. Hãy nhập YouTube, TikTok, Facebook hoặc Instagram.",
    );
  }

  const baseFormats: MockFormatOption[] =
    platform === "youtube"
      ? [
          { id: "mp4-1080", label: "MP4 1080p",   ext: "mp4", quality: "1080p", size: "86 MB" },
          { id: "mp4-720",  label: "MP4 720p",    ext: "mp4", quality: "720p",  size: "42 MB" },
          { id: "mp3",      label: "MP3 audio",    ext: "mp3", quality: "audio", size: "7 MB"  },
        ]
      : [
          { id: "social_best", label: "MP4 Chất lượng cao", ext: "mp4", quality: "best", size: "38 MB" },
          { id: "audio_mp3",   label: "MP3 Âm thanh",      ext: "mp3", quality: "audio", size: "6 MB"  },
        ];

  return {
    ok: true,
    platform,
    title: platform === "youtube" ? "Video YouTube mẫu" : `Video ${platform} mẫu`,
    thumbnail: "/assets/product-tool.svg",
    duration: "02:48",
    formats: baseFormats,
    adGateSeconds: MOCK_AD_GATE_SECONDS,
  };
}

// ── Private helpers ──────────────────────────────────────────────────────────

function detectPlatform(url: string): Platform | "unknown" {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("facebook.com") || u.includes("fb.watch")) return "facebook";
  if (u.includes("instagram.com")) return "instagram";
  return "unknown";
}
