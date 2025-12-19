'use client'

import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import {
  createInvite,
  getAllInviteCodes,
  revokeInvite,
  deleteInvite,
  buildInviteQRUrl,
  isAdmin,
  type InviteCode,
  type UserRole,
  type CreateInviteOptions,
} from '@/lib/profileStorage'

// Expiration options in milliseconds
const EXPIRATION_OPTIONS = [
  { label: '1 day', value: 24 * 60 * 60 * 1000 },
  { label: '7 days', value: 7 * 24 * 60 * 60 * 1000 },
  { label: '30 days', value: 30 * 24 * 60 * 60 * 1000 },
  { label: 'Never', value: 0 },
]

// Max uses options
const MAX_USES_OPTIONS = [
  { label: 'Single use', value: 1 },
  { label: '5 uses', value: 5 },
  { label: '10 uses', value: 10 },
  { label: 'Unlimited', value: 0 },
]

// Get status of an invite code
function getInviteStatus(invite: InviteCode): { label: string; color: string } {
  if (invite.revoked) {
    return { label: 'Revoked', color: 'bg-gray-100 text-gray-600' }
  }
  if (invite.expires > 0 && invite.expires < Date.now()) {
    return { label: 'Expired', color: 'bg-red-100 text-red-700' }
  }
  if (invite.maxUses > 0 && invite.usedCount >= invite.maxUses) {
    return { label: 'Fully Used', color: 'bg-gray-100 text-gray-600' }
  }
  return { label: 'Active', color: 'bg-green-100 text-green-700' }
}

// Format expiration
function formatExpiration(expires: number): string {
  if (expires === 0) return 'Never'
  const now = Date.now()
  if (expires < now) return 'Expired'

  const diff = expires - now
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))

  if (days > 0) return `${days}d ${hours}h`
  return `${hours}h`
}

// Role badge colors
function getRoleBadge(role: UserRole): { label: string; color: string } {
  switch (role) {
    case 'admin':
      return { label: 'Admin', color: 'bg-purple-100 text-purple-700' }
    case 'organizer':
      return { label: 'Organizer', color: 'bg-blue-100 text-blue-700' }
    default:
      return { label: 'Tenant', color: 'bg-gray-100 text-gray-600' }
  }
}

export function InviteCodeManager() {
  const [codes, setCodes] = useState<InviteCode[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [showCodeModal, setShowCodeModal] = useState<InviteCode | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  // Check admin status directly on each render (no stale state)
  const isAdminUser = isAdmin()

  // Create form state
  const [grantRole, setGrantRole] = useState<UserRole>('tenant')
  const [maxUses, setMaxUses] = useState(1)
  const [expiresIn, setExpiresIn] = useState(7 * 24 * 60 * 60 * 1000)

  useEffect(() => {
    setCodes(getAllInviteCodes())
  }, [])

  // Generate QR code when modal opens
  useEffect(() => {
    if (showCodeModal) {
      const url = buildInviteQRUrl(showCodeModal.code)
      QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      }).then(setQrCodeDataUrl).catch(console.error)
    } else {
      setQrCodeDataUrl(null)
    }
  }, [showCodeModal])

  const handleCreate = () => {
    const options: CreateInviteOptions = {
      grantRole,
      maxUses,
      expiresIn,
    }

    const invite = createInvite(options)
    if (invite) {
      setCodes(getAllInviteCodes())
      setShowCreate(false)
      setShowCodeModal(invite)
      // Reset form
      setGrantRole('tenant')
      setMaxUses(1)
      setExpiresIn(7 * 24 * 60 * 60 * 1000)
    }
  }

  const handleRevoke = (code: string) => {
    if (confirm('Revoke this invite code? It will no longer work.')) {
      revokeInvite(code)
      setCodes(getAllInviteCodes())
    }
  }

  const handleDelete = (code: string) => {
    if (confirm('Delete this invite code permanently?')) {
      deleteInvite(code)
      setCodes(getAllInviteCodes())
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const handleCopyUrl = (code: string) => {
    navigator.clipboard.writeText(buildInviteQRUrl(code))
  }

  // Filter active vs inactive codes
  const activeCodes = codes.filter(c => {
    if (c.revoked) return false
    if (c.expires > 0 && c.expires < Date.now()) return false
    if (c.maxUses > 0 && c.usedCount >= c.maxUses) return false
    return true
  })
  const inactiveCodes = codes.filter(c => !activeCodes.includes(c))

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Invite Codes</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Create and manage invite codes for new users
            </p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-3 py-1.5 bg-rstu-red text-white rounded-md text-sm font-medium hover:bg-red-700"
          >
            {showCreate ? 'Cancel' : '+ Create'}
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grant Role
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setGrantRole('tenant')}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    grantRole === 'tenant'
                      ? 'bg-gray-200 text-gray-900'
                      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Tenant
                </button>
                {isAdminUser && (
                  <>
                    <button
                      onClick={() => setGrantRole('organizer')}
                      className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                        grantRole === 'organizer'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Organizer
                    </button>
                    <button
                      onClick={() => setGrantRole('admin')}
                      className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                        grantRole === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Admin
                    </button>
                  </>
                )}
              </div>
              {!isAdminUser && (
                <p className="text-xs text-gray-400 mt-1">
                  Only admins can create organizer/admin invites
                </p>
              )}
            </div>

            {/* Expiration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expires In
              </label>
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent"
              >
                {EXPIRATION_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Max Uses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Uses
              </label>
              <select
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent"
              >
                {MAX_USES_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreate}
              className="w-full py-2 bg-rstu-red text-white rounded-md font-medium hover:bg-red-700"
            >
              Create Invite Code
            </button>
          </div>
        </div>
      )}

      {/* Active Codes */}
      <div className="divide-y divide-gray-100">
        {activeCodes.length === 0 && inactiveCodes.length === 0 && (
          <div className="p-4 text-center text-gray-500 text-sm">
            No invite codes yet. Create one to invite users.
          </div>
        )}

        {activeCodes.map(invite => {
          const status = getInviteStatus(invite)
          const roleBadge = getRoleBadge(invite.grantRole)

          return (
            <div key={invite.code} className="p-3 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <code className="font-mono font-medium text-gray-900">{invite.code}</code>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${roleBadge.color}`}>
                    {roleBadge.label}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowCodeModal(invite)}
                    className="p-1.5 text-gray-400 hover:text-gray-600"
                    title="Show QR code"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleCopyCode(invite.code)}
                    className="p-1.5 text-gray-400 hover:text-gray-600"
                    title="Copy code"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRevoke(invite.code)}
                    className="p-1.5 text-gray-400 hover:text-red-600"
                    title="Revoke"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                <span>Uses: {invite.usedCount}/{invite.maxUses === 0 ? '∞' : invite.maxUses}</span>
                <span>Expires: {formatExpiration(invite.expires)}</span>
                {invite.createdByName && <span>By: {invite.createdByName}</span>}
              </div>
            </div>
          )
        })}

        {/* Inactive codes (collapsed) */}
        {inactiveCodes.length > 0 && (
          <details className="group">
            <summary className="p-3 cursor-pointer text-sm text-gray-500 hover:bg-gray-50 list-none flex items-center gap-2">
              <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {inactiveCodes.length} expired/revoked code{inactiveCodes.length !== 1 ? 's' : ''}
            </summary>
            <div className="bg-gray-50 divide-y divide-gray-100">
              {inactiveCodes.map(invite => {
                const status = getInviteStatus(invite)
                const roleBadge = getRoleBadge(invite.grantRole)

                return (
                  <div key={invite.code} className="p-3 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-gray-600">{invite.code}</code>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${roleBadge.color}`}>
                          {roleBadge.label}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      {isAdminUser && (
                        <button
                          onClick={() => handleDelete(invite.code)}
                          className="p-1.5 text-gray-400 hover:text-red-600"
                          title="Delete permanently"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                      <span>Used: {invite.usedCount} time{invite.usedCount !== 1 ? 's' : ''}</span>
                      <span>Created: {new Date(invite.created).toLocaleDateString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </details>
        )}
      </div>

      {/* Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Invite Created!</h3>

              <div className="flex justify-center gap-2 mb-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleBadge(showCodeModal.grantRole).color}`}>
                  {getRoleBadge(showCodeModal.grantRole).label}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                  {showCodeModal.maxUses === 0 ? 'Unlimited' : `${showCodeModal.maxUses} use${showCodeModal.maxUses !== 1 ? 's' : ''}`}
                </span>
              </div>

              {/* QR Code Display */}
              {qrCodeDataUrl && (
                <div className="bg-white rounded-lg p-3 mb-4 inline-block border border-gray-200">
                  <img src={qrCodeDataUrl} alt="QR Code" className="mx-auto" />
                </div>
              )}

              {/* Code Display */}
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <code className="text-2xl font-mono font-bold tracking-wider">{showCodeModal.code}</code>
              </div>

              {/* Copy Buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => handleCopyCode(showCodeModal.code)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
                >
                  Copy Code
                </button>
                <button
                  onClick={() => handleCopyUrl(showCodeModal.code)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
                >
                  Copy Link
                </button>
              </div>

              <p className="text-xs text-gray-500 mb-4">
                {showCodeModal.expires === 0 ? 'Never expires' : `Expires in ${formatExpiration(showCodeModal.expires)}`}
              </p>

              <button
                onClick={() => setShowCodeModal(null)}
                className="w-full py-2 bg-rstu-red text-white rounded-md font-medium hover:bg-red-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
