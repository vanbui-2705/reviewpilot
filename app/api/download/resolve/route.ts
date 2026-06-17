import { NextResponse } from "next/server";
import { z } from "zod";
import { extractVideoInfo } from "@/lib/yt-dlp-service";
import { validateUrl } from "@/lib/url-validator";
import { checkRateLimit, resolveUserId } from "@/lib/rate-limit";
import { issueToken } from "@/lib/download-token-store";
import { getCache } from "@/lib/cache";
import type { Platform } from "@/lib/types/downloader";

// ── Config ──────────────────────────────────────────────────────────────────

const CACHE_TTL_SECONDS = 60 * 60; // 1 hour
const CACHE_PREFIX = "resolve:";
const AD_GATE_SECONDS = 5;

// ── Schema ──────────────────────────────────────────────────────────────────

const bodySchema = z.object({
  url: z.string().min(1, "URL không được để trống."),
});

// ── Cache helpers ────────────────────────────────────────────────────────────

const cache = getCache();

function cacheKey(url: string): string {
  return `${CACHE_PREFIX}${url}`;
}

// ── Internal types ───────────────────────────────────────────────────────────

interface FormatResponse {
  id: string;
  label: string;
  ext: string;
  quality: string;
  size: string | null;
}

interface CacheProbeResult {
  title: string;
  thumbnail: string;
  duration: string;
  platform: Platform;
  formats: FormatResponse[];
}

// ── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    // 1 ── Parse & validate body
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." },
        { status: 400 },
      );
    }

    const rawUrl = parsed.data.url;

    // 2 ── URL whitelist check
    const { ok: urlOk, platform, normalizedUrl, error: urlError } = validateUrl(rawUrl);

    if (!urlOk) {
      return NextResponse.json(
        { ok: false, error: urlError ?? "URL không hợp lệ." },
        { status: 400 },
      );
    }

    // 3 ── Rate limit (5 requests / 10 minutes per IP)
    const userId = resolveUserId(request);
    const rateResult = await checkRateLimit(userId);

    if (!rateResult.ok) {
      const retryAfterSec = Math.ceil(rateResult.retryAfter);
      return NextResponse.json(
        {
          ok: false,
          error: `Bạn đã sử dụng quá 5 lần trong 10 phút. Vui lòng thử lại sau ${retryAfterSec} giây.`,
          retryAfter: retryAfterSec,
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSec) },
        },
      );
    }

    // 4 ── Cache probe (avoid hitting yt-dlp twice for the same URL)
    const cached = await cache.get<CacheProbeResult>(cacheKey(normalizedUrl));

    if (cached) {
      // Cache hit: issue a fresh token so the frontend can download again
      const { token } = await issueToken({
        sourceUrl: normalizedUrl,
        formatId: "",
        ext: "",
        platform: cached.platform,
        title: cached.title,
        thumbnail: cached.thumbnail,
        duration: 0, // unknown at cache-hit; yt-dlp not re-run
      });

      return NextResponse.json({
        ok: true,
        ...cached,
        adGateSeconds: AD_GATE_SECONDS,
        rateLimitRemaining: rateResult.remaining,
        downloadToken: token,
        downloadUrl: `/api/download/file?token=${token}`,
      });
    }

    // 5 ── yt-dlp probe
    let info;
    try {
      info = await extractVideoInfo(normalizedUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể xử lý link này.";
      return NextResponse.json(
        { ok: false, error: message },
        { status: 400 },
      );
    }

    // 6 ── Issue download token (needs info from yt-dlp probe)
    const { token } = await issueToken({
      sourceUrl: normalizedUrl,
      formatId: "",
      ext: "",
      platform: info.platform,
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
    });

    // 7 ── Build response
    const response = {
      ok: true,
      title: info.title,
      thumbnail: info.thumbnail,
      duration: formatDuration(info.duration),
      platform: info.platform,
      formats: info.formats.map((f) => ({
        id: f.id,
        label: f.label,
        ext: f.ext,
        quality: f.quality,
        size: f.size,
      })),
      adGateSeconds: AD_GATE_SECONDS,
      rateLimitRemaining: rateResult.remaining,
      downloadToken: token,
      downloadUrl: `/api/download/file?token=${token}`,
    };

    // 8 ── Cache for future hits (duration as string for display)
    const cachePayload: CacheProbeResult = {
      title: info.title,
      thumbnail: info.thumbnail,
      duration: response.duration,
      platform: info.platform,
      formats: response.formats,
    };
    await cache.set(cacheKey(normalizedUrl), cachePayload, { ttl: CACHE_TTL_SECONDS });

    return NextResponse.json(response);
  } catch (err: unknown) {
    console.error("[resolve] Unexpected error:", err);
    return NextResponse.json(
      { ok: false, error: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau." },
      { status: 500 },
    );
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
