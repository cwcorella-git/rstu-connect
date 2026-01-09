'use client'

import { randomUUID } from 'crypto'
import { sanitizeText, sanitizeRichText } from './sanitize'

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

export interface WitnessSignup {
  name: string
  role: 'neighbor' | 'tenant' | 'organizer' | 'attorney' | 'other'
  contact?: string
  status: 'interested' | 'confirmed' | 'present'
  signedUpAt: string
  signedUpBy: string // Profile ID of person who added the witness
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
  witnessSignups: WitnessSignup[]

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
// NEVADA LEGAL PLAYBOOK
// ============================================================================

export interface NoticeRequirements {
  mustInclude: string[]
  serviceMethod: string[]
  timeline: string
}

export interface CommonDefect {
  defect: string
  howToChallenge: string
}

export interface TenantOption {
  option: string
  deadline: string
  procedure: string
}

export interface CourtProcessStage {
  stage: string
  tenantRights: string[]
  timeline: string
}

export interface ResourceItem {
  name: string
  contact: string
  services: string
}

export interface NevadaNoticeGuidance {
  noticeType: '3-day' | '5-day' | '7-day' | '30-day'
  title: string
  statute: string
  description: string
  requirements: NoticeRequirements
  commonDefects: CommonDefect[]
  tenantOptions: TenantOption[]
  courtProcess: CourtProcessStage[]
  resources: ResourceItem[]
}

export const NEVADA_PLAYBOOK: Record<'3-day' | '5-day' | '7-day' | '30-day', NevadaNoticeGuidance> = {
  '3-day': {
    noticeType: '3-day',
    title: '3-Day Notice to Pay or Quit (Nonpayment)',
    statute: 'NRS 40.253',
    description: 'Most common eviction notice. Landlord must specify exact amount owed and give tenant 3 full days to pay or leave.',
    requirements: {
      mustInclude: [
        'Exact amount of rent owed (itemized by month)',
        'Date notice was served',
        'Date tenant must pay or vacate (3 days)',
        'Landlord contact information',
        'NRS 40.253 citation'
      ],
      serviceMethod: [
        'Personal delivery to tenant',
        'Posting on front door + certified mail',
        'Email (if lease allows)'
      ],
      timeline: '3 full calendar days (not including day notice served)'
    },
    commonDefects: [
      {
        defect: 'Wrong amount calculated',
        howToChallenge: 'File answer pointing out calculation error. Provide rent receipts and payment history.'
      },
      {
        defect: 'No proof of posting',
        howToChallenge: 'Demand proof of certified mail delivery or photo of posted notice. Without proof, case can be dismissed.'
      },
      {
        defect: 'Served by unauthorized person',
        howToChallenge: 'Only sheriff or licensed process server can serve. Challenge if served by landlord or unlicensed person.'
      },
      {
        defect: 'Doesn\'t reference NRS 40.253',
        howToChallenge: 'Notice must cite statute. Defect in notice can result in dismissal.'
      }
    ],
    tenantOptions: [
      {
        option: 'Pay and Stay (Cure)',
        deadline: 'Before midnight on 3rd day',
        procedure: 'Pay FULL amount owed to landlord (check landlord address on notice). Get written receipt. Keep copy.'
      },
      {
        option: 'Challenge Defects (Answer)',
        deadline: 'Before court hearing (typically 7-14 days after notice)',
        procedure: 'File written answer in court pointing out notice errors or calculation mistakes. Free legal clinics can help.'
      },
      {
        option: 'Habitability Defense (NRS 118A.355)',
        deadline: 'Before court hearing',
        procedure: 'If rent withheld due to unsafe conditions (no heat, water, mold, etc.), file answer claiming habitability defense. Document all issues with photos and dates.'
      }
    ],
    courtProcess: [
      {
        stage: 'Notice Served',
        tenantRights: [
          'Right to 3 full days to cure (pay rent)',
          'Right to challenge if notice is defective',
          'Right to consult attorney (free clinics available)'
        ],
        timeline: '3 days from notice service'
      },
      {
        stage: 'Case Filing',
        tenantRights: [
          'Right to receive copy of complaint',
          'Right to appear in court or by phone',
          'Right to bring witnesses'
        ],
        timeline: 'Landlord files after 3 days pass'
      },
      {
        stage: 'Court Hearing',
        tenantRights: [
          'Right to present evidence of payment',
          'Right to challenge notice defects',
          'Right to claim habitability defense',
          'Right to appeal adverse ruling'
        ],
        timeline: 'Typically 7-14 days after case filed'
      }
    ],
    resources: [
      {
        name: 'Northern Nevada Legal Aid',
        contact: '(775) 321-1511 or apply at lacsn.org',
        services: 'Free legal representation, clinic referrals, habitability documentation help'
      },
      {
        name: 'Reno-Sparks Tenants Union (RSTU)',
        contact: 'rstu-connect.neocities.org',
        services: 'Eviction defense coordination, court witness mobilization, mutual aid'
      },
      {
        name: 'Nevada Supreme Court (Self-Help Center)',
        contact: 'https://www.clarkcountycourts.us/self-help/',
        services: 'Free court forms, filing guidance, answer templates'
      }
    ]
  },
  '5-day': {
    noticeType: '5-day',
    title: '5-Day Notice to Cure or Quit (Lease Violation)',
    statute: 'NRS 40.2514',
    description: 'Landlord claims tenant violated lease terms (not rent-related). Tenant gets 5 days to fix violation or move.',
    requirements: {
      mustInclude: [
        'Specific violation description (not vague)',
        'Lease section(s) allegedly violated',
        'Right to cure before vacating',
        'Date tenant must cure or vacate (5 days)',
        'NRS 40.2514 citation'
      ],
      serviceMethod: [
        'Personal delivery to tenant',
        'Posting on front door + certified mail',
        'Email (if lease allows)'
      ],
      timeline: '5 full calendar days'
    },
    commonDefects: [
      {
        defect: 'Vague violation description',
        howToChallenge: 'Notice must be specific. "Breach of lease" without details is too vague. Challenge for lack of specificity.'
      },
      {
        defect: 'Violation is not actually curable',
        howToChallenge: 'Some violations (damage, pets in no-pet building) can\'t be cured by moving out. File answer claiming non-curable violation.'
      },
      {
        defect: 'Violation is landlord\'s responsibility',
        howToChallenge: 'If violation is repairs/maintenance landlord should do, file answer. Landlord can\'t evict for their own failures.'
      },
      {
        defect: 'Retaliatory timing',
        howToChallenge: 'Notice within 6 months of habitability complaint, wage complaint, or union activity = retaliation (NRS 118A.510). Document dates.'
      }
    ],
    tenantOptions: [
      {
        option: 'Cure the Violation',
        deadline: 'Before midnight on 5th day',
        procedure: 'Fix the specific violation (stop noise, remove pet, etc.). Notify landlord in writing that violation cured. Keep documentation.'
      },
      {
        option: 'Dispute in Court (Answer)',
        deadline: 'Before court hearing',
        procedure: 'File written answer claiming: (1) violation didn\'t occur, (2) not your responsibility, or (3) retaliation. Legal aid can help.'
      },
      {
        option: 'Retaliation Defense (NRS 118A.510)',
        deadline: 'Before court hearing',
        procedure: 'If notice came within 6 months of complaining about habitability or organizing, file answer claiming retaliation. Include dates and evidence.'
      }
    ],
    courtProcess: [
      {
        stage: 'Notice Served',
        tenantRights: [
          'Right to 5 days to cure violation',
          'Right to challenge specificity of violation',
          'Right to consult attorney'
        ],
        timeline: '5 days from notice service'
      },
      {
        stage: 'Case Filing (if not cured)',
        tenantRights: [
          'Right to explain violation in court',
          'Right to prove violation was cured',
          'Right to claim retaliation'
        ],
        timeline: 'Landlord files after 5 days pass'
      },
      {
        stage: 'Court Hearing',
        tenantRights: [
          'Right to question landlord\'s evidence',
          'Right to present witnesses',
          'Right to argue retaliation defense',
          'Right to appeal'
        ],
        timeline: 'Typically 7-14 days after case filed'
      }
    ],
    resources: [
      {
        name: 'Northern Nevada Legal Aid',
        contact: '(775) 321-1511 or apply at lacsn.org',
        services: 'Free legal help with lease disputes, retaliation claims'
      },
      {
        name: 'Reno-Sparks Tenants Union (RSTU)',
        contact: 'rstu-connect.neocities.org',
        services: 'Retaliation documentation, organizing protection'
      }
    ]
  },
  '7-day': {
    noticeType: '7-day',
    title: '7-Day Notice (Nuisance)',
    statute: 'NRS 40.2516',
    description: 'Landlord claims tenant created serious nuisance. No cure period—notice demands immediate vacating.',
    requirements: {
      mustInclude: [
        'Detailed description of nuisance conduct',
        'No "cure" period (immediate vacate)',
        'Specific dates/times of incidents',
        'NRS 40.2516 citation'
      ],
      serviceMethod: [
        'Personal delivery to tenant',
        'Posting on door + certified mail'
      ],
      timeline: 'Immediate or 7 days'
    },
    commonDefects: [
      {
        defect: 'Vague nuisance description',
        howToChallenge: 'Must be specific and serious. General complaints don\'t meet statute threshold. Challenge vagueness.'
      },
      {
        defect: 'Conduct is not actual nuisance',
        howToChallenge: 'Lawful activity (visitors, noise during quiet hours) isn\'t nuisance. File answer with proof.'
      },
      {
        defect: 'No documentation of incidents',
        howToChallenge: 'Landlord should have logs/reports. If no evidence, challenge credibility in court.'
      }
    ],
    tenantOptions: [
      {
        option: 'Cease Conduct (if possible)',
        deadline: 'Immediately or within 7 days',
        procedure: 'Stop alleged nuisance behavior. Document that you\'ve complied. Respond to landlord.'
      },
      {
        option: 'Answer in Court',
        deadline: 'Before court hearing',
        procedure: 'File answer disputing nuisance allegations. Provide evidence of lawful conduct. Get free legal help.'
      }
    ],
    courtProcess: [
      {
        stage: 'Notice Served',
        tenantRights: [
          'Right to court hearing before eviction',
          'Right to challenge nuisance claim',
          'Right to defend lawful conduct'
        ],
        timeline: '7 days or immediate'
      },
      {
        stage: 'Court Hearing',
        tenantRights: [
          'Right to cross-examine landlord',
          'Right to present your version of events',
          'Right to bring character witnesses',
          'Right to appeal'
        ],
        timeline: 'Typically 10-20 days after notice'
      }
    ],
    resources: [
      {
        name: 'Northern Nevada Legal Aid',
        contact: '(775) 321-1511',
        services: 'Defense against nuisance claims'
      }
    ]
  },
  '30-day': {
    noticeType: '30-day',
    title: '30-Day Notice to Vacate (No-Cause Eviction)',
    statute: 'NRS 40.251',
    description: 'Landlord can terminate month-to-month tenancy without reason. Nevada allows 30-day termination.',
    requirements: {
      mustInclude: [
        'Clear statement of termination (month-to-month only)',
        '30 days notice before move-out date',
        'Month-to-month lease confirmation'
      ],
      serviceMethod: [
        'Personal delivery to tenant',
        'Posting on door + certified mail',
        'Email (if lease allows)'
      ],
      timeline: '30 days before end of month'
    },
    commonDefects: [
      {
        defect: 'Actually a fixed-term lease',
        howToChallenge: 'If you have written lease with end date, landlord can\'t use no-cause termination. Challenge lease type.'
      },
      {
        defect: 'Retaliatory timing',
        howToChallenge: 'If notice within 6 months of habitability complaint, rent withholding, or organizing = retaliation (NRS 118A.510).'
      },
      {
        defect: 'Discriminatory intent',
        howToChallenge: 'If targeted based on race, family status, disability, etc. = illegal. File complaint with Fair Housing.'
      }
    ],
    tenantOptions: [
      {
        option: 'Vacate on Time',
        deadline: '30 days from notice',
        procedure: 'Move out by end of notice period. Follow move-out inspection procedures. Document property condition.'
      },
      {
        option: 'Challenge as Retaliation',
        deadline: 'File before court date if case filed',
        procedure: 'Gather evidence of complaint/organizing within 6 months. File retaliation defense. Legal aid can help.'
      },
      {
        option: 'File Discrimination Complaint',
        deadline: 'Within 1 year of discrimination',
        procedure: 'Contact Nevada Equal Rights Commission or HUD. File written complaint with evidence.'
      }
    ],
    courtProcess: [
      {
        stage: 'Notice Served',
        tenantRights: [
          'Right to 30 days to vacate',
          'Right to challenge retaliation',
          'Right to challenge discrimination'
        ],
        timeline: '30 days'
      },
      {
        stage: 'Post-Notice Period',
        tenantRights: [
          'Right to security deposit return (itemized within 30 days)',
          'Right to move-out walkthrough',
          'Right to dispute deductions'
        ],
        timeline: '30 days after move-out'
      }
    ],
    resources: [
      {
        name: 'Nevada Equal Rights Commission',
        contact: 'https://detr.nv.gov/nerc or (702) 486-7161',
        services: 'Housing discrimination complaints'
      },
      {
        name: 'HUD Fair Housing (Nevada)',
        contact: '1-800-669-9777',
        services: 'Federal housing discrimination complaints'
      },
      {
        name: 'Northern Nevada Legal Aid',
        contact: '(775) 321-1511',
        services: 'Retaliation and discrimination defenses'
      }
    ]
  }
}

// ============================================================================
// AT-RISK TENANT DETECTION
// ============================================================================

export interface AtRiskTenant {
  profileId: string
  buildingApn: string
  riskFactors: ('rent_arrears' | 'recent_complaint' | 'retaliation_risk' | 'lease_expiring')[]
  riskScore: number
  suggestedInterventions: ('rent_assistance' | 'legal_clinic' | 'lease_workshop')[]
  dismissed: boolean
}

// ============================================================================
// STORAGE KEY & STATE
// ============================================================================

const STORAGE_KEY = 'rstu_eviction_defense_cases'

interface EvictionDefenseState {
  cases: EvictionCase[]
  lastUpdated: number
  blockCaseLinks: { [blockId: string]: string[] } // blockId -> caseIds
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
    return { cases: [], lastUpdated: 0, blockCaseLinks: {} }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const state = stored ? JSON.parse(stored) : { cases: [], lastUpdated: 0, blockCaseLinks: {} }
    // Ensure blockCaseLinks exists for backwards compatibility
    if (!state.blockCaseLinks) {
      state.blockCaseLinks = {}
    }
    return state
  } catch {
    return { cases: [], lastUpdated: 0, blockCaseLinks: {} }
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
    description: sanitizeText(evidence.description),
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
    authorName: sanitizeText(authorName),
    content: sanitizeRichText(content),
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

export function addWitnessSignup(caseId: string, witness: WitnessSignup): EvictionCase | null {
  const existingCase = getCase(caseId)
  if (!existingCase) return null

  const sanitizedWitness: WitnessSignup = {
    ...witness,
    name: sanitizeText(witness.name),
    contact: witness.contact ? sanitizeText(witness.contact) : undefined,
  }

  existingCase.witnessSignups.push(sanitizedWitness)
  return updateCase(caseId, { witnessSignups: existingCase.witnessSignups })
}

export function removeWitnessSignup(caseId: string, index: number): EvictionCase | null {
  const existingCase = getCase(caseId)
  if (!existingCase) return null

  const filtered = existingCase.witnessSignups.filter((_, i) => i !== index)
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

// ============================================================================
// NEVADA LEGAL PLAYBOOK HELPER
// ============================================================================

export function getNevadaGuidance(noticeType?: '3-day' | '5-day' | '7-day' | '30-day'): NevadaNoticeGuidance | null {
  if (!noticeType || !NEVADA_PLAYBOOK[noticeType]) return null
  return NEVADA_PLAYBOOK[noticeType]
}

export function getAllNevadaGuidance(): NevadaNoticeGuidance[] {
  return ['3-day', '5-day', '7-day', '30-day'].map(type => NEVADA_PLAYBOOK[type as '3-day' | '5-day' | '7-day' | '30-day'])
}

// ============================================================================
// PREVENTION ALGORITHM
// ============================================================================

export function calculateRiskScore(profileId: string, buildingApn: string): number {
  let score = 0

  // Check if tenant has active eviction cases (highest risk)
  const cases = getState().cases
  const tenantCases = cases.filter(c => c.tenantProfileId === profileId && c.buildingApn === buildingApn)
  if (tenantCases.length > 0) {
    // Active eviction = critical risk
    score += 100
    return score
  }

  // Recent eviction notice (within 60 days)
  const recentCases = cases.filter(c =>
    c.tenantProfileId === profileId &&
    c.stage !== 'resolved' &&
    c.noticeReceivedDate &&
    new Date(c.noticeReceivedDate).getTime() > Date.now() - (60 * 24 * 60 * 60 * 1000)
  )
  if (recentCases.length > 0) {
    score += 50
  }

  // Recent resolved case (within 90 days) = retaliation risk
  const recentResolved = cases.filter(c =>
    c.tenantProfileId === profileId &&
    c.stage === 'resolved' &&
    c.updatedAt > Date.now() - (90 * 24 * 60 * 60 * 1000)
  )
  if (recentResolved.length > 0) {
    score += 30
  }

  return Math.min(100, score)
}

export function identifyAtRiskTenants(profiles: any[], buildings: any[]): AtRiskTenant[] {
  const atRiskList: AtRiskTenant[] = []

  // Simple implementation: identify tenants with active or recent cases
  const cases = getState().cases

  // Group cases by tenant+building
  const tenantBuildingMap = new Map<string, typeof cases>()

  cases.forEach(c => {
    const key = `${c.tenantProfileId}:${c.buildingApn}`
    if (!tenantBuildingMap.has(key)) {
      tenantBuildingMap.set(key, [])
    }
    tenantBuildingMap.get(key)!.push(c)
  })

  // Calculate risk for each tenant+building combination
  tenantBuildingMap.forEach((tenantCases, key) => {
    const [profileId, buildingApn] = key.split(':')

    // Determine risk factors
    const riskFactors: AtRiskTenant['riskFactors'] = []
    let hasActiveCase = false

    tenantCases.forEach(c => {
      if (c.stage !== 'resolved') {
        riskFactors.push('rent_arrears')
        hasActiveCase = true
      }
    })

    if (!hasActiveCase && tenantCases.length > 0) {
      riskFactors.push('retaliation_risk')
    }

    // Determine suggested interventions based on risk
    const suggestedInterventions: AtRiskTenant['suggestedInterventions'] = []
    if (riskFactors.includes('rent_arrears')) {
      suggestedInterventions.push('rent_assistance')
    }
    if (riskFactors.includes('retaliation_risk')) {
      suggestedInterventions.push('legal_clinic')
    }
    suggestedInterventions.push('legal_clinic')

    const riskScore = calculateRiskScore(profileId, buildingApn)

    if (riskScore > 0) {
      atRiskList.push({
        profileId,
        buildingApn,
        riskFactors: Array.from(new Set(riskFactors)),
        riskScore,
        suggestedInterventions: Array.from(new Set(suggestedInterventions)),
        dismissed: false
      })
    }
  })

  return atRiskList.sort((a, b) => b.riskScore - a.riskScore)
}

// ============================================================================
// BLOCK INTEGRATION (Multi-Tenant Coordination)
// ============================================================================

export function linkCaseToBlock(caseId: string, blockId: string): void {
  const state = getState()

  if (!state.blockCaseLinks[blockId]) {
    state.blockCaseLinks[blockId] = []
  }

  if (!state.blockCaseLinks[blockId].includes(caseId)) {
    state.blockCaseLinks[blockId].push(caseId)
  }

  setState(state)
}

export function removeCaseFromBlock(caseId: string, blockId: string): void {
  const state = getState()

  if (state.blockCaseLinks[blockId]) {
    state.blockCaseLinks[blockId] = state.blockCaseLinks[blockId].filter(id => id !== caseId)
  }

  setState(state)
}

export function getCasesByBlock(blockId: string): EvictionCase[] {
  const state = getState()
  const caseIds = state.blockCaseLinks[blockId] || []

  return caseIds
    .map(caseId => getCase(caseId))
    .filter((c): c is EvictionCase => c !== null)
}

export function getBlocksForCase(caseId: string): string[] {
  const state = getState()
  const blockIds: string[] = []

  Object.entries(state.blockCaseLinks).forEach(([blockId, caseIds]) => {
    if (caseIds.includes(caseId)) {
      blockIds.push(blockId)
    }
  })

  return blockIds
}

export function getActiveCasesByBlock(blockId: string): EvictionCase[] {
  const cases = getCasesByBlock(blockId)
  return cases.filter(c => c.stage !== 'resolved')
}

export function getCriticalCasesByBlock(blockId: string): EvictionCase[] {
  const cases = getCasesByBlock(blockId)
  return cases.filter(c => c.urgency === 'critical' && c.stage !== 'resolved')
}
