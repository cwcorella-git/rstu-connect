/**
 * Tests for electionStorage.ts
 * Focus: Ranked Choice Voting (IRV) algorithm and election management
 */

import {
  calculateRankedResults,
  getElectionPhase,
  getTimeRemaining,
  type Nomination,
  type RankedVote,
  type Election,
} from '../storage/electionStorage'

// Mock dependencies
jest.mock('../services/socketio', () => ({
  getSocket: jest.fn(() => null),
}))

// We need to mock localStorage and the internal functions
const mockLocalStorage: Record<string, string> = {}

beforeAll(() => {
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

describe('Ranked Choice Voting', () => {
  // Helper to create test nominations
  const createNominations = (names: string[]): Nomination[] =>
    names.map((name, i) => ({
      id: `nom-${i}`,
      electionId: 'election-1',
      positionId: 'position-1',
      nomineeId: `profile-${i}`,
      nomineeName: name,
      nominatorId: `nominator-${i}`,
      nominatorName: `Nominator ${i}`,
      statement: `Statement for ${name}`,
      accepted: true,
      createdAt: Date.now(),
    }))

  // Helper to create ranked votes
  const createRankedVotes = (rankings: string[][]): RankedVote[] =>
    rankings.map((ranking, i) => ({
      id: `vote-${i}`,
      electionId: 'election-1',
      positionId: 'position-1',
      voterId: `voter-${i}`,
      rankings: ranking,
      timestamp: Date.now(),
    }))

  // Helper to set up votes in localStorage
  const setupVotes = (votes: RankedVote[]) => {
    mockLocalStorage['rstu-ranked-votes'] = JSON.stringify(votes)
  }

  describe('First Round Majority', () => {
    it('declares winner immediately if candidate has >50% first-choice votes', () => {
      const nominations = createNominations(['Alice', 'Bob', 'Carol'])
      const votes = createRankedVotes([
        ['nom-0'], // Alice
        ['nom-0'], // Alice
        ['nom-0'], // Alice
        ['nom-1'], // Bob
        ['nom-2'], // Carol
      ])
      setupVotes(votes)

      const result = calculateRankedResults('election-1', 'position-1', nominations)

      expect(result.winner).not.toBeNull()
      expect(result.winner!.nomineeName).toBe('Alice')
      expect(result.winner!.voteCount).toBe(3)
      expect(result.winner!.percentage).toBe(60)
      expect(result.rounds).toHaveLength(1)
      expect(result.totalVotes).toBe(5)
    })

    it('requires >50%, not >=50% for first-round win', () => {
      const nominations = createNominations(['Alice', 'Bob'])
      const votes = createRankedVotes([
        ['nom-0'], // Alice
        ['nom-0'], // Alice
        ['nom-1'], // Bob
        ['nom-1'], // Bob
      ])
      setupVotes(votes)

      const result = calculateRankedResults('election-1', 'position-1', nominations)

      // 50% is NOT a majority, so elimination happens
      // With 2 candidates and a tie, one is eliminated and the other wins
      expect(result.rounds).toHaveLength(1)
      expect(result.rounds[0].eliminatedCandidateId).not.toBeNull()
      // The winner has 100% after elimination (other's votes exhausted)
      expect(result.winner!.percentage).toBe(100)
    })
  })

  describe('Elimination Rounds', () => {
    it('eliminates candidate with fewest votes', () => {
      const nominations = createNominations(['Alice', 'Bob', 'Carol'])
      const votes = createRankedVotes([
        ['nom-0', 'nom-1'], // Alice, then Bob
        ['nom-0', 'nom-1'], // Alice, then Bob
        ['nom-1', 'nom-0'], // Bob, then Alice
        ['nom-1', 'nom-0'], // Bob, then Alice
        ['nom-2', 'nom-0'], // Carol (will be eliminated), then Alice
      ])
      setupVotes(votes)

      const result = calculateRankedResults('election-1', 'position-1', nominations)

      // Carol has fewest votes (1), should be eliminated in round 1
      expect(result.rounds[0].eliminatedCandidateName).toBe('Carol')
      expect(result.rounds[0].eliminatedCandidateId).toBe('nom-2')
      expect(result.rounds[0].transferred).toBe(1)
    })

    it('transfers votes to next preference after elimination', () => {
      const nominations = createNominations(['Alice', 'Bob', 'Carol'])
      const votes = createRankedVotes([
        ['nom-0'],           // Alice (no second choice)
        ['nom-0'],           // Alice
        ['nom-1', 'nom-0'],  // Bob, then Alice
        ['nom-1', 'nom-0'],  // Bob, then Alice
        ['nom-2', 'nom-0'],  // Carol -> transfers to Alice
      ])
      setupVotes(votes)

      const result = calculateRankedResults('election-1', 'position-1', nominations)

      // After Carol elimination, Alice gets the transfer
      // Round 1: Alice=2, Bob=2, Carol=1 -> Carol eliminated
      // Round 2: Alice=3 (2+1 transfer), Bob=2 -> Alice wins with 60%
      expect(result.winner!.nomineeName).toBe('Alice')
      expect(result.winner!.voteCount).toBe(3)
    })

    it('handles multiple elimination rounds correctly', () => {
      const nominations = createNominations(['Alice', 'Bob', 'Carol', 'Dave'])
      const votes = createRankedVotes([
        ['nom-0', 'nom-1', 'nom-2'],  // Alice -> Bob -> Carol
        ['nom-0', 'nom-1', 'nom-2'],  // Alice -> Bob -> Carol
        ['nom-1', 'nom-0'],           // Bob -> Alice
        ['nom-2', 'nom-1', 'nom-0'],  // Carol -> Bob -> Alice
        ['nom-2', 'nom-1', 'nom-0'],  // Carol -> Bob -> Alice
        ['nom-3', 'nom-0'],           // Dave -> Alice (Dave eliminated first)
      ])
      setupVotes(votes)

      const result = calculateRankedResults('election-1', 'position-1', nominations)

      // Round 1: Alice=2, Bob=1, Carol=2, Dave=1 -> One of Bob/Dave eliminated
      // Dave eliminated (fewest, last alphabetically if tied)
      // Round 2: Alice=3 (gained 1), Bob=1, Carol=2 -> Bob eliminated
      // Round 3: Alice=3, Carol=3 -> One more round needed
      // Eventually someone wins

      expect(result.rounds.length).toBeGreaterThanOrEqual(2)
      expect(result.winner).not.toBeNull()
    })
  })

  describe('Edge Cases', () => {
    it('returns null winner for no votes', () => {
      const nominations = createNominations(['Alice', 'Bob'])
      setupVotes([])

      const result = calculateRankedResults('election-1', 'position-1', nominations)

      expect(result.winner).toBeNull()
      expect(result.rounds).toHaveLength(0)
      expect(result.totalVotes).toBe(0)
    })

    it('returns null winner for no nominations', () => {
      const votes = createRankedVotes([['nom-0']])
      setupVotes(votes)

      const result = calculateRankedResults('election-1', 'position-1', [])

      expect(result.winner).toBeNull()
    })

    it('handles unaccepted nominations correctly', () => {
      const nominations: Nomination[] = [
        { ...createNominations(['Alice'])[0], accepted: true },
        { ...createNominations(['Bob'])[0], id: 'nom-1', accepted: false },
        { ...createNominations(['Carol'])[0], id: 'nom-2', accepted: null },
      ]
      const votes = createRankedVotes([
        ['nom-0'],  // Alice (only valid candidate)
        ['nom-1'],  // Bob (not accepted - vote doesn't count)
      ])
      setupVotes(votes)

      const result = calculateRankedResults('election-1', 'position-1', nominations)

      // Only Alice is valid, gets 100% of valid votes
      expect(result.winner!.nomineeName).toBe('Alice')
      expect(result.winner!.percentage).toBe(100)
    })

    it('handles exhausted ballots (no valid remaining choices)', () => {
      const nominations = createNominations(['Alice', 'Bob', 'Carol'])
      const votes = createRankedVotes([
        ['nom-0'],           // Alice (only choice)
        ['nom-0'],           // Alice
        ['nom-1'],           // Bob (only choice - exhausted after elimination)
        ['nom-2'],           // Carol (only choice - exhausted after elimination)
        ['nom-2'],           // Carol
      ])
      setupVotes(votes)

      const result = calculateRankedResults('election-1', 'position-1', nominations)

      // Alice=2, Bob=1, Carol=2 -> Bob eliminated
      // Bob's voter has no second choice - ballot exhausted
      // Alice=2, Carol=2 -> tie handling
      expect(result.winner).not.toBeNull()
    })

    it('handles single candidate election', () => {
      const nominations = createNominations(['Alice'])
      const votes = createRankedVotes([
        ['nom-0'],
        ['nom-0'],
        ['nom-0'],
      ])
      setupVotes(votes)

      const result = calculateRankedResults('election-1', 'position-1', nominations)

      expect(result.winner!.nomineeName).toBe('Alice')
      expect(result.winner!.percentage).toBe(100)
      expect(result.totalVotes).toBe(3)
    })

    it('filters out votes for non-existent candidates', () => {
      const nominations = createNominations(['Alice', 'Bob'])
      const votes = createRankedVotes([
        ['nom-0'],                    // Alice
        ['nom-0'],                    // Alice
        ['nom-99', 'nom-0'],          // Invalid first, then Alice
        ['nom-1'],                    // Bob
      ])
      setupVotes(votes)

      const result = calculateRankedResults('election-1', 'position-1', nominations)

      // nom-99 is invalid, so that ballot goes to Alice immediately
      expect(result.winner!.nomineeName).toBe('Alice')
      expect(result.winner!.voteCount).toBe(3)
    })
  })

  describe('Realistic Scenarios', () => {
    it('handles Burlington 2009-style scenario (3 candidates, close race)', () => {
      // Simplified Burlington mayoral scenario:
      // Democrat, Republican, Progressive - no first-round majority
      const nominations = createNominations(['Democrat', 'Republican', 'Progressive'])

      const votes = createRankedVotes([
        // Democrat voters (many rank Progressive 2nd)
        ...Array(30).fill(['nom-0', 'nom-2']),
        // Republican voters (many rank Democrat 2nd)
        ...Array(35).fill(['nom-1', 'nom-0']),
        // Progressive voters (many rank Democrat 2nd)
        ...Array(35).fill(['nom-2', 'nom-0']),
      ])
      setupVotes(votes)

      const result = calculateRankedResults('election-1', 'position-1', nominations)

      // Round 1: Dem=30, Rep=35, Prog=35 -> Dem eliminated
      // Round 2: Rep=35, Prog=65 (30 transferred) -> Progressive wins
      expect(result.winner!.nomineeName).toBe('Progressive')
      expect(result.rounds.length).toBe(2)
    })

    it('handles spoiler candidate correctly', () => {
      // Two main candidates + spoiler
      const nominations = createNominations(['Frontrunner', 'Challenger', 'Spoiler'])

      const votes = createRankedVotes([
        // Frontrunner base (40%)
        ...Array(40).fill(['nom-0']),
        // Challenger base (35%)
        ...Array(35).fill(['nom-1', 'nom-0']),
        // Spoiler voters who like Challenger (25%)
        ...Array(25).fill(['nom-2', 'nom-1']),
      ])
      setupVotes(votes)

      const result = calculateRankedResults('election-1', 'position-1', nominations)

      // Round 1: Front=40, Chal=35, Spoiler=25 -> Spoiler eliminated
      // Round 2: Front=40, Chal=60 -> Challenger wins
      // Without RCV, Frontrunner would win with 40%
      expect(result.winner!.nomineeName).toBe('Challenger')
    })
  })
})

describe('Election Phase Detection', () => {
  const createElection = (overrides: Partial<Election> = {}): Election => ({
    id: 'election-1',
    title: 'Test Election',
    positions: [],
    nominationStart: Date.now() - 1000,
    nominationEnd: Date.now() + 1000,
    votingStart: Date.now() + 1000,
    votingEnd: Date.now() + 2000,
    status: 'nominations',
    quorumPercent: 15,
    createdBy: 'admin-1',
    createdAt: Date.now() - 5000,
    ...overrides,
  })

  it('returns "upcoming" before nomination start', () => {
    const election = createElection({
      nominationStart: Date.now() + 10000,
    })

    expect(getElectionPhase(election)).toBe('upcoming')
  })

  it('returns "nominations" during nomination period', () => {
    const election = createElection({
      nominationStart: Date.now() - 10000,
      nominationEnd: Date.now() + 10000,
    })

    expect(getElectionPhase(election)).toBe('nominations')
  })

  it('returns "voting" during voting period', () => {
    const election = createElection({
      nominationStart: Date.now() - 20000,
      nominationEnd: Date.now() - 10000,
      votingEnd: Date.now() + 10000,
    })

    expect(getElectionPhase(election)).toBe('voting')
  })

  it('returns "closed" after voting ends', () => {
    const election = createElection({
      nominationStart: Date.now() - 30000,
      nominationEnd: Date.now() - 20000,
      votingEnd: Date.now() - 10000,
    })

    expect(getElectionPhase(election)).toBe('closed')
  })
})

describe('Time Remaining', () => {
  it('returns "Ended" for past timestamps', () => {
    expect(getTimeRemaining(Date.now() - 1000)).toBe('Ended')
  })

  it('returns days remaining for multi-day periods', () => {
    const threeDaysFromNow = Date.now() + (3 * 24 * 60 * 60 * 1000)
    expect(getTimeRemaining(threeDaysFromNow)).toBe('3 days remaining')
  })

  it('returns hours remaining for < 1 day', () => {
    const fiveHoursFromNow = Date.now() + (5 * 60 * 60 * 1000)
    expect(getTimeRemaining(fiveHoursFromNow)).toBe('5 hours remaining')
  })

  it('returns "Less than 1 hour" for short periods', () => {
    const thirtyMinutesFromNow = Date.now() + (30 * 60 * 1000)
    expect(getTimeRemaining(thirtyMinutesFromNow)).toBe('Less than 1 hour remaining')
  })

  it('handles singular vs plural correctly', () => {
    const oneDay = Date.now() + (24 * 60 * 60 * 1000 + 1000)
    const oneHour = Date.now() + (60 * 60 * 1000 + 1000)

    expect(getTimeRemaining(oneDay)).toBe('1 day remaining')
    expect(getTimeRemaining(oneHour)).toBe('1 hour remaining')
  })
})
