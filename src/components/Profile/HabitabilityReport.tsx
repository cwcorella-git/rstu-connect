'use client'

import { useMemo } from 'react'
import type { UserProfile } from '@/lib/profileStorage'
import { canAccessTools, getCurrentProfile } from '@/lib/profileStorage'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import { getHabitabilityScore, type HabitabilityScore, getBuildingCanvass } from '@/lib/canvassStorage'

interface HabitabilityReportProps {
  profile: UserProfile
  building?: EnhancedBuilding
}

export function HabitabilityReport({ profile, building }: HabitabilityReportProps) {
  const currentUser = getCurrentProfile()
  const isOwnProfile = currentUser?.id === profile.id
  const canView = isOwnProfile || canAccessTools()

  // Privacy check
  if (!canView || !building) return null

  // Get habitability score
  const habitabilityScore: HabitabilityScore | null = useMemo(() => {
    return getHabitabilityScore(building.chatSlug)
  }, [building.chatSlug])

  // Calculate building average rent from canvassed units
  const buildingStats = useMemo(() => {
    const canvass = getBuildingCanvass(building.chatSlug)
    if (!canvass) return null

    const rents: number[] = []
    for (const unit of Object.values(canvass.units)) {
      if (unit.rentAmount && unit.rentAmount > 0) {
        rents.push(unit.rentAmount)
      }
    }

    if (rents.length < 2) return null

    rents.sort((a, b) => a - b)
    const sum = rents.reduce((a, b) => a + b, 0)
    const median = rents.length % 2 === 0
      ? (rents[rents.length / 2 - 1] + rents[rents.length / 2]) / 2
      : rents[Math.floor(rents.length / 2)]

    return {
      count: rents.length,
      average: Math.round(sum / rents.length),
      median: Math.round(median),
      min: rents[0],
      max: rents[rents.length - 1],
    }
  }, [building.chatSlug])

  // Calculate estimated market rent
  const estimatedRentPerUnit = useMemo(() => {
    if (!building.value || building.units <= 0) return null
    return Math.round((building.value * 0.01) / building.units)
  }, [building.value, building.units])

  // Calculate if user is overpaying for poor conditions
  const rentPremiumAnalysis = useMemo(() => {
    if (!profile.rentAmount || !habitabilityScore) return null

    // Comparison to building average
    let buildingComparison = null
    if (buildingStats && buildingStats.average > 0) {
      const diff = profile.rentAmount - buildingStats.average
      const percent = Math.abs(Math.round((diff / buildingStats.average) * 100))
      buildingComparison = {
        percent,
        direction: diff > 50 ? 'above' : diff < -50 ? 'below' : 'at',
        amount: Math.abs(diff),
      }
    }

    // Comparison to estimated market
    let marketComparison = null
    if (estimatedRentPerUnit && estimatedRentPerUnit > 0) {
      const diff = profile.rentAmount - estimatedRentPerUnit
      const percent = Math.abs(Math.round((diff / estimatedRentPerUnit) * 100))
      marketComparison = {
        percent,
        direction: diff > 50 ? 'above' : diff < -50 ? 'below' : 'at',
        amount: Math.abs(diff),
      }
    }

    // Determine if this is a problematic situation (paying premium for poor condition)
    const isPoorCondition = habitabilityScore.score < 50
    const isFairCondition = habitabilityScore.score < 75
    const isPremiumRent = buildingComparison?.direction === 'above' || marketComparison?.direction === 'above'

    return {
      buildingComparison,
      marketComparison,
      isPoorCondition,
      isFairCondition,
      isPremiumRent,
      shouldAlert: isPoorCondition && (buildingComparison?.percent ?? 0) > 10,
    }
  }, [profile.rentAmount, habitabilityScore, buildingStats, estimatedRentPerUnit])

  if (!habitabilityScore || habitabilityScore.summary.totalUnits === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Building Condition</h3>
        <p className="text-sm text-gray-600">
          No habitability data reported yet. As tenants report issues in canvassing, condition scores will appear here.
        </p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500' }
      case 'fair':
        return { bg: 'bg-yellow-50', text: 'text-yellow-700', bar: 'bg-yellow-500' }
      case 'poor':
        return { bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-500' }
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', bar: 'bg-gray-500' }
    }
  }

  const statusColors = getStatusColor(habitabilityScore.status)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Building Condition & Habitability</h3>

      {/* Overall Score */}
      <div className={`${statusColors.bg} rounded-lg p-4 mb-4`}>
        <div className="flex items-baseline gap-3 mb-2">
          <div className={`text-3xl font-bold ${statusColors.text}`}>
            {habitabilityScore.score}/100
          </div>
          <div className={`text-sm font-medium ${statusColors.text} capitalize`}>
            {habitabilityScore.status}
          </div>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${statusColors.bar} transition-all`}
            style={{ width: `${habitabilityScore.score}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Based on reported issues in {habitabilityScore.summary.unitsReporting} of {habitabilityScore.summary.totalUnits} units
        </p>
      </div>

      {/* Critical Issues */}
      {habitabilityScore.issueBreakdown.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Reported Issues</h4>
          <div className="space-y-2">
            {habitabilityScore.issueBreakdown.map((issue, idx) => {
              const percentBar = (issue.count / habitabilityScore.summary.totalUnits) * 100
              const isCritical = percentBar >= 25 // 25% or more = critical

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isCritical ? (
                        <span className="text-red-500 font-bold text-lg">🔴</span>
                      ) : (
                        <span className="text-yellow-500 font-bold text-lg">🟠</span>
                      )}
                      <span className="text-sm font-medium text-gray-900">{issue.label}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {issue.count} units ({issue.percentUnits}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${isCritical ? 'bg-red-500' : 'bg-yellow-500'}`}
                      style={{ width: `${percentBar}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Top Issue Summary */}
      {habitabilityScore.summary.topIssue && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="text-xs text-gray-600 mb-1">Most Common Issue</div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">{habitabilityScore.summary.topIssue.label}</span>
            <span className="text-xs text-gray-500">{habitabilityScore.summary.topIssue.count} units</span>
          </div>
        </div>
      )}

      {/* Rent vs Condition Comparison */}
      {profile.rentAmount && rentPremiumAnalysis && (
        <div className={`rounded-lg p-4 mb-4 border ${
          rentPremiumAnalysis.shouldAlert
            ? 'bg-red-50 border-red-200'
            : rentPremiumAnalysis.isPremiumRent && rentPremiumAnalysis.isFairCondition
            ? 'bg-orange-50 border-orange-200'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className={`text-xs font-medium mb-2 ${
            rentPremiumAnalysis.shouldAlert
              ? 'text-red-700'
              : rentPremiumAnalysis.isPremiumRent && rentPremiumAnalysis.isFairCondition
              ? 'text-orange-700'
              : 'text-blue-700'
          }`}>
            {rentPremiumAnalysis.shouldAlert ? '🚨 Value Alert' : '💡 Value Proposition'}
          </div>

          {/* Main message */}
          <div className="text-sm text-gray-900 mb-3">
            <div className="font-semibold mb-1">
              You're paying ${profile.rentAmount.toLocaleString()}/mo for a building with {habitabilityScore.score}/100 condition
            </div>
            {rentPremiumAnalysis.shouldAlert && (
              <div className="text-red-700 text-sm mt-2">
                <strong>⚠️ Critical Issue:</strong> You're paying {rentPremiumAnalysis.buildingComparison?.percent}% above your neighbors AND living in poor conditions.
              </div>
            )}
            {rentPremiumAnalysis.isPremiumRent && rentPremiumAnalysis.isFairCondition && !rentPremiumAnalysis.shouldAlert && (
              <div className="text-orange-700 text-sm mt-2">
                <strong>⚠️ Concern:</strong> You're paying above average for fair (not good) building condition.
              </div>
            )}
          </div>

          {/* Building comparison */}
          {buildingStats && rentPremiumAnalysis.buildingComparison && (
            <div className="bg-white bg-opacity-50 rounded p-2 mb-2 text-xs space-y-1 border-l-2 border-current">
              <div className="flex justify-between">
                <span className="text-gray-600">Building Average (from {buildingStats.count} units)</span>
                <span className="font-semibold text-gray-900">${buildingStats.average.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between">
                <span className={rentPremiumAnalysis.buildingComparison.direction === 'above' ? 'text-red-600 font-medium' : 'text-gray-600'}>
                  Your Difference
                </span>
                <span className={rentPremiumAnalysis.buildingComparison.direction === 'above' ? 'text-red-600 font-bold' : 'text-gray-600'}>
                  {rentPremiumAnalysis.buildingComparison.direction === 'above' ? '+' : rentPremiumAnalysis.buildingComparison.direction === 'below' ? '-' : ''}${rentPremiumAnalysis.buildingComparison.amount.toLocaleString()} ({rentPremiumAnalysis.buildingComparison.percent}%)
                </span>
              </div>
            </div>
          )}

          {/* Market estimate comparison */}
          {estimatedRentPerUnit && rentPremiumAnalysis.marketComparison && (
            <div className="bg-white bg-opacity-50 rounded p-2 text-xs space-y-1 border-l-2 border-current">
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Market Rate</span>
                <span className="font-semibold text-gray-900">${estimatedRentPerUnit.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between">
                <span className={rentPremiumAnalysis.marketComparison.direction === 'above' ? 'text-red-600 font-medium' : 'text-gray-600'}>
                  Your Difference
                </span>
                <span className={rentPremiumAnalysis.marketComparison.direction === 'above' ? 'text-red-600 font-bold' : 'text-gray-600'}>
                  {rentPremiumAnalysis.marketComparison.direction === 'above' ? '+' : rentPremiumAnalysis.marketComparison.direction === 'below' ? '-' : ''}${rentPremiumAnalysis.marketComparison.amount.toLocaleString()} ({rentPremiumAnalysis.marketComparison.percent}%)
                </span>
              </div>
            </div>
          )}

          {/* Call to action */}
          {(rentPremiumAnalysis.shouldAlert || (rentPremiumAnalysis.isPremiumRent && rentPremiumAnalysis.isFairCondition)) && isOwnProfile && (
            <div className="mt-3 pt-3 border-t border-current border-opacity-20">
              <p className="text-xs font-medium text-gray-700 mb-2">
                💪 You have leverage. Consider:
              </p>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Connecting with other tenants about habitability concerns</li>
                <li>• Documenting all maintenance issues (use the canvassing tool)</li>
                <li>• Joining tenant organizing efforts to demand repairs</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Organizing Next Steps */}
      {habitabilityScore.score < 75 && isOwnProfile && (
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <div className="text-xs text-purple-700 font-semibold mb-2">Next Steps</div>
          <ul className="text-xs text-purple-700 space-y-1">
            <li>✓ Document your own issues (file a complaint in canvassing data)</li>
            <li>✓ Talk to neighbors about their issues</li>
            <li>✓ Keep records of repair requests and landlord responses</li>
            <li>✓ Join with other tenants when condition scores drop below 50</li>
          </ul>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="text-xs text-gray-400 bg-gray-50 rounded p-2 mt-4">
        Building condition scores are aggregated from tenant reports during canvassing. Only you and organizers can see this data.
      </div>
    </div>
  )
}
