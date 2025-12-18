'use client'

import { useState, useEffect } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import {
  getCurrentProfile,
  updateProfile,
  updateProfileRole,
  getMyInviteCodes,
  exportProfileData,
  isAdmin,
  type UserProfile,
  type UserRole,
  type InviteCode,
} from '@/lib/profileStorage'
import { exportCanvassData, importCanvassData, getCanvassState } from '@/lib/canvassStorage'

interface AdminPanelProps {
  buildings: EnhancedBuilding[]
  onClose: () => void
}

export function AdminPanel({ buildings, onClose }: AdminPanelProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([])
  const [canvassStats, setCanvassStats] = useState<{
    buildings: number
    totalUnits: number
    contacted: number
  }>({ buildings: 0, totalUnits: 0, contacted: 0 })

  useEffect(() => {
    const p = getCurrentProfile()
    setProfile(p)
    setInviteCodes(getMyInviteCodes())

    // Calculate canvass stats
    const state = getCanvassState()
    let totalUnits = 0
    let contacted = 0
    for (const building of Object.values(state.buildings)) {
      const units = Object.values(building.units)
      totalUnits += units.length
      contacted += units.filter(u => !['NOT_CONTACTED', 'NO_ANSWER'].includes(u.status)).length
    }
    setCanvassStats({
      buildings: Object.keys(state.buildings).length,
      totalUnits,
      contacted,
    })
  }, [])

  // Check admin access
  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500">Admin access required</p>
          <button onClick={onClose} className="mt-4 text-rstu-red hover:underline">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const handleRoleChange = (role: UserRole) => {
    const updated = updateProfileRole(role)
    if (updated) {
      setProfile(updated)
    }
  }

  const handleExportCanvass = () => {
    const data = exportCanvassData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rstu-canvass-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportProfile = () => {
    const data = exportProfileData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rstu-profile-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportCanvass = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        const result = importCanvassData(content)
        if (result.success) {
          alert('Canvassing data imported successfully!')
          // Refresh stats
          const state = getCanvassState()
          let totalUnits = 0
          let contacted = 0
          for (const building of Object.values(state.buildings)) {
            const units = Object.values(building.units)
            totalUnits += units.length
            contacted += units.filter(u => !['NOT_CONTACTED', 'NO_ANSWER'].includes(u.status)).length
          }
          setCanvassStats({
            buildings: Object.keys(state.buildings).length,
            totalUnits,
            contacted,
          })
        } else {
          alert(`Import failed: ${result.error}`)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-purple-600 text-white p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-purple-200 text-sm">Manage roles and data</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-purple-500 rounded-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Role Management */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Your Role</h3>
            <p className="text-sm text-gray-500 mb-4">
              Change your role. In a device-local system, this only affects your device.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {(['tenant', 'organizer', 'admin'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    profile?.role === role
                      ? role === 'admin' ? 'bg-purple-600 text-white' :
                        role === 'organizer' ? 'bg-blue-600 text-white' :
                        'bg-gray-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>

            <div className="mt-4 text-xs text-gray-400">
              <strong>Tenant:</strong> View profile, rent comparisons<br />
              <strong>Organizer:</strong> + Tools tab, canvassing, invites<br />
              <strong>Admin:</strong> + Role management, data export
            </div>
          </div>

          {/* Canvassing Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Canvassing Data</h3>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{canvassStats.buildings}</div>
                <div className="text-xs text-gray-500">Buildings</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{canvassStats.totalUnits}</div>
                <div className="text-xs text-gray-500">Units Tracked</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{canvassStats.contacted}</div>
                <div className="text-xs text-gray-500">Contacted</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExportCanvass}
                className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100"
              >
                Export Data
              </button>
              <button
                onClick={handleImportCanvass}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
              >
                Import Data
              </button>
            </div>
          </div>

          {/* Invite Codes */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Invite Codes</h3>
            <p className="text-sm text-gray-500 mb-4">
              Codes you&apos;ve created to invite tenants
            </p>

            {inviteCodes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No invite codes created yet
              </p>
            ) : (
              <div className="space-y-2">
                {inviteCodes.map((invite) => (
                  <div
                    key={invite.code}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                  >
                    <div>
                      <code className="font-mono font-medium">{invite.code}</code>
                      <div className="text-xs text-gray-400">
                        Created {new Date(invite.created).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      invite.revoked ? 'bg-gray-200 text-gray-500' :
                      (invite.maxUses > 0 && invite.usedCount >= invite.maxUses) ? 'bg-gray-200 text-gray-500' :
                      (invite.expires > 0 && invite.expires < Date.now()) ? 'bg-red-100 text-red-600' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {invite.revoked ? 'Revoked' :
                       (invite.maxUses > 0 && invite.usedCount >= invite.maxUses) ? 'Used Up' :
                       (invite.expires > 0 && invite.expires < Date.now()) ? 'Expired' : 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile Export */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Profile Data</h3>
            <p className="text-sm text-gray-500 mb-4">
              Export your profile for backup or transfer
            </p>
            <button
              onClick={handleExportProfile}
              className="w-full py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
            >
              Export Profile
            </button>
          </div>

          {/* System Info */}
          <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500">
            <h4 className="font-medium text-gray-700 mb-2">About This System</h4>
            <p className="mb-2">
              Profiles are stored locally in your browser (localStorage). Each device has its own profile.
            </p>
            <p>
              To sync profiles across devices, use the export/import feature or coordinate with other organizers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
