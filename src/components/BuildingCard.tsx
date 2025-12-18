'use client'

import { EnhancedBuilding } from '@/lib/getBuildingsData';
import { useEffect, useState } from 'react';
import { canAccessTools } from '@/lib/profileStorage';

interface BuildingCardProps {
  building: EnhancedBuilding;
  isSelected: boolean;
  onClick: () => void;
}

export function BuildingCard({ building, isSelected, onClick }: BuildingCardProps) {
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    setIsOrganizer(canAccessTools());
  }, []);

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
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">
              {building.units.toLocaleString()} units
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
      </div>
    </li>
  );
}
