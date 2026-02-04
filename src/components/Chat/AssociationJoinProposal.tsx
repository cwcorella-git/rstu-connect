'use client'

import { useState, useEffect } from 'react'
import { EnhancedBuilding } from '@/lib/data/getBuildingsData'
import { getLinkedGroups, getGroupForApn, generateBlocName, type LinkedPropertyGroup } from '@/lib/storage/linkedPropertiesStorage'
import { createProposal, VOTE_THRESHOLDS } from '@/lib/storage/governanceStorage'
import { getCurrentProfile } from '@/lib/storage/profileStorage'

interface BlocJoinProposalProps {
  currentBuilding: EnhancedBuilding
  buildings: EnhancedBuilding[] // All buildings for address lookup
  onSubmit: (message: string) => void
  onClose: () => void
}

export function BlocJoinProposal({
  currentBuilding,
  buildings,
  onSubmit,
  onClose,
}: BlocJoinProposalProps) {
  const [availableBlocs, setAvailableBlocs] = useState<LinkedPropertyGroup[]>([])
  const [selectedBloc, setSelectedBloc] = useState<LinkedPropertyGroup | null>(null)
  const [reason, setReason] = useState('')

  const profile = getCurrentProfile()

  // Check if current building is already in a association
  const existingGroup = getGroupForApn(currentBuilding.apn)

  // Load available blocs
  useEffect(() => {
    const allGroups = getLinkedGroups()
    // Filter out the current building's group (if any) and empty groups
    const available = allGroups.filter(g => {
      if (existingGroup && g.id === existingGroup.id) return false
      return g.apns.length > 0
    })
    setAvailableBlocs(available)
  }, [existingGroup])

  // Get addresses for a association
  const getAssociationAddresses = (group: LinkedPropertyGroup): string[] => {
    return group.apns
      .map(apn => buildings.find(b => b.apn === apn)?.address)
      .filter((addr): addr is string => !!addr)
  }

  // Get display name for association
  const getAssociationDisplayName = (group: LinkedPropertyGroup): string => {
    if (group.name) return group.name
    const addresses = getAssociationAddresses(group)
    return generateBlocName(addresses)
  }

  const handleSubmit = () => {
    if (!profile || !selectedBloc) return

    // Create join-association proposal
    // This requires approval from both this building AND the target association
    const proposal = createProposal('join-bloc', currentBuilding.chatSlug, {
      targetGroupId: selectedBloc.id,
      reason: reason.trim() || `Request to join ${getAssociationDisplayName(selectedBloc)}`,
    })

    if (proposal) {
      const message = `[GOV:join-bloc:${currentBuilding.chatSlug}:${selectedBloc.id}] ${reason || `Proposing to join "${getAssociationDisplayName(selectedBloc)}".`}`
      onSubmit(message)
    }

    onClose()
  }

  if (existingGroup) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Already in a Bloc</h2>
          <p className="text-sm text-gray-600 mb-4">
            This property is already part of <strong>{existingGroup.name || 'a bloc'}</strong>.
            You would need to leave your current association before joining another.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-rstu-red rounded-lg hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Join a Bloc</h2>
            <p className="text-xs text-gray-500">Select an existing association to request membership</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Current Building */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Your Building</p>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="font-medium text-sm text-purple-900">{currentBuilding.address}</p>
              <p className="text-xs text-purple-700">{currentBuilding.units} units</p>
            </div>
          </div>

          {/* Available Blocs */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">
              Available Blocs ({availableBlocs.length})
            </p>

            {availableBlocs.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-sm text-gray-500">No blocs available to join yet.</p>
                <p className="text-xs text-gray-400 mt-1">Consider forming a new association instead!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableBlocs.map(bloc => {
                  const isSelected = selectedBloc?.id === bloc.id
                  const addresses = getAssociationAddresses(bloc)
                  const displayName = getAssociationDisplayName(bloc)
                  const memberCount = bloc.memberProfiles?.length || 0

                  return (
                    <button
                      key={bloc.id}
                      onClick={() => setSelectedBloc(isSelected ? null : bloc)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        isSelected
                          ? 'bg-purple-100 border-2 border-purple-400'
                          : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">{displayName}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span>{bloc.apns.length} properties</span>
                            {memberCount > 0 && <span>{memberCount} members</span>}
                          </div>
                          {addresses.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                              {addresses.slice(0, 2).join(', ')}
                              {addresses.length > 2 && ` +${addresses.length - 2} more`}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Reason */}
          {selectedBloc && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Why do you want to join?
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., We share the same landlord and want to coordinate our organizing efforts."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>
          )}

          {/* Voting Info */}
          {selectedBloc && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                <strong>Dual Approval Required:</strong> This proposal needs +{VOTE_THRESHOLDS['join-bloc']} votes from your building AND +{VOTE_THRESHOLDS['join-bloc']} votes from the target bloc.
              </p>
            </div>
          )}
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
            disabled={!selectedBloc}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition ${
              selectedBloc
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Request to Join
          </button>
        </div>
      </div>
    </div>
  )
}
