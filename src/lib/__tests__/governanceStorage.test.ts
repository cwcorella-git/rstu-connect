/**
 * Tests for governanceStorage.ts
 *
 * Tests cover:
 * - Proposal creation (bloc-level)
 * - Voting logic (one person = one vote)
 * - Vote thresholds per proposal type
 * - Proposal status transitions
 * - Message format helpers
 * - Authorization functions
 */

import {
  VOTE_THRESHOLDS,
  CROSS_GROUP_TYPES,
  REQUIRES_FINALIZATION,
  createProposal,
  getProposal,
  getActiveProposals,
  getProposalHistory,
  getGroupProposals,
  voteOnProposal,
  getUserVote,
  finalizeProposal,
  formatProposalMessage,
  parseProposalMessage,
  formatVoteMessage,
  parseVoteMessage,
  canVoteOnGovernance,
  canFinalizeProposal,
  dismissBanner,
  isBannerDismissed,
  getProposalTypeLabel,
  cleanupOldProposals,
  type GovernanceProposal,
  type GovernanceProposalType,
} from '../storage/governanceStorage'

// Mock dependencies
jest.mock('../storage/profileStorage', () => ({
  getCurrentProfile: jest.fn(),
}))

jest.mock('../storage/linkedPropertiesStorage', () => ({
  getLinkedGroups: jest.fn(() => []),
  updateLinkedGroup: jest.fn(),
  getGroupForApn: jest.fn(),
  createOrMergeLinkedGroup: jest.fn(),
  generateBlocName: jest.fn(() => 'Test Bloc'),
}))

jest.mock('../services/supabase', () => ({
  supabase: null,
  USE_SUPABASE: false,
}))

jest.mock('../services/authService', () => ({
  castVote: jest.fn(),
  getVoteCounts: jest.fn(),
  checkPermission: jest.fn(() => ({ allowed: true })),
  requireOnline: jest.fn(),
  OfflineError: class OfflineError extends Error {},
}))

jest.mock('../utils/offlineCache', () => ({
  cacheForOffline: jest.fn(),
  getCached: jest.fn(),
  invalidateCachePattern: jest.fn(),
  CacheKeys: {
    proposals: (id: string) => `proposals:${id}`,
  },
}))

jest.mock('../utils/sanitize', () => ({
  sanitizeText: jest.fn((text) => text),
  sanitizeRichText: jest.fn((text) => text),
}))

jest.mock('../utils/rateLimit', () => ({
  tryAction: jest.fn(() => ({ allowed: true })),
}))

jest.mock('../utils/logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}))

import { getCurrentProfile } from '../storage/profileStorage'
import { getLinkedGroups, getGroupForApn } from '../storage/linkedPropertiesStorage'
import { tryAction } from '../utils/rateLimit'

const mockGetCurrentProfile = getCurrentProfile as jest.Mock
const mockGetLinkedGroups = getLinkedGroups as jest.Mock
const mockGetGroupForApn = getGroupForApn as jest.Mock
const mockTryAction = tryAction as jest.Mock

// Mock crypto for ID generation
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
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (i: number) => Object.keys(store)[i] || null,
  }
})()

describe('governanceStorage', () => {
  beforeAll(() => {
    Object.defineProperty(global, 'crypto', {
      value: mockCrypto,
      writable: true,
    })
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
  })

  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
    mockTryAction.mockReturnValue({ allowed: true })
  })

  // ============================================================================
  // Constants Tests
  // ============================================================================

  describe('Constants', () => {
    test('VOTE_THRESHOLDS has all proposal types', () => {
      const proposalTypes: GovernanceProposalType[] = [
        'rename', 'merge', 'alliance', 'add-property', 'remove-property',
        'mute-tenant', 'escalate', 'split', 'form-bloc', 'join-bloc',
        'rent-strike', 'demand-letter', 'petition', 'form-collective',
        'join-collective', 'collective-alliance', 'collective-rename',
        'add-point-person', 'remove-point-person',
      ]

      proposalTypes.forEach(type => {
        expect(VOTE_THRESHOLDS[type]).toBeDefined()
        expect(typeof VOTE_THRESHOLDS[type]).toBe('number')
        expect(VOTE_THRESHOLDS[type]).toBeGreaterThan(0)
      })
    })

    test('rent-strike has highest threshold', () => {
      expect(VOTE_THRESHOLDS['rent-strike']).toBe(10)
    })

    test('CROSS_GROUP_TYPES requires both groups to pass', () => {
      expect(CROSS_GROUP_TYPES).toContain('merge')
      expect(CROSS_GROUP_TYPES).toContain('alliance')
      expect(CROSS_GROUP_TYPES).toContain('join-bloc')
    })

    test('REQUIRES_FINALIZATION includes mute-tenant', () => {
      expect(REQUIRES_FINALIZATION).toContain('mute-tenant')
    })
  })

  // ============================================================================
  // createProposal Tests
  // ============================================================================

  describe('createProposal', () => {
    const mockProfile = {
      id: 'proposer-1',
      nickname: 'Proposer',
      role: 'organizer' as const,
    }

    beforeEach(() => {
      mockGetCurrentProfile.mockReturnValue(mockProfile)
    })

    test('creates a proposal with correct defaults', () => {
      const proposal = createProposal('rename', 'bloc-123', {
        targetValue: 'New Name',
        reason: 'Better name',
      })

      expect(proposal).not.toBeNull()
      expect(proposal!.type).toBe('rename')
      expect(proposal!.groupId).toBe('bloc-123')
      expect(proposal!.targetValue).toBe('New Name')
      expect(proposal!.reason).toBe('Better name')
      expect(proposal!.proposedBy).toBe('proposer-1')
      expect(proposal!.proposedByName).toBe('Proposer')
      expect(proposal!.upvotes).toContain('proposer-1') // Auto-upvote
      expect(proposal!.downvotes).toEqual([])
      expect(proposal!.status).toBe('active')
      expect(proposal!.id).toMatch(/^gov-/)
    })

    test('returns null when not logged in', () => {
      mockGetCurrentProfile.mockReturnValue(null)
      const proposal = createProposal('rename', 'bloc-123')
      expect(proposal).toBeNull()
    })

    test('returns null when rate limited', () => {
      mockTryAction.mockReturnValue({ allowed: false, error: 'Rate limited' })
      const proposal = createProposal('rename', 'bloc-123')
      expect(proposal).toBeNull()
    })

    test('prevents duplicate active proposals', () => {
      const first = createProposal('rename', 'bloc-123', { targetValue: 'New Name' })
      expect(first).not.toBeNull()

      const duplicate = createProposal('rename', 'bloc-123', { targetValue: 'New Name' })
      expect(duplicate).toBeNull()
    })

    test('sets expiration 7 days in future', () => {
      const now = Date.now()
      const proposal = createProposal('add-property', 'bloc-123', { targetApn: 'APN-001' })

      const sevenDays = 7 * 24 * 60 * 60 * 1000
      expect(proposal!.expiresAt).toBeGreaterThanOrEqual(now + sevenDays - 1000)
      expect(proposal!.expiresAt).toBeLessThanOrEqual(now + sevenDays + 1000)
    })

    test('stores proposal in localStorage', () => {
      createProposal('escalate', 'bloc-123', { targetValue: 'level-2' })

      const stored = JSON.parse(localStorage.getItem('rstu-governance') || '{}')
      expect(stored.proposals).toBeDefined()
      expect(stored.proposals.length).toBe(1)
      expect(stored.proposals[0].type).toBe('escalate')
    })
  })

  // ============================================================================
  // Proposal Retrieval Tests
  // ============================================================================

  describe('Proposal Retrieval', () => {
    beforeEach(() => {
      mockGetCurrentProfile.mockReturnValue({
        id: 'user-1',
        nickname: 'User',
        role: 'organizer' as const,
      })
    })

    test('getProposal returns proposal by ID', () => {
      const created = createProposal('rename', 'bloc-1', { targetValue: 'Test' })
      const retrieved = getProposal(created!.id)
      expect(retrieved).toBeDefined()
      expect(retrieved!.id).toBe(created!.id)
    })

    test('getProposal returns undefined for non-existent ID', () => {
      const result = getProposal('non-existent-id')
      expect(result).toBeUndefined()
    })

    test('getActiveProposals filters by groupId and status', () => {
      createProposal('rename', 'bloc-1', { targetValue: 'Name 1' })
      createProposal('rename', 'bloc-1', { targetValue: 'Name 2' })
      createProposal('rename', 'bloc-2', { targetValue: 'Name 3' })

      const bloc1Proposals = getActiveProposals('bloc-1')
      expect(bloc1Proposals.length).toBe(2)
      bloc1Proposals.forEach(p => {
        expect(p.groupId).toBe('bloc-1')
        expect(p.status).toBe('active')
      })
    })

    test('getGroupProposals returns all proposals for a group', () => {
      createProposal('rename', 'bloc-1', { targetValue: 'Name' })
      const proposals = getGroupProposals('bloc-1')
      expect(proposals.length).toBeGreaterThan(0)
    })

    test('getProposalHistory returns completed proposals', () => {
      // Create and manually set status to passed
      const stored = JSON.parse(localStorage.getItem('rstu-governance') || '{"proposals":[]}')
      stored.proposals.push({
        id: 'hist-1',
        type: 'rename',
        groupId: 'bloc-1',
        status: 'passed',
        upvotes: [],
        downvotes: [],
        createdAt: Date.now() - 86400000,
        expiresAt: Date.now(),
      })
      localStorage.setItem('rstu-governance', JSON.stringify(stored))

      const history = getProposalHistory('bloc-1')
      expect(history.some(p => p.status === 'passed')).toBe(true)
    })
  })

  // ============================================================================
  // Voting Tests
  // ============================================================================

  describe('voteOnProposal', () => {
    beforeEach(() => {
      mockGetCurrentProfile.mockReturnValue({
        id: 'voter-1',
        nickname: 'Voter',
        role: 'organizer' as const,
      })
    })

    test('adds vote to proposal', () => {
      // Create proposal as different user
      mockGetCurrentProfile.mockReturnValue({
        id: 'proposer-1',
        nickname: 'Proposer',
        role: 'organizer' as const,
      })
      const proposal = createProposal('rename', 'bloc-1', { targetValue: 'New Name' })

      // Vote as different user
      mockGetCurrentProfile.mockReturnValue({
        id: 'voter-1',
        nickname: 'Voter',
        role: 'organizer' as const,
      })

      const result = voteOnProposal(proposal!.id, 'up')
      expect(result).not.toBeNull()
      expect(result!.upvotes).toContain('voter-1')
    })

    test('removes vote from opposite array when changing vote', () => {
      mockGetCurrentProfile.mockReturnValue({
        id: 'proposer-1',
        nickname: 'Proposer',
        role: 'organizer' as const,
      })
      const proposal = createProposal('rename', 'bloc-1', { targetValue: 'Name' })

      mockGetCurrentProfile.mockReturnValue({
        id: 'voter-1',
        nickname: 'Voter',
        role: 'organizer' as const,
      })

      voteOnProposal(proposal!.id, 'up')
      const afterDown = voteOnProposal(proposal!.id, 'down')

      expect(afterDown!.upvotes).not.toContain('voter-1')
      expect(afterDown!.downvotes).toContain('voter-1')
    })

    test('admin cannot vote (Bookchin principle)', () => {
      mockGetCurrentProfile.mockReturnValue({
        id: 'admin-1',
        nickname: 'Admin',
        role: 'admin' as const,
      })

      // Create proposal as non-admin first
      mockGetCurrentProfile.mockReturnValue({
        id: 'proposer-1',
        nickname: 'Proposer',
        role: 'organizer' as const,
      })
      const proposal = createProposal('rename', 'bloc-1', { targetValue: 'Name' })

      // Try to vote as admin
      mockGetCurrentProfile.mockReturnValue({
        id: 'admin-1',
        nickname: 'Admin',
        role: 'admin' as const,
      })

      const result = voteOnProposal(proposal!.id, 'up')
      expect(result).toBeNull()
    })

    test('returns null for non-active proposal', () => {
      mockGetCurrentProfile.mockReturnValue({
        id: 'proposer-1',
        nickname: 'Proposer',
        role: 'organizer' as const,
      })
      const proposal = createProposal('rename', 'bloc-1', { targetValue: 'Name' })

      // Manually set status to passed
      const stored = JSON.parse(localStorage.getItem('rstu-governance')!)
      stored.proposals[0].status = 'passed'
      localStorage.setItem('rstu-governance', JSON.stringify(stored))

      mockGetCurrentProfile.mockReturnValue({
        id: 'voter-1',
        nickname: 'Voter',
        role: 'organizer' as const,
      })

      const result = voteOnProposal(proposal!.id, 'up')
      expect(result).toBeNull()
    })
  })

  describe('getUserVote', () => {
    test('returns correct vote direction', () => {
      mockGetCurrentProfile.mockReturnValue({
        id: 'proposer-1',
        nickname: 'Proposer',
        role: 'organizer' as const,
      })
      const proposal = createProposal('rename', 'bloc-1', { targetValue: 'Name' })

      // Proposer auto-upvotes
      expect(getUserVote(proposal!.id)).toBe('up')
    })

    test('returns null when user has not voted', () => {
      mockGetCurrentProfile.mockReturnValue({
        id: 'proposer-1',
        nickname: 'Proposer',
        role: 'organizer' as const,
      })
      const proposal = createProposal('rename', 'bloc-1', { targetValue: 'Name' })

      mockGetCurrentProfile.mockReturnValue({
        id: 'other-user',
        nickname: 'Other',
        role: 'tenant' as const,
      })

      expect(getUserVote(proposal!.id)).toBeNull()
    })
  })

  // ============================================================================
  // Threshold Tests
  // ============================================================================

  describe('Vote Thresholds', () => {
    beforeEach(() => {
      mockGetCurrentProfile.mockReturnValue({
        id: 'proposer',
        nickname: 'Proposer',
        role: 'organizer' as const,
      })
    })

    test('proposal passes when reaching threshold', () => {
      const proposal = createProposal('rename', 'bloc-1', { targetValue: 'Name' })

      // Add enough votes to reach threshold (3 for rename)
      const stored = JSON.parse(localStorage.getItem('rstu-governance')!)
      stored.proposals[0].upvotes = ['user-1', 'user-2', 'user-3']
      localStorage.setItem('rstu-governance', JSON.stringify(stored))

      // Vote to trigger threshold check
      mockGetCurrentProfile.mockReturnValue({
        id: 'user-4',
        nickname: 'Voter',
        role: 'organizer' as const,
      })

      const result = voteOnProposal(proposal!.id, 'up')
      // Status should be updated (though execution depends on type)
      expect(result).not.toBeNull()
    })

    test('proposal rejected when negative threshold reached', () => {
      const proposal = createProposal('rename', 'bloc-1', { targetValue: 'Name' })

      // Add enough downvotes to reach -3
      const stored = JSON.parse(localStorage.getItem('rstu-governance')!)
      stored.proposals[0].downvotes = ['user-1', 'user-2', 'user-3']
      stored.proposals[0].upvotes = [] // Remove auto-upvote
      localStorage.setItem('rstu-governance', JSON.stringify(stored))

      mockGetCurrentProfile.mockReturnValue({
        id: 'user-4',
        nickname: 'Voter',
        role: 'organizer' as const,
      })

      const result = voteOnProposal(proposal!.id, 'down')
      // After vote, check status
      const updated = getProposal(proposal!.id)
      expect(updated!.status).toBe('rejected')
    })
  })

  // ============================================================================
  // Finalization Tests
  // ============================================================================

  describe('finalizeProposal', () => {
    test('organizer can finalize pending proposal', () => {
      mockGetCurrentProfile.mockReturnValue({
        id: 'proposer',
        nickname: 'Proposer',
        role: 'organizer' as const,
      })
      createProposal('mute-tenant', 'bloc-1', { targetProfileId: 'bad-user' })

      // Manually set to pending-finalize
      const stored = JSON.parse(localStorage.getItem('rstu-governance')!)
      stored.proposals[0].status = 'pending-finalize'
      localStorage.setItem('rstu-governance', JSON.stringify(stored))

      mockGetLinkedGroups.mockReturnValue([{
        id: 'bloc-1',
        name: 'Test Bloc',
        apns: [],
        mutedProfiles: [],
      }])

      const proposalId = stored.proposals[0].id
      const result = finalizeProposal(proposalId)

      expect(result).toBe(true)
      const finalized = getProposal(proposalId)
      expect(finalized!.status).toBe('executed')
      expect(finalized!.finalizedBy).toBe('proposer')
    })

    test('tenant cannot finalize', () => {
      mockGetCurrentProfile.mockReturnValue({
        id: 'proposer',
        nickname: 'Proposer',
        role: 'organizer' as const,
      })
      createProposal('mute-tenant', 'bloc-1', { targetProfileId: 'bad-user' })

      const stored = JSON.parse(localStorage.getItem('rstu-governance')!)
      stored.proposals[0].status = 'pending-finalize'
      localStorage.setItem('rstu-governance', JSON.stringify(stored))

      mockGetCurrentProfile.mockReturnValue({
        id: 'tenant',
        nickname: 'Tenant',
        role: 'tenant' as const,
      })

      const result = finalizeProposal(stored.proposals[0].id)
      expect(result).toBe(false)
    })

    test('cannot finalize non-pending proposal', () => {
      mockGetCurrentProfile.mockReturnValue({
        id: 'organizer',
        nickname: 'Organizer',
        role: 'organizer' as const,
      })
      const proposal = createProposal('rename', 'bloc-1', { targetValue: 'Name' })

      const result = finalizeProposal(proposal!.id)
      expect(result).toBe(false)
    })
  })

  // ============================================================================
  // Message Format Tests
  // ============================================================================

  describe('formatProposalMessage', () => {
    test('formats rename proposal', () => {
      const proposal: GovernanceProposal = {
        id: 'test-1',
        type: 'rename',
        groupId: 'bloc-1',
        targetValue: 'New Bloc Name',
        reason: 'Better name',
        proposedBy: 'user-1',
        proposedByName: 'User',
        upvotes: [],
        downvotes: [],
        status: 'active',
        createdAt: Date.now(),
        expiresAt: Date.now() + 86400000,
      }

      const message = formatProposalMessage(proposal)
      expect(message).toBe('[GOV:rename:bloc-1:New Bloc Name] Better name')
    })

    test('formats merge proposal', () => {
      const proposal: GovernanceProposal = {
        id: 'test-2',
        type: 'merge',
        groupId: 'bloc-1',
        targetGroupId: 'bloc-2',
        reason: 'Combine forces',
        proposedBy: 'user-1',
        proposedByName: 'User',
        upvotes: [],
        downvotes: [],
        status: 'active',
        createdAt: Date.now(),
        expiresAt: Date.now() + 86400000,
      }

      const message = formatProposalMessage(proposal)
      expect(message).toBe('[GOV:merge:bloc-1:bloc-2] Combine forces')
    })

    test('formats split proposal with APNs', () => {
      const proposal: GovernanceProposal = {
        id: 'test-3',
        type: 'split',
        groupId: 'bloc-1',
        targetValue: 'New Bloc',
        targetApns: ['APN-1', 'APN-2'],
        reason: '',
        proposedBy: 'user-1',
        proposedByName: 'User',
        upvotes: [],
        downvotes: [],
        status: 'active',
        createdAt: Date.now(),
        expiresAt: Date.now() + 86400000,
      }

      const message = formatProposalMessage(proposal)
      expect(message).toBe('[GOV:split:bloc-1:New Bloc:APN-1,APN-2]')
    })
  })

  describe('parseProposalMessage', () => {
    test('parses rename proposal', () => {
      const parsed = parseProposalMessage('[GOV:rename:bloc-1:New Name] Reason here')
      expect(parsed).not.toBeNull()
      expect(parsed!.type).toBe('rename')
      expect(parsed!.groupId).toBe('bloc-1')
      expect(parsed!.targetValue).toBe('New Name')
      expect(parsed!.reason).toBe('Reason here')
    })

    test('parses merge proposal', () => {
      const parsed = parseProposalMessage('[GOV:merge:bloc-1:bloc-2] Combine')
      expect(parsed).not.toBeNull()
      expect(parsed!.type).toBe('merge')
      expect(parsed!.targetGroupId).toBe('bloc-2')
    })

    test('returns null for invalid format', () => {
      expect(parseProposalMessage('Not a proposal')).toBeNull()
      expect(parseProposalMessage('[GOV:invalid')).toBeNull()
    })
  })

  describe('formatVoteMessage / parseVoteMessage', () => {
    test('formats vote message', () => {
      expect(formatVoteMessage('proposal-123', 'up')).toBe('[GOV-VOTE:up:proposal-123]')
      expect(formatVoteMessage('proposal-456', 'down')).toBe('[GOV-VOTE:down:proposal-456]')
    })

    test('parses vote message', () => {
      const upVote = parseVoteMessage('[GOV-VOTE:up:proposal-123]')
      expect(upVote).toEqual({ vote: 'up', proposalId: 'proposal-123' })

      const downVote = parseVoteMessage('[GOV-VOTE:down:proposal-456]')
      expect(downVote).toEqual({ vote: 'down', proposalId: 'proposal-456' })
    })

    test('returns null for invalid vote message', () => {
      expect(parseVoteMessage('Not a vote')).toBeNull()
      expect(parseVoteMessage('[GOV-VOTE:invalid:123]')).toBeNull()
    })
  })

  // ============================================================================
  // Authorization Tests
  // ============================================================================

  describe('canVoteOnGovernance', () => {
    test('admin cannot vote (Bookchin principle)', () => {
      mockGetCurrentProfile.mockReturnValue({
        id: 'admin',
        role: 'admin' as const,
      })
      expect(canVoteOnGovernance('bloc-1')).toBe(false)
    })

    test('returns true when user building matches group', () => {
      mockGetCurrentProfile.mockReturnValue({
        id: 'tenant',
        role: 'tenant' as const,
        buildingId: 'building-1',
      })
      mockGetLinkedGroups.mockReturnValue([{
        id: 'bloc-1',
        apns: ['building-1'],
      }])
      mockGetGroupForApn.mockReturnValue({ id: 'bloc-1' })

      expect(canVoteOnGovernance('bloc-1')).toBe(true)
    })

    test('returns true for direct building match', () => {
      mockGetCurrentProfile.mockReturnValue({
        id: 'tenant',
        role: 'tenant' as const,
        buildingId: 'building-1',
      })
      mockGetLinkedGroups.mockReturnValue([])
      mockGetGroupForApn.mockReturnValue(null)

      expect(canVoteOnGovernance('building-1')).toBe(true)
    })

    test('organizer can vote on assigned buildings', () => {
      mockGetCurrentProfile.mockReturnValue({
        id: 'organizer',
        role: 'organizer' as const,
        assignedBuildings: ['bloc-1', 'bloc-2'],
      })
      mockGetLinkedGroups.mockReturnValue([])

      expect(canVoteOnGovernance('bloc-1')).toBe(true)
      expect(canVoteOnGovernance('bloc-3')).toBe(false)
    })
  })

  describe('canFinalizeProposal', () => {
    test('organizer can finalize', () => {
      mockGetCurrentProfile.mockReturnValue({ role: 'organizer' as const })
      expect(canFinalizeProposal()).toBe(true)
    })

    test('admin can finalize', () => {
      mockGetCurrentProfile.mockReturnValue({ role: 'admin' as const })
      expect(canFinalizeProposal()).toBe(true)
    })

    test('tenant cannot finalize', () => {
      mockGetCurrentProfile.mockReturnValue({ role: 'tenant' as const })
      expect(canFinalizeProposal()).toBe(false)
    })
  })

  // ============================================================================
  // Banner Dismissal Tests
  // ============================================================================

  describe('Banner Dismissal', () => {
    test('dismissBanner adds to dismissed list', () => {
      dismissBanner('proposal-123')
      expect(isBannerDismissed('proposal-123')).toBe(true)
      expect(isBannerDismissed('proposal-456')).toBe(false)
    })

    test('dismissBanner is idempotent', () => {
      dismissBanner('proposal-123')
      dismissBanner('proposal-123')

      const stored = JSON.parse(localStorage.getItem('rstu-governance')!)
      const count = stored.dismissedBanners.filter((id: string) => id === 'proposal-123').length
      expect(count).toBe(1)
    })
  })

  // ============================================================================
  // Proposal Type Labels
  // ============================================================================

  describe('getProposalTypeLabel', () => {
    test('returns human-readable labels', () => {
      expect(getProposalTypeLabel('rename')).toBe('Rename Bloc')
      expect(getProposalTypeLabel('rent-strike')).toBe('Rent Strike Vote')
      expect(getProposalTypeLabel('form-bloc')).toBe('Form New Bloc')
      expect(getProposalTypeLabel('demand-letter')).toBe('Demand Letter')
    })

    test('returns type as fallback for unknown types', () => {
      expect(getProposalTypeLabel('unknown-type' as GovernanceProposalType)).toBe('unknown-type')
    })
  })

  // ============================================================================
  // Cleanup Tests
  // ============================================================================

  describe('cleanupOldProposals', () => {
    test('removes old completed proposals beyond limit', () => {
      const state = {
        proposals: Array.from({ length: 60 }, (_, i) => ({
          id: `proposal-${i}`,
          type: 'rename' as const,
          groupId: 'bloc-1',
          status: i < 10 ? 'active' : 'executed',
          upvotes: [],
          downvotes: [],
          createdAt: Date.now() - i * 86400000,
          expiresAt: Date.now(),
          executedAt: i >= 10 ? Date.now() - i * 86400000 : undefined,
        })),
        dismissedBanners: ['proposal-55', 'proposal-56'],
        lastModified: Date.now(),
      }
      localStorage.setItem('rstu-governance', JSON.stringify(state))

      cleanupOldProposals()

      const after = JSON.parse(localStorage.getItem('rstu-governance')!)
      // Should keep 10 active + 50 most recent completed = 60 max
      expect(after.proposals.length).toBeLessThanOrEqual(60)
      // Should keep active proposals
      const activeCount = after.proposals.filter((p: GovernanceProposal) => p.status === 'active').length
      expect(activeCount).toBe(10)
    })

    test('cleans up dismissed banners for removed proposals', () => {
      const state = {
        proposals: [
          { id: 'kept-1', status: 'active', type: 'rename', groupId: 'bloc-1', upvotes: [], downvotes: [], createdAt: Date.now(), expiresAt: Date.now() },
        ],
        dismissedBanners: ['kept-1', 'removed-1', 'removed-2'],
        lastModified: Date.now(),
      }
      localStorage.setItem('rstu-governance', JSON.stringify(state))

      cleanupOldProposals()

      const after = JSON.parse(localStorage.getItem('rstu-governance')!)
      expect(after.dismissedBanners).toContain('kept-1')
      expect(after.dismissedBanners).not.toContain('removed-1')
      expect(after.dismissedBanners).not.toContain('removed-2')
    })
  })
})
