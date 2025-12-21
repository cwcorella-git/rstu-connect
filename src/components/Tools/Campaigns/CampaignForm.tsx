'use client'

import { useState } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import { createCampaign, type CampaignStage } from '@/lib/campaignStorage'
import { getCurrentProfile } from '@/lib/profileStorage'

interface CampaignFormProps {
  buildings: EnhancedBuilding[]
  onSave: () => void
  onCancel: () => void
}

export function CampaignForm({ buildings, onSave, onCancel }: CampaignFormProps) {
  const [name, setName] = useState('')
  const [landlordName, setLandlordName] = useState('')
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([])
  const [stage, setStage] = useState<CampaignStage>('intelligence')
  const [buildingSearch, setBuildingSearch] = useState('')
  const [showBuildingDropdown, setShowBuildingDropdown] = useState(false)

  const profile = getCurrentProfile()

  // Filter buildings for dropdown
  const filteredBuildings = buildings.filter((b) => {
    const query = buildingSearch.toLowerCase()
    if (!query) return false
    return (
      b.address.toLowerCase().includes(query) ||
      b.owner.toLowerCase().includes(query) ||
      b.propertyName?.toLowerCase().includes(query)
    )
  }).slice(0, 10)

  const handleAddBuilding = (building: EnhancedBuilding) => {
    if (!selectedBuildings.includes(building.chatSlug)) {
      setSelectedBuildings([...selectedBuildings, building.chatSlug])
      // Auto-fill landlord if empty
      if (!landlordName) {
        setLandlordName(building.owner)
      }
    }
    setBuildingSearch('')
    setShowBuildingDropdown(false)
  }

  const handleRemoveBuilding = (chatSlug: string) => {
    setSelectedBuildings(selectedBuildings.filter((s) => s !== chatSlug))
  }

  const handleSubmit = () => {
    if (!name.trim() || !landlordName.trim()) return

    createCampaign({
      name: name.trim(),
      landlordName: landlordName.trim(),
      buildingChatSlugs: selectedBuildings,
      stage,
      outcome: 'pending',
      startDate: new Date().toISOString().split('T')[0],
      demands: [],
      createdBy: profile?.id,
    })

    onSave()
  }

  const getBuildingDisplay = (chatSlug: string) => {
    const building = buildings.find((b) => b.chatSlug === chatSlug)
    if (!building) return chatSlug
    return building.propertyName || building.address.split(',')[0]
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <h2 className="text-lg font-bold text-gray-900">New Campaign</h2>
        <p className="text-sm text-gray-500">Create a new organizing campaign</p>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Campaign Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Campaign Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Riverside Rent Strike"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
          />
        </div>

        {/* Landlord Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Landlord / Management <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={landlordName}
            onChange={(e) => setLandlordName(e.target.value)}
            placeholder="e.g., ACME Property Management LLC"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
          />
        </div>

        {/* Buildings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buildings in Campaign
          </label>

          {/* Selected buildings */}
          {selectedBuildings.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedBuildings.map((slug) => (
                <span
                  key={slug}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm"
                >
                  {getBuildingDisplay(slug)}
                  <button
                    onClick={() => handleRemoveBuilding(slug)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Building search */}
          <div className="relative">
            <input
              type="text"
              value={buildingSearch}
              onChange={(e) => {
                setBuildingSearch(e.target.value)
                setShowBuildingDropdown(true)
              }}
              onFocus={() => setShowBuildingDropdown(true)}
              placeholder="Search buildings to add..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
            />

            {/* Dropdown */}
            {showBuildingDropdown && filteredBuildings.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {filteredBuildings.map((building) => (
                  <button
                    key={building.chatSlug}
                    onClick={() => handleAddBuilding(building)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    disabled={selectedBuildings.includes(building.chatSlug)}
                  >
                    <div className="font-medium text-gray-900">
                      {building.propertyName || building.address.split(',')[0]}
                    </div>
                    <div className="text-xs text-gray-500">
                      {building.owner} &middot; {building.units} units
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Starting Stage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Starting Stage
          </label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as CampaignStage)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
          >
            <option value="intelligence">Intelligence - Initial contact, data gathering</option>
            <option value="organizing">Organizing - 1:1 conversations happening</option>
            <option value="commitment">Commitment - Tenant committee formed</option>
            <option value="preparation">Preparation - Legal review, date set</option>
            <option value="active">Active - Rent being withheld</option>
          </select>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !landlordName.trim()}
            className="flex-1 py-2 bg-rstu-red text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Campaign
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
