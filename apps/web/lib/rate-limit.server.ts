// apps/web/lib/rate-limit.server.ts
// Rate limiting middleware for AI and external API endpoints
import 'server-only';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitConfig {
  /**
   * Maximum requests per window
   */
  maxRequests: number;
  /**
   * Time window in seconds
   */
  windowSeconds: number;
  /**
   * Identifier for rate limit key (defaults to 'global')
   */
  identifier?: string;
}

/**
 * Rate limiter for protecting expensive API endpoints
 * @param config Rate limit configuration
 * @returns Object with { success: boolean, remaining: number, resetAt: number }
 */
export async function rateLimit(
  config: RateLimitConfig
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  const { maxRequests, windowSeconds, identifier = 'global' } = config;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // Get or initialize rate limit entry
  let entry = store[identifier];

  if (!entry || now > entry.resetAt) {
    // Create new window
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
    store[identifier] = entry;
  }

  // Increment request count
  entry.count++;

  // Check if limit exceeded
  const success = entry.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - entry.count);

  return {
    success,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Cleanup old entries from the rate limit store
 * Should be called periodically to prevent memory leaks
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}

// Preset configurations for different endpoint types
export const RATE_LIMITS = {
  // OpenAI endpoints - generous for batch operations
  OPENAI_CSV: {
    maxRequests: 10, // 10 requests per user
    windowSeconds: 3600, // 1 hour
  },
  OPENAI_IMAGES: {
    maxRequests: 20, // 20 images per user
    windowSeconds: 3600, // 1 hour
  },
  OPENAI_CAMPAIGNS: {
    maxRequests: 15, // 15 campaigns per user
    windowSeconds: 3600, // 1 hour
  },
  // PSI endpoint - stricter due to Google quotas
  PSI_AUDIT: {
    maxRequests: 25, // Google's default quota is 25,000/day
    windowSeconds: 86400, // 24 hours
  },
  // General fallback
  DEFAULT: {
    maxRequests: 100,
    windowSeconds: 3600, // 1 hour
  },
} as const;
