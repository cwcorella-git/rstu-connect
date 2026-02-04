'use client'

/**
 * CSRF Protection Utility
 *
 * This module provides CSRF protection mechanisms for the RSTU Connect app.
 *
 * SECURITY MODEL:
 * - Supabase operations use JWT in Authorization header (not cookies) = CSRF-safe
 * - Static site has no server-side routes = no traditional CSRF vectors
 * - Socket.io uses its own auth mechanism
 *
 * This utility provides:
 * 1. Origin validation for custom fetch requests
 * 2. CSRF token generation/validation for future endpoints
 * 3. Secure fetch wrapper with Origin checks
 *
 * WHY CSRF PROTECTION MATTERS:
 * CSRF attacks trick authenticated users into making unwanted requests.
 * If auth uses cookies (auto-sent), an attacker's page can forge requests.
 * JWT in Authorization header requires explicit code to add, making CSRF harder.
 */

// ============================================================================
// Configuration
// ============================================================================

// Allowed origins for API requests
const ALLOWED_ORIGINS = [
  'https://rstu-connect.neocities.org',
  'https://cwcorella-git.github.io',
  'http://localhost:3000',
  'http://localhost:3001',
]

// Allowed API domains (external services we call)
const ALLOWED_API_DOMAINS = [
  'supabase.co',           // Supabase backend
  'onrender.com',          // Socket.io server
  'api.github.com',        // GitHub API
  'meet.jitsi.org',        // Jitsi video
]

// CSRF token storage key
const CSRF_TOKEN_KEY = 'rstu_csrf_token'
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000 // 1 hour

// ============================================================================
// Origin Validation
// ============================================================================

/**
 * Get the current page origin
 */
export function getCurrentOrigin(): string {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

/**
 * Check if an origin is allowed
 */
export function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false

  // Check exact match
  if (ALLOWED_ORIGINS.includes(origin)) return true

  // Check if it's a development origin
  if (origin.startsWith('http://localhost:')) return true

  return false
}

/**
 * Check if a URL is to an allowed API domain
 */
export function isAllowedApiDomain(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname

    // Check if hostname matches or is subdomain of allowed domains
    return ALLOWED_API_DOMAINS.some(domain =>
      hostname === domain || hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}

/**
 * Validate that a request is from an allowed origin
 * Use this for any custom API endpoints
 */
export function validateOrigin(requestOrigin: string | null): {
  valid: boolean
  error?: string
} {
  if (!requestOrigin) {
    // No origin header - could be same-origin or curl/etc
    // For browser requests, missing origin usually means same-origin
    return { valid: true }
  }

  if (isAllowedOrigin(requestOrigin)) {
    return { valid: true }
  }

  return {
    valid: false,
    error: `Origin not allowed: ${requestOrigin}`
  }
}

// ============================================================================
// CSRF Token Management
// ============================================================================

interface CsrfTokenData {
  token: string
  createdAt: number
}

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  }
  throw new Error('Crypto API not available')
}

/**
 * Get or create a CSRF token for the current session
 * Token is stored in sessionStorage (not sent automatically like cookies)
 */
export function getCsrfToken(): string {
  if (typeof window === 'undefined') return ''

  try {
    const stored = sessionStorage.getItem(CSRF_TOKEN_KEY)
    if (stored) {
      const data: CsrfTokenData = JSON.parse(stored)
      // Check if token is still valid
      if (Date.now() - data.createdAt < CSRF_TOKEN_EXPIRY) {
        return data.token
      }
    }
  } catch {
    // Ignore parse errors
  }

  // Generate new token
  const token = generateCsrfToken()
  const data: CsrfTokenData = {
    token,
    createdAt: Date.now()
  }

  try {
    sessionStorage.setItem(CSRF_TOKEN_KEY, JSON.stringify(data))
  } catch {
    // SessionStorage might not be available
  }

  return token
}

/**
 * Validate a CSRF token from a request
 */
export function validateCsrfToken(requestToken: string | null): {
  valid: boolean
  error?: string
} {
  if (!requestToken) {
    return { valid: false, error: 'Missing CSRF token' }
  }

  const expectedToken = getCsrfToken()
  if (requestToken !== expectedToken) {
    return { valid: false, error: 'Invalid CSRF token' }
  }

  return { valid: true }
}

/**
 * Clear the CSRF token (call on logout)
 */
export function clearCsrfToken(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(CSRF_TOKEN_KEY)
  } catch {
    // Ignore
  }
}

// ============================================================================
// Secure Fetch Wrapper
// ============================================================================

export interface SecureFetchOptions extends RequestInit {
  /** Skip origin validation (for trusted external APIs) */
  skipOriginCheck?: boolean
  /** Include CSRF token in request */
  includeCsrfToken?: boolean
}

/**
 * Secure fetch wrapper that validates URLs and optionally adds CSRF tokens
 *
 * Use this instead of raw fetch() for state-changing operations to ensure:
 * 1. Request goes to an allowed domain
 * 2. Origin is properly set
 * 3. CSRF token is included if needed
 */
export async function secureFetch(
  url: string,
  options: SecureFetchOptions = {}
): Promise<Response> {
  const { skipOriginCheck, includeCsrfToken, ...fetchOptions } = options

  // Validate URL domain (unless skipped for known safe domains)
  if (!skipOriginCheck && !isAllowedApiDomain(url)) {
    // Check if it's a same-origin request (static assets)
    const currentOrigin = getCurrentOrigin()
    if (!url.startsWith(currentOrigin) && !url.startsWith('/')) {
      throw new Error(`Fetch to untrusted domain blocked: ${url}`)
    }
  }

  // Prepare headers
  const headers = new Headers(fetchOptions.headers || {})

  // Add CSRF token if requested (for POST/PUT/DELETE to custom endpoints)
  if (includeCsrfToken) {
    headers.set('X-CSRF-Token', getCsrfToken())
  }

  // Ensure credentials are handled correctly
  // 'same-origin' is safest for most cases
  const credentials = fetchOptions.credentials || 'same-origin'

  return fetch(url, {
    ...fetchOptions,
    headers,
    credentials,
  })
}

/**
 * Make a POST request with CSRF protection
 */
export async function securePost(
  url: string,
  body: unknown,
  options: SecureFetchOptions = {}
): Promise<Response> {
  return secureFetch(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(body),
    includeCsrfToken: true,
  })
}

// ============================================================================
// Security Documentation
// ============================================================================

/**
 * CSRF Protection Strategy for RSTU Connect
 *
 * 1. SUPABASE OPERATIONS (Primary data store)
 *    - Uses JWT in Authorization header (not cookies)
 *    - JWT must be explicitly added by code, not auto-sent
 *    - This makes Supabase operations inherently CSRF-resistant
 *    - No additional protection needed
 *
 * 2. SOCKET.IO OPERATIONS (Real-time chat)
 *    - Uses its own authentication mechanism
 *    - Connection requires explicit profile ID
 *    - CSRF protection handled by Socket.io library
 *
 * 3. STATIC ASSET FETCHES (Properties, documents)
 *    - Read-only, no state changes
 *    - No CSRF protection needed
 *
 * 4. CUSTOM API ENDPOINTS (Future)
 *    - Use secureFetch() or securePost() for all requests
 *    - Server should validate X-CSRF-Token header
 *    - Server should validate Origin header
 *
 * 5. FORM SUBMISSIONS
 *    - CSP form-action restricts where forms can submit
 *    - React handles forms as SPA (no traditional form POST)
 *    - For any traditional forms, use hidden CSRF token field
 */
export const CSRF_DOCUMENTATION = `
RSTU Connect CSRF Protection Strategy:

Current State:
- Static Next.js site with 'output: export'
- Supabase for data (JWT auth in header = CSRF-safe)
- Socket.io for chat (own auth mechanism)
- No custom server API endpoints

Protection Measures:
1. Content-Security-Policy form-action: 'self'
2. secureFetch() wrapper validates request domains
3. CSRF tokens available for future custom endpoints
4. Origin validation utility for server-side checks

For Future Development:
- If adding API routes: use validateOrigin() + validateCsrfToken()
- If using cookies: set SameSite=Strict
- If embedding in iframe: validate frame-ancestors
`
