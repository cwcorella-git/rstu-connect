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

