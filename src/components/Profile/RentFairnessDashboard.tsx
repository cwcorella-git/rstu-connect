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
import { useLanguage } from '@/contexts/LanguageContext'

interface RentFairnessDashboardProps {
  building: EnhancedBuilding
  unitNumber?: string
  userRent?: number
  monthlyIncome?: number
  unitSqft?: number
  bedroomCount?: number
  onUpdateRent?: (rent: number) => void
  onUpdateProfile?: (updates: { monthlyIncome?: number; unitSqft?: number; bedroomCount?: number }) => void
  readOnly?: boolean
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
  readOnly,
}: RentFairnessDashboardProps) {
  const { t } = useLanguage()
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
        <h3 className="font-medium text-gray-900">{t('rent.comparison')}</h3>
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
                <div className="text-sm text-gray-500">{t('rent.yourRent')}</div>
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
              {!readOnly && (
                <button
                  onClick={() => {
                    setRentInput(userRent.toString())
                    setShowRentInput(true)
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
{t('rent.edit')}
                </button>
              )}
            </div>
            {readOnly && (
              <p className="text-xs text-gray-500 mt-2">
                {t('rent.editInProfile')}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">{t('rent.addComparisonsPrompt')}</p>
            {!showRentInput ? (
              <button
                onClick={() => setShowRentInput(true)}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                {t('rent.addButton')}
              </button>
            ) : null}
          </div>
        )}

        {/* Rent Input */}
        {!readOnly && showRentInput && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={rentInput}
                onChange={(e) => setRentInput(e.target.value)}
                placeholder={t('rent.monthlyPlaceholder')}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                autoFocus
              />
            </div>
            <button
              onClick={handleSubmitRent}
              disabled={!rentInput}
              className="px-4 py-2 bg-rstu-red text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
{t('rent.save')}
            </button>
            <button
              onClick={() => setShowRentInput(false)}
              className="px-3 py-2 text-gray-400 hover:text-gray-600"
            >
              {t('rent.cancel')}
            </button>
          </div>
        )}

        {/* Metrics Grid - Only show if rent is set */}
        {report && (
          <div className="space-y-3">
            {/* Affordability Metric */}
            {report.affordability ? (
              <FairnessMetric
                title={t('rent.rentToIncome')}
                value={`${report.affordability.percent}%`}
                status={report.affordability.status}
                description={report.affordability.message}
                showBar
                barValue={report.affordability.percent}
              />
            ) : (
              <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600">{t('rent.rentToIncome')}</span>
                  <span className="text-xs text-gray-400">{t('rent.incomeNeeded')}</span>
                </div>
                {!readOnly && showIncomeInput ? (
                  <div className="flex gap-2 mt-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        value={incomeInput}
                        onChange={(e) => setIncomeInput(e.target.value)}
                        placeholder={t('rent.monthlyIncome')}
                        className="w-full pl-6 pr-2 py-1.5 border border-gray-300 rounded text-sm"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={handleSubmitIncome}
                      disabled={!incomeInput}
                      className="px-2 py-1 bg-rstu-red text-white rounded text-xs disabled:opacity-50"
                    >
{t('rent.add')}
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
                ) : !readOnly ? (
                  <button
                    onClick={() => setShowIncomeInput(true)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    {t('rent.addIncome')}
                  </button>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    {t('rent.editIncomeInProfile')}
                  </p>
                )}
              </div>
            )}

            {/* Cost per Sqft Metric */}
            {report.costPerSqft ? (
              <FairnessMetric
                title={t('rent.perSqft')}
                value={`$${report.costPerSqft.actual.toFixed(2)}`}
                benchmark={`Reno market: $${report.costPerSqft.market.toFixed(2)}/sqft`}
                status={report.costPerSqft.status}
                description={report.costPerSqft.message}
              />
            ) : (
              <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{t('rent.perSqft')}</span>
                  <span className="text-xs text-gray-400">{t('rent.addUnitSize')}</span>
                </div>
              </div>
            )}

            {/* FMR Comparison Metric */}
            {report.vsFMR && (
              <FairnessMetric
                title={t('rent.vsFMR')}
                value={`${report.vsFMR.percentDiff > 0 ? '+' : ''}${report.vsFMR.percentDiff}%`}
                benchmark={`${report.vsFMR.bedroomLabel}: $${report.vsFMR.fmr.toLocaleString()}/mo (Washoe County 2025)`}
                status={report.vsFMR.status}
                description={report.vsFMR.message}
              />
            )}

            {/* Age-Adjusted Metric */}
            {report.ageAdjusted ? (
              <FairnessMetric
                title={t('rent.ageAdjusted')}
                value={`$${report.ageAdjusted.expectedMin.toLocaleString()}-$${report.ageAdjusted.expectedMax.toLocaleString()}`}
                benchmark={`${report.ageAdjusted.buildingAge} yrs old, ${report.ageAdjusted.depreciation}% depreciation`}
                status={report.ageAdjusted.status}
                description={report.ageAdjusted.message}
              />
            ) : (
              <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{t('rent.ageAdjusted')}</span>
                  <span className="text-xs text-gray-400">{t('rent.yearBuiltUnknown')}</span>
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
                  <span className="text-sm font-medium text-gray-600">{t('rent.vsBuildingAvg')}</span>
                  <span className="text-xs text-gray-400">{t('rent.need2Units')}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t('rent.canvassMore')}
                  {buildingSummary.unitsWithRent === 1 && ` ${t('rent.unitsWithRent', { count: '1' })}`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Summary - just the counts */}
        {report && report.overall.totalMetrics > 0 && (
          <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
            <div className="text-sm font-medium text-gray-900 mb-2">{t('rent.summary')}</div>
            <div className="flex gap-4 text-xs mb-2">
              {report.overall.belowCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-blue-600">↓</span>
                  <span className="text-gray-600">{report.overall.belowCount} {t('rent.belowBenchmark')}</span>
                </div>
              )}
              {report.overall.atCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">=</span>
                  <span className="text-gray-600">{report.overall.atCount} {t('rent.atBenchmark')}</span>
                </div>
              )}
              {report.overall.aboveCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-600">↑</span>
                  <span className="text-gray-600">{report.overall.aboveCount} {t('rent.aboveBenchmark')}</span>
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
            <span>{t('rent.totalUnits')}</span>
            <span className="font-medium text-gray-700">{building.units}</span>
          </div>
          {building.yearBuilt && (
            <div className="flex justify-between">
              <span>{t('rent.yearBuilt')}</span>
              <span className="font-medium text-gray-700">{building.yearBuilt}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>{t('rent.owner')}</span>
            <span className="font-medium text-gray-700 truncate ml-4 max-w-[200px]">{building.owner}</span>
          </div>
        </div>
      </div>

      {/* Privacy Note */}
      <div className="px-4 pb-4">
        <div className="text-xs text-gray-400 bg-gray-50 rounded p-2">
          {t('rent.privacyNoteFull')}
        </div>
      </div>
    </div>
  )
}
