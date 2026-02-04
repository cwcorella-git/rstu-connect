'use client'

import { useEffect, useState } from 'react'
import { getActiveProposals, voteOnProposal, VOTE_THRESHOLDS } from '@/lib/storage/governanceStorage'
import { getCurrentProfile } from '@/lib/storage/profileStorage'
import type { GovernanceProposal } from '@/lib/storage/governanceStorage'

interface AssociationFormationProposalBannerProps {
  buildingApn: string
  chatSlug: string
  onProposalStatusChange?: () => void
}

export function AssociationFormationProposalBanner({
  buildingApn,
  chatSlug,
  onProposalStatusChange
}: AssociationFormationProposalBannerProps) {
  const [proposals, setProposals] = useState<GovernanceProposal[]>([])
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down' | null>>({})

  useEffect(() => {
    // Get all form-association proposals where this building is involved
    const allProposals = getActiveProposals(chatSlug)
    const formBlocProposals = allProposals.filter(
      p => p.type === 'form-bloc' && p.targetApns?.includes(buildingApn)
    )
    setProposals(formBlocProposals)

    // Check user's votes
    const profile = getCurrentProfile()
    if (profile) {
      const votes: Record<string, 'up' | 'down' | null> = {}
      formBlocProposals.forEach(p => {
        if (p.upvotes.includes(profile.id)) {
          votes[p.id] = 'up'
        } else if (p.downvotes.includes(profile.id)) {
          votes[p.id] = 'down'
        } else {
          votes[p.id] = null
        }
      })
      setUserVotes(votes)
    }
  }, [buildingApn, chatSlug])

  const handleVote = (proposalId: string, vote: 'up' | 'down') => {
    const profile = getCurrentProfile()
    if (!profile) return

    voteOnProposal(proposalId, vote)
    setUserVotes(prev => ({ ...prev, [proposalId]: vote }))
    onProposalStatusChange?.()

    // Refresh proposals after voting
    const allProposals = getActiveProposals(chatSlug)
    const formBlocProposals = allProposals.filter(
      p => p.type === 'form-bloc' && p.targetApns?.includes(buildingApn)
    )
    setProposals(formBlocProposals)
  }

  if (proposals.length === 0) return null

  const votesNeeded = VOTE_THRESHOLDS['form-bloc'] || 3

  return (
    <div className="space-y-3 mb-4">
      {proposals.map(proposal => {
        const netVotes = proposal.upvotes.length - proposal.downvotes.length
        const hasReachedThreshold = netVotes >= votesNeeded
        const userVote = userVotes[proposal.id]

        return (
          <div
            key={proposal.id}
            className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded"
          >
            <div className="flex gap-3">
              {/* Status icon */}
              <div className="flex-shrink-0 pt-1">
                {hasReachedThreshold ? (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 8a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-blue-900 text-sm">
                  association formation Proposal
                  {hasReachedThreshold && (
                    <span className="ml-2 inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      Approved
                    </span>
                  )}
                </h3>

                <p className="text-sm text-blue-800 mt-1">
                  Proposal to form: <strong>{proposal.targetValue || 'Unnamed Bloc'}</strong>
                </p>

                {proposal.targetApns && proposal.targetApns.length > 1 && (
                  <p className="text-xs text-blue-700 mt-1">
                    {proposal.targetApns.length} buildings involved
                  </p>
                )}

                {proposal.reason && (
                  <p className="text-xs text-blue-700 mt-1 italic">
                    {proposal.reason}
                  </p>
                )}

                {/* Vote display */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm">
                    <span className="font-semibold text-blue-900">
                      {proposal.upvotes.length}
                    </span>
                    <span className="text-blue-700">for</span>
                    <span className="text-xs text-blue-600 font-medium">
                      (need {votesNeeded})
                    </span>
                  </div>
                  <div className="text-blue-400">·</div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="font-semibold text-blue-900">
                      {proposal.downvotes.length}
                    </span>
                    <span className="text-blue-700">against</span>
                  </div>
                </div>

                {/* Voting buttons */}
                {!hasReachedThreshold && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleVote(proposal.id, 'up')}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        userVote === 'up'
                          ? 'bg-green-500 text-white'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleVote(proposal.id, 'down')}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        userVote === 'down'
                          ? 'bg-red-500 text-white'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      ✗ Reject
                    </button>
                  </div>
                )}

                {hasReachedThreshold && (
                  <div className="mt-3 text-xs text-green-700 font-medium">
                    ✓ This building has approved the association formation. Waiting for other buildings to vote...
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )
}
