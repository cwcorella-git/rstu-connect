'use client'

import React, { useMemo, useState } from 'react'
import { getAllCases, filterActiveOnly, sortCasesByUrgency, type EvictionCase } from '@/lib/evictionDefenseStorage'
import { getDaysUntilCourt } from '@/lib/evictionDefenseStorage'

interface EvictionDefenseListProps {
  onSelectCase?: (evictionCase: EvictionCase) => void
  selectedCaseId?: string
}

type FilterMode = 'active' | 'resolved' | 'all'

export function EvictionDefenseList({ onSelectCase, selectedCaseId }: EvictionDefenseListProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>('active')

  // Get and filter cases
  const filteredCases = useMemo(() => {
    const allCases = getAllCases()
    let filtered = allCases

    if (filterMode === 'active') {
      filtered = filterActiveOnly(filtered)
    } else if (filterMode === 'resolved') {
      filtered = filtered.filter(c => c.stage === 'resolved')
    }

    // Sort by urgency, then by court date
    return sortCasesByUrgency(filtered)
  }, [filterMode])

  // Count by status
  const counts = useMemo(() => ({
    active: getAllCases().filter(c => c.stage !== 'resolved').length,
    resolved: getAllCases().filter(c => c.stage === 'resolved').length,
    total: getAllCases().length
  }), [])

  // Get urgency color
  const getUrgencyColor = (urgency: string): string => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-50 border-red-200'
      case 'urgent':
        return 'bg-orange-50 border-orange-200'
      case 'high':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  // Get urgency badge color
  const getUrgencyBadgeColor = (urgency: string): string => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 text-red-700'
      case 'urgent':
        return 'bg-orange-100 text-orange-700'
      case 'high':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Get urgency label
  const getUrgencyLabel = (urgency: string): string => {
    switch (urgency) {
      case 'critical':
        return 'CRITICAL'
      case 'urgent':
        return 'URGENT'
      case 'high':
        return 'HIGH'
      default:
        return 'Normal'
    }
  }

  // Format court date display
  const formatCourtDate = (courtDate?: string): string => {
    if (!courtDate) return 'No court date'

    const daysUntil = getDaysUntilCourt(courtDate)
    if (daysUntil === null) return courtDate

    if (daysUntil < 0) {
      return `OVERDUE (${Math.abs(daysUntil)} days)`
    } else if (daysUntil === 0) {
      return 'TODAY'
    } else if (daysUntil === 1) {
      return 'TOMORROW'
    } else if (daysUntil <= 7) {
      return `In ${daysUntil} days`
    } else {
      return new Date(courtDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Filter</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterMode('active')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filterMode === 'active'
                ? 'bg-rstu-red text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Active ({counts.active})
          </button>
          <button
            onClick={() => setFilterMode('resolved')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filterMode === 'resolved'
                ? 'bg-rstu-red text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Resolved ({counts.resolved})
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filterMode === 'all'
                ? 'bg-rstu-red text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All ({counts.total})
          </button>
        </div>
      </div>

      {/* Cases List */}
      <div className="flex-1 overflow-y-auto">
        {filteredCases.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center p-4">
            <div>
              <p className="text-gray-600 font-medium mb-2">No eviction cases</p>
              <p className="text-sm text-gray-500">
                {filterMode === 'active'
                  ? 'No active eviction cases to display'
                  : filterMode === 'resolved'
                  ? 'No resolved cases yet'
                  : 'Report an eviction case to get started'}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCases.map(evictionCase => (
              <button
                key={evictionCase.id}
                onClick={() => onSelectCase?.(evictionCase)}
                className={`w-full text-left p-4 border-l-4 transition-colors ${
                  selectedCaseId === evictionCase.id
                    ? 'bg-blue-50 border-l-blue-500'
                    : `${getUrgencyColor(evictionCase.urgency)} border-l-gray-200 hover:bg-opacity-75`
                }`}
              >
                {/* Urgency Badge + Tenant Name */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                      {evictionCase.anonymousDisplay && evictionCase.unitNumber
                        ? `Tenant at Unit ${evictionCase.unitNumber}`
                        : evictionCase.tenantName}
                    </h4>
                  </div>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap ${getUrgencyBadgeColor(evictionCase.urgency)}`}>
                    {getUrgencyLabel(evictionCase.urgency)}
                  </span>
                </div>

                {/* Address */}
                <p className="text-xs text-gray-600 truncate mb-2">{evictionCase.buildingAddress}</p>

                {/* Court Date + Days */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-xs font-medium text-gray-700">
                    {formatCourtDate(evictionCase.courtDate)}
                  </p>
                  {evictionCase.legalRepresentation?.hasAttorney && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      Attorney assigned
                    </span>
                  )}
                </div>

                {/* Case Type & Stage */}
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                    {evictionCase.caseType.replace(/_/g, ' ')}
                  </span>
                  <span className="inline-block px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                    {evictionCase.stage.replace(/-/g, ' ')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
