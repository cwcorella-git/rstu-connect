'use client'

import { useState, useEffect } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import { getBuildingCanvass } from '@/lib/canvassStorage'

interface RentComparisonProps {
  building: EnhancedBuilding
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

  // Estimate market rent from assessed value
  // Rule of thumb: monthly rent ≈ 0.8-1.2% of property value per unit
  // We use 1% as middle estimate
  const estimatedRentPerUnit = building.value && building.units > 0
    ? Math.round((building.value * 0.01) / building.units)
    : null

  // Calculate comparison to building average
  let buildingComparison: { percent: number; direction: 'above' | 'below' | 'at' } | null = null
  if (userRent && stats) {
    const diff = userRent - stats.average
    const percent = Math.abs(Math.round((diff / stats.average) * 100))
    buildingComparison = {
      percent,
      direction: diff > 50 ? 'above' : diff < -50 ? 'below' : 'at',
    }
  }

  // Calculate comparison to estimated market rent
  let marketComparison: { percent: number; direction: 'above' | 'below' | 'at' } | null = null
  if (userRent && estimatedRentPerUnit && estimatedRentPerUnit > 0) {
    const diff = userRent - estimatedRentPerUnit
    const percent = Math.abs(Math.round((diff / estimatedRentPerUnit) * 100))
    marketComparison = {
      percent,
      direction: diff > 50 ? 'above' : diff < -50 ? 'below' : 'at',
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-medium text-gray-900">Rent Comparison</h3>
        <p className="text-sm text-gray-500">{building.propertyName || building.address.split(',')[0]}</p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* User's Rent Display */}
        {userRent ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Your Rent</div>
                <div className="text-2xl font-bold text-gray-900">${userRent.toLocaleString()}<span className="text-sm font-normal text-gray-500">/mo</span></div>
              </div>
              <button
                onClick={() => {
                  setRentInput(userRent.toString())
                  setShowInput(true)
                }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Edit
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-sm text-blue-700 mb-2">Add your rent to see how you compare</p>
            {!showInput ? (
              <button
                onClick={() => setShowInput(true)}
                className="text-sm font-medium text-blue-700 hover:text-blue-800"
              >
                + Add rent amount
              </button>
            ) : null}
          </div>
        )}

        {/* Rent Input */}
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
              className="px-4 py-2 bg-rstu-red text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
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

        {/* Building Stats (from canvassing) */}
        {stats && (
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Building Data ({stats.count} units reporting)
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-lg font-bold text-gray-900">${stats.average.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Average</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-lg font-bold text-gray-900">${stats.median.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Median</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-sm font-medium text-gray-700">${stats.min.toLocaleString()}-${stats.max.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Range</div>
              </div>
            </div>

            {/* Building comparison result */}
            {userRent && buildingComparison && (
              <div className={`mt-3 rounded-lg p-3 ${
                buildingComparison.direction === 'above' ? 'bg-red-50 border border-red-100' :
                buildingComparison.direction === 'below' ? 'bg-green-50 border border-green-100' :
                'bg-gray-50 border border-gray-100'
              }`}>
                <div className={`text-sm font-medium ${
                  buildingComparison.direction === 'above' ? 'text-red-700' :
                  buildingComparison.direction === 'below' ? 'text-green-700' :
                  'text-gray-600'
                }`}>
                  {buildingComparison.direction === 'at' ? (
                    'Your rent is at the building average'
                  ) : (
                    <>
                      Your rent is <strong>{buildingComparison.percent}% {buildingComparison.direction}</strong> the building average
                    </>
                  )}
                </div>
                {buildingComparison.direction === 'above' && buildingComparison.percent > 15 && (
                  <p className="text-xs text-red-600 mt-1">
                    You may be paying more than your neighbors for similar units.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Market Estimate (from property value) */}
        {estimatedRentPerUnit && estimatedRentPerUnit > 200 && (
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Estimated Market Rent
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-gray-900">${estimatedRentPerUnit.toLocaleString()}<span className="text-sm font-normal text-gray-500">/mo</span></div>
                  <div className="text-xs text-gray-500">Based on ${building.value?.toLocaleString()} assessed value ÷ {building.units} units</div>
                </div>
              </div>

              {/* Market comparison result */}
              {userRent && marketComparison && !stats && (
                <div className={`mt-2 pt-2 border-t ${
                  marketComparison.direction === 'above' ? 'border-red-100' :
                  marketComparison.direction === 'below' ? 'border-green-100' :
                  'border-gray-100'
                }`}>
                  <div className={`text-sm ${
                    marketComparison.direction === 'above' ? 'text-red-700' :
                    marketComparison.direction === 'below' ? 'text-green-700' :
                    'text-gray-600'
                  }`}>
                    {marketComparison.direction === 'at' ? (
                      'Your rent is at the estimated market rate'
                    ) : (
                      <>
                        Your rent is <strong>{marketComparison.percent}%</strong> {marketComparison.direction} the estimated market rate
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Estimate only. Actual rents vary by unit size, condition, and amenities.
            </p>
          </div>
        )}

        {/* Property Info */}
        <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-100">
          <div className="flex justify-between">
            <span>Total Units</span>
            <span className="font-medium text-gray-700">{building.units}</span>
          </div>
          {building.yearBuilt && (
            <div className="flex justify-between">
              <span>Year Built</span>
              <span className="font-medium text-gray-700">{building.yearBuilt}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Owner</span>
            <span className="font-medium text-gray-700 truncate ml-4 max-w-[200px]">{building.owner}</span>
          </div>
        </div>
      </div>

      {/* Privacy Note */}
      <div className="px-4 pb-4">
        <div className="text-xs text-gray-400 bg-gray-50 rounded p-2">
          Your rent is private. Only anonymous building averages are shown to organizers.
        </div>
      </div>
    </div>
  )
}
