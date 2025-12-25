'use client'

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { ReadingHeader } from './ReadingHeader'
import { TranslateWidget } from './TranslateWidget'
import { saveReadingProgress, getDocumentProgress } from '@/lib/readingStorage'
import { getDocumentEdit } from '@/lib/adminStorage'
import { trackActivity } from '@/lib/profileStorage'
import type { ReadingDocument } from '@/lib/getReadingData'

interface ReadingContentProps {
  document: ReadingDocument
  showBackButton?: boolean
  onBack?: () => void
}

export function ReadingContent({ document, showBackButton, onBack }: ReadingContentProps) {
  const [content, setContent] = useState<string>('')
  const [title, setTitle] = useState<string>(document.title)
  const [isLoading, setIsLoading] = useState(true)
  const [isEdited, setIsEdited] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimerRef = useRef<NodeJS.Timeout>()

  // Load markdown content
  useEffect(() => {
    setIsLoading(true)

    // Track document read activity
    trackActivity('document')

    // Check for edited version first
    const editedDoc = getDocumentEdit(document.id)
    if (editedDoc) {
      setContent(editedDoc.content)
      setTitle(editedDoc.title)
      setIsEdited(true)
      setIsLoading(false)

      // Restore scroll position
      const progress = getDocumentProgress(document.id)
      if (progress && containerRef.current) {
        setTimeout(() => {
          containerRef.current?.scrollTo(0, progress.scrollPosition)
        }, 100)
      }
      return
    }

    // Otherwise load original from server
    setIsEdited(false)
    setTitle(document.title)
    const basePath = process.env.NODE_ENV === 'production' ? '/rstu-connect' : ''
    fetch(`${basePath}/documents/${encodeURIComponent(document.category)}/${encodeURIComponent(document.filename)}`)
      .then(res => res.text())
      .then(text => {
        setContent(text)
        setIsLoading(false)

        // Restore scroll position
        const progress = getDocumentProgress(document.id)
        if (progress && containerRef.current) {
          setTimeout(() => {
            containerRef.current?.scrollTo(0, progress.scrollPosition)
          }, 100)
        }
      })
      .catch(err => {
        console.error('Failed to load document:', err)
        setIsLoading(false)
      })
  }, [document.id, document.category, document.filename, document.title])

  // Save scroll position with debouncing
  const handleScroll = () => {
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)

    scrollTimerRef.current = setTimeout(() => {
      if (!containerRef.current) return

      const scrollTop = containerRef.current.scrollTop
      const scrollHeight = containerRef.current.scrollHeight - containerRef.current.clientHeight
      const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0

      saveReadingProgress(document.id, scrollTop, scrollPercent)
    }, 500)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with title, tags, and actions */}
      <ReadingHeader
        document={document}
        showBackButton={showBackButton}
        onBack={onBack}
      />

      {/* Translate Widget */}
      <div className="px-8 pt-4 pb-2 border-b border-gray-100 bg-gray-50">
        <TranslateWidget />
      </div>

      {/* Content Area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-8"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading...</div>
          </div>
        ) : (
          <article className="prose prose-sm max-w-none notranslate" translate="no">
            {isEdited && (
              <div className="mb-4">
                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">
                  Edited locally
                </span>
              </div>
            )}
            <div className="translate" translate="yes">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </article>
        )}
      </div>
    </div>
  )
}
