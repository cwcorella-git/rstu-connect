'use client'

import type { EnhancedBuilding } from '@/lib/getBuildingsData';

interface ToolsHeaderProps {
  building: EnhancedBuilding;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function ToolsHeader({ building, showBackButton, onBack }: ToolsHeaderProps) {
  return (
    <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Back to building list"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 truncate">
            {building.propertyName || building.address.split(',')[0]}
          </h2>
          {building.propertyName && (
            <p className="text-sm text-gray-600 truncate">{building.address.split(',')[0]}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {building.units?.toLocaleString()} units
          </p>
        </div>
      </div>
    </div>
  );
}
