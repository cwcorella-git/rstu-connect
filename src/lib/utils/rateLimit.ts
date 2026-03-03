'use client'

/**
 * Client-side rate limiting utility
 * Provides immediate feedback without network roundtrip
 * Server-side rate limiting in Supabase is the authoritative check
 */

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  description?: string
}

interface RateLimitEntry {
  timestamps: number[]
  lastCleanup: number
}

// Rate limit configurations (should match server-side config)
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  vote: { maxRequests: 10, windowMs: 60000, description: 'Max 10 votes per minute' },
  proposal_create: { maxRequests: 3, windowMs: 300000, description: 'Max 3 proposals per 5 minutes' },
  event_create: { maxRequests: 5, windowMs: 300000, description: 'Max 5 events per 5 minutes' },
  message_send: { maxRequests: 30, windowMs: 60000, description: 'Max 30 messages per minute' },
  mutual_aid_post: { maxRequests: 5, windowMs: 300000, description: 'Max 5 posts per 5 minutes' },
  profile_update: { maxRequests: 10, windowMs: 60000, description: 'Max 10 updates per minute' },
}

// In-memory storage for rate limit tracking
const rateLimitStore: Map<string, RateLimitEntry> = new Map()

/**
 * Generate a storage key for rate limiting
 */
function getRateLimitKey(action: string, userId?: string): string {
  return `${action}:${userId || 'anonymous'}`
}

/**
 * Clean up old timestamps from an entry
 */
function cleanupEntry(entry: RateLimitEntry, windowMs: number): void {
  const now = Date.now()
  const cutoff = now - windowMs

  // Only cleanup every 5 seconds to avoid excessive array operations
  if (now - entry.lastCleanup < 5000) return

  entry.timestamps = entry.timestamps.filter(ts => ts > cutoff)
  entry.lastCleanup = now
}

/**
 * Check if an action is rate limited
 * Returns { allowed: boolean, remaining: number, retryAfter?: number }
 */
export function checkRateLimit(
  action: string,
  userId?: string
): { allowed: boolean; remaining: number; retryAfter?: number; error?: string } {
  const config = RATE_LIMITS[action]

  // If no config, allow the action
  if (!config) {
    return { allowed: true, remaining: -1 }
  }

  const key = getRateLimitKey(action, userId)
  const now = Date.now()
  const windowStart = now - config.windowMs

  // Get or create entry
  let entry = rateLimitStore.get(key)
  if (!entry) {
    entry = { timestamps: [], lastCleanup: now }
    rateLimitStore.set(key, entry)
  }

  // Clean up old timestamps
  cleanupEntry(entry, config.windowMs)

  // Count requests in window
  const recentRequests = entry.timestamps.filter(ts => ts > windowStart).length

  if (recentRequests >= config.maxRequests) {
    // Calculate retry after (time until oldest request expires)
    const oldestInWindow = entry.timestamps.find(ts => ts > windowStart)
    const retryAfter = oldestInWindow
      ? Math.ceil((oldestInWindow + config.windowMs - now) / 1000)
      : Math.ceil(config.windowMs / 1000)

    return {
      allowed: false,
      remaining: 0,
      retryAfter,
      error: `Rate limited: ${config.description}. Try again in ${retryAfter} seconds.`
    }
  }

  return {
    allowed: true,
    remaining: config.maxRequests - recentRequests - 1
  }
}

/**
 * Record an action for rate limiting (internal use by tryAction)
 */
function recordAction(action: string, userId?: string): void {
  const config = RATE_LIMITS[action]
  if (!config) return

  const key = getRateLimitKey(action, userId)
  const now = Date.now()

  let entry = rateLimitStore.get(key)
  if (!entry) {
    entry = { timestamps: [], lastCleanup: now }
    rateLimitStore.set(key, entry)
  }

  entry.timestamps.push(now)

  // Clean up old entries periodically
  cleanupEntry(entry, config.windowMs)
}

/**
 * Combined check and record - use for most operations
 * Returns result of rate limit check
 */
export function tryAction(
  action: string,
  userId?: string
): { allowed: boolean; remaining: number; retryAfter?: number; error?: string } {
  const result = checkRateLimit(action, userId)

  if (result.allowed) {
    recordAction(action, userId)
  }

  return result
}
