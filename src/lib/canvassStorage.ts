// Canvassing data storage for tenant outreach tracking
// Supports both localStorage (offline) and Supabase (cloud sync)

import { supabase, USE_SUPABASE, DbCanvassUnit } from './supabase'

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

  // Meta
  contactDate?: number
  organizer?: string
  created: number
  updated: number

  // Profile linking (when tenant creates account)
  profileId?: string
  profileNickname?: string
  linkedAt?: number
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
    console.error('[CanvassStorage] Failed to save unit to Supabase:', error)
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

// Search buildings with canvass data
async function searchCanvassBuildingsFromDb(query: string): Promise<Array<{
  building_id: string
  building_address: string
  unit_count: number
}>> {
  if (!supabase) return []

  // Use the FTS function we created
  const { data, error } = await supabase.rpc('search_canvass_buildings', {
    search_query: query
  })

  if (error || !data) {
    // Fallback to ILIKE search
    const { data: fallbackData } = await supabase
      .from('canvass_units')
      .select('building_id, building_address')
      .ilike('building_address', `%${query}%`)
      .limit(50)

    if (!fallbackData) return []

    // Group by building
    const buildings = new Map<string, { address: string; count: number }>()
    for (const unit of fallbackData) {
      if (!buildings.has(unit.building_id)) {
        buildings.set(unit.building_id, { address: unit.building_address, count: 0 })
      }
      buildings.get(unit.building_id)!.count++
    }

    return Array.from(buildings.entries()).map(([id, b]) => ({
      building_id: id,
      building_address: b.address,
      unit_count: b.count
    }))
  }

  return data
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
    console.error('[CanvassStorage] Failed to save - storage quota may be exceeded:', e)
  }
}

// Get canvass data for a specific building
export function getBuildingCanvass(buildingId: string): BuildingCanvass | null {
  const state = getCanvassState()
  return state.buildings[buildingId] || null
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
  profileNickname: string
): void {
  const state = getCanvassState()
  const building = state.buildings[buildingId]
  if (!building || !building.units[unitNumber]) return

  building.units[unitNumber] = {
    ...building.units[unitNumber],
    profileId,
    profileNickname,
    linkedAt: Date.now(),
    updated: Date.now(),
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

// Search buildings with canvass data (Supabase FTS)
export async function searchCanvassBuildingsAsync(query: string): Promise<Array<{
  buildingId: string
  buildingAddress: string
  unitCount: number
}>> {
  if (USE_SUPABASE) {
    const results = await searchCanvassBuildingsFromDb(query)
    return results.map(r => ({
      buildingId: r.building_id,
      buildingAddress: r.building_address,
      unitCount: r.unit_count
    }))
  }

  // Fallback to localStorage search
  const state = getCanvassState()
  const queryLower = query.toLowerCase()

  return Object.values(state.buildings)
    .filter(b => b.buildingAddress.toLowerCase().includes(queryLower))
    .map(b => ({
      buildingId: b.buildingId,
      buildingAddress: b.buildingAddress,
      unitCount: Object.keys(b.units).length
    }))
    .slice(0, 50)
}

// Sync all local canvass data to Supabase (bulk upload)
export async function syncCanvassToCloud(): Promise<{
  success: boolean
  synced: number
  errors: number
}> {
  if (!USE_SUPABASE || !supabase) {
    return { success: false, synced: 0, errors: 0 }
  }

  const state = getCanvassState()
  let synced = 0
  let errors = 0

  for (const building of Object.values(state.buildings)) {
    for (const unit of Object.values(building.units)) {
      const success = await saveUnitToDb(building.buildingId, building.buildingAddress, unit)
      if (success) {
        synced++
      } else {
        errors++
      }
    }
  }

  console.log(`[CanvassStorage] Synced ${synced} units to cloud, ${errors} errors`)
  return { success: errors === 0, synced, errors }
}

// Get all buildings with canvass data from Supabase
export async function getAllCanvassedBuildingsAsync(): Promise<Array<{
  buildingId: string
  buildingAddress: string
  unitCount: number
  stats: {
    contacted: number
    interested: number
    activeMembers: number
  }
}>> {
  if (!USE_SUPABASE || !supabase) {
    // Fallback to localStorage
    const state = getCanvassState()
    return Object.values(state.buildings).map(b => {
      const units = Object.values(b.units)
      return {
        buildingId: b.buildingId,
        buildingAddress: b.buildingAddress,
        unitCount: units.length,
        stats: {
          contacted: units.filter(u => u.status !== 'NOT_CONTACTED' && u.status !== 'NO_ANSWER').length,
          interested: units.filter(u => u.status === 'INTERESTED').length,
          activeMembers: units.filter(u => u.status === 'ACTIVE_MEMBER').length
        }
      }
    })
  }

  // Get distinct buildings from Supabase
  const { data, error } = await supabase
    .from('canvass_units')
    .select('building_id, building_address, status')

  if (error || !data) return []

  // Group by building
  const buildings = new Map<string, {
    address: string
    total: number
    contacted: number
    interested: number
    activeMembers: number
  }>()

  for (const unit of data) {
    if (!buildings.has(unit.building_id)) {
      buildings.set(unit.building_id, {
        address: unit.building_address,
        total: 0,
        contacted: 0,
        interested: 0,
        activeMembers: 0
      })
    }
    const b = buildings.get(unit.building_id)!
    b.total++
    if (unit.status !== 'NOT_CONTACTED' && unit.status !== 'NO_ANSWER') {
      b.contacted++
    }
    if (unit.status === 'INTERESTED') {
      b.interested++
    }
    if (unit.status === 'ACTIVE_MEMBER') {
      b.activeMembers++
    }
  }

  return Array.from(buildings.entries()).map(([id, b]) => ({
    buildingId: id,
    buildingAddress: b.address,
    unitCount: b.total,
    stats: {
      contacted: b.contacted,
      interested: b.interested,
      activeMembers: b.activeMembers
    }
  }))
}

// Export flag for components to check
export { USE_SUPABASE }
