'use client'

import { useMemo } from 'react'
import type { UserProfile } from '@/lib/profileStorage'
import { canAccessTools, getCurrentProfile } from '@/lib/profileStorage'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import { getHabitabilityScore, type HabitabilityScore } from '@/lib/canvassStorage'

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

  if (!habitabilityScore || habitabilityScore.summary.totalUnits === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Building Condition & Habitability</h3>

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
      {profile.rentAmount && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
          <div className="text-xs text-blue-700 mb-1">💡 Value Proposition</div>
          <div className="text-sm text-gray-900">
            You're paying <span className="font-semibold">${profile.rentAmount.toLocaleString()}/mo</span> for a building with{' '}
            <span className="font-semibold">{habitabilityScore.score}/100</span> habitability score.
            {habitabilityScore.score < 60 && (
              <span className="block mt-1 text-blue-700">
                ⚠️ Multiple issues reported. Consider organizing for improvements.
              </span>
            )}
          </div>
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
