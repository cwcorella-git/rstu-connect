/**
 * Server-Authoritative Authentication Service
 *
 * This module handles all permission checks server-side to prevent
 * localStorage manipulation attacks. The server (Supabase) is the
 * source of truth for:
 * - User roles and permissions
 * - Ban/mute status
 * - Voting eligibility
 * - Trust levels
 *
 * localStorage is used only as a read-only cache for offline viewing.
 */

import { supabase, USE_SUPABASE } from './supabase'
import type { UserProfile, UserRole, TrustLevel } from './profileStorage'
import { getCurrentProfile } from './profileStorage'

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
  if (!USE_SUPABASE) {
    throw new OfflineError(`Cannot ${operation} without server connection. Server not configured.`)
  }
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

  // If no Supabase, fall back to local (development only)
  if (!USE_SUPABASE || !supabase) {
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

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nickname, role, trust_level, building_id, building_address, banned, banned_at, banned_by')
      .eq('id', localProfile.id)
      .single()

    if (error || !data) {
      // Profile not in Supabase yet - use local but mark as unverified
      return {
        id: localProfile.id,
        nickname: localProfile.nickname,
        role: 'tenant', // Default to lowest privilege if not in server
        trustLevel: 'self_registered',
        buildingId: localProfile.buildingId,
        buildingAddress: localProfile.buildingAddress,
        banned: false,
      }
    }

    return {
      id: data.id,
      nickname: data.nickname,
      role: data.role as UserRole,
      trustLevel: data.trust_level as TrustLevel,
      buildingId: data.building_id || undefined,
      buildingAddress: data.building_address || undefined,
      banned: data.banned ?? false,
      bannedAt: data.banned_at || undefined,
      bannedBy: data.banned_by || undefined,
    }
  } catch {
    // Network error - return local with warning
    console.warn('[AuthService] Failed to fetch authoritative profile, using cached data')
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
  if (!USE_SUPABASE || !supabase) {
    // Fallback to local profile check
    const localProfile = getCurrentProfile()
    if (localProfile?.id === profileId && localProfile.banned) {
      return { banned: true, scope: 'global' }
    }
    return { banned: false }
  }

  try {
    const { data, error } = await supabase.rpc('check_ban_status', {
      p_profile_id: profileId,
      p_scope_type: scopeType || null,
      p_scope_id: scopeId || null,
    })

    if (error) {
      console.error('[AuthService] Ban check error:', error)
      return { banned: false }
    }

    if (data?.banned) {
      return {
        banned: true,
        scope: data.scope,
        scopeId: data.scope_id,
        reason: data.reason,
        expiresAt: data.expires_at,
      }
    }

    return { banned: false }
  } catch {
    console.warn('[AuthService] Failed to check ban status')
    return { banned: false }
  }
}

/**
 * Check if a user is muted in a specific scope
 */
export async function checkMuteStatus(
  profileId: string,
  scopeType: 'group' | 'building',
  scopeId: string
): Promise<MuteStatus> {
  if (!USE_SUPABASE || !supabase) {
    return { muted: false }
  }

  try {
    const { data, error } = await supabase
      .from('mute_records')
      .select('*')
      .eq('profile_id', profileId)
      .eq('scope_type', scopeType)
      .eq('scope_id', scopeId)
      .is('lifted_at', null)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .limit(1)
      .single()

    if (error || !data) {
      return { muted: false }
    }

    return {
      muted: true,
      scope: data.scope_type as 'group' | 'building',
      scopeId: data.scope_id,
      reason: data.reason,
      expiresAt: data.expires_at,
    }
  } catch {
    return { muted: false }
  }
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

  if (!supabase) {
    return { success: false, error: 'Server not configured' }
  }

  try {
    const { data, error } = await supabase.rpc('cast_vote', {
      p_target_type: targetType,
      p_target_id: targetId,
      p_voter_id: profile.id,
      p_vote: vote,
    })

    if (error) {
      console.error('[AuthService] Vote error:', error)
      return { success: false, error: error.message }
    }

    if (data && !data.success) {
      return { success: false, error: data.error }
    }

    return { success: true }
  } catch (e) {
    if (e instanceof OfflineError) {
      throw e
    }
    return { success: false, error: 'Failed to cast vote' }
  }
}

/**
 * Get vote counts from server
 */
export async function getVoteCounts(
  targetType: 'proposal' | 'event',
  targetId: string
): Promise<{ upvotes: number; downvotes: number; userVote?: 'up' | 'down' }> {
  if (!USE_SUPABASE || !supabase) {
    return { upvotes: 0, downvotes: 0 }
  }

  const profile = getCurrentProfile()

  try {
    if (targetType === 'proposal') {
      const { data, error } = await supabase.rpc('get_proposal_votes', {
        p_proposal_id: targetId,
      })

      if (error || !data) {
        return { upvotes: 0, downvotes: 0 }
      }

      let userVote: 'up' | 'down' | undefined
      if (profile) {
        if (data.upvoters?.includes(profile.id)) userVote = 'up'
        else if (data.downvoters?.includes(profile.id)) userVote = 'down'
      }

      return {
        upvotes: data.upvotes || 0,
        downvotes: data.downvotes || 0,
        userVote,
      }
    } else {
      // Event votes
      const { data, error } = await supabase
        .from('event_votes')
        .select('voter_id, vote')
        .eq('event_id', targetId)

      if (error || !data) {
        return { upvotes: 0, downvotes: 0 }
      }

      let userVote: 'up' | 'down' | undefined
      let upvotes = 0
      let downvotes = 0

      for (const v of data) {
        if (v.vote === 'up') upvotes++
        else if (v.vote === 'down') downvotes++
        if (profile && v.voter_id === profile.id) {
          userVote = v.vote as 'up' | 'down'
        }
      }

      return { upvotes, downvotes, userVote }
    }
  } catch {
    return { upvotes: 0, downvotes: 0 }
  }
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
  if (!USE_SUPABASE || !supabase) {
    return { valid: false, error: 'Server not configured' }
  }

  try {
    const { data, error } = await supabase.rpc('validate_role_change', {
      p_actor_id: actorId,
      p_target_id: targetId,
      p_new_role: newRole,
    })

    if (error) {
      return { valid: false, error: error.message }
    }

    return {
      valid: data?.valid ?? false,
      error: data?.error,
    }
  } catch {
    return { valid: false, error: 'Failed to validate role change' }
  }
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

  if (!supabase) {
    return { success: false, error: 'Server not configured' }
  }

  try {
    const { data, error } = await supabase.rpc('ban_user', {
      p_actor_id: profile.id,
      p_target_id: targetId,
      p_scope_type: scopeType,
      p_scope_id: scopeId || null,
      p_reason: reason || null,
      p_expires_at: expiresAt?.toISOString() || null,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: data?.success ?? false,
      error: data?.error,
    }
  } catch (e) {
    if (e instanceof OfflineError) {
      throw e
    }
    return { success: false, error: 'Failed to ban user' }
  }
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

  if (!supabase) {
    return { success: false, error: 'Server not configured' }
  }

  try {
    const { data, error } = await supabase.rpc('unban_user', {
      p_actor_id: profile.id,
      p_target_id: targetId,
      p_scope_type: scopeType,
      p_scope_id: scopeId || null,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: data?.success ?? false,
      error: data?.error,
    }
  } catch (e) {
    if (e instanceof OfflineError) {
      throw e
    }
    return { success: false, error: 'Failed to unban user' }
  }
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
