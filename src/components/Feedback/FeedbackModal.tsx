'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { submitFeedback } from '@/lib/feedbackStorage'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'feature' | 'bug'
}

export function FeedbackModal({ isOpen, onClose, type }: FeedbackModalProps) {
  const { t } = useLanguage()
  const titleInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Focus title input when modal opens
  useEffect(() => {
    if (isOpen) {
      titleInputRef.current?.focus()
      // Reset form when opening
      setTitle('')
      setDescription('')
      setEmail('')
      setError(null)
      setShowSuccess(false)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!title.trim()) {
      setError('Please enter a title')
      return
    }
    if (!description.trim()) {
      setError('Please enter a description')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await submitFeedback({
        type,
        title: title.trim(),
        description: description.trim(),
        contactEmail: email.trim() || undefined,
      })

      if (result.success) {
        setShowSuccess(true)
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setError(result.error || 'Failed to submit feedback')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const isFeature = type === 'feature'
  const modalTitle = isFeature ? t('feedback.featureTitle') : t('feedback.bugTitle')
  const descPlaceholder = isFeature ? t('feedback.featurePlaceholder') : t('feedback.bugPlaceholder')

  // Icons
  const LightbulbIcon = (
    <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  )

  const BugIcon = (
    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )

  const SuccessIcon = (
    <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {showSuccess ? (
          // Success state
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              {SuccessIcon}
            </div>
            <p className="text-lg font-medium text-gray-900">
              {t('feedback.thankYou')}
            </p>
          </div>
        ) : (
          // Form state
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
              <div className="flex-shrink-0">
                {isFeature ? LightbulbIcon : BugIcon}
              </div>
              <h2 className="text-lg font-semibold text-gray-900 flex-1">
                {modalTitle}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Error message */}
                {error && (
                  <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                    {error}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label htmlFor="feedback-title" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('feedback.titleLabel')} *
                  </label>
                  <input
                    ref={titleInputRef}
                    id="feedback-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('feedback.titlePlaceholder')}
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                  />
                  <div className="text-xs text-gray-400 mt-1 text-right">
                    {title.length}/100
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="feedback-description" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('feedback.descriptionLabel')} *
                  </label>
                  <textarea
                    id="feedback-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={descPlaceholder}
                    rows={5}
                    maxLength={1000}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rstu-red focus:border-transparent resize-none"
                  />
                  <div className="text-xs text-gray-400 mt-1 text-right">
                    {description.length}/1000
                  </div>
                </div>

                {/* Email (optional) */}
                <div>
                  <label htmlFor="feedback-email" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('feedback.emailLabel')}
                  </label>
                  <input
                    id="feedback-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('feedback.emailPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  {t('feedback.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-rstu-red rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '...' : t('feedback.submit')}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
