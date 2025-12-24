'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type Tab = 'home' | 'reading' | 'mutualAid' | 'tools' | 'profile'

interface TabContextType {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

const TAB_STORAGE_KEY = 'rstu_active_tab'
const validTabs: Tab[] = ['home', 'reading', 'mutualAid', 'tools', 'profile']

export function TabProvider({ children }: { children: ReactNode }) {
  // Synchronous localStorage read - prevents flash of wrong tab
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (typeof window === 'undefined') return 'home'
    const saved = localStorage.getItem(TAB_STORAGE_KEY) as Tab | null
    if (saved && validTabs.includes(saved)) {
      return saved
    }
    return 'home'
  })

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
