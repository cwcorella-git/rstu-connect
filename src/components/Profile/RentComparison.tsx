'use client'

import { useState, useEffect } from 'react'
import type { Building } from '@/lib/getBuildingsData'
import { getBuildingCanvass } from '@/lib/canvassStorage'

interface RentComparisonProps {
  building: Building
  unitNumber?: string
  userRent?: number
  onUpdateRent?: (rent: number) => void
}

interface RentStats {
  count: number
  average: number
  min: number
  max: number
  median: number
}

export function RentComparison({ building, unitNumber, userRent, onUpdateRent }: RentComparisonProps) {
  const [stats, setStats] = useState<RentStats | null>(null)
  const [showInput, setShowInput] = useState(false)
  const [rentInput, setRentInput] = useState(userRent?.toString() || '')

  useEffect(() => {
    calculateStats()
  }, [building.chatSlug])

  const calculateStats = () => {
    const canvass = getBuildingCanvass(building.chatSlug)
    if (!canvass) {
      setStats(null)
      return
    }

    const rents: number[] = []
    for (const unit of Object.values(canvass.units)) {
      if (unit.rentAmount && unit.rentAmount > 0) {
        rents.push(unit.rentAmount)
      }
    }

    if (rents.length < 2) {
      setStats(null)
      return
    }

    rents.sort((a, b) => a - b)
    const sum = rents.reduce((a, b) => a + b, 0)
    const median = rents.length % 2 === 0
      ? (rents[rents.length / 2 - 1] + rents[rents.length / 2]) / 2
      : rents[Math.floor(rents.length / 2)]

    setStats({
      count: rents.length,
      average: Math.round(sum / rents.length),
      min: rents[0],
      max: rents[rents.length - 1],
      median: Math.round(median),
    })
  }

  const handleSubmitRent = () => {
    const amount = parseInt(rentInput)
    if (amount > 0 && onUpdateRent) {
      onUpdateRent(amount)
      setShowInput(false)
    }
  }

  // Calculate comparison
  let comparison: { percent: number; direction: 'above' | 'below' | 'at' } | null = null
  if (userRent && stats) {
    const diff = userRent - stats.average
    const percent = Math.abs(Math.round((diff / stats.average) * 100))
    comparison = {
      percent,
      direction: diff > 50 ? 'above' : diff < -50 ? 'below' : 'at',
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-medium text-gray-900">Rent Comparison</h3>
        <p className="text-sm text-gray-500">{building.address.split(',')[0]}</p>
      </div>

      {/* Content */}
      <div className="p-4">
        {!stats ? (
          <div className="text-center py-4">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm text-gray-500">Not enough data yet</p>
            <p className="text-xs text-gray-400 mt-1">Need at least 2 units with rent info</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Building Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xl font-bold text-gray-900">${stats.average}</div>
                <div className="text-xs text-gray-500">Average</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xl font-bold text-gray-900">${stats.median}</div>
                <div className="text-xs text-gray-500">Median</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-700">${stats.min} - ${stats.max}</div>
                <div className="text-xs text-gray-500">Range</div>
              </div>
            </div>

            <div className="text-xs text-gray-400 text-center">
              Based on {stats.count} units in this building
            </div>

            {/* User's Rent Comparison */}
            {userRent && comparison && (
              <div className={`rounded-lg p-4 ${
                comparison.direction === 'above' ? 'bg-red-50 border border-red-100' :
                comparison.direction === 'below' ? 'bg-green-50 border border-green-100' :
                'bg-gray-50 border border-gray-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Your Rent</div>
                    <div className="text-2xl font-bold text-gray-900">${userRent}/mo</div>
                  </div>
                  <div className={`text-right ${
                    comparison.direction === 'above' ? 'text-red-700' :
                    comparison.direction === 'below' ? 'text-green-700' :
                    'text-gray-600'
                  }`}>
                    {comparison.direction === 'at' ? (
                      <div className="text-sm font-medium">At average</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{comparison.percent}%</div>
                        <div className="text-sm">
                          {comparison.direction === 'above' ? 'above' : 'below'} average
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {comparison.direction === 'above' && comparison.percent > 10 && (
                  <div className="mt-3 pt-3 border-t border-red-200 text-sm text-red-700">
                    Your rent is significantly higher than neighbors.
                    {comparison.percent > 20 && ' Consider organizing for rent fairness.'}
                  </div>
                )}
              </div>
            )}

            {/* Add/Edit Rent */}
            {!userRent && !showInput && (
              <button
                onClick={() => setShowInput(true)}
                className="w-full py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100"
              >
                Add your rent to compare
              </button>
            )}

            {showInput && (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={rentInput}
                    onChange={(e) => setRentInput(e.target.value)}
                    placeholder="Monthly rent"
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleSubmitRent}
                  disabled={!rentInput}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowInput(false)}
                  className="px-3 py-2 text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>
            )}

            {userRent && (
              <button
                onClick={() => {
                  setRentInput(userRent.toString())
                  setShowInput(true)
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Update your rent
              </button>
            )}
          </div>
        )}
      </div>

      {/* Privacy Note */}
      <div className="px-4 pb-4">
        <div className="text-xs text-gray-400 bg-gray-50 rounded p-2">
          Your specific rent is never shared. Only building-wide averages are shown.
        </div>
      </div>
    </div>
  )
}
