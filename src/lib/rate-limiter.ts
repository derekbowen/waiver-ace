/**
 * Simple in-memory rate limiter for Deno edge functions.
 * Uses a sliding window counter per key (IP, user ID, etc.)
 *
 * Usage in an edge function:
 *   const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });
 *   const ip = req.headers.get("x-forwarded-for") || "unknown";
 *   if (!limiter.check(ip)) {
 *     return new Response("Too many requests", { status: 429 });
 *   }
 */

interface RateLimiterOptions {
  windowMs: number;   // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

interface RequestLog {
  count: number;
  resetAt: number;
}

export function createRateLimiter(opts: RateLimiterOptions) {
  const store = new Map<string, RequestLog>();

  // Clean up expired entries every 60s
  setInterval(() => {
    const now = Date.now();
    for (const [key, log] of store) {
      if (log.resetAt <= now) store.delete(key);
    }
  }, 60_000);

  return {
    check(key: string): boolean {
      const now = Date.now();
      const log = store.get(key);

      if (!log || log.resetAt <= now) {
        store.set(key, { count: 1, resetAt: now + opts.windowMs });
        return true;
      }

      if (log.count >= opts.maxRequests) {
        return false;
      }

      log.count++;
      return true;
    },

    remaining(key: string): number {
      const log = store.get(key);
      if (!log || log.resetAt <= Date.now()) return opts.maxRequests;
      return Math.max(0, opts.maxRequests - log.count);
    },
  };
}
