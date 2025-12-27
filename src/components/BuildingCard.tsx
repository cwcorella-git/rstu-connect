'use client'

import React from 'react';
import { EnhancedBuilding } from '@/lib/getBuildingsData';
import { useLanguage } from '@/contexts/LanguageContext';

// Property type badge configuration
const PROPERTY_TYPE_BADGES: Record<string, { label: string; bgColor: string; textColor: string }> = {
  mc: { label: 'Multi (Corp)', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  mi: { label: 'Multi (Indiv)', bgColor: 'bg-teal-100', textColor: 'text-teal-700' },
  mt: { label: 'Multi (Trust)', bgColor: 'bg-indigo-100', textColor: 'text-indigo-700' },
  sc: { label: 'SFR (Corp)', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
  st: { label: 'SFR (Trust)', bgColor: 'bg-slate-100', textColor: 'text-slate-600' },
};

// Convert kebab-case ID to Title Case
function toTitleCase(str: string): string {
  return str
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

interface BuildingCardProps {
  building: EnhancedBuilding;
  isSelected: boolean;
  isFavorite: boolean;
  isInLinkingSelection?: boolean;
  isLinked?: boolean;
  linkedGroupName?: string;
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onCtrlClick?: (e: React.MouseEvent) => void;
  'data-apn'?: string;
}

export const BuildingCard = React.memo(function BuildingCard({ building, isSelected, isFavorite, isInLinkingSelection, isLinked, linkedGroupName, onClick, onToggleFavorite, onCtrlClick, 'data-apn': dataApn }: BuildingCardProps) {
  const { t } = useLanguage();
  // Use property name if available, otherwise extract street from address
  const displayName = building.propertyName || building.address.split(',')[0]?.trim() || building.address;

  // Determine border color: linking selection (red), linked group (orange), selected (red), none
  let borderColor = 'transparent';
  if (isInLinkingSelection) {
    borderColor = '#cc0000';
  } else if (isLinked) {
    borderColor = '#f97316'; // orange
  } else if (isSelected) {
    borderColor = '#cc0000';
  }

  return (
    <li
      data-apn={dataApn}
      className={`p-4 transition-colors ${
        isSelected ? 'bg-red-50' : isInLinkingSelection ? 'bg-red-50' : 'bg-white'
      }`}
      style={{ borderLeft: `4px solid ${borderColor}` }}
      title={isLinked ? `Linked: ${linkedGroupName}` : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-1">
            {isLinked && (
              <svg className="w-3 h-3 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            )}
            <span className="truncate">{displayName}</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{building.address}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">
              {building.units.toLocaleString()} {building.units !== 1 ? t('buildings.units') : t('buildings.unit')}
            </span>
          </div>
          <p className="text-xs text-gray-400 truncate">{building.owner}</p>
          {/* Property type and intelligence badges */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {building.propertyType && PROPERTY_TYPE_BADGES[building.propertyType] && (
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${PROPERTY_TYPE_BADGES[building.propertyType].bgColor} ${PROPERTY_TYPE_BADGES[building.propertyType].textColor}`}>
                {PROPERTY_TYPE_BADGES[building.propertyType].label}
              </span>
            )}
            {building.organizingPriority !== undefined && building.organizingPriority >= 7 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
                {t('buildings.active')}
              </span>
            )}
            {building.organizingPriority !== undefined && building.organizingPriority >= 4 && building.organizingPriority < 7 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-700">
                {t('buildings.emerging')}
              </span>
            )}
            {building.managementCompanyId && (
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700 max-w-[100px] truncate"
                title={`${t('buildings.managedBy')}: ${toTitleCase(building.managementCompanyId)}`}
              >
                {toTitleCase(building.managementCompanyId).slice(0, 15)}
              </span>
            )}
            {building.portfolioId && !building.managementCompanyId && (
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-700 max-w-[100px] truncate"
                title={t('buildings.multipleProperties')}
              >
                {t('buildings.portfolio')}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onToggleFavorite}
          className="ml-2 p-1 flex-shrink-0 hover:bg-gray-100 rounded transition-colors"
          title={isFavorite ? t('buildings.removeFavorite') : t('buildings.addFavorite')}
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
}, (prev, next) => {
  // Custom equality check - only re-render when these props change
  return prev.building.apn === next.building.apn &&
         prev.isSelected === next.isSelected &&
         prev.isFavorite === next.isFavorite &&
         prev.isInLinkingSelection === next.isInLinkingSelection &&
         prev.isLinked === next.isLinked &&
         prev.linkedGroupName === next.linkedGroupName;
});
