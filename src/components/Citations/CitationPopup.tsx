'use client'

import { useEffect } from 'react'
import { useCitation } from '@/contexts/CitationContext'

/**
 * Popup overlay displaying citation/source information
 * Similar to Wikipedia reference popups
 */
export function CitationPopup() {
  const { activeCitation, citationNumber, isOpen, closeCitation } = useCitation()

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCitation()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeCitation])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen || !activeCitation) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={closeCitation}
        aria-hidden="true"
      />

      {/* Popup */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-white text-blue-600 px-2 py-0.5 rounded text-sm font-bold">
              [{citationNumber}]
            </span>
            <span className="font-semibold">Source</span>
          </div>
          <button
            onClick={closeCitation}
            className="text-white/80 hover:text-white transition-colors p-1"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            {activeCitation.title}
          </h3>

          {/* Metadata */}
          <div className="space-y-2 text-sm mb-4">
            {activeCitation.author && (
              <p className="text-gray-700">
                <span className="font-medium text-gray-900">Author:</span> {activeCitation.author}
              </p>
            )}
            {activeCitation.source && (
              <p className="text-gray-700">
                <span className="font-medium text-gray-900">Source:</span> {activeCitation.source}
              </p>
            )}
            {activeCitation.date && (
              <p className="text-gray-700">
                <span className="font-medium text-gray-900">Date:</span> {activeCitation.date}
              </p>
            )}
            {activeCitation.accessDate && (
              <p className="text-gray-700">
                <span className="font-medium text-gray-900">Accessed:</span> {activeCitation.accessDate}
              </p>
            )}
          </div>

          {/* Description */}
          {activeCitation.description && (
            <div className="mb-4">
              <p className="text-gray-600 text-sm">{activeCitation.description}</p>
            </div>
          )}

          {/* Quote */}
          {activeCitation.quote && (
            <div className="mb-4 p-3 bg-gray-50 border-l-4 border-blue-500 rounded-r">
              <p className="text-gray-700 text-sm italic">&ldquo;{activeCitation.quote}&rdquo;</p>
            </div>
          )}

          {/* URL */}
          {activeCitation.url && (
            <div className="pt-3 border-t border-gray-200">
              <a
                href={activeCitation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Source
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
