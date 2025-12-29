'use client'

import { useState, useEffect, useMemo } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import { getBuildingCanvass, getHabitabilityScore } from '@/lib/canvassStorage'
import { calculateYoyRentIncrease, shouldAlertAboutRentIncrease, type RentHistoryEntry } from '@/lib/profileStorage'
import { downloadRentDisputePDF } from '@/lib/rentDisputePDF'
import { RentHistoryChart } from './RentHistoryChart'

interface RentComparisonProps {
  building: EnhancedBuilding
  unitNumber?: string
  userRent?: number
  rentHistory?: RentHistoryEntry[]
  onUpdateRent?: (rent: number) => void
  onAddHistoryEntry?: (date: string, amount: number) => void
}

interface RentStats {
  count: number
  average: number
  min: number
  max: number
  median: number
}

export function RentComparison({ building, unitNumber, userRent, rentHistory, onUpdateRent, onAddHistoryEntry }: RentComparisonProps) {
  const [stats, setStats] = useState<RentStats | null>(null)
  const [showInput, setShowInput] = useState(false)
  const [rentInput, setRentInput] = useState(userRent?.toString() || '')
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current')

  // Check if we should show history tab
  const hasHistory = (rentHistory && rentHistory.length > 0)
  const yoyIncrease = useMemo(() => calculateYoyRentIncrease(rentHistory, userRent), [rentHistory, userRent])
  const shouldAlert = useMemo(() => shouldAlertAboutRentIncrease(yoyIncrease), [yoyIncrease])

  // Check habitability score for organizing suggestions
  const habitabilityScore = useMemo(() => getHabitabilityScore(building.chatSlug), [building.chatSlug])
  const isPoorCondition = habitabilityScore && habitabilityScore.score !== null && habitabilityScore.score < 50

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

  const handleDownloadDisputeLetter = () => {
    if (!userRent || !yoyIncrease) return

    downloadRentDisputePDF({
      tenantName: 'Tenant',
      propertyAddress: building.address,
      landlordName: building.owner,
      previousRent: Math.round(userRent / (1 + yoyIncrease.percentChange / 100)),
      newRent: userRent,
      increasePercent: yoyIncrease.percentChange,
      buildingAverage: stats?.average,
      organizationName: 'Reno-Sparks Tenants Union',
      organizationPhone: '(775) RSTU-ORG',
    })
  }

  const handleFileComplaint = () => {
    if (!building.address) return

    // Pre-fill Nevada Housing Division complaint form
    const complaintUrl = new URL('https://ndcp.nv.gov/landlord-tenant/complaint')
    complaintUrl.searchParams.set('property_address', building.address)
    complaintUrl.searchParams.set('complaint_type', 'rent_increase')
    complaintUrl.searchParams.set('issue_description', `Unusual rent increase of ${yoyIncrease?.percentChange.toFixed(1)}% above regional average (3% baseline)`)

    window.open(complaintUrl.toString(), '_blank')
  }

  const handleOrganizeBuilding = () => {
    // This would integrate with governance system to create an organizing proposal
    // For now, open the building in organizing mode or show a prompt
    if (window.confirm('Would you like to start organizing in this building? You can create a collective demand for fair housing conditions and rent increases.')) {
      // Trigger organizing action - would integrate with governance system
      console.log('Starting organizing action for building:', building.apn)
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
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-medium text-gray-900">Rent Comparison</h3>
            <p className="text-sm text-gray-500">{building.propertyName || building.address.split(',')[0]}</p>
          </div>
          {shouldAlert && (
            <div className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
              ⚠️ Unusual Increase
            </div>
          )}
        </div>

        {/* Action Buttons - Show when there's an unusual increase */}
        {shouldAlert && userRent && yoyIncrease && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-xs font-medium text-red-700 mb-2">
              Your rent increased {yoyIncrease.percentChange.toFixed(1)}% ({yoyIncrease.dollarChange > 0 ? '+' : ''}${yoyIncrease.dollarChange}/mo) - above the 3-5% regional average. Take action:
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleDownloadDisputeLetter}
                className="text-xs font-medium px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                📄 Download Dispute Letter
              </button>
              <button
                onClick={handleFileComplaint}
                className="text-xs font-medium px-3 py-1.5 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
              >
                🏛️ File Nevada Housing Complaint
              </button>
              {buildingComparison && buildingComparison.direction === 'above' && buildingComparison.percent > 20 && isPoorCondition && (
                <button
                  onClick={handleOrganizeBuilding}
                  className="text-xs font-medium px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  👥 Organize Collective Demand
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        {hasHistory && (
          <div className="flex gap-2 border-t border-gray-100 pt-3 -mx-4 px-4">
            <button
              onClick={() => setActiveTab('current')}
              className={`pb-2 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === 'current'
                  ? 'border-rstu-red text-rstu-red'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Current
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-2 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'border-rstu-red text-rstu-red'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              History & Trends
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Show history tab content */}
        {activeTab === 'history' && hasHistory && (
          <RentHistoryChart
            rentHistory={rentHistory}
            currentRent={userRent}
            onAddHistoryEntry={onAddHistoryEntry}
          />
        )}

        {/* Show current tab content */}
        {activeTab === 'current' && (
          <>
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

            {/* Privacy Note */}
            <div className="text-xs text-gray-400 bg-gray-50 rounded p-2">
              Your rent is private. Only anonymous building averages are shown to organizers.
            </div>
          </>
        )}
      </div>
    </div>
  )
}
