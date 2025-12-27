'use client'

import type { UserProfile } from '@/lib/profileStorage'
import { getRoleLabel, getTrustLabel, getActivityStatus, canAccessTools, getCurrentProfile } from '@/lib/profileStorage'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'

interface ProfileHeaderProps {
  profile: UserProfile
  selectedBuilding?: EnhancedBuilding
  unreadMessagesCount?: number
  onOpenMessages: () => void
  onOpenEditor: () => void
}

export function ProfileHeader({
  profile,
  selectedBuilding,
  unreadMessagesCount = 0,
  onOpenMessages,
  onOpenEditor,
}: ProfileHeaderProps) {
  const currentUser = getCurrentProfile()
  const isOwnProfile = currentUser?.id === profile.id
  const canViewBuilding = isOwnProfile || canAccessTools()

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rstu-red to-red-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {profile.nickname.charAt(0).toUpperCase()}
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          {/* Nickname with Verified Checkmark */}
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">{profile.nickname}</h2>
            {profile.trustLevel === 'verified' && (
              <div
                title={`Verified by ${profile.verifiedBy ? 'organizer' : 'system'}`}
                className="inline-flex"
              >
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-label="Verified"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>

          {/* Role Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                profile.role === 'admin'
                  ? 'bg-purple-100 text-purple-700'
                  : profile.role === 'organizer'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
              }`}
            >
              {getRoleLabel(profile.role)}
            </span>

            {profile.trustLevel && (
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  profile.trustLevel === 'verified'
                    ? 'bg-green-100 text-green-700'
                    : profile.trustLevel === 'invited'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                {getTrustLabel(profile.trustLevel)}
              </span>
            )}

            {(() => {
              const status = getActivityStatus(profile)
              return (
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : status === 'inactive'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {status === 'active' ? 'Active' : status === 'inactive' ? 'Inactive' : 'New'}
                </span>
              )
            })()}
          </div>

          {/* Building Info - Privacy Controlled */}
          {canViewBuilding && selectedBuilding && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm text-gray-600">Building</p>
              <p className="font-medium text-gray-900">{selectedBuilding.address.split(',')[0]}</p>
              {profile.unitNumber && <p className="text-sm text-gray-600">Unit {profile.unitNumber}</p>}
            </div>
          )}

          {/* Action Buttons - Only for Own Profile */}
          {isOwnProfile && (
            <div className="flex gap-3 mt-4">
              {/* Messages Button */}
              <button
                onClick={onOpenMessages}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                Messages
                {unreadMessagesCount > 0 && (
                  <span className="bg-rstu-red text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>

              {/* Edit Profile Button */}
              <button
                onClick={onOpenEditor}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
