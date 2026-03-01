'use client'

import { useState, useEffect, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  createCustomCategory,
  categoryNameExists,
  type CustomCategory,
} from '@/lib/storage/organizationStorage'
import { IconPicker } from '@/components/shared/IconPicker'

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (category: CustomCategory) => void
  creatorId: string
}

export function AddCategoryModal({
  isOpen,
  onClose,
  onCreated,
  creatorId,
}: AddCategoryModalProps) {
  const { t } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('')
      setSelectedIcon(null)
      setError('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // Check for duplicate name on change
  const nameError = name.trim().length >= 2 && categoryNameExists(name)
    ? t('resources.categoryExists')
    : ''

  const canSubmit = name.trim().length >= 2 && selectedIcon !== null && !nameError && !isSubmitting

  const handleSubmit = () => {
    if (!canSubmit) return

    setError('')
    setIsSubmitting(true)

    try {
      const category = createCustomCategory(name.trim(), selectedIcon!, creatorId)
      onCreated(category)
    } catch (e) {
      setError(t('resources.errorCreatingCategory'))
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {t('resources.addCategoryTitle')}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-5">
          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('resources.categoryName')}
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 40))}
              placeholder={t('resources.categoryNamePlaceholder')}
              className={`w-full px-3 py-2 border rounded-lg
                focus:ring-2 focus:ring-rstu-red focus:border-rstu-red
                text-gray-900 placeholder-gray-400 ${
                  nameError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
            />
            <div className="flex justify-between mt-1">
              {nameError ? (
                <p className="text-xs text-red-600">{nameError}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-gray-500">
                {name.length}/40 {t('resources.characters')}
              </p>
            </div>
          </div>

          {/* Icon Picker */}
          <IconPicker
            selectedIcon={selectedIcon}
            onSelectIcon={setSelectedIcon}
            label={t('resources.chooseIcon')}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              canSubmit
                ? 'bg-rstu-red text-white hover:bg-rstu-red-dark'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? t('common.creating') : t('resources.createCategory')}
          </button>
        </div>
      </div>
    </div>
  )
}

// Re-export ICON_MAP for backwards compatibility
export { ICON_MAP as CUSTOM_ICON_MAP } from '@/components/shared/IconPicker'
