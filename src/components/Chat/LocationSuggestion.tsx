'use client'

import { useState } from 'react'

interface LocationSuggestionProps {
  buildingAddress: string
  onSubmit: (message: string) => void
  onClose: () => void
}

export function LocationSuggestion({ buildingAddress, onSubmit, onClose }: LocationSuggestionProps) {
  const [locationName, setLocationName] = useState('')
  const [locationAddress, setLocationAddress] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = () => {
    if (!locationName.trim()) return

    let message = `[LOCATION] ${locationName.trim()}`

    if (locationAddress.trim()) {
      message += ` - ${locationAddress.trim()}`
    }

    if (notes.trim()) {
      message += ` | ${notes.trim()}`
    }

    onSubmit(message)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-gray-900">Suggest a Meeting Spot</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            &times;
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Where should tenants from {buildingAddress} meet up?
        </p>

        <div className="space-y-4">
          {/* Location Name - required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Place Name *
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g., Rancho San Rafael Park, Downtown Library, Joe's Coffee"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
              autoFocus
            />
          </div>

          {/* Address - optional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address or Cross-Streets
            </label>
            <input
              type="text"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              placeholder="e.g., 1595 N Sierra St, corner of 4th and Virginia"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
            />
          </div>

          {/* Notes - optional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Why this spot?
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Free parking, quiet area, good for groups"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Others can vote on your suggestion by reacting in chat
        </p>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!locationName.trim()}
            className="px-4 py-2 text-sm bg-rstu-red text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suggest This Spot
          </button>
        </div>
      </div>
    </div>
  )
}
