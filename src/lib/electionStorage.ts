'use client'

import { getSocket } from './socketio'
import { safeJsonParse } from './safeStorage'
import { supabase, USE_SUPABASE, setUserContext } from './supabase'
import { getCurrentProfile } from './profileStorage'
import { createLogger } from './logger'
import { generateShortId, generateEntityId, isLocalId } from './idUtils'

const log = createLogger('Elections')

// ============================================================================
// Types
// ============================================================================

export interface ElectionPosition {
  id: string
  title: string                    // "President", "Vice President", etc.
  description: string
  termLength: number               // months (12 = 1 year)
  maxTerms: number                 // term limits (0 = unlimited)
}

export interface Election {
  id: string
  title: string                    // e.g., "2025 Officer Elections"
  positions: ElectionPosition[]
  nominationStart: number          // Unix timestamp
  nominationEnd: number
  votingStart: number
  votingEnd: number
  status: 'draft' | 'nominations' | 'voting' | 'closed'
  quorumPercent: number            // default 15%
  createdBy: string
  createdAt: number
}

export interface Nomination {
  id: string
  electionId: string
  positionId: string
  nomineeId: string                // profile ID of nominee
  nomineeName: string
  nominatorId: string
  nominatorName: string
  statement: string                // candidate statement
  accepted: boolean | null         // null = pending, true/false = responded
  createdAt: number
}

export interface Vote {
  id: string
  electionId: string
  positionId: string
  voterId: string                  // profile ID (one vote per position)
  candidateId: string              // the nomination ID they voted for (legacy simple voting)
  timestamp: number
}

// Ranked Choice Voting (RCV) types
export interface RankedVote {
  id: string
  electionId: string
  positionId: string
  voterId: string
  rankings: string[]               // candidateIds in order of preference (1st, 2nd, 3rd...)
  timestamp: number
}

export interface EliminationRound {
  roundNumber: number
  candidateTotals: Map<string, number>
  eliminatedCandidateId: string | null
  eliminatedCandidateName: string | null
  transferred: number              // votes transferred from eliminated candidate
}

export interface ElectionResults {
  electionId: string
  positions: PositionResult[]
  totalEligibleVoters: number
  totalVoters: number
  quorumMet: boolean
}

export interface PositionResult {
  positionId: string
  positionTitle: string
  candidates: CandidateResult[]
  winnerId: string | null
  winnerName: string | null
  totalVotes: number
  needsRunoff: boolean
  // RCV-specific fields
  eliminationRounds?: EliminationRoundResult[]
  usedRankedChoice?: boolean
}

export interface EliminationRoundResult {
  roundNumber: number
  candidateTotals: { candidateId: string; candidateName: string; votes: number }[]
  eliminatedCandidateId: string | null
  eliminatedCandidateName: string | null
  transferred: number
}

export interface CandidateResult {
  nominationId: string
  nomineeId: string
  nomineeName: string
  voteCount: number
  percentage: number
}

// Officer position registry — tracks who currently holds each elected position
export interface OfficerPosition {
  positionId: string          // Election position ID
  positionTitle: string       // "President", "Vice President", etc.
  holderId: string            // Profile ID of current holder
  holderName: string          // Display name
  electionId: string          // Election that granted it
  termStart: number           // When they took office
  termEnd: number             // termStart + termLength months
  termNumber: number          // Which term (1, 2, etc.)
}

// Default officer positions per RSTU bylaws
export const DEFAULT_POSITIONS: Omit<ElectionPosition, 'id'>[] = [
  {
    title: 'President',
    description: 'Leads general meetings, represents the union publicly, coordinates with other organizations.',
    termLength: 12,
    maxTerms: 2,
  },
  {
    title: 'Vice President',
    description: 'Assists the President, leads meetings in their absence, oversees committees.',
    termLength: 12,
    maxTerms: 2,
  },
  {
    title: 'Secretary',
    description: 'Takes meeting minutes, maintains records, handles official correspondence.',
    termLength: 12,
    maxTerms: 2,
  },
  {
    title: 'Treasurer',
    description: 'Manages union finances, maintains budget, provides financial reports.',
    termLength: 12,
    maxTerms: 2,
  },
]

// ============================================================================
// Local Storage
// ============================================================================

const ELECTIONS_KEY = 'rstu-elections'
const NOMINATIONS_KEY = 'rstu-nominations'
const VOTES_KEY = 'rstu-votes'
const RANKED_VOTES_KEY = 'rstu-ranked-votes'
const OFFICER_POSITIONS_KEY = 'rstu-officer-positions'

// Use generateShortId from idUtils for ID generation
function generateId(): string {
  return generateShortId()
}

// ============================================================================
// Election Functions
// ============================================================================

export function getElections(): Election[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(ELECTIONS_KEY)
  return safeJsonParse<Election[]>(stored, [])
}

export function getElection(id: string): Election | null {
  const elections = getElections()
  return elections.find(e => e.id === id) || null
}

export function getActiveElection(): Election | null {
  const elections = getElections()
  const now = Date.now()

  // Find election in nominations or voting phase
  return elections.find(e =>
    e.status === 'nominations' || e.status === 'voting' ||
    (e.status === 'draft' && e.nominationStart <= now && now < e.votingEnd)
  ) || null
}

export function saveElection(election: Election): void {
  const elections = getElections()
  const index = elections.findIndex(e => e.id === election.id)

  if (index >= 0) {
    elections[index] = election
  } else {
    elections.push(election)
  }

  localStorage.setItem(ELECTIONS_KEY, JSON.stringify(elections))

  // Sync to server
  const socket = getSocket()
  if (socket) {
    socket.emit('election:save', { election })
  }
}

export function createElection(data: Omit<Election, 'id' | 'createdAt' | 'status'>): Election {
  const election: Election = {
    ...data,
    id: generateId(),
    status: 'draft',
    createdAt: Date.now(),
  }

  saveElection(election)
  return election
}

export function updateElectionStatus(electionId: string, status: Election['status']): void {
  const election = getElection(electionId)
  if (election) {
    election.status = status
    saveElection(election)
  }
}

// ============================================================================
// Nomination Functions
// ============================================================================

export function getNominations(electionId?: string): Nomination[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(NOMINATIONS_KEY)
  const nominations: Nomination[] = safeJsonParse<Nomination[]>(stored, [])

  if (electionId) {
    return nominations.filter(n => n.electionId === electionId)
  }
  return nominations
}

export function getNominationsForPosition(electionId: string, positionId: string): Nomination[] {
  return getNominations(electionId).filter(n => n.positionId === positionId && n.accepted === true)
}

export function getUserNomination(electionId: string, nomineeId: string): Nomination | null {
  return getNominations(electionId).find(n => n.nomineeId === nomineeId) || null
}

export function hasUserNominated(electionId: string, nominatorId: string, positionId: string): boolean {
  return getNominations(electionId).some(
    n => n.nominatorId === nominatorId && n.positionId === positionId
  )
}

export function saveNomination(nomination: Nomination): void {
  if (typeof window === 'undefined') return

  const nominations = getNominations()
  const index = nominations.findIndex(n => n.id === nomination.id)

  if (index >= 0) {
    nominations[index] = nomination
  } else {
    nominations.push(nomination)
  }

  localStorage.setItem(NOMINATIONS_KEY, JSON.stringify(nominations))

  // Sync to server
  const socket = getSocket()
  if (socket) {
    socket.emit('election:nominate', { nomination })
  }
}

export function createNomination(data: {
  electionId: string
  positionId: string
  nomineeId: string
  nomineeName: string
  nominatorId: string
  nominatorName: string
  statement: string
  selfNomination?: boolean
}): Nomination {
  const nomination: Nomination = {
    id: generateId(),
    electionId: data.electionId,
    positionId: data.positionId,
    nomineeId: data.nomineeId,
    nomineeName: data.nomineeName,
    nominatorId: data.nominatorId,
    nominatorName: data.nominatorName,
    statement: data.statement,
    accepted: data.selfNomination ? true : null,
    createdAt: Date.now(),
  }

  saveNomination(nomination)
  return nomination
}

export function respondToNomination(nominationId: string, accepted: boolean): void {
  const nominations = getNominations()
  const nomination = nominations.find(n => n.id === nominationId)

  if (nomination) {
    nomination.accepted = accepted
    saveNomination(nomination)

    // Sync to server
    const socket = getSocket()
    if (socket) {
      socket.emit('election:accept_nomination', { nominationId, accepted })
    }
  }
}

// ============================================================================
// Vote Functions
// ============================================================================

export function getVotes(electionId?: string): Vote[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(VOTES_KEY)
  const votes: Vote[] = safeJsonParse<Vote[]>(stored, [])

  if (electionId) {
    return votes.filter(v => v.electionId === electionId)
  }
  return votes
}

export function hasVotedForPosition(electionId: string, positionId: string, voterId: string): boolean {
  return getVotes(electionId).some(
    v => v.positionId === positionId && v.voterId === voterId
  )
}

export function getUserVotes(electionId: string, voterId: string): Vote[] {
  return getVotes(electionId).filter(v => v.voterId === voterId)
}

export function castVote(data: {
  electionId: string
  positionId: string
  voterId: string
  candidateId: string
}): Vote | null {
  // Check if already voted for this position
  if (hasVotedForPosition(data.electionId, data.positionId, data.voterId)) {
    return null
  }

  const vote: Vote = {
    id: generateId(),
    electionId: data.electionId,
    positionId: data.positionId,
    voterId: data.voterId,
    candidateId: data.candidateId,
    timestamp: Date.now(),
  }

  if (typeof window !== 'undefined') {
    const votes = getVotes()
    votes.push(vote)
    localStorage.setItem(VOTES_KEY, JSON.stringify(votes))
  }

  // Sync to server
  const socket = getSocket()
  if (socket) {
    socket.emit('election:vote', { vote })
  }

  return vote
}

// ============================================================================
// Ranked Choice Voting Functions
// ============================================================================

export function getRankedVotes(electionId?: string): RankedVote[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(RANKED_VOTES_KEY)
  const votes: RankedVote[] = safeJsonParse<RankedVote[]>(stored, [])

  if (electionId) {
    return votes.filter(v => v.electionId === electionId)
  }
  return votes
}

export function hasRankedVotedForPosition(electionId: string, positionId: string, voterId: string): boolean {
  return getRankedVotes(electionId).some(
    v => v.positionId === positionId && v.voterId === voterId
  )
}

export function getUserRankedVote(electionId: string, positionId: string, voterId: string): RankedVote | null {
  return getRankedVotes(electionId).find(
    v => v.positionId === positionId && v.voterId === voterId
  ) || null
}

export function castRankedVote(data: {
  electionId: string
  positionId: string
  voterId: string
  rankings: string[]  // candidate IDs in preference order
}): RankedVote | null {
  // Check if already voted for this position
  if (hasRankedVotedForPosition(data.electionId, data.positionId, data.voterId)) {
    return null
  }

  // Validate rankings
  if (data.rankings.length === 0) {
    return null
  }

  const vote: RankedVote = {
    id: generateId(),
    electionId: data.electionId,
    positionId: data.positionId,
    voterId: data.voterId,
    rankings: data.rankings,
    timestamp: Date.now(),
  }

  if (typeof window !== 'undefined') {
    const votes = getRankedVotes()
    votes.push(vote)
    localStorage.setItem(RANKED_VOTES_KEY, JSON.stringify(votes))
  }

  // Sync to server
  const socket = getSocket()
  if (socket) {
    socket.emit('election:ranked_vote', { vote })
  }

  return vote
}

/**
 * Instant-Runoff Voting (IRV) Algorithm
 *
 * 1. Count first-choice votes for each candidate
 * 2. If a candidate has >50%, they win
 * 3. Otherwise, eliminate the candidate with fewest votes
 * 4. Redistribute eliminated candidate's votes to next preferences
 * 5. Repeat until someone has >50% or only one candidate remains
 */
export function calculateRankedResults(
  electionId: string,
  positionId: string,
  nominations: Nomination[]
): { winner: CandidateResult | null; rounds: EliminationRoundResult[]; totalVotes: number } {
  const rankedVotes = getRankedVotes(electionId).filter(v => v.positionId === positionId)
  const acceptedNominations = nominations.filter(n => n.positionId === positionId && n.accepted === true)

  if (rankedVotes.length === 0 || acceptedNominations.length === 0) {
    return { winner: null, rounds: [], totalVotes: 0 }
  }

  // Create a map of nomination ID to name
  const nominationNames = new Map<string, string>()
  acceptedNominations.forEach(n => nominationNames.set(n.id, n.nomineeName))

  // Track remaining candidates
  let remainingCandidates = new Set(acceptedNominations.map(n => n.id))

  // Each ballot tracks current position in rankings
  const ballots = rankedVotes.map(v => ({
    rankings: v.rankings.filter(r => remainingCandidates.has(r)),
    currentIndex: 0,
  }))

  const rounds: EliminationRoundResult[] = []
  let roundNumber = 1

  while (remainingCandidates.size > 1) {
    // Count first-choice votes (considering eliminations)
    const voteCounts = new Map<string, number>()
    remainingCandidates.forEach(c => voteCounts.set(c, 0))

    let activeVotes = 0
    ballots.forEach(ballot => {
      // Find first remaining candidate in this ballot's rankings
      const validChoice = ballot.rankings.find(r => remainingCandidates.has(r))
      if (validChoice) {
        voteCounts.set(validChoice, (voteCounts.get(validChoice) || 0) + 1)
        activeVotes++
      }
    })

    // Check for majority winner
    const majority = activeVotes / 2
    let winner: string | null = null

    voteCounts.forEach((votes, candidateId) => {
      if (votes > majority) {
        winner = candidateId
      }
    })

    // Build round result
    const candidateTotals = Array.from(voteCounts.entries())
      .map(([candidateId, votes]) => ({
        candidateId,
        candidateName: nominationNames.get(candidateId) || 'Unknown',
        votes,
      }))
      .sort((a, b) => b.votes - a.votes)

    if (winner) {
      // We have a winner
      rounds.push({
        roundNumber,
        candidateTotals,
        eliminatedCandidateId: null,
        eliminatedCandidateName: null,
        transferred: 0,
      })

      const winningNomination = acceptedNominations.find(n => n.id === winner)
      return {
        winner: {
          nominationId: winner,
          nomineeId: winningNomination?.nomineeId || '',
          nomineeName: nominationNames.get(winner) || 'Unknown',
          voteCount: voteCounts.get(winner) || 0,
          percentage: activeVotes > 0 ? ((voteCounts.get(winner) || 0) / activeVotes) * 100 : 0,
        },
        rounds,
        totalVotes: rankedVotes.length,
      }
    }

    // No majority - eliminate candidate with fewest votes
    let minVotes = Infinity
    let eliminatedId: string | null = null

    voteCounts.forEach((votes, candidateId) => {
      if (votes < minVotes) {
        minVotes = votes
        eliminatedId = candidateId
      }
    })

    if (eliminatedId) {
      remainingCandidates.delete(eliminatedId)

      rounds.push({
        roundNumber,
        candidateTotals,
        eliminatedCandidateId: eliminatedId,
        eliminatedCandidateName: nominationNames.get(eliminatedId) || 'Unknown',
        transferred: minVotes,
      })
    }

    roundNumber++

    // Safety check - shouldn't happen but prevents infinite loops
    if (roundNumber > 100) break
  }

  // Only one candidate remains
  if (remainingCandidates.size === 1) {
    const lastCandidate = Array.from(remainingCandidates)[0]
    const lastNomination = acceptedNominations.find(n => n.id === lastCandidate)

    return {
      winner: {
        nominationId: lastCandidate,
        nomineeId: lastNomination?.nomineeId || '',
        nomineeName: nominationNames.get(lastCandidate) || 'Unknown',
        voteCount: rankedVotes.length,
        percentage: 100,
      },
      rounds,
      totalVotes: rankedVotes.length,
    }
  }

  return { winner: null, rounds, totalVotes: rankedVotes.length }
}

export function syncRankedVotesFromServer(votes: RankedVote[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(RANKED_VOTES_KEY, JSON.stringify(votes))
}

// ============================================================================
// Results Functions
// ============================================================================

export function calculateResults(electionId: string, totalEligibleVoters: number): ElectionResults {
  const election = getElection(electionId)
  if (!election) {
    throw new Error('Election not found')
  }

  const votes = getVotes(electionId)
  const nominations = getNominations(electionId)

  // Get unique voters
  const uniqueVoters = new Set(votes.map(v => v.voterId))
  const totalVoters = uniqueVoters.size

  // Check quorum
  const quorumMet = totalEligibleVoters > 0
    ? (totalVoters / totalEligibleVoters) >= (election.quorumPercent / 100)
    : false

  const positions: PositionResult[] = election.positions.map(position => {
    const positionVotes = votes.filter(v => v.positionId === position.id)
    const positionNominations = nominations.filter(
      n => n.positionId === position.id && n.accepted === true
    )

    // Count votes per candidate
    const voteCounts = new Map<string, number>()
    positionNominations.forEach(n => voteCounts.set(n.id, 0))

    positionVotes.forEach(vote => {
      const current = voteCounts.get(vote.candidateId) || 0
      voteCounts.set(vote.candidateId, current + 1)
    })

    const totalPositionVotes = positionVotes.length

    const candidates: CandidateResult[] = positionNominations.map(n => ({
      nominationId: n.id,
      nomineeId: n.nomineeId,
      nomineeName: n.nomineeName,
      voteCount: voteCounts.get(n.id) || 0,
      percentage: totalPositionVotes > 0
        ? ((voteCounts.get(n.id) || 0) / totalPositionVotes) * 100
        : 0,
    })).sort((a, b) => b.voteCount - a.voteCount)

    // Determine winner (>50% majority required)
    const winner = candidates.find(c => c.percentage > 50)
    const needsRunoff = candidates.length > 1 && !winner && totalPositionVotes > 0

    return {
      positionId: position.id,
      positionTitle: position.title,
      candidates,
      winnerId: winner?.nomineeId || null,
      winnerName: winner?.nomineeName || null,
      totalVotes: totalPositionVotes,
      needsRunoff,
    }
  })

  return {
    electionId,
    positions,
    totalEligibleVoters,
    totalVoters,
    quorumMet,
  }
}

// ============================================================================
// Socket.io Sync Helpers
// ============================================================================

export function syncElectionsFromServer(elections: Election[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ELECTIONS_KEY, JSON.stringify(elections))
}

export function syncNominationsFromServer(nominations: Nomination[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(NOMINATIONS_KEY, JSON.stringify(nominations))
}

export function syncVotesFromServer(votes: Vote[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes))
}

// ============================================================================
// Date Helpers
// ============================================================================

export function getElectionPhase(election: Election): 'upcoming' | 'nominations' | 'voting' | 'closed' {
  const now = Date.now()

  if (now < election.nominationStart) return 'upcoming'
  if (now < election.nominationEnd) return 'nominations'
  if (now < election.votingEnd) return 'voting'
  return 'closed'
}

export function formatElectionDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getTimeRemaining(endTimestamp: number): string {
  const now = Date.now()
  const remaining = endTimestamp - now

  if (remaining <= 0) return 'Ended'

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`
  return 'Less than 1 hour remaining'
}

// ============================================================================
// Supabase Async Functions (Server-Verified)
// ============================================================================

/**
 * Cast a ranked vote through the server (prevents localStorage manipulation)
 * This is the secure version that validates server-side
 */
export async function castRankedVoteAsync(data: {
  electionId: string
  positionId: string
  rankings: string[]
}): Promise<{ success: boolean; error?: string; voteId?: string }> {
  const profile = getCurrentProfile()
  if (!profile) {
    return { success: false, error: 'Not logged in' }
  }

  // Always do local vote first for optimistic UI
  const localVote = castRankedVote({
    ...data,
    voterId: profile.id,
  })

  if (!localVote) {
    return { success: false, error: 'Already voted for this position' }
  }

  // If Supabase is available, verify server-side
  if (USE_SUPABASE && supabase) {
    try {
      await setUserContext(profile.id)

      const { data: voteId, error } = await supabase.rpc('cast_ranked_vote', {
        p_election_id: data.electionId,
        p_position_id: data.positionId,
        p_rankings: data.rankings,
      })

      if (error) {
        log.error('Server vote error:', error)
        // Roll back local vote
        rollbackRankedVote(data.electionId, data.positionId, profile.id)
        return { success: false, error: error.message }
      }

      log.info(`Ranked vote recorded server-side: ${voteId}`)
      return { success: true, voteId }
    } catch (e) {
      log.error('Server vote exception:', e)
      // Roll back local vote on error
      rollbackRankedVote(data.electionId, data.positionId, profile.id)
      return { success: false, error: 'Failed to cast vote' }
    }
  }

  // No Supabase - just return local success
  return { success: true, voteId: localVote.id }
}

/**
 * Roll back a ranked vote from localStorage (used when server rejects)
 */
function rollbackRankedVote(electionId: string, positionId: string, voterId: string): void {
  if (typeof window === 'undefined') return

  const votes = getRankedVotes()
  const filtered = votes.filter(
    v => !(v.electionId === electionId && v.positionId === positionId && v.voterId === voterId)
  )
  localStorage.setItem(RANKED_VOTES_KEY, JSON.stringify(filtered))
  log.info('Rolled back local ranked vote after server rejection')
}

/**
 * Create a nomination through the server (prevents localStorage manipulation)
 */
export async function createNominationAsync(data: {
  electionId: string
  positionId: string
  nomineeId: string
  nomineeName: string
  statement: string
  selfNomination?: boolean
}): Promise<{ success: boolean; error?: string; nominationId?: string }> {
  const profile = getCurrentProfile()
  if (!profile) {
    return { success: false, error: 'Not logged in' }
  }

  // Create local nomination first for optimistic UI
  const localNomination = createNomination({
    ...data,
    nominatorId: profile.id,
    nominatorName: profile.nickname,
  })

  // If Supabase is available, verify server-side
  if (USE_SUPABASE && supabase) {
    try {
      await setUserContext(profile.id)

      const { data: nominationId, error } = await supabase.rpc('create_nomination', {
        p_election_id: data.electionId,
        p_position_id: data.positionId,
        p_nominee_id: data.nomineeId,
        p_nominee_name: data.nomineeName,
        p_statement: data.statement,
        p_self_nomination: data.selfNomination || false,
      })

      if (error) {
        log.error('Server nomination error:', error)
        // Roll back local nomination
        rollbackNomination(localNomination.id)
        return { success: false, error: error.message }
      }

      // Update local nomination with server ID if different
      if (nominationId && nominationId !== localNomination.id) {
        updateLocalNominationId(localNomination.id, nominationId)
      }

      log.info(`Nomination recorded server-side: ${nominationId}`)
      return { success: true, nominationId }
    } catch (e) {
      log.error('Server nomination exception:', e)
      rollbackNomination(localNomination.id)
      return { success: false, error: 'Failed to create nomination' }
    }
  }

  return { success: true, nominationId: localNomination.id }
}

/**
 * Roll back a nomination from localStorage
 */
function rollbackNomination(nominationId: string): void {
  if (typeof window === 'undefined') return

  const nominations = getNominations()
  const filtered = nominations.filter(n => n.id !== nominationId)
  localStorage.setItem(NOMINATIONS_KEY, JSON.stringify(filtered))
  log.info('Rolled back local nomination after server rejection')
}

/**
 * Update local nomination ID to match server ID
 */
function updateLocalNominationId(oldId: string, newId: string): void {
  if (typeof window === 'undefined') return

  const nominations = getNominations()
  const nomination = nominations.find(n => n.id === oldId)
  if (nomination) {
    nomination.id = newId
    localStorage.setItem(NOMINATIONS_KEY, JSON.stringify(nominations))
  }
}

/**
 * Respond to a nomination through the server
 */
export async function respondToNominationAsync(
  nominationId: string,
  accepted: boolean
): Promise<{ success: boolean; error?: string }> {
  const profile = getCurrentProfile()
  if (!profile) {
    return { success: false, error: 'Not logged in' }
  }

  // Update local first for optimistic UI
  respondToNomination(nominationId, accepted)

  // If Supabase is available, verify server-side
  if (USE_SUPABASE && supabase) {
    try {
      await setUserContext(profile.id)

      const { error } = await supabase.rpc('respond_to_nomination', {
        p_nomination_id: nominationId,
        p_accepted: accepted,
      })

      if (error) {
        log.error('Server nomination response error:', error)
        // Roll back - set back to pending
        const nominations = getNominations()
        const nomination = nominations.find(n => n.id === nominationId)
        if (nomination) {
          nomination.accepted = null
          localStorage.setItem(NOMINATIONS_KEY, JSON.stringify(nominations))
        }
        return { success: false, error: error.message }
      }

      log.info(`Nomination response recorded: ${accepted ? 'accepted' : 'declined'}`)
      return { success: true }
    } catch (e) {
      log.error('Server nomination response exception:', e)
      return { success: false, error: 'Failed to respond to nomination' }
    }
  }

  return { success: true }
}

/**
 * Fetch elections from Supabase and sync to localStorage
 */
export async function fetchElectionsFromServer(): Promise<Election[]> {
  if (!USE_SUPABASE || !supabase) {
    return getElections()
  }

  try {
    const { data: elections, error } = await supabase
      .from('elections')
      .select(`
        *,
        election_positions (*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      log.error('Failed to fetch elections:', error)
      return getElections()
    }

    // Transform to local format
    const transformed: Election[] = (elections || []).map(e => ({
      id: e.id,
      title: e.title,
      positions: (e.election_positions || []).map((p: {
        id: string
        title: string
        description: string | null
        term_length: number
        max_terms: number
      }) => ({
        id: p.id,
        title: p.title,
        description: p.description || '',
        termLength: p.term_length,
        maxTerms: p.max_terms,
      })),
      nominationStart: new Date(e.nomination_start).getTime(),
      nominationEnd: new Date(e.nomination_end).getTime(),
      votingStart: new Date(e.voting_start).getTime(),
      votingEnd: new Date(e.voting_end).getTime(),
      status: e.status,
      quorumPercent: e.quorum_percent,
      createdBy: e.created_by,
      createdAt: new Date(e.created_at).getTime(),
    }))

    // Sync to localStorage
    syncElectionsFromServer(transformed)

    return transformed
  } catch (e) {
    log.error('Exception fetching elections:', e)
    return getElections()
  }
}

/**
 * Fetch nominations from Supabase and sync to localStorage
 */
export async function fetchNominationsFromServer(electionId: string): Promise<Nomination[]> {
  if (!USE_SUPABASE || !supabase) {
    return getNominations(electionId)
  }

  try {
    const { data: nominations, error } = await supabase
      .from('nominations')
      .select('*')
      .eq('election_id', electionId)

    if (error) {
      log.error('Failed to fetch nominations:', error)
      return getNominations(electionId)
    }

    // Transform to local format
    const transformed: Nomination[] = (nominations || []).map(n => ({
      id: n.id,
      electionId: n.election_id,
      positionId: n.position_id,
      nomineeId: n.nominee_id,
      nomineeName: n.nominee_name,
      nominatorId: n.nominator_id,
      nominatorName: n.nominator_name,
      statement: n.statement || '',
      accepted: n.accepted,
      createdAt: new Date(n.created_at).getTime(),
    }))

    // Merge with local nominations (in case of offline changes)
    const local = getNominations(electionId)
    const merged = mergeNominations(local, transformed)
    localStorage.setItem(NOMINATIONS_KEY, JSON.stringify(merged))

    return merged.filter(n => n.electionId === electionId)
  } catch (e) {
    log.error('Exception fetching nominations:', e)
    return getNominations(electionId)
  }
}

/**
 * Merge local and server nominations (server wins on conflicts)
 */
function mergeNominations(local: Nomination[], server: Nomination[]): Nomination[] {
  const serverIds = new Set(server.map(n => n.id))
  const serverElectionIds = new Set(server.map(n => n.electionId))

  // Keep local nominations that aren't from the fetched election
  const localOther = local.filter(n => !serverElectionIds.has(n.electionId))

  // Server nominations take precedence
  return [...localOther, ...server]
}

/**
 * Fetch ranked votes from Supabase and sync to localStorage
 */
export async function fetchRankedVotesFromServer(electionId: string): Promise<RankedVote[]> {
  if (!USE_SUPABASE || !supabase) {
    return getRankedVotes(electionId)
  }

  try {
    const { data: votes, error } = await supabase
      .from('ranked_votes')
      .select('*')
      .eq('election_id', electionId)

    if (error) {
      log.error('Failed to fetch ranked votes:', error)
      return getRankedVotes(electionId)
    }

    // Transform to local format
    const transformed: RankedVote[] = (votes || []).map(v => ({
      id: v.id,
      electionId: v.election_id,
      positionId: v.position_id,
      voterId: v.voter_id,
      rankings: v.rankings || [],
      timestamp: new Date(v.created_at).getTime(),
    }))

    // Sync to localStorage (replace for this election)
    const local = getRankedVotes()
    const otherElections = local.filter(v => v.electionId !== electionId)
    localStorage.setItem(RANKED_VOTES_KEY, JSON.stringify([...otherElections, ...transformed]))

    return transformed
  } catch (e) {
    log.error('Exception fetching ranked votes:', e)
    return getRankedVotes(electionId)
  }
}

// ============================================================================
// Officer Position Registry
// ============================================================================

export function getOfficerPositions(): OfficerPosition[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(OFFICER_POSITIONS_KEY)
  return safeJsonParse<OfficerPosition[]>(stored, [])
}

export function saveOfficerPositions(positions: OfficerPosition[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(OFFICER_POSITIONS_KEY, JSON.stringify(positions))
}

export function getPositionHolder(positionTitle: string): OfficerPosition | null {
  return getOfficerPositions().find(p => p.positionTitle === positionTitle) || null
}

export function getOfficerTitleForUser(userId: string): string | null {
  const pos = getOfficerPositions().find(p => p.holderId === userId)
  return pos ? pos.positionTitle : null
}

export function setOfficerPosition(position: OfficerPosition): void {
  const positions = getOfficerPositions()
  // Replace existing holder of same position title
  const filtered = positions.filter(p => p.positionTitle !== position.positionTitle)
  filtered.push(position)
  saveOfficerPositions(filtered)
}

export function clearOfficerPosition(positionTitle: string): void {
  const positions = getOfficerPositions()
  saveOfficerPositions(positions.filter(p => p.positionTitle !== positionTitle))
}

/**
 * Assign election winners to the officer positions registry.
 * Called when an election is closed.
 */
export function assignElectionWinners(electionId: string): void {
  const election = getElection(electionId)
  if (!election) return

  const nominations = getNominations(electionId)

  for (const position of election.positions) {
    const rcvResult = calculateRankedResults(electionId, position.id, nominations)

    if (rcvResult.winner) {
      // Clear previous holder's officerTitle if it was for this position
      const previousHolder = getPositionHolder(position.title)

      // Count previous terms for this position by same person
      const existingPositions = getOfficerPositions()
      const previousTerms = existingPositions.filter(
        p => p.positionTitle === position.title && p.holderId === rcvResult.winner!.nomineeId
      ).length

      const now = Date.now()
      const termEnd = now + (position.termLength * 30 * 24 * 60 * 60 * 1000) // approximate months

      setOfficerPosition({
        positionId: position.id,
        positionTitle: position.title,
        holderId: rcvResult.winner.nomineeId,
        holderName: rcvResult.winner.nomineeName,
        electionId,
        termStart: now,
        termEnd,
        termNumber: previousTerms + 1,
      })

      // Update current user's profile if they won
      const profile = getCurrentProfile()
      if (profile && profile.id === rcvResult.winner.nomineeId) {
        import('./profileStorage').then(({ updateProfile }) => {
          updateProfile({ officerTitle: position.title })
        })
      }

      // If previous holder was different, clear their title
      if (previousHolder && previousHolder.holderId !== rcvResult.winner.nomineeId) {
        const currentProfile = getCurrentProfile()
        if (currentProfile && currentProfile.id === previousHolder.holderId) {
          import('./profileStorage').then(({ updateProfile }) => {
            updateProfile({ officerTitle: undefined })
          })
        }
      }

      log.info(`Assigned ${rcvResult.winner.nomineeName} as ${position.title}`)
    }
  }
}
