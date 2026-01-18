'use client'

import { useState, useEffect, useMemo } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useBuildingCampaign } from '@/hooks/useBuildingCampaign'
import { getCurrentProfile } from '@/lib/profileStorage'
import {
  CAMPAIGN_STAGES,
  CAMPAIGN_OUTCOMES,
  addCampaignNote,
  getCampaignProgress,
  type Campaign,
  type CampaignDemand,
  type CampaignStage,
} from '@/lib/campaignStorage'

interface CampaignPanelContentProps {
  chatSlug: string
  buildingName: string
}

// Stage colors for progress bar
const STAGE_COLORS: Record<CampaignStage, string> = {
  intelligence: 'bg-blue-500',
  organizing: 'bg-yellow-500',
  commitment: 'bg-orange-500',
  preparation: 'bg-amber-500',
  active: 'bg-red-500',
  resolved: 'bg-green-500',
}

export function CampaignPanelContent({ chatSlug, buildingName }: CampaignPanelContentProps) {
  const { t } = useLanguage()
  const { campaignInfo, isLoading, refresh } = useBuildingCampaign(chatSlug)
  const [newNote, setNewNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddNote = async () => {
    if (!newNote.trim() || !campaignInfo.campaign) return

    const profile = getCurrentProfile()
    if (!profile) return

    setIsSubmitting(true)
    try {
      addCampaignNote(campaignInfo.campaign.id, profile.nickname, newNote.trim())
      setNewNote('')
      refresh()
    } catch (err) {
      console.error('[CampaignPanel] Failed to add note:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  if (!campaignInfo.isActive || !campaignInfo.campaign) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h4 className="text-sm font-medium text-gray-900 mb-1">
          {t('campaign.noCampaign') || 'No Active Campaign'}
        </h4>
        <p className="text-xs text-gray-500">
          {t('campaign.startFromTools') || 'Campaigns can be started from the Tools tab or Power Map.'}
        </p>
      </div>
    )
  }

  const { campaign, stageName, stageProgress, participationRate, monthlyRentAtRisk, demandsProgress, nextAction } = campaignInfo
  const participating = campaign.participatingUnits || 0
  const estimated = campaign.estimatedUnits || 0

  // Get recent notes (last 5)
  const recentNotes = [...(campaign.notes || [])].reverse().slice(0, 5)

  return (
    <div className="space-y-4">
      {/* Campaign Name */}
      <div>
        <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
        <p className="text-xs text-gray-500">vs. {campaign.landlordName}</p>
      </div>

      {/* Stage Progress */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">
            {t('campaign.stage') || 'Stage'}: {stageName}
          </span>
          <span className="text-sm font-bold text-gray-700">{stageProgress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${STAGE_COLORS[campaign.stage] || 'bg-gray-400'}`}
            style={{ width: `${stageProgress}%` }}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {CAMPAIGN_STAGES.map((stage, idx) => (
            <span
              key={stage.key}
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                campaign.stage === stage.key
                  ? 'bg-gray-800 text-white'
                  : idx < CAMPAIGN_STAGES.findIndex(s => s.key === campaign.stage)
                    ? 'bg-gray-300 text-gray-700'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {stage.label}
            </span>
          ))}
        </div>
      </div>

      {/* Participation */}
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
        <h5 className="text-sm font-medium text-blue-900 mb-2">
          {t('campaign.participation') || 'Participation'}
        </h5>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-2xl font-bold text-blue-700">
              {participating}/{estimated}
            </div>
            <div className="text-xs text-blue-600">
              {t('campaign.unitsCommitted') || 'units committed'}
            </div>
          </div>
          {monthlyRentAtRisk > 0 && (
            <div>
              <div className="text-2xl font-bold text-blue-700">
                ${monthlyRentAtRisk.toLocaleString()}
              </div>
              <div className="text-xs text-blue-600">
                {t('campaign.monthlyAtRisk') || '/month at risk'}
              </div>
            </div>
          )}
        </div>
        {estimated > 0 && (
          <div className="mt-2">
            <div className="w-full h-1.5 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${participationRate}%` }}
              />
            </div>
            <div className="text-xs text-blue-600 mt-1">{participationRate}% participation</div>
          </div>
        )}
      </div>

      {/* Demands */}
      {campaign.demands && campaign.demands.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
            {t('campaign.demands') || 'Demands'}
            <span className="text-xs text-gray-400 font-normal">
              ({demandsProgress.won} won, {demandsProgress.pending} pending)
            </span>
          </h5>
          <div className="space-y-1.5">
            {campaign.demands.map((demand) => (
              <div
                key={demand.id}
                className={`flex items-start gap-2 text-sm p-2 rounded ${
                  demand.status === 'won'
                    ? 'bg-green-50 border border-green-200'
                    : demand.status === 'lost'
                      ? 'bg-red-50 border border-red-200'
                      : demand.status === 'compromised'
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <span className="flex-shrink-0 mt-0.5">
                  {demand.status === 'won' ? (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : demand.status === 'lost' ? (
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </span>
                <span className={`flex-1 ${
                  demand.status === 'won' ? 'text-green-800' :
                  demand.status === 'lost' ? 'text-red-800 line-through' :
                  'text-gray-700'
                }`}>
                  {demand.text}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  demand.status === 'won' ? 'bg-green-200 text-green-800' :
                  demand.status === 'lost' ? 'bg-red-200 text-red-800' :
                  demand.status === 'compromised' ? 'bg-yellow-200 text-yellow-800' :
                  demand.status === 'approved' ? 'bg-blue-200 text-blue-800' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {demand.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Action */}
      {nextAction && (
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <h5 className="text-sm font-medium text-amber-900 mb-1 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            {t('campaign.nextAction') || 'Next Action'}
          </h5>
          <p className="text-sm text-amber-800">{nextAction.text}</p>
          {(nextAction.date || nextAction.assignee) && (
            <div className="mt-1 flex items-center gap-2 text-xs text-amber-700">
              {nextAction.date && (
                <span>Due: {new Date(nextAction.date).toLocaleDateString()}</span>
              )}
              {nextAction.assignee && (
                <>
                  {nextAction.date && <span>·</span>}
                  <span>Assigned: {nextAction.assignee}</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="text-xs text-gray-500 flex flex-wrap gap-3">
        <span>Started: {new Date(campaign.startDate).toLocaleDateString()}</span>
        {campaign.targetDate && (
          <span>Target: {new Date(campaign.targetDate).toLocaleDateString()}</span>
        )}
      </div>

      {/* Recent Notes */}
      <div>
        <h5 className="text-sm font-medium text-gray-900 mb-2">
          {t('campaign.notes') || 'Notes'}
        </h5>
        {recentNotes.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No notes yet.</p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {recentNotes.map((note) => (
              <div key={note.id} className="bg-gray-50 rounded p-2 text-xs">
                <div className="flex justify-between text-gray-500 mb-1">
                  <span className="font-medium">{note.author}</span>
                  <span>{new Date(note.date).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700">{note.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add Note */}
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder={t('campaign.addNotePlaceholder') || 'Add a note...'}
            className="flex-1 text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-400"
            onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
          />
          <button
            onClick={handleAddNote}
            disabled={!newNote.trim() || isSubmitting}
            className="px-3 py-1.5 text-xs font-medium bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.add') || 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
