/**
 * Scalability & Performance: In-Memory TTL Cache Layer
 * Provides sub-millisecond response caching for high-read healthcare directory queries,
 * reducing database load and speeding up 2G mobile responses.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private hits = 0;
  private misses = 0;

  /**
   * Retrieves item from cache if unexpired.
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value as T;
  }

  /**
   * Sets value in cache with a TTL in seconds (default: 60s).
   */
  set<T>(key: string, value: T, ttlSeconds = 60): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Invalidates a specific cache key.
   */
  invalidate(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Invalidates all keys matching a prefix (e.g. 'resources:*').
   */
  invalidatePrefix(prefix: string): number {
    let deletedCount = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  /**
   * Clears entire cache.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Returns cache metrics and performance statistics.
   */
  getMetrics() {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      totalRequests: total,
      hitRatioPercentage: total > 0 ? parseFloat(((this.hits / total) * 100).toFixed(1)) : 0,
      activeKeysCount: this.cache.size,
    };
  }
}

export const cacheService = new CacheService();
