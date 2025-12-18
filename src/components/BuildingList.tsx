'use client'

import { useState, useMemo, useEffect } from 'react';
import { EnhancedBuilding } from '@/lib/getBuildingsData';
import { BuildingCard } from './BuildingCard';

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

interface BuildingListProps {
  buildings: EnhancedBuilding[];
  selectedBuilding: EnhancedBuilding;
  onSelectBuilding: (building: EnhancedBuilding) => void;
}

export function BuildingList({ buildings, selectedBuilding, onSelectBuilding }: BuildingListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [allProperties, setAllProperties] = useState<CompressedProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Load all properties on mount
  useEffect(() => {
    fetch('/data/all-properties.json')
      .then(res => res.json())
      .then(data => {
        setAllProperties(data.p || []);
        setTotalCount(data.c || 0);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load all properties:', err);
        setIsLoading(false);
      });
  }, []);

  // Filter buildings based on search query
  // - Empty search: show featured buildings (passed in as props)
  // - With search: search all 5K+ properties from JSON
  const filteredBuildings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      // No search - show featured buildings
      return buildings;
    }

    // Search all properties
    const results: EnhancedBuilding[] = [];

    // First, check featured buildings (they have full data)
    for (const building of buildings) {
      if (
        building.address.toLowerCase().includes(query) ||
        building.owner.toLowerCase().includes(query) ||
        building.apn.includes(query)
      ) {
        results.push(building);
      }
    }

    // Then search all properties (skip if already in results)
    const featuredApns = new Set(results.map(b => b.apn));

    for (const p of allProperties) {
      if (featuredApns.has(p.a)) continue;
      if (
        p.d.toLowerCase().includes(query) ||
        p.o.toLowerCase().includes(query) ||
        p.a.includes(query)
      ) {
        results.push(expandProperty(p));
        if (results.length >= 50) break; // Limit results
      }
    }

    return results;
  }, [buildings, allProperties, searchQuery]);

  // Determine what count to show
  const isSearching = searchQuery.trim().length > 0;
  const displayCount = isSearching ? filteredBuildings.length : buildings.length;
  const showingSubset = isSearching && filteredBuildings.length >= 50;

  return (
    <div className="h-full border-r border-gray-200 flex flex-col bg-white">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <input
          type="text"
          placeholder="Search all properties by address, owner, or APN..."
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">
            {isSearching ? (
              <>
                {displayCount} result{displayCount !== 1 ? 's' : ''}
                {showingSubset && <span className="text-gray-400"> (showing first 50)</span>}
              </>
            ) : (
              <>
                {displayCount} featured building{displayCount !== 1 ? 's' : ''}
              </>
            )}
          </p>
          {!isLoading && totalCount > 0 && (
            <p className="text-xs text-gray-400">
              {totalCount.toLocaleString()} total searchable
            </p>
          )}
        </div>
      </div>

      {/* Building List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && isSearching ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            Loading property data...
          </div>
        ) : (
          <>
            <ul className="divide-y divide-gray-200">
              {filteredBuildings.map((building) => (
                <BuildingCard
                  key={building.apn}
                  building={building}
                  isSelected={selectedBuilding.apn === building.apn}
                  onClick={() => onSelectBuilding(building)}
                />
              ))}
            </ul>

            {filteredBuildings.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">
                {isSearching ? (
                  <>No properties match &quot;{searchQuery}&quot;</>
                ) : (
                  <>No buildings available.</>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
