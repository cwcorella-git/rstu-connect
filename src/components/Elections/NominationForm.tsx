'use client'

import { useState } from 'react'
import { getSocket } from '@/lib/socketio'
import { useLanguage } from '@/contexts/LanguageContext'
import { useOfflineMode } from '@/hooks/useOfflineMode'
import { Election, Nomination, createNominationAsync } from '@/lib/electionStorage'

interface NominationFormProps {
  election: Election
  profileId: string
  profileName: string
  existingNominations: Nomination[]
  onClose: () => void
}

export function NominationForm({
  election,
  profileId,
  profileName,
  existingNominations,
  onClose,
}: NominationFormProps) {
  const { t } = useLanguage()
  const { isReadOnly, checkAction } = useOfflineMode()
  const [selectedPosition, setSelectedPosition] = useState<string>('')
  const [nomineeId, setNomineeId] = useState<string>('')
  const [nomineeName, setNomineeName] = useState<string>('')
  const [statement, setStatement] = useState<string>('')
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

    // Check if offline
    const offlineError = checkAction('submit your nomination')
    if (offlineError) {
      setError(offlineError)
      return
    }

    if (!selectedPosition) {
      setError(t('elections.selectPosition'))
      return
    }

    if (!nomineeId || !nomineeName) {
      setError(t('elections.enterNomineeName'))
      return
    }

    // Check if already nominated for this position
    const existingNom = existingNominations.find(
      n => n.positionId === selectedPosition && n.nomineeId === nomineeId
    )
    if (existingNom) {
      setError(t('elections.alreadyNominated'))
      return
    }

    // Check if nominator already nominated for this position
    const nominatorNom = existingNominations.find(
      n => n.positionId === selectedPosition && n.nominatorId === profileId
    )
    if (nominatorNom) {
      setError(t('elections.alreadyNominatedSomeone'))
      return
    }

    setIsSubmitting(true)

    const actualNomineeId = isSelfNomination ? profileId : nomineeId
    const actualNomineeName = isSelfNomination ? profileName : nomineeName

    // Use server-verified async function
    const result = await createNominationAsync({
      electionId: election.id,
      positionId: selectedPosition,
      nomineeId: actualNomineeId,
      nomineeName: actualNomineeName,
      statement,
      selfNomination: isSelfNomination,
    })

    if (!result.success) {
      setError(result.error || t('common.error'))
      setIsSubmitting(false)
      return
    }

    // Also emit to Socket.io for real-time updates to other users
    const socket = getSocket()
    if (socket) {
      const nomination = {
        id: result.nominationId,
        electionId: election.id,
        positionId: selectedPosition,
        nomineeId: actualNomineeId,
        nomineeName: actualNomineeName,
        nominatorId: profileId,
        nominatorName: profileName,
        statement,
        accepted: isSelfNomination ? true : null,
        createdAt: Date.now(),
      }
      socket.emit('election:nominate', { nomination })
    }

    setIsSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">{t('elections.submitNomination')}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Position Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('elections.position')}
            </label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">{t('elections.selectPosition')}</option>
              {election.positions.map(pos => (
                <option key={pos.id} value={pos.id}>
                  {pos.title}
                </option>
              ))}
            </select>
            {selectedPosition && (
              <p className="mt-1 text-xs text-gray-500">
                {election.positions.find(p => p.id === selectedPosition)?.description}
              </p>
            )}
          </div>

          {/* Self Nomination Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="selfNomination"
              checked={isSelfNomination}
              onChange={(e) => handleSelfNomination(e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="selfNomination" className="text-sm text-gray-700">
              {t('elections.nominateMyself')}
            </label>
          </div>

          {/* Nominee Name */}
          {!isSelfNomination && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('elections.nomineeName')}
              </label>
              <input
                type="text"
                value={nomineeName}
                onChange={(e) => {
                  setNomineeName(e.target.value)
                  // Generate a simple ID from name if not provided
                  if (!nomineeId) {
                    setNomineeId(`nominee-${e.target.value.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`)
                  }
                }}
                placeholder={t('elections.enterNomineeName')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          )}

          {/* Candidate Statement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('elections.candidateStatement')} {isSelfNomination && <span className="text-gray-400">({t('elections.optional')})</span>}
            </label>
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder={t('elections.statementPlaceholder')}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isReadOnly}
            title={isReadOnly ? 'Cannot submit nomination while offline' : undefined}
            className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('common.loading') : t('elections.submitNomination')}
          </button>
        </form>
      </div>
    </div>
  )
}
