'use client'

import { useState, useEffect } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import {
  createProfile,
  validateInviteCode,
  parseProfileParams,
  type UserProfile,
} from '@/lib/profileStorage'

interface ProfileCreateProps {
  buildings: EnhancedBuilding[]
  onProfileCreated: (profile: UserProfile) => void
  onCancel?: () => void
}

export function ProfileCreate({ buildings, onProfileCreated, onCancel }: ProfileCreateProps) {
  // Form state
  const [nickname, setNickname] = useState('')
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('')
  const [unitNumber, setUnitNumber] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  // Validation state
  const [inviteValidation, setInviteValidation] = useState<{
    checked: boolean
    valid: boolean
    error?: string
    buildingId?: string
    unitNumber?: string
  }>({ checked: false, valid: false })

  const [error, setError] = useState<string | null>(null)

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

  const handleValidateInvite = (code: string) => {
    if (!code.trim()) {
      setInviteValidation({ checked: false, valid: false })
      return
    }

    const result = validateInviteCode(code.trim())
    if (result.valid && result.invite) {
      setInviteValidation({
        checked: true,
        valid: true,
        buildingId: result.invite.buildingId,
        unitNumber: result.invite.unitNumber,
      })
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
    }
  }

  const selectedBuilding = buildings.find(b => b.chatSlug === selectedBuildingId)

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

    try {
      const profile = createProfile({
        nickname: nickname.trim(),
        buildingId: selectedBuildingId || undefined,
        buildingAddress: selectedBuilding?.address,
        unitNumber: unitNumber.trim() || undefined,
        inviteCode: inviteCode.trim() || undefined,
      })

      // Clear URL params
      if (typeof window !== 'undefined' && window.history.replaceState) {
        window.history.replaceState({}, '', window.location.pathname)
      }

      onProfileCreated(profile)
    } catch (err) {
      setError('Failed to create profile. Please try again.')
    }
  }

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create Your Profile</h1>
            <p className="text-sm text-gray-500 mt-1">Join your building&apos;s tenant community</p>
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
          {/* Invite Code (optional) */}
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
                placeholder="Enter code from another tenant"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent font-mono uppercase"
                maxLength={6}
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
            {inviteValidation.checked && (
              <p className={`text-xs mt-1 ${inviteValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
                {inviteValidation.valid ? 'Valid invite code!' : inviteValidation.error}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Got invited by a neighbor? Enter their code here.
            </p>
          </div>

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
            Create Profile
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
