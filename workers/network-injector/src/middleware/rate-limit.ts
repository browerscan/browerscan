/**
 * Rate Limiting Middleware
 * Token bucket algorithm using Cloudflare KV
 */

import { Context, MiddlewareHandler } from 'hono';

interface RateLimitConfig {
  /** Maximum requests per window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Optional key prefix for KV */
  prefix?: string;
  /** Skip rate limiting for certain conditions */
  skip?: (c: Context) => boolean;
}

interface RateLimitState {
  count: number;
  resetAt: number;
}

/**
 * Creates a rate limiting middleware using Cloudflare KV
 *
 * Note: Requires a KV namespace binding named 'RATE_LIMIT_KV' in wrangler.toml
 * If KV is not available, rate limiting is skipped (fail-open)
 */
export function rateLimit(config: RateLimitConfig): MiddlewareHandler {
  const {
    limit,
    windowSeconds,
    prefix = 'rl',
    skip,
  } = config;

  return async (c: Context, next) => {
    // Check if we should skip rate limiting
    if (skip && skip(c)) {
      await next();
      return;
    }

    // Get KV binding (optional - rate limiting is disabled if not available)
    const kv = (c.env as Record<string, unknown>).RATE_LIMIT_KV as KVNamespace | undefined;

    if (!kv) {
      // Fail open - no rate limiting if KV is not configured
      c.header('X-RateLimit-Enabled', 'false');
      await next();
      return;
    }

    // Get client identifier (IP address)
    const ip = c.req.header('cf-connecting-ip') ||
               c.req.header('x-forwarded-for')?.split(',')[0] ||
               'unknown';

    // Create unique key for this IP + endpoint combination
    const path = new URL(c.req.url).pathname;
    const key = `${prefix}:${ip}:${path}`;

    try {
      // Get current state from KV
      const stateJson = await kv.get(key);
      const now = Math.floor(Date.now() / 1000);

      let state: RateLimitState;

      if (stateJson) {
        state = JSON.parse(stateJson);

        // Check if window has reset
        if (now >= state.resetAt) {
          // Start new window
          state = {
            count: 1,
            resetAt: now + windowSeconds,
          };
        } else {
          // Increment count in current window
          state.count++;
        }
      } else {
        // First request in this window
        state = {
          count: 1,
          resetAt: now + windowSeconds,
        };
      }

      // Store updated state
      await kv.put(key, JSON.stringify(state), {
        expirationTtl: windowSeconds + 60, // Add buffer for clock skew
      });

      // Set rate limit headers
      const remaining = Math.max(0, limit - state.count);
      c.header('X-RateLimit-Limit', limit.toString());
      c.header('X-RateLimit-Remaining', remaining.toString());
      c.header('X-RateLimit-Reset', state.resetAt.toString());

      // Check if limit exceeded
      if (state.count > limit) {
        c.header('Retry-After', (state.resetAt - now).toString());
        return c.json({
          status: 'error',
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please try again later.',
          retry_after: state.resetAt - now,
        }, 429);
      }

      await next();
    } catch (error) {
      // Fail open on KV errors
      console.error('Rate limit error:', error);
      await next();
    }
  };
}

/**
 * Pre-configured rate limiters for different endpoint types
 */

/** Standard API rate limit: 60 requests per minute */
export const standardRateLimit = rateLimit({
  limit: 60,
  windowSeconds: 60,
  prefix: 'rl:std',
});

/** Strict rate limit for sensitive endpoints: 10 requests per minute */
export const strictRateLimit = rateLimit({
  limit: 10,
  windowSeconds: 60,
  prefix: 'rl:strict',
});

/** Scan rate limit: 20 scans per minute */
export const scanRateLimit = rateLimit({
  limit: 20,
  windowSeconds: 60,
  prefix: 'rl:scan',
});

/** Tool rate limit: 30 requests per minute */
export const toolRateLimit = rateLimit({
  limit: 30,
  windowSeconds: 60,
  prefix: 'rl:tool',
});
