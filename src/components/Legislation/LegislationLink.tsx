'use client'

import { ReactNode } from 'react'
import { useLegislation } from '@/contexts/LegislationContext'
import { NRS_PATTERN, findLegislation } from '@/data/nevada-legislation'

interface LegislationLinkProps {
  citation: string
  children?: ReactNode
  className?: string
}

/**
 * Clickable link for a specific NRS citation
 */
export function LegislationLink({ citation, children, className = '' }: LegislationLinkProps) {
  const { openLegislation } = useLegislation()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    openLegislation(citation)
  }

  const legislation = findLegislation(citation)
  const hasFullText = !!legislation

  return (
    <button
      onClick={handleClick}
      className={`inline text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium ${
        hasFullText ? '' : 'opacity-75'
      } ${className}`}
      title={legislation ? `${legislation.title} - Click to view full text` : `Click to view ${citation}`}
    >
      {children || citation}
    </button>
  )
}

interface LegislationTextProps {
  children: string
  className?: string
}

/**
 * Auto-linkify all NRS citations in text
 */
export function LegislationText({ children, className = '' }: LegislationTextProps) {
  const { openLegislation } = useLegislation()

  // Split text by NRS pattern and create clickable links
  const parts: (string | ReactNode)[] = []
  let lastIndex = 0
  const text = children

  // Reset the regex
  NRS_PATTERN.lastIndex = 0

  let match
  while ((match = NRS_PATTERN.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    // Add the clickable citation
    const citation = match[0].toUpperCase().replace(/\s+/g, ' ')
    parts.push(
      <button
        key={match.index}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          openLegislation(citation)
        }}
        className="inline text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
        title={`Click to view ${citation}`}
      >
        {match[0]}
      </button>
    )

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return <span className={className}>{parts}</span>
}
