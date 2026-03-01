'use client'

import { useState, useCallback } from 'react'
import { type EscalationCase, getCaseById } from '@/lib/storage/escalationStorage'
import { EscalationTracker } from './EscalationTracker'
import { EscalationDetail } from './EscalationDetail'

interface EscalationModalProps {
  isOpen: boolean
  onClose: () => void
  chatSlug: string  // buildingId
  buildingAddress: string
}

export function EscalationModal({
  isOpen,
  onClose,
  chatSlug,
  buildingAddress,
}: EscalationModalProps) {
  const [selectedCase, setSelectedCase] = useState<EscalationCase | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSelectCase = useCallback((caseData: EscalationCase) => {
    setSelectedCase(caseData)
  }, [])

  const handleBack = useCallback(() => {
    setSelectedCase(null)
  }, [])

  const handleUpdate = useCallback(() => {
    // Refresh the case data from storage
    if (selectedCase) {
      const updated = getCaseById(selectedCase.id)
      if (updated) {
        setSelectedCase(updated)
      }
    }
    // Also trigger refresh of the list
    setRefreshKey(k => k + 1)
  }, [selectedCase])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {selectedCase && (
                <button
                  onClick={handleBack}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Back to list"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedCase ? selectedCase.title : 'Building Issues'}
                </h3>
                <p className="text-sm text-gray-500">
                  {buildingAddress}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedCase ? (
            <EscalationDetail
              caseData={selectedCase}
              onBack={handleBack}
              onUpdate={handleUpdate}
            />
          ) : (
            <div className="p-4" key={refreshKey}>
              <EscalationTracker
                buildingId={chatSlug}
                buildingAddress={buildingAddress}
                onSelectCase={handleSelectCase}
              />
            </div>
          )}
        </div>

        {/* Footer - only show on list view */}
        {!selectedCase && (
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
