'use client'

import { useState, useMemo, useEffect } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import { getAllLandlords, type LandlordProfile } from '@/lib/landlordProfileStorage'
import { LandlordList } from './LandlordList'
import { LandlordDetail } from './LandlordDetail'

interface PowerMapProps {
  buildings: EnhancedBuilding[]
  onSelectBuilding: (chatSlug: string) => void
  initialLandlord?: string // Pre-select a landlord by name
}

export function PowerMap({ buildings, onSelectBuilding, initialLandlord }: PowerMapProps) {
  const [selectedLandlord, setSelectedLandlord] = useState<LandlordProfile | null>(null)
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list')
  const [isDesktop, setIsDesktop] = useState(true)

  // Compute all landlord profiles
  const landlords = useMemo(() => getAllLandlords(buildings), [buildings])

  // Handle initial landlord selection
  useEffect(() => {
    if (initialLandlord && !selectedLandlord) {
      const found = landlords.find(
        l => l.ownerName.toLowerCase() === initialLandlord.toLowerCase()
      )
      if (found) {
        setSelectedLandlord(found)
        setMobileView('detail')
      }
    }
  }, [initialLandlord, landlords, selectedLandlord])

  // Detect desktop/mobile
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  const handleSelectLandlord = (landlord: LandlordProfile) => {
    setSelectedLandlord(landlord)
    setMobileView('detail')
  }

  const handleSelectBuilding = (chatSlug: string) => {
    onSelectBuilding(chatSlug)
  }

  // Stats summary
  const stats = useMemo(() => {
    const withActivity = landlords.filter(l => l.buildingsWithActivity > 0)
    const corporate = landlords.filter(l => l.isCorporateOwned)
    return {
      total: landlords.length,
      withActivity: withActivity.length,
      corporate: corporate.length,
      totalComplaints: landlords.reduce((sum, l) => sum + l.totalComplaints, 0),
      totalDemands: landlords.reduce((sum, l) => sum + l.totalDemands, 0),
    }
  }, [landlords])

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      {/* Left: Landlord List */}
      <div className={`${mobileView === 'list' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-2/5 border-r border-gray-200 bg-white overflow-hidden`}>
        {/* Header with stats */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Power Map</h2>
          <p className="text-xs text-gray-500 mt-1">
            Landlord portfolios and organizing activity
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200">
              {stats.total} landlords
            </span>
            {stats.withActivity > 0 && (
              <span className="px-2 py-1 bg-orange-50 rounded text-xs text-orange-600 border border-orange-200">
                {stats.withActivity} active
              </span>
            )}
            {stats.totalComplaints > 0 && (
              <span className="px-2 py-1 bg-yellow-50 rounded text-xs text-yellow-700 border border-yellow-200">
                {stats.totalComplaints} complaints
              </span>
            )}
            {stats.totalDemands > 0 && (
              <span className="px-2 py-1 bg-green-50 rounded text-xs text-green-600 border border-green-200">
                {stats.totalDemands} demands
              </span>
            )}
          </div>
        </div>

        <LandlordList
          landlords={landlords}
          selectedLandlord={selectedLandlord}
          onSelectLandlord={handleSelectLandlord}
        />
      </div>

      {/* Right: Landlord Detail */}
      <div className={`${mobileView === 'detail' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-3/5 bg-white overflow-hidden`}>
        {selectedLandlord ? (
          <>
            {/* Mobile back button */}
            {!isDesktop && (
              <button
                onClick={() => setMobileView('list')}
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
              onSelectBuilding={handleSelectBuilding}
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
        )}
      </div>
    </div>
  )
}
