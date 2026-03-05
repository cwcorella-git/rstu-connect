/**
 * Unit tests for server-authoritative authentication service
 * Tests the frontend logic in src/lib/authService.ts
 */

// Define mocks that will be used by jest.mock factories
const mockProfile = {
  id: 'test-user-uuid',
  nickname: 'TestUser',
  role: 'tenant' as const,
  trustLevel: 'verified' as const,
  buildingId: 'building-123',
  buildingAddress: '123 Main St',
  banned: false,
}

// Note: mock functions are created inside jest.mock factory and accessed via __mocks

// Mock modules - these are hoisted by Jest
jest.mock('@/lib/storage/profileStorage', () => ({
  getCurrentProfile: jest.fn(() => ({
    id: 'test-user-uuid',
    nickname: 'TestUser',
    role: 'tenant',
    trustLevel: 'verified',
    buildingId: 'building-123',
    buildingAddress: '123 Main St',
    banned: false,
  })),
}))

jest.mock('@/lib/services/supabase', () => {
  const rpc = jest.fn()
  const from = jest.fn()
  return {
    supabase: { rpc, from },
    USE_SUPABASE: true,
    __mocks: { rpc, from },
  }
})

// Import after mocks are set up
import {
  checkPermission,
  castVote,
  checkBanStatus,
  banUser,
  unbanUser,
  getAuthoritativeProfile,
  canVoteOnProposal,
  canSendMessage,
  OfflineError,
} from '@/lib/services/authService'
import { getCurrentProfile } from '@/lib/storage/profileStorage'
import { supabase, __mocks } from '@/lib/services/supabase'

// Get the actual mock functions from the module
const { rpc: supabaseRpc, from: supabaseFrom } = __mocks as { rpc: jest.Mock; from: jest.Mock }

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mock profile to default
    ;(getCurrentProfile as jest.Mock).mockReturnValue({ ...mockProfile })
    // Reset online state
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
  })

  describe('checkPermission', () => {
    it('allows verified tenants to vote on events', async () => {
      supabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile, trust_level: 'verified' },
          error: null,
        }),
      })

      const result = await checkPermission('vote:event')
      expect(result.allowed).toBe(true)
    })

    it('denies admins from voting on proposals (Bookchin principle)', async () => {
      supabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile, role: 'admin', trust_level: 'verified' },
          error: null,
        }),
      })

      const result = await checkPermission('vote:proposal')
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('Admins cannot vote')
    })

    it('denies banned users all actions', async () => {
      supabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile, banned: true },
          error: null,
        }),
      })

      const result = await checkPermission('vote:event')
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('banned')
    })

    it('requires organizer role for tools access', async () => {
      supabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile, role: 'tenant' },
          error: null,
        }),
      })

      const result = await checkPermission('access:tools')
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('organizers')
    })

    it('allows organizers to access tools', async () => {
      supabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile, role: 'organizer', trust_level: 'verified' },
          error: null,
        }),
      })

      const result = await checkPermission('access:tools')
      expect(result.allowed).toBe(true)
    })

    it('requires verified status for creating proposals', async () => {
      supabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile, trust_level: 'self_registered' },
          error: null,
        }),
      })

      const result = await checkPermission('create:proposal')
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('verified')
    })

    it('only allows admins to ban users', async () => {
      supabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile, role: 'organizer' },
          error: null,
        }),
      })

      const result = await checkPermission('ban:user')
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('admins')
    })
  })

  describe('castVote', () => {
    it('calls Supabase RPC with correct params', async () => {
      supabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile },
          error: null,
        }),
      })
      supabaseRpc.mockResolvedValue({ data: { success: true }, error: null })

      const result = await castVote('proposal', 'proposal-123', 'up')

      expect(supabaseRpc).toHaveBeenCalledWith('cast_vote', {
        p_target_type: 'proposal',
        p_target_id: 'proposal-123',
        p_voter_id: mockProfile.id,
        p_vote: 'up',
      })
      expect(result.success).toBe(true)
    })

    it('returns error when RPC fails', async () => {
      supabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile },
          error: null,
        }),
      })
      supabaseRpc.mockResolvedValue({ data: null, error: { message: 'Database error' } })

      const result = await castVote('proposal', 'proposal-123', 'up')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })

    it('returns error when server returns failure', async () => {
      supabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile },
          error: null,
        }),
      })
      supabaseRpc.mockResolvedValue({
        data: { success: false, error: 'Invalid vote value' },
        error: null,
      })

      const result = await castVote('proposal', 'proposal-123', 'invalid' as 'up')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid vote value')
    })
  })

  describe('checkBanStatus', () => {
    it('detects global bans', async () => {
      supabaseRpc.mockResolvedValue({
        data: { banned: true, scope: 'global', reason: 'Violation' },
        error: null,
      })

      const result = await checkBanStatus('user-123')

      expect(result.banned).toBe(true)
      expect(result.scope).toBe('global')
      expect(result.reason).toBe('Violation')
    })

    it('detects scoped bans', async () => {
      supabaseRpc.mockResolvedValue({
        data: { banned: true, scope: 'group', scope_id: 'group-123', reason: 'Spam' },
        error: null,
      })

      const result = await checkBanStatus('user-123', 'group', 'group-123')

      expect(result.banned).toBe(true)
      expect(result.scope).toBe('group')
      expect(result.scopeId).toBe('group-123')
    })

    it('returns not banned for clean users', async () => {
      supabaseRpc.mockResolvedValue({
        data: { banned: false },
        error: null,
      })

      const result = await checkBanStatus('user-123')

      expect(result.banned).toBe(false)
    })

    it('returns not banned on error (fail open for reads)', async () => {
      supabaseRpc.mockResolvedValue({
        data: null,
        error: { message: 'Connection failed' },
      })

      const result = await checkBanStatus('user-123')

      expect(result.banned).toBe(false)
    })
  })

  describe('banUser', () => {
    it('allows admin to ban users', async () => {
      supabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile, role: 'admin' },
          error: null,
        }),
      })
      supabaseRpc.mockResolvedValue({ data: { success: true }, error: null })

      const result = await banUser('target-user', 'global', undefined, 'Violation')

      expect(supabaseRpc).toHaveBeenCalledWith('ban_user', expect.objectContaining({
        p_target_id: 'target-user',
        p_scope_type: 'global',
        p_reason: 'Violation',
      }))
      expect(result.success).toBe(true)
    })

    it('prevents non-admin from banning', async () => {
      supabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile, role: 'organizer' },
          error: null,
        }),
      })
      supabaseRpc.mockResolvedValue({
        data: { success: false, error: 'Only admins can ban users' },
        error: null,
      })

      const result = await banUser('target-user', 'global')

      expect(result.success).toBe(false)
    })

    it('supports scoped bans', async () => {
      supabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile, role: 'admin' },
          error: null,
        }),
      })
      supabaseRpc.mockResolvedValue({ data: { success: true }, error: null })

      await banUser('target-user', 'building', 'building-123')

      expect(supabaseRpc).toHaveBeenCalledWith('ban_user', expect.objectContaining({
        p_scope_type: 'building',
        p_scope_id: 'building-123',
      }))
    })
  })

  describe('unbanUser', () => {
    it('allows admin to unban users', async () => {
      supabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile, role: 'admin' },
          error: null,
        }),
      })
      supabaseRpc.mockResolvedValue({ data: { success: true }, error: null })

      const result = await unbanUser('target-user')

      expect(supabaseRpc).toHaveBeenCalledWith('unban_user', expect.objectContaining({
        p_target_id: 'target-user',
        p_scope_type: 'global',
      }))
      expect(result.success).toBe(true)
    })
  })

  describe('getAuthoritativeProfile', () => {
    it('fetches profile from Supabase', async () => {
      const serverProfile = {
        id: mockProfile.id,
        nickname: 'ServerNickname',
        role: 'organizer',
        trust_level: 'verified',
        building_id: 'building-456',
        building_address: '456 Oak St',
        banned: false,
      }
      supabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: serverProfile, error: null }),
      })

      const result = await getAuthoritativeProfile()

      expect(result).not.toBeNull()
      expect(result?.nickname).toBe('ServerNickname')
      expect(result?.role).toBe('organizer')
    })

    it('returns null when not logged in', async () => {
      ;(getCurrentProfile as jest.Mock).mockReturnValue(null)

      const result = await getAuthoritativeProfile()

      expect(result).toBeNull()
    })

    it('falls back to local profile on server error', async () => {
      supabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      })

      const result = await getAuthoritativeProfile()

      // Falls back to tenant with self_registered when not in server
      expect(result).not.toBeNull()
      expect(result?.role).toBe('tenant')
      expect(result?.trustLevel).toBe('self_registered')
    })
  })

  describe('canVoteOnProposal', () => {
    it('allows verified tenant to vote', async () => {
      supabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile, role: 'tenant', trust_level: 'verified' },
          error: null,
        }),
      })
      supabaseRpc.mockResolvedValue({ data: { banned: false }, error: null })

      const result = await canVoteOnProposal('proposal-123')

      expect(result.allowed).toBe(true)
    })

    it('denies banned user from voting', async () => {
      supabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile, trust_level: 'verified' },
          error: null,
        }),
      })
      supabaseRpc.mockResolvedValue({
        data: { banned: true, reason: 'Group ban' },
        error: null,
      })

      const result = await canVoteOnProposal('proposal-123', 'group-123')

      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('ban')
    })
  })

  describe('canSendMessage', () => {
    it('denies unverified users from sending messages', async () => {
      // Profile check returns unverified user
      supabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile, trust_level: 'self_registered' },
          error: null,
        }),
      })

      const result = await canSendMessage('building', 'building-123')

      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('verified')
    })

    it('denies banned users from sending messages', async () => {
      // Mock setup for canSendMessage:
      // 1. getAuthoritativeProfile -> from('profiles')
      // 2. checkPermission -> from('profiles') again
      // 3. checkMuteStatus -> from('mute_records')
      // 4. checkBanStatus -> rpc('check_ban_status')

      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile, trust_level: 'verified' },
          error: null,
        }),
      }
      const muteChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }, // No mute record found
        }),
      }

      // Return different chains based on table name
      supabaseFrom.mockImplementation((table: string) => {
        if (table === 'profiles') return profileChain
        if (table === 'mute_records') return muteChain
        return profileChain // default
      })

      // Ban check returns banned
      supabaseRpc.mockResolvedValue({
        data: { banned: true, scope: 'building', reason: 'Banned for violations' },
        error: null
      })

      const result = await canSendMessage('building', 'building-123')

      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('Banned')
    })
  })
})
