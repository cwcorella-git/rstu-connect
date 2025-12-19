'use client'

import { useState, useEffect } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
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
  type UserProfile,
} from '@/lib/profileStorage'
import { syncProfile } from '@/lib/profileSync'
import { ProfileCreate } from './ProfileCreate'
import { ProfileEditor } from './ProfileEditor'
import { RentComparison } from './RentComparison'
import { AdminPanel } from './AdminPanel'
import { InviteCodeManager } from './InviteCodeManager'
import { UserList } from './UserList'

interface ProfilePageProps {
  buildings: EnhancedBuilding[]
}

export function ProfilePage({ buildings }: ProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [storedProfiles, setStoredProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  // Load profile on mount
  useEffect(() => {
    const p = getCurrentProfile()
    const stored = getStoredProfiles()
    setProfile(p)
    setStoredProfiles(stored)
    setLoading(false)
  }, [])

  const handleProfileCreated = (newProfile: UserProfile) => {
    setProfile(newProfile)
    setShowCreate(false)
  }

  const handleLogin = (profileId: string) => {
    const loggedIn = loginToProfile(profileId)
    if (loggedIn) {
      setProfile(loggedIn)
      syncProfile() // Sync after login
    }
  }

  const handleDeleteStoredProfile = (profileId: string) => {
    if (confirm('Delete this profile? This cannot be undone.')) {
      deleteStoredProfile(profileId)
      setStoredProfiles(getStoredProfiles())
    }
  }

  const handleLogout = () => {
    if (confirm('Sign out? You can log back in later.')) {
      clearProfile()
      setStoredProfiles(getStoredProfiles()) // Refresh stored profiles
      setProfile(null)
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

  // Show create flow
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
          <h1 className="text-xl font-bold text-gray-900">Login</h1>
          <p className="text-sm text-gray-500">Sign in or create a new profile</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-md mx-auto space-y-6">
            {/* Stored Profiles */}
            {storedProfiles.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-gray-700 mb-3">Your Profiles</h2>
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
                        title="Delete profile"
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

            {/* Divider */}
            {storedProfiles.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-sm text-gray-400">or</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>
            )}

            {/* Create New Profile */}
            <button
              onClick={() => setShowCreate(true)}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-rstu-red hover:bg-red-50 transition-colors"
            >
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="font-medium text-gray-700">Create New Profile</span>
              </div>
            </button>

            {/* Privacy Note */}
            <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-blue-700">
                  <p className="font-medium">Privacy &amp; data sharing</p>
                  <p className="mt-1">
                    Organizers can view profiles to coordinate tenant outreach. Rent data is only used for anonymous building averages.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show edit flow
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

  // Show admin panel
  if (showAdmin) {
    return (
      <AdminPanel
        buildings={buildings}
        onClose={() => setShowAdmin(false)}
      />
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Your Profile</h1>
            <p className="text-sm text-gray-500">Manage your tenant profile</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin() && (
              <button
                onClick={() => setShowAdmin(true)}
                className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-md text-sm font-medium hover:bg-purple-200"
              >
                Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md text-sm hover:bg-gray-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-rstu-red flex items-center justify-center text-white text-2xl font-bold">
                {profile.nickname.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900">{profile.nickname}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    profile.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    profile.role === 'organizer' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {getRoleLabel(profile.role)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    profile.trustLevel === 'verified' ? 'bg-green-100 text-green-700' :
                    profile.trustLevel === 'invited' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {getTrustLabel(profile.trustLevel)}
                  </span>
                  {/* Activity status */}
                  {(() => {
                    const status = getActivityStatus(profile)
                    return (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        status === 'active' ? 'bg-green-100 text-green-700' :
                        status === 'inactive' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {status === 'active' ? 'Active' : status === 'inactive' ? 'Inactive' : 'New'}
                      </span>
                    )
                  })()}
                </div>
              </div>
            </div>

            {/* Building Info */}
            {selectedBuilding && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500 mb-1">Your Building</div>
                <div className="font-medium text-gray-900">
                  {selectedBuilding.address.split(',')[0]}
                </div>
                {profile.unitNumber && (
                  <div className="text-sm text-gray-600">Unit {profile.unitNumber}</div>
                )}
              </div>
            )}

            {!selectedBuilding && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowEdit(true)}
                  className="text-sm text-rstu-red hover:underline"
                >
                  Link to your building &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Rent Comparison */}
          {selectedBuilding && profile.unitNumber && (
            <RentComparison
              building={selectedBuilding}
              unitNumber={profile.unitNumber}
              userRent={profile.rentAmount}
              onUpdateRent={(rent) => {
                updateProfile({ rentAmount: rent })
                setProfile({ ...profile, rentAmount: rent })
              }}
            />
          )}

          {/* Quick Self-Report */}
          {selectedBuilding && !profile.rentAmount && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Add Your Rent</h3>
              <p className="text-sm text-blue-700 mb-3">
                Help us calculate building averages. Your specific rent is never shared.
              </p>
              <RentInput
                onSubmit={(rent) => {
                  updateProfile({ rentAmount: rent })
                  setProfile({ ...profile, rentAmount: rent })
                }}
              />
            </div>
          )}

          {/* Organizer Section - Invite Code Manager */}
          {canAccessTools() && <InviteCodeManager />}

          {/* Organizer/Admin Section - User List */}
          {canAccessTools() && <UserList />}

          {/* Account Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Account Info</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Profile ID</dt>
                <dd className="text-gray-900 font-mono text-xs">{profile.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-900">{new Date(profile.created).toLocaleDateString()}</dd>
              </div>
              {profile.invitedBy && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Invited by</dt>
                  <dd className="text-gray-900 font-mono text-xs">{profile.invitedBy}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Edit Profile Button */}
          <button
            onClick={() => setShowEdit(true)}
            className="w-full py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
          >
            Edit Profile
          </button>
        </div>
      </div>

    </div>
  )
}

// Simple rent input component
function RentInput({ onSubmit }: { onSubmit: (rent: number) => void }) {
  const [rent, setRent] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseInt(rent)
    if (amount > 0) {
      onSubmit(amount)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
        <input
          type="number"
          value={rent}
          onChange={(e) => setRent(e.target.value)}
          placeholder="Monthly rent"
          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={!rent}
        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        Save
      </button>
    </form>
  )
}

