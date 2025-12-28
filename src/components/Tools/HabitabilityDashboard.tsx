'use client'

import React, { useState, useMemo } from 'react'
import { EnhancedBuilding } from '@/lib/getBuildingsData'
import { getHabitabilityScore } from '@/lib/canvassStorage'

interface HabitabilityBuildingData {
  building: EnhancedBuilding
  score: ReturnType<typeof getHabitabilityScore>
}

interface HabitabilityDashboardProps {
  buildings: EnhancedBuilding[]
  onBuildingClick?: (building: EnhancedBuilding) => void
}

export function HabitabilityDashboard({ buildings, onBuildingClick }: HabitabilityDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'fair-poor' | 'poor'>('all')

  // Calculate habitability for all buildings and filter nulls
  const buildingsWithScores = useMemo(() => {
    return buildings
      .map(b => ({
        building: b,
        score: getHabitabilityScore(b.chatSlug)
      }))
      .filter((item): item is HabitabilityBuildingData => item.score !== null)
      .sort((a, b) => a.score!.score - b.score!.score) // Worst first
  }, [buildings])

  // Count by status
  const stats = useMemo(() => {
    return {
      poor: buildingsWithScores.filter(b => b.score!.score < 50).length,
      fair: buildingsWithScores.filter(b => b.score!.score >= 50 && b.score!.score < 80).length,
      good: buildingsWithScores.filter(b => b.score!.score >= 80).length
    }
  }, [buildingsWithScores])

  // Filtered list
  const filteredBuildings = useMemo(() => {
    if (filter === 'poor') return buildingsWithScores.filter(b => b.score!.score < 50)
    if (filter === 'fair-poor') return buildingsWithScores.filter(b => b.score!.score < 80)
    return buildingsWithScores
  }, [buildingsWithScores, filter])

  // Get trend indicator
  const getTrendIndicator = (trend: { dayPeriod: number; direction: 'improving' | 'stable' | 'worsening'; changePercent: number }) => {
    switch (trend.direction) {
      case 'improving':
        return `↗ Improving (+${trend.changePercent}%)`
      case 'worsening':
        return `↘ Worsening (-${trend.changePercent}%)`
      default:
        return '→ Stable'
    }
  }

  // Get status color
  const getStatusColor = (score: number) => {
    if (score < 50) return 'text-red-700 bg-red-50'
    if (score < 80) return 'text-yellow-700 bg-yellow-50'
    return 'text-green-700 bg-green-50'
  }

  // Get status badge color
  const getStatusBadgeColor = (score: number) => {
    if (score < 50) return 'bg-red-100 text-red-700'
    if (score < 80) return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  // Get status label
  const getStatusLabel = (score: number) => {
    if (score < 50) return 'Poor'
    if (score < 80) return 'Fair'
    return 'Good'
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Building Conditions</h2>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="text-2xl font-bold text-red-700">{stats.poor}</div>
            <div className="text-xs text-red-600 font-medium">Poor</div>
          </div>
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">{stats.fair}</div>
            <div className="text-xs text-yellow-600 font-medium">Fair</div>
          </div>
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="text-2xl font-bold text-green-700">{stats.good}</div>
            <div className="text-xs text-green-600 font-medium">Good</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-rstu-red text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({buildingsWithScores.length})
          </button>
          <button
            onClick={() => setFilter('fair-poor')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filter === 'fair-poor'
                ? 'bg-rstu-red text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Needs Attention ({stats.poor + stats.fair})
          </button>
          <button
            onClick={() => setFilter('poor')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filter === 'poor'
                ? 'bg-rstu-red text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Critical ({stats.poor})
          </button>
        </div>
      </div>

      {/* Building List */}
      <div className="flex-1 overflow-y-auto">
        {filteredBuildings.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center p-4">
            <div>
              <p className="text-gray-600 font-medium mb-2">
                {filter === 'poor'
                  ? 'No buildings in critical condition'
                  : filter === 'fair-poor'
                    ? 'All buildings in good condition'
                    : 'No buildings with habitability data'}
              </p>
              <p className="text-sm text-gray-500">
                Habitability scores are calculated from unit-level complaints in the canvassing system.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredBuildings.map(({ building, score }) => (
              <button
                key={building.apn}
                onClick={() => onBuildingClick?.(building)}
                className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Address */}
                <div className="flex items-start gap-3">
                  {/* Score Badge */}
                  <div className={`flex-shrink-0 w-14 py-2 px-3 rounded text-center ${getStatusBadgeColor(score!.score)}`}>
                    <div className="text-lg font-bold">{score!.score}</div>
                    <div className="text-xs font-medium">/100</div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    {/* Address */}
                    <h3 className="font-semibold text-sm text-gray-900 truncate">
                      {building.propertyName || building.address.split(',')[0]?.trim() || building.address}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">{building.address}</p>

                    {/* Status, Issue, Units */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {/* Status Badge */}
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(score!.score)}`}>
                        {getStatusLabel(score!.score)}
                      </span>

                      {/* Units Reporting */}
                      {score!.summary.totalUnits > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          {score!.summary.unitsReporting}/{score!.summary.totalUnits} units
                        </span>
                      )}

                      {/* Trend */}
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {getTrendIndicator(score!.trend)}
                      </span>
                    </div>

                    {/* Top Issue */}
                    {score!.summary.topIssue && (
                      <p className="text-xs text-gray-600 mt-1.5">
                        Top issue: <strong>{score!.summary.topIssue.label}</strong> ({score!.summary.topIssue.count} units)
                      </p>
                    )}
                  </div>

                  {/* Chevron */}
                  <div className="flex-shrink-0 text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
