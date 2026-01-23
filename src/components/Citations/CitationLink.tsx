'use client'

import { useCitation } from '@/contexts/CitationContext'
import { findCitation } from '@/data/citations'

interface CitationLinkProps {
  /** The citation ID from citations.ts */
  id: string
  /** The display number [1], [2], etc. */
  number: number
  /** Optional additional class names */
  className?: string
}

/**
 * Wikipedia-style citation link [1]
 * Clicking opens a popup with the full source information
 */
export function CitationLink({ id, number, className = '' }: CitationLinkProps) {
  const { openCitation } = useCitation()
  const citation = findCitation(id)

  if (!citation) {
    console.warn(`Citation not found: ${id}`)
    return <span className="text-gray-400">[{number}]</span>
  }

  return (
    <button
      onClick={() => openCitation(id, number)}
      className={`inline-flex items-center justify-center text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium align-super ${className}`}
      title={citation.title}
      aria-label={`Citation ${number}: ${citation.title}`}
    >
      [{number}]
    </button>
  )
}

interface CitationGroupProps {
  /** Array of citation IDs in order */
  ids: string[]
  /** Starting number for this group */
  startNumber?: number
  /** Optional additional class names */
  className?: string
}

/**
 * Multiple citations grouped together [1][2][3]
 */
export function CitationGroup({ ids, startNumber = 1, className = '' }: CitationGroupProps) {
  return (
    <span className={className}>
      {ids.map((id, index) => (
        <CitationLink key={id} id={id} number={startNumber + index} />
      ))}
    </span>
  )
}
