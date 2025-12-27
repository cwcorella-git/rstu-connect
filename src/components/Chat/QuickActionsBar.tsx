'use client'

import { useState } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import type { LinkedPropertyGroup } from '@/lib/linkedPropertiesStorage'

export type ProposalType =
  | 'suggest-meeting'
  | 'report-issue'
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
}

interface ActionGroup {
  label: string
  actions: Array<{
    type: ProposalType
    label: string
    description: string
  }>
}

const ACTION_GROUPS: ActionGroup[] = [
  {
    label: 'Organize',
    actions: [
      {
        type: 'form-bloc',
        label: 'Form New Bloc',
        description: 'Create a bloc with nearby properties',
      },
      {
        type: 'join-bloc',
        label: 'Join Existing Bloc',
        description: 'Propose joining an established bloc',
      },
    ],
  },
  {
    label: 'Take Action',
    actions: [
      {
        type: 'demand-letter',
        label: 'Draft Demand Letter',
        description: 'Draft collective demands to landlord',
      },
      {
        type: 'petition',
        label: 'Start Petition',
        description: 'Collect signatures for a cause',
      },
      {
        type: 'rent-strike',
        label: 'Rent Strike Vote',
        description: 'Call a vote on withholding rent collectively',
      },
    ],
  },
]

export function QuickActionsBar({
  building,
  propertyGroup,
  issuesCount,
  activeVotesCount,
  onSelectProposal,
  onViewIssues,
}: QuickActionsBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleQuickAction = (type: ProposalType) => {
    onSelectProposal(type)
    setIsDropdownOpen(false)
  }

  const handleViewIssues = () => {
    onViewIssues()
    setIsDropdownOpen(false)
  }

  const handleClose = () => {
    setIsDropdownOpen(false)
  }

  // Filter groups based on context
  let visibleGroups = [...ACTION_GROUPS]
  if (propertyGroup) {
    visibleGroups.push({
      label: 'Governance',
      actions: [
        {
          type: 'start-vote',
          label: 'Start Bloc Vote',
          description: 'Create a governance proposal for the bloc',
        },
      ],
    })
  }

  return (
    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 space-y-2">
      {/* Primary Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        {/* Report Issue Button */}
        <button
          onClick={() => handleQuickAction('report-issue')}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Report Issue
        </button>

        {/* Suggest Meeting Button */}
        <button
          onClick={() => handleQuickAction('suggest-meeting')}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Suggest Meeting
        </button>

        {/* View Issues Button */}
        <button
          onClick={handleViewIssues}
          className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium text-gray-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          View Issues
          {issuesCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {issuesCount}
            </span>
          )}
        </button>

        {/* More Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            More
            <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={handleClose}
              />

              {/* Menu Panel */}
              <div className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  {visibleGroups.map((group, groupIndex) => (
                    <div key={group.label}>
                      {groupIndex > 0 && <div className="border-t border-gray-100" />}
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-500 px-2 py-1.5 uppercase tracking-wide">
                          {group.label}
                        </p>
                        <div className="space-y-0.5">
                          {group.actions.map((action) => (
                            <button
                              key={action.type}
                              onClick={() => handleQuickAction(action.type)}
                              className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition"
                            >
                              <p className="text-sm font-medium text-gray-900">
                                {action.label}
                              </p>
                              <p className="text-xs text-gray-500">
                                {action.description}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Active Votes Indicator */}
      {propertyGroup && activeVotesCount > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-purple-600 font-medium">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {activeVotesCount} active vote{activeVotesCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
