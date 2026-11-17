'use client'
import { createLogger } from '@/lib/utils/logger'
const log = createLogger('OrganizingProgress')

import { useState, useEffect, useCallback } from 'react'
import { getCurrentProfile, type UserProfile } from '@/lib/storage/profileStorage'
import { getTenantSafeProgress, type TenantSafeProgress } from '@/lib/storage/canvassStorage'

/**
 * Registered member info (tenant-safe - no contact details)
 */
export interface RegisteredMember {
  id: string
  nickname: string
  unitNumber?: string
  role: 'tenant' | 'organizer' | 'admin'
  isVerified: boolean
  lastActive: number
}

/**
 * Combined organizing progress for a building
 * Includes both canvass data and registered members
 */
export interface OrganizingProgress extends TenantSafeProgress {
  registeredMembers: RegisteredMember[]
  canSeeUnitDetails: boolean  // Whether current user can see not-contacted units
}

interface UseOrganizingProgressReturn {
  progress: OrganizingProgress | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

/**
 * Hook for tenant-safe organizing progress
 * Shows aggregate stats to all, unit details only to verified users
 */
export function useOrganizingProgress(
  buildingId: string,
  totalBuildingUnits?: number
): UseOrganizingProgressReturn {
  const [progress, setProgress] = useState<OrganizingProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProgress = useCallback(async () => {
    if (!buildingId) {
      setProgress(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get current user's verification status
      const currentUser = getCurrentProfile()
      const canSeeUnitDetails = currentUser?.trustLevel === 'verified'

      // Get canvass progress (tenant-safe)
      const canvassProgress = getTenantSafeProgress(buildingId, totalBuildingUnits)

      // Registered members came from the server profile list; with no
      // server (Supabase removed) there are none to show.
      const registeredMembers: RegisteredMember[] = []

      // Fallback: count registered profiles who may have failed canvass sync
      // If a member has a unit that's still in notContactedUnits, they weren't synced
      const notContactedSet = new Set(canvassProgress.notContactedUnits)
      let extraActive = 0
      let extraInterested = 0

      for (const member of registeredMembers) {
        if (member.unitNumber && notContactedSet.has(member.unitNumber)) {
          // This member has a unit that should be counted but wasn't synced
          if (member.isVerified) {
            extraActive++
          } else {
            extraInterested++
          }
        }
      }

      setProgress({
        ...canvassProgress,
        activeMembers: canvassProgress.activeMembers + extraActive,
        interested: canvassProgress.interested + extraInterested,
        contacted: canvassProgress.contacted + extraActive + extraInterested,
        registeredMembers,
        canSeeUnitDetails,
      })
    } catch (err) {
      log.error('Error:', err)
      setError('Failed to load organizing progress')
    } finally {
      setIsLoading(false)
    }
  }, [buildingId, totalBuildingUnits])

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  return {
    progress,
    isLoading,
    error,
    refresh: loadProgress,
  }
}

/**
 * Utility: Format unit numbers into a compact range display
 * e.g., [1, 2, 3, 5, 6, 9] -> "1-3, 5-6, 9"
 */
export function formatUnitRanges(units: string[]): string {
  if (units.length === 0) return ''
  if (units.length <= 5) return units.join(', ')

  // Try to group into ranges for numeric units
  const numeric = units.filter(u => /^\d+$/.test(u)).map(Number).sort((a, b) => a - b)
  const nonNumeric = units.filter(u => !/^\d+$/.test(u)).sort()

  const ranges: string[] = []
  let rangeStart = numeric[0]
  let rangeEnd = numeric[0]

  for (let i = 1; i <= numeric.length; i++) {
    if (i < numeric.length && numeric[i] === rangeEnd + 1) {
      rangeEnd = numeric[i]
    } else {
      if (rangeStart === rangeEnd) {
        ranges.push(String(rangeStart))
      } else if (rangeEnd === rangeStart + 1) {
        ranges.push(String(rangeStart), String(rangeEnd))
      } else {
        ranges.push(`${rangeStart}-${rangeEnd}`)
      }
      rangeStart = numeric[i]
      rangeEnd = numeric[i]
    }
  }

  return [...ranges, ...nonNumeric].join(', ')
}
