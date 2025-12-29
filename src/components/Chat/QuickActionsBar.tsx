'use client'

import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import type { LinkedPropertyGroup } from '@/lib/linkedPropertiesStorage'

export type ProposalType =
  | 'report-issue'
  | 'start-vote'

interface QuickActionsBarProps {
  building: EnhancedBuilding
  propertyGroup: LinkedPropertyGroup | null
  issuesCount: number
  activeVotesCount: number
  onSelectProposal: (type: ProposalType) => void
  onViewIssues: () => void
}

interface ActionConfig {
  type: ProposalType | 'view-issues'
  label: string
  condition?: 'bloc-only'
}

const ACTIONS: ActionConfig[] = [
  { type: 'report-issue', label: 'Report Issue' },
  { type: 'view-issues', label: 'View Issues' },
  { type: 'start-vote', label: 'Start Bloc Vote', condition: 'bloc-only' },
]

export function QuickActionsBar({
  building,
  propertyGroup,
  issuesCount,
  activeVotesCount,
  onSelectProposal,
  onViewIssues,
}: QuickActionsBarProps) {
  const handleActionClick = (type: string) => {
    if (type === 'view-issues') {
      onViewIssues()
    } else {
      onSelectProposal(type as ProposalType)
    }
  }

  // Filter out bloc-only actions when not in a bloc
  const visibleActions = ACTIONS.filter(action => {
    if (action.condition === 'bloc-only' && !propertyGroup) return false
    return true
  })

  return (
    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
      {/* Action Buttons - Outlined Style */}
      <div className="flex flex-wrap gap-2">
        {visibleActions.map(action => (
          <button
            key={action.type}
            onClick={() => handleActionClick(action.type)}
            className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            {action.label}
            {action.type === 'view-issues' && issuesCount > 0 && (
              <span className="ml-1">({issuesCount})</span>
            )}
          </button>
        ))}
      </div>

      {/* Active Votes Indicator */}
      {propertyGroup && activeVotesCount > 0 && (
        <div className="mt-2 flex items-center gap-1 text-xs text-purple-600 font-medium">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {activeVotesCount} active vote{activeVotesCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
