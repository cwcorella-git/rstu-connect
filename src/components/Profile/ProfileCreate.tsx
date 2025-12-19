'use client'

import { useState, useEffect } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import {
  createProfile,
  updateProfile,
  validateInviteCode,
  parseProfileParams,
  bootstrapFirstAdmin,
  type UserProfile,
} from '@/lib/profileStorage'
import { syncProfile } from '@/lib/profileSync'

interface ProfileCreateProps {
  buildings: EnhancedBuilding[]
  onProfileCreated: (profile: UserProfile) => void
  onCancel?: () => void
  existingProfile?: UserProfile // For edit mode
}

export function ProfileCreate({ buildings, onProfileCreated, onCancel, existingProfile }: ProfileCreateProps) {
  const isEditMode = !!existingProfile

  // Form state - pre-fill from existing profile if editing
  const [nickname, setNickname] = useState(existingProfile?.nickname || '')
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(existingProfile?.buildingId || '')
  const [unitNumber, setUnitNumber] = useState(existingProfile?.unitNumber || '')
  const [inviteCode, setInviteCode] = useState('')

  // Validation state
  const [inviteValidation, setInviteValidation] = useState<{
    checked: boolean
    valid: boolean
    error?: string
    buildingId?: string
    unitNumber?: string
  }>({ checked: false, valid: false })

  // Bootstrap admin state
  const [isBootstrapMode, setIsBootstrapMode] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('')
  const [isCheckingBootstrap, setIsCheckingBootstrap] = useState(false)

  // Building search state
  const [buildingSearch, setBuildingSearch] = useState('')
  const [showBuildingList, setShowBuildingList] = useState(false)

  const [error, setError] = useState<string | null>(null)

  // Filter buildings based on search
  const filteredBuildings = buildings.filter(b =>
    b.address.toLowerCase().includes(buildingSearch.toLowerCase())
  )

  const selectedBuilding = buildings.find(b => b.chatSlug === selectedBuildingId)

  // Check for URL params on mount
  useEffect(() => {
    const params = parseProfileParams()
    if (params) {
      if (params.buildingId) {
        setSelectedBuildingId(params.buildingId)
      }
      if (params.unitNumber) {
        setUnitNumber(params.unitNumber)
      }
      if (params.inviteCode) {
        setInviteCode(params.inviteCode)
        handleValidateInvite(params.inviteCode)
      }
    }
  }, [])

  const handleValidateInvite = async (code: string) => {
    if (!code.trim()) {
      setInviteValidation({ checked: false, valid: false })
      setIsBootstrapMode(false)
      return
    }

    const trimmedCode = code.trim()

    // Check if it's a bootstrap admin code (starts with RSTU-)
    if (trimmedCode.toUpperCase().startsWith('RSTU-') && trimmedCode.length > 6) {
      // Enter bootstrap mode - require nickname and password
      setIsCheckingBootstrap(true)

      // Check with server if admin already exists
      try {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKETIO_URL || 'https://rstu-gun-relay.onrender.com'
        const response = await fetch(`${socketUrl}/admin-exists`)
        if (response.ok) {
          const data = await response.json()
          if (data.exists) {
            setInviteValidation({
              checked: true,
              valid: false,
              error: 'Admin code has already been used. Contact existing admin for an invite.',
            })
            setIsCheckingBootstrap(false)
            return
          }
        }
      } catch {
        // Server might not support this endpoint yet - allow local check as fallback
      }

      setIsCheckingBootstrap(false)
      setIsBootstrapMode(true)
      setInviteValidation({
        checked: true,
        valid: true,
      })
      return
    }

    // Regular invite code validation
    const result = validateInviteCode(trimmedCode)
    if (result.valid && result.invite) {
      setInviteValidation({
        checked: true,
        valid: true,
        buildingId: result.invite.buildingId,
        unitNumber: result.invite.unitNumber,
      })
      setIsBootstrapMode(false)
      // Auto-fill from invite
      if (result.invite.buildingId) {
        setSelectedBuildingId(result.invite.buildingId)
      }
      if (result.invite.unitNumber) {
        setUnitNumber(result.invite.unitNumber)
      }
    } else {
      setInviteValidation({
        checked: true,
        valid: false,
        error: result.error,
      })
      setIsBootstrapMode(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!nickname.trim()) {
      setError('Please enter a nickname')
      return
    }

    if (nickname.trim().length < 2) {
      setError('Nickname must be at least 2 characters')
      return
    }

    // Bootstrap mode requires password
    if (isBootstrapMode) {
      if (!adminPassword) {
        setError('Please set a password for your admin account')
        return
      }
      if (adminPassword.length < 8) {
        setError('Password must be at least 8 characters')
        return
      }
      if (adminPassword !== adminPasswordConfirm) {
        setError('Passwords do not match')
        return
      }

      // Create bootstrap admin with password
      const profile = bootstrapFirstAdmin(inviteCode.trim(), nickname.trim(), adminPassword)
      if (!profile) {
        setError('Failed to create admin account. Code may have already been used.')
        return
      }

      // Sync the new profile to server
      syncProfile()

      // Clear URL params
      if (typeof window !== 'undefined' && window.history.replaceState) {
        window.history.replaceState({}, '', window.location.pathname)
      }

      onProfileCreated(profile)
      return
    }

    try {
      let profile: UserProfile | null

      if (isEditMode) {
        // Update existing profile
        profile = updateProfile({
          nickname: nickname.trim(),
          buildingId: selectedBuildingId || undefined,
          buildingAddress: selectedBuilding?.address,
          unitNumber: unitNumber.trim() || undefined,
        })
      } else {
        // Create new profile
        profile = createProfile({
          nickname: nickname.trim(),
          buildingId: selectedBuildingId || undefined,
          buildingAddress: selectedBuilding?.address,
          unitNumber: unitNumber.trim() || undefined,
          inviteCode: inviteCode.trim() || undefined,
        })
      }

      if (!profile) {
        setError('Failed to save profile. Please try again.')
        return
      }

      // Sync the new profile to server
      syncProfile()

      // Clear URL params
      if (typeof window !== 'undefined' && window.history.replaceState) {
        window.history.replaceState({}, '', window.location.pathname)
      }

      onProfileCreated(profile)
    } catch (err) {
      setError('Failed to save profile. Please try again.')
    }
  }

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isEditMode ? 'Edit Profile' : 'Create Your Profile'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEditMode ? 'Update your profile information' : 'Join your building\'s tenant community'}
            </p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
          {/* Invite Code (optional) - only show when creating, not editing */}
          {!isEditMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invite Code
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value.toUpperCase())
                    if (inviteValidation.checked) {
                      setInviteValidation({ checked: false, valid: false })
                    }
                  }}
                  placeholder="Enter invite or admin code"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent font-mono uppercase"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={() => handleValidateInvite(inviteCode)}
                  disabled={!inviteCode.trim()}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 disabled:opacity-50"
                >
                  Check
                </button>
              </div>
              {isCheckingBootstrap && (
                <p className="text-xs mt-1 text-gray-500">Checking admin code...</p>
              )}
              {inviteValidation.checked && !isBootstrapMode && (
                <p className={`text-xs mt-1 ${inviteValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {inviteValidation.valid ? 'Valid invite code!' : inviteValidation.error}
                </p>
              )}
              {isBootstrapMode && (
                <p className="text-xs mt-1 text-green-600">
                  Admin code accepted. Set your nickname and password below.
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Got an invite code? Enter it here. Admin codes start with RSTU-.
              </p>
            </div>
          )}

          {/* Bootstrap Admin Password Fields */}
          {isBootstrapMode && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 space-y-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Creating Admin Account</p>
                  <p className="mt-1 text-xs">
                    You are creating the first admin account. Set a secure password - this code can only be used once.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="password"
                  value={adminPasswordConfirm}
                  onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                  minLength={8}
                />
                {adminPassword && adminPasswordConfirm && adminPassword !== adminPasswordConfirm && (
                  <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                )}
              </div>
            </div>
          )}

          {/* Nickname */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nickname
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="How should we call you?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
              maxLength={30}
            />
            <p className="text-xs text-gray-400 mt-1">
              This is how you&apos;ll appear to others. No real name required.
            </p>
          </div>

          {/* Building Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Building
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <select
              value={selectedBuildingId}
              onChange={(e) => setSelectedBuildingId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
            >
              <option value="">Select your building...</option>
              {buildings.map((building) => (
                <option key={building.apn} value={building.chatSlug}>
                  {building.address.split(',')[0]}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Link your profile to see building-specific info.
            </p>
          </div>

          {/* Unit Number */}
          {selectedBuildingId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Number
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <input
                type="text"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                placeholder="e.g., 101, A2, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                Helps us show you relevant info for your unit.
              </p>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-xs text-blue-700">
                <p className="font-medium">Your data stays on your device</p>
                <p className="mt-1">
                  Your profile is stored locally in your browser. We don&apos;t have accounts or servers tracking you.
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-md p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-rstu-red text-white rounded-md font-medium hover:bg-rstu-red-dark transition-colors"
          >
            {isEditMode ? 'Save Changes' : 'Create Profile'}
          </button>

          {/* Skip */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 text-gray-500 text-sm hover:text-gray-700"
            >
              Skip for now
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
