'use client'

import type { LandlordProfile } from '@/lib/storage/landlordProfileStorage'
import { formatCurrency, formatUnits } from '@/lib/storage/landlordProfileStorage'

interface LandlordCardProps {
  landlord: LandlordProfile
  isSelected: boolean
  onClick: () => void
}

export function LandlordCard({ landlord, isSelected, onClick }: LandlordCardProps) {
  const hasActivity = landlord.buildingsWithActivity > 0

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-200 ${
        isSelected ? 'bg-red-50 border-l-4 border-rstu-red' : ''
      }`}
    >
      {/* Owner name / Management company name */}
      <div className="font-medium text-gray-900 text-sm pr-12 line-clamp-1">
        {landlord.ownerName}
      </div>

      {/* Management company badge (for grouped entities) */}
      {landlord.managementCompanyId && (
        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">
          {landlord.childOwnerNames?.length || 1} entities
        </span>
      )}

      {/* Corporate badge (for individual owners) */}
      {!landlord.managementCompanyId && landlord.isCorporateOwned && (
        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">
          Corporate
        </span>
      )}

      {/* Stats row */}
      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
        <span>{landlord.totalProperties} properties</span>
        <span>&middot;</span>
        <span>{formatUnits(landlord.totalUnits)} units</span>
      </div>

      {/* Value */}
      <div className="text-xs text-gray-400 mt-0.5">
        {formatCurrency(landlord.totalValue)} assessed
      </div>

      {/* Activity indicators */}
      {hasActivity && (
        <div className="mt-1 flex items-center gap-2 text-xs">
          {landlord.totalComplaints > 0 && (
            <span className="text-orange-600">
              {landlord.totalComplaints} complaint{landlord.totalComplaints !== 1 ? 's' : ''}
            </span>
          )}
          {landlord.totalDemands > 0 && (
            <span className="text-green-600">
              {landlord.totalDemands} demand{landlord.totalDemands !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Status breakdown */}
      {(landlord.statusCounts.strike_ready > 0 ||
        landlord.statusCounts.active > 0 ||
        landlord.statusCounts.emerging > 0) && (
        <div className="mt-1 flex items-center gap-0.5">
          {landlord.statusCounts.strike_ready > 0 && (
            <span className="px-1 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700">
              {landlord.statusCounts.strike_ready} strike-ready
            </span>
          )}
          {landlord.statusCounts.active > 0 && (
            <span className="px-1 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
              {landlord.statusCounts.active} active
            </span>
          )}
          {landlord.statusCounts.emerging > 0 && (
            <span className="px-1 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-700">
              {landlord.statusCounts.emerging} emerging
            </span>
          )}
        </div>
      )}
    </button>
  )
}
