'use client'
import { createLogger } from '@/lib/logger'
const log = createLogger('BuildingCampaign')

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getBuildingCampaigns,
  getCampaignProgress,
  type Campaign,
  type CampaignStage,
  type CampaignDemand
} from '@/lib/campaignStorage'

/**
 * Derived campaign info for UI display
 */
export interface BuildingCampaignInfo {
  campaign: Campaign | null
  isActive: boolean
  stageName: string
  stageProgress: number  // 0-100
  participationRate: number  // 0-100
  monthlyRentAtRisk: number
  demandsProgress: {
    total: number
    won: number
    pending: number
    lost: number
  }
  nextAction: {
    text: string
    date?: string
    assignee?: string
  } | null
}

interface UseBuildingCampaignReturn {
  campaignInfo: BuildingCampaignInfo
  isLoading: boolean
  refresh: () => void
}

const STAGE_LABELS: Record<CampaignStage, string> = {
  intelligence: 'Intelligence',
  organizing: 'Organizing',
  commitment: 'Commitment',
  preparation: 'Preparation',
  active: 'Active',
  resolved: 'Resolved',
}

/**
 * Hook to get active campaign info for a building
 * Returns the first active (non-resolved) campaign for the building
 */
export function useBuildingCampaign(chatSlug: string): UseBuildingCampaignReturn {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadCampaigns = useCallback(() => {
    if (!chatSlug) {
      setCampaigns([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const buildingCampaigns = getBuildingCampaigns(chatSlug)
      setCampaigns(buildingCampaigns)
    } catch (err) {
      log.error('Error loading campaigns:', err)
      setCampaigns([])
    } finally {
      setIsLoading(false)
    }
  }, [chatSlug])

  useEffect(() => {
    loadCampaigns()
  }, [loadCampaigns])

  const campaignInfo = useMemo((): BuildingCampaignInfo => {
    // Get first active campaign (not resolved)
    const activeCampaign = campaigns.find(c => c.stage !== 'resolved') || null

    if (!activeCampaign) {
      return {
        campaign: null,
        isActive: false,
        stageName: '',
        stageProgress: 0,
        participationRate: 0,
        monthlyRentAtRisk: 0,
        demandsProgress: { total: 0, won: 0, pending: 0, lost: 0 },
        nextAction: null,
      }
    }

    // Calculate participation rate
    const estimated = activeCampaign.estimatedUnits || 0
    const participating = activeCampaign.participatingUnits || 0
    const participationRate = estimated > 0
      ? Math.round((participating / estimated) * 100)
      : 0

    // Calculate demands progress
    const demands = activeCampaign.demands || []
    const demandsProgress = {
      total: demands.length,
      won: demands.filter(d => d.status === 'won').length,
      pending: demands.filter(d => d.status === 'proposed' || d.status === 'approved').length,
      lost: demands.filter(d => d.status === 'lost' || d.status === 'compromised').length,
    }

    // Get next action
    const nextAction = activeCampaign.nextAction
      ? {
          text: activeCampaign.nextAction,
          date: activeCampaign.nextActionDate,
          assignee: activeCampaign.nextActionAssignee,
        }
      : null

    return {
      campaign: activeCampaign,
      isActive: true,
      stageName: STAGE_LABELS[activeCampaign.stage] || activeCampaign.stage,
      stageProgress: getCampaignProgress(activeCampaign.stage),
      participationRate,
      monthlyRentAtRisk: activeCampaign.monthlyRentAtRisk || 0,
      demandsProgress,
      nextAction,
    }
  }, [campaigns])

  return {
    campaignInfo,
    isLoading,
    refresh: loadCampaigns,
  }
}
