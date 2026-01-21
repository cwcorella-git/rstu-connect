/**
 * Escalation Ladder Storage
 *
 * Tracks issues through the organizing cycle:
 * IDENTIFIED → DRAFTED → DELIVERED → AWAITING → ESCALATING → RESOLVED
 *
 * Phase 1: Core state machine with manual stage transitions
 */

import { generateShortId } from './idUtils'

// ============================================================================
// Types
// ============================================================================

export type EscalationStage =
  | 'identified'   // Issue reported, gathering support
  | 'drafted'      // Demand letter created
  | 'delivered'    // Demand sent to landlord
  | 'awaiting'     // Waiting for landlord response
  | 'escalating'   // Active escalation (legal, strike, code enforcement)
  | 'resolved'     // Issue concluded

export type IssueCategory =
  | 'habitability'      // Repairs, safety, health issues
  | 'lease'             // Lease violations by landlord
  | 'harassment'        // Landlord harassment
  | 'retaliation'       // Retaliation for organizing
  | 'rent'              // Rent increases, fees
  | 'discrimination'    // Fair Housing Act violations
  | 'illegal_entry'     // Entering without notice (NRS 118A.330)
  | 'security_deposit'  // Deposit issues (NRS 118A.242)
  | 'utilities'         // Utility shutoffs (NRS 118A.390)
  | 'eviction'          // Illegal lockout/eviction (NRS 118A.480)
  | 'other'

export type IssueSeverity = 'minor' | 'moderate' | 'serious' | 'emergency'

export type DeliveryMethod = 'email' | 'certified_mail' | 'hand_delivered' | 'posted' | 'other'

export type ResponseType = 'agreed' | 'partial' | 'refused' | 'ignored' | 'retaliated'

export type ResolutionType = 'victory' | 'compromise' | 'loss' | 'ongoing' | 'abandoned'

export interface LandlordResponse {
  id: string
  date: number  // timestamp
  method: 'phone' | 'email' | 'letter' | 'in_person' | 'none'
  summary: string
  responseType: ResponseType
  promisedAction?: string
  promisedDeadline?: number  // timestamp
  recordedBy: string  // odell id
}

export interface Resolution {
  type: ResolutionType
  date: number  // timestamp
  summary: string
  demandsMet?: string[]
  tacticsUsed?: string[]
  lessonsLearned?: string
}

export interface TimelineEvent {
  id: string
  date: number  // timestamp
  type: 'created' | 'stage_change' | 'demand_drafted' | 'demand_sent' | 'deadline_set' |
        'landlord_contact' | 'escalation_started' | 'resolved' | 'note' | 'evidence_added'
  description: string
  actorId?: string  // odell id of who did this
  metadata?: Record<string, unknown>
}

export interface EscalationPath {
  type: 'code_enforcement' | 'legal' | 'strike' | 'public_pressure'
  startedAt: number
  status: 'active' | 'pending' | 'completed' | 'abandoned'
  // Code enforcement specific
  caseNumber?: string
  inspectionDate?: number
  // Legal specific
  attorneyName?: string
  consultationDate?: number
  // Strike specific
  voteProposalId?: string
  strikeStartDate?: number
  // Public pressure specific
  campaignId?: string
}

export interface EscalationCase {
  id: string
  buildingId: string  // chatSlug or building identifier
  buildingAddress: string
  title: string
  description: string

  // Issue details
  category: IssueCategory
  severity: IssueSeverity
  affectedUnits: string[]  // unit numbers or "building-wide"
  reportedBy: string  // odell id
  reportedAt: number  // timestamp

  // Current state
  stage: EscalationStage

  // Demand tracking (Stage 2+)
  demandText?: string
  demandDeadlineDays?: number  // default deadline length

  // Delivery tracking (Stage 3+)
  deliveryMethod?: DeliveryMethod
  deliveryDate?: number  // timestamp
  deliveryProof?: string  // tracking number, photo URL, etc.
  deadlineDate?: number  // timestamp when landlord must respond

  // Response tracking (Stage 4+)
  landlordResponses: LandlordResponse[]

  // Escalation tracking (Stage 5)
  escalationPaths: EscalationPath[]

  // Resolution (Stage 6)
  resolution?: Resolution

  // Evidence
  evidence: Array<{
    id: string
    type: 'photo' | 'document' | 'video' | 'receipt' | 'other'
    description: string
    url?: string
    addedAt: number
    addedBy: string
  }>

  // Strike integration
  strikePreparationId?: string  // Links to a strike preparation if escalated to collective action

  // Metadata
  createdAt: number
  updatedAt: number
  timeline: TimelineEvent[]
}

export interface SuggestedAction {
  action: string
  reason: string
  urgent?: boolean
  actionType?: 'advance_stage' | 'gather_support' | 'file_complaint' | 'contact_legal' |
               'start_strike' | 'log_contact' | 'wait' | 'celebrate'
}

// Enhanced suggestion with confidence and context
export interface EnhancedSuggestion {
  action: string
  reason: string
  confidence: 'high' | 'medium' | 'low'
  urgent: boolean
  actionType: SuggestedAction['actionType']
  // Why this suggestion
  basedOn: SuggestionSource[]
  // For multi-path suggestions
  alternativeActions?: Array<{
    action: string
    reason: string
    actionType: SuggestedAction['actionType']
  }>
  // Timing info
  daysInCurrentStage: number
  recommendedDeadlineDays?: number
}

export type SuggestionSource =
  | { type: 'stage'; detail: string }
  | { type: 'time'; detail: string; daysSince: number }
  | { type: 'building_history'; detail: string; successRate?: number }
  | { type: 'landlord_pattern'; detail: string; responsePattern?: string }
  | { type: 'severity'; detail: string }
  | { type: 'category'; detail: string }

export interface LandlordPattern {
  totalCases: number
  avgResponseDays: number | null
  ignoreRate: number  // % of cases where landlord ignored
  retaliationRate: number  // % of cases with retaliation
  successfulTactics: Array<{ tactic: EscalationPath['type']; successCount: number }>
  typicalBehavior: 'responsive' | 'slow' | 'ignores_until_pressure' | 'hostile' | 'unknown'
}

export interface BuildingHistory {
  totalCases: number
  victories: number
  winRate: number
  avgResolutionDays: number | null
  successfulTactics: Array<{ tactic: EscalationPath['type']; successCount: number }>
  commonCategories: IssueCategory[]
}

// ============================================================================
// Storage Key
// ============================================================================

const STORAGE_KEY = 'rstu_escalation_cases'

// ============================================================================
// Helper Functions
// ============================================================================

function generateId(): string {
  return `esc_${Date.now()}_${generateShortId()}`
}

function generateTimelineEventId(): string {
  return `evt_${Date.now()}_${generateShortId()}`
}

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Get all escalation cases
 */
export function getAllCases(): EscalationCase[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

/**
 * Get cases for a specific building
 */
export function getCasesByBuilding(buildingId: string): EscalationCase[] {
  return getAllCases().filter(c => c.buildingId === buildingId)
}

/**
 * Get a single case by ID
 */
export function getCaseById(caseId: string): EscalationCase | null {
  return getAllCases().find(c => c.id === caseId) || null
}

/**
 * Get active cases (not resolved)
 */
export function getActiveCases(buildingId?: string): EscalationCase[] {
  let cases = getAllCases().filter(c => c.stage !== 'resolved')
  if (buildingId) {
    cases = cases.filter(c => c.buildingId === buildingId)
  }
  return cases.sort((a, b) => b.updatedAt - a.updatedAt)
}

/**
 * Get cases by stage
 */
export function getCasesByStage(stage: EscalationStage, buildingId?: string): EscalationCase[] {
  let cases = getAllCases().filter(c => c.stage === stage)
  if (buildingId) {
    cases = cases.filter(c => c.buildingId === buildingId)
  }
  return cases
}

/**
 * Save all cases to storage
 */
function saveCases(cases: EscalationCase[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases))
}

/**
 * Create a new escalation case
 */
export function createCase(
  input: {
    buildingId: string
    buildingAddress: string
    title: string
    description: string
    category: IssueCategory
    severity: IssueSeverity
    affectedUnits: string[]
    reportedBy: string
  }
): EscalationCase {
  const now = Date.now()
  const newCase: EscalationCase = {
    id: generateId(),
    buildingId: input.buildingId,
    buildingAddress: input.buildingAddress,
    title: input.title,
    description: input.description,
    category: input.category,
    severity: input.severity,
    affectedUnits: input.affectedUnits,
    reportedBy: input.reportedBy,
    reportedAt: now,
    stage: 'identified',
    landlordResponses: [],
    escalationPaths: [],
    evidence: [],
    createdAt: now,
    updatedAt: now,
    timeline: [{
      id: generateTimelineEventId(),
      date: now,
      type: 'created',
      description: `Issue reported: ${input.title}`,
      actorId: input.reportedBy,
    }],
  }

  const cases = getAllCases()
  cases.push(newCase)
  saveCases(cases)

  return newCase
}

/**
 * Update a case
 */
export function updateCase(
  caseId: string,
  updates: Partial<Omit<EscalationCase, 'id' | 'createdAt' | 'timeline'>>
): EscalationCase | null {
  const cases = getAllCases()
  const index = cases.findIndex(c => c.id === caseId)
  if (index === -1) return null

  cases[index] = {
    ...cases[index],
    ...updates,
    updatedAt: Date.now(),
  }

  saveCases(cases)
  return cases[index]
}

/**
 * Add a timeline event to a case
 */
export function addTimelineEvent(
  caseId: string,
  event: Omit<TimelineEvent, 'id' | 'date'>
): EscalationCase | null {
  const cases = getAllCases()
  const index = cases.findIndex(c => c.id === caseId)
  if (index === -1) return null

  const timelineEvent: TimelineEvent = {
    id: generateTimelineEventId(),
    date: Date.now(),
    ...event,
  }

  cases[index].timeline.push(timelineEvent)
  cases[index].updatedAt = Date.now()

  saveCases(cases)
  return cases[index]
}

/**
 * Delete a case
 */
export function deleteCase(caseId: string): boolean {
  const cases = getAllCases()
  const index = cases.findIndex(c => c.id === caseId)
  if (index === -1) return false

  cases.splice(index, 1)
  saveCases(cases)
  return true
}

// ============================================================================
// Stage Transitions
// ============================================================================

/**
 * Advance case to next stage
 */
export function advanceStage(
  caseId: string,
  actorId: string,
  note?: string
): EscalationCase | null {
  const caseData = getCaseById(caseId)
  if (!caseData) return null

  const stageOrder: EscalationStage[] = [
    'identified', 'drafted', 'delivered', 'awaiting', 'escalating', 'resolved'
  ]
  const currentIndex = stageOrder.indexOf(caseData.stage)
  if (currentIndex === -1 || currentIndex >= stageOrder.length - 1) return null

  const newStage = stageOrder[currentIndex + 1]
  const stageLabels: Record<EscalationStage, string> = {
    identified: 'Issue Identified',
    drafted: 'Demand Drafted',
    delivered: 'Demand Delivered',
    awaiting: 'Awaiting Response',
    escalating: 'Escalation Active',
    resolved: 'Resolved',
  }

  addTimelineEvent(caseId, {
    type: 'stage_change',
    description: `Stage changed to: ${stageLabels[newStage]}${note ? ` - ${note}` : ''}`,
    actorId,
  })

  return updateCase(caseId, { stage: newStage })
}

/**
 * Move case to a specific stage (for corrections or skipping)
 */
export function setStage(
  caseId: string,
  newStage: EscalationStage,
  actorId: string,
  reason: string
): EscalationCase | null {
  const stageLabels: Record<EscalationStage, string> = {
    identified: 'Issue Identified',
    drafted: 'Demand Drafted',
    delivered: 'Demand Delivered',
    awaiting: 'Awaiting Response',
    escalating: 'Escalation Active',
    resolved: 'Resolved',
  }

  addTimelineEvent(caseId, {
    type: 'stage_change',
    description: `Stage set to: ${stageLabels[newStage]} - ${reason}`,
    actorId,
  })

  return updateCase(caseId, { stage: newStage })
}

// ============================================================================
// Demand Management
// ============================================================================

/**
 * Draft a demand for a case
 */
export function draftDemand(
  caseId: string,
  demandText: string,
  deadlineDays: number,
  actorId: string
): EscalationCase | null {
  addTimelineEvent(caseId, {
    type: 'demand_drafted',
    description: `Demand letter drafted with ${deadlineDays}-day deadline`,
    actorId,
  })

  const updated = updateCase(caseId, {
    demandText,
    demandDeadlineDays: deadlineDays,
    stage: 'drafted',
  })

  return updated
}

/**
 * Record demand delivery
 */
export function recordDelivery(
  caseId: string,
  deliveryMethod: DeliveryMethod,
  deliveryProof: string,
  deadlineDays: number,
  actorId: string
): EscalationCase | null {
  const now = Date.now()
  const deadlineDate = now + (deadlineDays * 24 * 60 * 60 * 1000)

  addTimelineEvent(caseId, {
    type: 'demand_sent',
    description: `Demand sent via ${deliveryMethod.replace('_', ' ')}`,
    actorId,
    metadata: { deliveryProof, deadlineDate },
  })

  addTimelineEvent(caseId, {
    type: 'deadline_set',
    description: `Deadline set: ${new Date(deadlineDate).toLocaleDateString()}`,
    actorId,
  })

  return updateCase(caseId, {
    deliveryMethod,
    deliveryDate: now,
    deliveryProof,
    deadlineDate,
    stage: 'delivered',
  })
}

// ============================================================================
// Landlord Response Tracking
// ============================================================================

/**
 * Record a landlord response/contact
 */
export function recordLandlordResponse(
  caseId: string,
  response: Omit<LandlordResponse, 'id'>
): EscalationCase | null {
  const caseData = getCaseById(caseId)
  if (!caseData) return null

  const newResponse: LandlordResponse = {
    id: `resp_${Date.now()}`,
    ...response,
  }

  const responseTypeLabels: Record<ResponseType, string> = {
    agreed: 'agreed to demands',
    partial: 'partially agreed',
    refused: 'refused demands',
    ignored: 'no response',
    retaliated: 'retaliated',
  }

  addTimelineEvent(caseId, {
    type: 'landlord_contact',
    description: `Landlord ${responseTypeLabels[response.responseType]}: ${response.summary}`,
    actorId: response.recordedBy,
    metadata: { responseType: response.responseType },
  })

  // Auto-advance to awaiting if currently delivered
  const updates: Partial<EscalationCase> = {
    landlordResponses: [...caseData.landlordResponses, newResponse],
  }
  if (caseData.stage === 'delivered') {
    updates.stage = 'awaiting'
  }

  return updateCase(caseId, updates)
}

// ============================================================================
// Escalation Path Management
// ============================================================================

/**
 * Start an escalation path
 */
export function startEscalation(
  caseId: string,
  pathType: EscalationPath['type'],
  actorId: string,
  details?: Partial<EscalationPath>
): EscalationCase | null {
  const caseData = getCaseById(caseId)
  if (!caseData) return null

  const pathLabels: Record<EscalationPath['type'], string> = {
    code_enforcement: 'Code Enforcement Complaint',
    legal: 'Legal Consultation',
    strike: 'Rent Strike',
    public_pressure: 'Public Pressure Campaign',
  }

  const newPath: EscalationPath = {
    type: pathType,
    startedAt: Date.now(),
    status: 'active',
    ...details,
  }

  addTimelineEvent(caseId, {
    type: 'escalation_started',
    description: `Started escalation: ${pathLabels[pathType]}`,
    actorId,
  })

  return updateCase(caseId, {
    escalationPaths: [...caseData.escalationPaths, newPath],
    stage: 'escalating',
  })
}

/**
 * Update an escalation path
 */
export function updateEscalationPath(
  caseId: string,
  pathType: EscalationPath['type'],
  updates: Partial<EscalationPath>
): EscalationCase | null {
  const caseData = getCaseById(caseId)
  if (!caseData) return null

  const pathIndex = caseData.escalationPaths.findIndex(p => p.type === pathType)
  if (pathIndex === -1) return null

  const updatedPaths = [...caseData.escalationPaths]
  updatedPaths[pathIndex] = { ...updatedPaths[pathIndex], ...updates }

  return updateCase(caseId, { escalationPaths: updatedPaths })
}

// ============================================================================
// Resolution
// ============================================================================

/**
 * Resolve a case
 */
export function resolveCase(
  caseId: string,
  resolution: Omit<Resolution, 'date'>,
  actorId: string
): EscalationCase | null {
  const resolutionLabels: Record<ResolutionType, string> = {
    victory: 'Victory',
    compromise: 'Compromise',
    loss: 'Loss',
    ongoing: 'Ongoing (cycling back)',
    abandoned: 'Abandoned',
  }

  addTimelineEvent(caseId, {
    type: 'resolved',
    description: `Case resolved: ${resolutionLabels[resolution.type]} - ${resolution.summary}`,
    actorId,
  })

  return updateCase(caseId, {
    resolution: {
      ...resolution,
      date: Date.now(),
    },
    stage: 'resolved',
  })
}

// ============================================================================
// Evidence Management
// ============================================================================

/**
 * Add evidence to a case
 */
export function addEvidence(
  caseId: string,
  evidence: {
    type: 'photo' | 'document' | 'video' | 'receipt' | 'other'
    description: string
    url?: string
  },
  actorId: string
): EscalationCase | null {
  const caseData = getCaseById(caseId)
  if (!caseData) return null

  const newEvidence = {
    id: `evd_${Date.now()}`,
    ...evidence,
    addedAt: Date.now(),
    addedBy: actorId,
  }

  addTimelineEvent(caseId, {
    type: 'evidence_added',
    description: `Evidence added: ${evidence.description}`,
    actorId,
  })

  return updateCase(caseId, {
    evidence: [...caseData.evidence, newEvidence],
  })
}

// ============================================================================
// Suggestion Engine (Phase 1 - Basic)
// ============================================================================

/**
 * Get suggested next action for a case
 */
export function getSuggestedAction(caseData: EscalationCase): SuggestedAction {
  const now = Date.now()

  switch (caseData.stage) {
    case 'identified': {
      if (caseData.affectedUnits.length >= 3) {
        return {
          action: 'Draft a demand letter',
          reason: `${caseData.affectedUnits.length} units affected - ready to organize`,
          actionType: 'advance_stage',
        }
      }
      return {
        action: 'Gather support from neighbors',
        reason: 'Document the issue and find other affected tenants',
        actionType: 'gather_support',
      }
    }

    case 'drafted': {
      return {
        action: 'Send demand to landlord',
        reason: 'Demand is ready - choose delivery method and send',
        actionType: 'advance_stage',
      }
    }

    case 'delivered': {
      if (!caseData.deadlineDate) {
        return {
          action: 'Set response deadline',
          reason: 'Deadline not set - add deadline to track response',
          actionType: 'advance_stage',
        }
      }

      const daysUntilDeadline = Math.ceil((caseData.deadlineDate - now) / (24 * 60 * 60 * 1000))

      if (daysUntilDeadline > 0) {
        return {
          action: 'Wait for landlord response',
          reason: `${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''} until deadline`,
          actionType: 'wait',
        }
      }

      return {
        action: 'Record landlord response or escalate',
        reason: 'Deadline has passed - document response or lack thereof',
        urgent: true,
        actionType: 'log_contact',
      }
    }

    case 'awaiting': {
      const lastResponse = caseData.landlordResponses[caseData.landlordResponses.length - 1]

      if (!lastResponse || lastResponse.responseType === 'ignored') {
        return getSuggestionByCategory(caseData.category)
      }

      if (lastResponse.responseType === 'retaliated') {
        return {
          action: 'Contact legal aid immediately',
          reason: 'Retaliation is illegal - document and seek legal protection',
          urgent: true,
          actionType: 'contact_legal',
        }
      }

      if (lastResponse.responseType === 'refused') {
        return {
          action: 'Consider escalation options',
          reason: 'Landlord refused demands - time to escalate',
          actionType: 'advance_stage',
        }
      }

      if (lastResponse.responseType === 'partial') {
        return {
          action: 'Set new deadline for remaining demands',
          reason: 'Partial response - follow up on unmet demands',
          actionType: 'log_contact',
        }
      }

      if (lastResponse.responseType === 'agreed') {
        return {
          action: 'Verify demands are being met',
          reason: 'Landlord agreed - confirm follow-through',
          actionType: 'log_contact',
        }
      }

      return {
        action: 'Evaluate landlord response',
        reason: 'Review response and determine next steps',
        actionType: 'log_contact',
      }
    }

    case 'escalating': {
      const activePaths = caseData.escalationPaths.filter(p => p.status === 'active')
      if (activePaths.length === 0) {
        return {
          action: 'Start an escalation path',
          reason: 'Choose: code enforcement, legal aid, strike, or public pressure',
          actionType: 'advance_stage',
        }
      }
      return {
        action: 'Monitor escalation progress',
        reason: `${activePaths.length} active escalation${activePaths.length !== 1 ? 's' : ''} in progress`,
        actionType: 'wait',
      }
    }

    case 'resolved': {
      if (caseData.resolution?.type === 'victory' || caseData.resolution?.type === 'compromise') {
        return {
          action: 'Share this win!',
          reason: 'Document and celebrate to inspire others',
          actionType: 'celebrate',
        }
      }
      return {
        action: 'Document lessons learned',
        reason: 'Record what happened for future organizing',
        actionType: 'celebrate',
      }
    }

    default:
      return {
        action: 'Review case status',
        reason: 'Determine next steps',
        actionType: 'wait',
      }
  }
}

function getSuggestionByCategory(category: IssueCategory): SuggestedAction {
  const suggestions: Record<IssueCategory, SuggestedAction> = {
    habitability: {
      action: 'File code enforcement complaint',
      reason: 'No response to habitability issue - request inspection',
      actionType: 'file_complaint',
    },
    lease: {
      action: 'Consult with legal aid',
      reason: 'Lease violation ignored - seek legal advice',
      actionType: 'contact_legal',
    },
    harassment: {
      action: 'Contact legal aid immediately',
      reason: 'Harassment requires legal protection',
      urgent: true,
      actionType: 'contact_legal',
    },
    retaliation: {
      action: 'Contact legal aid immediately',
      reason: 'Retaliation is illegal - document and seek protection',
      urgent: true,
      actionType: 'contact_legal',
    },
    rent: {
      action: 'Consider collective action',
      reason: 'Rent issues often require organized tenant response',
      actionType: 'start_strike',
    },
    discrimination: {
      action: 'File Fair Housing complaint',
      reason: 'Discrimination violates Fair Housing Act - file complaint with HUD',
      urgent: true,
      actionType: 'contact_legal',
    },
    illegal_entry: {
      action: 'Document and send written notice',
      reason: 'Nevada law requires 24-hour notice (NRS 118A.330)',
      actionType: 'advance_stage',
    },
    security_deposit: {
      action: 'Send demand letter for deposit',
      reason: 'Landlord must return deposit within 30 days (NRS 118A.242)',
      actionType: 'advance_stage',
    },
    utilities: {
      action: 'File code enforcement complaint',
      reason: 'Utility shutoffs for rent non-payment may be illegal',
      urgent: true,
      actionType: 'file_complaint',
    },
    eviction: {
      action: 'Contact legal aid immediately',
      reason: 'Illegal lockouts/self-help evictions require urgent legal protection',
      urgent: true,
      actionType: 'contact_legal',
    },
    other: {
      action: 'Evaluate escalation options',
      reason: 'Consider code enforcement, legal aid, or collective action',
      actionType: 'advance_stage',
    },
  }
  return suggestions[category]
}

// ============================================================================
// Stats & Queries
// ============================================================================

/**
 * Get case statistics for a building
 */
export function getBuildingStats(buildingId: string): {
  total: number
  byStage: Record<EscalationStage, number>
  active: number
  resolved: number
  victories: number
  avgResolutionDays: number | null
} {
  const cases = getCasesByBuilding(buildingId)

  const byStage: Record<EscalationStage, number> = {
    identified: 0,
    drafted: 0,
    delivered: 0,
    awaiting: 0,
    escalating: 0,
    resolved: 0,
  }

  let victories = 0
  let resolutionDaysSum = 0
  let resolvedCount = 0

  for (const c of cases) {
    byStage[c.stage]++
    if (c.stage === 'resolved' && c.resolution) {
      if (c.resolution.type === 'victory' || c.resolution.type === 'compromise') {
        victories++
      }
      const days = (c.resolution.date - c.createdAt) / (24 * 60 * 60 * 1000)
      resolutionDaysSum += days
      resolvedCount++
    }
  }

  return {
    total: cases.length,
    byStage,
    active: cases.length - byStage.resolved,
    resolved: byStage.resolved,
    victories,
    avgResolutionDays: resolvedCount > 0 ? Math.round(resolutionDaysSum / resolvedCount) : null,
  }
}

/**
 * Get cases with overdue deadlines
 */
export function getOverdueCases(buildingId?: string): EscalationCase[] {
  const now = Date.now()
  let cases = getAllCases().filter(c =>
    c.stage === 'delivered' &&
    c.deadlineDate &&
    c.deadlineDate < now
  )
  if (buildingId) {
    cases = cases.filter(c => c.buildingId === buildingId)
  }
  return cases
}

/**
 * Get cases needing attention (overdue or urgent)
 */
export function getCasesNeedingAttention(buildingId?: string): EscalationCase[] {
  const overdue = getOverdueCases(buildingId)

  let urgent = getAllCases().filter(c => {
    if (c.stage === 'resolved') return false
    // Emergency severity
    if (c.severity === 'emergency') return true
    // Retaliation detected
    const lastResponse = c.landlordResponses[c.landlordResponses.length - 1]
    if (lastResponse?.responseType === 'retaliated') return true
    return false
  })

  if (buildingId) {
    urgent = urgent.filter(c => c.buildingId === buildingId)
  }

  // Combine and deduplicate
  const seen = new Set<string>()
  const result: EscalationCase[] = []

  for (const c of [...overdue, ...urgent]) {
    if (!seen.has(c.id)) {
      seen.add(c.id)
      result.push(c)
    }
  }

  return result.sort((a, b) => {
    // Emergency first, then by updated date
    if (a.severity === 'emergency' && b.severity !== 'emergency') return -1
    if (b.severity === 'emergency' && a.severity !== 'emergency') return 1
    return b.updatedAt - a.updatedAt
  })
}

// ============================================================================
// Enhanced Suggestion Engine (Phase 2)
// ============================================================================

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Analyze building's escalation history to find successful tactics
 */
export function getBuildingHistory(buildingId: string): BuildingHistory {
  const cases = getCasesByBuilding(buildingId)
  const resolved = cases.filter(c => c.stage === 'resolved')

  const victories = resolved.filter(c =>
    c.resolution?.type === 'victory' || c.resolution?.type === 'compromise'
  )

  // Count successful tactics
  const tacticCounts: Record<EscalationPath['type'], number> = {
    code_enforcement: 0,
    legal: 0,
    strike: 0,
    public_pressure: 0,
  }

  for (const v of victories) {
    for (const path of v.escalationPaths) {
      if (path.status === 'completed') {
        tacticCounts[path.type]++
      }
    }
    // Also count from resolution.tacticsUsed if present
    if (v.resolution?.tacticsUsed) {
      for (const t of v.resolution.tacticsUsed) {
        const normalized = t.toLowerCase().replace(/\s+/g, '_') as EscalationPath['type']
        if (normalized in tacticCounts) {
          tacticCounts[normalized]++
        }
      }
    }
  }

  const successfulTactics = Object.entries(tacticCounts)
    .filter(([, count]) => count > 0)
    .map(([tactic, count]) => ({ tactic: tactic as EscalationPath['type'], successCount: count }))
    .sort((a, b) => b.successCount - a.successCount)

  // Count common categories
  const categoryCounts: Record<IssueCategory, number> = {
    habitability: 0, lease: 0, harassment: 0, retaliation: 0, rent: 0,
    discrimination: 0, illegal_entry: 0, security_deposit: 0, utilities: 0, eviction: 0,
    other: 0
  }
  for (const c of cases) {
    categoryCounts[c.category]++
  }
  const commonCategories = Object.entries(categoryCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat as IssueCategory)

  // Average resolution time
  let totalDays = 0
  let resolvedCount = 0
  for (const c of resolved) {
    if (c.resolution?.date) {
      totalDays += (c.resolution.date - c.createdAt) / DAY_MS
      resolvedCount++
    }
  }

  return {
    totalCases: cases.length,
    victories: victories.length,
    winRate: resolved.length > 0 ? victories.length / resolved.length : 0,
    avgResolutionDays: resolvedCount > 0 ? Math.round(totalDays / resolvedCount) : null,
    successfulTactics,
    commonCategories,
  }
}

/**
 * Analyze landlord response patterns across all their properties
 * Note: This requires building address to identify landlord - falls back to building-only analysis
 */
export function getLandlordPattern(buildingAddress: string): LandlordPattern {
  // For now, we analyze all cases to build patterns
  // In future, this could query by owner name from property data
  const allCases = getAllCases()

  // Find cases that might be from same landlord (same building address prefix)
  // This is a heuristic - in production you'd match by owner name
  const addressPrefix = buildingAddress.split(',')[0]?.trim().toLowerCase() || ''
  const relevantCases = allCases.filter(c =>
    c.buildingAddress.toLowerCase().startsWith(addressPrefix) ||
    c.buildingAddress.toLowerCase().includes(addressPrefix)
  )

  if (relevantCases.length === 0) {
    return {
      totalCases: 0,
      avgResponseDays: null,
      ignoreRate: 0,
      retaliationRate: 0,
      successfulTactics: [],
      typicalBehavior: 'unknown',
    }
  }

  // Analyze response patterns
  let ignoredCount = 0
  let retaliatedCount = 0
  let totalResponseDays = 0
  let responseCount = 0

  for (const c of relevantCases) {
    const responses = c.landlordResponses
    if (responses.length === 0) {
      if (c.stage !== 'identified' && c.stage !== 'drafted') {
        ignoredCount++
      }
    } else {
      for (const r of responses) {
        if (r.responseType === 'ignored') ignoredCount++
        if (r.responseType === 'retaliated') retaliatedCount++
      }
      // Time to first response
      const firstResponse = responses[0]
      if (firstResponse && c.deliveryDate) {
        const days = (firstResponse.date - c.deliveryDate) / DAY_MS
        if (days >= 0 && days < 365) { // Sanity check
          totalResponseDays += days
          responseCount++
        }
      }
    }
  }

  // Count successful tactics
  const tacticCounts: Record<EscalationPath['type'], number> = {
    code_enforcement: 0, legal: 0, strike: 0, public_pressure: 0
  }
  const victories = relevantCases.filter(c =>
    c.resolution?.type === 'victory' || c.resolution?.type === 'compromise'
  )
  for (const v of victories) {
    for (const path of v.escalationPaths) {
      if (path.status === 'completed') {
        tacticCounts[path.type]++
      }
    }
  }

  const successfulTactics = Object.entries(tacticCounts)
    .filter(([, count]) => count > 0)
    .map(([tactic, count]) => ({ tactic: tactic as EscalationPath['type'], successCount: count }))
    .sort((a, b) => b.successCount - a.successCount)

  // Determine typical behavior
  const ignoreRate = relevantCases.length > 0 ? ignoredCount / relevantCases.length : 0
  const retaliationRate = relevantCases.length > 0 ? retaliatedCount / relevantCases.length : 0
  const avgResponseDays = responseCount > 0 ? Math.round(totalResponseDays / responseCount) : null

  let typicalBehavior: LandlordPattern['typicalBehavior'] = 'unknown'
  if (retaliationRate > 0.2) {
    typicalBehavior = 'hostile'
  } else if (ignoreRate > 0.5) {
    typicalBehavior = 'ignores_until_pressure'
  } else if (avgResponseDays !== null && avgResponseDays > 14) {
    typicalBehavior = 'slow'
  } else if (avgResponseDays !== null && avgResponseDays <= 7) {
    typicalBehavior = 'responsive'
  }

  return {
    totalCases: relevantCases.length,
    avgResponseDays,
    ignoreRate,
    retaliationRate,
    successfulTactics,
    typicalBehavior,
  }
}

/**
 * Calculate days since a stage began
 */
function getDaysInStage(caseData: EscalationCase): number {
  // Find the most recent stage change
  const stageEvents = caseData.timeline.filter(e => e.type === 'stage_change' || e.type === 'created')
  const lastStageChange = stageEvents[stageEvents.length - 1]
  if (!lastStageChange) return Math.ceil((Date.now() - caseData.createdAt) / DAY_MS)
  return Math.ceil((Date.now() - lastStageChange.date) / DAY_MS)
}

/**
 * Get urgency multiplier based on severity and time
 */
function getUrgencyLevel(caseData: EscalationCase, daysInStage: number): {
  urgent: boolean
  timeWarning: string | null
} {
  // Emergency cases are always urgent
  if (caseData.severity === 'emergency') {
    return { urgent: true, timeWarning: 'Emergency - requires immediate action' }
  }

  // Retaliation detected
  const lastResponse = caseData.landlordResponses[caseData.landlordResponses.length - 1]
  if (lastResponse?.responseType === 'retaliated') {
    return { urgent: true, timeWarning: 'Retaliation detected - seek legal help immediately' }
  }

  // Deadline passed
  if (caseData.deadlineDate && caseData.deadlineDate < Date.now()) {
    const daysOverdue = Math.ceil((Date.now() - caseData.deadlineDate) / DAY_MS)
    return {
      urgent: daysOverdue > 3,
      timeWarning: `${daysOverdue} days past deadline - landlord has not responded`
    }
  }

  // Stuck in stage too long
  const stageTimeouts: Record<EscalationStage, number> = {
    identified: 14,    // 2 weeks to gather support
    drafted: 7,        // 1 week to send demand
    delivered: 21,     // 3 weeks to get response (after deadline)
    awaiting: 14,      // 2 weeks to decide on escalation
    escalating: 30,    // 1 month for escalation to progress
    resolved: 999,     // No timeout
  }

  const timeout = stageTimeouts[caseData.stage]
  if (daysInStage > timeout) {
    return {
      urgent: caseData.severity === 'serious' || daysInStage > timeout * 1.5,
      timeWarning: `${daysInStage} days in ${caseData.stage} stage - consider moving forward`
    }
  }

  return { urgent: false, timeWarning: null }
}

/**
 * Get enhanced suggestions with context from building history and landlord patterns
 */
export function getEnhancedSuggestion(
  caseData: EscalationCase,
  options?: {
    includeBuildingHistory?: boolean
    includeLandlordPattern?: boolean
  }
): EnhancedSuggestion {
  const now = Date.now()
  const daysInStage = getDaysInStage(caseData)
  const { urgent, timeWarning } = getUrgencyLevel(caseData, daysInStage)

  // Get context data if requested
  const buildingHistory = options?.includeBuildingHistory !== false
    ? getBuildingHistory(caseData.buildingId)
    : null
  const landlordPattern = options?.includeLandlordPattern !== false
    ? getLandlordPattern(caseData.buildingAddress)
    : null

  const basedOn: SuggestionSource[] = []
  let alternativeActions: EnhancedSuggestion['alternativeActions'] = undefined

  // Start with basic stage-based suggestion
  const basicSuggestion = getSuggestedAction(caseData)

  // Build enhanced suggestion based on context
  let action = basicSuggestion.action
  let reason = basicSuggestion.reason
  let confidence: EnhancedSuggestion['confidence'] = 'medium'
  let recommendedDeadlineDays: number | undefined

  basedOn.push({ type: 'stage', detail: `Current stage: ${caseData.stage}` })

  // Add time-based context
  if (timeWarning) {
    basedOn.push({ type: 'time', detail: timeWarning, daysSince: daysInStage })
  }

  // Add severity context
  if (caseData.severity === 'emergency' || caseData.severity === 'serious') {
    basedOn.push({ type: 'severity', detail: `${caseData.severity.toUpperCase()} severity issue` })
  }

  // Enhance suggestions based on stage and context
  switch (caseData.stage) {
    case 'identified': {
      if (daysInStage > 7 && caseData.affectedUnits.length < 3) {
        action = 'Actively canvas for more affected tenants'
        reason = `Only ${caseData.affectedUnits.length} unit(s) documented after ${daysInStage} days - need more support`
        basedOn.push({ type: 'time', detail: 'Extended time in identification phase', daysSince: daysInStage })
      }
      if (buildingHistory && buildingHistory.winRate > 0.5) {
        confidence = 'high'
        reason += `. This building has a ${Math.round(buildingHistory.winRate * 100)}% win rate!`
        basedOn.push({
          type: 'building_history',
          detail: `${buildingHistory.victories} victories at this building`,
          successRate: buildingHistory.winRate
        })
      }
      break
    }

    case 'drafted': {
      // Recommend delivery method based on landlord pattern
      if (landlordPattern && landlordPattern.typicalBehavior === 'ignores_until_pressure') {
        action = 'Send demand via certified mail with return receipt'
        reason = 'This landlord typically ignores initial contact - create paper trail'
        confidence = 'high'
        basedOn.push({
          type: 'landlord_pattern',
          detail: 'Landlord pattern: ignores until pressure applied',
          responsePattern: landlordPattern.typicalBehavior
        })
      }
      recommendedDeadlineDays = 14 // Default deadline
      break
    }

    case 'delivered': {
      if (caseData.deadlineDate) {
        const daysUntilDeadline = Math.ceil((caseData.deadlineDate - now) / DAY_MS)

        if (daysUntilDeadline < 0) {
          // Deadline passed
          const daysOverdue = Math.abs(daysUntilDeadline)

          if (landlordPattern && landlordPattern.typicalBehavior === 'hostile') {
            action = 'Document everything and contact legal aid'
            reason = `${daysOverdue} days overdue. This landlord has hostile patterns - protect yourself`
            confidence = 'high'
            basedOn.push({
              type: 'landlord_pattern',
              detail: `${Math.round(landlordPattern.retaliationRate * 100)}% retaliation rate`,
              responsePattern: 'hostile'
            })
          } else if (daysOverdue > 7) {
            // Suggest escalation based on what worked before
            if (buildingHistory && buildingHistory.successfulTactics.length > 0) {
              const bestTactic = buildingHistory.successfulTactics[0]
              const tacticLabels: Record<EscalationPath['type'], string> = {
                code_enforcement: 'File code enforcement complaint',
                legal: 'Contact legal aid',
                strike: 'Organize rent strike',
                public_pressure: 'Launch public pressure campaign'
              }
              action = tacticLabels[bestTactic.tactic]
              reason = `No response after ${daysOverdue} days. ${tacticLabels[bestTactic.tactic]} worked ${bestTactic.successCount} time(s) here`
              confidence = 'high'
              basedOn.push({
                type: 'building_history',
                detail: `${bestTactic.tactic} successful at this building`,
                successRate: buildingHistory.winRate
              })
            } else {
              action = 'Escalate: file code enforcement or contact legal aid'
              reason = `${daysOverdue} days past deadline with no response - time to escalate`
            }

            // Add alternative actions for multi-path escalation
            alternativeActions = [
              { action: 'File code enforcement complaint', reason: 'Request official inspection', actionType: 'file_complaint' },
              { action: 'Contact legal aid', reason: 'Get legal advice on options', actionType: 'contact_legal' },
            ]
            if (caseData.category === 'rent' || caseData.affectedUnits.length >= 5) {
              alternativeActions.push({
                action: 'Organize collective action',
                reason: `${caseData.affectedUnits.length} affected units - collective power`,
                actionType: 'start_strike'
              })
            }
          }
        } else if (daysUntilDeadline <= 3) {
          action = 'Prepare escalation options'
          reason = `Only ${daysUntilDeadline} day(s) until deadline - plan your next move`
          basedOn.push({ type: 'time', detail: 'Deadline approaching', daysSince: daysInStage })
        }
      }
      break
    }

    case 'awaiting': {
      const lastResponse = caseData.landlordResponses[caseData.landlordResponses.length - 1]

      if (lastResponse?.responseType === 'retaliated') {
        action = 'Contact legal aid IMMEDIATELY'
        reason = 'Retaliation is illegal under Nevada law - you have legal protections'
        confidence = 'high'
        basedOn.push({ type: 'category', detail: 'Retaliation detected - legal emergency' })
      } else if (!lastResponse || lastResponse.responseType === 'ignored') {
        // Suggest multi-path escalation
        const suggestions: Array<{ action: string; reason: string; actionType: SuggestedAction['actionType'] }> = []

        if (caseData.category === 'habitability') {
          suggestions.push({
            action: 'File code enforcement complaint',
            reason: 'Request official inspection of habitability issues',
            actionType: 'file_complaint'
          })
        }

        if (landlordPattern && landlordPattern.successfulTactics.length > 0) {
          const bestTactic = landlordPattern.successfulTactics[0]
          const tacticActions: Record<EscalationPath['type'], { action: string; reason: string }> = {
            code_enforcement: { action: 'File code enforcement complaint', reason: 'Most effective against this landlord' },
            legal: { action: 'Consult legal aid', reason: 'Legal pressure worked before' },
            strike: { action: 'Organize rent strike vote', reason: 'Collective action has been effective' },
            public_pressure: { action: 'Launch public campaign', reason: 'Public pressure worked before' },
          }
          const tactic = tacticActions[bestTactic.tactic]
          if (!suggestions.find(s => s.action === tactic.action)) {
            suggestions.push({ ...tactic, actionType: 'advance_stage' })
          }
          basedOn.push({
            type: 'landlord_pattern',
            detail: `${bestTactic.tactic} effective against this landlord`
          })
        }

        if (caseData.affectedUnits.length >= 3 || caseData.affectedUnits.includes('building-wide')) {
          suggestions.push({
            action: 'Consider collective action (strike/petition)',
            reason: `${caseData.affectedUnits.length >= 3 ? caseData.affectedUnits.length + ' units' : 'Building-wide'} affected - strength in numbers`,
            actionType: 'start_strike'
          })
        }

        if (suggestions.length > 0) {
          action = suggestions[0].action
          reason = suggestions[0].reason
          alternativeActions = suggestions.slice(1)
        }

        // Recommend simultaneous escalation paths
        if (daysInStage > 7 && suggestions.length >= 2) {
          action = 'Start multiple escalation paths simultaneously'
          reason = `${daysInStage} days waiting - apply pressure from multiple angles`
          confidence = 'high'
        }
      }
      break
    }

    case 'escalating': {
      const activePaths = caseData.escalationPaths.filter(p => p.status === 'active')

      if (activePaths.length === 0) {
        action = 'Choose an escalation method'

        // Recommend based on history
        if (buildingHistory && buildingHistory.successfulTactics.length > 0) {
          const best = buildingHistory.successfulTactics[0]
          const tacticNames: Record<EscalationPath['type'], string> = {
            code_enforcement: 'code enforcement',
            legal: 'legal aid',
            strike: 'rent strike',
            public_pressure: 'public pressure'
          }
          action = `Start with ${tacticNames[best.tactic]} (${best.successCount} past successes here)`
          confidence = 'high'
        }
      } else if (activePaths.length === 1 && daysInStage > 14) {
        // Suggest adding another path
        const currentPath = activePaths[0].type
        const otherPaths: EscalationPath['type'][] = ['code_enforcement', 'legal', 'strike', 'public_pressure']
          .filter(p => p !== currentPath) as EscalationPath['type'][]

        action = 'Consider adding another escalation path'
        reason = `${daysInStage} days with single escalation - add pressure from another angle`

        alternativeActions = otherPaths.slice(0, 2).map(p => ({
          action: `Add ${p.replace('_', ' ')} escalation`,
          reason: 'Increase pressure on multiple fronts',
          actionType: 'advance_stage' as const
        }))
      }
      break
    }

    case 'resolved': {
      if (caseData.resolution?.type === 'victory') {
        action = 'Celebrate and document this win!'
        reason = 'Share your victory to inspire other tenants'
        confidence = 'high'
        basedOn.push({ type: 'stage', detail: 'Victory achieved!' })
      }
      break
    }
  }

  return {
    action,
    reason,
    confidence,
    urgent,
    actionType: basicSuggestion.actionType,
    basedOn,
    alternativeActions,
    daysInCurrentStage: daysInStage,
    recommendedDeadlineDays,
  }
}

/**
 * Get all suggestions for a case, sorted by relevance
 */
export function getAllSuggestions(caseData: EscalationCase): EnhancedSuggestion[] {
  const primary = getEnhancedSuggestion(caseData)
  const suggestions: EnhancedSuggestion[] = [primary]

  // Add alternative actions as separate suggestions
  if (primary.alternativeActions) {
    for (const alt of primary.alternativeActions) {
      suggestions.push({
        ...alt,
        confidence: 'medium',
        urgent: false,
        basedOn: [{ type: 'stage', detail: 'Alternative escalation option' }],
        daysInCurrentStage: primary.daysInCurrentStage,
      })
    }
  }

  return suggestions
}

// ============================================================================
// Strike Integration
// ============================================================================

/**
 * Determine if a building should be suggested for rent strike preparation
 * Conditions:
 * - 3+ active (non-resolved) escalation cases
 * - Landlord pattern is "ignores_until_pressure" or "hostile"
 * - OR: Any case has been in "awaiting" or "escalating" stage for 30+ days
 */
export function shouldSuggestStrike(buildingId: string): boolean {
  const activeCases = getActiveCases(buildingId)

  // Need at least 3 active cases
  if (activeCases.length < 3) {
    return false
  }

  // Check landlord pattern
  if (activeCases.length > 0) {
    const landlordPattern = getLandlordPattern(activeCases[0].buildingAddress)
    if (
      landlordPattern.typicalBehavior === 'ignores_until_pressure' ||
      landlordPattern.typicalBehavior === 'hostile'
    ) {
      return true
    }
  }

  // Check if any case has been stuck in advanced stages for 30+ days
  for (const c of activeCases) {
    if (c.stage === 'awaiting' || c.stage === 'escalating') {
      const daysInStage = Math.ceil((Date.now() - c.updatedAt) / DAY_MS)
      if (daysInStage >= 30) {
        return true
      }
    }
  }

  return false
}

/**
 * Link an escalation case to a strike preparation
 */
export function linkCaseToStrike(caseId: string, strikePreparationId: string): EscalationCase | null {
  addTimelineEvent(caseId, {
    type: 'note',
    description: `Case linked to rent strike preparation`,
  })

  return updateCase(caseId, { strikePreparationId })
}

/**
 * Unlink an escalation case from a strike preparation
 */
export function unlinkCaseFromStrike(caseId: string): EscalationCase | null {
  addTimelineEvent(caseId, {
    type: 'note',
    description: `Case unlinked from rent strike preparation`,
  })

  return updateCase(caseId, { strikePreparationId: undefined })
}

/**
 * Get all cases linked to a strike preparation
 */
export function getCasesForStrike(strikePreparationId: string): EscalationCase[] {
  return getAllCases().filter(c => c.strikePreparationId === strikePreparationId)
}
