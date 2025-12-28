'use client'

import React, { useMemo, useState } from 'react'
import type { LandlordProfile } from '@/lib/landlordProfileStorage'
import { getBuildingOrganizing } from '@/lib/buildingOrganizingStorage'

interface MonthlyComplaintData {
  month: string  // "2024-11"
  displayMonth: string  // "Nov 2024"
  complaints: number
  resolved: number
  escalated: number  // Promoted to demands
  pending: number
}

type TimeRange = '3months' | '6months' | '1year' | 'all'

export function ComplaintTrendChart({ landlord }: { landlord: LandlordProfile }) {
  const [timeRange, setTimeRange] = useState<TimeRange>('6months')

  // Calculate complaint trends
  const trendData = useMemo(() => {
    const now = Date.now()
    let startTime: number

    switch (timeRange) {
      case '3months':
        startTime = now - (3 * 30 * 24 * 60 * 60 * 1000)
        break
      case '6months':
        startTime = now - (6 * 30 * 24 * 60 * 60 * 1000)
        break
      case '1year':
        startTime = now - (365 * 24 * 60 * 60 * 1000)
        break
      default:
        startTime = 0
    }

    // Collect all complaints across portfolio
    const allComplaints = landlord.properties.flatMap(property => {
      const organizing = getBuildingOrganizing(property.chatSlug)
      return organizing.complaints.filter(c => c.timestamp >= startTime)
    })

    // Group by month
    const byMonth: Record<string, MonthlyComplaintData> = {}

    for (const complaint of allComplaints) {
      const date = new Date(complaint.timestamp)
      const month = date.toISOString().substring(0, 7) // YYYY-MM

      if (!byMonth[month]) {
        byMonth[month] = {
          month,
          displayMonth: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
          complaints: 0,
          resolved: 0,
          escalated: 0,
          pending: 0
        }
      }

      byMonth[month].complaints++

      if (complaint.status === 'resolved') {
        byMonth[month].resolved++
      } else if (complaint.status === 'demand') {
        byMonth[month].escalated++
      } else if (complaint.status === 'pending' || complaint.status === 'voting') {
        byMonth[month].pending++
      }
    }

    // Return sorted data
    return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month))
  }, [landlord, timeRange])

  // Calculate trend
  const trend = useMemo(() => {
    if (trendData.length < 2) {
      return { direction: 'stable', changePercent: 0 } as const
    }

    const recentMonths = trendData.slice(-3)
    const olderMonths = trendData.slice(-6, -3)

    const recentAvg = recentMonths.reduce((sum, m) => sum + m.complaints, 0) / recentMonths.length
    const olderAvg = olderMonths.length > 0
      ? olderMonths.reduce((sum, m) => sum + m.complaints, 0) / olderMonths.length
      : recentAvg

    if (olderAvg === 0) {
      return { direction: 'stable', changePercent: 0 } as const
    }

    const changePercent = Math.round(((recentAvg - olderAvg) / olderAvg) * 100)

    if (changePercent > 10) {
      return { direction: 'escalating', changePercent: Math.abs(changePercent) } as const
    } else if (changePercent < -10) {
      return { direction: 'declining', changePercent: Math.abs(changePercent) } as const
    } else {
      return { direction: 'stable', changePercent: 0 } as const
    }
  }, [trendData])

  // Get trend indicator
  const getTrendIndicator = () => {
    switch (trend.direction) {
      case 'escalating':
        return `↗ Escalating (+${trend.changePercent}%)`
      case 'declining':
        return `↘ Declining (-${trend.changePercent}%)`
      default:
        return '→ Stable'
    }
  }

  // Get trend color
  const getTrendColor = () => {
    switch (trend.direction) {
      case 'escalating':
        return 'bg-red-50 border-red-200 text-red-700'
      case 'declining':
        return 'bg-green-50 border-green-200 text-green-700'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  // Calculate max height for chart
  const maxComplaints = trendData.length > 0
    ? Math.max(...trendData.map(m => m.complaints), 1)
    : 1

  // Calculate stats
  const stats = useMemo(() => ({
    totalComplaints: trendData.reduce((sum, m) => sum + m.complaints, 0),
    totalResolved: trendData.reduce((sum, m) => sum + m.resolved, 0),
    totalEscalated: trendData.reduce((sum, m) => sum + m.escalated, 0),
    totalPending: trendData.reduce((sum, m) => sum + m.pending, 0)
  }), [trendData])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Complaint Trend</h3>
            <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded border ${getTrendColor()}`}>
              <span className="text-sm font-semibold">{getTrendIndicator()}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-2 rounded-lg bg-white border border-gray-200">
            <div className="text-sm font-bold text-gray-900">{stats.totalComplaints}</div>
            <div className="text-xs text-gray-600">Total Complaints</div>
          </div>
          <div className="p-2 rounded-lg bg-white border border-gray-200">
            <div className="text-sm font-bold text-gray-900">{stats.totalEscalated}</div>
            <div className="text-xs text-gray-600">Escalated to Demands</div>
          </div>
          <div className="p-2 rounded-lg bg-green-50 border border-green-200">
            <div className="text-sm font-bold text-green-700">{stats.totalResolved}</div>
            <div className="text-xs text-green-600">Resolved</div>
          </div>
          <div className="p-2 rounded-lg bg-yellow-50 border border-yellow-200">
            <div className="text-sm font-bold text-yellow-700">{stats.totalPending}</div>
            <div className="text-xs text-yellow-600">Pending</div>
          </div>
        </div>

        {/* Time Range Selector */}
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Time Range</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTimeRange('3months')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              timeRange === '3months'
                ? 'bg-rstu-red text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            3 Months
          </button>
          <button
            onClick={() => setTimeRange('6months')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              timeRange === '6months'
                ? 'bg-rstu-red text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            6 Months
          </button>
          <button
            onClick={() => setTimeRange('1year')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              timeRange === '1year'
                ? 'bg-rstu-red text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            1 Year
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              timeRange === 'all'
                ? 'bg-rstu-red text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 overflow-y-auto p-4">
        {trendData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center p-4">
            <div>
              <p className="text-gray-600 font-medium mb-2">No complaint data</p>
              <p className="text-sm text-gray-500">
                Complaints will appear here as they are filed.
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* Bar Chart */}
            <div className="mb-6">
              <div className="flex items-end gap-2 h-40 border border-gray-200 rounded-lg p-4 bg-white">
                {trendData.map((month) => (
                  <div
                    key={month.month}
                    className="flex-1 flex flex-col items-center gap-1 group cursor-help"
                    title={`${month.displayMonth}: ${month.complaints} complaints (${month.escalated} escalated, ${month.resolved} resolved)`}
                  >
                    {/* Stacked bars */}
                    <div className="w-full flex flex-col-reverse h-32 gap-0.5">
                      {month.complaints > 0 && (
                        <>
                          {month.escalated > 0 && (
                            <div
                              className="w-full bg-red-500 rounded-t opacity-80 hover:opacity-100"
                              style={{
                                height: `${(month.escalated / maxComplaints) * 100}%`,
                                minHeight: '2px'
                              }}
                            />
                          )}
                          {month.resolved > 0 && (
                            <div
                              className="w-full bg-green-500 opacity-80 hover:opacity-100"
                              style={{
                                height: `${(month.resolved / maxComplaints) * 100}%`,
                                minHeight: '2px'
                              }}
                            />
                          )}
                          {month.pending > 0 && (
                            <div
                              className="w-full bg-yellow-500 rounded-b opacity-80 hover:opacity-100"
                              style={{
                                height: `${(month.pending / maxComplaints) * 100}%`,
                                minHeight: '2px'
                              }}
                            />
                          )}
                        </>
                      )}
                    </div>

                    {/* Label */}
                    <p className="text-xs font-medium text-gray-600 truncate group-hover:font-bold">
                      {month.displayMonth}
                    </p>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-yellow-500" />
                  <span className="text-gray-600">Pending</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span className="text-gray-600">Resolved</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <span className="text-gray-600">Escalated</span>
                </div>
              </div>
            </div>

            {/* Monthly Breakdown */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Monthly Breakdown</h4>
              {trendData.map((month) => (
                <div key={month.month} className="p-2 border border-gray-200 rounded bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm text-gray-900">{month.displayMonth}</p>
                    <p className="font-bold text-sm text-gray-900">{month.complaints} complaints</p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    {month.pending > 0 && (
                      <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">
                        {month.pending} pending
                      </span>
                    )}
                    {month.escalated > 0 && (
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-700">
                        {month.escalated} escalated
                      </span>
                    )}
                    {month.resolved > 0 && (
                      <span className="px-2 py-0.5 rounded bg-green-100 text-green-700">
                        {month.resolved} resolved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
