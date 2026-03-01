'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { loginByEmailAsync, type UserProfile } from '@/lib/storage/profileStorage'
import {
  signInWithEmail,
  resetPassword,
  isSupabaseAuthAvailable,
  MigrationRequiredError,
} from '@/lib/services/supabaseAuth'
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
      setError(t('login.passwordFieldRequired'))
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
              <span className="font-medium">{t('login.checkEmail')}</span>
            </div>
            <p className="text-sm text-green-700 mt-2">
              {t('login.resetSentMessage')}
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
            {t('login.backToLogin')}
          </button>
        </div>
      )
    }

    return (
      <form onSubmit={handleForgotPassword} className="space-y-3">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('login.resetPassword')}</h3>
          <p className="text-sm text-gray-600">{t('login.resetDescription')}</p>
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
                {t('login.sending')}
              </>
            ) : (
              t('login.sendResetLink')
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
          {t('login.forgotPassword')}
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

    </form>
  )
}
