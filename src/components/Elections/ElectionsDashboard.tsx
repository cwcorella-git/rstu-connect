'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSocket } from '@/lib/services/socketio'
import { useLanguage } from '@/contexts/LanguageContext'
import { useOfflineMode } from '@/hooks/useOfflineMode'
import { getStoredProfiles } from '@/lib/storage/profileStorage'
import {
  Election,
  ElectionPosition,
  Nomination,
  OfficerPosition,
  getElectionPhase,
  formatElectionDate,
  getTimeRemaining,
  getOfficerPositions,
  createNominationAsync,
  assignElectionWinners,
} from '@/lib/storage/electionStorage'
import { RankedChoiceVoting } from './RankedChoiceVoting'
import { ResultsDisplay } from './ResultsDisplay'

interface ElectionsDashboardProps {
  profileId: string
  profileName: string
  isAdmin?: boolean
}

// Constants
const RESULTS_DISPLAY_DAYS = 7

export function ElectionsDashboard({ profileId, profileName, isAdmin = false }: ElectionsDashboardProps) {
  const { t } = useLanguage()
  const { isReadOnly, checkAction } = useOfflineMode()

  // Election state
  const [election, setElection] = useState<Election | null>(null)
  const [allElections, setAllElections] = useState<Election[]>([])
  const [nominations, setNominations] = useState<Nomination[]>([])
  const [myVotes, setMyVotes] = useState<string[]>([])
  const [pendingNomination, setPendingNomination] = useState<Nomination | null>(null)
  const [officers, setOfficers] = useState<OfficerPosition[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // UI state
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showPastElections, setShowPastElections] = useState(false)
  const [nominatingForPosition, setNominatingForPosition] = useState<string | null>(null)

  // Load current officer positions
  useEffect(() => {
    setOfficers(getOfficerPositions())
  }, [])

  // Fetch active election and nominations
  useEffect(() => {
    const socket = getSocket()
    let responded = false

    const timeoutId = setTimeout(() => {
      if (!responded) {
        setIsLoading(false)
      }
    }, 5000)

    if (!socket) {
      setIsLoading(false)
      return () => clearTimeout(timeoutId)
    }

    const handleActiveElection = ({ election: e }: { election: Election | null }) => {
      responded = true
      clearTimeout(timeoutId)

      // Check if results should auto-hide (>7 days after voting ended)
      if (e && getElectionPhase(e) === 'closed') {
        const daysSinceClosed = (Date.now() - e.votingEnd) / (1000 * 60 * 60 * 24)
        if (daysSinceClosed > RESULTS_DISPLAY_DAYS) {
          setElection(null) // Hide old results
          setIsLoading(false)
          return
        }
      }

      setElection(e)
      setIsLoading(false)
      if (e) {
        socket.emit('election:get_nominations', { electionId: e.id })
        socket.emit('election:get_my_votes', { electionId: e.id, profileId })
      }
    }

    const handleAllElections = ({ elections }: { elections: Election[] }) => {
      setAllElections(elections)
    }

    const handleNominations = ({ nominations: noms }: { nominations: Nomination[] }) => {
      setNominations(noms)
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

    const handleElectionUpdated = ({ election: e }: { election: Election }) => {
      if (e.id === election?.id) {
        setElection(e)
      }
      setAllElections(prev => {
        const idx = prev.findIndex(el => el.id === e.id)
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = e
          return updated
        }
        return [e, ...prev]
      })
    }

    socket.on('election:active', handleActiveElection)
    socket.on('election:all', handleAllElections)
    socket.on('election:nominations', handleNominations)
    socket.on('election:my_votes', handleMyVotes)
    socket.on('election:nomination_added', handleNominationAdded)
    socket.on('election:nomination_updated', handleNominationUpdated)
    socket.on('election:updated', handleElectionUpdated)

    socket.emit('election:get_active')
    if (isAdmin) {
      socket.emit('election:get_all', { profileId })
    }

    return () => {
      clearTimeout(timeoutId)
      socket.off('election:active', handleActiveElection)
      socket.off('election:all', handleAllElections)
      socket.off('election:nominations', handleNominations)
      socket.off('election:my_votes', handleMyVotes)
      socket.off('election:nomination_added', handleNominationAdded)
      socket.off('election:nomination_updated', handleNominationUpdated)
      socket.off('election:updated', handleElectionUpdated)
    }
  }, [profileId, isAdmin, election?.id])

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

  const handleCloseElection = useCallback(() => {
    if (!election) return
    const socket = getSocket()
    if (socket) {
      socket.emit('election:save', {
        election: { ...election, status: 'closed' },
        profileId,
      })
      assignElectionWinners(election.id)
    }
  }, [election, profileId])

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        {t('common.loading')}
      </div>
    )
  }

  // Calculate days remaining for results
  const daysUntilHide = election && getElectionPhase(election) === 'closed'
    ? Math.ceil(RESULTS_DISPLAY_DAYS - (Date.now() - election.votingEnd) / (1000 * 60 * 60 * 24))
    : null

  const phase = election ? getElectionPhase(election) : null
  const acceptedNominations = nominations.filter(n => n.accepted === true)

  // Past elections view
  if (showPastElections) {
    const pastElections = allElections.filter(e => getElectionPhase(e) === 'closed')
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{t('elections.pastElections') || 'Past Elections'}</h3>
          <button
            onClick={() => setShowPastElections(false)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            {t('common.back') || 'Back'}
          </button>
        </div>
        {pastElections.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">{t('elections.noPastElections') || 'No past elections'}</p>
        ) : (
          <div className="space-y-3">
            {pastElections.map(e => (
              <div key={e.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-800">{e.title}</h4>
                  <span className="text-xs text-gray-500">{formatElectionDate(e.votingEnd)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{e.positions.length} positions</p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Officers section component
  const officersSection = officers.length > 0 ? (
    <div className="bg-amber-50 rounded-lg border border-amber-200 p-3">
      <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        {t('elections.currentOfficers')}
      </h4>
      <div className="space-y-1">
        {officers.map(pos => (
          <div key={pos.positionTitle} className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{pos.positionTitle}: <span className="font-medium">{pos.holderName}</span></span>
            <span className="text-xs text-amber-700">
              {new Date(pos.termEnd).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  ) : null

  // NO ACTIVE ELECTION STATE
  if (!election) {
    return (
      <div className="space-y-4">
        {/* Empty state message */}
        <div className="text-center py-6">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-base font-medium text-gray-700 mb-1">
            {t('elections.noElectionsScheduled') || 'No elections scheduled'}
          </h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            {t('elections.noElectionsDesc') || 'Elections let your building choose representatives through ranked-choice voting.'}
          </p>
        </div>

        {/* Current officers */}
        {officersSection}

        {/* Admin: Schedule Election */}
        {isAdmin && (
          <div className="border-t border-gray-200 pt-4">
            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-rstu-red hover:text-rstu-red transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('elections.scheduleElection') || 'Schedule an Election'}
              </button>
            ) : (
              <InlineElectionCreator
                profileId={profileId}
                onCancel={() => setShowCreateForm(false)}
                onCreated={() => setShowCreateForm(false)}
              />
            )}
          </div>
        )}

        {/* Admin: View past elections link */}
        {isAdmin && allElections.some(e => getElectionPhase(e) === 'closed') && (
          <button
            onClick={() => setShowPastElections(true)}
            className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
          >
            {t('elections.viewPastElections') || 'View Past Elections'}
          </button>
        )}
      </div>
    )
  }

  // ACTIVE ELECTION STATE
  return (
    <div className="space-y-4">
      {/* Election Header */}
      <div className="bg-red-50 rounded-lg p-3 border border-red-100">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-red-800">{election.title}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
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
          {phase === 'closed' && daysUntilHide !== null && daysUntilHide > 0 && (
            <p className="text-gray-500">{t('elections.resultsHideIn') || 'Results hide in'} {daysUntilHide} {daysUntilHide === 1 ? 'day' : 'days'}</p>
          )}
        </div>
      </div>

      {/* Pending Nomination Response */}
      {pendingNomination && (
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-1 text-sm">{t('elections.youveBeenNominated')}</h4>
          <p className="text-sm text-yellow-700 mb-2">
            {t('elections.nominatedFor', { position: election.positions.find(p => p.id === pendingNomination.positionId)?.title || '' })}
            {' '}{t('elections.by')} {pendingNomination.nominatorName}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleRespondToNomination(true)}
              className="flex-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              {t('elections.accept')}
            </button>
            <button
              onClick={() => handleRespondToNomination(false)}
              className="flex-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-300"
            >
              {t('elections.decline')}
            </button>
          </div>
        </div>
      )}

      {/* NOMINATIONS PHASE */}
      {phase === 'nominations' && (
        <div className="space-y-3">
          {election.positions.map(position => {
            const positionNoms = acceptedNominations.filter(n => n.positionId === position.id)
            const isNominatingHere = nominatingForPosition === position.id

            return (
              <div key={position.id} className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-800">{position.title}</h5>
                  <span className="text-xs text-gray-500">
                    {positionNoms.length} {positionNoms.length === 1 ? 'candidate' : 'candidates'}
                  </span>
                </div>

                {/* Candidates list */}
                {positionNoms.length > 0 && (
                  <div className="mb-2 space-y-1">
                    {positionNoms.map(nom => (
                      <div key={nom.id} className="text-sm text-gray-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        {nom.nomineeName}
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline nomination form or button */}
                {!isNominatingHere ? (
                  <button
                    onClick={() => setNominatingForPosition(position.id)}
                    className="text-sm text-rstu-red hover:text-red-700 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('elections.nominateSomeone') || 'Nominate someone'}
                  </button>
                ) : (
                  <InlineNominationForm
                    election={election}
                    position={position}
                    profileId={profileId}
                    profileName={profileName}
                    existingNominations={nominations}
                    onCancel={() => setNominatingForPosition(null)}
                    onSubmitted={() => setNominatingForPosition(null)}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* VOTING PHASE */}
      {phase === 'voting' && (
        <RankedChoiceVoting
          election={election}
          nominations={acceptedNominations}
          profileId={profileId}
          onVoteComplete={handleVoteComplete}
        />
      )}

      {/* RESULTS PHASE */}
      {phase === 'closed' && (
        <ResultsDisplay election={election} />
      )}

      {/* Admin Controls */}
      {isAdmin && (
        <div className="border-t border-gray-200 pt-3 mt-4 space-y-2">
          {phase !== 'closed' && (
            <button
              onClick={handleCloseElection}
              className="text-sm text-red-600 hover:text-red-700"
            >
              {t('elections.closeEarly') || 'Close Election Early'}
            </button>
          )}
          {phase === 'closed' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="text-sm text-rstu-red hover:text-red-700"
            >
              {t('elections.scheduleNext') || 'Schedule Next Election'}
            </button>
          )}
          {allElections.some(e => e.id !== election.id && getElectionPhase(e) === 'closed') && (
            <button
              onClick={() => setShowPastElections(true)}
              className="block text-sm text-gray-500 hover:text-gray-700"
            >
              {t('elections.viewPastElections') || 'View Past Elections'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Inline Election Creator Component
// ============================================================================

interface InlineElectionCreatorProps {
  profileId: string
  onCancel: () => void
  onCreated: () => void
}

function InlineElectionCreator({ profileId, onCancel, onCreated }: InlineElectionCreatorProps) {
  const { t } = useLanguage()
  const [title, setTitle] = useState('')
  const [positions, setPositions] = useState<ElectionPosition[]>([
    { id: `pos-${Date.now()}-0`, title: 'President', description: '', termLength: 12, maxTerms: 2 },
  ])
  const [nominationStart, setNominationStart] = useState('')
  const [nominationEnd, setNominationEnd] = useState('')
  const [votingEnd, setVotingEnd] = useState('')
  const [quorumPercent, setQuorumPercent] = useState(15)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addPosition = () => {
    setPositions([...positions, {
      id: `pos-${Date.now()}`,
      title: '',
      description: '',
      termLength: 12,
      maxTerms: 2,
    }])
  }

  const removePosition = (index: number) => {
    if (positions.length > 1) {
      setPositions(positions.filter((_, i) => i !== index))
    }
  }

  const updatePosition = (index: number, field: keyof ElectionPosition, value: string | number) => {
    const updated = [...positions]
    updated[index] = { ...updated[index], [field]: value }
    setPositions(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError(t('elections.enterTitle') || 'Enter a title')
      return
    }
    if (!nominationStart || !nominationEnd || !votingEnd) {
      setError(t('elections.setDates') || 'Set all dates')
      return
    }
    if (positions.some(p => !p.title.trim())) {
      setError(t('elections.positionNeedsTitle') || 'All positions need titles')
      return
    }

    const nomStart = new Date(nominationStart).getTime()
    const nomEnd = new Date(nominationEnd).getTime()
    const voteEnd = new Date(votingEnd).getTime()

    if (nomEnd <= nomStart) {
      setError(t('elections.nominationEndAfterStart') || 'Nomination end must be after start')
      return
    }
    if (voteEnd <= nomEnd) {
      setError(t('elections.votingEndAfterNomination') || 'Voting end must be after nominations')
      return
    }

    setIsSubmitting(true)

    const election: Election = {
      id: `election-${Date.now()}`,
      title: title.trim(),
      positions,
      nominationStart: nomStart,
      nominationEnd: nomEnd,
      votingStart: nomEnd,
      votingEnd: voteEnd,
      status: 'draft',
      quorumPercent,
      createdBy: profileId,
      createdAt: Date.now(),
    }

    // Update status based on dates
    const now = Date.now()
    if (now >= nomStart && now < nomEnd) election.status = 'nominations'
    else if (now >= nomEnd && now < voteEnd) election.status = 'voting'

    const socket = getSocket()
    if (!socket) {
      setError(t('common.error') || 'Connection error')
      setIsSubmitting(false)
      return
    }

    socket.emit('election:save', { election, profileId })

    const timeout = setTimeout(() => {
      setError(t('common.error') || 'Timed out')
      setIsSubmitting(false)
    }, 5000)

    socket.once('election:saved', () => {
      clearTimeout(timeout)
      setIsSubmitting(false)
      onCreated()
    })

    socket.once('election:error', ({ message }: { message: string }) => {
      clearTimeout(timeout)
      setError(message)
      setIsSubmitting(false)
    })
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <h4 className="font-medium text-gray-800 mb-3">{t('elections.scheduleElection') || 'Schedule an Election'}</h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">{t('elections.electionTitle') || 'Title'}</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={t('elections.titlePlaceholder') || 'e.g., Annual Building Election'}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent"
          />
        </div>

        {/* Positions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-700">{t('elections.positions') || 'Positions'}</label>
            <button type="button" onClick={addPosition} className="text-xs text-rstu-red hover:text-red-700">
              + {t('elections.addPosition') || 'Add Position'}
            </button>
          </div>
          <div className="space-y-2">
            {positions.map((pos, idx) => (
              <div key={pos.id} className="flex items-center gap-2 bg-white rounded border border-gray-200 p-2">
                <input
                  type="text"
                  value={pos.title}
                  onChange={e => updatePosition(idx, 'title', e.target.value)}
                  placeholder={t('elections.positionTitle') || 'Position title'}
                  className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-rstu-red"
                />
                <select
                  value={pos.termLength}
                  onChange={e => updatePosition(idx, 'termLength', parseInt(e.target.value))}
                  className="border border-gray-200 rounded px-2 py-1 text-xs"
                >
                  <option value={6}>6 mo</option>
                  <option value={12}>1 yr</option>
                  <option value={24}>2 yr</option>
                </select>
                {positions.length > 1 && (
                  <button type="button" onClick={() => removePosition(idx)} className="text-gray-400 hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('elections.nominationStart') || 'Nom. Start'}</label>
            <input
              type="datetime-local"
              value={nominationStart}
              onChange={e => setNominationStart(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('elections.nominationEnd') || 'Nom. End'}</label>
            <input
              type="datetime-local"
              value={nominationEnd}
              onChange={e => setNominationEnd(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('elections.votingEnd') || 'Voting End'}</label>
            <input
              type="datetime-local"
              value={votingEnd}
              onChange={e => setVotingEnd(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm">{error}</div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300"
          >
            {t('common.cancel') || 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-rstu-red text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? (t('common.loading') || 'Saving...') : (t('elections.create') || 'Create Election')}
          </button>
        </div>
      </form>
    </div>
  )
}

// ============================================================================
// Inline Nomination Form Component
// ============================================================================

interface InlineNominationFormProps {
  election: Election
  position: ElectionPosition
  profileId: string
  profileName: string
  existingNominations: Nomination[]
  onCancel: () => void
  onSubmitted: () => void
}

function InlineNominationForm({
  election,
  position,
  profileId,
  profileName,
  existingNominations,
  onCancel,
  onSubmitted,
}: InlineNominationFormProps) {
  const { t } = useLanguage()
  const { isReadOnly, checkAction } = useOfflineMode()
  const [nomineeId, setNomineeId] = useState('')
  const [nomineeName, setNomineeName] = useState('')
  const [statement, setStatement] = useState('')
  const [isSelfNomination, setIsSelfNomination] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSelfNomination = (checked: boolean) => {
    setIsSelfNomination(checked)
    if (checked) {
      setNomineeId(profileId)
      setNomineeName(profileName)
    } else {
      setNomineeId('')
      setNomineeName('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const offlineError = checkAction('submit nomination')
    if (offlineError) {
      setError(offlineError)
      return
    }

    if (!nomineeId || !nomineeName) {
      setError(t('elections.enterNomineeName') || 'Enter nominee name')
      return
    }

    // Check duplicates
    const existingNom = existingNominations.find(
      n => n.positionId === position.id && n.nomineeId === nomineeId
    )
    if (existingNom) {
      setError(t('elections.alreadyNominated') || 'Already nominated')
      return
    }

    const nominatorNom = existingNominations.find(
      n => n.positionId === position.id && n.nominatorId === profileId
    )
    if (nominatorNom) {
      setError(t('elections.alreadyNominatedSomeone') || 'You already nominated for this position')
      return
    }

    setIsSubmitting(true)

    const result = await createNominationAsync({
      electionId: election.id,
      positionId: position.id,
      nomineeId: isSelfNomination ? profileId : nomineeId,
      nomineeName: isSelfNomination ? profileName : nomineeName,
      statement,
      selfNomination: isSelfNomination,
    })

    if (!result.success) {
      setError(result.error || t('common.error'))
      setIsSubmitting(false)
      return
    }

    // Emit to socket for real-time updates
    const socket = getSocket()
    if (socket) {
      const nomination = {
        id: result.nominationId,
        electionId: election.id,
        positionId: position.id,
        nomineeId: isSelfNomination ? profileId : nomineeId,
        nomineeName: isSelfNomination ? profileName : nomineeName,
        nominatorId: profileId,
        nominatorName: profileName,
        statement,
        accepted: isSelfNomination ? true : null,
        createdAt: Date.now(),
      }
      socket.emit('election:nominate', { nomination })
    }

    setIsSubmitting(false)
    onSubmitted()
  }

  // Suggested nominees (organizers/admins)
  const suggested = getStoredProfiles().filter(
    p => (p.role === 'organizer' || p.role === 'admin') && p.id !== profileId && !p.banned
  )

  return (
    <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
      <h6 className="text-sm font-medium text-gray-700 mb-2">
        {t('elections.nominateFor') || 'Nominate for'} {position.title}
      </h6>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Self-nomination checkbox */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isSelfNomination}
            onChange={e => handleSelfNomination(e.target.checked)}
            className="w-4 h-4 text-rstu-red border-gray-300 rounded focus:ring-rstu-red"
          />
          {t('elections.nominateMyself') || 'Nominate myself'}
        </label>

        {/* Nominee input (if not self) */}
        {!isSelfNomination && (
          <div>
            {suggested.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {suggested.slice(0, 5).map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setNomineeId(p.id); setNomineeName(p.nickname) }}
                    className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                      nomineeId === p.id
                        ? 'bg-rstu-red text-white border-rstu-red'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-rstu-red'
                    }`}
                  >
                    {p.nickname}
                  </button>
                ))}
              </div>
            )}
            <input
              type="text"
              value={nomineeName}
              onChange={e => {
                setNomineeName(e.target.value)
                if (!nomineeId || nomineeId.startsWith('nominee-')) {
                  setNomineeId(`nominee-${e.target.value.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`)
                }
              }}
              placeholder={t('elections.enterNomineeName') || 'Enter name'}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-rstu-red"
            />
          </div>
        )}

        {/* Statement */}
        <textarea
          value={statement}
          onChange={e => setStatement(e.target.value)}
          placeholder={t('elections.statementPlaceholder') || 'Brief statement (optional)'}
          rows={2}
          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-rstu-red"
        />

        {/* Error */}
        {error && <div className="text-red-600 text-xs">{error}</div>}

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-300"
          >
            {t('common.cancel') || 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isReadOnly}
            className="flex-1 bg-rstu-red text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? '...' : (t('elections.submitNomination') || 'Submit')}
          </button>
        </div>
      </form>
    </div>
  )
}
