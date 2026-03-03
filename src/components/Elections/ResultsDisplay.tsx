'use client'

import { useState, useEffect } from 'react'
import { getSocket } from '@/lib/services/socketio'
import { useLanguage } from '@/contexts/LanguageContext'
import { Election, ElectionResults, formatElectionDate } from '@/lib/storage/electionStorage'

interface ResultsDisplayProps {
  election: Election
}

export function ResultsDisplay({ election }: ResultsDisplayProps) {
  const { t } = useLanguage()
  const [results, setResults] = useState<ElectionResults | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const handleResults = (res: ElectionResults) => {
      setResults(res)
      setIsLoading(false)
    }

    const handleError = () => {
      setIsLoading(false)
    }

    socket.on('election:results', handleResults)
    socket.on('election:error', handleError)
    socket.emit('election:get_results', { electionId: election.id })

    return () => {
      socket.off('election:results', handleResults)
      socket.off('election:error', handleError)
    }
  }, [election.id])

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        {t('common.loading')}
      </div>
    )
  }

  if (!results) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
        {t('elections.resultsUnavailable')}
      </div>
    )
  }

  const turnoutPercent = results.totalEligibleVoters > 0
    ? ((results.totalVoters / results.totalEligibleVoters) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-medium text-gray-800 mb-3">{t('elections.electionResults')}</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">{t('elections.totalVoters')}</span>
            <p className="font-medium text-gray-800">{results.totalVoters}</p>
          </div>
          <div>
            <span className="text-gray-500">{t('elections.turnout')}</span>
            <p className="font-medium text-gray-800">{turnoutPercent}%</p>
          </div>
          <div>
            <span className="text-gray-500">{t('elections.quorumRequired')}</span>
            <p className="font-medium text-gray-800">{election.quorumPercent}%</p>
          </div>
          <div>
            <span className="text-gray-500">{t('elections.quorumStatus')}</span>
            <p className={`font-medium ${results.quorumMet ? 'text-green-600' : 'text-red-600'}`}>
              {results.quorumMet ? t('elections.quorumMet') : t('elections.quorumNotMet')}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          {t('elections.votingEnded')}: {formatElectionDate(election.votingEnd)}
        </p>
      </div>

      {/* Position Results */}
      {results.positions.map(position => (
        <div key={position.positionId} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-800">{position.positionTitle}</h4>
            <span className="text-xs text-gray-500">{position.totalVotes} {t('elections.votes')}</span>
          </div>

          {position.candidates.length === 0 ? (
            <p className="text-sm text-gray-500 italic">{t('elections.noCandidates')}</p>
          ) : (
            <div className="space-y-3">
              {position.candidates.map((candidate, index) => {
                const isWinner = position.winnerId === candidate.nomineeId
                return (
                  <div key={candidate.nominationId}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {isWinner && (
                          <span className="text-yellow-500">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </span>
                        )}
                        <span className={`font-medium ${isWinner ? 'text-gray-900' : 'text-gray-700'}`}>
                          {index + 1}. {candidate.nomineeName}
                        </span>
                        {isWinner && (
                          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                            {t('elections.winner')}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        {candidate.voteCount} ({candidate.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    {/* Vote bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isWinner ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${Math.min(candidate.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* RCV Elimination Rounds */}
          {position.usedRankedChoice && position.eliminationRounds && position.eliminationRounds.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <button
                onClick={() => {
                  const el = document.getElementById(`rounds-${position.positionId}`)
                  if (el) el.classList.toggle('hidden')
                }}
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Ranked Choice Voting Rounds ({position.eliminationRounds.length})
              </button>
              <div id={`rounds-${position.positionId}`} className="hidden mt-3 space-y-3">
                {position.eliminationRounds.map((round, idx) => (
                  <div key={idx} className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-800">
                        Round {round.roundNumber}
                      </span>
                      {round.eliminatedCandidateName && (
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          Eliminated: {round.eliminatedCandidateName}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {round.candidateTotals.map(ct => (
                        <div key={ct.candidateId} className="flex justify-between text-sm">
                          <span className={ct.candidateId === round.eliminatedCandidateId ? 'text-gray-400 line-through' : 'text-gray-700'}>
                            {ct.candidateName}
                          </span>
                          <span className="text-gray-600">{ct.votes} votes</span>
                        </div>
                      ))}
                    </div>
                    {round.transferred > 0 && (
                      <p className="text-xs text-purple-600 mt-2">
                        {round.transferred} vote{round.transferred !== 1 ? 's' : ''} transferred to next preferences
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Runoff Notice */}
          {position.needsRunoff && (
            <div className="mt-3 bg-yellow-50 text-yellow-800 px-3 py-2 rounded-lg text-sm">
              {t('elections.runoffNeeded')}
            </div>
          )}

          {/* No Winner */}
          {!position.winnerId && !position.needsRunoff && position.totalVotes > 0 && (
            <div className="mt-3 bg-gray-50 text-gray-600 px-3 py-2 rounded-lg text-sm">
              {t('elections.noMajority')}
            </div>
          )}
        </div>
      ))}

      {/* Quorum Not Met Warning */}
      {!results.quorumMet && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h5 className="font-medium text-red-800">{t('elections.quorumNotMetTitle')}</h5>
              <p className="text-sm text-red-700 mt-1">
                {t('elections.quorumNotMetDesc', {
                  required: election.quorumPercent,
                  actual: turnoutPercent
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
