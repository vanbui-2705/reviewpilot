/**
 * Cache abstraction — in-memory default, ioredis drop-in.
 *
 * Usage:
 *   const cache = getCache();
 *   await cache.set("key", value, { ttl: 3600 });
 *   const hit = await cache.get<Type>("key");
 *
 * When ioredis is installed, set REDIS_URL env var and the same
 * calls go straight to Redis with no code changes elsewhere.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CacheEntry<T = unknown> {
  expiresAt: number;
  value: T;
}

export interface CacheSetOptions {
  ttl?: number;
}

export interface CacheClient {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T, opts?: CacheSetOptions): Promise<void>;
  del(key: string): Promise<void>;
  delMany(keys: string[]): Promise<void>;
  forget(key: string): Promise<boolean>;
  reset(): Promise<void>;
}

// ---------------------------------------------------------------------------
// In-memory implementation
// ---------------------------------------------------------------------------

type MemEntry = { expiresAt: number; value: unknown };

class MemoryCache implements CacheClient {
  private store = new Map<string, MemEntry>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt > 0 && Date.now() / 1000 > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(_key: string, value: T, opts: CacheSetOptions = {}): Promise<void> {
    const ttl = opts.ttl ?? 0;
    const expiresAt = ttl > 0 ? Date.now() / 1000 + ttl : 0;
    this.store.set(_key, { expiresAt, value });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async delMany(keys: string[]): Promise<void> {
    for (const k of keys) this.store.delete(k);
  }

  async forget(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  async reset(): Promise<void> {
    this.store.clear();
  }
}

// ---------------------------------------------------------------------------
// Singleton + factory
// ---------------------------------------------------------------------------

let instance: CacheClient | null = null;

export function getCache(): CacheClient {
  if (instance) return instance;

  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    // Dynamic import so the build does not fail when ioredis is absent.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const IORedis = require("ioredis");
    const redis = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
    instance = createIoredisClient(redis);
  } else {
    instance = new MemoryCache();
  }

  return instance;
}

function createIoredisClient(redis: unknown): CacheClient {
  const r = redis as {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ...args: unknown[]): Promise<string>;
    del(...keys: string[]): Promise<number>;
    flushall(): Promise<string>;
  };

  const serialize = (v: unknown) => JSON.stringify(v);
  const deserialize = <T>(raw: string | null): T | null => {
    if (raw === null) return null;
    try { return JSON.parse(raw) as T; } catch { return raw as T; }
  };

  return {
    async get<T>(key: string): Promise<T | null> {
      const raw = await r.get(key);
      return deserialize<T>(raw);
    },

    async set<T>(key: string, value: T, opts: CacheSetOptions = {}): Promise<void> {
      const serialized = serialize(value);
      if ((opts.ttl ?? 0) > 0) {
        await r.set(key, serialized, "EX", opts.ttl);
      } else {
        await r.set(key, serialized);
      }
    },

    async del(key: string): Promise<void> {
      await r.del(key);
    },

    async delMany(keys: string[]): Promise<void> {
      if (keys.length > 0) await r.del(...keys);
    },

    async forget(key: string): Promise<boolean> {
      const result = await r.del(key);
      return result > 0;
    },

    async reset(): Promise<void> {
      await r.flushall();
    },
  };
}
