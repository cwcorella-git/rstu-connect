'use client'

import DOMPurify from 'dompurify'

/**
 * Input sanitization utilities for user-generated content
 * Prevents XSS attacks by stripping malicious HTML/scripts
 */

/**
 * Sanitize text input - strips ALL HTML tags
 * Use for: titles, names, short text fields
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return ''
  if (typeof window === 'undefined') {
    // Server-side: basic HTML entity escape
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
  }
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
}

/**
 * Sanitize rich text - allows safe formatting tags
 * Use for: descriptions, notes, longer content that may have formatting
 */
export function sanitizeRichText(input: string | null | undefined): string {
  if (!input) return ''
  if (typeof window === 'undefined') {
    // Server-side: basic HTML entity escape
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
  }
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    // Force safe link attributes
    ADD_ATTR: ['target'],
    FORBID_ATTR: ['onclick', 'onerror', 'onload', 'onmouseover'],
  })
}

/**
 * Sanitize URL - validates and sanitizes URLs
 * Use for: links, virtual meeting URLs
 */
export function sanitizeUrl(input: string | null | undefined): string {
  if (!input) return ''

  const trimmed = input.trim()

  // Only allow http, https, and mailto protocols
  const allowedProtocols = ['http:', 'https:', 'mailto:']

  try {
    const url = new URL(trimmed)
    if (!allowedProtocols.includes(url.protocol)) {
      return ''
    }
    return trimmed
  } catch {
    // If it doesn't have a protocol, assume https
    if (!trimmed.includes('://') && !trimmed.startsWith('mailto:')) {
      try {
        new URL('https://' + trimmed)
        return 'https://' + trimmed
      } catch {
        return ''
      }
    }
    return ''
  }
}

/**
 * Sanitize an object's string fields recursively
 * Use for: sanitizing entire form data objects before storage
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  richTextFields: string[] = []
): T {
  const result = { ...obj }

  for (const key of Object.keys(result)) {
    const value = result[key]

    if (typeof value === 'string') {
      if (richTextFields.includes(key)) {
        (result as Record<string, unknown>)[key] = sanitizeRichText(value)
      } else if (key.toLowerCase().includes('url') || key.toLowerCase().includes('link')) {
        (result as Record<string, unknown>)[key] = sanitizeUrl(value)
      } else {
        (result as Record<string, unknown>)[key] = sanitizeText(value)
      }
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = sanitizeObject(
        value as Record<string, unknown>,
        richTextFields
      )
    }
  }

  return result
}

/**
 * Sanitize array of strings
 */
export function sanitizeStringArray(arr: string[] | null | undefined): string[] {
  if (!arr) return []
  return arr.map(sanitizeText).filter(Boolean)
}
