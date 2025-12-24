'use client'

import { useState, useEffect } from 'react'
import { getProfilesForBuilding, getBuildingStats } from '@/lib/canvassStorage'
import {
  getBuildingComplaints,
  getBuildingDemands,
  calculateOrganizingStatus,
  getMayDayCountdown,
  getStatusInfo,
  type OrganizingStatus,
} from '@/lib/buildingOrganizingStorage'

interface BuildingOrganizingStatusProps {
  buildingId: string
  buildingName: string
  totalUnits: number
  onViewBuilding?: () => void
}

export function BuildingOrganizingStatus({
  buildingId,
  buildingName,
  totalUnits,
  onViewBuilding,
}: BuildingOrganizingStatusProps) {
  const [linkedProfiles, setLinkedProfiles] = useState(0)
  const [activeIssues, setActiveIssues] = useState(0)
  const [demandsCount, setDemandsCount] = useState(0)
  const [status, setStatus] = useState<OrganizingStatus>('inactive')
  const [canvassStats, setCanvassStats] = useState<{
    total: number
    contacted: number
    interested: number
    activeMembers: number
    followUp: number
  }>({ total: 0, contacted: 0, interested: 0, activeMembers: 0, followUp: 0 })

  // Load data
  useEffect(() => {
    const profiles = getProfilesForBuilding(buildingId)
    setLinkedProfiles(profiles.length)

    const complaints = getBuildingComplaints(buildingId)
    const demands = getBuildingDemands(buildingId)
    setActiveIssues(complaints.filter(c => c.status === 'voting').length)
    setDemandsCount(demands.length)

    // Get canvassing stats
    const stats = getBuildingStats(buildingId)
    setCanvassStats(stats)

    // Calculate status (uses Date.now() so must be in useEffect)
    const hasRecentActivity = complaints.some(c => Date.now() - c.timestamp < 7 * 24 * 60 * 60 * 1000)
    setStatus(calculateOrganizingStatus(
      buildingId,
      totalUnits,
      profiles.length,
      hasRecentActivity
    ))
  }, [buildingId, totalUnits])

  const statusInfo = getStatusInfo(status)
  const participationRate = totalUnits > 0 ? (linkedProfiles / totalUnits) * 100 : 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">Building Organizing</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* May Day Countdown */}
      <div className="flex items-center gap-2 text-sm mb-4">
        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-gray-700">{getMayDayCountdown()}</span>
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Participation</span>
          <span className="font-medium">
            {linkedProfiles}/{totalUnits} tenants ({participationRate.toFixed(0)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 relative">
          <div
            className="bg-rstu-red h-2 rounded-full transition-all"
            style={{ width: `${Math.min(participationRate, 100)}%` }}
          />
          {/* 65% target marker */}
          <div
            className="absolute top-0 h-2 w-0.5 bg-gray-400"
            style={{ left: '65%' }}
            title="65% strike-ready target"
          />
        </div>
        <p className="text-xs text-gray-400">65% = strike-ready</p>

        {/* Canvassing Coverage */}
        {canvassStats.total > 0 && (
          <>
            <div className="flex justify-between text-sm mt-3">
              <span className="text-gray-600">Canvassing</span>
              <span className="font-medium">
                {canvassStats.contacted}/{canvassStats.total} units ({((canvassStats.contacted / canvassStats.total) * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min((canvassStats.contacted / canvassStats.total) * 100, 100)}%` }}
              />
            </div>
            <div className="flex gap-3 text-xs text-gray-500">
              {canvassStats.interested > 0 && (
                <span className="text-green-600">{canvassStats.interested} interested</span>
              )}
              {canvassStats.activeMembers > 0 && (
                <span className="text-purple-600">{canvassStats.activeMembers} active</span>
              )}
              {canvassStats.followUp > 0 && (
                <span className="text-orange-600">{canvassStats.followUp} follow-up</span>
              )}
            </div>
          </>
        )}

        <div className="flex justify-between text-sm mt-3">
          <span className="text-gray-600">Active Issues</span>
          <span className="font-medium">{activeIssues} under vote</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Demands</span>
          <span className="font-medium">{demandsCount} approved</span>
        </div>
      </div>

      {/* View Building Button */}
      {onViewBuilding && (
        <button
          onClick={onViewBuilding}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium transition"
        >
          View Building Chat
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}
