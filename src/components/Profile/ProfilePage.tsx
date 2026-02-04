'use client'
import { createLogger } from '@/lib/logger'
const log = createLogger('ProfilePage')

import { useState, useEffect, useRef } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import { useAuth } from '@/contexts/AuthContext'
import {
  getCurrentProfile,
  updateProfile,
  clearProfile,
  getStoredProfiles,
  loginToProfile,
  deleteStoredProfile,
  getRoleLabel,
  getTrustLabel,
  isAdmin,
  canAccessTools,
  getActivityStatus,
  addRentHistoryEntry,
  type UserProfile,
} from '@/lib/profileStorage'
import { syncProfile } from '@/lib/profileSync'
import { syncProfileToSupabase, USE_SUPABASE } from '@/lib/supabase'
import { useUnreadCount } from '@/hooks/useDirectMessages'
import { MessageHub } from '@/components/Messages/MessageHub'
import { ProfileOnboardingWizard } from './Onboarding/ProfileOnboardingWizard'
import { ProfileEditor, type ProfileEditorHandle } from './ProfileEditor'
import { ProfileHeader } from './ProfileHeader'
import { LoginForm } from './LoginForm'
import { ComprehensiveSettingsModal } from './ComprehensiveSettingsModal'
import { InviteCodeManager } from './InviteCodeManager'
import { UserList } from './UserList'
import { ProfileVotingSection } from './ProfileVotingSection'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useLanguage } from '@/contexts/LanguageContext'
import { RentFairnessDashboard } from './RentFairnessDashboard'
import { CirclesTab } from '@/components/MutualAid/CirclesTab'
import { TutorialElection, hasTutorialCompleted } from '@/components/Elections'

interface ProfilePageProps {
  buildings: EnhancedBuilding[]
}

export function ProfilePage({ buildings }: ProfilePageProps) {
  const { refreshAuth } = useAuth()
  const { t } = useLanguage()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [storedProfiles, setStoredProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const [showGroups, setShowGroups] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const [showRCVTutorial, setShowRCVTutorial] = useState(false)

  // ProfileEditor ref for calling save from modal footer
  const profileEditorRef = useRef<ProfileEditorHandle>(null)

  // Confirmation modals
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [confirmLogout, setConfirmLogout] = useState(false)

  // Password prompt for stored profile login
  const [profileIdToLogin, setProfileIdToLogin] = useState<string | null>(null)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [passwordPromptInput, setPasswordPromptInput] = useState('')
  const [passwordPromptError, setPasswordPromptError] = useState<string | null>(null)

  // Unread message count from Socket.io
  const unreadCount = useUnreadCount()

  // Load profile on mount and sync to Supabase if needed
  useEffect(() => {
    const p = getCurrentProfile()
    const stored = getStoredProfiles()
    setProfile(p)
    setStoredProfiles(stored)
    setLoading(false)

    // Sync current profile to Supabase (ensures existing profiles get synced)
    if (p && USE_SUPABASE) {
      syncProfileToSupabase(p).catch(err => {
        log.error('Failed to sync profile to Supabase:', err)
      })
    }

    // Show RCV tutorial if user is logged in but hasn't completed it yet
    if (p && !hasTutorialCompleted()) {
      // Small delay to let the page render first
      setTimeout(() => setShowRCVTutorial(true), 500)
    }
  }, [])

  // Detect invite code in URL and auto-show profile creation for new users
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check for invite code in URL
    const urlParams = new URLSearchParams(window.location.search)
    const inviteCode = urlParams.get('invite')
    const action = urlParams.get('action')

    // If there's an invite code or create-profile action AND user is NOT logged in
    if ((inviteCode || action === 'create-profile') && !profile) {
      // Show the onboarding wizard (not legacy ProfileCreate)
      // The invite code will be parsed and auto-filled by the wizard
      setShowWizard(true)
    }
  }, [profile])

  const handleProfileCreated = (newProfile: UserProfile) => {
    setProfile(newProfile)
    setShowWizard(false)
    refreshAuth() // Update nav immediately
  }

  const handleLogin = (profileId: string) => {
    // Show password prompt for stored profile login
    setProfileIdToLogin(profileId)
    setShowPasswordPrompt(true)
    setPasswordPromptInput('')
    setPasswordPromptError(null)
  }

  const handlePasswordSubmit = async () => {
    if (!profileIdToLogin) return

    // Attempt login with password
    const loggedIn = loginToProfile(profileIdToLogin, passwordPromptInput)
    if (loggedIn) {
      setProfile(loggedIn)
      setShowPasswordPrompt(false)
      setProfileIdToLogin(null)
      setPasswordPromptInput('')
      syncProfile() // Sync after login (Socket.io for real-time)

      // Sync to Supabase (for user list)
      if (USE_SUPABASE) {
        await syncProfileToSupabase(loggedIn).catch(err => {
          log.error('Failed to sync profile to Supabase:', err)
        })
      }

      refreshAuth() // Update nav immediately
    } else {
      setPasswordPromptError('Invalid password')
    }
  }

  const handleDeleteStoredProfile = (profileId: string) => {
    setConfirmDelete(profileId)
  }

  const confirmDeleteProfile = () => {
    if (confirmDelete) {
      deleteStoredProfile(confirmDelete)
      setStoredProfiles(getStoredProfiles())
      setConfirmDelete(null)
    }
  }

  const handleLogout = () => {
    setConfirmLogout(true)
  }

  const confirmLogoutAction = () => {
    clearProfile()
    setStoredProfiles(getStoredProfiles()) // Refresh stored profiles
    setProfile(null)
    setConfirmLogout(false)
    refreshAuth() // Update nav immediately
  }

  const handleUpdateRent = (rentAmount: number) => {
    const updated = updateProfile({ rentAmount })
    if (updated) {
      setProfile(updated)
    }
  }

  const selectedBuilding = buildings.find(b => b.chatSlug === profile?.buildingId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rstu-red"></div>
      </div>
    )
  }

  // Show onboarding wizard
  if (showWizard) {
    return (
      <ProfileOnboardingWizard
        buildings={buildings}
        onProfileCreated={handleProfileCreated}
        onCancel={() => setShowWizard(false)}
      />
    )
  }

  // Show login/create options if no profile
  if (!profile) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900">{t('profile.login')}</h1>
          <p className="text-sm text-gray-500">{t('profile.signInOrCreate')}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-md mx-auto space-y-6">
            {/* Stored Profiles */}
            {storedProfiles.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-gray-700 mb-3">{t('profile.yourProfiles')}</h2>
                <div className="space-y-2">
                  {storedProfiles.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3"
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-rstu-red flex items-center justify-center text-white font-bold flex-shrink-0">
                        {p.nickname.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{p.nickname}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span className={`px-1.5 py-0.5 rounded ${
                            p.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            p.role === 'organizer' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {getRoleLabel(p.role)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => handleLogin(p.id)}
                        className="px-3 py-1.5 bg-rstu-red text-white rounded-md text-sm font-medium hover:bg-red-700"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => handleDeleteStoredProfile(p.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600"
                        title={t('ui.delete')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider before login/create options */}
            {storedProfiles.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-sm text-gray-400">{t('common.or') || 'or'}</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>
            )}

            {/* Login Form - for existing users on new devices */}
            <LoginForm
              onLoginSuccess={(loggedInProfile) => {
                setProfile(loggedInProfile)
                refreshAuth()
              }}
              onShowCreateProfile={() => setShowWizard(true)}
            />

            {/* Divider before create option */}
            <div className="flex items-center gap-4">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-sm text-gray-400">{t('common.or') || 'or'}</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            {/* Create Profile with Invite - Only show if invite code in URL */}
            {typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('invite') ? (
              <button
                onClick={() => setShowWizard(true)}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-rstu-red hover:bg-red-50 transition-colors"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span className="font-medium text-gray-700">{t('profile.createNewProfile')}</span>
                </div>
              </button>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Invite Required</strong> - Profile creation requires an invite code from an existing member.
                  Ask a neighbor or organizer for an invite link.
                </p>
              </div>
            )}

            {/* Privacy Note */}
            <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-blue-700">
                  <p className="font-medium">{t('profile.privacy') || 'Privacy & data sharing'}</p>
                  <p className="mt-1">
                    {t('profile.privacyDescription') || 'Organizers can view profiles to coordinate tenant outreach. Rent data is only used for anonymous building averages.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-xl mx-auto space-y-4">
          {/* Profile Header */}
          <ProfileHeader
            profile={profile}
            selectedBuilding={selectedBuilding}
            unreadMessagesCount={unreadCount}
            onOpenMessages={() => setShowMessages(true)}
            onOpenGroups={() => setShowGroups(true)}
            onOpenEditor={() => setShowEdit(true)}
            onOpenSettings={() => setShowSettings(true)}
          />

          {/* Rent Fairness Dashboard */}
          {selectedBuilding && (
            <RentFairnessDashboard
              building={selectedBuilding}
              userRent={profile.rentAmount}
              monthlyIncome={profile.monthlyIncome}
              unitSqft={profile.unitSqft}
              bedroomCount={profile.bedroomCount}
              rentHistory={profile.rentHistory}
              onUpdateRent={handleUpdateRent}
              onAddHistoryEntry={(date, amount) => {
                const updated = addRentHistoryEntry(profile.rentHistory || [], date, amount)
                const newProfile = updateProfile({ rentHistory: updated })
                if (newProfile) {
                  setProfile(newProfile)
                }
              }}
              onUpdateProfile={(updates) => {
                const newProfile = updateProfile(updates)
                if (newProfile) setProfile(newProfile)
              }}
            />
          )}

          {/* Voting Section - Elections & App Governance */}
          <ProfileVotingSection
            profileId={profile.id}
            profileName={profile.nickname}
            isAdmin={isAdmin()}
          />

          {/* Invite Code Manager - Available to all users */}
          {profile && <InviteCodeManager />}

          {/* Organizer/Admin Section - User List */}
          {canAccessTools() && <UserList />}

          {/* Account Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">{t('profile.accountInfo')}</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">{t('profile.profileId')}</dt>
                <dd className="text-gray-900 font-mono text-xs">{profile.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">{t('profile.created')}</dt>
                <dd className="text-gray-900">{new Date(profile.created).toLocaleDateString()}</dd>
              </div>
              {profile.invitedBy && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">{t('profile.invitedBy')}</dt>
                  <dd className="text-gray-900 font-mono text-xs">{profile.invitedBy}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <ComprehensiveSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        profileId={profile?.id}
      />

      {/* Edit Profile Modal */}
      {showEdit && profile && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowEdit(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full h-[95vh] sm:h-auto sm:max-w-3xl sm:max-h-[90vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-xl font-semibold text-gray-900">{t('profile.editProfile') || 'Edit Profile'}</h2>
                <button
                  onClick={() => setShowEdit(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <ProfileEditor
                  ref={profileEditorRef}
                  profile={profile}
                  buildings={buildings}
                  onSave={(updated) => {
                    setProfile(updated)
                    setShowEdit(false)
                  }}
                  onCancel={() => setShowEdit(false)}
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-white">
                <button
                  onClick={() => setShowEdit(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  onClick={() => profileEditorRef.current?.save()}
                  className="px-4 py-2 bg-rstu-red text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  {t('common.save') || 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Messages Modal */}
      {showMessages && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMessages(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full h-[95vh] sm:h-auto sm:max-w-4xl sm:h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">{t('profile.messages')}</h2>
                <button
                  onClick={() => setShowMessages(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Messages Content */}
              <div className="flex-1 overflow-hidden">
                <MessageHub embedded={true} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Groups Modal */}
      {showGroups && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowGroups(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full h-[95vh] sm:h-auto sm:max-w-4xl sm:h-[80vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">{t('profile.groups') || 'Groups'}</h2>
                <button
                  onClick={() => setShowGroups(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Groups Content */}
              <div className="flex-1 overflow-hidden">
                <CirclesTab />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Password Prompt Modal */}
      {showPasswordPrompt && profileIdToLogin && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => {
              setShowPasswordPrompt(false)
              setPasswordPromptInput('')
              setPasswordPromptError(null)
            }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full sm:max-w-sm">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Enter Password</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {storedProfiles.find(p => p.id === profileIdToLogin)?.nickname || 'Profile'} requires a password to log in
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={passwordPromptInput}
                    onChange={(e) => {
                      setPasswordPromptInput(e.target.value)
                      setPasswordPromptError(null)
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handlePasswordSubmit()
                      }
                    }}
                    placeholder="Enter your password"
                    autoFocus
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                  />
                  {passwordPromptError && (
                    <p className="text-xs text-red-600 mt-2">{passwordPromptError}</p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowPasswordPrompt(false)
                    setPasswordPromptInput('')
                    setPasswordPromptError(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  disabled={!passwordPromptInput.trim()}
                  className="px-4 py-2 bg-rstu-red text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={confirmDelete !== null}
        title={t('profile.deleteProfile')}
        message={t('profile.deleteProfileMsg')}
        confirmText={t('ui.delete')}
        cancelText={t('ui.cancel')}
        variant="danger"
        onConfirm={confirmDeleteProfile}
        onCancel={() => setConfirmDelete(null)}
      />

      <ConfirmModal
        isOpen={confirmLogout}
        title={t('profile.signOut')}
        message={t('profile.signOutMsg')}
        confirmText={t('profile.signOut')}
        cancelText={t('ui.cancel')}
        variant="warning"
        onConfirm={confirmLogoutAction}
        onCancel={() => setConfirmLogout(false)}
      />

      {/* RCV Tutorial for first-time users */}
      {showRCVTutorial && (
        <TutorialElection
          onComplete={() => setShowRCVTutorial(false)}
          onSkip={() => setShowRCVTutorial(false)}
        />
      )}
    </div>
  )
}


