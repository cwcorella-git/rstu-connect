'use client'
import { createLogger } from '@/lib/logger'
const log = createLogger('MutualAid')

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { getCurrentProfile } from '@/lib/profileStorage'
import {
  type InternalCollectiveCategory,
  COLLECTIVE_CATEGORY_LABELS,
  createInternalOrganization,
} from '@/lib/organizationStorage'
import { createProposal } from '@/lib/governanceStorage'

interface FormCollectiveModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: (orgId: string) => void
}

type Step = 'info' | 'category' | 'visibility' | 'confirm'

const CATEGORY_DESC_KEYS: Record<InternalCollectiveCategory, string> = {
  working_group: 'collective.workingGroupDesc',
  neighborhood: 'collective.neighborhoodDesc',
  affinity: 'collective.affinityDesc',
  committee: 'collective.committeeDesc',
  other: 'collective.otherDesc',
}

export function FormCollectiveModal({ isOpen, onClose, onCreated }: FormCollectiveModalProps) {
  const { t } = useLanguage()
  const [step, setStep] = useState<Step>('info')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<InternalCollectiveCategory>('working_group')
  const [isPublic, setIsPublic] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const profile = getCurrentProfile()

  const handleSubmit = async () => {
    if (!profile) {
      setError(t('collective.mustBeLoggedIn'))
      return
    }

    if (!name.trim() || !description.trim()) {
      setError(t('collective.nameDescRequired'))
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Create the organization
      const org = createInternalOrganization({
        name: name.trim(),
        description: description.trim(),
        category,
        createdBy: profile.id,
        isPublic
      })

      if (!org) {
        setError(t('collective.createFailed'))
        setIsSubmitting(false)
        return
      }

      // Create a formation proposal to announce to the community
      // This allows others to "endorse" the new collective
      createProposal(
        'form-collective',
        org.chatSlug,  // Use the org's chat slug as groupId
        {
          targetValue: org.name,
          reason: `${profile.nickname} is forming a new ${COLLECTIVE_CATEGORY_LABELS[category]}: ${org.name}. ${org.description}`,
        }
      )

      // Success - notify parent and close
      onCreated?.(org.id)
      handleClose()
    } catch (e) {
      log.error('Error creating collective:', e)
      setError(t('collective.errorTryAgain'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep('info')
    setName('')
    setDescription('')
    setCategory('working_group')
    setIsPublic(true)
    setError(null)
    onClose()
  }

  const canProceed = () => {
    switch (step) {
      case 'info':
        return name.trim().length >= 3 && description.trim().length >= 10
      case 'category':
        return true
      case 'visibility':
        return true
      case 'confirm':
        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    switch (step) {
      case 'info':
        setStep('category')
        break
      case 'category':
        setStep('visibility')
        break
      case 'visibility':
        setStep('confirm')
        break
      case 'confirm':
        handleSubmit()
        break
    }
  }

  const prevStep = () => {
    switch (step) {
      case 'category':
        setStep('info')
        break
      case 'visibility':
        setStep('category')
        break
      case 'confirm':
        setStep('visibility')
        break
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t('collective.formTitle')}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('collective.stepOf', { step: step === 'info' ? 1 : step === 'category' ? 2 : step === 'visibility' ? 3 : 4, total: 4 })}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Step 1: Basic Info */}
          {step === 'info' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('collective.collectiveName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('collective.namePlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                  maxLength={60}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t('collective.charactersCount', { count: name.length, max: 60 })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('common.description')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('collective.descPlaceholder')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent resize-none"
                  maxLength={500}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t('collective.charactersCountMin', { count: description.length, max: 500, min: 10 })}
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Category */}
          {step === 'category' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                {t('collective.whatType')}
              </p>

              {(Object.keys(COLLECTIVE_CATEGORY_LABELS) as InternalCollectiveCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    category === cat
                      ? 'border-rstu-red bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{COLLECTIVE_CATEGORY_LABELS[cat]}</span>
                    {category === cat && (
                      <svg className="w-5 h-5 text-rstu-red" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t(CATEGORY_DESC_KEYS[cat])}</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Visibility */}
          {step === 'visibility' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                {t('collective.whoCanSee')}
              </p>

              <button
                onClick={() => setIsPublic(true)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  isPublic
                    ? 'border-rstu-red bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isPublic ? 'bg-rstu-red text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('collective.publicCollective')}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('collective.publicDescription')}
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setIsPublic(false)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  !isPublic
                    ? 'border-rstu-red bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    !isPublic ? 'bg-rstu-red text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('collective.privateCollective')}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('collective.privateDescription')}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">{t('collective.reviewTitle')}</h3>

                <dl className="space-y-2 text-sm">
                  <div className="flex">
                    <dt className="w-24 text-gray-500">{t('collective.nameField')}</dt>
                    <dd className="flex-1 text-gray-900 font-medium">{name}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 text-gray-500">{t('collective.typeField')}</dt>
                    <dd className="flex-1 text-gray-900">{COLLECTIVE_CATEGORY_LABELS[category]}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 text-gray-500">{t('collective.visibilityField')}</dt>
                    <dd className="flex-1 text-gray-900">{isPublic ? t('collective.public') : t('network.private')}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 text-gray-500">{t('collective.descField')}</dt>
                    <dd className="flex-1 text-gray-900">{description}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-1">{t('collective.whatHappensNext')}</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>- {t('collective.createdImmediately')}</li>
                  <li>- {t('collective.firstPointPerson')}</li>
                  <li>- {t('collective.formationAnnouncement')}</li>
                  <li>- {t('collective.othersCanJoin')}</li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-3 flex-shrink-0">
          {step === 'info' ? (
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('common.cancel')}
            </button>
          ) : (
            <button
              onClick={prevStep}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('common.back')}
            </button>
          )}

          <button
            onClick={nextStep}
            disabled={!canProceed() || isSubmitting}
            className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              canProceed() && !isSubmitting
                ? 'bg-rstu-red hover:bg-red-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isSubmitting
              ? t('collective.creating')
              : step === 'confirm'
              ? t('collective.formTitle')
              : t('collective.continue')}
          </button>
        </div>
      </div>
    </div>
  )
}
