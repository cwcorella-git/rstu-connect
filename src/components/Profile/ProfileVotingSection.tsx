'use client'

import { useState, useEffect } from 'react'
import { useDelegateStatus } from '@/hooks/useDelegateStatus'
import { ElectionsDashboard } from '@/components/Elections'
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
import { useLanguage } from '@/contexts/LanguageContext'

type VotingTab = 'elections' | 'governance'
type AppProposalType = 'feature-vote' | 'content-vote' | 'direction-vote' | 'admin-recall' | 'tab-visibility'

interface ProfileVotingSectionProps {
  profileId: string
  profileName: string
}

export function ProfileVotingSection({ profileId, profileName }: ProfileVotingSectionProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<VotingTab>('elections')
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header with Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('elections')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'elections'
                ? 'text-rstu-red border-b-2 border-rstu-red bg-red-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {t('elections.title') || 'Elections'}
          </button>
          <button
            onClick={() => setActiveTab('governance')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'governance'
                ? 'text-rstu-red border-b-2 border-rstu-red bg-red-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {t('governance.appGovernance') || 'App Governance'}
            {isDelegate && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                {delegateWeight.toFixed(0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'elections' ? (
          <ElectionsDashboard profileId={profileId} profileName={profileName} />
        ) : (
          <GovernanceContent
            delegateProfile={delegateProfile}
            isDelegate={isDelegate}
            delegateWeight={delegateWeight}
            isLoading={isLoading}
            activeProposals={activeProposals}
            historyProposals={historyProposals}
            showCreateForm={showCreateForm}
            setShowCreateForm={setShowCreateForm}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
            onVote={handleVote}
            onCreateProposal={handleCreateProposal}
          />
        )}
      </div>
    </div>
  )
}

// Governance Content
function GovernanceContent({
  delegateProfile,
  isDelegate,
  delegateWeight,
  isLoading,
  activeProposals,
  historyProposals,
  showCreateForm,
  setShowCreateForm,
  showHistory,
  setShowHistory,
  onVote,
  onCreateProposal,
}: {
  delegateProfile: ReturnType<typeof useDelegateStatus>['delegateProfile']
  isDelegate: boolean
  delegateWeight: number
  isLoading: boolean
  activeProposals: GovernanceProposal[]
  historyProposals: GovernanceProposal[]
  showCreateForm: boolean
  setShowCreateForm: (show: boolean) => void
  showHistory: boolean
  setShowHistory: (show: boolean) => void
  onVote: (proposalId: string, vote: 'up' | 'down') => void
  onCreateProposal: (type: AppProposalType, targetValue: string, reason: string) => void
}) {
  const { t } = useLanguage()

  if (isLoading) {
    return (
      <div className="py-8 text-center text-gray-500">
        {t('common.loading') || 'Loading...'}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Delegate Status Card */}
      <DelegateStatusCard
        delegateProfile={delegateProfile}
        isDelegate={isDelegate}
        delegateWeight={delegateWeight}
      />

      {/* Create Proposal Button - Only for delegates */}
      {isDelegate && (
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex-1 px-3 py-2 bg-rstu-red text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            {showCreateForm ? (t('common.cancel') || 'Cancel') : (t('governance.createProposal') || 'Create Proposal')}
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            {showHistory ? 'Hide History' : 'History'}
          </button>
        </div>
      )}

      {/* Create Proposal Form */}
      {showCreateForm && (
        <CreateProposalForm onSubmit={onCreateProposal} onCancel={() => setShowCreateForm(false)} />
      )}

      {/* Active Proposals */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          {t('governance.activeProposals') || 'Active Proposals'} ({activeProposals.length})
        </h4>
        {activeProposals.length === 0 ? (
          <div className="py-4 text-center text-gray-500 text-sm bg-gray-50 rounded-lg">
            {isDelegate
              ? 'No active proposals. Create one to get started!'
              : 'No active proposals. Become a delegate to participate.'}
          </div>
        ) : (
          <div className="space-y-3">
            {activeProposals.map(proposal => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onVote={onVote}
                canVote={isDelegate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Proposal History */}
      {showHistory && historyProposals.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            {t('governance.proposalHistory') || 'Proposal History'} ({historyProposals.length})
          </h4>
          <div className="space-y-3">
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
  const { t } = useLanguage()
  const profile = getCurrentProfile()

  if (!delegateProfile) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
        Sign in to view your delegate status.
      </div>
    )
  }

  // Check if admin (Bookchin principle)
  if (profile?.role === 'admin') {
    return (
      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-purple-800">Admin Account</span>
        </div>
        <p className="text-xs text-purple-700">
          {t('governance.bookchinNote') || 'Admins cannot vote on governance (power flows from tenants)'}
        </p>
      </div>
    )
  }

  const status = delegateProfile.qualificationStatus

  return (
    <div className={`p-3 rounded-lg border ${
      isDelegate ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">
          {isDelegate
            ? (t('governance.delegateStatus') || 'Delegate Status') + ': Qualified'
            : (t('governance.qualificationProgress') || 'Qualification Progress')}
        </span>
        {isDelegate && (
          <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
            Weight: {delegateWeight.toFixed(1)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1">
          {status?.meetsTenantsThreshold ? (
            <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          )}
          <span className={status?.meetsTenantsThreshold ? 'text-green-700' : 'text-amber-700'}>
            {delegateProfile.verifiedTenantsRepresented}/10 tenants
          </span>
        </div>
        <div className="flex items-center gap-1">
          {status?.meetsBlocsThreshold ? (
            <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          )}
          <span className={status?.meetsBlocsThreshold ? 'text-green-700' : 'text-amber-700'}>
            {delegateProfile.blocs.length}/1 blocs
          </span>
        </div>
        <div className="flex items-center gap-1">
          {status?.meetsActivityThreshold ? (
            <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          )}
          <span className={status?.meetsActivityThreshold ? 'text-green-700' : 'text-amber-700'}>
            {delegateProfile.activityScore}/50 activity
          </span>
        </div>
      </div>

      {!isDelegate && (
        <p className="mt-2 text-xs text-amber-700">
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
    active: 'bg-blue-100 text-blue-700',
    passed: 'bg-green-100 text-green-700',
    executed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    'pending-finalize': 'bg-amber-100 text-amber-700',
  }

  const typeColors: Record<string, string> = {
    'feature-vote': 'bg-purple-100 text-purple-700',
    'content-vote': 'bg-blue-100 text-blue-700',
    'direction-vote': 'bg-indigo-100 text-indigo-700',
    'tab-visibility': 'bg-teal-100 text-teal-700',
    'admin-recall': 'bg-red-100 text-red-700',
  }

  const voteEligibility = profile ? canVoteOnAppWideProposal(profile.id) : { canVote: false, reason: 'Not signed in', weight: 0 }

  return (
    <div className="p-3 bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${typeColors[proposal.type] || 'bg-gray-100 text-gray-700'}`}>
              {getProposalTypeLabel(proposal.type)}
            </span>
            <span className={`px-1.5 py-0.5 text-xs rounded ${statusColors[proposal.status] || 'bg-gray-100'}`}>
              {proposal.status}
            </span>
          </div>
          <h5 className="text-sm font-medium text-gray-900 truncate">
            {proposal.targetValue || proposal.reason}
          </h5>
        </div>
      </div>

      {/* Reason */}
      {proposal.targetValue && proposal.reason && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{proposal.reason}</p>
      )}

      {/* Meta */}
      <p className="text-xs text-gray-500 mb-2">
        by {proposal.proposedByName} &middot; {formatTimeAgo(proposal.createdAt)}
        {!isHistory && proposal.expiresAt && ` &middot; expires ${formatTimeAgo(proposal.expiresAt)}`}
      </p>

      {/* Vote Progress */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{netWeight.toFixed(1)} / {threshold}</span>
          <span>{voterCount} vote{voterCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${netWeight >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${Math.abs(progress)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-0.5">
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
                className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
                  userVote === 'up'
                    ? 'bg-green-100 border-green-300 text-green-700'
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
              >
                Upvote {userVote === 'up' && `(${userWeight.toFixed(1)})`}
              </button>
              <button
                onClick={() => onVote(proposal.id, 'down')}
                className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
                  userVote === 'down'
                    ? 'bg-red-100 border-red-300 text-red-700'
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
              >
                Downvote {userVote === 'down' && `(${userWeight.toFixed(1)})`}
              </button>
            </>
          ) : (
            <p className="text-xs text-gray-500 italic flex-1">
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
    <form onSubmit={handleSubmit} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">Create App-Wide Proposal</h4>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Proposal Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as AppProposalType)}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rstu-red focus:border-transparent"
        >
          {proposalTypes.map(pt => (
            <option key={pt.value} value={pt.value}>{pt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {selectedType?.label} Target
        </label>
        <input
          type="text"
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          placeholder={selectedType?.placeholder}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rstu-red focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Reason / Description
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why should this pass? What problem does it solve?"
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg h-16 resize-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
          required
        />
      </div>

      {type === 'admin-recall' && (
        <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          <strong>Note:</strong> Admin recall requires 2/3 supermajority and at least 3 voting delegates.
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 px-3 py-1.5 bg-rstu-red text-white text-sm rounded-lg hover:bg-red-700"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-100"
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
