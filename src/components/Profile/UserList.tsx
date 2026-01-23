'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useUserList } from '@/hooks/useUserList'
import { UserCard } from './UserCard'
import { RoleChangeModal } from './RoleChangeModal'
import { getCurrentProfile, type UserRole } from '@/lib/profileStorage'
import { type SyncedProfile } from '@/lib/profileSync'

export function UserList() {
  const { t } = useLanguage()
  const {
    filteredProfiles,
    isLoading,
    error,
    filters,
    setFilters,
    sortField,
    setSort,
    canViewList,
    canChangeRoles,
    changeRole,
    refresh,
    stats,
  } = useUserList()

  const [roleChangeTarget, setRoleChangeTarget] = useState<{
    profile: SyncedProfile
    newRole: UserRole
  } | null>(null)

  const currentProfile = getCurrentProfile()

  if (!canViewList) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>{t('profile.noAccessUserList') || 'You need organizer or admin access to view the user list.'}</p>
      </div>
    )
  }

  const handleRoleChange = (profileId: string, newRole: UserRole) => {
    const profile = filteredProfiles.find(p => p.id === profileId)
    if (profile) {
      setRoleChangeTarget({ profile, newRole })
    }
  }

  const confirmRoleChange = async (reason?: string) => {
    if (!roleChangeTarget) return

    const result = await changeRole({
      targetId: roleChangeTarget.profile.id,
      newRole: roleChangeTarget.newRole,
      reason,
    })

    if (!result.success) {
      alert(result.error || 'Failed to change role')
    }

    setRoleChangeTarget(null)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">
            {t('profile.userList') || 'Users'} ({stats.total})
          </h3>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            {isLoading ? t('profile.loadingUserList') || 'Loading...' : t('profile.refreshUserList') || 'Refresh'}
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-xs text-gray-500 mb-3">
          <span>{stats.admins} {t('roles.admins')}</span>
          <span>{stats.organizers} {t('roles.organizers')}</span>
          <span>{stats.tenants} {t('roles.tenants')}</span>
          <span className="text-green-600">{stats.active} {t('status.active').toLowerCase()}</span>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder={t('profile.searchUsers') || 'Search by name, building, unit...'}
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Filters */}
        <div className="flex gap-2 mt-2">
          <select
            value={filters.role}
            onChange={(e) => setFilters({ role: e.target.value as UserRole | 'all' })}
            className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">{t('users.allRoles')}</option>
            <option value="admin">{t('roles.admin')}</option>
            <option value="organizer">{t('roles.organizer')}</option>
            <option value="tenant">{t('roles.tenant')}</option>
          </select>

          <select
            value={filters.activityStatus}
            onChange={(e) => setFilters({ activityStatus: e.target.value as 'active' | 'inactive' | 'never' | 'all' })}
            className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">{t('users.allActivity')}</option>
            <option value="active">{t('status.active')}</option>
            <option value="inactive">{t('status.inactive')}</option>
            <option value="never">{t('status.never')}</option>
          </select>

          <select
            value={sortField}
            onChange={(e) => setSort(e.target.value as typeof sortField)}
            className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="lastActive">{t('users.sortBy')}: {t('users.recentActivity')}</option>
            <option value="nickname">{t('users.sortBy')}: {t('users.name')}</option>
            <option value="role">{t('users.sortBy')}: {t('users.role')}</option>
            <option value="created">{t('users.sortBy')}: {t('users.joined')}</option>
          </select>

          {/* Show banned users toggle (admin-only) */}
          {canChangeRoles && (
            <label className="flex items-center gap-2 text-sm text-gray-700 border border-gray-300 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showBanned || false}
                onChange={(e) => setFilters({ showBanned: e.target.checked })}
                className="rounded"
              />
              <span>{t('users.showBanned')}</span>
            </label>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={refresh}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            {t('common.tryAgain') || 'Try again'}
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !error && (
        <div className="p-8 text-center text-gray-500">
          <div className="animate-pulse">{t('profile.loadingUserList') || 'Loading users...'}</div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && filteredProfiles.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          {filters.search || filters.role !== 'all' || filters.activityStatus !== 'all'
            ? t('profile.noUsersMatchFilters') || 'No users match your filters'
            : t('profile.noUsersRegistered') || 'No users registered yet'}
        </div>
      )}

      {/* User list */}
      {!isLoading && !error && filteredProfiles.length > 0 && (
        <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto">
          {filteredProfiles.map((profile) => (
            <UserCard
              key={profile.id}
              profile={profile}
              canChangeRole={canChangeRoles}
              onChangeRole={handleRoleChange}
              isCurrentUser={profile.id === currentProfile?.id}
              onDeleteSuccess={refresh}
              onVerifySuccess={refresh}
            />
          ))}
        </div>
      )}

      {/* Role change modal */}
      {roleChangeTarget && (
        <RoleChangeModal
          profile={roleChangeTarget.profile}
          newRole={roleChangeTarget.newRole}
          onConfirm={confirmRoleChange}
          onCancel={() => setRoleChangeTarget(null)}
        />
      )}
    </div>
  )
}
