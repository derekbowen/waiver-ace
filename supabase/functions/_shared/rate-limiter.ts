/**
 * Simple in-memory rate limiter for Deno edge functions.
 * Uses a sliding window counter per key (IP, user ID, etc.)
 */

interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
}

interface RequestLog {
  count: number;
  resetAt: number;
}

const store = new Map<string, RequestLog>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, log] of store) {
    if (log.resetAt <= now) store.delete(key);
  }
}, 60_000);

export function checkRateLimit(
  key: string,
  opts: RateLimiterOptions = { windowMs: 60_000, maxRequests: 30 }
): boolean {
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
}

export function rateLimitResponse(corsHeaders: Record<string, string>) {
  return new Response(
    JSON.stringify({ error: "Too many requests. Please try again later." }),
    {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
