// Building organizing storage for complaints, demands, and voting
// Implements Bookchin's direct democracy principles:
// - Tenants vote directly on demands (not representatives)
// - Admins are neutral facilitators (cannot vote)
// - Supermajority (65%) threshold for strike-ready status

import { getCurrentProfile, type UserProfile } from './profileStorage'
import { COMPLAINT_CATEGORIES } from './canvassStorage'

// Re-export complaint categories for convenience
export { COMPLAINT_CATEGORIES }

// Status levels for building organizing
export type OrganizingStatus = 'inactive' | 'emerging' | 'active' | 'strike_ready'

// Complaint status flow
export type ComplaintStatus = 'pending' | 'voting' | 'demand' | 'resolved' | 'rejected'

// Escalation levels for demands
export type EscalationLevel = 'letter' | 'petition' | 'action' | 'strike'

// Building complaint submitted by tenants
export interface BuildingComplaint {
  id: string
  buildingId: string          // chatSlug
  category: string            // Key from COMPLAINT_CATEGORIES
  title: string
  description: string
  submittedBy: string         // Profile ID
  submittedByName: string
  timestamp: number
  upvotes: string[]           // Profile IDs
  downvotes: string[]         // Profile IDs
  status: ComplaintStatus
}

// Demand promoted from high-voted complaint
export interface BuildingDemand {
  id: string
  buildingId: string
  title: string
  description: string
  sourceComplaintId: string
  supportVotes: string[]      // Profile IDs supporting the demand
  escalationLevel: EscalationLevel
  createdAt: number
}

// Building organizing state
export interface BuildingOrganizing {
  buildingId: string
  complaints: BuildingComplaint[]
  demands: BuildingDemand[]
  lastModified: number
}

// Full organizing state
interface OrganizingState {
  buildings: Record<string, BuildingOrganizing>
  lastModified: number
}

const STORAGE_KEY = 'rstu_organizing_data'

// Circuit breaker: stop trying to save after quota error
let quotaExceeded = false
let lastQuotaError = 0
const QUOTA_RETRY_DELAY = 60000 // Wait 1 minute before retrying after quota error

// May Day 2028 target date
export const MAY_DAY_2028 = new Date('2028-05-01T00:00:00').getTime()

// Generate unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

// Get full organizing state
export function getOrganizingState(): OrganizingState {
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

// Save organizing state with circuit breaker
function saveOrganizingState(state: OrganizingState): boolean {
  if (typeof window === 'undefined') return false

  // Circuit breaker: skip if quota was recently exceeded
  if (quotaExceeded && Date.now() - lastQuotaError < QUOTA_RETRY_DELAY) {
    return false
  }

  state.lastModified = Date.now()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    quotaExceeded = false // Reset on success
    return true
  } catch (e) {
    if (e instanceof DOMException && (e.code === 22 || e.name === 'QuotaExceededError')) {
      if (!quotaExceeded) {
        console.warn('[OrganizingStorage] Storage quota exceeded - will retry in 1 minute')
        quotaExceeded = true
        lastQuotaError = Date.now()
        // Try cleanup
        cleanupOrganizingData()
      }
    } else {
      console.error('[OrganizingStorage] Failed to save:', e)
    }
    return false
  }
}

// Cleanup old organizing data to free up space
export function cleanupOrganizingData(): void {
  if (typeof window === 'undefined') return

  try {
    const state = getOrganizingState()
    const now = Date.now()
    const MAX_AGE = 90 * 24 * 60 * 60 * 1000 // 90 days
    const MAX_COMPLAINTS_PER_BUILDING = 50
    const MAX_DEMANDS_PER_BUILDING = 20

    let cleaned = false

    for (const buildingId of Object.keys(state.buildings)) {
      const building = state.buildings[buildingId]

      // Remove buildings with no activity
      if (building.complaints.length === 0 && building.demands.length === 0) {
        delete state.buildings[buildingId]
        cleaned = true
        continue
      }

      // Remove old resolved/rejected complaints
      const originalComplaintCount = building.complaints.length
      building.complaints = building.complaints.filter(c => {
        if (c.status === 'resolved' || c.status === 'rejected') {
          return now - c.timestamp < MAX_AGE
        }
        return true
      })

      // Limit complaints per building
      if (building.complaints.length > MAX_COMPLAINTS_PER_BUILDING) {
        // Keep voting ones, then most recent
        building.complaints.sort((a, b) => {
          if (a.status === 'voting' && b.status !== 'voting') return -1
          if (b.status === 'voting' && a.status !== 'voting') return 1
          return b.timestamp - a.timestamp
        })
        building.complaints = building.complaints.slice(0, MAX_COMPLAINTS_PER_BUILDING)
      }

      // Limit demands per building
      if (building.demands.length > MAX_DEMANDS_PER_BUILDING) {
        building.demands.sort((a, b) => b.createdAt - a.createdAt)
        building.demands = building.demands.slice(0, MAX_DEMANDS_PER_BUILDING)
      }

      if (building.complaints.length !== originalComplaintCount) {
        cleaned = true
      }
    }

    if (cleaned) {
      console.log('[OrganizingStorage] Cleaned up old data')
      // Try to save - might still fail if storage is very full
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      quotaExceeded = false
    }
  } catch (e) {
    console.error('[OrganizingStorage] Cleanup failed:', e)
  }
}

// Get building organizing data (does NOT auto-create to avoid storage spam)
export function getBuildingOrganizing(buildingId: string): BuildingOrganizing {
  const state = getOrganizingState()
  // Return existing data or empty structure (without saving)
  return state.buildings[buildingId] || {
    buildingId,
    complaints: [],
    demands: [],
    lastModified: 0,
  }
}

// ============================================
// Voting Authorization (Bookchin principles)
// ============================================

// Check if a user can vote on a building's complaints/demands
// - Must be a tenant or organizer assigned to the building
// - Admins CANNOT vote (neutral facilitators)
export function canVoteOnBuilding(buildingId: string, profile?: UserProfile | null): boolean {
  const user = profile ?? getCurrentProfile()
  if (!user) return false

  // Admins cannot vote (neutral facilitators per Bookchin)
  if (user.role === 'admin') return false

  // Tenant: buildingId must match their home building
  if (user.role === 'tenant') {
    return user.buildingId === buildingId
  }

  // Organizer: buildingId match OR in assignedBuildings
  if (user.role === 'organizer') {
    if (user.buildingId === buildingId) return true
    if (user.assignedBuildings?.includes(buildingId)) return true
  }

  return false
}

// Get reason why user cannot vote (for UI display)
export function getVotingBlockReason(buildingId: string): string | null {
  const profile = getCurrentProfile()
  if (!profile) return 'You must be logged in to vote'
  if (profile.role === 'admin') return 'Admins facilitate but do not vote (Bookchin principle)'
  if (profile.role === 'tenant' && profile.buildingId !== buildingId) {
    return 'Only tenants of this building can vote'
  }
  if (profile.role === 'organizer') {
    const isAssigned = profile.buildingId === buildingId || profile.assignedBuildings?.includes(buildingId)
    if (!isAssigned) return 'You must be assigned to this building to vote'
  }
  return null // Can vote
}

// ============================================
// Complaint Functions
// ============================================

// Submit a new complaint
export function submitComplaint(data: {
  buildingId: string
  category: string
  title: string
  description: string
}): BuildingComplaint | null {
  const profile = getCurrentProfile()
  if (!profile) return null

  const state = getOrganizingState()

  // Initialize building if needed
  if (!state.buildings[data.buildingId]) {
    state.buildings[data.buildingId] = {
      buildingId: data.buildingId,
      complaints: [],
      demands: [],
      lastModified: Date.now(),
    }
  }

  const complaint: BuildingComplaint = {
    id: generateId(),
    buildingId: data.buildingId,
    category: data.category,
    title: data.title,
    description: data.description,
    submittedBy: profile.id,
    submittedByName: profile.nickname,
    timestamp: Date.now(),
    upvotes: [profile.id], // Submitter auto-upvotes
    downvotes: [],
    status: 'voting',
  }

  state.buildings[data.buildingId].complaints.push(complaint)
  state.buildings[data.buildingId].lastModified = Date.now()
  saveOrganizingState(state)

  return complaint
}

// Vote on a complaint
export function voteOnComplaint(
  buildingId: string,
  complaintId: string,
  voteType: 'up' | 'down'
): BuildingComplaint | null {
  const profile = getCurrentProfile()
  if (!profile) return null

  // Check voting authorization
  if (!canVoteOnBuilding(buildingId)) return null

  const state = getOrganizingState()
  const building = state.buildings[buildingId]
  if (!building) return null

  const complaint = building.complaints.find(c => c.id === complaintId)
  if (!complaint) return null

  // Can only vote on 'voting' status complaints
  if (complaint.status !== 'voting') return null

  // Remove from both vote arrays first
  complaint.upvotes = complaint.upvotes.filter(id => id !== profile.id)
  complaint.downvotes = complaint.downvotes.filter(id => id !== profile.id)

  // Add to appropriate array
  if (voteType === 'up') {
    complaint.upvotes.push(profile.id)
  } else {
    complaint.downvotes.push(profile.id)
  }

  // Check for promotion to demand (net +5 votes)
  const netVotes = complaint.upvotes.length - complaint.downvotes.length
  if (netVotes >= 5 && complaint.status === 'voting') {
    promoteComplaintToDemand(state, buildingId, complaint)
  }

  // Check for rejection (net -3 votes)
  if (netVotes <= -3) {
    complaint.status = 'rejected'
  }

  building.lastModified = Date.now()
  saveOrganizingState(state)

  return complaint
}

// Get complaints for a building
export function getBuildingComplaints(buildingId: string): BuildingComplaint[] {
  const building = getBuildingOrganizing(buildingId)
  return building.complaints.sort((a, b) => {
    // Voting first, then by net votes, then by date
    if (a.status === 'voting' && b.status !== 'voting') return -1
    if (a.status !== 'voting' && b.status === 'voting') return 1
    const aNet = a.upvotes.length - a.downvotes.length
    const bNet = b.upvotes.length - b.downvotes.length
    if (aNet !== bNet) return bNet - aNet
    return b.timestamp - a.timestamp
  })
}

// Delete a complaint (submitter or admin only)
export function deleteComplaint(buildingId: string, complaintId: string): boolean {
  const profile = getCurrentProfile()
  if (!profile) return false

  const state = getOrganizingState()
  const building = state.buildings[buildingId]
  if (!building) return false

  const complaintIndex = building.complaints.findIndex(c => c.id === complaintId)
  if (complaintIndex === -1) return false

  const complaint = building.complaints[complaintIndex]

  // Only submitter or admin can delete
  if (complaint.submittedBy !== profile.id && profile.role !== 'admin') {
    return false
  }

  building.complaints.splice(complaintIndex, 1)
  building.lastModified = Date.now()
  saveOrganizingState(state)

  return true
}

// ============================================
// Demand Functions
// ============================================

// Promote a complaint to a demand (internal function)
function promoteComplaintToDemand(
  state: OrganizingState,
  buildingId: string,
  complaint: BuildingComplaint
): void {
  const building = state.buildings[buildingId]
  if (!building) return

  // Mark complaint as promoted
  complaint.status = 'demand'

  // Create demand
  const demand: BuildingDemand = {
    id: generateId(),
    buildingId,
    title: complaint.title,
    description: complaint.description,
    sourceComplaintId: complaint.id,
    supportVotes: [...complaint.upvotes], // Start with upvoters as supporters
    escalationLevel: 'letter', // Start at lowest escalation
    createdAt: Date.now(),
  }

  building.demands.push(demand)
}

// Vote to support a demand
export function supportDemand(buildingId: string, demandId: string): BuildingDemand | null {
  const profile = getCurrentProfile()
  if (!profile) return null

  // Check voting authorization
  if (!canVoteOnBuilding(buildingId)) return null

  const state = getOrganizingState()
  const building = state.buildings[buildingId]
  if (!building) return null

  const demand = building.demands.find(d => d.id === demandId)
  if (!demand) return null

  // Toggle support
  if (demand.supportVotes.includes(profile.id)) {
    demand.supportVotes = demand.supportVotes.filter(id => id !== profile.id)
  } else {
    demand.supportVotes.push(profile.id)
  }

  building.lastModified = Date.now()
  saveOrganizingState(state)

  return demand
}

// Escalate a demand (organizer/admin only)
export function escalateDemand(
  buildingId: string,
  demandId: string,
  newLevel: EscalationLevel
): BuildingDemand | null {
  const profile = getCurrentProfile()
  if (!profile) return null
  if (profile.role === 'tenant') return null // Tenants can't escalate

  const state = getOrganizingState()
  const building = state.buildings[buildingId]
  if (!building) return null

  const demand = building.demands.find(d => d.id === demandId)
  if (!demand) return null

  demand.escalationLevel = newLevel
  building.lastModified = Date.now()
  saveOrganizingState(state)

  return demand
}

// Get demands for a building
export function getBuildingDemands(buildingId: string): BuildingDemand[] {
  const building = getBuildingOrganizing(buildingId)
  return building.demands.sort((a, b) => {
    // Sort by support count, then date
    if (a.supportVotes.length !== b.supportVotes.length) {
      return b.supportVotes.length - a.supportVotes.length
    }
    return b.createdAt - a.createdAt
  })
}

// ============================================
// Building Status Calculation
// ============================================

// Calculate organizing status for a building
export function calculateOrganizingStatus(
  buildingId: string,
  totalUnits: number,
  linkedProfiles: number,
  recentChatActivity: boolean
): OrganizingStatus {
  const organizing = getBuildingOrganizing(buildingId)
  const activeComplaints = organizing.complaints.filter(c => c.status === 'voting').length
  const demands = organizing.demands.length

  // Calculate participation rate
  const participationRate = totalUnits > 0 ? (linkedProfiles / totalUnits) : 0

  // Strike-ready: 65%+ participation AND has approved demands
  if (participationRate >= 0.65 && demands > 0) {
    return 'strike_ready'
  }

  // Active: 10%+ participation OR recent activity with complaints/demands
  if (participationRate >= 0.10 || (recentChatActivity && (activeComplaints > 0 || demands > 0))) {
    return 'active'
  }

  // Emerging: Some profiles OR complaints filed
  if (linkedProfiles >= 2 || activeComplaints > 0) {
    return 'emerging'
  }

  // Inactive: Default
  return 'inactive'
}

// Get status display info
export function getStatusInfo(status: OrganizingStatus): {
  label: string
  color: string
  bgColor: string
  description: string
} {
  switch (status) {
    case 'strike_ready':
      return {
        label: 'Strike-Ready',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        description: '65%+ tenant participation with approved demands',
      }
    case 'active':
      return {
        label: 'Active',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        description: 'Regular activity and tenant engagement',
      }
    case 'emerging':
      return {
        label: 'Emerging',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        description: 'Building momentum with initial organizing',
      }
    case 'inactive':
    default:
      return {
        label: 'Inactive',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        description: 'No recent organizing activity',
      }
  }
}

// Get escalation level display info
export function getEscalationInfo(level: EscalationLevel): {
  label: string
  color: string
  icon: string
  description: string
} {
  switch (level) {
    case 'letter':
      return {
        label: 'Letter',
        color: 'text-blue-700',
        icon: 'mail',
        description: 'Written demand to landlord',
      }
    case 'petition':
      return {
        label: 'Petition',
        color: 'text-yellow-700',
        icon: 'clipboard',
        description: 'Tenant petition with signatures',
      }
    case 'action':
      return {
        label: 'Action',
        color: 'text-orange-700',
        icon: 'megaphone',
        description: 'Direct action (protest, media)',
      }
    case 'strike':
      return {
        label: 'Rent Strike',
        color: 'text-red-700',
        icon: 'fist',
        description: 'Collective rent withholding',
      }
  }
}

// ============================================
// May Day 2028 Countdown
// ============================================

// Get days until May Day 2028
export function getDaysUntilMayDay(): number {
  const now = Date.now()
  const diff = MAY_DAY_2028 - now
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Get formatted countdown string
export function getMayDayCountdown(): string {
  const days = getDaysUntilMayDay()
  if (days <= 0) return 'May Day 2028 is here!'
  if (days === 1) return '1 day until May Day 2028'
  if (days < 30) return `${days} days until May Day 2028`
  if (days < 365) {
    const months = Math.floor(days / 30)
    return `${months} month${months > 1 ? 's' : ''} until May Day 2028`
  }
  const years = Math.floor(days / 365)
  const remainingMonths = Math.floor((days % 365) / 30)
  return `${years}y ${remainingMonths}m until May Day 2028`
}

// ============================================
// Stats & Analytics
// ============================================

// Get organizing stats for a building
export function getBuildingOrganizingStats(buildingId: string): {
  totalComplaints: number
  activeComplaints: number
  totalDemands: number
  uniqueVoters: number
  topCategory: string | null
} {
  const organizing = getBuildingOrganizing(buildingId)

  // Count voters
  const voterSet = new Set<string>()
  organizing.complaints.forEach(c => {
    c.upvotes.forEach(id => voterSet.add(id))
    c.downvotes.forEach(id => voterSet.add(id))
  })
  organizing.demands.forEach(d => {
    d.supportVotes.forEach(id => voterSet.add(id))
  })

  // Find top category
  const categoryCounts: Record<string, number> = {}
  organizing.complaints.forEach(c => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1
  })

  let topCategory: string | null = null
  let maxCount = 0
  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count
      topCategory = cat
    }
  }

  return {
    totalComplaints: organizing.complaints.length,
    activeComplaints: organizing.complaints.filter(c => c.status === 'voting').length,
    totalDemands: organizing.demands.length,
    uniqueVoters: voterSet.size,
    topCategory,
  }
}
