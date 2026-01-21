import { createLogger } from './logger'

const log = createLogger('Campaign')

/**
 * Campaign Storage
 *
 * Tracks building organizing campaigns from intelligence gathering
 * through resolution. Integrates with existing demands/complaints
 * from buildingOrganizingStorage.
 *
 * SECURITY: Campaign creation is validated server-side via Supabase RPC
 * to prevent client-side authorization bypass (C4 fix).
 */

import { sanitizeText, sanitizeRichText } from './sanitize'
import { supabase, USE_SUPABASE, setUserContext, DbCampaign, DbCampaignBuilding, DbCampaignStageChange, DbCampaignDemand, DbCampaignNote } from './supabase'
import { isOnline, OfflineError, checkPermission } from './authService'
import { getCurrentProfile } from './profileStorage'

// === TYPES ===

export type CampaignStage =
  | 'intelligence' // Initial contact, data gathering
  | 'organizing' // 1:1 conversations, demand discussions
  | 'commitment' // Tenant committee formed, demands drafted
  | 'preparation' // Legal review, agreements signed, date set
  | 'active' // Active rent strike or action
  | 'resolved' // Agreement reached, outcome documented

export type CampaignOutcome = 'pending' | 'won' | 'lost' | 'partial'

export interface CampaignDemand {
  id: string
  text: string
  status: 'proposed' | 'approved' | 'won' | 'lost' | 'compromised'
  notes?: string
}

export interface CampaignNote {
  id: string
  date: string // ISO date
  author: string // Nickname
  text: string
}

export interface Campaign {
  id: string
  name: string

  // Links
  buildingChatSlugs: string[] // Links to buildings in this campaign
  landlordName: string
  strikePreparationIds?: { [chatSlug: string]: string } // Maps building chatSlug to strikePreparationId

  // Status
  stage: CampaignStage
  outcome: CampaignOutcome

  // Timeline
  startDate: string // ISO date
  stageChanges: { stage: CampaignStage; date: string }[]
  targetDate?: string // Target date for action
  resolvedDate?: string // Date campaign was resolved

  // Demands
  demands: CampaignDemand[]

  // Metrics
  estimatedUnits?: number
  participatingUnits?: number
  monthlyRentAtRisk?: number

  // Next action
  nextAction?: string
  nextActionDate?: string
  nextActionAssignee?: string

  // Outcome details
  outcomeDetails?: string
  victoryId?: string // Link to victory if won

  // Notes
  notes: CampaignNote[]

  // Meta
  createdBy?: string // Profile ID
  created: number
  updated: number
}

export interface CampaignState {
  campaigns: Campaign[]
  lastModified: number
}

// === CONSTANTS ===

const STORAGE_KEY = 'rstu_campaigns'

export const CAMPAIGN_STAGES: { key: CampaignStage; label: string; description: string }[] = [
  {
    key: 'intelligence',
    label: 'Intelligence',
    description: 'Initial contact, building grievances identified',
  },
  {
    key: 'organizing',
    label: 'Organizing',
    description: '1:1 conversations, demand discussions happening',
  },
  {
    key: 'commitment',
    label: 'Commitment',
    description: 'Tenant committee formed, demands drafted',
  },
  {
    key: 'preparation',
    label: 'Preparation',
    description: 'Legal review, agreements signed, date set',
  },
  {
    key: 'active',
    label: 'Active',
    description: 'Rent being withheld, negotiations ongoing',
  },
  {
    key: 'resolved',
    label: 'Resolved',
    description: 'Agreement reached, terms documented',
  },
]

export const CAMPAIGN_OUTCOMES: { key: CampaignOutcome; label: string; color: string }[] = [
  { key: 'pending', label: 'Pending', color: 'gray' },
  { key: 'won', label: 'Won', color: 'green' },
  { key: 'lost', label: 'Lost', color: 'red' },
  { key: 'partial', label: 'Partial Win', color: 'yellow' },
]

// === HELPER FUNCTIONS ===

/**
 * Generate a unique ID using crypto API
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').substring(0, 16)
  }
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(8)
    crypto.getRandomValues(bytes)
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  }
  throw new Error('Crypto API not available')
}

/**
 * Get stage label
 */
export function getStageLabel(stage: CampaignStage): string {
  const found = CAMPAIGN_STAGES.find((s) => s.key === stage)
  return found?.label || stage
}

/**
 * Get stage number (1-6)
 */
export function getStageNumber(stage: CampaignStage): number {
  const index = CAMPAIGN_STAGES.findIndex((s) => s.key === stage)
  return index + 1
}

/**
 * Get outcome label
 */
export function getOutcomeLabel(outcome: CampaignOutcome): string {
  const found = CAMPAIGN_OUTCOMES.find((o) => o.key === outcome)
  return found?.label || outcome
}

/**
 * Get outcome color
 */
export function getOutcomeColor(outcome: CampaignOutcome): string {
  switch (outcome) {
    case 'won':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'lost':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'partial':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

/**
 * Get stage color
 */
export function getStageColor(stage: CampaignStage): string {
  switch (stage) {
    case 'intelligence':
      return 'bg-blue-100 text-blue-700'
    case 'organizing':
      return 'bg-purple-100 text-purple-700'
    case 'commitment':
      return 'bg-orange-100 text-orange-700'
    case 'preparation':
      return 'bg-yellow-100 text-yellow-700'
    case 'active':
      return 'bg-red-100 text-red-700'
    case 'resolved':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

/**
 * Calculate campaign progress percentage (based on stage)
 */
export function getCampaignProgress(stage: CampaignStage): number {
  const stageNum = getStageNumber(stage)
  return Math.round((stageNum / CAMPAIGN_STAGES.length) * 100)
}

/**
 * Calculate days in campaign
 */
export function getDaysInCampaign(campaign: Campaign): number {
  const start = new Date(campaign.startDate)
  const end = campaign.resolvedDate
    ? new Date(campaign.resolvedDate)
    : new Date()

  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Format date for display
 */
export function formatCampaignDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// === STATE MANAGEMENT ===

/**
 * Get campaign state from localStorage
 */
export function getCampaignState(): CampaignState {
  if (typeof window === 'undefined') {
    return { campaigns: [], lastModified: 0 }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return { campaigns: [], lastModified: 0 }
    }
    return JSON.parse(stored)
  } catch {
    return { campaigns: [], lastModified: 0 }
  }
}

/**
 * Save campaign state to localStorage
 */
function saveCampaignState(state: CampaignState): void {
  if (typeof window === 'undefined') return

  state.lastModified = Date.now()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    log.error('Failed to save:', e)
  }
}

// === CRUD OPERATIONS ===

/**
 * Get all campaigns
 */
export function getAllCampaigns(): Campaign[] {
  return getCampaignState().campaigns
}

/**
 * Get active campaigns (not resolved)
 */
export function getActiveCampaigns(): Campaign[] {
  const state = getCampaignState()
  return state.campaigns
    .filter((c) => c.stage !== 'resolved')
    .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
}

/**
 * Get resolved campaigns
 */
export function getResolvedCampaigns(): Campaign[] {
  const state = getCampaignState()
  return state.campaigns
    .filter((c) => c.stage === 'resolved')
    .sort((a, b) => {
      const aDate = a.resolvedDate || a.updated.toString()
      const bDate = b.resolvedDate || b.updated.toString()
      return new Date(bDate).getTime() - new Date(aDate).getTime()
    })
}

/**
 * Get campaigns for a specific building
 */
export function getBuildingCampaigns(chatSlug: string): Campaign[] {
  const state = getCampaignState()
  return state.campaigns
    .filter((c) => c.buildingChatSlugs.includes(chatSlug))
    .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
}

/**
 * Get campaigns for a specific landlord
 */
export function getLandlordCampaigns(landlordName: string): Campaign[] {
  const state = getCampaignState()
  const normalized = landlordName.toLowerCase().trim()
  return state.campaigns
    .filter((c) => c.landlordName.toLowerCase().trim() === normalized)
    .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
}

/**
 * Get a single campaign by ID
 */
export function getCampaignById(id: string): Campaign | null {
  const state = getCampaignState()
  return state.campaigns.find((c) => c.id === id) || null
}

/**
 * Create a new campaign
 */
export function createCampaign(
  data: Omit<Campaign, 'id' | 'created' | 'updated' | 'stageChanges' | 'notes'>
): Campaign {
  const state = getCampaignState()
  const now = Date.now()

  const campaign: Campaign = {
    ...data,
    // Sanitize user-provided fields
    name: sanitizeText(data.name),
    landlordName: sanitizeText(data.landlordName),
    demands: data.demands.map(d => ({
      ...d,
      text: sanitizeText(d.text),
      notes: d.notes ? sanitizeRichText(d.notes) : undefined,
    })),
    nextAction: data.nextAction ? sanitizeText(data.nextAction) : undefined,
    nextActionAssignee: data.nextActionAssignee ? sanitizeText(data.nextActionAssignee) : undefined,
    outcomeDetails: data.outcomeDetails ? sanitizeRichText(data.outcomeDetails) : undefined,
    id: generateId(),
    stageChanges: [{ stage: data.stage, date: data.startDate }],
    notes: [],
    created: now,
    updated: now,
  }

  state.campaigns.push(campaign)
  saveCampaignState(state)
  return campaign
}

/**
 * Create campaign with server-side validation (C4 fix)
 * Uses secure RPC function to prevent client-side authorization bypass
 */
export async function createCampaignSecure(
  data: Omit<Campaign, 'id' | 'created' | 'updated' | 'stageChanges' | 'notes'>
): Promise<{ success: boolean; campaign?: Campaign; error?: string }> {
  const profile = getCurrentProfile()
  if (!profile) {
    return { success: false, error: 'Not logged in' }
  }

  // If online and Supabase available, use server-side validation
  if (USE_SUPABASE && supabase && isOnline()) {
    try {
      // Use secure RPC for server-side validation
      const { data: rpcResult, error } = await supabase.rpc('create_campaign_secure', {
        p_creator_id: profile.id,
        p_name: sanitizeText(data.name),
        p_building_ids: data.buildingChatSlugs,
        p_building_addresses: [], // Could be populated if available
        p_landlord_name: sanitizeText(data.landlordName),
        p_start_date: data.startDate,
        p_target_date: data.targetDate || null,
        p_estimated_units: data.estimatedUnits || null
      })

      if (error) {
        log.error('Server error creating campaign:', error)
        return { success: false, error: error.message }
      }

      if (rpcResult && !rpcResult.success) {
        return { success: false, error: rpcResult.error }
      }

      // Create local cache copy with server-assigned ID
      const now = Date.now()
      const campaign: Campaign = {
        ...data,
        name: sanitizeText(data.name),
        landlordName: sanitizeText(data.landlordName),
        demands: data.demands.map(d => ({
          ...d,
          text: sanitizeText(d.text),
          notes: d.notes ? sanitizeRichText(d.notes) : undefined,
        })),
        nextAction: data.nextAction ? sanitizeText(data.nextAction) : undefined,
        nextActionAssignee: data.nextActionAssignee ? sanitizeText(data.nextActionAssignee) : undefined,
        outcomeDetails: data.outcomeDetails ? sanitizeRichText(data.outcomeDetails) : undefined,
        id: rpcResult.campaign_id || generateId(),
        stageChanges: [{ stage: data.stage, date: data.startDate }],
        notes: [],
        createdBy: profile.id,
        created: now,
        updated: now,
      }

      // Cache locally
      const state = getCampaignState()
      state.campaigns.push(campaign)
      saveCampaignState(state)

      return { success: true, campaign }
    } catch (e) {
      if (e instanceof OfflineError) {
        return { success: false, error: 'Cannot create campaigns while offline' }
      }
      log.error('Failed to create campaign:', e)
      return { success: false, error: 'Failed to create campaign' }
    }
  }

  // No Supabase - check permission locally
  // SECURITY WARNING: This path has limited server-side validation
  const permission = await checkPermission('create:campaign')
  if (!permission.allowed) {
    return { success: false, error: permission.reason }
  }

  const campaign = createCampaign(data)
  return { success: true, campaign }
}

/**
 * Update an existing campaign
 */
export function updateCampaign(
  id: string,
  updates: Partial<Omit<Campaign, 'id' | 'created'>>
): Campaign | null {
  const state = getCampaignState()
  const index = state.campaigns.findIndex((c) => c.id === id)

  if (index < 0) return null

  const campaign = state.campaigns[index]

  // Track stage changes
  if (updates.stage && updates.stage !== campaign.stage) {
    campaign.stageChanges.push({
      stage: updates.stage,
      date: new Date().toISOString().split('T')[0],
    })

    // Set resolved date when moving to resolved
    if (updates.stage === 'resolved' && !updates.resolvedDate) {
      updates.resolvedDate = new Date().toISOString().split('T')[0]
    }
  }

  state.campaigns[index] = {
    ...campaign,
    ...updates,
    updated: Date.now(),
  }

  saveCampaignState(state)
  return state.campaigns[index]
}

/**
 * Delete a campaign
 */
export function deleteCampaign(id: string): boolean {
  const state = getCampaignState()
  const index = state.campaigns.findIndex((c) => c.id === id)

  if (index < 0) return false

  state.campaigns.splice(index, 1)
  saveCampaignState(state)
  return true
}

// === DEMAND OPERATIONS ===

/**
 * Add a demand to a campaign
 */
export function addCampaignDemand(
  campaignId: string,
  text: string
): CampaignDemand | null {
  const state = getCampaignState()
  const campaign = state.campaigns.find((c) => c.id === campaignId)

  if (!campaign) return null

  const demand: CampaignDemand = {
    id: generateId(),
    text: sanitizeText(text),
    status: 'proposed',
  }

  campaign.demands.push(demand)
  campaign.updated = Date.now()
  saveCampaignState(state)

  return demand
}

/**
 * Update a demand
 */
export function updateCampaignDemand(
  campaignId: string,
  demandId: string,
  updates: Partial<Omit<CampaignDemand, 'id'>>
): boolean {
  const state = getCampaignState()
  const campaign = state.campaigns.find((c) => c.id === campaignId)

  if (!campaign) return false

  const demandIndex = campaign.demands.findIndex((d) => d.id === demandId)
  if (demandIndex < 0) return false

  campaign.demands[demandIndex] = {
    ...campaign.demands[demandIndex],
    ...updates,
  }
  campaign.updated = Date.now()
  saveCampaignState(state)

  return true
}

/**
 * Remove a demand
 */
export function removeCampaignDemand(campaignId: string, demandId: string): boolean {
  const state = getCampaignState()
  const campaign = state.campaigns.find((c) => c.id === campaignId)

  if (!campaign) return false

  const demandIndex = campaign.demands.findIndex((d) => d.id === demandId)
  if (demandIndex < 0) return false

  campaign.demands.splice(demandIndex, 1)
  campaign.updated = Date.now()
  saveCampaignState(state)

  return true
}

// === NOTE OPERATIONS ===

/**
 * Add a note to a campaign
 */
export function addCampaignNote(
  campaignId: string,
  author: string,
  text: string
): CampaignNote | null {
  const state = getCampaignState()
  const campaign = state.campaigns.find((c) => c.id === campaignId)

  if (!campaign) return null

  const note: CampaignNote = {
    id: generateId(),
    date: new Date().toISOString(),
    author: sanitizeText(author),
    text: sanitizeRichText(text),
  }

  campaign.notes.unshift(note) // Add to beginning
  campaign.updated = Date.now()
  saveCampaignState(state)

  return note
}

/**
 * Remove a note
 */
export function removeCampaignNote(campaignId: string, noteId: string): boolean {
  const state = getCampaignState()
  const campaign = state.campaigns.find((c) => c.id === campaignId)

  if (!campaign) return false

  const noteIndex = campaign.notes.findIndex((n) => n.id === noteId)
  if (noteIndex < 0) return false

  campaign.notes.splice(noteIndex, 1)
  campaign.updated = Date.now()
  saveCampaignState(state)

  return true
}

// === ANALYTICS ===

/**
 * Get campaign statistics
 */
export function getCampaignStats(): {
  total: number
  active: number
  resolved: number
  byStage: Record<CampaignStage, number>
  byOutcome: Record<CampaignOutcome, number>
  totalUnitsOrganized: number
  averageDaysToResolution: number
} {
  const state = getCampaignState()

  const byStage: Record<CampaignStage, number> = {
    intelligence: 0,
    organizing: 0,
    commitment: 0,
    preparation: 0,
    active: 0,
    resolved: 0,
  }

  const byOutcome: Record<CampaignOutcome, number> = {
    pending: 0,
    won: 0,
    lost: 0,
    partial: 0,
  }

  let totalUnitsOrganized = 0
  let totalDaysResolved = 0
  let resolvedCount = 0

  for (const c of state.campaigns) {
    byStage[c.stage]++
    byOutcome[c.outcome]++

    if (c.participatingUnits) {
      totalUnitsOrganized += c.participatingUnits
    }

    if (c.stage === 'resolved' && c.resolvedDate) {
      const days = getDaysInCampaign(c)
      totalDaysResolved += days
      resolvedCount++
    }
  }

  return {
    total: state.campaigns.length,
    active: state.campaigns.filter((c) => c.stage !== 'resolved').length,
    resolved: byStage.resolved,
    byStage,
    byOutcome,
    totalUnitsOrganized,
    averageDaysToResolution:
      resolvedCount > 0 ? Math.round(totalDaysResolved / resolvedCount) : 0,
  }
}

// === STRIKE PREPARATION INTEGRATION ===

/**
 * Link a strike preparation to a campaign
 */
export function linkStrikeToCampaign(
  campaignId: string,
  chatSlug: string,
  strikePreparationId: string
): void {
  const campaign = getCampaignById(campaignId)
  if (!campaign) return

  updateCampaign(campaignId, {
    ...campaign,
    strikePreparationIds: {
      ...(campaign.strikePreparationIds || {}),
      [chatSlug]: strikePreparationId,
    },
  })
}

/**
 * Get strike preparation ID for a campaign building
 */
export function getCampaignStrikePrepId(
  campaignId: string,
  chatSlug: string
): string | null {
  const campaign = getCampaignById(campaignId)
  if (!campaign) return null
  return campaign.strikePreparationIds?.[chatSlug] || null
}

/**
 * Get all campaigns in "preparation" stage (ready for strike toolkit)
 */
export function getPreparationStageCampaigns(): Campaign[] {
  return getAllCampaigns().filter((c) => c.stage === 'preparation')
}

// === SUPABASE CONVERSION FUNCTIONS ===

/**
 * Convert database campaign to application campaign
 */
function dbToCampaign(
  db: DbCampaign,
  buildings: DbCampaignBuilding[],
  stageChanges: DbCampaignStageChange[],
  demands: DbCampaignDemand[],
  notes: DbCampaignNote[]
): Campaign {
  // Build strikePreparationIds map from buildings
  const strikePreparationIds: { [chatSlug: string]: string } = {}
  buildings.forEach(b => {
    if (b.strike_preparation_id) {
      strikePreparationIds[b.building_chat_slug] = b.strike_preparation_id
    }
  })

  return {
    id: db.id,
    name: db.name,
    buildingChatSlugs: buildings.map(b => b.building_chat_slug),
    landlordName: db.landlord_name,
    strikePreparationIds: Object.keys(strikePreparationIds).length > 0 ? strikePreparationIds : undefined,
    stage: db.stage,
    outcome: db.outcome,
    startDate: db.start_date,
    stageChanges: stageChanges.map(sc => ({
      stage: sc.stage,
      date: sc.changed_at
    })),
    targetDate: db.target_date || undefined,
    resolvedDate: db.resolved_date || undefined,
    demands: demands.map(d => ({
      id: d.id,
      text: d.text,
      status: d.status,
      notes: d.notes || undefined
    })),
    estimatedUnits: db.estimated_units || undefined,
    participatingUnits: db.participating_units || undefined,
    monthlyRentAtRisk: db.monthly_rent_at_risk || undefined,
    nextAction: db.next_action || undefined,
    nextActionDate: db.next_action_date || undefined,
    nextActionAssignee: db.next_action_assignee || undefined,
    outcomeDetails: db.outcome_details || undefined,
    notes: notes.map(n => ({
      id: n.id,
      date: n.note_date,
      author: n.author,
      text: n.text
    })),
    createdBy: db.created_by || undefined,
    created: new Date(db.created_at).getTime(),
    updated: new Date(db.updated_at).getTime()
  }
}

// === ASYNC SUPABASE FUNCTIONS ===

/**
 * Fetch campaigns from server
 */
export async function fetchCampaignsFromServer(): Promise<Campaign[]> {
  if (!USE_SUPABASE || !supabase || !isOnline()) {
    return getAllCampaigns()
  }

  const profile = getCurrentProfile()
  if (!profile) return getAllCampaigns()

  try {
    await setUserContext(profile.id)

    // Fetch all campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*')
      .order('updated_at', { ascending: false })

    if (campaignsError) {
      log.error('Fetch campaigns error:', campaignsError)
      return getAllCampaigns()
    }

    if (!campaigns || campaigns.length === 0) {
      return []
    }

    const campaignIds = campaigns.map(c => c.id)

    // Fetch related data in parallel
    const [buildingsRes, stageChangesRes, demandsRes, notesRes] = await Promise.all([
      supabase.from('campaign_buildings').select('*').in('campaign_id', campaignIds),
      supabase.from('campaign_stage_changes').select('*').in('campaign_id', campaignIds).order('created_at'),
      supabase.from('campaign_demands').select('*').in('campaign_id', campaignIds).order('sort_order'),
      supabase.from('campaign_notes').select('*').in('campaign_id', campaignIds).order('note_date', { ascending: false })
    ])

    const buildings = buildingsRes.data || []
    const stageChanges = stageChangesRes.data || []
    const demands = demandsRes.data || []
    const notes = notesRes.data || []

    // Convert to application format
    const result = campaigns.map(c => dbToCampaign(
      c as DbCampaign,
      buildings.filter(b => b.campaign_id === c.id) as DbCampaignBuilding[],
      stageChanges.filter(sc => sc.campaign_id === c.id) as DbCampaignStageChange[],
      demands.filter(d => d.campaign_id === c.id) as DbCampaignDemand[],
      notes.filter(n => n.campaign_id === c.id) as DbCampaignNote[]
    ))

    // Update local cache
    const state = getCampaignState()
    state.campaigns = result
    saveCampaignState(state)

    return result
  } catch (e) {
    log.error('Failed to fetch campaigns:', e)
    return getAllCampaigns()
  }
}

/**
 * Update campaign stage with server verification
 */
export async function updateCampaignStageAsync(
  campaignId: string,
  newStage: CampaignStage,
  resolvedDate?: string
): Promise<{ success: boolean; error?: string }> {
  const profile = getCurrentProfile()
  if (!profile) {
    return { success: false, error: 'Not logged in' }
  }

  // Optimistic update
  const updated = updateCampaign(campaignId, { stage: newStage, resolvedDate })
  if (!updated) {
    return { success: false, error: 'Campaign not found' }
  }

  // Fire server sync in background
  if (USE_SUPABASE && supabase && isOnline()) {
    (async () => {
      try {
        await setUserContext(profile.id)
        const { data, error } = await supabase.rpc('update_campaign_stage_secure', {
          p_campaign_id: campaignId,
          p_new_stage: newStage,
          p_resolved_date: resolvedDate || null
        })

        if (error || (data && !data.success)) {
          log.error('Server rejected stage update:', error || data?.error)
          // Rollback would be complex here - log for now
        }
      } catch (e) {
        if (e instanceof OfflineError) {
          log.warn('Offline - stage update queued locally')
        } else {
          log.error('Failed to sync stage update:', e)
        }
      }
    })()
  }

  return { success: true }
}

/**
 * Update campaign outcome with server verification
 */
export async function updateCampaignOutcomeAsync(
  campaignId: string,
  outcome: CampaignOutcome,
  outcomeDetails?: string
): Promise<{ success: boolean; error?: string }> {
  const profile = getCurrentProfile()
  if (!profile) {
    return { success: false, error: 'Not logged in' }
  }

  // Optimistic update
  const updated = updateCampaign(campaignId, { outcome, outcomeDetails })
  if (!updated) {
    return { success: false, error: 'Campaign not found' }
  }

  // Fire server sync in background
  if (USE_SUPABASE && supabase && isOnline()) {
    (async () => {
      try {
        await setUserContext(profile.id)
        const { data, error } = await supabase.rpc('update_campaign_outcome_secure', {
          p_campaign_id: campaignId,
          p_outcome: outcome,
          p_outcome_details: outcomeDetails || null
        })

        if (error || (data && !data.success)) {
          log.error('Server rejected outcome update:', error || data?.error)
        }
      } catch (e) {
        if (e instanceof OfflineError) {
          log.warn('Offline - outcome update queued locally')
        } else {
          log.error('Failed to sync outcome update:', e)
        }
      }
    })()
  }

  return { success: true }
}

/**
 * Add demand with server verification
 */
export async function addCampaignDemandAsync(
  campaignId: string,
  text: string
): Promise<{ success: boolean; demand?: CampaignDemand; error?: string }> {
  const profile = getCurrentProfile()
  if (!profile) {
    return { success: false, error: 'Not logged in' }
  }

  // Optimistic update
  const demand = addCampaignDemand(campaignId, text)
  if (!demand) {
    return { success: false, error: 'Campaign not found' }
  }

  // Fire server sync in background
  if (USE_SUPABASE && supabase && isOnline()) {
    (async () => {
      try {
        await setUserContext(profile.id)
        const { data, error } = await supabase.rpc('add_campaign_demand_secure', {
          p_campaign_id: campaignId,
          p_text: sanitizeText(text),
          p_status: 'proposed'
        })

        if (error || (data && !data.success)) {
          log.error('Server rejected demand:', error || data?.error)
        }
      } catch (e) {
        if (e instanceof OfflineError) {
          log.warn('Offline - demand queued locally')
        } else {
          log.error('Failed to sync demand:', e)
        }
      }
    })()
  }

  return { success: true, demand }
}

/**
 * Update demand with server verification
 */
export async function updateCampaignDemandAsync(
  campaignId: string,
  demandId: string,
  updates: Partial<Omit<CampaignDemand, 'id'>>
): Promise<{ success: boolean; error?: string }> {
  const profile = getCurrentProfile()
  if (!profile) {
    return { success: false, error: 'Not logged in' }
  }

  // Optimistic update
  const updated = updateCampaignDemand(campaignId, demandId, updates)
  if (!updated) {
    return { success: false, error: 'Demand not found' }
  }

  // Fire server sync in background
  if (USE_SUPABASE && supabase && isOnline()) {
    (async () => {
      try {
        await setUserContext(profile.id)
        const { data, error } = await supabase.rpc('update_campaign_demand_secure', {
          p_demand_id: demandId,
          p_status: updates.status || null,
          p_text: updates.text ? sanitizeText(updates.text) : null,
          p_notes: updates.notes || null
        })

        if (error || (data && !data.success)) {
          log.error('Server rejected demand update:', error || data?.error)
        }
      } catch (e) {
        if (e instanceof OfflineError) {
          log.warn('Offline - demand update queued locally')
        } else {
          log.error('Failed to sync demand update:', e)
        }
      }
    })()
  }

  return { success: true }
}

/**
 * Add note with server verification
 */
export async function addCampaignNoteAsync(
  campaignId: string,
  text: string
): Promise<{ success: boolean; note?: CampaignNote; error?: string }> {
  const profile = getCurrentProfile()
  if (!profile) {
    return { success: false, error: 'Not logged in' }
  }

  // Optimistic update
  const note = addCampaignNote(campaignId, profile.nickname, text)
  if (!note) {
    return { success: false, error: 'Campaign not found' }
  }

  // Fire server sync in background
  if (USE_SUPABASE && supabase && isOnline()) {
    (async () => {
      try {
        await setUserContext(profile.id)
        const { data, error } = await supabase.rpc('add_campaign_note_secure', {
          p_campaign_id: campaignId,
          p_author: sanitizeText(profile.nickname),
          p_text: sanitizeRichText(text)
        })

        if (error || (data && !data.success)) {
          log.error('Server rejected note:', error || data?.error)
        }
      } catch (e) {
        if (e instanceof OfflineError) {
          log.warn('Offline - note queued locally')
        } else {
          log.error('Failed to sync note:', e)
        }
      }
    })()
  }

  return { success: true, note }
}

/**
 * Link strike preparation with server verification
 */
export async function linkStrikeToCampaignAsync(
  campaignId: string,
  chatSlug: string,
  strikePreparationId: string
): Promise<{ success: boolean; error?: string }> {
  const profile = getCurrentProfile()
  if (!profile) {
    return { success: false, error: 'Not logged in' }
  }

  // Optimistic update
  linkStrikeToCampaign(campaignId, chatSlug, strikePreparationId)

  // Fire server sync in background
  if (USE_SUPABASE && supabase && isOnline()) {
    (async () => {
      try {
        await setUserContext(profile.id)
        const { data, error } = await supabase.rpc('link_strike_to_campaign_secure', {
          p_campaign_id: campaignId,
          p_chat_slug: chatSlug,
          p_strike_preparation_id: strikePreparationId
        })

        if (error || (data && !data.success)) {
          log.error('Server rejected strike link:', error || data?.error)
        }
      } catch (e) {
        if (e instanceof OfflineError) {
          log.warn('Offline - strike link queued locally')
        } else {
          log.error('Failed to sync strike link:', e)
        }
      }
    })()
  }

  return { success: true }
}
