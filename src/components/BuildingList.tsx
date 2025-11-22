'use client'

import { useState, useMemo } from 'react';
import { Building } from '@/lib/getBuildingsData';
import { BuildingCard } from './BuildingCard';

interface BuildingListProps {
  buildings: Building[];
  selectedBuilding: Building;
  onSelectBuilding: (building: Building) => void;
}

export function BuildingList({ buildings, selectedBuilding, onSelectBuilding }: BuildingListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter buildings based on search query
  const filteredBuildings = useMemo(() => {
    if (!searchQuery.trim()) return buildings;

    const query = searchQuery.toLowerCase();
    return buildings.filter(building =>
      building.address.toLowerCase().includes(query) ||
      building.owner.toLowerCase().includes(query)
    );
  }, [buildings, searchQuery]);

  return (
    <div className="w-2/5 border-r border-gray-200 flex flex-col bg-white">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search buildings..."
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-2">
          {filteredBuildings.length} building{filteredBuildings.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Building List */}
      <div className="flex-1 overflow-y-auto">
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
            No buildings match your search.
          </div>
        )}
      </div>
    </div>
  );
}
