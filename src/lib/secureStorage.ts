'use client'

/**
 * Secure Storage - Encrypted localStorage wrapper for sensitive data
 *
 * Uses the crypto module for AES-GCM encryption of sensitive values.
 * This module provides a simpler API for common secure storage operations.
 *
 * Use this for:
 * - Password hashes
 * - Session tokens
 * - Sensitive user preferences
 * - Any data that shouldn't be visible in DevTools
 *
 * Note: Profile data syncs to Supabase, so server-side security is primary.
 * This provides defense-in-depth for locally-cached sensitive data.
 */

import { encrypt, decrypt, isEncryptionAvailable } from './crypto'

// List of sensitive keys that should be encrypted
const SENSITIVE_KEYS = [
  'rstu_admin_hash',
  'rstu_profile_hashes',
  'rstu_admin_auth',
  'rstu_session_token',
  'verification_audit',
]

/**
 * Check if a key should be encrypted
 */
function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.includes(key) || key.includes('hash') || key.includes('token') || key.includes('secret')
}

/**
 * Set a value in localStorage with automatic encryption for sensitive keys
 */
export async function setSecure(key: string, value: string): Promise<void> {
  if (typeof window === 'undefined') return

  if (isSensitiveKey(key) && isEncryptionAvailable()) {
    const encrypted = await encrypt(value)
    localStorage.setItem(key, encrypted)
  } else {
    localStorage.setItem(key, value)
  }
}

/**
 * Get a value from localStorage with automatic decryption
 */
export async function getSecure(key: string): Promise<string | null> {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem(key)
  if (!stored) return null

  // Check if value is encrypted (has our prefix)
  if (stored.startsWith('enc:') && isEncryptionAvailable()) {
    return decrypt(stored)
  }

  return stored
}

/**
 * Set a JSON value with encryption
 */
export async function setSecureJson<T>(key: string, value: T): Promise<void> {
  await setSecure(key, JSON.stringify(value))
}

/**
 * Get a JSON value with decryption
 */
export async function getSecureJson<T>(key: string, defaultValue: T): Promise<T> {
  const stored = await getSecure(key)
  if (!stored) return defaultValue

  try {
    return JSON.parse(stored) as T
  } catch {
    return defaultValue
  }
}

/**
 * Remove a value from localStorage
 */
export function removeSecure(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(key)
}

/**
 * Migrate existing sensitive data to encrypted format
 * Call this on app initialization to encrypt existing unencrypted sensitive data
 */
export async function migrateSensitiveData(): Promise<void> {
  if (typeof window === 'undefined') return
  if (!isEncryptionAvailable()) return

  for (const key of SENSITIVE_KEYS) {
    const value = localStorage.getItem(key)
    if (value && !value.startsWith('enc:')) {
      // Encrypt existing unencrypted value
      const encrypted = await encrypt(value)
      localStorage.setItem(key, encrypted)
    }
  }
}

/**
 * Check if encryption is available and working
 */
export async function testEncryption(): Promise<boolean> {
  if (!isEncryptionAvailable()) return false

  try {
    const testValue = 'encryption_test_' + Date.now()
    const encrypted = await encrypt(testValue)
    const decrypted = await decrypt(encrypted)
    return decrypted === testValue
  } catch {
    return false
  }
}

// Export the list of sensitive keys for reference
export { SENSITIVE_KEYS }
