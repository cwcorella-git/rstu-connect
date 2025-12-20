'use client'

import { useState } from 'react'
import { submitComplaint, COMPLAINT_CATEGORIES } from '@/lib/buildingOrganizingStorage'
import { getCurrentProfile } from '@/lib/profileStorage'

interface ComplaintFormProps {
  buildingId: string
  onSubmit: () => void
  onCancel: () => void
}

export function ComplaintForm({ buildingId, onSubmit, onCancel }: ComplaintFormProps) {
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const profile = getCurrentProfile()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!profile) {
      setError('You must be logged in to submit a complaint')
      return
    }

    if (!category) {
      setError('Please select a category')
      return
    }

    if (!title.trim()) {
      setError('Please enter a title')
      return
    }

    if (!description.trim()) {
      setError('Please describe the issue')
      return
    }

    setSubmitting(true)

    const result = submitComplaint({
      buildingId,
      category,
      title: title.trim(),
      description: description.trim(),
    })

    if (result) {
      onSubmit()
    } else {
      setError('Failed to submit complaint')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Submit a Complaint</h3>
          <p className="text-sm text-gray-500 mt-1">
            Your complaint will be voted on by fellow tenants
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
            >
              <option value="">Select a category...</option>
              {COMPLAINT_CATEGORIES.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of the issue"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
              maxLength={100}
            />
            <p className="text-xs text-gray-400 mt-1">{title.length}/100</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail. Include specific examples if possible."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1">{description.length}/500</p>
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 border border-blue-100 rounded p-3">
            <p className="text-xs text-blue-700">
              Complaints need <strong>+5 net votes</strong> to become an official demand.
              Only tenants assigned to this building can vote.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !category || !title.trim() || !description.trim()}
            className="px-4 py-2 bg-rstu-red text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </div>
    </div>
  )
}
