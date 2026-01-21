import { createLogger } from './logger'

const log = createLogger('Strike')

// Rent strike preparation tracking
// Supports both localStorage (offline) and Supabase (cloud sync)

import { createProposal, getProposal, VOTE_THRESHOLDS } from './governanceStorage'

const STORAGE_KEY = 'rstu_strike_data'

// Strike preparation data structure
export interface StrikePreparation {
  id: string
  buildingChatSlug: string
  campaignId?: string

  // Linked escalation cases
  linkedEscalationIds: string[]

  // Legal Checklist
  legalChecklist: {
    habitabilityDocumented: boolean
    noticesSent: {
      type: '14-day' | '48-hour'
      dateSent: string | null
      recipients: string[]
      proofOfService: string | null
    }[]
    escrowAccount: {
      bankName: string | null
      accountNumber: string | null
      setupDate: string | null
      monthlyDeposits: number[]
    } | null
    legalClinicConsultation: {
      clinic: 'Northern Nevada Legal Aid' | 'Other'
      consultDate: string | null
      attorney: string | null
      notes: string
    } | null
  }

  // Participation Tracking
  participation: {
    committedUnits: string[]
    uncommittedUnits: string[]
    totalUnits: number
    percentCommitted: number
    strikeReadyThreshold: 65
  }

  // Financial Calculations
  financial: {
    monthlyRentAtRisk: number
    escrowBalance: number
    mutualAidFundGoal: number
    individualBudgets: {
      unitId: string
      monthlyRent: number
      financialRunway: number
      mutualAidNeeds: string[]
    }[]
  }

  // Mutual Aid Coordination
  mutualAid: {
    strikeFundCampaignId: string | null
    resourcesActivated: boolean
    allocations: {
      unitId: string
      resourceType: string
      amount: number
      frequency: 'weekly' | 'monthly'
    }[]
  }

  // Defense Coordination
  defense: {
    legalAidAssignments: {
      unitId: string
      attorneyName: string | null
      courtDate: string | null
    }[]
    evidenceArchive: {
      type: 'photo' | 'email' | 'repair-request' | 'inspector-report'
      description: string
      dateCollected: string
      fileUrl: string | null
    }[]
  }

  // Strike Authorization
  strikeVote: {
    proposalId: string | null
    voteStatus: 'pending' | 'approved' | 'rejected'
    startDate: string | null
  }

  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: string
  stage: 'planning' | 'legal-prep' | 'financial-prep' | 'defense-prep' | 'authorized' | 'active'
}

// Complete strike state
export interface StrikeState {
  strikes: Record<string, StrikePreparation>
  lastModified: number
}

// ============================================
// localStorage Operations
// ============================================

// Get full strike state
export function getStrikeState(): StrikeState {
  if (typeof window === 'undefined') {
    return { strikes: {}, lastModified: 0 }
  }
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return { strikes: {}, lastModified: 0 }
  }
  try {
    return JSON.parse(stored)
  } catch {
    return { strikes: {}, lastModified: 0 }
  }
}

// Save full strike state
function saveStrikeState(state: StrikeState): void {
  if (typeof window === 'undefined') return
  state.lastModified = Date.now()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    log.error('Failed to save - storage quota may be exceeded:', e)
  }
}

// ============================================
// Strike Preparation Operations
// ============================================

// Create new strike preparation
export function createStrikePreparation(buildingChatSlug: string, userId: string): StrikePreparation {
  const state = getStrikeState()
  const id = `strike_${buildingChatSlug}_${Date.now()}`
  const now = new Date().toISOString()

  const strike: StrikePreparation = {
    id,
    buildingChatSlug,
    linkedEscalationIds: [],
    legalChecklist: {
      habitabilityDocumented: false,
      noticesSent: [],
      escrowAccount: null,
      legalClinicConsultation: null,
    },
    participation: {
      committedUnits: [],
      uncommittedUnits: [],
      totalUnits: 0,
      percentCommitted: 0,
      strikeReadyThreshold: 65,
    },
    financial: {
      monthlyRentAtRisk: 0,
      escrowBalance: 0,
      mutualAidFundGoal: 0,
      individualBudgets: [],
    },
    mutualAid: {
      strikeFundCampaignId: null,
      resourcesActivated: false,
      allocations: [],
    },
    defense: {
      legalAidAssignments: [],
      evidenceArchive: [],
    },
    strikeVote: {
      proposalId: null,
      voteStatus: 'pending',
      startDate: null,
    },
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    stage: 'planning',
  }

  state.strikes[id] = strike
  saveStrikeState(state)
  return strike
}

// Get strike preparation by building
export function getStrikePreparation(buildingChatSlug: string): StrikePreparation | null {
  const state = getStrikeState()
  const strike = Object.values(state.strikes).find(s => s.buildingChatSlug === buildingChatSlug)
  return strike || null
}

// Get strike preparation by ID
export function getStrikePreparationById(strikeId: string): StrikePreparation | null {
  const state = getStrikeState()
  return state.strikes[strikeId] || null
}

// Update strike preparation
function updateStrike(strikeId: string, updates: Partial<StrikePreparation>): void {
  const state = getStrikeState()
  const strike = state.strikes[strikeId]
  if (!strike) return

  state.strikes[strikeId] = {
    ...strike,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  saveStrikeState(state)
}

// ============================================
// Legal Checklist Operations
// ============================================

export function updateLegalChecklist(
  strikeId: string,
  updates: Partial<StrikePreparation['legalChecklist']>
): void {
  const strike = getStrikePreparationById(strikeId)
  if (!strike) return

  updateStrike(strikeId, {
    legalChecklist: {
      ...strike.legalChecklist,
      ...updates,
    },
  })
}

export function addNoticeSent(
  strikeId: string,
  type: '14-day' | '48-hour',
  recipients: string[],
  proofOfService?: string
): void {
  const strike = getStrikePreparationById(strikeId)
  if (!strike) return

  const noticesSent = [
    ...strike.legalChecklist.noticesSent,
    {
      type,
      dateSent: new Date().toISOString(),
      recipients,
      proofOfService: proofOfService || null,
    },
  ]

  updateLegalChecklist(strikeId, { noticesSent })
}

export function setEscrowAccount(
  strikeId: string,
  bankName: string,
  accountNumber: string
): void {
  const strike = getStrikePreparationById(strikeId)
  if (!strike) return

  updateLegalChecklist(strikeId, {
    escrowAccount: {
      bankName,
      accountNumber,
      setupDate: new Date().toISOString(),
      monthlyDeposits: [],
    },
  })
}

export function addEscrowDeposit(strikeId: string, amount: number): void {
  const strike = getStrikePreparationById(strikeId)
  if (!strike || !strike.legalChecklist.escrowAccount) return

  const escrowAccount = {
    ...strike.legalChecklist.escrowAccount,
    monthlyDeposits: [...(strike.legalChecklist.escrowAccount.monthlyDeposits || []), amount],
  }

  updateLegalChecklist(strikeId, { escrowAccount })
}

export function setLegalClinicConsultation(
  strikeId: string,
  clinic: 'Northern Nevada Legal Aid' | 'Other',
  consultDate: string,
  attorney?: string,
  notes?: string
): void {
  const strike = getStrikePreparationById(strikeId)
  if (!strike) return

  updateLegalChecklist(strikeId, {
    legalClinicConsultation: {
      clinic,
      consultDate,
      attorney: attorney || null,
      notes: notes || '',
    },
  })
}

// ============================================
// Participation Tracking Operations
// ============================================

export function initializeParticipationTracking(
  strikeId: string,
  totalUnits: number,
  canvassedUnits: string[]
): void {
  const strike = getStrikePreparationById(strikeId)
  if (!strike) return

  const uncommittedUnits = canvassedUnits.filter(u => !strike.participation.committedUnits.includes(u))

  updateStrike(strikeId, {
    participation: {
      committedUnits: strike.participation.committedUnits,
      uncommittedUnits,
      totalUnits,
      percentCommitted: strike.participation.committedUnits.length > 0
        ? Math.round((strike.participation.committedUnits.length / totalUnits) * 100)
        : 0,
      strikeReadyThreshold: 65,
    },
  })
}

export function addCommittedUnit(strikeId: string, unitId: string): void {
  const strike = getStrikePreparationById(strikeId)
  if (!strike || strike.participation.committedUnits.includes(unitId)) return

  const committedUnits = [...strike.participation.committedUnits, unitId]
  const uncommittedUnits = strike.participation.uncommittedUnits.filter(u => u !== unitId)
  const percentCommitted = strike.participation.totalUnits > 0
    ? Math.round((committedUnits.length / strike.participation.totalUnits) * 100)
    : 0

  updateStrike(strikeId, {
    participation: {
      ...strike.participation,
      committedUnits,
      uncommittedUnits,
      percentCommitted,
    },
  })
}

export function removeCommittedUnit(strikeId: string, unitId: string): void {
  const strike = getStrikePreparationById(strikeId)
  if (!strike || !strike.participation.committedUnits.includes(unitId)) return

  const committedUnits = strike.participation.committedUnits.filter(u => u !== unitId)
  const uncommittedUnits = [...strike.participation.uncommittedUnits, unitId]
  const percentCommitted = strike.participation.totalUnits > 0
    ? Math.round((committedUnits.length / strike.participation.totalUnits) * 100)
    : 0

  updateStrike(strikeId, {
    participation: {
      ...strike.participation,
      committedUnits,
      uncommittedUnits,
      percentCommitted,
    },
  })
}

// ============================================
// Financial Tracking Operations
// ============================================

export function updateFinancialData(
  strikeId: string,
  monthlyRentAtRisk: number,
  escrowBalance: number = 0,
  mutualAidGoal: number = 0
): void {
  const strike = getStrikePreparationById(strikeId)
  if (!strike) return

  updateStrike(strikeId, {
    financial: {
      ...strike.financial,
      monthlyRentAtRisk,
      escrowBalance,
      mutualAidFundGoal: mutualAidGoal || monthlyRentAtRisk * 3,
    },
  })
}

export function updateTenantBudget(
  strikeId: string,
  unitId: string,
  monthlyRent: number,
  financialRunway: number,
  mutualAidNeeds: string[] = []
): void {
  const strike = getStrikePreparationById(strikeId)
  if (!strike) return

  const existingIndex = strike.financial.individualBudgets.findIndex(b => b.unitId === unitId)
  const budgets = [...strike.financial.individualBudgets]

  if (existingIndex >= 0) {
    budgets[existingIndex] = {
      unitId,
      monthlyRent,
      financialRunway,
      mutualAidNeeds,
    }
  } else {
    budgets.push({
      unitId,
      monthlyRent,
      financialRunway,
      mutualAidNeeds,
    })
  }

  updateStrike(strikeId, {
    financial: {
      ...strike.financial,
      individualBudgets: budgets,
    },
  })
}

// ============================================
// Mutual Aid Operations
// ============================================

export function activateStrikeFund(strikeId: string, campaignId: string): void {
  const strike = getStrikePreparationById(strikeId)
  if (!strike) return

  updateStrike(strikeId, {
    mutualAid: {
      ...strike.mutualAid,
      strikeFundCampaignId: campaignId,
      resourcesActivated: true,
    },
  })
}

export function addResourceAllocation(
  strikeId: string,
  unitId: string,
  resourceType: string,
  amount: number,
  frequency: 'weekly' | 'monthly'
): void {
  const strike = getStrikePreparationById(strikeId)
  if (!strike) return

  const allocations = [
    ...strike.mutualAid.allocations,
    {
      unitId,
      resourceType,
      amount,
      frequency,
    },
  ]

  updateStrike(strikeId, {
    mutualAid: {
      ...strike.mutualAid,
      allocations,
    },
  })
}

// ============================================
// Defense Coordination Operations
// ============================================

export function assignLegalAid(
  strikeId: string,
  unitId: string,
  attorneyName: string
): void {
  const strike = getStrikePreparationById(strikeId)
  if (!strike) return

  const existingIndex = strike.defense.legalAidAssignments.findIndex(a => a.unitId === unitId)
  const assignments = [...strike.defense.legalAidAssignments]

  if (existingIndex >= 0) {
    assignments[existingIndex] = {
      unitId,
      attorneyName,
      courtDate: assignments[existingIndex].courtDate,
    }
  } else {
    assignments.push({
      unitId,
      attorneyName,
      courtDate: null,
    })
  }

  updateStrike(strikeId, {
    defense: {
      ...strike.defense,
      legalAidAssignments: assignments,
    },
  })
}

export function setCourtDate(strikeId: string, unitId: string, courtDate: string): void {
  const strike = getStrikePreparationById(strikeId)
  if (!strike) return

  const assignments = strike.defense.legalAidAssignments.map(a =>
    a.unitId === unitId ? { ...a, courtDate } : a
  )

  updateStrike(strikeId, {
    defense: {
      ...strike.defense,
      legalAidAssignments: assignments,
    },
  })
}

export function addEvidence(
  strikeId: string,
  type: 'photo' | 'email' | 'repair-request' | 'inspector-report',
  description: string,
  fileUrl?: string
): void {
  const strike = getStrikePreparationById(strikeId)
  if (!strike) return

  const evidenceArchive = [
    ...strike.defense.evidenceArchive,
    {
      type,
      description,
      dateCollected: new Date().toISOString(),
      fileUrl: fileUrl || null,
    },
  ]

  updateStrike(strikeId, {
    defense: {
      ...strike.defense,
      evidenceArchive,
    },
  })
}

// ============================================
// Strike Readiness Calculation
// ============================================

export interface StrikeReadiness {
  legalReady: boolean
  participationReady: boolean
  demandsReady: boolean
  defenseReady: boolean
  overallReady: boolean
  blockers: string[]
}

export function calculateStrikeReadiness(strikeId: string): StrikeReadiness {
  const strike = getStrikePreparationById(strikeId)
  if (!strike) {
    return {
      legalReady: false,
      participationReady: false,
      demandsReady: false,
      defenseReady: false,
      overallReady: false,
      blockers: ['Strike preparation not found'],
    }
  }

  const blockers: string[] = []

  // Legal compliance
  const legalReady =
    strike.legalChecklist.noticesSent.length > 0 &&
    strike.legalChecklist.escrowAccount !== null &&
    strike.legalChecklist.legalClinicConsultation !== null

  if (!legalReady) {
    if (strike.legalChecklist.noticesSent.length === 0) {
      blockers.push('Send landlord notice (14-day or 48-hour)')
    }
    if (!strike.legalChecklist.escrowAccount) {
      blockers.push('Establish escrow account')
    }
    if (!strike.legalChecklist.legalClinicConsultation) {
      blockers.push('Consult with legal clinic')
    }
  }

  // Participation threshold
  const participationReady = strike.participation.percentCommitted >= 65
  if (!participationReady) {
    const needed = Math.ceil(
      (strike.participation.totalUnits * 0.65) - strike.participation.committedUnits.length
    )
    blockers.push(
      `Get ${needed} more units committed (currently ${strike.participation.percentCommitted}%)`
    )
  }

  // Demands approved via governance
  const demandsReady = strike.strikeVote.voteStatus === 'approved'
  if (!demandsReady) {
    blockers.push('Submit rent strike vote for tenant approval (+10 net votes required)')
  }

  // Defense coordinated
  const defenseReady =
    strike.defense.legalAidAssignments.length === strike.participation.committedUnits.length &&
    strike.defense.evidenceArchive.length > 0

  if (!defenseReady) {
    if (
      strike.defense.legalAidAssignments.length < strike.participation.committedUnits.length
    ) {
      blockers.push('Assign attorneys to all committed units')
    }
    if (strike.defense.evidenceArchive.length === 0) {
      blockers.push('Upload evidence (photos, emails, repair requests)')
    }
  }

  const overallReady = legalReady && participationReady && demandsReady && defenseReady

  return {
    legalReady,
    participationReady,
    demandsReady,
    defenseReady,
    overallReady,
    blockers,
  }
}

// ============================================
// Vote & Strike Authorization
// ============================================

export function initializeStrikeVote(strikeId: string, proposalId: string): void {
  const strike = getStrikePreparationById(strikeId)
  if (!strike) return

  updateStrike(strikeId, {
    strikeVote: {
      ...strike.strikeVote,
      proposalId,
      voteStatus: 'pending',
    },
  })
}

export function updateVoteStatus(
  strikeId: string,
  status: 'pending' | 'approved' | 'rejected'
): void {
  const strike = getStrikePreparationById(strikeId)
  if (!strike) return

  updateStrike(strikeId, {
    strikeVote: {
      ...strike.strikeVote,
      voteStatus: status,
    },
  })
}

export function setStrikeStartDate(strikeId: string, startDate: string): void {
  const strike = getStrikePreparationById(strikeId)
  if (!strike) return

  updateStrike(strikeId, {
    strikeVote: {
      ...strike.strikeVote,
      startDate,
    },
    stage: 'active',
  })
}

// ============================================
// Utility Operations
// ============================================

// Get all strikes for a building (in case multiple attempts)
export function getBuildingStrikes(buildingChatSlug: string): StrikePreparation[] {
  const state = getStrikeState()
  return Object.values(state.strikes).filter(s => s.buildingChatSlug === buildingChatSlug)
}

// Delete a strike preparation
export function deleteStrike(strikeId: string): void {
  const state = getStrikeState()
  delete state.strikes[strikeId]
  saveStrikeState(state)
}

// Export strike documentation as data (for PDF generation)
export function getStrikeDocumentationData(strikeId: string) {
  const strike = getStrikePreparationById(strikeId)
  if (!strike) return null

  return {
    buildingChatSlug: strike.buildingChatSlug,
    createdAt: strike.createdAt,
    stage: strike.stage,
    legal: strike.legalChecklist,
    participation: strike.participation,
    financial: strike.financial,
    defense: strike.defense,
  }
}

// ============================================
// Escalation Case Linking
// ============================================

/**
 * Link an escalation case to a strike preparation
 */
export function linkEscalationToStrike(strikeId: string, escalationCaseId: string): boolean {
  const strike = getStrikePreparationById(strikeId)
  if (!strike) return false

  // Don't add duplicates
  if (strike.linkedEscalationIds.includes(escalationCaseId)) {
    return true
  }

  const state = getStrikeState()
  state.strikes[strikeId] = {
    ...strike,
    linkedEscalationIds: [...strike.linkedEscalationIds, escalationCaseId],
    updatedAt: new Date().toISOString(),
  }
  saveStrikeState(state)
  return true
}

/**
 * Unlink an escalation case from a strike preparation
 */
export function unlinkEscalationFromStrike(strikeId: string, escalationCaseId: string): boolean {
  const strike = getStrikePreparationById(strikeId)
  if (!strike) return false

  const state = getStrikeState()
  state.strikes[strikeId] = {
    ...strike,
    linkedEscalationIds: strike.linkedEscalationIds.filter(id => id !== escalationCaseId),
    updatedAt: new Date().toISOString(),
  }
  saveStrikeState(state)
  return true
}

/**
 * Get active strike for a building (most recent non-abandoned)
 */
export function getStrikeForBuilding(buildingChatSlug: string): StrikePreparation | null {
  const strikes = getBuildingStrikes(buildingChatSlug)
  // Return the most recent active strike (not in 'active' stage which means strike has started)
  const active = strikes
    .filter(s => s.stage !== 'active') // Filter out already-started strikes
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  return active[0] || null
}

/**
 * Create a strike preparation and link existing escalation cases
 */
export function createStrikeFromEscalations(
  buildingChatSlug: string,
  userId: string,
  escalationCaseIds: string[]
): StrikePreparation {
  const strike = createStrikePreparation(buildingChatSlug, userId)

  // Link all provided escalation cases
  for (const caseId of escalationCaseIds) {
    linkEscalationToStrike(strike.id, caseId)
  }

  return getStrikePreparationById(strike.id) || strike
}

// ============================================
// Governance Integration
// ============================================

/**
 * Create a rent-strike governance proposal for the building
 * Requires all 4 readiness dimensions to be true before calling
 */
export function createStrikeProposal(strikeId: string): string | null {
  const strike = getStrikePreparationById(strikeId)
  if (!strike) return null

  // Check readiness before creating proposal
  const readiness = calculateStrikeReadiness(strikeId)
  if (!readiness.legalReady || !readiness.participationReady || !readiness.defenseReady) {
    log.warn('Cannot create strike proposal - readiness not met')
    return null
  }

  // Create the governance proposal
  const proposal = createProposal('rent-strike', strike.buildingChatSlug, {
    targetValue: `Rent Strike Authorization for ${strike.buildingChatSlug}`,
    reason: `Strike preparation complete. ${strike.participation.committedUnits.length} units committed (${strike.participation.percentCommitted}%). Legal preparation done. Defense coordination ready.`,
  })

  if (!proposal) {
    log.error('Failed to create rent-strike proposal')
    return null
  }

  // Link proposal to strike
  const state = getStrikeState()
  if (state.strikes[strikeId]) {
    state.strikes[strikeId] = {
      ...state.strikes[strikeId],
      strikeVote: {
        ...state.strikes[strikeId].strikeVote,
        proposalId: proposal.id,
        voteStatus: 'pending',
      },
      updatedAt: new Date().toISOString(),
    }
    saveStrikeState(state)
  }

  return proposal.id
}

/**
 * Check and sync the strike vote status from governance proposal
 */
export function syncStrikeVoteStatus(strikeId: string): 'pending' | 'approved' | 'rejected' | null {
  const strike = getStrikePreparationById(strikeId)
  if (!strike || !strike.strikeVote.proposalId) return null

  const proposal = getProposal(strike.strikeVote.proposalId)
  if (!proposal) return null

  // Calculate vote threshold
  const netVotes = proposal.upvotes.length - proposal.downvotes.length
  const threshold = VOTE_THRESHOLDS['rent-strike'] // +10

  let newStatus: 'pending' | 'approved' | 'rejected' = 'pending'

  if (netVotes >= threshold || proposal.status === 'passed' || proposal.status === 'executed') {
    newStatus = 'approved'
  } else if (netVotes <= -3 || proposal.status === 'rejected') {
    newStatus = 'rejected'
  }

  // Update strike status if changed
  if (newStatus !== strike.strikeVote.voteStatus) {
    const state = getStrikeState()
    if (state.strikes[strikeId]) {
      state.strikes[strikeId] = {
        ...state.strikes[strikeId],
        strikeVote: {
          ...state.strikes[strikeId].strikeVote,
          voteStatus: newStatus,
        },
        stage: newStatus === 'approved' ? 'authorized' : state.strikes[strikeId].stage,
        updatedAt: new Date().toISOString(),
      }
      saveStrikeState(state)
    }
  }

  return newStatus
}

/**
 * Get the vote progress for a strike proposal
 */
export function getStrikeVoteProgress(strikeId: string): {
  upvotes: number
  downvotes: number
  netVotes: number
  threshold: number
  percentComplete: number
} | null {
  const strike = getStrikePreparationById(strikeId)
  if (!strike || !strike.strikeVote.proposalId) return null

  const proposal = getProposal(strike.strikeVote.proposalId)
  if (!proposal) return null

  const upvotes = proposal.upvotes.length
  const downvotes = proposal.downvotes.length
  const netVotes = upvotes - downvotes
  const threshold = VOTE_THRESHOLDS['rent-strike']
  const percentComplete = Math.min(100, Math.max(0, (netVotes / threshold) * 100))

  return {
    upvotes,
    downvotes,
    netVotes,
    threshold,
    percentComplete,
  }
}
