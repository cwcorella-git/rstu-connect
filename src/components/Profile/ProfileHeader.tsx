'use client'

import { CheckBadgeIcon } from '@heroicons/react/24/solid'
import type { UserProfile } from '@/lib/profileStorage'
import { getRoleLabel, getTrustLabel, getActivityStatus, canAccessTools, getCurrentProfile, isAdmin, clearProfile } from '@/lib/profileStorage'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import { useRouter } from 'next/navigation'

interface ProfileHeaderProps {
  profile: UserProfile
  selectedBuilding?: EnhancedBuilding
  unreadMessagesCount?: number
  onOpenMessages: () => void
  onOpenEditor: () => void
  onOpenAdmin?: () => void
  onOpenSettings?: () => void
}

export function ProfileHeader({
  profile,
  selectedBuilding,
  unreadMessagesCount = 0,
  onOpenMessages,
  onOpenEditor,
  onOpenAdmin,
  onOpenSettings,
}: ProfileHeaderProps) {
  const router = useRouter()
  const currentUser = getCurrentProfile()
  const isOwnProfile = currentUser?.id === profile.id
  const canViewBuilding = isOwnProfile || canAccessTools()

  const handleSignOut = () => {
    clearProfile()
    router.push('/')
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Top-right action buttons */}
      {isOwnProfile && (
        <div className="flex justify-end gap-2 mb-4">
          {isAdmin() && (
            <button
              onClick={onOpenAdmin}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              title="Admin"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
          )}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-600"
            title="Sign Out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      )}

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
              <CheckBadgeIcon
                className="w-6 h-6 text-green-600"
                title={`Verified by ${profile.verifiedBy ? 'organizer' : 'system'}`}
                aria-label="Verified"
              />
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
            <div className="flex gap-2 mt-3">
              {/* Messages Button */}
              <button
                onClick={onOpenMessages}
                className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                Messages
                {unreadMessagesCount > 0 && (
                  <span className="bg-rstu-red text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>

              {/* Edit Profile Button */}
              <button
                onClick={onOpenEditor}
                className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
