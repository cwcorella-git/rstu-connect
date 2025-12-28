'use client'

import { useMemo } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import type { StrikePreparation } from '@/lib/strikeStorage'
import { getBuildingCanvass } from '@/lib/canvassStorage'
import { updateFinancialData, updateTenantBudget } from '@/lib/strikeStorage'

interface FinancialCalculatorProps {
  strikePrep: StrikePreparation
  building: EnhancedBuilding
}

export function FinancialCalculator({
  strikePrep,
  building,
}: FinancialCalculatorProps) {
  const canvass = getBuildingCanvass(building.chatSlug)

  // Calculate financial metrics
  const financialData = useMemo(() => {
    if (!canvass) return null

    const committedUnits = strikePrep.participation.committedUnits
    let totalRent = 0
    const budgets: {
      unitId: string
      unitNumber: string
      rent: number
      runway: number
    }[] = []

    committedUnits.forEach(unitId => {
      const unit = canvass.units[unitId]
      if (unit?.rentAmount && unit.rentAmount > 0) {
        totalRent += unit.rentAmount
        budgets.push({
          unitId,
          unitNumber: unit.unitNumber,
          rent: unit.rentAmount,
          runway: calculateRunway(unit.rentAmount),
        })
      }
    })

    return {
      monthlyRentAtRisk: totalRent,
      escrowBalance: strikePrep.legalChecklist.escrowAccount?.monthlyDeposits.reduce((a, b) => a + b, 0) || 0,
      mutualAidGoal: totalRent * 3, // 3 months
      budgets,
    }
  }, [strikePrep.participation.committedUnits, canvass?.lastModified])

  // Calculate financial runway for a tenant
  function calculateRunway(monthlyRent: number): number {
    // This is a placeholder - in a real app would estimate based on savings data
    // For now, assume average person has 1-2 months expenses saved
    return 2
  }

  // Identify vulnerable tenants (low financial runway)
  const vulnerableTenants = financialData?.budgets.filter(b => b.runway < 2) || []

  if (!canvass) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">
          No canvassing data found. Financial data requires unit rent information.
        </p>
      </div>
    )
  }

  if (!financialData || strikePrep.participation.committedUnits.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">
          Add committed units to calculate financial impact.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Financial Impact Summary */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Monthly Rent at Risk"
          value={`$${financialData.monthlyRentAtRisk.toLocaleString()}`}
          description="Landlord loses per month"
          color="red"
        />
        <StatCard
          label="Escrow Balance"
          value={`$${financialData.escrowBalance.toLocaleString()}`}
          description="Deposited in account"
          color="blue"
        />
        <StatCard
          label="Mutual Aid Goal"
          value={`$${financialData.mutualAidGoal.toLocaleString()}`}
          description="3-month runway"
          color="green"
        />
      </div>

      {/* Individual Tenant Budgets */}
      <div className="border rounded-lg p-3">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Tenant Financial Readiness
        </h4>
        <div className="space-y-2">
          {financialData.budgets.map((budget) => (
            <div
              key={budget.unitId}
              className={`flex items-center justify-between p-2 rounded border ${
                budget.runway < 2
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Unit {budget.unitNumber}
                </div>
                <div className="text-xs text-gray-600">
                  <span className="font-medium">${budget.rent}/mo</span> |{' '}
                  <span>Runway: {budget.runway} months</span>
                </div>
              </div>
              <div className="text-right">
                {budget.runway < 2 && (
                  <span className="text-xs text-red-600 font-medium">
                    ⚠️ High priority for mutual aid
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vulnerable Tenants Alert */}
      {vulnerableTenants.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-red-900 mb-2">
            ⚠️ High-Priority Mutual Aid Needed
          </h4>
          <p className="text-xs text-red-800 mb-2">
            {vulnerableTenants.length} tenant(s) have less than 2 months financial runway:
          </p>
          <div className="space-y-1">
            {vulnerableTenants.map((budget) => (
              <div key={budget.unitId} className="text-xs text-red-800">
                • Unit {budget.unitNumber} (${budget.rent}/mo, {budget.runway} months runway)
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mutual Aid Activation */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-green-900 mb-2">
          Mutual Aid Activation
        </h4>
        <p className="text-xs text-green-800 mb-3">
          Estimated needs for vulnerable tenants: groceries, utilities, childcare, legal fees
        </p>
        {strikePrep.mutualAid.strikeFundCampaignId ? (
          <div className="p-2 bg-green-100 rounded text-xs text-green-800 font-medium">
            ✓ Strike support campaign activated
          </div>
        ) : (
          <button className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors">
            Activate Strike Support Campaign →
          </button>
        )}
      </div>

      {/* Escrow Deposit Tracker */}
      <div className="border rounded-lg p-3">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          Escrow Deposit Log
        </h4>
        {strikePrep.legalChecklist.escrowAccount?.monthlyDeposits &&
        strikePrep.legalChecklist.escrowAccount.monthlyDeposits.length > 0 ? (
          <div className="space-y-1">
            {strikePrep.legalChecklist.escrowAccount.monthlyDeposits.map(
              (amount, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs p-1 hover:bg-gray-50 rounded"
                >
                  <span className="text-gray-600">Month {idx + 1}</span>
                  <span className="font-medium text-gray-900">
                    ${amount.toLocaleString()}
                  </span>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            No deposits recorded yet. Deposits will appear here as they're added.
          </p>
        )}
      </div>

      {/* Financial Messaging */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          Negotiation Leverage
        </h4>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Monthly Pressure:</strong> Landlord loses{' '}
            <span className="font-bold">
              ${financialData.monthlyRentAtRisk.toLocaleString()}/month
            </span>
          </p>
          <p>
            <strong>Strike Duration:</strong> Can sustain{' '}
            <span className="font-bold">3+ months</span> with mutual aid
          </p>
          <p>
            <strong>Negotiation Window:</strong> Pressure peaks around week 2-3 of strike
          </p>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  description: string
  color: 'red' | 'blue' | 'green'
}

function StatCard({ label, value, description, color }: StatCardProps) {
  const colorClasses = {
    red: 'bg-red-50 border-red-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
  }

  const textClasses = {
    red: 'text-red-700',
    blue: 'text-blue-700',
    green: 'text-green-700',
  }

  return (
    <div className={`border rounded-lg p-2 ${colorClasses[color]}`}>
      <p className={`text-xs font-medium ${textClasses[color]} mb-1`}>{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className={`text-xs ${textClasses[color]} mt-1`}>{description}</p>
    </div>
  )
}
