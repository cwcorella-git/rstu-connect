/**
 * Tests for profileStorage.ts
 * Focus: User profiles, roles, permissions, invite codes, authentication
 */

import {
  hasRole,
  isAdmin,
  canAccessTools,
  isLoggedIn,
  createProfile,
  updateProfile,
  getCurrentProfile,
  getProfile,
  clearProfile,
  createInvite,
  validateInviteCode,
  redeemInviteCode,
  revokeInvite,
  deleteInvite,
  getAllInviteCodes,
  getActivityStatus,
  trackActivity,
  getRoleLabel,
  getTrustLabel,
  loginToProfile,
  getStoredProfiles,
  type UserProfile,
  type UserRole,
  type TrustLevel,
} from '../storage/profileStorage'

// Mock crypto for generateInviteCode
const mockCrypto = {
  getRandomValues: (arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256)
    }
    return arr
  },
  randomUUID: () => `test-uuid-${Math.random().toString(36).substr(2, 9)}`,
}

// Mock localStorage
const mockLocalStorage: Record<string, string> = {}

beforeAll(() => {
  // Mock crypto
  Object.defineProperty(global, 'crypto', {
    value: mockCrypto,
    writable: true,
  })

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        mockLocalStorage[key] = value
      }),
      removeItem: jest.fn((key: string) => {
        delete mockLocalStorage[key]
      }),
      clear: jest.fn(() => {
        Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key])
      }),
    },
    writable: true,
  })
})

beforeEach(() => {
  // Clear mock localStorage before each test
  Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key])
  jest.clearAllMocks()
})

describe('Profile Creation', () => {
  it('first user becomes admin when no profiles exist', () => {
    // First profile with no invite codes should become admin
    const profile = createProfile({
      nickname: 'First Admin',
    })

    expect(profile.role).toBe('admin')
    expect(profile.trustLevel).toBe('verified')
    expect(profile.nickname).toBe('First Admin')
    expect(profile.id).toBeDefined()
  })

  it('sets current profile after creation', () => {
    createProfile({ nickname: 'Test User' })

    const current = getCurrentProfile()
    expect(current).not.toBeNull()
    expect(current!.nickname).toBe('Test User')
  })

  it('includes building info when provided', () => {
    const profile = createProfile({
      nickname: 'Test User',
      buildingId: 'building-1',
      buildingAddress: '123 Main St',
      unitNumber: '101',
    })

    expect(profile.buildingId).toBe('building-1')
    expect(profile.buildingAddress).toBe('123 Main St')
    expect(profile.unitNumber).toBe('101')
  })
})

describe('Role Hierarchy', () => {
  beforeEach(() => {
    // Start fresh - first user becomes admin
    clearProfile()
  })

  it('admin has all roles', () => {
    // First user becomes admin
    createProfile({ nickname: 'Admin' })

    expect(hasRole('tenant')).toBe(true)
    expect(hasRole('organizer')).toBe(true)
    expect(hasRole('admin')).toBe(true)
  })

  it('organizer has organizer and tenant roles', () => {
    // Create admin first
    createProfile({ nickname: 'Admin' })
    // Downgrade to organizer
    updateProfile({ role: 'organizer' })

    expect(hasRole('tenant')).toBe(true)
    expect(hasRole('organizer')).toBe(true)
    expect(hasRole('admin')).toBe(false)
  })

  it('tenant only has tenant role', () => {
    // Create admin first
    createProfile({ nickname: 'Admin' })
    // Downgrade to tenant
    updateProfile({ role: 'tenant' })

    expect(hasRole('tenant')).toBe(true)
    expect(hasRole('organizer')).toBe(false)
    expect(hasRole('admin')).toBe(false)
  })

  it('returns false when not logged in', () => {
    expect(hasRole('tenant')).toBe(false)
    expect(hasRole('organizer')).toBe(false)
    expect(hasRole('admin')).toBe(false)
  })
})

describe('Permission Checks', () => {
  beforeEach(() => {
    clearProfile()
  })

  it('isAdmin returns true for admin', () => {
    createProfile({ nickname: 'Admin' }) // First user = admin
    expect(isAdmin()).toBe(true)
  })

  it('isAdmin returns false for non-admin', () => {
    createProfile({ nickname: 'Admin' })
    updateProfile({ role: 'tenant' })
    expect(isAdmin()).toBe(false)
  })

  it('canAccessTools returns true for admin', () => {
    createProfile({ nickname: 'Admin' })
    expect(canAccessTools()).toBe(true)
  })

  it('canAccessTools returns true for organizer', () => {
    createProfile({ nickname: 'Admin' })
    updateProfile({ role: 'organizer' })
    expect(canAccessTools()).toBe(true)
  })

  it('canAccessTools returns false for tenant', () => {
    createProfile({ nickname: 'Admin' })
    updateProfile({ role: 'tenant' })
    expect(canAccessTools()).toBe(false)
  })

  it('isLoggedIn returns correct state', () => {
    expect(isLoggedIn()).toBe(false)

    createProfile({ nickname: 'Test' })
    expect(isLoggedIn()).toBe(true)

    clearProfile()
    expect(isLoggedIn()).toBe(false)
  })
})

describe('Invite Codes', () => {
  beforeEach(() => {
    clearProfile()
    // Create admin who can create invites
    createProfile({ nickname: 'Admin' })
  })

  it('admin can create invite codes', () => {
    const invite = createInvite({
      grantRole: 'tenant',
      maxUses: 5,
    })

    expect(invite).not.toBeNull()
    expect(invite!.code).toHaveLength(6) // Invite codes are 6 characters
    expect(invite!.grantRole).toBe('tenant')
    expect(invite!.maxUses).toBe(5)
    expect(invite!.usedCount).toBe(0)
    expect(invite!.revoked).toBe(false)
  })

  it('admin can create organizer invites', () => {
    const invite = createInvite({ grantRole: 'organizer' })
    expect(invite).not.toBeNull()
    expect(invite!.grantRole).toBe('organizer')
  })

  it('admin can create admin invites', () => {
    const invite = createInvite({ grantRole: 'admin' })
    expect(invite).not.toBeNull()
    expect(invite!.grantRole).toBe('admin')
  })

  it('organizer cannot create admin invites', () => {
    // Downgrade to organizer
    updateProfile({ role: 'organizer' })

    const invite = createInvite({ grantRole: 'admin' })
    expect(invite).toBeNull()
  })

  it('tenant cannot create organizer invites', () => {
    // Downgrade to tenant
    updateProfile({ role: 'tenant' })

    const invite = createInvite({ grantRole: 'organizer' })
    expect(invite).toBeNull()
  })

  it('validates valid invite code', () => {
    const invite = createInvite({ grantRole: 'tenant' })
    const result = validateInviteCode(invite!.code)

    expect(result.valid).toBe(true)
    expect(result.invite).toBeDefined()
    expect(result.error).toBeUndefined()
  })

  it('rejects invalid invite code', () => {
    const result = validateInviteCode('INVALID123')

    expect(result.valid).toBe(false)
    expect(result.error).toBe('Invalid invite code')
  })

  it('rejects revoked invite code', () => {
    const invite = createInvite({ grantRole: 'tenant' })
    revokeInvite(invite!.code)

    const result = validateInviteCode(invite!.code)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Invite code has been revoked')
  })

  it('rejects expired invite code', () => {
    const invite = createInvite({
      grantRole: 'tenant',
      expiresIn: -1000, // Already expired
    })

    const result = validateInviteCode(invite!.code)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Invite code expired')
  })

  it('rejects invite code at max uses', () => {
    const invite = createInvite({
      grantRole: 'tenant',
      maxUses: 1,
    })

    // Use the invite
    redeemInviteCode(invite!.code, 'user-1')

    const result = validateInviteCode(invite!.code)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Invite code has reached max uses')
  })

  it('redeemInviteCode increments usage count', () => {
    const invite = createInvite({
      grantRole: 'tenant',
      maxUses: 5,
    })

    expect(redeemInviteCode(invite!.code, 'user-1')).toBe(true)

    const validation = validateInviteCode(invite!.code)
    expect(validation.invite!.usedCount).toBe(1)
    expect(validation.invite!.usedBy).toContain('user-1')
  })

  it('creator can revoke their own invite', () => {
    const invite = createInvite({ grantRole: 'tenant' })
    expect(revokeInvite(invite!.code)).toBe(true)

    const validation = validateInviteCode(invite!.code)
    expect(validation.valid).toBe(false)
  })

  it('admin can delete invite codes', () => {
    const invite = createInvite({ grantRole: 'tenant' })
    expect(deleteInvite(invite!.code)).toBe(true)

    const validation = validateInviteCode(invite!.code)
    expect(validation.valid).toBe(false)
    expect(validation.error).toBe('Invalid invite code')
  })

  it('non-admin cannot delete invite codes', () => {
    const invite = createInvite({ grantRole: 'tenant' })

    // Downgrade to organizer
    updateProfile({ role: 'organizer' })

    expect(deleteInvite(invite!.code)).toBe(false)
  })

  it('getAllInviteCodes returns codes for admin', () => {
    createInvite({ grantRole: 'tenant' })
    createInvite({ grantRole: 'organizer' })

    const codes = getAllInviteCodes()
    expect(codes).toHaveLength(2)
  })

  it('case-insensitive invite code lookup', () => {
    const invite = createInvite({ grantRole: 'tenant' })
    const lowerCode = invite!.code.toLowerCase()

    const result = validateInviteCode(lowerCode)
    expect(result.valid).toBe(true)
  })

  it('invite code with unlimited uses (maxUses = 0)', () => {
    const invite = createInvite({
      grantRole: 'tenant',
      maxUses: 0, // Unlimited
    })

    // Use it multiple times
    redeemInviteCode(invite!.code, 'user-1')
    redeemInviteCode(invite!.code, 'user-2')
    redeemInviteCode(invite!.code, 'user-3')

    // Should still be valid
    const result = validateInviteCode(invite!.code)
    expect(result.valid).toBe(true)
  })

  it('invite code without expiration (expiresIn = 0)', () => {
    const invite = createInvite({
      grantRole: 'tenant',
      expiresIn: 0, // No expiration
    })

    const result = validateInviteCode(invite!.code)
    expect(result.valid).toBe(true)
  })
})

describe('Profile with Invite Code', () => {
  beforeEach(() => {
    clearProfile()
    // Create admin and invite code
    createProfile({ nickname: 'Admin' })
  })

  it('profile created with admin invite gets verified trust level', () => {
    // Admin creates invite (admin-created invites auto-verify)
    const invite = createInvite({ grantRole: 'tenant' })

    clearProfile()
    const profile = createProfile({
      nickname: 'Invited User',
      inviteCode: invite!.code,
    })

    // Admin-created invite = auto-verified
    expect(profile.trustLevel).toBe('verified')
    expect(profile.inviteCode).toBe(invite!.code)
  })

  it('profile created with organizer invite gets organizer role', () => {
    const invite = createInvite({ grantRole: 'organizer' })

    clearProfile()
    const profile = createProfile({
      nickname: 'New Organizer',
      inviteCode: invite!.code,
    })

    expect(profile.role).toBe('organizer')
    expect(profile.trustLevel).toBe('verified')
  })
})

describe('Profile Updates', () => {
  beforeEach(() => {
    clearProfile()
    createProfile({ nickname: 'Test User' })
  })

  it('updates profile fields', () => {
    const updated = updateProfile({
      phone: '555-1234',
      email: 'test@example.com',
      rentAmount: 1500,
    })

    expect(updated).not.toBeNull()
    expect(updated!.phone).toBe('555-1234')
    expect(updated!.email).toBe('test@example.com')
    expect(updated!.rentAmount).toBe(1500)
  })

  it('preserves existing fields on update', () => {
    updateProfile({ phone: '555-1234' })
    updateProfile({ email: 'test@example.com' })

    const profile = getCurrentProfile()
    expect(profile!.phone).toBe('555-1234')
    expect(profile!.email).toBe('test@example.com')
  })

  it('can update role', () => {
    updateProfile({ role: 'organizer' })
    expect(getCurrentProfile()!.role).toBe('organizer')
  })

  it('returns null when not logged in', () => {
    clearProfile()
    const result = updateProfile({ nickname: 'New Name' })
    expect(result).toBeNull()
  })
})

describe('Activity Tracking', () => {
  beforeEach(() => {
    clearProfile()
    createProfile({ nickname: 'Test User' })
  })

  it('trackActivity updates lastActive', () => {
    const before = getCurrentProfile()!.lastActive
    trackActivity('chat')
    const after = getCurrentProfile()!.lastActive

    expect(after).toBeGreaterThanOrEqual(before!)
  })

  it('trackActivity increments chat message count', () => {
    trackActivity('chat')
    trackActivity('chat')
    trackActivity('chat')

    const profile = getCurrentProfile()
    expect(profile!.chatMessageCount).toBe(3)
  })

  it('trackActivity updates lastChatMessage for chat', () => {
    trackActivity('chat')
    const profile = getCurrentProfile()
    expect(profile!.lastChatMessage).toBeDefined()
    expect(profile!.lastChatMessage).toBeGreaterThan(0)
  })

  it('trackActivity updates lastDocumentRead for document', () => {
    trackActivity('document')
    const profile = getCurrentProfile()
    expect(profile!.lastDocumentRead).toBeDefined()
  })

  it('trackActivity updates lastToolsUsage for tools', () => {
    trackActivity('tools')
    const profile = getCurrentProfile()
    expect(profile!.lastToolsUsage).toBeDefined()
  })

  it('getActivityStatus returns never for new profile with no activity', () => {
    // Create a fresh profile
    clearProfile()
    const profile = createProfile({ nickname: 'New User' })

    // Profile with created == lastActive and no other activity = never
    expect(getActivityStatus(profile)).toBe('never')
  })
})

describe('Label Functions', () => {
  it('getRoleLabel returns correct labels', () => {
    expect(getRoleLabel('tenant')).toBe('Tenant')
    expect(getRoleLabel('organizer')).toBe('Organizer')
    expect(getRoleLabel('admin')).toBe('Admin')
  })

  it('getTrustLabel returns correct labels', () => {
    // Check actual implementation - may be different casing
    expect(getTrustLabel('self_registered').toLowerCase()).toContain('self')
    expect(getTrustLabel('invited').toLowerCase()).toContain('invited')
    expect(getTrustLabel('verified').toLowerCase()).toContain('verified')
  })
})

describe('Profile Login', () => {
  beforeEach(() => {
    clearProfile()
  })

  it('can login to existing profile', () => {
    const created = createProfile({ nickname: 'Test User' })
    const profileId = created.id
    clearProfile()

    const loggedIn = loginToProfile(profileId)
    expect(loggedIn).not.toBeNull()
    expect(loggedIn!.id).toBe(profileId)
    expect(getCurrentProfile()!.id).toBe(profileId)
  })

  it('returns null for non-existent profile', () => {
    const result = loginToProfile('non-existent-id')
    expect(result).toBeNull()
  })
})

describe('Edge Cases', () => {
  beforeEach(() => {
    clearProfile()
  })

  it('handles empty nickname', () => {
    const profile = createProfile({ nickname: '' })
    expect(profile.nickname).toBe('')
  })

  it('clearProfile removes current profile', () => {
    createProfile({ nickname: 'Test' })
    expect(isLoggedIn()).toBe(true)

    clearProfile()
    expect(isLoggedIn()).toBe(false)
    expect(getCurrentProfile()).toBeNull()
  })

  it('getProfile returns profile by ID', () => {
    const created = createProfile({ nickname: 'Test' })
    const profileId = created.id
    clearProfile()

    const retrieved = getProfile(profileId)
    expect(retrieved).not.toBeNull()
    expect(retrieved!.nickname).toBe('Test')
  })

  it('getProfile returns null for non-existent ID', () => {
    const result = getProfile('non-existent')
    expect(result).toBeNull()
  })

  it('createInvite returns null when not logged in', () => {
    clearProfile()
    const invite = createInvite({ grantRole: 'tenant' })
    expect(invite).toBeNull()
  })

  it('revokeInvite returns false when not logged in', () => {
    createProfile({ nickname: 'Admin' })
    const invite = createInvite({ grantRole: 'tenant' })
    clearProfile()

    expect(revokeInvite(invite!.code)).toBe(false)
  })
})
