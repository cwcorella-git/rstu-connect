'use client'

import { useState, useCallback } from 'react'
import { getSocket } from '@/lib/socketio'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  Election,
  Nomination,
  castRankedVoteAsync,
  hasRankedVotedForPosition,
  getUserRankedVote,
  type RankedVote,
} from '@/lib/electionStorage'

interface RankedChoiceVotingProps {
  election: Election
  nominations: Nomination[]
  profileId: string
  onVoteComplete: (positionId: string) => void
}

interface DragItem {
  nominationId: string
  index: number
}

export function RankedChoiceVoting({
  election,
  nominations,
  profileId,
  onVoteComplete,
}: RankedChoiceVotingProps) {
  const { t } = useLanguage()
  const [rankings, setRankings] = useState<Record<string, string[]>>({})
  const [submittingPosition, setSubmittingPosition] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [votedPositions, setVotedPositions] = useState<Set<string>>(() => {
    // Check which positions user has already voted on
    const voted = new Set<string>()
    election.positions.forEach(pos => {
      if (hasRankedVotedForPosition(election.id, pos.id, profileId)) {
        voted.add(pos.id)
      }
    })
    return voted
  })
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)

  // Initialize rankings for a position if not already set
  const initializeRankings = useCallback((positionId: string, positionNoms: Nomination[]) => {
    if (!rankings[positionId]) {
      setRankings(prev => ({
        ...prev,
        [positionId]: positionNoms.map(n => n.id)
      }))
    }
  }, [rankings])

  const handleDragStart = (e: React.DragEvent, positionId: string, nominationId: string, index: number) => {
    e.dataTransfer.effectAllowed = 'move'
    setDraggedItem({ nominationId, index })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, positionId: string, targetIndex: number) => {
    e.preventDefault()
    if (!draggedItem) return

    const currentRankings = rankings[positionId] || []
    const sourceIndex = draggedItem.index

    if (sourceIndex === targetIndex) return

    // Reorder the array
    const newRankings = [...currentRankings]
    const [removed] = newRankings.splice(sourceIndex, 1)
    newRankings.splice(targetIndex, 0, removed)

    setRankings(prev => ({
      ...prev,
      [positionId]: newRankings
    }))
    setDraggedItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const moveCandidate = (positionId: string, fromIndex: number, direction: 'up' | 'down') => {
    const currentRankings = rankings[positionId] || []
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1

    if (toIndex < 0 || toIndex >= currentRankings.length) return

    const newRankings = [...currentRankings]
    const [removed] = newRankings.splice(fromIndex, 1)
    newRankings.splice(toIndex, 0, removed)

    setRankings(prev => ({
      ...prev,
      [positionId]: newRankings
    }))
  }

  const handleCastVote = async (positionId: string) => {
    const positionRankings = rankings[positionId]
    if (!positionRankings || positionRankings.length === 0) {
      setError('Please rank at least one candidate')
      return
    }

    setSubmittingPosition(positionId)
    setError(null)

    // Cast vote through server-verified async function
    // This does optimistic local update + server verification + rollback on failure
    const result = await castRankedVoteAsync({
      electionId: election.id,
      positionId,
      rankings: positionRankings,
    })

    if (!result.success) {
      setError(result.error || 'Unable to cast vote. You may have already voted.')
      setSubmittingPosition(null)
      return
    }

    // Also sync to Socket.io for real-time updates to other users
    const socket = getSocket()
    if (socket) {
      socket.emit('election:ranked_vote', {
        vote: {
          electionId: election.id,
          positionId,
          voterId: profileId,
          rankings: positionRankings,
        }
      })
    }

    setVotedPositions(prev => new Set([...Array.from(prev), positionId]))
    setSubmittingPosition(null)
    onVoteComplete(positionId)
  }

  const totalPositions = election.positions.length
  const votedCount = votedPositions.size

  return (
    <div className="space-y-6">
      {/* Header with explanation */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100">
        <h3 className="font-semibold text-purple-900 mb-2">Ranked Choice Voting</h3>
        <p className="text-sm text-purple-700">
          Rank candidates in order of preference. Drag to reorder or use the arrows.
          Your first choice gets your vote first. If no one wins a majority, the last-place
          candidate is eliminated and their votes transfer to voters' next choices.
        </p>
      </div>

      {/* Progress */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-800">{t('elections.yourProgress')}</span>
          <span className="text-sm text-blue-600">{votedCount}/{totalPositions} {t('elections.positionsVoted')}</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(votedCount / totalPositions) * 100}%` }}
          />
        </div>
        {votedCount === totalPositions && (
          <p className="mt-2 text-sm text-green-700 font-medium">
            {t('elections.votingComplete')}
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Positions */}
      {election.positions.map(position => {
        const positionNoms = nominations.filter(n => n.positionId === position.id && n.accepted)
        const hasVoted = votedPositions.has(position.id)
        const isSubmitting = submittingPosition === position.id
        const existingVote = getUserRankedVote(election.id, position.id, profileId)

        // Initialize rankings when component loads
        if (!rankings[position.id] && positionNoms.length > 0 && !hasVoted) {
          initializeRankings(position.id, positionNoms)
        }

        const currentRankings = rankings[position.id] || []

        return (
          <div
            key={position.id}
            className={`bg-white rounded-lg border-2 overflow-hidden ${
              hasVoted ? 'border-green-300' : 'border-gray-200'
            }`}
          >
            {/* Position Header */}
            <div className={`px-4 py-3 ${hasVoted ? 'bg-green-50' : 'bg-gray-50'} border-b`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800">{position.title}</h4>
                  <p className="text-sm text-gray-500">{position.description}</p>
                </div>
                {hasVoted && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Vote Cast
                  </span>
                )}
              </div>
            </div>

            <div className="p-4">
              {positionNoms.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-4">
                  {t('elections.noCandidates')}
                </p>
              ) : hasVoted && existingVote ? (
                // Show submitted rankings
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-3">Your ranked preferences:</p>
                  {existingVote.rankings.map((nomId, idx) => {
                    const nom = positionNoms.find(n => n.id === nomId)
                    if (!nom) return null
                    return (
                      <div
                        key={nomId}
                        className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100"
                      >
                        <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{nom.nomineeName}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                // Ranking interface
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-3">
                    Drag to reorder or use arrows. #1 is your top choice.
                  </p>
                  {currentRankings.map((nomId, index) => {
                    const nom = positionNoms.find(n => n.id === nomId)
                    if (!nom) return null

                    const isDragging = draggedItem?.nominationId === nomId

                    return (
                      <div
                        key={nomId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, position.id, nomId, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, position.id, index)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all ${
                          isDragging
                            ? 'opacity-50 border-dashed border-purple-400 bg-purple-50'
                            : index === 0
                              ? 'border-yellow-300 bg-yellow-50'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        {/* Rank Number */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0
                            ? 'bg-yellow-500 text-white'
                            : index === 1
                              ? 'bg-gray-400 text-white'
                              : index === 2
                                ? 'bg-amber-600 text-white'
                                : 'bg-gray-300 text-gray-700'
                        }`}>
                          {index + 1}
                        </div>

                        {/* Drag Handle */}
                        <div className="text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                          </svg>
                        </div>

                        {/* Candidate Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800">{nom.nomineeName}</div>
                          {nom.statement && (
                            <p className="text-sm text-gray-500 truncate">{nom.statement}</p>
                          )}
                        </div>

                        {/* Up/Down Arrows */}
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveCandidate(position.id, index, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveCandidate(position.id, index, 'down')}
                            disabled={index === currentRankings.length - 1}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}

                  {/* Submit Button */}
                  <button
                    onClick={() => handleCastVote(position.id)}
                    disabled={isSubmitting || currentRankings.length === 0}
                    className="mt-4 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      `Submit Ranked Vote for ${position.title}`
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* How RCV Works */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-3">How Ranked Choice Voting Works</h4>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs flex-shrink-0">1</div>
            <p>Your first choice gets your vote initially</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs flex-shrink-0">2</div>
            <p>If someone gets over 50%, they win immediately</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs flex-shrink-0">3</div>
            <p>If no majority, the last-place candidate is eliminated</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs flex-shrink-0">4</div>
            <p>Votes for eliminated candidates transfer to their next ranked choice</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs flex-shrink-0">5</div>
            <p>This repeats until someone has a majority</p>
          </div>
        </div>
      </div>
    </div>
  )
}
