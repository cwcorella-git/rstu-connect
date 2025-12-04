'use client'

import { useState, useMemo } from 'react'
import { ReadingCard } from './ReadingCard'
import { CategoryFilter } from './CategoryFilter'
import type { ReadingDocument } from '@/lib/getReadingData'

interface ReadingListProps {
  documents: ReadingDocument[]
  categories: string[]
  selectedDocument: ReadingDocument | null
  onSelectDocument: (doc: ReadingDocument) => void
}

export function ReadingList({ documents, categories, selectedDocument, onSelectDocument }: ReadingListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  // Filter documents by search and category
  const filteredDocuments = useMemo(() => {
    let filtered = documents

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(doc => doc.category === selectedCategory)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(query) ||
        doc.excerpt.toLowerCase().includes(query) ||
        doc.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [documents, searchQuery, selectedCategory])

  return (
    <div className="w-2/5 border-r border-gray-200 flex flex-col bg-white">
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

        {/* Category Filter */}
        <CategoryFilter
          categories={['All', ...categories]}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
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
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
