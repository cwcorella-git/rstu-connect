'use client'

import React, { useMemo } from 'react'
import { identifyAtRiskTenants, type AtRiskTenant } from '@/lib/storage/evictionDefenseStorage'
import { getStoredProfiles } from '@/lib/storage/profileStorage'
import { EnhancedBuilding } from '@/lib/data/getBuildingsData'

interface PreventionDashboardProps {
  buildings: EnhancedBuilding[]
  onSelectCase?: (profileId: string, buildingApn: string) => void
}

export function PreventionDashboard({ buildings, onSelectCase }: PreventionDashboardProps) {
  const atRiskTenants = useMemo(() => {
    const profiles = getStoredProfiles()
    return identifyAtRiskTenants(profiles, buildings)
  }, [buildings])

  const getRiskColor = (score: number): string => {
    if (score >= 80) return 'bg-red-50 border-red-200'
    if (score >= 50) return 'bg-orange-50 border-orange-200'
    if (score >= 20) return 'bg-yellow-50 border-yellow-200'
    return 'bg-gray-50 border-gray-200'
  }

  const getRiskBadgeColor = (score: number): string => {
    if (score >= 80) return 'bg-red-100 text-red-700'
    if (score >= 50) return 'bg-orange-100 text-orange-700'
    if (score >= 20) return 'bg-yellow-100 text-yellow-700'
    return 'bg-gray-100 text-gray-700'
  }

  const getRiskLabel = (score: number): string => {
    if (score >= 80) return 'CRITICAL'
    if (score >= 50) return 'HIGH'
    if (score >= 20) return 'MEDIUM'
    return 'LOW'
  }

  const getFactorLabel = (factor: string): string => {
    switch (factor) {
      case 'rent_arrears':
        return 'Rent Arrears'
      case 'recent_complaint':
        return 'Recent Complaint'
      case 'retaliation_risk':
        return 'Retaliation Risk'
      case 'lease_expiring':
        return 'Lease Expiring Soon'
      default:
        return factor
    }
  }

  const getInterventionColor = (intervention: string): string => {
    switch (intervention) {
      case 'rent_assistance':
        return 'bg-green-100 text-green-700'
      case 'legal_clinic':
        return 'bg-blue-100 text-blue-700'
      case 'lease_workshop':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getInterventionLabel = (intervention: string): string => {
    switch (intervention) {
      case 'rent_assistance':
        return 'Rent Assistance'
      case 'legal_clinic':
        return 'Legal Clinic'
      case 'lease_workshop':
        return 'Lease Workshop'
      default:
        return intervention
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <h2 className="text-lg font-bold text-gray-900">At-Risk Tenants</h2>
        <p className="text-sm text-gray-600 mt-1">Proactive eviction prevention & early intervention</p>
      </div>

      {/* Summary Stats */}
      <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-200">
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-700">{atRiskTenants.filter(t => t.riskScore >= 80).length}</div>
            <div className="text-xs text-red-600 font-medium">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-700">{atRiskTenants.filter(t => t.riskScore >= 50 && t.riskScore < 80).length}</div>
            <div className="text-xs text-orange-600 font-medium">High</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-700">{atRiskTenants.filter(t => t.riskScore >= 20 && t.riskScore < 50).length}</div>
            <div className="text-xs text-yellow-600 font-medium">Medium</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-700">{atRiskTenants.filter(t => t.riskScore < 20).length}</div>
            <div className="text-xs text-gray-600 font-medium">Low</div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {atRiskTenants.length === 0 ? (
          <div className="flex items-center justify-center h-full p-4 text-center">
            <div>
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No At-Risk Tenants</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Great news! No tenants currently identified as at-risk. Monitor the dashboard as new cases are reported.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {atRiskTenants.map((tenant, i) => {
              const building = buildings.find(b => b.apn === tenant.buildingApn)

              return (
                <div
                  key={`${tenant.profileId}:${tenant.buildingApn}`}
                  className={`p-4 border-l-4 border-l-gray-200 hover:bg-opacity-75 transition-colors ${getRiskColor(tenant.riskScore)}`}
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-gray-900">
                          Tenant (ID: {tenant.profileId.substring(0, 8)})
                        </h3>
                        <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap ${getRiskBadgeColor(tenant.riskScore)}`}>
                          {getRiskLabel(tenant.riskScore)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate mt-0.5">
                        {building?.address || `Building (APN: ${tenant.buildingApn})`}
                      </p>
                    </div>
                  </div>

                  {/* Risk Score Gauge */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">Risk Score</span>
                      <span className="text-sm font-bold text-gray-900">{tenant.riskScore}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          tenant.riskScore >= 80
                            ? 'bg-red-600'
                            : tenant.riskScore >= 50
                            ? 'bg-orange-600'
                            : tenant.riskScore >= 20
                            ? 'bg-yellow-600'
                            : 'bg-green-600'
                        }`}
                        style={{ width: `${tenant.riskScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Risk Factors */}
                  {tenant.riskFactors.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold text-gray-700 mb-1">Risk Factors</h4>
                      <div className="flex flex-wrap gap-1">
                        {tenant.riskFactors.map((factor) => (
                          <span
                            key={factor}
                            className="inline-block px-2 py-0.5 rounded text-xs bg-white border border-gray-300 text-gray-700"
                          >
                            {getFactorLabel(factor)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Interventions */}
                  {tenant.suggestedInterventions.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Suggested Actions</h4>
                      <div className="space-y-2">
                        {tenant.suggestedInterventions.map((intervention) => (
                          <button
                            key={intervention}
                            onClick={() => onSelectCase?.(tenant.profileId, tenant.buildingApn)}
                            className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-colors ${getInterventionColor(intervention)} hover:opacity-80`}
                          >
                            {getInterventionLabel(intervention)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => onSelectCase?.(tenant.profileId, tenant.buildingApn)}
                    className="w-full mt-2 px-3 py-2 bg-rstu-red text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
                  >
                    View Case / Take Action
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-blue-50 border-t border-gray-200 text-xs text-blue-700">
        <p>
          <strong>How it works:</strong> At-risk tenants are identified based on active or recent eviction cases at their building. Early intervention through rent assistance or legal clinics can prevent displacement.
        </p>
      </div>
    </div>
  )
}
