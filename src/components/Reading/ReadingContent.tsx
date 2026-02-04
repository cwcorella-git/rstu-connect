'use client'
import { createLogger } from '@/lib/utils/logger'
const log = createLogger('Reading')

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { ReadingHeader } from './ReadingHeader'
import { saveReadingProgress, getDocumentProgress } from '@/lib/storage/readingStorage'
import { getDocumentEdit } from '@/lib/storage/adminStorage'
import { trackActivity } from '@/lib/storage/profileStorage'
import { useLanguage } from '@/contexts/LanguageContext'
import type { ReadingDocument } from '@/lib/data/getReadingData'

// Strip YAML frontmatter from markdown content
function stripFrontmatter(content: string): string {
  // Match frontmatter at the start: ---\n...\n---
  const frontmatterRegex = /^---\s*\n[\s\S]*?\n---\s*\n?/
  return content.replace(frontmatterRegex, '').trim()
}

interface ReadingContentProps {
  document: ReadingDocument
  showBackButton?: boolean
  onBack?: () => void
}

export function ReadingContent({ document, showBackButton, onBack }: ReadingContentProps) {
  const { t } = useLanguage()
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
      setContent(stripFrontmatter(editedDoc.content))
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
    const basePath = '/rstu-connect'
    fetch(`${basePath}/documents/${encodeURIComponent(document.category)}/${encodeURIComponent(document.filename)}`)
      .then(res => res.text())
      .then(text => {
        setContent(stripFrontmatter(text))
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
        log.error('Failed to load document:', err)
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

      {/* Content Area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-8"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">{t('reading.loading')}</div>
          </div>
        ) : (
          <article className="prose prose-sm max-w-none">
            {isEdited && (
              <div className="mb-4 notranslate">
                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">
                  {t('reading.editedLocally') || 'Edited Locally'}
                </span>
              </div>
            )}
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        )}
      </div>
    </div>
  )
}
