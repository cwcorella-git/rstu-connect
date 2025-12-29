'use client'

import { useState, useEffect, useMemo, useDeferredValue, useRef } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import { ToolsHeader } from './ToolsHeader'
import { UnitTracker } from './UnitTracker'
import { UnitIntakeForm } from './UnitIntakeForm'
import { LandlordList } from './PowerMap/LandlordList'
import { LandlordDetail } from './PowerMap/LandlordDetail'
import { TaskBoard } from '@/components/Tasks'
import { getBuildingStats, getBuildingDiscrepancies, type UnitRecord, getAllBuildingsWithData } from '@/lib/canvassStorage'
import { getAllLandlords, type LandlordProfile } from '@/lib/landlordProfileStorage'
import { trackActivity } from '@/lib/profileStorage'
import { getLinkedGroups, type LinkedPropertyGroup } from '@/lib/linkedPropertiesStorage'
import { getBuildingDemands } from '@/lib/buildingOrganizingStorage'
import { getFavorites, toggleFavorite } from '@/lib/favoritesStorage'
import { searchProperties, USE_SUPABASE, PropertySearchResult } from '@/lib/supabase'

// Compressed property format from all-properties.json
interface CompressedProperty {
  a: string;  // apn
  d: string;  // address
  o: string;  // owner
  u: number;  // units
  v: number | null;  // value
  y: number | null;  // yearBuilt
  z: string | null;  // zoning
  l: string | null;  // landUseCode
}

// Generate a chat slug from an address
function generateChatSlug(address: string): string {
  return 'rstu-' + address
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// Expand compressed property to minimal EnhancedBuilding
function expandProperty(p: CompressedProperty): EnhancedBuilding {
  return {
    apn: p.a,
    address: p.d,
    owner: p.o,
    units: p.u,
    value: p.v || 0,
    yearBuilt: p.y,
    sqft: null,
    chatSlug: generateChatSlug(p.d),
    zoning: p.z || undefined,
    landUseCode: p.l || undefined,
  } as EnhancedBuilding;
}

// Convert Supabase search result to EnhancedBuilding
function searchResultToBuilding(result: PropertySearchResult): EnhancedBuilding {
  return {
    apn: result.apn,
    address: result.address,
    owner: result.owner,
    units: result.units,
    value: result.value || 0,
    yearBuilt: result.year_built,
    sqft: null,
    chatSlug: result.chat_slug || generateChatSlug(result.address),
    propertyName: result.name || undefined,
    latitude: result.lat || undefined,
    longitude: result.lon || undefined,
  } as EnhancedBuilding;
}

type ToolsTab = 'canvassing' | 'powermap' | 'tasks'

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
  const [inputValue, setInputValue] = useState('')
  const searchQuery = useDeferredValue(inputValue)
  const [selectedLandlord, setSelectedLandlord] = useState<LandlordProfile | null>(null)

  // Building stats for progress display
  const [buildingStats, setBuildingStats] = useState<Record<string, { total: number; contacted: number; hasNotes: boolean; demands: number }>>({})
  const [linkedGroups, setLinkedGroups] = useState<LinkedPropertyGroup[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // All properties for full search (like BuildingList)
  const [allProperties, setAllProperties] = useState<CompressedProperty[]>([])
  const [searchResults, setSearchResults] = useState<EnhancedBuilding[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [buildingsWithData, setBuildingsWithData] = useState<Set<string>>(new Set())
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Track tools usage
  useEffect(() => {
    trackActivity('tools')
  }, [])

  // Compute all landlord profiles for Power Map
  const landlords = useMemo(() => getAllLandlords(buildings), [buildings])

  // Check for landlord navigation from PropertyInfoTab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLandlord = localStorage.getItem(POWER_MAP_LANDLORD_KEY)
      if (storedLandlord) {
        // Find and select the landlord
        const found = landlords.find(
          l => l.ownerName.toLowerCase() === storedLandlord.toLowerCase()
        )
        if (found) {
          setSelectedLandlord(found)
          setToolsMobileView('units')
        }
        setActiveToolsTab('powermap')
        // Clear the stored value
        localStorage.removeItem(POWER_MAP_LANDLORD_KEY)
      }
    }
  }, [landlords])

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

  // Load favorites
  useEffect(() => {
    setFavorites(getFavorites())
  }, [])

  // Load all properties for full search (like BuildingList)
  useEffect(() => {
    const basePath = process.env.NODE_ENV === 'production' ? '/rstu-connect' : ''
    fetch(`${basePath}/data/all-properties.json`)
      .then(res => res.json())
      .then(data => {
        setAllProperties(data.p || [])
      })
      .catch(err => {
        console.error('Failed to load all properties:', err)
      })
  }, [])

  // Load buildings that have canvass data
  useEffect(() => {
    const withData = getAllBuildingsWithData()
    setBuildingsWithData(new Set(withData))
  }, [refreshKey])

  // Debounced search (searches ALL properties when typing)
  useEffect(() => {
    const query = searchQuery.trim()

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // If no query, clear search results
    if (!query) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    // Debounce search by 300ms
    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      if (USE_SUPABASE) {
        // Use Supabase FTS
        const results = await searchProperties(query, 50)
        if (results.length > 0) {
          setSearchResults(results.map(searchResultToBuilding))
          setIsSearching(false)
          return
        }
      }

      // Fallback to client-side search
      const queryLower = query.toLowerCase()
      const results: EnhancedBuilding[] = []

      // Search featured buildings first
      for (const building of buildings) {
        if (
          building.address.toLowerCase().includes(queryLower) ||
          building.owner.toLowerCase().includes(queryLower) ||
          building.apn.includes(query)
        ) {
          results.push(building)
        }
      }

      // Then search all properties
      const featuredApns = new Set(results.map(b => b.apn))
      for (const p of allProperties) {
        if (featuredApns.has(p.a)) continue
        if (
          p.d.toLowerCase().includes(queryLower) ||
          p.o.toLowerCase().includes(queryLower) ||
          p.a.includes(query)
        ) {
          results.push(expandProperty(p))
          if (results.length >= 50) break
        }
      }

      setSearchResults(results)
      setIsSearching(false)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, buildings, allProperties])

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

  // Load stats for all buildings (featured + any with canvass data)
  useEffect(() => {
    const stats: Record<string, { total: number; contacted: number; hasNotes: boolean; demands: number }> = {}

    // Stats for featured buildings
    for (const building of buildings) {
      const s = getBuildingStats(building.chatSlug)
      const discrepancies = getBuildingDiscrepancies(building.chatSlug)
      const hasNotes = !!(discrepancies?.notes?.trim())
      const demands = getBuildingDemands(building.chatSlug)
      stats[building.chatSlug] = { total: s.total, contacted: s.contacted, hasNotes, demands: demands.length }
    }

    // Stats for any other buildings with canvass data
    Array.from(buildingsWithData).forEach(chatSlug => {
      if (!stats[chatSlug]) {
        const s = getBuildingStats(chatSlug)
        const discrepancies = getBuildingDiscrepancies(chatSlug)
        const hasNotes = !!(discrepancies?.notes?.trim())
        const demands = getBuildingDemands(chatSlug)
        stats[chatSlug] = { total: s.total, contacted: s.contacted, hasNotes, demands: demands.length }
      }
    })

    setBuildingStats(stats)
  }, [buildings, buildingsWithData, refreshKey])

  // Get buildings with canvass data that aren't in featured list
  const canvassedNonFeatured = useMemo(() => {
    const featuredSlugs = new Set(buildings.map(b => b.chatSlug))
    const result: EnhancedBuilding[] = []

    Array.from(buildingsWithData).forEach(chatSlug => {
      if (!featuredSlugs.has(chatSlug)) {
        // Find this property in allProperties
        const found = allProperties.find(p => generateChatSlug(p.d) === chatSlug)
        if (found) {
          result.push(expandProperty(found))
        }
      }
    })

    return result
  }, [buildings, buildingsWithData, allProperties])

  // Filter and sort buildings (canvassed first, then favorites)
  const filteredBuildings = useMemo(() => {
    const query = searchQuery.trim()

    // If searching, use search results
    if (query) {
      return searchResults.sort((a, b) => {
        // Sort by has data, then favorites
        const aHasData = buildingsWithData.has(a.chatSlug) ? 2 : 0
        const bHasData = buildingsWithData.has(b.chatSlug) ? 2 : 0
        const aFav = favorites.has(a.apn) ? 1 : 0
        const bFav = favorites.has(b.apn) ? 1 : 0
        return (bHasData + bFav) - (aHasData + aFav)
      })
    }

    // Default view: featured buildings + any non-featured with canvass data
    const combined = [...buildings, ...canvassedNonFeatured]

    // Sort: canvassed first, then favorites, then rest
    return combined.sort((a, b) => {
      const aHasData = buildingsWithData.has(a.chatSlug) ? 2 : 0
      const bHasData = buildingsWithData.has(b.chatSlug) ? 2 : 0
      const aFav = favorites.has(a.apn) ? 1 : 0
      const bFav = favorites.has(b.apn) ? 1 : 0
      return (bHasData + bFav) - (aHasData + aFav)
    })
  }, [buildings, canvassedNonFeatured, searchResults, searchQuery, favorites, buildingsWithData])

  // Handle toggling favorite
  const handleToggleFavorite = (e: React.MouseEvent, apn: string) => {
    e.stopPropagation()
    toggleFavorite(apn)
    setFavorites(getFavorites())
  }

  const handleUnitSave = () => {
    setRefreshKey(k => k + 1)
  }

  // Handle navigation from Power Map landlord detail to a building
  const handleLandlordSelectBuilding = (chatSlug: string) => {
    const building = buildings.find(b => b.chatSlug === chatSlug)
    if (building) {
      setSelectedBuilding(building)
      setActiveToolsTab('canvassing')
      setToolsMobileView('units')
    }
  }

  // Handle selecting a landlord
  const handleSelectLandlord = (landlord: LandlordProfile) => {
    setSelectedLandlord(landlord)
    setToolsMobileView('units')
  }

  // Tab switcher component
  const TabSwitcher = () => (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1 flex-wrap">
      <button
        onClick={() => setActiveToolsTab('canvassing')}
        className={`flex-1 min-w-[90px] py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
          activeToolsTab === 'canvassing'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Canvassing
      </button>
      <button
        onClick={() => setActiveToolsTab('powermap')}
        className={`flex-1 min-w-[90px] py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
          activeToolsTab === 'powermap'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Power Map
      </button>
      <button
        onClick={() => setActiveToolsTab('tasks')}
        className={`flex-1 min-w-[90px] py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
          activeToolsTab === 'tasks'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Tasks
      </button>
    </div>
  )

  // Unified layout for both tabs
  return (
    <>
      <div className="flex flex-col md:flex-row overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
        {/* Left: Building Selector - hidden on mobile when building is selected or on tasks tab */}
        <div className={`${toolsMobileView === 'buildings' && activeToolsTab !== 'tasks' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-2/5 min-h-0 h-full overflow-hidden border-r border-gray-200 bg-white`}>
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Organizer Tools</h2>

            {/* Tabs */}
            <TabSwitcher />

            <p className="text-sm text-gray-500 mt-3">
              {activeToolsTab === 'canvassing'
                ? 'Select a property to track tenant outreach'
                : activeToolsTab === 'powermap'
                ? 'View landlord portfolios and organizing activity'
                : 'Manage and track organizing tasks'
              }
            </p>

            {/* Search - only for Canvassing tab */}
            {activeToolsTab === 'canvassing' && !selectedBuilding && (
              <>
                <div className="relative mt-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Search all properties by address, owner, or APN..."
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
                  {inputValue && (
                    <button
                      onClick={() => setInputValue('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {isSearching ? (
                    <span className="text-gray-400">Searching...</span>
                  ) : inputValue.trim() ? (
                    <>
                      {filteredBuildings.length} result{filteredBuildings.length !== 1 ? 's' : ''}
                      {filteredBuildings.length >= 50 && <span className="text-gray-400"> (showing first 50)</span>}
                    </>
                  ) : (
                    <>
                      {filteredBuildings.length} properties
                      {buildingsWithData.size > 0 && (
                        <span className="text-green-600"> ({buildingsWithData.size} with data)</span>
                      )}
                    </>
                  )}
                </p>
              </>
            )}
          </div>

          {/* List content - switches based on active tab */}
          {activeToolsTab === 'canvassing' ? (
            <div className="flex-1 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  <div className="animate-pulse">Searching properties...</div>
                </div>
              ) : filteredBuildings.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {inputValue.trim()
                    ? `No properties match "${inputValue}"`
                    : 'No properties available.'
                  }
                </div>
              ) : (
              <ul className="divide-y divide-gray-200">
                {filteredBuildings
                  .filter((b): b is EnhancedBuilding => Boolean(b?.apn && b?.chatSlug))
                  .map((building) => {
                  const stats = buildingStats[building.chatSlug] || { total: 0, contacted: 0, hasNotes: false, demands: 0 }
                  // Use actual building units for progress, not just tracked units
                  const totalUnits = building.units || 1
                  const progressPercent = Math.round((stats.contacted / totalUnits) * 100)
                  const linkedGroup = linkedGroupByApn.get(building.apn)
                  const isFav = favorites.has(building.apn)
                  const hasData = buildingsWithData.has(building.chatSlug)

                  return (
                    <li key={building.apn}>
                      <div
                        onClick={() => {
                          setSelectedBuilding(building)
                          setToolsMobileView('units')
                        }}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors relative cursor-pointer ${
                          selectedBuilding?.apn === building.apn ? 'bg-red-50 border-l-4 border-rstu-red' : ''
                        }`}
                      >
                        <div className="absolute top-3 right-3 flex items-center gap-1">
                          {hasData && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700"
                              title="Has canvassing data"
                            >
                              Data
                            </span>
                          )}
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
                          {/* Star/Favorite button */}
                          <button
                            onClick={(e) => handleToggleFavorite(e, building.apn)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <svg
                              className={`w-4 h-4 ${isFav ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                              fill={isFav ? 'currentColor' : 'none'}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="font-medium text-gray-900 text-sm pr-24">
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
                            {stats.contacted}/{totalUnits} contacted
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
                      </div>
                    </li>
                  )
                })}
              </ul>
              )}
            </div>
          ) : activeToolsTab === 'powermap' ? (
            <LandlordList
              landlords={landlords}
              selectedLandlord={selectedLandlord}
              onSelectLandlord={handleSelectLandlord}
            />
          ) : (
            // Tasks: No list needed, Kanban board shows in right panel
            <div className="flex-1 flex items-center justify-center text-gray-400 p-4">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <p className="text-sm">View the task board</p>
                <p className="text-xs text-gray-400 mt-1">
                  Drag tasks between columns to update status
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Detail Panel - full screen on mobile with back button, always show for tasks */}
        <div className={`${toolsMobileView === 'units' || activeToolsTab === 'tasks' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-3/5 min-h-0 h-full overflow-hidden bg-white`}>
          {activeToolsTab === 'canvassing' ? (
            // Canvassing: Unit Tracker
            selectedBuilding ? (
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
            )
          ) : activeToolsTab === 'powermap' ? (
            // Power Map: Landlord Detail
            selectedLandlord ? (
              <>
                {/* Mobile back button */}
                {!isDesktop && (
                  <button
                    onClick={() => setToolsMobileView('buildings')}
                    className="flex items-center gap-2 p-3 border-b border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm">Back to landlords</span>
                  </button>
                )}
                <LandlordDetail
                  landlord={selectedLandlord}
                  onSelectBuilding={handleLandlordSelectBuilding}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-sm">Select a landlord to view their portfolio</p>
                  <p className="text-xs text-gray-400 mt-2">
                    See complaint patterns and organizing activity across their properties
                  </p>
                </div>
              </div>
            )
          ) : (
            // Tasks: Full-width Kanban Board
            <TaskBoard />
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
