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
  createInvite,
  getMyInviteCodes,
  buildInviteQRUrl,
  type UserProfile,
  type InviteCode,
} from '@/lib/profileStorage'
import { ProfileCreate } from './ProfileCreate'
import { RentComparison } from './RentComparison'
import { AdminPanel } from './AdminPanel'

interface ProfilePageProps {
  buildings: EnhancedBuilding[]
}

export function ProfilePage({ buildings }: ProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false)

  // Load profile on mount
  useEffect(() => {
    const p = getCurrentProfile()
    setProfile(p)
    setLoading(false)

    // Load invite codes if organizer
    if (p && canAccessTools()) {
      setInviteCodes(getMyInviteCodes())
    }
  }, [])

  const handleProfileCreated = (newProfile: UserProfile) => {
    setProfile(newProfile)
    setShowCreate(false)
    if (canAccessTools()) {
      setInviteCodes(getMyInviteCodes())
    }
  }

  const handleLogout = () => {
    if (confirm('Sign out? Your profile data will be deleted from this device.')) {
      clearProfile()
      setProfile(null)
    }
  }

  const handleCreateInvite = () => {
    if (!profile?.buildingId) {
      alert('Please link your profile to a building first')
      return
    }

    const invite = createInvite(profile.buildingId, profile.unitNumber)
    if (invite) {
      setInviteCodes(getMyInviteCodes())
      setShowInviteModal(true)
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

          {/* Organizer Section */}
          {canAccessTools() && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3">Organizer Tools</h3>

              {/* Invite Tenants */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Invite Tenants</div>
                    <div className="text-xs text-gray-500">Create codes to invite neighbors</div>
                  </div>
                  <button
                    onClick={handleCreateInvite}
                    disabled={!profile.buildingId}
                    className="px-3 py-1.5 bg-rstu-red text-white rounded-md text-sm font-medium hover:bg-rstu-red-dark disabled:opacity-50"
                  >
                    Create Invite
                  </button>
                </div>

                {/* Recent Invites */}
                {inviteCodes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-2">Recent Invite Codes</div>
                    <div className="space-y-2">
                      {inviteCodes.slice(0, 3).map((invite) => (
                        <div
                          key={invite.code}
                          className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2"
                        >
                          <code className="font-mono font-medium">{invite.code}</code>
                          <span className={invite.used ? 'text-gray-400' : 'text-green-600'}>
                            {invite.used ? 'Used' : 'Active'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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

      {/* Invite Modal */}
      {showInviteModal && inviteCodes.length > 0 && (
        <InviteModal
          invite={inviteCodes[0]}
          onClose={() => setShowInviteModal(false)}
        />
      )}
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

// Invite modal component
function InviteModal({ invite, onClose }: { invite: InviteCode; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const url = buildInviteQRUrl(invite.code)

  const handleCopy = () => {
    navigator.clipboard.writeText(invite.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-sm w-full p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Invite Created!</h3>
          <p className="text-sm text-gray-500 mb-4">
            Share this code with a tenant to invite them
          </p>

          {/* Code Display */}
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <code className="text-2xl font-mono font-bold tracking-wider">{invite.code}</code>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="w-full py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 mb-3"
          >
            {copied ? 'Copied!' : 'Copy Code'}
          </button>

          {/* Link */}
          <div className="text-xs text-gray-400 break-all mb-4">
            Or share link: {url}
          </div>

          <p className="text-xs text-gray-500 mb-4">
            Expires in 7 days
          </p>

          <button
            onClick={onClose}
            className="w-full py-2 bg-rstu-red text-white rounded-md font-medium hover:bg-rstu-red-dark"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
