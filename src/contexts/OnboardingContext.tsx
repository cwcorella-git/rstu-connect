'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { safeGetJson, safeSetItem } from '@/lib/utils/safeStorage'

// ============================================================================
// Types
// ============================================================================

export interface ChecklistItem {
  key: string
  completed: boolean
  completedAt?: number
}

export interface OnboardingState {
  checklistItems: ChecklistItem[]
  checklistDismissed: boolean
  checklistMinimized: boolean
  toursCompleted: Record<string, boolean>
  firstVisit: boolean
}

interface OnboardingContextValue {
  state: OnboardingState
  // Checklist actions
  completeItem: (key: string) => void
  uncompleteItem: (key: string) => void
  isItemComplete: (key: string) => boolean
  getProgress: () => { completed: number; total: number; percent: number }
  dismissChecklist: () => void
  minimizeChecklist: (minimized: boolean) => void
  resetChecklist: () => void
  // Tour actions
  completeTour: (tourKey: string) => void
  isTourComplete: (tourKey: string) => boolean
  resetTours: () => void
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'rstu_onboarding_state'

// Default checklist items for new users
const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { key: 'profile', completed: false },
  { key: 'building', completed: false },
  { key: 'chat', completed: false },
  { key: 'library', completed: false },
  { key: 'mutualAid', completed: false },
]

const DEFAULT_STATE: OnboardingState = {
  checklistItems: DEFAULT_CHECKLIST,
  checklistDismissed: false,
  checklistMinimized: false,
  toursCompleted: {},
  firstVisit: true,
}

// ============================================================================
// Context
// ============================================================================

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return context
}

// Safe hook that returns null if outside provider (for components that may render before provider)
export function useOnboardingSafe(): OnboardingContextValue | null {
  return useContext(OnboardingContext)
}

// ============================================================================
// Provider
// ============================================================================

interface OnboardingProviderProps {
  children: ReactNode
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load state from localStorage on mount
  useEffect(() => {
    // Check if there's stored data first
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const stored = safeGetJson<OnboardingState>(STORAGE_KEY, DEFAULT_STATE)
        // Merge with defaults to handle new items added in updates
        const mergedItems = DEFAULT_CHECKLIST.map(defaultItem => {
          const storedItem = stored.checklistItems?.find(i => i.key === defaultItem.key)
          return storedItem || defaultItem
        })
        setState({
          ...DEFAULT_STATE,
          ...stored,
          checklistItems: mergedItems,
          firstVisit: false,
        })
      }
    }
    setIsHydrated(true)
  }, [])

  // Persist state to localStorage on changes
  useEffect(() => {
    if (isHydrated) {
      safeSetItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state, isHydrated])

  // Complete a checklist item
  const completeItem = useCallback((key: string) => {
    setState(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.map(item =>
        item.key === key
          ? { ...item, completed: true, completedAt: Date.now() }
          : item
      ),
    }))
  }, [])

  // Uncomplete a checklist item
  const uncompleteItem = useCallback((key: string) => {
    setState(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.map(item =>
        item.key === key
          ? { ...item, completed: false, completedAt: undefined }
          : item
      ),
    }))
  }, [])

  // Check if item is complete
  const isItemComplete = useCallback((key: string) => {
    return state.checklistItems.find(i => i.key === key)?.completed ?? false
  }, [state.checklistItems])

  // Get progress stats
  const getProgress = useCallback(() => {
    const total = state.checklistItems.length
    const completed = state.checklistItems.filter(i => i.completed).length
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0
    return { completed, total, percent }
  }, [state.checklistItems])

  // Dismiss checklist permanently
  const dismissChecklist = useCallback(() => {
    setState(prev => ({ ...prev, checklistDismissed: true }))
  }, [])

  // Minimize/expand checklist
  const minimizeChecklist = useCallback((minimized: boolean) => {
    setState(prev => ({ ...prev, checklistMinimized: minimized }))
  }, [])

  // Reset checklist to initial state
  const resetChecklist = useCallback(() => {
    setState(prev => ({
      ...prev,
      checklistItems: DEFAULT_CHECKLIST,
      checklistDismissed: false,
      checklistMinimized: false,
    }))
  }, [])

  // Complete a tour
  const completeTour = useCallback((tourKey: string) => {
    setState(prev => ({
      ...prev,
      toursCompleted: { ...prev.toursCompleted, [tourKey]: true },
    }))
  }, [])

  // Check if tour is complete
  const isTourComplete = useCallback((tourKey: string) => {
    return state.toursCompleted[tourKey] ?? false
  }, [state.toursCompleted])

  // Reset all tours
  const resetTours = useCallback(() => {
    setState(prev => ({ ...prev, toursCompleted: {} }))
  }, [])

  const value: OnboardingContextValue = {
    state,
    completeItem,
    uncompleteItem,
    isItemComplete,
    getProgress,
    dismissChecklist,
    minimizeChecklist,
    resetChecklist,
    completeTour,
    isTourComplete,
    resetTours,
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}
