'use client'

import React, { useMemo, useState } from 'react'
import type { LandlordProfile, LandlordProperty } from '@/lib/landlordProfileStorage'
import { getBuildingOrganizing, getStatusInfo, type OrganizingStatus } from '@/lib/buildingOrganizingStorage'
import { getBuildingVictories } from '@/lib/victoryStorage'

interface PressurePoint {
  property: LandlordProperty
  complaintsCount: number
  demandsCount: number
  victoriesCount: number
  heatScore: number
}

type SortBy = 'heat' | 'complaints' | 'units' | 'status'

export function PressurePointsMap({
  landlord,
  onSelectBuilding
}: {
  landlord: LandlordProfile
  onSelectBuilding?: (chatSlug: string) => void
}) {
  const [sortBy, setSortBy] = useState<SortBy>('heat')

  // Calculate pressure points
  const pressurePoints = useMemo(() => {
    return landlord.properties.map(property => {
      const organizing = getBuildingOrganizing(property.chatSlug)
      const victories = getBuildingVictories(property.chatSlug)

      const complaintsCount = organizing.complaints.length
      const demandsCount = organizing.demands.length
      const victoriesCount = victories.length

      // Heat score: complaints + (demands * 2) + (victories * 3)
      // Higher weights for escalated actions
      const heatScore = complaintsCount + (demandsCount * 2) + (victoriesCount * 3)

      return {
        property,
        complaintsCount,
        demandsCount,
        victoriesCount,
        heatScore
      }
    })
  }, [landlord.properties])

  // Sort pressure points
  const sortedPoints = useMemo(() => {
    const sorted = [...pressurePoints]

    switch (sortBy) {
      case 'heat':
        return sorted.sort((a, b) => b.heatScore - a.heatScore)
      case 'complaints':
        return sorted.sort((a, b) => b.complaintsCount - a.complaintsCount)
      case 'units':
        return sorted.sort((a, b) => b.property.units - a.property.units)
      case 'status':
        const statusOrder = { strike_ready: 0, active: 1, emerging: 2, inactive: 3 }
        return sorted.sort((a, b) => {
          const orderA = statusOrder[a.property.organizingStatus as OrganizingStatus] || 99
          const orderB = statusOrder[b.property.organizingStatus as OrganizingStatus] || 99
          return orderA - orderB
        })
      default:
        return sorted
    }
  }, [pressurePoints, sortBy])

  // Get heat color
  const getHeatColor = (score: number): string => {
    if (score >= 10) return 'bg-red-50 border-red-200'
    if (score >= 5) return 'bg-yellow-50 border-yellow-200'
    return 'bg-green-50 border-green-200'
  }

  // Get heat badge color
  const getHeatBadgeColor = (score: number): string => {
    if (score >= 10) return 'bg-red-100 text-red-700'
    if (score >= 5) return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  // Get heat label
  const getHeatLabel = (score: number): string => {
    if (score >= 10) return 'High Pressure'
    if (score >= 5) return 'Medium Pressure'
    return 'Low Pressure'
  }

  // Calculate stats
  const stats = useMemo(() => ({
    highPressure: sortedPoints.filter(p => p.heatScore >= 10).length,
    mediumPressure: sortedPoints.filter(p => p.heatScore >= 5 && p.heatScore < 10).length,
    lowPressure: sortedPoints.filter(p => p.heatScore < 5).length,
    totalHeat: sortedPoints.reduce((sum, p) => sum + p.heatScore, 0)
  }), [sortedPoints])

  return (
    <div className="flex flex-col h-full">
      {/* Header Stats */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Pressure Point Summary</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-2 rounded-lg bg-red-50 border border-red-200">
            <div className="text-2xl font-bold text-red-700">{stats.highPressure}</div>
            <div className="text-xs text-red-600">High Pressure</div>
          </div>
          <div className="p-2 rounded-lg bg-yellow-50 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">{stats.mediumPressure}</div>
            <div className="text-xs text-yellow-600">Medium Pressure</div>
          </div>
          <div className="p-2 rounded-lg bg-green-50 border border-green-200">
            <div className="text-2xl font-bold text-green-700">{stats.lowPressure}</div>
            <div className="text-xs text-green-600">Low Pressure</div>
          </div>
        </div>

        {/* Sort Options */}
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Sort By</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSortBy('heat')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              sortBy === 'heat'
                ? 'bg-rstu-red text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Heat Score
          </button>
          <button
            onClick={() => setSortBy('complaints')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              sortBy === 'complaints'
                ? 'bg-rstu-red text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Complaints
          </button>
          <button
            onClick={() => setSortBy('units')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              sortBy === 'units'
                ? 'bg-rstu-red text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Units
          </button>
          <button
            onClick={() => setSortBy('status')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              sortBy === 'status'
                ? 'bg-rstu-red text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Status
          </button>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {sortedPoints.map(({ property, complaintsCount, demandsCount, victoriesCount, heatScore }) => {
            const statusInfo = getStatusInfo(property.organizingStatus)

            return (
              <button
                key={property.apn}
                onClick={() => onSelectBuilding?.(property.chatSlug)}
                className={`w-full text-left p-3 rounded-lg border transition-colors hover:shadow-md ${getHeatColor(heatScore)}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  {/* Address and Heat */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                      {property.address.split(',')[0]}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {property.units} units
                    </p>
                  </div>

                  {/* Heat Badge */}
                  <div className={`flex-shrink-0 px-2 py-1 rounded text-xs font-bold ${getHeatBadgeColor(heatScore)}`}>
                    {heatScore}
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {/* Status */}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>

                  {/* Complaints */}
                  {complaintsCount > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                      ⚠️ {complaintsCount} complaint{complaintsCount !== 1 ? 's' : ''}
                    </span>
                  )}

                  {/* Demands */}
                  {demandsCount > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                      📢 {demandsCount} demand{demandsCount !== 1 ? 's' : ''}
                    </span>
                  )}

                  {/* Victories */}
                  {victoriesCount > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                      🏆 {victoriesCount} victor{victoriesCount !== 1 ? 'ies' : 'y'}
                    </span>
                  )}
                </div>

                {/* Heat Score Explanation */}
                <p className="text-xs text-gray-600">
                  {getHeatLabel(heatScore)} · Score = {complaintsCount} + ({demandsCount}×2) + ({victoriesCount}×3)
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
