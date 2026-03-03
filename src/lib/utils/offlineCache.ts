import { createLogger } from './logger'

const log = createLogger('OfflineCache')

/**
 * Offline Cache Module
 *
 * Provides a caching layer for offline read-only mode.
 * When online, data is fetched from the server and cached locally.
 * When offline, cached data is served for viewing (no writes allowed).
 *
 * This is separate from localStorage profile data - this caches
 * collaborative/shared data like events, proposals, campaigns, etc.
 */

// Cache storage keys
const CACHE_PREFIX = 'rstu_cache_'
const CACHE_META_KEY = 'rstu_cache_meta'
const CACHE_VERSION = 1

// Default cache TTL (15 minutes)
const DEFAULT_TTL_MS = 15 * 60 * 1000

// Cache metadata
interface CacheMeta {
  version: number
  entries: Record<string, {
    cachedAt: number
    expiresAt: number
    etag?: string
  }>
}

// ============================================
// Cache Infrastructure
// ============================================

/**
 * Get cache metadata
 */
function getCacheMeta(): CacheMeta {
  if (typeof window === 'undefined') {
    return { version: CACHE_VERSION, entries: {} }
  }

  try {
    const stored = localStorage.getItem(CACHE_META_KEY)
    if (stored) {
      const meta = JSON.parse(stored) as CacheMeta
      // Clear cache if version mismatch
      if (meta.version !== CACHE_VERSION) {
        clearAllCache()
        return { version: CACHE_VERSION, entries: {} }
      }
      return meta
    }
  } catch {
    // Corrupted cache meta - clear everything
    clearAllCache()
  }

  return { version: CACHE_VERSION, entries: {} }
}

/**
 * Save cache metadata
 */
function saveCacheMeta(meta: CacheMeta): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(CACHE_META_KEY, JSON.stringify(meta))
  } catch (e) {
    // Storage quota exceeded - clear old entries
    log.warn('Storage quota exceeded, clearing old entries')
    pruneOldEntries()
  }
}

/**
 * Generate cache key
 */
function getCacheKey(key: string): string {
  return `${CACHE_PREFIX}${key}`
}

// ============================================
// Public Cache API
// ============================================

/**
 * Cache data for offline access
 */
export function cacheForOffline<T>(
  key: string,
  data: T,
  ttlMs: number = DEFAULT_TTL_MS,
  etag?: string
): void {
  if (typeof window === 'undefined') return

  const meta = getCacheMeta()
  const cacheKey = getCacheKey(key)
  const now = Date.now()

  try {
    // Store the data
    localStorage.setItem(cacheKey, JSON.stringify(data))

    // Update metadata
    meta.entries[key] = {
      cachedAt: now,
      expiresAt: now + ttlMs,
      etag,
    }
    saveCacheMeta(meta)
  } catch (e) {
    // Storage quota exceeded
    log.warn('Failed to cache data for', key)
    pruneOldEntries()
  }
}

/**
 * Get cached data
 * Returns null if not cached or expired (and not offline)
 * When offline, returns expired data if available
 */
export function getCached<T>(key: string, allowExpired: boolean = false): T | null {
  if (typeof window === 'undefined') return null

  const meta = getCacheMeta()
  const entry = meta.entries[key]
  const cacheKey = getCacheKey(key)

  if (!entry) return null

  // Check expiration (allow expired data when offline or explicitly requested)
  const isExpired = Date.now() > entry.expiresAt
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine

  if (isExpired && !isOffline && !allowExpired) {
    // Entry expired and we're online - don't use stale data
    return null
  }

  try {
    const stored = localStorage.getItem(cacheKey)
    if (!stored) return null
    return JSON.parse(stored) as T
  } catch {
    return null
  }
}

/**
 * Invalidate a specific cache entry
 */
export function invalidateCache(key: string): void {
  if (typeof window === 'undefined') return

  const meta = getCacheMeta()
  const cacheKey = getCacheKey(key)

  try {
    localStorage.removeItem(cacheKey)
    delete meta.entries[key]
    saveCacheMeta(meta)
  } catch {
    // Ignore errors
  }
}

/**
 * Invalidate cache entries matching a pattern
 * Pattern supports * wildcard at end (e.g., "events:*" matches "events:123")
 */
export function invalidateCachePattern(pattern: string): void {
  if (typeof window === 'undefined') return

  const meta = getCacheMeta()
  const isWildcard = pattern.endsWith('*')
  const prefix = isWildcard ? pattern.slice(0, -1) : pattern

  const keysToRemove: string[] = []

  for (const key of Object.keys(meta.entries)) {
    if (isWildcard ? key.startsWith(prefix) : key === pattern) {
      keysToRemove.push(key)
    }
  }

  for (const key of keysToRemove) {
    const cacheKey = getCacheKey(key)
    try {
      localStorage.removeItem(cacheKey)
      delete meta.entries[key]
    } catch {
      // Ignore errors
    }
  }

  saveCacheMeta(meta)
}

/**
 * Check if data is cached (and optionally not expired)
 */
export function isCached(key: string, checkExpiry: boolean = true): boolean {
  if (typeof window === 'undefined') return false

  const meta = getCacheMeta()
  const entry = meta.entries[key]

  if (!entry) return false
  if (checkExpiry && Date.now() > entry.expiresAt) return false

  // Verify data actually exists
  const cacheKey = getCacheKey(key)
  return localStorage.getItem(cacheKey) !== null
}

/**
 * Get the etag for a cached entry (for conditional requests)
 */
/**
 * Clear all cached data (internal use)
 */
export function clearAllCache(): void {
  if (typeof window === 'undefined') return

  // Find and remove all cache entries
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(CACHE_PREFIX)) {
      keysToRemove.push(key)
    }
  }

  for (const key of keysToRemove) {
    try {
      localStorage.removeItem(key)
    } catch {
      // Ignore errors
    }
  }

  // Clear metadata
  try {
    localStorage.removeItem(CACHE_META_KEY)
  } catch {
    // Ignore errors
  }
}

/**
 * Prune old/expired cache entries to free space
 */
export function pruneOldEntries(): void {
  if (typeof window === 'undefined') return

  const meta = getCacheMeta()
  const now = Date.now()

  // Sort by expiration (oldest first)
  const entries = Object.entries(meta.entries)
    .sort(([, a], [, b]) => a.expiresAt - b.expiresAt)

  // Remove expired entries first
  for (const [key, entry] of entries) {
    if (entry.expiresAt < now) {
      const cacheKey = getCacheKey(key)
      try {
        localStorage.removeItem(cacheKey)
        delete meta.entries[key]
      } catch {
        // Ignore errors
      }
    }
  }

  // If still over 50 entries, remove oldest half
  const remainingEntries = Object.entries(meta.entries)
    .sort(([, a], [, b]) => a.cachedAt - b.cachedAt)

  if (remainingEntries.length > 50) {
    const toRemove = remainingEntries.slice(0, Math.floor(remainingEntries.length / 2))
    for (const [key] of toRemove) {
      const cacheKey = getCacheKey(key)
      try {
        localStorage.removeItem(cacheKey)
        delete meta.entries[key]
      } catch {
        // Ignore errors
      }
    }
  }

  saveCacheMeta(meta)
}

/**
 * Get cache statistics
 */
// ============================================
// Typed Cache Helpers
// ============================================

// Common cache keys
export const CacheKeys = {
  // Events
  events: (buildingId: string) => `events:building:${buildingId}`,
  eventsGroup: (groupId: string) => `events:group:${groupId}`,
  event: (eventId: string) => `event:${eventId}`,

  // Proposals
  proposals: (groupId: string) => `proposals:${groupId}`,
  proposal: (proposalId: string) => `proposal:${proposalId}`,

  // Campaigns
  campaigns: () => 'campaigns:all',
  campaign: (campaignId: string) => `campaign:${campaignId}`,

  // Mutual Aid
  mutualAidPosts: (buildingId: string) => `mutual-aid:posts:${buildingId}`,
  mutualAidResources: (buildingId: string) => `mutual-aid:resources:${buildingId}`,
  skillProfiles: (buildingId: string) => `skills:${buildingId}`,

  // User data
  profile: (profileId: string) => `profile:${profileId}`,
  myProfile: () => 'profile:me',

  // Linked properties
  linkedGroups: () => 'linked-groups:all',
  linkedGroup: (groupId: string) => `linked-group:${groupId}`,
} as const

/**
 * Cache event data
 */
export function cacheEvents(buildingId: string, events: unknown[]): void {
  cacheForOffline(CacheKeys.events(buildingId), events, 10 * 60 * 1000) // 10 min TTL
}

/**
 * Get cached events
 */
export function getCachedEvents<T>(buildingId: string): T[] | null {
  return getCached<T[]>(CacheKeys.events(buildingId), true) // Allow expired when offline
}

/**
 * Cache proposals
 */
export function cacheProposals(groupId: string, proposals: unknown[]): void {
  cacheForOffline(CacheKeys.proposals(groupId), proposals, 10 * 60 * 1000)
}

/**
 * Get cached proposals
 */
export function getCachedProposals<T>(groupId: string): T[] | null {
  return getCached<T[]>(CacheKeys.proposals(groupId), true)
}

/**
 * Cache campaigns
 */
export function cacheCampaigns(campaigns: unknown[]): void {
  cacheForOffline(CacheKeys.campaigns(), campaigns, 15 * 60 * 1000)
}

/**
 * Get cached campaigns
 */
export function getCachedCampaigns<T>(): T[] | null {
  return getCached<T[]>(CacheKeys.campaigns(), true)
}

/**
 * Invalidate all event caches (after creating/updating event)
 */
export function invalidateEventCaches(): void {
  invalidateCachePattern('events:*')
  invalidateCachePattern('event:*')
}

/**
 * Invalidate all proposal caches (after voting/creating)
 */
export function invalidateProposalCaches(): void {
  invalidateCachePattern('proposals:*')
  invalidateCachePattern('proposal:*')
}

/**
 * Invalidate all campaign caches
 */
export function invalidateCampaignCaches(): void {
  invalidateCachePattern('campaigns:*')
  invalidateCachePattern('campaign:*')
}
