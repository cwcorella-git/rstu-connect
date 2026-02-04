'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { COMPLAINT_CATEGORIES } from '@/lib/storage/canvassStorage'
import {
  openRenoCodeEnforcementForm,
  type CodeEnforcementComplaintData,
} from '@/lib/services/codeEnforcementIntegration'
import {
  openLegalAidIntakeForm,
  NORTHERN_NEVADA_LEGAL_AID,
  doesIssueQualifyForLegalAid,
  doesIssueSuggestUrgentLegalAction,
  type LegalAidReferralData,
} from '@/lib/data/legalAidReferral'
import { downloadHabitabilityNoticePDF, getHabitabilityNoticeFilename, type HabitabilityNoticeData } from '@/lib/pdf/strikeNoticePDF'

interface IssueSuggestionProps {
  buildingAddress: string
  onSubmit: (message: string) => void
  onClose: () => void
}

export function IssueSuggestion({ buildingAddress, onSubmit, onClose }: IssueSuggestionProps) {
  const { t } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [showExternalActions, setShowExternalActions] = useState(false)

  // Get short address (first part before comma)
  const shortAddress = buildingAddress.split(',')[0]

  const handleSubmit = () => {
    if (!selectedCategory || !title.trim()) return

    // Format: [ISSUE:category:title@address] description
    // Include address so linked property groups can identify source
    let message = `[ISSUE:${selectedCategory}:${title.trim()}@${shortAddress}]`
    if (description.trim()) {
      message += ` ${description.trim()}`
    }

    onSubmit(message)
    onClose()
  }

  // Handle filing code enforcement complaint
  const handleFileCodeEnforcementComplaint = () => {
    const complaintData: CodeEnforcementComplaintData = {
      buildingAddress,
      issueType: selectedCategory || 'habitability',
      issueDescription: description || title,
    }
    openRenoCodeEnforcementForm(complaintData)
  }

  // Handle legal aid referral
  const handleOpenLegalAid = () => {
    openLegalAidIntakeForm()
  }

  // Handle download habitability notice
  const handleDownloadHabitabilityNotice = () => {
    const noticeData: HabitabilityNoticeData = {
      recipientName: 'Landlord/Property Manager',
      propertyAddress: buildingAddress,
      tenantNames: ['(Tenant Name 1)', '(Tenant Name 2)'], // Placeholder - will be filled by user
      habitabilityIssues: [
        {
          label: title || 'Multiple habitability issues',
          description: description || 'See attached documentation',
          count: undefined,
        },
      ],
    }

    const filename = getHabitabilityNoticeFilename(buildingAddress)
    downloadHabitabilityNoticePDF(noticeData, filename)
  }

  const selectedCategoryInfo = COMPLAINT_CATEGORIES.find(c => c.key === selectedCategory)

  // Check if issue type qualifies for legal aid
  const qualifiesForLegalAid = doesIssueQualifyForLegalAid(selectedCategory)
  const isUrgentLegalIssue = doesIssueSuggestUrgentLegalAction(selectedCategory)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-gray-900">{t('issueSuggestion.title')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            &times;
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          {t('issueSuggestion.subtitle', { address: buildingAddress })}
        </p>

        <div className="space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('issueSuggestion.issueCategory')}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
            >
              <option value="">{t('issueSuggestion.selectCategory')}</option>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('issueSuggestion.issueTitle')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('issueSuggestion.issueTitlePlaceholder')}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
              maxLength={100}
            />
            {title.length >= 80 && (
              <p className="text-xs text-gray-400 mt-1">{title.length}/100</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('issueSuggestion.details')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('issueSuggestion.detailsPlaceholder')}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red resize-none"
              maxLength={500}
            />
            {description.length >= 400 && (
              <p className="text-xs text-gray-400 mt-1">{description.length}/500</p>
            )}
          </div>

          {/* Preview */}
          {selectedCategory && title.trim() && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">{t('issueSuggestion.preview')}:</p>
              <div className="flex items-start gap-2">
                <span className="text-red-500 text-lg">!</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">
                    {selectedCategoryInfo?.label}
                  </p>
                  {description.trim() && (
                    <p className="text-xs text-gray-600 mt-1">{description}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* How voting works info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-blue-700">
              <p className="font-medium">{t('issueSuggestion.howVotingWorks')}</p>
              <ul className="mt-1 space-y-0.5 list-disc list-inside text-blue-600">
                <li>{t('issueSuggestion.tenantsCanVote')}</li>
                <li>{t('issueSuggestion.promotesDemand')}</li>
                <li>{t('issueSuggestion.rejectsIssue')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* External action options (when issue is described) */}
        {(title.trim() || description.trim()) && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs font-semibold text-green-900 mb-2">
              ✨ {t('issueSuggestion.externalActions')}
            </p>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={handleFileCodeEnforcementComplaint}
                className="block w-full text-left px-2 py-1.5 rounded bg-white hover:bg-green-100 border border-green-200 text-green-900 font-medium transition-colors"
              >
                📋 {t('issueSuggestion.fileCodeEnforcement')}
              </button>
              {qualifiesForLegalAid && (
                <button
                  onClick={handleOpenLegalAid}
                  className={`block w-full text-left px-2 py-1.5 rounded bg-white border font-medium transition-colors ${
                    isUrgentLegalIssue
                      ? 'border-red-300 text-red-900 hover:bg-red-100'
                      : 'border-blue-200 text-blue-900 hover:bg-blue-100'
                  }`}
                >
                  {isUrgentLegalIssue ? '⚠️ ' : '⚖️ '} {t('issueSuggestion.getLegalAid')}
                </button>
              )}
              <button
                onClick={handleDownloadHabitabilityNotice}
                className="block w-full text-left px-2 py-1.5 rounded bg-white hover:bg-purple-100 border border-purple-200 text-purple-900 font-medium transition-colors"
              >
                📄 {t('issueSuggestion.downloadDemandLetter')}
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedCategory || !title.trim()}
            className="px-4 py-2 text-sm bg-rstu-red text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('issueSuggestion.submitIssue')}
          </button>
        </div>
      </div>
    </div>
  )
}
