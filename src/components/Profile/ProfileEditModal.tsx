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
  const [buildingSearch, setBuildingSearch] = useState('')
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
      setBuildingSearch('')
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

      // Get building address for the selected building
      const building = selectedBuildingId
        ? buildings.find(b => b.chatSlug === selectedBuildingId)
        : null

      const updatedProfile: UserProfile = {
        ...profile,
        nickname: nickname.trim(),
        buildingId: selectedBuildingId || undefined,
        buildingAddress: building?.address || undefined,
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
    ? buildings.find(b => b.chatSlug === selectedBuildingId)
    : null

  // Search buildings
  const filteredBuildings = buildingSearch.trim()
    ? buildings.filter(b =>
        b.address.toLowerCase().includes(buildingSearch.toLowerCase()) ||
        b.owner.toLowerCase().includes(buildingSearch.toLowerCase())
      )
    : []

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

          {/* Content - All visible at once, scrollable */}
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

            {/* Building Search - Searchable */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                {t('buildings.address') || 'Building'} (optional)
              </label>
              <input
                type="text"
                value={buildingSearch}
                onChange={(e) => setBuildingSearch(e.target.value)}
                placeholder="Search by address or owner..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rstu-red"
              />

              {/* Search Results Dropdown */}
              {buildingSearch.trim() && filteredBuildings.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg bg-white max-h-48 overflow-y-auto">
                  {filteredBuildings.map((building) => (
                    <button
                      key={building.chatSlug}
                      type="button"
                      onClick={() => {
                        setSelectedBuildingId(building.chatSlug)
                        setBuildingSearch(building.address)
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm"
                    >
                      <div className="font-medium text-gray-900">{building.address}</div>
                      <div className="text-xs text-gray-500">{building.owner}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Building Display */}
              {selectedBuilding && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <div className="font-medium text-blue-900">{selectedBuilding.address}</div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBuildingId(null)
                      setBuildingSearch('')
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                  >
                    Clear selection
                  </button>
                </div>
              )}
            </div>

            {/* Unit Number - Always visible */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                {t('profile.unitNumber') || 'Unit Number'} {!selectedBuilding && '(optional)'}
              </label>
              <input
                type="text"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rstu-red"
                placeholder="e.g., 101, 2B, A"
                disabled={!selectedBuilding}
              />
              {!selectedBuilding && (
                <p className="text-xs text-gray-500 mt-1">Select a building first</p>
              )}
            </div>
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
