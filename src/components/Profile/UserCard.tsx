'use client'

import { useState } from 'react'
import {
  type UserRole,
  getActivityStatus,
  getRoleLabel,
  getTrustLabel,
  verifyProfile,
  verifyProfileAsyncWithSync,
  canAccessTools,
  getCurrentProfile,
  banProfile,
  unbanProfile,
} from '@/lib/profileStorage'
import { type SyncedProfile } from '@/lib/profileSync'

interface UserCardProps {
  profile: SyncedProfile
  canChangeRole: boolean
  onChangeRole?: (profileId: string, newRole: UserRole) => void
  isCurrentUser?: boolean
  onVerifySuccess?: () => void
  onDeleteSuccess?: () => void
}

export function UserCard({ profile, canChangeRole, onChangeRole, isCurrentUser, onVerifySuccess, onDeleteSuccess }: UserCardProps) {
  const [isChangingRole, setIsChangingRole] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isBanning, setIsBanning] = useState(false)
  const [showBanConfirm, setShowBanConfirm] = useState(false)
  const [isUnbanning, setIsUnbanning] = useState(false)
  const activityStatus = getActivityStatus(profile)
  const currentUser = getCurrentProfile()
  const canVerify = currentUser && canAccessTools() && profile.trustLevel !== 'verified' && !isCurrentUser

  // Role hierarchy: tenant (0) < organizer (1) < admin (2)
  const roleHierarchy: UserRole[] = ['tenant', 'organizer', 'admin']
  const currentUserRoleIndex = currentUser ? roleHierarchy.indexOf(currentUser.role) : -1
  const targetUserRoleIndex = roleHierarchy.indexOf(profile.role)

  // Can delete if: current user has higher role AND not deleting self
  const canDelete = currentUserRoleIndex > targetUserRoleIndex && !isCurrentUser

  // Can ban if: admin AND target is not admin AND not self AND not already banned
  const canBan = currentUser?.role === 'admin' && profile.role !== 'admin' && !isCurrentUser && !profile.banned

  // Can unban if: admin AND user is banned
  const canUnban = currentUser?.role === 'admin' && profile.banned

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

  // Handle verification
  const handleVerify = async () => {
    if (!currentUser || !canVerify) return
    setIsVerifying(true)
    try {
      const success = await verifyProfileAsyncWithSync(profile.id, currentUser.id)
      if (success) {
        onVerifySuccess?.()
      }
    } catch {
      // Verification failed
    } finally {
      setIsVerifying(false)
    }
  }

  // Handle deletion
  const handleDelete = async () => {
    if (!canDelete) return
    setIsDeleting(true)
    try {
      // Import deleteProfileAsync at top of file to avoid circular dependency
      const { deleteProfileAsync } = await import('@/lib/profileStorage')
      const success = await deleteProfileAsync(profile.id)
      if (success) {
        onDeleteSuccess?.()
      }
    } catch {
      // Delete failed
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Handle banning
  const handleBan = async () => {
    if (!canBan) return
    setIsBanning(true)
    try {
      const success = await banProfile(profile.id)
      if (success) {
        // Trigger a refresh to update the UI
        onDeleteSuccess?.() // Reuse callback to trigger list refresh
      }
    } catch {
      // Ban failed
    } finally {
      setIsBanning(false)
      setShowBanConfirm(false)
    }
  }

  // Handle unbanning
  const handleUnban = async () => {
    if (!canUnban) return
    setIsUnbanning(true)
    try {
      const success = await unbanProfile(profile.id)
      if (success) {
        // Trigger a refresh to update the UI
        onDeleteSuccess?.() // Reuse callback to trigger list refresh
      }
    } catch {
      // Unban failed
    } finally {
      setIsUnbanning(false)
    }
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

            {/* Verify button for organizers/admins */}
            {canVerify && (
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="text-xs text-green-600 hover:text-green-700 disabled:opacity-50 font-medium flex items-center gap-1"
                title="Manually verify this user"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isVerifying ? 'Verifying...' : 'Verify'}
              </button>
            )}

            {/* Delete button for higher-ranked users */}
            {canDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50 font-medium flex items-center gap-1"
                title="Delete this user account"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3H4v2h16V7h-3z" />
                </svg>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}

            {/* Ban button for admins */}
            {canBan && (
              <button
                onClick={() => setShowBanConfirm(true)}
                disabled={isBanning}
                className="text-xs text-red-800 hover:text-red-900 disabled:opacity-50 font-medium flex items-center gap-1"
                title="Ban this user account"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1c-6.338 0-12 4.226-12 10.007 0 2.05.738 4.063 2.047 5.625.055 3.215 1.554 4.629 3.953 5.259 2.159.555 4.573.277 6.064-1.107 1.491 1.384 3.905 1.662 6.064 1.107 2.399-.63 3.898-2.044 3.953-5.259 1.309-1.562 2.047-3.575 2.047-5.625 0-5.781-5.662-10.007-12-10.007zm0 1.5c5.541 0 10.5 3.583 10.5 8.007.0 4.424-4.959 8.007-10.5 8.007-5.541 0-10.5-3.583-10.5-8.007 0-4.424 4.959-8.007 10.5-8.007z" />
                </svg>
                {isBanning ? 'Banning...' : 'Ban'}
              </button>
            )}

            {/* Unban button for admins (shows for banned users) */}
            {canUnban && (
              <button
                onClick={handleUnban}
                disabled={isUnbanning}
                className="text-xs text-green-600 hover:text-green-700 disabled:opacity-50 font-medium flex items-center gap-1"
                title="Restore this user account"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isUnbanning ? 'Unbanning...' : 'Unban'}
              </button>
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

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete User Account?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <strong>{profile.nickname}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban confirmation modal */}
      {showBanConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ban User Account?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to ban <strong>{profile.nickname}</strong>? They will not be able to login or create new accounts.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBanConfirm(false)}
                disabled={isBanning}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                disabled={isBanning}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isBanning ? 'Banning...' : 'Ban'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
