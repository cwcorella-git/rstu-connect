'use client'

import { usePushNotifications, type NotificationSettings as NotifSettings } from '@/hooks/usePushNotifications'
import { useLanguage } from '@/contexts/LanguageContext'

interface NotificationSettingsProps {
  profileId: string | null
}

export function NotificationSettings({ profileId }: NotificationSettingsProps) {
  const { t } = useLanguage()
  const {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    settings,
    subscribe,
    unsubscribe,
    updateSettings,
    recheckPermission,
  } = usePushNotifications(profileId)

  // Not supported
  if (!isSupported) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 0A9 9 0 015.636 18.364" />
        </svg>
        <p className="text-sm text-gray-500">
          {t('notifications.notSupported')}
        </p>
      </div>
    )
  }

  // Permission denied
  if (permission === 'denied') {
    return (
      <div className="bg-yellow-50 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-yellow-800">
              {t('notifications.blocked')}
            </p>
            <p className="text-xs text-yellow-600 mt-2">
              {t('notifications.blockedSteps')}
            </p>
          </div>
        </div>
        <button
          onClick={recheckPermission}
          className="w-full px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition"
        >
          {t('notifications.checkAgain')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSubscribed ? 'bg-green-100' : 'bg-gray-200'}`}>
            <svg className={`w-5 h-5 ${isSubscribed ? 'text-green-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {t('notifications.pushNotifications')}
            </p>
            <p className="text-xs text-gray-500">
              {isSubscribed ? t('notifications.enabled') : t('notifications.disabled')}
            </p>
          </div>
        </div>
        <button
          onClick={() => isSubscribed ? unsubscribe() : subscribe()}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            isSubscribed
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-rstu-red text-white hover:bg-rstu-red-dark'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t('common.loading')}
            </span>
          ) : isSubscribed ? (
            t('notifications.turnOff')
          ) : (
            t('notifications.enable')
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Individual settings */}
      {isSubscribed && (
        <div className="border rounded-lg divide-y">
          <NotificationToggle
            label={t('notifications.directMessages')}
            description={t('notifications.directMessagesDesc')}
            enabled={settings.dm}
            onChange={(enabled) => updateSettings({ dm: enabled })}
          />
          <NotificationToggle
            label={t('notifications.mentions')}
            description={t('notifications.mentionsDesc')}
            enabled={settings.mention}
            onChange={(enabled) => updateSettings({ mention: enabled })}
          />
          <NotificationToggle
            label={t('notifications.events')}
            description={t('notifications.eventsDesc')}
            enabled={settings.event}
            onChange={(enabled) => updateSettings({ event: enabled })}
          />
          <NotificationToggle
            label={t('notifications.alerts')}
            description={t('notifications.alertsDesc')}
            enabled={settings.alert}
            onChange={(enabled) => updateSettings({ alert: enabled })}
          />
        </div>
      )}
    </div>
  )
}

interface NotificationToggleProps {
  label: string
  description: string
  enabled: boolean
  onChange: (enabled: boolean) => void
}

function NotificationToggle({ label, description, enabled, onChange }: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rstu-red focus:ring-offset-2 ${
          enabled ? 'bg-rstu-red' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
