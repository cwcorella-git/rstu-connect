'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getDelegateProfile,
  getCurrentDelegateProfile,
  getDelegateStats,
  type DelegateProfile,
  type DelegateStats,
} from '@/lib/delegateStorage'

/**
 * Hook to get delegate status for current user
 */
export function useDelegateStatus() {
  const [delegateProfile, setDelegateProfile] = useState<DelegateProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(() => {
    setIsLoading(true)
    const profile = getCurrentDelegateProfile()
    setDelegateProfile(profile)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    delegateProfile,
    isLoading,
    refresh,
    // Convenience accessors
    isDelegate: delegateProfile?.canVoteOnAppGovernance ?? false,
    delegateWeight: delegateProfile?.delegateWeight ?? 0,
    qualificationStatus: delegateProfile?.qualificationStatus ?? null,
  }
}

/**
 * Hook to get delegate status for a specific profile
 */
export function useDelegateProfile(profileId: string | null) {
  const [delegateProfile, setDelegateProfile] = useState<DelegateProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(() => {
    if (!profileId) {
      setDelegateProfile(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    const profile = getDelegateProfile(profileId)
    setDelegateProfile(profile)
    setIsLoading(false)
  }, [profileId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    delegateProfile,
    isLoading,
    refresh,
  }
}

/**
 * Hook to get overall delegate statistics
 */
export function useDelegateStats() {
  const [stats, setStats] = useState<DelegateStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(() => {
    setIsLoading(true)
    const delegateStats = getDelegateStats()
    setStats(delegateStats)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    stats,
    isLoading,
    refresh,
  }
}
