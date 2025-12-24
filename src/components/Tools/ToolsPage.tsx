'use client'

import { useState, useEffect, useMemo } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import { ToolsHeader } from './ToolsHeader'
import { UnitTracker } from './UnitTracker'
import { UnitIntakeForm } from './UnitIntakeForm'
import { LandlordList } from './PowerMap/LandlordList'
import { LandlordDetail } from './PowerMap/LandlordDetail'
import { CampaignList } from './Campaigns/CampaignList'
import { CampaignDetail } from './Campaigns/CampaignDetail'
import { CampaignForm } from './Campaigns/CampaignForm'
import { getBuildingStats, getBuildingDiscrepancies, type UnitRecord } from '@/lib/canvassStorage'
import { getAllLandlords, type LandlordProfile } from '@/lib/landlordProfileStorage'
import { getAllCampaigns, type Campaign } from '@/lib/campaignStorage'
import { trackActivity } from '@/lib/profileStorage'
import { getLinkedGroups, type LinkedPropertyGroup } from '@/lib/linkedPropertiesStorage'
import { getBuildingDemands } from '@/lib/buildingOrganizingStorage'
import { getFavorites, toggleFavorite } from '@/lib/favoritesStorage'

type ToolsTab = 'canvassing' | 'powermap' | 'campaigns'

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
  const [selectedLandlord, setSelectedLandlord] = useState<LandlordProfile | null>(null)

  // Campaign state
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showCampaignForm, setShowCampaignForm] = useState(false)

  // Building stats for progress display
  const [buildingStats, setBuildingStats] = useState<Record<string, { total: number; contacted: number; hasNotes: boolean; demands: number }>>({})
  const [linkedGroups, setLinkedGroups] = useState<LinkedPropertyGroup[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

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

  // Load campaigns
  useEffect(() => {
    setCampaigns(getAllCampaigns())
  }, [refreshKey])

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

  // Filter and sort buildings (favorites first)
  const filteredBuildings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    let result = buildings

    if (query) {
      result = buildings.filter(b =>
        b.address.toLowerCase().includes(query) ||
        b.owner.toLowerCase().includes(query) ||
        b.propertyName?.toLowerCase().includes(query) ||
        b.apn.includes(query)
      )
    }

    // Sort favorites first
    return [...result].sort((a, b) => {
      const aFav = favorites.has(a.apn) ? 1 : 0
      const bFav = favorites.has(b.apn) ? 1 : 0
      return bFav - aFav
    })
  }, [buildings, searchQuery, favorites])

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

  // Campaign handlers
  const handleSelectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setToolsMobileView('units')
  }

  const handleCampaignUpdate = () => {
    setCampaigns(getAllCampaigns())
    // Re-select the campaign to get updated data
    if (selectedCampaign) {
      const updated = getAllCampaigns().find(c => c.id === selectedCampaign.id)
      setSelectedCampaign(updated || null)
    }
  }

  const handleCampaignDelete = () => {
    setCampaigns(getAllCampaigns())
    setSelectedCampaign(null)
    setToolsMobileView('buildings')
  }

  const handleCampaignCreated = () => {
    setCampaigns(getAllCampaigns())
    setShowCampaignForm(false)
  }

  // Navigate from campaign to building
  const handleCampaignSelectBuilding = (chatSlug: string) => {
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
        className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
          activeToolsTab === 'canvassing'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Canvassing
      </button>
      <button
        onClick={() => setActiveToolsTab('powermap')}
        className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
          activeToolsTab === 'powermap'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Power Map
      </button>
      <button
        onClick={() => setActiveToolsTab('campaigns')}
        className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
          activeToolsTab === 'campaigns'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Campaigns
      </button>
    </div>
  )

  // Unified layout for both tabs
  return (
    <>
      <div className="flex flex-col md:flex-row overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
        {/* Left: Building Selector - hidden on mobile when building is selected */}
        <div className={`${toolsMobileView === 'buildings' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-2/5 min-h-0 h-full overflow-hidden border-r border-gray-200 bg-white`}>
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Organizer Tools</h2>

            {/* Tabs */}
            <TabSwitcher />

            <p className="text-sm text-gray-500 mt-3 mb-3">
              {activeToolsTab === 'canvassing'
                ? 'Select a property to track tenant outreach'
                : activeToolsTab === 'powermap'
                ? 'View landlord portfolios and organizing activity'
                : 'Track organizing campaigns from start to resolution'
              }
            </p>

            {/* Search - only for Canvassing tab */}
            {activeToolsTab === 'canvassing' && (
              <>
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
              </>
            )}
          </div>

          {/* List content - switches based on active tab */}
          {activeToolsTab === 'canvassing' ? (
            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {filteredBuildings.map((building) => {
                  const stats = buildingStats[building.chatSlug] || { total: 0, contacted: 0, hasNotes: false, demands: 0 }
                  const progressPercent = stats.total > 0 ? Math.round((stats.contacted / stats.total) * 100) : 0
                  const linkedGroup = linkedGroupByApn.get(building.apn)
                  const isFav = favorites.has(building.apn)

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
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : activeToolsTab === 'powermap' ? (
            <LandlordList
              landlords={landlords}
              selectedLandlord={selectedLandlord}
              onSelectLandlord={handleSelectLandlord}
            />
          ) : (
            <CampaignList
              campaigns={campaigns}
              selectedCampaign={selectedCampaign}
              onSelectCampaign={handleSelectCampaign}
              onCreateNew={() => setShowCampaignForm(true)}
            />
          )}
        </div>

        {/* Right: Detail Panel - full screen on mobile with back button */}
        <div className={`${toolsMobileView === 'units' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-3/5 min-h-0 h-full overflow-hidden bg-white`}>
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
            // Campaigns: Campaign Detail or Form
            showCampaignForm ? (
              <CampaignForm
                buildings={buildings}
                onSave={handleCampaignCreated}
                onCancel={() => setShowCampaignForm(false)}
              />
            ) : selectedCampaign ? (
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
                    <span className="text-sm">Back to campaigns</span>
                  </button>
                )}
                <CampaignDetail
                  campaign={selectedCampaign}
                  onUpdate={handleCampaignUpdate}
                  onDelete={handleCampaignDelete}
                  onSelectBuilding={handleCampaignSelectBuilding}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm">Select a campaign or create a new one</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Track organizing campaigns from intelligence to victory
                  </p>
                </div>
              </div>
            )
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
