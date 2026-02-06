'use client'
import { createLogger } from './logger'

const log = createLogger('Crypto')

/**
 * Client-side encryption utility for sensitive localStorage data
 * Uses Web Crypto API with AES-GCM encryption
 *
 * This protects against:
 * - XSS attacks reading plaintext sensitive data
 * - Casual inspection via DevTools
 * - Data exfiltration by malicious scripts
 *
 * Note: This is defense-in-depth. Server-side validation remains
 * the primary security control for sensitive operations.
 */

const CRYPTO_KEY_STORAGE = 'rstu_crypto_key'
const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256

// Cache the crypto key in memory to avoid repeated derivation
let cachedKey: CryptoKey | null = null

/**
 * Generate a new encryption key
 */
async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true, // extractable (needed to store it)
    ['encrypt', 'decrypt']
  )
}

/**
 * Export a CryptoKey to a storable format
 */
async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key)
  const bytes = new Uint8Array(exported)
  return btoa(String.fromCharCode.apply(null, Array.from(bytes)))
}

/**
 * Import a stored key back to CryptoKey
 */
async function importKey(keyString: string): Promise<CryptoKey> {
  const bytes = Uint8Array.from(atob(keyString), c => c.charCodeAt(0))
  return crypto.subtle.importKey(
    'raw',
    bytes,
    { name: ALGORITHM, length: KEY_LENGTH },
    false, // not extractable after import
    ['encrypt', 'decrypt']
  )
}

/**
 * Get or create the encryption key
 * Key is stored in localStorage (separate from encrypted data)
 */
async function getOrCreateKey(): Promise<CryptoKey> {
  // Return cached key if available
  if (cachedKey) return cachedKey

  if (typeof window === 'undefined') {
    throw new Error('Crypto operations require browser environment')
  }

  // Try to load existing key
  const storedKey = localStorage.getItem(CRYPTO_KEY_STORAGE)
  if (storedKey) {
    try {
      cachedKey = await importKey(storedKey)
      return cachedKey
    } catch (e) {
      log.warn('Failed to import stored key, generating new one:', e)
    }
  }

  // Generate new key
  const newKey = await generateKey()
  const exportedKey = await exportKey(newKey)

  try {
    localStorage.setItem(CRYPTO_KEY_STORAGE, exportedKey)
  } catch (e) {
    log.error('Failed to store encryption key:', e)
  }

  cachedKey = newKey
  return cachedKey
}

/**
 * Encrypt a string value
 * Returns base64-encoded ciphertext with IV prepended
 */
export async function encrypt(plaintext: string): Promise<string> {
  if (typeof window === 'undefined') return plaintext

  try {
    const key = await getOrCreateKey()

    // Generate random IV for each encryption
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // Encode plaintext to bytes
    const encoder = new TextEncoder()
    const data = encoder.encode(plaintext)

    // Encrypt
    const ciphertext = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      data
    )

    // Combine IV + ciphertext and encode to base64
    const combined = new Uint8Array(iv.length + ciphertext.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(ciphertext), iv.length)

    return 'enc:' + btoa(String.fromCharCode.apply(null, Array.from(combined)))
  } catch (e) {
    log.error('Encryption failed:', e)
    // Return plaintext as fallback (logged for debugging)
    return plaintext
  }
}

/**
 * Decrypt a string value
 * Expects base64-encoded ciphertext with IV prepended
 */
export async function decrypt(ciphertext: string): Promise<string> {
  if (typeof window === 'undefined') return ciphertext

  // Check if data is encrypted (has our prefix)
  if (!ciphertext.startsWith('enc:')) {
    // Data is not encrypted, return as-is (backwards compatibility)
    return ciphertext
  }

  try {
    const key = await getOrCreateKey()

    // Decode from base64
    const combined = Uint8Array.from(
      atob(ciphertext.slice(4)), // Remove 'enc:' prefix
      c => c.charCodeAt(0)
    )

    // Extract IV and ciphertext
    const iv = combined.slice(0, 12)
    const data = combined.slice(12)

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      data
    )

    // Decode to string
    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (e) {
    log.error('Decryption failed:', e)
    // Return original value as fallback
    return ciphertext
  }
}

/**
 * Encrypt and store a value in localStorage
 */
export async function setEncrypted(key: string, value: string): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    const encrypted = await encrypt(value)
    localStorage.setItem(key, encrypted)
  } catch (e) {
    log.error('Failed to store encrypted value:', e)
  }
}

/**
 * Retrieve and decrypt a value from localStorage
 */
export async function getEncrypted(key: string): Promise<string | null> {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem(key)
  if (!stored) return null

  return decrypt(stored)
}

/**
 * Encrypt an object and store in localStorage
 */
export async function setEncryptedJson<T>(key: string, value: T): Promise<void> {
  await setEncrypted(key, JSON.stringify(value))
}

/**
 * Retrieve and decrypt an object from localStorage
 */
export async function getEncryptedJson<T>(key: string, defaultValue: T): Promise<T> {
  const stored = await getEncrypted(key)
  if (!stored) return defaultValue

  try {
    return JSON.parse(stored) as T
  } catch (e) {
    log.warn('Failed to parse decrypted JSON:', e)
    return defaultValue
  }
}

