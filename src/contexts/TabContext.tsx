'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'

type Tab = 'landing' | 'home' | 'reading' | 'mutualAid' | 'resources' | 'tools' | 'profile' | 'governance'

interface TabContextType {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  markLandingAsSeen: () => void
  /** Push a sub-view entry so browser back returns to list view (mobile detail views) */
  pushSubView: () => void
  /** True when a sub-view history entry is active (use to detect back from detail) */
  subViewActive: boolean
}

const TabContext = createContext<TabContextType | undefined>(undefined)

// Tab <-> hash mapping
const TAB_TO_HASH: Record<Tab, string> = {
  landing: '',
  home: 'organize',
  reading: 'reading',
  mutualAid: 'mutual-aid',
  resources: 'resources',
  tools: 'tools',
  profile: 'profile',
  governance: 'governance',
}

const HASH_TO_TAB: Record<string, Tab> = Object.fromEntries(
  Object.entries(TAB_TO_HASH).map(([tab, hash]) => [hash, tab as Tab])
) as Record<string, Tab>

/** Read the current tab from the URL hash */
function tabFromHash(): Tab | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash.replace('#', '')
  return HASH_TO_TAB[hash] ?? null
}

/** Build a URL string for a given hash, preserving query params */
function hashUrl(hash: string): string {
  const search = window.location.search
  const base = window.location.pathname
  return hash ? `${base}${search}#${hash}` : `${base}${search}`
}

export function TabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTabState] = useState<Tab>('landing')
  const [subViewActive, setSubViewActive] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const isPopState = useRef(false)

  // Initialize: read tab from hash on mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsInitialized(true)
      return
    }

    const hashTab = tabFromHash()
    if (hashTab) {
      setActiveTabState(hashTab)
      // Replace current history entry with correct state
      history.replaceState({ tab: hashTab, sub: false }, '', hashUrl(TAB_TO_HASH[hashTab]))
    } else {
      // No hash — default to landing
      history.replaceState({ tab: 'landing', sub: false }, '', hashUrl(''))
    }

    setIsInitialized(true)
  }, [])

  // Listen for popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state

      if (state?.tab) {
        isPopState.current = true
        setActiveTabState(state.tab)
        setSubViewActive(!!state.sub)
      } else {
        // Fallback: read from hash
        const tab = tabFromHash() || 'landing'
        isPopState.current = true
        setActiveTabState(tab)
        setSubViewActive(false)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // User-initiated tab navigation — pushes history
  const setActiveTab = useCallback((tab: Tab) => {
    setActiveTabState(tab)
    setSubViewActive(false)

    if (typeof window === 'undefined') return

    const hash = TAB_TO_HASH[tab]
    history.pushState({ tab, sub: false }, '', hashUrl(hash))
  }, [])

  // Push a sub-view entry (for mobile detail views)
  // Browser back will pop this entry, setting subViewActive to false
  const pushSubView = useCallback(() => {
    setSubViewActive(true)

    if (typeof window === 'undefined') return

    const hash = TAB_TO_HASH[activeTab]
    history.pushState({ tab: activeTab, sub: true }, '', hashUrl(hash))
  }, [activeTab])

  const markLandingAsSeen = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rstu_has_seen_landing', 'true')
    }
  }, [])

  if (!isInitialized) {
    return null
  }

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab, markLandingAsSeen, pushSubView, subViewActive }}>
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
