'use client'

import { useState, useEffect } from 'react'
import { ReadingList } from '@/components/Reading/ReadingList'
import { ReadingContent } from '@/components/Reading/ReadingContent'
import { getReadingState } from '@/lib/readingStorage'
import type { ReadingDocument } from '@/lib/getReadingData'

// Import manifest (generated at build time)
import readingManifest from '@/data/reading-manifest.json'

export default function ToolkitPage() {
  const documents = readingManifest.documents as ReadingDocument[]

  // Restore last-read document from localStorage
  const [selectedDocument, setSelectedDocument] = useState<ReadingDocument | null>(() => {
    if (typeof window === 'undefined') return documents[0] || null

    const state = getReadingState()
    return documents.find(doc => doc.id === state.lastDocument) || documents[0] || null
  })

  // Handle URL deep linking
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const docSlug = urlParams.get('doc')

    if (docSlug) {
      const doc = documents.find(d => d.slug === docSlug)
      if (doc) setSelectedDocument(doc)
    }
  }, [documents])

  return (
    <div className="flex h-screen" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Left: Reading List (40% width) */}
      <ReadingList
        documents={documents}
        categories={readingManifest.categories}
        selectedDocument={selectedDocument}
        onSelectDocument={setSelectedDocument}
      />

      {/* Right: Content Viewer (60% width) */}
      <div className="w-3/5 flex flex-col bg-white relative">
        {selectedDocument ? (
          <ReadingContent document={selectedDocument} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a document to read
          </div>
        )}
      </div>
    </div>
  )
}
