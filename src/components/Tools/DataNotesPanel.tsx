'use client'

import { useState, useEffect } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import {
  getBuildingDiscrepancies,
  updateBuildingDiscrepancies,
  initBuildingCanvass,
  type BuildingCanvass
} from '@/lib/canvassStorage'

interface DataNotesPanelProps {
  building: EnhancedBuilding
}

export function DataNotesPanel({ building }: DataNotesPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [discrepancies, setDiscrepancies] = useState<BuildingCanvass['dataDiscrepancies']>({})
  const [isSaving, setIsSaving] = useState(false)

  // Load existing discrepancies
  useEffect(() => {
    const existing = getBuildingDiscrepancies(building.chatSlug)
    if (existing) {
      setDiscrepancies(existing)
    }
  }, [building.chatSlug])

  const handleSave = () => {
    setIsSaving(true)
    // Make sure building exists in storage
    initBuildingCanvass(building.chatSlug, building.address)
    updateBuildingDiscrepancies(building.chatSlug, discrepancies)
    setIsSaving(false)
    setIsOpen(false)
  }

  const hasDiscrepancies = discrepancies?.actualUnits || discrepancies?.actualName ||
    discrepancies?.managementCompany || discrepancies?.notes

  return (
    <div className="border-t border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left text-xs flex items-center justify-between hover:bg-gray-50"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-medium text-gray-700">Data Notes</span>
          {hasDiscrepancies && (
            <span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 text-[10px]">
              Has notes
            </span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-100">
          <p className="text-xs text-yellow-800 mb-3">
            Note any discrepancies between county data and reality. County shows {building.units} units.
          </p>

          <div className="space-y-3">
            {/* Actual unit count */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Actual Unit Count (if different)
              </label>
              <input
                type="number"
                value={discrepancies?.actualUnits || ''}
                onChange={(e) => setDiscrepancies({
                  ...discrepancies,
                  actualUnits: e.target.value ? parseInt(e.target.value) : undefined
                })}
                placeholder={`County says ${building.units}`}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>

            {/* Actual name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Local/Informal Name
              </label>
              <input
                type="text"
                value={discrepancies?.actualName || ''}
                onChange={(e) => setDiscrepancies({
                  ...discrepancies,
                  actualName: e.target.value || undefined
                })}
                placeholder="e.g., DeAngel Apartments"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>

            {/* Management company */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Property Management
              </label>
              <input
                type="text"
                value={discrepancies?.managementCompany || ''}
                onChange={(e) => setDiscrepancies({
                  ...discrepancies,
                  managementCompany: e.target.value || undefined
                })}
                placeholder="e.g., TriEx Management"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Notes / Discrepancies
              </label>
              <textarea
                value={discrepancies?.notes || ''}
                onChange={(e) => setDiscrepancies({
                  ...discrepancies,
                  notes: e.target.value || undefined
                })}
                placeholder="e.g., Building has additional units in converted house next door..."
                rows={3}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>

            {/* Verified by */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Verified By
              </label>
              <input
                type="text"
                value={discrepancies?.verifiedBy || ''}
                onChange={(e) => setDiscrepancies({
                  ...discrepancies,
                  verifiedBy: e.target.value || undefined
                })}
                placeholder="Your name"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>

            {/* Last verified */}
            {discrepancies?.verifiedDate && (
              <p className="text-xs text-gray-500">
                Last updated: {new Date(discrepancies.verifiedDate).toLocaleDateString()}
              </p>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-2 bg-yellow-600 text-white text-sm font-medium rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
