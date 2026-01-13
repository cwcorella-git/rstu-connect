'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

type Tab = 'landing' | 'home' | 'reading' | 'mutualAid' | 'tools' | 'profile' | 'governance'

interface TabContextType {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  markLandingAsSeen: () => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

export function TabProvider({ children }: { children: ReactNode }) {
  // Start with landing for first-time visitors, then switch to home for returning users
  const [activeTab, setActiveTab] = useState<Tab>('landing')
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize tab based on localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Always default to landing page - users can navigate from there
      setActiveTab('landing')
    }
    setIsInitialized(true)
  }, [])

  // Update tab without saving to localStorage
  const handleSetActiveTab = (tab: Tab) => {
    setActiveTab(tab)
  }

  // Mark landing page as seen - prevents showing it again on return visits
  const markLandingAsSeen = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rstu_has_seen_landing', 'true')
    }
  }

  // Don't render children until we've checked localStorage
  if (!isInitialized) {
    return null
  }

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab: handleSetActiveTab, markLandingAsSeen }}>
      {children}
    </TabContext.Provider>
  )
}

export function useTab() {
  const context = useContext(TabContext)
  if (context === undefined) {
    throw new Error('useTab must be used within a TabProvider')
  }
  return context
}
