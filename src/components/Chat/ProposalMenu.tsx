'use client'

import { useState } from 'react'
import type { EnhancedBuilding } from '@/lib/data/getBuildingsData'
import type { LinkedPropertyGroup } from '@/lib/storage/linkedPropertiesStorage'

export type ProposalCategory =
  | 'meetings'
  | 'issues'
  | 'bloc-formation'
  | 'collective-action'
  | 'governance'

export type ProposalType =
  | 'suggest-meeting'
  | 'report-issue'
  | 'form-bloc'
  | 'join-bloc'
  | 'rent-strike'
  | 'demand-letter'
  | 'petition'
  | 'start-vote'

interface ProposalMenuProps {
  building: EnhancedBuilding
  propertyGroup: LinkedPropertyGroup | null
  issuesCount: number
  activeVotesCount: number
  onSelectProposal: (type: ProposalType) => void
  onViewIssues: () => void
}

interface CategoryConfig {
  id: ProposalCategory
  label: string
  icon: React.ReactNode
  color: string
  hoverColor: string
  borderColor: string
  types: ProposalType[]
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: 'meetings',
    label: 'Meetings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'text-blue-600',
    hoverColor: 'hover:bg-blue-50',
    borderColor: 'border-blue-200',
    types: ['suggest-meeting'],
  },
  {
    id: 'issues',
    label: 'Issues',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    color: 'text-red-600',
    hoverColor: 'hover:bg-red-50',
    borderColor: 'border-red-200',
    types: ['report-issue'],
  },
  {
    id: 'bloc-formation',
    label: 'Blocs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    color: 'text-purple-600',
    hoverColor: 'hover:bg-purple-50',
    borderColor: 'border-purple-200',
    types: ['form-bloc', 'join-bloc'],
  },
  {
    id: 'collective-action',
    label: 'Action',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
    color: 'text-orange-600',
    hoverColor: 'hover:bg-orange-50',
    borderColor: 'border-orange-200',
    types: ['rent-strike', 'demand-letter', 'petition'],
  },
  {
    id: 'governance',
    label: 'Govern',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'text-green-600',
    hoverColor: 'hover:bg-green-50',
    borderColor: 'border-green-200',
    types: ['start-vote'],
  },
]

const PROPOSAL_TYPE_LABELS: Record<ProposalType, { label: string; description: string }> = {
  'suggest-meeting': {
    label: 'Suggest Meeting',
    description: 'Propose a time for tenants to meet',
  },
  'report-issue': {
    label: 'Report Issue',
    description: 'Flag a building problem for collective attention',
  },
  'form-bloc': {
    label: 'Form New Bloc',
    description: 'Create a bloc with nearby properties',
  },
  'join-bloc': {
    label: 'Join Existing Bloc',
    description: 'Propose joining an established bloc',
  },
  'rent-strike': {
    label: 'Rent Strike Vote',
    description: 'Call a vote on withholding rent collectively',
  },
  'demand-letter': {
    label: 'Send Demand Letter',
    description: 'Draft collective demands to landlord',
  },
  'petition': {
    label: 'Start Petition',
    description: 'Collect signatures for a cause',
  },
  'start-vote': {
    label: 'Start a Vote',
    description: 'Create a governance proposal for the bloc',
  },
}

export function ProposalMenu({
  building,
  propertyGroup,
  issuesCount,
  activeVotesCount,
  onSelectProposal,
  onViewIssues,
}: ProposalMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ProposalCategory | null>(null)

  const handleCategoryClick = (category: CategoryConfig) => {
    if (category.types.length === 1) {
      // Single action - execute directly
      onSelectProposal(category.types[0])
      setIsOpen(false)
      setSelectedCategory(null)
    } else {
      // Multiple options - show submenu
      setSelectedCategory(category.id)
    }
  }

  const handleTypeClick = (type: ProposalType) => {
    onSelectProposal(type)
    setIsOpen(false)
    setSelectedCategory(null)
  }

  const handleClose = () => {
    setIsOpen(false)
    setSelectedCategory(null)
  }

  // Filter categories based on context
  const visibleCategories = CATEGORIES.filter(cat => {
    // Governance only shows if property is in a bloc
    if (cat.id === 'governance' && !propertyGroup) return false
    return true
  })

  return (
    <div className="relative">
      {/* Take Action Button */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex gap-2 items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rstu-red rounded-lg hover:bg-red-700 transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Take Action
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Quick view issues button */}
        <button
          onClick={onViewIssues}
          className="flex items-center gap-1.5 px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
        >
          <span className="text-gray-600">View Issues</span>
          {issuesCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {issuesCount}
            </span>
          )}
        </button>

        {/* Active votes indicator */}
        {propertyGroup && activeVotesCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-purple-600">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {activeVotesCount} active vote{activeVotesCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Expanded Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={handleClose}
          />

          {/* Menu Panel */}
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
            {selectedCategory === null ? (
              /* Category Grid */
              <div className="p-3">
                <p className="text-xs text-gray-500 mb-2 font-medium">What would you like to do?</p>
                <div className="grid grid-cols-5 gap-2">
                  {visibleCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border ${cat.borderColor} ${cat.hoverColor} transition`}
                    >
                      <span className={cat.color}>{cat.icon}</span>
                      <span className="text-xs font-medium text-gray-700">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Submenu for category with multiple options */
              <div className="p-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-1 text-xs text-gray-500 mb-2 hover:text-gray-700"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <div className="space-y-1">
                  {CATEGORIES.find(c => c.id === selectedCategory)?.types.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeClick(type)}
                      className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {PROPOSAL_TYPE_LABELS[type].label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {PROPOSAL_TYPE_LABELS[type].description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
