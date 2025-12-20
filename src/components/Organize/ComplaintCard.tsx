'use client'

import { useState } from 'react'
import {
  type BuildingComplaint,
  voteOnComplaint,
  deleteComplaint,
  canVoteOnBuilding,
  getVotingBlockReason,
  COMPLAINT_CATEGORIES,
} from '@/lib/buildingOrganizingStorage'
import { getCurrentProfile } from '@/lib/profileStorage'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

interface ComplaintCardProps {
  complaint: BuildingComplaint
  buildingId: string
  onUpdate: () => void
}

export function ComplaintCard({ complaint, buildingId, onUpdate }: ComplaintCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const profile = getCurrentProfile()

  const canVote = canVoteOnBuilding(buildingId)
  const voteBlockReason = getVotingBlockReason(buildingId)
  const hasUpvoted = profile && complaint.upvotes.includes(profile.id)
  const hasDownvoted = profile && complaint.downvotes.includes(profile.id)
  const netVotes = complaint.upvotes.length - complaint.downvotes.length
  const canDelete = profile && (complaint.submittedBy === profile.id || profile.role === 'admin')

  const categoryLabel = COMPLAINT_CATEGORIES.find(c => c.key === complaint.category)?.label || complaint.category

  const handleVote = (voteType: 'up' | 'down') => {
    if (!canVote) return
    voteOnComplaint(buildingId, complaint.id, voteType)
    onUpdate()
  }

  const handleDelete = () => {
    deleteComplaint(buildingId, complaint.id)
    setShowDeleteConfirm(false)
    onUpdate()
  }

  const statusColors = {
    pending: 'bg-gray-100 text-gray-600',
    voting: 'bg-blue-100 text-blue-700',
    demand: 'bg-green-100 text-green-700',
    resolved: 'bg-purple-100 text-purple-700',
    rejected: 'bg-red-100 text-red-600',
  }

  return (
    <div className={`bg-white rounded-lg border p-4 ${
      complaint.status === 'demand' ? 'border-green-300' :
      complaint.status === 'rejected' ? 'border-red-200 opacity-60' :
      'border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{complaint.title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {categoryLabel}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${statusColors[complaint.status]}`}>
              {complaint.status === 'voting' ? 'Under Vote' : complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Delete button */}
        {canDelete && complaint.status === 'voting' && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1 text-gray-400 hover:text-red-500"
            title="Delete complaint"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3">{complaint.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Submitter info */}
        <div className="text-xs text-gray-400">
          by {complaint.submittedByName} &middot; {new Date(complaint.timestamp).toLocaleDateString()}
        </div>

        {/* Voting */}
        {complaint.status === 'voting' && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleVote('up')}
              disabled={!canVote}
              className={`p-1.5 rounded transition-colors ${
                hasUpvoted
                  ? 'bg-green-100 text-green-600'
                  : canVote
                    ? 'hover:bg-gray-100 text-gray-500'
                    : 'text-gray-300 cursor-not-allowed'
              }`}
              title={voteBlockReason || 'Upvote'}
            >
              <svg className="w-4 h-4" fill={hasUpvoted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>

            <span className={`min-w-[2rem] text-center text-sm font-medium ${
              netVotes > 0 ? 'text-green-600' :
              netVotes < 0 ? 'text-red-600' :
              'text-gray-500'
            }`}>
              {netVotes > 0 ? '+' : ''}{netVotes}
            </span>

            <button
              onClick={() => handleVote('down')}
              disabled={!canVote}
              className={`p-1.5 rounded transition-colors ${
                hasDownvoted
                  ? 'bg-red-100 text-red-600'
                  : canVote
                    ? 'hover:bg-gray-100 text-gray-500'
                    : 'text-gray-300 cursor-not-allowed'
              }`}
              title={voteBlockReason || 'Downvote'}
            >
              <svg className="w-4 h-4" fill={hasDownvoted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Vote progress indicator */}
            {netVotes > 0 && netVotes < 5 && (
              <span className="text-xs text-gray-400 ml-2">
                {5 - netVotes} more to promote
              </span>
            )}
          </div>
        )}

        {/* Promoted badge */}
        {complaint.status === 'demand' && (
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Promoted to Demand
          </span>
        )}
      </div>

      {/* Voter list (transparency) */}
      {complaint.upvotes.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {complaint.upvotes.length} supporter{complaint.upvotes.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Complaint"
        message="Delete this complaint? This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
