'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react'
import {
  type DisplayPreferences,
  type LayoutPreset,
  type DisplayDensity,
  type TabId,
  type SectionVisibility,
  getDisplayPreferences,
  saveDisplayPreferences,
  applyLayoutPreset as applyPreset,
  setPanelWidth as setWidth,
  togglePanelVisibility as togglePanel,
  toggleSectionVisibility as toggleSection,
  setDisplayDensity as setDensity,
  setTabOrder as setOrder,
  toggleTabVisibility as toggleTab,
  resetDisplayPreferences,
  DEFAULT_PREFERENCES,
} from '@/lib/storage/displayStorage'

// ============================================================================
// Types
// ============================================================================

interface DisplayContextType {
  preferences: DisplayPreferences
  isLoading: boolean

  // Layout preset
  setLayoutPreset: (preset: LayoutPreset) => void

  // Density
  setDensity: (density: DisplayDensity) => void

  // Panel configuration
  setPanelWidth: (tab: keyof DisplayPreferences['panelConfig'], width: number) => void
  togglePanelVisibility: (tab: keyof DisplayPreferences['panelConfig']) => void

  // Section visibility
  toggleSection: <T extends keyof SectionVisibility>(
    tab: T,
    section: keyof SectionVisibility[T]
  ) => void
  isSectionVisible: <T extends keyof SectionVisibility>(
    tab: T,
    section: keyof SectionVisibility[T]
  ) => boolean

  // Tab configuration
  setTabOrder: (order: TabId[]) => void
  toggleTabVisibility: (tab: TabId) => void
  isTabVisible: (tab: TabId) => boolean
  getVisibleTabs: () => TabId[]

  // Reset
  resetToDefaults: () => void
}

const DisplayContext = createContext<DisplayContextType | null>(null)

// ============================================================================
// Provider
// ============================================================================

export function DisplayProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<DisplayPreferences>(DEFAULT_PREFERENCES)
  const [isLoading, setIsLoading] = useState(true)

  // Load preferences from localStorage after hydration
  useEffect(() => {
    const stored = getDisplayPreferences()
    setPreferences(stored)
    setIsLoading(false)
  }, [])

  // Layout preset
  const setLayoutPreset = useCallback((preset: LayoutPreset) => {
    const updated = applyPreset(preset)
    setPreferences(updated)
  }, [])

  // Density
  const setDensityCallback = useCallback((density: DisplayDensity) => {
    const updated = setDensity(density)
    setPreferences(updated)
  }, [])

  // Panel width
  const setPanelWidthCallback = useCallback((
    tab: keyof DisplayPreferences['panelConfig'],
    width: number
  ) => {
    const updated = setWidth(tab, width)
    setPreferences(updated)
  }, [])

  // Panel visibility
  const togglePanelVisibilityCallback = useCallback((
    tab: keyof DisplayPreferences['panelConfig']
  ) => {
    const updated = togglePanel(tab)
    setPreferences(updated)
  }, [])

  // Section visibility
  const toggleSectionCallback = useCallback(<T extends keyof SectionVisibility>(
    tab: T,
    section: keyof SectionVisibility[T]
  ) => {
    const updated = toggleSection(tab, section)
    setPreferences(updated)
  }, [])

  const isSectionVisible = useCallback(<T extends keyof SectionVisibility>(
    tab: T,
    section: keyof SectionVisibility[T]
  ): boolean => {
    return preferences.sectionVisibility[tab][section] as boolean
  }, [preferences.sectionVisibility])

  // Tab order
  const setTabOrderCallback = useCallback((order: TabId[]) => {
    const updated = setOrder(order)
    setPreferences(updated)
  }, [])

  // Tab visibility
  const toggleTabVisibilityCallback = useCallback((tab: TabId) => {
    const updated = toggleTab(tab)
    setPreferences(updated)
  }, [])

  const isTabVisible = useCallback((tab: TabId): boolean => {
    return !preferences.tabConfig.hidden.includes(tab)
  }, [preferences.tabConfig.hidden])

  const getVisibleTabs = useCallback((): TabId[] => {
    return preferences.tabConfig.order.filter(tab => !preferences.tabConfig.hidden.includes(tab))
  }, [preferences.tabConfig])

  // Reset
  const resetToDefaults = useCallback(() => {
    const updated = resetDisplayPreferences()
    setPreferences(updated)
  }, [])

  // Memoize context value
  const value = useMemo<DisplayContextType>(() => ({
    preferences,
    isLoading,
    setLayoutPreset,
    setDensity: setDensityCallback,
    setPanelWidth: setPanelWidthCallback,
    togglePanelVisibility: togglePanelVisibilityCallback,
    toggleSection: toggleSectionCallback,
    isSectionVisible,
    setTabOrder: setTabOrderCallback,
    toggleTabVisibility: toggleTabVisibilityCallback,
    isTabVisible,
    getVisibleTabs,
    resetToDefaults,
  }), [
    preferences,
    isLoading,
    setLayoutPreset,
    setDensityCallback,
    setPanelWidthCallback,
    togglePanelVisibilityCallback,
    toggleSectionCallback,
    isSectionVisible,
    setTabOrderCallback,
    toggleTabVisibilityCallback,
    isTabVisible,
    getVisibleTabs,
    resetToDefaults,
  ])

  return (
    <DisplayContext.Provider value={value}>
      {children}
    </DisplayContext.Provider>
  )
}

// ============================================================================
// Hook
// ============================================================================

export function useDisplay() {
  const context = useContext(DisplayContext)
  if (!context) {
    throw new Error('useDisplay must be used within a DisplayProvider')
  }
  return context
}

/**
 * Convenience hook for getting panel config for a specific tab
 */
export function usePanelConfig(tab: keyof DisplayPreferences['panelConfig']) {
  const { preferences, setPanelWidth, togglePanelVisibility } = useDisplay()

  return {
    config: preferences.panelConfig[tab],
    setWidth: (width: number) => setPanelWidth(tab, width),
    toggleVisibility: () => togglePanelVisibility(tab),
  }
}

/**
 * Convenience hook for checking section visibility
 */
export function useSectionVisibility<T extends keyof SectionVisibility>(tab: T) {
  const { preferences, toggleSection } = useDisplay()

  return {
    visibility: preferences.sectionVisibility[tab],
    toggle: (section: keyof SectionVisibility[T]) => toggleSection(tab, section),
    isVisible: (section: keyof SectionVisibility[T]) =>
      preferences.sectionVisibility[tab][section] as boolean,
  }
}
