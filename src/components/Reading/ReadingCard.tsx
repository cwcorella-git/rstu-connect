'use client'

import { getReadingState } from '@/lib/readingStorage'
import type { ReadingDocument } from '@/lib/getReadingData'

interface ReadingCardProps {
  document: ReadingDocument
  isSelected: boolean
  onClick: () => void
}

export function ReadingCard({ document, isSelected, onClick }: ReadingCardProps) {
  const state = getReadingState()
  const isFavorited = state.favorites.includes(document.id)
  const progress = state.progress[document.id]

  // Calculate reading time (250 words per minute average)
  const readingTime = Math.ceil(document.wordCount / 250)

  return (
    <li
      className={`p-4 cursor-pointer hover:bg-gray-50 transition border-l-4 ${
        isSelected
          ? 'bg-red-50 border-l-rstu-red'
          : 'border-l-transparent'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="font-semibold text-sm text-gray-900 truncate">
            {document.title}
          </h3>

          {/* Category badge */}
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
              {document.category}
            </span>
            <span className="text-xs text-gray-500">
              {readingTime} min read
            </span>
          </div>

          {/* Excerpt */}
          <p className="mt-2 text-xs text-gray-600 line-clamp-2">
            {document.excerpt}
          </p>

          {/* Progress indicator */}
          {progress && progress.scrollPercent > 5 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rstu-red"
                  style={{ width: `${progress.scrollPercent}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {Math.round(progress.scrollPercent)}%
              </span>
            </div>
          )}
        </div>

        {/* Favorite star */}
        {isFavorited && (
          <span className="text-yellow-500 text-sm">★</span>
        )}
      </div>
    </li>
  )
}
