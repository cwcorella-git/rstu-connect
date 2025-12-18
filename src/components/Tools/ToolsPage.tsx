'use client'

import { useState } from 'react'
import type { Building } from '@/lib/getBuildingsData'

interface ToolsPageProps {
  buildings: Building[]
}

export function ToolsPage({ buildings }: ToolsPageProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)
  const [toolsMobileView, setToolsMobileView] = useState<'buildings' | 'units'>('buildings')

  return (
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
            {buildings.map((building) => (
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
                  {/* TODO: Show canvassing progress */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-rstu-red rounded-full" style={{ width: '0%' }} />
                    </div>
                    <span className="text-xs text-gray-400">0/{building.units}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right: Unit Tracker (Placeholder) */}
      <div className={`${toolsMobileView === 'units' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-3/5 min-h-0 h-full overflow-hidden bg-white`}>
        {selectedBuilding ? (
          <>
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="font-bold text-gray-900">{selectedBuilding.address.split(',')[0]}</h3>
              <p className="text-sm text-gray-500">{selectedBuilding.units} total units</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Add Units Section */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Add Units</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Unit # (e.g., 101 or 101-150)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                  />
                  <button className="px-4 py-2 bg-rstu-red text-white rounded-md text-sm font-medium hover:bg-rstu-red-dark transition-colors">
                    Add
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Enter single unit or range (e.g., "101-150")</p>
              </div>

              {/* Unit List Placeholder */}
              <div className="text-center py-12 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm">No units added yet</p>
                <p className="text-xs mt-1">Add units above to start tracking tenant outreach</p>
              </div>
            </div>
          </>
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
  )
}
