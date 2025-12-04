'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Tab = 'home' | 'reading'

interface TabContextType {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

const TAB_STORAGE_KEY = 'rstu_active_tab'

export function TabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<Tab>('home')

  // Load saved tab on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(TAB_STORAGE_KEY) as Tab | null
      if (saved && (saved === 'home' || saved === 'reading')) {
        setActiveTab(saved)
      }
    }
  }, [])

  // Save tab when it changes
  const handleSetActiveTab = (tab: Tab) => {
    setActiveTab(tab)
    if (typeof window !== 'undefined') {
      localStorage.setItem(TAB_STORAGE_KEY, tab)
    }
  }

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab: handleSetActiveTab }}>
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
