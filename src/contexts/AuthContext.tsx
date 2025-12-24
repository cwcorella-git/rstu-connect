'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react'
import { getCurrentProfile, canAccessTools, UserProfile } from '@/lib/profileStorage'
import { checkAdminAuth } from '@/lib/adminStorage'

interface AuthContextType {
  isLoading: boolean
  profile: UserProfile | null
  isAuthenticated: boolean
  isAdminAuthenticated: boolean
  canAccessToolsTab: boolean
  refreshAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Synchronous init on client - reads localStorage BEFORE first render
  const [authState, setAuthState] = useState<{
    isLoading: boolean
    profile: UserProfile | null
    isAdminAuthenticated: boolean
  }>(() => {
    if (typeof window === 'undefined') {
      return { isLoading: true, profile: null, isAdminAuthenticated: false }
    }
    // Client: read localStorage synchronously
    const profile = getCurrentProfile()
    const adminAuth = checkAdminAuth()
    return { isLoading: false, profile, isAdminAuthenticated: adminAuth }
  })

  // Handle SSR hydration
  useEffect(() => {
    if (authState.isLoading) {
      const profile = getCurrentProfile()
      const adminAuth = checkAdminAuth()
      setAuthState({ isLoading: false, profile, isAdminAuthenticated: adminAuth })
    }
  }, [authState.isLoading])

  const refreshAuth = useCallback(() => {
    const profile = getCurrentProfile()
    const adminAuth = checkAdminAuth()
    setAuthState({ isLoading: false, profile, isAdminAuthenticated: adminAuth })
  }, [])

  const value = useMemo(() => ({
    isLoading: authState.isLoading,
    profile: authState.profile,
    isAuthenticated: !!authState.profile,
    isAdminAuthenticated: authState.isAdminAuthenticated,
    canAccessToolsTab: authState.profile ? canAccessTools() : false,
    refreshAuth,
  }), [authState, refreshAuth])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
