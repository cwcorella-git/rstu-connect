'use client'

import { useMemo, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { BuildingOffice2Icon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import type { EnhancedBuilding } from '@/lib/data/getBuildingsData'
import { buildLandlordProfile, formatUnits, type LandlordProfile } from '@/lib/storage/landlordProfileStorage'
import { LandlordPortfolioSlideout } from './LandlordPortfolioSlideout'

interface LandlordConnectionSectionProps {
  building: EnhancedBuilding
  allBuildings: EnhancedBuilding[]
  onSelectBuilding: (building: EnhancedBuilding) => void
}

export function LandlordConnectionSection({
  building,
  allBuildings,
  onSelectBuilding,
}: LandlordConnectionSectionProps) {
  const { t } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPortfolio, setShowPortfolio] = useState(false)

  // Build landlord profile
  const landlordProfile = useMemo(() => {
    if (!building.owner || allBuildings.length === 0) return null
    return buildLandlordProfile(building.owner, allBuildings)
  }, [building.owner, allBuildings])

  // Get top 3 other properties (excluding current, prioritize active organizing)
  // Must be called before early return to satisfy React hooks rules
  const otherProperties = useMemo(() => {
    if (!landlordProfile) return []
    return landlordProfile.properties
      .filter(p => p.apn !== building.apn)
      .sort((a, b) => {
        // Prioritize properties with organizing activity
        const statusOrder = { active: 0, emerging: 1, strike_ready: 0, inactive: 2 }
        const aOrder = statusOrder[a.organizingStatus]
        const bOrder = statusOrder[b.organizingStatus]
        if (aOrder !== bOrder) return aOrder - bOrder
        // Then by unit count (larger buildings have more potential)
        return b.units - a.units
      })
      .slice(0, 3)
  }, [landlordProfile, building.apn])

  // Only show if landlord owns 2+ properties (meaning there are other properties to connect with)
  if (!landlordProfile || landlordProfile.totalProperties < 2) {
    return null
  }

  // Count other properties total
  const otherPropertyCount = landlordProfile.totalProperties - 1
  const otherUnitCount = landlordProfile.totalUnits - building.units

  // Count active/emerging properties (excluding current)
  const activeCount = landlordProfile.properties.filter(
    p => p.apn !== building.apn && (p.organizingStatus === 'active' || p.organizingStatus === 'strike_ready')
  ).length
  const emergingCount = landlordProfile.properties.filter(
    p => p.apn !== building.apn && p.organizingStatus === 'emerging'
  ).length

  // Get building data for a property
  const getBuildingForApn = (apn: string) => allBuildings.find(b => b.apn === apn)

  return (
    <>
      <div className="mx-4 mb-2 mt-2">
        <div className="bg-purple-50 border border-purple-200 rounded-lg overflow-hidden">
          {/* Header - always visible */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-purple-100/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BuildingOffice2Icon className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-purple-900">
                  {t('landlord.portfolioHeading', { count: otherPropertyCount })}
                </p>
                <p className="text-xs text-purple-600">
                  {formatUnits(otherUnitCount)} {t('landlord.unitsAcrossArea')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(activeCount > 0 || emergingCount > 0) && (
                <div className="flex items-center gap-1 mr-2">
                  {activeCount > 0 && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">
                      {activeCount} {t('landlord.active')}
                    </span>
                  )}
                  {emergingCount > 0 && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                      {emergingCount} {t('landlord.emerging')}
                    </span>
                  )}
                </div>
              )}
              {isExpanded ? (
                <ChevronUpIcon className="w-4 h-4 text-purple-500" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 text-purple-500" />
              )}
            </div>
          </button>

          {/* Expanded content */}
          {isExpanded && (
            <div className="border-t border-purple-200 px-3 py-2 space-y-2">
              {/* Solidarity message */}
              <p className="text-xs text-purple-700 leading-relaxed">
                {landlordProfile.isCorporateOwned
                  ? t('landlord.corporateSolidarity')
                  : t('landlord.individualSolidarity')}
              </p>

              {/* Top 3 properties */}
              <div className="space-y-1.5">
                {otherProperties.map(prop => {
                  const propBuilding = getBuildingForApn(prop.apn)
                  return (
                    <div
                      key={prop.apn}
                      className="flex items-center justify-between bg-white rounded p-2 border border-purple-100"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {prop.address}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                          <span>{prop.units} {t('landlord.units')}</span>
                          {prop.organizingStatus !== 'inactive' && (
                            <span className={`font-medium ${
                              prop.organizingStatus === 'active' || prop.organizingStatus === 'strike_ready'
                                ? 'text-green-600'
                                : 'text-yellow-600'
                            }`}>
                              {prop.organizingStatus === 'active' || prop.organizingStatus === 'strike_ready'
                                ? t('landlord.activeStatus')
                                : t('landlord.emergingStatus')}
                            </span>
                          )}
                        </div>
                      </div>
                      {propBuilding && (
                        <button
                          onClick={() => onSelectBuilding(propBuilding)}
                          className="flex-shrink-0 ml-2 px-2 py-1 text-[10px] font-medium bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                        >
                          {t('landlord.connect')}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* View all button */}
              {otherPropertyCount > 3 && (
                <button
                  onClick={() => setShowPortfolio(true)}
                  className="w-full text-center py-1.5 text-xs font-medium text-purple-700 hover:text-purple-900 transition-colors"
                >
                  {t('landlord.viewAll', { count: otherPropertyCount })} →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Slideout */}
      <LandlordPortfolioSlideout
        landlordProfile={landlordProfile}
        currentBuilding={building}
        allBuildings={allBuildings}
        isOpen={showPortfolio}
        onClose={() => setShowPortfolio(false)}
        onSelectBuildingWithChat={(selectedBuilding) => {
          setShowPortfolio(false)
          onSelectBuilding(selectedBuilding)
        }}
      />
    </>
  )
}
