// Canvassing data storage for tenant outreach tracking

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
}

// Building canvass data
export interface BuildingCanvass {
  buildingId: string
  buildingAddress: string
  units: Record<string, UnitRecord>
  lastModified: number
}

// Complete canvass state
export interface CanvassState {
  buildings: Record<string, BuildingCanvass>
  lastModified: number
}

const STORAGE_KEY = 'rstu_canvass_data'

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
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
