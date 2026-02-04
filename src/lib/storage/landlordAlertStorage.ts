import { createLogger } from '../utils/logger'

const log = createLogger('LandlordAlert')

/**
 * Landlord Alert Storage
 *
 * Generates cross-building alerts when significant events happen at OTHER
 * buildings owned by the same landlord. Enables tenant solidarity and
 * coordination across portfolios.
 */

import type { EnhancedBuilding } from '../data/getBuildingsData'
import { getBuildingOrganizing, type BuildingDemand } from './buildingOrganizingStorage'
import { getStrikeState, type StrikePreparation } from './strikeStorage'
import { getCurrentProfile } from './profileStorage'

// ============================================================================
// TYPES
// ============================================================================

export type LandlordAlertEventType = 'demand_escalated' | 'strike_started'
export type LandlordAlertUrgency = 'info' | 'important' | 'urgent'

export interface LandlordAlert {
  id: string
  eventType: LandlordAlertEventType
  sourceApn: string
  sourceAddress: string
  sourceChatSlug: string
  landlordName: string
  title: string
  description: string
  timestamp: number
  urgency: LandlordAlertUrgency
  metadata: LandlordAlertMetadata
}

export interface LandlordAlertMetadata {
  demandId?: string
  demandTitle?: string
  strikeId?: string
  strikeStage?: string
}

interface AlertGenerationOptions {
  maxAgeDays?: number // Default 30
  excludeCurrentBuilding?: boolean // Default true
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DISMISSED_ALERTS_KEY = 'rstu_landlord_alerts_dismissed'
const DEFAULT_MAX_AGE_DAYS = 30

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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
 * Get all buildings owned by the same landlord
 */
export function getSameOwnerBuildings(
  currentApn: string,
  allBuildings: EnhancedBuilding[]
): EnhancedBuilding[] {
  const currentBuilding = allBuildings.find(b => b.apn === currentApn)
  if (!currentBuilding) return []

  const normalizedOwner = normalizeOwnerName(currentBuilding.owner)

  return allBuildings.filter(b =>
    b.apn !== currentApn && normalizeOwnerName(b.owner) === normalizedOwner
  )
}

/**
 * Get the landlord name for a building
 */
export function getLandlordForBuilding(
  apn: string,
  allBuildings: EnhancedBuilding[]
): string | null {
  const building = allBuildings.find(b => b.apn === apn)
  return building ? building.owner : null
}

// ============================================================================
// DISMISSAL MANAGEMENT
// ============================================================================

/**
 * Get dismissed alert IDs for a profile
 */
function getDismissedAlerts(profileId: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(DISMISSED_ALERTS_KEY)
    if (!stored) return []
    const dismissed = JSON.parse(stored) as Record<string, string[]>
    return dismissed[profileId] || []
  } catch {
    return []
  }
}

/**
 * Dismiss a landlord alert for a profile
 */
export function dismissLandlordAlert(alertId: string, profileId: string): void {
  if (typeof window === 'undefined') return
  try {
    const stored = localStorage.getItem(DISMISSED_ALERTS_KEY)
    const dismissed: Record<string, string[]> = stored ? JSON.parse(stored) : {}
    if (!dismissed[profileId]) {
      dismissed[profileId] = []
    }
    if (!dismissed[profileId].includes(alertId)) {
      dismissed[profileId].push(alertId)
    }
    localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(dismissed))
  } catch {
    log.error('Failed to dismiss landlord alert')
  }
}

/**
 * Check if an alert is dismissed for a profile
 */
export function isLandlordAlertDismissed(alertId: string, profileId: string): boolean {
  return getDismissedAlerts(profileId).includes(alertId)
}

/**
 * Clear all dismissed alerts for a profile (useful for testing)
 */
export function clearDismissedLandlordAlerts(profileId: string): void {
  if (typeof window === 'undefined') return
  try {
    const stored = localStorage.getItem(DISMISSED_ALERTS_KEY)
    const dismissed: Record<string, string[]> = stored ? JSON.parse(stored) : {}
    delete dismissed[profileId]
    localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(dismissed))
  } catch {
    log.error('Failed to clear dismissed landlord alerts')
  }
}

// ============================================================================
// ALERT GENERATION
// ============================================================================

/**
 * Generate demand alerts from other buildings with same owner
 */
function generateDemandAlerts(
  sameOwnerBuildings: EnhancedBuilding[],
  landlordName: string,
  maxAgeMs: number
): LandlordAlert[] {
  const alerts: LandlordAlert[] = []
  const now = Date.now()

  for (const building of sameOwnerBuildings) {
    const organizing = getBuildingOrganizing(building.chatSlug)

    for (const demand of organizing.demands) {
      // Check age
      if (now - demand.createdAt > maxAgeMs) continue

      alerts.push({
        id: `demand_${demand.id}`,
        eventType: 'demand_escalated',
        sourceApn: building.apn,
        sourceAddress: building.address,
        sourceChatSlug: building.chatSlug,
        landlordName,
        title: `Demand at ${building.address.split(',')[0]}`,
        description: demand.title,
        timestamp: demand.createdAt,
        urgency: 'important',
        metadata: {
          demandId: demand.id,
          demandTitle: demand.title,
        },
      })
    }
  }

  return alerts
}

/**
 * Generate strike alerts from buildings with same owner
 */
function generateStrikeAlerts(
  sameOwnerBuildings: EnhancedBuilding[],
  landlordName: string,
  maxAgeMs: number
): LandlordAlert[] {
  const alerts: LandlordAlert[] = []
  const now = Date.now()
  const strikeState = getStrikeState()

  // Get set of same-owner building slugs
  const sameOwnerSlugs = new Set(sameOwnerBuildings.map(b => b.chatSlug))

  for (const [strikeId, strike] of Object.entries(strikeState.strikes)) {
    // Check if strike is for a same-owner building
    if (!sameOwnerSlugs.has(strike.buildingChatSlug)) continue

    // Check age (createdAt is ISO date string)
    const strikeCreated = strike.createdAt ? new Date(strike.createdAt).getTime() : 0
    if (strikeCreated && now - strikeCreated > maxAgeMs) continue

    // Find the source building
    const sourceBuilding = sameOwnerBuildings.find(b => b.chatSlug === strike.buildingChatSlug)
    if (!sourceBuilding) continue

    // Determine strike stage for description
    const stage = strike.stage || 'planning'
    const isActive = stage === 'active' || stage === 'authorized'

    alerts.push({
      id: `strike_${strikeId}`,
      eventType: 'strike_started',
      sourceApn: sourceBuilding.apn,
      sourceAddress: sourceBuilding.address,
      sourceChatSlug: strike.buildingChatSlug,
      landlordName,
      title: `Strike preparation at ${sourceBuilding.address.split(',')[0]}`,
      description: `Tenants are ${isActive ? 'on strike' : 'preparing for action'}`,
      timestamp: strikeCreated || now,
      urgency: 'urgent',
      metadata: {
        strikeId,
        strikeStage: stage,
      },
    })
  }

  return alerts
}

// ============================================================================
// MAIN API
// ============================================================================

/**
 * Get all landlord alerts for a building
 *
 * Scans for events at other buildings owned by the same landlord and
 * returns alerts sorted by timestamp (newest first).
 */
export function getLandlordAlertsForBuilding(
  buildingApn: string,
  allBuildings: EnhancedBuilding[],
  options: AlertGenerationOptions = {}
): LandlordAlert[] {
  const { maxAgeDays = DEFAULT_MAX_AGE_DAYS } = options
  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000

  // Find current building and its landlord
  const currentBuilding = allBuildings.find(b => b.apn === buildingApn)
  if (!currentBuilding) return []

  const landlordName = currentBuilding.owner
  if (!landlordName) return []

  // Get other buildings with same owner
  const sameOwnerBuildings = getSameOwnerBuildings(buildingApn, allBuildings)
  if (sameOwnerBuildings.length === 0) return []

  // Generate alerts from each source
  const demandAlerts = generateDemandAlerts(sameOwnerBuildings, landlordName, maxAgeMs)
  const strikeAlerts = generateStrikeAlerts(sameOwnerBuildings, landlordName, maxAgeMs)

  // Combine all alerts
  const allAlerts = [...demandAlerts, ...strikeAlerts]

  // Filter out dismissed alerts
  const profile = getCurrentProfile()
  const profileId = profile?.id || 'anonymous'
  const dismissedIds = getDismissedAlerts(profileId)
  const activeAlerts = allAlerts.filter(alert => !dismissedIds.includes(alert.id))

  // Sort by timestamp (newest first)
  activeAlerts.sort((a, b) => b.timestamp - a.timestamp)

  return activeAlerts
}

/**
 * Get count of alerts for a building (for badge display)
 */
export function getLandlordAlertCount(
  buildingApn: string,
  allBuildings: EnhancedBuilding[]
): number {
  return getLandlordAlertsForBuilding(buildingApn, allBuildings).length
}

/**
 * Get urgency level for all alerts (highest urgency wins)
 */
export function getHighestAlertUrgency(
  buildingApn: string,
  allBuildings: EnhancedBuilding[]
): LandlordAlertUrgency | null {
  const alerts = getLandlordAlertsForBuilding(buildingApn, allBuildings)
  if (alerts.length === 0) return null

  if (alerts.some(a => a.urgency === 'urgent')) return 'urgent'
  if (alerts.some(a => a.urgency === 'important')) return 'important'
  return 'info'
}

/**
 * Get the number of buildings in the landlord's portfolio
 */
export function getLandlordPortfolioSize(
  buildingApn: string,
  allBuildings: EnhancedBuilding[]
): number {
  const sameOwner = getSameOwnerBuildings(buildingApn, allBuildings)
  return sameOwner.length + 1 // Include current building
}
