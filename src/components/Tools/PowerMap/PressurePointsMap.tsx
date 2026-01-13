'use client'

import React, { useMemo, useState } from 'react'
import type { LandlordProfile, LandlordProperty } from '@/lib/landlordProfileStorage'
import { getBuildingOrganizing, getStatusInfo, type OrganizingStatus } from '@/lib/buildingOrganizingStorage'
import { getHabitabilityScore } from '@/lib/canvassStorage'

interface PressurePoint {
  property: LandlordProperty
  complaintsCount: number
  demandsCount: number
  heatScore: number
  habitabilityScore: number | null
  habitabilityStatus: 'good' | 'fair' | 'poor' | 'no-data'
}

type SortBy = 'heat' | 'complaints' | 'units' | 'status'
type HabitabilityFilter = 'all' | 'poor' | 'fair-poor'

export function PressurePointsMap({
  landlord,
  onSelectBuilding
}: {
  landlord: LandlordProfile
  onSelectBuilding?: (chatSlug: string) => void
}) {
  const [sortBy, setSortBy] = useState<SortBy>('heat')
  const [habitabilityFilter, setHabitabilityFilter] = useState<HabitabilityFilter>('all')

  // Calculate pressure points
  const pressurePoints = useMemo(() => {
    return landlord.properties.map(property => {
      const organizing = getBuildingOrganizing(property.chatSlug)
      const habitability = getHabitabilityScore(property.chatSlug)

      const complaintsCount = organizing.complaints.length
      const demandsCount = organizing.demands.length

      // Heat score: complaints + (demands * 2)
      // Higher weights for escalated actions
      const heatScore = complaintsCount + (demandsCount * 2)

      // Get habitability score and status
      const habitabilityScore = habitability?.score ?? null
      const habitabilityStatus = habitability?.status ?? 'no-data'

      return {
        property,
        complaintsCount,
        demandsCount,
        heatScore,
        habitabilityScore,
        habitabilityStatus
      }
    })
  }, [landlord.properties])

  // Detect campaign opportunities
  const campaignOpportunities = useMemo(() => {
    const poorHabitability = pressurePoints.filter(p =>
      p.habitabilityScore !== null && p.habitabilityScore < 50
    )
    return {
      shouldSuggestCampaign: poorHabitability.length >= 3,
      affectedProperties: poorHabitability,
      totalUnits: poorHabitability.reduce((sum, p) => sum + p.property.units, 0)
    }
  }, [pressurePoints])

  // Detect coordinated strike opportunities
  const strikeReadiness = useMemo(() => {
    const strikeReady = pressurePoints.filter(p =>
      p.property.organizingStatus === 'strike_ready'
    )
    return {
      shouldSuggestCoordinatedStrike: strikeReady.length >= 2,
      readyProperties: strikeReady,
      totalUnits: strikeReady.reduce((sum, p) => sum + p.property.units, 0)
    }
  }, [pressurePoints])

  // Sort pressure points
  const sortedPoints = useMemo(() => {
    let sorted = [...pressurePoints]

    // Apply habitability filter
    if (habitabilityFilter === 'poor') {
      sorted = sorted.filter(p => p.habitabilityScore !== null && p.habitabilityScore < 50)
    } else if (habitabilityFilter === 'fair-poor') {
      sorted = sorted.filter(p => p.habitabilityScore !== null && p.habitabilityScore < 80)
    }

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
  }, [pressurePoints, sortBy, habitabilityFilter])

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

  // Handlers for campaign creation
  const handleCreateCampaign = () => {
    if (window.confirm(
      `Create a coordinated campaign for ${campaignOpportunities.affectedProperties.length} buildings ` +
      `(${campaignOpportunities.totalUnits} units) with poor habitability? ` +
      `This will create a multi-property organizing campaign.`
    )) {
      // TODO: Open CampaignCreationModal with campaignOpportunities.affectedProperties
    }
  }

  const handleCoordinatedStrike = () => {
    if (window.confirm(
      `Plan a coordinated strike across ${strikeReadiness.readyProperties.length} buildings ` +
      `(${strikeReadiness.totalUnits} units) that are strike-ready?`
    )) {
      // TODO: Open CampaignCreationModal with 'strike' type using strikeReadiness.readyProperties
    }
  }

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

        {/* Campaign Opportunity Alert */}
        {campaignOpportunities.shouldSuggestCampaign && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-purple-600 text-sm font-medium flex-1">
                🎯 <strong>Multi-Property Campaign Opportunity</strong><br/>
                {campaignOpportunities.affectedProperties.length} buildings ({campaignOpportunities.totalUnits} units) have poor habitability scores
              </div>
              <button
                onClick={handleCreateCampaign}
                className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700 transition-colors flex-shrink-0"
              >
                Create Campaign
              </button>
            </div>
          </div>
        )}

        {/* Coordinated Strike Alert */}
        {strikeReadiness.shouldSuggestCoordinatedStrike && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-red-700 text-sm font-medium flex-1">
                ⚡ <strong>Coordinated Strike Ready</strong><br/>
                {strikeReadiness.readyProperties.length} buildings ({strikeReadiness.totalUnits} units) are strike-ready (65%+ participation)
              </div>
              <button
                onClick={handleCoordinatedStrike}
                className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors flex-shrink-0"
              >
                Plan Strike
              </button>
            </div>
          </div>
        )}

        {/* Habitability Filter */}
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Habitability Filter</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setHabitabilityFilter('all')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              habitabilityFilter === 'all'
                ? 'bg-rstu-red text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Buildings
          </button>
          <button
            onClick={() => setHabitabilityFilter('fair-poor')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              habitabilityFilter === 'fair-poor'
                ? 'bg-rstu-red text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Fair or Poor (&lt;80)
          </button>
          <button
            onClick={() => setHabitabilityFilter('poor')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              habitabilityFilter === 'poor'
                ? 'bg-rstu-red text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Poor Only (&lt;50)
          </button>
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
          {sortedPoints.map(({ property, complaintsCount, demandsCount, heatScore, habitabilityScore, habitabilityStatus }) => {
            const statusInfo = getStatusInfo(property.organizingStatus)

            // Habitability color
            const getHabitabilityColor = (score: number | null, status: string) => {
              if (score === null) return 'bg-gray-100 text-gray-700'
              if (score < 50) return 'bg-red-100 text-red-700'
              if (score < 80) return 'bg-yellow-100 text-yellow-700'
              return 'bg-green-100 text-green-700'
            }

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

                  {/* Badges: Heat and Habitability */}
                  <div className="flex-shrink-0 flex gap-1">
                    <div className={`px-2 py-1 rounded text-xs font-bold ${getHeatBadgeColor(heatScore)}`}>
                      Heat: {heatScore}
                    </div>
                    {habitabilityScore !== null && (
                      <div className={`px-2 py-1 rounded text-xs font-bold ${getHabitabilityColor(habitabilityScore, habitabilityStatus)}`}>
                        Hab: {habitabilityScore}
                      </div>
                    )}
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
                </div>

                {/* Heat Score Explanation */}
                <p className="text-xs text-gray-600">
                  {getHeatLabel(heatScore)} · Score = {complaintsCount} + ({demandsCount}×2)
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
