'use client'

import { useState, useEffect } from 'react'
import { useDelegateStatus } from '@/hooks/useDelegateStatus'
import {
  getAppWideProposals,
  getAppWideProposalHistory,
  createAppWideProposal,
  voteOnProposal,
  getWeightedVoteTotals,
  getWeightedUserVote,
  canVoteOnAppWideProposal,
  getProposalTypeLabel,
  VOTE_THRESHOLDS,
  type GovernanceProposal,
} from '@/lib/governanceStorage'
import { getCurrentProfile } from '@/lib/profileStorage'

type AppProposalType = 'feature-vote' | 'content-vote' | 'direction-vote' | 'admin-recall' | 'tab-visibility'

export function AppGovernancePanel() {
  const { delegateProfile, isDelegate, delegateWeight, isLoading } = useDelegateStatus()
  const [activeProposals, setActiveProposals] = useState<GovernanceProposal[]>([])
  const [historyProposals, setHistoryProposals] = useState<GovernanceProposal[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // Load proposals
  useEffect(() => {
    const loadProposals = () => {
      setActiveProposals(getAppWideProposals())
      setHistoryProposals(getAppWideProposalHistory())
    }
    loadProposals()
    // Refresh every 30 seconds
    const interval = setInterval(loadProposals, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleVote = (proposalId: string, vote: 'up' | 'down') => {
    const result = voteOnProposal(proposalId, vote)
    if (result) {
      setActiveProposals(getAppWideProposals())
    }
  }

  const handleCreateProposal = (type: AppProposalType, targetValue: string, reason: string) => {
    const result = createAppWideProposal(type, { targetValue, reason })
    if (result) {
      setActiveProposals(getAppWideProposals())
      setShowCreateForm(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 text-gray-500">
        Loading governance panel...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Delegate Status Card */}
      <DelegateStatusCard
        delegateProfile={delegateProfile}
        isDelegate={isDelegate}
        delegateWeight={delegateWeight}
      />

      {/* Create Proposal Button */}
      {isDelegate && (
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {showCreateForm ? 'Cancel' : 'Create App Proposal'}
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {showHistory ? 'Hide History' : 'View History'}
          </button>
        </div>
      )}

      {/* Create Proposal Form */}
      {showCreateForm && (
        <CreateProposalForm onSubmit={handleCreateProposal} onCancel={() => setShowCreateForm(false)} />
      )}

      {/* Active Proposals */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          Active App Proposals ({activeProposals.length})
        </h3>
        {activeProposals.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No active app-wide proposals. {isDelegate ? 'Create one to get started!' : 'Become a delegate to participate.'}
          </p>
        ) : (
          <div className="space-y-4">
            {activeProposals.map(proposal => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onVote={handleVote}
                canVote={isDelegate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Proposal History */}
      {showHistory && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Proposal History ({historyProposals.length})
          </h3>
          {historyProposals.length === 0 ? (
            <p className="text-gray-500 text-sm">No past proposals yet.</p>
          ) : (
            <div className="space-y-4">
              {historyProposals.map(proposal => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onVote={() => {}}
                  canVote={false}
                  isHistory
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Delegate Status Card
function DelegateStatusCard({
  delegateProfile,
  isDelegate,
  delegateWeight,
}: {
  delegateProfile: ReturnType<typeof useDelegateStatus>['delegateProfile']
  isDelegate: boolean
  delegateWeight: number
}) {
  if (!delegateProfile) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border">
        <p className="text-gray-600">Sign in to view your delegate status.</p>
      </div>
    )
  }

  const status = delegateProfile.qualificationStatus

  return (
    <div className={`p-4 rounded-lg border ${isDelegate ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">
          {isDelegate ? 'Delegate Status: Qualified' : 'Delegate Status: Not Yet Qualified'}
        </h3>
        {isDelegate && (
          <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">
            Weight: {delegateWeight.toFixed(1)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Verified Tenants</p>
          <p className={`font-medium ${status?.meetsTenantsThreshold ? 'text-green-600' : 'text-amber-600'}`}>
            {delegateProfile.verifiedTenantsRepresented}
            {!status?.meetsTenantsThreshold && status?.tenantsNeeded && (
              <span className="text-gray-500"> (need {status.tenantsNeeded} more)</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Blocs</p>
          <p className={`font-medium ${status?.meetsBlocsThreshold ? 'text-green-600' : 'text-amber-600'}`}>
            {delegateProfile.blocs.length}
            {!status?.meetsBlocsThreshold && status?.blocsNeeded && (
              <span className="text-gray-500"> (need {status.blocsNeeded} more)</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Activity Score</p>
          <p className={`font-medium ${status?.meetsActivityThreshold ? 'text-green-600' : 'text-amber-600'}`}>
            {delegateProfile.activityScore}
            {!status?.meetsActivityThreshold && status?.activityNeeded && (
              <span className="text-gray-500"> (need {status.activityNeeded} more)</span>
            )}
          </p>
        </div>
      </div>

      {!isDelegate && (
        <p className="mt-3 text-sm text-amber-700">
          Build tenant power to earn delegate status and vote on app decisions.
        </p>
      )}
    </div>
  )
}

// Proposal Card
function ProposalCard({
  proposal,
  onVote,
  canVote,
  isHistory = false,
}: {
  proposal: GovernanceProposal
  onVote: (id: string, vote: 'up' | 'down') => void
  canVote: boolean
  isHistory?: boolean
}) {
  const profile = getCurrentProfile()
  const { vote: userVote, weight: userWeight } = getWeightedUserVote(proposal.id)
  const { upvoteWeight, downvoteWeight, netWeight, voterCount } = getWeightedVoteTotals(proposal)
  const threshold = VOTE_THRESHOLDS[proposal.type]
  const progress = Math.min((netWeight / threshold) * 100, 100)

  const statusColors: Record<string, string> = {
    active: 'bg-blue-100 text-blue-800',
    passed: 'bg-green-100 text-green-800',
    executed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    'pending-finalize': 'bg-amber-100 text-amber-800',
  }

  const voteEligibility = profile ? canVoteOnAppWideProposal(profile.id) : { canVote: false, reason: 'Not signed in', weight: 0 }

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase">
            {getProposalTypeLabel(proposal.type)}
          </span>
          <h4 className="font-medium">{proposal.targetValue || proposal.reason}</h4>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[proposal.status] || 'bg-gray-100'}`}>
          {proposal.status}
        </span>
      </div>

      {/* Reason */}
      {proposal.targetValue && proposal.reason && (
        <p className="text-sm text-gray-600 mb-3">{proposal.reason}</p>
      )}

      {/* Proposer & Time */}
      <p className="text-xs text-gray-500 mb-3">
        Proposed by {proposal.proposedByName} &middot; {formatTimeAgo(proposal.createdAt)}
        {!isHistory && ` &middot; Expires ${formatTimeAgo(proposal.expiresAt)}`}
      </p>

      {/* Vote Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{netWeight.toFixed(1)} / {threshold} weighted votes</span>
          <span>{voterCount} voter{voterCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${netWeight >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${Math.abs(progress)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span className="text-green-600">+{upvoteWeight.toFixed(1)}</span>
          <span className="text-red-600">-{downvoteWeight.toFixed(1)}</span>
        </div>
      </div>

      {/* Voting Buttons */}
      {!isHistory && (
        <div className="flex items-center gap-2">
          {voteEligibility.canVote ? (
            <>
              <button
                onClick={() => onVote(proposal.id, 'up')}
                className={`flex-1 py-2 rounded-lg border transition-colors ${
                  userVote === 'up'
                    ? 'bg-green-100 border-green-300 text-green-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                Upvote {userVote === 'up' && `(${userWeight.toFixed(1)})`}
              </button>
              <button
                onClick={() => onVote(proposal.id, 'down')}
                className={`flex-1 py-2 rounded-lg border transition-colors ${
                  userVote === 'down'
                    ? 'bg-red-100 border-red-300 text-red-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                Downvote {userVote === 'down' && `(${userWeight.toFixed(1)})`}
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">
              {voteEligibility.reason}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// Create Proposal Form
function CreateProposalForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (type: AppProposalType, targetValue: string, reason: string) => void
  onCancel: () => void
}) {
  const [type, setType] = useState<AppProposalType>('feature-vote')
  const [targetValue, setTargetValue] = useState('')
  const [reason, setReason] = useState('')

  const proposalTypes: { value: AppProposalType; label: string; placeholder: string }[] = [
    { value: 'feature-vote', label: 'Feature Vote', placeholder: 'Feature name (e.g., "Dark Mode")' },
    { value: 'content-vote', label: 'Content Vote', placeholder: 'Content to change' },
    { value: 'direction-vote', label: 'Direction Vote', placeholder: 'Strategic direction' },
    { value: 'tab-visibility', label: 'Tab Visibility', placeholder: 'Tab name (e.g., "Tools")' },
    { value: 'admin-recall', label: 'Admin Recall', placeholder: 'Admin nickname' },
  ]

  const selectedType = proposalTypes.find(t => t.value === type)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetValue.trim() || !reason.trim()) return
    onSubmit(type, targetValue.trim(), reason.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg border space-y-4">
      <h4 className="font-semibold">Create App-Wide Proposal</h4>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Proposal Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as AppProposalType)}
          className="w-full px-3 py-2 border rounded-lg"
        >
          {proposalTypes.map(pt => (
            <option key={pt.value} value={pt.value}>{pt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {selectedType?.label} Target
        </label>
        <input
          type="text"
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          placeholder={selectedType?.placeholder}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reason / Description
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why should this pass? What problem does it solve?"
          className="w-full px-3 py-2 border rounded-lg h-24"
          required
        />
      </div>

      {type === 'admin-recall' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <strong>Note:</strong> Admin recall requires 2/3 supermajority and at least 3 voting delegates.
          This is a serious action - please ensure you have valid concerns.
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Submit Proposal
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// Helper function
function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const future = diff < 0

  const absDiff = Math.abs(diff)
  const minutes = Math.floor(absDiff / 60000)
  const hours = Math.floor(absDiff / 3600000)
  const days = Math.floor(absDiff / 86400000)

  if (future) {
    if (days > 0) return `in ${days}d`
    if (hours > 0) return `in ${hours}h`
    return `in ${minutes}m`
  }

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}
