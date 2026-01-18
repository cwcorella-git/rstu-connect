'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSocket } from '@/lib/socketio'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  Election,
  Nomination,
  getElectionPhase,
  formatElectionDate,
  getTimeRemaining,
} from '@/lib/electionStorage'
import { NominationForm } from './NominationForm'
import { RankedChoiceVoting } from './RankedChoiceVoting'
import { ResultsDisplay } from './ResultsDisplay'

interface ElectionsDashboardProps {
  profileId: string
  profileName: string
}

export function ElectionsDashboard({ profileId, profileName }: ElectionsDashboardProps) {
  const { t } = useLanguage()
  const [election, setElection] = useState<Election | null>(null)
  const [nominations, setNominations] = useState<Nomination[]>([])
  const [myVotes, setMyVotes] = useState<string[]>([]) // position IDs voted for
  const [pendingNomination, setPendingNomination] = useState<Nomination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showNominationForm, setShowNominationForm] = useState(false)

  // Fetch active election and nominations
  useEffect(() => {
    const socket = getSocket()
    let responded = false

    // Timeout fallback if socket is unavailable or server doesn't respond
    const timeoutId = setTimeout(() => {
      if (!responded) {
        setIsLoading(false)
        // Election stays null, which shows "no active election" state
      }
    }, 5000)

    if (!socket) {
      // No socket available - stop loading immediately
      setIsLoading(false)
      return () => clearTimeout(timeoutId)
    }

    const handleActiveElection = ({ election: e }: { election: Election | null }) => {
      responded = true
      clearTimeout(timeoutId)
      setElection(e)
      setIsLoading(false)
      if (e) {
        socket.emit('election:get_nominations', { electionId: e.id })
        socket.emit('election:get_my_votes', { electionId: e.id, profileId })
      }
    }

    const handleNominations = ({ nominations: noms }: { nominations: Nomination[] }) => {
      setNominations(noms)
      // Check for pending nomination for this user
      const pending = noms.find(n => n.nomineeId === profileId && n.accepted === null)
      setPendingNomination(pending || null)
    }

    const handleMyVotes = ({ votes }: { votes: { positionId: string }[] }) => {
      setMyVotes(votes.map(v => v.positionId))
    }

    const handleNominationAdded = ({ nomination }: { nomination: Nomination }) => {
      setNominations(prev => [...prev, nomination])
      if (nomination.nomineeId === profileId && nomination.accepted === null) {
        setPendingNomination(nomination)
      }
    }

    const handleNominationUpdated = ({ nomination }: { nomination: Nomination }) => {
      setNominations(prev => prev.map(n => n.id === nomination.id ? nomination : n))
      if (nomination.nomineeId === profileId) {
        setPendingNomination(nomination.accepted === null ? nomination : null)
      }
    }

    socket.on('election:active', handleActiveElection)
    socket.on('election:nominations', handleNominations)
    socket.on('election:my_votes', handleMyVotes)
    socket.on('election:nomination_added', handleNominationAdded)
    socket.on('election:nomination_updated', handleNominationUpdated)

    socket.emit('election:get_active')

    return () => {
      clearTimeout(timeoutId)
      socket.off('election:active', handleActiveElection)
      socket.off('election:nominations', handleNominations)
      socket.off('election:my_votes', handleMyVotes)
      socket.off('election:nomination_added', handleNominationAdded)
      socket.off('election:nomination_updated', handleNominationUpdated)
    }
  }, [profileId])

  const handleRespondToNomination = useCallback((accepted: boolean) => {
    if (!pendingNomination) return

    const socket = getSocket()
    if (socket) {
      socket.emit('election:accept_nomination', {
        nominationId: pendingNomination.id,
        accepted,
        profileId,
      })
    }
  }, [pendingNomination, profileId])

  const handleVoteComplete = useCallback((positionId: string) => {
    setMyVotes(prev => [...prev, positionId])
  }, [])

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        {t('common.loading')}
      </div>
    )
  }

  if (!election) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-1">
          {t('elections.noActive')}
        </h3>
        <p className="text-sm text-gray-500">
          {t('elections.noActiveDesc')}
        </p>
      </div>
    )
  }

  const phase = getElectionPhase(election)
  const acceptedNominations = nominations.filter(n => n.accepted === true)

  return (
    <div className="space-y-4">
      {/* Election Header */}
      <div className="bg-red-50 rounded-lg p-4 border border-red-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-red-800">{election.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            phase === 'nominations' ? 'bg-yellow-100 text-yellow-800' :
            phase === 'voting' ? 'bg-green-100 text-green-800' :
            phase === 'closed' ? 'bg-gray-100 text-gray-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {phase === 'nominations' ? t('elections.nominationsOpen') :
             phase === 'voting' ? t('elections.votingOpen') :
             phase === 'closed' ? t('elections.closed') :
             t('elections.upcoming')}
          </span>
        </div>
        <div className="text-sm text-red-700">
          {phase === 'nominations' && (
            <p>{t('elections.nominationsEnd')}: {formatElectionDate(election.nominationEnd)} ({getTimeRemaining(election.nominationEnd)})</p>
          )}
          {phase === 'voting' && (
            <p>{t('elections.votingEnds')}: {formatElectionDate(election.votingEnd)} ({getTimeRemaining(election.votingEnd)})</p>
          )}
          {phase === 'upcoming' && (
            <p>{t('elections.startsOn')}: {formatElectionDate(election.nominationStart)}</p>
          )}
        </div>
      </div>

      {/* Pending Nomination Response */}
      {pendingNomination && (
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-2">{t('elections.youveBeenNominated')}</h4>
          <p className="text-sm text-yellow-700 mb-3">
            {t('elections.nominatedFor', { position: election.positions.find(p => p.id === pendingNomination.positionId)?.title || '' })}
            {' '}{t('elections.by')} {pendingNomination.nominatorName}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleRespondToNomination(true)}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
            >
              {t('elections.accept')}
            </button>
            <button
              onClick={() => handleRespondToNomination(false)}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300"
            >
              {t('elections.decline')}
            </button>
          </div>
        </div>
      )}

      {/* Nominations Phase */}
      {phase === 'nominations' && (
        <div className="space-y-4">
          {/* Current Candidates */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="font-medium text-gray-800 mb-3">{t('elections.currentCandidates')}</h4>
            {election.positions.map(position => {
              const positionNoms = acceptedNominations.filter(n => n.positionId === position.id)
              return (
                <div key={position.id} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-700">{position.title}</h5>
                    <span className="text-xs text-gray-500">{positionNoms.length} {t('elections.candidates')}</span>
                  </div>
                  {positionNoms.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">{t('elections.noCandidates')}</p>
                  ) : (
                    <ul className="space-y-1">
                      {positionNoms.map(nom => (
                        <li key={nom.id} className="text-sm text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                          {nom.nomineeName}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>

          {/* Nominate Button */}
          <button
            onClick={() => setShowNominationForm(true)}
            className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700"
          >
            {t('elections.nominateSomeone')}
          </button>

          {/* Nomination Form Modal */}
          {showNominationForm && (
            <NominationForm
              election={election}
              profileId={profileId}
              profileName={profileName}
              existingNominations={nominations}
              onClose={() => setShowNominationForm(false)}
            />
          )}
        </div>
      )}

      {/* Voting Phase - Ranked Choice */}
      {phase === 'voting' && (
        <RankedChoiceVoting
          election={election}
          nominations={acceptedNominations}
          profileId={profileId}
          onVoteComplete={handleVoteComplete}
        />
      )}

      {/* Results Phase */}
      {phase === 'closed' && (
        <ResultsDisplay election={election} />
      )}
    </div>
  )
}
