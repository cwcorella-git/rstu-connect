'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import ReactMarkdown from 'react-markdown'

interface LegalDocumentOverlayProps {
  isOpen: boolean
  onClose: () => void
  filename: string
  title: string
}

export function LegalDocumentOverlay({ isOpen, onClose, filename, title }: LegalDocumentOverlayProps) {
  const { t } = useLanguage()
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !filename) return

    setLoading(true)
    setError(null)

    // Fetch from public/legal-templates/
    const basePath = process.env.NODE_ENV === 'production' ? '/rstu-connect' : ''
    fetch(`${basePath}/legal-templates/${filename}`)
      .then(res => {
        if (!res.ok) throw new Error('Document not found')
        return res.text()
      })
      .then(text => {
        // Strip YAML frontmatter if present
        const contentWithoutFrontmatter = text.replace(/^---[\s\S]*?---\n*/m, '')
        setContent(contentWithoutFrontmatter)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [isOpen, filename])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate pr-4">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rstu-red"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {content && (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            {t('common.close') || 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper to map document slugs to filenames
export const LEGAL_DOCUMENT_MAP: Record<string, { filename: string; title: string }> = {
  'data-requests-washoe-eviction-data-request': {
    filename: 'washoe-eviction-data-request.md',
    title: 'Public Records Request: Washoe County Eviction Data',
  },
  'data-requests-washoe-code-enforcement-request': {
    filename: 'washoe-code-enforcement-request.md',
    title: 'Public Records Request: Code Enforcement & Housing Violations',
  },
  // Legislation
  'legislation-ab121': {
    filename: 'AB121_EN.md',
    title: 'Assembly Bill 121 - Tenant Protections',
  },
  'legislation-ab223': {
    filename: 'AB223_EN.md',
    title: 'Assembly Bill 223',
  },
  'legislation-sb283': {
    filename: 'senate-bill-no-283.md',
    title: 'Senate Bill 283',
  },
  'legislation-sb285': {
    filename: 'senate-bill-no-285-2025.md',
    title: 'Senate Bill 285 (2025)',
  },
}
