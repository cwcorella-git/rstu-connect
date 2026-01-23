'use client'

import { useEffect } from 'react'
import { useLegislation } from '@/contexts/LegislationContext'

export function LegislationPopup() {
  const { activeLegislation, closeLegislation, isOpen } = useLegislation()

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeLegislation()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeLegislation])

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

  if (!isOpen || !activeLegislation) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={closeLegislation}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg font-bold text-rstu-red">
              {activeLegislation.citation}
            </h2>
            <p className="text-base font-semibold text-gray-900 mt-1">
              {activeLegislation.title}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {activeLegislation.chapter}
            </p>
          </div>
          <button
            onClick={closeLegislation}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-blue-800 mb-1">Summary</h3>
            <p className="text-sm text-blue-900">{activeLegislation.summary}</p>
          </div>

          {/* Full Text */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Full Text</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                {activeLegislation.fullText}
              </pre>
            </div>
          </div>

          {/* Practical Tips */}
          {activeLegislation.practicalTips && activeLegislation.practicalTips.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-green-800 mb-2">Practical Tips</h3>
              <ul className="space-y-1">
                {activeLegislation.practicalTips.map((tip, i) => (
                  <li key={i} className="text-sm text-green-900 flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Sections */}
          {activeLegislation.relatedSections && activeLegislation.relatedSections.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Related Sections</h3>
              <div className="flex flex-wrap gap-2">
                {activeLegislation.relatedSections.map((section) => (
                  <RelatedSectionButton key={section} citation={section} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-lg">
          <p className="text-xs text-gray-500 text-center">
            Source: Nevada Revised Statutes •{' '}
            <a
              href="https://www.leg.state.nv.us/nrs/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Official NRS Website
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

// Button to open related sections
function RelatedSectionButton({ citation }: { citation: string }) {
  const { openLegislation } = useLegislation()

  return (
    <button
      onClick={() => openLegislation(citation)}
      className="text-sm px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
    >
      {citation}
    </button>
  )
}
