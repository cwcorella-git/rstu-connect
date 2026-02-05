'use client'

import { useState, memo } from 'react'
import { useLanguage, SUPPORTED_LOCALES, type Locale } from '@/contexts/LanguageContext'
import { useOnboardingSafe } from '@/contexts/OnboardingContext'
import {
  exportProfileData,
  type UserProfile,
} from '@/lib/storage/profileStorage'
import { hasTutorialCompleted, clearTutorialCompleted } from '@/components/Elections'
import { NotificationSettings } from './NotificationSettings'

interface ProfileEditorProps {
  profile: UserProfile
  onSignOut?: () => void
  onRestartRCVTutorial?: () => void
}

// Privacy toggle - neutral style
const PrivacyToggle = memo(function PrivacyToggle({
  label, description, enabled, onChange,
}: {
  label: string; description: string; enabled: boolean; onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
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
})

export function ProfileEditor({ profile, onSignOut, onRestartRCVTutorial }: ProfileEditorProps) {
  const { t, locale, setLocale } = useLanguage()
  const onboarding = useOnboardingSafe()

  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    shareEmail: false,
    sharePhone: false,
    allowContact: true,
  })
  const [exportMessage, setExportMessage] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [checklistResetMsg, setChecklistResetMsg] = useState(false)
  const [rcvTutorialCompleted, setRcvTutorialCompleted] = useState(() => hasTutorialCompleted())

  const togglePrivacySetting = (key: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleExportData = () => {
    try {
      setExportError(null)
      const jsonData = exportProfileData()
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `rstu-profile-${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setExportMessage(t('settings.exportSuccess') || 'Profile data exported!')
      setTimeout(() => setExportMessage(null), 3000)
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Failed to export data')
    }
  }

  return (
    <div className="space-y-0">
        {/* Notifications */}
        <div className="border-b border-gray-200 px-4 py-4 space-y-3">
          <span className="font-medium text-gray-900 block">{t('profile.notifications') || 'Notifications'}</span>
          <NotificationSettings profileId={profile.id} />
        </div>

        {/* Language */}
        <div className="border-b border-gray-200 px-4 py-4 space-y-3">
          <span className="font-medium text-gray-900 block">{t('settings.language') || 'Language'}</span>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
          >
            {SUPPORTED_LOCALES.map((localeInfo) => (
              <option key={localeInfo.code} value={localeInfo.code}>
                {localeInfo.name} ({localeInfo.nativeName})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            {t('settings.languageHint') || 'Language preference is saved automatically'}
          </p>
        </div>

        {/* Tutorials & Guides */}
        <div className="border-b border-gray-200 px-4 py-4 space-y-3">
          <span className="font-medium text-gray-900 block">{t('settings.tutorials') || 'Tutorials & Guides'}</span>

          {/* Getting Started Checklist */}
          <div className="flex items-center justify-between py-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">{t('settings.gettingStarted') || 'Getting Started Checklist'}</p>
              <p className="text-xs text-gray-500">
                {onboarding ? (
                  onboarding.state.checklistDismissed
                    ? t('settings.gettingStartedDismissed') || 'Dismissed'
                    : `${onboarding.getProgress().completed}/${onboarding.getProgress().total} ${t('settings.completed') || 'completed'}`
                ) : (
                  t('settings.gettingStartedDesc') || 'Onboarding checklist for new members'
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onboarding) {
                  onboarding.resetChecklist()
                  setChecklistResetMsg(true)
                  setTimeout(() => setChecklistResetMsg(false), 2000)
                }
              }}
              className="flex-shrink-0 ml-3 px-3 py-1.5 text-xs font-medium text-rstu-red border border-rstu-red/30 rounded-md hover:bg-red-50 transition-colors"
            >
              {t('settings.resetChecklist') || 'Reset'}
            </button>
          </div>

          {checklistResetMsg && (
            <p className="text-xs text-green-600">{t('settings.checklistReset') || 'Checklist restored!'}</p>
          )}

          {/* RCV Voting Tutorial */}
          <div className="flex items-center justify-between py-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">{t('settings.rcvTutorial') || 'RCV Voting Tutorial'}</p>
              <p className="text-xs text-gray-500">
                {rcvTutorialCompleted
                  ? t('settings.rcvCompleted') || 'Completed'
                  : t('settings.rcvNotCompleted') || 'Not yet completed'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                clearTutorialCompleted()
                setRcvTutorialCompleted(false)
                onRestartRCVTutorial?.()
              }}
              className="flex-shrink-0 ml-3 px-3 py-1.5 text-xs font-medium text-rstu-red border border-rstu-red/30 rounded-md hover:bg-red-50 transition-colors"
            >
              {t('settings.restartTutorial') || 'Restart'}
            </button>
          </div>
        </div>

        {/* Privacy & Data */}
        <div className="border-b border-gray-200 px-4 py-4 space-y-3">
          <span className="font-medium text-gray-900 block">{t('settings.privacy') || 'Privacy & Data'}</span>
          <div className="space-y-1">
            <PrivacyToggle
              label={t('settings.profileVisibility') || 'Profile Visibility'}
              description={t('settings.profileVisibilityDesc') || 'Allow other users to see your profile'}
              enabled={privacySettings.profileVisible}
              onChange={() => togglePrivacySetting('profileVisible')}
            />
            <PrivacyToggle
              label={t('settings.shareEmail') || 'Share Email'}
              description={t('settings.shareEmailDesc') || 'Allow organizers to contact you by email'}
              enabled={privacySettings.shareEmail}
              onChange={() => togglePrivacySetting('shareEmail')}
            />
            <PrivacyToggle
              label={t('settings.sharePhone') || 'Share Phone'}
              description={t('settings.sharePhoneDesc') || 'Allow organizers to contact you by phone'}
              enabled={privacySettings.sharePhone}
              onChange={() => togglePrivacySetting('sharePhone')}
            />
            <PrivacyToggle
              label={t('settings.allowContact') || 'Allow Direct Contact'}
              description={t('settings.allowContactDesc') || 'Allow building members to contact you directly'}
              enabled={privacySettings.allowContact}
              onChange={() => togglePrivacySetting('allowContact')}
            />
          </div>

          {/* Data Export */}
          <div className="pt-3 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-900 mb-2">{t('settings.dataManagement') || 'Data Management'}</p>
            <button
              type="button"
              onClick={handleExportData}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              {t('settings.exportData') || 'Export Profile Data'}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              {t('settings.exportHint') || 'Download your profile as JSON for backup'}
            </p>
          </div>

          {/* Export feedback */}
          {exportMessage && (
            <div className="p-2 bg-green-50 text-green-700 text-sm rounded">
              {exportMessage}
            </div>
          )}
          {exportError && (
            <div className="p-2 bg-red-50 text-red-700 text-sm rounded">
              {exportError}
            </div>
          )}
        </div>

        {/* Sign Out */}
        {onSignOut && (
          <div className="px-4 py-6">
            <button
              type="button"
              onClick={onSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-300 text-red-600 rounded-md text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              {t('profile.signOut') || 'Sign Out'}
            </button>
          </div>
        )}
    </div>
  )
}
