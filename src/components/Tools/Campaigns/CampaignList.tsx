'use client'

import { useState, useMemo } from 'react'
import type { Campaign } from '@/lib/campaignStorage'
import {
  getStageLabel,
  getStageColor,
  getOutcomeColor,
  getCampaignProgress,
  formatCampaignDate,
} from '@/lib/campaignStorage'

interface CampaignListProps {
  campaigns: Campaign[]
  selectedCampaign: Campaign | null
  onSelectCampaign: (campaign: Campaign) => void
  onCreateNew: () => void
}

type FilterOption = 'all' | 'active' | 'resolved'

export function CampaignList({
  campaigns,
  selectedCampaign,
  onSelectCampaign,
  onCreateNew,
}: CampaignListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterOption>('active')

  const filteredCampaigns = useMemo(() => {
    let result = [...campaigns]

    // Filter by status
    if (filter === 'active') {
      result = result.filter((c) => c.stage !== 'resolved')
    } else if (filter === 'resolved') {
      result = result.filter((c) => c.stage === 'resolved')
    }

    // Search
    const query = searchQuery.toLowerCase().trim()
    if (query) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.landlordName.toLowerCase().includes(query)
      )
    }

    // Sort: active by stage progress, resolved by date
    result.sort((a, b) => {
      if (a.stage === 'resolved' && b.stage === 'resolved') {
        const aDate = a.resolvedDate || a.updated.toString()
        const bDate = b.resolvedDate || b.updated.toString()
        return new Date(bDate).getTime() - new Date(aDate).getTime()
      }
      if (a.stage === 'resolved') return 1
      if (b.stage === 'resolved') return -1
      return getCampaignProgress(b.stage) - getCampaignProgress(a.stage)
    })

    return result
  }, [campaigns, searchQuery, filter])

  const activeCount = campaigns.filter((c) => c.stage !== 'resolved').length
  const resolvedCount = campaigns.filter((c) => c.stage === 'resolved').length

  return (
    <>
      {/* Search and filters */}
      <div className="px-4 pb-4 space-y-3 border-b border-gray-200">
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
              filter === 'all'
                ? 'bg-gray-800 border-gray-800 text-white'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            All ({campaigns.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
              filter === 'active'
                ? 'bg-rstu-red border-rstu-red text-white'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
              filter === 'resolved'
                ? 'bg-green-600 border-green-600 text-white'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        {/* Create button */}
        <button
          onClick={onCreateNew}
          className="w-full py-2 bg-rstu-red text-white rounded-md text-sm font-medium hover:bg-red-700 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          New Campaign
        </button>
      </div>

      {/* Campaign list */}
      <div className="flex-1 overflow-y-auto">
        {filteredCampaigns.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p>
              {campaigns.length === 0
                ? 'No campaigns yet'
                : 'No campaigns match your filter'}
            </p>
          </div>
        ) : (
          filteredCampaigns.map((campaign) => (
            <button
              key={campaign.id}
              onClick={() => onSelectCampaign(campaign)}
              className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                selectedCampaign?.id === campaign.id
                  ? 'bg-red-50 border-l-4 border-l-rstu-red'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getStageColor(
                        campaign.stage
                      )}`}
                    >
                      {getStageLabel(campaign.stage)}
                    </span>
                    {campaign.stage === 'resolved' && campaign.outcome !== 'pending' && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getOutcomeColor(
                          campaign.outcome
                        )}`}
                      >
                        {campaign.outcome.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm truncate">
                    {campaign.name}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">{campaign.landlordName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-gray-400">
                    {formatCampaignDate(campaign.startDate)}
                  </div>
                  {campaign.buildingChatSlugs.length > 0 && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {campaign.buildingChatSlugs.length} building
                      {campaign.buildingChatSlugs.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar for active campaigns */}
              {campaign.stage !== 'resolved' && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rstu-red rounded-full transition-all"
                        style={{ width: `${getCampaignProgress(campaign.stage)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {getCampaignProgress(campaign.stage)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Next action if set */}
              {campaign.nextAction && campaign.stage !== 'resolved' && (
                <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="truncate">{campaign.nextAction}</span>
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </>
  )
}
