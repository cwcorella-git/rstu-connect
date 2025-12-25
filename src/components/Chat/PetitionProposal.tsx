'use client'

import { useState } from 'react'
import { EnhancedBuilding } from '@/lib/getBuildingsData'
import { type LinkedPropertyGroup } from '@/lib/linkedPropertiesStorage'
import { createProposal, VOTE_THRESHOLDS } from '@/lib/governanceStorage'
import { getCurrentProfile } from '@/lib/profileStorage'

interface PetitionProposalProps {
  building: EnhancedBuilding
  propertyGroup: LinkedPropertyGroup | null
  onSubmit: (message: string) => void
  onClose: () => void
}

const PETITION_TARGETS = [
  { id: 'landlord', label: 'Landlord', description: 'Direct petition to property owner' },
  { id: 'management', label: 'Property Management', description: 'Petition to management company' },
  { id: 'city', label: 'City Government', description: 'Petition to local officials' },
  { id: 'county', label: 'County Government', description: 'Petition to Washoe County' },
  { id: 'media', label: 'Media/Public', description: 'Public petition to raise awareness' },
]

export function PetitionProposal({
  building,
  propertyGroup,
  onSubmit,
  onClose,
}: PetitionProposalProps) {
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [goalSignatures, setGoalSignatures] = useState('25')

  const profile = getCurrentProfile()
  const groupId = propertyGroup?.id || building.chatSlug

  const handleSubmit = () => {
    if (!profile || !title.trim() || !target) return

    const targetLabel = PETITION_TARGETS.find(t => t.id === target)?.label || target

    const proposal = createProposal('petition', groupId, {
      targetValue: title.trim(),
      reason: `Petition to ${targetLabel}: ${description.trim() || title.trim()}. Goal: ${goalSignatures} signatures.`,
    })

    if (proposal) {
      const message = `[GOV:petition:${groupId}:${goalSignatures}] ✍️ PETITION: "${title}" - Collecting signatures to present to ${targetLabel}.`
      onSubmit(message)
    }

    onClose()
  }

  const isValid = title.trim() && target

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="text-xl">✍️</span>
              Start a Petition
            </h2>
            <p className="text-xs text-gray-500">
              {propertyGroup ? `For: ${propertyGroup.name || 'Your Bloc'}` : building.address}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Petition Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Petition Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Demand Safe Housing Conditions at [Building]"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Target Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who is this petition for?
            </label>
            <div className="space-y-2">
              {PETITION_TARGETS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTarget(t.id)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    target === t.id
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm text-gray-900">{t.label}</p>
                  <p className="text-xs text-gray-500">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What are we asking for?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what change you want to see..."
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Signature Goal */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Signature Goal
            </label>
            <select
              value={goalSignatures}
              onChange={(e) => setGoalSignatures(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="10">10 signatures</option>
              <option value="25">25 signatures</option>
              <option value="50">50 signatures</option>
              <option value="100">100 signatures</option>
              <option value="250">250 signatures</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Building members can sign after the petition is approved.
            </p>
          </div>

          {/* Info Box */}
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-800">
              <strong>How it works:</strong> After +{VOTE_THRESHOLDS['petition']} votes approve this petition,
              it becomes active and building members can add their signatures. Once the goal is reached,
              it can be delivered to the target.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition ${
              isValid
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Start Petition
          </button>
        </div>
      </div>
    </div>
  )
}
