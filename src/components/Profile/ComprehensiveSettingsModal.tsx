'use client'

import { useState } from 'react'
import { useLanguage, SUPPORTED_LOCALES, type Locale } from '@/contexts/LanguageContext'
import { usePushNotifications, type NotificationSettings as NotifSettings } from '@/hooks/usePushNotifications'
import { getCurrentProfile, exportProfileData, updateProfile } from '@/lib/profileStorage'
import { NotificationSettings } from './NotificationSettings'

interface ComprehensiveSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  profileId?: string
}

export function ComprehensiveSettingsModal({ isOpen, onClose, profileId }: ComprehensiveSettingsModalProps) {
  const { t, locale, setLocale } = useLanguage()
  const profile = getCurrentProfile()
  const profileIdToUse = profileId || profile?.id || null

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['notifications', 'display', 'privacy'])
  )

  // Privacy & Data toggles
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    shareEmail: false,
    sharePhone: false,
    allowContact: true,
  })

  const [exportMessage, setExportMessage] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    const newSections = new Set(expandedSections)
    if (newSections.has(section)) {
      newSections.delete(section)
    } else {
      newSections.add(section)
    }
    setExpandedSections(newSections)
  }

  const handleExportData = () => {
    try {
      setExportError(null)
      const jsonData = exportProfileData()

      // Create blob and download
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `rstu-profile-${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setExportMessage('Profile data exported successfully!')
      setTimeout(() => setExportMessage(null), 3000)
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Failed to export data')
    }
  }

  const togglePrivacySetting = (key: keyof typeof privacySettings) => {
    const updated = { ...privacySettings, [key]: !privacySettings[key] }
    setPrivacySettings(updated)
    // Persist to profile if needed
    if (profile) {
      updateProfile({
        ...profile,
        // Store privacy settings in profile notes or create new field
      })
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{t('profile.settings') || 'Settings'}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close settings"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">

              {/* Notifications Section - Collapsible */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('notifications')}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between font-semibold text-gray-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                    </svg>
                    <span>{t('profile.notifications') || 'Notifications'}</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.has('notifications') ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                  </svg>
                </button>
                {expandedSections.has('notifications') && (
                  <div className="p-4 border-t border-gray-200 space-y-4">
                    {profileIdToUse && <NotificationSettings profileId={profileIdToUse} />}
                  </div>
                )}
              </div>

              {/* Display Preferences Section - Collapsible */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('display')}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between font-semibold text-gray-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
                    </svg>
                    <span>Display Preferences</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.has('display') ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                  </svg>
                </button>
                {expandedSections.has('display') && (
                  <div className="p-4 border-t border-gray-200 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Language
                      </label>
                      <select
                        value={locale}
                        onChange={(e) => setLocale(e.target.value as Locale)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-rstu-red"
                      >
                        {SUPPORTED_LOCALES.map((localeInfo) => (
                          <option key={localeInfo.code} value={localeInfo.code}>
                            {localeInfo.name} ({localeInfo.nativeName})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Language preference is saved automatically and synced across your devices
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Privacy & Data Section - Collapsible */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('privacy')}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between font-semibold text-gray-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    <span>Privacy & Data</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.has('privacy') ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                  </svg>
                </button>
                {expandedSections.has('privacy') && (
                  <div className="p-4 border-t border-gray-200 space-y-4">
                    {/* Privacy Toggles */}
                    <div className="space-y-3">
                      <PrivacyToggle
                        label="Profile Visibility"
                        description="Allow other users to see your profile"
                        enabled={privacySettings.profileVisible}
                        onChange={() => togglePrivacySetting('profileVisible')}
                      />
                      <PrivacyToggle
                        label="Share Email"
                        description="Allow organizers to contact you by email"
                        enabled={privacySettings.shareEmail}
                        onChange={() => togglePrivacySetting('shareEmail')}
                      />
                      <PrivacyToggle
                        label="Share Phone"
                        description="Allow organizers to contact you by phone"
                        enabled={privacySettings.sharePhone}
                        onChange={() => togglePrivacySetting('sharePhone')}
                      />
                      <PrivacyToggle
                        label="Allow Direct Contact"
                        description="Allow other building members to contact you directly"
                        enabled={privacySettings.allowContact}
                        onChange={() => togglePrivacySetting('allowContact')}
                      />
                    </div>

                    {/* Data Export */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Data Management</h4>
                      <button
                        onClick={handleExportData}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                        </svg>
                        Export Profile Data
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        Download your profile information as JSON for backup or transfer
                      </p>
                    </div>

                    {/* Status Messages */}
                    {exportMessage && (
                      <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg">
                        ✓ {exportMessage}
                      </div>
                    )}
                    {exportError && (
                      <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                        ✗ {exportError}
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-rstu-red text-white rounded-lg hover:bg-red-800 transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * Reusable privacy toggle component
 */
function PrivacyToggle({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string
  description: string
  enabled: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
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
}
