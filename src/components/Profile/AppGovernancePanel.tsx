'use client'

import { useState, useMemo, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  getAppWideProposals,
  getAppWideProposalHistory,
  createAppWideProposal,
  voteOnProposal,
  getWeightedVoteTotals,
  canVoteOnAppWideProposal,
  getWeightedUserVote,
  getProposalTypeLabel,
  APP_WIDE_TYPES,
  VOTE_THRESHOLDS,
  type GovernanceProposal,
  type GovernanceProposalType,
} from '@/lib/governanceStorage'

interface AppGovernancePanelProps {
  profileId: string
}

export function AppGovernancePanel({ profileId }: AppGovernancePanelProps) {
  const { t } = useLanguage()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Get voting eligibility
  const voteEligibility = useMemo(() => canVoteOnAppWideProposal(profileId), [profileId, refreshKey])

  // Get proposals
  const activeProposals = useMemo(() => getAppWideProposals(), [refreshKey])
  const historyProposals = useMemo(() => getAppWideProposalHistory(10), [refreshKey])

  const handleVote = useCallback((proposalId: string, vote: 'up' | 'down') => {
    voteOnProposal(proposalId, vote)
    setRefreshKey(k => k + 1)
  }, [])

  const handleCreateProposal = useCallback((type: GovernanceProposalType, reason: string, targetValue?: string) => {
    // Type assertion for app-wide types
    const appWideType = type as 'feature-vote' | 'content-vote' | 'direction-vote' | 'admin-recall' | 'tab-visibility'
    createAppWideProposal(appWideType, { reason, targetValue })
    setShowCreateForm(false)
    setRefreshKey(k => k + 1)
  }, [])

  return (
    <div className="space-y-4">
      {/* Voting Eligibility Banner */}
      {!voteEligibility.canVote && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-amber-800">Cannot Vote on App Governance</h4>
              <p className="text-sm text-amber-700 mt-1">{voteEligibility.reason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Active Proposals */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <h4 className="text-sm font-semibold text-gray-900">Active Proposals</h4>
            {activeProposals.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                {activeProposals.length}
              </span>
            )}
          </div>
          {voteEligibility.canVote && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="text-xs px-3 py-1.5 bg-rstu-red text-white rounded-md hover:bg-red-700 transition-colors"
            >
              + New Proposal
            </button>
          )}
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <CreateProposalForm
            onSubmit={handleCreateProposal}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {/* Proposals List */}
        <div className="divide-y divide-gray-200">
          {activeProposals.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No active app-wide proposals
            </div>
          ) : (
            activeProposals.map(proposal => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                canVote={voteEligibility.canVote}
                weight={voteEligibility.weight}
                onVote={handleVote}
              />
            ))
          )}
        </div>
      </div>

      {/* Past Proposals */}
      {historyProposals.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
              <h4 className="text-sm font-semibold text-gray-900">Past Proposals</h4>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {historyProposals.map(proposal => (
              <div key={proposal.id} className="px-4 py-3 flex items-center gap-3">
                {proposal.status === 'executed' || proposal.status === 'passed' ? (
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                ) : (
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs">✗</span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{proposal.reason}</p>
                  <p className="text-xs text-gray-500">
                    {getProposalTypeLabel(proposal.type)} • {formatDate(proposal.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How App Governance Works */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">How App Governance Works</h4>
        <ul className="text-xs text-blue-800 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Only qualified delegates can vote on app-wide governance</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Voting weight is based on verified tenants represented</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Admins cannot vote - power flows from tenant representation</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Admin recall requires 2/3 supermajority to pass</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

// Proposal Card Component
interface ProposalCardProps {
  proposal: GovernanceProposal
  canVote: boolean
  weight: number
  onVote: (proposalId: string, vote: 'up' | 'down') => void
}

function ProposalCard({ proposal, canVote, weight, onVote }: ProposalCardProps) {
  const { upvoteWeight, downvoteWeight } = getWeightedVoteTotals(proposal)
  const userVote = getWeightedUserVote(proposal.id)
  const netWeight = upvoteWeight - downvoteWeight
  const threshold = VOTE_THRESHOLDS[proposal.type]
  const isPassing = netWeight >= threshold

  const timeRemaining = getTimeRemaining(proposal.expiresAt)

  return (
    <div className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded mb-1">
            {getProposalTypeLabel(proposal.type)}
          </span>
          <p className="text-sm font-medium text-gray-900">{proposal.reason}</p>
          <p className="text-xs text-gray-500 mt-1">
            Proposed by {proposal.proposedByName} • {timeRemaining}
          </p>
        </div>
      </div>

      {/* Vote Progress */}
      <div className="mt-3 mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className={netWeight >= 0 ? 'text-green-600' : 'text-red-600'}>
            {netWeight >= 0 ? '+' : ''}{netWeight.toFixed(1)} weight
          </span>
          <span className="text-gray-500">
            Need +{threshold} to pass
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 transition-all ${isPassing ? 'bg-green-500' : 'bg-amber-500'}`}
            style={{ width: `${Math.min(100, (netWeight / threshold) * 100)}%` }}
          />
        </div>
      </div>

      {/* Vote Buttons */}
      {canVote && (
        <div className="flex gap-2">
          <button
            onClick={() => onVote(proposal.id, 'up')}
            disabled={userVote.vote === 'up'}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              userVote.vote === 'up'
                ? 'bg-green-100 text-green-700 border-2 border-green-500'
                : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700'
            }`}
          >
            {userVote.vote === 'up' ? `✓ Supported (+${userVote.weight})` : `Support (+${weight})`}
          </button>
          <button
            onClick={() => onVote(proposal.id, 'down')}
            disabled={userVote.vote === 'down'}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              userVote.vote === 'down'
                ? 'bg-red-100 text-red-700 border-2 border-red-500'
                : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700'
            }`}
          >
            {userVote.vote === 'down' ? `✓ Opposed (-${userVote.weight})` : `Oppose (-${weight})`}
          </button>
        </div>
      )}

      {!canVote && (
        <p className="text-xs text-gray-400 italic">
          Become a qualified delegate to vote on app governance
        </p>
      )}
    </div>
  )
}

// Create Proposal Form
interface CreateProposalFormProps {
  onSubmit: (type: GovernanceProposalType, reason: string, targetValue?: string) => void
  onCancel: () => void
}

function CreateProposalForm({ onSubmit, onCancel }: CreateProposalFormProps) {
  const [type, setType] = useState<GovernanceProposalType>('feature-vote')
  const [reason, setReason] = useState('')
  const [targetValue, setTargetValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) return
    onSubmit(type, reason.trim(), targetValue.trim() || undefined)
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-50 border-b border-gray-200">
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Proposal Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as GovernanceProposalType)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rstu-red"
          >
            {APP_WIDE_TYPES.map(t => (
              <option key={t} value={t}>{getProposalTypeLabel(t)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Description / Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe your proposal..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rstu-red"
            required
          />
        </div>

        {(type === 'feature-vote' || type === 'tab-visibility') && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Feature/Tab Name (optional)
            </label>
            <input
              type="text"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="e.g., Dark Mode, Mutual Aid Tab"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rstu-red"
            />
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!reason.trim()}
            className="flex-1 py-2 px-3 text-sm font-medium text-white bg-rstu-red rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Create Proposal
          </button>
        </div>
      </div>
    </form>
  )
}

// Helper functions
function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getTimeRemaining(expiresAt: number): string {
  const remaining = expiresAt - Date.now()
  if (remaining <= 0) return 'Expired'
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
  if (days > 0) return `${days}d left`
  const hours = Math.floor(remaining / (60 * 60 * 1000))
  return `${hours}h left`
}
