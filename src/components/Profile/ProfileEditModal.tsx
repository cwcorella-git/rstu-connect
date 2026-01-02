'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { getCurrentProfile, updateProfile, type UserProfile } from '@/lib/profileStorage'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  buildings: EnhancedBuilding[]
  onSave?: (profile: UserProfile) => void
}

export function ProfileEditModal({ isOpen, onClose, buildings, onSave }: ProfileEditModalProps) {
  const { t } = useLanguage()
  const profile = getCurrentProfile()

  const [nickname, setNickname] = useState('')
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null)
  const [unitNumber, setUnitNumber] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load current profile data
  useEffect(() => {
    if (isOpen && profile) {
      setNickname(profile.nickname)
      setSelectedBuildingId(profile.buildingId || null)
      setUnitNumber(profile.unitNumber || '')
      setError(null)
    }
  }, [isOpen, profile])

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (!profile) {
      setError('No profile to update')
      return
    }

    try {
      setIsLoading(true)

      const updatedProfile: UserProfile = {
        ...profile,
        nickname: nickname.trim(),
        buildingId: selectedBuildingId || undefined,
        unitNumber: unitNumber.trim() || undefined,
      }

      updateProfile(updatedProfile)
      onSave?.(updatedProfile)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !profile) return null

  const selectedBuilding = selectedBuildingId
    ? buildings.find(b => b.apn === selectedBuildingId)
    : null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{t('profile.editProfile') || 'Edit Profile'}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            {/* Nickname */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                {t('profile.nickname') || 'Nickname'}
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rstu-red"
                placeholder="Your name or alias"
              />
            </div>

            {/* Building Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                {t('buildings.buildingName') || 'Building'}
              </label>
              <select
                value={selectedBuildingId || ''}
                onChange={(e) => setSelectedBuildingId(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rstu-red"
              >
                <option value="">Select a building (optional)</option>
                {buildings.map((building) => (
                  <option key={building.apn} value={building.apn}>
                    {building.address}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Number */}
            {selectedBuilding && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  {t('buildings.unitNumber') || 'Unit Number'}
                </label>
                <input
                  type="text"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rstu-red"
                  placeholder="e.g., 101, 2B, A"
                />
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {t('common.cancel') || 'Cancel'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 bg-rstu-red text-white rounded-lg hover:bg-red-800 disabled:opacity-50 transition-colors font-medium"
            >
              {isLoading ? t('common.saving') || 'Saving...' : t('common.save') || 'Save'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
