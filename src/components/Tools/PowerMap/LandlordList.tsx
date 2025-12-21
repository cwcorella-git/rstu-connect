'use client'

import { useState, useMemo } from 'react'
import type { LandlordProfile } from '@/lib/landlordProfileStorage'
import { LandlordCard } from './LandlordCard'

type SortOption = 'portfolio' | 'units' | 'value' | 'activity'

interface LandlordListProps {
  landlords: LandlordProfile[]
  selectedLandlord: LandlordProfile | null
  onSelectLandlord: (landlord: LandlordProfile) => void
}

export function LandlordList({ landlords, selectedLandlord, onSelectLandlord }: LandlordListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('portfolio')
  const [showActiveOnly, setShowActiveOnly] = useState(false)

  const filteredAndSorted = useMemo(() => {
    let result = [...landlords]

    // Filter by search query
    const query = searchQuery.toLowerCase().trim()
    if (query) {
      result = result.filter(l =>
        l.ownerName.toLowerCase().includes(query)
      )
    }

    // Filter by activity
    if (showActiveOnly) {
      result = result.filter(l => l.buildingsWithActivity > 0)
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'units':
          return b.totalUnits - a.totalUnits
        case 'value':
          return b.totalValue - a.totalValue
        case 'activity':
          // Sort by activity count, then complaints, then portfolio
          if (b.buildingsWithActivity !== a.buildingsWithActivity) {
            return b.buildingsWithActivity - a.buildingsWithActivity
          }
          if (b.totalComplaints !== a.totalComplaints) {
            return b.totalComplaints - a.totalComplaints
          }
          return b.totalProperties - a.totalProperties
        case 'portfolio':
        default:
          return b.totalProperties - a.totalProperties
      }
    })

    return result
  }, [landlords, searchQuery, sortBy, showActiveOnly])

  const activeCount = useMemo(() =>
    landlords.filter(l => l.buildingsWithActivity > 0).length,
    [landlords]
  )

  return (
    <>
      {/* Search and filters */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search landlords..."
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

        {/* Sort and filter controls */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-rstu-red"
          >
            <option value="portfolio">Sort: Portfolio Size</option>
            <option value="units">Sort: Total Units</option>
            <option value="value">Sort: Total Value</option>
            <option value="activity">Sort: Organizing Activity</option>
          </select>

          <button
            onClick={() => setShowActiveOnly(!showActiveOnly)}
            className={`px-2 py-1.5 text-xs rounded-md border transition-colors ${
              showActiveOnly
                ? 'bg-orange-100 border-orange-300 text-orange-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Active ({activeCount})
          </button>
        </div>

        {/* Results count */}
        <p className="text-xs text-gray-500">
          {filteredAndSorted.length === landlords.length
            ? `${landlords.length} landlords`
            : `${filteredAndSorted.length} of ${landlords.length} landlords`
          }
        </p>
      </div>

      {/* Landlord list */}
      <div className="flex-1 overflow-y-auto">
        {filteredAndSorted.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p>No landlords found</p>
          </div>
        ) : (
          filteredAndSorted.map(landlord => (
            <LandlordCard
              key={landlord.ownerName}
              landlord={landlord}
              isSelected={selectedLandlord?.ownerName === landlord.ownerName}
              onClick={() => onSelectLandlord(landlord)}
            />
          ))
        )}
      </div>
    </>
  )
}
