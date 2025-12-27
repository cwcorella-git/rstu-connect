'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  BuildingEvent,
  checkProposalStatus,
  voteOnEvent,
  confirmProposedEvent,
  rejectProposedEvent,
  formatEventDateTime,
  PROPOSAL_EXPIRY_DAYS
} from '@/lib/eventStorage'
import { getCurrentProfile } from '@/lib/profileStorage'

export function ProposedEventCard({
  event,
  buildingId,
  onRefresh
}: {
  event: BuildingEvent
  buildingId: string
  onRefresh: () => void
}) {
  const profile = getCurrentProfile()
  const [isVoting, setIsVoting] = useState(false)

  // Get voting status
  const { passed, upvotes, downvotes, threshold, daysRemaining, isExpired } = useMemo(
    () => checkProposalStatus(event),
    [event]
  )

  // Check current user's vote
  const userVote = useMemo(() => {
    if (!profile || !event.votes) return null
    if (event.votes.upvotes.includes(profile.id)) return 'up'
    if (event.votes.downvotes.includes(profile.id)) return 'down'
    return null
  }, [event.votes, profile])

  // Auto-confirm or reject based on threshold/expiry
  useEffect(() => {
    if (passed && event.status === 'proposed') {
      confirmProposedEvent(event.id)
      onRefresh()
    } else if (isExpired && upvotes < threshold && event.status === 'proposed') {
      rejectProposedEvent(event.id)
      onRefresh()
    }
  }, [passed, isExpired, upvotes, threshold, event.id, event.status, onRefresh])

  const handleVote = async (vote: 'up' | 'down') => {
    if (!profile) {
      alert('Please create a profile to vote on event proposals.')
      return
    }

    setIsVoting(true)
    try {
      voteOnEvent(event.id, profile.id, vote)
      onRefresh()
    } finally {
      setIsVoting(false)
    }
  }

  // Don't render if status changed
  if (event.status !== 'proposed') {
    return null
  }

  return (
    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-500 text-white px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
          </svg>
          <span className="text-sm font-semibold">Proposed Event</span>
        </div>
        <span className="text-xs bg-blue-600 px-2 py-0.5 rounded">
          {daysRemaining}d left
        </span>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <h4 className="font-semibold text-gray-900">{event.title}</h4>

        {event.description && (
          <p className="text-sm text-gray-700">{event.description}</p>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{formatEventDateTime(event.dateTime)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          <span>{event.location.isVirtual ? 'Virtual' : event.location.name}</span>
        </div>

        <p className="text-xs text-gray-500 pt-1">
          Proposed by {event.createdByName}
        </p>
      </div>

      {/* Voting UI */}
      <div className="px-3 py-3 bg-white border-t border-blue-200 space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress to confirmation</span>
            <span className="font-medium">
              {upvotes} / {threshold}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (upvotes / threshold) * 100)}%` }}
            />
          </div>
        </div>

        {/* Vote Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 flex-shrink-0">Your vote:</span>
          <button
            onClick={() => handleVote('up')}
            disabled={isVoting}
            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
              userVote === 'up'
                ? 'bg-green-100 text-green-700 border-2 border-green-500'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-green-50'
            } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
            Approve ({upvotes})
          </button>

          <button
            onClick={() => handleVote('down')}
            disabled={isVoting}
            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
              userVote === 'down'
                ? 'bg-red-100 text-red-700 border-2 border-red-500'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-red-50'
            } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
              />
            </svg>
            Reject ({downvotes})
          </button>
        </div>
      </div>
    </div>
  )
}
