'use client'

import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import type { LinkedPropertyGroup } from '@/lib/linkedPropertiesStorage'

export type ProposalType =
  | 'report-issue'
  | 'suggest-meeting'
  | 'form-bloc'
  | 'join-bloc'
  | 'rent-strike'
  | 'demand-letter'
  | 'petition'
  | 'start-vote'

interface QuickActionsBarProps {
  building: EnhancedBuilding
  propertyGroup: LinkedPropertyGroup | null
  issuesCount: number
  activeVotesCount: number
  onSelectProposal: (type: ProposalType) => void
  onViewIssues: () => void
  onOpenEvents?: () => void
}

interface ActionConfig {
  type: ProposalType | 'view-issues'
  label: string
  condition?: 'bloc-only'
}

const ACTIONS: ActionConfig[] = [
  { type: 'report-issue', label: 'Report Issue' },
  { type: 'suggest-meeting', label: 'Suggest Meeting' },
  { type: 'view-issues', label: 'View Issues' },
  { type: 'form-bloc', label: 'Form New Bloc' },
  { type: 'join-bloc', label: 'Join Existing Bloc' },
  { type: 'demand-letter', label: 'Draft Demand Letter' },
  { type: 'petition', label: 'Start Petition' },
  { type: 'rent-strike', label: 'Rent Strike Vote' },
  { type: 'start-vote', label: 'Start Bloc Vote', condition: 'bloc-only' },
]

export function QuickActionsBar({
  building,
  propertyGroup,
  issuesCount,
  activeVotesCount,
  onSelectProposal,
  onViewIssues,
  onOpenEvents,
}: QuickActionsBarProps) {
  const handleActionClick = (type: string) => {
    if (type === 'view-issues') {
      onViewIssues()
    } else if (type === 'suggest-meeting') {
      onOpenEvents?.()
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
      {/* Action Buttons - Simple Text Style */}
      <div className="flex flex-wrap gap-2">
        {visibleActions.map(action => (
          <button
            key={action.type}
            onClick={() => handleActionClick(action.type)}
            className="px-3 py-1 text-sm font-medium text-rstu-red hover:text-red-700 hover:underline transition-colors"
          >
            {action.label}
            {action.type === 'view-issues' && issuesCount > 0 && (
              <span className="ml-1 text-xs">({issuesCount})</span>
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
