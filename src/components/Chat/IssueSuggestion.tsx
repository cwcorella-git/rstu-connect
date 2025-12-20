'use client'

import { useState } from 'react'
import { COMPLAINT_CATEGORIES } from '@/lib/canvassStorage'

interface IssueSuggestionProps {
  buildingAddress: string
  onSubmit: (message: string) => void
  onClose: () => void
}

export function IssueSuggestion({ buildingAddress, onSubmit, onClose }: IssueSuggestionProps) {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = () => {
    if (!selectedCategory || !title.trim()) return

    // Format: [ISSUE:category:title] description
    let message = `[ISSUE:${selectedCategory}:${title.trim()}]`
    if (description.trim()) {
      message += ` ${description.trim()}`
    }

    onSubmit(message)
    onClose()
  }

  const selectedCategoryInfo = COMPLAINT_CATEGORIES.find(c => c.key === selectedCategory)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-gray-900">Report Issue</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            &times;
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Report an issue at {buildingAddress}. Tenants will vote on submitted issues.
          Issues with +5 net votes become official demands.
        </p>

        <div className="space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
            >
              <option value="">Select a category...</option>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Broken elevator on floor 3"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
              maxLength={100}
            />
            <p className="text-xs text-gray-400 mt-1">{title.length}/100</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1">{description.length}/500</p>
          </div>

          {/* Preview */}
          {selectedCategory && title.trim() && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Preview:</p>
              <div className="flex items-start gap-2">
                <span className="text-red-500 text-lg">!</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">
                    {selectedCategoryInfo?.label}
                  </p>
                  {description.trim() && (
                    <p className="text-xs text-gray-600 mt-1">{description}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* How voting works info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-blue-700">
              <p className="font-medium">How voting works:</p>
              <ul className="mt-1 space-y-0.5 list-disc list-inside text-blue-600">
                <li>All tenants in this building can vote</li>
                <li>+5 net votes promotes issue to a demand</li>
                <li>-3 net votes rejects the issue</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedCategory || !title.trim()}
            className="px-4 py-2 text-sm bg-rstu-red text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Issue
          </button>
        </div>
      </div>
    </div>
  )
}
