'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import type { EnhancedBuilding } from '@/lib/data/getBuildingsData'
import {
  getBuildingCanvass,
  initBuildingCanvass,
  addUnits,
  parseUnitRange,
  type UnitRecord,
  type ContactStatus,
} from '@/lib/storage/canvassStorage'
import { QuickEntrySheet } from './QuickEntrySheet'

interface CanvassingFieldModeProps {
  building: EnhancedBuilding
  onBack?: () => void
}

// Status config for visual display
const STATUS_CONFIG: Record<ContactStatus, { bg: string; icon: string; label: string }> = {
  NOT_CONTACTED: { bg: 'bg-gray-100', icon: '○', label: 'Not contacted' },
  NO_ANSWER: { bg: 'bg-yellow-100', icon: '!', label: 'No answer' },
  CONTACTED: { bg: 'bg-blue-100', icon: '📞', label: 'Contacted' },
  INTERESTED: { bg: 'bg-green-100', icon: '✓', label: 'Interested' },
  NOT_INTERESTED: { bg: 'bg-red-100', icon: '✗', label: 'Not interested' },
  FOLLOW_UP: { bg: 'bg-orange-100', icon: '?', label: 'Come back' },
  ACTIVE_MEMBER: { bg: 'bg-purple-100', icon: '★', label: 'Active member' },
}

export function CanvassingFieldMode({ building, onBack }: CanvassingFieldModeProps) {
  const { t } = useLanguage()
  const [units, setUnits] = useState<Record<string, UnitRecord>>({})
  const [selectedUnit, setSelectedUnit] = useState<UnitRecord | null>(null)
  const [showAddUnits, setShowAddUnits] = useState(false)
  const [unitRangeInput, setUnitRangeInput] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  // Load canvass data
  useEffect(() => {
    const canvass = getBuildingCanvass(building.chatSlug)
    if (canvass) {
      setUnits(canvass.units)
    } else {
      // Initialize empty canvass
      initBuildingCanvass(building.chatSlug, building.address)
      setUnits({})
    }
  }, [building.chatSlug, building.address, refreshKey])

  // Calculate stats
  const stats = useMemo(() => {
    const unitList = Object.values(units)
    const total = unitList.length
    const contacted = unitList.filter(u =>
      u.status !== 'NOT_CONTACTED' && u.status !== 'NO_ANSWER'
    ).length
    const interested = unitList.filter(u => u.status === 'INTERESTED').length
    const noAnswer = unitList.filter(u => u.status === 'NO_ANSWER').length
    const followUp = unitList.filter(u => u.status === 'FOLLOW_UP').length
    const activeMembers = unitList.filter(u => u.status === 'ACTIVE_MEMBER').length
    const notInterested = unitList.filter(u => u.status === 'NOT_INTERESTED').length
    const percent = total > 0 ? Math.round((contacted / total) * 100) : 0

    return { total, contacted, interested, noAnswer, followUp, activeMembers, notInterested, percent }
  }, [units])

  // Sort units naturally (1, 2, 10, 101, 102, 201, etc.)
  const sortedUnits = useMemo(() => {
    return Object.values(units).sort((a, b) => {
      const numA = parseInt(a.unitNumber.replace(/\D/g, '')) || 0
      const numB = parseInt(b.unitNumber.replace(/\D/g, '')) || 0
      if (numA !== numB) return numA - numB
      return a.unitNumber.localeCompare(b.unitNumber)
    })
  }, [units])

  // Handle adding units
  const handleAddUnits = useCallback(() => {
    if (!unitRangeInput.trim()) return
    const parsed = parseUnitRange(unitRangeInput)
    if (parsed.length > 0) {
      addUnits(building.chatSlug, parsed)
      setUnitRangeInput('')
      setShowAddUnits(false)
      setRefreshKey(k => k + 1)
    }
  }, [building.chatSlug, unitRangeInput])

  // Handle unit selection
  const handleSelectUnit = useCallback((unit: UnitRecord) => {
    setSelectedUnit(unit)
  }, [])

  // Handle save from quick entry sheet
  const handleSave = useCallback(() => {
    setRefreshKey(k => k + 1)
    setSelectedUnit(null)
  }, [])

  // Handle advancing to next uncontacted unit
  const handleNextUnit = useCallback(() => {
    // Find next uncontacted unit after current
    const currentIdx = sortedUnits.findIndex(u => u.unitNumber === selectedUnit?.unitNumber)
    for (let i = currentIdx + 1; i < sortedUnits.length; i++) {
      if (sortedUnits[i].status === 'NOT_CONTACTED') {
        setRefreshKey(k => k + 1)
        setSelectedUnit(sortedUnits[i])
        return
      }
    }
    // Wrap around to beginning
    for (let i = 0; i < currentIdx; i++) {
      if (sortedUnits[i].status === 'NOT_CONTACTED') {
        setRefreshKey(k => k + 1)
        setSelectedUnit(sortedUnits[i])
        return
      }
    }
    // No more uncontacted units
    setRefreshKey(k => k + 1)
    setSelectedUnit(null)
  }, [sortedUnits, selectedUnit])

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1 -ml-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 className="font-semibold text-gray-900 truncate">
              {building.address.split(',')[0]}
            </h2>
          </div>
          <button
            onClick={() => setShowAddUnits(true)}
            className="text-xs font-medium text-rstu-red hover:text-red-700"
          >
            + {t('fieldMode.addUnits')}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>

        {/* Stats summary */}
        <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
          <span className="font-medium">{stats.percent}% {t('fieldMode.contacted')}</span>
          <span>{stats.contacted}/{stats.total} {t('fieldMode.units')}</span>
          {stats.interested > 0 && (
            <span className="text-green-600">{stats.interested} {t('fieldMode.interested')}</span>
          )}
          {stats.noAnswer > 0 && (
            <span className="text-yellow-600">{stats.noAnswer} {t('fieldMode.noAnswer')}</span>
          )}
          {stats.followUp > 0 && (
            <span className="text-orange-600">{stats.followUp} {t('fieldMode.followUp')}</span>
          )}
        </div>
      </div>

      {/* Unit grid */}
      {stats.total === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('fieldMode.noUnitsYet')}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {t('fieldMode.addUnitsToStart')}
          </p>
          <button
            onClick={() => setShowAddUnits(true)}
            className="px-4 py-2 bg-rstu-red text-white text-sm font-medium rounded-lg hover:bg-red-700"
          >
            {t('fieldMode.addUnits')}
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {sortedUnits.map((unit) => {
              const config = STATUS_CONFIG[unit.status]
              return (
                <button
                  key={unit.unitNumber}
                  onClick={() => handleSelectUnit(unit)}
                  className={`aspect-square ${config.bg} rounded-lg flex flex-col items-center justify-center p-1 hover:ring-2 hover:ring-rstu-red hover:ring-offset-1 transition-all active:scale-95`}
                >
                  <span className="text-xs font-medium text-gray-700 truncate w-full text-center">
                    {unit.unitNumber}
                  </span>
                  <span className="text-lg leading-none mt-0.5">
                    {config.icon}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2 justify-center text-[10px]">
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <div key={status} className="flex items-center gap-1">
                  <span className={`w-4 h-4 ${config.bg} rounded flex items-center justify-center text-xs`}>
                    {config.icon}
                  </span>
                  <span className="text-gray-500">{config.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Units Modal */}
      {showAddUnits && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full sm:w-96 sm:rounded-xl rounded-t-xl p-4 sm:m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{t('fieldMode.addUnits')}</h3>
              <button
                onClick={() => setShowAddUnits(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              type="text"
              value={unitRangeInput}
              onChange={(e) => setUnitRangeInput(e.target.value)}
              placeholder={t('fieldMode.unitRangePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red mb-2"
              autoFocus
            />
            <p className="text-xs text-gray-500 mb-4">
              {t('fieldMode.unitRangeHint')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddUnits(false)}
                className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleAddUnits}
                disabled={!unitRangeInput.trim()}
                className="flex-1 py-2 text-sm font-medium text-white bg-rstu-red rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Entry Sheet */}
      {selectedUnit && (
        <QuickEntrySheet
          buildingId={building.chatSlug}
          buildingAddress={building.address}
          unit={selectedUnit}
          onClose={() => {
            setRefreshKey(k => k + 1)
            setSelectedUnit(null)
          }}
          onSave={handleSave}
          onNext={handleNextUnit}
        />
      )}
    </div>
  )
}
