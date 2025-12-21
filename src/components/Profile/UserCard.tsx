'use client'

import { useState } from 'react'
import {
  type UserRole,
  getActivityStatus,
  getRoleLabel,
  getTrustLabel,
} from '@/lib/profileStorage'
import { type SyncedProfile } from '@/lib/profileSync'

interface UserCardProps {
  profile: SyncedProfile
  canChangeRole: boolean
  onChangeRole?: (profileId: string, newRole: UserRole) => void
  isCurrentUser?: boolean
}

export function UserCard({ profile, canChangeRole, onChangeRole, isCurrentUser }: UserCardProps) {
  const [isChangingRole, setIsChangingRole] = useState(false)
  const activityStatus = getActivityStatus(profile)

  // Format last active time
  const formatLastActive = (timestamp: number) => {
    if (!timestamp) return 'Never'
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  // Role badge colors
  const roleBadgeColors: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-700',
    organizer: 'bg-blue-100 text-blue-700',
    tenant: 'bg-gray-100 text-gray-700',
  }

  // Activity status colors
  const activityColors = {
    active: 'bg-green-500',
    inactive: 'bg-yellow-500',
    never: 'bg-gray-400',
  }

  // Handle role change
  const handleRoleChange = async (newRole: UserRole) => {
    if (!onChangeRole || newRole === profile.role) return
    setIsChangingRole(true)
    await onChangeRole(profile.id, newRole)
    setIsChangingRole(false)
  }

  return (
    <div className={`p-3 border rounded-lg ${isCurrentUser ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200'}`}>
      <div className="flex items-start gap-3">
        {/* Avatar with online indicator */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
            {profile.nickname.charAt(0).toUpperCase()}
          </div>
          {/* Online indicator */}
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${activityColors[activityStatus]}`}
            title={activityStatus === 'active' ? 'Active' : activityStatus === 'inactive' ? 'Inactive' : 'Never active'}
          />
        </div>

        {/* Profile info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 truncate">
              {profile.nickname}
              {isCurrentUser && <span className="text-xs text-gray-500 ml-1">(you)</span>}
            </span>

            {/* Role badge or selector */}
            {canChangeRole && !isCurrentUser ? (
              <select
                value={profile.role}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                disabled={isChangingRole}
                className={`text-xs px-2 py-0.5 rounded-full border-0 cursor-pointer ${roleBadgeColors[profile.role]} ${isChangingRole ? 'opacity-50' : ''}`}
              >
                <option value="tenant">Tenant</option>
                <option value="organizer">Organizer</option>
                <option value="admin">Admin</option>
              </select>
            ) : (
              <span className={`text-xs px-2 py-0.5 rounded-full ${roleBadgeColors[profile.role]}`}>
                {getRoleLabel(profile.role)}
              </span>
            )}

            {/* Trust level badge */}
            {profile.trustLevel === 'verified' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                Verified
              </span>
            )}
            {profile.trustLevel === 'invited' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                Invited
              </span>
            )}
          </div>

          {/* Building info */}
          {profile.buildingAddress && (
            <p className="text-sm text-gray-600 mt-0.5 truncate">
              {profile.unitNumber && `Unit ${profile.unitNumber}, `}
              {profile.buildingAddress}
            </p>
          )}

          {/* Last active */}
          <p className="text-xs text-gray-400 mt-1" suppressHydrationWarning>
            Active {formatLastActive(profile.lastActive)}
          </p>
        </div>
      </div>
    </div>
  )
}
