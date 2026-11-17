'use client'
import { createLogger } from '@/lib/utils/logger'
const log = createLogger('UserList')

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getCurrentProfile,
  hasRole,
  isAdmin,
  getActivityStatus,
  type UserRole,
  type UserProfile,
} from '@/lib/storage/profileStorage'
export interface SyncedProfile extends UserProfile {
  isOnline?: boolean
}

// Role change types
interface RoleChangeRequest {
  targetId: string
  newRole: UserRole
  reason?: string
}

interface RoleChangeResponse {
  success: boolean
  error?: string
}

export type SortField = 'nickname' | 'role' | 'building' | 'lastActive' | 'created'
export type SortDirection = 'asc' | 'desc'

interface UseUserListFilters {
  search: string
  role: UserRole | 'all'
  building: string | 'all'
  activityStatus: 'active' | 'inactive' | 'never' | 'all'
  showBanned?: boolean // Admin-only filter to show banned users
}

interface UseUserListReturn {
  profiles: SyncedProfile[]
  filteredProfiles: SyncedProfile[]
  isLoading: boolean
  error: string | null
  filters: UseUserListFilters
  setFilters: (filters: Partial<UseUserListFilters>) => void
  sortField: SortField
  sortDirection: SortDirection
  setSort: (field: SortField, direction?: SortDirection) => void
  canViewList: boolean
  canChangeRoles: boolean
  changeRole: (request: RoleChangeRequest) => Promise<RoleChangeResponse>
  refresh: () => void
  buildings: string[] // Unique buildings for filter dropdown
  stats: {
    total: number
    tenants: number
    organizers: number
    admins: number
    active: number
  }
}

/**
 * Hook for user list management (organizers+ only)
 */
export function useUserList(): UseUserListReturn {
  const [profiles, setProfiles] = useState<SyncedProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<UseUserListFilters>({
    search: '',
    role: 'all',
    building: 'all',
    activityStatus: 'all',
  })
  const [sortField, setSortField] = useState<SortField>('lastActive')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const canViewList = hasRole('organizer')
  const canChangeRoles = isAdmin()

  // No server holds a user list any more (Supabase removed)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!canViewList) {
      setIsLoading(false)
      setError('Insufficient permissions')
      return
    }

    const fetchProfiles = async () => {
      setIsLoading(true)
      setError(null)

      setError('Database not configured')
      setIsLoading(false)
    }

    fetchProfiles()
  }, [canViewList])

  // Filter profiles
  const filteredProfiles = useMemo(() => {
    let result = [...profiles]

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(p =>
        p.nickname.toLowerCase().includes(search) ||
        (p.buildingAddress?.toLowerCase().includes(search)) ||
        (p.unitNumber?.toLowerCase().includes(search))
      )
    }

    // Role filter
    if (filters.role !== 'all') {
      result = result.filter(p => p.role === filters.role)
    }

    // Building filter
    if (filters.building !== 'all') {
      result = result.filter(p => p.buildingId === filters.building)
    }

    // Activity status filter
    if (filters.activityStatus !== 'all') {
      result = result.filter(p => getActivityStatus(p) === filters.activityStatus)
    }

    // Exclude banned users (unless admin has enabled showBanned filter)
    if (!filters.showBanned) {
      result = result.filter(p => !p.banned)
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'nickname':
          comparison = a.nickname.localeCompare(b.nickname)
          break
        case 'role':
          const roleOrder = { admin: 0, organizer: 1, tenant: 2 }
          comparison = roleOrder[a.role] - roleOrder[b.role]
          break
        case 'building':
          comparison = (a.buildingAddress || '').localeCompare(b.buildingAddress || '')
          break
        case 'lastActive':
          comparison = (a.lastActive || 0) - (b.lastActive || 0)
          break
        case 'created':
          comparison = a.created - b.created
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [profiles, filters, sortField, sortDirection])

  // Extract unique buildings for filter dropdown
  const buildings = useMemo(() => {
    const buildingSet = new Set<string>()
    profiles.forEach(p => {
      if (p.buildingId) buildingSet.add(p.buildingId)
    })
    return Array.from(buildingSet).sort()
  }, [profiles])

  // Calculate stats
  const stats = useMemo(() => ({
    total: profiles.length,
    tenants: profiles.filter(p => p.role === 'tenant').length,
    organizers: profiles.filter(p => p.role === 'organizer').length,
    admins: profiles.filter(p => p.role === 'admin').length,
    active: profiles.filter(p => getActivityStatus(p) === 'active').length,
  }), [profiles])

  // Set filters
  const setFilters = useCallback((newFilters: Partial<UseUserListFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Set sort
  const setSort = useCallback((field: SortField, direction?: SortDirection) => {
    if (field === sortField && !direction) {
      // Toggle direction
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection(direction || 'desc')
    }
  }, [sortField])

  // Role changes needed the server; there is none
  const changeRole = useCallback(async (request: RoleChangeRequest): Promise<RoleChangeResponse> => {
    if (!canChangeRoles) {
      return { success: false, error: 'Insufficient permissions' }
    }

    return { success: false, error: 'Server not configured' }
  }, [canChangeRoles])

  // Refresh (no server: always reports not configured)
  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    setError('Database not configured')
    setIsLoading(false)
  }, [])

  return {
    profiles,
    filteredProfiles,
    isLoading,
    error,
    filters,
    setFilters,
    sortField,
    sortDirection,
    setSort,
    canViewList,
    canChangeRoles,
    changeRole,
    refresh,
    buildings,
    stats,
  }
}
