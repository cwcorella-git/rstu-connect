// User profile storage for tenant organizing platform

// User roles with increasing permissions
export type UserRole = 'tenant' | 'organizer' | 'admin'

// Trust level based on how account was created
export type TrustLevel = 'self_registered' | 'invited' | 'verified'

// Sync metadata for cross-device synchronization
export interface SyncMeta {
  syncVersion: number      // Increments on each update for conflict resolution
  lastSyncedAt: number     // Last successful sync timestamp
  deviceId: string         // Unique device identifier
  pendingSync: boolean     // True if changes need to be pushed
}

// Role change audit entry
export interface RoleChangeAudit {
  id: string
  targetUserId: string
  targetUserNickname: string
  previousRole: UserRole
  newRole: UserRole
  changedBy: string          // Admin profile ID
  changedByNickname: string
  timestamp: number
  reason?: string
}

// User profile interface
export interface UserProfile {
  id: string
  nickname: string
  role: UserRole
  trustLevel: TrustLevel

  // Property link
  buildingId?: string
  buildingAddress?: string
  unitNumber?: string

  // Contact info (private - organizer/admin only)
  phone?: string
  email?: string
  preferredContact?: 'phone' | 'text' | 'email'
  language?: string

  // Household info
  occupants?: number
  hasChildren?: boolean
  hasPets?: boolean
  petTypes?: string
  accessibilityNeeds?: string

  // Lease & rent
  rentAmount?: number
  moveInDate?: string
  leaseType?: 'fixed' | 'month-to-month'
  leaseExpires?: string
  securityDeposit?: number
  lastRentIncrease?: number

  // Availability
  workHours?: string
  bestTimeToReach?: string
  bestDays?: string[]

  // Issues & complaints
  complaints?: string[]
  complaintDetails?: string
  maintenanceRating?: 'good' | 'ok' | 'bad'
  outstandingRepairs?: string

  // Organizing interest
  interestLevel?: string[]
  knowsNeighbors?: 'yes' | 'somewhat' | 'no'
  hasOrganizingExperience?: boolean
  suggestions?: string

  // Organizer-specific
  assignedBuildings?: string[] // Building IDs organizer can access
  notes?: string // Internal organizer notes

  // Invitation chain
  invitedBy?: string // Profile ID of inviter
  inviteCode?: string // Code used to create this account

  // Activity tracking
  lastChatMessage?: number
  lastDocumentRead?: number
  lastToolsUsage?: number
  chatMessageCount?: number

  // Meta
  created: number
  lastActive: number

  // Cross-device sync
  syncMeta?: SyncMeta
}

// Invite code for tenant-to-tenant invitations
export interface InviteCode {
  code: string
  createdBy: string // Profile ID
  createdByName?: string // Nickname of creator
  buildingId?: string // Optional - link to specific building
  unitNumber?: string // Pre-fill unit if known
  grantRole: UserRole // Role to give the invitee
  maxUses: number // 0 = unlimited, otherwise max number of uses
  usedCount: number // How many times used
  usedBy: string[] // List of profile IDs who used it
  revoked: boolean // Whether code has been revoked
  created: number
  expires: number // 0 = never expires
}

// Profile state
export interface ProfileState {
  currentProfile: UserProfile | null
  inviteCodes: Record<string, InviteCode>
  lastModified: number
}

const STORAGE_KEY = 'rstu_profile_data'
const BOOTSTRAP_KEY = 'rstu_bootstrap_code'

// Generate a random ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

// Generate a cryptographically random bootstrap code
function generateBootstrapCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No confusing chars
  let code = 'RSTU-'
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Hardcoded bootstrap code for first admin
const BOOTSTRAP_ADMIN_CODE = 'RSTU-UNION-2025'

// Initialize bootstrap - just checks if needed (no console logging)
export function initBootstrapCode(): string | null {
  if (typeof window === 'undefined') return null
  const state = getProfileState()
  // Already has a profile - no bootstrap needed
  if (state.currentProfile) return null
  return BOOTSTRAP_ADMIN_CODE
}

// Bootstrap first admin with secret code
export function bootstrapFirstAdmin(inputCode: string): UserProfile | null {
  if (typeof window === 'undefined') return null

  const state = getProfileState()

  // Already has profile - no bootstrap needed
  if (state.currentProfile) return null

  // Validate against hardcoded code
  if (inputCode.toUpperCase() !== BOOTSTRAP_ADMIN_CODE) return null

  // Valid code - create admin profile
  const profile: UserProfile = {
    id: generateId(),
    nickname: 'Admin',
    role: 'admin',
    trustLevel: 'verified',
    created: Date.now(),
    lastActive: Date.now(),
  }

  state.currentProfile = profile
  saveProfileState(state)

  return profile
}

// Generate an invite code (6 chars, easy to type)
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No confusing chars (0/O, 1/I/L)
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Get profile state
export function getProfileState(): ProfileState {
  if (typeof window === 'undefined') {
    return { currentProfile: null, inviteCodes: {}, lastModified: 0 }
  }
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return { currentProfile: null, inviteCodes: {}, lastModified: 0 }
  }
  try {
    return JSON.parse(stored)
  } catch {
    return { currentProfile: null, inviteCodes: {}, lastModified: 0 }
  }
}

// Save profile state
function saveProfileState(state: ProfileState): void {
  if (typeof window === 'undefined') return
  state.lastModified = Date.now()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

// Get current user profile
export function getCurrentProfile(): UserProfile | null {
  return getProfileState().currentProfile
}

// Check if user is logged in
export function isLoggedIn(): boolean {
  return getCurrentProfile() !== null
}

// Check if user has specific role or higher
export function hasRole(requiredRole: UserRole): boolean {
  const profile = getCurrentProfile()
  if (!profile) return false

  const roleHierarchy: UserRole[] = ['tenant', 'organizer', 'admin']
  const userRoleIndex = roleHierarchy.indexOf(profile.role)
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole)

  return userRoleIndex >= requiredRoleIndex
}

// Check if user can access Tools tab
export function canAccessTools(): boolean {
  return hasRole('organizer')
}

// Check if user is admin
export function isAdmin(): boolean {
  return hasRole('admin')
}

// Activity tracking - record when user does certain actions
export function trackActivity(type: 'chat' | 'document' | 'tools'): void {
  const state = getProfileState()
  if (!state.currentProfile) return

  const now = Date.now()
  state.currentProfile.lastActive = now

  switch (type) {
    case 'chat':
      state.currentProfile.lastChatMessage = now
      state.currentProfile.chatMessageCount = (state.currentProfile.chatMessageCount || 0) + 1
      break
    case 'document':
      state.currentProfile.lastDocumentRead = now
      break
    case 'tools':
      state.currentProfile.lastToolsUsage = now
      break
  }

  saveProfileState(state)
}

// Get activity status for a user
export function getActivityStatus(profile: UserProfile): 'active' | 'inactive' | 'never' {
  const now = Date.now()
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000

  // Check if user has any recent activity
  const lastActivity = Math.max(
    profile.lastChatMessage || 0,
    profile.lastDocumentRead || 0,
    profile.lastToolsUsage || 0,
    profile.lastActive || 0
  )

  if (lastActivity === 0 || lastActivity === profile.created) {
    return 'never'
  }

  return lastActivity > oneWeekAgo ? 'active' : 'inactive'
}

// Create a new profile
export function createProfile(data: {
  nickname: string
  buildingId?: string
  buildingAddress?: string
  unitNumber?: string
  inviteCode?: string
}): UserProfile {
  const state = getProfileState()

  // Check invite code if provided
  let trustLevel: TrustLevel = 'self_registered'
  let invitedBy: string | undefined
  let role: UserRole = 'tenant'

  if (data.inviteCode) {
    const validation = validateInviteCode(data.inviteCode)
    if (validation.valid && validation.invite) {
      const invite = validation.invite
      trustLevel = 'invited'
      invitedBy = invite.createdBy
      role = invite.grantRole // Use the role specified in the invite

      // Mark invite as used (will be done after profile is created)
    }
  }

  // First user becomes admin (bootstrap) - only if no profiles exist
  if (!state.currentProfile && Object.keys(state.inviteCodes).length === 0) {
    role = 'admin'
    trustLevel = 'verified'
  }

  const profile: UserProfile = {
    id: generateId(),
    nickname: data.nickname,
    role,
    trustLevel,
    buildingId: data.buildingId,
    buildingAddress: data.buildingAddress,
    unitNumber: data.unitNumber,
    invitedBy,
    inviteCode: data.inviteCode,
    created: Date.now(),
    lastActive: Date.now(),
  }

  state.currentProfile = profile
  saveProfileState(state)

  // Mark invite code as used
  if (data.inviteCode) {
    useInviteCode(data.inviteCode, profile.id)
  }

  // Auto-link to canvassing if building and unit are specified
  if (profile.buildingId && profile.unitNumber && profile.buildingAddress) {
    import('./canvassStorage').then(({ ensureUnitExists, linkProfileToUnit }) => {
      ensureUnitExists(profile.buildingId!, profile.buildingAddress!, profile.unitNumber!)
      linkProfileToUnit(profile.buildingId!, profile.unitNumber!, profile.id, profile.nickname)
    })
  }

  return profile
}

// Update current profile
export function updateProfile(updates: Partial<UserProfile>): UserProfile | null {
  const state = getProfileState()
  if (!state.currentProfile) return null

  const oldProfile = state.currentProfile
  const newProfile = {
    ...oldProfile,
    ...updates,
    lastActive: Date.now(),
  }

  state.currentProfile = newProfile
  saveProfileState(state)

  // Auto-link to canvassing if building/unit changed
  const buildingChanged = updates.buildingId !== undefined && updates.buildingId !== oldProfile.buildingId
  const unitChanged = updates.unitNumber !== undefined && updates.unitNumber !== oldProfile.unitNumber

  if ((buildingChanged || unitChanged) && newProfile.buildingId && newProfile.unitNumber && newProfile.buildingAddress) {
    // Import canvass functions dynamically to avoid circular imports
    import('./canvassStorage').then(({ ensureUnitExists, linkProfileToUnit }) => {
      ensureUnitExists(newProfile.buildingId!, newProfile.buildingAddress!, newProfile.unitNumber!)
      linkProfileToUnit(newProfile.buildingId!, newProfile.unitNumber!, newProfile.id, newProfile.nickname)
    })
  }

  return newProfile
}

// Update profile role (admin only in real implementation)
export function updateProfileRole(role: UserRole): UserProfile | null {
  return updateProfile({ role })
}

// Logout / clear profile
export function clearProfile(): void {
  const state = getProfileState()
  state.currentProfile = null
  saveProfileState(state)
}

// Invite creation options
export interface CreateInviteOptions {
  buildingId?: string
  unitNumber?: string
  grantRole?: UserRole // Default: tenant
  maxUses?: number // Default: 1, 0 = unlimited
  expiresIn?: number // Milliseconds, 0 = never, default: 7 days
}

// Create an invite code
export function createInvite(options: CreateInviteOptions = {}): InviteCode | null {
  const profile = getCurrentProfile()
  if (!profile) return null

  // Check permissions - admins can create any role, organizers only tenant
  const requestedRole = options.grantRole || 'tenant'
  if (requestedRole === 'admin' && !isAdmin()) return null
  if (requestedRole === 'organizer' && !isAdmin()) return null
  if (!hasRole('organizer')) return null

  const state = getProfileState()
  const code = generateInviteCode()

  // Default expiration: 7 days
  const expiresIn = options.expiresIn !== undefined ? options.expiresIn : 7 * 24 * 60 * 60 * 1000

  const invite: InviteCode = {
    code,
    createdBy: profile.id,
    createdByName: profile.nickname,
    buildingId: options.buildingId,
    unitNumber: options.unitNumber,
    grantRole: requestedRole,
    maxUses: options.maxUses !== undefined ? options.maxUses : 1,
    usedCount: 0,
    usedBy: [],
    revoked: false,
    created: Date.now(),
    expires: expiresIn === 0 ? 0 : Date.now() + expiresIn,
  }

  state.inviteCodes[code] = invite
  saveProfileState(state)

  return invite
}

// Revoke an invite code
export function revokeInvite(code: string): boolean {
  const profile = getCurrentProfile()
  if (!profile) return false

  const state = getProfileState()
  const invite = state.inviteCodes[code.toUpperCase()]

  if (!invite) return false

  // Only creator or admin can revoke
  if (invite.createdBy !== profile.id && !isAdmin()) return false

  invite.revoked = true
  saveProfileState(state)
  return true
}

// Delete an invite code entirely (admin only)
export function deleteInvite(code: string): boolean {
  if (!isAdmin()) return false

  const state = getProfileState()
  if (!state.inviteCodes[code.toUpperCase()]) return false

  delete state.inviteCodes[code.toUpperCase()]
  saveProfileState(state)
  return true
}

// Get all invite codes (admin) or just my codes (organizer)
export function getAllInviteCodes(): InviteCode[] {
  const profile = getCurrentProfile()
  if (!profile || !hasRole('organizer')) return []

  const state = getProfileState()
  const codes = Object.values(state.inviteCodes)

  // Admins see all, organizers see only theirs
  if (isAdmin()) {
    return codes.sort((a, b) => b.created - a.created)
  }

  return codes
    .filter(c => c.createdBy === profile.id)
    .sort((a, b) => b.created - a.created)
}

// Validate an invite code
export function validateInviteCode(code: string): {
  valid: boolean
  invite?: InviteCode
  error?: string
} {
  const state = getProfileState()
  const invite = state.inviteCodes[code.toUpperCase()]

  if (!invite) {
    return { valid: false, error: 'Invalid invite code' }
  }
  if (invite.revoked) {
    return { valid: false, error: 'Invite code has been revoked' }
  }
  if (invite.maxUses > 0 && invite.usedCount >= invite.maxUses) {
    return { valid: false, error: 'Invite code has reached max uses' }
  }
  if (invite.expires > 0 && invite.expires < Date.now()) {
    return { valid: false, error: 'Invite code expired' }
  }

  return { valid: true, invite }
}

// Use an invite code (called when profile is created)
export function useInviteCode(code: string, profileId: string): boolean {
  const state = getProfileState()
  const invite = state.inviteCodes[code.toUpperCase()]

  if (!invite) return false

  invite.usedCount++
  invite.usedBy.push(profileId)
  saveProfileState(state)
  return true
}

// Get invite codes created by current user
export function getMyInviteCodes(): InviteCode[] {
  const profile = getCurrentProfile()
  if (!profile) return []

  const state = getProfileState()
  return Object.values(state.inviteCodes)
    .filter(invite => invite.createdBy === profile.id)
    .sort((a, b) => b.created - a.created)
}

// Build QR code URL for profile creation
export function buildProfileQRUrl(buildingId: string, buildingAddress: string, unitNumber?: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const params = new URLSearchParams({
    action: 'create-profile',
    building: buildingId,
    address: buildingAddress,
  })
  if (unitNumber) {
    params.set('unit', unitNumber)
  }
  return `${baseUrl}?${params.toString()}`
}

// Build QR code URL with invite code
export function buildInviteQRUrl(inviteCode: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  return `${baseUrl}?invite=${inviteCode}`
}

// Parse URL params for profile creation
export function parseProfileParams(): {
  action?: string
  buildingId?: string
  buildingAddress?: string
  unitNumber?: string
  inviteCode?: string
} | null {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)
  const action = params.get('action')
  const inviteCode = params.get('invite')

  if (action === 'create-profile' || inviteCode) {
    return {
      action: action || undefined,
      buildingId: params.get('building') || undefined,
      buildingAddress: params.get('address') || undefined,
      unitNumber: params.get('unit') || undefined,
      inviteCode: inviteCode || undefined,
    }
  }

  return null
}

// Get role display label
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    tenant: 'Tenant',
    organizer: 'Organizer',
    admin: 'Admin',
  }
  return labels[role]
}

// Get trust level display label
export function getTrustLabel(level: TrustLevel): string {
  const labels: Record<TrustLevel, string> = {
    self_registered: 'Self-registered',
    invited: 'Invited',
    verified: 'Verified',
  }
  return labels[level]
}

// Export profile data (for data portability)
export function exportProfileData(): string {
  const state = getProfileState()
  return JSON.stringify({
    version: '1.0',
    exportDate: Date.now(),
    profile: state.currentProfile,
  }, null, 2)
}

// ============================================
// Cross-Device Sync Functions
// ============================================

const DEVICE_ID_KEY = 'rstu_device_id'

// Generate a stable device ID (persists across sessions)
export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server'

  let deviceId = localStorage.getItem(DEVICE_ID_KEY)
  if (!deviceId) {
    deviceId = 'dev_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 11)
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
  }
  return deviceId
}

// Initialize sync metadata for a profile (first-time setup)
export function initSyncMeta(profile: UserProfile): UserProfile {
  if (profile.syncMeta) return profile

  return {
    ...profile,
    syncMeta: {
      syncVersion: 1,
      lastSyncedAt: 0,
      deviceId: getDeviceId(),
      pendingSync: true,
    }
  }
}

// Get a profile ready for sync (strip local-only fields, ensure sync meta)
export function getSyncableProfile(): UserProfile | null {
  const state = getProfileState()
  if (!state.currentProfile) return null

  const profile = initSyncMeta(state.currentProfile)

  // Increment version for sync
  return {
    ...profile,
    syncMeta: {
      ...profile.syncMeta!,
      syncVersion: (profile.syncMeta?.syncVersion || 0) + 1,
      deviceId: getDeviceId(),
    }
  }
}

// Merge a remote profile with local profile (conflict resolution)
// Strategy: Server wins for role changes, client wins for activity data
export function mergeRemoteProfile(remoteProfile: UserProfile): UserProfile | null {
  const state = getProfileState()
  const localProfile = state.currentProfile

  if (!localProfile) {
    // No local profile - accept remote as-is
    state.currentProfile = {
      ...remoteProfile,
      syncMeta: {
        syncVersion: remoteProfile.syncMeta?.syncVersion || 1,
        lastSyncedAt: Date.now(),
        deviceId: getDeviceId(),
        pendingSync: false,
      }
    }
    saveProfileState(state)
    return state.currentProfile
  }

  // Same profile ID - merge
  if (localProfile.id === remoteProfile.id) {
    const localVersion = localProfile.syncMeta?.syncVersion || 0
    const remoteVersion = remoteProfile.syncMeta?.syncVersion || 0

    // Server wins for critical fields (role, trustLevel)
    // Client wins for activity data (local is more accurate)
    const merged: UserProfile = {
      ...localProfile,
      // Server-authoritative fields
      role: remoteProfile.role,
      trustLevel: remoteProfile.trustLevel,
      // Keep local activity data (more accurate)
      lastActive: Math.max(localProfile.lastActive, remoteProfile.lastActive || 0),
      lastChatMessage: Math.max(localProfile.lastChatMessage || 0, remoteProfile.lastChatMessage || 0),
      lastDocumentRead: Math.max(localProfile.lastDocumentRead || 0, remoteProfile.lastDocumentRead || 0),
      lastToolsUsage: Math.max(localProfile.lastToolsUsage || 0, remoteProfile.lastToolsUsage || 0),
      chatMessageCount: Math.max(localProfile.chatMessageCount || 0, remoteProfile.chatMessageCount || 0),
      // Update sync meta
      syncMeta: {
        syncVersion: Math.max(localVersion, remoteVersion),
        lastSyncedAt: Date.now(),
        deviceId: getDeviceId(),
        pendingSync: false,
      }
    }

    state.currentProfile = merged
    saveProfileState(state)
    return merged
  }

  // Different profile ID - shouldn't happen, keep local
  console.warn('[ProfileStorage] Remote profile ID mismatch, keeping local')
  return localProfile
}

// Mark profile as synced (after successful server sync)
export function markProfileSynced(): void {
  const state = getProfileState()
  if (!state.currentProfile || !state.currentProfile.syncMeta) return

  state.currentProfile.syncMeta.lastSyncedAt = Date.now()
  state.currentProfile.syncMeta.pendingSync = false
  saveProfileState(state)
}

// Mark profile as needing sync (after local changes)
export function markProfilePendingSync(): void {
  const state = getProfileState()
  if (!state.currentProfile) return

  if (!state.currentProfile.syncMeta) {
    state.currentProfile = initSyncMeta(state.currentProfile)
  }

  state.currentProfile.syncMeta!.pendingSync = true
  state.currentProfile.syncMeta!.syncVersion = (state.currentProfile.syncMeta!.syncVersion || 0) + 1
  saveProfileState(state)
}

// Check if profile needs to be synced
export function needsSync(): boolean {
  const profile = getCurrentProfile()
  if (!profile) return false
  return profile.syncMeta?.pendingSync ?? true // Default to true if never synced
}

// Apply role change from server (admin changed our role)
export function applyRoleChange(newRole: UserRole): UserProfile | null {
  const state = getProfileState()
  if (!state.currentProfile) return null

  state.currentProfile.role = newRole
  if (state.currentProfile.syncMeta) {
    state.currentProfile.syncMeta.lastSyncedAt = Date.now()
    state.currentProfile.syncMeta.pendingSync = false
  }

  saveProfileState(state)
  return state.currentProfile
}
