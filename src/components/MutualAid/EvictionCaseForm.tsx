'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { createCase, type EvictionCase } from '@/lib/storage/evictionDefenseStorage'
import { getCurrentProfile } from '@/lib/storage/profileStorage'
import { EnhancedBuilding } from '@/lib/data/getBuildingsData'
import { LegislationLink } from '@/components/shared/Legislation'
import { useLanguage } from '@/contexts/LanguageContext'

interface EvictionCaseFormProps {
  buildings: EnhancedBuilding[]
  initialBuilding?: EnhancedBuilding
  onCaseCreated?: (evictionCase: EvictionCase) => void
  onCancel?: () => void
}

export function EvictionCaseForm({ buildings, initialBuilding, onCaseCreated, onCancel }: EvictionCaseFormProps) {
  const { t } = useLanguage()
  const profile = getCurrentProfile()
  const allBuildings = useMemo(() => buildings, [buildings])

  // Form state
  const [tenantName, setTenantName] = useState(profile?.nickname || '')
  const [selectedBuildingApn, setSelectedBuildingApn] = useState(initialBuilding?.apn || '')
  const [unitNumber, setUnitNumber] = useState('')
  const [anonymousDisplay, setAnonymousDisplay] = useState(true)
  const [caseType, setCaseType] = useState<'nonpayment' | 'lease_violation' | 'no_cause' | 'other'>('nonpayment')
  const [noticeType, setNoticeType] = useState<'3-day' | '5-day' | '7-day' | '30-day'>('3-day')
  const [noticeReceivedDate, setNoticeReceivedDate] = useState('')
  const [filingDate, setFilingDate] = useState('')
  const [courtDate, setCourtDate] = useState('')
  const [buildingSearch, setBuildingSearch] = useState(initialBuilding?.address || '')
  const [showBuildingDropdown, setShowBuildingDropdown] = useState(false)

  // Sync form state when initialBuilding changes (e.g., when switching between properties)
  useEffect(() => {
    if (initialBuilding) {
      setSelectedBuildingApn(initialBuilding.apn)
      setBuildingSearch(initialBuilding.address)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBuilding?.apn])

  // Filter buildings by search
  const filteredBuildings = useMemo(() => {
    if (!buildingSearch.trim()) return []
    const query = buildingSearch.toLowerCase()
    return allBuildings.filter(
      b =>
        b.address.toLowerCase().includes(query) ||
        (b.propertyName && b.propertyName.toLowerCase().includes(query))
    ).slice(0, 100) // Show up to 100 results to keep UI responsive
  }, [buildingSearch, allBuildings])

  const selectedBuilding = useMemo(() => {
    return allBuildings.find(b => b.apn === selectedBuildingApn)
  }, [selectedBuildingApn, allBuildings])

  // Form validation
  const isValid = tenantName.trim() && selectedBuildingApn && caseType && noticeReceivedDate

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValid || !profile) return

    const newCase = createCase({
      tenantProfileId: profile.id,
      tenantName,
      buildingApn: selectedBuildingApn,
      buildingAddress: selectedBuilding?.address || '',
      unitNumber: unitNumber || undefined,
      anonymousDisplay,
      caseType,
      stage: 'filed',
      noticeType,
      noticeReceivedDate,
      filingDate: filingDate || undefined,
      courtDate: courtDate || undefined,
      defenseStrategies: [],
      supportNeeds: [],
      createdBy: profile.id
    })

    onCaseCreated?.(newCase)
  }

  const handleSelectBuilding = (apn: string) => {
    setSelectedBuildingApn(apn)
    setShowBuildingDropdown(false)
    const building = allBuildings.find(b => b.apn === apn)
    if (building) {
      setBuildingSearch(building.address)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900">{t('eviction.reportCase')}</h3>
        <p className="text-sm text-gray-600 mt-1">{t('eviction.addNewCase')}</p>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Tenant Section */}
        <fieldset className="border border-gray-200 rounded-lg p-4">
          <legend className="text-sm font-semibold text-gray-900">{t('eviction.tenantInfo')}</legend>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('eviction.tenantName')} *</label>
            <input
              type="text"
              value={tenantName}
              onChange={e => setTenantName(e.target.value)}
              placeholder={t('eviction.fullName')}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              required
            />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={anonymousDisplay}
              onChange={e => setAnonymousDisplay(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="anonymous" className="text-sm text-gray-700">
              {t('eviction.displayAnonymously')}
            </label>
          </div>
        </fieldset>

        {/* Building Section */}
        <fieldset className="border border-gray-200 rounded-lg p-4">
          <legend className="text-sm font-semibold text-gray-900">{t('eviction.building')}</legend>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('eviction.buildingAddress')} *</label>
            {initialBuilding ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm font-medium text-gray-900">{initialBuilding.address}</p>
                {initialBuilding.propertyName && (
                  <p className="text-xs text-gray-600">{initialBuilding.propertyName}</p>
                )}
                <p className="text-xs text-blue-600 mt-1">{t('eviction.buildingPreselected')}</p>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={buildingSearch}
                  onChange={e => {
                    setBuildingSearch(e.target.value)
                    setShowBuildingDropdown(true)
                  }}
                  onFocus={() => setShowBuildingDropdown(true)}
                  placeholder={t('eviction.searchBuilding')}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  required
                />
                {showBuildingDropdown && filteredBuildings.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                    {filteredBuildings.map(building => (
                      <button
                        key={building.apn}
                        type="button"
                        onClick={() => handleSelectBuilding(building.apn)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <p className="text-sm font-medium text-gray-900">{building.address}</p>
                        {building.propertyName && (
                          <p className="text-xs text-gray-600">{building.propertyName}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedBuilding && !initialBuilding && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
              {t('eviction.selected')}: {selectedBuilding.address} ({selectedBuilding.units} {t('eviction.units')})
            </div>
          )}

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('eviction.unitNumber')}</label>
            <input
              type="text"
              value={unitNumber}
              onChange={e => setUnitNumber(e.target.value)}
              placeholder={t('eviction.unitExample')}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </fieldset>

        {/* Case Details */}
        <fieldset className="border border-gray-200 rounded-lg p-4">
          <legend className="text-sm font-semibold text-gray-900">{t('eviction.caseDetails')}</legend>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('eviction.evictionType')} *</label>
            <select
              value={caseType}
              onChange={e => setCaseType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              required
            >
              <option value="nonpayment">{t('eviction.nonpayment')}</option>
              <option value="lease_violation">{t('eviction.leaseViolation')}</option>
              <option value="no_cause">{t('eviction.noCause')}</option>
              <option value="other">{t('eviction.other')}</option>
            </select>
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('eviction.noticeType')} *</label>
            <select
              value={noticeType}
              onChange={e => setNoticeType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              required
            >
              <option value="3-day">{t('eviction.3dayNotice')}</option>
              <option value="5-day">{t('eviction.5dayNotice')}</option>
              <option value="7-day">{t('eviction.7dayNotice')}</option>
              <option value="30-day">{t('eviction.30dayNotice')}</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {t('eviction.viewStatute')}:{' '}
              <LegislationLink citation="NRS 40.253" className="text-xs" /> (3-day),{' '}
              <LegislationLink citation="NRS 40.2514" className="text-xs" /> (5-day),{' '}
              <LegislationLink citation="NRS 40.2516" className="text-xs" /> (7-day),{' '}
              <LegislationLink citation="NRS 40.251" className="text-xs" /> (30-day)
            </p>
          </div>
        </fieldset>

        {/* Dates Section */}
        <fieldset className="border border-gray-200 rounded-lg p-4">
          <legend className="text-sm font-semibold text-gray-900">{t('eviction.importantDates')}</legend>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('eviction.noticeReceivedDate')} *</label>
            <input
              type="date"
              value={noticeReceivedDate}
              onChange={e => setNoticeReceivedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              required
            />
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('eviction.caseFiledDate')}</label>
            <input
              type="date"
              value={filingDate}
              onChange={e => setFilingDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('eviction.courtDate')}</label>
            <input
              type="date"
              value={courtDate}
              onChange={e => setCourtDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">{t('eviction.courtDateCalc')}</p>
          </div>
        </fieldset>
      </div>

      {/* Footer Buttons */}
      <div className="border-t border-gray-200 bg-gray-50 p-4 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-100"
        >
          {t('eviction.cancel')}
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="flex-1 px-4 py-2 bg-rstu-red text-white rounded font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {t('eviction.createCase')}
        </button>
      </div>
    </form>
  )
}
