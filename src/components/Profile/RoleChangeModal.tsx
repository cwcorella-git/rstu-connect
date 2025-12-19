'use client'

import { useState } from 'react'
import { type UserRole, getRoleLabel } from '@/lib/profileStorage'
import { type SyncedProfile } from '@/lib/profileSync'

interface RoleChangeModalProps {
  profile: SyncedProfile
  newRole: UserRole
  onConfirm: (reason?: string) => void
  onCancel: () => void
}

export function RoleChangeModal({ profile, newRole, onConfirm, onCancel }: RoleChangeModalProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Role permissions description
  const rolePermissions: Record<UserRole, string[]> = {
    tenant: [
      'View own profile',
      'Participate in building chats',
      'Access reading library',
    ],
    organizer: [
      'All tenant permissions',
      'Access Tools tab (canvassing)',
      'View all user profiles',
      'Create tenant invite codes',
    ],
    admin: [
      'All organizer permissions',
      'Change user roles',
      'Create organizer/admin invites',
      'View audit log',
    ],
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)
    await onConfirm(reason.trim() || undefined)
    setIsSubmitting(false)
  }

  const isPromotion = (
    (profile.role === 'tenant' && (newRole === 'organizer' || newRole === 'admin')) ||
    (profile.role === 'organizer' && newRole === 'admin')
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {isPromotion ? 'Promote' : 'Change Role for'} {profile.nickname}?
          </h3>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Current → New */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {getRoleLabel(profile.role)}
            </span>
            <span className="text-gray-400">→</span>
            <span className={`text-sm font-medium ${
              newRole === 'admin' ? 'text-purple-700' :
              newRole === 'organizer' ? 'text-blue-700' : 'text-gray-700'
            }`}>
              {getRoleLabel(newRole)}
            </span>
          </div>

          {/* Permissions this grants */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 mb-2">
              {isPromotion ? 'This user will gain:' : 'This user will have:'}
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              {rolePermissions[newRole].map((perm, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {perm}
                </li>
              ))}
            </ul>
          </div>

          {/* Warning for demotion */}
          {!isPromotion && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Demoting this user will remove their access to certain features.
              </p>
            </div>
          )}

          {/* Reason (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Completed organizer training"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 ${
              isPromotion
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {isSubmitting ? 'Changing...' : 'Confirm Change'}
          </button>
        </div>
      </div>
    </div>
  )
}
