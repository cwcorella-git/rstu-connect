'use client'

import { useState, useEffect } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import {
  getBuildingDiscrepancies,
  updateBuildingDiscrepancies,
  initBuildingCanvass,
} from '@/lib/canvassStorage'

interface DataNotesPanelProps {
  building: EnhancedBuilding
}

export function DataNotesPanel({ building }: DataNotesPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Load existing notes
  useEffect(() => {
    const existing = getBuildingDiscrepancies(building.chatSlug)
    if (existing?.notes) {
      setNotes(existing.notes)
    }
  }, [building.chatSlug])

  const handleSave = () => {
    setIsSaving(true)
    initBuildingCanvass(building.chatSlug, building.address)
    updateBuildingDiscrepancies(building.chatSlug, { notes: notes || undefined })
    setIsSaving(false)
    setIsOpen(false)
  }

  const hasNotes = notes.trim().length > 0

  return (
    <div className="border-t border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left text-xs flex items-center justify-between hover:bg-gray-50"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="font-medium text-gray-700">Notes</span>
          {hasNotes && (
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
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
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes for other organizers..."
            rows={4}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-rstu-red"
          />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="mt-2 w-full py-2 bg-rstu-red text-white text-sm font-medium rounded hover:bg-rstu-red-dark disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}
