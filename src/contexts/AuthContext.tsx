'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react'
import { getCurrentProfile, canAccessTools, canAccessOrganize, UserProfile } from '@/lib/profileStorage'
import { checkAdminAuth } from '@/lib/adminStorage'

interface AuthContextType {
  isLoading: boolean
  profile: UserProfile | null
  isAuthenticated: boolean
  isAdminAuthenticated: boolean
  canAccessToolsTab: boolean
  canAccessOrganizeTab: boolean
  refreshAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Always start with loading state - matches both server and client
  const [authState, setAuthState] = useState<{
    isLoading: boolean
    profile: UserProfile | null
    isAdminAuthenticated: boolean
  }>({
    isLoading: true,
    profile: null,
    isAdminAuthenticated: false
  })

  // Load auth state AFTER hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const profile = getCurrentProfile()
      const adminAuth = checkAdminAuth()
      setAuthState({ isLoading: false, profile, isAdminAuthenticated: adminAuth })
    }
  }, [])

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
    canAccessOrganizeTab: authState.profile ? canAccessOrganize() : false,
    refreshAuth,
  }), [authState, refreshAuth])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
