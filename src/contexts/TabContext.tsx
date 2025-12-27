'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type Tab = 'home' | 'reading' | 'mutualAid' | 'tools' | 'profile'

interface TabContextType {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

export function TabProvider({ children }: { children: ReactNode }) {
  // Always default to 'home' (organize) tab - disabled "remember where you left off" feature
  const [activeTab, setActiveTab] = useState<Tab>('home')

  // Update tab without saving to localStorage
  const handleSetActiveTab = (tab: Tab) => {
    setActiveTab(tab)
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
