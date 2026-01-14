'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
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
  labelKey: string
  descriptionKey: string
  category: VoteCategory
  requiresOrganizer?: boolean
}

const VOTE_OPTIONS: VoteOption[] = [
  {
    type: 'rename',
    labelKey: 'voteSuggestion.renameLabel',
    descriptionKey: 'voteSuggestion.renameDesc',
    category: 'identity',
  },
  {
    type: 'add-property',
    labelKey: 'voteSuggestion.addPropertyLabel',
    descriptionKey: 'voteSuggestion.addPropertyDesc',
    category: 'membership',
  },
  {
    type: 'remove-property',
    labelKey: 'voteSuggestion.removePropertyLabel',
    descriptionKey: 'voteSuggestion.removePropertyDesc',
    category: 'membership',
  },
  {
    type: 'merge',
    labelKey: 'voteSuggestion.mergeLabel',
    descriptionKey: 'voteSuggestion.mergeDesc',
    category: 'coordination',
  },
  {
    type: 'alliance',
    labelKey: 'voteSuggestion.allianceLabel',
    descriptionKey: 'voteSuggestion.allianceDesc',
    category: 'coordination',
  },
  {
    type: 'split',
    labelKey: 'voteSuggestion.splitLabel',
    descriptionKey: 'voteSuggestion.splitDesc',
    category: 'membership',
  },
  {
    type: 'mute-tenant',
    labelKey: 'voteSuggestion.muteLabel',
    descriptionKey: 'voteSuggestion.muteDesc',
    category: 'moderation',
  },
  {
    type: 'escalate',
    labelKey: 'voteSuggestion.escalateLabel',
    descriptionKey: 'voteSuggestion.escalateDesc',
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

  const { t } = useLanguage()
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
          <h3 className="text-lg font-bold text-gray-900">{t('voteSuggestion.title')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            &times;
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          {t('voteSuggestion.subtitle', { groupName })}
        </p>

        {!selectedType ? (
          // Vote type selection
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-3">{t('voteSuggestion.whatVote')}</p>

            {VOTE_OPTIONS.map(option => (
              <button
                key={option.type}
                onClick={() => setSelectedType(option.type)}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-rstu-red hover:bg-red-50 transition"
              >
                <div className="font-medium text-gray-900 text-sm">{t(option.labelKey)}</div>
                <div className="text-xs text-gray-500 mt-0.5">{t(option.descriptionKey)}</div>
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
              {t('voteSuggestion.backToOptions')}
            </button>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-medium text-gray-900">{selectedOption ? t(selectedOption.labelKey) : ''}</div>
              <div className="text-xs text-gray-500 mt-1">
                {t('voteSuggestion.requiresVotes', { count: threshold })}
              </div>
            </div>

            {/* Type-specific forms */}
            {selectedType === 'rename' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('voteSuggestion.newGroupName')}
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder={t('voteSuggestion.currentName', { name: groupName })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
                  maxLength={100}
                />
              </div>
            )}

            {selectedType === 'add-property' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('voteSuggestion.searchProperty')}
                </label>
                <input
                  type="text"
                  value={propertySearch}
                  onChange={e => setPropertySearch(e.target.value)}
                  placeholder={t('voteSuggestion.typeAddress')}
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
                  <p className="text-xs text-green-600 mt-1">{t('voteSuggestion.selected')}: {propertySearch}</p>
                )}
              </div>
            )}

            {selectedType === 'remove-property' && building && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('voteSuggestion.selectPropertyRemove')}
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  {t('voteSuggestion.currentProperty')}: {building.address.split(',')[0]}
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
                  {selectedType === 'merge' ? t('voteSuggestion.selectMerge') : t('voteSuggestion.selectAlly')}
                </label>
                {linkedGroups.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">{t('voteSuggestion.noGroups')}</p>
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
                        <div className="text-xs text-gray-500">{g.apns.length} {t('voteSuggestion.properties')}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedType === 'mute-tenant' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('voteSuggestion.memberToMute')}
                </label>
                <input
                  type="text"
                  value={selectedProfileId}
                  onChange={e => setSelectedProfileId(e.target.value)}
                  placeholder={t('voteSuggestion.enterUsername')}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
                />
                <p className="text-xs text-yellow-600 mt-1">
                  {t('voteSuggestion.requiresOrganizerApproval')}
                </p>
              </div>
            )}

            {selectedType === 'escalate' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('voteSuggestion.selectDemand')}
                </label>
                {demands.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">{t('voteSuggestion.noDemandsAvailable')}</p>
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
                {t('voteSuggestion.reason')} {selectedType === 'mute-tenant' ? t('voteSuggestion.required') : t('voteSuggestion.optional')}
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder={t('voteSuggestion.whyProposing')}
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
              {t('common.cancel')}
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
              {t('voteSuggestion.submitProposal')}
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
                <p className="font-medium">{t('voteSuggestion.howVotingWorks')}</p>
                <ul className="mt-1 space-y-0.5 list-disc list-inside text-blue-600">
                  <li>{t('voteSuggestion.voteCountsAuto')}</li>
                  <li>{t('voteSuggestion.tenantsVoteChat')}</li>
                  <li>{t('voteSuggestion.proposalsExpire')}</li>
                  <li>{t('voteSuggestion.adminsFacilitate')}</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
