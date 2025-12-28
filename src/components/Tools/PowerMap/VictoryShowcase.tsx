'use client'

import React, { useMemo } from 'react'
import type { LandlordProfile } from '@/lib/landlordProfileStorage'
import { getLandlordVictories, getVictoryTypeLabel } from '@/lib/victoryStorage'

export function VictoryShowcase({ landlord }: { landlord: LandlordProfile }) {
  // Get victories and sort by date (newest first)
  const victories = useMemo(() => {
    return getLandlordVictories(landlord.ownerName)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [landlord.ownerName])

  // Calculate aggregate stats
  const stats = useMemo(() => {
    const totalVictories = victories.length
    const totalUnitsAffected = victories.reduce((sum, v) => sum + (v.unitsAffected || 0), 0)
    const totalRentSavings = victories.reduce((sum, v) => sum + (v.monthlyRentReduction || 0), 0)

    // Count tactics used
    const tacticCounts: Record<string, number> = {}
    for (const victory of victories) {
      if (victory.tactics) {
        for (const tactic of victory.tactics) {
          tacticCounts[tactic] = (tacticCounts[tactic] || 0) + 1
        }
      }
    }

    // Get top 3 tactics
    const topTactics = Object.entries(tacticCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tactic]) => tactic)

    return {
      totalVictories,
      totalUnitsAffected,
      totalRentSavings,
      topTactics
    }
  }, [victories])

  // Get victory type color
  const getVictoryTypeColor = (type: string) => {
    switch (type) {
      case 'rent_reduction':
        return 'bg-green-50 border-green-200 text-green-700'
      case 'repairs':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      case 'eviction_stopped':
        return 'bg-purple-50 border-purple-200 text-purple-700'
      case 'policy_change':
        return 'bg-indigo-50 border-indigo-200 text-indigo-700'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value)
  }

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header Stats */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Victory Summary</h3>

        {/* Main Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-2 rounded-lg bg-green-50 border border-green-200">
            <div className="text-2xl font-bold text-green-700">{stats.totalVictories}</div>
            <div className="text-xs text-green-600">Total Victories</div>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{stats.totalUnitsAffected}</div>
            <div className="text-xs text-blue-600">Units Affected</div>
          </div>
          <div className="p-2 rounded-lg bg-purple-50 border border-purple-200">
            <div className="text-2xl font-bold text-purple-700">
              {stats.totalRentSavings > 0 ? formatCurrency(stats.totalRentSavings) : '$0'}
            </div>
            <div className="text-xs text-purple-600">Monthly Rent Savings</div>
          </div>
        </div>

        {/* Top Tactics */}
        {stats.topTactics.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Most Effective Tactics</h4>
            <div className="flex flex-wrap gap-2">
              {stats.topTactics.map((tactic) => (
                <span
                  key={tactic}
                  className="inline-block px-2 py-1 rounded text-xs bg-white border border-gray-200 text-gray-700"
                >
                  {tactic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Victories List */}
      <div className="flex-1 overflow-y-auto p-4">
        {victories.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center p-4">
            <div>
              <p className="text-gray-600 font-medium mb-2">No victories yet</p>
              <p className="text-sm text-gray-500">
                Victories will appear here as organizing campaigns succeed.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {victories.map((victory) => (
              <div
                key={victory.id}
                className={`border rounded-lg p-4 ${getVictoryTypeColor(victory.type)}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    {/* Type Badge */}
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-white opacity-75 mb-1">
                      {getVictoryTypeLabel(victory.type)}
                    </span>

                    {/* Title */}
                    <h4 className="font-bold text-sm text-gray-900 break-words">
                      {victory.title}
                    </h4>
                  </div>

                  {/* Date */}
                  <div className="flex-shrink-0 text-xs font-medium text-gray-600 bg-white rounded px-2 py-1">
                    {formatDate(victory.date)}
                  </div>
                </div>

                {/* Description */}
                {victory.description && (
                  <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                    {victory.description}
                  </p>
                )}

                {/* Impact Metrics */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {victory.quantifiedImpact && (
                    <div className="bg-white rounded p-2">
                      <p className="text-xs text-gray-500 font-medium">Impact</p>
                      <p className="font-bold text-sm text-gray-900">{victory.quantifiedImpact}</p>
                    </div>
                  )}
                  {victory.unitsAffected && victory.unitsAffected > 0 && (
                    <div className="bg-white rounded p-2">
                      <p className="text-xs text-gray-500 font-medium">Units Affected</p>
                      <p className="font-bold text-sm text-gray-900">{victory.unitsAffected}</p>
                    </div>
                  )}
                  {victory.monthlyRentReduction && victory.monthlyRentReduction > 0 && (
                    <div className="bg-white rounded p-2">
                      <p className="text-xs text-gray-500 font-medium">Monthly Savings</p>
                      <p className="font-bold text-sm text-gray-900">{formatCurrency(victory.monthlyRentReduction)}</p>
                    </div>
                  )}
                  {victory.duration && (
                    <div className="bg-white rounded p-2">
                      <p className="text-xs text-gray-500 font-medium">Duration</p>
                      <p className="font-bold text-sm text-gray-900">{victory.duration}</p>
                    </div>
                  )}
                </div>

                {/* Tactics */}
                {victory.tactics && victory.tactics.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-600 mb-1">Tactics Used</p>
                    <div className="flex flex-wrap gap-1">
                      {victory.tactics.map((tactic, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-0.5 rounded text-xs bg-white text-gray-700 opacity-75"
                        >
                          {tactic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Member Quote */}
                {victory.memberQuote && (
                  <div className="bg-white bg-opacity-50 rounded p-2 italic text-sm text-gray-700 border-l-2 border-gray-400">
                    "{victory.memberQuote}"
                    {victory.memberName && (
                      <p className="text-xs text-gray-600 not-italic mt-1">— {victory.memberName}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
