'use client'

import { useState } from 'react'

interface MeetingSuggestionProps {
  buildingAddress: string
  onSubmit: (message: string) => void
  onClose: () => void
}

// Suggested meeting times based on common availability
const TIME_SUGGESTIONS = [
  { label: 'Weekday Evening', value: 'weekday evening (6-8pm)' },
  { label: 'Weekend Morning', value: 'weekend morning (10am-12pm)' },
  { label: 'Weekend Afternoon', value: 'weekend afternoon (2-4pm)' },
  { label: 'Custom', value: '' },
]

export function MeetingSuggestion({ buildingAddress, onSubmit, onClose }: MeetingSuggestionProps) {
  const [locationName, setLocationName] = useState('')
  const [locationAddress, setLocationAddress] = useState('')
  const [selectedTime, setSelectedTime] = useState(TIME_SUGGESTIONS[0].value)
  const [customTime, setCustomTime] = useState('')
  const [notes, setNotes] = useState('')

  const timeValue = selectedTime || customTime

  const handleSubmit = () => {
    if (!locationName.trim() || !timeValue.trim()) return

    // Format: [MEETING] Place Name @ Address | Time | Notes
    let message = `[MEETING] ${locationName.trim()}`

    if (locationAddress.trim()) {
      message += ` @ ${locationAddress.trim()}`
    }

    message += ` | ${timeValue.trim()}`

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
          <h3 className="text-lg font-bold text-gray-900">Suggest a Meeting</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            &times;
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Propose a meeting for tenants at {buildingAddress}. Others can vote on your suggestion.
        </p>

        <div className="space-y-4">
          {/* Location Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Location *
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g., Rancho San Rafael Park, Community Room, Joe's Coffee"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
              autoFocus
            />
          </div>

          {/* Location Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address or Directions
            </label>
            <input
              type="text"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              placeholder="e.g., 1595 N Sierra St, or 'lobby of our building'"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
            />
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Suggested Time *
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {TIME_SUGGESTIONS.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => {
                    setSelectedTime(option.value)
                    if (option.value) setCustomTime('')
                  }}
                  className={`px-3 py-2 text-xs rounded border transition ${
                    selectedTime === option.value
                      ? 'bg-rstu-red text-white border-rstu-red'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {selectedTime === '' && (
              <input
                type="text"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                placeholder="e.g., Tuesday 7pm, next Saturday afternoon"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
              />
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., We'll discuss the rent increase notice"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
            />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 mt-4">
          <p className="text-xs text-blue-700">
            When 3+ tenants vote for this meeting, it will be added to the building calendar.
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!locationName.trim() || !timeValue.trim()}
            className="px-4 py-2 text-sm bg-rstu-red text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Suggest Meeting
          </button>
        </div>
      </div>
    </div>
  )
}
