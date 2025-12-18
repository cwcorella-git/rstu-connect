'use client'

import { EnhancedBuilding } from '@/lib/getBuildingsData';
import { useEffect, useState } from 'react';
import { canAccessTools } from '@/lib/profileStorage';

interface BuildingCardProps {
  building: EnhancedBuilding;
  isSelected: boolean;
  onClick: () => void;
}

// Priority badge color based on organizing priority (1-10)
function getPriorityBadge(priority: number | undefined): { text: string; className: string } | null {
  if (priority === undefined || priority === null) return null;

  if (priority >= 8) {
    return { text: 'High Priority', className: 'bg-red-100 text-red-800' };
  }
  if (priority >= 6) {
    return { text: 'Priority', className: 'bg-orange-100 text-orange-800' };
  }
  if (priority >= 4) {
    return { text: 'Active', className: 'bg-yellow-100 text-yellow-800' };
  }
  return { text: 'Tracking', className: 'bg-green-100 text-green-800' };
}

export function BuildingCard({ building, isSelected, onClick }: BuildingCardProps) {
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    setIsOrganizer(canAccessTools());
  }, []);

  // Extract city from address (assumes format: "123 Street, City, ST ZIP")
  const addressParts = building.address.split(',');
  const streetAddress = addressParts[0]?.trim() || building.address;

  // Get priority badge for organizers
  const priorityBadge = isOrganizer ? getPriorityBadge(building.organizingPriority) : null;

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
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">
              {building.units} units
            </span>
            {isOrganizer && building.isCorporateOwned && (
              <span className="text-[10px] text-red-600">Corp</span>
            )}
            {isOrganizer && building.portfolioSize && building.portfolioSize > 10 && (
              <span className="text-[10px] text-gray-400">
                ({building.portfolioSize} props)
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate">{building.owner}</p>
        </div>
        <div className="flex flex-col items-end gap-1 ml-2">
          {priorityBadge ? (
            <span className={`${priorityBadge.className} px-2 py-1 rounded text-xs font-medium whitespace-nowrap`}>
              {priorityBadge.text}
            </span>
          ) : (
            <span className="bg-blue-100 text-blue-900 px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
              Organizing
            </span>
          )}
          {building.estimatedMortgageStatus === 'likely_paid' && (
            <span className="text-[10px] text-green-600">Paid off</span>
          )}
        </div>
      </div>
    </li>
  );
}
