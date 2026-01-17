'use client'

import { useState, useEffect } from 'react'
import { toggleFavorite, getReadingState } from '@/lib/readingStorage'
import { isAdmin } from '@/lib/profileStorage'
import { useEditMode } from '@/contexts/EditModeContext'
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

// Normalize tag capitalization
function normalizeTag(tag: string): string {
  // Keep acronyms uppercase (IWW, RSTU, etc.)
  if (tag === tag.toUpperCase() && tag.length <= 5) return tag
  // Capitalize first letter of each word
  return tag.split(' ').map(word => {
    if (word.length <= 2) return word.toLowerCase()
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  }).join(' ')
}

interface ReadingHeaderProps {
  document: ReadingDocument
  showBackButton?: boolean
  onBack?: () => void
}

export function ReadingHeader({ document, showBackButton, onBack }: ReadingHeaderProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [showCopied, setShowCopied] = useState(false)
  const [isTagsHovered, setIsTagsHovered] = useState(false)
  const { isEditMode, toggleEditMode } = useEditMode()
  const userIsAdmin = isAdmin()

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

  // Normalize all tags for consistent display
  const allTags = document.tags?.map(normalizeTag) || []
  const visibleCount = isTagsHovered ? allTags.length : 3
  const displayTags = allTags.slice(0, visibleCount)
  const hiddenCount = allTags.length - 3

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

      {/* Author and date */}
      {(document.author || document.date) && (
        <p className="mt-1 text-sm text-gray-600">
          {document.author && <span>{document.author}</span>}
          {document.author && document.date && <span> · </span>}
          {document.date && <span>{document.date}</span>}
        </p>
      )}

      {/* Meta row: reading time, tags, favorite, share */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <div
          className="flex items-center gap-2 overflow-hidden"
          onMouseEnter={() => setIsTagsHovered(true)}
          onMouseLeave={() => setIsTagsHovered(false)}
        >
          <span className="flex-shrink-0">{Math.ceil(document.wordCount / 250)} min</span>
          {allTags.length > 0 && (
            <>
              <span className="flex-shrink-0">•</span>
              <div
                className={`flex items-center gap-1 transition-all duration-300 ${
                  isTagsHovered ? 'flex-wrap overflow-visible' : 'overflow-hidden'
                }`}
              >
                {displayTags.map((tag, i) => {
                  const color = getTagColor(tag)
                  return (
                    <span
                      key={i}
                      className={`px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${color.bg} ${color.text}`}
                    >
                      {tag}
                    </span>
                  )
                })}
                {!isTagsHovered && hiddenCount > 0 && (
                  <button
                    onClick={() => setIsTagsHovered(true)}
                    onBlur={() => setIsTagsHovered(false)}
                    className="text-gray-400 flex-shrink-0 cursor-pointer hover:text-gray-600 min-h-[28px] min-w-[28px] flex items-center justify-center"
                    title={`${hiddenCount} more: ${allTags.slice(3).join(', ')}`}
                  >
                    +{hiddenCount}
                  </button>
                )}
                {isTagsHovered && hiddenCount > 0 && (
                  <button
                    onClick={() => setIsTagsHovered(false)}
                    className="text-gray-400 flex-shrink-0 cursor-pointer hover:text-gray-600 min-h-[28px] min-w-[28px] flex items-center justify-center"
                    title="Show fewer tags"
                  >
                    −
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
          {/* Edit Mode Toggle - Admin only */}
          {userIsAdmin && (
            <button
              onClick={toggleEditMode}
              className={`flex items-center gap-1 transition min-w-[44px] min-h-[44px] justify-center ${
                isEditMode
                  ? 'text-blue-600 hover:text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title={isEditMode ? 'Exit Edit Mode (Ctrl+Shift+E)' : 'Enter Edit Mode (Ctrl+Shift+E)'}
              aria-label={isEditMode ? 'Exit edit mode' : 'Enter edit mode'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}

          <button
            onClick={handleToggleFavorite}
            className={`flex items-center gap-1 transition min-w-[44px] min-h-[44px] justify-center ${
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
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition min-w-[44px] min-h-[44px] justify-center"
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
