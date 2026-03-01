'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { migrateUserToSupabaseAuth, validatePassword } from '@/lib/services/supabaseAuth'

interface PasswordMigrationModalProps {
  email: string
  profileId: string
  nickname: string
  onSuccess: () => void
  onCancel: () => void
}

export function PasswordMigrationModal({
  email,
  profileId,
  nickname,
  onSuccess,
  onCancel,
}: PasswordMigrationModalProps) {
  const { t } = useLanguage()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const passwordValidation = validatePassword(password)
  const passwordsMatch = password === confirmPassword
  const canSubmit = passwordValidation.valid && passwordsMatch && password.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!canSubmit) {
      return
    }

    setIsLoading(true)
    try {
      const result = await migrateUserToSupabaseAuth(email, password, profileId)

      if (result.success) {
        if (result.needsEmailVerification) {
          setError('Please check your email to verify your account.')
        }
        onSuccess()
      } else {
        setError(result.error || 'Failed to create secure login')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (): { level: 'weak' | 'medium' | 'strong'; color: string } => {
    if (!password) return { level: 'weak', color: 'bg-gray-200' }

    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    if (strength <= 2) return { level: 'weak', color: 'bg-red-500' }
    if (strength <= 4) return { level: 'medium', color: 'bg-yellow-500' }
    return { level: 'strong', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Security Upgrade</h2>
              <p className="text-sm text-gray-500">Welcome back, {nickname}!</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              We&apos;ve upgraded our security. Please create a password to protect your account.
              Your profile and all your data will remain intact.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label htmlFor="migration-password" className="block text-sm font-medium text-gray-700 mb-1">
              Create Password
            </label>
            <div className="relative">
              <input
                id="migration-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
                placeholder="Enter a secure password"
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent pr-10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Password strength indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  <div className={`h-1 flex-1 rounded ${password.length >= 1 ? passwordStrength.color : 'bg-gray-200'}`} />
                  <div className={`h-1 flex-1 rounded ${password.length >= 8 ? passwordStrength.color : 'bg-gray-200'}`} />
                  <div className={`h-1 flex-1 rounded ${passwordStrength.level !== 'weak' ? passwordStrength.color : 'bg-gray-200'}`} />
                  <div className={`h-1 flex-1 rounded ${passwordStrength.level === 'strong' ? passwordStrength.color : 'bg-gray-200'}`} />
                </div>
                <p className={`text-xs ${
                  passwordStrength.level === 'weak' ? 'text-red-600' :
                  passwordStrength.level === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  Password strength: {passwordStrength.level}
                </p>
              </div>
            )}

            {password && !passwordValidation.valid && (
              <p className="text-xs text-red-600 mt-1">{passwordValidation.error}</p>
            )}
          </div>

          <div>
            <label htmlFor="migration-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="migration-confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setError(null)
              }}
              placeholder="Confirm your password"
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
            />
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || isLoading}
              className="flex-1 py-3 bg-rstu-red text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Setting Up...
                </>
              ) : (
                'Create Secure Login'
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            By continuing, you agree to our terms of service and privacy policy.
          </p>
        </form>
      </div>
    </div>
  )
}
