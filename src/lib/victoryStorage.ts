/**
 * Victory Archive Storage
 *
 * Stores documented organizing wins (rent reductions, repairs, evictions stopped).
 * Used to show wins on PropertyInfoTab and Power Map to inspire action.
 * All data stored locally in localStorage.
 */

// === TYPES ===

export type VictoryType =
  | 'rent_reduction'
  | 'repairs'
  | 'eviction_stopped'
  | 'policy_change'
  | 'other'

export interface Victory {
  id: string
  // Links - at least one should be set
  buildingChatSlug?: string // Links to specific building
  landlordName?: string // For landlord-wide wins

  // Details
  date: string // ISO date
  type: VictoryType
  title: string // Short headline
  description: string // Full description

  // Impact metrics
  quantifiedImpact?: string // e.g., "$200/month reduction", "15 units affected"
  unitsAffected?: number
  monthlyRentReduction?: number // For rent_reduction type

  // Campaign details
  duration?: string // e.g., "30-day strike", "2 weeks negotiation"
  tactics?: string[] // e.g., ["rent strike", "media coverage", "code enforcement"]

  // Testimonial
  memberQuote?: string
  memberName?: string // Optional - can be anonymous

  // Meta
  createdBy?: string // Profile ID of person who added it
  created: number
  updated: number
}

export interface VictoryState {
  victories: Victory[]
  lastModified: number
}

// === CONSTANTS ===

const STORAGE_KEY = 'rstu_victories'

export const VICTORY_TYPES: { key: VictoryType; label: string; icon: string }[] = [
  { key: 'rent_reduction', label: 'Rent Reduction', icon: 'dollar' },
  { key: 'repairs', label: 'Repairs Secured', icon: 'wrench' },
  { key: 'eviction_stopped', label: 'Eviction Stopped', icon: 'shield' },
  { key: 'policy_change', label: 'Policy Change', icon: 'document' },
  { key: 'other', label: 'Other Win', icon: 'star' },
]

export const COMMON_TACTICS = [
  'Rent strike',
  'Letter to landlord',
  'Media coverage',
  'Code enforcement complaint',
  'Legal aid consultation',
  'Tenant meeting',
  'Petition',
  'Solidarity action',
  'Social media campaign',
  'Direct action',
]

// === HELPER FUNCTIONS ===

/**
 * Generate a unique ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

/**
 * Get victory type label
 */
export function getVictoryTypeLabel(type: VictoryType): string {
  const found = VICTORY_TYPES.find((t) => t.key === type)
  return found?.label || 'Win'
}

/**
 * Format date for display
 */
export function formatVictoryDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Get color classes for victory type
 */
export function getVictoryTypeColor(type: VictoryType): string {
  switch (type) {
    case 'rent_reduction':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'repairs':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'eviction_stopped':
      return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'policy_change':
      return 'bg-orange-100 text-orange-700 border-orange-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

// === STATE MANAGEMENT ===

/**
 * Get victory state from localStorage
 */
export function getVictoryState(): VictoryState {
  if (typeof window === 'undefined') {
    return { victories: [], lastModified: 0 }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return { victories: [], lastModified: 0 }
    }
    return JSON.parse(stored)
  } catch {
    return { victories: [], lastModified: 0 }
  }
}

/**
 * Save victory state to localStorage
 */
function saveVictoryState(state: VictoryState): void {
  if (typeof window === 'undefined') return

  state.lastModified = Date.now()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('[VictoryStorage] Failed to save:', e)
  }
}

// === CRUD OPERATIONS ===

/**
 * Get all victories
 */
export function getAllVictories(): Victory[] {
  return getVictoryState().victories
}

/**
 * Get victories for a specific building
 */
export function getBuildingVictories(chatSlug: string): Victory[] {
  const state = getVictoryState()
  return state.victories
    .filter((v) => v.buildingChatSlug === chatSlug)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * Get victories for a specific landlord (includes all their buildings)
 */
export function getLandlordVictories(landlordName: string): Victory[] {
  const state = getVictoryState()
  const normalized = landlordName.toLowerCase().trim()

  return state.victories
    .filter((v) => v.landlordName?.toLowerCase().trim() === normalized)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * Get victories related to a building OR its landlord
 */
export function getRelatedVictories(
  chatSlug: string,
  landlordName?: string
): Victory[] {
  const state = getVictoryState()
  const normalizedLandlord = landlordName?.toLowerCase().trim()

  return state.victories
    .filter((v) => {
      // Match building directly
      if (v.buildingChatSlug === chatSlug) return true
      // Match landlord
      if (normalizedLandlord && v.landlordName?.toLowerCase().trim() === normalizedLandlord)
        return true
      return false
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * Get a single victory by ID
 */
export function getVictoryById(id: string): Victory | null {
  const state = getVictoryState()
  return state.victories.find((v) => v.id === id) || null
}

/**
 * Add a new victory
 */
export function addVictory(
  data: Omit<Victory, 'id' | 'created' | 'updated'>
): Victory {
  const state = getVictoryState()
  const now = Date.now()

  const victory: Victory = {
    ...data,
    id: generateId(),
    created: now,
    updated: now,
  }

  state.victories.push(victory)
  saveVictoryState(state)
  return victory
}

/**
 * Update an existing victory
 */
export function updateVictory(
  id: string,
  updates: Partial<Omit<Victory, 'id' | 'created'>>
): Victory | null {
  const state = getVictoryState()
  const index = state.victories.findIndex((v) => v.id === id)

  if (index < 0) return null

  state.victories[index] = {
    ...state.victories[index],
    ...updates,
    updated: Date.now(),
  }

  saveVictoryState(state)
  return state.victories[index]
}

/**
 * Delete a victory
 */
export function deleteVictory(id: string): boolean {
  const state = getVictoryState()
  const index = state.victories.findIndex((v) => v.id === id)

  if (index < 0) return false

  state.victories.splice(index, 1)
  saveVictoryState(state)
  return true
}

// === ANALYTICS ===

/**
 * Get victory statistics
 */
export function getVictoryStats(): {
  total: number
  byType: Record<VictoryType, number>
  totalRentReduction: number
  totalUnitsAffected: number
  recentCount: number // Last 6 months
} {
  const state = getVictoryState()
  const sixMonthsAgo = Date.now() - 180 * 24 * 60 * 60 * 1000

  const byType: Record<VictoryType, number> = {
    rent_reduction: 0,
    repairs: 0,
    eviction_stopped: 0,
    policy_change: 0,
    other: 0,
  }

  let totalRentReduction = 0
  let totalUnitsAffected = 0
  let recentCount = 0

  for (const v of state.victories) {
    byType[v.type]++

    if (v.monthlyRentReduction) {
      totalRentReduction += v.monthlyRentReduction
    }
    if (v.unitsAffected) {
      totalUnitsAffected += v.unitsAffected
    }

    const victoryDate = new Date(v.date).getTime()
    if (victoryDate >= sixMonthsAgo) {
      recentCount++
    }
  }

  return {
    total: state.victories.length,
    byType,
    totalRentReduction,
    totalUnitsAffected,
    recentCount,
  }
}

/**
 * Get recent victories for homepage display
 */
export function getRecentVictories(limit: number = 5): Victory[] {
  const state = getVictoryState()
  return state.victories
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

/**
 * Check if any victories exist for a building/landlord combo
 */
export function hasVictories(chatSlug: string, landlordName?: string): boolean {
  return getRelatedVictories(chatSlug, landlordName).length > 0
}
