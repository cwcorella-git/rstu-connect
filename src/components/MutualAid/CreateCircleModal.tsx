'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  createCircle,
  type Circle,
  type CircleCategory,
  CIRCLE_CATEGORIES,
} from '@/lib/storage/circleStorage'
import { SUGGESTED_INTERESTS, INTEREST_LABELS } from '@/lib/storage/profileStorage'

interface CreateCircleModalProps {
  onClose: () => void
  onCreate: (circle: Circle) => void
}

export function CreateCircleModal({ onClose, onCreate }: CreateCircleModalProps) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<CircleCategory>('social')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(true)
  const [chatEnabled, setChatEnabled] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError(t('circles.errorNameRequired') || 'Circle name is required')
      return
    }

    if (!description.trim()) {
      setError(t('circles.errorDescriptionRequired') || 'Description is required')
      return
    }

    setIsCreating(true)

    const circle = createCircle({
      name: name.trim(),
      description: description.trim(),
      category,
      interests: selectedInterests,
      isOpen,
      chatEnabled,
    })

    setIsCreating(false)

    if (circle) {
      onCreate(circle)
    } else {
      setError(t('circles.errorCreateFailed') || 'Failed to create circle. Please try again.')
    }
  }

  const categoryKeys = Object.keys(CIRCLE_CATEGORIES) as CircleCategory[]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('circles.createTitle') || 'Create a Circle'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('circles.nameLabel') || 'Circle Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('circles.namePlaceholder') || 'e.g., Reno Book Club'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
              maxLength={50}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('circles.descriptionLabel') || 'Description'}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('circles.descriptionPlaceholder') || 'What is this circle about?'}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent resize-none"
              maxLength={500}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('circles.categoryLabel') || 'Category'}
            </label>
            <div className="flex flex-wrap gap-2">
              {categoryKeys.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    category === cat
                      ? 'bg-rstu-red text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t(`circles.category.${cat}`) || CIRCLE_CATEGORIES[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('circles.interestsLabel') || 'Interest Tags (optional)'}
            </label>
            <p className="text-xs text-gray-500 mb-2">
              {t('circles.interestsHelp') || 'Help others discover your circle by adding relevant interests'}
            </p>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-md">
              {SUGGESTED_INTERESTS.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-2 py-1 rounded-full text-xs transition-colors ${
                    selectedInterests.includes(interest)
                      ? 'bg-rstu-red text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {INTEREST_LABELS[interest] || interest}
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isOpen}
                onChange={(e) => setIsOpen(e.target.checked)}
                className="rounded border-gray-300 text-rstu-red focus:ring-rstu-red"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  {t('circles.openJoin') || 'Open to join'}
                </span>
                <p className="text-xs text-gray-500">
                  {t('circles.openJoinHelp') || 'Anyone can join without approval'}
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={chatEnabled}
                onChange={(e) => setChatEnabled(e.target.checked)}
                className="rounded border-gray-300 text-rstu-red focus:ring-rstu-red"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  {t('circles.enableChat') || 'Enable chat'}
                </span>
                <p className="text-xs text-gray-500">
                  {t('circles.enableChatHelp') || 'Create a group chat for members'}
                </p>
              </div>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t('common.cancel') || 'Cancel'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCreating || !name.trim() || !description.trim()}
            className="flex-1 px-4 py-2 text-sm text-white bg-rstu-red rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? t('common.creating') || 'Creating...' : t('circles.create') || 'Create Circle'}
          </button>
        </div>
      </div>
    </div>
  )
}
