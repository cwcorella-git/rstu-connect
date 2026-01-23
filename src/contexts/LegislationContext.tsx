'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { LegislationSection, findLegislation } from '@/data/nevada-legislation'

interface LegislationContextType {
  // Currently displayed legislation
  activeLegislation: LegislationSection | null
  // Open the popup with a specific citation
  openLegislation: (citation: string) => void
  // Close the popup
  closeLegislation: () => void
  // Check if popup is open
  isOpen: boolean
}

const LegislationContext = createContext<LegislationContextType | null>(null)

export function LegislationProvider({ children }: { children: ReactNode }) {
  const [activeLegislation, setActiveLegislation] = useState<LegislationSection | null>(null)

  const openLegislation = useCallback((citation: string) => {
    const legislation = findLegislation(citation)
    if (legislation) {
      setActiveLegislation(legislation)
    } else {
      // If not found, create a placeholder
      setActiveLegislation({
        citation,
        title: 'Statute Not Found',
        chapter: '',
        summary: `The full text for ${citation} is not yet available in our database.`,
        fullText: `The full text for ${citation} has not been added to our legislation database yet.\n\nYou can look up this statute at:\nhttps://www.leg.state.nv.us/nrs/`,
        practicalTips: ['Visit the Nevada Legislature website to read the full text']
      })
    }
  }, [])

  const closeLegislation = useCallback(() => {
    setActiveLegislation(null)
  }, [])

  return (
    <LegislationContext.Provider
      value={{
        activeLegislation,
        openLegislation,
        closeLegislation,
        isOpen: activeLegislation !== null
      }}
    >
      {children}
    </LegislationContext.Provider>
  )
}

export function useLegislation() {
  const context = useContext(LegislationContext)
  if (!context) {
    throw new Error('useLegislation must be used within a LegislationProvider')
  }
  return context
}
