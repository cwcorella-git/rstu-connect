'use client'

import { randomUUID } from 'crypto'

// ============================================================================
// TYPES
// ============================================================================

export type EvictionCaseStage = 'filed' | 'answered' | 'hearing-scheduled' | 'court' | 'resolved'
export type EvictionCaseType = 'nonpayment' | 'lease_violation' | 'no_cause' | 'other'
export type EvictionUrgency = 'critical' | 'urgent' | 'high' | 'normal'
export type DefenseStrategy = 'habitability_defense' | 'retaliation_defense' | 'procedural_defense' | 'payment_plan' | 'rent_withholding' | 'other'

export interface EvictionCaseEvidence {
  id: string
  type: 'photo' | 'rent-receipt' | 'repair-request' | 'lease' | 'notice' | 'other'
  description: string
  uploadedDate: string
  fileUrl?: string
}

export interface EvictionCaseNote {
  id: string
  authorId: string
  authorName: string
  content: string
  timestamp: number
  organizerOnly: boolean
}

export interface EvictionCaseSupportNeed {
  category: 'legal_fund' | 'moving' | 'childcare' | 'temporary_housing'
  amount?: number
  fulfilled: boolean
}

export interface EvictionCaseOutcome {
  result: 'dismissed' | 'settled' | 'won' | 'lost'
  date: string
  victoryId?: string
}

export interface EvictionCase {
  id: string

  // Tenant Info
  tenantProfileId: string
  tenantName: string
  buildingApn: string
  buildingAddress: string
  unitNumber?: string
  anonymousDisplay: boolean

  // Case Status
  stage: EvictionCaseStage
  urgency: EvictionUrgency
  caseType: EvictionCaseType

  // Dates & Deadlines
  filingDate?: string
  courtDate?: string
  noticeReceivedDate?: string
  noticeDeadline?: string

  // Notice Details
  noticeType?: '3-day' | '5-day' | '7-day' | '30-day'
  noticeHasDefects?: boolean
  noticeDefectDetails?: string

  // Legal Coordination
  legalRepresentation?: {
    hasAttorney: boolean
    attorneyName?: string
    clinic?: 'Northern Nevada Legal Aid' | 'Other'
    consultDate?: string
  }

  // Defense Strategy
  defenseStrategies: DefenseStrategy[]

  // Evidence
  evidence: EvictionCaseEvidence[]

  // Support & Coordination
  mutualAidPostId?: string
  supportNeeds: EvictionCaseSupportNeed[]
  witnessEventId?: string
  witnessSignups: string[]

  // Outcome
  outcome?: EvictionCaseOutcome

  // Notes
  notes: EvictionCaseNote[]

  // Meta
  createdBy: string
  createdAt: number
  updatedAt: number
}

// ============================================================================
// STORAGE KEY & STATE
// ============================================================================

const STORAGE_KEY = 'rstu_eviction_defense_cases'

interface EvictionDefenseState {
  cases: EvictionCase[]
  lastUpdated: number
}

// ============================================================================
// HELPER: CALCULATE URGENCY
// ============================================================================

export function calculateUrgency(courtDate?: string): EvictionUrgency {
  if (!courtDate) return 'normal'

  const today = new Date()
  const hearing = new Date(courtDate)
  const daysUntil = Math.floor((hearing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntil < 0) return 'critical'  // Past due!
  if (daysUntil <= 7) return 'critical'  // <1 week
  if (daysUntil <= 30) return 'urgent'   // <1 month
  if (daysUntil <= 60) return 'high'     // <2 months
  return 'normal'
}

// ============================================================================
// HELPER: CALCULATE DEADLINE FROM NOTICE TYPE
// ============================================================================

export function calculateNoticeDeadline(noticeReceivedDate: string, noticeType: '3-day' | '5-day' | '7-day' | '30-day'): string {
  const received = new Date(noticeReceivedDate)
  const daysToAdd = parseInt(noticeType) // Extract number from "3-day", etc.
  const deadline = new Date(received.getTime() + daysToAdd * 24 * 60 * 60 * 1000)
  return deadline.toISOString().split('T')[0]
}

// ============================================================================
// HELPER: GET DAYS UNTIL COURT
// ============================================================================

export function getDaysUntilCourt(courtDate?: string): number | null {
  if (!courtDate) return null
  const today = new Date()
  const hearing = new Date(courtDate)
  return Math.floor((hearing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

// ============================================================================
// STORAGE FUNCTIONS
// ============================================================================

function getState(): EvictionDefenseState {
  if (typeof window === 'undefined') {
    return { cases: [], lastUpdated: 0 }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : { cases: [], lastUpdated: 0 }
  } catch {
    return { cases: [], lastUpdated: 0 }
  }
}

function setState(state: EvictionDefenseState): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    console.error('Failed to save eviction defense cases')
  }
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export function createCase(data: Omit<EvictionCase, 'id' | 'urgency' | 'createdAt' | 'updatedAt' | 'evidence' | 'notes' | 'witnessSignups'>): EvictionCase {
  const state = getState()

  // Calculate urgency from court date
  const urgency = calculateUrgency(data.courtDate)

  // Calculate notice deadline if provided
  let noticeDeadline = data.noticeDeadline
  if (data.noticeReceivedDate && data.noticeType) {
    noticeDeadline = calculateNoticeDeadline(data.noticeReceivedDate, data.noticeType)
  }

  const newCase: EvictionCase = {
    ...data,
    id: randomUUID(),
    urgency,
    noticeDeadline,
    evidence: [],
    notes: [],
    witnessSignups: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  state.cases.push(newCase)
  setState(state)

  return newCase
}

export function updateCase(caseId: string, updates: Partial<Omit<EvictionCase, 'id' | 'createdAt'>>): EvictionCase | null {
  const state = getState()
  const caseIndex = state.cases.findIndex(c => c.id === caseId)

  if (caseIndex === -1) return null

  const existingCase = state.cases[caseIndex]

  // Recalculate urgency if court date changed
  let urgency = updates.courtDate ? calculateUrgency(updates.courtDate) : existingCase.urgency
  // Use provided urgency if explicitly set
  if (updates.urgency) urgency = updates.urgency

  // Recalculate notice deadline if notice details changed
  let noticeDeadline = updates.noticeDeadline ?? existingCase.noticeDeadline
  if (updates.noticeReceivedDate && updates.noticeType) {
    noticeDeadline = calculateNoticeDeadline(updates.noticeReceivedDate, updates.noticeType)
  }

  const updated: EvictionCase = {
    ...existingCase,
    ...updates,
    urgency,
    noticeDeadline,
    updatedAt: Date.now()
  }

  state.cases[caseIndex] = updated
  setState(state)

  return updated
}

export function deleteCase(caseId: string): boolean {
  const state = getState()
  const initialLength = state.cases.length
  state.cases = state.cases.filter(c => c.id !== caseId)

  if (state.cases.length < initialLength) {
    setState(state)
    return true
  }
  return false
}

export function getCase(caseId: string): EvictionCase | null {
  const state = getState()
  return state.cases.find(c => c.id === caseId) || null
}

export function getAllCases(): EvictionCase[] {
  return getState().cases
}

export function getCasesByBuilding(buildingApn: string): EvictionCase[] {
  return getState().cases.filter(c => c.buildingApn === buildingApn)
}

export function getActiveCases(): EvictionCase[] {
  return getState().cases.filter(c => c.stage !== 'resolved')
}

export function getCriticalCases(): EvictionCase[] {
  return getState().cases.filter(c => c.urgency === 'critical' && c.stage !== 'resolved')
}

// ============================================================================
// EVIDENCE OPERATIONS
// ============================================================================

export function addEvidence(caseId: string, evidence: Omit<EvictionCaseEvidence, 'id'>): EvictionCaseEvidence | null {
  const existingCase = getCase(caseId)
  if (!existingCase) return null

  const newEvidence: EvictionCaseEvidence = {
    ...evidence,
    id: randomUUID()
  }

  existingCase.evidence.push(newEvidence)
  updateCase(caseId, { evidence: existingCase.evidence })

  return newEvidence
}

export function deleteEvidence(caseId: string, evidenceId: string): boolean {
  const existingCase = getCase(caseId)
  if (!existingCase) return false

  const initialLength = existingCase.evidence.length
  existingCase.evidence = existingCase.evidence.filter(e => e.id !== evidenceId)

  if (existingCase.evidence.length < initialLength) {
    updateCase(caseId, { evidence: existingCase.evidence })
    return true
  }
  return false
}

// ============================================================================
// NOTE OPERATIONS
// ============================================================================

export function addNote(caseId: string, authorId: string, authorName: string, content: string, organizerOnly: boolean = false): EvictionCaseNote | null {
  const existingCase = getCase(caseId)
  if (!existingCase) return null

  const newNote: EvictionCaseNote = {
    id: randomUUID(),
    authorId,
    authorName,
    content,
    timestamp: Date.now(),
    organizerOnly
  }

  existingCase.notes.push(newNote)
  updateCase(caseId, { notes: existingCase.notes })

  return newNote
}

export function deleteNote(caseId: string, noteId: string): boolean {
  const existingCase = getCase(caseId)
  if (!existingCase) return false

  const initialLength = existingCase.notes.length
  existingCase.notes = existingCase.notes.filter(n => n.id !== noteId)

  if (existingCase.notes.length < initialLength) {
    updateCase(caseId, { notes: existingCase.notes })
    return true
  }
  return false
}

// ============================================================================
// ATTORNEY ASSIGNMENT
// ============================================================================

export function assignAttorney(caseId: string, attorneyName: string, clinic: 'Northern Nevada Legal Aid' | 'Other' = 'Northern Nevada Legal Aid'): EvictionCase | null {
  const existingCase = getCase(caseId)
  if (!existingCase) return null

  return updateCase(caseId, {
    legalRepresentation: {
      hasAttorney: true,
      attorneyName,
      clinic,
      consultDate: new Date().toISOString().split('T')[0]
    }
  })
}

export function removeAttorney(caseId: string): EvictionCase | null {
  const existingCase = getCase(caseId)
  if (!existingCase) return null

  return updateCase(caseId, {
    legalRepresentation: {
      hasAttorney: false
    }
  })
}

// ============================================================================
// STAGE UPDATES
// ============================================================================

export function updateCaseStage(caseId: string, stage: EvictionCaseStage): EvictionCase | null {
  return updateCase(caseId, { stage })
}

export function markCaseResolved(caseId: string, outcome: EvictionCaseOutcome): EvictionCase | null {
  return updateCase(caseId, {
    stage: 'resolved',
    outcome
  })
}

// ============================================================================
// WITNESS COORDINATION
// ============================================================================

export function addWitnessSignup(caseId: string, profileId: string): EvictionCase | null {
  const existingCase = getCase(caseId)
  if (!existingCase) return null

  if (!existingCase.witnessSignups.includes(profileId)) {
    existingCase.witnessSignups.push(profileId)
    return updateCase(caseId, { witnessSignups: existingCase.witnessSignups })
  }

  return existingCase
}

export function removeWitnessSignup(caseId: string, profileId: string): EvictionCase | null {
  const existingCase = getCase(caseId)
  if (!existingCase) return null

  const filtered = existingCase.witnessSignups.filter(id => id !== profileId)
  if (filtered.length !== existingCase.witnessSignups.length) {
    return updateCase(caseId, { witnessSignups: filtered })
  }

  return existingCase
}

// ============================================================================
// DEFENSE STRATEGY
// ============================================================================

export function addDefenseStrategy(caseId: string, strategy: DefenseStrategy): EvictionCase | null {
  const existingCase = getCase(caseId)
  if (!existingCase) return null

  if (!existingCase.defenseStrategies.includes(strategy)) {
    existingCase.defenseStrategies.push(strategy)
    return updateCase(caseId, { defenseStrategies: existingCase.defenseStrategies })
  }

  return existingCase
}

export function removeDefenseStrategy(caseId: string, strategy: DefenseStrategy): EvictionCase | null {
  const existingCase = getCase(caseId)
  if (!existingCase) return null

  const filtered = existingCase.defenseStrategies.filter(s => s !== strategy)
  if (filtered.length !== existingCase.defenseStrategies.length) {
    return updateCase(caseId, { defenseStrategies: filtered })
  }

  return existingCase
}

// ============================================================================
// SORTING & FILTERING
// ============================================================================

export function sortCasesByUrgency(cases: EvictionCase[]): EvictionCase[] {
  const urgencyOrder = { critical: 0, urgent: 1, high: 2, normal: 3 }
  return [...cases].sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])
}

export function sortCasesByCourtDate(cases: EvictionCase[]): EvictionCase[] {
  return [...cases].sort((a, b) => {
    if (!a.courtDate && !b.courtDate) return 0
    if (!a.courtDate) return 1
    if (!b.courtDate) return -1
    return new Date(a.courtDate).getTime() - new Date(b.courtDate).getTime()
  })
}

export function filterCasesByBuilding(cases: EvictionCase[], buildingApn: string): EvictionCase[] {
  return cases.filter(c => c.buildingApn === buildingApn)
}

export function filterActiveOnly(cases: EvictionCase[]): EvictionCase[] {
  return cases.filter(c => c.stage !== 'resolved')
}
