/**
 * Email Verification Service
 *
 * Handles sending and verifying email verification codes via Supabase Edge Functions.
 */

import { createLogger } from './logger'

const log = createLogger('EmailVerification')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

interface SendCodeResult {
  success: boolean
  error?: string
}

interface VerifyCodeResult {
  success: boolean
  error?: string
}

/**
 * Send a verification code to the specified email
 */
export async function sendVerificationCode(
  email: string,
  nickname?: string
): Promise<SendCodeResult> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { success: false, error: 'Email verification not configured' }
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/send-verification-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          nickname,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      log.error('Failed to send verification code:', data)
      return { success: false, error: data.error || 'Failed to send verification code' }
    }

    return { success: true }
  } catch (err) {
    log.error('Exception sending verification code:', err)
    return { success: false, error: 'Network error - please try again' }
  }
}

/**
 * Verify a code entered by the user
 */
export async function verifyEmailCode(
  email: string,
  code: string
): Promise<VerifyCodeResult> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { success: false, error: 'Email verification not configured' }
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/verify-email-code`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          code: code.trim(),
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || 'Invalid verification code' }
    }

    return { success: true }
  } catch (err) {
    log.error('Exception verifying code:', err)
    return { success: false, error: 'Network error - please try again' }
  }
}

/**
 * Check if email verification is available (Supabase configured)
 */
export function isEmailVerificationAvailable(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY)
}
