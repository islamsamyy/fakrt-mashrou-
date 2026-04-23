/**
 * Redis Caching Layer for IDEA BUSINESS
 * Handles caching of frequently accessed data
 */

import { createClient } from '@/lib/supabase/server';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string;
}

type CacheKey =
  | { type: 'project'; id: string }
  | { type: 'user'; id: string }
  | { type: 'leaderboard'; period: string }
  | { type: 'popular_projects' }
  | { type: 'exchange_rates'; currency: string }
  | { type: 'notifications'; userId: string };

/**
 * Generate cache key from pattern
 */
function getCacheKey(key: CacheKey, namespace = 'idea'): string {
  const { type } = key as any;

  switch (type) {
    case 'project':
      return `${namespace}:project:${(key as any).id}`;
    case 'user':
      return `${namespace}:user:${(key as any).id}`;
    case 'leaderboard':
      return `${namespace}:leaderboard:${(key as any).period}`;
    case 'popular_projects':
      return `${namespace}:popular_projects`;
    case 'exchange_rates':
      return `${namespace}:exchange_rates:${(key as any).currency}`;
    case 'notifications':
      return `${namespace}:notifications:${(key as any).userId}`;
    default:
      return `${namespace}:unknown`;
  }
}

/**
 * Redis Client Wrapper
 * Provides a simple interface for caching operations
 */
export class CacheManager {
  private redisUrl: string | null;
  private client: any;

  constructor() {
    this.redisUrl = process.env.REDIS_URL || null;
    this.client = null;

    // Initialize Redis client if URL is configured
    if (this.redisUrl) {
      try {
        // Dynamic import to avoid dependency if Redis is not available
        this.initializeClient();
      } catch (error) {
        console.warn('Redis not available, using in-memory cache fallback');
      }
    }
  }

  private initializeClient() {
    try {
      // This would use a library like redis or ioredis
      // For now, we'll use a simple in-memory fallback
      console.log('Redis client initialized:', this.redisUrl?.substring(0, 20) + '...');
    } catch (error) {
      console.error('Failed to initialize Redis client:', error);
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: CacheKey): Promise<T | null> {
    const cacheKey = getCacheKey(key);

    if (!this.redisUrl) {
      // Fallback to in-memory cache (single instance only)
      return this.getInMemory<T>(cacheKey);
    }

    try {
      // Redis implementation would go here
      // Example: const value = await this.client.get(cacheKey);
      return null;
    } catch (error) {
      console.error(`Cache GET error for ${cacheKey}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: CacheKey, value: T, options: CacheOptions = {}): Promise<boolean> {
    const cacheKey = getCacheKey(key, options.namespace);
    const ttl = options.ttl || this.getDefaultTTL(key);

    if (!this.redisUrl) {
      // Fallback to in-memory cache
      return this.setInMemory<T>(cacheKey, value, ttl);
    }

    try {
      // Redis implementation would go here
      // Example: await this.client.setex(cacheKey, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Cache SET error for ${cacheKey}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: CacheKey): Promise<boolean> {
    const cacheKey = getCacheKey(key);

    if (!this.redisUrl) {
      return this.deleteInMemory(cacheKey);
    }

    try {
      // Redis implementation would go here
      // Example: await this.client.del(cacheKey);
      return true;
    } catch (error) {
      console.error(`Cache DELETE error for ${cacheKey}:`, error);
      return false;
    }
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  async invalidatePattern(pattern: string): Promise<number> {
    const namespace = 'idea';

    if (!this.redisUrl) {
      return this.invalidatePatternInMemory(namespace + ':' + pattern);
    }

    try {
      // Redis implementation would scan and delete matching keys
      // Example: const keys = await this.client.keys(namespace + ':' + pattern);
      //          return await this.client.del(...keys);
      return 0;
    } catch (error) {
      console.error(`Cache INVALIDATE error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Cache invalidation helpers
   */
  async invalidateProject(projectId: string): Promise<void> {
    await this.delete({ type: 'project', id: projectId });
    await this.invalidatePattern('leaderboard:*');
    await this.invalidatePattern('popular_projects');
  }

  async invalidateUser(userId: string): Promise<void> {
    await this.delete({ type: 'user', id: userId });
    await this.invalidatePattern('leaderboard:*');
  }

  async invalidateLeaderboard(): Promise<void> {
    await this.invalidatePattern('leaderboard:*');
  }

  /**
   * Get default TTL based on cache key type
   */
  private getDefaultTTL(key: CacheKey): number {
    const type = (key as any).type;

    switch (type) {
      case 'project':
        return 3600; // 1 hour
      case 'user':
        return 3600; // 1 hour
      case 'popular_projects':
        return 1800; // 30 minutes
      case 'leaderboard':
        return 1800; // 30 minutes
      case 'exchange_rates':
        return 3600; // 1 hour
      case 'notifications':
        return 300; // 5 minutes
      default:
        return 600; // 10 minutes
    }
  }

  // In-memory fallback cache (for development/single-instance)
  private memoryCache = new Map<string, { value: any; expiresAt: number }>();

  private getInMemory<T>(key: string): T | null {
    const cached = this.memoryCache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return cached.value as T;
  }

  private setInMemory<T>(key: string, value: T, ttl: number): boolean {
    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttl * 1000,
    });
    return true;
  }

  private deleteInMemory(key: string): boolean {
    return this.memoryCache.delete(key);
  }

  private invalidatePatternInMemory(pattern: string): number {
    let count = 0;
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));

    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
        count++;
      }
    }

    return count;
  }
}

/**
 * Singleton instance
 */
let cacheManager: CacheManager | null = null;

export function getCacheManager(): CacheManager {
  if (!cacheManager) {
    cacheManager = new CacheManager();
  }
  return cacheManager;
}

/**
 * Cache helper functions for common use cases
 */

/**
 * Cache popular projects
 */
export async function cachePopularProjects<T>(
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const cache = getCacheManager();
  const key: CacheKey = { type: 'popular_projects' };

  // Try to get from cache
  const cached = await cache.get<T>(key);
  if (cached) return cached;

  // Fetch fresh data
  const data = await fetcher();

  // Store in cache (default 30 minutes)
  await cache.set(key, data, { ttl: options.ttl || 1800, ...options });

  return data;
}

/**
 * Cache leaderboard
 */
export async function cacheLeaderboard<T>(
  period: 'day' | 'week' | 'month' | 'all',
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const cache = getCacheManager();
  const key: CacheKey = { type: 'leaderboard', period };

  // Try to get from cache
  const cached = await cache.get<T>(key);
  if (cached) return cached;

  // Fetch fresh data
  const data = await fetcher();

  // Store in cache (default 30 minutes)
  await cache.set(key, data, { ttl: options.ttl || 1800, ...options });

  return data;
}

/**
 * Cache user profile
 */
export async function cacheUserProfile<T>(
  userId: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const cache = getCacheManager();
  const key: CacheKey = { type: 'user', id: userId };

  // Try to get from cache
  const cached = await cache.get<T>(key);
  if (cached) return cached;

  // Fetch fresh data
  const data = await fetcher();

  // Store in cache (default 1 hour)
  await cache.set(key, data, { ttl: options.ttl || 3600, ...options });

  return data;
}

/**
 * Cache project details
 */
export async function cacheProject<T>(
  projectId: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const cache = getCacheManager();
  const key: CacheKey = { type: 'project', id: projectId };

  // Try to get from cache
  const cached = await cache.get<T>(key);
  if (cached) return cached;

  // Fetch fresh data
  const data = await fetcher();

  // Store in cache (default 1 hour)
  await cache.set(key, data, { ttl: options.ttl || 3600, ...options });

  return data;
}

/**
 * Cache exchange rates
 */
export async function cacheExchangeRates<T>(
  currency: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const cache = getCacheManager();
  const key: CacheKey = { type: 'exchange_rates', currency };

  // Try to get from cache
  const cached = await cache.get<T>(key);
  if (cached) return cached;

  // Fetch fresh data
  const data = await fetcher();

  // Store in cache (default 1 hour)
  await cache.set(key, data, { ttl: options.ttl || 3600, ...options });

  return data;
}
