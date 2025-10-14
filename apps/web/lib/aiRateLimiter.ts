/**
 * AI Rate Limiter
 * Implements token bucket algorithm for AI API rate limiting
 * Per-org tracking with configurable limits
 */

interface RateLimitConfig {
  maxRequests: number; // Maximum requests per window
  windowMs: number; // Time window in milliseconds
}

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

// In-memory store (in production, use Redis)
const buckets = new Map<string, RateLimitBucket>();

// Rate limit configurations by endpoint type
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'brief-generator': { maxRequests: 10, windowMs: 60000 }, // 10 per minute
  'ad-copy': { maxRequests: 20, windowMs: 60000 }, // 20 per minute
  'script': { maxRequests: 10, windowMs: 60000 }, // 10 per minute
  'auto-tag': { maxRequests: 50, windowMs: 60000 }, // 50 per minute
  'cutdown-plan': { maxRequests: 10, windowMs: 60000 }, // 10 per minute
};

export class AIRateLimiter {
  /**
   * Check if request is allowed under rate limit
   * @param orgId Organization ID
   * @param endpoint AI endpoint type
   * @returns true if allowed, false if rate limited
   */
  static async checkLimit(orgId: string, endpoint: string): Promise<boolean> {
    const config = RATE_LIMITS[endpoint];
    if (!config) {
      throw new Error(`Unknown endpoint: ${endpoint}`);
    }

    const key = `${orgId}:${endpoint}`;
    const now = Date.now();

    let bucket = buckets.get(key);

    // Initialize bucket if doesn't exist
    if (!bucket) {
      bucket = {
        tokens: config.maxRequests,
        lastRefill: now,
      };
      buckets.set(key, bucket);
    }

    // Refill tokens based on time elapsed
    const timeSinceRefill = now - bucket.lastRefill;
    const refillAmount = Math.floor((timeSinceRefill / config.windowMs) * config.maxRequests);

    if (refillAmount > 0) {
      bucket.tokens = Math.min(config.maxRequests, bucket.tokens + refillAmount);
      bucket.lastRefill = now;
    }

    // Check if tokens available
    if (bucket.tokens > 0) {
      bucket.tokens--;
      return true;
    }

    return false;
  }

  /**
   * Get remaining tokens for org/endpoint
   */
  static getRemainingTokens(orgId: string, endpoint: string): number {
    const key = `${orgId}:${endpoint}`;
    const bucket = buckets.get(key);
    return bucket?.tokens ?? RATE_LIMITS[endpoint]?.maxRequests ?? 0;
  }

  /**
   * Reset rate limit for org/endpoint (admin use)
   */
  static reset(orgId: string, endpoint: string): void {
    const key = `${orgId}:${endpoint}`;
    buckets.delete(key);
  }
}

/**
 * Rate limit middleware for AI endpoints
 */
export async function withAIRateLimit(
  orgId: string,
  endpoint: string,
  handler: () => Promise<Response>
): Promise<Response> {
  const allowed = await AIRateLimiter.checkLimit(orgId, endpoint);

  if (!allowed) {
    const remaining = AIRateLimiter.getRemainingTokens(orgId, endpoint);
    return Response.json(
      {
        error: 'Rate limit exceeded',
        message: 'Too many AI requests. Please try again later.',
        remaining,
      },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Remaining': remaining.toString(),
        },
      }
    );
  }

  return handler();
}
