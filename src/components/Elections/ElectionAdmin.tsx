'use client'

import { useState, useEffect } from 'react'
import { getSocket } from '@/lib/socketio'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  Election,
  ElectionPosition,
  DEFAULT_POSITIONS,
  formatElectionDate,
  getElectionPhase,
  assignElectionWinners,
} from '@/lib/electionStorage'

interface ElectionAdminProps {
  profileId: string
}

export function ElectionAdmin({ profileId }: ElectionAdminProps) {
  const { t } = useLanguage()
  const [elections, setElections] = useState<Election[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingElection, setEditingElection] = useState<Election | null>(null)

  useEffect(() => {
    const socket = getSocket()
    if (!socket) {
      setIsLoading(false)
      return
    }

    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 5000)

    const handleAll = ({ elections: e }: { elections: Election[] }) => {
      clearTimeout(timeout)
      setElections(e)
      setIsLoading(false)
    }

    const handleUpdated = ({ election }: { election: Election }) => {
      setElections(prev => {
        const idx = prev.findIndex(e => e.id === election.id)
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = election
          return updated
        }
        return [election, ...prev]
      })
    }

    socket.on('election:all', handleAll)
    socket.on('election:updated', handleUpdated)
    socket.emit('election:get_all', { profileId })

    return () => {
      clearTimeout(timeout)
      socket.off('election:all', handleAll)
      socket.off('election:updated', handleUpdated)
    }
  }, [profileId])

  const handleCloseElection = (electionId: string) => {
    const election = elections.find(e => e.id === electionId)
    if (!election) return

    const socket = getSocket()
    if (socket) {
      socket.emit('election:save', {
        election: { ...election, status: 'closed' },
        profileId,
      })
    }

    // Assign election winners to officer positions
    assignElectionWinners(electionId)
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        {t('common.loading')}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">{t('elections.manageElections')}</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
        >
          {t('elections.createNew')}
        </button>
      </div>

      {/* Elections List */}
      {elections.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
          {t('elections.noElections')}
        </div>
      ) : (
        <div className="space-y-3">
          {elections.map(election => {
            const phase = getElectionPhase(election)
            return (
              <div
                key={election.id}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{election.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {election.positions.length} {t('elections.positions')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    phase === 'nominations' ? 'bg-yellow-100 text-yellow-800' :
                    phase === 'voting' ? 'bg-green-100 text-green-800' :
                    phase === 'closed' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {phase === 'nominations' ? t('elections.nominationsOpen') :
                     phase === 'voting' ? t('elections.votingOpen') :
                     phase === 'closed' ? t('elections.closed') :
                     t('elections.draft')}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>
                    <span className="block text-gray-400">{t('elections.nominations')}</span>
                    {formatElectionDate(election.nominationStart)} - {formatElectionDate(election.nominationEnd)}
                  </div>
                  <div>
                    <span className="block text-gray-400">{t('elections.voting')}</span>
                    {formatElectionDate(election.nominationEnd)} - {formatElectionDate(election.votingEnd)}
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  {phase !== 'closed' && (
                    <>
                      <button
                        onClick={() => setEditingElection(election)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleCloseElection(election.id)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        {t('elections.closeEarly')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Form */}
      {(showCreateForm || editingElection) && (
        <ElectionForm
          election={editingElection}
          profileId={profileId}
          onClose={() => {
            setShowCreateForm(false)
            setEditingElection(null)
          }}
        />
      )}
    </div>
  )
}

// ============================================================================
// Election Form Component
// ============================================================================

interface ElectionFormProps {
  election: Election | null
  profileId: string
  onClose: () => void
}

function ElectionForm({ election, profileId, onClose }: ElectionFormProps) {
  const { t } = useLanguage()
  const [title, setTitle] = useState(election?.title || '')
  const [quorumPercent, setQuorumPercent] = useState(election?.quorumPercent || 15)
  const [nominationStart, setNominationStart] = useState(
    election ? new Date(election.nominationStart).toISOString().slice(0, 16) : ''
  )
  const [nominationEnd, setNominationEnd] = useState(
    election ? new Date(election.nominationEnd).toISOString().slice(0, 16) : ''
  )
  const [votingEnd, setVotingEnd] = useState(
    election ? new Date(election.votingEnd).toISOString().slice(0, 16) : ''
  )
  const [positions, setPositions] = useState<ElectionPosition[]>(
    election?.positions || DEFAULT_POSITIONS.map((p, i) => ({
      ...p,
      id: `pos-${Date.now()}-${i}`,
    }))
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addPosition = () => {
    setPositions([
      ...positions,
      {
        id: `pos-${Date.now()}`,
        title: '',
        description: '',
        termLength: 12,
        maxTerms: 2,
      },
    ])
  }

  const updatePosition = (index: number, field: keyof ElectionPosition, value: string | number) => {
    const updated = [...positions]
    updated[index] = { ...updated[index], [field]: value }
    setPositions(updated)
  }

  const removePosition = (index: number) => {
    setPositions(positions.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError(t('elections.enterTitle'))
      return
    }

    if (!nominationStart || !nominationEnd || !votingEnd) {
      setError(t('elections.setDates'))
      return
    }

    if (positions.length === 0) {
      setError(t('elections.addPosition'))
      return
    }

    if (positions.some(p => !p.title.trim())) {
      setError(t('elections.positionNeedsTitle'))
      return
    }

    const nomStart = new Date(nominationStart).getTime()
    const nomEnd = new Date(nominationEnd).getTime()
    const voteEnd = new Date(votingEnd).getTime()

    if (nomEnd <= nomStart) {
      setError(t('elections.nominationEndAfterStart'))
      return
    }

    if (voteEnd <= nomEnd) {
      setError(t('elections.votingEndAfterNomination'))
      return
    }

    setIsSubmitting(true)

    const electionData: Election = {
      id: election?.id || `election-${Date.now()}`,
      title: title.trim(),
      positions,
      nominationStart: nomStart,
      nominationEnd: nomEnd,
      votingStart: nomEnd, // Voting starts when nominations end
      votingEnd: voteEnd,
      status: election?.status || 'draft',
      quorumPercent,
      createdBy: election?.createdBy || profileId,
      createdAt: election?.createdAt || Date.now(),
    }

    // Update status based on dates
    const now = Date.now()
    if (now >= nomStart && now < nomEnd) {
      electionData.status = 'nominations'
    } else if (now >= nomEnd && now < voteEnd) {
      electionData.status = 'voting'
    } else if (now >= voteEnd) {
      electionData.status = 'closed'
    }

    const socket = getSocket()
    if (!socket) {
      setError(t('common.error'))
      setIsSubmitting(false)
      return
    }

    socket.emit('election:save', { election: electionData, profileId })

    const timeout = setTimeout(() => {
      setError(t('common.error'))
      setIsSubmitting(false)
    }, 5000)

    socket.once('election:saved', () => {
      clearTimeout(timeout)
      setIsSubmitting(false)
      onClose()
    })

    socket.once('election:error', ({ message }: { message: string }) => {
      clearTimeout(timeout)
      setError(message)
      setIsSubmitting(false)
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">
              {election ? t('elections.editElection') : t('elections.createElection')}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('elections.electionTitle')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('elections.titlePlaceholder')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Quorum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('elections.quorumPercent')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="100"
                value={quorumPercent}
                onChange={(e) => setQuorumPercent(parseInt(e.target.value) || 15)}
                className="w-24 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <span className="text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{t('elections.quorumHelp')}</p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('elections.nominationStart')}
              </label>
              <input
                type="datetime-local"
                value={nominationStart}
                onChange={(e) => setNominationStart(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('elections.nominationEnd')}
              </label>
              <input
                type="datetime-local"
                value={nominationEnd}
                onChange={(e) => setNominationEnd(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('elections.votingEnd')}
              </label>
              <input
                type="datetime-local"
                value={votingEnd}
                onChange={(e) => setVotingEnd(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          {/* Positions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('elections.positions')}
              </label>
              <button
                type="button"
                onClick={addPosition}
                className="text-sm text-red-600 hover:text-red-700"
              >
                + {t('elections.addPosition')}
              </button>
            </div>
            <div className="space-y-3">
              {positions.map((pos, index) => (
                <div key={pos.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={pos.title}
                        onChange={(e) => updatePosition(index, 'title', e.target.value)}
                        placeholder={t('elections.positionTitle')}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                      <textarea
                        value={pos.description}
                        onChange={(e) => updatePosition(index, 'description', e.target.value)}
                        placeholder={t('elections.positionDescription')}
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500">{t('elections.termLength')}</label>
                          <select
                            value={pos.termLength}
                            onChange={(e) => updatePosition(index, 'termLength', parseInt(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
                          >
                            <option value={6}>6 {t('elections.months')}</option>
                            <option value={12}>1 {t('elections.year')}</option>
                            <option value={24}>2 {t('elections.years')}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">{t('elections.maxTerms')}</label>
                          <select
                            value={pos.maxTerms}
                            onChange={(e) => updatePosition(index, 'maxTerms', parseInt(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
                          >
                            <option value={0}>{t('elections.unlimited')}</option>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePosition(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-300"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? t('common.loading') : (election ? t('common.save') : t('elections.create'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
