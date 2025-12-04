'use client'

import { getReadingState } from '@/lib/readingStorage'
import type { ReadingDocument } from '@/lib/getReadingData'

interface ReadingCardProps {
  document: ReadingDocument
  isSelected: boolean
  onClick: () => void
  isAdminAuthenticated?: boolean
  isHidden?: boolean
  onEdit?: (doc: ReadingDocument) => void
  onHide?: (docId: string) => void
  onDelete?: (docId: string, title: string) => void
}

export function ReadingCard({
  document,
  isSelected,
  onClick,
  isAdminAuthenticated = false,
  isHidden = false,
  onEdit,
  onHide,
  onDelete
}: ReadingCardProps) {
  const state = getReadingState()
  const isFavorited = state.favorites.includes(document.id)
  const progress = state.progress[document.id]

  // Calculate reading time (250 words per minute average)
  const readingTime = Math.ceil(document.wordCount / 250)

  return (
    <li
      className={`p-3 cursor-pointer hover:bg-gray-50 transition border-l-4 ${
        isSelected
          ? 'bg-red-50 border-l-rstu-red'
          : 'border-l-transparent'
      } ${isHidden ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className={`font-semibold text-sm text-gray-900 truncate ${isHidden ? 'line-through' : ''}`}>
            {document.title}
          </h3>

          {/* Meta info */}
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <span>{document.category}</span>
            <span>•</span>
            <span>{readingTime} min read</span>
            {isFavorited && <span className="text-yellow-500">★</span>}
          </div>

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

        {/* Admin controls */}
        {isAdminAuthenticated && (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onEdit?.(document)}
              className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
              title="Edit"
            >
              Edit
            </button>
            <button
              onClick={() => onHide?.(document.id)}
              className={`px-2 py-1 text-xs rounded ${
                isHidden
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
              title={isHidden ? 'Show' : 'Hide'}
            >
              {isHidden ? 'Show' : 'Hide'}
            </button>
            <button
              onClick={() => onDelete?.(document.id, document.title)}
              className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200"
              title="Delete"
            >
              Del
            </button>
          </div>
        )}
      </div>
    </li>
  )
}
