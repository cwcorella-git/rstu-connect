'use client'

import { useLanguage } from '@/contexts/LanguageContext'
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
  onToggleFavorite?: (docId: string) => void
}

export function ReadingCard({
  document,
  isSelected,
  onClick,
  isAdminAuthenticated = false,
  isHidden = false,
  onEdit,
  onHide,
  onDelete,
  onToggleFavorite
}: ReadingCardProps) {
  const { t } = useLanguage()
  const state = getReadingState()
  const isFavorited = state.favorites.includes(document.id)
  const progress = state.progress[document.id]

  // Calculate reading time (250 words per minute average)
  const readingTime = Math.ceil(document.wordCount / 250)

  return (
    <li
      className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-red-50' : 'bg-white'
      } ${isHidden ? 'opacity-60' : ''}`}
      style={{
        borderLeft: isSelected ? '4px solid #cc0000' : '4px solid transparent'
      }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className={`font-semibold text-sm text-gray-900 truncate ${isHidden ? 'line-through' : ''}`}>
            {document.title}
          </h3>

          {/* Author and date subtitle */}
          {(document.author || document.date) && (
            <p className="text-xs text-gray-600 truncate mt-0.5">
              {document.author && <span>{document.author}</span>}
              {document.author && document.date && <span> · </span>}
              {document.date && <span>{document.date}</span>}
            </p>
          )}

          {/* Meta info */}
          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
            <span>{document.category}</span>
            <span>•</span>
            <span>{readingTime} {t('reading.minRead') || 'min read'}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite?.(document.id)
              }}
              className={`text-lg leading-none hover:scale-110 transition-transform ${
                isFavorited ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
              }`}
              title={isFavorited ? t('reading.removeFromFavorites') || 'Remove from favorites' : t('reading.addToFavorites') || 'Add to favorites'}
            >
              {isFavorited ? '★' : '☆'}
            </button>
          </div>

          {/* Progress indicator */}
          {progress && progress.scrollPercent > 5 && (
            <div className="mt-1 flex items-center gap-2">
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
          <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onEdit?.(document)}
              className="px-1.5 py-0.5 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
              title={t('reading.edit') || 'Edit'}
            >
              {t('reading.edit') || 'Edit'}
            </button>
            <button
              onClick={() => onHide?.(document.id)}
              className={`px-1.5 py-0.5 text-xs rounded ${
                isHidden
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
              title={isHidden ? t('reading.show') || 'Show' : t('reading.hide') || 'Hide'}
            >
              {isHidden ? t('reading.show') || 'Show' : t('reading.hide') || 'Hide'}
            </button>
            <button
              onClick={() => onDelete?.(document.id, document.title)}
              className="px-1.5 py-0.5 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200"
              title={t('common.delete') || 'Delete'}
            >
              {t('reading.del') || 'Del'}
            </button>
          </div>
        )}
      </div>
    </li>
  )
}
