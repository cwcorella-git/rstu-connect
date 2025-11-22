'use client'

import { Building } from '@/lib/getBuildingsData';
import { useState } from 'react';

interface BuildingMetadataProps {
  building: Building;
}

export function BuildingMetadata({ building }: BuildingMetadataProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="absolute bottom-4 left-4 bg-white/90 px-3 py-2 rounded shadow-lg text-xs text-gray-600 hover:bg-white transition"
      >
        Show building info
      </button>
    );
  }

  return (
    <div className="absolute bottom-4 left-4 bg-white/95 p-4 rounded shadow-lg max-w-xs">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-sm text-gray-900">Building Details</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 text-xs"
        >
          ✕
        </button>
      </div>

      <dl className="space-y-1 text-xs">
        <div>
          <dt className="text-gray-500 inline">Owner:</dt>
          <dd className="text-gray-900 inline ml-1">{building.owner}</dd>
        </div>

        <div>
          <dt className="text-gray-500 inline">Units:</dt>
          <dd className="text-gray-900 inline ml-1">{building.units.toLocaleString()}</dd>
        </div>

        {building.yearBuilt && (
          <div>
            <dt className="text-gray-500 inline">Built:</dt>
            <dd className="text-gray-900 inline ml-1">{building.yearBuilt}</dd>
          </div>
        )}

        {building.sqft && (
          <div>
            <dt className="text-gray-500 inline">Size:</dt>
            <dd className="text-gray-900 inline ml-1">{building.sqft.toLocaleString()} sq ft</dd>
          </div>
        )}

        {building.value && (
          <div>
            <dt className="text-gray-500 inline">Assessed Value:</dt>
            <dd className="text-gray-900 inline ml-1">${building.value.toLocaleString()}</dd>
          </div>
        )}

        <div>
          <dt className="text-gray-500 inline">APN:</dt>
          <dd className="text-gray-900 inline ml-1 font-mono text-[10px]">{building.apn}</dd>
        </div>
      </dl>
    </div>
  );
}
