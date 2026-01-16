'use client'

import { useState, useEffect } from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import {
  type EscalationCase,
  getActiveCases,
  getLandlordPattern,
  linkCaseToStrike,
} from '@/lib/escalationStorage'
import {
  type StrikePreparation,
  getStrikeForBuilding,
  createStrikeFromEscalations,
  calculateStrikeReadiness,
  linkEscalationToStrike,
  createStrikeProposal,
  syncStrikeVoteStatus,
  getStrikeVoteProgress,
} from '@/lib/strikeStorage'

interface StrikeEscalationPanelProps {
  buildingId: string
  buildingAddress: string
  linkedCases: EscalationCase[]
  onStrikeCreated?: (strikeId: string) => void
}

const stageLabels: Record<StrikePreparation['stage'], string> = {
  'planning': 'Planning',
  'legal-prep': 'Legal Preparation',
  'financial-prep': 'Financial Preparation',
  'defense-prep': 'Defense Preparation',
  'authorized': 'Authorized',
  'active': 'Active Strike',
}

const stageColors: Record<StrikePreparation['stage'], string> = {
  'planning': 'bg-gray-100 text-gray-700',
  'legal-prep': 'bg-blue-100 text-blue-700',
  'financial-prep': 'bg-yellow-100 text-yellow-700',
  'defense-prep': 'bg-orange-100 text-orange-700',
  'authorized': 'bg-green-100 text-green-700',
  'active': 'bg-red-100 text-red-700',
}

export function StrikeEscalationPanel({
  buildingId,
  buildingAddress,
  linkedCases,
  onStrikeCreated,
}: StrikeEscalationPanelProps) {
  const [existingStrike, setExistingStrike] = useState<StrikePreparation | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Load existing strike if any
  useEffect(() => {
    const strike = getStrikeForBuilding(buildingId)
    setExistingStrike(strike)
  }, [buildingId])

  // Get landlord pattern for display
  const landlordPattern = getLandlordPattern(buildingAddress)
  const activeCases = getActiveCases(buildingId)

  // Calculate readiness if strike exists
  const readiness = existingStrike ? calculateStrikeReadiness(existingStrike.id) : null

  const handleBeginStrikePreparation = () => {
    setShowConfirmation(true)
  }

  const handleConfirmStrikePreparation = () => {
    setIsCreating(true)

    // Get current user ID from localStorage
    const profileData = localStorage.getItem('rstu_profile')
    const userId = profileData ? JSON.parse(profileData).odellId || 'anonymous' : 'anonymous'

    // Create strike and link all active cases
    const caseIds = activeCases.map(c => c.id)
    const strike = createStrikeFromEscalations(buildingId, userId, caseIds)

    // Also update each case's strikePreparationId
    for (const caseId of caseIds) {
      linkCaseToStrike(caseId, strike.id)
    }

    setExistingStrike(strike)
    setShowConfirmation(false)
    setIsCreating(false)

    if (onStrikeCreated) {
      onStrikeCreated(strike.id)
    }
  }

  const handleLinkCase = (caseId: string) => {
    if (!existingStrike) return

    linkEscalationToStrike(existingStrike.id, caseId)
    linkCaseToStrike(caseId, existingStrike.id)

    // Reload strike data
    const updated = getStrikeForBuilding(buildingId)
    setExistingStrike(updated)
  }

  // Determine why strike is being suggested
  const getSuggestionReason = (): string => {
    if (activeCases.length >= 3) {
      if (landlordPattern.typicalBehavior === 'hostile') {
        return `Hostile landlord pattern detected with ${activeCases.length} active issues`
      }
      if (landlordPattern.typicalBehavior === 'ignores_until_pressure') {
        return `Landlord ignores issues until pressure applied - ${activeCases.length} cases unresolved`
      }
      return `${activeCases.length} active issues suggest collective action may be needed`
    }
    return 'Multiple unresolved issues detected'
  }

  return (
    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">&#9889;</span>
        <div className="flex-1">
          <h4 className="font-semibold text-red-900">
            {existingStrike ? 'Rent Strike Preparation' : 'Consider Collective Action'}
          </h4>
          <p className="text-sm text-red-700 mt-0.5">
            {existingStrike
              ? `Strike preparation in progress - ${stageLabels[existingStrike.stage]}`
              : getSuggestionReason()
            }
          </p>
        </div>
      </div>

      {/* Existing Strike Progress */}
      {existingStrike && readiness && (
        <div className="mb-4">
          {/* Stage Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2 py-1 rounded-full ${stageColors[existingStrike.stage]}`}>
              {stageLabels[existingStrike.stage]}
            </span>
            <span className="text-xs text-gray-500">
              {existingStrike.linkedEscalationIds.length} linked cases
            </span>
          </div>

          {/* Readiness Progress */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className={`p-2 rounded text-xs ${readiness.legalReady ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {readiness.legalReady ? '✓' : '○'} Legal
            </div>
            <div className={`p-2 rounded text-xs ${readiness.participationReady ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {readiness.participationReady ? '✓' : '○'} Participation (65%)
            </div>
            <div className={`p-2 rounded text-xs ${readiness.demandsReady ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {readiness.demandsReady ? '✓' : '○'} Vote Approved
            </div>
            <div className={`p-2 rounded text-xs ${readiness.defenseReady ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {readiness.defenseReady ? '✓' : '○'} Defense Ready
            </div>
          </div>

          {/* Blockers */}
          {readiness.blockers.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-red-800 mb-1">Next Steps:</p>
              <ul className="text-xs text-red-700 space-y-1">
                {readiness.blockers.slice(0, 3).map((blocker, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span>•</span>
                    <span>{blocker}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Vote Progress - show if proposal exists */}
          {existingStrike.strikeVote.proposalId && (() => {
            const voteProgress = getStrikeVoteProgress(existingStrike.id)
            syncStrikeVoteStatus(existingStrike.id) // Sync status from governance
            return voteProgress ? (
              <div className="mb-3 p-3 bg-white/50 rounded border border-red-100">
                <p className="text-xs font-medium text-red-800 mb-2">Strike Authorization Vote</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all"
                      style={{ width: `${Math.max(0, voteProgress.percentComplete)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-red-700">
                    {voteProgress.netVotes}/{voteProgress.threshold}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="text-green-600">+{voteProgress.upvotes} for</span>
                  <span className="text-red-600">-{voteProgress.downvotes} against</span>
                </div>
                {existingStrike.strikeVote.voteStatus === 'approved' && (
                  <div className="mt-2 p-2 bg-green-100 rounded text-xs text-green-700 font-medium">
                    ✓ Strike Authorized! Ready to set start date.
                  </div>
                )}
                {existingStrike.strikeVote.voteStatus === 'rejected' && (
                  <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700 font-medium">
                    ✗ Vote rejected. Consider addressing tenant concerns.
                  </div>
                )}
              </div>
            ) : null
          })()}

          {/* Call for Vote Button - show when ready but no proposal yet */}
          {readiness.legalReady && readiness.participationReady && readiness.defenseReady && !existingStrike.strikeVote.proposalId && (
            <div className="mb-3">
              <button
                onClick={() => {
                  const proposalId = createStrikeProposal(existingStrike.id)
                  if (proposalId) {
                    // Reload strike data
                    const updated = getStrikeForBuilding(buildingId)
                    setExistingStrike(updated)
                  }
                }}
                className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm flex items-center justify-center gap-2"
              >
                <span>&#128499;</span>
                Call for Strike Authorization Vote
              </button>
              <p className="text-xs text-red-600 text-center mt-1">
                Requires +10 net votes from tenants
              </p>
            </div>
          )}

          {/* Link Unlinked Cases */}
          {activeCases.filter(c => !existingStrike.linkedEscalationIds.includes(c.id)).length > 0 && (
            <div className="border-t border-red-200 pt-3 mt-3">
              <p className="text-xs text-red-700 mb-2">
                {activeCases.filter(c => !existingStrike.linkedEscalationIds.includes(c.id)).length} case(s) not yet linked:
              </p>
              <div className="flex flex-wrap gap-1">
                {activeCases
                  .filter(c => !existingStrike.linkedEscalationIds.includes(c.id))
                  .map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleLinkCase(c.id)}
                      className="text-xs px-2 py-1 bg-white border border-red-300 rounded hover:bg-red-100 text-red-700"
                    >
                      + {c.title.slice(0, 20)}...
                    </button>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pattern Analysis */}
      {!existingStrike && landlordPattern.totalCases > 0 && (
        <div className="mb-4 p-3 bg-white/50 rounded border border-red-100">
          <p className="text-xs font-medium text-red-800 mb-2">Landlord Pattern Analysis</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-600">Ignore Rate:</span>
              <span className="ml-1 font-medium">{Math.round(landlordPattern.ignoreRate * 100)}%</span>
            </div>
            <div>
              <span className="text-gray-600">Response Time:</span>
              <span className="ml-1 font-medium">
                {landlordPattern.avgResponseDays !== null
                  ? `~${landlordPattern.avgResponseDays} days`
                  : 'No data'
                }
              </span>
            </div>
            {landlordPattern.retaliationRate > 0 && (
              <div className="col-span-2">
                <span className="text-red-600 font-medium">
<ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />{Math.round(landlordPattern.retaliationRate * 100)}% retaliation rate
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Cases Summary */}
      {!existingStrike && (
        <div className="mb-4">
          <p className="text-xs font-medium text-red-800 mb-2">
            {activeCases.length} Active Issues Will Be Linked:
          </p>
          <div className="space-y-1">
            {activeCases.slice(0, 5).map(c => (
              <div key={c.id} className="text-xs flex items-center gap-2 text-red-700">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span className="truncate">{c.title}</span>
                <span className="text-red-500">({c.stage})</span>
              </div>
            ))}
            {activeCases.length > 5 && (
              <p className="text-xs text-red-500 italic">
                + {activeCases.length - 5} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!existingStrike && !showConfirmation && (
        <button
          onClick={handleBeginStrikePreparation}
          className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm flex items-center justify-center gap-2"
        >
          <span>&#9889;</span>
          Begin Strike Preparation
        </button>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="border-t border-red-200 pt-4 mt-4">
          <p className="text-sm text-red-800 mb-3">
            This will create a rent strike preparation and link all {activeCases.length} active issues.
            You&apos;ll need to complete the legal checklist, get 65% participation, and win a governance vote before strike authorization.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirmStrikePreparation}
              disabled={isCreating}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Confirm'}
            </button>
            <button
              onClick={() => setShowConfirmation(false)}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* View Strike Details Button */}
      {existingStrike && (
        <div className="mt-3 pt-3 border-t border-red-200">
          <p className="text-xs text-red-600 text-center">
            Full strike preparation toolkit available in the Tools tab
          </p>
        </div>
      )}
    </div>
  )
}
