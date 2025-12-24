'use client'

import { EnhancedBuilding } from '@/lib/getBuildingsData';

interface PropertyHeaderProps {
  building: EnhancedBuilding;
  showBackButton?: boolean;
  onBack?: () => void;
  onInfoClick?: () => void;
}

export function PropertyHeader({ building, showBackButton, onBack, onInfoClick }: PropertyHeaderProps) {
  // Title is property name if available, otherwise address
  const title = building.propertyName || building.address;
  // Subtitle is address if we have a name, otherwise just unit count
  const hasName = !!building.propertyName;

  return (
    <div className="px-3 py-2 border-b border-gray-200 bg-white flex-shrink-0">
      <div className="flex items-center gap-2">
        {showBackButton && (
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Back to building list"
          >
            <svg
              className="w-4 h-4 text-gray-600"
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
        {/* Clickable property info - two lines */}
        <button
          onClick={onInfoClick}
          className="flex-1 min-w-0 text-left group hover:bg-gray-50 -my-1 py-1 px-1.5 rounded transition-colors flex items-center gap-2"
          aria-label="View property details"
        >
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 truncate group-hover:text-rstu-red transition-colors">
              {title}
            </h2>
            <p className="text-xs text-gray-500 truncate">
              {hasName && <>{building.address} &bull; </>}
              {building.units?.toLocaleString()} units
            </p>
          </div>
          {/* Info icon */}
          <svg
            className="w-4 h-4 text-gray-400 group-hover:text-rstu-red transition-colors flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
