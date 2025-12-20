'use client'

import { useState, useEffect } from 'react'
import { getCurrentProfile } from '@/lib/profileStorage'
import { getLinkedGroups, type LinkedPropertyGroup } from '@/lib/linkedPropertiesStorage'
import { getBuildingDemands } from '@/lib/buildingOrganizingStorage'
import {
  createProposal,
  formatProposalMessage,
  type GovernanceProposalType,
  VOTE_THRESHOLDS,
} from '@/lib/governanceStorage'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'

interface VoteSuggestionProps {
  groupId: string
  groupName: string
  building?: EnhancedBuilding
  allBuildings?: EnhancedBuilding[]
  onSubmit: (message: string) => void
  onClose: () => void
}

type VoteCategory = 'identity' | 'membership' | 'coordination' | 'moderation'

interface VoteOption {
  type: GovernanceProposalType
  label: string
  description: string
  category: VoteCategory
  requiresOrganizer?: boolean
}

const VOTE_OPTIONS: VoteOption[] = [
  {
    type: 'rename',
    label: 'Rename our group',
    description: 'Propose a new name for this property group',
    category: 'identity',
  },
  {
    type: 'add-property',
    label: 'Add a property',
    description: 'Add another building to our organizing group',
    category: 'membership',
  },
  {
    type: 'remove-property',
    label: 'Remove a property',
    description: 'Remove a building from our group',
    category: 'membership',
  },
  {
    type: 'merge',
    label: 'Merge with another group',
    description: 'Combine our group with another (requires their consent)',
    category: 'coordination',
  },
  {
    type: 'alliance',
    label: 'Create alliance',
    description: 'Coordinate with another group without merging',
    category: 'coordination',
  },
  {
    type: 'split',
    label: 'Split our group',
    description: 'Divide this group into two separate groups',
    category: 'membership',
  },
  {
    type: 'mute-tenant',
    label: 'Mute a member',
    description: 'Prevent a disruptive member from chatting (requires +7 votes and organizer approval)',
    category: 'moderation',
  },
  {
    type: 'escalate',
    label: 'Escalate a demand',
    description: 'Vote to escalate a demand to the next level',
    category: 'coordination',
  },
]

export function VoteSuggestion({
  groupId,
  groupName,
  building,
  allBuildings = [],
  onSubmit,
  onClose,
}: VoteSuggestionProps) {
  const [selectedType, setSelectedType] = useState<GovernanceProposalType | null>(null)
  const [newName, setNewName] = useState('')
  const [selectedApn, setSelectedApn] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [selectedProfileId, setSelectedProfileId] = useState('')
  const [selectedDemandId, setSelectedDemandId] = useState('')
  const [reason, setReason] = useState('')
  const [propertySearch, setPropertySearch] = useState('')

  const [linkedGroups, setLinkedGroups] = useState<LinkedPropertyGroup[]>([])
  const [demands, setDemands] = useState<{ id: string; title: string }[]>([])

  const profile = getCurrentProfile()

  useEffect(() => {
    setLinkedGroups(getLinkedGroups().filter(g => g.id !== groupId))
    const buildingDemands = getBuildingDemands(groupId)
    setDemands(buildingDemands.map(d => ({ id: d.id, title: d.title })))
  }, [groupId])

  const filteredBuildings = allBuildings.filter(b =>
    propertySearch.trim() &&
    (b.address.toLowerCase().includes(propertySearch.toLowerCase()) ||
     b.propertyName?.toLowerCase().includes(propertySearch.toLowerCase()))
  ).slice(0, 5)

  const handleSubmit = () => {
    if (!selectedType || !profile) return

    let proposal: ReturnType<typeof createProposal> = null

    switch (selectedType) {
      case 'rename':
        if (!newName.trim()) return
        proposal = createProposal('rename', groupId, { targetValue: newName.trim(), reason })
        break
      case 'add-property':
        if (!selectedApn) return
        proposal = createProposal('add-property', groupId, { targetApn: selectedApn, reason })
        break
      case 'remove-property':
        if (!selectedApn) return
        proposal = createProposal('remove-property', groupId, { targetApn: selectedApn, reason })
        break
      case 'merge':
        if (!selectedGroupId) return
        proposal = createProposal('merge', groupId, { targetGroupId: selectedGroupId, reason })
        break
      case 'alliance':
        if (!selectedGroupId) return
        proposal = createProposal('alliance', groupId, { targetGroupId: selectedGroupId, reason })
        break
      case 'mute-tenant':
        if (!selectedProfileId || !reason.trim()) return
        proposal = createProposal('mute-tenant', groupId, { targetProfileId: selectedProfileId, reason })
        break
      case 'escalate':
        if (!selectedDemandId) return
        proposal = createProposal('escalate', groupId, { targetValue: selectedDemandId, reason })
        break
      case 'split':
        // Split is complex - placeholder
        return
    }

    if (proposal) {
      const message = formatProposalMessage(proposal)
      onSubmit(message)
      onClose()
    }
  }

  const selectedOption = VOTE_OPTIONS.find(o => o.type === selectedType)
  const threshold = selectedType ? VOTE_THRESHOLDS[selectedType] : 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-gray-900">Start a Group Vote</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            &times;
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Propose a change for {groupName}. Other tenants will vote on your proposal.
        </p>

        {!selectedType ? (
          // Vote type selection
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-3">What would you like to vote on?</p>

            {VOTE_OPTIONS.map(option => (
              <button
                key={option.type}
                onClick={() => setSelectedType(option.type)}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-rstu-red hover:bg-red-50 transition"
              >
                <div className="font-medium text-gray-900 text-sm">{option.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
              </button>
            ))}
          </div>
        ) : (
          // Form for selected vote type
          <div className="space-y-4">
            <button
              onClick={() => setSelectedType(null)}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to options
            </button>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-medium text-gray-900">{selectedOption?.label}</div>
              <div className="text-xs text-gray-500 mt-1">
                Requires +{threshold} net votes to pass
              </div>
            </div>

            {/* Type-specific forms */}
            {selectedType === 'rename' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Group Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder={`Current: ${groupName}`}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
                  maxLength={100}
                />
              </div>
            )}

            {selectedType === 'add-property' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search for Property
                </label>
                <input
                  type="text"
                  value={propertySearch}
                  onChange={e => setPropertySearch(e.target.value)}
                  placeholder="Type an address..."
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
                />
                {filteredBuildings.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded max-h-40 overflow-y-auto">
                    {filteredBuildings.map(b => (
                      <button
                        key={b.apn}
                        onClick={() => {
                          setSelectedApn(b.apn)
                          setPropertySearch(b.address.split(',')[0])
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                          selectedApn === b.apn ? 'bg-red-50' : ''
                        }`}
                      >
                        {b.address.split(',')[0]}
                      </button>
                    ))}
                  </div>
                )}
                {selectedApn && (
                  <p className="text-xs text-green-600 mt-1">Selected: {propertySearch}</p>
                )}
              </div>
            )}

            {selectedType === 'remove-property' && building && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Property to Remove
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Current property: {building.address.split(',')[0]}
                </p>
                <button
                  onClick={() => setSelectedApn(building.apn)}
                  className={`w-full text-left px-3 py-2 text-sm rounded border ${
                    selectedApn === building.apn
                      ? 'border-rstu-red bg-red-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {building.address.split(',')[0]}
                </button>
              </div>
            )}

            {(selectedType === 'merge' || selectedType === 'alliance') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select {selectedType === 'merge' ? 'Group to Merge With' : 'Group to Ally With'}
                </label>
                {linkedGroups.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No other groups available</p>
                ) : (
                  <div className="space-y-2">
                    {linkedGroups.map(g => (
                      <button
                        key={g.id}
                        onClick={() => setSelectedGroupId(g.id)}
                        className={`w-full text-left px-3 py-2 text-sm rounded border ${
                          selectedGroupId === g.id
                            ? 'border-rstu-red bg-red-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">{g.name}</div>
                        <div className="text-xs text-gray-500">{g.apns.length} properties</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedType === 'mute-tenant' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member to Mute
                </label>
                <input
                  type="text"
                  value={selectedProfileId}
                  onChange={e => setSelectedProfileId(e.target.value)}
                  placeholder="Enter their username or profile ID"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
                />
                <p className="text-xs text-yellow-600 mt-1">
                  Requires +7 votes AND organizer approval
                </p>
              </div>
            )}

            {selectedType === 'escalate' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Demand to Escalate
                </label>
                {demands.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No demands available to escalate</p>
                ) : (
                  <div className="space-y-2">
                    {demands.map(d => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDemandId(d.id)}
                        className={`w-full text-left px-3 py-2 text-sm rounded border ${
                          selectedDemandId === d.id
                            ? 'border-rstu-red bg-red-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {d.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reason field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason {selectedType === 'mute-tenant' ? '(required)' : '(optional)'}
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Why are you proposing this change?"
                rows={2}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red resize-none"
                maxLength={300}
              />
              {reason.length >= 250 && (
                <p className="text-xs text-gray-400 mt-1">{reason.length}/300</p>
              )}
            </div>
          </div>
        )}

        {/* Submit */}
        {selectedType && (
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                (selectedType === 'rename' && !newName.trim()) ||
                (selectedType === 'add-property' && !selectedApn) ||
                (selectedType === 'remove-property' && !selectedApn) ||
                (selectedType === 'merge' && !selectedGroupId) ||
                (selectedType === 'alliance' && !selectedGroupId) ||
                (selectedType === 'mute-tenant' && (!selectedProfileId || !reason.trim())) ||
                (selectedType === 'escalate' && !selectedDemandId)
              }
              className="px-4 py-2 text-sm bg-rstu-red text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Proposal
            </button>
          </div>
        )}

        {/* Info box */}
        {selectedType && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-xs text-blue-700">
                <p className="font-medium">How voting works:</p>
                <ul className="mt-1 space-y-0.5 list-disc list-inside text-blue-600">
                  <li>Your vote counts as +1 automatically</li>
                  <li>Other tenants vote in the chat</li>
                  <li>Proposals expire after 7 days</li>
                  <li>Admins facilitate but cannot vote</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
