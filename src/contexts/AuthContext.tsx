'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react'
import { getCurrentProfile, canAccessTools, canAccessOrganize, UserProfile } from '@/lib/profileStorage'
import { checkAdminAuth } from '@/lib/adminStorage'
import { onAuthStateChange, getSession, getProfileByAuthUser } from '@/lib/supabaseAuth'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  isLoading: boolean
  profile: UserProfile | null
  supabaseUser: User | null
  session: Session | null
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
    supabaseUser: User | null
    session: Session | null
    isAdminAuthenticated: boolean
    isEmailVerified: boolean
  }>({
    isLoading: true,
    profile: null,
    supabaseUser: null,
    session: null,
    isAdminAuthenticated: false,
    isEmailVerified: false,
  })

  // Load auth state AFTER hydration
  useEffect(() => {
    if (typeof window === 'undefined') return

    let mounted = true

    const initAuth = async () => {
      // First, get localStorage profile (immediate, works offline)
      const localProfile = getCurrentProfile()
      const adminAuth = checkAdminAuth()

      // Initial state from localStorage
      if (mounted) {
        setAuthState(prev => ({
          ...prev,
          profile: localProfile,
          isAdminAuthenticated: adminAuth,
          isLoading: !!supabase, // Keep loading if we need to check Supabase
        }))
      }

      // If Supabase is available, check for session
      if (supabase) {
        try {
          const session = await getSession()

          if (session?.user && mounted) {
            // Get profile linked to this auth user
            const authProfile = await getProfileByAuthUser()

            setAuthState(prev => {
              // Merge auth profile data with local profile if available
              let mergedProfile: UserProfile | null = prev.profile
              if (authProfile && prev.profile) {
                mergedProfile = {
                  ...prev.profile,
                  id: authProfile.id,
                  nickname: authProfile.nickname,
                  email: authProfile.email,
                  role: authProfile.role as UserProfile['role'],
                  trustLevel: authProfile.trustLevel as UserProfile['trustLevel'],
                }
              } else if (authProfile) {
                // Create minimal profile from auth data
                mergedProfile = {
                  id: authProfile.id,
                  nickname: authProfile.nickname,
                  email: authProfile.email,
                  role: authProfile.role as UserProfile['role'],
                  trustLevel: authProfile.trustLevel as UserProfile['trustLevel'],
                  created: Date.now(),
                  lastActive: Date.now(),
                }
              }
              return {
                ...prev,
                isLoading: false,
                supabaseUser: session.user,
                session: session,
                isEmailVerified: !!session.user.email_confirmed_at,
                profile: mergedProfile,
              }
            })
          } else if (mounted) {
            setAuthState(prev => ({
              ...prev,
              isLoading: false,
            }))
          }
        } catch {
          // Supabase error - fall back to localStorage only
          if (mounted) {
            setAuthState(prev => ({
              ...prev,
              isLoading: false,
            }))
          }
        }
      } else if (mounted) {
        // No Supabase, done loading
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }))
      }
    }

    initAuth()

    // Subscribe to Supabase auth state changes
    const { unsubscribe } = onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (event === 'SIGNED_IN' && session?.user) {
        const authProfile = await getProfileByAuthUser()
        setAuthState(prev => {
          let mergedProfile: UserProfile | null = prev.profile
          if (authProfile && prev.profile) {
            mergedProfile = {
              ...prev.profile,
              id: authProfile.id,
              nickname: authProfile.nickname,
              email: authProfile.email,
              role: authProfile.role as UserProfile['role'],
              trustLevel: authProfile.trustLevel as UserProfile['trustLevel'],
            }
          } else if (authProfile) {
            mergedProfile = {
              id: authProfile.id,
              nickname: authProfile.nickname,
              email: authProfile.email,
              role: authProfile.role as UserProfile['role'],
              trustLevel: authProfile.trustLevel as UserProfile['trustLevel'],
              created: Date.now(),
              lastActive: Date.now(),
            }
          }
          return {
            ...prev,
            supabaseUser: session.user,
            session: session,
            isEmailVerified: !!session.user.email_confirmed_at,
            profile: mergedProfile,
          }
        })
      } else if (event === 'SIGNED_OUT') {
        setAuthState(prev => ({
          ...prev,
          supabaseUser: null,
          session: null,
          isEmailVerified: false,
          profile: null,
        }))
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setAuthState(prev => ({
          ...prev,
          session: session,
        }))
      } else if (event === 'USER_UPDATED' && session?.user) {
        setAuthState(prev => ({
          ...prev,
          supabaseUser: session.user,
          isEmailVerified: !!session.user.email_confirmed_at,
        }))
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const refreshAuth = useCallback(async () => {
    const localProfile = getCurrentProfile()
    const adminAuth = checkAdminAuth()

    // Also refresh Supabase session if available
    if (supabase) {
      const session = await getSession()
      const authProfile = session?.user ? await getProfileByAuthUser() : null

      let mergedProfile: UserProfile | null = localProfile
      if (authProfile && localProfile) {
        mergedProfile = {
          ...localProfile,
          id: authProfile.id,
          nickname: authProfile.nickname,
          email: authProfile.email,
          role: authProfile.role as UserProfile['role'],
          trustLevel: authProfile.trustLevel as UserProfile['trustLevel'],
        }
      } else if (authProfile) {
        mergedProfile = {
          id: authProfile.id,
          nickname: authProfile.nickname,
          email: authProfile.email,
          role: authProfile.role as UserProfile['role'],
          trustLevel: authProfile.trustLevel as UserProfile['trustLevel'],
          created: Date.now(),
          lastActive: Date.now(),
        }
      }

      setAuthState({
        isLoading: false,
        profile: mergedProfile,
        supabaseUser: session?.user || null,
        session: session || null,
        isAdminAuthenticated: adminAuth,
        isEmailVerified: !!session?.user?.email_confirmed_at,
      })
    } else {
      setAuthState({
        isLoading: false,
        profile: localProfile,
        supabaseUser: null,
        session: null,
        isAdminAuthenticated: adminAuth,
        isEmailVerified: false,
      })
    }
  }, [])

  const value = useMemo(() => ({
    isLoading: authState.isLoading,
    profile: authState.profile,
    supabaseUser: authState.supabaseUser,
    session: authState.session,
    isAuthenticated: !!authState.profile || !!authState.supabaseUser,
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
