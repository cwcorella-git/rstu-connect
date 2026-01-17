'use client'

import {
  PencilSquareIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import { getReadingState } from '@/lib/readingStorage'
import type { ReadingDocument } from '@/lib/getReadingData'

interface ReadingCardProps {
  document: ReadingDocument
  isSelected: boolean
  onClick: () => void
  isAdminAuthenticated?: boolean
  isHidden?: boolean
  isFeatured?: boolean
  onEdit?: (doc: ReadingDocument) => void
  onHide?: (docId: string) => void
  onDelete?: (docId: string, title: string) => void
  onToggleFavorite?: (docId: string) => void
  onPolish?: (docId: string) => void
  onFeature?: (docId: string) => void
}

export function ReadingCard({
  document,
  isSelected,
  onClick,
  isAdminAuthenticated = false,
  isHidden = false,
  isFeatured = false,
  onEdit,
  onHide,
  onDelete,
  onToggleFavorite,
  onPolish,
  onFeature
}: ReadingCardProps) {
  const { t } = useLanguage()
  const state = getReadingState()
  const isFavorited = state.favorites.includes(document.id)
  const progress = state.progress[document.id]

  // Calculate reading time (250 words per minute average)
  const readingTime = Math.ceil(document.wordCount / 250)

  return (
    <li
      className={`group p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
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
          <h3 className={`font-semibold text-sm text-gray-900 leading-tight line-clamp-2 ${isHidden ? 'line-through' : ''}`}>
            {document.title}
            {document.polished && (
              <span
                className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium bg-yellow-50 text-yellow-700 rounded border border-yellow-200 align-middle"
                title="Polished document - curated by RSTU organizers"
              >
                <SparklesIcon className="w-3 h-3" />
              </span>
            )}
          </h3>

          {/* Author and date subtitle */}
          <p className="text-xs text-gray-600 mt-0.5 truncate">
            {document.author ? (
              <>
                <span>{document.author}</span>
                {document.date && <span> · {document.date}</span>}
              </>
            ) : document.date ? (
              <span>{document.date}</span>
            ) : (
              <span className="text-gray-400 italic">Unknown author</span>
            )}
          </p>

          {/* Meta info - reading time and favorite */}
          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
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

        {/* Admin controls - shown on hover (always visible on mobile) */}
        {isAdminAuthenticated && (
          <div
            className="flex gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Polished indicator (read-only for static site) */}
            <button
              onClick={() => {
                alert('Polished status is set in document YAML frontmatter. Add "polished: true" to mark a document as polished.');
              }}
              className={`p-1.5 rounded transition-all ${
                document.polished
                  ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                  : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'
              }`}
              title={document.polished ? 'Polished document (set in frontmatter)' : 'Not polished (set in frontmatter)'}
              aria-label={document.polished ? 'Polished document' : 'Not polished'}
            >
              <SparklesIcon className="w-4 h-4" />
            </button>

            {/* Feature for landing page */}
            <button
              onClick={() => onFeature?.(document.id)}
              className={`p-1.5 rounded transition-all ${
                isFeatured
                  ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                  : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
              }`}
              title={isFeatured ? 'Featured on landing page - click to unfeature' : 'Feature on landing page'}
              aria-label={isFeatured ? 'Featured document' : 'Feature this document'}
            >
              {isFeatured ? '★' : '☆'}
            </button>

            {/* Edit */}
            <button
              onClick={() => onEdit?.(document)}
              className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
              title={t('reading.edit') || 'Edit document title'}
              aria-label={t('reading.edit') || 'Edit document'}
            >
              <PencilSquareIcon className="w-4 h-4" />
            </button>

            {/* Hide/Show toggle */}
            <button
              onClick={() => onHide?.(document.id)}
              className={`p-1.5 rounded transition-all ${
                isHidden
                  ? 'text-green-600 bg-green-50 hover:bg-green-100'
                  : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
              }`}
              title={isHidden ? t('reading.show') || 'Show document (currently hidden)' : t('reading.hide') || 'Hide document from non-admins'}
              aria-label={isHidden ? t('reading.show') || 'Show document' : t('reading.hide') || 'Hide document'}
            >
              {isHidden ? (
                <EyeIcon className="w-4 h-4" />
              ) : (
                <EyeSlashIcon className="w-4 h-4" />
              )}
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete?.(document.id, document.title)}
              className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
              title={t('common.delete') || 'Delete document (permanent)'}
              aria-label={t('common.delete') || 'Delete document'}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </li>
  )
}
