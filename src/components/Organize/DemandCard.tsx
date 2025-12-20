'use client'

import {
  type BuildingDemand,
  supportDemand,
  escalateDemand,
  canVoteOnBuilding,
  getVotingBlockReason,
  getEscalationInfo,
  type EscalationLevel,
} from '@/lib/buildingOrganizingStorage'
import { getCurrentProfile } from '@/lib/profileStorage'

interface DemandCardProps {
  demand: BuildingDemand
  buildingId: string
  totalUnits: number
  onUpdate: () => void
}

const ESCALATION_ORDER: EscalationLevel[] = ['letter', 'petition', 'action', 'strike']

export function DemandCard({ demand, buildingId, totalUnits, onUpdate }: DemandCardProps) {
  const profile = getCurrentProfile()
  const canVote = canVoteOnBuilding(buildingId)
  const voteBlockReason = getVotingBlockReason(buildingId)
  const hasSupported = profile && demand.supportVotes.includes(profile.id)
  const canEscalate = profile && (profile.role === 'organizer' || profile.role === 'admin')

  const supportPercent = totalUnits > 0 ? Math.round((demand.supportVotes.length / totalUnits) * 100) : 0
  const escalationInfo = getEscalationInfo(demand.escalationLevel)

  const currentEscalationIndex = ESCALATION_ORDER.indexOf(demand.escalationLevel)
  const nextEscalation = currentEscalationIndex < ESCALATION_ORDER.length - 1
    ? ESCALATION_ORDER[currentEscalationIndex + 1]
    : null

  const handleSupport = () => {
    if (!canVote) return
    supportDemand(buildingId, demand.id)
    onUpdate()
  }

  const handleEscalate = () => {
    if (!canEscalate || !nextEscalation) return
    escalateDemand(buildingId, demand.id, nextEscalation)
    onUpdate()
  }

  return (
    <div className="bg-white rounded-lg border-2 border-green-200 p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{demand.title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${escalationInfo.color} bg-opacity-10`}
              style={{ backgroundColor: `currentColor`, opacity: 0.1 }}>
            </span>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${escalationInfo.color}`}
              style={{ backgroundColor: escalationInfo.color.replace('text-', 'bg-').replace('700', '100') }}>
              {escalationInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4">{demand.description}</p>

      {/* Support Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{demand.supportVotes.length} supporters</span>
          <span>{supportPercent}% of tenants</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              supportPercent >= 65 ? 'bg-green-500' :
              supportPercent >= 50 ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${Math.min(supportPercent, 100)}%` }}
          />
        </div>
        {supportPercent >= 65 && (
          <p className="text-xs text-green-600 mt-1 font-medium">Supermajority reached!</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        {/* Support button */}
        <button
          onClick={handleSupport}
          disabled={!canVote}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            hasSupported
              ? 'bg-green-100 text-green-700'
              : canVote
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
          title={voteBlockReason || (hasSupported ? 'Click to remove support' : 'Click to support this demand')}
        >
          <svg className="w-4 h-4" fill={hasSupported ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {hasSupported ? 'Supported' : 'Support'}
        </button>

        {/* Escalate button (organizers only) */}
        {canEscalate && nextEscalation && (
          <button
            onClick={handleEscalate}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded text-sm font-medium hover:bg-orange-200"
            title={`Escalate to ${getEscalationInfo(nextEscalation).label}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Escalate
          </button>
        )}
      </div>

      {/* Escalation info */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">{escalationInfo.description}</p>
      </div>
    </div>
  )
}
