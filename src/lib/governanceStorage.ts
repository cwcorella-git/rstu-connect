'use client'

import { getCurrentProfile } from './profileStorage'
import { getLinkedGroups, updateLinkedGroup, getGroupForApn } from './linkedPropertiesStorage'

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

export type GovernanceProposalStatus =
  | 'active'           // Voting in progress
  | 'passed'           // Threshold reached (auto-execute types)
  | 'rejected'         // Negative threshold or expired
  | 'pending-finalize' // Passed but needs organizer action (mute)
  | 'pending-partner'  // Waiting for other group (cross-group)
  | 'executed'         // Action taken

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

  upvotes: string[]            // Profile IDs
  downvotes: string[]
  status: GovernanceProposalStatus

  // Cross-group tracking
  partnerProposalId?: string   // Linked proposal in other group
  partnerGroupPassed?: boolean

  createdAt: number
  expiresAt: number            // 7 days default
  executedAt?: number
  finalizedBy?: string         // For mute votes - organizer who finalized
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
}

// Types that require organizer finalization after passing
export const REQUIRES_FINALIZATION: GovernanceProposalType[] = ['mute-tenant']

// Types that require both groups to pass
export const CROSS_GROUP_TYPES: GovernanceProposalType[] = ['merge', 'alliance']

// ============================================================================
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
    id: `gov-${now}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    groupId,
    targetGroupId: options.targetGroupId,
    targetApn: options.targetApn,
    targetProfileId: options.targetProfileId,
    targetValue: options.targetValue,
    targetApns: options.targetApns,
    proposedBy: profile.id,
    proposedByName: profile.nickname,
    reason: options.reason || '',
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

  // Remove from opposite vote array
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
// Threshold Checking & Execution
// ============================================================================

function checkAndUpdateProposalStatus(proposal: GovernanceProposal): void {
  const netVotes = proposal.upvotes.length - proposal.downvotes.length
  const threshold = VOTE_THRESHOLDS[proposal.type]

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

function executeSplit(proposal: GovernanceProposal): void {
  // Split creates a new group with specified APNs
  // This is complex - leaving as placeholder for Phase 6
  console.log('Split execution not yet implemented:', proposal)
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
    'rename': 'Rename Group',
    'merge': 'Merge Groups',
    'alliance': 'Create Alliance',
    'add-property': 'Add Property',
    'remove-property': 'Remove Property',
    'mute-tenant': 'Mute Member',
    'escalate': 'Escalate Demand',
    'split': 'Split Group',
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
    console.log(`[Governance] Cleaned up ${removedCount} old proposals, ${removedBanners} stale banner dismissals`)
  }
}

// Run cleanup on module load (client-side only)
if (typeof window !== 'undefined') {
  // Delay cleanup to avoid blocking initial render
  setTimeout(cleanupOldProposals, 2000)
}
