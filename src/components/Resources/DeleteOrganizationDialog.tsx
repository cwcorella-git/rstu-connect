'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  deleteExternalOrganization,
  type ExternalOrganization,
} from '@/lib/storage/organizationStorage'

interface DeleteOrganizationDialogProps {
  isOpen: boolean
  onClose: () => void
  onDeleted: () => void
  organization: ExternalOrganization
}

export function DeleteOrganizationDialog({
  isOpen,
  onClose,
  onDeleted,
  organization,
}: DeleteOrganizationDialogProps) {
  const { t } = useLanguage()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

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
    if (isDeleting) return

    setIsDeleting(true)
    setError('')

    try {
      deleteExternalOrganization(organization.id)
      onDeleted()
    } catch (e) {
      setError(t('resources.errorDeletingOrg'))
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
            {t('resources.deleteOrgTitle')}
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

          <p className="text-gray-700">
            {t('resources.deleteOrgMessage', { name: organization.name })}
          </p>
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
            disabled={isDeleting}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !isDeleting
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
