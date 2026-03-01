'use client'

import { useState, useCallback } from 'react'
import {
  createCommitment,
  DEFAULT_THRESHOLDS,
  COMMITMENT_LABELS,
  type CommitmentType,
} from '@/lib/storage/commitmentStorage'
import { useLanguage } from '@/contexts/LanguageContext'

interface CommitmentCreatorProps {
  buildingId: string
  buildingAddress: string
  onSuccess: () => void
  onCancel: () => void
}

// Type selection cards
const COMMITMENT_TYPES: CommitmentType[] = ['file-complaint', 'attend-meeting', 'join-strike']

export function CommitmentCreator({
  buildingId,
  buildingAddress,
  onSuccess,
  onCancel,
}: CommitmentCreatorProps) {
  const { t } = useLanguage()

  const [step, setStep] = useState<'select' | 'configure'>('select')
  const [selectedType, setSelectedType] = useState<CommitmentType | null>(null)
  const [threshold, setThreshold] = useState<number>(3)
  const [reason, setReason] = useState('')
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingLocation, setMeetingLocation] = useState('')
  const [strikeStartDate, setStrikeStartDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSelectType = useCallback((type: CommitmentType) => {
    setSelectedType(type)
    setThreshold(DEFAULT_THRESHOLDS[type])
    setStep('configure')
    setError(null)
  }, [])

  const handleBack = useCallback(() => {
    setStep('select')
    setError(null)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!selectedType) return

    setIsSubmitting(true)
    setError(null)

    const commitment = createCommitment(selectedType, buildingId, {
      threshold,
      reason: reason.trim() || undefined,
      meetingDate: meetingDate || undefined,
      meetingLocation: meetingLocation.trim() || undefined,
      strikeStartDate: strikeStartDate || undefined,
    })

    setIsSubmitting(false)

    if (commitment) {
      onSuccess()
    } else {
      setError(t('commitment.createError'))
    }
  }, [selectedType, buildingId, threshold, reason, meetingDate, meetingLocation, strikeStartDate, onSuccess, t])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {step === 'select' ? t('commitment.createTitle') : t('commitment.configureTitle')}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {/* Building context */}
          <p className="text-sm text-gray-600 mb-4">
            {t('commitment.forBuilding')}: <span className="font-medium">{buildingAddress}</span>
          </p>

          {step === 'select' ? (
            /* Step 1: Select commitment type */
            <div className="space-y-3">
              <p className="text-sm text-gray-700 mb-4">
                {t('commitment.selectTypeDesc')}
              </p>

              {COMMITMENT_TYPES.map((type) => {
                const label = COMMITMENT_LABELS[type]
                return (
                  <button
                    key={type}
                    onClick={() => handleSelectType(type)}
                    className="w-full p-4 border rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{label.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                          {t(`commitment.type.${type}`)}
                        </h3>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {t(`commitment.typeDesc.${type}`)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {t('commitment.defaultThreshold')}: {DEFAULT_THRESHOLDS[type]}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            /* Step 2: Configure commitment */
            <div className="space-y-4">
              {/* Back button */}
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t('common.back')}
              </button>

              {/* Selected type summary */}
              {selectedType && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{COMMITMENT_LABELS[selectedType].icon}</span>
                    <span className="font-medium">{t(`commitment.type.${selectedType}`)}</span>
                  </div>
                </div>
              )}

              {/* Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('commitment.thresholdLabel')}
                </label>
                <input
                  type="number"
                  min={2}
                  max={50}
                  value={threshold}
                  onChange={(e) => setThreshold(Math.max(2, parseInt(e.target.value) || 2))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('commitment.thresholdHelp')}
                </p>
              </div>

              {/* Reason (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('commitment.reasonLabel')} <span className="text-gray-400">({t('common.optional')})</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('commitment.reasonPlaceholder')}
                  rows={2}
                  maxLength={200}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Meeting-specific fields */}
              {selectedType === 'attend-meeting' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('commitment.meetingDate')} <span className="text-gray-400">({t('common.optional')})</span>
                    </label>
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('commitment.meetingLocation')} <span className="text-gray-400">({t('common.optional')})</span>
                    </label>
                    <input
                      type="text"
                      value={meetingLocation}
                      onChange={(e) => setMeetingLocation(e.target.value)}
                      placeholder={t('commitment.meetingLocationPlaceholder')}
                      maxLength={100}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Strike-specific fields */}
              {selectedType === 'join-strike' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('commitment.strikeStartDate')} <span className="text-gray-400">({t('common.optional')})</span>
                  </label>
                  <input
                    type="date"
                    value={strikeStartDate}
                    onChange={(e) => setStrikeStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? t('common.creating') : t('commitment.create')}
                </button>
              </div>

              {/* Info */}
              <p className="text-xs text-gray-500 text-center">
                {t('commitment.expiresIn7Days')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
