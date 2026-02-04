/**
 * Email Verification Service
 *
 * Handles email verification via Supabase Auth magic links.
 * Uses Supabase's built-in email infrastructure - no custom domain required.
 */

import { supabase } from './supabase'
import { createLogger } from '../utils/logger'

const log = createLogger('EmailVerification')

interface SendLinkResult {
  success: boolean
  error?: string
}

/**
 * Get the redirect URL for magic link verification
 */
function getRedirectUrl(): string {
  if (typeof window === 'undefined') {
    return ''
  }
  // Redirect back to the app's base path
  const basePath = '/rstu-connect'
  return `${window.location.origin}${basePath}`
}

/**
 * Send a magic link to the specified email using Supabase Auth
 */
export async function sendVerificationLink(
  email: string
): Promise<SendLinkResult> {
  if (!supabase) {
    return { success: false, error: 'Email verification not configured' }
  }

  try {
    const normalizedEmail = email.toLowerCase().trim()
    const redirectTo = getRedirectUrl()

    log.info('Sending magic link to:', normalizedEmail, 'redirect:', redirectTo)

    // Use Supabase Auth's signInWithOtp to send a magic link
    // This uses Supabase's built-in email system - no custom domain needed
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectTo,
      },
    })

    if (error) {
      log.error('Failed to send magic link:', error)

      // Handle rate limiting
      if (error.message.includes('rate') || error.status === 429) {
        return { success: false, error: 'Too many requests. Please wait a minute before trying again.' }
      }

      return { success: false, error: error.message || 'Failed to send verification email' }
    }

    return { success: true }
  } catch (err) {
    log.error('Exception sending magic link:', err)
    return { success: false, error: 'Network error - please try again' }
  }
}

// Alias for backwards compatibility
export const sendVerificationCode = sendVerificationLink

/**
 * Check if the current user is verified via Supabase Auth
 */
export async function checkVerificationStatus(): Promise<{
  verified: boolean
  email?: string
}> {
  if (!supabase) {
    return { verified: false }
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user?.email) {
      return {
        verified: true,
        email: session.user.email,
      }
    }

    return { verified: false }
  } catch (err) {
    log.error('Error checking verification status:', err)
    return { verified: false }
  }
}

/**
 * Subscribe to auth state changes (for detecting magic link callback)
 */
export function onAuthStateChange(
  callback: (verified: boolean, email?: string) => void
): (() => void) | null {
  if (!supabase) {
    return null
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      log.info('Auth state changed:', event)

      if (event === 'SIGNED_IN' && session?.user?.email) {
        callback(true, session.user.email)
      } else if (event === 'SIGNED_OUT') {
        callback(false)
      }
    }
  )

  return () => subscription.unsubscribe()
}

/**
 * Check if email verification is available (Supabase configured)
 */
export function isEmailVerificationAvailable(): boolean {
  return !!supabase
}

/**
 * Sign out from Supabase Auth (clears the verification session)
 * Call this if the user cancels or starts over
 */
export async function clearVerificationSession(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut()
  }
}
