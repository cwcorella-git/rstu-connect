'use client'

import { useState, useEffect, useMemo } from 'react'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  deleteCustomCategory,
  getExternalOrganizationsByCategory,
  type CustomCategory,
} from '@/lib/storage/organizationStorage'

interface DeleteCategoryDialogProps {
  isOpen: boolean
  onClose: () => void
  onDeleted: () => void
  category: CustomCategory
}

export function DeleteCategoryDialog({
  isOpen,
  onClose,
  onDeleted,
  category,
}: DeleteCategoryDialogProps) {
  const { t } = useLanguage()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  // Check if category has organizations
  const orgCount = useMemo(() => {
    if (!isOpen) return 0
    return getExternalOrganizationsByCategory(category.id).length
  }, [isOpen, category.id])

  const hasOrgs = orgCount > 0
  const canDelete = !hasOrgs && !isDeleting

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setIsDeleting(false)
      setError('')
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

  const handleDelete = () => {
    if (!canDelete) return

    setIsDeleting(true)
    setError('')

    try {
      const success = deleteCustomCategory(category.id)
      if (success) {
        onDeleted()
      } else {
        setError(t('resources.errorDeletingCategory'))
        setIsDeleting(false)
      }
    } catch (e) {
      setError(t('resources.errorDeletingCategory'))
      setIsDeleting(false)
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

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {t('resources.deleteConfirmTitle')}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {hasOrgs ? (
            // Warning: Cannot delete with organizations
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-gray-700 font-medium mb-1">
                  {t('resources.cannotDeleteWithOrgs')}
                </p>
                <p className="text-sm text-gray-500">
                  {t('resources.removeOrgsFirst', { count: orgCount.toString() })}
                </p>
              </div>
            </div>
          ) : (
            // Confirmation message
            <p className="text-gray-700">
              {t('resources.deleteConfirmMessage', { name: category.name })}
            </p>
          )}
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
            onClick={handleDelete}
            disabled={!canDelete}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              canDelete
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isDeleting ? t('common.deleting') : t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  )
}
