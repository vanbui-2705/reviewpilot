/**
 * Download token store — maps a short-lived token → download parameters.
 *
 * Flow:
 *   1. resolve route calls `issueToken(...)` → returns `{ token, expiresIn }`
 *   2. Frontend stores the token and uses it when requesting the file
 *   3. file/route calls `consumeToken(token)` → returns params + deletes token
 *      (one-shot consumption so a link can't be replayed)
 *
 * Backed by Cache abstraction (Redis or in-memory). TTL = 15 minutes.
 */

import { getCache } from "./cache";

const PREFIX = "dl_token:";
const TTL_SECONDS = 15 * 60; // 15 minutes

export interface DownloadTokenPayload {
  sourceUrl: string;
  formatId: string;
  ext: string;
  platform: string;
  title: string;
  thumbnail: string;
  duration: number;
}

const cache = getCache();

function key(token: string): string {
  return `${PREFIX}${token}`;
}

/**
 * Issue a new token and persist the payload.
 * Returns the plain token string and its TTL in seconds.
 */
export async function issueToken(
  payload: DownloadTokenPayload,
): Promise<{ token: string; expiresIn: number }> {
  const token = makeToken();
  await cache.set(key(token), payload, { ttl: TTL_SECONDS });
  return { token, expiresIn: TTL_SECONDS };
}

/**
 * Atomically read and delete the token.
 * Returns null if missing or expired.
 */
export async function consumeToken(
  token: string,
): Promise<DownloadTokenPayload | null> {
  const k = key(token);
  const payload = await cache.get<DownloadTokenPayload>(k);
  if (!payload) return null;
  await cache.del(k);
  return payload;
}

/**
 * Peek without deleting — used for validation checks.
 */
export async function peekToken(
  token: string,
): Promise<DownloadTokenPayload | null> {
  return cache.get<DownloadTokenPayload>(key(token));
}

/**
 * Revoke a token early.
 */
export async function revokeToken(token: string): Promise<void> {
  await cache.del(key(token));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeToken(): string {
  // 32-char hex = 128-bit entropy, sufficient for unguessable tokens
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Node ≤ 18 fallback
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Buffer.from(bytes).toString("hex");
}
