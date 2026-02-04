'use client'

import { useState, useEffect } from 'react'
import {
  HomeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  BanknotesIcon,
  ScaleIcon,
  KeyIcon,
  CurrencyDollarIcon,
  BoltIcon,
  LockClosedIcon,
  EllipsisHorizontalCircleIcon,
} from '@heroicons/react/24/outline'
import {
  type EscalationCase,
  type EscalationStage,
  getActiveCases,
  getCasesByBuilding,
  getBuildingStats,
  getCasesNeedingAttention,
  getEnhancedSuggestion,
} from '@/lib/storage/escalationStorage'

interface EscalationTrackerProps {
  buildingId: string
  buildingAddress: string
  onSelectCase?: (caseData: EscalationCase) => void
  onCreateNew?: () => void
}

const stageLabels: Record<EscalationStage, string> = {
  identified: 'Identified',
  drafted: 'Drafted',
  delivered: 'Delivered',
  awaiting: 'Awaiting',
  escalating: 'Escalating',
  resolved: 'Resolved',
}

const stageColors: Record<EscalationStage, string> = {
  identified: 'bg-gray-100 text-gray-700',
  drafted: 'bg-blue-100 text-blue-700',
  delivered: 'bg-yellow-100 text-yellow-700',
  awaiting: 'bg-orange-100 text-orange-700',
  escalating: 'bg-red-100 text-red-700',
  resolved: 'bg-green-100 text-green-700',
}

const severityColors: Record<string, string> = {
  minor: 'text-gray-500',
  moderate: 'text-yellow-600',
  serious: 'text-orange-600',
  emergency: 'text-red-600',
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  habitability: HomeIcon,
  lease: DocumentTextIcon,
  harassment: ExclamationTriangleIcon,
  retaliation: ShieldExclamationIcon,
  rent: BanknotesIcon,
  discrimination: ScaleIcon,
  illegal_entry: KeyIcon,
  security_deposit: CurrencyDollarIcon,
  utilities: BoltIcon,
  eviction: LockClosedIcon,
  other: EllipsisHorizontalCircleIcon,
}

export function EscalationTracker({
  buildingId,
  buildingAddress,
  onSelectCase,
  onCreateNew,
}: EscalationTrackerProps) {
  const [cases, setCases] = useState<EscalationCase[]>([])
  const [showResolved, setShowResolved] = useState(false)
  const [stats, setStats] = useState<ReturnType<typeof getBuildingStats> | null>(null)
  const [attentionCases, setAttentionCases] = useState<EscalationCase[]>([])

  useEffect(() => {
    loadCases()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingId, showResolved])

  const loadCases = () => {
    const allCases = getCasesByBuilding(buildingId)
    const filtered = showResolved
      ? allCases
      : allCases.filter(c => c.stage !== 'resolved')
    setCases(filtered.sort((a, b) => b.updatedAt - a.updatedAt))
    setStats(getBuildingStats(buildingId))
    setAttentionCases(getCasesNeedingAttention(buildingId))
  }

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  const getDeadlineStatus = (caseData: EscalationCase) => {
    if (!caseData.deadlineDate || caseData.stage !== 'delivered') return null
    const now = Date.now()
    const daysUntil = Math.ceil((caseData.deadlineDate - now) / (24 * 60 * 60 * 1000))

    if (daysUntil < 0) {
      return { label: `${Math.abs(daysUntil)}d overdue`, color: 'text-red-600 font-semibold' }
    }
    if (daysUntil === 0) {
      return { label: 'Due today', color: 'text-orange-600 font-semibold' }
    }
    if (daysUntil <= 3) {
      return { label: `${daysUntil}d left`, color: 'text-yellow-600' }
    }
    return { label: `${daysUntil}d left`, color: 'text-gray-500' }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-lg">📈</span>
            Escalation Tracker
          </h3>
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Report Issue
            </button>
          )}
        </div>

        {/* Stats Row */}
        {stats && stats.total > 0 && (
          <div className="flex flex-wrap gap-3 text-xs mb-3">
            <span className="px-2 py-1 bg-gray-100 rounded">
              {stats.active} active
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
              {stats.victories} won
            </span>
            {stats.avgResolutionDays !== null && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                ~{stats.avgResolutionDays}d avg
              </span>
            )}
            {attentionCases.length > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-medium">
                {attentionCases.length} need attention
              </span>
            )}
          </div>
        )}

        {/* Show Resolved Toggle */}
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="rounded"
          />
          Show resolved cases
        </label>
      </div>

      {/* Cases List */}
      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {cases.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <HomeIcon className="w-12 h-12 mx-auto mb-2" />
            <p className="font-medium">No escalation cases yet</p>
            <p className="text-sm mt-1">Report an issue to start tracking</p>
          </div>
        ) : (
          cases.map((caseData) => {
            const suggestion = getEnhancedSuggestion(caseData, { includeBuildingHistory: false, includeLandlordPattern: false })
            const deadline = getDeadlineStatus(caseData)
            const needsAttention = attentionCases.some(c => c.id === caseData.id)

            return (
              <div
                key={caseData.id}
                onClick={() => onSelectCase?.(caseData)}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  needsAttention ? 'bg-red-50/50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Category Icon */}
                  <div className="flex-shrink-0 text-gray-500">
                    {(() => {
                      const IconComponent = categoryIcons[caseData.category] || EllipsisHorizontalCircleIcon
                      return <IconComponent className="w-6 h-6" />
                    })()}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title Row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-gray-900 truncate">
                        {caseData.title}
                      </h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${stageColors[caseData.stage]}`}>
                        {stageLabels[caseData.stage]}
                      </span>
                      {caseData.severity === 'emergency' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-600 text-white">
                          EMERGENCY
                        </span>
                      )}
                    </div>

                    {/* Affected Units */}
                    <p className="text-sm text-gray-600 mt-0.5">
                      {caseData.affectedUnits.length === 1
                        ? `Unit ${caseData.affectedUnits[0]}`
                        : caseData.affectedUnits.includes('building-wide')
                        ? 'Building-wide'
                        : `${caseData.affectedUnits.length} units affected`}
                    </p>

                    {/* Deadline & Time in Stage */}
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      {deadline && (
                        <span className={deadline.color}>
                          ⏱️ {deadline.label}
                        </span>
                      )}
                      <span className="text-gray-400">
                        Day {suggestion.daysInCurrentStage} • Updated {formatTimeAgo(caseData.updatedAt)}
                      </span>
                    </div>

                    {/* Enhanced Suggested Action */}
                    {caseData.stage !== 'resolved' && (
                      <div className={`mt-2 text-xs flex items-center gap-2 ${
                        suggestion.urgent ? 'text-red-600 font-medium' :
                        suggestion.confidence === 'high' ? 'text-green-600' :
                        'text-blue-600'
                      }`}>
                        <span>{suggestion.urgent ? '🚨' : suggestion.confidence === 'high' ? '✓' : '→'}</span>
                        <span>{suggestion.action}</span>
                        {suggestion.confidence === 'high' && !suggestion.urgent && (
                          <span className="text-xs px-1 py-0.5 bg-green-100 text-green-700 rounded">
                            recommended
                          </span>
                        )}
                      </div>
                    )}

                    {/* Resolution Badge */}
                    {caseData.stage === 'resolved' && caseData.resolution && (
                      <div className={`mt-2 text-xs px-2 py-1 rounded inline-block ${
                        caseData.resolution.type === 'victory'
                          ? 'bg-green-100 text-green-700'
                          : caseData.resolution.type === 'compromise'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {caseData.resolution.type === 'victory' && '✓ '}
                        {caseData.resolution.summary}
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      {cases.length > 0 && (
        <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
          <button
            onClick={loadCases}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  )
}
