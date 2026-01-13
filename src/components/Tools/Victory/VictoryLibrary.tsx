'use client'

import { useState, useMemo } from 'react'
import {
  type Victory,
  type VictoryType,
  VICTORY_TYPES,
  getVictoryStats,
} from '@/lib/victoryStorage'
import { VictoryCard } from './VictoryCard'

interface VictoryLibraryProps {
  victories: Victory[]
  selectedVictory: Victory | null
  onSelectVictory: (victory: Victory) => void
  onCreateNew: () => void
}

type FilterOption = VictoryType | 'all'

export function VictoryLibrary({
  victories,
  selectedVictory,
  onSelectVictory,
  onCreateNew,
}: VictoryLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterOption>('all')

  const stats = useMemo(() => getVictoryStats(), [victories])

  const filteredVictories = useMemo(() => {
    let result = [...victories]

    // Filter by type
    if (filter !== 'all') {
      result = result.filter((v) => v.type === filter)
    }

    // Search
    const query = searchQuery.toLowerCase().trim()
    if (query) {
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(query) ||
          v.description.toLowerCase().includes(query) ||
          v.landlordName?.toLowerCase().includes(query) ||
          v.tactics?.some((t) => t.toLowerCase().includes(query))
      )
    }

    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return result
  }, [victories, searchQuery, filter])

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`
    }
    return `$${value.toLocaleString()}`
  }

  return (
    <>
      {/* Stats header */}
      <div className="px-4 py-3 bg-green-50 border-b border-green-100">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-green-700">{stats.total}</div>
            <div className="text-[10px] text-green-600">Victories</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-700">
              {stats.totalRentReduction > 0 ? formatCurrency(stats.totalRentReduction) : '-'}
            </div>
            <div className="text-[10px] text-green-600">Rent Saved/mo</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-700">{stats.totalUnitsAffected || '-'}</div>
            <div className="text-[10px] text-green-600">Units</div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="px-4 py-3 space-y-3 border-b border-gray-200">
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search victories..."
            className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-1 text-[10px] rounded-md border transition-colors ${
              filter === 'all'
                ? 'bg-gray-800 border-gray-800 text-white'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            All ({victories.length})
          </button>
          {VICTORY_TYPES.map((vt) => {
            const count = stats.byType[vt.key]
            return (
              <button
                key={vt.key}
                onClick={() => setFilter(vt.key)}
                className={`px-2 py-1 text-[10px] rounded-md border transition-colors ${
                  filter === vt.key
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {vt.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Create button */}
        <button
          onClick={onCreateNew}
          className="w-full py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Document Victory
        </button>
      </div>

      {/* Victory list */}
      <div className="flex-1 overflow-y-auto">
        {filteredVictories.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            <p>
              {victories.length === 0
                ? 'No victories documented yet'
                : 'No victories match your filter'}
            </p>
            {victories.length === 0 && (
              <p className="text-sm mt-2">
                Document your organizing wins to inspire others!
              </p>
            )}
          </div>
        ) : (
          filteredVictories.map((victory) => (
            <VictoryCard
              key={victory.id}
              victory={victory}
              isSelected={selectedVictory?.id === victory.id}
              onClick={() => onSelectVictory(victory)}
            />
          ))
        )}
      </div>
    </>
  )
}
