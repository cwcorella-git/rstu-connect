'use client'

import { useState, useEffect } from 'react'
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
import { ProfileCreate } from './ProfileCreate'
import { ProfileEditor } from './ProfileEditor'
import { ProfileHeader } from './ProfileHeader'
import { LoginForm } from './LoginForm'
import { ComprehensiveSettingsModal } from './ComprehensiveSettingsModal'
import { HabitabilityReport } from './HabitabilityReport'
import { BuildingOrganizingStatus } from './BuildingOrganizingStatus'
import { InviteCodeManager } from './InviteCodeManager'
import { UserList } from './UserList'
import { ElectionsDashboard } from '@/components/Elections'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useLanguage } from '@/contexts/LanguageContext'
import { RentComparison } from './RentComparison'

interface ProfilePageProps {
  buildings: EnhancedBuilding[]
}

export function ProfilePage({ buildings }: ProfilePageProps) {
  const { refreshAuth } = useAuth()
  const { t } = useLanguage()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [storedProfiles, setStoredProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showWizard, setShowWizard] = useState(false)

  // Confirmation modals
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [confirmLogout, setConfirmLogout] = useState(false)

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
        console.error('[ProfilePage] Failed to sync profile to Supabase:', err)
      })
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
      // Show ProfileCreate component to let them create an account
      // The invite code will be parsed and auto-filled by ProfileCreate
      setShowCreate(true)
    }
  }, [profile])

  const handleProfileCreated = (newProfile: UserProfile) => {
    setProfile(newProfile)
    setShowCreate(false)
    refreshAuth() // Update nav immediately
  }

  const handleLogin = async (profileId: string) => {
    const loggedIn = loginToProfile(profileId)
    if (loggedIn) {
      setProfile(loggedIn)
      syncProfile() // Sync after login (Socket.io for real-time)

      // Sync to Supabase (for user list)
      if (USE_SUPABASE) {
        await syncProfileToSupabase(loggedIn).catch(err => {
          console.error('[ProfilePage] Failed to sync profile to Supabase:', err)
        })
      }

      refreshAuth() // Update nav immediately
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

  // Show onboarding wizard (mobile-first, replaces old ProfileCreate for new users)
  if (showWizard) {
    return (
      <ProfileOnboardingWizard
        buildings={buildings}
        onProfileCreated={handleProfileCreated}
        onCancel={() => setShowWizard(false)}
      />
    )
  }

  // Show create flow (legacy fallback)
  if (showCreate) {
    return (
      <ProfileCreate
        buildings={buildings}
        onProfileCreated={handleProfileCreated}
        onCancel={() => setShowCreate(false)}
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

  // Show full edit mode if user clicked Edit
  if (showEdit) {
    return (
      <ProfileEditor
        profile={profile}
        buildings={buildings}
        onSave={(updated) => {
          setProfile(updated)
          setShowEdit(false)
        }}
        onCancel={() => setShowEdit(false)}
      />
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
            onOpenEditor={() => setShowEdit(true)}
            onOpenSettings={() => setShowSettings(true)}
          />

          {/* Building Habitability Report - always visible if building has data */}
          {selectedBuilding && (
            <HabitabilityReport
              profile={profile}
              building={selectedBuilding}
            />
          )}

          {/* Rent Comparison */}
          {selectedBuilding && (
            <RentComparison
              building={selectedBuilding}
              userRent={profile.rentAmount}
              rentHistory={profile.rentHistory}
              onUpdateRent={handleUpdateRent}
              onAddHistoryEntry={(date, amount) => {
                const updated = addRentHistoryEntry(profile.rentHistory || [], date, amount)
                const newProfile = updateProfile({ rentHistory: updated })
                if (newProfile) {
                  setProfile(newProfile)
                }
              }}
            />
          )}

          {/* Building Organizing Status - shows for users linked to a building */}
          {selectedBuilding && (
            <BuildingOrganizingStatus
              buildingId={selectedBuilding.chatSlug}
              buildingName={selectedBuilding.propertyName || selectedBuilding.address.split(',')[0]}
              totalUnits={selectedBuilding.units}
            />
          )}

          {/* Elections Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">{t('elections.voting')}</h3>
            <ElectionsDashboard
              profileId={profile.id}
              profileName={profile.nickname}
            />
          </div>

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

      {/* Messages Modal */}
      {showMessages && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMessages(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
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
    </div>
  )
}


