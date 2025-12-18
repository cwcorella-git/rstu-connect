'use client'

import { EnhancedBuilding } from '@/lib/getBuildingsData';
import { useState, useEffect } from 'react';
import { canAccessTools } from '@/lib/profileStorage';

interface PropertyInfoTabProps {
  building: EnhancedBuilding;
}

// Zoning code explanations
const ZONING_CODES: Record<string, string> = {
  'MU': 'Mixed Use - residential and commercial allowed',
  'MD-ED': 'Mixed-Density Downtown/Entertainment District',
  'MF14': 'Multi-Family 14 units per acre max',
  'MF21': 'Multi-Family 21 units per acre max',
  'MF30': 'Multi-Family 30 units per acre max',
  'PD': 'Planned Development - custom zoning rules',
  'GC': 'General Commercial',
  'NC': 'Neighborhood Commercial',
  'IC': 'Industrial Commercial',
};

// Land use code explanations (Washoe County codes)
const LAND_USE_CODES: Record<string, string> = {
  '420': 'Multi-unit residential (apartments, condos)',
  '340': 'Residential land or vacant property',
  '400': 'Residential (general category)',
  '410': 'Single-family residential',
  '430': 'Mobile home parks',
  '500': 'Commercial (general)',
};

// Tooltip component
function Tooltip({ text, children }: { text?: string; children: React.ReactNode }) {
  const tooltipText = text || 'Code definition not available';
  return (
    <span className="relative group cursor-help border-b-2 border-dotted border-gray-400 hover:border-rstu-red">
      {children}
      <span className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100
                       transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded
                       whitespace-nowrap bottom-full left-0 mb-1 z-50 shadow-lg pointer-events-none">
        {tooltipText}
        <span className="absolute top-full left-2 border-4 border-transparent border-t-gray-900"></span>
      </span>
    </span>
  );
}

// Section header component (NO emoji)
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mt-6 mb-3 first:mt-0">
      <div className="flex-1 h-px bg-gray-200"></div>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
        {title}
      </h4>
      <div className="flex-1 h-px bg-gray-200"></div>
    </div>
  );
}

// Data row component
function DataRow({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm text-gray-900 font-medium text-right ${className}`}>{value}</span>
    </div>
  );
}

export function PropertyInfoTab({ building }: PropertyInfoTabProps) {
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    setIsOrganizer(canAccessTools());
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with address */}
      <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <h2 className="text-lg font-bold text-gray-900">{building.address}</h2>
        <p className="text-xs text-gray-500 mt-1 font-mono">
          APN: {building.apn}
          {building.units && <> &bull; {building.units.toLocaleString()} units</>}
          {building.yearBuilt && <> &bull; Built {building.yearBuilt}</>}
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Building Section */}
        <SectionHeader title="Building" />
        <DataRow label="Units" value={building.units?.toLocaleString()} />
        <DataRow label="Year Built" value={building.yearBuilt} />
        <DataRow label="Size" value={building.sqft ? `${building.sqft.toLocaleString()} sq ft` : null} />
        <DataRow label="Lot Size" value={building.acres ? `${building.acres.toFixed(2)} acres` : null} />

        {/* Assessment Section */}
        <SectionHeader title="Assessment" />
        <DataRow label="Total Value" value={building.value ? `$${building.value.toLocaleString()}` : null} />
        {building.assessedLandValue && (
          <DataRow label="Land" value={`$${building.assessedLandValue.toLocaleString()}`} />
        )}
        {building.assessedImprovementValue && (
          <DataRow label="Improvements" value={`$${building.assessedImprovementValue.toLocaleString()}`} />
        )}
        {building.valuePerUnit && (
          <DataRow label="Per Unit" value={`$${building.valuePerUnit.toLocaleString()}`} />
        )}

        {/* Zoning Section */}
        <SectionHeader title="Zoning" />
        {building.zoning && (
          <DataRow
            label="Zone"
            value={
              <Tooltip text={ZONING_CODES[building.zoning]}>
                {building.zoning}
              </Tooltip>
            }
          />
        )}
        {building.landUseCode && (
          <DataRow
            label="Land Use"
            value={
              <Tooltip text={LAND_USE_CODES[building.landUseCode]}>
                Code {building.landUseCode}
              </Tooltip>
            }
          />
        )}
        {building.neighborhood && (
          <DataRow label="Neighborhood" value={building.neighborhood} />
        )}

        {/* Ownership Section */}
        <SectionHeader title="Ownership" />
        <div className="py-2 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900">{building.owner}</p>
          {building.entityType && (
            <p className="text-xs text-gray-500 capitalize mt-0.5">
              {building.entityType === 'corporate' ? 'Corporate Entity' :
               building.entityType === 'trust' ? 'Trust' :
               building.entityType === 'government' ? 'Government' :
               'Individual'}
            </p>
          )}
        </div>
        {building.ownerAddress && (
          <DataRow label="Mailing" value={building.ownerAddress} />
        )}
        {building.portfolioSize && building.portfolioSize > 1 && (
          <DataRow
            label="Portfolio"
            value={`${building.portfolioSize.toLocaleString()} properties`}
          />
        )}

        {/* Organizer Notes Section (Role-Gated) */}
        {isOrganizer && (
          <>
            <SectionHeader title="Organizer Notes" />
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
              <p className="text-xs text-yellow-800">
                <strong>Internal notes</strong> - not visible to regular users. Data quality varies.
              </p>
            </div>
            {building.campaignNotes ? (
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 italic">
                {building.campaignNotes}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic text-center py-4">
                No organizer notes for this property yet.
              </p>
            )}
          </>
        )}
      </div>

      {/* Data Source Footer */}
      <div className="border-t border-gray-200 p-3 bg-gray-50 flex-shrink-0">
        <p className="text-xs text-gray-400 text-center">
          Source:{' '}
          <a
            href="https://www.washoecounty.gov/assessor/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            Washoe County Assessor
          </a>
          {' '}&bull; Data may be outdated
        </p>
      </div>
    </div>
  );
}
