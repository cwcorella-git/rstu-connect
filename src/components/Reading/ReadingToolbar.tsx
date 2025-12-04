'use client'

import { useState, useEffect } from 'react'
import { toggleFavorite, getReadingState } from '@/lib/readingStorage'
import type { ReadingDocument } from '@/lib/getReadingData'

interface ReadingToolbarProps {
  document: ReadingDocument
}

export function ReadingToolbar({ document }: ReadingToolbarProps) {
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
    const url = `${window.location.origin}/toolkit?doc=${document.slug}`
    navigator.clipboard.writeText(url)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">
          {document.category}
        </span>
        <span>•</span>
        <span>{Math.ceil(document.wordCount / 250)} min read</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className={`flex items-center gap-1 text-xs transition ${
            isFavorited
              ? 'text-yellow-500 hover:text-yellow-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <span className="text-base">{isFavorited ? '★' : '☆'}</span>
          Favorite
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition relative"
          title="Copy link to document"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {showCopied ? 'Copied!' : 'Share'}
        </button>
      </div>
    </div>
  )
}
