'use client'

import { useBuildingCampaign } from '@/hooks/useBuildingCampaign'
import { useLanguage } from '@/contexts/LanguageContext'
import type { EnhancedBuilding } from '@/lib/data/getBuildingsData'
import type { LinkedPropertyGroup } from '@/lib/storage/linkedPropertiesStorage'

export type ProposalType =
  | 'report-issue'
  | 'start-vote'
  | 'report-eviction'
  | 'start-commitment'

interface QuickActionsBarProps {
  building: EnhancedBuilding
  propertyGroup: LinkedPropertyGroup | null
  issuesCount: number
  activeVotesCount: number
  onSelectProposal: (type: ProposalType) => void
  onViewIssues: () => void
  onViewCampaign?: () => void
}

interface ActionConfig {
  type: ProposalType | 'view-issues' | 'view-campaign'
  label: string
  condition?: 'bloc-only' | 'has-campaign'
}

const ACTIONS: ActionConfig[] = [
  { type: 'report-issue', label: 'Report Issue' },
  { type: 'view-issues', label: 'View Issues' },
  { type: 'start-commitment', label: 'Start Commitment' },
  { type: 'view-campaign', label: 'Campaign', condition: 'has-campaign' },
  { type: 'report-eviction', label: 'Report Eviction' },
  { type: 'start-vote', label: 'Start Bloc Vote', condition: 'bloc-only' },
]

export function QuickActionsBar({
  building,
  propertyGroup,
  issuesCount,
  activeVotesCount,
  onSelectProposal,
  onViewIssues,
  onViewCampaign,
}: QuickActionsBarProps) {
  const { t } = useLanguage()
  const { campaignInfo } = useBuildingCampaign(building.chatSlug)

  const handleActionClick = (type: string) => {
    if (type === 'view-issues') {
      onViewIssues()
    } else if (type === 'view-campaign') {
      onViewCampaign?.()
    } else {
      onSelectProposal(type as ProposalType)
    }
  }

  // Filter out conditional actions
  const visibleActions = ACTIONS.filter(action => {
    if (action.condition === 'bloc-only' && !propertyGroup) return false
    if (action.condition === 'has-campaign' && !campaignInfo.isActive) return false
    return true
  })

  return (
    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
      {/* Action Buttons - Outlined Style */}
      <div className="flex flex-wrap gap-2">
        {visibleActions.map(action => {
          // Special styling for campaign button
          const isCampaign = action.type === 'view-campaign'
          const isActiveStrike = isCampaign && campaignInfo.campaign?.stage === 'active'

          return (
            <button
              key={action.type}
              onClick={() => handleActionClick(action.type)}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                isActiveStrike
                  ? 'text-white bg-red-500 border border-red-500 hover:bg-red-600'
                  : isCampaign
                    ? 'text-amber-700 bg-amber-50 border border-amber-300 hover:bg-amber-100'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {action.label}
              {action.type === 'view-issues' && issuesCount > 0 && (
                <span className="ml-1">({issuesCount})</span>
              )}
              {isCampaign && campaignInfo.campaign && (
                <span className="ml-1">({campaignInfo.stageName})</span>
              )}
            </button>
          )
        })}
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
