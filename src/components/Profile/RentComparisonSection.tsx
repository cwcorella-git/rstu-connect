'use client'

import { useMemo } from 'react'
import type { UserProfile } from '@/lib/profileStorage'
import { canAccessTools, getCurrentProfile } from '@/lib/profileStorage'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import { getBuildingRentsByBedroom } from '@/lib/canvassStorage'
import { FairnessMetric } from './FairnessMetric'
import {
  generateRentFairnessReport,
  type RentFairnessReport,
} from '@/lib/rentFairnessCalculations'
import { getBedroomLabel } from '@/lib/rentFairnessData'

interface RentComparisonSectionProps {
  profile: UserProfile
  building?: EnhancedBuilding
}

export function RentComparisonSection({
  profile,
  building,
}: RentComparisonSectionProps) {
  const currentUser = getCurrentProfile()
  const isOwnProfile = currentUser?.id === profile.id
  const canView = isOwnProfile || canAccessTools()

  // Privacy check
  if (!canView) return null

  const userRent = profile.rentAmount
  const monthlyIncome = profile.monthlyIncome
  const unitSqft = profile.unitSqft
  const bedroomCount = profile.bedroomCount

  // Get building rents from canvassing data
  const { buildingRents, sameSizeRents } = useMemo(() => {
    if (!building) return { buildingRents: [], sameSizeRents: [] }
    const rents = getBuildingRentsByBedroom(building.chatSlug, bedroomCount)
    return {
      buildingRents: rents.all,
      sameSizeRents: rents.sameSize
    }
  }, [building, bedroomCount])

  // Generate the comparison report
  const report: RentFairnessReport | null = useMemo(() => {
    if (!userRent || !building) return null

    const rentsForComparison = sameSizeRents.length >= 2
      ? sameSizeRents
      : buildingRents.length >= 2
        ? buildingRents
        : undefined

    return generateRentFairnessReport({
      rent: userRent,
      monthlyIncome,
      unitSqft,
      bedrooms: bedroomCount ?? 1,
      yearBuilt: building.yearBuilt,
      buildingRents: rentsForComparison,
    })
  }, [userRent, monthlyIncome, unitSqft, bedroomCount, building, buildingRents, sameSizeRents])

  const usingSameSizeComparison = sameSizeRents.length >= 2

  if (!userRent) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Rent Comparison</h3>
        <p className="text-sm text-gray-600">
          Add your rent amount in Edit Profile to see comparisons
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rent Comparison</h3>

      {/* Your Rent Display */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="text-sm text-gray-500">Your Rent</div>
        <div className="text-3xl font-bold text-gray-900">
          ${userRent.toLocaleString()}
          <span className="text-lg font-normal text-gray-500">/mo</span>
        </div>
        {unitSqft && (
          <div className="text-xs text-gray-500 mt-1">
            {unitSqft} sqft • {bedroomCount !== undefined ? getBedroomLabel(bedroomCount) : '1 BR'}
          </div>
        )}
      </div>

      {/* Metrics */}
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
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Rent-to-Income</span>
                <span className="text-xs text-gray-400">Add income in Edit Profile</span>
              </div>
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
                <span className="text-xs text-gray-400">Add unit size in Edit Profile</span>
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
          ) : building && !building.yearBuilt ? (
            <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Age-Adjusted</span>
                <span className="text-xs text-gray-400">Year built unknown</span>
              </div>
            </div>
          ) : null}

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
                <span className="text-xs text-gray-400">Need 2+ units reporting</span>
              </div>
            </div>
          )}

          {/* Summary */}
          {report.overall.totalMetrics > 0 && (
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50 mt-4">
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
        </div>
      )}

      {/* Privacy Note */}
      <div className="text-xs text-gray-400 bg-gray-50 rounded p-2 mt-4">
        Your rent and income stay on your device. Only anonymous building averages are shared.
      </div>
    </div>
  )
}
