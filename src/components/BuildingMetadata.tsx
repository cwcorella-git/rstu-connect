'use client'

import { EnhancedBuilding } from '@/lib/getBuildingsData';
import { useState, useEffect } from 'react';
import { canAccessTools } from '@/lib/profileStorage';

interface BuildingMetadataProps {
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

// Tooltip component with tap-to-toggle support for touch devices
function Tooltip({ text, children }: { text?: string; children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipText = text || 'Code definition not available';

  return (
    <button
      type="button"
      onClick={() => setIsVisible(!isVisible)}
      onBlur={() => setIsVisible(false)}
      className="relative cursor-help border-b-2 border-dotted border-gray-400 hover:border-rstu-red focus:outline-none focus:border-rstu-red inline text-left"
      aria-label={`Show definition: ${tooltipText}`}
    >
      {children}
      <span
        className={`absolute bg-gray-900 text-white text-xs px-2 py-1 rounded
                    whitespace-nowrap bottom-full left-0 mb-1 z-50 shadow-lg
                    transition-opacity ${isVisible ? 'visible opacity-100' : 'invisible opacity-0'}`}
      >
        {tooltipText}
        <span className="absolute top-full left-2 border-4 border-transparent border-t-gray-900"></span>
      </span>
    </button>
  );
}

// Section header component
function SectionHeader({ title, icon }: { title: string; icon?: string }) {
  return (
    <h4 className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide mt-3 mb-1.5 flex items-center gap-1 border-b border-gray-200 pb-1">
      {icon && <span>{icon}</span>}
      {title}
    </h4>
  );
}

// Data row component
function DataRow({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between text-xs py-0.5">
      <span className="text-gray-500">{label}</span>
      <span className={`text-gray-900 text-right ${className}`}>{value}</span>
    </div>
  );
}

export function BuildingMetadata({ building }: BuildingMetadataProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'property' | 'owner' | 'organizer'>('property');
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    setIsOrganizer(canAccessTools());
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="absolute top-24 right-4 bg-white/90 px-3 py-2 rounded shadow-lg text-xs text-gray-600 hover:bg-white transition"
      >
        Property Info
      </button>
    );
  }

  return (
    <div className="absolute top-24 right-4 bg-white p-3 rounded-lg shadow-xl max-w-xs z-10 max-h-[75vh] overflow-hidden flex flex-col border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-2 flex-shrink-0">
        <div>
          <h3 className="font-bold text-sm text-gray-900 leading-tight">{building.address}</h3>
          <p className="text-[10px] text-gray-500 font-mono">APN: {building.apn}</p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 text-sm ml-2"
        >
          ✕
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-2 flex-shrink-0">
        <button
          onClick={() => setActiveTab('property')}
          className={`flex-1 text-[11px] py-1.5 ${activeTab === 'property' ? 'border-b-2 border-rstu-red text-rstu-red font-medium' : 'text-gray-500'}`}
        >
          Property
        </button>
        <button
          onClick={() => setActiveTab('owner')}
          className={`flex-1 text-[11px] py-1.5 ${activeTab === 'owner' ? 'border-b-2 border-rstu-red text-rstu-red font-medium' : 'text-gray-500'}`}
        >
          Owner
        </button>
        {isOrganizer && (
          <button
            onClick={() => setActiveTab('organizer')}
            className={`flex-1 text-[11px] py-1.5 ${activeTab === 'organizer' ? 'border-b-2 border-rstu-red text-rstu-red font-medium' : 'text-gray-500'}`}
          >
            Notes
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="overflow-y-auto flex-1 min-h-0">
        {/* Property Tab */}
        {activeTab === 'property' && (
          <div>
            <SectionHeader title="Building" icon="🏢" />
            <DataRow label="Units" value={building.units?.toLocaleString()} />
            <DataRow label="Year Built" value={building.yearBuilt} />
            <DataRow label="Size" value={building.sqft ? `${building.sqft.toLocaleString()} sq ft` : null} />
            <DataRow label="Lot Size" value={building.acres ? `${building.acres.toFixed(2)} acres` : null} />

            <SectionHeader title="Assessment" icon="💰" />
            <DataRow label="Total Value" value={building.value ? `$${building.value.toLocaleString()}` : null} />
            {building.assessedLandValue && (
              <DataRow label="Land" value={`$${building.assessedLandValue.toLocaleString()}`} className="text-gray-600 text-[11px]" />
            )}
            {building.assessedImprovementValue && (
              <DataRow label="Improvements" value={`$${building.assessedImprovementValue.toLocaleString()}`} className="text-gray-600 text-[11px]" />
            )}
            {building.valuePerUnit && (
              <DataRow label="Per Unit" value={`$${building.valuePerUnit.toLocaleString()}`} />
            )}

            <SectionHeader title="Zoning" icon="📋" />
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
          </div>
        )}

        {/* Owner Tab */}
        {activeTab === 'owner' && (
          <div>
            <SectionHeader title="Ownership" icon="👤" />
            <div className="text-xs mb-2">
              <p className="font-medium text-gray-900">{building.owner}</p>
              {building.entityType && (
                <p className="text-gray-500 capitalize text-[11px]">
                  {building.entityType === 'corporate' ? '🏢 Corporate Entity' :
                   building.entityType === 'trust' ? '📜 Trust' :
                   building.entityType === 'government' ? '🏛️ Government' :
                   '👤 Individual'}
                </p>
              )}
            </div>

            {building.ownerAddress && (
              <>
                <SectionHeader title="Mailing Address" icon="📬" />
                <p className="text-[11px] text-gray-700 leading-snug">{building.ownerAddress}</p>
              </>
            )}

            {building.portfolioSize && building.portfolioSize > 1 && (
              <>
                <SectionHeader title="Portfolio" icon="🏘️" />
                <p className="text-xs text-gray-700">
                  This owner has <span className="font-medium">{building.portfolioSize.toLocaleString()} properties</span> in our database
                </p>
              </>
            )}
          </div>
        )}

        {/* Organizer Notes Tab (Role-Gated) */}
        {activeTab === 'organizer' && isOrganizer && (
          <div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
              <p className="text-[10px] text-yellow-800">
                <strong>Internal notes</strong> - not visible to regular users. Data quality varies.
              </p>
            </div>

            {building.campaignNotes && (
              <>
                <SectionHeader title="Campaign Notes" />
                <p className="text-xs text-gray-700 italic bg-gray-50 p-2 rounded">
                  {building.campaignNotes}
                </p>
              </>
            )}

            {!building.campaignNotes && (
              <p className="text-xs text-gray-400 italic text-center py-4">
                No organizer notes for this property yet.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Data Source Footer */}
      <div className="border-t border-gray-200 pt-2 mt-2 flex-shrink-0">
        <p className="text-[9px] text-gray-400 text-center">
          Source: <a
            href="https://www.washoecounty.gov/assessor/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            Washoe County Assessor
          </a>
          {' '}• Data may be outdated
        </p>
      </div>
    </div>
  );
}
