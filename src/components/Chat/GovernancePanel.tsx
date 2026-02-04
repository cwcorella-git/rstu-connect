'use client'

import { useMemo } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  getActiveProposals,
  getGroupProposals,
  getProposalTypeLabel,
  VOTE_THRESHOLDS,
  canFinalizeProposal,
  finalizeProposal,
  type GovernanceProposal,
} from '@/lib/storage/governanceStorage'

interface GovernancePanelProps {
  groupId: string
  groupName: string
  currentUsername?: string
  onClose: () => void
}

export function GovernancePanel({
  groupId,
  groupName,
  currentUsername,
  onClose,
}: GovernancePanelProps) {
  const { t } = useLanguage()
  const canFinalize = canFinalizeProposal()

  const proposals = useMemo(() => {
    return getGroupProposals(groupId)
  }, [groupId])

  const activeProposals = proposals.filter(p => p.status === 'active')
  const pendingFinalizeProposals = proposals.filter(p => p.status === 'pending-finalize')
  const pastProposals = proposals.filter(p =>
    p.status === 'executed' || p.status === 'rejected'
  ).slice(0, 10) // Last 10

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    if (days > 0) return t('common.daysAgo', { count: days })
    const hours = Math.floor(diff / (60 * 60 * 1000))
    if (hours > 0) return t('common.hoursAgo', { count: hours })
    const mins = Math.floor(diff / (60 * 1000))
    return t('common.minutesAgo', { count: mins })
  }

  const getTimeRemaining = (expiresAt: number) => {
    const remaining = expiresAt - Date.now()
    if (remaining <= 0) return t('governance.expired') || 'Expired'
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
    if (days > 0) return t('common.daysLeft', { count: days })
    const hours = Math.floor(remaining / (60 * 60 * 1000))
    return t('common.hoursLeft', { count: hours })
  }

  const getNetVotes = (proposal: GovernanceProposal) => {
    return proposal.upvotes.length - proposal.downvotes.length
  }

  const getProposalSummary = (proposal: GovernanceProposal): string => {
    switch (proposal.type) {
      case 'rename':
        return t('governance.proposalRename', { value: proposal.targetValue || '' })
      case 'add-property':
        return t('governance.proposalAddProperty', { apn: proposal.targetApn || '' })
      case 'remove-property':
        return t('governance.proposalRemoveProperty', { apn: proposal.targetApn || '' })
      case 'merge':
        return t('governance.proposalMerge')
      case 'alliance':
        return t('governance.proposalAlliance')
      case 'mute-tenant':
        return t('governance.proposalMute', { profileId: proposal.targetProfileId || '' })
      case 'escalate':
        return t('governance.proposalEscalate')
      case 'split':
        return t('governance.proposalSplit')
      default:
        return proposal.type
    }
  }

  const handleFinalize = (proposalId: string) => {
    if (finalizeProposal(proposalId)) {
      window.location.reload()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{t('governance.title')}</h3>
            <p className="text-sm text-gray-500">{groupName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            &times;
          </button>
        </div>

        {/* Active Votes */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            {t('governance.activeVotes')}
          </h4>
          {activeProposals.length === 0 ? (
            <p className="text-sm text-gray-400 italic">{t('governance.noActiveVotes')}</p>
          ) : (
            <div className="space-y-3">
              {activeProposals.map(proposal => {
                const netVotes = getNetVotes(proposal)
                const threshold = VOTE_THRESHOLDS[proposal.type]
                const isPassed = netVotes >= threshold

                return (
                  <div key={proposal.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {getProposalSummary(proposal)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {getTimeRemaining(proposal.expiresAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {getProposalTypeLabel(proposal.type)} by {proposal.proposedByName}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${isPassed ? 'text-green-600' : netVotes >= 0 ? 'text-gray-600' : 'text-red-600'}`}>
                        {netVotes >= 0 ? '+' : ''}{netVotes} / +{threshold}
                      </span>
                      {isPassed && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                          {t('governance.passed')}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pending Finalization */}
        {pendingFinalizeProposals.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              {t('governance.pendingFinalization')}
            </h4>
            <div className="space-y-3">
              {pendingFinalizeProposals.map(proposal => {
                const netVotes = getNetVotes(proposal)

                return (
                  <div key={proposal.id} className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {getProposalSummary(proposal)}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                        +{netVotes} {t('governance.passed')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {t('governance.requiresApproval') || 'Requires organizer approval to execute'}
                    </p>
                    {canFinalize ? (
                      <button
                        onClick={() => handleFinalize(proposal.id)}
                        className="w-full px-3 py-1.5 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                      >
                        {t('governance.finalize') || 'Finalize'}
                      </button>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        {t('governance.onlyOrganizersFinalize') || 'Only organizers can finalize this action'}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Past Votes */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            {t('governance.pastVotes')}
          </h4>
          {pastProposals.length === 0 ? (
            <p className="text-sm text-gray-400 italic">{t('governance.noPastVotes')}</p>
          ) : (
            <div className="space-y-2">
              {pastProposals.map(proposal => (
                <div key={proposal.id} className="flex items-center gap-2 text-sm">
                  {proposal.status === 'executed' ? (
                    <span className="text-green-500">✓</span>
                  ) : (
                    <span className="text-red-500">✗</span>
                  )}
                  <span className="text-gray-700 flex-1">
                    {getProposalSummary(proposal)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatTime(proposal.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {t('governance.votingInfo')}
          </p>
        </div>
      </div>
    </div>
  )
}
