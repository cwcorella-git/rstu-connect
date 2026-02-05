'use client'

import { EnhancedBuilding } from '@/lib/data/getBuildingsData';
import React, { useState, useEffect, useMemo } from 'react';
import { canAccessTools } from '@/lib/storage/profileStorage';
import { getHabitabilityScore, getEffectiveOrganizingPriority } from '@/lib/storage/canvassStorage';
import { useTab } from '@/contexts/TabContext';
import { buildLandlordProfile } from '@/lib/storage/landlordProfileStorage';
import { LandlordPortfolioSlideout } from './LandlordPortfolioSlideout';
import { useBuildingCampaign } from '@/hooks/useBuildingCampaign';
import { Tooltip, SectionHeader, DataRow, DataSection } from './InfoComponents';
import { RentComparisonSection } from './RentComparisonSection';

// Key for storing the landlord to navigate to in Power Map
const POWER_MAP_LANDLORD_KEY = 'rstu_powermap_landlord';

interface PropertyInfoTabProps {
  building: EnhancedBuilding;
  linkedBuildings?: EnhancedBuilding[];
  onSelectBuilding?: (building: EnhancedBuilding) => void;
  allBuildings?: EnhancedBuilding[];
  onSelectBuildingWithChat?: (building: EnhancedBuilding) => void;
}

// Zoning code explanations (Washoe County / Reno / Sparks)
const ZONING_CODES: Record<string, string> = {
  // Multi-Family
  'MF14': 'Multi-Family - 14 units per acre max',
  'MF21': 'Multi-Family - 21 units per acre max',
  'MF30': 'Multi-Family - 30 units per acre max',
  // Single-Family
  'SF3': 'Single-Family - 3,000 sqft minimum lot',
  'SF5': 'Single-Family - 5,000 sqft minimum lot',
  'SF6': 'Single-Family - 6,000 sqft minimum lot',
  'SF8': 'Single-Family - 8,000 sqft minimum lot',
  'SF11': 'Single-Family - 11,000 sqft minimum lot',
  // Density
  'LDS': 'Low Density Suburban - 1-3 units/acre',
  'MDS': 'Medium Density Suburban - 3-7 units/acre',
  // Mixed Use / Downtown
  'MU': 'Mixed Use - residential and commercial',
  'MUD': 'Mixed Use Downtown',
  'NUD': 'Neighborhood Urban District',
  'MD-ED': 'Mixed-Density Downtown/Entertainment District',
  'MD-RD': 'Mixed-Density Residential District',
  'MD-NWQ': 'Mixed-Density Northwest Quadrant',
  'MD-UD': 'Mixed-Density University District',
  // Commercial
  'GC': 'General Commercial',
  'NC': 'Neighborhood Commercial',
  'IC': 'Industrial Commercial',
  'MS': 'Mixed Service',
  'PO': 'Professional Office',
  // Special
  'PD': 'Planned Development - custom zoning rules',
  'SPD': 'Special Planning District',
  'PF': 'Public Facilities',
  'GR': 'General Rural',
  'OS': 'Open Space',
};

// Land use code explanations (Washoe County assessor codes)
const LAND_USE_CODES: Record<string, string> = {
  '110': 'Vacant single-family residential lot',
  '120': 'Vacant multi-family residential lot',
  '200': 'Single-family residential',
  '210': 'Single-family residential (owner-occupied)',
  '220': 'Duplex residential',
  '230': 'Triplex or fourplex',
  '240': 'Multi-family 5+ units',
  '250': 'Townhouse/rowhouse',
  '300': 'Agricultural/rural residential',
  '310': 'Agricultural/ranch land',
  '320': 'Manufactured home on land',
  '330': 'Mobile home park',
  '340': 'Vacant residential land',
  '400': 'Commercial (general)',
  '410': 'Retail commercial',
  '420': 'Multi-unit residential (apartments, condos)',
  '430': 'Mobile home parks',
  '500': 'Industrial/warehouse',
  '600': 'Vacant commercial/industrial',
};

export function PropertyInfoTab({ building, linkedBuildings, onSelectBuilding, allBuildings, onSelectBuildingWithChat }: PropertyInfoTabProps) {
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [activeBuilding, setActiveBuilding] = useState<EnhancedBuilding>(building);
  const [showPortfolioSlideout, setShowPortfolioSlideout] = useState(false);
  const { setActiveTab } = useTab();

  // Build landlord profile for portfolio view
  const landlordProfile = useMemo(() => {
    if (!allBuildings || allBuildings.length === 0) return null;
    return buildLandlordProfile(activeBuilding.owner, allBuildings);
  }, [activeBuilding.owner, allBuildings]);

  // Get campaign info for this building
  const { campaignInfo } = useBuildingCampaign(activeBuilding.chatSlug);

  useEffect(() => {
    setIsOrganizer(canAccessTools());
  }, []);

  // Get habitability score for this building (organizer-only)
  const habitabilityScore = useMemo(() => {
    if (!isOrganizer) return null;
    return getHabitabilityScore(activeBuilding.chatSlug);
  }, [activeBuilding.chatSlug, isOrganizer]);

  // Calculate effective organizing priority (boosted by poor habitability)
  const effectiveOrganizingPriority = useMemo(() => {
    return getEffectiveOrganizingPriority(activeBuilding.organizingPriority, activeBuilding.chatSlug);
  }, [activeBuilding.organizingPriority, activeBuilding.chatSlug]);

  // Determine organizing status based on effective priority
  const organizingStatus = useMemo(() => {
    if (effectiveOrganizingPriority >= 7) return 'active';
    if (effectiveOrganizingPriority >= 4) return 'emerging';
    return 'inactive';
  }, [effectiveOrganizingPriority]);

  // Reset active building when the main building changes
  useEffect(() => {
    setActiveBuilding(building);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [building.apn]);

  // Handle switching to a linked building
  const handleBuildingTab = (b: EnhancedBuilding) => {
    setActiveBuilding(b);
    // If the building is different from current, optionally navigate
    if (b.apn !== building.apn && onSelectBuilding) {
      onSelectBuilding(b);
    }
  };

  // Use activeBuilding for display
  const displayBuilding = activeBuilding;

  // Navigate to Power Map for this landlord
  const handleViewLandlord = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(POWER_MAP_LANDLORD_KEY, displayBuilding.owner);
    }
    setActiveTab('tools');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Linked properties tabs */}
      {linkedBuildings && linkedBuildings.length > 1 && (
        <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex gap-1 p-2 overflow-x-auto">
            {linkedBuildings.map((b) => {
              const isActive = b.apn === activeBuilding.apn;
              const shortAddress = b.address.split(',')[0];
              return (
                <button
                  key={b.apn}
                  onClick={() => handleBuildingTab(b)}
                  className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                    isActive
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-300'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  {b.propertyName || shortAddress}
                  <span className="ml-1 text-gray-400">({b.units})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Building Section */}
        <SectionHeader title="Building" />
        <DataSection>
          <DataRow label="Units" value={displayBuilding.units?.toLocaleString()} />
          <DataRow label="Year Built" value={displayBuilding.yearBuilt} />
          <DataRow label="Size" value={displayBuilding.sqft ? `${displayBuilding.sqft.toLocaleString()} sq ft` : null} />
          <DataRow label="Lot Size" value={displayBuilding.acres ? `${displayBuilding.acres.toFixed(2)} acres` : null} />
          <DataRow
            label="Parcels"
            value={displayBuilding.allApns && displayBuilding.allApns.length > 1 ? (
              <Tooltip text={`APNs: ${displayBuilding.allApns.slice(0, 5).join(', ')}${displayBuilding.allApns.length > 5 ? '...' : ''}`}>
                {displayBuilding.allApns.length} parcels
              </Tooltip>
            ) : null}
          />
        </DataSection>

        {/* Multi-Parcel Addresses (for condos/large complexes) */}
        {displayBuilding.allAddresses && displayBuilding.allAddresses.length > 1 && (
          <>
            <SectionHeader title="Addresses" />
            <div className="border border-gray-300 rounded-lg overflow-hidden mb-4 p-3 bg-gray-50">
              <p className="text-xs text-gray-500 mb-2">
                This property spans {displayBuilding.allAddresses.length} addresses:
              </p>
              <ul className="text-sm text-gray-700 space-y-1 max-h-32 overflow-y-auto">
                {displayBuilding.allAddresses.map((addr, i) => (
                  <li key={i} className="font-mono text-xs">{addr}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Assessment Section */}
        <SectionHeader title="Assessment" />
        <DataSection>
          <DataRow label="Total Value" value={displayBuilding.value ? `$${displayBuilding.value.toLocaleString()}` : null} />
          <DataRow label="Land" value={displayBuilding.assessedLandValue ? `$${displayBuilding.assessedLandValue.toLocaleString()}` : null} />
          <DataRow label="Improvements" value={displayBuilding.assessedImprovementValue ? `$${displayBuilding.assessedImprovementValue.toLocaleString()}` : null} />
          <DataRow label="Per Unit" value={displayBuilding.valuePerUnit ? `$${displayBuilding.valuePerUnit.toLocaleString()}` : null} />
        </DataSection>

        {/* Zoning Section */}
        <SectionHeader title="Zoning" />
        <DataSection>
          {displayBuilding.zoning && (
            <DataRow
              label="Zone"
              value={
                <Tooltip text={ZONING_CODES[displayBuilding.zoning]}>
                  {displayBuilding.zoning}
                </Tooltip>
              }
            />
          )}
          {displayBuilding.landUseCode && (
            <DataRow
              label="Land Use"
              value={
                <Tooltip text={LAND_USE_CODES[displayBuilding.landUseCode]}>
                  Code {displayBuilding.landUseCode}
                </Tooltip>
              }
            />
          )}
          <DataRow label="Neighborhood" value={displayBuilding.neighborhood} />
        </DataSection>

        {/* Ownership Section */}
        <SectionHeader title="Ownership" />
        <DataSection>
          <div className="py-2.5 px-3 bg-white">
            <button
              onClick={handleViewLandlord}
              className="text-sm font-medium text-rstu-red hover:text-red-800 hover:underline text-left"
              title="View landlord portfolio in Power Map"
            >
              {displayBuilding.owner}
              <svg className="inline-block w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
            {displayBuilding.entityType && (
              <p className="text-xs text-gray-500 capitalize mt-0.5">
                {displayBuilding.entityType === 'corporate' ? 'Corporate Entity' :
                 displayBuilding.entityType === 'trust' ? 'Trust' :
                 displayBuilding.entityType === 'government' ? 'Government' :
                 'Individual'}
              </p>
            )}
          </div>
          <DataRow label="Mailing" value={displayBuilding.ownerAddress} />
          {/* Portfolio section with View Portfolio button */}
          {landlordProfile && landlordProfile.totalProperties >= 2 && (
            <div className="py-2.5 px-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-600">Portfolio</span>
                  <p className="text-xs text-gray-400">
                    {landlordProfile.totalProperties} properties &bull; {landlordProfile.totalUnits.toLocaleString()} units
                  </p>
                </div>
                <button
                  onClick={() => setShowPortfolioSlideout(true)}
                  className="px-3 py-1.5 text-xs font-medium bg-rstu-red text-white rounded hover:bg-rstu-red-dark transition-colors"
                >
                  View Portfolio
                </button>
              </div>
            </div>
          )}
        </DataSection>

        {/* Rent Comparison Section */}
        <RentComparisonSection building={displayBuilding} />

        {/* Organizing Status Section */}
        {effectiveOrganizingPriority > 0 && (
          <>
            <SectionHeader title="Organizing Status" />
            <div className={`border rounded-lg p-3 mb-4 ${
              organizingStatus === 'active' ? 'border-green-200 bg-green-50' :
              organizingStatus === 'emerging' ? 'border-yellow-200 bg-yellow-50' :
              'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                  organizingStatus === 'active' ? 'bg-green-100 text-green-800' :
                  organizingStatus === 'emerging' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {organizingStatus === 'active' ? 'Active Organizing' :
                   organizingStatus === 'emerging' ? 'Emerging Opportunity' :
                   'Not Yet Active'}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  Priority: {effectiveOrganizingPriority.toFixed(1)}/10
                  {effectiveOrganizingPriority > (displayBuilding.organizingPriority || 0) && (
                    <span className="text-xs text-green-600 ml-1">(+{(effectiveOrganizingPriority - (displayBuilding.organizingPriority || 0)).toFixed(1)} habitability)</span>
                  )}
                </span>
              </div>
              {displayBuilding.estimatedTenants && (
                <p className="text-xs text-gray-600">
                  Estimated tenants: ~{displayBuilding.estimatedTenants.toLocaleString()}
                </p>
              )}
              {displayBuilding.isCorporateOwned && (
                <p className="text-xs text-gray-600 mt-1">
                  Corporate-owned property (higher organizing potential)
                </p>
              )}
            </div>
          </>
        )}

        {/* Campaign Status Section */}
        {campaignInfo.isActive && campaignInfo.campaign && (
          <>
            <SectionHeader title="Campaign Status" />
            <div className={`border rounded-lg p-3 mb-4 ${
              campaignInfo.campaign.stage === 'active'
                ? 'border-red-300 bg-red-50'
                : 'border-amber-300 bg-amber-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${
                  campaignInfo.campaign.stage === 'active' ? 'text-red-900' : 'text-amber-900'
                }`}>
                  {campaignInfo.campaign.name}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  campaignInfo.campaign.stage === 'active'
                    ? 'bg-red-200 text-red-800'
                    : 'bg-amber-200 text-amber-800'
                }`}>
                  {campaignInfo.stageName}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      campaignInfo.campaign.stage === 'active' ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${campaignInfo.stageProgress}%` }}
                  />
                </div>
                <div className={`text-xs mt-1 ${
                  campaignInfo.campaign.stage === 'active' ? 'text-red-700' : 'text-amber-700'
                }`}>
                  Stage progress: {campaignInfo.stageProgress}%
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {campaignInfo.campaign.estimatedUnits && campaignInfo.campaign.estimatedUnits > 0 && (
                  <div className="bg-white/50 rounded px-2 py-1.5">
                    <span className={campaignInfo.campaign.stage === 'active' ? 'text-red-700' : 'text-amber-700'}>
                      Committed:{' '}
                    </span>
                    <span className="font-medium">
                      {campaignInfo.campaign.participatingUnits || 0}/{campaignInfo.campaign.estimatedUnits}
                    </span>
                    <span className="text-gray-500 ml-1">({campaignInfo.participationRate}%)</span>
                  </div>
                )}
                {campaignInfo.monthlyRentAtRisk > 0 && (
                  <div className="bg-white/50 rounded px-2 py-1.5">
                    <span className={campaignInfo.campaign.stage === 'active' ? 'text-red-700' : 'text-amber-700'}>
                      At risk:{' '}
                    </span>
                    <span className="font-medium">
                      ${campaignInfo.monthlyRentAtRisk.toLocaleString()}/mo
                    </span>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className={`flex flex-wrap gap-3 mt-2 text-xs ${
                campaignInfo.campaign.stage === 'active' ? 'text-red-600' : 'text-amber-600'
              }`}>
                <span>Started: {new Date(campaignInfo.campaign.startDate).toLocaleDateString()}</span>
                {campaignInfo.campaign.targetDate && (
                  <span>Target: {new Date(campaignInfo.campaign.targetDate).toLocaleDateString()}</span>
                )}
              </div>

              {/* Demands summary */}
              {campaignInfo.demandsProgress.total > 0 && (
                <div className={`mt-2 text-xs ${
                  campaignInfo.campaign.stage === 'active' ? 'text-red-700' : 'text-amber-700'
                }`}>
                  Demands: {campaignInfo.demandsProgress.won} won · {campaignInfo.demandsProgress.pending} pending
                  {campaignInfo.demandsProgress.lost > 0 && ` · ${campaignInfo.demandsProgress.lost} lost`}
                </div>
              )}

              {/* Next Action */}
              {campaignInfo.nextAction && (
                <div className="mt-2 pt-2 border-t border-white/30">
                  <div className={`text-xs font-medium ${
                    campaignInfo.campaign.stage === 'active' ? 'text-red-800' : 'text-amber-800'
                  }`}>
                    Next: {campaignInfo.nextAction.text}
                  </div>
                  {(campaignInfo.nextAction.date || campaignInfo.nextAction.assignee) && (
                    <div className={`text-xs mt-0.5 ${
                      campaignInfo.campaign.stage === 'active' ? 'text-red-600' : 'text-amber-600'
                    }`}>
                      {campaignInfo.nextAction.date && `Due: ${new Date(campaignInfo.nextAction.date).toLocaleDateString()}`}
                      {campaignInfo.nextAction.date && campaignInfo.nextAction.assignee && ' · '}
                      {campaignInfo.nextAction.assignee && `Assigned: ${campaignInfo.nextAction.assignee}`}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
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
            {displayBuilding.campaignNotes ? (
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 italic">
                {displayBuilding.campaignNotes}
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

      {/* Landlord Portfolio Slideout */}
      {landlordProfile && allBuildings && onSelectBuildingWithChat && (
        <LandlordPortfolioSlideout
          landlordProfile={landlordProfile}
          currentBuilding={displayBuilding}
          allBuildings={allBuildings}
          isOpen={showPortfolioSlideout}
          onClose={() => setShowPortfolioSlideout(false)}
          onSelectBuildingWithChat={onSelectBuildingWithChat}
        />
      )}
    </div>
  );
}
