/**
 * Landlord Profile Storage
 *
 * Aggregates landlord data across buildings for Power Map visualization.
 * Helps organizers understand landlord power structures and coordinate
 * tenant outreach across portfolios.
 */

import type { EnhancedBuilding } from './getBuildingsData'
import {
  getBuildingOrganizing,
  type OrganizingStatus,
  calculateOrganizingStatus,
} from './buildingOrganizingStorage'
import { COMPLAINT_CATEGORIES as CATEGORIES_ARRAY } from './canvassStorage'

// Create a lookup map for category labels
const CATEGORY_LABELS: Map<string, string> = new Map(
  CATEGORIES_ARRAY.map(cat => [cat.key, cat.label])
)

// === TYPES ===

export interface LandlordProperty {
  apn: string
  address: string
  chatSlug: string
  units: number
  value: number
  organizingStatus: OrganizingStatus
  complaintsCount: number
  demandsCount: number
}

export interface LandlordProfile {
  ownerName: string

  // Portfolio
  properties: LandlordProperty[]
  totalProperties: number
  totalUnits: number
  totalValue: number

  // Organizing intelligence
  complaintsByCategory: Record<string, number>
  totalComplaints: number
  totalDemands: number
  buildingsWithActivity: number

  // Status breakdown
  statusCounts: Record<OrganizingStatus, number>

  // From database (if available)
  accountabilityScore?: number
  isCorporateOwned: boolean
}

// === HELPER FUNCTIONS ===

/**
 * Normalize owner names for comparison
 * Handles variations like "LLC", trailing spaces, etc.
 */
function normalizeOwnerName(name: string): string {
  return name
    .toUpperCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/,\s*/g, ' ')
}

/**
 * Get organizing status for a building
 * Uses simplified calculation for Power Map (no profile count)
 */
function getSimpleOrganizingStatus(building: EnhancedBuilding): OrganizingStatus {
  const organizing = getBuildingOrganizing(building.chatSlug)
  const hasComplaints = organizing.complaints.filter(c => c.status === 'voting').length > 0
  const hasDemands = organizing.demands.length > 0

  // Simplified status based on complaints/demands
  if (hasDemands) {
    return 'active'
  }
  if (hasComplaints) {
    return 'emerging'
  }
  return 'inactive'
}

// === MAIN FUNCTIONS ===

/**
 * Build a landlord profile from buildings data
 */
export function buildLandlordProfile(
  ownerName: string,
  buildings: EnhancedBuilding[]
): LandlordProfile {
  const normalizedOwner = normalizeOwnerName(ownerName)

  // Filter buildings by this owner
  const ownerBuildings = buildings.filter(
    b => normalizeOwnerName(b.owner) === normalizedOwner
  )

  // Aggregate data
  const properties: LandlordProperty[] = []
  const complaintsByCategory: Record<string, number> = {}
  let totalComplaints = 0
  let totalDemands = 0
  let buildingsWithActivity = 0
  const statusCounts: Record<OrganizingStatus, number> = {
    inactive: 0,
    emerging: 0,
    active: 0,
    strike_ready: 0,
  }

  for (const building of ownerBuildings) {
    const organizing = getBuildingOrganizing(building.chatSlug)
    const status = getSimpleOrganizingStatus(building)
    const complaintsCount = organizing.complaints.length
    const demandsCount = organizing.demands.length

    // Add property
    properties.push({
      apn: building.apn,
      address: building.address,
      chatSlug: building.chatSlug,
      units: building.units,
      value: building.value,
      organizingStatus: status,
      complaintsCount,
      demandsCount,
    })

    // Aggregate complaints by category
    for (const complaint of organizing.complaints) {
      const cat = complaint.category
      complaintsByCategory[cat] = (complaintsByCategory[cat] || 0) + 1
      totalComplaints++
    }

    // Count demands
    totalDemands += demandsCount

    // Track status counts
    statusCounts[status]++

    // Track buildings with any activity
    if (complaintsCount > 0 || demandsCount > 0) {
      buildingsWithActivity++
    }
  }

  // Sort properties by units descending
  properties.sort((a, b) => b.units - a.units)

  // Check if corporate owned (from any building)
  const isCorporateOwned = ownerBuildings.some(b => b.isCorporateOwned)

  // Get accountability score if available (use first building's score)
  const accountabilityScore = ownerBuildings.find(b => b.overallAccountabilityScore)
    ?.overallAccountabilityScore

  return {
    ownerName,
    properties,
    totalProperties: properties.length,
    totalUnits: properties.reduce((sum, p) => sum + p.units, 0),
    totalValue: properties.reduce((sum, p) => sum + p.value, 0),
    complaintsByCategory,
    totalComplaints,
    totalDemands,
    buildingsWithActivity,
    statusCounts,
    accountabilityScore,
    isCorporateOwned,
  }
}

/**
 * Get all landlords sorted by portfolio size
 */
export function getAllLandlords(buildings: EnhancedBuilding[]): LandlordProfile[] {
  // Group buildings by normalized owner name
  const ownerMap = new Map<string, EnhancedBuilding[]>()

  for (const building of buildings) {
    const normalized = normalizeOwnerName(building.owner)
    if (!ownerMap.has(normalized)) {
      ownerMap.set(normalized, [])
    }
    ownerMap.get(normalized)!.push(building)
  }

  // Build profiles for each owner
  const profiles: LandlordProfile[] = []
  ownerMap.forEach((ownerBuildings) => {
    // Use first building's original owner name (preserves case)
    const ownerName = ownerBuildings[0].owner
    profiles.push(buildLandlordProfile(ownerName, ownerBuildings))
  })

  // Sort by portfolio size (total properties) descending
  profiles.sort((a, b) => {
    // First by property count
    if (b.totalProperties !== a.totalProperties) {
      return b.totalProperties - a.totalProperties
    }
    // Then by total units
    return b.totalUnits - a.totalUnits
  })

  return profiles
}

/**
 * Get complaints aggregated by owner
 */
export function getOwnerComplaints(
  ownerName: string,
  buildings: EnhancedBuilding[]
): Record<string, number> {
  const profile = buildLandlordProfile(ownerName, buildings)
  return profile.complaintsByCategory
}

/**
 * Search landlords by name
 */
export function searchLandlords(
  buildings: EnhancedBuilding[],
  query: string
): LandlordProfile[] {
  const normalizedQuery = query.toLowerCase().trim()
  if (!normalizedQuery) {
    return getAllLandlords(buildings)
  }

  const allLandlords = getAllLandlords(buildings)
  return allLandlords.filter(landlord =>
    landlord.ownerName.toLowerCase().includes(normalizedQuery)
  )
}

/**
 * Get landlords with organizing activity
 */
export function getLandlordsWithActivity(
  buildings: EnhancedBuilding[]
): LandlordProfile[] {
  const allLandlords = getAllLandlords(buildings)
  return allLandlords.filter(l => l.buildingsWithActivity > 0)
}

/**
 * Get top complaint categories across all landlords
 */
export function getTopComplaintCategories(
  buildings: EnhancedBuilding[],
  limit: number = 5
): { category: string; label: string; count: number }[] {
  const allLandlords = getAllLandlords(buildings)

  // Aggregate all complaints
  const totals: Record<string, number> = {}
  for (const landlord of allLandlords) {
    for (const [cat, count] of Object.entries(landlord.complaintsByCategory)) {
      totals[cat] = (totals[cat] || 0) + count
    }
  }

  // Sort and limit
  const sorted = Object.entries(totals)
    .map(([category, count]) => ({
      category,
      label: CATEGORY_LABELS.get(category) || category,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)

  return sorted
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`
  }
  return `$${value.toFixed(0)}`
}

/**
 * Format unit count for display
 */
export function formatUnits(units: number): string {
  if (units >= 1000) {
    return `${(units / 1000).toFixed(1)}K`
  }
  return units.toString()
}
