'use client'

import { getCurrentProfile } from './profileStorage'
import { getLinkedGroups, updateLinkedGroup, getGroupForApn, createLinkedGroup, generateBlocName } from './linkedPropertiesStorage'
import { supabase, USE_SUPABASE } from './supabase'
import { castVote as serverCastVote, getVoteCounts, checkPermission, requireOnline, OfflineError } from './authService'
import { cacheForOffline, getCached, invalidateCachePattern, CacheKeys } from './offlineCache'
import { sanitizeText, sanitizeRichText } from './sanitize'
import { tryAction } from './rateLimit'
import { getDelegateProfile, canVoteOnAppGovernance, getVotingWeight } from './delegateStorage'

// ============================================================================
// Types
// ============================================================================

export type GovernanceProposalType =
  | 'rename'
  | 'merge'
  | 'alliance'
  | 'add-property'
  | 'remove-property'
  | 'mute-tenant'
  | 'escalate'
  | 'split'
  // Collective action types
  | 'form-bloc'      // Create new bloc from multiple properties
  | 'join-bloc'      // Join an existing bloc
  | 'rent-strike'    // Building/bloc-wide rent strike vote
  | 'demand-letter'  // Formal demand to landlord
  | 'petition'       // Signature collection
  // App-wide governance types
  | 'feature-vote'   // Enable/disable app features
  | 'content-vote'   // Vote on text/content blocks
  | 'direction-vote' // App strategic direction
  | 'admin-recall'   // Vote to remove admin (requires supermajority)
  | 'tab-visibility' // Vote on which tabs are visible

export type GovernanceProposalStatus =
  | 'active'           // Voting in progress
  | 'passed'           // Threshold reached (auto-execute types)
  | 'rejected'         // Negative threshold or expired
  | 'pending-finalize' // Passed but needs organizer action (mute)
  | 'pending-partner'  // Waiting for other group (cross-group)
  | 'executed'         // Action taken

// Weighted vote for app-wide governance (delegate voting)
export interface WeightedVote {
  profileId: string
  weight: number
  votedAt: number
}

export interface GovernanceProposal {
  id: string
  type: GovernanceProposalType
  groupId: string              // Primary group (or chatSlug for non-group chats)
  targetGroupId?: string       // For merge/alliance
  targetApn?: string           // For add/remove property
  targetProfileId?: string     // For mute tenant
  targetValue?: string         // New name, escalation level, split group name, etc.
  targetApns?: string[]        // For split (which APNs go to new group)

  proposedBy: string           // Profile ID
  proposedByName: string
  reason: string

  upvotes: string[]            // Profile IDs (for bloc-level voting)
  downvotes: string[]
  status: GovernanceProposalStatus

  // Weighted voting for app-wide proposals (delegate voting)
  weightedUpvotes?: WeightedVote[]
  weightedDownvotes?: WeightedVote[]

  // Cross-group tracking
  partnerProposalId?: string   // Linked proposal in other group
  partnerGroupPassed?: boolean

  createdAt: number
  expiresAt: number            // 7 days default
  executedAt?: number
  finalizedBy?: string         // For mute votes - organizer who finalized

  // Delivery tracking (for demand-letter type proposals)
  deliveryStatus?: 'draft' | 'sent' | 'delivered' | 'responded' | 'escalated'
  sentDate?: number
  deliveryMethod?: 'email' | 'certified-mail' | 'hand-delivered' | 'posted'
  trackingNumber?: string
  responseReceived?: boolean
  responseDate?: number
  responseNotes?: string
}

export interface GovernanceState {
  proposals: GovernanceProposal[]
  dismissedBanners: string[]   // Proposal IDs user has dismissed
  lastModified: number
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'rstu-governance'
const PROPOSAL_EXPIRY_DAYS = 7

// Vote thresholds for each proposal type
export const VOTE_THRESHOLDS: Record<GovernanceProposalType, number> = {
  'rename': 3,
  'add-property': 3,
  'remove-property': 5,
  'merge': 3,           // Both groups must reach this
  'alliance': 3,        // Both groups must reach this
  'split': 5,
  'mute-tenant': 7,
  'escalate': 5,
  // Collective action thresholds
  'form-bloc': 3,       // Requires 3 votes from each building
  'join-bloc': 3,       // Requires 3 votes from both sides
  'rent-strike': 10,    // High bar for serious action
  'demand-letter': 5,
  'petition': 3,
  // App-wide governance thresholds (uses delegate weight, not raw votes)
  'feature-vote': 15,     // Moderate bar
  'content-vote': 10,     // Lower bar for text changes
  'direction-vote': 20,   // Higher bar for strategic decisions
  'admin-recall': 50,     // Very high bar (also requires 2/3 supermajority)
  'tab-visibility': 15,   // Moderate bar
}

// Special group ID for app-wide proposals
export const APP_GOVERNANCE_GROUP = 'app-governance'

// App-wide proposal types (use delegate weight instead of raw votes)
export const APP_WIDE_TYPES: GovernanceProposalType[] = [
  'feature-vote',
  'content-vote',
  'direction-vote',
  'admin-recall',
  'tab-visibility',
]

// Types that require organizer finalization after passing
export const REQUIRES_FINALIZATION: GovernanceProposalType[] = ['mute-tenant']

// Types that require both groups to pass
export const CROSS_GROUP_TYPES: GovernanceProposalType[] = ['merge', 'alliance', 'join-bloc']

// Types that involve multiple buildings voting (form-bloc broadcasts to all buildings)
export const MULTI_BUILDING_TYPES: GovernanceProposalType[] = ['form-bloc']

// ============================================================================
// Weighted Voting Helpers (for app-wide governance)
// ============================================================================

/**
 * Check if a proposal uses weighted delegate voting
 */
export function isAppWideProposal(proposal: GovernanceProposal): boolean {
  return APP_WIDE_TYPES.includes(proposal.type)
}

/**
 * Calculate the total weighted vote for an app-wide proposal
 * Returns { upvoteWeight, downvoteWeight, netWeight }
 */
export function getWeightedVoteTotals(proposal: GovernanceProposal): {
  upvoteWeight: number
  downvoteWeight: number
  netWeight: number
  voterCount: number
} {
  if (!isAppWideProposal(proposal)) {
    // For non-app-wide proposals, each vote = 1 weight
    return {
      upvoteWeight: proposal.upvotes.length,
      downvoteWeight: proposal.downvotes.length,
      netWeight: proposal.upvotes.length - proposal.downvotes.length,
      voterCount: proposal.upvotes.length + proposal.downvotes.length,
    }
  }

  // Calculate from weighted votes
  const upvoteWeight = (proposal.weightedUpvotes || []).reduce((sum, v) => sum + v.weight, 0)
  const downvoteWeight = (proposal.weightedDownvotes || []).reduce((sum, v) => sum + v.weight, 0)

  return {
    upvoteWeight,
    downvoteWeight,
    netWeight: upvoteWeight - downvoteWeight,
    voterCount: (proposal.weightedUpvotes?.length || 0) + (proposal.weightedDownvotes?.length || 0),
  }
}

/**
 * Check if the current user can vote on an app-wide proposal
 * Returns { canVote, reason, weight }
 */
export function canVoteOnAppWideProposal(profileId: string): {
  canVote: boolean
  reason: string
  weight: number
} {
  const canVote = canVoteOnAppGovernance(profileId)
  const weight = getVotingWeight(profileId)
  const delegateProfile = getDelegateProfile(profileId)

  if (!canVote) {
    if (!delegateProfile) {
      return { canVote: false, reason: 'Profile not found', weight: 0 }
    }
    if (delegateProfile.role === 'admin') {
      return { canVote: false, reason: 'Admins cannot vote (Bookchin principle)', weight: 0 }
    }
    if (delegateProfile.role !== 'organizer') {
      return { canVote: false, reason: 'Only organizers can vote on app governance', weight: 0 }
    }

    const status = delegateProfile.qualificationStatus
    const reasons: string[] = []
    if (!status.meetsTenantsThreshold) {
      reasons.push(`Need ${status.tenantsNeeded} more verified tenants`)
    }
    if (!status.meetsBlocsThreshold) {
      reasons.push(`Need ${status.blocsNeeded} more bloc(s)`)
    }
    if (!status.meetsActivityThreshold) {
      reasons.push(`Need ${status.activityNeeded} more activity points`)
    }
    return {
      canVote: false,
      reason: `Not qualified: ${reasons.join(', ')}`,
      weight: 0,
    }
  }

  return { canVote: true, reason: '', weight }
}

/**
 * Get the current user's weighted vote on an app-wide proposal
 */
export function getWeightedUserVote(proposalId: string): {
  vote: 'up' | 'down' | null
  weight: number
} {
  const profile = getCurrentProfile()
  if (!profile) return { vote: null, weight: 0 }

  const proposal = getProposal(proposalId)
  if (!proposal || !isAppWideProposal(proposal)) {
    // Fall back to regular vote check
    const regularVote = proposal?.upvotes.includes(profile.id)
      ? 'up'
      : proposal?.downvotes.includes(profile.id)
        ? 'down'
        : null
    return { vote: regularVote, weight: regularVote ? 1 : 0 }
  }

  const upvote = proposal.weightedUpvotes?.find(v => v.profileId === profile.id)
  if (upvote) return { vote: 'up', weight: upvote.weight }

  const downvote = proposal.weightedDownvotes?.find(v => v.profileId === profile.id)
  if (downvote) return { vote: 'down', weight: downvote.weight }

  return { vote: null, weight: 0 }
}

// ============================================================================
// Generate a cryptographically secure short ID
function generateShortId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().split('-')[0]
  }
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(4)
    crypto.getRandomValues(bytes)
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  }
  throw new Error('Crypto API not available')
}

// Storage Functions
// ============================================================================

function getState(): GovernanceState {
  if (typeof window === 'undefined') {
    return { proposals: [], dismissedBanners: [], lastModified: 0 }
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to parse governance state:', e)
  }
  return { proposals: [], dismissedBanners: [], lastModified: 0 }
}

function saveState(state: GovernanceState): void {
  if (typeof window === 'undefined') return
  state.lastModified = Date.now()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('[GovernanceStorage] Failed to save - storage quota may be exceeded:', e)
  }
}

// ============================================================================
// Proposal CRUD
// ============================================================================

export function createProposal(
  type: GovernanceProposalType,
  groupId: string,
  options: {
    targetGroupId?: string
    targetApn?: string
    targetProfileId?: string
    targetValue?: string
    targetApns?: string[]
    reason?: string
  } = {}
): GovernanceProposal | null {
  const profile = getCurrentProfile()
  if (!profile) return null

  // Check rate limit
  const rateLimitResult = tryAction('proposal_create', profile.id)
  if (!rateLimitResult.allowed) {
    console.warn('[Governance] Rate limited:', rateLimitResult.error)
    return null
  }

  const state = getState()

  // Check for duplicate active proposals of same type on same group
  const duplicate = state.proposals.find(
    p => p.type === type &&
         p.groupId === groupId &&
         p.status === 'active' &&
         p.targetValue === options.targetValue
  )
  if (duplicate) return null

  const now = Date.now()
  const proposal: GovernanceProposal = {
    id: `gov-${now}-${generateShortId()}`,
    type,
    groupId,
    targetGroupId: options.targetGroupId,
    targetApn: options.targetApn,
    targetProfileId: options.targetProfileId,
    targetValue: sanitizeText(options.targetValue),
    targetApns: options.targetApns,
    proposedBy: profile.id,
    proposedByName: sanitizeText(profile.nickname),
    reason: sanitizeRichText(options.reason || ''),
    upvotes: [profile.id], // Proposer auto-upvotes
    downvotes: [],
    status: 'active',
    createdAt: now,
    expiresAt: now + PROPOSAL_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  }

  state.proposals.push(proposal)
  saveState(state)

  return proposal
}

/**
 * Create an app-wide governance proposal (delegate voting)
 * Only qualified delegates can create these proposals
 */
export function createAppWideProposal(
  type: 'feature-vote' | 'content-vote' | 'direction-vote' | 'admin-recall' | 'tab-visibility',
  options: {
    targetValue?: string      // Feature name, content ID, direction option, admin ID, or tab name
    reason: string
  }
): GovernanceProposal | null {
  const profile = getCurrentProfile()
  if (!profile) return null

  // Check if proposer is a qualified delegate
  const eligibility = canVoteOnAppWideProposal(profile.id)
  if (!eligibility.canVote) {
    console.warn(`[Governance] App proposal rejected: ${eligibility.reason}`)
    return null
  }

  // Check rate limit
  const rateLimitResult = tryAction('proposal_create', profile.id)
  if (!rateLimitResult.allowed) {
    console.warn('[Governance] Rate limited:', rateLimitResult.error)
    return null
  }

  const state = getState()

  // Check for duplicate active proposals of same type
  const duplicate = state.proposals.find(
    p => p.type === type &&
         p.groupId === APP_GOVERNANCE_GROUP &&
         p.status === 'active' &&
         p.targetValue === options.targetValue
  )
  if (duplicate) {
    console.warn('[Governance] Duplicate app proposal already exists')
    return null
  }

  const now = Date.now()
  const proposal: GovernanceProposal = {
    id: `app-gov-${now}-${generateShortId()}`,
    type,
    groupId: APP_GOVERNANCE_GROUP,
    targetValue: sanitizeText(options.targetValue),
    proposedBy: profile.id,
    proposedByName: sanitizeText(profile.nickname),
    reason: sanitizeRichText(options.reason),
    upvotes: [profile.id],
    downvotes: [],
    status: 'active',
    createdAt: now,
    expiresAt: now + PROPOSAL_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    // Initialize weighted votes with proposer's vote
    weightedUpvotes: [{
      profileId: profile.id,
      weight: eligibility.weight,
      votedAt: now,
    }],
    weightedDownvotes: [],
  }

  state.proposals.push(proposal)
  saveState(state)

  return proposal
}

/**
 * Get all active app-wide governance proposals
 */
export function getAppWideProposals(): GovernanceProposal[] {
  const state = getState()
  const now = Date.now()

  return state.proposals.filter(p => {
    // Check expiration
    if (p.expiresAt < now && p.status === 'active') {
      p.status = 'rejected'
    }
    return p.groupId === APP_GOVERNANCE_GROUP &&
           ['active', 'pending-finalize'].includes(p.status)
  }).sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * Get app-wide proposal history (passed/rejected)
 */
export function getAppWideProposalHistory(limit = 20): GovernanceProposal[] {
  const state = getState()
  return state.proposals
    .filter(p => p.groupId === APP_GOVERNANCE_GROUP &&
                 ['passed', 'rejected', 'executed'].includes(p.status))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit)
}

export function getProposal(proposalId: string): GovernanceProposal | undefined {
  const state = getState()
  return state.proposals.find(p => p.id === proposalId)
}

export function getActiveProposals(groupId: string): GovernanceProposal[] {
  const state = getState()
  const now = Date.now()

  return state.proposals.filter(p => {
    // Check expiration
    if (p.expiresAt < now && p.status === 'active') {
      p.status = 'rejected' // Auto-reject expired
    }
    return p.groupId === groupId && ['active', 'pending-finalize', 'pending-partner'].includes(p.status)
  })
}

export function getProposalHistory(groupId: string, limit = 10): GovernanceProposal[] {
  const state = getState()
  return state.proposals
    .filter(p => p.groupId === groupId && ['passed', 'rejected', 'executed'].includes(p.status))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit)
}

export function getGroupProposals(groupId: string): GovernanceProposal[] {
  const state = getState()
  return state.proposals
    .filter(p => p.groupId === groupId)
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function getIncomingCrossGroupRequests(groupId: string): GovernanceProposal[] {
  const state = getState()
  return state.proposals.filter(
    p => p.targetGroupId === groupId &&
         CROSS_GROUP_TYPES.includes(p.type) &&
         p.status === 'active'
  )
}

// ============================================================================
// Voting
// ============================================================================

export function voteOnProposal(
  proposalId: string,
  vote: 'up' | 'down'
): GovernanceProposal | null {
  const profile = getCurrentProfile()
  if (!profile) return null

  // Admins cannot vote (Bookchin principle)
  if (profile.role === 'admin') return null

  const state = getState()
  const proposal = state.proposals.find(p => p.id === proposalId)
  if (!proposal || proposal.status !== 'active') return null

  // Handle app-wide proposals with weighted voting
  if (isAppWideProposal(proposal)) {
    const voteEligibility = canVoteOnAppWideProposal(profile.id)
    if (!voteEligibility.canVote) {
      console.warn(`[Governance] Vote rejected: ${voteEligibility.reason}`)
      return null
    }

    // Initialize weighted vote arrays if needed
    if (!proposal.weightedUpvotes) proposal.weightedUpvotes = []
    if (!proposal.weightedDownvotes) proposal.weightedDownvotes = []

    const now = Date.now()
    const weightedVote: WeightedVote = {
      profileId: profile.id,
      weight: voteEligibility.weight,
      votedAt: now,
    }

    // Remove from opposite weighted vote array
    if (vote === 'up') {
      proposal.weightedDownvotes = proposal.weightedDownvotes.filter(v => v.profileId !== profile.id)
      if (!proposal.weightedUpvotes.some(v => v.profileId === profile.id)) {
        proposal.weightedUpvotes.push(weightedVote)
      } else {
        // Update weight if already voted (weight may have changed)
        const existing = proposal.weightedUpvotes.find(v => v.profileId === profile.id)
        if (existing) {
          existing.weight = voteEligibility.weight
          existing.votedAt = now
        }
      }
    } else {
      proposal.weightedUpvotes = proposal.weightedUpvotes.filter(v => v.profileId !== profile.id)
      if (!proposal.weightedDownvotes.some(v => v.profileId === profile.id)) {
        proposal.weightedDownvotes.push(weightedVote)
      } else {
        const existing = proposal.weightedDownvotes.find(v => v.profileId === profile.id)
        if (existing) {
          existing.weight = voteEligibility.weight
          existing.votedAt = now
        }
      }
    }

    // Also update regular vote arrays for backward compatibility
    if (vote === 'up') {
      proposal.downvotes = proposal.downvotes.filter(id => id !== profile.id)
      if (!proposal.upvotes.includes(profile.id)) {
        proposal.upvotes.push(profile.id)
      }
    } else {
      proposal.upvotes = proposal.upvotes.filter(id => id !== profile.id)
      if (!proposal.downvotes.includes(profile.id)) {
        proposal.downvotes.push(profile.id)
      }
    }
  } else {
    // Regular bloc-level voting (1 person = 1 vote)
    if (vote === 'up') {
      proposal.downvotes = proposal.downvotes.filter(id => id !== profile.id)
      if (!proposal.upvotes.includes(profile.id)) {
        proposal.upvotes.push(profile.id)
      }
    } else {
      proposal.upvotes = proposal.upvotes.filter(id => id !== profile.id)
      if (!proposal.downvotes.includes(profile.id)) {
        proposal.downvotes.push(profile.id)
      }
    }
  }

  // Check thresholds
  checkAndUpdateProposalStatus(proposal)

  saveState(state)
  return proposal
}

export function getUserVote(proposalId: string): 'up' | 'down' | null {
  const profile = getCurrentProfile()
  if (!profile) return null

  const proposal = getProposal(proposalId)
  if (!proposal) return null

  if (proposal.upvotes.includes(profile.id)) return 'up'
  if (proposal.downvotes.includes(profile.id)) return 'down'
  return null
}

// ============================================================================
// Server-Authoritative Voting (prevents localStorage manipulation)
// ============================================================================

/**
 * Vote on a proposal through the server (prevents localStorage manipulation)
 * This is the secure version that should be used in production
 */
export async function voteOnProposalAsync(
  proposalId: string,
  vote: 'up' | 'down'
): Promise<{ success: boolean; error?: string; proposal?: GovernanceProposal }> {
  const profile = getCurrentProfile()
  if (!profile) {
    return { success: false, error: 'Not logged in' }
  }

  // Check permission server-side
  const permission = await checkPermission('vote:proposal')
  if (!permission.allowed) {
    return { success: false, error: permission.reason }
  }

  // If Supabase is available, use server-side voting
  if (USE_SUPABASE && supabase) {
    try {
      requireOnline('vote on proposals')

      // Cast vote through server RPC
      const result = await serverCastVote('proposal', proposalId, vote)
      if (!result.success) {
        return { success: false, error: result.error }
      }

      // Update local cache with new vote counts
      const voteCounts = await getVoteCounts('proposal', proposalId)

      // Update local state for immediate UI feedback
      const state = getState()
      const proposal = state.proposals.find(p => p.id === proposalId)
      if (proposal) {
        // Rebuild vote arrays based on server count
        // (We don't have full voter list from server, so we update local estimate)
        if (vote === 'up') {
          proposal.downvotes = proposal.downvotes.filter(id => id !== profile.id)
          if (!proposal.upvotes.includes(profile.id)) {
            proposal.upvotes.push(profile.id)
          }
        } else {
          proposal.upvotes = proposal.upvotes.filter(id => id !== profile.id)
          if (!proposal.downvotes.includes(profile.id)) {
            proposal.downvotes.push(profile.id)
          }
        }
        saveState(state)

        // Invalidate cache so next fetch gets fresh data
        invalidateCachePattern('proposals:*')

        return { success: true, proposal }
      }

      return { success: true }
    } catch (e) {
      if (e instanceof OfflineError) {
        return { success: false, error: e.message }
      }
      console.error('[GovernanceStorage] Server vote error:', e)
      return { success: false, error: 'Failed to cast vote' }
    }
  }

  // Fallback to localStorage (development/offline only)
  const proposal = voteOnProposal(proposalId, vote)
  if (!proposal) {
    return { success: false, error: 'Failed to vote' }
  }
  return { success: true, proposal }
}

/**
 * Get vote counts from server (for accurate display)
 */
export async function getProposalVoteCountsAsync(proposalId: string): Promise<{
  upvotes: number
  downvotes: number
  userVote?: 'up' | 'down'
}> {
  if (USE_SUPABASE && supabase) {
    try {
      return await getVoteCounts('proposal', proposalId)
    } catch {
      // Fall back to local
    }
  }

  // Fallback to localStorage
  const proposal = getProposal(proposalId)
  if (!proposal) {
    return { upvotes: 0, downvotes: 0 }
  }

  return {
    upvotes: proposal.upvotes.length,
    downvotes: proposal.downvotes.length,
    userVote: getUserVote(proposalId) || undefined,
  }
}

/**
 * Create proposal with server-side validation (C4 fix)
 * Uses secure RPC function to prevent client-side authorization bypass
 */
export async function createProposalAsync(
  type: GovernanceProposalType,
  groupId: string,
  options: {
    targetGroupId?: string
    targetApn?: string
    targetProfileId?: string
    targetValue?: string
    targetApns?: string[]
    reason?: string
    buildingId?: string
    buildingAddress?: string
  } = {}
): Promise<{ success: boolean; error?: string; proposal?: GovernanceProposal }> {
  const profile = getCurrentProfile()
  if (!profile) {
    return { success: false, error: 'Not logged in' }
  }

  // Check rate limit first
  const rateLimitResult = tryAction('proposal_create', profile.id)
  if (!rateLimitResult.allowed) {
    return { success: false, error: rateLimitResult.error || 'Rate limited' }
  }

  // If online and Supabase available, use server-side validation
  if (USE_SUPABASE && supabase) {
    try {
      requireOnline('create proposals')

      // Use secure RPC for server-side validation
      const { data, error } = await supabase.rpc('create_proposal_secure', {
        p_creator_id: profile.id,
        p_building_id: options.buildingId || groupId,
        p_building_address: sanitizeText(options.buildingAddress || ''),
        p_title: sanitizeText(options.targetValue || type),
        p_description: sanitizeRichText(options.reason || ''),
        p_proposal_type: type,
        p_group_id: groupId || null
      })

      if (error) {
        console.error('[GovernanceStorage] Server error creating proposal:', error)
        return { success: false, error: error.message }
      }

      if (data && !data.success) {
        return { success: false, error: data.error }
      }

      // Create local cache copy with server-assigned ID
      const now = Date.now()
      const proposal: GovernanceProposal = {
        id: data.proposal_id || `gov-${now}-${generateShortId()}`,
        type,
        groupId,
        targetGroupId: options.targetGroupId,
        targetApn: options.targetApn,
        targetProfileId: options.targetProfileId,
        targetValue: sanitizeText(options.targetValue),
        targetApns: options.targetApns,
        proposedBy: profile.id,
        proposedByName: sanitizeText(profile.nickname),
        reason: sanitizeRichText(options.reason || ''),
        upvotes: [profile.id],
        downvotes: [],
        status: 'active',
        createdAt: now,
        expiresAt: now + PROPOSAL_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
      }

      // Cache locally
      const state = getState()
      state.proposals.push(proposal)
      saveState(state)

      // Invalidate cache
      invalidateCachePattern('proposals:*')

      return { success: true, proposal }
    } catch (e) {
      if (e instanceof OfflineError) {
        // Fall through to offline handling
        console.warn('[GovernanceStorage] Offline - cannot create proposal without server validation')
        return { success: false, error: 'Cannot create proposals while offline' }
      }
      console.error('[GovernanceStorage] Failed to create proposal:', e)
      return { success: false, error: 'Failed to create proposal' }
    }
  }

  // No Supabase - check permission locally and create
  // SECURITY WARNING: This path has no server-side validation
  const permission = await checkPermission('create:proposal')
  if (!permission.allowed) {
    return { success: false, error: permission.reason }
  }

  const proposal = createProposal(type, groupId, options)
  if (!proposal) {
    return { success: false, error: 'Failed to create proposal (may be duplicate)' }
  }

  return { success: true, proposal }
}

/**
 * Fetch proposals from server with caching
 */
export async function getActiveProposalsAsync(groupId: string): Promise<GovernanceProposal[]> {
  // Check cache first
  const cached = getCached<GovernanceProposal[]>(CacheKeys.proposals(groupId))
  if (cached) {
    return cached
  }

  if (USE_SUPABASE && supabase) {
    try {
      const { data, error } = await supabase
        .from('governance_proposals')
        .select('*')
        .eq('group_id', groupId)
        .in('status', ['active', 'pending-finalize', 'pending-partner'])
        .order('created_at', { ascending: false })

      if (!error && data) {
        // Convert from DB format
        const proposals = data.map(dbToProposal)

        // Cache for offline use
        cacheForOffline(CacheKeys.proposals(groupId), proposals, 10 * 60 * 1000)

        return proposals
      }
    } catch {
      // Fall through to localStorage
    }
  }

  // Fallback to localStorage
  return getActiveProposals(groupId)
}

/**
 * Convert database proposal to app format
 */
function dbToProposal(db: {
  id: string
  type: string
  group_id: string
  target_group_id?: string | null
  target_apn?: string | null
  target_profile_id?: string | null
  target_value?: string | null
  target_apns?: string[] | null
  proposed_by: string
  proposed_by_name: string
  reason?: string | null
  upvotes: string[]
  downvotes: string[]
  status: string
  partner_proposal_id?: string | null
  partner_group_passed?: boolean | null
  created_at: string
  expires_at: string
  executed_at?: string | null
  finalized_by?: string | null
}): GovernanceProposal {
  return {
    id: db.id,
    type: db.type as GovernanceProposalType,
    groupId: db.group_id,
    targetGroupId: db.target_group_id || undefined,
    targetApn: db.target_apn || undefined,
    targetProfileId: db.target_profile_id || undefined,
    targetValue: db.target_value || undefined,
    targetApns: db.target_apns || undefined,
    proposedBy: db.proposed_by,
    proposedByName: db.proposed_by_name,
    reason: db.reason || '',
    upvotes: db.upvotes || [],
    downvotes: db.downvotes || [],
    status: db.status as GovernanceProposalStatus,
    partnerProposalId: db.partner_proposal_id || undefined,
    partnerGroupPassed: db.partner_group_passed ?? undefined,
    createdAt: new Date(db.created_at).getTime(),
    expiresAt: new Date(db.expires_at).getTime(),
    executedAt: db.executed_at ? new Date(db.executed_at).getTime() : undefined,
    finalizedBy: db.finalized_by || undefined,
  }
}

// ============================================================================
// Threshold Checking & Execution
// ============================================================================

function checkAndUpdateProposalStatus(proposal: GovernanceProposal): void {
  const threshold = VOTE_THRESHOLDS[proposal.type]

  // Handle app-wide proposals with weighted voting
  if (isAppWideProposal(proposal)) {
    const { netWeight, upvoteWeight, downvoteWeight, voterCount } = getWeightedVoteTotals(proposal)

    // Check for rejection (significant negative weight or too few supporters)
    if (netWeight <= -10) {
      proposal.status = 'rejected'
      return
    }

    // Admin recall requires special handling: 2/3 supermajority of total delegate weight
    if (proposal.type === 'admin-recall') {
      // Import getAdminRecallThreshold dynamically to avoid circular deps
      const { getAdminRecallThreshold } = require('./delegateStorage')
      const recallThreshold = getAdminRecallThreshold()

      // Need both: enough weight AND at least 3 voters AND supermajority
      const totalVoteWeight = upvoteWeight + downvoteWeight
      const supermajority = totalVoteWeight > 0 && (upvoteWeight / totalVoteWeight) >= 0.6667

      if (upvoteWeight >= recallThreshold.requiredWeight && voterCount >= 3 && supermajority) {
        proposal.status = 'passed'
        executeProposal(proposal)
      }
      return
    }

    // Standard app-wide threshold check (weighted)
    if (netWeight >= threshold) {
      proposal.status = 'passed'
      executeProposal(proposal)
    }
    return
  }

  // Regular bloc-level voting (1 person = 1 vote)
  const netVotes = proposal.upvotes.length - proposal.downvotes.length

  // Check for rejection (negative threshold)
  if (netVotes <= -3) {
    proposal.status = 'rejected'
    return
  }

  // Check for passing
  if (netVotes >= threshold) {
    if (CROSS_GROUP_TYPES.includes(proposal.type)) {
      // Cross-group: check if partner has also passed
      if (proposal.partnerGroupPassed) {
        proposal.status = 'passed'
        executeProposal(proposal)
      } else {
        proposal.status = 'pending-partner'
        // Update partner proposal with our status
        updatePartnerProposal(proposal)
      }
    } else if (REQUIRES_FINALIZATION.includes(proposal.type)) {
      proposal.status = 'pending-finalize'
    } else {
      proposal.status = 'passed'
      executeProposal(proposal)
    }
  }
}

function updatePartnerProposal(proposal: GovernanceProposal): void {
  if (!proposal.partnerProposalId) return

  const state = getState()
  const partner = state.proposals.find(p => p.id === proposal.partnerProposalId)
  if (partner) {
    partner.partnerGroupPassed = true
    // Check if partner was already waiting
    if (partner.status === 'pending-partner') {
      partner.status = 'passed'
      proposal.status = 'passed'
      executeProposal(partner)
    }
  }
  saveState(state)
}

function executeProposal(proposal: GovernanceProposal): void {
  proposal.executedAt = Date.now()
  proposal.status = 'executed'

  switch (proposal.type) {
    case 'rename':
      executeRename(proposal)
      break
    case 'add-property':
      executeAddProperty(proposal)
      break
    case 'remove-property':
      executeRemoveProperty(proposal)
      break
    case 'merge':
      executeMerge(proposal)
      break
    case 'alliance':
      executeAlliance(proposal)
      break
    case 'split':
      executeSplit(proposal)
      break
    case 'form-bloc':
      executeBlocFormation(proposal)
      break
    case 'escalate':
      // Escalation handled by buildingOrganizingStorage
      break
    // mute-tenant handled separately via finalizeProposal
  }
}

// ============================================================================
// Execution Functions
// ============================================================================

function executeRename(proposal: GovernanceProposal): void {
  if (!proposal.targetValue) return
  updateLinkedGroup(proposal.groupId, { name: proposal.targetValue })
}

function executeAddProperty(proposal: GovernanceProposal): void {
  if (!proposal.targetApn) return
  const groups = getLinkedGroups()
  const group = groups.find(g => g.id === proposal.groupId)
  if (group && !group.apns.includes(proposal.targetApn)) {
    updateLinkedGroup(proposal.groupId, {
      apns: [...group.apns, proposal.targetApn]
    })
  }
}

function executeRemoveProperty(proposal: GovernanceProposal): void {
  if (!proposal.targetApn) return
  const groups = getLinkedGroups()
  const group = groups.find(g => g.id === proposal.groupId)
  if (group) {
    const newApns = group.apns.filter(apn => apn !== proposal.targetApn)
    if (newApns.length > 0) {
      updateLinkedGroup(proposal.groupId, { apns: newApns })
    }
    // Note: If only 1 APN left, group still exists (orphan handling is separate)
  }
}

function executeMerge(proposal: GovernanceProposal): void {
  if (!proposal.targetGroupId) return
  const groups = getLinkedGroups()
  const sourceGroup = groups.find(g => g.id === proposal.groupId)
  const targetGroup = groups.find(g => g.id === proposal.targetGroupId)

  if (sourceGroup && targetGroup) {
    // Merge target APNs into source group
    const mergedApns = Array.from(new Set([...sourceGroup.apns, ...targetGroup.apns]))
    updateLinkedGroup(proposal.groupId, {
      apns: mergedApns,
      name: `${sourceGroup.name} + ${targetGroup.name}`
    })
    // Delete target group (would need deleteLinkedGroup)
    // For now, mark it empty
    updateLinkedGroup(proposal.targetGroupId, { apns: [] })
  }
}

function executeAlliance(proposal: GovernanceProposal): void {
  if (!proposal.targetGroupId) return
  const groups = getLinkedGroups()
  const group1 = groups.find(g => g.id === proposal.groupId)
  const group2 = groups.find(g => g.id === proposal.targetGroupId)

  if (group1 && group2) {
    // Add each other to alliances array
    const alliances1 = group1.alliances || []
    const alliances2 = group2.alliances || []

    if (!alliances1.includes(proposal.targetGroupId)) {
      updateLinkedGroup(proposal.groupId, {
        alliances: [...alliances1, proposal.targetGroupId]
      })
    }
    if (!alliances2.includes(proposal.groupId)) {
      updateLinkedGroup(proposal.targetGroupId, {
        alliances: [...alliances2, proposal.groupId]
      })
    }
  }
}

function executeSplit(_proposal: GovernanceProposal): void {
  // Split creates a new group with specified APNs
  // This is complex - leaving as placeholder for Phase 6
}

function executeBlocFormation(proposal: GovernanceProposal): void {
  if (!proposal.targetApns || proposal.targetApns.length < 2) return

  // Create the linked group with all APNs
  const groupName = proposal.targetValue || generateBlocName(proposal.targetApns)
  createLinkedGroup(
    proposal.targetApns,
    groupName,
    proposal.proposedBy,
    proposal.reason
  )

  // Mark all related proposals as executed
  const state = getState()
  const targetApnsString = proposal.targetApns.sort().join(',')
  state.proposals
    .filter(p =>
      p.type === 'form-bloc' &&
      p.targetApns?.sort().join(',') === targetApnsString
    )
    .forEach(p => {
      p.status = 'executed'
      p.executedAt = Date.now()
    })

  saveState(state)
}

// ============================================================================
// Finalization (for mute-tenant)
// ============================================================================

export function finalizeProposal(proposalId: string): boolean {
  const profile = getCurrentProfile()
  if (!profile) return false

  // Only organizers/admins can finalize
  if (profile.role !== 'organizer' && profile.role !== 'admin') return false

  const state = getState()
  const proposal = state.proposals.find(p => p.id === proposalId)
  if (!proposal || proposal.status !== 'pending-finalize') return false

  proposal.finalizedBy = profile.id
  proposal.executedAt = Date.now()
  proposal.status = 'executed'

  // Execute the mute
  if (proposal.type === 'mute-tenant' && proposal.targetProfileId) {
    const groups = getLinkedGroups()
    const group = groups.find(g => g.id === proposal.groupId)
    if (group) {
      const mutedProfiles = group.mutedProfiles || []
      if (!mutedProfiles.includes(proposal.targetProfileId)) {
        updateLinkedGroup(proposal.groupId, {
          mutedProfiles: [...mutedProfiles, proposal.targetProfileId]
        })
      }
    }
  }

  saveState(state)
  return true
}

// ============================================================================
// Banner Dismissal
// ============================================================================

export function dismissBanner(proposalId: string): void {
  const state = getState()
  if (!state.dismissedBanners.includes(proposalId)) {
    state.dismissedBanners.push(proposalId)
    saveState(state)
  }
}

export function isBannerDismissed(proposalId: string): boolean {
  const state = getState()
  return state.dismissedBanners.includes(proposalId)
}

// ============================================================================
// Message Format Helpers
// ============================================================================

export function formatProposalMessage(proposal: GovernanceProposal): string {
  const parts = [`[GOV:${proposal.type}:${proposal.groupId}`]

  switch (proposal.type) {
    case 'rename':
      parts.push(`:${proposal.targetValue}]`)
      break
    case 'merge':
    case 'alliance':
      parts.push(`:${proposal.targetGroupId}]`)
      break
    case 'add-property':
    case 'remove-property':
      parts.push(`:${proposal.targetApn}]`)
      break
    case 'mute-tenant':
      parts.push(`:${proposal.targetProfileId}]`)
      break
    case 'escalate':
      parts.push(`:${proposal.targetValue}]`)
      break
    case 'split':
      parts.push(`:${proposal.targetValue}:${proposal.targetApns?.join(',')}]`)
      break
    default:
      parts.push(']')
  }

  if (proposal.reason) {
    parts.push(` ${proposal.reason}`)
  }

  return parts.join('')
}

export function parseProposalMessage(text: string): Partial<GovernanceProposal> | null {
  // Match [GOV:type:groupId:...] reason
  const match = text.match(/^\[GOV:([^:]+):([^\]:]+)(?::([^\]]+))?\](.*)$/)
  if (!match) return null

  const [, type, groupId, rest, reason] = match

  const proposal: Partial<GovernanceProposal> = {
    type: type as GovernanceProposalType,
    groupId,
    reason: reason?.trim() || '',
  }

  // Parse rest based on type
  if (rest) {
    switch (type) {
      case 'rename':
        proposal.targetValue = rest
        break
      case 'merge':
      case 'alliance':
        proposal.targetGroupId = rest
        break
      case 'add-property':
      case 'remove-property':
        proposal.targetApn = rest
        break
      case 'mute-tenant':
        proposal.targetProfileId = rest
        break
      case 'escalate':
        proposal.targetValue = rest
        break
      case 'split':
        const [name, apns] = rest.split(':')
        proposal.targetValue = name
        proposal.targetApns = apns?.split(',')
        break
    }
  }

  return proposal
}

// ============================================================================
// Vote Message Helpers
// ============================================================================

export function formatVoteMessage(proposalId: string, vote: 'up' | 'down'): string {
  return `[GOV-VOTE:${vote}:${proposalId}]`
}

export function parseVoteMessage(text: string): { proposalId: string; vote: 'up' | 'down' } | null {
  const match = text.match(/^\[GOV-VOTE:(up|down):(.+)\]$/)
  if (match) {
    return { vote: match[1] as 'up' | 'down', proposalId: match[2] }
  }
  return null
}

// ============================================================================
// Authorization
// ============================================================================

export function canVoteOnGovernance(groupId: string): boolean {
  const profile = getCurrentProfile()
  if (!profile) return false

  // Admins cannot vote (Bookchin principle)
  if (profile.role === 'admin') return false

  // Check if user belongs to this group's building(s)
  const group = getLinkedGroups().find(g => g.id === groupId)
  if (group) {
    // If user's building is in this group
    if (profile.buildingId) {
      const userGroup = getGroupForApn(profile.buildingId)
      if (userGroup && userGroup.id === groupId) return true
    }
  }

  // For non-grouped buildings, check direct match
  if (profile.buildingId === groupId) return true

  // Organizers assigned to the building
  if (profile.role === 'organizer' && profile.assignedBuildings?.includes(groupId)) {
    return true
  }

  return false
}

export function canFinalizeProposal(): boolean {
  const profile = getCurrentProfile()
  return profile?.role === 'organizer' || profile?.role === 'admin'
}

export function getProposalTypeLabel(type: GovernanceProposalType): string {
  const labels: Record<GovernanceProposalType, string> = {
    'rename': 'Rename Bloc',
    'merge': 'Merge Blocs',
    'alliance': 'Create Alliance',
    'add-property': 'Add Property',
    'remove-property': 'Remove Property',
    'mute-tenant': 'Mute Member',
    'escalate': 'Escalate Demand',
    'split': 'Split Bloc',
    'form-bloc': 'Form New Bloc',
    'join-bloc': 'Join Bloc',
    'rent-strike': 'Rent Strike Vote',
    'demand-letter': 'Demand Letter',
    'petition': 'Petition',
    // App-wide governance types
    'feature-vote': 'Feature Vote',
    'content-vote': 'Content Vote',
    'direction-vote': 'Direction Vote',
    'admin-recall': 'Admin Recall',
    'tab-visibility': 'Tab Visibility Vote',
  }
  return labels[type] || type
}

// ============================================================================
// Storage Cleanup (prevents quota exceeded errors)
// ============================================================================

const MAX_COMPLETED_PROPOSALS = 50

export function cleanupOldProposals(): void {
  if (typeof window === 'undefined') return

  const state = getState()

  // Separate active and completed proposals
  const activeProposals = state.proposals.filter(p =>
    ['active', 'pending-finalize', 'pending-partner'].includes(p.status)
  )
  const completedProposals = state.proposals.filter(p =>
    ['passed', 'rejected', 'executed'].includes(p.status)
  )

  // Sort completed by date (newest first) and keep only the most recent
  const recentCompleted = completedProposals
    .sort((a, b) => (b.executedAt || b.createdAt) - (a.executedAt || a.createdAt))
    .slice(0, MAX_COMPLETED_PROPOSALS)

  // Get IDs of proposals we're keeping
  const keptIds = new Set([
    ...activeProposals.map(p => p.id),
    ...recentCompleted.map(p => p.id)
  ])

  // Clean up dismissed banners for proposals that no longer exist
  const validDismissedBanners = state.dismissedBanners.filter(id => keptIds.has(id))

  // Only save if we actually removed something
  const removedCount = state.proposals.length - (activeProposals.length + recentCompleted.length)
  const removedBanners = state.dismissedBanners.length - validDismissedBanners.length

  if (removedCount > 0 || removedBanners > 0) {
    state.proposals = [...activeProposals, ...recentCompleted]
    state.dismissedBanners = validDismissedBanners
    saveState(state)
  }
}

// Run cleanup on module load (client-side only)
if (typeof window !== 'undefined') {
  // Delay cleanup to avoid blocking initial render
  setTimeout(cleanupOldProposals, 2000)
}
