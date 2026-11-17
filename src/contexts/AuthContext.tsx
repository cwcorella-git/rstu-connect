'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react'
import { getCurrentProfile, canAccessTools, canAccessOrganize, UserProfile } from '@/lib/storage/profileStorage'
import { checkAdminAuth } from '@/lib/storage/adminStorage'

interface AuthContextType {
  isLoading: boolean
  profile: UserProfile | null
  isAuthenticated: boolean
  isEmailVerified: boolean
  isAdminAuthenticated: boolean
  canAccessToolsTab: boolean
  canAccessOrganizeTab: boolean
  refreshAuth: () => void | Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Always start with loading state - matches both server and client
  const [authState, setAuthState] = useState<{
    isLoading: boolean
    profile: UserProfile | null
    isAdminAuthenticated: boolean
    isEmailVerified: boolean
  }>({
    isLoading: true,
    profile: null,
    isAdminAuthenticated: false,
    isEmailVerified: false,
  })

  // Load auth state AFTER hydration (localStorage only)
  useEffect(() => {
    if (typeof window === 'undefined') return

    setAuthState({
      isLoading: false,
      profile: getCurrentProfile(),
      isAdminAuthenticated: checkAdminAuth(),
      isEmailVerified: false,
    })
  }, [])

  const refreshAuth = useCallback(async () => {
    setAuthState({
      isLoading: false,
      profile: getCurrentProfile(),
      isAdminAuthenticated: checkAdminAuth(),
      isEmailVerified: false,
    })
  }, [])

  const value = useMemo(() => ({
    isLoading: authState.isLoading,
    profile: authState.profile,
    isAuthenticated: !!authState.profile,
    isEmailVerified: authState.isEmailVerified,
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
