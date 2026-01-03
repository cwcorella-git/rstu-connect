'use client'

import { useState, useEffect } from 'react'
import { getAllProfiles, USE_SUPABASE } from '@/lib/supabase'
import { UserCard } from '@/components/Profile/UserCard'
import type { UserProfile } from '@/lib/profileStorage'

interface BuildingUsersSectionProps {
  buildingId: string
  buildingAddress: string
}

export interface SyncedProfile extends UserProfile {
  isOnline?: boolean
}

export function BuildingUsersSection({ buildingId, buildingAddress }: BuildingUsersSectionProps) {
  const [users, setUsers] = useState<SyncedProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBuildingUsers()
  }, [buildingId])

  const loadBuildingUsers = async () => {
    if (!USE_SUPABASE) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const allProfiles = await getAllProfiles()
      // Filter to users with this building_id
      const buildingUsers = allProfiles
        .filter(p => p.building_id === buildingId)
        .map(p => ({
          id: p.id,
          nickname: p.nickname,
          role: p.role,
          trustLevel: p.trust_level,
          buildingId: p.building_id || undefined,
          buildingAddress: p.building_address || undefined,
          unitNumber: p.unit_number || undefined,
          phone: p.phone || undefined,
          email: p.email || undefined,
          preferredContact: p.preferred_contact || undefined,
          language: p.language || undefined,
          rentAmount: p.rent_amount || undefined,
          moveInDate: p.move_in_date || undefined,
          leaseType: p.lease_type || undefined,
          leaseExpires: p.lease_expires || undefined,
          assignedBuildings: p.assigned_buildings || undefined,
          invitedBy: p.invited_by || undefined,
          inviteCode: p.invite_code || undefined,
          created: new Date(p.created_at).getTime(),
          lastActive: new Date(p.last_active).getTime(),
        } as SyncedProfile))
      setUsers(buildingUsers)
    } catch (error) {
      console.error('[BuildingUsersSection] Error loading building users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
        Loading users...
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="px-4 py-3 border-t border-gray-200 bg-blue-50">
        <div className="flex items-start gap-2">
          <div className="text-blue-600 text-lg flex-shrink-0">ℹ️</div>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">No tenants with accounts yet</p>
            <p className="text-xs text-blue-600">
              Share an invite code to get neighbors to join and organize together!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200 bg-gray-50">
      <div className="px-4 py-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Members in this building ({users.length})
        </h4>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {users.map(user => (
            <UserCard
              key={user.id}
              profile={user}
              canChangeRole={false}
              isCurrentUser={false}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
