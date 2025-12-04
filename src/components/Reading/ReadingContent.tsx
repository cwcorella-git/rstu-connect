'use client'

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { ReadingToolbar } from './ReadingToolbar'
import { saveReadingProgress, getDocumentProgress } from '@/lib/readingStorage'
import type { ReadingDocument } from '@/lib/getReadingData'

interface ReadingContentProps {
  document: ReadingDocument
}

export function ReadingContent({ document }: ReadingContentProps) {
  const [content, setContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimerRef = useRef<NodeJS.Timeout>()

  // Load markdown content
  useEffect(() => {
    setIsLoading(true)
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
  }, [document.id, document.category, document.filename])

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
      {/* Toolbar */}
      <ReadingToolbar document={document} />

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
          <article className="prose prose-sm max-w-none">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {document.title}
            </h1>
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        )}
      </div>
    </div>
  )
}
