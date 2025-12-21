'use client'

import { useState, useMemo, useEffect, useRef, useDeferredValue } from 'react'
import { ReadingCard } from './ReadingCard'
import { getReadingState } from '@/lib/readingStorage'
import type { ReadingDocument } from '@/lib/getReadingData'
import { searchDocuments, USE_SUPABASE, DocumentSearchResult } from '@/lib/supabase'

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

// Convert Supabase search result to ReadingDocument
function searchResultToDocument(result: DocumentSearchResult): ReadingDocument {
  return {
    id: result.id,
    title: result.title,
    category: result.category,
    filename: result.filename,
    slug: result.slug,
    excerpt: result.excerpt || '',
    wordCount: 0,
    lastModified: '',
    tags: [],
  }
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
  // Split search state: inputValue is immediate (responsive typing), searchQuery is deferred
  const [inputValue, setInputValue] = useState('')
  const searchQuery = useDeferredValue(inputValue)
  const [searchResults, setSearchResults] = useState<ReadingDocument[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced Supabase FTS search
  useEffect(() => {
    const query = searchQuery.trim()

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // If no query, clear search results
    if (!query) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    // Debounce search by 300ms
    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      if (USE_SUPABASE) {
        // Use Supabase FTS
        const results = await searchDocuments(query, undefined, 100)
        if (results.length > 0) {
          setSearchResults(results.map(searchResultToDocument))
          setIsSearching(false)
          return
        }
      }

      // Fallback to client-side search
      const queryLower = query.toLowerCase()
      const results = documents.filter(doc =>
        doc.title.toLowerCase().includes(queryLower) ||
        doc.excerpt.toLowerCase().includes(queryLower)
      )
      setSearchResults(results)
      setIsSearching(false)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, documents])

  // Get filtered documents - use search results or all documents
  const filteredDocuments = useMemo(() => {
    const state = getReadingState()
    const hasQuery = searchQuery.trim().length > 0

    // Use search results if searching, otherwise show all documents
    const filtered = hasQuery ? searchResults : documents

    // Sort: Favorites at the top, then alphabetically by title
    return filtered.sort((a, b) => {
      const aFav = state.favorites.includes(a.id)
      const bFav = state.favorites.includes(b.id)

      if (aFav && !bFav) return -1
      if (!aFav && bFav) return 1
      return a.title.localeCompare(b.title)
    })
  }, [documents, searchResults, searchQuery])

  const hasQuery = inputValue.trim().length > 0

  return (
    <div className="h-full border-r border-gray-200 flex flex-col bg-white">
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-gray-200 space-y-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Reading Library</h2>
          <span className="text-xs text-gray-500">
            {isSearching ? (
              <span className="text-gray-400">Searching...</span>
            ) : (
              <>
                {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
              </>
            )}
          </span>
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search documents..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
        />
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto">
        {isSearching ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            <div className="animate-pulse">Searching documents...</div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            {hasQuery ? `No documents match "${searchQuery}"` : 'No documents found'}
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
