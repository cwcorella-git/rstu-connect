// User profile storage for tenant organizing platform
// Supports both localStorage (offline) and Supabase (cloud sync)

import { supabase, USE_SUPABASE, DbProfile, DbInviteCode } from '../services/supabase'
import { safeJsonParse } from '../utils/safeStorage'
import { createLogger } from '../utils/logger'
import { generateUUID, generateShortId as idUtilsGenerateShortId, generateEntityId, isLocalId } from '../utils/idUtils'

const log = createLogger('Profile')

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

// Rent history entry for tracking rent over time
export interface RentHistoryEntry {
  date: string               // ISO date (YYYY-MM)
  amount: number            // Monthly rent amount
}

export interface RentComparison {
  percentChange: number      // YoY percentage change
  dollarChange: number       // YoY dollar change
  isUnusualSpike: boolean   // True if increase > 5% (above regional average)
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
  emailVerified?: boolean
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
  leaseStartDate?: string        // ISO date string (organizer tracking)
  leaseEndDate?: string          // ISO date string (organizer tracking)
  isMonthToMonth?: boolean       // month-to-month flag (organizer tracking)
  securityDeposit?: number
  lastRentIncrease?: number
  rentHistory?: RentHistoryEntry[] // Historical rent amounts (for tracking increases)

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

  // Personalization & Circles
  interests?: string[]                    // Free-form interest tags (gardening, gaming, books, etc.)
  activities?: string[]                   // Community activities (mutual_aid, events, advocacy, etc.)
  connectionPreference?: 'building' | 'neighborhood' | 'city'  // Preferred matching scope
  circleIds?: string[]                    // IDs of Circles the user has joined
  showInDirectory?: boolean               // Opt-in to be discoverable by other tenants

  // Organizer-specific
  assignedBuildings?: string[] // Building IDs organizer can access
  notes?: string // Internal organizer notes

  // Invitation chain
  invitedBy?: string // Profile ID of inviter
  inviteCode?: string // Code used to create this account

  // Verification (for verified users)
  verifiedAt?: number // Timestamp of verification
  verifiedBy?: string // Profile ID of organizer/admin who verified

  // Activity tracking
  lastChatMessage?: number
  lastDocumentRead?: number
  lastToolsUsage?: number
  chatMessageCount?: number

  // Meta
  created: number
  lastActive: number

  // Moderation
  banned?: boolean // True if user is banned (cannot login, hidden from lists)
  bannedAt?: number // Timestamp of ban
  bannedBy?: string // Profile ID of admin who banned user

  // Elected position
  officerTitle?: string  // Current elected position title, e.g. "President"

  // Cross-device sync
  syncMeta?: SyncMeta
}

// Invite code for tenant-to-tenant invitations
export interface InviteCode {
  code: string
  createdBy: string // Profile ID
  createdByName?: string // Nickname of creator
  createdByRole?: UserRole // Role of creator (for auto-verify logic)
  buildingId?: string // Optional - link to specific building (for auto-linking to canvassing)
  buildingAddress?: string // Optional - full address for display (e.g., "123 Main St")
  unitNumber?: string // Optional - pre-fill unit if known (for auto-linking to canvassing)
  grantRole: UserRole // Role to give the invitee
  maxUses: number // 0 = unlimited, otherwise max number of uses
  usedCount: number // How many times used
  usedBy: string[] // List of profile IDs who used it
  revoked: boolean // Whether code has been revoked
  created: number
  expires: number // 0 = never expires
  localOnly?: boolean // True if cloud sync failed - code only works on creator's device
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
// Personalization Constants
// ============================================

// Suggested interests for profile personalization
export const SUGGESTED_INTERESTS = [
  'gardening',
  'cooking',
  'book_club',
  'gaming',
  'fitness',
  'art',
  'music',
  'pets',
  'crafts',
  'hiking',
  'photography',
  'languages',
  'movies',
  'board_games',
  'yoga',
  'parenting',
  'sustainability',
  'tech',
  'writing',
  'volunteering',
] as const

// Activity preferences for community involvement
export const COMMUNITY_ACTIVITIES = [
  'mutual_aid',
  'events',
  'advocacy',
  'skill_sharing',
  'neighborly',
  'organizing',
] as const

// Labels for interests (for UI display)
export const INTEREST_LABELS: Record<string, string> = {
  gardening: 'Gardening',
  cooking: 'Cooking & Food',
  book_club: 'Book Club',
  gaming: 'Gaming',
  fitness: 'Fitness',
  art: 'Art & Drawing',
  music: 'Music',
  pets: 'Pets & Animals',
  crafts: 'Crafts & DIY',
  hiking: 'Hiking & Outdoors',
  photography: 'Photography',
  languages: 'Language Learning',
  movies: 'Movies & TV',
  board_games: 'Board Games',
  yoga: 'Yoga & Meditation',
  parenting: 'Parenting',
  sustainability: 'Sustainability',
  tech: 'Technology',
  writing: 'Writing',
  volunteering: 'Volunteering',
}

// Labels for activities
export const ACTIVITY_LABELS: Record<string, string> = {
  mutual_aid: 'Mutual Aid',
  events: 'Community Events',
  advocacy: 'Advocacy & Activism',
  skill_sharing: 'Skill Sharing',
  neighborly: 'Being Neighborly',
  organizing: 'Tenant Organizing',
}

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
    emailVerified: db.email_verified || false,
    preferredContact: db.preferred_contact || undefined,
    language: db.language || undefined,
    rentAmount: db.rent_amount || undefined,
    rentHistory: db.rent_history ? safeJsonParse(db.rent_history, undefined) : undefined,
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
    email_verified: profile.emailVerified || false,
    preferred_contact: profile.preferredContact || null,
    language: profile.language || null,
    rent_amount: profile.rentAmount || null,
    rent_history: profile.rentHistory ? JSON.stringify(profile.rentHistory) : null,
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

// Check if a profile has been deleted from Supabase (e.g. by an admin)
// Returns true if Supabase is configured and the profile does NOT exist
export async function isProfileDeletedInDb(id: string): Promise<boolean> {
  if (!supabase) return false // Can't check — assume not deleted

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', id)
    .single()

  // If error (PGRST116 = no rows) or no data, profile was deleted
  return !data || !!error
}

// Save profile to Supabase
async function saveProfileToDb(profile: UserProfile): Promise<boolean> {
  if (!supabase) {
    log.warn('saveProfileToDb: Supabase not configured')
    return false
  }

  const dbProfile = profileToDb(profile)

  // Use onConflict with both 'id' and 'email' to handle both unique constraints
  const { error } = await supabase
    .from('profiles')
    .upsert(dbProfile, { onConflict: 'id' })

  if (error) {
    log.error('saveProfileToDb error:', { code: error.code, message: error.message })
    // If we hit a duplicate email constraint, try to find and update the existing profile
    if (error.code === '23505' && error.message.includes('email')) {
      // Try to fetch the existing profile by email
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', profile.email)
        .single()

      if (existing) {
        // Update the existing profile with the ID we found
        const updatedProfile = { ...dbProfile, id: existing.id }
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert(updatedProfile, { onConflict: 'id' })

        if (updateError) {
          log.error('saveProfileToDb retry error:', { code: updateError.code, message: updateError.message })
          return false
        }
        log.info('Profile saved to cloud (updated existing):', profile.id)
        return true
      }
    }

    return false
  }
  log.info('Profile saved to cloud:', profile.id)
  return true
}

// Fetch invite code from Supabase
async function fetchInviteFromDb(code: string): Promise<InviteCode | null> {
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (error || !data) {
      return null
    }

    return dbToInvite(data as DbInviteCode)
  } catch {
    return null
  }
}

// Save invite code to Supabase
async function saveInviteToDb(invite: InviteCode): Promise<boolean> {
  if (!supabase) {
    log.warn('saveInviteToDb: Supabase not configured')
    return false
  }

  try {
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
      log.error('saveInviteToDb failed:', { code: error.code, message: error.message })
      return false
    }

    log.info('Invite code saved to cloud:', invite.code)
    return true
  } catch (err) {
    log.error('saveInviteToDb exception:', err)
    return false
  }
}

// Update invite usage in Supabase
async function updateInviteUsageInDb(code: string, profileId: string): Promise<boolean> {
  if (!supabase) return false

  try {
    // First fetch current state
    const { data, error: fetchError } = await supabase
      .from('invite_codes')
      .select('used_count, used_by')
      .eq('code', code.toUpperCase())
      .single()

    if (fetchError || !data) {
      return false
    }

    // Update with new usage
    const { error: updateError } = await supabase
      .from('invite_codes')
      .update({
        used_count: (data.used_count || 0) + 1,
        used_by: [...(data.used_by || []), profileId],
      })
      .eq('code', code.toUpperCase())

    if (updateError) {
      return false
    }

    return true
  } catch {
    return false
  }
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

// Use imported functions from idUtils:
// - generateUUID() for full UUIDs (profile IDs)
// - idUtilsGenerateShortId() for short IDs (compound IDs)

// Alias for backwards compatibility
function generateId(): string {
  return generateUUID()
}

function generateShortId(): string {
  return idUtilsGenerateShortId()
}

// Generate a cryptographically random bootstrap code
function generateBootstrapCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No confusing chars
  let code = 'RSTU-'
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(8)
    crypto.getRandomValues(bytes)
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(bytes[i] % chars.length)
    }
  } else {
    throw new Error('Crypto API not available')
  }
  return code
}

// Bootstrap code for first admin - loaded from environment variable
// WARNING: In static builds, this will be embedded in the client bundle.
// For production, consider using a Supabase Edge Function for bootstrap validation.
const BOOTSTRAP_ADMIN_CODE = process.env.NEXT_PUBLIC_BOOTSTRAP_ADMIN_CODE || ''

// Initialize bootstrap - just checks if needed (no console logging)
export function initBootstrapCode(): string | null {
  if (typeof window === 'undefined') return null
  // Bootstrap disabled if no code configured
  if (!BOOTSTRAP_ADMIN_CODE) return null
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

  // Validate against bootstrap code (disabled if not configured)
  if (!BOOTSTRAP_ADMIN_CODE || inputCode.toUpperCase() !== BOOTSTRAP_ADMIN_CODE) return null

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
    log.error('Failed to save admin hash:', e)
  }

  state.currentProfile = profile
  saveProfileState(state)

  return profile
}

// Get password hash for a specific profile
export function getPasswordHashForProfile(profileId: string): string | null {
  try {
    const hashes = localStorage.getItem('rstu_profile_hashes')
    if (!hashes) return null
    const hashMap = JSON.parse(hashes)
    return hashMap[profileId] || null
  } catch {
    return null
  }
}

// Set password hash for a specific profile
export function setPasswordHashForProfile(profileId: string, passwordHash: string): void {
  try {
    const hashes = localStorage.getItem('rstu_profile_hashes') || '{}'
    const hashMap = JSON.parse(hashes)
    hashMap[profileId] = passwordHash
    localStorage.setItem('rstu_profile_hashes', JSON.stringify(hashMap))
  } catch (e) {
    log.error('Failed to save profile password hash:', e)
  }
}

// Simple hash function (not cryptographically secure - use server-side bcrypt in production)
export function simpleHash(str: string): string {
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
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(6)
    crypto.getRandomValues(bytes)
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(bytes[i] % chars.length)
    }
  } else {
    throw new Error('Crypto API not available')
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
    log.error('Failed to save - storage quota may be exceeded:', e)
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

// Check if user can access Organize tab (chat, events, building coordination)
export function canAccessOrganize(): boolean {
  const profile = getCurrentProfile()
  if (!profile) return false

  // Check if admin has disabled the Organize tab site-wide
  // Import dynamically to avoid circular dependency
  try {
    const { isOrganizeTabEnabled } = require('./adminSettingsStorage')
    if (!isOrganizeTabEnabled()) return false
  } catch {
    // If adminSettingsStorage not available, default to enabled
  }

  // Only fully verified users can access
  return profile.trustLevel === 'verified'
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

  // Treat activity within 5 seconds of account creation as "never active"
  if (lastActivity === 0 || Math.abs(lastActivity - profile.created) < 5000) {
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
  let verifiedAt: number | undefined
  let verifiedBy: string | undefined

  if (data.inviteCode) {
    const validation = validateInviteCode(data.inviteCode)
    if (validation.valid && validation.invite) {
      const invite = validation.invite
      invitedBy = invite.createdBy
      role = invite.grantRole // Use the role specified in the invite

      // Auto-verify if created by organizer or admin
      if (invite.createdByRole === 'organizer' || invite.createdByRole === 'admin') {
        trustLevel = 'verified'
        verifiedAt = Date.now()
        verifiedBy = invite.createdBy

        // Log auto-verification
        logVerificationAction({
          userId: undefined, // Will be set after profile is created
          verifiedBy: invite.createdBy,
          timestamp: Date.now(),
          action: 'auto_verify_from_invite'
        })
      } else {
        trustLevel = 'invited'
      }

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
    verifiedAt,
    verifiedBy,
    created: Date.now(),
    lastActive: Date.now(),
  }

  state.currentProfile = profile
  saveProfileState(state)

  // Mark invite code as used
  if (data.inviteCode) {
    redeemInviteCode(data.inviteCode, profile.id)
  }

  // Auto-link to canvassing if building and unit are specified
  if (profile.buildingId && profile.unitNumber && profile.buildingAddress) {
    import('./canvassStorage').then(({ ensureUnitExists, linkProfileToUnit }) => {
      ensureUnitExists(profile.buildingId!, profile.buildingAddress!, profile.unitNumber!)
      linkProfileToUnit(
        profile.buildingId!,
        profile.unitNumber!,
        profile.id,
        profile.nickname,
        profile.trustLevel === 'verified'
      )
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
      linkProfileToUnit(
        newProfile.buildingId!,
        newProfile.unitNumber!,
        newProfile.id,
        newProfile.nickname,
        newProfile.trustLevel === 'verified'
      )
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

  // Sync status when trust level changes to verified
  if (updates.trustLevel === 'verified' && newProfile.buildingId && newProfile.unitNumber) {
    import('./canvassStorage').then(({ getUnit, updateUnitStatus }) => {
      const unit = getUnit(newProfile.buildingId!, newProfile.unitNumber!)
      // Only upgrade if linked to this profile and not already active
      if (unit?.profileId === newProfile.id && unit.status !== 'ACTIVE_MEMBER') {
        updateUnitStatus(newProfile.buildingId!, newProfile.unitNumber!, 'ACTIVE_MEMBER')
      }
    })
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
export function loginToProfile(profileId: string, password?: string): UserProfile | null {
  const state = getProfileState()

  // Find profile in storedProfiles
  const profile = state.storedProfiles.find(p => p.id === profileId)
  if (!profile) return null

  // If password provided, verify it
  if (password) {
    const passwordHash = simpleHash(password)
    const storedHash = getPasswordHashForProfile(profileId)

    if (!storedHash || passwordHash !== storedHash) {
      log.warn('Invalid password for profile:', profileId)
      return null
    }
  }

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
  buildingAddress?: string // Optional - full address for display in invite
  unitNumber?: string
  grantRole?: UserRole // Default: tenant
  maxUses?: number // Default: 1, 0 = unlimited
  expiresIn?: number // Milliseconds, 0 = never, default: 7 days
}

// Create an invite code
export function createInvite(options: CreateInviteOptions = {}): InviteCode | null {
  const profile = getCurrentProfile()
  if (!profile) return null

  // Check permissions for requested role
  // - Admins can create any role
  // - Organizers can create tenant/organizer (not admin)
  // - Tenants can only create tenant invites
  const requestedRole = options.grantRole || 'tenant'
  if (requestedRole === 'admin' && !isAdmin()) return null
  if (requestedRole === 'organizer' && !hasRole('organizer')) return null

  const state = getProfileState()
  const code = generateInviteCode()

  // Default expiration: 7 days
  const expiresIn = options.expiresIn !== undefined ? options.expiresIn : 7 * 24 * 60 * 60 * 1000

  const invite: InviteCode = {
    code,
    createdBy: profile.id,
    createdByName: profile.nickname,
    createdByRole: profile.role,
    buildingId: options.buildingId,
    buildingAddress: options.buildingAddress,
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
  const lookupCode = code.toUpperCase()
  const invite = state.inviteCodes[lookupCode]

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
export function redeemInviteCode(code: string, profileId: string): boolean {
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
  if (typeof window === 'undefined') return ''

  const params = new URLSearchParams({
    action: 'create-profile',
    building: buildingId,
    address: buildingAddress,
  })
  if (unitNumber) {
    params.set('unit', unitNumber)
  }

  // Use full URL to preserve basePath (same pattern as buildInviteQRUrl)
  const url = new URL(window.location.href)
  url.search = `?${params.toString()}`
  return url.href
}

// Build QR code URL with invite code (with optional building/unit pre-fill)
export function buildInviteQRUrl(
  inviteCode: string,
  buildingId?: string,
  buildingAddress?: string,
  unitNumber?: string
): string {
  if (typeof window === 'undefined') return ''

  const params = new URLSearchParams({ invite: inviteCode })
  if (buildingId) params.set('building', buildingId)
  if (buildingAddress) params.set('address', buildingAddress)
  if (unitNumber) params.set('unit', unitNumber)

  // Create URL from current location to preserve basePath
  const url = new URL(window.location.href)
  url.search = `?${params.toString()}`
  return url.href
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
      // Use crypto.randomUUID for secure device ID generation
      const randomPart = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().replace(/-/g, '').substring(0, 12)
        : Date.now().toString(36)
      deviceId = 'dev_' + randomPart
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
  log.warn('Remote profile ID mismatch, keeping local')
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
      break // Only restore one
    }
  }

  saveProfileState(state)
  return true
}

// Expose recovery function globally for console access
if (typeof window !== 'undefined') {
  (window as unknown as { recoverAdminRole: typeof recoverAdminRole }).recoverAdminRole = recoverAdminRole
}

// ============================================
// Verification System
// ============================================

/**
 * Manually verify a user profile (organizer/admin only)
 * Updates trustLevel to 'verified' and logs audit trail
 */
export function verifyProfile(userId: string, verifiedBy: string): boolean {
  const currentUser = getCurrentProfile()

  // Only organizers and admins can verify
  if (!currentUser || (currentUser.role !== 'organizer' && currentUser.role !== 'admin')) {
    log.error('Only organizers/admins can verify users')
    return false
  }

  const state = getProfileState()

  // Find the profile in stored profiles or current profile
  const allProfiles = [
    ...(state.currentProfile ? [state.currentProfile] : []),
    ...state.storedProfiles
  ]

  const profile = allProfiles.find(p => p.id === userId)

  if (!profile) {
    log.error('Profile not found')
    return false
  }

  if (profile.trustLevel === 'verified') {
    return true
  }

  // Update trust level
  profile.trustLevel = 'verified'
  profile.verifiedAt = Date.now()
  profile.verifiedBy = verifiedBy

  // Save updated profile
  if (state.currentProfile?.id === userId) {
    state.currentProfile = profile
  } else {
    const idx = state.storedProfiles.findIndex(p => p.id === userId)
    if (idx >= 0) {
      state.storedProfiles[idx] = profile
    }
  }

  saveProfileState(state)

  // Log audit trail
  logVerificationAction({
    userId,
    verifiedBy,
    timestamp: Date.now(),
    action: 'manual_verification'
  })

  // Sync to Supabase if available (fire-and-forget)
  syncVerificationToSupabase(userId, verifiedBy).catch(e => log.error('Async operation failed', e))

  return true
}

/**
 * Sync verification to Supabase (internal fire-and-forget)
 */
async function syncVerificationToSupabase(userId: string, verifiedBy: string): Promise<void> {
  if (!USE_SUPABASE || !supabase) return

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        trust_level: 'verified',
        verified_at: new Date().toISOString(),
        verified_by: verifiedBy
      })
      .eq('id', userId)

    if (error) throw error

    // Log to audit table if it exists
    try {
      await supabase.from('verification_audit').insert({
        user_id: userId,
        verified_by: verifiedBy,
        action: 'manual_verification',
        timestamp: new Date().toISOString()
      })
    } catch {
      // Table might not exist yet, that's ok
    }
  } catch (error) {
    log.error('Failed to sync verification to Supabase:', error)
  }
}

/**
 * Async wrapper for profile verification that includes Supabase sync
 * Returns true if verification succeeded (localStorage + Supabase)
 */
export async function verifyProfileAsyncWithSync(userId: string, verifiedBy: string): Promise<boolean> {
  const currentUser = getCurrentProfile()

  // Only organizers and admins can verify
  if (!currentUser || (currentUser.role !== 'organizer' && currentUser.role !== 'admin')) {
    log.error('Only organizers/admins can verify users')
    return false
  }

  // Try local verification first (will work if profile is in localStorage)
  const localSuccess = verifyProfile(userId, verifiedBy)

  // Update Supabase regardless of local result (profile may only exist in Supabase)
  if (USE_SUPABASE && supabase) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          trust_level: 'verified',
          verified_at: new Date().toISOString(),
          verified_by: verifiedBy
        })
        .eq('id', userId)

      if (error) {
        log.error('Supabase update failed:', error.message)
        return localSuccess // Return local result if Supabase fails
      }

      return true
    } catch (err) {
      log.error('Supabase error:', err)
      return localSuccess
    }
  }

  return localSuccess
}

/**
 * Delete a profile from localStorage and Supabase
 * Only users with higher role can delete
 */
export async function deleteProfileAsync(profileId: string): Promise<boolean> {
  const currentUser = getCurrentProfile()

  // Check permissions - only organizers and admins can delete
  if (!currentUser || (currentUser.role !== 'organizer' && currentUser.role !== 'admin')) {
    log.error('Only organizers/admins can delete profiles')
    return false
  }

  const state = getProfileState()

  // Find the profile to delete - check localStorage first
  let profileToDelete = state.currentProfile?.id === profileId
    ? state.currentProfile
    : state.storedProfiles.find(p => p.id === profileId)

  // If not in localStorage, try to fetch from Supabase to check role
  if (!profileToDelete && USE_SUPABASE && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', profileId)
        .single()

      if (!error && data) {
        profileToDelete = {
          id: data.id,
          role: data.role as UserRole,
          nickname: '',
          trustLevel: 'self_registered',
          created: 0,
          lastActive: 0
        } as UserProfile
      }
    } catch {
      // Continue - will fail below if profile not found
    }
  }

  if (!profileToDelete) {
    log.error('Profile not found')
    return false
  }

  // Check role hierarchy - can only delete lower-ranked profiles
  const roleHierarchy: UserRole[] = ['tenant', 'organizer', 'admin']
  const currentUserRoleIndex = roleHierarchy.indexOf(currentUser.role)
  const targetUserRoleIndex = roleHierarchy.indexOf(profileToDelete.role)

  if (currentUserRoleIndex <= targetUserRoleIndex) {
    log.error('Cannot delete user with same or higher role')
    return false
  }

  // Delete from localStorage if present
  if (state.currentProfile?.id === profileId) {
    state.currentProfile = null
    saveProfileState(state)
  } else if (state.storedProfiles.some(p => p.id === profileId)) {
    state.storedProfiles = state.storedProfiles.filter(p => p.id !== profileId)
    saveProfileState(state)
  }

  // Delete from Supabase
  if (USE_SUPABASE && supabase) {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId)

      if (error) {
        log.error('Supabase delete failed:', error.message)
        // RLS may block delete - this is expected with anon key
        // Return false to indicate failure
        return false
      }

      // Profile deleted successfully
      return true
    } catch (err) {
      // Log error but don't expose details to user
      if (process.env.NODE_ENV === 'development') {
        log.error('Supabase error:', err)
      }
      return false
    }
  }

  return true
}

/**
 * Ban a profile - prevents login and hides from lists
 * Only admins can ban, cannot ban other admins
 */
export async function banProfile(profileId: string): Promise<boolean> {
  const currentUser = getCurrentProfile()

  // Only admins can ban
  if (!currentUser || currentUser.role !== 'admin') {
    log.error('Only admins can ban profiles')
    return false
  }

  const state = getProfileState()

  // Find the profile to ban
  let profileToBan = state.currentProfile?.id === profileId ? state.currentProfile : state.storedProfiles.find(p => p.id === profileId)

  if (!profileToBan) {
    log.error('Profile not found')
    return false
  }

  // Cannot ban other admins
  if (profileToBan.role === 'admin') {
    log.error('Cannot ban admin users')
    return false
  }

  // Cannot ban self
  if (profileToBan.id === currentUser.id) {
    log.error('Cannot ban yourself')
    return false
  }

  // Set banned status in localStorage
  profileToBan.banned = true
  profileToBan.bannedAt = Date.now()
  profileToBan.bannedBy = currentUser.id

  saveProfileState(state)

  // Sync to Supabase
  if (USE_SUPABASE && supabase) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          banned: true,
          banned_at: new Date().toISOString(),
          banned_by: currentUser.id
        })
        .eq('id', profileId)

      if (error) throw error
    } catch {
      // Still return true since local ban succeeded
    }
  }

  return true
}

/**
 * Unban a profile - reverses a ban
 * Only admins can unban
 */
export async function unbanProfile(profileId: string): Promise<boolean> {
  const currentUser = getCurrentProfile()

  // Only admins can unban
  if (!currentUser || currentUser.role !== 'admin') {
    log.error('Only admins can unban profiles')
    return false
  }

  const state = getProfileState()

  // Find the profile to unban
  let profileToUnban = state.currentProfile?.id === profileId ? state.currentProfile : state.storedProfiles.find(p => p.id === profileId)

  if (!profileToUnban) {
    log.error('Profile not found')
    return false
  }

  if (!profileToUnban.banned) {
    return true
  }

  // Clear banned status in localStorage
  profileToUnban.banned = false
  profileToUnban.bannedAt = undefined
  profileToUnban.bannedBy = undefined

  saveProfileState(state)

  // Sync to Supabase
  if (USE_SUPABASE && supabase) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          banned: false,
          banned_at: null,
          banned_by: null
        })
        .eq('id', profileId)

      if (error) throw error
    } catch {
      // Still return true since local unban succeeded
    }
  }

  return true
}

/**
 * Log verification action to local audit trail
 */
function logVerificationAction(action: {
  userId?: string
  verifiedBy: string
  timestamp: number
  action: string
}): void {
  if (typeof window === 'undefined') return

  const auditLog = safeJsonParse(localStorage.getItem('verification_audit'), [] as unknown[])
  auditLog.push(action)

  // Keep only last 500 entries to prevent storage bloat
  if (auditLog.length > 500) {
    auditLog.shift()
  }

  localStorage.setItem('verification_audit', JSON.stringify(auditLog))
}

// ============================================
// Async Supabase-Enabled Public Functions
// These functions use Supabase when available,
// falling back to localStorage when offline
// ============================================

// Create profile with Supabase sync and optional Supabase Auth
export async function createProfileAsync(data: {
  nickname: string
  email?: string
  emailVerified?: boolean // Whether email has been verified via verification code
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
    emailVerified: data.emailVerified || false,
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
    await redeemInviteCodeAsync(data.inviteCode, profile.id)
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
    try {
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
    } catch {
      // Fall through to localStorage below
    }
  }

  // Fallback to localStorage (works cross-device if sync is working, always works locally)
  return validateInviteCode(code)
}

// Use invite code with Supabase sync
export async function redeemInviteCodeAsync(code: string, profileId: string): Promise<boolean> {
  // Update Supabase
  if (USE_SUPABASE) {
    const success = await updateInviteUsageInDb(code, profileId)
    if (success) return true
  }

  // Fallback to localStorage
  return redeemInviteCode(code, profileId)
}

// Create invite code with Supabase sync
export async function createInviteAsync(options: CreateInviteOptions = {}): Promise<InviteCode | null> {
  const profile = getCurrentProfile()
  if (!profile) {
    return null
  }

  // Check permissions
  const requestedRole = options.grantRole || 'tenant'
  if (requestedRole === 'admin' && !isAdmin()) {
    return null
  }
  if (requestedRole === 'organizer' && !isAdmin()) {
    return null
  }
  if (!hasRole('organizer')) {
    return null
  }

  // IMPORTANT: Sync creator's profile to Supabase first (required for foreign key constraint)
  let profileSynced = false
  if (USE_SUPABASE) {
    profileSynced = await syncProfileToCloud()
    if (!profileSynced) {
      log.warn('Failed to sync profile to cloud - invite code may not work on other devices')
    }
  }

  const code = generateInviteCode()
  const expiresIn = options.expiresIn !== undefined ? options.expiresIn : 7 * 24 * 60 * 60 * 1000

  const invite: InviteCode = {
    code,
    createdBy: profile.id,
    createdByName: profile.nickname,
    createdByRole: profile.role,
    buildingId: options.buildingId,
    buildingAddress: options.buildingAddress,
    unitNumber: options.unitNumber,
    grantRole: requestedRole,
    maxUses: options.maxUses !== undefined ? options.maxUses : 1,
    usedCount: 0,
    usedBy: [],
    revoked: false,
    created: Date.now(),
    expires: expiresIn === 0 ? 0 : Date.now() + expiresIn,
  }

  // Save to localStorage first (always reliable)
  const state = getProfileState()
  state.inviteCodes[code] = invite
  saveProfileState(state)

  // Sync to Supabase (required for cross-device invite code validation)
  if (USE_SUPABASE) {
    const saved = await saveInviteToDb(invite)
    if (!saved) {
      log.warn('Invite code NOT synced to cloud - will only work on this device:', code)
      // Mark the invite as local-only so UI can warn user
      invite.localOnly = true
      state.inviteCodes[code] = invite
      saveProfileState(state)
    }
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
      return true
    }
  }

  // Push local to server
  return await saveProfileToDb(profile)
}

// Login by email - allows existing users to login from any device
export async function loginByEmailAsync(email: string, password?: string): Promise<UserProfile | null> {
  if (!USE_SUPABASE || !supabase) {
    return null
  }

  try {
    // Look up profile by email in Supabase
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (error || !data) {
      return null
    }

    // Convert database profile to app profile
    const profile = dbToProfile(data as DbProfile)

    // Check if profile is banned
    if (profile.banned) {
      return null
    }

    // Set as current profile
    const state = getProfileState()
    state.currentProfile = profile
    saveProfileState(state)

    return profile
  } catch {
    return null
  }
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

// Get profiles by role (for routing feedback to admins)
export async function getProfilesByRole(role: UserRole): Promise<UserProfile[]> {
  if (!USE_SUPABASE || !supabase) return []

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', role)
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

// ============================================
// Rent Comparison & History Helpers
// ============================================

/**
 * Calculate year-over-year rent increase
 * Returns the percentage change and dollar amount
 */
export function calculateYoyRentIncrease(rentHistory?: RentHistoryEntry[], currentRent?: number): RentComparison | null {
  if (!rentHistory || rentHistory.length === 0 || !currentRent) {
    return null
  }

  // Sort history by date
  const sorted = [...rentHistory].sort((a, b) => a.date.localeCompare(b.date))

  // Find rent from exactly one year ago (or closest month)
  const today = new Date()
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), 1)
  const targetMonth = oneYearAgo.toISOString().slice(0, 7) // YYYY-MM format

  let oldRent: number | null = null

  // Try exact match or closest prior month
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].date <= targetMonth) {
      oldRent = sorted[i].amount
      break
    }
  }

  if (!oldRent) {
    // No historical data from a year ago
    return null
  }

  const dollarChange = currentRent - oldRent
  const percentChange = (dollarChange / oldRent) * 100

  // Consider unusual if > 5% (above typical regional average of ~3%)
  const isUnusualSpike = percentChange > 5

  return {
    percentChange: Math.round(percentChange * 10) / 10,
    dollarChange: Math.round(dollarChange),
    isUnusualSpike,
  }
}

/**
 * Add a rent entry to rent history
 * Maintains chronological order and prevents duplicates
 */
export function addRentHistoryEntry(rentHistory: RentHistoryEntry[] = [], date: string, amount: number): RentHistoryEntry[] {
  // Remove any existing entry for this month
  const filtered = rentHistory.filter(e => e.date !== date)

  // Add new entry
  const updated = [...filtered, { date, amount }]

  // Sort chronologically
  return updated.sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Calculate cumulative extra rent paid vs. regional average
 * Assumes 3% annual regional increase baseline
 */
export function calculateCumulativeOvercharge(rentHistory?: RentHistoryEntry[], currentRent?: number): number {
  if (!rentHistory || rentHistory.length < 2 || !currentRent) {
    return 0
  }

  const sorted = [...rentHistory].sort((a, b) => a.date.localeCompare(b.date))
  const baselineIncreasePerYear = 0.03 // 3% is regional average
  let firstRent = sorted[0].amount
  let totalOvercharge = 0

  // Calculate month by month
  for (const entry of sorted) {
    const [year, month] = entry.date.split('-').map(Number)
    const monthIndex = (year - parseInt(sorted[0].date.split('-')[0])) * 12 + (month - 1)

    // Expected rent based on baseline increase
    const expectedRent = firstRent * Math.pow(1 + baselineIncreasePerYear / 12, monthIndex)
    const overcharge = Math.max(0, entry.amount - expectedRent)
    totalOvercharge += overcharge
  }

  return Math.round(totalOvercharge)
}

/**
 * Determine if user should be alerted about unusual rent increase
 */
export function shouldAlertAboutRentIncrease(rentComparison: RentComparison | null): boolean {
  if (!rentComparison) return false
  return rentComparison.isUnusualSpike && rentComparison.percentChange > 0
}

// Export flag for components to check
export { USE_SUPABASE }
