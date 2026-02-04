'use client'

import { useState } from 'react'
import { getSocket } from '@/lib/services/socketio'
import { useLanguage } from '@/contexts/LanguageContext'
import { Election, Nomination } from '@/lib/storage/electionStorage'

interface BallotViewProps {
  election: Election
  nominations: Nomination[]
  profileId: string
  votedPositions: string[]
  onVoteComplete: (positionId: string) => void
}

export function BallotView({
  election,
  nominations,
  profileId,
  votedPositions,
  onVoteComplete,
}: BallotViewProps) {
  const { t } = useLanguage()
  const [selectedCandidates, setSelectedCandidates] = useState<Record<string, string>>({})
  const [submittingPosition, setSubmittingPosition] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSelectCandidate = (positionId: string, nominationId: string) => {
    if (votedPositions.includes(positionId)) return
    setSelectedCandidates(prev => ({ ...prev, [positionId]: nominationId }))
    setError(null)
  }

  const handleCastVote = async (positionId: string) => {
    const candidateId = selectedCandidates[positionId]
    if (!candidateId) {
      setError(t('elections.selectCandidate'))
      return
    }

    setSubmittingPosition(positionId)
    setError(null)

    const socket = getSocket()
    if (!socket) {
      setError(t('common.error'))
      setSubmittingPosition(null)
      return
    }

    socket.emit('election:vote', {
      vote: {
        electionId: election.id,
        positionId,
        voterId: profileId,
        candidateId,
      }
    })

    // Wait for response
    const timeout = setTimeout(() => {
      setError(t('common.error'))
      setSubmittingPosition(null)
    }, 5000)

    const handleVoted = () => {
      clearTimeout(timeout)
      setSubmittingPosition(null)
      onVoteComplete(positionId)
    }

    const handleError = ({ message }: { message: string }) => {
      clearTimeout(timeout)
      setError(message)
      setSubmittingPosition(null)
    }

    socket.once('election:voted', handleVoted)
    socket.once('election:error', handleError)
  }

  const totalPositions = election.positions.length
  const votedCount = votedPositions.length

  return (
    <div className="space-y-4">
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
        <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Positions */}
      {election.positions.map(position => {
        const positionNoms = nominations.filter(n => n.positionId === position.id)
        const hasVoted = votedPositions.includes(position.id)
        const selectedCandidate = selectedCandidates[position.id]
        const isSubmitting = submittingPosition === position.id

        return (
          <div
            key={position.id}
            className={`bg-white rounded-lg border p-4 ${
              hasVoted ? 'border-green-200 bg-green-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-800">{position.title}</h4>
              {hasVoted && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {t('elections.voted')}
                </span>
              )}
            </div>

            {positionNoms.length === 0 ? (
              <p className="text-sm text-gray-500 italic">{t('elections.noCandidates')}</p>
            ) : (
              <div className="space-y-2">
                {positionNoms.map(nom => (
                  <label
                    key={nom.id}
                    className={`block p-3 rounded-lg border cursor-pointer transition-colors ${
                      hasVoted
                        ? 'border-gray-200 cursor-default'
                        : selectedCandidate === nom.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name={`position-${position.id}`}
                        value={nom.id}
                        checked={selectedCandidate === nom.id}
                        disabled={hasVoted}
                        onChange={() => handleSelectCandidate(position.id, nom.id)}
                        className="mt-1 w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{nom.nomineeName}</div>
                        {nom.statement && (
                          <p className="text-sm text-gray-600 mt-1">{nom.statement}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {t('elections.nominatedBy')}: {nom.nominatorName}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Vote Button */}
            {!hasVoted && positionNoms.length > 0 && (
              <button
                onClick={() => handleCastVote(position.id)}
                disabled={!selectedCandidate || isSubmitting}
                className="mt-3 w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('common.loading') : t('elections.castVote')}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
