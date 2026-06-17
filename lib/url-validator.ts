/**
 * URL validation — whitelist + normalization.
 */

import type { Platform } from "@/lib/types/downloader";

/** Domains allowed for download (public traffic engine). */
export const ALLOWED_DOMAINS: Record<Platform, readonly string[]> = {
  youtube: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"],
  tiktok: ["tiktok.com", "www.tiktok.com", "vm.tiktok.com", "vt.tiktok.com", "m.tiktok.com"],
  facebook: ["facebook.com", "www.facebook.com", "fb.watch", "fb.com", "web.facebook.com", "m.facebook.com"],
  instagram: ["instagram.com", "www.instagram.com", "m.instagram.com"],
};

export interface UrlValidationResult {
  ok: boolean;
  platform: Platform | null;
  normalizedUrl: string;
  error?: string;
}

/**
 * Validate and normalize a user-supplied URL.
 * - Expands youtu.be shortlinks → youtube.com/watch?v=…
 * - Rejects unknown platforms with a clear error message.
 */
export function validateUrl(raw: string): UrlValidationResult {
  let trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, platform: null, normalizedUrl: "", error: "URL không được để trống." };
  }

  // Auto-prefix scheme
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, platform: null, normalizedUrl: trimmed, error: "URL không hợp lệ." };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Expand youtu.be shortlinks
  if (hostname === "youtu.be") {
    const videoId = parsed.pathname.slice(1);
    if (!videoId) {
      return { ok: false, platform: null, normalizedUrl: trimmed, error: "Link YouTube rút gọn thiếu video ID." };
    }
    parsed = new URL(`https://www.youtube.com/watch?v=${videoId}`);
  }

  // youtube.com/shorts/… normalization
  const ytShorts = parsed.pathname.match(/^\/shorts\/([A-Za-z0-9_-]+)/);
  if (ytShorts && hostname.includes("youtube.com")) {
    parsed = new URL(`https://www.youtube.com/watch?v=${ytShorts[1]}`);
  }

  const finalHostname = parsed.hostname.toLowerCase();

  // Match against whitelist
  for (const [platform, domains] of Object.entries(ALLOWED_DOMAINS)) {
    if (domains.some((d) => d === finalHostname || finalHostname.endsWith(`.${d}`))) {
      return { ok: true, platform: platform as Platform, normalizedUrl: parsed.toString() };
    }
  }

  return {
    ok: false,
    platform: null,
    normalizedUrl: trimmed,
    error: `Nền tảng "${finalHostname}" chưa được hỗ trợ. Hiện tại chỉ hỗ trợ YouTube, TikTok, Facebook và Instagram.`,
  };
}
