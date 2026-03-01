'use client'

import { getCurrentProfile } from './profileStorage'
import { createLogger } from '../utils/logger'
import { generateShortId } from '../utils/idUtils'

const log = createLogger('Commitment')

// ============================================================================
// Types
// ============================================================================

export type CommitmentType = 'file-complaint' | 'attend-meeting' | 'join-strike'
export type CommitmentStatus = 'gathering' | 'threshold-met' | 'activated' | 'expired'

export interface Commitment {
  id: string                    // commit-{timestamp}-{shortId}
  type: CommitmentType
  buildingId: string            // chatSlug

  threshold: number             // How many needed
  participants: string[]        // Profile IDs who committed

  createdBy: string             // Profile ID
  createdByName: string
  reason?: string               // Optional context

  status: CommitmentStatus
  createdAt: number
  expiresAt: number             // 7 days default
  thresholdMetAt?: number       // When threshold was reached
  activatedAt?: number          // When action was taken

  // For meetings
  meetingDate?: string          // ISO date for attend-meeting
  meetingLocation?: string

  // For strikes
  strikeStartDate?: string      // ISO date for join-strike
}

export interface CommitmentState {
  commitments: Commitment[]
  lastModified: number
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'rstu-commitments'
const COMMITMENT_EXPIRY_DAYS = 7

// Default thresholds for each commitment type
export const DEFAULT_THRESHOLDS: Record<CommitmentType, number> = {
  'file-complaint': 3,
  'attend-meeting': 5,
  'join-strike': 10,
}

// Human-readable labels for commitment types
export const COMMITMENT_LABELS: Record<CommitmentType, { title: string; description: string; icon: string }> = {
  'file-complaint': {
    title: 'File Complaint',
    description: 'File a habitability complaint with code enforcement',
    icon: '📋',
  },
  'attend-meeting': {
    title: 'Attend Meeting',
    description: 'Attend a tenant organizing meeting',
    icon: '🤝',
  },
  'join-strike': {
    title: 'Join Rent Strike',
    description: 'Join a coordinated rent strike',
    icon: '✊',
  },
}

// ============================================================================
// Storage Functions
// ============================================================================

function getState(): CommitmentState {
  if (typeof window === 'undefined') {
    return { commitments: [], lastModified: 0 }
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const state = JSON.parse(stored) as CommitmentState
      // Expire stale commitments on load
      expireStaleCommitments(state)
      return state
    }
  } catch (e) {
    log.error('Failed to parse commitment state:', e)
  }
  return { commitments: [], lastModified: 0 }
}

function saveState(state: CommitmentState): void {
  if (typeof window === 'undefined') return
  state.lastModified = Date.now()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    log.error('Failed to save - storage quota may be exceeded:', e)
  }
}

// ============================================================================
// Expiration Logic
// ============================================================================

function expireStaleCommitments(state: CommitmentState): void {
  const now = Date.now()
  let modified = false

  for (const commitment of state.commitments) {
    if (commitment.status === 'gathering' && commitment.expiresAt < now) {
      commitment.status = 'expired'
      modified = true
      log.info(`Commitment ${commitment.id} expired`)
    }
  }

  if (modified) {
    saveState(state)
  }
}

// ============================================================================
// Threshold Logic
// ============================================================================

function checkAndUpdateStatus(commitment: Commitment): boolean {
  if (commitment.status !== 'gathering') {
    return false
  }

  // Check if threshold is met
  if (commitment.participants.length >= commitment.threshold) {
    commitment.status = 'threshold-met'
    commitment.thresholdMetAt = Date.now()
    log.info(`Commitment ${commitment.id} reached threshold!`)
    return true
  }

  return false
}

// ============================================================================
// Create
// ============================================================================

export interface CreateCommitmentOptions {
  threshold?: number
  reason?: string
  meetingDate?: string
  meetingLocation?: string
  strikeStartDate?: string
}

export function createCommitment(
  type: CommitmentType,
  buildingId: string,
  options: CreateCommitmentOptions = {}
): Commitment | null {
  const profile = getCurrentProfile()
  if (!profile) {
    log.warn('Cannot create commitment: no profile')
    return null
  }

  const state = getState()

  // Check for existing active commitment of same type for this building
  const existing = state.commitments.find(
    c => c.buildingId === buildingId &&
         c.type === type &&
         (c.status === 'gathering' || c.status === 'threshold-met')
  )
  if (existing) {
    log.warn('Active commitment of this type already exists for building')
    return null
  }

  const now = Date.now()
  const commitment: Commitment = {
    id: `commit-${now}-${generateShortId()}`,
    type,
    buildingId,
    threshold: options.threshold ?? DEFAULT_THRESHOLDS[type],
    participants: [profile.id], // Creator auto-joins
    createdBy: profile.id,
    createdByName: profile.nickname || 'Tenant',
    reason: options.reason,
    status: 'gathering',
    createdAt: now,
    expiresAt: now + (COMMITMENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    meetingDate: options.meetingDate,
    meetingLocation: options.meetingLocation,
    strikeStartDate: options.strikeStartDate,
  }

  // Check if threshold already met (e.g., threshold of 1)
  checkAndUpdateStatus(commitment)

  state.commitments.push(commitment)
  saveState(state)

  log.info(`Created commitment ${commitment.id} for ${buildingId}`)
  return commitment
}

// ============================================================================
// Join/Leave
// ============================================================================

export function joinCommitment(commitmentId: string): boolean {
  const profile = getCurrentProfile()
  if (!profile) {
    log.warn('Cannot join commitment: no profile')
    return false
  }

  const state = getState()
  const commitment = state.commitments.find(c => c.id === commitmentId)

  if (!commitment) {
    log.warn('Commitment not found:', commitmentId)
    return false
  }

  if (commitment.status !== 'gathering') {
    log.warn('Cannot join commitment - not in gathering status')
    return false
  }

  if (commitment.participants.includes(profile.id)) {
    log.warn('Already joined this commitment')
    return false
  }

  commitment.participants.push(profile.id)
  checkAndUpdateStatus(commitment)
  saveState(state)

  log.info(`Joined commitment ${commitmentId}`)
  return true
}

export function leaveCommitment(commitmentId: string): boolean {
  const profile = getCurrentProfile()
  if (!profile) {
    log.warn('Cannot leave commitment: no profile')
    return false
  }

  const state = getState()
  const commitment = state.commitments.find(c => c.id === commitmentId)

  if (!commitment) {
    log.warn('Commitment not found:', commitmentId)
    return false
  }

  if (commitment.status !== 'gathering') {
    log.warn('Cannot leave commitment - not in gathering status')
    return false
  }

  const index = commitment.participants.indexOf(profile.id)
  if (index === -1) {
    log.warn('Not a participant in this commitment')
    return false
  }

  // Don't allow creator to leave (they should delete instead)
  if (commitment.createdBy === profile.id) {
    log.warn('Creator cannot leave - use delete instead')
    return false
  }

  commitment.participants.splice(index, 1)
  saveState(state)

  log.info(`Left commitment ${commitmentId}`)
  return true
}

// ============================================================================
// Mark Activated
// ============================================================================

export function markCommitmentActivated(commitmentId: string): boolean {
  const state = getState()
  const commitment = state.commitments.find(c => c.id === commitmentId)

  if (!commitment) {
    log.warn('Commitment not found:', commitmentId)
    return false
  }

  if (commitment.status !== 'threshold-met') {
    log.warn('Cannot activate - threshold not met')
    return false
  }

  commitment.status = 'activated'
  commitment.activatedAt = Date.now()
  saveState(state)

  log.info(`Commitment ${commitmentId} activated`)
  return true
}

// ============================================================================
// Delete (creator only)
// ============================================================================

export function deleteCommitment(commitmentId: string): boolean {
  const profile = getCurrentProfile()
  if (!profile) {
    log.warn('Cannot delete commitment: no profile')
    return false
  }

  const state = getState()
  const index = state.commitments.findIndex(c => c.id === commitmentId)

  if (index === -1) {
    log.warn('Commitment not found:', commitmentId)
    return false
  }

  const commitment = state.commitments[index]

  // Only creator or admin can delete
  if (commitment.createdBy !== profile.id && profile.role !== 'admin') {
    log.warn('Only creator can delete commitment')
    return false
  }

  state.commitments.splice(index, 1)
  saveState(state)

  log.info(`Deleted commitment ${commitmentId}`)
  return true
}

// ============================================================================
// Query Functions
// ============================================================================

export function getActiveCommitments(buildingId: string): Commitment[] {
  const state = getState()
  return state.commitments.filter(
    c => c.buildingId === buildingId &&
         (c.status === 'gathering' || c.status === 'threshold-met')
  ).sort((a, b) => b.createdAt - a.createdAt)
}

export function getAllCommitmentsForBuilding(buildingId: string): Commitment[] {
  const state = getState()
  return state.commitments
    .filter(c => c.buildingId === buildingId)
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function getCommitmentById(commitmentId: string): Commitment | null {
  const state = getState()
  return state.commitments.find(c => c.id === commitmentId) || null
}

export function getMyCommitments(): Commitment[] {
  const profile = getCurrentProfile()
  if (!profile) return []

  const state = getState()
  return state.commitments
    .filter(c => c.participants.includes(profile.id))
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function hasUserCommitted(commitmentId: string): boolean {
  const profile = getCurrentProfile()
  if (!profile) return false

  const commitment = getCommitmentById(commitmentId)
  if (!commitment) return false

  return commitment.participants.includes(profile.id)
}

export function isCreator(commitmentId: string): boolean {
  const profile = getCurrentProfile()
  if (!profile) return false

  const commitment = getCommitmentById(commitmentId)
  if (!commitment) return false

  return commitment.createdBy === profile.id
}

// ============================================================================
// Progress Helpers
// ============================================================================

export function getCommitmentProgress(commitment: Commitment): {
  current: number
  threshold: number
  percent: number
  remaining: number
} {
  const current = commitment.participants.length
  const threshold = commitment.threshold
  const percent = Math.min(Math.round((current / threshold) * 100), 100)
  const remaining = Math.max(threshold - current, 0)

  return { current, threshold, percent, remaining }
}

export function getTimeRemaining(commitment: Commitment): {
  days: number
  hours: number
  expired: boolean
  text: string
} {
  const now = Date.now()
  const remaining = commitment.expiresAt - now

  if (remaining <= 0) {
    return { days: 0, hours: 0, expired: true, text: 'Expired' }
  }

  const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))

  let text: string
  if (days > 0) {
    text = `${days}d ${hours}h left`
  } else if (hours > 0) {
    text = `${hours}h left`
  } else {
    const minutes = Math.floor(remaining / (60 * 1000))
    text = `${minutes}m left`
  }

  return { days, hours, expired: false, text }
}
