import { createLogger } from '../utils/logger'

const log = createLogger('Canvass')

// Canvassing data storage for tenant outreach tracking
// Supports both localStorage (offline) and Supabase (cloud sync)

import { supabase, USE_SUPABASE, DbCanvassUnit } from '../services/supabase'

// Contact status pipeline
export type ContactStatus =
  | 'NOT_CONTACTED'
  | 'NO_ANSWER'
  | 'CONTACTED'
  | 'INTERESTED'
  | 'NOT_INTERESTED'
  | 'FOLLOW_UP'
  | 'ACTIVE_MEMBER'

// Complaint categories
export const COMPLAINT_CATEGORIES = [
  { key: 'maintenance', label: 'Maintenance issues' },
  { key: 'slow_repair', label: 'Slow repair response' },
  { key: 'rent_increase', label: 'Rent increase' },
  { key: 'pests', label: 'Pest problems (roaches, mice, bedbugs)' },
  { key: 'mold', label: 'Mold/water damage' },
  { key: 'hvac', label: 'HVAC issues (heat/AC)' },
  { key: 'plumbing', label: 'Plumbing problems' },
  { key: 'security', label: 'Security concerns' },
  { key: 'noise', label: 'Noise issues' },
  { key: 'parking', label: 'Parking problems' },
  { key: 'management', label: 'Management communication' },
  { key: 'harassment', label: 'Harassment/retaliation' },
  { key: 'privacy', label: 'Privacy violations' },
  { key: 'illegal_fees', label: 'Illegal fees' },
  { key: 'lease_violation', label: 'Lease violations by landlord' },
  { key: 'other', label: 'Other' },
] as const

// Interest level options
export const INTEREST_LEVELS = [
  { key: 'meeting', label: 'Would attend a tenant meeting' },
  { key: 'petition', label: 'Would sign a petition' },
  { key: 'letter', label: 'Would write a letter to landlord' },
  { key: 'talk_neighbors', label: 'Would talk to other tenants' },
  { key: 'strike', label: 'Would participate in rent strike' },
  { key: 'media', label: 'Would speak to media' },
  { key: 'leadership', label: 'Would take leadership role' },
] as const

// Habitability issues (for housing quality tracking)
export const HABITABILITY_ISSUES = [
  { key: 'mold', label: 'Mold/mildew' },
  { key: 'pests_roaches', label: 'Cockroaches' },
  { key: 'pests_mice', label: 'Mice/rats' },
  { key: 'pests_bedbugs', label: 'Bedbugs' },
  { key: 'heat_inadequate', label: 'Inadequate heat' },
  { key: 'ac_broken', label: 'Broken A/C' },
  { key: 'plumbing_leaks', label: 'Plumbing leaks' },
  { key: 'water_quality', label: 'Water quality issues' },
  { key: 'electrical', label: 'Electrical problems' },
  { key: 'structural', label: 'Structural damage' },
  { key: 'security_locks', label: 'Security concerns (locks, doors)' },
  { key: 'appliances', label: 'Broken appliances' },
] as const

// Monthly issue snapshot for timeline tracking
export interface IssueSnapshot {
  month: string;        // 'YYYY-MM' format
  issueKey: string;     // Habitability issue key
  unitCount: number;    // Units reporting this issue
  timestamp: number;    // When snapshot was created
}

// Timeline data for a specific issue
export interface IssueTimeline {
  issueKey: string;
  label: string;
  snapshots: IssueSnapshot[];  // Last 6 months
  trend: 'escalating' | 'stable' | 'improving';
  changeRate: number;          // Units per month change
}

// Subsidy/assistance program types
export const SUBSIDY_TYPES = [
  { key: 'none', label: 'Market rate (no subsidy)' },
  { key: 'section8', label: 'Section 8 voucher' },
  { key: 'lihtc', label: 'LIHTC / Low-income tax credit' },
  { key: 'public', label: 'Public housing' },
  { key: 'other', label: 'Other subsidy program' },
] as const

// Utilities that may be included in rent
export const UTILITIES_OPTIONS = [
  { key: 'water', label: 'Water' },
  { key: 'sewer', label: 'Sewer' },
  { key: 'trash', label: 'Trash' },
  { key: 'gas', label: 'Gas' },
  { key: 'electric', label: 'Electric' },
  { key: 'internet', label: 'Internet' },
  { key: 'parking', label: 'Parking' },
] as const

// Unit record with all intake fields
export interface UnitRecord {
  unitNumber: string
  status: ContactStatus

  // Contact Info
  name?: string
  phone?: string
  email?: string
  preferredContact?: 'phone' | 'text' | 'email'
  language?: string

  // Household
  occupants?: number
  hasChildren?: boolean
  hasPets?: boolean
  petTypes?: string
  accessibilityNeeds?: string

  // Unit Details
  unitType?: 'apartment' | 'house' | 'townhouse' | 'duplex' | 'condo' | 'mobile' | 'room'
  bedroomCount?: number    // 0=studio, 1, 2, 3, 4+
  bathroomCount?: number   // 1, 1.5, 2, etc.
  unitSqft?: number        // Square footage

  // Lease & Rent
  rentAmount?: number
  moveInDate?: string
  leaseType?: 'fixed' | 'month-to-month'
  leaseExpires?: string
  lastRentIncrease?: { amount: number; date: string }
  securityDeposit?: number
  depositIssues?: string

  // Schedule & Availability
  workHours?: string
  bestTimeToReach?: string
  bestDays?: string[]

  // Complaints
  complaints: string[]
  complaintDetails?: string

  // Maintenance
  maintenanceRating?: 'good' | 'ok' | 'bad'
  avgResponseDays?: number
  outstandingRepairs?: string

  // Community & Interest
  knowsNeighbors?: 'yes' | 'somewhat' | 'no'
  idealRent?: number
  hasOrganizingExperience?: boolean
  interestLevel: string[]

  // Suggestions & Notes
  suggestions?: string
  notes?: string
  followUpDate?: string

  // Housing Quality & Assistance (NEW)
  habitabilityIssues?: string[]  // Keys from HABITABILITY_ISSUES
  habitabilityQuotes?: string    // Tenant's description of issues
  subsidyType?: 'none' | 'section8' | 'lihtc' | 'public' | 'other'
  subsidyDetails?: string
  utilitiesIncluded?: string[]   // Keys from UTILITIES_OPTIONS

  // Meta
  contactDate?: number
  organizer?: string
  created: number
  updated: number

  // Profile linking (when tenant creates account)
  profileId?: string
  profileNickname?: string
  linkedAt?: number

  // Field mode quick entry
  enthusiasm?: 1 | 2 | 3 | 4 | 5  // 1=potential leader, 5=probably won't show
}

// Building canvass data
export interface BuildingCanvass {
  buildingId: string
  buildingAddress: string
  units: Record<string, UnitRecord>
  lastModified: number

  // Data verification notes - organizer can note discrepancies
  dataDiscrepancies?: {
    actualUnits?: number        // If different from county data
    actualName?: string         // Informal name (e.g., "DeAngel Apartments")
    actualAddress?: string      // If address differs
    managementCompany?: string  // Property management (e.g., "TriEx")
    notes?: string              // General discrepancy notes
    verifiedBy?: string         // Who verified this info
    verifiedDate?: number       // When verified
  }

  // Issue timeline tracking for escalation detection
  issueTimelines?: Record<string, IssueSnapshot[]>
}

// Complete canvass state
export interface CanvassState {
  buildings: Record<string, BuildingCanvass>
  lastModified: number
}

const STORAGE_KEY = 'rstu_canvass_data'

// ============================================
// Supabase Database Operations
// ============================================

// Convert database unit to app unit
function dbToUnit(db: DbCanvassUnit): UnitRecord {
  return {
    unitNumber: db.unit_number,
    status: db.status,
    name: db.contact_name || undefined,
    phone: db.phone || undefined,
    email: db.email || undefined,
    preferredContact: db.preferred_contact as 'phone' | 'text' | 'email' | undefined,
    language: db.language || undefined,
    occupants: db.occupants || undefined,
    rentAmount: db.rent_amount || undefined,
    complaints: db.complaints || [],
    complaintDetails: db.complaint_details || undefined,
    interestLevel: db.interest_levels || [],
    notes: db.notes || undefined,
    followUpDate: db.follow_up_date || undefined,
    organizer: db.organizer_id || undefined,
    profileId: db.linked_profile_id || undefined,
    created: new Date(db.created_at).getTime(),
    updated: new Date(db.updated_at).getTime(),
    // Household info
    hasChildren: db.has_children || undefined,
    hasPets: db.has_pets || undefined,
    petTypes: db.pet_types || undefined,
    accessibilityNeeds: db.accessibility_needs || undefined,
    // Unit details
    unitType: db.unit_type as UnitRecord['unitType'] || undefined,
    bedroomCount: db.bedroom_count || undefined,
    bathroomCount: db.bathroom_count || undefined,
    unitSqft: db.unit_sqft || undefined,
    // Lease info
    moveInDate: db.move_in_date || undefined,
    leaseType: db.lease_type as 'fixed' | 'month-to-month' | undefined,
    leaseExpires: db.lease_expires || undefined,
    securityDeposit: db.security_deposit || undefined,
    depositIssues: db.deposit_issues || undefined,
    lastRentIncrease: db.last_rent_increase_amount ? {
      amount: db.last_rent_increase_amount,
      date: db.last_rent_increase_date || ''
    } : undefined,
    // Schedule
    workHours: db.work_hours || undefined,
    bestTimeToReach: db.best_time_to_reach || undefined,
    bestDays: db.best_days || undefined,
    // Maintenance
    maintenanceRating: db.maintenance_rating as 'good' | 'ok' | 'bad' | undefined,
    avgResponseDays: db.avg_response_days || undefined,
    outstandingRepairs: db.outstanding_repairs || undefined,
    // Community
    knowsNeighbors: db.knows_neighbors as 'yes' | 'somewhat' | 'no' | undefined,
    idealRent: db.ideal_rent || undefined,
    hasOrganizingExperience: db.has_organizing_experience || undefined,
    suggestions: db.suggestions || undefined,
    // Habitability
    habitabilityIssues: db.habitability_issues || undefined,
    habitabilityQuotes: db.habitability_quotes || undefined,
    // Subsidy
    subsidyType: db.subsidy_type as UnitRecord['subsidyType'] || undefined,
    subsidyDetails: db.subsidy_details || undefined,
    // Utilities
    utilitiesIncluded: db.utilities_included || undefined,
    // Profile linking
    profileNickname: db.profile_nickname || undefined,
    linkedAt: db.linked_at ? new Date(db.linked_at).getTime() : undefined,
    contactDate: db.contact_date ? new Date(db.contact_date).getTime() : undefined,
  }
}

// Convert app unit to database format
function unitToDb(buildingId: string, buildingAddress: string, unit: UnitRecord): Partial<DbCanvassUnit> {
  return {
    building_id: buildingId,
    building_address: buildingAddress,
    unit_number: unit.unitNumber,
    status: unit.status,
    contact_name: unit.name || null,
    phone: unit.phone || null,
    email: unit.email || null,
    preferred_contact: unit.preferredContact || null,
    language: unit.language || null,
    occupants: unit.occupants || null,
    rent_amount: unit.rentAmount || null,
    complaints: unit.complaints || null,
    complaint_details: unit.complaintDetails || null,
    interest_levels: unit.interestLevel || null,
    notes: unit.notes || null,
    follow_up_date: unit.followUpDate || null,
    organizer_id: unit.organizer || null,
    linked_profile_id: unit.profileId || null,
    // Household info
    has_children: unit.hasChildren ?? null,
    has_pets: unit.hasPets ?? null,
    pet_types: unit.petTypes || null,
    accessibility_needs: unit.accessibilityNeeds || null,
    // Unit details
    unit_type: unit.unitType || null,
    bedroom_count: unit.bedroomCount ?? null,
    bathroom_count: unit.bathroomCount ?? null,
    unit_sqft: unit.unitSqft ?? null,
    // Lease info
    move_in_date: unit.moveInDate || null,
    lease_type: unit.leaseType || null,
    lease_expires: unit.leaseExpires || null,
    security_deposit: unit.securityDeposit ?? null,
    deposit_issues: unit.depositIssues || null,
    last_rent_increase_amount: unit.lastRentIncrease?.amount ?? null,
    last_rent_increase_date: unit.lastRentIncrease?.date || null,
    // Schedule
    work_hours: unit.workHours || null,
    best_time_to_reach: unit.bestTimeToReach || null,
    best_days: unit.bestDays || null,
    // Maintenance
    maintenance_rating: unit.maintenanceRating || null,
    avg_response_days: unit.avgResponseDays ?? null,
    outstanding_repairs: unit.outstandingRepairs || null,
    // Community
    knows_neighbors: unit.knowsNeighbors || null,
    ideal_rent: unit.idealRent ?? null,
    has_organizing_experience: unit.hasOrganizingExperience ?? null,
    suggestions: unit.suggestions || null,
    // Habitability
    habitability_issues: unit.habitabilityIssues || null,
    habitability_quotes: unit.habitabilityQuotes || null,
    // Subsidy
    subsidy_type: unit.subsidyType || null,
    subsidy_details: unit.subsidyDetails || null,
    // Utilities
    utilities_included: unit.utilitiesIncluded || null,
    // Profile linking
    profile_nickname: unit.profileNickname || null,
    linked_at: unit.linkedAt ? new Date(unit.linkedAt).toISOString() : null,
    contact_date: unit.contactDate ? new Date(unit.contactDate).toISOString() : null,
  }
}

// Fetch all units for a building from Supabase
async function fetchBuildingUnitsFromDb(buildingId: string): Promise<UnitRecord[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('canvass_units')
    .select('*')
    .eq('building_id', buildingId)
    .order('unit_number')

  if (error || !data) return []
  return data.map(d => dbToUnit(d as DbCanvassUnit))
}

// Fetch a single unit from Supabase
async function fetchUnitFromDb(buildingId: string, unitNumber: string): Promise<UnitRecord | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('canvass_units')
    .select('*')
    .eq('building_id', buildingId)
    .eq('unit_number', unitNumber)
    .single()

  if (error || !data) return null
  return dbToUnit(data as DbCanvassUnit)
}

// Save unit to Supabase
async function saveUnitToDb(
  buildingId: string,
  buildingAddress: string,
  unit: UnitRecord
): Promise<boolean> {
  if (!supabase) return false

  const dbUnit = unitToDb(buildingId, buildingAddress, unit)

  const { error } = await supabase
    .from('canvass_units')
    .upsert(dbUnit, { onConflict: 'building_id,unit_number' })

  if (error) {
    log.error('Failed to save unit to Supabase:', error)
    return false
  }
  return true
}

// Delete unit from Supabase
async function deleteUnitFromDb(buildingId: string, unitNumber: string): Promise<boolean> {
  if (!supabase) return false

  const { error } = await supabase
    .from('canvass_units')
    .delete()
    .eq('building_id', buildingId)
    .eq('unit_number', unitNumber)

  return !error
}

// Fetch building stats from Supabase (aggregated)
async function fetchBuildingStatsFromDb(buildingId: string): Promise<{
  total: number
  contacted: number
  interested: number
  activeMembers: number
  followUp: number
} | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('canvass_units')
    .select('status')
    .eq('building_id', buildingId)

  if (error || !data) return null

  const units = data as { status: ContactStatus }[]
  return {
    total: units.length,
    contacted: units.filter(u => u.status !== 'NOT_CONTACTED' && u.status !== 'NO_ANSWER').length,
    interested: units.filter(u => u.status === 'INTERESTED').length,
    activeMembers: units.filter(u => u.status === 'ACTIVE_MEMBER').length,
    followUp: units.filter(u => u.status === 'FOLLOW_UP').length,
  }
}

// Get full canvass state
export function getCanvassState(): CanvassState {
  if (typeof window === 'undefined') {
    return { buildings: {}, lastModified: 0 }
  }
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return { buildings: {}, lastModified: 0 }
  }
  try {
    return JSON.parse(stored)
  } catch {
    return { buildings: {}, lastModified: 0 }
  }
}

// Save full canvass state
function saveCanvassState(state: CanvassState): void {
  if (typeof window === 'undefined') return
  state.lastModified = Date.now()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    log.error('Failed to save - storage quota may be exceeded:', e)
  }
}

// Get canvass data for a specific building
export function getBuildingCanvass(buildingId: string): BuildingCanvass | null {
  const state = getCanvassState()
  return state.buildings[buildingId] || null
}

// Get a specific unit from a building
export function getUnit(buildingId: string, unitNumber: string): UnitRecord | null {
  const building = getBuildingCanvass(buildingId)
  return building?.units[unitNumber] || null
}

// Initialize or get building canvass
export function initBuildingCanvass(buildingId: string, buildingAddress: string): BuildingCanvass {
  const state = getCanvassState()
  if (!state.buildings[buildingId]) {
    state.buildings[buildingId] = {
      buildingId,
      buildingAddress,
      units: {},
      lastModified: Date.now(),
    }
    saveCanvassState(state)
  }
  return state.buildings[buildingId]
}

// Add units to a building (single or bulk)
export function addUnits(buildingId: string, unitNumbers: string[]): void {
  const state = getCanvassState()
  const building = state.buildings[buildingId]
  if (!building) return

  const now = Date.now()
  for (const unitNumber of unitNumbers) {
    if (!building.units[unitNumber]) {
      building.units[unitNumber] = {
        unitNumber,
        status: 'NOT_CONTACTED',
        complaints: [],
        interestLevel: [],
        created: now,
        updated: now,
      }
    }
  }
  building.lastModified = now
  saveCanvassState(state)
}

// Parse unit range (e.g., "101-150" or "101, 102, 201-210")
export function parseUnitRange(input: string): string[] {
  const units: string[] = []
  const parts = input.split(/[,\s]+/).filter(Boolean)

  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(s => s.trim())
      // Try to parse as numbers
      const startNum = parseInt(start)
      const endNum = parseInt(end)
      if (!isNaN(startNum) && !isNaN(endNum) && endNum >= startNum) {
        // Preserve prefix if any (e.g., "A101-A110")
        const prefix = start.replace(/\d+$/, '')
        const startDigits = start.match(/\d+$/)?.[0] || ''
        const padLength = startDigits.length
        for (let i = startNum; i <= endNum; i++) {
          units.push(prefix + String(i).padStart(padLength, '0'))
        }
      } else {
        // If not numeric, just add as-is
        units.push(part)
      }
    } else {
      units.push(part.trim())
    }
  }

  return Array.from(new Set(units)) // Remove duplicates
}

// Update a unit record
export function updateUnit(buildingId: string, unitNumber: string, updates: Partial<UnitRecord>): void {
  const state = getCanvassState()
  const building = state.buildings[buildingId]
  if (!building || !building.units[unitNumber]) return

  building.units[unitNumber] = {
    ...building.units[unitNumber],
    ...updates,
    updated: Date.now(),
  }
  building.lastModified = Date.now()
  saveCanvassState(state)
}

// Update unit status
export function updateUnitStatus(buildingId: string, unitNumber: string, status: ContactStatus): void {
  updateUnit(buildingId, unitNumber, { status, contactDate: Date.now() })
}

// Delete a unit
export function deleteUnit(buildingId: string, unitNumber: string): void {
  const state = getCanvassState()
  const building = state.buildings[buildingId]
  if (!building) return

  delete building.units[unitNumber]
  building.lastModified = Date.now()
  saveCanvassState(state)
}

// Update building data discrepancies/notes
export function updateBuildingDiscrepancies(
  buildingId: string,
  discrepancies: BuildingCanvass['dataDiscrepancies']
): void {
  const state = getCanvassState()
  const building = state.buildings[buildingId]
  if (!building) return

  building.dataDiscrepancies = {
    ...building.dataDiscrepancies,
    ...discrepancies,
    verifiedDate: Date.now(),
  }
  building.lastModified = Date.now()
  saveCanvassState(state)
}

// Get building data discrepancies
export function getBuildingDiscrepancies(buildingId: string): BuildingCanvass['dataDiscrepancies'] | undefined {
  const building = getBuildingCanvass(buildingId)
  return building?.dataDiscrepancies
}

// Get stats for a building
export function getBuildingStats(buildingId: string): {
  total: number
  contacted: number
  interested: number
  activeMembers: number
  followUp: number
} {
  const building = getBuildingCanvass(buildingId)
  if (!building) {
    return { total: 0, contacted: 0, interested: 0, activeMembers: 0, followUp: 0 }
  }

  const units = Object.values(building.units)
  return {
    total: units.length,
    contacted: units.filter(u => u.status !== 'NOT_CONTACTED' && u.status !== 'NO_ANSWER').length,
    interested: units.filter(u => u.status === 'INTERESTED').length,
    activeMembers: units.filter(u => u.status === 'ACTIVE_MEMBER').length,
    followUp: units.filter(u => u.status === 'FOLLOW_UP').length,
  }
}

/**
 * Tenant-safe progress data - exposes only aggregate stats and unit numbers
 * No contact info, names, or organizer notes
 */
export interface TenantSafeProgress {
  totalUnits: number
  contacted: number
  interested: number
  activeMembers: number
  followUp: number
  notInterested: number
  notContactedUnits: string[]  // Unit numbers only, no names/contact info
  progressPercent: number
  status: 'active' | 'emerging' | 'starting' | 'none'
  hasCanvassData: boolean
}

/**
 * Get tenant-safe organizing progress for a building
 * Returns only aggregate stats and unit numbers - no sensitive contact info
 */
export function getTenantSafeProgress(buildingId: string, totalBuildingUnits?: number): TenantSafeProgress {
  const building = getBuildingCanvass(buildingId)

  // No canvass data yet
  if (!building || Object.keys(building.units).length === 0) {
    return {
      totalUnits: totalBuildingUnits || 0,
      contacted: 0,
      interested: 0,
      activeMembers: 0,
      followUp: 0,
      notInterested: 0,
      notContactedUnits: [],
      progressPercent: 0,
      status: 'none',
      hasCanvassData: false,
    }
  }

  const units = Object.values(building.units)
  const contacted = units.filter(u => u.status !== 'NOT_CONTACTED' && u.status !== 'NO_ANSWER').length
  const interested = units.filter(u => u.status === 'INTERESTED').length
  const activeMembers = units.filter(u => u.status === 'ACTIVE_MEMBER').length
  const followUp = units.filter(u => u.status === 'FOLLOW_UP').length
  const notInterested = units.filter(u => u.status === 'NOT_INTERESTED').length

  // Get unit numbers that haven't been contacted (no names or contact info)
  const notContactedUnits = units
    .filter(u => u.status === 'NOT_CONTACTED' || u.status === 'NO_ANSWER')
    .map(u => u.unitNumber)
    .sort((a, b) => {
      // Natural sort for unit numbers (1, 2, 10 not 1, 10, 2)
      const numA = parseInt(a.replace(/\D/g, '')) || 0
      const numB = parseInt(b.replace(/\D/g, '')) || 0
      if (numA !== numB) return numA - numB
      return a.localeCompare(b)
    })

  // Use building's total units if provided (more accurate), otherwise use tracked units
  const totalUnits = totalBuildingUnits || units.length
  const progressPercent = totalUnits > 0 ? Math.round((contacted / totalUnits) * 100) : 0

  // Determine organizing status
  let status: 'active' | 'emerging' | 'starting' | 'none' = 'none'
  if (activeMembers >= 3 || (activeMembers >= 1 && interested >= 3)) {
    status = 'active'
  } else if (activeMembers >= 1 || interested >= 2 || contacted >= 5) {
    status = 'emerging'
  } else if (contacted > 0) {
    status = 'starting'
  }

  return {
    totalUnits,
    contacted,
    interested,
    activeMembers,
    followUp,
    notInterested,
    notContactedUnits,
    progressPercent,
    status,
    hasCanvassData: true,
  }
}

// Export all canvass data
export function exportCanvassData(): string {
  const state = getCanvassState()
  return JSON.stringify({
    version: '1.0',
    exportDate: Date.now(),
    data: state,
  }, null, 2)
}

// Import canvass data
export function importCanvassData(json: string): { success: boolean; error?: string } {
  try {
    const parsed = JSON.parse(json)
    if (!parsed.data || !parsed.data.buildings) {
      return { success: false, error: 'Invalid data format' }
    }
    saveCanvassState(parsed.data)
    return { success: true }
  } catch (e) {
    return { success: false, error: 'Failed to parse JSON' }
  }
}

// Get status label
export function getStatusLabel(status: ContactStatus): string {
  const labels: Record<ContactStatus, string> = {
    NOT_CONTACTED: 'Not Contacted',
    NO_ANSWER: 'No Answer',
    CONTACTED: 'Contacted',
    INTERESTED: 'Interested',
    NOT_INTERESTED: 'Not Interested',
    FOLLOW_UP: 'Follow Up',
    ACTIVE_MEMBER: 'Active Member',
  }
  return labels[status]
}

// Get status color class
export function getStatusColor(status: ContactStatus): string {
  const colors: Record<ContactStatus, string> = {
    NOT_CONTACTED: 'bg-gray-100 text-gray-600',
    NO_ANSWER: 'bg-yellow-100 text-yellow-700',
    CONTACTED: 'bg-blue-100 text-blue-700',
    INTERESTED: 'bg-green-100 text-green-700',
    NOT_INTERESTED: 'bg-red-100 text-red-600',
    FOLLOW_UP: 'bg-orange-100 text-orange-700',
    ACTIVE_MEMBER: 'bg-purple-100 text-purple-700',
  }
  return colors[status]
}

// ============================================================
// Profile-Canvassing Linking Functions
// ============================================================

// Ensure a unit exists in canvassing data (auto-create if needed)
export function ensureUnitExists(
  buildingId: string,
  buildingAddress: string,
  unitNumber: string
): UnitRecord {
  const state = getCanvassState()

  // Initialize building if needed
  if (!state.buildings[buildingId]) {
    state.buildings[buildingId] = {
      buildingId,
      buildingAddress,
      units: {},
      lastModified: Date.now(),
    }
  }

  const building = state.buildings[buildingId]

  // Create unit if it doesn't exist
  if (!building.units[unitNumber]) {
    const now = Date.now()
    building.units[unitNumber] = {
      unitNumber,
      status: 'NOT_CONTACTED',
      complaints: [],
      interestLevel: [],
      created: now,
      updated: now,
    }
    building.lastModified = now
    saveCanvassState(state)
  }

  return building.units[unitNumber]
}

// Link a profile to a unit
export function linkProfileToUnit(
  buildingId: string,
  unitNumber: string,
  profileId: string,
  profileNickname: string,
  isVerified?: boolean
): void {
  const state = getCanvassState()
  const building = state.buildings[buildingId]
  if (!building || !building.units[unitNumber]) return

  const currentStatus = building.units[unitNumber].status

  // Auto-upgrade status when profile links
  // Never downgrade existing higher statuses
  let newStatus = currentStatus
  if (currentStatus === 'NOT_CONTACTED' || currentStatus === 'NO_ANSWER') {
    newStatus = isVerified ? 'ACTIVE_MEMBER' : 'INTERESTED'
  } else if (isVerified && currentStatus === 'INTERESTED') {
    newStatus = 'ACTIVE_MEMBER'  // Upgrade verified users
  }

  building.units[unitNumber] = {
    ...building.units[unitNumber],
    profileId,
    profileNickname,
    linkedAt: Date.now(),
    updated: Date.now(),
    status: newStatus,
  }
  building.lastModified = Date.now()
  saveCanvassState(state)
}

// Unlink a profile from a unit
export function unlinkProfileFromUnit(buildingId: string, unitNumber: string): void {
  const state = getCanvassState()
  const building = state.buildings[buildingId]
  if (!building || !building.units[unitNumber]) return

  const unit = building.units[unitNumber]
  delete unit.profileId
  delete unit.profileNickname
  delete unit.linkedAt
  unit.updated = Date.now()
  building.lastModified = Date.now()
  saveCanvassState(state)
}

// Find which unit a profile is linked to
export function getUnitByProfile(profileId: string): {
  buildingId: string
  unit: UnitRecord
} | null {
  const state = getCanvassState()

  for (const [buildingId, building] of Object.entries(state.buildings)) {
    for (const unit of Object.values(building.units)) {
      if (unit.profileId === profileId) {
        return { buildingId, unit }
      }
    }
  }

  return null
}

// Get all profiles linked to a building
export function getProfilesForBuilding(buildingId: string): Array<{
  unit: string
  profileId: string
  profileNickname: string
}> {
  const building = getBuildingCanvass(buildingId)
  if (!building) return []

  return Object.values(building.units)
    .filter(unit => unit.profileId)
    .map(unit => ({
      unit: unit.unitNumber,
      profileId: unit.profileId!,
      profileNickname: unit.profileNickname || 'Unknown',
    }))
}

// Check if a profile is linked to any unit
export function isProfileLinked(profileId: string): boolean {
  return getUnitByProfile(profileId) !== null
}

// Sync profile data to linked canvass unit
// Called when profile updates rent/unit details to keep canvass in sync
export function syncProfileToCanvass(
  buildingId: string,
  unitNumber: string,
  profileData: {
    rentAmount?: number
    unitType?: 'apartment' | 'house' | 'townhouse' | 'duplex' | 'condo' | 'mobile' | 'room'
    bedroomCount?: number
    bathroomCount?: number
    unitSqft?: number
    moveInDate?: string
    leaseType?: 'fixed' | 'month-to-month'
    leaseExpires?: string
    complaints?: string[]
    maintenanceRating?: 'good' | 'ok' | 'bad'
    interestLevel?: string[]
    occupants?: number
    hasChildren?: boolean
    hasPets?: boolean
  }
): void {
  const state = getCanvassState()
  const building = state.buildings[buildingId]
  if (!building || !building.units[unitNumber]) return

  const unit = building.units[unitNumber]

  // Only sync fields that are set in profile
  if (profileData.rentAmount !== undefined) unit.rentAmount = profileData.rentAmount
  if (profileData.unitType !== undefined) unit.unitType = profileData.unitType
  if (profileData.bedroomCount !== undefined) unit.bedroomCount = profileData.bedroomCount
  if (profileData.bathroomCount !== undefined) unit.bathroomCount = profileData.bathroomCount
  if (profileData.unitSqft !== undefined) unit.unitSqft = profileData.unitSqft
  if (profileData.moveInDate !== undefined) unit.moveInDate = profileData.moveInDate
  if (profileData.leaseType !== undefined) unit.leaseType = profileData.leaseType
  if (profileData.leaseExpires !== undefined) unit.leaseExpires = profileData.leaseExpires
  if (profileData.complaints !== undefined) unit.complaints = profileData.complaints
  if (profileData.maintenanceRating !== undefined) unit.maintenanceRating = profileData.maintenanceRating
  if (profileData.interestLevel !== undefined) unit.interestLevel = profileData.interestLevel
  if (profileData.occupants !== undefined) unit.occupants = profileData.occupants
  if (profileData.hasChildren !== undefined) unit.hasChildren = profileData.hasChildren
  if (profileData.hasPets !== undefined) unit.hasPets = profileData.hasPets

  unit.updated = Date.now()
  building.lastModified = Date.now()
  saveCanvassState(state)
}

// Get building rents filtered by bedroom count
export function getBuildingRentsByBedroom(
  buildingId: string,
  bedroomCount?: number
): { all: number[]; sameSize: number[] } {
  const building = getBuildingCanvass(buildingId)
  if (!building) return { all: [], sameSize: [] }

  const all: number[] = []
  const sameSize: number[] = []

  for (const unit of Object.values(building.units)) {
    if (unit.rentAmount && unit.rentAmount > 0) {
      all.push(unit.rentAmount)
      // Match by bedroom count if specified
      if (bedroomCount !== undefined && unit.bedroomCount === bedroomCount) {
        sameSize.push(unit.rentAmount)
      }
    }
  }

  return { all, sameSize }
}

// Get building unit details summary
export function getBuildingUnitSummary(buildingId: string): {
  totalUnits: number
  unitsWithRent: number
  avgRent: number
  rentRange: { min: number; max: number } | null
  bedroomBreakdown: Record<number, { count: number; avgRent: number }>
} {
  const building = getBuildingCanvass(buildingId)
  if (!building) {
    return {
      totalUnits: 0,
      unitsWithRent: 0,
      avgRent: 0,
      rentRange: null,
      bedroomBreakdown: {}
    }
  }

  const units = Object.values(building.units)
  const rents = units.filter(u => u.rentAmount && u.rentAmount > 0).map(u => u.rentAmount!)

  // Group by bedroom count
  const byBedroom: Record<number, { rents: number[] }> = {}
  for (const unit of units) {
    if (unit.rentAmount && unit.rentAmount > 0) {
      const bedrooms = unit.bedroomCount ?? -1 // -1 for unknown
      if (!byBedroom[bedrooms]) {
        byBedroom[bedrooms] = { rents: [] }
      }
      byBedroom[bedrooms].rents.push(unit.rentAmount)
    }
  }

  const bedroomBreakdown: Record<number, { count: number; avgRent: number }> = {}
  for (const [bedrooms, data] of Object.entries(byBedroom)) {
    const sum = data.rents.reduce((a, b) => a + b, 0)
    bedroomBreakdown[parseInt(bedrooms)] = {
      count: data.rents.length,
      avgRent: Math.round(sum / data.rents.length)
    }
  }

  return {
    totalUnits: units.length,
    unitsWithRent: rents.length,
    avgRent: rents.length > 0 ? Math.round(rents.reduce((a, b) => a + b, 0) / rents.length) : 0,
    rentRange: rents.length > 0 ? { min: Math.min(...rents), max: Math.max(...rents) } : null,
    bedroomBreakdown
  }
}

// ============================================
// Async Supabase-Enabled Public Functions
// These functions use Supabase when available,
// falling back to localStorage when offline
// ============================================

// Get building canvass with Supabase support
export async function getBuildingCanvassAsync(buildingId: string): Promise<BuildingCanvass | null> {
  // Try Supabase first
  if (USE_SUPABASE) {
    const units = await fetchBuildingUnitsFromDb(buildingId)
    if (units.length > 0) {
      const unitsRecord: Record<string, UnitRecord> = {}
      let buildingAddress = ''
      for (const unit of units) {
        unitsRecord[unit.unitNumber] = unit
      }
      // Get address from first unit's db record
      if (supabase) {
        const { data } = await supabase
          .from('canvass_units')
          .select('building_address')
          .eq('building_id', buildingId)
          .limit(1)
          .single()
        if (data) buildingAddress = data.building_address
      }
      return {
        buildingId,
        buildingAddress,
        units: unitsRecord,
        lastModified: Date.now()
      }
    }
  }

  // Fallback to localStorage
  return getBuildingCanvass(buildingId)
}

// Initialize building canvass with Supabase support
export async function initBuildingCanvassAsync(
  buildingId: string,
  buildingAddress: string
): Promise<BuildingCanvass> {
  // Check Supabase first
  if (USE_SUPABASE) {
    const existing = await getBuildingCanvassAsync(buildingId)
    if (existing && Object.keys(existing.units).length > 0) {
      return existing
    }
  }

  // Initialize locally first
  const building = initBuildingCanvass(buildingId, buildingAddress)
  return building
}

// Add units with Supabase sync
export async function addUnitsAsync(
  buildingId: string,
  buildingAddress: string,
  unitNumbers: string[]
): Promise<void> {
  const now = Date.now()

  // Add to localStorage first
  addUnits(buildingId, unitNumbers)

  // Sync to Supabase
  if (USE_SUPABASE) {
    for (const unitNumber of unitNumbers) {
      const unit: UnitRecord = {
        unitNumber,
        status: 'NOT_CONTACTED',
        complaints: [],
        interestLevel: [],
        created: now,
        updated: now,
      }
      await saveUnitToDb(buildingId, buildingAddress, unit)
    }
  }
}

// Update unit with Supabase sync
export async function updateUnitAsync(
  buildingId: string,
  buildingAddress: string,
  unitNumber: string,
  updates: Partial<UnitRecord>
): Promise<void> {
  // Update localStorage first
  updateUnit(buildingId, unitNumber, updates)

  // Sync to Supabase
  if (USE_SUPABASE) {
    // Get the full updated unit from localStorage
    const state = getCanvassState()
    const building = state.buildings[buildingId]
    if (building?.units[unitNumber]) {
      await saveUnitToDb(buildingId, buildingAddress, building.units[unitNumber])
    }
  }
}

// Update unit status with Supabase sync
export async function updateUnitStatusAsync(
  buildingId: string,
  buildingAddress: string,
  unitNumber: string,
  status: ContactStatus
): Promise<void> {
  await updateUnitAsync(buildingId, buildingAddress, unitNumber, {
    status,
    contactDate: Date.now()
  })
}

// Delete unit with Supabase sync
export async function deleteUnitAsync(
  buildingId: string,
  unitNumber: string
): Promise<void> {
  // Delete from localStorage
  deleteUnit(buildingId, unitNumber)

  // Delete from Supabase
  if (USE_SUPABASE) {
    await deleteUnitFromDb(buildingId, unitNumber)
  }
}

// Get building stats with Supabase support
export async function getBuildingStatsAsync(buildingId: string): Promise<{
  total: number
  contacted: number
  interested: number
  activeMembers: number
  followUp: number
}> {
  // Try Supabase first
  if (USE_SUPABASE) {
    const stats = await fetchBuildingStatsFromDb(buildingId)
    if (stats) return stats
  }

  // Fallback to localStorage
  return getBuildingStats(buildingId)
}

// Ensure unit exists with Supabase sync
export async function ensureUnitExistsAsync(
  buildingId: string,
  buildingAddress: string,
  unitNumber: string
): Promise<UnitRecord> {
  // Check Supabase first
  if (USE_SUPABASE) {
    const dbUnit = await fetchUnitFromDb(buildingId, unitNumber)
    if (dbUnit) return dbUnit
  }

  // Check/create in localStorage
  const unit = ensureUnitExists(buildingId, buildingAddress, unitNumber)

  // Sync to Supabase
  if (USE_SUPABASE) {
    await saveUnitToDb(buildingId, buildingAddress, unit)
  }

  return unit
}

// Link profile to unit with Supabase sync
export async function linkProfileToUnitAsync(
  buildingId: string,
  buildingAddress: string,
  unitNumber: string,
  profileId: string,
  profileNickname: string
): Promise<void> {
  // Update localStorage
  linkProfileToUnit(buildingId, unitNumber, profileId, profileNickname)

  // Sync to Supabase
  if (USE_SUPABASE && supabase) {
    await supabase
      .from('canvass_units')
      .update({
        linked_profile_id: profileId,
        updated_at: new Date().toISOString()
      })
      .eq('building_id', buildingId)
      .eq('unit_number', unitNumber)
  }
}

// Unlink profile from unit with Supabase sync
export async function unlinkProfileFromUnitAsync(
  buildingId: string,
  unitNumber: string
): Promise<void> {
  // Update localStorage
  unlinkProfileFromUnit(buildingId, unitNumber)

  // Sync to Supabase
  if (USE_SUPABASE && supabase) {
    await supabase
      .from('canvass_units')
      .update({
        linked_profile_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('building_id', buildingId)
      .eq('unit_number', unitNumber)
  }
}

// Find unit by profile with Supabase support
export async function getUnitByProfileAsync(profileId: string): Promise<{
  buildingId: string
  buildingAddress: string
  unit: UnitRecord
} | null> {
  // Try Supabase first
  if (USE_SUPABASE && supabase) {
    const { data, error } = await supabase
      .from('canvass_units')
      .select('*')
      .eq('linked_profile_id', profileId)
      .single()

    if (!error && data) {
      const dbUnit = data as DbCanvassUnit
      return {
        buildingId: dbUnit.building_id,
        buildingAddress: dbUnit.building_address,
        unit: dbToUnit(dbUnit)
      }
    }
  }

  // Fallback to localStorage
  const result = getUnitByProfile(profileId)
  if (result) {
    const state = getCanvassState()
    const building = state.buildings[result.buildingId]
    return {
      buildingId: result.buildingId,
      buildingAddress: building?.buildingAddress || '',
      unit: result.unit
    }
  }
  return null
}



// Get all building IDs that have canvass data (synchronous, localStorage only)
export function getAllBuildingsWithData(): string[] {
  const state = getCanvassState()
  return Object.keys(state.buildings).filter(buildingId => {
    const building = state.buildings[buildingId]
    return building && Object.keys(building.units).length > 0
  })
}

// ============================================
// Habitability Scoring
// ============================================

export interface HabitabilityScore {
  score: number | null                       // 0-100 or null for insufficient data
  status: 'good' | 'fair' | 'poor' | 'no-data'  // Visual status
  hasInsufficientData: boolean              // True if below reporting threshold
  issueBreakdown: Array<{
    category: string
    label: string
    count: number
    percentUnits: number
    penaltyPoints: number
  }>
  trend: {
    dayPeriod: 90                             // Last 90 days
    direction: 'improving' | 'stable' | 'worsening'
    changePercent: number
  }
  summary: {
    totalUnits: number
    unitsReporting: number
    topIssue: { label: string; count: number } | null
  }
}

// Minimum units reporting before habitability score is calculated
const MIN_UNITS_REPORTING = 2

// Issue penalty mapping: how many points deducted per 10% of units
const ISSUE_PENALTIES: Record<string, number> = {
  'pests_roaches': 20,      // Most common habitability issue
  'mold': 15,
  'heat_inadequate': 15,
  'ac_broken': 15,
  'plumbing_leaks': 10,
  'pests_mice': 12,
  'pests_bedbugs': 18,
  'water_quality': 10,
  'electrical': 15,
  'structural': 25,         // Most serious
  'security_locks': 12,
  'appliances': 8,          // Less critical
}

// Calculate habitability score for a building
export function getHabitabilityScore(buildingId: string): HabitabilityScore | null {
  const building = getBuildingCanvass(buildingId)

  // No building data
  if (!building || Object.keys(building.units).length === 0) {
    return null
  }

  const units = Object.values(building.units)
  const totalUnits = units.length

  // Collect all habitability issues and count them
  const issueCounts: Record<string, number> = {}
  const unitsWithIssues = new Set<string>()

  for (const unit of units) {
    if (unit.habitabilityIssues && unit.habitabilityIssues.length > 0) {
      unitsWithIssues.add(unit.unitNumber)
      for (const issue of unit.habitabilityIssues) {
        issueCounts[issue] = (issueCounts[issue] || 0) + 1
      }
    }
  }

  // Check if we have sufficient data
  const unitsReporting = unitsWithIssues.size
  const hasInsufficientData = unitsReporting < MIN_UNITS_REPORTING

  // If insufficient data, return "No Data" state
  if (hasInsufficientData) {
    return {
      score: null,
      status: 'no-data',
      hasInsufficientData: true,
      issueBreakdown: [],
      trend: { dayPeriod: 90, direction: 'stable', changePercent: 0 },
      summary: { totalUnits, unitsReporting, topIssue: null }
    }
  }

  // Calculate penalties
  let totalPenalty = 0
  const issueBreakdown: Array<{
    category: string
    label: string
    count: number
    percentUnits: number
    penaltyPoints: number
  }> = []

  for (const { key, label } of HABITABILITY_ISSUES) {
    const count = issueCounts[key] || 0
    const percentUnits = totalUnits > 0 ? (count / totalUnits) * 100 : 0
    const penalty = ISSUE_PENALTIES[key] || 10

    // Calculate deduction: penalty * (percent / 10)
    // E.g., if 20% have roaches, deduct 20 * (20/10) = 40 points
    const deduction = percentUnits > 0 ? (penalty * percentUnits) / 10 : 0
    totalPenalty += deduction

    if (count > 0) {
      issueBreakdown.push({
        category: key,
        label,
        count,
        percentUnits: Math.round(percentUnits),
        penaltyPoints: Math.round(deduction)
      })
    }
  }

  // Calculate final score (base 100, min 0)
  const score = Math.max(0, Math.min(100, 100 - totalPenalty))

  // Determine status
  let status: 'good' | 'fair' | 'poor'
  if (score >= 75) status = 'good'
  else if (score >= 50) status = 'fair'
  else status = 'poor'

  // Determine trend (simplified: based on recent vs older complaints)
  // In a full implementation, would compare 45-90 days ago vs 0-45 days
  const recentComplaintUnits = unitsWithIssues.size
  const previousScore = score // Placeholder - would need historical data
  const changePercent = 0 // Would calculate from history

  // Find top issue
  const topIssue = issueBreakdown.length > 0
    ? issueBreakdown.reduce((a, b) => a.count > b.count ? a : b)
    : null

  // Capture monthly snapshot for timeline tracking
  const snapshotData = issueBreakdown.map(issue => ({
    key: issue.category,
    count: issue.count,
    label: issue.label
  }))
  captureIssueSnapshot(buildingId, snapshotData)

  return {
    score: Math.round(score),
    status,
    hasInsufficientData: false,
    issueBreakdown: issueBreakdown.sort((a, b) => b.count - a.count),
    trend: {
      dayPeriod: 90,
      direction: changePercent > 5 ? 'worsening' : changePercent < -5 ? 'improving' : 'stable',
      changePercent: Math.round(changePercent)
    },
    summary: {
      totalUnits,
      unitsReporting: unitsWithIssues.size,
      topIssue: topIssue ? { label: topIssue.label, count: topIssue.count } : null
    }
  }
}

// Get habitability score with Supabase support
export async function getHabitabilityScoreAsync(buildingId: string): Promise<HabitabilityScore | null> {
  // For now, just use localStorage version
  // In future, could fetch from Supabase aggregated view
  return getHabitabilityScore(buildingId)
}

/**
 * Calculate effective organizing priority, boosted by poor habitability conditions.
 *
 * Organizing priority boost logic:
 * - Buildings with habitability score < 50 (poor): +3 priority points
 * - Buildings with habitability score 50-74 (fair): +1 priority point
 * - Buildings with habitability score >= 75 (good): no boost
 *
 * This helps identify properties with critical habitability issues as high-priority
 * organizing targets, as housing quality is a key tenant concern.
 *
 * @param baseOrganizingPriority - Original organizing priority (0-10 scale)
 * @param buildingId - Building ID (chat slug) to look up habitability score
 * @returns Effective organizing priority (capped at 10)
 */
export function getEffectiveOrganizingPriority(baseOrganizingPriority: number | undefined, buildingId: string): number {
  if (baseOrganizingPriority === undefined || baseOrganizingPriority === null) {
    baseOrganizingPriority = 0;
  }

  const habitabilityScore = getHabitabilityScore(buildingId);
  if (!habitabilityScore || habitabilityScore.score === null) {
    return baseOrganizingPriority;
  }

  let boostedPriority = baseOrganizingPriority;

  // Apply habitability boost
  if (habitabilityScore.score < 50) {
    boostedPriority += 3; // Poor condition = high organizing opportunity
  } else if (habitabilityScore.score < 75) {
    boostedPriority += 1; // Fair condition = moderate opportunity
  }

  // Cap at 10 (maximum priority)
  return Math.min(boostedPriority, 10);
}

/**
 * Capture monthly snapshot of habitability issues
 * Called automatically when getHabitabilityScore() is invoked
 * Stores max 6 months of data per building
 */
function captureIssueSnapshot(buildingId: string, issueBreakdown: Array<{key: string, count: number, label: string}>): void {
  const state = getCanvassState();
  const building = state.buildings[buildingId];
  if (!building) return;

  const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

  // Initialize timeline storage if needed
  if (!building.issueTimelines) {
    building.issueTimelines = {};
  }

  // Capture snapshot for each issue currently being reported
  for (const issue of issueBreakdown) {
    if (!building.issueTimelines[issue.key]) {
      building.issueTimelines[issue.key] = [];
    }

    const timeline = building.issueTimelines[issue.key];

    // Check if snapshot already exists for current month
    const existingIdx = timeline.findIndex(s => s.month === currentMonth);
    if (existingIdx >= 0) {
      // Update existing snapshot
      timeline[existingIdx].unitCount = issue.count;
      timeline[existingIdx].timestamp = Date.now();
    } else {
      // Add new snapshot
      timeline.push({
        month: currentMonth,
        issueKey: issue.key,
        unitCount: issue.count,
        timestamp: Date.now(),
      });
    }

    // Keep only last 6 months
    building.issueTimelines[issue.key] = timeline
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6);
  }

  saveCanvassState(state);
}

/**
 * Get issue timeline for all issues in a building
 * Returns array of IssueTimeline objects with trend analysis
 */
export function getIssueTimelines(buildingId: string): IssueTimeline[] {
  const state = getCanvassState();
  const building = state.buildings[buildingId];
  if (!building || !building.issueTimelines) return [];

  const timelines: IssueTimeline[] = [];

  for (const [issueKey, snapshots] of Object.entries(building.issueTimelines)) {
    if (snapshots.length < 2) continue; // Need at least 2 months for trend

    // Sort chronologically (oldest first)
    const sorted = [...snapshots].sort((a, b) => a.month.localeCompare(b.month));

    // Calculate trend
    const oldest = sorted[0];
    const newest = sorted[sorted.length - 1];
    const changeRate = (newest.unitCount - oldest.unitCount) / sorted.length;

    let trend: 'escalating' | 'stable' | 'improving';
    if (changeRate > 0.5) trend = 'escalating';
    else if (changeRate < -0.5) trend = 'improving';
    else trend = 'stable';

    // Find label
    const issueConfig = HABITABILITY_ISSUES.find(i => i.key === issueKey);
    const label = issueConfig?.label || issueKey;

    timelines.push({
      issueKey,
      label,
      snapshots: sorted,
      trend,
      changeRate,
    });
  }

  // Sort by severity (escalating first, then by count)
  return timelines.sort((a, b) => {
    if (a.trend === 'escalating' && b.trend !== 'escalating') return -1;
    if (b.trend === 'escalating' && a.trend !== 'escalating') return 1;
    const aCount = a.snapshots[a.snapshots.length - 1].unitCount;
    const bCount = b.snapshots[b.snapshots.length - 1].unitCount;
    return bCount - aCount;
  });
}

/**
 * Get representative tenant quotes for a building's habitability issues
 * Returns up to 3 recent, relevant quotes
 */
export function getBuildingHabitabilityQuotes(buildingId: string): Array<{quote: string, unitNumber: string, issues: string[]}> {
  const canvass = getBuildingCanvass(buildingId);
  if (!canvass) return [];

  const quotes: Array<{quote: string, unitNumber: string, issues: string[], timestamp: number}> = [];

  for (const unit of Object.values(canvass.units)) {
    if (!unit.habitabilityQuotes || !unit.habitabilityIssues || unit.habitabilityIssues.length === 0) continue;

    quotes.push({
      quote: unit.habitabilityQuotes,
      unitNumber: unit.unitNumber,
      issues: unit.habitabilityIssues,
      timestamp: unit.contactDate || 0,
    });
  }

  // Sort by recency, return top 3
  return quotes
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3)
    .map(q => ({ quote: q.quote, unitNumber: q.unitNumber, issues: q.issues }));
}

// Export flag for components to check
export { USE_SUPABASE }
