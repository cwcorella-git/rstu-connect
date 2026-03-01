'use client'

import { useState, useMemo } from 'react'
import {
  getIncomingCrossGroupRequests,
  dismissBanner,
  isBannerDismissed,
  getProposalTypeLabel,
  type GovernanceProposal,
} from '@/lib/storage/governanceStorage'
import { getLinkedGroups } from '@/lib/storage/linkedPropertiesStorage'

interface CrossGroupBannerProps {
  groupId: string
  currentUsername?: string
  onViewProposal?: (proposal: GovernanceProposal) => void
}

export function CrossGroupBanner({
  groupId,
  currentUsername,
  onViewProposal,
}: CrossGroupBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  const linkedGroups = useMemo(() => getLinkedGroups(), [])

  const incomingRequests = useMemo(() => {
    return getIncomingCrossGroupRequests(groupId).filter(
      p => !isBannerDismissed(p.id) && !dismissedIds.has(p.id)
    )
  }, [groupId, dismissedIds])

  if (incomingRequests.length === 0) {
    return null
  }

  const handleDismiss = (proposalId: string) => {
    dismissBanner(proposalId)
    setDismissedIds(prev => new Set([...Array.from(prev), proposalId]))
  }

  const getSourceGroupName = (proposal: GovernanceProposal): string => {
    const sourceGroup = linkedGroups.find(g => g.id === proposal.groupId)
    return sourceGroup?.name || 'Another group'
  }

  const getActionDescription = (proposal: GovernanceProposal): string => {
    switch (proposal.type) {
      case 'merge':
        return 'wants to merge with your group'
      case 'alliance':
        return 'wants to form an alliance'
      default:
        return 'is requesting coordination'
    }
  }

  return (
    <div className="space-y-2 mb-2">
      {incomingRequests.map(proposal => (
        <div
          key={proposal.id}
          className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3"
        >
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {getProposalTypeLabel(proposal.type)} Request
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              <strong>{getSourceGroupName(proposal)}</strong> {getActionDescription(proposal)}
            </p>
            {proposal.reason && (
              <p className="text-xs text-gray-500 mt-1 italic">
                &quot;{proposal.reason}&quot;
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {onViewProposal && (
                <button
                  onClick={() => onViewProposal(proposal)}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  View & Vote
                </button>
              )}
              <button
                onClick={() => handleDismiss(proposal.id)}
                className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
