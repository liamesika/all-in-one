/**
 * Redis-backed Rate Limiting Middleware
 * Protects API endpoints from abuse with configurable limits
 *
 * Features:
 * - Redis-based distributed rate limiting
 * - Per-user and per-IP limiting
 * - Route-specific limits
 * - Sliding window algorithm
 * - Graceful degradation if Redis unavailable
 */

import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis client (Upstash for serverless compatibility)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

interface RateLimitConfig {
  /**
   * Maximum number of requests allowed
   */
  limit: number;

  /**
   * Time window in seconds
   */
  window: number;

  /**
   * Custom identifier (defaults to user UID or IP)
   */
  identifier?: (request: NextRequest) => string;

  /**
   * Skip rate limiting for certain conditions
   */
  skip?: (request: NextRequest) => boolean;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Rate limit presets for common use cases
 */
export const RateLimitPresets = {
  // Standard API calls (100 req/min per user)
  STANDARD: {
    limit: 100,
    window: 60,
  },

  // AI-powered endpoints (10 req/min per user)
  AI_OPERATIONS: {
    limit: 10,
    window: 60,
  },

  // Data import/export (5 req/min per user)
  IMPORT_EXPORT: {
    limit: 5,
    window: 60,
  },

  // Campaign operations (20 req/min per user)
  CAMPAIGNS: {
    limit: 20,
    window: 60,
  },

  // File uploads (10 req/5min per user)
  FILE_UPLOAD: {
    limit: 10,
    window: 300,
  },

  // Authentication endpoints (5 req/min per IP)
  AUTH: {
    limit: 5,
    window: 60,
  },

  // Webhook endpoints (100 req/min per source)
  WEBHOOKS: {
    limit: 100,
    window: 60,
  },

  // Search/filtering (50 req/min per user)
  SEARCH: {
    limit: 50,
    window: 60,
  },
} as const;

/**
 * Get client identifier from request
 */
function getClientIdentifier(request: NextRequest, customIdentifier?: (req: NextRequest) => string): string {
  if (customIdentifier) {
    return customIdentifier(request);
  }

  // Try to get user UID from headers (set by auth middleware)
  const userUid = request.headers.get('x-user-id');
  if (userUid) {
    return `user:${userUid}`;
  }

  // Fallback to IP address
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';

  return `ip:${ip}`;
}

/**
 * Check rate limit using Redis
 */
async function checkRateLimitRedis(
  key: string,
  limit: number,
  window: number
): Promise<RateLimitResult> {
  if (!redis) {
    // Redis not configured - allow request but log warning
    console.warn('[Rate Limit] Redis not configured, skipping rate limit check');
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + window * 1000,
    };
  }

  try {
    const now = Date.now();
    const windowStart = now - window * 1000;

    // Use sorted set for sliding window
    const pipeline = redis.pipeline();

    // Remove old entries
    pipeline.zremrangebyscore(key, 0, windowStart);

    // Add current request
    pipeline.zadd(key, { score: now, member: now });

    // Count requests in window
    pipeline.zcard(key);

    // Set expiry
    pipeline.expire(key, window);

    const results = await pipeline.exec();
    const count = results[2] as number;

    const remaining = Math.max(0, limit - count);
    const resetTime = now + window * 1000;

    if (count > limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: resetTime,
        retryAfter: window,
      };
    }

    return {
      success: true,
      limit,
      remaining,
      reset: resetTime,
    };
  } catch (error) {
    console.error('[Rate Limit] Redis error:', error);
    // On Redis error, allow request (fail open)
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + window * 1000,
    };
  }
}

/**
 * In-memory fallback rate limiting (for development)
 */
const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimitMemory(
  key: string,
  limit: number,
  window: number
): RateLimitResult {
  const now = Date.now();
  const stored = inMemoryStore.get(key);

  if (!stored || now > stored.resetTime) {
    // Reset window
    inMemoryStore.set(key, {
      count: 1,
      resetTime: now + window * 1000,
    });

    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + window * 1000,
    };
  }

  stored.count++;

  const remaining = Math.max(0, limit - stored.count);

  if (stored.count > limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: stored.resetTime,
      retryAfter: Math.ceil((stored.resetTime - now) / 1000),
    };
  }

  return {
    success: true,
    limit,
    remaining,
    reset: stored.resetTime,
  };
}

/**
 * Rate limit middleware wrapper
 *
 * Usage:
 * ```typescript
 * export const POST = rateLimit(
 *   async (request) => {
 *     // Your handler logic
 *     return NextResponse.json({ data: 'success' });
 *   },
 *   RateLimitPresets.AI_OPERATIONS
 * );
 * ```
 */
export function rateLimit<T = any>(
  handler: (
    request: NextRequest,
    context?: { params?: T }
  ) => Promise<NextResponse>,
  config: RateLimitConfig
) {
  return async (request: NextRequest, routeContext?: { params: T }) => {
    // Check if rate limiting should be skipped
    if (config.skip && config.skip(request)) {
      return handler(request, routeContext);
    }

    // Get client identifier
    const identifier = getClientIdentifier(request, config.identifier);
    const key = `ratelimit:${request.nextUrl.pathname}:${identifier}`;

    // Check rate limit
    const result = redis
      ? await checkRateLimitRedis(key, config.limit, config.window)
      : checkRateLimitMemory(key, config.limit, config.window);

    // Add rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', result.limit.toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', result.reset.toString());

    if (!result.success) {
      headers.set('Retry-After', (result.retryAfter || config.window).toString());

      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again in ${result.retryAfter || config.window} seconds.`,
          limit: result.limit,
          remaining: 0,
          reset: result.reset,
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // Call handler with rate limit headers
    const response = await handler(request, routeContext);

    // Add rate limit headers to response
    headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

/**
 * Combined rate limit + auth middleware
 *
 * Usage:
 * ```typescript
 * export const POST = rateLimitWithAuth(
 *   async (request, { user }) => {
 *     // Your handler logic
 *     return NextResponse.json({ data: 'success' });
 *   },
 *   RateLimitPresets.AI_OPERATIONS
 * );
 * ```
 */
export function rateLimitWithAuth<T = any>(
  handler: (
    request: NextRequest,
    context: { user: any; uid: string; email?: string; params?: T }
  ) => Promise<NextResponse>,
  config: RateLimitConfig
) {
  return async (request: NextRequest, routeContext?: { params: T }) => {
    const { withAuth } = await import('@/lib/apiAuth');

    // Wrap with auth first, then rate limit
    const authHandler = withAuth(handler);

    // Apply rate limiting
    return rateLimit(authHandler, config)(request, routeContext);
  };
}

/**
 * Get current rate limit status for a key (for monitoring)
 */
export async function getRateLimitStatus(key: string): Promise<RateLimitResult | null> {
  if (!redis) return null;

  try {
    const count = await redis.zcard(key);
    const ttl = await redis.ttl(key);

    return {
      success: true,
      limit: 100, // Default, would need to be tracked separately
      remaining: Math.max(0, 100 - count),
      reset: Date.now() + ttl * 1000,
    };
  } catch (error) {
    console.error('[Rate Limit] Error getting status:', error);
    return null;
  }
}

/**
 * Clear rate limit for a specific key (for testing/admin)
 */
export async function clearRateLimit(key: string): Promise<void> {
  if (!redis) return;

  try {
    await redis.del(key);
    console.log(`[Rate Limit] Cleared rate limit for key: ${key}`);
  } catch (error) {
    console.error('[Rate Limit] Error clearing rate limit:', error);
  }
}
