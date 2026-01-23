'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Citation, findCitation } from '@/data/citations'

interface CitationContextType {
  activeCitation: Citation | null
  citationNumber: number | null
  openCitation: (id: string, number: number) => void
  closeCitation: () => void
  isOpen: boolean
}

const CitationContext = createContext<CitationContextType | undefined>(undefined)

export function CitationProvider({ children }: { children: ReactNode }) {
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null)
  const [citationNumber, setCitationNumber] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const openCitation = useCallback((id: string, number: number) => {
    const citation = findCitation(id)
    if (citation) {
      setActiveCitation(citation)
      setCitationNumber(number)
      setIsOpen(true)
    }
  }, [])

  const closeCitation = useCallback(() => {
    setIsOpen(false)
    // Delay clearing content for animation
    setTimeout(() => {
      setActiveCitation(null)
      setCitationNumber(null)
    }, 200)
  }, [])

  return (
    <CitationContext.Provider value={{ activeCitation, citationNumber, openCitation, closeCitation, isOpen }}>
      {children}
    </CitationContext.Provider>
  )
}

export function useCitation() {
  const context = useContext(CitationContext)
  if (!context) {
    throw new Error('useCitation must be used within a CitationProvider')
  }
  return context
}
