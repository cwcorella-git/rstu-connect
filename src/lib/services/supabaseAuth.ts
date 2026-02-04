/**
 * Supabase Auth Service
 *
 * Provides authentication functions using Supabase Auth for secure,
 * production-ready user authentication with email/password and OAuth.
 */

import { supabase, USE_SUPABASE } from './supabase'
import { createLogger } from '../utils/logger'
import type { User, Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js'

const log = createLogger('SupabaseAuth')

// ============================================
// Types
// ============================================

export interface AuthResult {
  success: boolean
  user?: User
  session?: Session
  error?: string
  needsEmailVerification?: boolean
  needsMigration?: boolean
  profileId?: string
  nickname?: string
}

export interface MigrationCheckResult {
  needsMigration: boolean
  profileId?: string
  nickname?: string
}

// Custom error for migration required
export class MigrationRequiredError extends Error {
  constructor(
    public profileId: string,
    public nickname: string
  ) {
    super('User needs to migrate to Supabase Auth')
    this.name = 'MigrationRequiredError'
  }
}

// ============================================
// Auth State
// ============================================

/**
 * Get the current Supabase session
 */
export async function getSession(): Promise<Session | null> {
  if (!supabase) return null

  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      log.error('Error getting session:', error)
      return null
    }
    return session
  } catch (err) {
    log.error('Exception getting session:', err)
    return null
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null

  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      return null
    }
    return user
  } catch (err) {
    log.error('Exception getting user:', err)
    return null
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
): { unsubscribe: () => void } {
  if (!supabase) {
    return { unsubscribe: () => {} }
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
  return { unsubscribe: () => subscription.unsubscribe() }
}

// ============================================
// Email/Password Authentication
// ============================================

/**
 * Sign up with email and password
 * Creates a new Supabase Auth user
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' }
  }

  try {
    // First check if this email has an existing profile needing migration
    const migrationCheck = await checkNeedsMigration(email)
    if (migrationCheck.needsMigration) {
      return {
        success: false,
        error: 'Account exists - please login and set a password',
        needsMigration: true,
        profileId: migrationCheck.profileId,
        nickname: migrationCheck.nickname,
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        emailRedirectTo: typeof window !== 'undefined'
          ? `${window.location.origin}/rstu-connect`
          : undefined,
      },
    })

    if (error) {
      return { success: false, error: mapAuthError(error) }
    }

    // Check if email confirmation is required
    const needsVerification = data.user && !data.user.email_confirmed_at

    return {
      success: true,
      user: data.user || undefined,
      session: data.session || undefined,
      needsEmailVerification: needsVerification || undefined,
    }
  } catch (err) {
    log.error('Exception during sign up:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' }
  }

  try {
    // First check if this user needs migration (has profile but no auth_user_id)
    const migrationCheck = await checkNeedsMigration(email)
    if (migrationCheck.needsMigration) {
      throw new MigrationRequiredError(
        migrationCheck.profileId!,
        migrationCheck.nickname!
      )
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    })

    if (error) {
      return { success: false, error: mapAuthError(error) }
    }

    return {
      success: true,
      user: data.user || undefined,
      session: data.session || undefined,
    }
  } catch (err) {
    if (err instanceof MigrationRequiredError) {
      throw err // Re-throw migration errors
    }
    log.error('Exception during sign in:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' }
  }

  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { success: false, error: mapAuthError(error) }
    }
    return { success: true }
  } catch (err) {
    log.error('Exception during sign out:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// ============================================
// OAuth Authentication
// ============================================

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' }
  }

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined'
          ? `${window.location.origin}/rstu-connect`
          : undefined,
      },
    })

    if (error) {
      return { success: false, error: mapAuthError(error) }
    }

    // OAuth redirects, so we return success here
    return { success: true }
  } catch (err) {
    log.error('Exception during Google sign in:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// ============================================
// Password Management
// ============================================

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' }
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      {
        redirectTo: typeof window !== 'undefined'
          ? `${window.location.origin}/rstu-connect?reset=true`
          : undefined,
      }
    )

    if (error) {
      return { success: false, error: mapAuthError(error) }
    }

    return { success: true }
  } catch (err) {
    log.error('Exception during password reset:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Update password (for logged-in users or reset flow)
 */
export async function updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' }
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { success: false, error: mapAuthError(error) }
    }

    return { success: true }
  } catch (err) {
    log.error('Exception during password update:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// ============================================
// Migration Functions
// ============================================

/**
 * Check if a user needs to migrate to Supabase Auth
 * (has a profile with email but no auth_user_id)
 */
export async function checkNeedsMigration(email: string): Promise<MigrationCheckResult> {
  if (!supabase) {
    return { needsMigration: false }
  }

  try {
    const { data, error } = await supabase.rpc('check_user_needs_migration', {
      user_email: email.toLowerCase().trim(),
    })

    if (error || !data || data.length === 0) {
      return { needsMigration: false }
    }

    const result = data[0]
    return {
      needsMigration: result.needs_migration,
      profileId: result.profile_id,
      nickname: result.nickname,
    }
  } catch (err) {
    log.error('Exception checking migration status:', err)
    return { needsMigration: false }
  }
}

/**
 * Migrate an existing profile to Supabase Auth
 * Creates a new auth user and links to existing profile
 */
export async function migrateUserToSupabaseAuth(
  email: string,
  password: string,
  profileId: string
): Promise<AuthResult> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' }
  }

  try {
    // Create the Supabase Auth user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        emailRedirectTo: typeof window !== 'undefined'
          ? `${window.location.origin}/rstu-connect`
          : undefined,
      },
    })

    if (signUpError) {
      return { success: false, error: mapAuthError(signUpError) }
    }

    if (!signUpData.user) {
      return { success: false, error: 'Failed to create auth user' }
    }

    // Link the profile to the new auth user
    const { data: migrated, error: migrateError } = await supabase.rpc('migrate_profile_to_auth', {
      profile_id_input: profileId,
      auth_user_id_input: signUpData.user.id,
    })

    if (migrateError) {
      log.error('Error migrating profile:', migrateError)
      // Try to clean up the auth user we just created
      // Note: This may not work if RLS prevents it
      return { success: false, error: 'Failed to link profile to auth user' }
    }

    if (!migrated) {
      return { success: false, error: 'Profile already linked or not found' }
    }

    return {
      success: true,
      user: signUpData.user,
      session: signUpData.session || undefined,
      needsEmailVerification: !signUpData.user.email_confirmed_at,
    }
  } catch (err) {
    log.error('Exception during migration:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// ============================================
// Profile Helpers
// ============================================

/**
 * Get profile data for the current auth user
 */
export async function getProfileByAuthUser(): Promise<{
  id: string
  nickname: string
  email: string
  role: string
  trustLevel: string
  emailVerified: boolean
} | null> {
  if (!supabase) return null

  try {
    const user = await getCurrentUser()
    if (!user) return null

    const { data, error } = await supabase.rpc('get_profile_by_auth_id', {
      auth_id: user.id,
    })

    if (error || !data || data.length === 0) {
      return null
    }

    const profile = data[0]
    return {
      id: profile.id,
      nickname: profile.nickname,
      email: profile.email,
      role: profile.role,
      trustLevel: profile.trust_level,
      emailVerified: profile.email_verified,
    }
  } catch (err) {
    log.error('Exception getting profile by auth user:', err)
    return null
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Map Supabase auth errors to user-friendly messages
 */
function mapAuthError(error: AuthError): string {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Invalid email or password'
    case 'Email not confirmed':
      return 'Please verify your email before logging in'
    case 'User already registered':
      return 'An account with this email already exists'
    case 'Password should be at least 6 characters':
      return 'Password must be at least 8 characters'
    case 'Signups not allowed for this instance':
      return 'Registration is currently disabled'
    case 'Email rate limit exceeded':
      return 'Too many attempts. Please try again later.'
    default:
      // Log unexpected errors for debugging
      log.error('Auth error:', error.message)
      return error.message || 'Authentication failed'
  }
}

/**
 * Check if Supabase Auth is available
 */
export function isSupabaseAuthAvailable(): boolean {
  return USE_SUPABASE && supabase !== null
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Password is required' }
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' }
  }

  // Check for at least one letter
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one letter' }
  }

  return { valid: true }
}
