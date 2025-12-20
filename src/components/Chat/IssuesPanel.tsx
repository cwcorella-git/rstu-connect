'use client'

import { useState, useEffect, useMemo } from 'react'
import { EnhancedBuilding } from '@/lib/getBuildingsData'
import { getCurrentProfile } from '@/lib/profileStorage'
import { getProfilesForBuilding } from '@/lib/canvassStorage'
import { COMPLAINT_CATEGORIES } from '@/lib/canvassStorage'
import {
  getBuildingComplaints,
  getBuildingDemands,
  calculateOrganizingStatus,
  getMayDayCountdown,
  canVoteOnBuilding,
  getVotingBlockReason,
  getStatusInfo,
  getEscalationInfo,
  voteOnComplaint,
  supportDemand,
  escalateDemand,
  type BuildingComplaint,
  type BuildingDemand,
  type EscalationLevel,
} from '@/lib/buildingOrganizingStorage'

interface IssuesPanelProps {
  building: EnhancedBuilding
  onClose: () => void
}

export function IssuesPanel({ building, onClose }: IssuesPanelProps) {
  const [complaints, setComplaints] = useState<BuildingComplaint[]>([])
  const [demands, setDemands] = useState<BuildingDemand[]>([])
  const [linkedProfiles, setLinkedProfiles] = useState(0)

  const profile = getCurrentProfile()
  const canVote = canVoteOnBuilding(building.chatSlug)
  const voteBlockReason = getVotingBlockReason(building.chatSlug)

  // Load data
  useEffect(() => {
    refreshData()
  }, [building.chatSlug])

  const refreshData = () => {
    setComplaints(getBuildingComplaints(building.chatSlug))
    setDemands(getBuildingDemands(building.chatSlug))
    const profiles = getProfilesForBuilding(building.chatSlug)
    setLinkedProfiles(profiles.length)
  }

  // Calculate status
  const status = useMemo(() => {
    const hasRecentActivity = complaints.some(c => Date.now() - c.timestamp < 7 * 24 * 60 * 60 * 1000)
    return calculateOrganizingStatus(
      building.chatSlug,
      building.units,
      linkedProfiles,
      hasRecentActivity
    )
  }, [building.chatSlug, building.units, linkedProfiles, complaints])

  const statusInfo = getStatusInfo(status)
  const participationRate = building.units > 0 ? (linkedProfiles / building.units) * 100 : 0
  const targetRate = 65
  const activeComplaints = complaints.filter(c => c.status === 'voting')

  // Vote handlers
  const handleVote = (complaintId: string, voteType: 'up' | 'down') => {
    voteOnComplaint(building.chatSlug, complaintId, voteType)
    refreshData()
  }

  const handleSupportDemand = (demandId: string) => {
    supportDemand(building.chatSlug, demandId)
    refreshData()
  }

  const handleEscalate = (demandId: string, level: EscalationLevel) => {
    escalateDemand(building.chatSlug, demandId, level)
    refreshData()
  }

  const getCategoryLabel = (key: string): string => {
    const cat = COMPLAINT_CATEGORIES.find(c => c.key === key)
    return cat?.label || key
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start p-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Building Issues</h3>
            <p className="text-sm text-gray-500">
              {building.propertyName || building.address.split(',')[0]}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            &times;
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Status & May Day */}
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {getMayDayCountdown()}
            </span>
          </div>

          {/* Participation Progress */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Tenant Participation</span>
              <span className="font-medium">
                {linkedProfiles}/{building.units} ({participationRate.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 relative">
              <div
                className="bg-rstu-red h-2.5 rounded-full transition-all"
                style={{ width: `${Math.min(participationRate, 100)}%` }}
              />
              {/* 65% target marker */}
              <div
                className="absolute top-0 h-2.5 w-0.5 bg-gray-400"
                style={{ left: `${targetRate}%` }}
                title="65% strike-ready target"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">65% = strike-ready</p>
          </div>

          {/* Voting access info */}
          {!canVote && profile && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 flex items-start gap-2">
              <svg className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-xs text-yellow-700">{voteBlockReason}</p>
            </div>
          )}

          {/* Demands Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
              Demands
              <span className="text-xs text-gray-400 font-normal">({demands.length})</span>
            </h4>
            {demands.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                No demands yet. Issues with +5 net votes become demands.
              </p>
            ) : (
              <div className="space-y-2">
                {demands.map(demand => {
                  const escalationInfo = getEscalationInfo(demand.escalationLevel)
                  const supportPct = building.units > 0
                    ? (demand.supportVotes.length / building.units * 100).toFixed(0)
                    : 0
                  const isSupporting = profile && demand.supportVotes.includes(profile.id)

                  return (
                    <div key={demand.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{demand.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${escalationInfo.color} bg-gray-100`}>
                              {escalationInfo.label}
                            </span>
                            <span className="text-xs text-gray-500">{supportPct}% support</span>
                          </div>
                        </div>
                        {canVote && (
                          <button
                            onClick={() => handleSupportDemand(demand.id)}
                            className={`px-2 py-1 text-xs rounded transition ${
                              isSupporting
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {isSupporting ? 'Supporting' : 'Support'}
                          </button>
                        )}
                      </div>
                      {/* Escalation buttons for organizers */}
                      {profile && (profile.role === 'organizer' || profile.role === 'admin') && (
                        <div className="mt-2 pt-2 border-t border-gray-200 flex gap-1">
                          {(['letter', 'petition', 'action', 'strike'] as EscalationLevel[]).map(level => {
                            const info = getEscalationInfo(level)
                            return (
                              <button
                                key={level}
                                onClick={() => handleEscalate(demand.id, level)}
                                className={`px-2 py-0.5 text-xs rounded ${
                                  demand.escalationLevel === level
                                    ? `${info.color} bg-gray-100 font-medium`
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                              >
                                {info.label}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Active Issues Under Vote */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
              Issues Under Vote
              <span className="text-xs text-gray-400 font-normal">({activeComplaints.length})</span>
            </h4>
            {activeComplaints.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                No active issues. Use "Report Issue" to submit one.
              </p>
            ) : (
              <div className="space-y-2">
                {activeComplaints.map(complaint => {
                  const netVotes = complaint.upvotes.length - complaint.downvotes.length
                  const votesToDemand = 5 - netVotes
                  const hasVotedUp = profile && complaint.upvotes.includes(profile.id)
                  const hasVotedDown = profile && complaint.downvotes.includes(profile.id)

                  return (
                    <div key={complaint.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{complaint.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {getCategoryLabel(complaint.category)}
                          </p>
                          {complaint.description && (
                            <p className="text-xs text-gray-600 mt-1">{complaint.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          {canVote ? (
                            <>
                              <button
                                onClick={() => handleVote(complaint.id, 'up')}
                                className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition ${
                                  hasVotedUp
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                <span>+</span>
                                <span>{complaint.upvotes.length}</span>
                              </button>
                              <button
                                onClick={() => handleVote(complaint.id, 'down')}
                                className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition ${
                                  hasVotedDown
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                <span>-</span>
                                <span>{complaint.downvotes.length}</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-500">
                              +{complaint.upvotes.length} / -{complaint.downvotes.length}
                            </span>
                          )}
                        </div>
                        <span className={`text-xs ${netVotes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {netVotes >= 0 ? '+' : ''}{netVotes}
                          {votesToDemand > 0 && (
                            <span className="text-gray-400 ml-1">({votesToDemand} more)</span>
                          )}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <h4 className="text-xs font-medium text-blue-800 mb-1">How Democratic Organizing Works</h4>
            <ol className="text-xs text-blue-700 space-y-0.5 list-decimal list-inside">
              <li>Report issues affecting the building</li>
              <li>All tenants vote on submitted issues</li>
              <li>+5 net votes promotes issue to a demand</li>
              <li>65% tenant support = strike-ready</li>
              <li>Escalate: Letter &rarr; Petition &rarr; Action &rarr; Strike</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
