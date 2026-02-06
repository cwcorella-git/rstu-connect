'use client'

/**
 * Production-Safe Logger
 *
 * Prevents verbose error messages from exposing internal details in production.
 * In development, full details are logged for debugging.
 * In production, only sanitized messages are logged.
 *
 * SECURITY: This addresses L1 (Verbose Error Messages) by:
 * 1. Stripping stack traces in production
 * 2. Removing internal file paths
 * 3. Sanitizing error objects to prevent info leakage
 * 4. Providing generic user-facing error messages
 */

// ============================================================================
// Configuration
// ============================================================================

const IS_DEVELOPMENT = typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
const IS_BROWSER = typeof window !== 'undefined'

// Patterns that might reveal internal structure
const SENSITIVE_PATTERNS = [
  /\/home\/[^/]+\//g,           // Home directory paths
  /\/Users\/[^/]+\//g,          // macOS user paths
  /C:\\Users\\[^\\]+\\/gi,      // Windows user paths
  /at\s+\S+\s+\([^)]+\)/g,      // Stack trace lines
  /node_modules\//g,            // Node modules paths
  /\.next\//g,                  // Next.js build paths
  /webpack:/g,                  // Webpack paths
  /supabase\.[a-z]+\.co/g,      // Supabase URLs (keep domain, remove details)
]

// Generic error messages for users
const USER_FRIENDLY_ERRORS: Record<string, string> = {
  'storage': 'Unable to save data. Please try again.',
  'network': 'Connection error. Please check your internet.',
  'auth': 'Authentication error. Please log in again.',
  'permission': 'You do not have permission for this action.',
  'validation': 'Invalid input. Please check and try again.',
  'rate_limit': 'Too many requests. Please wait a moment.',
  'not_found': 'The requested item was not found.',
  'server': 'Server error. Please try again later.',
  'unknown': 'An error occurred. Please try again.',
}

// ============================================================================
// Types
// ============================================================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogOptions {
  /** Category for filtering logs (e.g., 'Storage', 'Auth') */
  category?: string
  /** Additional context data */
  context?: Record<string, unknown>
  /** Show user-friendly message instead of technical details */
  userFriendly?: boolean
}

// ============================================================================
// Sanitization
// ============================================================================

/**
 * Sanitize a string to remove sensitive information
 */
function sanitizeString(str: string): string {
  if (IS_DEVELOPMENT) return str

  let sanitized = str
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED]')
  }
  return sanitized
}

/**
 * Sanitize an error object for production
 */
function sanitizeError(error: unknown): string {
  if (error === null || error === undefined) {
    return 'Unknown error'
  }

  if (error instanceof Error) {
    if (IS_DEVELOPMENT) {
      return `${error.name}: ${error.message}\n${error.stack || ''}`
    }
    // In production, only return sanitized message
    return sanitizeString(error.message)
  }

  if (typeof error === 'string') {
    return sanitizeString(error)
  }

  if (typeof error === 'object') {
    try {
      const str = JSON.stringify(error)
      return sanitizeString(str.slice(0, 200)) // Limit length
    } catch {
      return 'Error object'
    }
  }

  return String(error)
}

/**
 * Sanitize context data for production
 */
function sanitizeContext(context: Record<string, unknown>): Record<string, unknown> {
  if (IS_DEVELOPMENT) return context

  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(context)) {
    // Skip sensitive keys
    if (/password|token|secret|key|auth/i.test(key)) {
      sanitized[key] = '[REDACTED]'
      continue
    }

    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (value instanceof Error) {
      sanitized[key] = sanitizeError(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

// ============================================================================
// Logger Implementation
// ============================================================================

/**
 * Format a log message with category prefix
 */
function formatMessage(message: string, options: LogOptions): string {
  const prefix = options.category ? `[${options.category}]` : ''
  return `${prefix} ${message}`.trim()
}

/**
 * Log at debug level (development only)
 */
export function logDebug(message: string, options: LogOptions = {}): void {
  if (!IS_DEVELOPMENT) return

  const formatted = formatMessage(message, options)
  if (options.context) {
    console.debug(formatted, options.context)
  } else {
    console.debug(formatted)
  }
}

/**
 * Log at info level (development only)
 */
export function logInfo(message: string, options: LogOptions = {}): void {
  if (!IS_DEVELOPMENT) return

  const formatted = formatMessage(sanitizeString(message), options)
  const context = options.context ? sanitizeContext(options.context) : undefined

  if (context) {
    console.info(formatted, context)
  } else {
    console.info(formatted)
  }
}

/**
 * Log at warn level (development only)
 */
export function logWarn(message: string, options: LogOptions = {}): void {
  if (!IS_DEVELOPMENT) return

  const formatted = formatMessage(sanitizeString(message), options)
  const context = options.context ? sanitizeContext(options.context) : undefined

  if (context) {
    console.warn(formatted, context)
  } else {
    console.warn(formatted)
  }
}

/**
 * Log at error level with sanitization
 */
export function logError(
  message: string,
  error?: unknown,
  options: LogOptions = {}
): void {
  const formatted = formatMessage(sanitizeString(message), options)
  const sanitizedError = error ? sanitizeError(error) : undefined
  const context = options.context ? sanitizeContext(options.context) : undefined

  if (IS_DEVELOPMENT) {
    // Full details in development
    if (sanitizedError && context) {
      console.error(formatted, sanitizedError, context)
    } else if (sanitizedError) {
      console.error(formatted, sanitizedError)
    } else if (context) {
      console.error(formatted, context)
    } else {
      console.error(formatted)
    }
  } else {
    // Sanitized in production
    if (sanitizedError) {
      console.error(formatted, sanitizedError)
    } else {
      console.error(formatted)
    }
  }
}

// ============================================================================
// User-Friendly Error Messages
// ============================================================================

/**
 * Get a user-friendly error message based on error type
 */
export function getUserFriendlyError(error: unknown, fallbackType: string = 'unknown'): string {
  // Check for known error types
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes('quota') || message.includes('storage')) {
      return USER_FRIENDLY_ERRORS.storage
    }
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return USER_FRIENDLY_ERRORS.network
    }
    if (message.includes('auth') || message.includes('login') || message.includes('session')) {
      return USER_FRIENDLY_ERRORS.auth
    }
    if (message.includes('permission') || message.includes('forbidden') || message.includes('unauthorized')) {
      return USER_FRIENDLY_ERRORS.permission
    }
    if (message.includes('valid') || message.includes('required') || message.includes('invalid')) {
      return USER_FRIENDLY_ERRORS.validation
    }
    if (message.includes('rate') || message.includes('limit') || message.includes('too many')) {
      return USER_FRIENDLY_ERRORS.rate_limit
    }
    if (message.includes('not found') || message.includes('404')) {
      return USER_FRIENDLY_ERRORS.not_found
    }
    if (message.includes('server') || message.includes('500') || message.includes('internal')) {
      return USER_FRIENDLY_ERRORS.server
    }
  }

  return USER_FRIENDLY_ERRORS[fallbackType] || USER_FRIENDLY_ERRORS.unknown
}

/**
 * Log an error and return a user-friendly message
 * Use this when you need to both log and show an error to the user
 */
export function handleError(
  message: string,
  error: unknown,
  options: LogOptions & { errorType?: string } = {}
): string {
  logError(message, error, options)
  return getUserFriendlyError(error, options.errorType)
}

// ============================================================================
// Specialized Loggers (for backwards compatibility)
// ============================================================================

/**
 * Create a category-specific logger
 * Supports flexible argument patterns for backwards compatibility with console.* calls
 */
export function createLogger(category: string) {
  return {
    debug: (message: string, ...args: unknown[]) =>
      logDebug(message + (args.length ? ' ' + args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ') : ''), { category }),
    info: (message: string, ...args: unknown[]) =>
      logInfo(message + (args.length ? ' ' + args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ') : ''), { category }),
    warn: (message: string, ...args: unknown[]) =>
      logWarn(message + (args.length ? ' ' + args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ') : ''), { category }),
    error: (message: string, error?: unknown, context?: Record<string, unknown>) =>
      logError(message, error, { category, context }),
    handleError: (message: string, error: unknown, errorType?: string) =>
      handleError(message, error, { category, errorType }),
  }
}

// ============================================================================
// Export default logger instance
// ============================================================================

export const logger = {
  debug: logDebug,
  info: logInfo,
  warn: logWarn,
  error: logError,
  handleError,
  createLogger,
  getUserFriendlyError,
}

export default logger
