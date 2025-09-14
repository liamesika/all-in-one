// Simple in-memory cache for stats API responses
// This helps avoid N+1 queries and improves dashboard load times

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class StatsCache {
  private cache = new Map<string, CacheEntry>();

  // Default TTL: 2 minutes for stats data
  private defaultTTL = 2 * 60 * 1000;

  /**
   * Generate cache key from ownerUid and endpoint
   */
  private getCacheKey(ownerUid: string, endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}:${ownerUid}:${paramString}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Get cached data if valid
   */
  get(ownerUid: string, endpoint: string, params?: Record<string, any>): any | null {
    const key = this.getCacheKey(ownerUid, endpoint, params);
    const entry = this.cache.get(key);

    if (entry && this.isValid(entry)) {
      return entry.data;
    }

    // Remove expired entry
    if (entry) {
      this.cache.delete(key);
    }

    return null;
  }

  /**
   * Set cache data with optional custom TTL
   */
  set(ownerUid: string, endpoint: string, data: any, params?: Record<string, any>, customTTL?: number): void {
    const key = this.getCacheKey(ownerUid, endpoint, params);
    const ttl = customTTL || this.defaultTTL;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Invalidate cache entries for a specific ownerUid
   */
  invalidateForOwner(ownerUid: string): void {
    const keysToDelete: string[] = [];

    for (const [key] of this.cache.entries()) {
      if (key.includes(`:${ownerUid}:`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all expired entries (cleanup)
   */
  clearExpired(): void {
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValid(entry)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics for monitoring
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Singleton instance
const statsCache = new StatsCache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  statsCache.clearExpired();
}, 5 * 60 * 1000);

export default statsCache;