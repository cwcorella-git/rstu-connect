import { createLogger } from '../utils/logger'

const log = createLogger('Auth')

/**
 * Authentication and permission checks.
 *
 * Supabase, which used to be the server-side source of truth for roles,
 * bans, votes and trust levels, was retired 2026-10-26. Every check here now
 * reads the local profile, so it can be bypassed by editing localStorage
 * until signed role grants (device keys + founder quorum) replace it.
 */

import type { UserProfile, UserRole, TrustLevel } from '../storage/profileStorage'
import { getCurrentProfile } from '../storage/profileStorage'

// ============================================
// Types
// ============================================

export interface AuthoritativeProfile {
  id: string
  nickname: string
  role: UserRole
  trustLevel: TrustLevel
  buildingId?: string
  buildingAddress?: string
  banned: boolean
  bannedAt?: string
  bannedBy?: string
}

export interface BanStatus {
  banned: boolean
  scope?: 'global' | 'group' | 'building'
  scopeId?: string
  reason?: string
  expiresAt?: string
}

export interface MuteStatus {
  muted: boolean
  scope?: 'group' | 'building'
  scopeId?: string
  reason?: string
  expiresAt?: string
}

export interface PermissionResult {
  allowed: boolean
  reason?: string
}

// Permission actions that require server validation
export type PermissionAction =
  | 'vote:proposal'
  | 'vote:event'
  | 'create:proposal'
  | 'create:event'
  | 'create:campaign'
  | 'ban:user'
  | 'unban:user'
  | 'mute:user'
  | 'unmute:user'
  | 'change:role'
  | 'create:invite'
  | 'access:tools'
  | 'access:organize'
  | 'send:message'

// ============================================
// Online State Detection
// ============================================

let isOnlineState = typeof navigator !== 'undefined' ? navigator.onLine : true
let onlineListeners: ((online: boolean) => void)[] = []

// Initialize online state listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOnlineState = true
    onlineListeners.forEach(fn => fn(true))
  })
  window.addEventListener('offline', () => {
    isOnlineState = false
    onlineListeners.forEach(fn => fn(false))
  })
}

/**
 * Check if the app is currently online
 */
export function isOnline(): boolean {
  return isOnlineState
}

/**
 * Subscribe to online state changes
 * Returns unsubscribe function
 */
export function subscribeToOnlineState(callback: (online: boolean) => void): () => void {
  onlineListeners.push(callback)
  return () => {
    onlineListeners = onlineListeners.filter(fn => fn !== callback)
  }
}

/**
 * Require online connection for an operation
 * Throws error if offline with user-friendly message
 */
export function requireOnline(operation: string): void {
  if (!isOnlineState) {
    throw new OfflineError(`Cannot ${operation} while offline. Please reconnect to the internet.`)
  }
  // There is no server any more (Supabase removed), so server-only
  // operations can never proceed.
  throw new OfflineError(`Cannot ${operation} without server connection. Server not configured.`)
}

// Custom error for offline state
export class OfflineError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OfflineError'
  }
}

// ============================================
// Server-Authoritative Profile
// ============================================

/**
 * Get the authoritative profile from the server
 * This is the source of truth - localStorage role can be manipulated
 */
export async function getAuthoritativeProfile(): Promise<AuthoritativeProfile | null> {
  const localProfile = getCurrentProfile()
  if (!localProfile) return null

  // No server: the local profile is the only source
  return {
    id: localProfile.id,
    nickname: localProfile.nickname,
    role: localProfile.role,
    trustLevel: localProfile.trustLevel,
    buildingId: localProfile.buildingId,
    buildingAddress: localProfile.buildingAddress,
    banned: localProfile.banned ?? false,
  }
}

/**
 * Get the server-authoritative role for the current user
 * Returns 'tenant' as safe default if unable to verify
 */
export async function getAuthoritativeRole(): Promise<UserRole> {
  const profile = await getAuthoritativeProfile()
  return profile?.role ?? 'tenant'
}

// ============================================
// Ban/Mute Status Checks
// ============================================

/**
 * Check if a user is banned (server-authoritative)
 * Checks both global bans and scope-specific bans
 */
export async function checkBanStatus(
  profileId: string,
  scopeType?: 'group' | 'building',
  scopeId?: string
): Promise<BanStatus> {
  // Local profile check only (scope-specific bans lived on the server)
  const localProfile = getCurrentProfile()
  if (localProfile?.id === profileId && localProfile.banned) {
    return { banned: true, scope: 'global' }
  }
  return { banned: false }
}

/**
 * Check if a user is muted in a specific scope
 */
export async function checkMuteStatus(
  profileId: string,
  scopeType: 'group' | 'building',
  scopeId: string
): Promise<MuteStatus> {
  // Mute records lived on the server; nothing is muted locally
  return { muted: false }
}

// ============================================
// Permission Checks
// ============================================

/**
 * Check if current user has permission for an action
 * All permission checks go through the server
 */
export async function checkPermission(action: PermissionAction): Promise<PermissionResult> {
  const profile = await getAuthoritativeProfile()

  if (!profile) {
    return { allowed: false, reason: 'Not logged in' }
  }

  if (profile.banned) {
    return { allowed: false, reason: 'Account is banned' }
  }

  // Role hierarchy
  const roleHierarchy: UserRole[] = ['tenant', 'organizer', 'admin']
  const userRoleIndex = roleHierarchy.indexOf(profile.role)

  switch (action) {
    // Voting permissions
    case 'vote:proposal':
      // Bookchin principle: admins cannot vote on governance
      if (profile.role === 'admin') {
        return { allowed: false, reason: 'Admins cannot vote on governance proposals' }
      }
      if (profile.trustLevel !== 'verified') {
        return { allowed: false, reason: 'Only verified members can vote' }
      }
      return { allowed: true }

    case 'vote:event':
      if (profile.trustLevel !== 'verified') {
        return { allowed: false, reason: 'Only verified members can vote on events' }
      }
      return { allowed: true }

    // Creation permissions
    case 'create:proposal':
      if (profile.trustLevel !== 'verified') {
        return { allowed: false, reason: 'Only verified members can create proposals' }
      }
      return { allowed: true }

    case 'create:event':
      if (profile.trustLevel !== 'verified') {
        return { allowed: false, reason: 'Only verified members can create events' }
      }
      return { allowed: true }

    case 'create:campaign':
      if (userRoleIndex < roleHierarchy.indexOf('organizer')) {
        return { allowed: false, reason: 'Only organizers can create campaigns' }
      }
      return { allowed: true }

    // Moderation permissions
    case 'ban:user':
    case 'unban:user':
      if (profile.role !== 'admin') {
        return { allowed: false, reason: 'Only admins can ban/unban users' }
      }
      return { allowed: true }

    case 'mute:user':
    case 'unmute:user':
      if (userRoleIndex < roleHierarchy.indexOf('organizer')) {
        return { allowed: false, reason: 'Only organizers can mute/unmute users' }
      }
      return { allowed: true }

    case 'change:role':
      if (profile.role !== 'admin') {
        return { allowed: false, reason: 'Only admins can change roles' }
      }
      return { allowed: true }

    // Invite permissions
    case 'create:invite':
      if (userRoleIndex < roleHierarchy.indexOf('organizer')) {
        return { allowed: false, reason: 'Only organizers can create invites' }
      }
      return { allowed: true }

    // Access permissions
    case 'access:tools':
      if (userRoleIndex < roleHierarchy.indexOf('organizer')) {
        return { allowed: false, reason: 'Tools tab is for organizers only' }
      }
      return { allowed: true }

    case 'access:organize':
      if (profile.trustLevel !== 'verified') {
        return { allowed: false, reason: 'Only verified members can access Organize features' }
      }
      return { allowed: true }

    // Chat permissions
    case 'send:message':
      if (profile.trustLevel !== 'verified') {
        return { allowed: false, reason: 'Only verified members can send messages' }
      }
      return { allowed: true }

    default:
      return { allowed: false, reason: 'Unknown action' }
  }
}

/**
 * Check if user can vote on a specific proposal (with ban check)
 */
export async function canVoteOnProposal(
  proposalId: string,
  groupId?: string
): Promise<PermissionResult> {
  const profile = await getAuthoritativeProfile()
  if (!profile) {
    return { allowed: false, reason: 'Not logged in' }
  }

  // Check basic permission
  const basicPermission = await checkPermission('vote:proposal')
  if (!basicPermission.allowed) {
    return basicPermission
  }

  // Check scope-specific ban
  if (groupId) {
    const banStatus = await checkBanStatus(profile.id, 'group', groupId)
    if (banStatus.banned) {
      return { allowed: false, reason: banStatus.reason || 'Banned from this group' }
    }
  }

  return { allowed: true }
}

/**
 * Check if user can send message in a specific chat scope
 */
export async function canSendMessage(
  scopeType: 'building' | 'group',
  scopeId: string
): Promise<PermissionResult> {
  const profile = await getAuthoritativeProfile()
  if (!profile) {
    return { allowed: false, reason: 'Not logged in' }
  }

  // Check basic permission
  const basicPermission = await checkPermission('send:message')
  if (!basicPermission.allowed) {
    return basicPermission
  }

  // Check mute status
  const muteStatus = await checkMuteStatus(profile.id, scopeType, scopeId)
  if (muteStatus.muted) {
    return { allowed: false, reason: muteStatus.reason || 'You are muted in this chat' }
  }

  // Check scope-specific ban
  const banStatus = await checkBanStatus(profile.id, scopeType, scopeId)
  if (banStatus.banned) {
    return { allowed: false, reason: banStatus.reason || 'Banned from this chat' }
  }

  return { allowed: true }
}

// ============================================
// Server-Side Vote Casting
// ============================================

/**
 * Cast a vote through the server (prevents localStorage manipulation)
 */
export async function castVote(
  targetType: 'proposal' | 'event',
  targetId: string,
  vote: 'up' | 'down'
): Promise<{ success: boolean; error?: string }> {
  requireOnline('vote')

  const profile = await getAuthoritativeProfile()
  if (!profile) {
    return { success: false, error: 'Not logged in' }
  }

  return { success: false, error: 'Server not configured' }
}

/**
 * Get vote counts from server
 */
export async function getVoteCounts(
  targetType: 'proposal' | 'event',
  targetId: string
): Promise<{ upvotes: number; downvotes: number; userVote?: 'up' | 'down' }> {
  // Vote tallies lived on the server
  return { upvotes: 0, downvotes: 0 }
}

// ============================================
// Role Change Validation
// ============================================

/**
 * Validate a role change through the server
 */
export async function validateRoleChange(
  actorId: string,
  targetId: string,
  newRole: UserRole
): Promise<{ valid: boolean; error?: string }> {
  return { valid: false, error: 'Server not configured' }
}

// ============================================
// Ban/Unban Operations
// ============================================

/**
 * Ban a user through the server
 */
export async function banUser(
  targetId: string,
  scopeType: 'global' | 'group' | 'building',
  scopeId?: string,
  reason?: string,
  expiresAt?: Date
): Promise<{ success: boolean; error?: string }> {
  requireOnline('ban users')

  const profile = await getAuthoritativeProfile()
  if (!profile) {
    return { success: false, error: 'Not logged in' }
  }

  return { success: false, error: 'Server not configured' }
}

/**
 * Unban a user through the server
 */
export async function unbanUser(
  targetId: string,
  scopeType: 'global' | 'group' | 'building' = 'global',
  scopeId?: string
): Promise<{ success: boolean; error?: string }> {
  requireOnline('unban users')

  const profile = await getAuthoritativeProfile()
  if (!profile) {
    return { success: false, error: 'Not logged in' }
  }

  return { success: false, error: 'Server not configured' }
}

// ============================================
// Convenience Wrappers
// ============================================

/**
 * Check if current user is admin (server-authoritative)
 */
export async function isServerAdmin(): Promise<boolean> {
  const role = await getAuthoritativeRole()
  return role === 'admin'
}

/**
 * Check if current user is at least organizer (server-authoritative)
 */
export async function isServerOrganizer(): Promise<boolean> {
  const role = await getAuthoritativeRole()
  return role === 'organizer' || role === 'admin'
}

/**
 * Check if current user is verified (server-authoritative)
 */
export async function isServerVerified(): Promise<boolean> {
  const profile = await getAuthoritativeProfile()
  return profile?.trustLevel === 'verified'
}
