'use client'

import type { UserProfile } from '@/lib/profileStorage'
import { getRoleLabel, getTrustLabel, getActivityStatus, canAccessTools, getCurrentProfile } from '@/lib/profileStorage'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'

interface ProfileHeaderProps {
  profile: UserProfile
  selectedBuilding?: EnhancedBuilding
}

export function ProfileHeader({ profile, selectedBuilding }: ProfileHeaderProps) {
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
          <h2 className="text-2xl font-bold text-gray-900">{profile.nickname}</h2>

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
        </div>
      </div>
    </div>
  )
}
