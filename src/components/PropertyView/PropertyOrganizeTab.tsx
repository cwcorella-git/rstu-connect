'use client'

import { useState, useEffect, useCallback } from 'react'
import { EnhancedBuilding } from '@/lib/getBuildingsData'
import { getCurrentProfile } from '@/lib/profileStorage'
import { getProfilesForBuilding } from '@/lib/canvassStorage'
import {
  getBuildingComplaints,
  getBuildingDemands,
  calculateOrganizingStatus,
  getMayDayCountdown,
  canVoteOnBuilding,
  getVotingBlockReason,
} from '@/lib/buildingOrganizingStorage'
import { OrganizingStatusBadge } from '@/components/Organize/OrganizingStatusBadge'
import { OrganizingProgress } from '@/components/Organize/OrganizingProgress'
import { ComplaintForm } from '@/components/Organize/ComplaintForm'
import { ComplaintsList } from '@/components/Organize/ComplaintsList'
import { DemandsList } from '@/components/Organize/DemandsList'

interface PropertyOrganizeTabProps {
  building: EnhancedBuilding
}

export function PropertyOrganizeTab({ building }: PropertyOrganizeTabProps) {
  const [complaints, setComplaints] = useState(getBuildingComplaints(building.chatSlug))
  const [demands, setDemands] = useState(getBuildingDemands(building.chatSlug))
  const [showComplaintForm, setShowComplaintForm] = useState(false)
  const [linkedProfiles, setLinkedProfiles] = useState(0)

  const profile = getCurrentProfile()
  const canVote = canVoteOnBuilding(building.chatSlug)
  const voteBlockReason = getVotingBlockReason(building.chatSlug)

  // Load linked profiles count
  useEffect(() => {
    const profiles = getProfilesForBuilding(building.chatSlug)
    setLinkedProfiles(profiles.length)
  }, [building.chatSlug])

  // Calculate status
  const status = calculateOrganizingStatus(
    building.chatSlug,
    building.units,
    linkedProfiles,
    complaints.some(c => Date.now() - c.timestamp < 7 * 24 * 60 * 60 * 1000)
  )

  // Refresh data
  const refreshData = useCallback(() => {
    setComplaints(getBuildingComplaints(building.chatSlug))
    setDemands(getBuildingDemands(building.chatSlug))
  }, [building.chatSlug])

  const handleComplaintSubmit = () => {
    setShowComplaintForm(false)
    refreshData()
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Header with May Day countdown */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">Building Organizing</h2>
              <p className="text-sm text-gray-600 mt-1">
                {building.propertyName || building.address.split(',')[0]}
              </p>
            </div>
            <OrganizingStatusBadge status={status} />
          </div>

          {/* May Day countdown */}
          <div className="mt-3 pt-3 border-t border-red-100">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-red-700 font-medium">{getMayDayCountdown()}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Coordinated action date for Nevada tenants
            </p>
          </div>
        </div>

        {/* Participation Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">Tenant Participation</h3>
          <OrganizingProgress
            linkedProfiles={linkedProfiles}
            totalUnits={building.units}
          />
        </div>

        {/* Voting Access Info */}
        {!canVote && profile && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm text-yellow-800 font-medium">Limited Access</p>
                <p className="text-xs text-yellow-700 mt-1">{voteBlockReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Not logged in */}
        {!profile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-blue-800 font-medium">Create a Profile</p>
                <p className="text-xs text-blue-700 mt-1">
                  Log in and link your profile to this building to vote on complaints
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Demands Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Demands</h3>
            <span className="text-xs text-gray-500">
              {demands.length} active
            </span>
          </div>
          <DemandsList
            demands={demands}
            buildingId={building.chatSlug}
            totalUnits={building.units}
            onUpdate={refreshData}
          />
        </div>

        {/* Complaints Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Complaints</h3>
            {profile && (
              <button
                onClick={() => setShowComplaintForm(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-rstu-red text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Complaint
              </button>
            )}
          </div>
          <ComplaintsList
            complaints={complaints}
            buildingId={building.chatSlug}
            onUpdate={refreshData}
          />
        </div>

        {/* How It Works */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">How Democratic Organizing Works</h4>
          <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
            <li>Tenants submit complaints about building issues</li>
            <li>All tenants assigned to this building vote on complaints</li>
            <li>Complaints with +5 net votes become official demands</li>
            <li>At 65% tenant support, the building is strike-ready</li>
            <li>Organizers escalate demands: Letter &rarr; Petition &rarr; Action &rarr; Strike</li>
          </ol>
          <p className="text-xs text-gray-400 mt-2 italic">
            Based on Bookchin&apos;s communalist principles: direct democracy, not representation
          </p>
        </div>
      </div>

      {/* Complaint Form Modal */}
      {showComplaintForm && (
        <ComplaintForm
          buildingId={building.chatSlug}
          onSubmit={handleComplaintSubmit}
          onCancel={() => setShowComplaintForm(false)}
        />
      )}
    </div>
  )
}
