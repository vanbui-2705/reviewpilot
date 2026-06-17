import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { getSession } from "@/lib/rbac/session";
import { downloadFile } from "@/lib/yt-dlp-service";
import { consumeToken, type DownloadTokenPayload } from "@/lib/download-token-store";
import { checkRateLimit, resolveUserId } from "@/lib/rate-limit";

// ── Config ──────────────────────────────────────────────────────────────────

const FREE_AD_GATE_SECONDS = 5;
const ALLOWED_EXTS = new Set(["mp4", "mp3", "webm", "m4a", "mkv"]);

export const maxDuration = 300; // 5 min Vercel timeout

// ── MIME map ─────────────────────────────────────────────────────────────────

const MIME_MAP: Record<string, string> = {
  mp4:  "video/mp4",
  mkv:  "video/x-matroska",
  webm: "video/webm",
  mp3:  "audio/mpeg",
  m4a:  "audio/mp4",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Determine the ad-gate duration for the current user.
 * Premium users (shop / admin role) skip the gate entirely.
 * Free / anonymous users must wait `FREE_AD_GATE_SECONDS`.
 */
async function resolveAdGateSeconds(): Promise<number> {
  const session = await getSession();
  // shop or admin = paid → no ad gate
  if (session && (session.role === "shop" || session.role === "admin")) {
    return 0;
  }
  return FREE_AD_GATE_SECONDS;
}

// ── Route ────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const url = new URL(request.url);

  // ── 1. Token (primary) ──────────────────────────────────────────────────
  const token = url.searchParams.get("token");

  // ── 2. Legacy fallback: url + format params ─────────────────────────────
  const legacyUrl    = url.searchParams.get("url");
  const formatId     = url.searchParams.get("format") || "ytq_best";
  const legacyExt    = url.searchParams.get("ext") || "mp4";

  // ── 3. Rate limit ───────────────────────────────────────────────────────
  const userId = resolveUserId(request);
  const rateResult = await checkRateLimit(userId);

  if (!rateResult.ok) {
    const retryAfterSec = Math.ceil(rateResult.retryAfter);
    return NextResponse.json(
      {
        ok: false,
        error: `Quá nhiều yêu cầu tải file. Vui lòng thử lại sau ${retryAfterSec} giây.`,
        retryAfter: retryAfterSec,
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSec) },
      },
    );
  }

  try {
    // ── 4. Resolve download payload ───────────────────────────────────────
    let payload: DownloadTokenPayload | null = null;
    let effectiveFormatId = formatId;
    let effectiveExt = legacyExt;
    let effectiveSourceUrl = legacyUrl ?? "";

    if (token) {
      payload = await consumeToken(token);
      if (!payload) {
        return NextResponse.json(
          { ok: false, error: "Link tải đã hết hạn. Vui lòng xử lý lại link." },
          { status: 410 },
        );
      }
      // formatId may be supplied as a query override (set by resolve route response)
      const formatOverride = url.searchParams.get("format");
      if (formatOverride) effectiveFormatId = formatOverride;
      effectiveExt        = payload.ext || legacyExt;
      effectiveSourceUrl  = payload.sourceUrl;
    } else if (!legacyUrl) {
      return NextResponse.json(
        { ok: false, error: "Thiếu token hoặc URL." },
        { status: 400 },
      );
    }

    // ── 5. Ad gate check ──────────────────────────────────────────────────
    const adGateSeconds = await resolveAdGateSeconds();

    if (adGateSeconds > 0 && !token) {
      // If there's no token (legacy flow) we can't gate the ad server-side;
      // just log and proceed — the frontend should gate before requesting.
    }

    // ── 6. Download the file ──────────────────────────────────────────────
    const { filePath, filename } = await downloadFile(
      effectiveSourceUrl,
      effectiveFormatId,
    );

    // ── 7. Derive extension from actual filename ──────────────────────────
    const actualExt = (filename.split(".").pop() ?? legacyExt).toLowerCase();
    const safeExt = ALLOWED_EXTS.has(actualExt) ? actualExt : legacyExt;

    // ── 8. Build response headers ─────────────────────────────────────────
    const buffer = await readFile(filePath);

    const headers = new Headers();
    headers.set("Content-Type", MIME_MAP[safeExt] ?? "application/octet-stream");
    // RFC 5987 encoding for non-ASCII filenames
    headers.set(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    );
    headers.set("Content-Length", String(buffer.byteLength));
    headers.set("Cache-Control", "no-store");
    // Tell the frontend how long the ad gate was — it can verify server-side
    headers.set("X-Ad-Gate-Seconds", String(adGateSeconds));

    return new NextResponse(buffer, { headers });
  } catch (err: unknown) {
    console.error("[file] Download failed:", err);
    const message = err instanceof Error ? err.message : "Tải file thất bại.";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}
