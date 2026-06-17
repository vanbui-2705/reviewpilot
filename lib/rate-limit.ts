/**
 * Rate limiter — sliding window.
 *
 * Contract: 5 requests per 10 minutes per user (keyed by IP).
 * Redis-backed when available; falls back to in-memory.
 */

import { getCache } from "./cache";

// ── Config ────────────────────────────────────────────────────────────────

export const RATE_LIMIT_CONFIG = {
  /** Max requests within the window */
  maxRequests: 5,
  /** Window duration in seconds (10 minutes) */
  windowSeconds: 10 * 60,
  /** Redis / cache key prefix */
  prefix: "rl:dl:",
  /** HTTP header names returned on limit */
  retryAfterHeader: "Retry-After",
} as const;

// ── Types ─────────────────────────────────────────────────────────────────

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; remaining: 0; retryAfter: number };

// ── Core ──────────────────────────────────────────────────────────────────

/**
 * Check + increment the rate-limit counter for `userId`.
 *
 * Uses a Redis sorted set (or a Map[] fallback) keyed by `userId`:
 *   - Score  = request timestamp (unix seconds)
 *   - Member = request timestamp (used to identify individual hits)
 *
 * Algorithm:
 *   1. Remove all members older than window boundary.
 *   2. Count remaining.
 *   3. If under limit → add this request and return ok.
 *   4. If over limit  → return reject with Retry-After (seconds).
 */
export async function checkRateLimit(
  userId: string,
): Promise<RateLimitResult> {
  const cache = getCache();
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - RATE_LIMIT_CONFIG.windowSeconds;
  const key = `${RATE_LIMIT_CONFIG.prefix}${userId}`;

  // We treat the cache key as a "counter bucket":
  // value = JSON array of { ts: number } timestamps inside the window.
  // This works naturally with both MemoryCache and Redis (which stores JSON strings).

  const raw = await cache.get<{ ts: number }[] | null>(key);
  const hits: { ts: number }[] = (raw ?? []).filter((h) => h.ts > windowStart);

  if (hits.length >= RATE_LIMIT_CONFIG.maxRequests) {
    // Oldest hit determines when the user can retry
    const oldest = hits[0]!.ts;
    const retryAfter = RATE_LIMIT_CONFIG.windowSeconds - (now - oldest);
    return { ok: false, remaining: 0, retryAfter: Math.max(retryAfter, 1) };
  }

  hits.push({ ts: now });
  await cache.set(key, hits, { ttl: RATE_LIMIT_CONFIG.windowSeconds + 5 });

  return { ok: true, remaining: RATE_LIMIT_CONFIG.maxRequests - hits.length };
}

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Extract a user identifier from the request.
 * Priority: x-forwarded-for → x-real-ip → "anonymous".
 */
export function resolveUserId(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  const xri = request.headers.get("x-real-ip");

  let ip: string;
  if (xff) {
    // x-forwarded-for can be a comma-separated list; first is the client
    ip = xff.split(",")[0]!.trim();
  } else if (xri) {
    ip = xri.trim();
  } else {
    ip = "anonymous";
  }

  // Sanitize: replace colons (IPv6) so it's a valid Redis key fragment
  return `ip:${ip.replace(/[:]/g, "_")}`;
}
