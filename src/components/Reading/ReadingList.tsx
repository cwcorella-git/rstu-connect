'use client'

import { useState, useMemo } from 'react'
import { ReadingCard } from './ReadingCard'
import { getReadingState } from '@/lib/readingStorage'
import type { ReadingDocument } from '@/lib/getReadingData'

interface ReadingListProps {
  documents: ReadingDocument[]
  categories: string[]
  selectedDocument: ReadingDocument | null
  onSelectDocument: (doc: ReadingDocument) => void
  isAdminAuthenticated?: boolean
  hiddenDocuments?: string[]
  onEdit?: (doc: ReadingDocument) => void
  onHide?: (docId: string) => void
  onDelete?: (docId: string, title: string) => void
}

export function ReadingList({
  documents,
  categories,
  selectedDocument,
  onSelectDocument,
  isAdminAuthenticated = false,
  hiddenDocuments = [],
  onEdit,
  onHide,
  onDelete
}: ReadingListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter and sort documents by search and favorites
  const filteredDocuments = useMemo(() => {
    const state = getReadingState()
    let filtered = documents

    // Search filter (removed tags and categories)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(query) ||
        doc.excerpt.toLowerCase().includes(query)
      )
    }

    // Sort: Favorites at the top, then alphabetically by title
    return filtered.sort((a, b) => {
      const aFav = state.favorites.includes(a.id)
      const bFav = state.favorites.includes(b.id)

      if (aFav && !bFav) return -1
      if (!aFav && bFav) return 1
      return a.title.localeCompare(b.title)
    })
  }, [documents, searchQuery])

  return (
    <div className="h-full border-r border-gray-200 flex flex-col bg-white">
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Reading Library</h2>
          <span className="text-xs text-gray-500">
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
        />
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto">
        {filteredDocuments.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No documents found
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredDocuments.map((doc) => (
              <ReadingCard
                key={doc.id}
                document={doc}
                isSelected={selectedDocument?.id === doc.id}
                onClick={() => onSelectDocument(doc)}
                isAdminAuthenticated={isAdminAuthenticated}
                isHidden={hiddenDocuments.includes(doc.id)}
                onEdit={onEdit}
                onHide={onHide}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
