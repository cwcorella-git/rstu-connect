/**
 * Safe localStorage wrapper that handles quota exceeded errors gracefully
 */

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
      console.warn(`[Storage] Quota exceeded for key "${key}". Attempting cleanup...`)

      // Try to clear old data and retry
      if (attemptStorageCleanup()) {
        try {
          localStorage.setItem(key, value)
          return true
        } catch {
          console.error(`[Storage] Still unable to save "${key}" after cleanup`)
        }
      }
    } else {
      console.error(`[Storage] Failed to save "${key}":`, e)
    }
    return false
  }
}

export function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null

  try {
    return localStorage.getItem(key)
  } catch (e) {
    console.error(`[Storage] Failed to get "${key}":`, e)
    return null
  }
}

export function safeRemoveItem(key: string): boolean {
  if (typeof window === 'undefined') return false

  try {
    localStorage.removeItem(key)
    return true
  } catch (e) {
    console.error(`[Storage] Failed to remove "${key}":`, e)
    return false
  }
}

/**
 * Attempt to free up storage space by removing old/stale data
 */
function attemptStorageCleanup(): boolean {
  try {
    // List of storage keys that can be safely trimmed
    const cleanupTargets = [
      { key: 'rstu-governance', maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
      { key: 'rstu_canvass_data', maxAge: 90 * 24 * 60 * 60 * 1000 }, // 90 days
      { key: 'rstu_organizing_data', maxAge: 60 * 24 * 60 * 60 * 1000 }, // 60 days
    ]

    let freedSpace = false

    for (const target of cleanupTargets) {
      const data = localStorage.getItem(target.key)
      if (data) {
        try {
          const parsed = JSON.parse(data)
          if (parsed.lastModified && Date.now() - parsed.lastModified > target.maxAge) {
            localStorage.removeItem(target.key)
            console.log(`[Storage] Cleaned up old data: ${target.key}`)
            freedSpace = true
          }
        } catch {
          // If we can't parse it, it's probably corrupt - remove it
          localStorage.removeItem(target.key)
          freedSpace = true
        }
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
export function getStorageUsage(): { used: number; available: number } {
  if (typeof window === 'undefined') return { used: 0, available: 0 }

  let used = 0
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key)
        if (value) {
          used += key.length + value.length
        }
      }
    }
  } catch {
    // Ignore errors
  }

  // Most browsers have 5-10MB limit
  const available = 5 * 1024 * 1024 // Assume 5MB

  return { used: used * 2, available } // *2 for UTF-16 encoding
}
