'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { useLanguage } from '@/contexts/LanguageContext'

const DISMISS_KEY = 'rstu-notification-prompt-dismissed'

export function NotificationPromptBanner() {
  const { t } = useLanguage()
  const { profile } = useAuth()
  const { isSupported, permission, subscribe, isLoading, error } = usePushNotifications(profile?.id ?? null)
  const [dismissed, setDismissed] = useState(true) // Start true to avoid flash
  const [success, setSuccess] = useState(false)
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const wasDismissed = localStorage.getItem(DISMISS_KEY) === 'true'
    setDismissed(wasDismissed)
  }, [])

  const handleEnable = useCallback(async () => {
    const result = await subscribe()
    if (result) {
      setSuccess(true)
      setTimeout(() => setDismissed(true), 2000)
    } else {
      // Show error briefly then dismiss
      setShowError(true)
      setTimeout(() => setDismissed(true), 3000)
    }
  }, [subscribe])

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, 'true')
    setDismissed(true)
  }, [])

  // Don't show if: not supported, no profile, already asked, dismissed, or not default permission
  if (!isSupported || !profile || dismissed || permission !== 'default') {
    return null
  }

  if (success) {
    return (
      <div className="bg-green-600 text-white px-4 py-2 text-center text-sm font-medium" role="status">
        {t('notifications.onboardingSuccess')}
      </div>
    )
  }

  if (showError) {
    return (
      <div className="bg-amber-600 text-white px-4 py-2 text-center text-sm font-medium" role="alert">
        {error || 'Could not enable notifications right now. Try again later.'}
      </div>
    )
  }

  return (
    <div className="bg-rstu-red text-white px-4 py-3" role="banner">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <div className="min-w-0">
            <p className="text-sm font-medium">{t('notifications.onboardingTitle')}</p>
            <p className="text-xs opacity-90 hidden sm:block">{t('notifications.onboardingDesc')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleEnable}
            disabled={isLoading}
            className="px-3 py-1.5 bg-white text-rstu-red text-sm font-medium rounded hover:bg-gray-100 transition disabled:opacity-50"
          >
            {isLoading ? '...' : t('notifications.enableNow')}
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 text-white/80 text-sm hover:text-white transition"
          >
            {t('notifications.maybeLater')}
          </button>
        </div>
      </div>
    </div>
  )
}
