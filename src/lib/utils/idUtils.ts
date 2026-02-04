/**
 * ID Generation Utilities
 *
 * Centralized ID generation that handles online/offline scenarios:
 * - Online: Let Supabase generate UUIDs (returns null, caller should use server response)
 * - Offline: Generate local IDs with 'local-' prefix for later reconciliation
 *
 * When syncing offline data:
 * 1. Insert with local ID
 * 2. Server assigns real UUID
 * 3. Update local references to use real UUID
 */

import { isOnline } from '../services/authService'

// Prefix for locally-generated IDs (used in offline mode)
export const LOCAL_ID_PREFIX = 'local-'

/**
 * Check if an ID was generated locally (offline)
 */
export function isLocalId(id: string): boolean {
  return id.startsWith(LOCAL_ID_PREFIX)
}

/**
 * Generate a UUID using crypto API
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Fallback UUID v4 generation
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    bytes[6] = (bytes[6] & 0x0f) | 0x40 // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80 // Variant 1
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }
  throw new Error('Crypto API not available')
}

/**
 * Generate a short ID (8 chars) for display purposes
 */
export function generateShortId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().split('-')[0]
  }
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(4)
    crypto.getRandomValues(bytes)
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  }
  throw new Error('Crypto API not available')
}

/**
 * Generate an ID for a new entity.
 *
 * @param forceLocal - If true, always generate a local ID (for offline-first entities)
 * @returns A UUID string (either local-prefixed or regular)
 *
 * Usage patterns:
 *
 * 1. Online-first (let server assign ID):
 *    ```
 *    const id = generateEntityId()  // Returns local-xxx when offline
 *    if (isOnline()) {
 *      const result = await supabase.rpc('create_entity', { ...data })
 *      // Use result.id from server
 *    } else {
 *      // Store with local ID, sync later
 *    }
 *    ```
 *
 * 2. Offline-first (always generate local ID):
 *    ```
 *    const id = generateEntityId(true)  // Always returns local-xxx
 *    // Store locally, sync to server later
 *    ```
 */
export function generateEntityId(forceLocal: boolean = false): string {
  if (forceLocal || !isOnline()) {
    return `${LOCAL_ID_PREFIX}${generateUUID()}`
  }
  // When online, return a regular UUID
  // The caller should prefer using the server-assigned ID when available
  return generateUUID()
}

/**
 * Generate an ID specifically for offline use.
 * Always returns a local-prefixed ID.
 */
export function generateOfflineId(): string {
  return `${LOCAL_ID_PREFIX}${generateUUID()}`
}

/**
 * Convert a local ID to a format suitable for display
 * Strips the local- prefix for cleaner UI
 */
export function displayId(id: string): string {
  if (isLocalId(id)) {
    return id.substring(LOCAL_ID_PREFIX.length, LOCAL_ID_PREFIX.length + 8)
  }
  return id.substring(0, 8)
}

/**
 * Interface for tracking ID mappings during sync
 */
export interface IdMapping {
  localId: string
  serverId: string
  entityType: string
  syncedAt: number
}

// Storage key for ID mappings
const ID_MAPPINGS_KEY = 'rstu_id_mappings'

/**
 * Store a mapping from local ID to server ID
 */
export function storeIdMapping(localId: string, serverId: string, entityType: string): void {
  if (typeof window === 'undefined') return

  try {
    const mappings = getIdMappings()
    mappings.push({
      localId,
      serverId,
      entityType,
      syncedAt: Date.now()
    })
    localStorage.setItem(ID_MAPPINGS_KEY, JSON.stringify(mappings))
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get all ID mappings
 */
export function getIdMappings(): IdMapping[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(ID_MAPPINGS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Get the server ID for a local ID
 */
export function getServerIdForLocal(localId: string): string | null {
  const mappings = getIdMappings()
  const mapping = mappings.find(m => m.localId === localId)
  return mapping?.serverId || null
}

/**
 * Get the local ID for a server ID (reverse lookup)
 */
export function getLocalIdForServer(serverId: string): string | null {
  const mappings = getIdMappings()
  const mapping = mappings.find(m => m.serverId === serverId)
  return mapping?.localId || null
}

/**
 * Resolve an ID to its server ID if available, otherwise return as-is
 */
export function resolveId(id: string): string {
  if (isLocalId(id)) {
    return getServerIdForLocal(id) || id
  }
  return id
}

/**
 * Clean up old ID mappings (older than 30 days)
 */
export function cleanupOldMappings(): number {
  if (typeof window === 'undefined') return 0

  const mappings = getIdMappings()
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
  const filtered = mappings.filter(m => m.syncedAt > cutoff)

  if (filtered.length < mappings.length) {
    localStorage.setItem(ID_MAPPINGS_KEY, JSON.stringify(filtered))
  }

  return mappings.length - filtered.length
}
