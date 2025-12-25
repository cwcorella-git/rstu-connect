// User profile storage for tenant organizing platform
// Supports both localStorage (offline) and Supabase (cloud sync)

import { supabase, USE_SUPABASE, DbProfile, DbInviteCode } from './supabase'

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

  // Rent comparison data (for calculations)
  monthlyIncome?: number    // Gross monthly income (private, not synced)
  unitType?: 'apartment' | 'house' | 'townhouse' | 'duplex' | 'condo' | 'mobile' | 'room'
  unitSqft?: number         // Square footage of unit
  bedroomCount?: number     // 0=studio, 1, 2, 3, 4+
  bathroomCount?: number    // 1, 1.5, 2, etc.

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
  storedProfiles: UserProfile[] // Profiles saved on this device
  inviteCodes: Record<string, InviteCode>
  lastModified: number
}

const STORAGE_KEY = 'rstu_profile_data'
const BOOTSTRAP_KEY = 'rstu_bootstrap_code'

// ============================================
// Supabase Database Operations
// ============================================

// Convert database profile to app profile
function dbToProfile(db: DbProfile): UserProfile {
  return {
    id: db.id,
    nickname: db.nickname,
    role: db.role,
    trustLevel: db.trust_level,
    buildingId: db.building_id || undefined,
    buildingAddress: db.building_address || undefined,
    unitNumber: db.unit_number || undefined,
    phone: db.phone || undefined,
    email: db.email || undefined,
    preferredContact: db.preferred_contact || undefined,
    language: db.language || undefined,
    rentAmount: db.rent_amount || undefined,
    moveInDate: db.move_in_date || undefined,
    leaseType: db.lease_type || undefined,
    leaseExpires: db.lease_expires || undefined,
    assignedBuildings: db.assigned_buildings || undefined,
    invitedBy: db.invited_by || undefined,
    inviteCode: db.invite_code || undefined,
    created: new Date(db.created_at).getTime(),
    lastActive: new Date(db.last_active).getTime(),
  }
}

// Convert app profile to database format
function profileToDb(profile: UserProfile): Partial<DbProfile> {
  return {
    id: profile.id,
    nickname: profile.nickname,
    role: profile.role,
    trust_level: profile.trustLevel,
    building_id: profile.buildingId || null,
    building_address: profile.buildingAddress || null,
    unit_number: profile.unitNumber || null,
    phone: profile.phone || null,
    email: profile.email || null,
    preferred_contact: profile.preferredContact || null,
    language: profile.language || null,
    rent_amount: profile.rentAmount || null,
    move_in_date: profile.moveInDate || null,
    lease_type: profile.leaseType || null,
    lease_expires: profile.leaseExpires || null,
    assigned_buildings: profile.assignedBuildings || null,
    invited_by: profile.invitedBy || null,
    invite_code: profile.inviteCode || null,
  }
}

// Convert database invite to app invite
function dbToInvite(db: DbInviteCode): InviteCode {
  return {
    code: db.code,
    createdBy: db.created_by,
    buildingId: db.building_id || undefined,
    unitNumber: db.unit_number || undefined,
    grantRole: db.grant_role as UserRole,
    maxUses: db.max_uses,
    usedCount: db.used_count,
    usedBy: db.used_by || [],
    revoked: db.revoked,
    created: new Date(db.created_at).getTime(),
    expires: db.expires_at ? new Date(db.expires_at).getTime() : 0,
  }
}

// Fetch profile from Supabase by ID
async function fetchProfileFromDb(id: string): Promise<UserProfile | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return dbToProfile(data as DbProfile)
}

// Save profile to Supabase
async function saveProfileToDb(profile: UserProfile): Promise<boolean> {
  if (!supabase) return false

  const dbProfile = profileToDb(profile)

  const { error } = await supabase
    .from('profiles')
    .upsert(dbProfile, { onConflict: 'id' })

  if (error) {
    console.error('[ProfileStorage] Failed to save to Supabase:', error)
    return false
  }
  return true
}

// Fetch invite code from Supabase
async function fetchInviteFromDb(code: string): Promise<InviteCode | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('invite_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (error || !data) return null
  return dbToInvite(data as DbInviteCode)
}

// Save invite code to Supabase
async function saveInviteToDb(invite: InviteCode): Promise<boolean> {
  if (!supabase) return false

  const dbInvite = {
    code: invite.code,
    created_by: invite.createdBy,
    building_id: invite.buildingId || null,
    unit_number: invite.unitNumber || null,
    grant_role: invite.grantRole,
    max_uses: invite.maxUses,
    used_count: invite.usedCount,
    used_by: invite.usedBy,
    revoked: invite.revoked,
    expires_at: invite.expires > 0 ? new Date(invite.expires).toISOString() : null,
  }

  const { error } = await supabase
    .from('invite_codes')
    .upsert(dbInvite, { onConflict: 'code' })

  if (error) {
    console.error('[ProfileStorage] Failed to save invite to Supabase:', error)
    return false
  }
  return true
}

// Update invite usage in Supabase
async function updateInviteUsageInDb(code: string, profileId: string): Promise<boolean> {
  if (!supabase) return false

  // First fetch current state
  const { data, error: fetchError } = await supabase
    .from('invite_codes')
    .select('used_count, used_by')
    .eq('code', code.toUpperCase())
    .single()

  if (fetchError || !data) return false

  // Update with new usage
  const { error } = await supabase
    .from('invite_codes')
    .update({
      used_count: (data.used_count || 0) + 1,
      used_by: [...(data.used_by || []), profileId],
    })
    .eq('code', code.toUpperCase())

  return !error
}

// Fetch all invite codes from Supabase (for admin/organizer)
async function fetchAllInvitesFromDb(creatorId?: string): Promise<InviteCode[]> {
  if (!supabase) return []

  let query = supabase.from('invite_codes').select('*')

  if (creatorId) {
    query = query.eq('created_by', creatorId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error || !data) return []
  return data.map(d => dbToInvite(d as DbInviteCode))
}

// Generate a random UUID (required for Supabase profiles table)
function generateId(): string {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
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
// Requires nickname and password for security
export function bootstrapFirstAdmin(inputCode: string, nickname?: string, password?: string): UserProfile | null {
  if (typeof window === 'undefined') return null

  const state = getProfileState()

  // Already has profile - no bootstrap needed
  if (state.currentProfile) return null

  // Validate against hardcoded code
  if (inputCode.toUpperCase() !== BOOTSTRAP_ADMIN_CODE) return null

  // Nickname and password are required for bootstrap
  if (!nickname || !password) return null
  if (password.length < 8) return null

  // Hash password (simple hash for now - in production use bcrypt server-side)
  const passwordHash = simpleHash(password)

  // Valid code - create admin profile
  const profile: UserProfile = {
    id: generateId(),
    nickname: nickname.trim(),
    role: 'admin',
    trustLevel: 'verified',
    created: Date.now(),
    lastActive: Date.now(),
  }

  // Store password hash in localStorage (separate from profile for security)
  try {
    localStorage.setItem('rstu_admin_hash', passwordHash)
  } catch (e) {
    console.error('[ProfileStorage] Failed to save admin hash:', e)
  }

  state.currentProfile = profile
  saveProfileState(state)

  return profile
}

// Simple hash function (not cryptographically secure - use server-side bcrypt in production)
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  // Add some entropy
  return 'h_' + Math.abs(hash).toString(36) + '_' + str.length.toString(36)
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
    return { currentProfile: null, storedProfiles: [], inviteCodes: {}, lastModified: 0 }
  }
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return { currentProfile: null, storedProfiles: [], inviteCodes: {}, lastModified: 0 }
  }
  try {
    const state = JSON.parse(stored)
    // Migrate old state without storedProfiles
    if (!state.storedProfiles) {
      state.storedProfiles = []
    }
    return state
  } catch {
    return { currentProfile: null, storedProfiles: [], inviteCodes: {}, lastModified: 0 }
  }
}

// Save profile state
function saveProfileState(state: ProfileState): void {
  if (typeof window === 'undefined') return
  state.lastModified = Date.now()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('[ProfileStorage] Failed to save - storage quota may be exceeded:', e)
  }
}

// Get current user profile
export function getCurrentProfile(): UserProfile | null {
  return getProfileState().currentProfile
}

// Get a profile by ID (from stored profiles or current)
export function getProfile(profileId: string): UserProfile | null {
  const state = getProfileState()

  // Check current profile
  if (state.currentProfile?.id === profileId) {
    return state.currentProfile
  }

  // Check stored profiles
  const stored = state.storedProfiles?.find(p => p.id === profileId)
  return stored || null
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

  // Sync rent/unit data to canvass if linked
  if (newProfile.buildingId && newProfile.unitNumber) {
    const hasRentData = updates.rentAmount !== undefined ||
      updates.unitType !== undefined ||
      updates.bedroomCount !== undefined ||
      updates.bathroomCount !== undefined ||
      updates.unitSqft !== undefined ||
      updates.moveInDate !== undefined ||
      updates.leaseType !== undefined ||
      updates.leaseExpires !== undefined ||
      updates.complaints !== undefined ||
      updates.maintenanceRating !== undefined ||
      updates.interestLevel !== undefined ||
      updates.occupants !== undefined ||
      updates.hasChildren !== undefined ||
      updates.hasPets !== undefined

    if (hasRentData) {
      import('./canvassStorage').then(({ syncProfileToCanvass }) => {
        syncProfileToCanvass(newProfile.buildingId!, newProfile.unitNumber!, {
          rentAmount: newProfile.rentAmount,
          unitType: newProfile.unitType,
          bedroomCount: newProfile.bedroomCount,
          bathroomCount: newProfile.bathroomCount,
          unitSqft: newProfile.unitSqft,
          moveInDate: newProfile.moveInDate,
          leaseType: newProfile.leaseType,
          leaseExpires: newProfile.leaseExpires,
          complaints: newProfile.complaints,
          maintenanceRating: newProfile.maintenanceRating,
          interestLevel: newProfile.interestLevel,
          occupants: newProfile.occupants,
          hasChildren: newProfile.hasChildren,
          hasPets: newProfile.hasPets,
        })
      })
    }
  }

  return newProfile
}

// Update profile role (admin only in real implementation)
export function updateProfileRole(role: UserRole): UserProfile | null {
  return updateProfile({ role })
}

// Logout / clear profile (preserves profile in storedProfiles)
export function clearProfile(): void {
  const state = getProfileState()

  // Save current profile to storedProfiles before clearing
  if (state.currentProfile) {
    // Check if already in storedProfiles
    const existingIndex = state.storedProfiles.findIndex(p => p.id === state.currentProfile!.id)
    if (existingIndex >= 0) {
      // Update existing
      state.storedProfiles[existingIndex] = state.currentProfile
    } else {
      // Add new
      state.storedProfiles.push(state.currentProfile)
    }
  }

  state.currentProfile = null
  saveProfileState(state)
}

// Get stored profiles on this device
export function getStoredProfiles(): UserProfile[] {
  return getProfileState().storedProfiles
}

// Login to an existing stored profile
export function loginToProfile(profileId: string): UserProfile | null {
  const state = getProfileState()

  // Find profile in storedProfiles
  const profile = state.storedProfiles.find(p => p.id === profileId)
  if (!profile) return null

  // Set as current profile
  state.currentProfile = {
    ...profile,
    lastActive: Date.now(),
  }

  saveProfileState(state)
  return state.currentProfile
}

// Delete a stored profile permanently
export function deleteStoredProfile(profileId: string): boolean {
  const state = getProfileState()

  // Remove from storedProfiles
  const index = state.storedProfiles.findIndex(p => p.id === profileId)
  if (index < 0) return false

  state.storedProfiles.splice(index, 1)

  // Also clear current if it's the same profile
  if (state.currentProfile?.id === profileId) {
    state.currentProfile = null
  }

  saveProfileState(state)
  return true
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

  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY)
    if (!deviceId) {
      deviceId = 'dev_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 11)
      localStorage.setItem(DEVICE_ID_KEY, deviceId)
    }
    return deviceId
  } catch {
    // Fallback if localStorage is unavailable
    return 'dev_' + Date.now().toString(36)
  }
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

// Emergency admin recovery - restores admin role if you have the password hash
// Usage: recoverAdminRole() in browser console
export function recoverAdminRole(): boolean {
  if (typeof window === 'undefined') return false

  // Check if admin hash exists (proves this device had an admin)
  const adminHash = localStorage.getItem('rstu_admin_hash')
  if (!adminHash) {
    console.log('No admin credentials found on this device')
    return false
  }

  const state = getProfileState()

  // Fix current profile if exists
  if (state.currentProfile) {
    state.currentProfile.role = 'admin'
    state.currentProfile.trustLevel = 'verified'
  }

  // Fix all stored profiles with admin hash
  for (const profile of state.storedProfiles) {
    // If this device has admin hash, restore admin role to first profile
    // (In a multi-user scenario, you'd want more checks here)
    if (profile.role !== 'admin') {
      profile.role = 'admin'
      profile.trustLevel = 'verified'
      console.log(`Restored admin role to profile: ${profile.nickname}`)
      break // Only restore one
    }
  }

  saveProfileState(state)
  console.log('Admin role recovered. Please refresh the page.')
  return true
}

// Expose recovery function globally for console access
if (typeof window !== 'undefined') {
  (window as unknown as { recoverAdminRole: typeof recoverAdminRole }).recoverAdminRole = recoverAdminRole
}

// ============================================
// Async Supabase-Enabled Public Functions
// These functions use Supabase when available,
// falling back to localStorage when offline
// ============================================

// Create profile with Supabase sync
export async function createProfileAsync(data: {
  nickname: string
  email?: string
  buildingId?: string
  buildingAddress?: string
  unitNumber?: string
  inviteCode?: string
}): Promise<UserProfile> {
  const normalizedEmail = data.email?.trim().toLowerCase()

  // CRITICAL: Check for duplicate email BEFORE creating profile
  if (normalizedEmail) {
    if (USE_SUPABASE && supabase) {
      const { data: existing, error } = await supabase
        .from('profiles')
        .select('id, nickname')
        .eq('email', normalizedEmail)
        .maybeSingle()

      if (!error && existing) {
        throw new Error(
          `A profile with email "${data.email}" already exists (${existing.nickname}). ` +
          `Please login instead of creating a new profile.`
        )
      }
    }
  }

  // First validate invite code (check Supabase first, then local)
  let trustLevel: TrustLevel = 'self_registered'
  let invitedBy: string | undefined
  let role: UserRole = 'tenant'

  if (data.inviteCode) {
    const validation = await validateInviteCodeAsync(data.inviteCode)
    if (validation.valid && validation.invite) {
      trustLevel = 'invited'
      invitedBy = validation.invite.createdBy
      role = validation.invite.grantRole
    }
  }

  const state = getProfileState()

  // First user becomes admin (bootstrap)
  if (!state.currentProfile && Object.keys(state.inviteCodes).length === 0) {
    // Check if any profiles exist in Supabase
    if (USE_SUPABASE && supabase) {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      if (!count || count === 0) {
        role = 'admin'
        trustLevel = 'verified'
      }
    } else {
      role = 'admin'
      trustLevel = 'verified'
    }
  }

  const profile: UserProfile = {
    id: generateId(),
    nickname: data.nickname,
    email: normalizedEmail,
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

  // Save to localStorage first (for offline access)
  state.currentProfile = profile
  saveProfileState(state)

  // Sync to Supabase
  if (USE_SUPABASE) {
    const saved = await saveProfileToDb(profile)
    if (!saved) {
      // Rollback on failure (email constraint violation)
      state.currentProfile = null
      saveProfileState(state)
      throw new Error('Failed to save profile. Email may already be in use.')
    }
  }

  // Mark invite as used
  if (data.inviteCode) {
    await useInviteCodeAsync(data.inviteCode, profile.id)
  }

  // Auto-link to canvassing
  if (profile.buildingId && profile.unitNumber && profile.buildingAddress) {
    import('./canvassStorage').then(({ ensureUnitExists, linkProfileToUnit }) => {
      ensureUnitExists(profile.buildingId!, profile.buildingAddress!, profile.unitNumber!)
      linkProfileToUnit(profile.buildingId!, profile.unitNumber!, profile.id, profile.nickname)
    })
  }

  return profile
}

// Update profile with Supabase sync
export async function updateProfileAsync(updates: Partial<UserProfile>): Promise<UserProfile | null> {
  const state = getProfileState()
  if (!state.currentProfile) return null

  const oldProfile = state.currentProfile
  const newProfile = {
    ...oldProfile,
    ...updates,
    lastActive: Date.now(),
  }

  // Save locally first
  state.currentProfile = newProfile
  saveProfileState(state)

  // Sync to Supabase
  if (USE_SUPABASE) {
    await saveProfileToDb(newProfile)
  }

  // Auto-link to canvassing if building/unit changed
  const buildingChanged = updates.buildingId !== undefined && updates.buildingId !== oldProfile.buildingId
  const unitChanged = updates.unitNumber !== undefined && updates.unitNumber !== oldProfile.unitNumber

  if ((buildingChanged || unitChanged) && newProfile.buildingId && newProfile.unitNumber && newProfile.buildingAddress) {
    import('./canvassStorage').then(({ ensureUnitExists, linkProfileToUnit }) => {
      ensureUnitExists(newProfile.buildingId!, newProfile.buildingAddress!, newProfile.unitNumber!)
      linkProfileToUnit(newProfile.buildingId!, newProfile.unitNumber!, newProfile.id, newProfile.nickname)
    })
  }

  // Sync rent/unit data to canvass if linked
  if (newProfile.buildingId && newProfile.unitNumber) {
    const hasRentData = updates.rentAmount !== undefined ||
      updates.unitType !== undefined ||
      updates.bedroomCount !== undefined ||
      updates.bathroomCount !== undefined ||
      updates.unitSqft !== undefined ||
      updates.moveInDate !== undefined ||
      updates.leaseType !== undefined ||
      updates.leaseExpires !== undefined

    if (hasRentData) {
      import('./canvassStorage').then(({ syncProfileToCanvass }) => {
        syncProfileToCanvass(newProfile.buildingId!, newProfile.unitNumber!, {
          rentAmount: newProfile.rentAmount,
          unitType: newProfile.unitType,
          bedroomCount: newProfile.bedroomCount,
          bathroomCount: newProfile.bathroomCount,
          unitSqft: newProfile.unitSqft,
          moveInDate: newProfile.moveInDate,
          leaseType: newProfile.leaseType,
          leaseExpires: newProfile.leaseExpires,
        })
      })
    }
  }

  return newProfile
}

// Validate invite code (checks Supabase first)
export async function validateInviteCodeAsync(code: string): Promise<{
  valid: boolean
  invite?: InviteCode
  error?: string
}> {
  // Try Supabase first
  if (USE_SUPABASE) {
    const dbInvite = await fetchInviteFromDb(code)
    if (dbInvite) {
      if (dbInvite.revoked) {
        return { valid: false, error: 'Invite code has been revoked' }
      }
      if (dbInvite.maxUses > 0 && dbInvite.usedCount >= dbInvite.maxUses) {
        return { valid: false, error: 'Invite code has reached max uses' }
      }
      if (dbInvite.expires > 0 && dbInvite.expires < Date.now()) {
        return { valid: false, error: 'Invite code expired' }
      }
      return { valid: true, invite: dbInvite }
    }
  }

  // Fallback to localStorage
  return validateInviteCode(code)
}

// Use invite code with Supabase sync
export async function useInviteCodeAsync(code: string, profileId: string): Promise<boolean> {
  // Update Supabase
  if (USE_SUPABASE) {
    const success = await updateInviteUsageInDb(code, profileId)
    if (success) return true
  }

  // Fallback to localStorage
  return useInviteCode(code, profileId)
}

// Create invite code with Supabase sync
export async function createInviteAsync(options: CreateInviteOptions = {}): Promise<InviteCode | null> {
  const profile = getCurrentProfile()
  if (!profile) return null

  // Check permissions
  const requestedRole = options.grantRole || 'tenant'
  if (requestedRole === 'admin' && !isAdmin()) return null
  if (requestedRole === 'organizer' && !isAdmin()) return null
  if (!hasRole('organizer')) return null

  const code = generateInviteCode()
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

  // Save to localStorage
  const state = getProfileState()
  state.inviteCodes[code] = invite
  saveProfileState(state)

  // Sync to Supabase
  if (USE_SUPABASE) {
    await saveInviteToDb(invite)
  }

  return invite
}

// Get all invite codes with Supabase support
export async function getAllInviteCodesAsync(): Promise<InviteCode[]> {
  const profile = getCurrentProfile()
  if (!profile || !hasRole('organizer')) return []

  // Try Supabase first
  if (USE_SUPABASE) {
    const creatorId = isAdmin() ? undefined : profile.id
    const dbInvites = await fetchAllInvitesFromDb(creatorId)
    if (dbInvites.length > 0) {
      return dbInvites
    }
  }

  // Fallback to localStorage
  return getAllInviteCodes()
}

// Revoke invite with Supabase sync
export async function revokeInviteAsync(code: string): Promise<boolean> {
  const profile = getCurrentProfile()
  if (!profile) return false

  // Update in Supabase
  if (USE_SUPABASE && supabase) {
    const { data } = await supabase
      .from('invite_codes')
      .select('created_by')
      .eq('code', code.toUpperCase())
      .single()

    if (data) {
      // Check permissions
      if (data.created_by !== profile.id && !isAdmin()) {
        return false
      }

      const { error } = await supabase
        .from('invite_codes')
        .update({ revoked: true })
        .eq('code', code.toUpperCase())

      if (!error) {
        // Also update localStorage
        revokeInvite(code)
        return true
      }
    }
  }

  // Fallback to localStorage only
  return revokeInvite(code)
}

// Sync local profile to Supabase (call on app startup)
export async function syncProfileToCloud(): Promise<boolean> {
  if (!USE_SUPABASE) return false

  const profile = getCurrentProfile()
  if (!profile) return false

  // Check if profile exists in Supabase
  const dbProfile = await fetchProfileFromDb(profile.id)

  if (dbProfile) {
    // Server has newer data - merge
    const serverNewer = new Date(dbProfile.lastActive).getTime() > profile.lastActive
    if (serverNewer) {
      // Update local with server role/trust (authoritative)
      const merged = {
        ...profile,
        role: dbProfile.role,
        trustLevel: dbProfile.trustLevel,
        // Keep local activity data
        lastActive: Math.max(profile.lastActive, dbProfile.lastActive),
      }
      const state = getProfileState()
      state.currentProfile = merged
      saveProfileState(state)
      console.log('[ProfileStorage] Synced profile from cloud')
      return true
    }
  }

  // Push local to server
  const success = await saveProfileToDb(profile)
  if (success) {
    console.log('[ProfileStorage] Synced profile to cloud')
  }
  return success
}

// Fetch profile by ID (useful for looking up other users)
export async function getProfileById(id: string): Promise<UserProfile | null> {
  if (USE_SUPABASE) {
    const dbProfile = await fetchProfileFromDb(id)
    if (dbProfile) return dbProfile
  }

  // Check local stored profiles
  const state = getProfileState()
  if (state.currentProfile?.id === id) return state.currentProfile
  return state.storedProfiles.find(p => p.id === id) || null
}

// Search profiles by building (for organizers)
export async function getProfilesByBuilding(buildingId: string): Promise<UserProfile[]> {
  if (!USE_SUPABASE || !supabase) return []

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('building_id', buildingId)
    .order('nickname')

  if (error || !data) return []
  return data.map(d => dbToProfile(d as DbProfile))
}

// Update last active timestamp in Supabase
export async function updateLastActiveAsync(): Promise<void> {
  const profile = getCurrentProfile()
  if (!profile) return

  // Update local
  const state = getProfileState()
  if (state.currentProfile) {
    state.currentProfile.lastActive = Date.now()
    saveProfileState(state)
  }

  // Update Supabase
  if (USE_SUPABASE && supabase) {
    await supabase
      .from('profiles')
      .update({ last_active: new Date().toISOString() })
      .eq('id', profile.id)
  }
}

// ============================================
// Email Availability Check (Duplicate Prevention)
// ============================================

/**
 * Check if an email is available (not already registered)
 * Uses Supabase as source of truth, falls back to localStorage
 */
export async function isEmailAvailable(email: string): Promise<{
  available: boolean
  existingNickname?: string
}> {
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail) {
    return { available: true }
  }

  // Check Supabase first (source of truth)
  if (USE_SUPABASE && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (!error && data) {
      return { available: false, existingNickname: data.nickname }
    }
  }

  // Fallback: check localStorage
  const state = getProfileState()
  const existing = state.storedProfiles.find(
    p => p.email?.toLowerCase() === normalizedEmail
  )

  if (existing) {
    return { available: false, existingNickname: existing.nickname }
  }

  return { available: true }
}

// Export flag for components to check
export { USE_SUPABASE }
