'use client'

import { EnhancedBuilding } from '@/lib/getBuildingsData';

interface BuildingCardProps {
  building: EnhancedBuilding;
  isSelected: boolean;
  onClick: () => void;
}

export function BuildingCard({ building, isSelected, onClick }: BuildingCardProps) {
  // Use property name if available, otherwise extract street from address
  const displayName = building.propertyName || building.address.split(',')[0]?.trim() || building.address;

  return (
    <li
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-red-50' : 'bg-white'
      }`}
      style={{
        borderLeft: isSelected ? '4px solid #cc0000' : '4px solid transparent'
      }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-gray-900">
            {displayName}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{building.address}</p>
          <p className="text-xs text-gray-400 mt-1">
            {building.units.toLocaleString()} units
          </p>
          <p className="text-xs text-gray-400 truncate">{building.owner}</p>
        </div>
      </div>
    </li>
  );
}
