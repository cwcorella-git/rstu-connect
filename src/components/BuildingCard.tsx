'use client'

import { EnhancedBuilding } from '@/lib/getBuildingsData';

interface BuildingCardProps {
  building: EnhancedBuilding;
  isSelected: boolean;
  isFavorite: boolean;
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

export function BuildingCard({ building, isSelected, isFavorite, onClick, onToggleFavorite }: BuildingCardProps) {
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
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900">
            {displayName}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{building.address}</p>
          <p className="text-xs text-gray-400 mt-1">
            {building.units.toLocaleString()} units
          </p>
          <p className="text-xs text-gray-400 truncate">{building.owner}</p>
        </div>
        <button
          onClick={onToggleFavorite}
          className="ml-2 p-1 flex-shrink-0 hover:bg-gray-100 rounded transition-colors"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            className={`w-5 h-5 ${isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={isFavorite ? 0 : 2}
            fill={isFavorite ? 'currentColor' : 'none'}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </button>
      </div>
    </li>
  );
}
