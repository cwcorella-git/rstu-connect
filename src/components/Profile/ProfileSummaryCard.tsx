'use client'

import { UserProfile } from '@/lib/profileStorage'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'

interface ProfileSummaryCardProps {
  profile: UserProfile | null
  selectedBuilding?: EnhancedBuilding | null
  isCurrentUser?: boolean
}

export function ProfileSummaryCard({ profile, selectedBuilding, isCurrentUser }: ProfileSummaryCardProps) {
  if (!profile) return null

  // Calculate days since last active
  const formatLastActive = (timestamp: number) => {
    if (!timestamp) return 'Never active'
    const diff = Date.now() - timestamp
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  // Calculate average rent for the building
  const buildingAverageRent = selectedBuilding ? (selectedBuilding.value * 0.01) / selectedBuilding.units : null
  const rentDifference = profile.rentAmount && buildingAverageRent
    ? profile.rentAmount - buildingAverageRent
    : null

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Profile header row */}
      <div className="flex items-center gap-3 mb-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-rstu-red/10 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-rstu-red">
            {profile.nickname.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Name and role */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {profile.nickname}
            {isCurrentUser && <span className="text-xs text-gray-500 ml-1">(You)</span>}
          </h3>
          <p className="text-xs text-gray-500">
            {profile.trustLevel === 'verified' && <span className="text-green-600">✓ Verified</span>}
            {profile.trustLevel === 'invited' && <span className="text-yellow-600">Invited</span>}
            {profile.trustLevel === 'self_registered' && <span className="text-gray-500">Self-registered</span>}
          </p>
        </div>
      </div>

      {/* Summary info grid */}
      <div className="grid grid-cols-1 gap-3 text-sm">
        {/* Housing situation */}
        {(profile.buildingAddress || selectedBuilding) && (
          <div className="flex justify-between items-start">
            <span className="text-gray-600">Address:</span>
            <span className="font-medium text-right">
              {profile.buildingAddress || selectedBuilding?.address}
              {profile.unitNumber && ` • Unit ${profile.unitNumber}`}
            </span>
          </div>
        )}

        {/* Rent information */}
        {profile.rentAmount && (
          <div className="flex justify-between items-start">
            <span className="text-gray-600">Rent:</span>
            <span className="font-medium text-right">
              ${profile.rentAmount}/mo
              {buildingAverageRent && (
                <div className="text-xs text-gray-500">
                  {rentDifference ? (
                    <>
                      {rentDifference > 0 ? '+' : ''}{Math.round(rentDifference)} vs avg (${Math.round(buildingAverageRent)})
                    </>
                  ) : null}
                </div>
              )}
            </span>
          </div>
        )}

        {/* Contact availability */}
        {(profile.phone || profile.email) && (
          <div className="flex justify-between items-start">
            <span className="text-gray-600">Contact:</span>
            <span className="font-medium text-right text-xs">
              {profile.phone && <span className="block">📞 Phone</span>}
              {profile.email && <span className="block">📧 Email</span>}
            </span>
          </div>
        )}

        {/* Activity status */}
        <div className="flex justify-between items-start">
          <span className="text-gray-600">Last active:</span>
          <span className="font-medium text-right">{formatLastActive(profile.lastActive)}</span>
        </div>
      </div>
    </div>
  )
}
