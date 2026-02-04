'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { EnhancedBuilding } from '@/lib/data/getBuildingsData'
import { getGroupForApn, type LinkedPropertyGroup } from '@/lib/storage/linkedPropertiesStorage'
import { createProposal, VOTE_THRESHOLDS } from '@/lib/storage/governanceStorage'
import { getCurrentProfile } from '@/lib/storage/profileStorage'

interface RentStrikeVoteProps {
  building: EnhancedBuilding
  propertyGroup: LinkedPropertyGroup | null
  onSubmit: (message: string) => void
  onClose: () => void
  prefilledDemands?: string
  prefilledReason?: string
}

const STRIKE_REASONS = [
  { id: 'repairs', label: 'Unaddressed Repairs', description: 'Landlord refuses to fix habitability issues' },
  { id: 'rent-increase', label: 'Excessive Rent Increase', description: 'Rent hike beyond reasonable limits' },
  { id: 'harassment', label: 'Landlord Harassment', description: 'Intimidation, illegal entry, or retaliation' },
  { id: 'services', label: 'Reduced Services', description: 'Amenities removed without rent reduction' },
  { id: 'other', label: 'Other', description: 'Specify your own reason' },
]

export function RentStrikeVote({
  building,
  propertyGroup,
  onSubmit,
  onClose,
  prefilledDemands = '',
  prefilledReason = '',
}: RentStrikeVoteProps) {
  const { t } = useLanguage()
  const [selectedReason, setSelectedReason] = useState<string | null>(prefilledReason || null)
  const [customReason, setCustomReason] = useState('')
  const [demands, setDemands] = useState(prefilledDemands)
  const [startDate, setStartDate] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)

  const profile = getCurrentProfile()
  const groupId = propertyGroup?.id || building.chatSlug

  const handleSubmit = () => {
    if (!profile || !selectedReason || !acknowledged) return

    const reasonText = selectedReason === 'other'
      ? customReason
      : STRIKE_REASONS.find(r => r.id === selectedReason)?.label || selectedReason

    const proposal = createProposal('rent-strike', groupId, {
      targetValue: startDate || undefined,
      reason: `Rent strike for: ${reasonText}. Demands: ${demands || 'To be determined collectively.'}`,
    })

    if (proposal) {
      const message = `[GOV:rent-strike:${groupId}:${startDate || 'TBD'}] 🪧 RENT STRIKE VOTE: ${reasonText}. ${demands ? `Demands: ${demands}` : ''}`
      onSubmit(message)
    }

    onClose()
  }

  const isValid = selectedReason &&
    (selectedReason !== 'other' || customReason.trim()) &&
    acknowledged

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0 bg-red-50">
          <div>
            <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
              <span className="text-xl">🪧</span>
              {t('rentStrike.callVote') || 'Call a Rent Strike Vote'}
            </h2>
            <p className="text-xs text-red-700">
              {propertyGroup ? `For: ${propertyGroup.name || 'Your Bloc'}` : building.address}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-red-700 hover:text-red-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* High Stakes Warning */}
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg mb-4">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800">{t('rentStrike.highStakes') || 'High Stakes Action'}</p>
                <p className="text-xs text-amber-700 mt-1">
                  {t('rentStrike.description') || 'Rent strikes are serious collective actions.'} {t('rentStrike.voteThreshold') || `This vote requires +${VOTE_THRESHOLDS['rent-strike']} net votes to pass. Ensure your building is prepared with an escrow plan and legal support.`}
                </p>
              </div>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {t('rentStrike.whyStriking') || 'Why are we striking?'}
            </label>
            <div className="space-y-2">
              {STRIKE_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    selectedReason === reason.id
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm text-gray-900">{reason.label}</p>
                  <p className="text-xs text-gray-500">{reason.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Reason */}
          {selectedReason === 'other' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('rentStrike.describeReason') || 'Describe the reason'}
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder={t('rentStrike.whatDriving') || 'What is driving this strike action?'}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>
          )}

          {/* Demands */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('rentStrike.demands') || 'What are our demands?'} <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={demands}
              onChange={(e) => setDemands(e.target.value)}
              placeholder={t('rentStrike.demandsExample') || 'e.g., Fix all broken heating units within 14 days, or reduce rent by 20%'}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('rentStrike.demandsNote') || 'Demands can be finalized collectively after the vote passes.'}
            </p>
          </div>

          {/* Proposed Start Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('rentStrike.startDate') || 'Proposed start date'} <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Acknowledgment */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-1 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-xs text-gray-700">
                {t('rentStrike.acknowledgment') || 'I understand that a rent strike is a serious action that may have legal and financial consequences. I am proposing this vote because I believe our collective situation warrants this level of response.'}
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            {t('common.cancel') || 'Cancel'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition ${
              isValid
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {t('rentStrike.callVote') || 'Call the Vote'}
          </button>
        </div>
      </div>
    </div>
  )
}
