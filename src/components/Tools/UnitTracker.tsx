'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import { DataNotesPanel } from './DataNotesPanel'
import {
  getBuildingCanvass,
  initBuildingCanvass,
  addUnits,
  parseUnitRange,
  deleteUnit,
  getStatusLabel,
  getStatusColor,
  type UnitRecord,
  type ContactStatus,
} from '@/lib/canvassStorage'

interface UnitTrackerProps {
  building: EnhancedBuilding
  onSelectUnit: (unit: UnitRecord) => void
}

export function UnitTracker({ building, onSelectUnit }: UnitTrackerProps) {
  const { t } = useLanguage()
  const [units, setUnits] = useState<UnitRecord[]>([])
  const [addUnitInput, setAddUnitInput] = useState('')
  const [filterStatus, setFilterStatus] = useState<ContactStatus | 'ALL'>('ALL')
  const [sortBy, setSortBy] = useState<'unit' | 'status' | 'updated'>('unit')

  // Load units for this building
  useEffect(() => {
    loadUnits()
  }, [building.chatSlug])

  const loadUnits = () => {
    const canvass = getBuildingCanvass(building.chatSlug)
    if (canvass) {
      setUnits(Object.values(canvass.units))
    } else {
      setUnits([])
    }
  }

  const handleAddUnits = () => {
    if (!addUnitInput.trim()) return

    // Initialize building if needed
    initBuildingCanvass(building.chatSlug, building.address)

    // Parse and add units
    const unitNumbers = parseUnitRange(addUnitInput)
    if (unitNumbers.length > 0) {
      addUnits(building.chatSlug, unitNumbers)
      loadUnits()
      setAddUnitInput('')
    }
  }

  const handleDeleteUnit = (unitNumber: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(t('tools.deleteUnitMsg') || `Delete unit ${unitNumber}?`)) {
      deleteUnit(building.chatSlug, unitNumber)
      loadUnits()
    }
  }

  // Filter and sort units
  const filteredUnits = units
    .filter(unit => filterStatus === 'ALL' || unit.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'unit') {
        return a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true })
      } else if (sortBy === 'status') {
        return a.status.localeCompare(b.status)
      } else {
        return (b.updated || 0) - (a.updated || 0)
      }
    })

  // Stats
  const stats = {
    total: units.length,
    contacted: units.filter(u => !['NOT_CONTACTED', 'NO_ANSWER'].includes(u.status)).length,
    interested: units.filter(u => u.status === 'INTERESTED').length,
    active: units.filter(u => u.status === 'ACTIVE_MEMBER').length,
    // New stats
    habitability: units.filter(u => u.habitabilityIssues && u.habitabilityIssues.length > 0).length,
    subsidized: units.filter(u => u.subsidyType && u.subsidyType !== 'none').length,
  }

  return (
    <div className="flex flex-col h-full">
      {/* Stats Bar */}
      {units.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200 flex-shrink-0 bg-gray-50">
          <div className="flex gap-4 text-xs">
            <div className="text-gray-600">
              <span className="font-medium">{stats.total}</span> {t('tools.tracked') || 'tracked'}
            </div>
            <div className="text-blue-600">
              <span className="font-medium">{stats.contacted}</span> {t('tools.contacted') || 'contacted'}
            </div>
            <div className="text-green-600">
              <span className="font-medium">{stats.interested}</span> {t('tools.interested') || 'interested'}
            </div>
            <div className="text-purple-600">
              <span className="font-medium">{stats.active}</span> {t('tools.allStatus') || 'active'}
            </div>
            {stats.habitability > 0 && (
              <div className="text-red-600">
                <span className="font-medium">{stats.habitability}</span> {t('common.issues') || 'w/ issues'}
              </div>
            )}
            {stats.subsidized > 0 && (
              <div className="text-blue-600">
                <span className="font-medium">{stats.subsidized}</span> {t('common.subsidized') || 'subsidized'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Units Section */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={addUnitInput}
            onChange={(e) => setAddUnitInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddUnits()}
            placeholder={t('tools.unitPlaceholder') || "Unit # (e.g., 101 or 101-150)"}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
          />
          <button
            onClick={handleAddUnits}
            disabled={!addUnitInput.trim()}
            className="px-4 py-2 bg-rstu-red text-white rounded-md text-sm font-medium hover:bg-rstu-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.add') || 'Add'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">{t('tools.unitHelp') || 'Enter single unit, range (101-150), or comma-separated'}</p>
      </div>

      {/* Data Notes Panel - for noting discrepancies */}
      <DataNotesPanel building={building} />

      {/* Filter & Sort */}
      {units.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-4 flex-shrink-0 bg-gray-50">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ContactStatus | 'ALL')}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="ALL">{t('tools.allStatus') || 'All Status'}</option>
            <option value="NOT_CONTACTED">{t('tools.notContacted') || 'Not Contacted'}</option>
            <option value="NO_ANSWER">{t('tools.noAnswer') || 'No Answer'}</option>
            <option value="CONTACTED">{t('tools.contacted') || 'Contacted'}</option>
            <option value="INTERESTED">{t('tools.interested') || 'Interested'}</option>
            <option value="NOT_INTERESTED">{t('tools.notInterested') || 'Not Interested'}</option>
            <option value="FOLLOW_UP">{t('tools.followUp') || 'Follow Up'}</option>
            <option value="ACTIVE_MEMBER">{t('tools.activeMember') || 'Active Member'}</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'unit' | 'status' | 'updated')}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="unit">{t('tools.sortByUnit') || 'Sort by Unit'}</option>
            <option value="status">{t('tools.sortByStatus') || 'Sort by Status'}</option>
            <option value="updated">{t('tools.sortByUpdated') || 'Sort by Updated'}</option>
          </select>

          <span className="text-xs text-gray-500 ml-auto">
            {filteredUnits.length} / {units.length}
          </span>
        </div>
      )}

      {/* Unit List */}
      <div className="flex-1 overflow-y-auto">
        {units.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">{t('tools.noUnitsAdded') || 'No units added yet'}</p>
            <p className="text-xs mt-1">{t('tools.noUnitsHelp') || 'Add units above to start tracking tenant outreach'}</p>
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">{t('tools.noUnitsMatch') || 'No units match filter'}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredUnits.map((unit) => (
              <li key={unit.unitNumber}>
                <button
                  onClick={() => onSelectUnit(unit)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  {/* Unit Number */}
                  <div className="w-16 font-mono font-medium text-gray-900">
                    {unit.unitNumber}
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(unit.status)}`}>
                    {getStatusLabel(unit.status)}
                  </span>

                  {/* Info Pills */}
                  <div className="flex-1 flex items-center gap-2 text-xs text-gray-500">
                    {unit.name && (
                      <span className="truncate max-w-[100px]">{unit.name}</span>
                    )}
                    {unit.rentAmount && (
                      <span>${unit.rentAmount}/mo</span>
                    )}
                    {/* Habitability indicator */}
                    {unit.habitabilityIssues && unit.habitabilityIssues.length > 0 && (
                      <span
                        className="text-red-600 font-medium"
                        title={`Issues: ${unit.habitabilityIssues.join(', ')}`}
                      >
                        ⚠ {unit.habitabilityIssues.length}
                      </span>
                    )}
                    {/* Subsidy indicator */}
                    {unit.subsidyType && unit.subsidyType !== 'none' && (
                      <span
                        className="px-1 bg-blue-100 text-blue-700 rounded text-[10px]"
                        title={unit.subsidyDetails || unit.subsidyType}
                      >
                        {unit.subsidyType === 'section8' ? 'S8' :
                         unit.subsidyType === 'lihtc' ? 'LIHTC' : 'SUB'}
                      </span>
                    )}
                    {/* Utilities indicator */}
                    {unit.utilitiesIncluded && unit.utilitiesIncluded.length > 0 && (
                      <span
                        className="text-green-600"
                        title={`Utilities: ${unit.utilitiesIncluded.join(', ')}`}
                      >
                        U:{unit.utilitiesIncluded.length}
                      </span>
                    )}
                    {unit.complaints.length > 0 && (
                      <span className="text-red-500">{unit.complaints.length} complaint{unit.complaints.length > 1 ? 's' : ''}</span>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteUnit(unit.unitNumber, e)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title={t('tools.deleteUnit') || 'Delete unit'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
