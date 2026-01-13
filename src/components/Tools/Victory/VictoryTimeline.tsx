'use client'

import { useMemo } from 'react'
import { type Victory } from '@/lib/victoryStorage'
import { getAllCampaigns, type Campaign, type CampaignStage } from '@/lib/campaignStorage'
import { getAllCases, type EvictionCase, type EvictionCaseStage } from '@/lib/evictionDefenseStorage'

interface VictoryTimelineProps {
  victory: Victory
  onClose: () => void
}

interface TimelineEvent {
  date: string
  type: 'campaign_start' | 'campaign_stage' | 'campaign_resolved' | 'eviction_status' | 'victory'
  title: string
  description?: string
  source: 'campaign' | 'eviction' | 'victory'
}

// Stage labels for campaigns
const STAGE_LABELS: Record<CampaignStage, string> = {
  intelligence: 'Intelligence Gathering',
  organizing: 'Organizing Tenants',
  commitment: 'Building Commitment',
  preparation: 'Action Preparation',
  active: 'Active Campaign',
  resolved: 'Campaign Resolved',
}

// Status labels for eviction defense
const EVICTION_STAGE_LABELS: Record<EvictionCaseStage, string> = {
  filed: 'Case Filed',
  answered: 'Answer Filed',
  'hearing-scheduled': 'Hearing Scheduled',
  court: 'In Court',
  resolved: 'Case Resolved',
}

export function VictoryTimeline({ victory, onClose }: VictoryTimelineProps) {
  // Find linked campaigns and eviction defenses
  const timelineData = useMemo(() => {
    const events: TimelineEvent[] = []
    let linkedCampaign: Campaign | null = null
    let linkedEviction: EvictionCase | null = null

    // Find campaign linked to this victory
    const campaigns = getAllCampaigns()
    linkedCampaign = campaigns.find(c => c.victoryId === victory.id) || null

    if (linkedCampaign) {
      // Add campaign start
      events.push({
        date: linkedCampaign.startDate,
        type: 'campaign_start',
        title: `Campaign Started: ${linkedCampaign.name}`,
        description: `${linkedCampaign.participatingUnits || linkedCampaign.estimatedUnits || '?'} units against ${linkedCampaign.landlordName}`,
        source: 'campaign',
      })

      // Add stage changes
      linkedCampaign.stageChanges.forEach(change => {
        events.push({
          date: change.date,
          type: 'campaign_stage',
          title: `Stage: ${STAGE_LABELS[change.stage]}`,
          source: 'campaign',
        })
      })

      // Add resolved
      if (linkedCampaign.resolvedDate) {
        events.push({
          date: linkedCampaign.resolvedDate,
          type: 'campaign_resolved',
          title: 'Campaign Resolved',
          description: linkedCampaign.outcomeDetails,
          source: 'campaign',
        })
      }
    }

    // Find eviction case linked to this victory
    const cases = getAllCases()
    linkedEviction = cases.find(c => c.outcome?.victoryId === victory.id) || null

    if (linkedEviction) {
      // Add eviction case start
      events.push({
        date: new Date(linkedEviction.createdAt).toISOString().split('T')[0],
        type: 'eviction_status',
        title: `Eviction Defense Started`,
        description: `${linkedEviction.tenantName} at ${linkedEviction.buildingAddress}${linkedEviction.unitNumber ? ` Unit ${linkedEviction.unitNumber}` : ''}`,
        source: 'eviction',
      })

      // Add filing date if available
      if (linkedEviction.filingDate) {
        events.push({
          date: linkedEviction.filingDate,
          type: 'eviction_status',
          title: `Status: ${EVICTION_STAGE_LABELS['filed']}`,
          source: 'eviction',
        })
      }

      // Add court date if scheduled
      if (linkedEviction.courtDate) {
        events.push({
          date: linkedEviction.courtDate,
          type: 'eviction_status',
          title: `Court Date`,
          description: linkedEviction.legalRepresentation?.hasAttorney
            ? `Represented by ${linkedEviction.legalRepresentation.attorneyName || 'attorney'}`
            : undefined,
          source: 'eviction',
        })
      }

      // Add outcome if resolved
      if (linkedEviction.outcome) {
        events.push({
          date: linkedEviction.outcome.date,
          type: 'eviction_status',
          title: `Case Resolved: ${linkedEviction.outcome.result.charAt(0).toUpperCase() + linkedEviction.outcome.result.slice(1)}`,
          source: 'eviction',
        })
      }
    }

    // Add victory
    events.push({
      date: victory.date,
      type: 'victory',
      title: victory.title,
      description: victory.quantifiedImpact || victory.description.substring(0, 100),
      source: 'victory',
    })

    // Sort by date
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return { events, linkedCampaign, linkedEviction }
  }, [victory])

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Get color for event type
  const getEventColor = (source: TimelineEvent['source']) => {
    switch (source) {
      case 'campaign':
        return 'bg-purple-500 border-purple-600'
      case 'eviction':
        return 'bg-orange-500 border-orange-600'
      case 'victory':
        return 'bg-green-500 border-green-600'
      default:
        return 'bg-gray-500 border-gray-600'
    }
  }

  // Get background for event type
  const getEventBg = (source: TimelineEvent['source']) => {
    switch (source) {
      case 'campaign':
        return 'bg-purple-50 border-purple-200'
      case 'eviction':
        return 'bg-orange-50 border-orange-200'
      case 'victory':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const { events, linkedCampaign, linkedEviction } = timelineData

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Victory Timeline</h2>
              <p className="text-sm text-gray-500 mt-1">
                Journey to: {victory.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-3">
            {linkedCampaign && (
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-xs text-gray-600">Campaign</span>
              </div>
            )}
            {linkedEviction && (
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-xs text-gray-600">Eviction Defense</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-600">Victory</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-4">
          {events.length === 1 && events[0].type === 'victory' ? (
            // No linked campaign/eviction
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">No linked campaign or eviction defense</p>
              <p className="text-xs text-gray-400 mt-1">
                This victory was documented independently
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

              {/* Events */}
              <div className="space-y-4">
                {events.map((event, idx) => (
                  <div key={idx} className="relative pl-10">
                    {/* Dot */}
                    <div
                      className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 ${getEventColor(event.source)}`}
                    />

                    {/* Event card */}
                    <div className={`p-3 rounded-lg border ${getEventBg(event.source)}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">{formatDate(event.date)}</span>
                        {event.type === 'victory' && (
                          <span className="px-1.5 py-0.5 bg-green-600 text-white text-[10px] rounded font-medium">
                            WIN
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                      {event.description && (
                        <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with summary */}
        {events.length > 1 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {(() => {
                    const startDate = new Date(events[0].date)
                    const endDate = new Date(events[events.length - 1].date)
                    const days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                    if (days < 7) return `${days} days`
                    if (days < 30) return `${Math.round(days / 7)} weeks`
                    return `${Math.round(days / 30)} months`
                  })()}
                </div>
                <div className="text-xs text-gray-500">Campaign Duration</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{events.length}</div>
                <div className="text-xs text-gray-500">Timeline Events</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
