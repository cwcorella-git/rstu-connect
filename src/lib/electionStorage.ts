'use client'

import { getSocket } from './socketio'
import { safeJsonParse } from './safeStorage'

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
  candidateId: string              // the nomination ID they voted for
  timestamp: number
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
}

export interface CandidateResult {
  nominationId: string
  nomineeId: string
  nomineeName: string
  voteCount: number
  percentage: number
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

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().split('-')[0]
  }
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(4)
    crypto.getRandomValues(bytes)
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  }
  throw new Error('Crypto API not available')
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
