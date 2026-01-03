'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getCurrentProfile,
  hasRole,
  isAdmin,
  getActivityStatus,
  type UserRole,
  type UserProfile,
} from '@/lib/profileStorage'
import {
  getAllProfiles,
  updateProfileRole,
  USE_SUPABASE,
  type DbProfile,
} from '@/lib/supabase'

// Convert DbProfile to SyncedProfile format
export interface SyncedProfile extends UserProfile {
  isOnline?: boolean
}

function dbToSyncedProfile(db: DbProfile): SyncedProfile {
  return {
    id: db.id,
    nickname: db.nickname,
    role: db.role,
    trustLevel: db.trust_level,
    buildingId: db.building_id || undefined,
    buildingAddress: db.building_address || undefined,
    unitNumber: db.unit_number || undefined,
    phone: db.phone || undefined,
    email: db.email || undefined,
    preferredContact: db.preferred_contact || undefined,
    language: db.language || undefined,
    rentAmount: db.rent_amount || undefined,
    moveInDate: db.move_in_date || undefined,
    leaseType: db.lease_type || undefined,
    leaseExpires: db.lease_expires || undefined,
    assignedBuildings: db.assigned_buildings || undefined,
    invitedBy: db.invited_by || undefined,
    inviteCode: db.invite_code || undefined,
    banned: (db as any).banned || false,
    bannedAt: (db as any).banned_at ? new Date((db as any).banned_at).getTime() : undefined,
    bannedBy: (db as any).banned_by || undefined,
    created: new Date(db.created_at).getTime(),
    lastActive: new Date(db.last_active).getTime(),
    isOnline: false,
  }
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

  // Fetch profiles from Supabase on mount
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

      if (!USE_SUPABASE) {
        setError('Database not configured')
        setIsLoading(false)
        return
      }

      try {
        const dbProfiles = await getAllProfiles()
        const syncedProfiles = dbProfiles.map(dbToSyncedProfile)
        setProfiles(syncedProfiles)
        setIsLoading(false)
      } catch (err) {
        console.error('[useUserList] Error fetching profiles:', err)
        setError('Failed to load users')
        setIsLoading(false)
      }
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

    // Exclude banned users (admins can see them with special filter if needed)
    result = result.filter(p => !p.banned)

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

  // Change role via Supabase
  const changeRole = useCallback(async (request: RoleChangeRequest): Promise<RoleChangeResponse> => {
    if (!canChangeRoles) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const result = await updateProfileRole(request.targetId, request.newRole)

    if (result.success) {
      // Update local state
      setProfiles(prev => prev.map(p =>
        p.id === request.targetId ? { ...p, role: request.newRole } : p
      ))
    }

    return result
  }, [canChangeRoles])

  // Refresh from Supabase
  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    if (!USE_SUPABASE) {
      setError('Database not configured')
      setIsLoading(false)
      return
    }

    try {
      const dbProfiles = await getAllProfiles()
      const syncedProfiles = dbProfiles.map(dbToSyncedProfile)
      setProfiles(syncedProfiles)
      setIsLoading(false)
    } catch (err) {
      console.error('[useUserList] Error refreshing profiles:', err)
      setError('Failed to refresh users')
      setIsLoading(false)
    }
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
