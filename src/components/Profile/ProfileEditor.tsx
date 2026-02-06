'use client'

import { useState, memo } from 'react'
import { useLanguage, SUPPORTED_LOCALES, type Locale } from '@/contexts/LanguageContext'
import { useOnboardingSafe } from '@/contexts/OnboardingContext'
import {
  exportProfileData,
  type UserProfile,
} from '@/lib/storage/profileStorage'
import { updatePassword, validatePassword, isSupabaseAuthAvailable } from '@/lib/services/supabaseAuth'
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

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

  const handlePasswordChange = async () => {
    setPasswordError(null)
    setPasswordSuccess(false)

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError(t('settings.passwordsDontMatch') || 'Passwords do not match')
      return
    }

    // Validate password strength
    const validation = validatePassword(newPassword)
    if (!validation.valid) {
      setPasswordError(validation.error || 'Invalid password')
      return
    }

    setIsChangingPassword(true)
    try {
      const result = await updatePassword(newPassword)
      if (result.success) {
        setPasswordSuccess(true)
        setNewPassword('')
        setConfirmPassword('')
        setShowPasswordChange(false)
        setTimeout(() => setPasswordSuccess(false), 3000)
      } else {
        setPasswordError(result.error || 'Failed to update password')
      }
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setIsChangingPassword(false)
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

        {/* Password */}
        {isSupabaseAuthAvailable() && (
          <div className="border-b border-gray-200 px-4 py-4 space-y-3">
            <span className="font-medium text-gray-900 block">{t('settings.password') || 'Password'}</span>

            {passwordSuccess && (
              <div className="p-2 bg-green-50 text-green-700 text-sm rounded">
                {t('settings.passwordUpdated') || 'Password updated successfully!'}
              </div>
            )}

            {!showPasswordChange ? (
              <button
                type="button"
                onClick={() => setShowPasswordChange(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
                {t('settings.changePassword') || 'Change Password'}
              </button>
            ) : (
              <div className="space-y-3">
                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm text-gray-700 mb-1">
                    {t('settings.newPassword') || 'New Password'}
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t('settings.newPasswordPlaceholder') || 'Enter new password'}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm text-gray-700 mb-1">
                    {t('settings.confirmPassword') || 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('settings.confirmPasswordPlaceholder') || 'Confirm new password'}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  {t('settings.passwordRequirements') || 'At least 8 characters with one letter and one number'}
                </p>

                {passwordError && (
                  <div className="p-2 bg-red-50 text-red-700 text-sm rounded">
                    {passwordError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordChange(false)
                      setNewPassword('')
                      setConfirmPassword('')
                      setPasswordError(null)
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {t('common.cancel') || 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword || !newPassword || !confirmPassword}
                    className="px-3 py-2 bg-rstu-red text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? (t('common.saving') || 'Saving...') : (t('settings.updatePassword') || 'Update Password')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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
