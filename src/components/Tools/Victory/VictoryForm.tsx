'use client'

import { useState, useMemo } from 'react'
import {
  type Victory,
  type VictoryType,
  VICTORY_TYPES,
  COMMON_TACTICS,
  addVictory,
  updateVictory,
} from '@/lib/victoryStorage'
import { getCurrentProfile } from '@/lib/profileStorage'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'

interface VictoryFormProps {
  buildings: EnhancedBuilding[]
  existingVictory?: Victory
  initialBuildingSlug?: string
  initialLandlord?: string
  onSave: (victory: Victory) => void
  onCancel: () => void
}

export function VictoryForm({
  buildings,
  existingVictory,
  initialBuildingSlug,
  initialLandlord,
  onSave,
  onCancel,
}: VictoryFormProps) {
  const isEditing = !!existingVictory

  // Form state
  const [type, setType] = useState<VictoryType>(existingVictory?.type || 'repairs')
  const [title, setTitle] = useState(existingVictory?.title || '')
  const [date, setDate] = useState(existingVictory?.date || new Date().toISOString().split('T')[0])
  const [buildingSlug, setBuildingSlug] = useState(existingVictory?.buildingChatSlug || initialBuildingSlug || '')
  const [landlordName, setLandlordName] = useState(existingVictory?.landlordName || initialLandlord || '')
  const [description, setDescription] = useState(existingVictory?.description || '')
  const [quantifiedImpact, setQuantifiedImpact] = useState(existingVictory?.quantifiedImpact || '')
  const [unitsAffected, setUnitsAffected] = useState(existingVictory?.unitsAffected?.toString() || '')
  const [monthlyRentReduction, setMonthlyRentReduction] = useState(existingVictory?.monthlyRentReduction?.toString() || '')
  const [duration, setDuration] = useState(existingVictory?.duration || '')
  const [tactics, setTactics] = useState<string[]>(existingVictory?.tactics || [])
  const [customTactic, setCustomTactic] = useState('')
  const [memberQuote, setMemberQuote] = useState(existingVictory?.memberQuote || '')
  const [memberName, setMemberName] = useState(existingVictory?.memberName || '')

  // Building search
  const [buildingSearch, setBuildingSearch] = useState('')
  const [showBuildingDropdown, setShowBuildingDropdown] = useState(false)

  const filteredBuildings = useMemo(() => {
    if (!buildingSearch.trim()) return []
    const query = buildingSearch.toLowerCase()
    return buildings
      .filter(
        (b) =>
          b.address.toLowerCase().includes(query) ||
          b.owner.toLowerCase().includes(query) ||
          b.propertyName?.toLowerCase().includes(query)
      )
      .slice(0, 10)
  }, [buildings, buildingSearch])

  // Get selected building info
  const selectedBuilding = useMemo(() => {
    if (!buildingSlug) return null
    return buildings.find((b) => b.chatSlug === buildingSlug)
  }, [buildings, buildingSlug])

  const handleSelectBuilding = (building: EnhancedBuilding) => {
    setBuildingSlug(building.chatSlug)
    setLandlordName(building.owner)
    setBuildingSearch('')
    setShowBuildingDropdown(false)
  }

  const handleClearBuilding = () => {
    setBuildingSlug('')
    setLandlordName('')
  }

  const handleToggleTactic = (tactic: string) => {
    if (tactics.includes(tactic)) {
      setTactics(tactics.filter((t) => t !== tactic))
    } else {
      setTactics([...tactics, tactic])
    }
  }

  const handleAddCustomTactic = () => {
    const trimmed = customTactic.trim()
    if (trimmed && !tactics.includes(trimmed)) {
      setTactics([...tactics, trimmed])
      setCustomTactic('')
    }
  }

  const handleRemoveTactic = (tactic: string) => {
    setTactics(tactics.filter((t) => t !== tactic))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !description.trim()) {
      return
    }

    const profile = getCurrentProfile()
    const victoryData = {
      type,
      title: title.trim(),
      date,
      buildingChatSlug: buildingSlug || undefined,
      landlordName: landlordName.trim() || undefined,
      description: description.trim(),
      quantifiedImpact: quantifiedImpact.trim() || undefined,
      unitsAffected: unitsAffected ? parseInt(unitsAffected, 10) : undefined,
      monthlyRentReduction: monthlyRentReduction ? parseInt(monthlyRentReduction, 10) : undefined,
      duration: duration.trim() || undefined,
      tactics: tactics.length > 0 ? tactics : undefined,
      memberQuote: memberQuote.trim() || undefined,
      memberName: memberName.trim() || undefined,
      createdBy: profile?.id,
    }

    let savedVictory: Victory
    if (isEditing && existingVictory) {
      savedVictory = updateVictory(existingVictory.id, victoryData) || existingVictory
    } else {
      savedVictory = addVictory(victoryData)
    }

    onSave(savedVictory)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-bold text-gray-900">
          {isEditing ? 'Edit Victory' : 'Document Victory'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Record this organizing win to inspire others
        </p>
      </div>

      {/* Form content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Victory Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Victory Type *</label>
          <div className="grid grid-cols-2 gap-2">
            {VICTORY_TYPES.map((vt) => (
              <button
                key={vt.key}
                type="button"
                onClick={() => setType(vt.key)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  type === vt.key
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-sm font-medium">{vt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Rent rollback at 123 Main St"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Building */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Building (optional)</label>
          {selectedBuilding ? (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{selectedBuilding.address}</p>
                <p className="text-xs text-gray-500">{selectedBuilding.owner}</p>
              </div>
              <button
                type="button"
                onClick={handleClearBuilding}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={buildingSearch}
                onChange={(e) => {
                  setBuildingSearch(e.target.value)
                  setShowBuildingDropdown(true)
                }}
                onFocus={() => setShowBuildingDropdown(true)}
                placeholder="Search by address or landlord..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {showBuildingDropdown && filteredBuildings.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredBuildings.map((building) => (
                    <button
                      key={building.apn}
                      type="button"
                      onClick={() => handleSelectBuilding(building)}
                      className="w-full p-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      <p className="text-sm font-medium text-gray-900">{building.address}</p>
                      <p className="text-xs text-gray-500">{building.owner}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Landlord Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Landlord Name</label>
          <input
            type="text"
            value={landlordName}
            onChange={(e) => setLandlordName(e.target.value)}
            placeholder="e.g., ABC Property Management"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what happened, how you organized, and what you achieved..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            required
          />
        </div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantified Impact</label>
            <input
              type="text"
              value={quantifiedImpact}
              onChange={(e) => setQuantifiedImpact(e.target.value)}
              placeholder="e.g., $200/month savings"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Units Affected</label>
            <input
              type="number"
              value={unitsAffected}
              onChange={(e) => setUnitsAffected(e.target.value)}
              placeholder="e.g., 15"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Rent reduction (only for rent_reduction type) */}
        {type === 'rent_reduction' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent Reduction ($)</label>
            <input
              type="number"
              value={monthlyRentReduction}
              onChange={(e) => setMonthlyRentReduction(e.target.value)}
              placeholder="e.g., 200"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Duration</label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 30-day strike, 2 weeks negotiation"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Tactics */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tactics Used</label>

          {/* Selected tactics */}
          {tactics.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tactics.map((tactic) => (
                <span
                  key={tactic}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-green-100 text-green-700"
                >
                  {tactic}
                  <button
                    type="button"
                    onClick={() => handleRemoveTactic(tactic)}
                    className="hover:text-green-900"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Common tactics */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {COMMON_TACTICS.filter((t) => !tactics.includes(t)).map((tactic) => (
              <button
                key={tactic}
                type="button"
                onClick={() => handleToggleTactic(tactic)}
                className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                + {tactic}
              </button>
            ))}
          </div>

          {/* Custom tactic */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customTactic}
              onChange={(e) => setCustomTactic(e.target.value)}
              placeholder="Add custom tactic..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddCustomTactic()
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddCustomTactic}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
            >
              Add
            </button>
          </div>
        </div>

        {/* Member Testimonial */}
        <div className="border-t border-gray-200 pt-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Member Testimonial (optional)</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Quote</label>
              <textarea
                value={memberQuote}
                onChange={(e) => setMemberQuote(e.target.value)}
                placeholder="A quote from a participating tenant..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name (or leave blank for anonymous)</label>
              <input
                type="text"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="e.g., Maria S."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
        >
          {isEditing ? 'Save Changes' : 'Document Victory'}
        </button>
      </div>
    </form>
  )
}
