'use client'

import type { LandlordProfile } from '@/lib/landlordProfileStorage'
import { formatCurrency, formatUnits } from '@/lib/landlordProfileStorage'
import { ComplaintSummary } from './ComplaintSummary'
import { getStatusInfo, type OrganizingStatus } from '@/lib/buildingOrganizingStorage'

interface LandlordDetailProps {
  landlord: LandlordProfile
  onSelectBuilding: (chatSlug: string) => void
}

export function LandlordDetail({ landlord, onSelectBuilding }: LandlordDetailProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-900 break-words">
          {landlord.ownerName}
        </h2>
        <div className="flex items-center gap-2 mt-1">
          {landlord.isCorporateOwned && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
              Corporate Landlord
            </span>
          )}
          {landlord.accountabilityScore !== undefined && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
              Score: {landlord.accountabilityScore.toFixed(0)}
            </span>
          )}
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Portfolio Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {landlord.totalProperties}
            </div>
            <div className="text-xs text-gray-500">Properties</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatUnits(landlord.totalUnits)}
            </div>
            <div className="text-xs text-gray-500">Total Units</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(landlord.totalValue)}
            </div>
            <div className="text-xs text-gray-500">Assessed Value</div>
          </div>
        </div>
      </div>

      {/* Organizing Status */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Organizing Status</h3>
        <div className="grid grid-cols-2 gap-2">
          {(['strike_ready', 'active', 'emerging', 'inactive'] as OrganizingStatus[]).map(status => {
            const count = landlord.statusCounts[status]
            const info = getStatusInfo(status)
            return (
              <div
                key={status}
                className={`p-2 rounded-lg ${info.bgColor} flex items-center gap-2`}
              >
                <span className={`text-xl font-bold ${info.color}`}>{count}</span>
                <span className={`text-xs ${info.color}`}>{info.label}</span>
              </div>
            )
          })}
        </div>
        {landlord.buildingsWithActivity > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {landlord.buildingsWithActivity} of {landlord.totalProperties} buildings have organizing activity
          </p>
        )}
      </div>

      {/* Complaint Patterns */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Complaint Patterns</h3>
        <ComplaintSummary
          complaintsByCategory={landlord.complaintsByCategory}
          totalComplaints={landlord.totalComplaints}
        />
        {landlord.totalDemands > 0 && (
          <div className="mt-3 p-2 bg-green-50 rounded-lg">
            <span className="text-sm text-green-700 font-medium">
              {landlord.totalDemands} approved demand{landlord.totalDemands !== 1 ? 's' : ''} across portfolio
            </span>
          </div>
        )}
      </div>

      {/* Properties List */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Properties ({landlord.properties.length})
        </h3>
        <div className="space-y-2">
          {landlord.properties.map(property => {
            const statusInfo = getStatusInfo(property.organizingStatus)
            return (
              <button
                key={property.apn}
                onClick={() => onSelectBuilding(property.chatSlug)}
                className="w-full p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {property.address.split(',')[0]}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {property.units} units &middot; {formatCurrency(property.value)}
                    </div>
                  </div>
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                {(property.complaintsCount > 0 || property.demandsCount > 0) && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    {property.complaintsCount > 0 && (
                      <span className="text-orange-600">
                        {property.complaintsCount} complaint{property.complaintsCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    {property.demandsCount > 0 && (
                      <span className="text-green-600">
                        {property.demandsCount} demand{property.demandsCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
