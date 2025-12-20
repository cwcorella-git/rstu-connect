'use client'

import { useMemo } from 'react'
import {
  getProposal,
  getUserVote,
  voteOnProposal,
  finalizeProposal,
  canFinalizeProposal,
  getProposalTypeLabel,
  VOTE_THRESHOLDS,
  REQUIRES_FINALIZATION,
  CROSS_GROUP_TYPES,
  type GovernanceProposal,
  type GovernanceProposalType,
} from '@/lib/governanceStorage'
import { getLinkedGroups } from '@/lib/linkedPropertiesStorage'

interface GovernanceVoteCardProps {
  proposalId: string
  // Vote data aggregated from chat messages
  upvotes: Set<string>
  downvotes: Set<string>
  currentUsername?: string
  onVote?: (proposalId: string, vote: 'up' | 'down') => void
}

export function GovernanceVoteCard({
  proposalId,
  upvotes,
  downvotes,
  currentUsername,
  onVote,
}: GovernanceVoteCardProps) {
  const proposal = getProposal(proposalId)
  const userVote = getUserVote(proposalId)
  const canFinalize = canFinalizeProposal()

  const linkedGroups = useMemo(() => getLinkedGroups(), [])

  if (!proposal) {
    return null
  }

  const netVotes = upvotes.size - downvotes.size
  const threshold = VOTE_THRESHOLDS[proposal.type]
  const votesToPass = threshold - netVotes
  const isPassed = netVotes >= threshold
  const isRejected = netVotes <= -3
  const isCrossGroup = CROSS_GROUP_TYPES.includes(proposal.type)
  const requiresFinalization = REQUIRES_FINALIZATION.includes(proposal.type)

  const handleVote = (vote: 'up' | 'down') => {
    if (!currentUsername || !onVote) return
    voteOnProposal(proposalId, vote)
    onVote(proposalId, vote)
  }

  const handleFinalize = () => {
    if (finalizeProposal(proposalId)) {
      // Force refresh
      window.location.reload()
    }
  }

  // Get target info for display
  const getTargetDisplay = (): string => {
    switch (proposal.type) {
      case 'rename':
        return `Change name to "${proposal.targetValue}"`
      case 'add-property':
        return `Add property: ${proposal.targetApn}`
      case 'remove-property':
        return `Remove property: ${proposal.targetApn}`
      case 'merge':
        const mergeTarget = linkedGroups.find(g => g.id === proposal.targetGroupId)
        return `Merge with "${mergeTarget?.name || proposal.targetGroupId}"`
      case 'alliance':
        const allyTarget = linkedGroups.find(g => g.id === proposal.targetGroupId)
        return `Create alliance with "${allyTarget?.name || proposal.targetGroupId}"`
      case 'mute-tenant':
        return `Mute member: ${proposal.targetProfileId}`
      case 'escalate':
        return `Escalate demand: ${proposal.targetValue}`
      case 'split':
        return `Split group: "${proposal.targetValue}"`
      default:
        return proposal.type
    }
  }

  // Status display
  const getStatusBadge = () => {
    if (proposal.status === 'executed') {
      return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Executed</span>
    }
    if (proposal.status === 'rejected') {
      return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Rejected</span>
    }
    if (proposal.status === 'pending-finalize') {
      return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">Awaiting Finalization</span>
    }
    if (proposal.status === 'pending-partner') {
      return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Waiting for Partner Group</span>
    }
    if (isPassed) {
      return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Passed</span>
    }
    if (isRejected) {
      return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Rejected</span>
    }
    return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">Voting</span>
  }

  // Time remaining
  const getTimeRemaining = () => {
    const remaining = proposal.expiresAt - Date.now()
    if (remaining <= 0) return 'Expired'
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} left`
    const hours = Math.floor(remaining / (60 * 60 * 1000))
    return `${hours} hour${hours !== 1 ? 's' : ''} left`
  }

  const isActive = proposal.status === 'active'

  return (
    <div className="rounded-lg shadow-sm p-4 border-2 bg-purple-50 border-purple-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
            GOVERNANCE VOTE
          </span>
          <span className="text-xs text-gray-500">
            {getProposalTypeLabel(proposal.type)}
          </span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Proposal content */}
      <p className="text-gray-900 text-sm font-medium my-2">
        {getTargetDisplay()}
      </p>

      {proposal.reason && (
        <p className="text-gray-600 text-xs mb-2 italic">
          "{proposal.reason}"
        </p>
      )}

      <p className="text-xs text-gray-400 mb-3">
        proposed by {proposal.proposedByName}
      </p>

      {/* Cross-group status for merge/alliance */}
      {isCrossGroup && (
        <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
          <div className="flex justify-between">
            <span>Our group:</span>
            <span className={isPassed ? 'text-green-600 font-medium' : ''}>
              {isPassed ? 'PASSED' : `${netVotes >= 0 ? '+' : ''}${netVotes} (need +${threshold})`}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Partner group:</span>
            <span className={proposal.partnerGroupPassed ? 'text-green-600 font-medium' : 'text-gray-500'}>
              {proposal.partnerGroupPassed ? 'PASSED' : 'Pending'}
            </span>
          </div>
        </div>
      )}

      {/* Vote buttons */}
      <div className="flex items-center gap-3 pt-2 border-t border-purple-200">
        {isActive ? (
          <>
            <button
              onClick={() => handleVote('up')}
              disabled={!currentUsername || !onVote}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition ${
                userVote === 'up'
                  ? 'bg-green-100 text-green-700 font-medium'
                  : 'hover:bg-gray-100 text-gray-600'
              } ${!currentUsername ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={currentUsername ? 'Support this proposal' : 'Set a username to vote'}
            >
              <span>+</span>
              <span>{upvotes.size}</span>
            </button>
            <button
              onClick={() => handleVote('down')}
              disabled={!currentUsername || !onVote}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition ${
                userVote === 'down'
                  ? 'bg-red-100 text-red-700 font-medium'
                  : 'hover:bg-gray-100 text-gray-600'
              } ${!currentUsername ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={currentUsername ? 'Oppose this proposal' : 'Set a username to vote'}
            >
              <span>-</span>
              <span>{downvotes.size}</span>
            </button>
          </>
        ) : (
          <div className="text-sm text-gray-500">
            +{upvotes.size} / -{downvotes.size}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {isActive && (
            <span className={`text-xs ${netVotes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netVotes >= 0 ? '+' : ''}{netVotes}
              {!isPassed && votesToPass > 0 && (
                <span className="text-gray-400 ml-1">({votesToPass} more)</span>
              )}
            </span>
          )}
          <span className="text-xs text-gray-400">
            {getTimeRemaining()}
          </span>
        </div>
      </div>

      {/* Finalization button for pending-finalize */}
      {proposal.status === 'pending-finalize' && canFinalize && (
        <div className="mt-3 pt-3 border-t border-purple-200">
          <button
            onClick={handleFinalize}
            className="w-full px-3 py-2 bg-yellow-500 text-white rounded text-sm font-medium hover:bg-yellow-600"
          >
            Finalize (Organizer Action)
          </button>
          <p className="text-xs text-gray-500 mt-1 text-center">
            This proposal passed but requires organizer approval to execute.
          </p>
        </div>
      )}
    </div>
  )
}
