'use client'

import { useMemo, useState, useCallback } from 'react'
import {
  getCommitmentById,
  joinCommitment,
  leaveCommitment,
  hasUserCommitted,
  isCreator,
  deleteCommitment,
  getCommitmentProgress,
  getTimeRemaining,
  COMMITMENT_LABELS,
  type Commitment,
  type CommitmentType,
} from '@/lib/storage/commitmentStorage'
import { useLanguage } from '@/contexts/LanguageContext'

interface CommitmentCardProps {
  commitmentId: string
  onUpdate?: () => void
}

// Status badge colors
const STATUS_COLORS: Record<Commitment['status'], { bg: string; text: string }> = {
  gathering: { bg: 'bg-blue-100', text: 'text-blue-700' },
  'threshold-met': { bg: 'bg-green-100', text: 'text-green-700' },
  activated: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  expired: { bg: 'bg-gray-100', text: 'text-gray-500' },
}

// Type icons
const TYPE_ICONS: Record<CommitmentType, JSX.Element> = {
  'file-complaint': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  'attend-meeting': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  'join-strike': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
}

export function CommitmentCard({ commitmentId, onUpdate }: CommitmentCardProps) {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)

  // Get commitment data
  const commitment = useMemo(() => getCommitmentById(commitmentId), [commitmentId])
  const userHasCommitted = useMemo(() => hasUserCommitted(commitmentId), [commitmentId])
  const userIsCreator = useMemo(() => isCreator(commitmentId), [commitmentId])

  // Calculate progress
  const progress = useMemo(() => {
    if (!commitment) return null
    return getCommitmentProgress(commitment)
  }, [commitment])

  // Calculate time remaining
  const timeRemaining = useMemo(() => {
    if (!commitment) return null
    return getTimeRemaining(commitment)
  }, [commitment])

  const handleJoin = useCallback(async () => {
    setIsLoading(true)
    const success = joinCommitment(commitmentId)
    setIsLoading(false)
    if (success && onUpdate) {
      onUpdate()
    }
  }, [commitmentId, onUpdate])

  const handleLeave = useCallback(async () => {
    setIsLoading(true)
    const success = leaveCommitment(commitmentId)
    setIsLoading(false)
    if (success && onUpdate) {
      onUpdate()
    }
  }, [commitmentId, onUpdate])

  const handleDelete = useCallback(async () => {
    if (!confirm(t('commitment.deleteConfirm'))) return
    setIsLoading(true)
    const success = deleteCommitment(commitmentId)
    setIsLoading(false)
    if (success && onUpdate) {
      onUpdate()
    }
  }, [commitmentId, onUpdate, t])

  if (!commitment || !progress || !timeRemaining) {
    return null
  }

  const typeLabel = COMMITMENT_LABELS[commitment.type]
  const statusColor = STATUS_COLORS[commitment.status]
  const isActive = commitment.status === 'gathering'
  const isThresholdMet = commitment.status === 'threshold-met'

  return (
    <div className={`border rounded-lg p-4 ${isThresholdMet ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={`${isThresholdMet ? 'text-green-600' : 'text-gray-600'}`}>
            {TYPE_ICONS[commitment.type]}
          </span>
          <div>
            <h4 className="font-semibold text-sm text-gray-900">
              {t(`commitment.type.${commitment.type}`)}
            </h4>
            <p className="text-xs text-gray-500">
              {t('commitment.startedBy')} {commitment.createdByName}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
          {t(`commitment.status.${commitment.status}`)}
        </span>
      </div>

      {/* Reason (if provided) */}
      {commitment.reason && (
        <p className="text-sm text-gray-700 mb-3 italic">
          &ldquo;{commitment.reason}&rdquo;
        </p>
      )}

      {/* Meeting details */}
      {commitment.type === 'attend-meeting' && commitment.meetingDate && (
        <div className="text-sm text-gray-600 mb-3 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{new Date(commitment.meetingDate).toLocaleDateString()}</span>
          {commitment.meetingLocation && <span>@ {commitment.meetingLocation}</span>}
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium text-gray-700">
            {progress.current}/{progress.threshold} {t('commitment.committed')}
          </span>
          {isActive && (
            <span className="text-gray-500">{timeRemaining.text}</span>
          )}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isThresholdMet ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        {isActive && progress.remaining > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {t('commitment.needMore', { count: progress.remaining })}
          </p>
        )}
      </div>

      {/* Threshold met message */}
      {isThresholdMet && (
        <div className="bg-green-100 border border-green-200 rounded p-2 mb-3">
          <p className="text-sm text-green-800 font-medium">
            {t('commitment.thresholdMet')}
          </p>
          <p className="text-xs text-green-700 mt-0.5">
            {t('commitment.timeToAct')}
          </p>
        </div>
      )}

      {/* Action buttons */}
      {isActive && (
        <div className="flex gap-2">
          {userHasCommitted ? (
            <>
              <button
                onClick={handleLeave}
                disabled={isLoading || userIsCreator}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={userIsCreator ? t('commitment.creatorCannotLeave') : undefined}
              >
                {t('commitment.leave')}
              </button>
              <span className="flex items-center px-3 text-sm text-green-600 font-medium">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t('commitment.youreIn')}
              </span>
            </>
          ) : (
            <button
              onClick={handleJoin}
              disabled={isLoading}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {t('commitment.join')}
            </button>
          )}
        </div>
      )}

      {/* Creator delete option */}
      {userIsCreator && isActive && (
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="mt-2 w-full px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
        >
          {t('commitment.delete')}
        </button>
      )}

      {/* Privacy note */}
      <p className="text-[10px] text-gray-400 mt-3 text-center">
        {t('commitment.privacyNote')}
      </p>
    </div>
  )
}
