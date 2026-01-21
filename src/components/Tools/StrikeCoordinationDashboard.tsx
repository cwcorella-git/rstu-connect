'use client'

import { useMemo } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import { getStrikePreparation, calculateStrikeReadiness, type StrikePreparation } from '@/lib/strikeStorage'
import { canAccessTools } from '@/lib/profileStorage'

interface StrikeCoordinationDashboardProps {
  buildings: EnhancedBuilding[]
  onBuildingClick?: (building: EnhancedBuilding) => void
}

export function StrikeCoordinationDashboard({ buildings, onBuildingClick }: StrikeCoordinationDashboardProps) {
  // Get all strike preparations - must be before early return
  const strikesByBuilding = useMemo(() => {
    // Only process if user has access
    if (!canAccessTools()) return []

    const strikes: {
      building: EnhancedBuilding
      strike: StrikePreparation
      readiness: ReturnType<typeof calculateStrikeReadiness>
    }[] = []

    buildings.forEach((building) => {
      const strike = getStrikePreparation(building.chatSlug)
      if (strike) {
        const readiness = calculateStrikeReadiness(strike.id)
        strikes.push({ building, strike, readiness })
      }
    })

    return strikes.sort((a, b) => {
      // Sort by readiness first (ready first), then by participation %
      const aReady = a.readiness.overallReady ? 0 : 1
      const bReady = b.readiness.overallReady ? 0 : 1
      if (aReady !== bReady) return aReady - bReady
      return b.strike.participation.percentCommitted - a.strike.participation.percentCommitted
    })
  }, [buildings])

  const readyCount = strikesByBuilding.filter((s) => s.readiness.overallReady).length
  const inProgress = strikesByBuilding.filter((s) => !s.readiness.overallReady && s.strike.participation.percentCommitted > 0).length

  if (strikesByBuilding.length === 0) {
    return null
  }

  return (
    <div className="space-y-4 p-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Rent Strike Coordination</h3>
        <div className="text-sm text-gray-600">
          {readyCount} ready • {inProgress} in progress
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Strike-Ready"
          value={readyCount.toString()}
          description="Buildings ready to authorize"
          color="green"
        />
        <StatCard
          label="In Preparation"
          value={inProgress.toString()}
          description="Ongoing preparations"
          color="blue"
        />
        <StatCard
          label="Total Rents at Risk"
          value={`$${strikesByBuilding
            .reduce((sum, s) => sum + s.strike.financial.monthlyRentAtRisk, 0)
            .toLocaleString()}`}
          description="Monthly pressure"
          color="red"
        />
      </div>

      {/* Building List */}
      <div className="space-y-2">
        {strikesByBuilding.map((item) => (
          <StrikeBuildingCard key={item.building.chatSlug} {...item} onBuildingClick={onBuildingClick} />
        ))}
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  description: string
  color: 'green' | 'blue' | 'red'
}

function StatCard({ label, value, description, color }: StatCardProps) {
  const colors = {
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    red: 'bg-red-50 border-red-200',
  }

  const textColors = {
    green: 'text-green-700',
    blue: 'text-blue-700',
    red: 'text-red-700',
  }

  return (
    <div className={`rounded-lg border p-3 ${colors[color]}`}>
      <p className={`text-xs font-medium ${textColors[color]} mb-1`}>{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className={`text-xs ${textColors[color]} mt-1`}>{description}</p>
    </div>
  )
}

interface StrikeBuildingCardProps {
  building: EnhancedBuilding
  strike: StrikePreparation
  readiness: ReturnType<typeof calculateStrikeReadiness>
  onBuildingClick?: (building: EnhancedBuilding) => void
}

function StrikeBuildingCard({ building, strike, readiness, onBuildingClick }: StrikeBuildingCardProps) {
  if (!building || !strike || !readiness) {
    return null
  }

  return (
    <button
      onClick={() => onBuildingClick?.(building)}
      className={`w-full text-left border rounded-lg p-3 transition-colors hover:bg-opacity-75 ${
        readiness.overallReady
          ? 'bg-green-50 border-green-200'
          : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-medium text-gray-900">{building?.address || 'Unknown'}</div>
          <div className="text-xs text-gray-600 mt-1">
            <span className="font-medium">{strike?.participation.percentCommitted || 0}%</span> participation
            {' | '}
            <span className="font-medium">${(strike?.financial.monthlyRentAtRisk || 0).toLocaleString()}</span>/month at risk
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          {readiness.overallReady ? (
            <div className="inline-flex items-center gap-2 px-2 py-1 bg-green-100 border border-green-300 rounded text-xs font-medium text-green-700">
              <span>✓</span>
              <span>Ready</span>
            </div>
          ) : (
            <div className="text-xs text-gray-600">
              <div className="font-medium">{readiness.blockers.length} blockers</div>
            </div>
          )}
        </div>
      </div>

      {/* Blockers */}
      {readiness.blockers.length > 0 && (
        <div className="mt-2 text-xs text-gray-600 space-y-1">
          {readiness.blockers.slice(0, 2).map((blocker, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">•</span>
              <span>{blocker}</span>
            </div>
          ))}
          {readiness.blockers.length > 2 && (
            <div className="text-gray-500 italic">+{readiness.blockers.length - 2} more</div>
          )}
        </div>
      )}
    </button>
  )
}
