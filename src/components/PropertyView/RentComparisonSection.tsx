'use client'

import { useState, useMemo } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import { getCurrentProfile, updateProfile, calculateYoyRentIncrease, shouldAlertAboutRentIncrease } from '@/lib/profileStorage'
import { getBuildingRentsByBedroom, getBuildingUnitSummary } from '@/lib/canvassStorage'
import { generateRentFairnessReport, type MetricStatus, type RentFairnessReport } from '@/lib/rentFairnessCalculations'
import { getBedroomLabel } from '@/lib/rentFairnessData'
import { useLanguage } from '@/contexts/LanguageContext'
import { SectionHeader, DataSection, DataRow } from './InfoComponents'

interface RentComparisonSectionProps {
  building: EnhancedBuilding
}

function StatusIcon({ status }: { status: MetricStatus }) {
  const config: Record<MetricStatus, { symbol: string; color: string }> = {
    below: { symbol: '\u2193', color: 'text-blue-600' },
    at: { symbol: '=', color: 'text-gray-500' },
    above: { symbol: '\u2191', color: 'text-yellow-600' },
    high: { symbol: '\u2191\u2191', color: 'text-orange-600' },
  }
  const { symbol, color } = config[status]
  return <span className={`ml-1.5 font-bold ${color}`}>{symbol}</span>
}

export function RentComparisonSection({ building }: RentComparisonSectionProps) {
  const { t } = useLanguage()

  // Local state initialized from profile
  const profile = getCurrentProfile()
  const isOwnBuilding = profile?.buildingId === building.chatSlug

  const [localRent, setLocalRent] = useState<number | undefined>(isOwnBuilding ? profile?.rentAmount : undefined)
  const [localIncome, setLocalIncome] = useState<number | undefined>(isOwnBuilding ? profile?.monthlyIncome : undefined)
  const [localSqft, setLocalSqft] = useState<number | undefined>(isOwnBuilding ? profile?.unitSqft : undefined)
  const [localBedrooms, setLocalBedrooms] = useState<number | undefined>(isOwnBuilding ? profile?.bedroomCount : undefined)

  // Input toggle states
  const [showRentInput, setShowRentInput] = useState(false)
  const [rentInput, setRentInput] = useState('')
  const [showIncomeInput, setShowIncomeInput] = useState(false)
  const [incomeInput, setIncomeInput] = useState('')
  const [showSqftInput, setShowSqftInput] = useState(false)
  const [sqftInput, setSqftInput] = useState('')
  const [showBedroomPicker, setShowBedroomPicker] = useState(false)

  // Building-wide rent data from canvassing
  const { buildingRents, sameSizeRents, buildingSummary } = useMemo(() => {
    const rents = getBuildingRentsByBedroom(building.chatSlug, localBedrooms)
    const summary = getBuildingUnitSummary(building.chatSlug)
    return { buildingRents: rents.all, sameSizeRents: rents.sameSize, buildingSummary: summary }
  }, [building.chatSlug, localBedrooms])

  // Generate fairness report
  const report: RentFairnessReport | null = useMemo(() => {
    if (!localRent) return null
    const rentsForComparison = sameSizeRents.length >= 2
      ? sameSizeRents
      : buildingRents.length >= 2
        ? buildingRents
        : undefined
    return generateRentFairnessReport({
      rent: localRent,
      monthlyIncome: localIncome,
      unitSqft: localSqft,
      bedrooms: localBedrooms ?? 1,
      yearBuilt: building.yearBuilt,
      buildingRents: rentsForComparison,
    })
  }, [localRent, localIncome, localSqft, localBedrooms, building.yearBuilt, buildingRents, sameSizeRents])

  // YoY rent increase detection
  const yoyIncrease = useMemo(() =>
    calculateYoyRentIncrease(profile?.rentHistory, localRent),
    [profile?.rentHistory, localRent]
  )
  const shouldAlert = useMemo(() => shouldAlertAboutRentIncrease(yoyIncrease), [yoyIncrease])

  // Save handlers
  const handleSaveRent = () => {
    const amount = parseInt(rentInput)
    if (amount > 0) {
      updateProfile({ rentAmount: amount })
      setLocalRent(amount)
      setShowRentInput(false)
      setRentInput('')
    }
  }

  const handleSaveIncome = () => {
    const amount = parseInt(incomeInput)
    if (amount > 0) {
      updateProfile({ monthlyIncome: amount })
      setLocalIncome(amount)
      setShowIncomeInput(false)
      setIncomeInput('')
    }
  }

  const handleSaveSqft = () => {
    const amount = parseInt(sqftInput)
    if (amount > 0) {
      updateProfile({ unitSqft: amount })
      setLocalSqft(amount)
      setShowSqftInput(false)
      setSqftInput('')
    }
  }

  const handleSelectBedrooms = (count: number) => {
    updateProfile({ bedroomCount: count })
    setLocalBedrooms(count)
    setShowBedroomPicker(false)
  }

  const handleDisputeLetter = async () => {
    if (!localRent || !yoyIncrease) return
    const { downloadRentDisputePDF } = await import('@/lib/rentDisputePDF')
    downloadRentDisputePDF({
      tenantName: profile?.nickname || 'Tenant',
      propertyAddress: building.address,
      landlordName: building.owner,
      previousRent: Math.round(localRent / (1 + yoyIncrease.percentChange / 100)),
      newRent: localRent,
      increasePercent: yoyIncrease.percentChange,
      organizationName: 'Reno-Sparks Tenants Union',
    })
  }

  const hasBuildingData = buildingSummary.unitsWithRent > 0

  return (
    <>
      <SectionHeader title={t('rent.sectionTitle')} />

      {/* YoY Alert Banner */}
      {isOwnBuilding && shouldAlert && yoyIncrease && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <div className="text-xs font-medium text-red-700 mb-2">
            {t('rent.increaseAlert', {
              percent: yoyIncrease.percentChange.toFixed(1),
              change: `${yoyIncrease.dollarChange > 0 ? '+' : ''}$${yoyIncrease.dollarChange}`,
            })}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDisputeLetter}
              className="text-xs font-medium px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              {t('rent.downloadDispute')}
            </button>
          </div>
        </div>
      )}

      {/* Building-wide data (always shown if available) */}
      <DataSection>
        <DataRow
          label={t('rent.avgRent')}
          value={hasBuildingData
            ? `$${Math.round(buildingSummary.avgRent).toLocaleString()}/mo`
            : t('rent.noDataYet')
          }
        />
        {hasBuildingData && buildingSummary.rentRange && (
          <DataRow
            label={t('rent.rentRange')}
            value={`$${buildingSummary.rentRange.min.toLocaleString()}-$${buildingSummary.rentRange.max.toLocaleString()}`}
          />
        )}
        <DataRow
          label={t('rent.unitsReporting')}
          value={`${buildingSummary.unitsWithRent} of ${building.units || '?'}`}
        />
      </DataSection>

      {/* Not the user's building — show note and stop */}
      {!isOwnBuilding && (
        <p className="text-xs text-gray-400 italic text-center mb-4">
          {t('rent.switchBuilding')}
        </p>
      )}

      {/* Personal comparison section — only for user's own building */}
      {isOwnBuilding && !localRent && (
        <div className="border border-gray-200 rounded-lg p-3 mb-4 bg-gray-50">
          <p className="text-sm text-gray-600 mb-2">{t('rent.addPrompt')}</p>

          {!showRentInput ? (
            <button
              onClick={() => setShowRentInput(true)}
              className="text-sm font-medium text-rstu-red hover:text-red-800"
            >
              {t('rent.addButton')}
            </button>
          ) : (
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  value={rentInput}
                  onChange={(e) => setRentInput(e.target.value)}
                  placeholder={t('rent.monthlyPlaceholder')}
                  className="w-full pl-6 pr-2 py-1.5 border border-gray-300 rounded text-sm"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveRent()}
                />
              </div>
              <button
                onClick={handleSaveRent}
                disabled={!rentInput}
                className="px-3 py-1.5 bg-rstu-red text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {t('rent.save')}
              </button>
              <button
                onClick={() => { setShowRentInput(false); setRentInput('') }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Preview of what they'll get */}
          <div className="mt-3 text-xs text-gray-500">
            <p className="font-medium text-gray-600 mb-1">{t('rent.youllSee')}</p>
            <ul className="space-y-0.5 ml-3">
              <li>{t('rent.vsFMR')}</li>
              <li>{t('rent.perSqft')}</li>
              <li>{t('rent.rentToIncome')}</li>
              <li>{t('rent.vsBuildingAvg')}</li>
            </ul>
          </div>
        </div>
      )}

      {/* Full comparison metrics — when user has submitted rent */}
      {isOwnBuilding && localRent && report && (
        <>
          <DataSection>
            {/* User's rent header row */}
            <DataRow
              label={t('rent.yourRent')}
              value={
                !showRentInput ? (
                  <span className="flex items-center gap-1.5">
                    ${localRent.toLocaleString()}/mo
                    <button
                      onClick={() => { setRentInput(localRent.toString()); setShowRentInput(true) }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </span>
                ) : (
                  <div className="flex gap-1 items-center">
                    <div className="relative">
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                      <input
                        type="number"
                        value={rentInput}
                        onChange={(e) => setRentInput(e.target.value)}
                        className="w-20 pl-5 pr-1 py-1 border border-gray-300 rounded text-xs"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRent()}
                      />
                    </div>
                    <button onClick={handleSaveRent} disabled={!rentInput} className="text-xs text-rstu-red font-medium disabled:opacity-50">
                      {t('rent.save')}
                    </button>
                    <button onClick={() => { setShowRentInput(false); setRentInput('') }} className="text-gray-400 hover:text-gray-600">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )
              }
            />

            {/* Unit info sub-row */}
            {(localBedrooms !== undefined || localSqft) && (
              <DataRow
                label=""
                value={
                  <span className="text-xs text-gray-500 font-normal">
                    {localBedrooms !== undefined && getBedroomLabel(localBedrooms)}
                    {localBedrooms !== undefined && localSqft && ' \u2022 '}
                    {localSqft && `${localSqft} sqft`}
                  </span>
                }
              />
            )}

            {/* FMR Comparison */}
            {report.vsFMR && (
              <DataRow
                label={t('rent.vsFMR')}
                value={
                  <span className="flex items-center">
                    {report.vsFMR.percentDiff > 0 ? '+' : ''}{report.vsFMR.percentDiff}%
                    <StatusIcon status={report.vsFMR.status} />
                  </span>
                }
              />
            )}

            {/* Cost per Sqft */}
            {report.costPerSqft ? (
              <DataRow
                label={t('rent.perSqft')}
                value={
                  <span className="flex items-center">
                    ${report.costPerSqft.actual.toFixed(2)}
                    <StatusIcon status={report.costPerSqft.status} />
                  </span>
                }
              />
            ) : !localSqft ? (
              <DataRow
                label={t('rent.perSqft')}
                value={
                  !showSqftInput ? (
                    <button onClick={() => setShowSqftInput(true)} className="text-xs text-gray-400 hover:text-gray-600">
                      + {t('rent.addUnitSize')}
                    </button>
                  ) : (
                    <div className="flex gap-1 items-center">
                      <input
                        type="number"
                        value={sqftInput}
                        onChange={(e) => setSqftInput(e.target.value)}
                        placeholder="sqft"
                        className="w-16 px-1.5 py-1 border border-gray-300 rounded text-xs"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveSqft()}
                      />
                      <button onClick={handleSaveSqft} disabled={!sqftInput} className="text-xs text-rstu-red font-medium disabled:opacity-50">
                        {t('rent.save')}
                      </button>
                      <button onClick={() => { setShowSqftInput(false); setSqftInput('') }} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )
                }
              />
            ) : null}

            {/* Affordability */}
            {report.affordability ? (
              <DataRow
                label={t('rent.rentToIncome')}
                value={
                  <span className="flex items-center">
                    {report.affordability.percent}%
                    <StatusIcon status={report.affordability.status} />
                  </span>
                }
              />
            ) : (
              <DataRow
                label={t('rent.rentToIncome')}
                value={
                  !showIncomeInput ? (
                    <button onClick={() => setShowIncomeInput(true)} className="text-xs text-gray-400 hover:text-gray-600">
                      + {t('rent.addIncome')}
                    </button>
                  ) : (
                    <div className="flex gap-1 items-center">
                      <div className="relative">
                        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                        <input
                          type="number"
                          value={incomeInput}
                          onChange={(e) => setIncomeInput(e.target.value)}
                          placeholder={t('rent.monthlyIncome')}
                          className="w-20 pl-5 pr-1 py-1 border border-gray-300 rounded text-xs"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveIncome()}
                        />
                      </div>
                      <button onClick={handleSaveIncome} disabled={!incomeInput} className="text-xs text-rstu-red font-medium disabled:opacity-50">
                        {t('rent.save')}
                      </button>
                      <button onClick={() => { setShowIncomeInput(false); setIncomeInput('') }} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )
                }
              />
            )}

            {/* Building Average */}
            {report.vsBuildingAvg ? (
              <DataRow
                label={t('rent.vsBuildingAvg')}
                value={
                  <span className="flex items-center">
                    {report.vsBuildingAvg.percentDiff > 0 ? '+' : ''}{report.vsBuildingAvg.percentDiff}%
                    <StatusIcon status={report.vsBuildingAvg.status} />
                  </span>
                }
              />
            ) : (
              <DataRow
                label={t('rent.vsBuildingAvg')}
                value={<span className="text-xs text-gray-400">{t('rent.need2Units')}</span>}
              />
            )}

            {/* Age-Adjusted */}
            {report.ageAdjusted ? (
              <DataRow
                label={t('rent.ageAdjusted')}
                value={
                  <span className="flex items-center">
                    ${report.ageAdjusted.expectedMin.toLocaleString()}-${report.ageAdjusted.expectedMax.toLocaleString()}
                    <StatusIcon status={report.ageAdjusted.status} />
                  </span>
                }
              />
            ) : building.yearBuilt ? null : (
              <DataRow
                label={t('rent.ageAdjusted')}
                value={<span className="text-xs text-gray-400">{t('rent.yearBuiltUnknown')}</span>}
              />
            )}

            {/* Bedrooms — prompt to add if missing */}
            {localBedrooms === undefined && (
              <DataRow
                label={t('rent.bedroomsLabel')}
                value={
                  !showBedroomPicker ? (
                    <button onClick={() => setShowBedroomPicker(true)} className="text-xs text-gray-400 hover:text-gray-600">
                      + {t('rent.add')}
                    </button>
                  ) : (
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map(n => (
                        <button
                          key={n}
                          onClick={() => handleSelectBedrooms(n)}
                          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-rstu-red hover:text-white hover:border-rstu-red transition-colors"
                        >
                          {n === 0 ? 'Studio' : `${n}BR`}
                        </button>
                      ))}
                    </div>
                  )
                }
              />
            )}
          </DataSection>

          {/* Privacy note */}
          <p className="text-xs text-gray-400 text-center mb-4">
            {t('rent.privacyNoteFull')}
          </p>
        </>
      )}
    </>
  )
}
