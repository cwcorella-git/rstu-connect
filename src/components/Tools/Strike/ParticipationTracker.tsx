'use client'

import { useMemo } from 'react'
import type { EnhancedBuilding } from '@/lib/data/getBuildingsData'
import type { StrikePreparation } from '@/lib/storage/strikeStorage'
import { getBuildingCanvass } from '@/lib/storage/canvassStorage'
import {
  addCommittedUnit,
  removeCommittedUnit,
  initializeParticipationTracking,
} from '@/lib/storage/strikeStorage'

interface ParticipationTrackerProps {
  strikePrep: StrikePreparation
  building: EnhancedBuilding
}

export function ParticipationTracker({
  strikePrep,
  building,
}: ParticipationTrackerProps) {
  const canvass = getBuildingCanvass(building.chatSlug)

  // Get all canvassed units
  const allUnits = useMemo(() => {
    if (!canvass) return []
    return Object.keys(canvass.units)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvass?.lastModified])

  // Initialize participation tracking if not done
  useMemo(() => {
    if (strikePrep.participation.totalUnits === 0 && allUnits.length > 0) {
      initializeParticipationTracking(strikePrep.id, allUnits.length, allUnits)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allUnits])

  const committedUnits = strikePrep.participation.committedUnits
  const uncommittedUnits = allUnits.filter(u => !committedUnits.includes(u))
  const participationPercent = strikePrep.participation.percentCommitted
  const isStrikeReady = participationPercent >= 65

  const handleAddCommitted = (unitId: string) => {
    addCommittedUnit(strikePrep.id, unitId)
  }

  const handleRemoveCommitted = (unitId: string) => {
    removeCommittedUnit(strikePrep.id, unitId)
  }

  if (!canvass) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">
          No canvassing data found. <a href="#" className="underline font-medium">
            Start canvassing units first.
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Readiness Gauge */}
      <div
        className={`rounded-lg p-4 border-2 ${
          isStrikeReady
            ? 'bg-green-50 border-green-500'
            : 'bg-yellow-50 border-yellow-500'
        }`}
      >
        <div className="text-4xl font-bold mb-2">
          <span className={isStrikeReady ? 'text-green-700' : 'text-yellow-700'}>
            {participationPercent}%
          </span>
        </div>
        <div className="text-sm text-gray-700 mb-3">
          <span className="font-medium">{committedUnits.length}</span> of{' '}
          <span className="font-medium">{allUnits.length}</span> units committed
        </div>
        <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              isStrikeReady ? 'bg-green-500' : 'bg-yellow-500'
            }`}
            style={{ width: `${Math.min(participationPercent, 100)}%` }}
          />
        </div>
        <div className="text-xs text-gray-600 mt-2">
          <strong>Strike-ready threshold:</strong> 65% ({Math.ceil(allUnits.length * 0.65)} units)
        </div>
        {isStrikeReady && (
          <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800 font-medium">
            ✓ Participation threshold met!
          </div>
        )}
      </div>

      {/* Committed Units */}
      {committedUnits.length > 0 && (
        <div className="border rounded-lg p-3 bg-white">
          <h4 className="text-sm font-semibold text-green-900 mb-3">
            Committed to Strike ({committedUnits.length})
          </h4>
          <div className="space-y-1">
            {committedUnits.map((unitId) => {
              const unit = canvass.units[unitId]
              return (
                <div
                  key={unitId}
                  className="flex items-center justify-between p-2 bg-green-50 rounded hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-sm font-medium">
                      Unit {unit?.unitNumber || unitId}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveCommitted(unitId)}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Uncommitted Units (Outreach Targets) */}
      {uncommittedUnits.length > 0 && (
        <div className="border rounded-lg p-3 bg-orange-50 border-orange-200">
          <h4 className="text-sm font-semibold text-orange-900 mb-3">
            Needs Outreach ({uncommittedUnits.length})
          </h4>
          {!isStrikeReady && (
            <div className="mb-3 p-2 bg-orange-100 border border-orange-300 rounded text-xs text-orange-800">
              <strong>Need {Math.ceil((allUnits.length * 0.65) - committedUnits.length)} more to reach strike-ready</strong>
            </div>
          )}
          <div className="space-y-1">
            {uncommittedUnits.map((unitId) => {
              const unit = canvass.units[unitId]
              return (
                <div
                  key={unitId}
                  className="flex items-center justify-between p-2 bg-white border border-orange-200 rounded hover:bg-orange-100 transition-colors"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Unit {unit?.unitNumber || unitId}
                    </span>
                    {unit?.name && (
                      <p className="text-xs text-gray-500">{unit.name}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddCommitted(unitId)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mark Committed
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Organizing Tips */}
      {participationPercent < 65 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-purple-900 mb-2">Organizing Tips</h4>
          <ul className="text-xs text-purple-800 space-y-1">
            <li>• Use 1:1 conversations (not group texts) to gauge commitment</li>
            <li>
              • Lead with:{' '}
              <span className="font-medium">
                &quot;We&apos;re at {participationPercent}%, need {Math.ceil((allUnits.length * 0.65) - committedUnits.length)} more&quot;
              </span>
            </li>
            <li>
              • Address concerns:{' '}
              <span className="font-medium">
                &quot;Rent goes in escrow, not withheld. Legal protection.&quot;
              </span>
            </li>
            <li>
              • Highlight leverage:{' '}
              <span className="font-medium">
                &quot;Landlord loses${(strikePrep.financial.monthlyRentAtRisk / 1000).toFixed(0)}k/month&quot;
              </span>
            </li>
          </ul>
        </div>
      )}

      {/* Unit Contact Info */}
      {uncommittedUnits.length > 0 && (
        <details className="border rounded-lg p-3">
          <summary className="text-sm font-semibold text-gray-700 cursor-pointer">
            View Unit Contact Info
          </summary>
          <div className="mt-3 space-y-2">
            {uncommittedUnits.map((unitId) => {
              const unit = canvass.units[unitId]
              if (!unit) return null
              return (
                <div key={unitId} className="p-2 bg-gray-50 rounded text-xs">
                  <div className="font-medium text-gray-900">
                    Unit {unit.unitNumber}
                    {unit.name && <span className="ml-2 text-gray-600">({unit.name})</span>}
                  </div>
                  <div className="text-gray-600 mt-1 space-y-1">
                    {unit.phone && (
                      <div>
                        <strong>Phone:</strong> {unit.phone}
                      </div>
                    )}
                    {unit.email && (
                      <div>
                        <strong>Email:</strong> {unit.email}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </details>
      )}
    </div>
  )
}
