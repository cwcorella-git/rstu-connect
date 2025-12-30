'use client'

import { useState } from 'react'
import { usePropertySearch } from '@/hooks/usePropertySearch'
import { EnhancedBuilding } from '@/lib/getBuildingsData'
import { getGroupForApn, getLinkedGroups } from '@/lib/linkedPropertiesStorage'
import { createProposal, VOTE_THRESHOLDS } from '@/lib/governanceStorage'
import { getCurrentProfile } from '@/lib/profileStorage'

interface AssociationFormationProposalProps {
  currentBuilding: EnhancedBuilding
  onSubmit: (message: string) => void
  onClose: () => void
}

export function AssociationFormationProposal({
  currentBuilding,
  onSubmit,
  onClose,
}: AssociationFormationProposalProps) {
  const [selectedProperties, setSelectedProperties] = useState<EnhancedBuilding[]>([])
  const [blocName, setBlocName] = useState('')
  const [reason, setReason] = useState('')
  const [step, setStep] = useState<'select' | 'confirm'>('select')

  const { query, setQuery, results, isSearching } = usePropertySearch(30)
  const profile = getCurrentProfile()

  // Check if current building is already in a association
  const existingGroup = getGroupForApn(currentBuilding.apn)

  // Filter out current building and already-grouped properties from results
  const availableResults = results.filter(b => {
    if (b.apn === currentBuilding.apn) return false
    const group = getGroupForApn(b.apn)
    return !group // Only show properties not in a association
  })

  const handleSelectProperty = (building: EnhancedBuilding) => {
    if (selectedProperties.find(p => p.apn === building.apn)) {
      setSelectedProperties(prev => prev.filter(p => p.apn !== building.apn))
    } else {
      setSelectedProperties(prev => [...prev, building])
    }
  }

  const handleContinue = () => {
    if (selectedProperties.length === 0) return
    setStep('confirm')
  }

  const handleSubmit = () => {
    if (!profile || selectedProperties.length === 0) return

    // Create proposals for each building involved
    // The format broadcasts to all selected building chats
    const allApns = [currentBuilding.apn, ...selectedProperties.map(p => p.apn)]
    const allChatSlugs = [currentBuilding.chatSlug, ...selectedProperties.map(p => p.chatSlug)]

    // Create the form-association proposal
    // We use the current building's chatSlug as the "groupId" since there's no existing group
    const proposal = createProposal('form-bloc', currentBuilding.chatSlug, {
      targetValue: blocName.trim() || undefined,
      targetApns: allApns,
      reason: reason.trim() || `Form association with ${selectedProperties.length + 1} properties`,
    })

    if (proposal) {
      // Format message for chat
      const message = `[GOV:form-bloc:${currentBuilding.chatSlug}:${allApns.join(',')}]${blocName ? ` Named: "${blocName}"` : ''} ${reason || 'Proposing to form a tenant association together.'}`
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
            To add more properties, use the governance features within your bloc.
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
            <h2 className="text-lg font-bold text-gray-900">Form an Association</h2>
            <p className="text-xs text-gray-500">
              {step === 'select' ? 'Select properties to organize together' : 'Confirm your proposal'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 'select' ? (
          <>
            {/* Current Building */}
            <div className="px-4 pt-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Your Building</p>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="font-medium text-sm text-purple-900">{currentBuilding.address}</p>
                <p className="text-xs text-purple-700">{currentBuilding.units} units</p>
              </div>
            </div>

            {/* Search */}
            <div className="px-4 pt-4">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Add Nearby Properties ({selectedProperties.length} selected)
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by address, owner, or APN..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Search Results / Selected */}
            <div className="flex-1 overflow-y-auto px-4 py-2 min-h-0">
              {/* Selected Properties */}
              {selectedProperties.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Selected:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedProperties.map(p => (
                      <button
                        key={p.apn}
                        onClick={() => handleSelectProperty(p)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200"
                      >
                        {p.address.split(' ').slice(0, 3).join(' ')}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              {query && availableResults.length > 0 && (
                <div className="space-y-1">
                  {availableResults.map(building => {
                    const isSelected = selectedProperties.some(p => p.apn === building.apn)
                    return (
                      <button
                        key={building.apn}
                        onClick={() => handleSelectProperty(building)}
                        className={`w-full text-left p-2 rounded-lg transition ${
                          isSelected
                            ? 'bg-purple-100 border border-purple-300'
                            : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{building.address}</p>
                            <p className="text-xs text-gray-500">
                              {building.units} units &middot; {building.owner.slice(0, 30)}
                            </p>
                          </div>
                          {isSelected && (
                            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {query && availableResults.length === 0 && !isSearching && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No available properties found. Properties already in blocs are excluded.
                </p>
              )}

              {!query && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Search for properties to add to your bloc.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={handleContinue}
                disabled={selectedProperties.length === 0}
                className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition ${
                  selectedProperties.length > 0
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue with {selectedProperties.length + 1} Properties
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Confirm Step */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Properties Summary */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Properties in this association</p>
                <div className="space-y-1">
                  <div className="p-2 bg-purple-50 rounded text-sm">
                    {currentBuilding.address} <span className="text-gray-500">({currentBuilding.units} units)</span>
                  </div>
                  {selectedProperties.map(p => (
                    <div key={p.apn} className="p-2 bg-gray-50 rounded text-sm">
                      {p.address} <span className="text-gray-500">({p.units} units)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* association name */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  association name <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={blocName}
                  onChange={(e) => setBlocName(e.target.value)}
                  placeholder="e.g., Downtown Tenants Bloc"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to auto-generate from street name
                </p>
              </div>

              {/* Reason */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Why form this association?
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., We share the same landlord and want to organize together for better conditions."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Voting Info */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  <strong>Democratic Process:</strong> This proposal will be shared in all selected building chats.
                  Each building needs +{VOTE_THRESHOLDS['form-bloc']} votes for the association to form.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setStep('select')}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
              >
                Submit Proposal
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
