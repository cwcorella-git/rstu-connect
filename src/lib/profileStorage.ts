// User profile storage for tenant organizing platform

// User roles with increasing permissions
export type UserRole = 'tenant' | 'organizer' | 'admin'

// Trust level based on how account was created
export type TrustLevel = 'self_registered' | 'invited' | 'verified'

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

  // Self-reported data (tenant can edit)
  rentAmount?: number
  moveInDate?: string
  leaseType?: 'fixed' | 'month-to-month'
  occupants?: number
  complaints?: string[]
  interestLevel?: string[]

  // Contact preferences
  preferredContact?: 'phone' | 'text' | 'email'
  contactInfo?: string // Only stored if user chooses

  // Organizer-specific
  assignedBuildings?: string[] // Building IDs organizer can access

  // Invitation chain
  invitedBy?: string // Profile ID of inviter
  inviteCode?: string // Code used to create this account

  // Meta
  created: number
  lastActive: number
}

// Invite code for tenant-to-tenant invitations
export interface InviteCode {
  code: string
  createdBy: string // Profile ID
  buildingId: string
  unitNumber?: string // Pre-fill unit if known
  used: boolean
  usedBy?: string
  created: number
  expires: number
}

// Profile state
export interface ProfileState {
  currentProfile: UserProfile | null
  inviteCodes: Record<string, InviteCode>
  lastModified: number
}

const STORAGE_KEY = 'rstu_profile_data'

// Generate a random ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
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
    const invite = state.inviteCodes[data.inviteCode]
    if (invite && !invite.used && invite.expires > Date.now()) {
      trustLevel = 'invited'
      invitedBy = invite.createdBy

      // Mark invite as used
      invite.used = true
      invite.usedBy = generateId()
    }
  }

  // First user becomes admin (bootstrap)
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

  return profile
}

// Update current profile
export function updateProfile(updates: Partial<UserProfile>): UserProfile | null {
  const state = getProfileState()
  if (!state.currentProfile) return null

  state.currentProfile = {
    ...state.currentProfile,
    ...updates,
    lastActive: Date.now(),
  }
  saveProfileState(state)

  return state.currentProfile
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

// Create an invite code
export function createInvite(buildingId: string, unitNumber?: string): InviteCode | null {
  const profile = getCurrentProfile()
  if (!profile || !hasRole('organizer')) return null

  const state = getProfileState()
  const code = generateInviteCode()

  const invite: InviteCode = {
    code,
    createdBy: profile.id,
    buildingId,
    unitNumber,
    used: false,
    created: Date.now(),
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }

  state.inviteCodes[code] = invite
  saveProfileState(state)

  return invite
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
  if (invite.used) {
    return { valid: false, error: 'Invite code already used' }
  }
  if (invite.expires < Date.now()) {
    return { valid: false, error: 'Invite code expired' }
  }

  return { valid: true, invite }
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
