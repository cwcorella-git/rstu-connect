'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { verifyAdminPassword } from '@/lib/storage/adminStorage'

interface AdminLoginProps {
  onSuccess: () => void
  onCancel: () => void
}

export function AdminLogin({ onSuccess, onCancel }: AdminLoginProps) {
  const { t } = useLanguage()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const isValid = await verifyAdminPassword(password)

    if (isValid) {
      onSuccess()
    } else {
      setError(t('admin.invalidPassword'))
      setPassword('')
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">{t('admin.accessRequired')}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {t('admin.enterPasswordToAccess')}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('login.password')}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
              placeholder={t('admin.enterAdminPassword')}
              autoFocus
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
              disabled={loading}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm bg-rstu-red text-white rounded hover:bg-red-700 disabled:opacity-50"
              disabled={loading || !password}
            >
              {loading ? t('admin.verifying') : t('login.submit')}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          {t('admin.contactOrganizers')}
        </div>
      </div>
    </div>
  )
}
