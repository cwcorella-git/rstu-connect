'use client'

import { useState, useEffect } from 'react'
import { toggleFavorite, getReadingState } from '@/lib/readingStorage'
import type { ReadingDocument } from '@/lib/getReadingData'

// Color palette for tags - consistent colors based on tag content
const TAG_COLORS = [
  { bg: 'bg-red-100', text: 'text-red-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  { bg: 'bg-lime-100', text: 'text-lime-700' },
  { bg: 'bg-green-100', text: 'text-green-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-teal-100', text: 'text-teal-700' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  { bg: 'bg-sky-100', text: 'text-sky-700' },
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { bg: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700' },
  { bg: 'bg-pink-100', text: 'text-pink-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
]

// Simple hash function for consistent tag colors
function getTagColor(tag: string): { bg: string; text: string } {
  const normalizedTag = tag.toLowerCase().trim()
  let hash = 0
  for (let i = 0; i < normalizedTag.length; i++) {
    hash = ((hash << 5) - hash) + normalizedTag.charCodeAt(i)
    hash = hash & hash // Convert to 32-bit integer
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

interface ReadingHeaderProps {
  document: ReadingDocument
  showBackButton?: boolean
  onBack?: () => void
}

export function ReadingHeader({ document, showBackButton, onBack }: ReadingHeaderProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [showCopied, setShowCopied] = useState(false)

  useEffect(() => {
    const state = getReadingState()
    setIsFavorited(state.favorites.includes(document.id))
  }, [document.id])

  const handleToggleFavorite = () => {
    const newState = toggleFavorite(document.id)
    setIsFavorited(newState)
  }

  const handleShare = () => {
    const url = `${window.location.origin}/?doc=${document.slug}`
    navigator.clipboard.writeText(url)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }

  // Display tags (up to 3 on mobile, 5 on desktop) - no category fallback
  const displayTags = document.tags?.slice(0, 5) || []
  const hasMoreTags = (document.tags?.length || 0) > 5

  return (
    <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
      {/* Title row with back button */}
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Back to document list"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        <h2 className="flex-1 text-lg font-bold text-gray-900 truncate">
          {document.title}
        </h2>
      </div>

      {/* Meta row: reading time, tags, favorite, share */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex-shrink-0">{Math.ceil(document.wordCount / 250)} min</span>
          {displayTags.length > 0 && (
            <>
              <span className="flex-shrink-0">•</span>
              <div className="flex items-center gap-1 overflow-hidden">
                {displayTags.slice(0, 3).map((tag, i) => {
                  const color = getTagColor(tag)
                  return (
                    <span
                      key={i}
                      className={`px-2 py-0.5 rounded-full truncate max-w-[80px] ${color.bg} ${color.text}`}
                    >
                      {tag}
                    </span>
                  )
                })}
                {displayTags.slice(3, 5).map((tag, i) => {
                  const color = getTagColor(tag)
                  return (
                    <span
                      key={i + 3}
                      className={`hidden md:inline-flex px-2 py-0.5 rounded-full truncate max-w-[80px] ${color.bg} ${color.text}`}
                    >
                      {tag}
                    </span>
                  )
                })}
                {hasMoreTags && (
                  <span className="text-gray-400 flex-shrink-0">+{(document.tags?.length || 0) - 5}</span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
          <button
            onClick={handleToggleFavorite}
            className={`flex items-center gap-1 transition ${
              isFavorited
                ? 'text-yellow-500 hover:text-yellow-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <span className="text-base">{isFavorited ? '★' : '☆'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition"
            title="Copy link to document"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {showCopied && <span>Copied!</span>}
          </button>
        </div>
      </div>
    </div>
  )
}
