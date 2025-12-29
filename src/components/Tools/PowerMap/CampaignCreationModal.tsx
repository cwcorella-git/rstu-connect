'use client'

import React, { useState, useMemo } from 'react'
import type { LandlordProperty } from '@/lib/landlordProfileStorage'
import { createCampaign, getStageLabel } from '@/lib/campaignStorage'
import { getBuildingOrganizing } from '@/lib/buildingOrganizingStorage'

interface CampaignCreationModalProps {
  isOpen: boolean
  onClose: () => void
  landlordName: string
  preselectedProperties: LandlordProperty[]
  campaignType: 'habitability' | 'strike'
}

export function CampaignCreationModal({
  isOpen,
  onClose,
  landlordName,
  preselectedProperties,
  campaignType
}: CampaignCreationModalProps) {
  const [selectedProperties, setSelectedProperties] = useState<string[]>(
    preselectedProperties.map(p => p.chatSlug)
  )
  const [campaignName, setCampaignName] = useState(
    campaignType === 'strike'
      ? `Coordinated Strike - ${landlordName}`
      : `Habitability Campaign - ${landlordName}`
  )
  const [demands, setDemands] = useState<string[]>([])
  const [newDemand, setNewDemand] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Calculate campaign stats
  const stats = useMemo(() => {
    const selectedProps = preselectedProperties.filter(p =>
      selectedProperties.includes(p.chatSlug)
    )
    const totalUnits = selectedProps.reduce((sum, p) => sum + p.units, 0)
    const totalValue = selectedProps.reduce((sum, p) => sum + p.value, 0)

    return {
      propertyCount: selectedProps.length,
      totalUnits,
      totalValue,
      avgUnitsPerProperty: totalUnits / selectedProps.length
    }
  }, [selectedProperties, preselectedProperties])

  // Generate default demands based on campaign type
  const defaultDemands = useMemo(() => {
    if (demands.length > 0) return demands

    const orgs = preselectedProperties
      .filter(p => selectedProperties.includes(p.chatSlug))
      .flatMap(p => getBuildingOrganizing(p.chatSlug).complaints)

    if (campaignType === 'habitability') {
      const issueTypes = new Set<string>()
      orgs.forEach(c => {
        if (c.title) issueTypes.add(c.title)
      })
      return Array.from(issueTypes).slice(0, 5).map(issue => `Repair: ${issue}`)
    } else {
      return [
        'Reduction of rent by 10% across all properties',
        'Implementation of habitability repairs',
        'Formal written response to tenant demands within 14 days'
      ]
    }
  }, [demands, campaignType, preselectedProperties, selectedProperties])

  const handleAddDemand = () => {
    if (newDemand.trim()) {
      setDemands([...demands, newDemand.trim()])
      setNewDemand('')
    }
  }

  const handleRemoveDemand = (index: number) => {
    setDemands(demands.filter((_, i) => i !== index))
  }

  const handleToggleProperty = (chatSlug: string) => {
    if (selectedProperties.includes(chatSlug)) {
      setSelectedProperties(selectedProperties.filter(s => s !== chatSlug))
    } else {
      setSelectedProperties([...selectedProperties, chatSlug])
    }
  }

  const handleCreateCampaign = async () => {
    if (!campaignName.trim() || selectedProperties.length === 0) {
      alert('Campaign name and at least one property are required')
      return
    }

    setIsCreating(true)
    try {
      const campaignDemands = demands.length > 0 ? demands : defaultDemands

      createCampaign({
        name: campaignName.trim(),
        buildingChatSlugs: selectedProperties,
        landlordName,
        demands: campaignDemands.map((text, idx) => ({
          id: `demand-${Date.now()}-${idx}`,
          text,
          status: 'proposed' as const
        })),
        stage: 'organizing',
        outcome: 'pending',
        startDate: new Date().toISOString().split('T')[0],
        estimatedUnits: stats.totalUnits
      })

      alert(`Campaign "${campaignName}" created successfully with ${selectedProperties.length} properties!`)
      onClose()
    } catch (error) {
      console.error('Failed to create campaign:', error)
      alert('Failed to create campaign. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              {campaignType === 'strike' ? '⚡ Plan Coordinated Strike' : '🎯 Create Habitability Campaign'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isCreating}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Campaign Name
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rstu-red"
              placeholder="Enter campaign name"
              disabled={isCreating}
            />
          </div>

          {/* Campaign Stats */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Campaign Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.propertyCount}</div>
                <div className="text-xs text-gray-600">Properties</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalUnits.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Total Units</div>
              </div>
            </div>
          </div>

          {/* Properties Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Select Buildings
            </label>
            <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto p-3">
              <div className="space-y-2">
                {preselectedProperties.map(property => (
                  <label key={property.apn} className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedProperties.includes(property.chatSlug)}
                      onChange={() => handleToggleProperty(property.chatSlug)}
                      className="mt-1"
                      disabled={isCreating}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {property.address.split(',')[0]}
                      </div>
                      <div className="text-xs text-gray-600">
                        {property.units} units · ${property.value.toLocaleString()}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Demands */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Campaign Demands
            </label>
            <div className="space-y-2 mb-3">
              {(demands.length > 0 ? demands : defaultDemands).map((demand, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{demand}</p>
                  </div>
                  {demands.length > 0 && (
                    <button
                      onClick={() => handleRemoveDemand(index)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium flex-shrink-0"
                      disabled={isCreating}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Demand */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newDemand}
                onChange={(e) => setNewDemand(e.target.value)}
                placeholder="Add a new demand..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rstu-red text-sm"
                disabled={isCreating}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddDemand()
                  }
                }}
              />
              <button
                onClick={handleAddDemand}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium disabled:opacity-50"
                disabled={isCreating || !newDemand.trim()}
              >
                Add
              </button>
            </div>
          </div>

          {/* Campaign Type Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              {campaignType === 'strike'
                ? '💡 This coordinated strike will link rent withholding across multiple properties. All buildings must be strike-ready (65%+ participation) before proceeding.'
                : '💡 This habitability campaign will coordinate tenant organizing around poor living conditions. Tenants will work together to demand necessary repairs.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 border-t border-gray-200 bg-gray-50 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateCampaign}
            disabled={isCreating || selectedProperties.length === 0 || !campaignName.trim()}
            className="flex-1 px-4 py-2 bg-rstu-red text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </div>
    </div>
  )
}
