'use client'

import { EnhancedBuilding } from '@/lib/getBuildingsData';
import { useState, useEffect } from 'react';
import { canAccessTools } from '@/lib/profileStorage';

interface BuildingMetadataProps {
  building: EnhancedBuilding;
}

// Priority badge color based on organizing priority (1-10)
function getPriorityColor(priority: number | undefined): string {
  if (!priority) return 'bg-gray-200 text-gray-600';
  if (priority >= 8) return 'bg-red-100 text-red-800 border-red-300';
  if (priority >= 6) return 'bg-orange-100 text-orange-800 border-orange-300';
  if (priority >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  return 'bg-green-100 text-green-800 border-green-300';
}

// Accountability score color (0-100, lower is worse)
function getScoreColor(score: number | undefined): string {
  if (score === undefined) return 'text-gray-500';
  if (score >= 70) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  if (score >= 30) return 'text-orange-600';
  return 'text-red-600';
}

// Mortgage status display
function getMortgageDisplay(status: string | undefined, year: number | undefined): { text: string; color: string } {
  if (status === 'likely_paid') {
    return { text: `Likely paid off (${year})`, color: 'text-green-600' };
  }
  if (status === 'likely_active') {
    return { text: `Est. payoff: ${year}`, color: 'text-orange-600' };
  }
  return { text: 'Unknown', color: 'text-gray-500' };
}

export function BuildingMetadata({ building }: BuildingMetadataProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showExpanded, setShowExpanded] = useState(false);
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
        Show building info
      </button>
    );
  }

  const mortgage = getMortgageDisplay(building.estimatedMortgageStatus, building.estimatedMortgageYear);

  return (
    <div className="absolute top-24 right-4 bg-white/95 p-4 rounded shadow-lg max-w-sm z-10 max-h-[70vh] overflow-y-auto">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-sm text-gray-900">Building Details</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 text-xs"
        >
          ✕
        </button>
      </div>

      {/* ===== BASIC INFO (Always Visible) ===== */}
      <dl className="space-y-1 text-xs">
        <div>
          <dt className="text-gray-500 inline">Owner:</dt>
          <dd className="text-gray-900 inline ml-1">{building.owner}</dd>
        </div>

        <div>
          <dt className="text-gray-500 inline">Units:</dt>
          <dd className="text-gray-900 inline ml-1">{building.units.toLocaleString()}</dd>
          {building.estimatedTenants && building.estimatedTenants !== building.units && (
            <span className="text-gray-400 ml-1">(~{building.estimatedTenants.toLocaleString()} tenants)</span>
          )}
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

      {/* ===== EXPANDED INFO (Collapsible) ===== */}
      <div className="mt-3 border-t pt-2">
        <button
          onClick={() => setShowExpanded(!showExpanded)}
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <span>{showExpanded ? '▼' : '▶'}</span>
          <span>{showExpanded ? 'Hide' : 'Show'} property details</span>
        </button>

        {showExpanded && (
          <dl className="space-y-1 text-xs mt-2">
            {/* Mortgage Status */}
            <div>
              <dt className="text-gray-500 inline">Mortgage:</dt>
              <dd className={`inline ml-1 ${mortgage.color}`}>{mortgage.text}</dd>
            </div>

            {/* Value per Unit */}
            {building.valuePerUnit && (
              <div>
                <dt className="text-gray-500 inline">Value/Unit:</dt>
                <dd className="text-gray-900 inline ml-1">${building.valuePerUnit.toLocaleString()}</dd>
              </div>
            )}

            {/* Neighborhood */}
            {building.neighborhood && (
              <div>
                <dt className="text-gray-500 inline">Neighborhood:</dt>
                <dd className="text-gray-900 inline ml-1">{building.neighborhood}</dd>
              </div>
            )}

            {/* Zoning */}
            {building.zoning && (
              <div>
                <dt className="text-gray-500 inline">Zoning:</dt>
                <dd className="text-gray-900 inline ml-1">{building.zoning}</dd>
              </div>
            )}

            {/* Land Use */}
            {building.landUseCode && (
              <div>
                <dt className="text-gray-500 inline">Land Use:</dt>
                <dd className="text-gray-900 inline ml-1">
                  {building.landUseDescription || `Code ${building.landUseCode}`}
                </dd>
              </div>
            )}

            {/* Acres */}
            {building.acres && (
              <div>
                <dt className="text-gray-500 inline">Lot Size:</dt>
                <dd className="text-gray-900 inline ml-1">{building.acres.toFixed(2)} acres</dd>
              </div>
            )}

            {/* Owner Address (mailing) */}
            {building.ownerAddress && (
              <div>
                <dt className="text-gray-500 block">Owner Mailing:</dt>
                <dd className="text-gray-900 text-[10px] ml-2">{building.ownerAddress}</dd>
              </div>
            )}

            {/* Land vs Improvement Value */}
            {(building.assessedLandValue || building.assessedImprovementValue) && (
              <div className="pt-1">
                <dt className="text-gray-500 block text-[10px]">Value Breakdown:</dt>
                <dd className="text-gray-700 text-[10px] ml-2">
                  {building.assessedLandValue && (
                    <div>Land: ${building.assessedLandValue.toLocaleString()}</div>
                  )}
                  {building.assessedImprovementValue && (
                    <div>Improvements: ${building.assessedImprovementValue.toLocaleString()}</div>
                  )}
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>

      {/* ===== ORGANIZER INTELLIGENCE (Role-Gated) ===== */}
      {isOrganizer && (
        <div className="mt-3 border-t pt-2">
          <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <span className="text-red-600">★</span> Organizing Intelligence
          </h4>

          {/* Priority Badge */}
          {building.organizingPriority !== undefined && (
            <div className="mb-2">
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${getPriorityColor(building.organizingPriority)}`}>
                Priority: {building.organizingPriority}/10
              </span>
              {building.organizingStatus && (
                <span className="ml-2 text-[10px] text-gray-500 capitalize">
                  ({building.organizingStatus})
                </span>
              )}
            </div>
          )}

          <dl className="space-y-1 text-xs">
            {/* Corporate Ownership */}
            {building.isCorporateOwned !== undefined && (
              <div>
                <dt className="text-gray-500 inline">Ownership:</dt>
                <dd className={`inline ml-1 ${building.isCorporateOwned ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                  {building.isCorporateOwned ? '🏢 Corporate' : '👤 Individual'}
                  {building.entityType && building.entityType !== 'corporate' && (
                    <span className="text-gray-400 ml-1">({building.entityType})</span>
                  )}
                </dd>
              </div>
            )}

            {/* Portfolio Size */}
            {building.portfolioSize && building.portfolioSize > 1 && (
              <div>
                <dt className="text-gray-500 inline">Portfolio:</dt>
                <dd className="text-gray-900 inline ml-1">
                  Owns {building.portfolioSize.toLocaleString()} properties
                  {building.landlordPortfolioSize && building.landlordPortfolioSize !== building.portfolioSize && (
                    <span className="text-gray-400"> (local: {building.landlordPortfolioSize})</span>
                  )}
                </dd>
              </div>
            )}

            {/* Accountability Score */}
            {building.overallAccountabilityScore !== undefined && (
              <div>
                <dt className="text-gray-500 inline">Accountability:</dt>
                <dd className={`inline ml-1 font-medium ${getScoreColor(building.overallAccountabilityScore)}`}>
                  {building.overallAccountabilityScore}/100
                </dd>
              </div>
            )}

            {/* Violations */}
            {(building.totalViolations !== undefined && building.totalViolations > 0) && (
              <div>
                <dt className="text-gray-500 inline">Violations:</dt>
                <dd className="text-gray-900 inline ml-1">
                  {building.totalViolations} total
                  {building.criticalViolations && building.criticalViolations > 0 && (
                    <span className="text-red-600 font-medium ml-1">({building.criticalViolations} critical)</span>
                  )}
                  {building.openViolations && building.openViolations > 0 && (
                    <span className="text-orange-600 ml-1">({building.openViolations} open)</span>
                  )}
                </dd>
              </div>
            )}

            {/* Eviction Rate */}
            {building.evictionsPer100Units !== undefined && building.evictionsPer100Units > 0 && (
              <div>
                <dt className="text-gray-500 inline">Evictions:</dt>
                <dd className={`inline ml-1 ${building.evictionsPer100Units > 5 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                  {building.evictionsPer100Units.toFixed(1)} per 100 units
                </dd>
              </div>
            )}

            {/* Eviction Success Rate */}
            {building.evictionSuccessRate !== undefined && building.evictionSuccessRate > 0 && (
              <div>
                <dt className="text-gray-500 inline">Landlord win rate:</dt>
                <dd className={`inline ml-1 ${building.evictionSuccessRate > 70 ? 'text-red-600' : 'text-green-600'}`}>
                  {building.evictionSuccessRate.toFixed(0)}%
                </dd>
              </div>
            )}

            {/* Tenant Defense Rate */}
            {building.tenantDefenseRate !== undefined && building.tenantDefenseRate > 0 && (
              <div>
                <dt className="text-gray-500 inline">Tenant representation:</dt>
                <dd className={`inline ml-1 ${building.tenantDefenseRate > 50 ? 'text-green-600' : 'text-orange-600'}`}>
                  {building.tenantDefenseRate.toFixed(0)}%
                </dd>
              </div>
            )}

            {/* Avg Days to Resolution */}
            {building.avgDaysToResolution !== undefined && building.avgDaysToResolution > 0 && (
              <div>
                <dt className="text-gray-500 inline">Avg repair time:</dt>
                <dd className={`inline ml-1 ${building.avgDaysToResolution > 14 ? 'text-red-600' : 'text-gray-900'}`}>
                  {building.avgDaysToResolution.toFixed(0)} days
                </dd>
              </div>
            )}

            {/* Turnover Pattern */}
            {building.tenantTurnoverPattern && (
              <div>
                <dt className="text-gray-500 inline">Turnover:</dt>
                <dd className={`inline ml-1 capitalize ${building.tenantTurnoverPattern === 'high' ? 'text-red-600' : 'text-gray-900'}`}>
                  {building.tenantTurnoverPattern}
                </dd>
              </div>
            )}

            {/* Last Contact */}
            {building.lastContactDate && (
              <div>
                <dt className="text-gray-500 inline">Last contact:</dt>
                <dd className="text-gray-900 inline ml-1">{building.lastContactDate}</dd>
              </div>
            )}

            {/* Campaign Notes */}
            {building.campaignNotes && (
              <div className="pt-1">
                <dt className="text-gray-500 block">Notes:</dt>
                <dd className="text-gray-700 text-[10px] ml-2 italic">{building.campaignNotes}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
