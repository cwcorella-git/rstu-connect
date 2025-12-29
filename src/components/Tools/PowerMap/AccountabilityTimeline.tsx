'use client'

import React, { useMemo, useState } from 'react'
import type { LandlordProfile } from '@/lib/landlordProfileStorage'
import { getBuildingOrganizing } from '@/lib/buildingOrganizingStorage'
import { getLandlordVictories } from '@/lib/victoryStorage'

interface TimelineEntry {
  id: string
  type: 'complaint' | 'demand' | 'victory'
  timestamp: number
  buildingAddress: string
  buildingChatSlug: string
  title: string
  description?: string
  status?: string  // For complaints
  escalationLevel?: string  // For demands
  victoryImpact?: string  // For victories
  victoryDate?: string
  victoryType?: string
  tactics?: string[]
  relatedEntries?: string[]  // Links complaint → demand
}

interface TimelineFilter {
  type: 'all' | 'complaint' | 'demand' | 'victory'
  timeRange: 'all' | '6months' | '1year'
}

export function AccountabilityTimeline({ landlord }: { landlord: LandlordProfile }) {
  const [filter, setFilter] = useState<TimelineFilter>({
    type: 'all',
    timeRange: 'all'
  })

  // Build chronological timeline
  const timeline = useMemo(() => {
    const entries: TimelineEntry[] = []
    const now = Date.now()

    // Collect complaints and demands
    for (const property of landlord.properties) {
      const organizing = getBuildingOrganizing(property.chatSlug)

      // Add complaints
      for (const complaint of organizing.complaints) {
        entries.push({
          id: complaint.id,
          type: 'complaint',
          timestamp: complaint.timestamp,
          buildingAddress: property.address,
          buildingChatSlug: property.chatSlug,
          title: complaint.title,
          description: complaint.description,
          status: complaint.status
        })
      }

      // Add demands
      for (const demand of organizing.demands) {
        entries.push({
          id: demand.id,
          type: 'demand',
          timestamp: demand.createdAt,
          buildingAddress: property.address,
          buildingChatSlug: property.chatSlug,
          title: demand.title,
          description: demand.description,
          escalationLevel: demand.escalationLevel,
          relatedEntries: [demand.sourceComplaintId]
        })
      }
    }

    // Add victories
    const victories = getLandlordVictories(landlord.ownerName)
    for (const victory of victories) {
      const victoryTimestamp = new Date(victory.date).getTime()
      entries.push({
        id: victory.id,
        type: 'victory',
        timestamp: victoryTimestamp,
        buildingAddress: victory.buildingChatSlug
          ? landlord.properties.find(p => p.chatSlug === victory.buildingChatSlug)?.address || 'Multiple Buildings'
          : 'Portfolio-wide',
        buildingChatSlug: victory.buildingChatSlug || '',
        title: victory.title,
        description: victory.description,
        victoryImpact: victory.quantifiedImpact,
        victoryDate: victory.date,
        victoryType: victory.type,
        tactics: victory.tactics
      })
    }

    // Sort by timestamp (newest first)
    entries.sort((a, b) => b.timestamp - a.timestamp)

    // Apply filters
    let filtered = entries

    // Type filter
    if (filter.type !== 'all') {
      filtered = filtered.filter(e => e.type === filter.type)
    }

    // Time range filter
    if (filter.timeRange !== 'all') {
      const cutoffTime = filter.timeRange === '6months'
        ? now - (6 * 30 * 24 * 60 * 60 * 1000)
        : now - (365 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(e => e.timestamp >= cutoffTime)
    }

    return filtered
  }, [landlord, filter])

  // Detect escalation opportunities
  const escalationNeeded = useMemo(() => {
    const now = Date.now()
    const demands = timeline.filter(e => e.type === 'demand')
    const victories = timeline.filter(e => e.type === 'victory')

    const ignoredDemands = demands.filter(d => {
      // Check if demand is > 30 days old and no victory associated
      const daysSince = (now - d.timestamp) / (1000 * 60 * 60 * 24)
      const hasVictory = victories.some(v =>
        d.relatedEntries?.includes(v.id) || v.relatedEntries?.includes(d.id)
      )
      return daysSince > 30 && !hasVictory
    })

    return {
      shouldEscalate: ignoredDemands.length >= 3,
      ignoredCount: ignoredDemands.length,
      oldestIgnored: ignoredDemands.length > 0
        ? ignoredDemands.sort((a, b) => a.timestamp - b.timestamp)[0]
        : null,
      daysSinceOldest: ignoredDemands.length > 0
        ? Math.floor((now - (ignoredDemands[0]?.timestamp || now)) / (1000 * 60 * 60 * 24))
        : 0
    }
  }, [timeline])

  // Count entries by type
  const counts = useMemo(() => ({
    complaints: timeline.filter(e => e.type === 'complaint').length,
    demands: timeline.filter(e => e.type === 'demand').length,
    victories: timeline.filter(e => e.type === 'victory').length
  }), [timeline])

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get entry color
  const getEntryColor = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'complaint':
        return 'bg-orange-50 border-orange-200'
      case 'demand':
        return 'bg-red-50 border-red-200'
      case 'victory':
        return 'bg-green-50 border-green-200'
    }
  }

  // Get entry badge color
  const getEntryBadgeColor = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'complaint':
        return 'bg-orange-100 text-orange-700'
      case 'demand':
        return 'bg-red-100 text-red-700'
      case 'victory':
        return 'bg-green-100 text-green-700'
    }
  }

  // Get entry icon
  const getEntryIcon = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'complaint':
        return '⚠️'
      case 'demand':
        return '📢'
      case 'victory':
        return '🏆'
    }
  }

  // Get entry label
  const getEntryLabel = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'complaint':
        return 'Complaint'
      case 'demand':
        return 'Demand'
      case 'victory':
        return 'Victory'
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Escalation Recommendation */}
      {escalationNeeded.shouldEscalate && (
        <div className="p-4 bg-orange-50 border-b-2 border-orange-300 flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="text-orange-700 text-sm flex-1">
              <strong>📢 Escalation Recommended</strong><br/>
              This landlord has ignored <strong>{escalationNeeded.ignoredCount} demands</strong> for over 30 days.
              {escalationNeeded.oldestIgnored && (
                <> The oldest unanswered demand is {escalationNeeded.daysSinceOldest} days old.</>
              )}
              <br/>
              <span className="text-xs">Consider escalating to media campaign or legal action.</span>
            </div>
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            <button className="px-3 py-1.5 bg-orange-600 text-white text-xs font-medium rounded hover:bg-orange-700 transition-colors">
              📺 Plan Media Campaign
            </button>
            <button className="px-3 py-1.5 bg-orange-600 text-white text-xs font-medium rounded hover:bg-orange-700 transition-colors">
              ⚖️ Refer to Legal Aid
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Type</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter({ ...filter, type: 'all' })}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filter.type === 'all'
                ? 'bg-rstu-red text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All ({timeline.length})
          </button>
          <button
            onClick={() => setFilter({ ...filter, type: 'complaint' })}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filter.type === 'complaint'
                ? 'bg-orange-500 text-white'
                : 'bg-white border border-orange-200 text-orange-700 hover:bg-orange-50'
            }`}
          >
            Complaints ({counts.complaints})
          </button>
          <button
            onClick={() => setFilter({ ...filter, type: 'demand' })}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filter.type === 'demand'
                ? 'bg-red-600 text-white'
                : 'bg-white border border-red-200 text-red-700 hover:bg-red-50'
            }`}
          >
            Demands ({counts.demands})
          </button>
          <button
            onClick={() => setFilter({ ...filter, type: 'victory' })}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filter.type === 'victory'
                ? 'bg-green-600 text-white'
                : 'bg-white border border-green-200 text-green-700 hover:bg-green-50'
            }`}
          >
            Victories ({counts.victories})
          </button>
        </div>

        <h3 className="text-sm font-semibold text-gray-700 mb-2">Time Range</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter({ ...filter, timeRange: 'all' })}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filter.timeRange === 'all'
                ? 'bg-rstu-red text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setFilter({ ...filter, timeRange: '6months' })}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filter.timeRange === '6months'
                ? 'bg-rstu-red text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Last 6 Months
          </button>
          <button
            onClick={() => setFilter({ ...filter, timeRange: '1year' })}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filter.timeRange === '1year'
                ? 'bg-rstu-red text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Last Year
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-4">
        {timeline.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center p-4">
            <div>
              <p className="text-gray-600 font-medium mb-2">No accountability activity yet</p>
              <p className="text-sm text-gray-500">
                Start filing complaints and organizing to build this landlord's accountability record.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {timeline.map((entry, idx) => (
              <div key={entry.id}>
                {/* Date divider */}
                {(idx === 0 || formatDate(entry.timestamp) !== formatDate(timeline[idx - 1].timestamp)) && (
                  <div className="py-2 px-3 bg-gray-100 rounded-lg text-center sticky top-0 z-10">
                    <p className="text-xs font-semibold text-gray-600">
                      {formatDate(entry.timestamp)}
                    </p>
                  </div>
                )}

                {/* Entry card */}
                <div className={`border rounded-lg p-3 ${getEntryColor(entry.type)}`}>
                  <div className="flex items-start gap-3">
                    {/* Icon and badge */}
                    <div className="flex-shrink-0">
                      <span className="text-lg">{getEntryIcon(entry.type)}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getEntryBadgeColor(entry.type)}`}>
                          {getEntryLabel(entry.type)}
                        </span>
                        {entry.status && (
                          <span className="text-xs text-gray-600 bg-white rounded px-1.5 py-0.5">
                            {entry.status}
                          </span>
                        )}
                        {entry.escalationLevel && (
                          <span className="text-xs text-gray-600 bg-white rounded px-1.5 py-0.5">
                            {entry.escalationLevel}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="font-semibold text-sm text-gray-900 break-words">
                        {entry.title}
                      </h4>

                      {/* Building */}
                      <p className="text-xs text-gray-600 mt-1">
                        {entry.buildingAddress.split(',')[0]}
                      </p>

                      {/* Description */}
                      {entry.description && (
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                          {entry.description}
                        </p>
                      )}

                      {/* Victory impact */}
                      {entry.victoryImpact && (
                        <div className="mt-2 p-2 bg-white rounded text-xs">
                          <strong>Impact:</strong> {entry.victoryImpact}
                        </div>
                      )}

                      {/* Tactics */}
                      {entry.tactics && entry.tactics.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {entry.tactics.map((tactic, i) => (
                            <span
                              key={i}
                              className="inline-block px-2 py-0.5 rounded text-xs bg-white text-gray-700"
                            >
                              {tactic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
