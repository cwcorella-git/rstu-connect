'use client'

import { useState, useEffect, useMemo } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import { ToolsHeader } from './ToolsHeader'
import { UnitTracker } from './UnitTracker'
import { UnitIntakeForm } from './UnitIntakeForm'
import { PowerMap } from './PowerMap'
import { getBuildingStats, getBuildingDiscrepancies, type UnitRecord } from '@/lib/canvassStorage'
import { trackActivity } from '@/lib/profileStorage'
import { getLinkedGroups, type LinkedPropertyGroup } from '@/lib/linkedPropertiesStorage'
import { getBuildingDemands } from '@/lib/buildingOrganizingStorage'

type ToolsTab = 'canvassing' | 'powermap'

// Key for storing the landlord to navigate to in Power Map
const POWER_MAP_LANDLORD_KEY = 'rstu_powermap_landlord'

interface ToolsPageProps {
  buildings: EnhancedBuilding[]
}

export function ToolsPage({ buildings }: ToolsPageProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<EnhancedBuilding | null>(null)
  const [selectedUnit, setSelectedUnit] = useState<UnitRecord | null>(null)
  const [toolsMobileView, setToolsMobileView] = useState<'buildings' | 'units'>('buildings')
  const [activeToolsTab, setActiveToolsTab] = useState<ToolsTab>('canvassing')
  const [refreshKey, setRefreshKey] = useState(0)
  const [isDesktop, setIsDesktop] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [initialLandlord, setInitialLandlord] = useState<string | undefined>(undefined)

  // Building stats for progress display
  const [buildingStats, setBuildingStats] = useState<Record<string, { total: number; contacted: number; hasNotes: boolean; demands: number }>>({})
  const [linkedGroups, setLinkedGroups] = useState<LinkedPropertyGroup[]>([])

  // Track tools usage
  useEffect(() => {
    trackActivity('tools')
  }, [])

  // Check for landlord navigation from PropertyInfoTab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLandlord = localStorage.getItem(POWER_MAP_LANDLORD_KEY)
      if (storedLandlord) {
        setInitialLandlord(storedLandlord)
        setActiveToolsTab('powermap')
        // Clear the stored value
        localStorage.removeItem(POWER_MAP_LANDLORD_KEY)
      }
    }
  }, [])

  // Detect desktop/mobile
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Load linked groups
  useEffect(() => {
    setLinkedGroups(getLinkedGroups())
  }, [])

  // Create a lookup map for linked groups by APN (avoids calling storage during render)
  const linkedGroupByApn = useMemo(() => {
    const map = new Map<string, LinkedPropertyGroup>()
    for (const group of linkedGroups) {
      for (const apn of group.apns) {
        map.set(apn, group)
      }
    }
    return map
  }, [linkedGroups])

  // Load stats for all buildings (including demands)
  useEffect(() => {
    const stats: Record<string, { total: number; contacted: number; hasNotes: boolean; demands: number }> = {}
    for (const building of buildings) {
      const s = getBuildingStats(building.chatSlug)
      const discrepancies = getBuildingDiscrepancies(building.chatSlug)
      const hasNotes = !!(discrepancies?.notes?.trim())
      const demands = getBuildingDemands(building.chatSlug)
      stats[building.chatSlug] = { total: s.total, contacted: s.contacted, hasNotes, demands: demands.length }
    }
    setBuildingStats(stats)
  }, [buildings, refreshKey])

  // Filter buildings based on search
  const filteredBuildings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return buildings

    return buildings.filter(b =>
      b.address.toLowerCase().includes(query) ||
      b.owner.toLowerCase().includes(query) ||
      b.propertyName?.toLowerCase().includes(query) ||
      b.apn.includes(query)
    )
  }, [buildings, searchQuery])

  const handleUnitSave = () => {
    setRefreshKey(k => k + 1)
  }

  // Handle navigation from Power Map to a specific building
  const handlePowerMapSelectBuilding = (chatSlug: string) => {
    const building = buildings.find(b => b.chatSlug === chatSlug)
    if (building) {
      setSelectedBuilding(building)
      setActiveToolsTab('canvassing')
      setToolsMobileView('units')
    }
  }

  // Tab switcher component
  const TabSwitcher = () => (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setActiveToolsTab('canvassing')}
        className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors ${
          activeToolsTab === 'canvassing'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Canvassing
      </button>
      <button
        onClick={() => setActiveToolsTab('powermap')}
        className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors ${
          activeToolsTab === 'powermap'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Power Map
      </button>
    </div>
  )

  // Power Map view takes full width
  if (activeToolsTab === 'powermap') {
    return (
      <div className="flex flex-col overflow-hidden bg-white" style={{ height: 'calc(100vh - 140px)' }}>
        {/* Header with tabs */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Organizer Tools</h2>
          <TabSwitcher />
        </div>

        {/* Power Map content */}
        <div className="flex-1 overflow-hidden">
          <PowerMap
            buildings={buildings}
            onSelectBuilding={handlePowerMapSelectBuilding}
            initialLandlord={initialLandlord}
          />
        </div>
      </div>
    )
  }

  // Canvassing view (default)
  return (
    <>
      <div className="flex flex-col md:flex-row overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
        {/* Left: Building Selector - hidden on mobile when building is selected */}
        <div className={`${toolsMobileView === 'buildings' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-2/5 min-h-0 h-full overflow-hidden border-r border-gray-200 bg-white`}>
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Organizer Tools</h2>

            {/* Tabs */}
            <TabSwitcher />

            <p className="text-sm text-gray-500 mt-3 mb-3">Select a property to track tenant outreach</p>
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by address, owner, or name..."
                className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {searchQuery
                ? `${filteredBuildings.length} of ${buildings.length} properties`
                : `${buildings.length} properties`
              }
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {filteredBuildings.map((building) => {
                const stats = buildingStats[building.chatSlug] || { total: 0, contacted: 0, hasNotes: false, demands: 0 }
                const progressPercent = stats.total > 0 ? Math.round((stats.contacted / stats.total) * 100) : 0
                const linkedGroup = linkedGroupByApn.get(building.apn)

                return (
                  <li key={building.apn}>
                    <button
                      onClick={() => {
                        setSelectedBuilding(building)
                        setToolsMobileView('units')
                      }}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors relative ${
                        selectedBuilding?.apn === building.apn ? 'bg-red-50 border-l-4 border-rstu-red' : ''
                      }`}
                    >
                      <div className="absolute top-3 right-3 flex gap-1">
                        {linkedGroup && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-700"
                            title={`Linked: ${linkedGroup.name}`}
                          >
                            Linked
                          </span>
                        )}
                        {stats.hasNotes && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-700"
                            title="Has notes"
                          >
                            Notes
                          </span>
                        )}
                      </div>
                      <div className="font-medium text-gray-900 text-sm pr-20">
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
                      {/* Demands row */}
                      {stats.demands > 0 && (
                        <div className="mt-1.5 flex items-center gap-1">
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs text-green-600 font-medium">
                            {stats.demands} approved demand{stats.demands !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* Right: Unit Tracker - full screen on mobile with back button */}
        <div className={`${toolsMobileView === 'units' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-3/5 min-h-0 h-full overflow-hidden bg-white`}>
          {selectedBuilding ? (
            <>
              <ToolsHeader
                building={selectedBuilding}
                showBackButton={!isDesktop}
                onBack={() => setToolsMobileView('buildings')}
              />
              <UnitTracker
                key={`${selectedBuilding.chatSlug}-${refreshKey}`}
                building={selectedBuilding}
                onSelectUnit={(unit) => setSelectedUnit(unit)}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p>Select a property to start canvassing</p>
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
