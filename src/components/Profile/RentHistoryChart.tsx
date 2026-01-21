'use client'

import { useMemo } from 'react'
import type { RentHistoryEntry } from '@/lib/profileStorage'
import { calculateYoyRentIncrease, calculateCumulativeOvercharge, shouldAlertAboutRentIncrease } from '@/lib/profileStorage'

interface RentHistoryChartProps {
  rentHistory?: RentHistoryEntry[]
  currentRent?: number
  onAddHistoryEntry?: (date: string, amount: number) => void
}

// Reno 2024 market averages by unit type (from RentCafe analysis)
const RENO_MARKET_AVERAGES: Record<string, number> = {
  studio: 950,
  '1br': 1050,
  '2br': 1250,
  '3br': 1450,
  'all': 1100,
}

export function RentHistoryChart({ rentHistory = [], currentRent, onAddHistoryEntry }: RentHistoryChartProps) {
  const yoyIncrease = useMemo(() => calculateYoyRentIncrease(rentHistory, currentRent), [rentHistory, currentRent])
  const cumulativeOvercharge = useMemo(() => calculateCumulativeOvercharge(rentHistory, currentRent), [rentHistory, currentRent])
  const shouldAlert = useMemo(() => shouldAlertAboutRentIncrease(yoyIncrease), [yoyIncrease])

  // Format data for mini chart
  const sorted = useMemo(() => [...rentHistory].sort((a, b) => a.date.localeCompare(b.date)), [rentHistory])

  // Calculate chart dimensions
  const minRent = sorted.length > 0 ? Math.min(...sorted.map(e => e.amount), currentRent || Infinity) : 0
  const maxRent = sorted.length > 0 ? Math.max(...sorted.map(e => e.amount), currentRent || 0) : 0
  const range = maxRent - minRent || 1

  if (sorted.length === 0 && !currentRent) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Year-over-Year Increase */}
      {yoyIncrease && (
        <div className={`rounded-lg p-4 ${
          shouldAlert ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700">Year-over-Year Rent Increase</div>
              <div className={`text-2xl font-bold mt-1 ${
                shouldAlert ? 'text-red-700' : 'text-blue-700'
              }`}>
                {yoyIncrease.percentChange > 0 ? '+' : ''}{yoyIncrease.percentChange}%
                <span className="text-lg text-gray-600 ml-2">(${yoyIncrease.dollarChange > 0 ? '+' : ''}${yoyIncrease.dollarChange})</span>
              </div>
              {shouldAlert && (
                <div className="text-sm text-red-600 mt-2">
                  ⚠️ Unusual jump ({yoyIncrease.percentChange}% is above regional average of 3%)
                  <br />
                  <a href="#" className="underline font-medium">Review rent strike toolkit</a>
                </div>
              )}
              {!shouldAlert && yoyIncrease.percentChange > 0 && (
                <div className="text-sm text-blue-600 mt-2">
                  Your rent is tracking at typical regional increases
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cumulative Overcharge */}
      {cumulativeOvercharge > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700">Cumulative Rent Premium vs. Regional Average</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            ${cumulativeOvercharge.toLocaleString()}<span className="text-sm font-normal text-gray-600"> total</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            You&apos;ve paid ${cumulativeOvercharge.toLocaleString()} more than regional 3% baseline
          </div>
        </div>
      )}

      {/* Mini Chart of Rent History */}
      {sorted.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">Rent History</div>

          {/* ASCII-style mini chart */}
          <div className="space-y-1 mb-3 font-mono text-xs text-gray-600">
            {sorted.map((entry, idx) => {
              const height = Math.round(((entry.amount - minRent) / range) * 10)
              const bar = '█'.repeat(Math.max(1, height))
              return (
                <div key={entry.date} className="flex items-center gap-2">
                  <span className="w-12">{entry.date}</span>
                  <span className="text-red-600">{bar}</span>
                  <span className="text-gray-700">${entry.amount.toLocaleString()}</span>
                </div>
              )
            })}
            {currentRent && sorted[sorted.length - 1]?.date !== new Date().toISOString().slice(0, 7) && (
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <span className="w-12">{new Date().toISOString().slice(0, 7)}</span>
                <span className="text-blue-600">{'█'.repeat(10)}</span>
                <span className="text-gray-900">${currentRent.toLocaleString()} (now)</span>
              </div>
            )}
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
            <div className="bg-gray-50 rounded p-2">
              <div className="text-gray-500">First Rent</div>
              <div className="font-semibold text-gray-900">${sorted[0]?.amount.toLocaleString() || 'N/A'}</div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="text-gray-500">Latest</div>
              <div className="font-semibold text-gray-900">${currentRent?.toLocaleString() || sorted[sorted.length - 1]?.amount.toLocaleString() || 'N/A'}</div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="text-gray-500">Total Increase</div>
              <div className="font-semibold text-gray-900">
                {currentRent && sorted.length > 0 ? `+$${(currentRent - (sorted[0]?.amount || 0)).toLocaleString()}` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison to Reno Market */}
      {currentRent && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">Comparison to Reno Market</div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Reno average (all units)</span>
              <span className="font-semibold text-gray-900">${RENO_MARKET_AVERAGES.all.toLocaleString()}/mo</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Your rent</span>
              <span className="font-semibold text-gray-900">${currentRent.toLocaleString()}/mo</span>
            </div>

            {currentRent > RENO_MARKET_AVERAGES.all ? (
              <div className={`pt-2 border-t border-gray-100 flex justify-between items-center ${
                currentRent > RENO_MARKET_AVERAGES.all * 1.15 ? 'text-red-700' : 'text-orange-700'
              }`}>
                <span className="font-medium">You&apos;re paying</span>
                <span className="font-bold">${(currentRent - RENO_MARKET_AVERAGES.all).toLocaleString()}/mo above average</span>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-green-700">
                <span className="font-medium">You&apos;re paying</span>
                <span className="font-bold">${(RENO_MARKET_AVERAGES.all - currentRent).toLocaleString()}/mo below average</span>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Market rates based on RentCafe 2024 Reno data. Your unit type may vary.
          </p>
        </div>
      )}
    </div>
  )
}
