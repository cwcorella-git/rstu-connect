'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { loginByEmailAsync, type UserProfile } from '@/lib/profileStorage'
import {
  signInWithEmail,
  signInWithGoogle,
  resetPassword,
  isSupabaseAuthAvailable,
  MigrationRequiredError,
} from '@/lib/supabaseAuth'
import { PasswordMigrationModal } from './PasswordMigrationModal'

interface LoginFormProps {
  onLoginSuccess: (profile: UserProfile) => void
  onShowCreateProfile?: () => void
}

export function LoginForm({ onLoginSuccess, onShowCreateProfile }: LoginFormProps) {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmail, setShowEmail] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  // Migration modal state
  const [showMigration, setShowMigration] = useState(false)
  const [migrationData, setMigrationData] = useState<{
    email: string
    profileId: string
    nickname: string
  } | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError(t('login.emailRequired'))
      return
    }

    if (!password.trim()) {
      setError(t('login.passwordRequired'))
      return
    }

    setIsLoading(true)
    try {
      if (isSupabaseAuthAvailable()) {
        // Use Supabase Auth
        try {
          const result = await signInWithEmail(email, password)

          if (result.success) {
            // Fetch the profile after successful auth
            const profile = await loginByEmailAsync(email, password)
            if (profile) {
              onLoginSuccess(profile)
            }
          } else {
            setError(result.error || t('login.invalidCredentials'))
          }
        } catch (err) {
          if (err instanceof MigrationRequiredError) {
            // User needs to create a password
            setMigrationData({
              email: email,
              profileId: err.profileId,
              nickname: err.nickname,
            })
            setShowMigration(true)
          } else {
            throw err
          }
        }
      } else {
        // Fallback to legacy login
        const profile = await loginByEmailAsync(email, password)

        if (profile) {
          onLoginSuccess(profile)
        } else {
          setError(t('login.invalidCredentials'))
          setShowEmail(false)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!isSupabaseAuthAvailable()) {
      setError('Google sign-in is not available')
      return
    }

    setIsGoogleLoading(true)
    setError(null)

    try {
      const result = await signInWithGoogle()
      if (!result.success) {
        setError(result.error || 'Google sign-in failed')
      }
      // If successful, the page will redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError(t('login.emailRequired'))
      return
    }

    setIsLoading(true)
    try {
      const result = await resetPassword(email)
      if (result.success) {
        setResetSent(true)
      } else {
        setError(result.error || 'Failed to send reset email')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMigrationSuccess = async () => {
    setShowMigration(false)
    setMigrationData(null)
    // After migration, the user needs to verify email, so show a message
    setError('Account secured! Please check your email to verify your account.')
  }

  // Show migration modal if needed
  if (showMigration && migrationData) {
    return (
      <PasswordMigrationModal
        email={migrationData.email}
        profileId={migrationData.profileId}
        nickname={migrationData.nickname}
        onSuccess={handleMigrationSuccess}
        onCancel={() => {
          setShowMigration(false)
          setMigrationData(null)
        }}
      />
    )
  }

  // Forgot password form
  if (showForgotPassword) {
    if (resetSent) {
      return (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Check your email</span>
            </div>
            <p className="text-sm text-green-700 mt-2">
              If an account exists for {email}, you&apos;ll receive a password reset link shortly.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowForgotPassword(false)
              setResetSent(false)
            }}
            className="w-full py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Back to Login
          </button>
        </div>
      )
    }

    return (
      <form onSubmit={handleForgotPassword} className="space-y-3">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Reset Password</h3>
          <p className="text-sm text-gray-600">Enter your email to receive a reset link</p>
        </div>

        <div>
          <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
            {t('login.email')}
          </label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError(null)
            }}
            placeholder={t('login.emailPlaceholder')}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
            autoFocus
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 bg-rstu-red text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowForgotPassword(false)}
            className="px-4 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {t('login.back')}
          </button>
        </div>
      </form>
    )
  }

  if (!showEmail) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setShowEmail(true)}
          className="w-full py-4 border-2 border-rstu-red rounded-lg hover:bg-red-50 transition-colors"
        >
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-rstu-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium text-rstu-red">{t('login.title')}</span>
            <span className="text-xs text-gray-500">{t('login.subtitle')}</span>
          </div>
        </button>

        {/* Google Sign In */}
        {isSupabaseAuthAvailable() && (
          <>
            <div className="relative flex items-center py-2">
              <div className="flex-1 border-t border-gray-200" />
              <span className="px-3 text-xs text-gray-500 bg-white">or</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span className="text-gray-700">Continue with Google</span>
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleLogin} className="space-y-3">
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
          {t('login.email')}
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError(null)
          }}
          placeholder={t('login.emailPlaceholder')}
          disabled={isLoading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
          {t('login.password')}
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError(null)
          }}
          placeholder={t('login.passwordPlaceholder')}
          disabled={isLoading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-3 bg-rstu-red text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t('login.loggingIn')}
            </>
          ) : (
            t('login.submit')
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowEmail(false)
            setEmail('')
            setPassword('')
            setError(null)
          }}
          className="px-4 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {t('login.back')}
        </button>
      </div>

      {/* Forgot password link */}
      {isSupabaseAuthAvailable() && (
        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          className="w-full text-sm text-gray-500 hover:text-rstu-red py-1"
        >
          Forgot password?
        </button>
      )}

      {onShowCreateProfile && (
        <button
          type="button"
          onClick={onShowCreateProfile}
          className="w-full text-sm text-rstu-red hover:underline py-2"
        >
          {t('login.createProfile')}
        </button>
      )}

      {/* Google Sign In */}
      {isSupabaseAuthAvailable() && (
        <>
          <div className="relative flex items-center py-2">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-3 text-xs text-gray-500 bg-white">or</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            <span className="text-gray-700">Continue with Google</span>
          </button>
        </>
      )}
    </form>
  )
}
