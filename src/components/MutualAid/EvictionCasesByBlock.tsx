'use client'

import React, { useMemo } from 'react'
import {
  getCasesByBlock,
  getActiveCasesByBlock,
  getCriticalCasesByBlock,
  getDaysUntilCourt,
  type EvictionCase
} from '@/lib/storage/evictionDefenseStorage'
import { LinkedPropertyGroup } from '@/lib/storage/linkedPropertiesStorage'
import { EnhancedBuilding } from '@/lib/data/getBuildingsData'

interface EvictionCasesByBlockProps {
  block: LinkedPropertyGroup
  buildings: EnhancedBuilding[]
  onSelectCase?: (evictionCase: EvictionCase) => void
}

export function EvictionCasesByBlock({ block, buildings, onSelectCase }: EvictionCasesByBlockProps) {
  const allCases = useMemo(() => getCasesByBlock(block.id), [block.id])
  const activeCases = useMemo(() => getActiveCasesByBlock(block.id), [block.id])
  const criticalCases = useMemo(() => getCriticalCasesByBlock(block.id), [block.id])

  const getUrgencyColor = (urgency: string): string => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-50 border-l-4 border-red-500'
      case 'urgent':
        return 'bg-orange-50 border-l-4 border-orange-500'
      case 'high':
        return 'bg-yellow-50 border-l-4 border-yellow-500'
      default:
        return 'bg-gray-50 border-l-4 border-gray-300'
    }
  }

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

  if (allCases.length === 0) {
    return (
      <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
        <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No Active Cases</h3>
        <p className="text-sm text-gray-500">No eviction cases have been reported for this group.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{allCases.length}</div>
          <div className="text-xs text-blue-600 font-medium mt-1">Total Cases</div>
        </div>
        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-700">{activeCases.length}</div>
          <div className="text-xs text-orange-600 font-medium mt-1">Active</div>
        </div>
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-700">{criticalCases.length}</div>
          <div className="text-xs text-red-600 font-medium mt-1">Critical</div>
        </div>
      </div>

      {/* Critical Cases Alert */}
      {criticalCases.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-sm font-semibold text-red-900 mb-2">🚨 Critical Cases Requiring Immediate Action</h3>
          <ul className="space-y-1">
            {criticalCases.map((c) => (
              <li key={c.id} className="text-xs text-red-700">
                <strong>{c.anonymousDisplay ? `Unit ${c.unitNumber}` : c.tenantName}</strong>
                {c.courtDate && (
                  <span>
                    {' '}
                    - Court date: {c.courtDate}
                    {getDaysUntilCourt(c.courtDate) === 0 && ' (TODAY)'}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Case List */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">All Cases in This Group</h3>
        <div className="space-y-2">
          {allCases.map((evictionCase) => {
            const daysUntilCourt = getDaysUntilCourt(evictionCase.courtDate)

            return (
              <button
                key={evictionCase.id}
                onClick={() => onSelectCase?.(evictionCase)}
                className={`w-full p-3 rounded-lg text-left transition-colors hover:shadow-md ${getUrgencyColor(evictionCase.urgency)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-gray-900">
                        {evictionCase.anonymousDisplay ? `Unit ${evictionCase.unitNumber}` : evictionCase.tenantName}
                      </h4>
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap ${getUrgencyBadgeColor(evictionCase.urgency)}`}>
                        {evictionCase.urgency.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                      <p>
                        <strong>Notice:</strong> {evictionCase.noticeType} ({evictionCase.caseType.replace(/_/g, ' ')})
                      </p>
                      {evictionCase.courtDate && (
                        <p>
                          <strong>Court:</strong> {evictionCase.courtDate}
                          {daysUntilCourt !== null && (
                            <>
                              {daysUntilCourt === 0 && ' - TODAY'}
                              {daysUntilCourt === 1 && ' - Tomorrow'}
                              {daysUntilCourt > 1 && daysUntilCourt <= 7 && ` - ${daysUntilCourt} days`}
                            </>
                          )}
                        </p>
                      )}
                      <p>
                        <strong>Status:</strong> {evictionCase.stage.replace(/-/g, ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Witness Count */}
                  {evictionCase.witnessSignups.length > 0 && (
                    <div className="flex-shrink-0 text-center">
                      <div className="text-lg font-bold text-gray-900">{evictionCase.witnessSignups.length}</div>
                      <div className="text-xs text-gray-600">Witnesses</div>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Block Buildings */}
      {block.apns.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Buildings in This Group</h3>
          <div className="space-y-1">
            {block.apns.map((apn) => {
              const building = buildings.find(b => b.apn === apn)
              const buildingCases = allCases.filter(c => c.buildingApn === apn)

              return (
                <div key={apn} className="text-xs text-gray-700 p-2 bg-gray-50 rounded">
                  <p className="font-medium">{building?.address || apn}</p>
                  {buildingCases.length > 0 && (
                    <p className="text-gray-600 mt-0.5">{buildingCases.length} case(s)</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
