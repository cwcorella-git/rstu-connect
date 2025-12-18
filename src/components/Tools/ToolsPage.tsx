'use client'

import { useState, useEffect } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import { UnitTracker } from './UnitTracker'
import { UnitIntakeForm } from './UnitIntakeForm'
import { getBuildingStats, type UnitRecord } from '@/lib/canvassStorage'
import { trackActivity } from '@/lib/profileStorage'

interface ToolsPageProps {
  buildings: EnhancedBuilding[]
}

export function ToolsPage({ buildings }: ToolsPageProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<EnhancedBuilding | null>(null)
  const [selectedUnit, setSelectedUnit] = useState<UnitRecord | null>(null)
  const [toolsMobileView, setToolsMobileView] = useState<'buildings' | 'units'>('buildings')
  const [refreshKey, setRefreshKey] = useState(0)

  // Building stats for progress display
  const [buildingStats, setBuildingStats] = useState<Record<string, { total: number; contacted: number }>>({})

  // Track tools usage
  useEffect(() => {
    trackActivity('tools')
  }, [])

  // Load stats for all buildings
  useEffect(() => {
    const stats: Record<string, { total: number; contacted: number }> = {}
    for (const building of buildings) {
      const s = getBuildingStats(building.chatSlug)
      stats[building.chatSlug] = { total: s.total, contacted: s.contacted }
    }
    setBuildingStats(stats)
  }, [buildings, refreshKey])

  const handleUnitSave = () => {
    setRefreshKey(k => k + 1)
  }

  return (
    <>
      <div className="flex flex-col md:flex-row overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
        {/* Mobile View Toggle */}
        <div className="md:hidden flex border-b border-gray-200 bg-white flex-shrink-0">
          <button
            onClick={() => setToolsMobileView('buildings')}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
              toolsMobileView === 'buildings'
                ? 'border-rstu-red text-rstu-red'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Buildings
          </button>
          <button
            onClick={() => setToolsMobileView('units')}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
              toolsMobileView === 'units'
                ? 'border-rstu-red text-rstu-red'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Canvassing
          </button>
        </div>

        {/* Left: Building Selector */}
        <div className={`${toolsMobileView === 'buildings' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-2/5 min-h-0 h-full overflow-hidden border-r border-gray-200 bg-white`}>
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-900">Canvassing Tools</h2>
            <p className="text-sm text-gray-500 mt-1">Select a building to track tenant outreach</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {buildings.map((building) => {
                const stats = buildingStats[building.chatSlug] || { total: 0, contacted: 0 }
                const progressPercent = stats.total > 0 ? Math.round((stats.contacted / stats.total) * 100) : 0

                return (
                  <li key={building.apn}>
                    <button
                      onClick={() => {
                        setSelectedBuilding(building)
                        setToolsMobileView('units')
                      }}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedBuilding?.apn === building.apn ? 'bg-red-50 border-l-4 border-rstu-red' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-900 text-sm">
                        {building.address.split(',')[0]}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {building.units} units &middot; {building.owner.split(' ').slice(0, 3).join(' ')}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rstu-red rounded-full transition-all"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          {stats.total > 0 ? `${stats.contacted}/${stats.total}` : 'No units'}
                        </span>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* Right: Unit Tracker */}
        <div className={`${toolsMobileView === 'units' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-3/5 min-h-0 h-full overflow-hidden bg-white`}>
          {selectedBuilding ? (
            <UnitTracker
              key={`${selectedBuilding.chatSlug}-${refreshKey}`}
              building={selectedBuilding}
              onSelectUnit={(unit) => setSelectedUnit(unit)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p>Select a building to start canvassing</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unit Intake Form Modal */}
      {selectedUnit && selectedBuilding && (
        <UnitIntakeForm
          buildingId={selectedBuilding.chatSlug}
          buildingAddress={selectedBuilding.address}
          unit={selectedUnit}
          onClose={() => setSelectedUnit(null)}
          onSave={handleUnitSave}
        />
      )}
    </>
  )
}
