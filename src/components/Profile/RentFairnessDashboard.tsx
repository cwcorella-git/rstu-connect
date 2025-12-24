'use client'

import { useState, useMemo } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import { getBuildingRentsByBedroom, getBuildingUnitSummary } from '@/lib/canvassStorage'
import { FairnessMetric } from './FairnessMetric'
import {
  generateRentFairnessReport,
  type RentFairnessReport,
} from '@/lib/rentFairnessCalculations'
import { getBedroomLabel } from '@/lib/rentFairnessData'

interface RentFairnessDashboardProps {
  building: EnhancedBuilding
  unitNumber?: string
  userRent?: number
  monthlyIncome?: number
  unitSqft?: number
  bedroomCount?: number
  onUpdateRent?: (rent: number) => void
  onUpdateProfile?: (updates: { monthlyIncome?: number; unitSqft?: number; bedroomCount?: number }) => void
}

export function RentFairnessDashboard({
  building,
  unitNumber,
  userRent,
  monthlyIncome,
  unitSqft,
  bedroomCount,
  onUpdateRent,
  onUpdateProfile,
}: RentFairnessDashboardProps) {
  const [showRentInput, setShowRentInput] = useState(false)
  const [rentInput, setRentInput] = useState(userRent?.toString() || '')
  const [showIncomeInput, setShowIncomeInput] = useState(false)
  const [incomeInput, setIncomeInput] = useState('')

  // Get building rents from canvassing data, filtered by bedroom count if available
  const { buildingRents, sameSizeRents, buildingSummary } = useMemo(() => {
    const rents = getBuildingRentsByBedroom(building.chatSlug, bedroomCount)
    const summary = getBuildingUnitSummary(building.chatSlug)
    return {
      buildingRents: rents.all,
      sameSizeRents: rents.sameSize,
      buildingSummary: summary
    }
  }, [building.chatSlug, bedroomCount])

  // Generate the comparison report
  // Prefer same-size units for building comparison if available
  const report: RentFairnessReport | null = useMemo(() => {
    if (!userRent) return null

    // Use same-size units if we have 2+, otherwise fall back to all building rents
    const rentsForComparison = sameSizeRents.length >= 2
      ? sameSizeRents
      : buildingRents.length >= 2
        ? buildingRents
        : undefined

    return generateRentFairnessReport({
      rent: userRent,
      monthlyIncome,
      unitSqft,
      bedrooms: bedroomCount ?? 1, // Default to 1BR for FMR
      yearBuilt: building.yearBuilt,
      buildingRents: rentsForComparison,
    })
  }, [userRent, monthlyIncome, unitSqft, bedroomCount, building.yearBuilt, buildingRents, sameSizeRents])

  // Determine if we're using same-size comparison
  const usingSameSizeComparison = sameSizeRents.length >= 2

  const handleSubmitRent = () => {
    const amount = parseInt(rentInput)
    if (amount > 0 && onUpdateRent) {
      onUpdateRent(amount)
      setShowRentInput(false)
    }
  }

  const handleSubmitIncome = () => {
    const amount = parseInt(incomeInput)
    if (amount > 0 && onUpdateProfile) {
      onUpdateProfile({ monthlyIncome: amount })
      setShowIncomeInput(false)
      setIncomeInput('')
    }
  }

  // Calculate building age
  const buildingAge = building.yearBuilt
    ? new Date().getFullYear() - building.yearBuilt
    : null

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-medium text-gray-900">Rent Comparison</h3>
        <p className="text-sm text-gray-500">
          {building.propertyName || building.address.split(',')[0]}
          {buildingAge !== null && ` • Built ${building.yearBuilt} (${buildingAge} yrs)`}
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* User's Rent Display or Prompt */}
        {userRent ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">Your Rent</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${userRent.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500">/mo</span>
                </div>
                {unitSqft && (
                  <div className="text-xs text-gray-500 mt-1">
                    {unitSqft} sqft • {bedroomCount !== undefined ? getBedroomLabel(bedroomCount) : '1 BR'}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setRentInput(userRent.toString())
                  setShowRentInput(true)
                }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Edit
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Add your rent to see comparisons</p>
            {!showRentInput ? (
              <button
                onClick={() => setShowRentInput(true)}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                + Add rent amount
              </button>
            ) : null}
          </div>
        )}

        {/* Rent Input */}
        {showRentInput && (
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
              onClick={() => setShowRentInput(false)}
              className="px-3 py-2 text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Metrics Grid - Only show if rent is set */}
        {report && (
          <div className="space-y-3">
            {/* Affordability Metric */}
            {report.affordability ? (
              <FairnessMetric
                title="Rent-to-Income"
                value={`${report.affordability.percent}%`}
                status={report.affordability.status}
                description={report.affordability.message}
                showBar
                barValue={report.affordability.percent}
              />
            ) : (
              <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600">Rent-to-Income</span>
                  <span className="text-xs text-gray-400">Income needed</span>
                </div>
                {showIncomeInput ? (
                  <div className="flex gap-2 mt-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        value={incomeInput}
                        onChange={(e) => setIncomeInput(e.target.value)}
                        placeholder="Monthly income"
                        className="w-full pl-6 pr-2 py-1.5 border border-gray-300 rounded text-sm"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={handleSubmitIncome}
                      disabled={!incomeInput}
                      className="px-2 py-1 bg-rstu-red text-white rounded text-xs disabled:opacity-50"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowIncomeInput(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowIncomeInput(true)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    + Add income (optional, private)
                  </button>
                )}
              </div>
            )}

            {/* Cost per Sqft Metric */}
            {report.costPerSqft ? (
              <FairnessMetric
                title="$/Sqft"
                value={`$${report.costPerSqft.actual.toFixed(2)}`}
                benchmark={`Reno market: $${report.costPerSqft.market.toFixed(2)}/sqft`}
                status={report.costPerSqft.status}
                description={report.costPerSqft.message}
              />
            ) : (
              <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">$/Sqft</span>
                  <span className="text-xs text-gray-400">Add unit size in profile</span>
                </div>
              </div>
            )}

            {/* FMR Comparison Metric */}
            {report.vsFMR && (
              <FairnessMetric
                title="vs HUD Fair Market Rent"
                value={`${report.vsFMR.percentDiff > 0 ? '+' : ''}${report.vsFMR.percentDiff}%`}
                benchmark={`${report.vsFMR.bedroomLabel}: $${report.vsFMR.fmr.toLocaleString()}/mo (Washoe County 2025)`}
                status={report.vsFMR.status}
                description={report.vsFMR.message}
              />
            )}

            {/* Age-Adjusted Metric */}
            {report.ageAdjusted ? (
              <FairnessMetric
                title="Age-Adjusted Range"
                value={`$${report.ageAdjusted.expectedMin.toLocaleString()}-$${report.ageAdjusted.expectedMax.toLocaleString()}`}
                benchmark={`${report.ageAdjusted.buildingAge} yrs old, ${report.ageAdjusted.depreciation}% depreciation`}
                status={report.ageAdjusted.status}
                description={report.ageAdjusted.message}
              />
            ) : (
              <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Age-Adjusted</span>
                  <span className="text-xs text-gray-400">Year built unknown</span>
                </div>
              </div>
            )}

            {/* Building Average Metric */}
            {report.vsBuildingAvg ? (
              <FairnessMetric
                title={usingSameSizeComparison ? `vs ${getBedroomLabel(bedroomCount ?? 1)} Avg` : 'vs Building Avg'}
                value={`${report.vsBuildingAvg.percentDiff > 0 ? '+' : ''}${report.vsBuildingAvg.percentDiff}%`}
                benchmark={`${report.vsBuildingAvg.reportingUnits} ${usingSameSizeComparison ? getBedroomLabel(bedroomCount ?? 1) : ''} units: $${report.vsBuildingAvg.min.toLocaleString()}-$${report.vsBuildingAvg.max.toLocaleString()} range`}
                status={report.vsBuildingAvg.status}
                description={report.vsBuildingAvg.message}
              />
            ) : (
              <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">vs Building Avg</span>
                  <span className="text-xs text-gray-400">Need 2+ units</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Canvass more neighbors to enable this comparison.
                  {buildingSummary.unitsWithRent === 1 && ' (1 unit has rent data)'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Summary - just the counts */}
        {report && report.overall.totalMetrics > 0 && (
          <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
            <div className="text-sm font-medium text-gray-900 mb-2">Summary</div>
            <div className="flex gap-4 text-xs mb-2">
              {report.overall.belowCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-blue-600">↓</span>
                  <span className="text-gray-600">{report.overall.belowCount} below benchmark</span>
                </div>
              )}
              {report.overall.atCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">=</span>
                  <span className="text-gray-600">{report.overall.atCount} at benchmark</span>
                </div>
              )}
              {report.overall.aboveCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-600">↑</span>
                  <span className="text-gray-600">{report.overall.aboveCount} above benchmark</span>
                </div>
              )}
            </div>
            {report.overall.details.length > 0 && (
              <ul className="space-y-1">
                {report.overall.details.map((detail, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                    <span>•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            )}
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
          Your rent and income stay on your device. Only anonymous building averages are shared.
        </div>
      </div>
    </div>
  )
}
