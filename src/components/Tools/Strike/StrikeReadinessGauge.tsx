'use client'

import type { StrikeReadiness } from '@/lib/strikeStorage'

interface StrikeReadinessGaugeProps {
  readiness: StrikeReadiness
}

export function StrikeReadinessGauge({ readiness }: StrikeReadinessGaugeProps) {
  const { overallReady, legalReady, participationReady, demandsReady, defenseReady } = readiness

  // Calculate percentage complete
  const itemsComplete = [legalReady, participationReady, demandsReady, defenseReady].filter(
    Boolean
  ).length
  const percentComplete = Math.round((itemsComplete / 4) * 100)

  return (
    <div
      className={`mx-4 my-3 rounded-lg p-4 border-2 transition-colors ${
        overallReady ? 'bg-green-50 border-green-500' : 'bg-orange-50 border-orange-400'
      }`}
    >
      {/* Header with Status */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Strike Readiness</h3>
        <div
          className={`text-3xl font-bold ${
            overallReady ? 'text-green-700' : 'text-orange-700'
          }`}
        >
          {overallReady ? '✓' : '⚠️'}
        </div>
      </div>

      {/* Status Text */}
      <p
        className={`text-sm font-semibold mb-3 ${
          overallReady ? 'text-green-800' : 'text-orange-800'
        }`}
      >
        {overallReady ? 'READY FOR AUTHORIZATION' : `${percentComplete}% COMPLETE`}
      </p>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full transition-all ${
            overallReady ? 'bg-green-500' : 'bg-orange-500'
          }`}
          style={{ width: `${percentComplete}%` }}
        />
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        <ReadinessItem
          label="Legal Compliance"
          complete={legalReady}
          description="Notices, escrow, clinic consultation"
        />
        <ReadinessItem
          label="Participation (65%+)"
          complete={participationReady}
          description="Tenant commitment threshold"
        />
        <ReadinessItem
          label="Demands Approved"
          complete={demandsReady}
          description="Governance vote passed"
        />
        <ReadinessItem
          label="Defense Coordinated"
          complete={defenseReady}
          description="Attorneys assigned, evidence documented"
        />
      </div>
    </div>
  )
}

interface ReadinessItemProps {
  label: string
  complete: boolean
  description?: string
}

function ReadinessItem({ label, complete, description }: ReadinessItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-1">
        {complete ? (
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
        ) : (
          <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-gray-300" />
        )}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${complete ? 'text-green-900' : 'text-gray-700'}`}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  )
}
