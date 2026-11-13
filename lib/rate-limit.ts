import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/** Model (OpenRouter) messages per visitor per hour. */
export const CHAT_LIMIT = Math.max(1, Number(process.env.CHAT_RATE_LIMIT_PER_HOUR) || 20);
/** Native-agent messages per visitor per hour (no model cost, so a looser cap that only stops abuse). */
export const NATIVE_LIMIT = Math.max(CHAT_LIMIT, Number(process.env.NATIVE_RATE_LIMIT_PER_HOUR) || 60);
const WINDOW_MS = 60 * 60 * 1000;

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
    : null;

export type RateLimitResult = { ok: boolean; remaining: number; reset: number; limit: number };

function createLimiter(prefix: string, limit: number) {
  const upstash = redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(limit, "1 h"), prefix }) : null;

  /* In-memory fallback for local development (per server instance; not shared across lambdas). */
  const memory = new Map<string, number[]>();
  const recent = (key: string) => {
    const now = Date.now();
    return (memory.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  };

  return {
    async take(key: string): Promise<RateLimitResult> {
      if (upstash) {
        try {
          const r = await upstash.limit(key);
          return { ok: r.success, remaining: r.remaining, reset: r.reset, limit };
        } catch (err) {
          console.error(`[rate-limit:${prefix}] Upstash unavailable, falling back to memory`, err);
        }
      }
      const hits = recent(key);
      if (hits.length >= limit) {
        memory.set(key, hits);
        return { ok: false, remaining: 0, reset: hits[0] + WINDOW_MS, limit };
      }
      hits.push(Date.now());
      memory.set(key, hits);
      if (memory.size > 10_000) {
        const now = Date.now();
        for (const [k, v] of memory) if (now - v[v.length - 1] > WINDOW_MS) memory.delete(k);
      }
      return { ok: true, remaining: limit - hits.length, reset: hits[0] + WINDOW_MS, limit };
    },

    /** Remaining budget without consuming any. */
    async peek(key: string): Promise<RateLimitResult> {
      if (upstash) {
        try {
          const r = await upstash.getRemaining(key);
          return { ok: r.remaining > 0, remaining: r.remaining, reset: r.reset, limit };
        } catch {
          /* fall through */
        }
      }
      const hits = recent(key);
      return {
        ok: hits.length < limit,
        remaining: Math.max(0, limit - hits.length),
        reset: hits.length ? hits[0] + WINDOW_MS : Date.now() + WINDOW_MS,
        limit,
      };
    },
  };
}

export const chatLimiter = createLimiter("agent-chat", CHAT_LIMIT);
export const nativeLimiter = createLimiter("agent-native", NATIVE_LIMIT);
/** Open Channel messages per visitor per hour. */
export const contactLimiter = createLimiter("contact", 5);

/** Back-compat helper. */
export const rateLimit = (key: string) => chatLimiter.take(key);
