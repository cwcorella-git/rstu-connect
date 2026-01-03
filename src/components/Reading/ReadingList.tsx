'use client'

import { useState, useMemo, useEffect, useRef, useDeferredValue, useCallback, memo } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { ReadingCard } from './ReadingCard'
import { getReadingState, toggleFavorite } from '@/lib/readingStorage'
import type { ReadingDocument } from '@/lib/getReadingData'
import { searchDocuments, USE_SUPABASE, DocumentSearchResult } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'

interface ReadingListProps {
  documents: ReadingDocument[]
  categories: string[]
  selectedDocument: ReadingDocument | null
  onSelectDocument: (doc: ReadingDocument) => void
  isAdminAuthenticated?: boolean
  hiddenDocuments?: string[]
  featuredDocuments?: string[]
  onEdit?: (doc: ReadingDocument) => void
  onHide?: (docId: string) => void
  onDelete?: (docId: string, title: string) => void
  onPolish?: (docId: string) => void
  onFeature?: (docId: string) => void
}

// Convert Supabase search result to ReadingDocument
function searchResultToDocument(result: DocumentSearchResult): ReadingDocument {
  return {
    id: result.id,
    title: result.title,
    author: result.author || null,
    date: result.date || null,
    category: result.category,
    filename: result.filename,
    slug: result.slug,
    excerpt: result.excerpt || '',
    wordCount: 0,
    lastModified: '',
    tags: [],
  }
}

// Memoized category group to prevent unnecessary re-renders
interface CategoryGroupProps {
  category: string
  documents: ReadingDocument[]
  isExpanded: boolean
  onToggle: (category: string) => void
  onSelectDocument: (doc: ReadingDocument) => void
  selectedDocument: ReadingDocument | null
  isAdminAuthenticated?: boolean
  hiddenDocuments?: string[]
  featuredDocuments?: string[]
  onEdit?: (doc: ReadingDocument) => void
  onHide?: (docId: string) => void
  onDelete?: (docId: string, title: string) => void
  onToggleFavorite?: (docId: string) => void
  onPolish?: (docId: string) => void
  onFeature?: (docId: string) => void
}

const CategoryGroup = memo(({
  category,
  documents,
  isExpanded,
  onToggle,
  onSelectDocument,
  selectedDocument,
  isAdminAuthenticated,
  hiddenDocuments,
  featuredDocuments,
  onEdit,
  onHide,
  onDelete,
  onToggleFavorite,
  onPolish,
  onFeature
}: CategoryGroupProps) => {
  return (
    <div className="border-b border-gray-100">
      {/* Category Header - Styled with RSTU red and design consistency */}
      <button
        onClick={() => onToggle(category)}
        className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-200
          ${isExpanded
            ? 'bg-red-50 hover:bg-red-100'
            : 'hover:bg-gray-50'
          }`}
      >
        {/* Chevron Icon with rotation animation */}
        <ChevronDownIcon
          className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
            isExpanded ? 'rotate-0 text-rstu-red' : '-rotate-90 text-gray-400'
          }`}
        />

        {/* Category Name */}
        <span className={`font-semibold transition-colors duration-200 ${
          isExpanded ? 'text-rstu-red' : 'text-gray-900'
        }`}>
          {category}
        </span>

        {/* Document Count */}
        <span className="text-xs text-gray-500 font-normal ml-auto">
          ({documents.length})
        </span>
      </button>

      {/* Documents in Category - CSS-based expand/collapse animation */}
      <div className={`overflow-hidden bg-gray-50 transition-all duration-300 ease-in-out
        ${isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <ul>
          {documents.map((doc) => (
            <ReadingCard
              key={doc.id}
              document={doc}
              isSelected={selectedDocument?.id === doc.id}
              onClick={() => onSelectDocument(doc)}
              isAdminAuthenticated={isAdminAuthenticated}
              isHidden={hiddenDocuments?.includes(doc.id) ?? false}
              isFeatured={featuredDocuments?.includes(doc.id) ?? false}
              onEdit={onEdit}
              onHide={onHide}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              onPolish={onPolish}
              onFeature={onFeature}
            />
          ))}
        </ul>
      </div>
    </div>
  )
})

CategoryGroup.displayName = 'CategoryGroup'

export function ReadingList({
  documents,
  categories,
  selectedDocument,
  onSelectDocument,
  isAdminAuthenticated = false,
  hiddenDocuments = [],
  featuredDocuments = [],
  onEdit,
  onHide,
  onDelete,
  onPolish,
  onFeature
}: ReadingListProps) {
  const { t } = useLanguage()
  // Split search state: inputValue is immediate (responsive typing), searchQuery is deferred
  const [inputValue, setInputValue] = useState('')
  const searchQuery = useDeferredValue(inputValue)
  const [searchResults, setSearchResults] = useState<ReadingDocument[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Counter to trigger re-render when favorites change
  const [favoriteVersion, setFavoriteVersion] = useState(0)

  // Track which categories are expanded (start collapsed for easy scanning)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  )

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }, [])

  // Handle favorite toggle and trigger re-sort
  const handleToggleFavorite = useCallback((docId: string) => {
    toggleFavorite(docId)
    setFavoriteVersion(v => v + 1)
  }, [])

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

  // Strip dates from title for sorting (keeps dates in display)
  const getTitleForSorting = (title: string): string => {
    // Remove date patterns like "(9_6_2025 10：04：05 AM)" or similar timestamps
    return title.replace(/\s*\(\d+_\d+_\d+\s+[^)]+\)\s*$/i, '').trim()
  }

  // Group and sort documents by category
  const groupedDocuments = useMemo(() => {
    const state = getReadingState()
    const hasQuery = searchQuery.trim().length > 0

    // Use search results if searching, otherwise show all documents
    const baseDocuments = hasQuery ? searchResults : documents

    // Sort: Polished → Favorites → Alphabetical
    const sorted = baseDocuments.sort((a, b) => {
      // 1. Polished documents first
      const aPolished = a.polished || false
      const bPolished = b.polished || false
      if (aPolished && !bPolished) return -1
      if (!aPolished && bPolished) return 1

      // 2. Then favorites
      const aFav = state.favorites.includes(a.id)
      const bFav = state.favorites.includes(b.id)
      if (aFav && !bFav) return -1
      if (!aFav && bFav) return 1

      // 3. Finally alphabetically by title (dates stripped for sorting)
      const aTitleForSort = getTitleForSorting(a.title)
      const bTitleForSort = getTitleForSorting(b.title)
      return aTitleForSort.localeCompare(bTitleForSort)
    })

    // Group by category
    const groups = new Map<string, ReadingDocument[]>()
    categories.forEach(cat => groups.set(cat, []))
    sorted.forEach(doc => {
      const cat = doc.category
      if (!groups.has(cat)) {
        groups.set(cat, [])
      }
      groups.get(cat)!.push(doc)
    })

    // Return as array in category order, filter out empty categories
    return Array.from(groups.entries())
      .filter(([_, docs]) => docs.length > 0)
      .map(([cat, docs]) => ({ category: cat, documents: docs }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents, searchResults, searchQuery, favoriteVersion, categories])

  const hasQuery = inputValue.trim().length > 0

  const totalDocs = groupedDocuments.reduce((sum, group) => sum + group.documents.length, 0)

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 space-y-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{t('reading.library')}</h2>
          <span className="text-xs text-gray-500">
            {isSearching ? (
              <span className="text-gray-400">{t('reading.searching')}</span>
            ) : (
              <>
                {totalDocs} {totalDocs !== 1 ? t('reading.documents') : t('reading.document')}
              </>
            )}
          </span>
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder={t('reading.searchDocs')}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
        />
      </div>

      {/* Document List - Grouped by Category */}
      <div className="flex-1 overflow-y-auto">
        {isSearching ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            <div className="animate-pulse">{t('reading.searchingDocs')}</div>
          </div>
        ) : totalDocs === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            {hasQuery ? <>{t('reading.noMatch')} &quot;{searchQuery}&quot;</> : t('reading.noDocuments')}
          </div>
        ) : (
          <div>
            {groupedDocuments.map(({ category, documents: categoryDocs }) => {
              const isExpanded = expandedCategories.has(category)
              return (
                <CategoryGroup
                  key={category}
                  category={category}
                  documents={categoryDocs}
                  isExpanded={isExpanded}
                  onToggle={toggleCategory}
                  onSelectDocument={onSelectDocument}
                  selectedDocument={selectedDocument}
                  isAdminAuthenticated={isAdminAuthenticated}
                  hiddenDocuments={hiddenDocuments}
                  featuredDocuments={featuredDocuments}
                  onEdit={onEdit}
                  onHide={onHide}
                  onDelete={onDelete}
                  onToggleFavorite={handleToggleFavorite}
                  onPolish={onPolish}
                  onFeature={onFeature}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
