/**
 * Safe localStorage wrapper that handles quota exceeded errors gracefully
 */

import { createLogger } from './logger'

const log = createLogger('Storage')

/**
 * Safely parse JSON with error handling and default value
 * Prevents application crashes from malformed localStorage data
 */
export function safeJsonParse<T>(json: string | null, defaultValue: T): T {
  if (!json) return defaultValue
  try {
    return JSON.parse(json) as T
  } catch (e) {
    log.warn('Failed to parse JSON, using default value', e)
    return defaultValue
  }
}

/**
 * Safely get and parse JSON from localStorage
 * Combines safeGetItem and safeJsonParse for convenience
 */
export function safeGetJson<T>(key: string, defaultValue: T): T {
  const stored = safeGetItem(key)
  return safeJsonParse(stored, defaultValue)
}

// All RSTU storage keys for cleanup
const RSTU_STORAGE_KEYS = [
  'rstu_organizing_data',
  'rstu_canvass_data',
  'rstu-governance',
  'rstu-linked-properties',
  'rstu_profiles',
  'rstu_reading_state',
  'rstu-favorite-properties',
  'rstu_admin_state',
  'rstu_admin_auth',
  'rstu_document_edits',
  'rstu_mutual_aid_posts',
  'rstu_mutual_aid_resources',
  'rstu_mutual_aid_skills',
]

export function safeSetItem(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false

  try {
    localStorage.setItem(key, value)
    return true
  } catch (e) {
    // Handle quota exceeded error
    if (e instanceof DOMException && (
      e.code === 22 || // QuotaExceededError (most browsers)
      e.code === 1014 || // NS_ERROR_DOM_QUOTA_REACHED (Firefox)
      e.name === 'QuotaExceededError' ||
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    )) {
      log.warn(`Quota exceeded for key "${key}". Attempting cleanup...`)

      // Try aggressive cleanup and retry
      if (aggressiveCleanup()) {
        try {
          localStorage.setItem(key, value)
          return true
        } catch {
          log.error(`Still unable to save "${key}" after cleanup`)
        }
      }
    } else {
      log.error(`Failed to save "${key}"`, e)
    }
    return false
  }
}

export function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null

  try {
    return localStorage.getItem(key)
  } catch (e) {
    log.error(`Failed to get "${key}"`, e)
    return null
  }
}

export function safeRemoveItem(key: string): boolean {
  if (typeof window === 'undefined') return false

  try {
    localStorage.removeItem(key)
    return true
  } catch (e) {
    log.error(`Failed to remove "${key}"`, e)
    return false
  }
}

/**
 * Aggressive cleanup - removes old data to free space
 */
function aggressiveCleanup(): boolean {
  try {
    let freedSpace = false

    // 1. Remove organizing data for empty buildings
    const organizingData = localStorage.getItem('rstu_organizing_data')
    if (organizingData) {
      try {
        const state = JSON.parse(organizingData)
        const originalCount = Object.keys(state.buildings || {}).length

        // Remove empty buildings
        for (const buildingId of Object.keys(state.buildings || {})) {
          const building = state.buildings[buildingId]
          if (!building.complaints?.length && !building.demands?.length) {
            delete state.buildings[buildingId]
          }
        }

        if (Object.keys(state.buildings || {}).length < originalCount) {
          localStorage.setItem('rstu_organizing_data', JSON.stringify(state))
          freedSpace = true
        }
      } catch {
        // Corrupt data - remove it
        localStorage.removeItem('rstu_organizing_data')
        freedSpace = true
      }
    }

    // 2. Trim canvass data (keep only units with actual data)
    const canvassData = localStorage.getItem('rstu_canvass_data')
    if (canvassData) {
      try {
        const state = JSON.parse(canvassData)
        for (const buildingId of Object.keys(state.buildings || {})) {
          const building = state.buildings[buildingId]
          for (const unitNum of Object.keys(building.units || {})) {
            const unit = building.units[unitNum]
            // Remove units with no meaningful data
            if (unit.status === 'NOT_CONTACTED' && !unit.name && !unit.notes && !unit.profileId) {
              delete building.units[unitNum]
              freedSpace = true
            }
          }
          // Remove empty buildings
          if (!Object.keys(building.units || {}).length) {
            delete state.buildings[buildingId]
          }
        }
        if (freedSpace) {
          localStorage.setItem('rstu_canvass_data', JSON.stringify(state))
        }
      } catch {
        // Corrupt - remove
        localStorage.removeItem('rstu_canvass_data')
        freedSpace = true
      }
    }

    // 3. Trim governance proposals (keep only recent/active)
    const govData = localStorage.getItem('rstu-governance')
    if (govData) {
      try {
        const state = JSON.parse(govData)
        const now = Date.now()
        const MAX_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days

        state.proposals = (state.proposals || []).filter((p: { status: string; createdAt: number }) => {
          // Keep active proposals
          if (['active', 'pending-finalize', 'pending-partner'].includes(p.status)) return true
          // Keep recent completed ones
          return now - p.createdAt < MAX_AGE
        }).slice(0, 100) // Max 100 proposals

        // Trim dismissed banners
        state.dismissedBanners = (state.dismissedBanners || []).slice(-50)

        localStorage.setItem('rstu-governance', JSON.stringify(state))
        freedSpace = true
      } catch {
        localStorage.removeItem('rstu-governance')
        freedSpace = true
      }
    }

    return freedSpace
  } catch {
    return false
  }
}

/**
 * Get approximate storage usage
 */
export function getStorageUsage(): { used: number; available: number; rstuUsed: number } {
  if (typeof window === 'undefined') return { used: 0, available: 0, rstuUsed: 0 }

  let used = 0
  let rstuUsed = 0

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key)
        if (value) {
          const size = (key.length + value.length) * 2 // UTF-16
          used += size
          if (key.startsWith('rstu')) {
            rstuUsed += size
          }
        }
      }
    }
  } catch {
    // Ignore errors
  }

  // Most browsers have 5-10MB limit
  const available = 5 * 1024 * 1024 // Assume 5MB

  return { used, available, rstuUsed }
}

/**
 * Clear all RSTU storage data (for manual cleanup)
 * Call from browser console: window.clearRstuStorage()
 */
export function clearAllRstuStorage(): void {
  if (typeof window === 'undefined') return

  for (const key of RSTU_STORAGE_KEYS) {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key)
    }
  }

  // Also clear any other rstu-prefixed keys
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('rstu')) {
      keysToRemove.push(key)
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key)
  }
}

/**
 * Run storage health check and cleanup on page load
 */
export function runStorageHealthCheck(): void {
  if (typeof window === 'undefined') return

  const { used, available } = getStorageUsage()
  const usagePercent = Math.round((used / available) * 100)

  // If over 80% full, run cleanup
  if (usagePercent > 80) {
    aggressiveCleanup()
  }
}

// Expose clear function to window for manual cleanup
if (typeof window !== 'undefined') {
  (window as unknown as { clearRstuStorage: typeof clearAllRstuStorage }).clearRstuStorage = clearAllRstuStorage
}
