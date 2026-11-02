"use strict";
/**
 * Scalability & Performance: In-Memory TTL Cache Layer
 * Provides sub-millisecond response caching for high-read healthcare directory queries,
 * reducing database load and speeding up 2G mobile responses.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
class CacheService {
    cache = new Map();
    hits = 0;
    misses = 0;
    /**
     * Retrieves item from cache if unexpired.
     */
    get(key) {
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
        return entry.value;
    }
    /**
     * Sets value in cache with a TTL in seconds (default: 60s).
     */
    set(key, value, ttlSeconds = 60) {
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000,
        });
    }
    /**
     * Invalidates a specific cache key.
     */
    invalidate(key) {
        return this.cache.delete(key);
    }
    /**
     * Invalidates all keys matching a prefix (e.g. 'resources:*').
     */
    invalidatePrefix(prefix) {
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
    clear() {
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
exports.cacheService = new CacheService();
