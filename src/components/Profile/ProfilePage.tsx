'use client'

import { useState, useEffect } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import {
  getCurrentProfile,
  updateProfile,
  clearProfile,
  getRoleLabel,
  getTrustLabel,
  isAdmin,
  canAccessTools,
  type UserProfile,
} from '@/lib/profileStorage'
import { ProfileCreate } from './ProfileCreate'
import { RentComparison } from './RentComparison'
import { AdminPanel } from './AdminPanel'
import { InviteCodeManager } from './InviteCodeManager'

interface ProfilePageProps {
  buildings: EnhancedBuilding[]
}

export function ProfilePage({ buildings }: ProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  // Load profile on mount
  useEffect(() => {
    const p = getCurrentProfile()
    setProfile(p)
    setLoading(false)
  }, [])

  const handleProfileCreated = (newProfile: UserProfile) => {
    setProfile(newProfile)
    setShowCreate(false)
  }

  const handleLogout = () => {
    if (confirm('Sign out? Your profile data will be deleted from this device.')) {
      clearProfile()
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

  // Show create flow if no profile
  if (!profile || showCreate) {
    return (
      <ProfileCreate
        buildings={buildings}
        onProfileCreated={handleProfileCreated}
        onCancel={profile ? () => setShowCreate(false) : undefined}
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
                <div className="flex items-center gap-2 mt-1">
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
                  onClick={() => setShowCreate(true)}
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
            onClick={() => setShowCreate(true)}
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

