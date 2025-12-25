'use client'

import { useRef, useEffect } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import type { LandlordProfile, LandlordProperty } from '@/lib/landlordProfileStorage'
import { formatCurrency, formatUnits } from '@/lib/landlordProfileStorage'

interface LandlordPortfolioSlideoutProps {
  landlordProfile: LandlordProfile
  currentBuilding: EnhancedBuilding
  allBuildings: EnhancedBuilding[]
  isOpen: boolean
  onClose: () => void
  onSelectBuildingWithChat: (building: EnhancedBuilding) => void
}

export function LandlordPortfolioSlideout({
  landlordProfile,
  currentBuilding,
  allBuildings,
  isOpen,
  onClose,
  onSelectBuildingWithChat,
}: LandlordPortfolioSlideoutProps) {
  const slideoutRef = useRef<HTMLDivElement>(null)

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (slideoutRef.current && !slideoutRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Find full building data for each property in the portfolio
  const getBuilding = (prop: LandlordProperty): EnhancedBuilding | undefined => {
    return allBuildings.find(b => b.apn === prop.apn)
  }

  // Count properties with issues
  const propertiesWithIssues = landlordProfile.properties.filter(
    p => p.complaintsCount > 0 || p.demandsCount > 0
  ).length

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
        aria-hidden="true"
      />

      {/* Slideout Panel */}
      <div
        ref={slideoutRef}
        className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl z-50 flex flex-col animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-label="Landlord Portfolio"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              {landlordProfile.isCorporateOwned && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded">
                  CORP
                </span>
              )}
              <h2 className="text-base font-bold text-gray-900 truncate">
                {landlordProfile.ownerName}
              </h2>
            </div>
            <p className="text-xs text-gray-500">Landlord Portfolio</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
            aria-label="Close portfolio"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Solidarity Message */}
        {landlordProfile.totalProperties >= 2 && (
          <div className="px-4 py-3 bg-rstu-red/5 border-b border-rstu-red/20">
            <p className="text-xs text-rstu-red leading-relaxed">
              <strong>Your landlord controls {landlordProfile.totalProperties} properties</strong> with{' '}
              {landlordProfile.totalUnits.toLocaleString()} total units. Tenants across these buildings
              share common interests.{' '}
              <span className="font-medium italic">An injury to one is an injury to all.</span>
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-px bg-gray-200 border-b border-gray-200 flex-shrink-0">
          <div className="bg-white p-3 text-center">
            <div className="text-lg font-bold text-gray-900">{landlordProfile.totalProperties}</div>
            <div className="text-xs text-gray-500">Properties</div>
          </div>
          <div className="bg-white p-3 text-center">
            <div className="text-lg font-bold text-gray-900">{formatUnits(landlordProfile.totalUnits)}</div>
            <div className="text-xs text-gray-500">Units</div>
          </div>
          <div className="bg-white p-3 text-center">
            <div className="text-lg font-bold text-gray-900">{formatCurrency(landlordProfile.totalValue)}</div>
            <div className="text-xs text-gray-500">Value</div>
          </div>
        </div>

        {/* Issue Summary */}
        {(landlordProfile.totalComplaints > 0 || landlordProfile.totalDemands > 0) && (
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 flex-shrink-0">
            <h3 className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">
              Issues Across Portfolio
            </h3>
            <div className="flex flex-wrap gap-3 text-xs">
              {propertiesWithIssues > 0 && (
                <span className="text-amber-700">
                  <strong>{propertiesWithIssues}</strong> buildings with activity
                </span>
              )}
              {landlordProfile.totalComplaints > 0 && (
                <span className="text-red-600">
                  <strong>{landlordProfile.totalComplaints}</strong> complaints
                </span>
              )}
              {landlordProfile.totalDemands > 0 && (
                <span className="text-purple-600">
                  <strong>{landlordProfile.totalDemands}</strong> demands
                </span>
              )}
            </div>
          </div>
        )}

        {/* Property List */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 sticky top-0">
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Properties ({landlordProfile.totalProperties})
            </h3>
          </div>
          <ul className="divide-y divide-gray-100">
            {landlordProfile.properties.map((prop) => {
              const building = getBuilding(prop)
              const isCurrent = prop.apn === currentBuilding.apn

              return (
                <li
                  key={prop.apn}
                  className={`px-4 py-3 ${isCurrent ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium truncate ${isCurrent ? 'text-blue-900' : 'text-gray-900'}`}>
                          {prop.address}
                        </p>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{prop.units} units</span>
                        <span>{formatCurrency(prop.value)}</span>
                        {(prop.complaintsCount > 0 || prop.demandsCount > 0) && (
                          <span className="text-amber-600 font-medium">
                            {prop.complaintsCount + prop.demandsCount} issues
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Join Chat Button */}
                    {!isCurrent && building && (
                      <button
                        onClick={() => onSelectBuildingWithChat(building)}
                        className="flex-shrink-0 px-2.5 py-1.5 text-xs font-medium bg-rstu-red text-white rounded hover:bg-rstu-red-dark transition-colors"
                      >
                        Join Chat
                      </button>
                    )}
                  </div>

                  {/* Status indicator */}
                  {prop.organizingStatus !== 'inactive' && (
                    <div className="mt-2">
                      <span className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded ${
                        prop.organizingStatus === 'active' ? 'bg-green-100 text-green-700' :
                        prop.organizingStatus === 'emerging' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {prop.organizingStatus === 'active' ? 'Active' :
                         prop.organizingStatus === 'emerging' ? 'Emerging' :
                         prop.organizingStatus}
                      </span>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3 bg-gray-50 flex-shrink-0">
          <p className="text-xs text-gray-400 text-center">
            Connect with tenants at other buildings to coordinate
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.2s ease-out;
        }
      `}</style>
    </>
  )
}
