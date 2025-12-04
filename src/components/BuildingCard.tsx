'use client'

import { Building } from '@/lib/getBuildingsData';

interface BuildingCardProps {
  building: Building;
  isSelected: boolean;
  onClick: () => void;
}

export function BuildingCard({ building, isSelected, onClick }: BuildingCardProps) {
  // Extract city from address (assumes format: "123 Street, City, ST ZIP")
  const addressParts = building.address.split(',');
  const streetAddress = addressParts[0]?.trim() || building.address;

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
            {streetAddress}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{building.address}</p>
          <p className="text-xs text-gray-400 mt-1">
            {building.units} units • {building.owner}
          </p>
        </div>
        <span className="bg-blue-100 text-blue-900 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2">
          Organizing
        </span>
      </div>
    </li>
  );
}
