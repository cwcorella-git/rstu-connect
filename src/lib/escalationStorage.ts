/**
 * Escalation Ladder Storage
 *
 * Tracks issues through the organizing cycle:
 * IDENTIFIED → DRAFTED → DELIVERED → AWAITING → ESCALATING → RESOLVED
 *
 * Phase 1: Core state machine with manual stage transitions
 */

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
  | 'habitability'  // Repairs, safety, health issues
  | 'lease'         // Lease violations by landlord
  | 'harassment'    // Landlord harassment
  | 'retaliation'   // Retaliation for organizing
  | 'rent'          // Rent increases, fees
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

// ============================================================================
// Storage Key
// ============================================================================

const STORAGE_KEY = 'rstu_escalation_cases'

// ============================================================================
// Helper Functions
// ============================================================================

function generateId(): string {
  return `esc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateTimelineEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
