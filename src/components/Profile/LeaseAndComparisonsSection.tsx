'use client'

import { useState } from 'react'
import type { UserProfile } from '@/lib/profileStorage'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import { canAccessTools, getCurrentProfile } from '@/lib/profileStorage'
import { RentFairnessDashboard } from './RentFairnessDashboard'
import { LeaseTracker } from './LeaseTracker'

interface LeaseAndComparisonsSectionProps {
  profile: UserProfile
  selectedBuilding?: EnhancedBuilding
  onUpdateRent?: (rent: number) => void
  onUpdateProfile?: (updates: { monthlyIncome?: number; unitSqft?: number; bedroomCount?: number }) => void
}

export function LeaseAndComparisonsSection({
  profile,
  selectedBuilding,
  onUpdateRent,
  onUpdateProfile,
}: LeaseAndComparisonsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const currentUser = getCurrentProfile()
  const isOwnProfile = currentUser?.id === profile.id
  const canView = isOwnProfile || canAccessTools()

  if (!canView) return null

  const rentAmount = profile.rentAmount || 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">Lease & Rent Comparisons</h3>
            {!isExpanded && (
              <p className="text-sm text-gray-500">
                Rent: ${rentAmount}/mo • 5 comparisons available
              </p>
            )}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 space-y-4">
          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
            <p className="font-medium">
              Privacy: Visible only to you{canAccessTools() && ' and organizers/admins'}
            </p>
          </div>

          {/* Lease Tracker */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Lease Information</h4>
            <LeaseTracker userRent={profile.rentAmount} onUpdateRent={onUpdateRent} />
          </div>

          {/* Rent Comparisons */}
          {selectedBuilding && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Rent Fairness Analysis</h4>
              <RentFairnessDashboard
                building={selectedBuilding}
                unitNumber={profile.unitNumber}
                userRent={profile.rentAmount}
                monthlyIncome={profile.monthlyIncome}
                unitSqft={profile.unitSqft}
                bedroomCount={profile.bedroomCount}
                onUpdateRent={onUpdateRent}
                onUpdateProfile={onUpdateProfile}
                readOnly={!isOwnProfile}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
