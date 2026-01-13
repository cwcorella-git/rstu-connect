'use client'

import React, { useMemo, useState } from 'react'
import type { LandlordProfile } from '@/lib/landlordProfileStorage'
import { getBuildingOrganizing } from '@/lib/buildingOrganizingStorage'

interface TimelineEntry {
  id: string
  type: 'complaint' | 'demand'
  timestamp: number
  buildingAddress: string
  buildingChatSlug: string
  title: string
  description?: string
  status?: string  // For complaints
  escalationLevel?: string  // For demands
  relatedEntries?: string[]  // Links complaint → demand
}

interface TimelineFilter {
  type: 'all' | 'complaint' | 'demand'
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

    const ignoredDemands = demands.filter(d => {
      // Check if demand is > 30 days old
      const daysSince = (now - d.timestamp) / (1000 * 60 * 60 * 24)
      return daysSince > 30
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
    demands: timeline.filter(e => e.type === 'demand').length
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
    }
  }

  // Get entry badge color
  const getEntryBadgeColor = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'complaint':
        return 'bg-orange-100 text-orange-700'
      case 'demand':
        return 'bg-red-100 text-red-700'
    }
  }

  // Get entry icon
  const getEntryIcon = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'complaint':
        return '⚠️'
      case 'demand':
        return '📢'
    }
  }

  // Get entry label
  const getEntryLabel = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'complaint':
        return 'Complaint'
      case 'demand':
        return 'Demand'
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
                ? 'bg-orange-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Complaints ({counts.complaints})
          </button>
          <button
            onClick={() => setFilter({ ...filter, type: 'demand' })}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filter.type === 'demand'
                ? 'bg-red-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Demands ({counts.demands})
          </button>
        </div>

        <h3 className="text-sm font-semibold text-gray-700 mb-2">Time Range</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter({ ...filter, timeRange: 'all' })}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filter.timeRange === 'all'
                ? 'bg-gray-700 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setFilter({ ...filter, timeRange: '1year' })}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filter.timeRange === '1year'
                ? 'bg-gray-700 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Past Year
          </button>
          <button
            onClick={() => setFilter({ ...filter, timeRange: '6months' })}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filter.timeRange === '6months'
                ? 'bg-gray-700 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Past 6 Months
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-4">
        {timeline.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">No accountability entries found.</p>
            <p className="text-xs mt-1">Complaints and demands will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {timeline.map((entry, index) => (
              <div
                key={entry.id}
                className={`p-4 rounded-lg border ${getEntryColor(entry.type)} relative`}
              >
                {/* Timeline connector */}
                {index < timeline.length - 1 && (
                  <div className="absolute left-7 top-14 w-0.5 h-8 bg-gray-300" />
                )}

                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="text-xl flex-shrink-0">{getEntryIcon(entry.type)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getEntryBadgeColor(entry.type)}`}>
                        {getEntryLabel(entry.type)}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(entry.timestamp)}</span>
                    </div>

                    <h4 className="font-medium text-gray-900 text-sm">{entry.title}</h4>
                    <p className="text-xs text-gray-600 mt-0.5">{entry.buildingAddress}</p>

                    {entry.description && (
                      <p className="text-sm text-gray-700 mt-2">{entry.description}</p>
                    )}

                    {/* Status/Level badge */}
                    {entry.status && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                        Status: {entry.status}
                      </span>
                    )}
                    {entry.escalationLevel && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">
                        Level: {entry.escalationLevel}
                      </span>
                    )}
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
