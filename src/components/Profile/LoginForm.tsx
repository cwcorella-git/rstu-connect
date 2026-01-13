'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { loginByEmailAsync, type UserProfile } from '@/lib/profileStorage'

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
      const profile = await loginByEmailAsync(email, password)

      if (profile) {
        onLoginSuccess(profile)
      } else {
        setError(t('login.invalidCredentials'))
        setShowEmail(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
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
