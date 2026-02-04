/**
 * Delegate Storage
 * Calculates and tracks organizer voting power based on their bloc activity
 *
 * Delegate weight is proportional to:
 * - Number of verified tenants represented
 * - Number of blocs they're involved with
 * - Activity score (proposals created, votes cast)
 */

import { getStoredProfiles, getCurrentProfile, type UserProfile } from './profileStorage'
import { getLinkedGroups, type LinkedPropertyGroup } from './linkedPropertiesStorage'
import { getGroupProposals, type GovernanceProposal } from './governanceStorage'
import { getDelegateThresholds } from './adminSettingsStorage'

// ============================================================================
// Types
// ============================================================================

export interface DelegateProfile {
  profileId: string
  nickname: string
  role: 'tenant' | 'organizer' | 'admin'

  // Representation
  blocs: string[]                     // Bloc IDs they're associated with
  verifiedTenantsRepresented: number  // Sum of verified tenants in their blocs
  buildingsRepresented: number        // Number of unique buildings

  // Activity
  proposalsCreated: number
  votesParticipated: number
  activityScore: number               // Calculated from activity

  // Delegate Status
  delegateWeight: number              // Final voting power (0 = not a delegate)
  canVoteOnAppGovernance: boolean     // Has reached threshold?
  qualificationStatus: DelegateQualificationStatus
}

export interface DelegateQualificationStatus {
  meetsTenantsThreshold: boolean
  meetsBlocsThreshold: boolean
  meetsActivityThreshold: boolean
  tenantsNeeded: number
  blocsNeeded: number
  activityNeeded: number
}

export interface DelegateStats {
  totalDelegates: number
  totalDelegateWeight: number
  totalTenantsRepresented: number
  topDelegates: DelegateProfile[]
}

// ============================================================================
// Constants
// ============================================================================

// Activity weights for score calculation
const ACTIVITY_WEIGHTS = {
  proposalCreated: 10,
  voteParticipated: 2,
  buildingOrganized: 5,
}

// Maximum delegate weight to prevent any single delegate from dominating
const MAX_DELEGATE_WEIGHT = 100

// ============================================================================
// Calculation Functions
// ============================================================================

/**
 * Calculate activity score for a profile
 */
function calculateActivityScore(
  proposalsCreated: number,
  votesParticipated: number,
  buildingsOrganized: number
): number {
  return (
    proposalsCreated * ACTIVITY_WEIGHTS.proposalCreated +
    votesParticipated * ACTIVITY_WEIGHTS.voteParticipated +
    buildingsOrganized * ACTIVITY_WEIGHTS.buildingOrganized
  )
}

/**
 * Calculate delegate weight based on representation and activity
 * Weight formula: sqrt(tenantsRepresented) * (1 + activityBonus)
 * Using sqrt to prevent massive blocs from completely dominating
 */
function calculateDelegateWeight(
  verifiedTenantsRepresented: number,
  activityScore: number
): number {
  if (verifiedTenantsRepresented === 0) return 0

  // Base weight from representation (sqrt to dampen large blocs)
  const baseWeight = Math.sqrt(verifiedTenantsRepresented) * 5

  // Activity bonus (capped at 50% boost)
  const activityBonus = Math.min(activityScore / 100, 0.5)

  // Final weight with cap
  return Math.min(baseWeight * (1 + activityBonus), MAX_DELEGATE_WEIGHT)
}

/**
 * Get blocs associated with a profile
 * A profile is associated with a bloc if:
 * - They created it (createdBy)
 * - They are in the memberProfiles list
 */
function getBlocsForProfile(
  profileId: string,
  allBlocs: LinkedPropertyGroup[]
): LinkedPropertyGroup[] {
  return allBlocs.filter(bloc =>
    bloc.createdBy === profileId ||
    bloc.memberProfiles?.includes(profileId)
  )
}

/**
 * Count verified tenants in blocs
 */
function countVerifiedTenantsInBlocs(
  blocs: LinkedPropertyGroup[],
  allProfiles: UserProfile[]
): number {
  // Get unique member profile IDs across all blocs
  const memberIds = new Set<string>()
  for (const bloc of blocs) {
    for (const memberId of bloc.memberProfiles || []) {
      memberIds.add(memberId)
    }
  }

  // Count how many are verified
  return allProfiles.filter(
    p => memberIds.has(p.id) && p.trustLevel === 'verified'
  ).length
}

/**
 * Count proposals created and votes participated by a profile
 */
function getActivityStats(
  profileId: string,
  proposals: GovernanceProposal[]
): { proposalsCreated: number; votesParticipated: number } {
  let proposalsCreated = 0
  let votesParticipated = 0

  for (const proposal of proposals) {
    if (proposal.proposedBy === profileId) {
      proposalsCreated++
    }
    if (proposal.upvotes.includes(profileId) || proposal.downvotes.includes(profileId)) {
      votesParticipated++
    }
  }

  return { proposalsCreated, votesParticipated }
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Get delegate profile for a specific user
 */
export function getDelegateProfile(profileId: string): DelegateProfile | null {
  const allProfiles = getStoredProfiles()
  const profile = allProfiles.find(p => p.id === profileId)
  if (!profile) return null

  const allBlocs = getLinkedGroups()
  const thresholds = getDelegateThresholds()

  // Get blocs for this profile
  const blocs = getBlocsForProfile(profileId, allBlocs)
  const blocIds = blocs.map(b => b.id)

  // Gather proposals from all blocs the user is in
  const proposals: GovernanceProposal[] = []
  const seenProposalIds = new Set<string>()
  for (const bloc of blocs) {
    const blocProposals = getGroupProposals(bloc.id)
    for (const p of blocProposals) {
      if (!seenProposalIds.has(p.id)) {
        proposals.push(p)
        seenProposalIds.add(p.id)
      }
    }
  }

  // Count unique buildings
  const buildingApns = new Set<string>()
  for (const bloc of blocs) {
    for (const apn of bloc.apns) {
      buildingApns.add(apn)
    }
  }

  // Count verified tenants
  const verifiedTenantsRepresented = countVerifiedTenantsInBlocs(blocs, allProfiles)

  // Get activity stats
  const { proposalsCreated, votesParticipated } = getActivityStats(profileId, proposals)

  // Calculate scores
  const activityScore = calculateActivityScore(
    proposalsCreated,
    votesParticipated,
    buildingApns.size
  )

  // Only organizers can be delegates
  const isOrganizer = profile.role === 'organizer' || profile.role === 'admin'
  const delegateWeight = isOrganizer
    ? calculateDelegateWeight(verifiedTenantsRepresented, activityScore)
    : 0

  // Check qualification
  const meetsTenantsThreshold = verifiedTenantsRepresented >= thresholds.minVerifiedTenants
  const meetsBlocsThreshold = blocs.length >= thresholds.minBlocs
  const meetsActivityThreshold = activityScore >= thresholds.minActivityScore

  const canVoteOnAppGovernance = isOrganizer &&
    meetsTenantsThreshold &&
    meetsBlocsThreshold &&
    meetsActivityThreshold

  return {
    profileId,
    nickname: profile.nickname,
    role: profile.role,
    blocs: blocIds,
    verifiedTenantsRepresented,
    buildingsRepresented: buildingApns.size,
    proposalsCreated,
    votesParticipated,
    activityScore,
    delegateWeight,
    canVoteOnAppGovernance,
    qualificationStatus: {
      meetsTenantsThreshold,
      meetsBlocsThreshold,
      meetsActivityThreshold,
      tenantsNeeded: Math.max(0, thresholds.minVerifiedTenants - verifiedTenantsRepresented),
      blocsNeeded: Math.max(0, thresholds.minBlocs - blocs.length),
      activityNeeded: Math.max(0, thresholds.minActivityScore - activityScore),
    },
  }
}

/**
 * Get delegate profile for current user
 */
export function getCurrentDelegateProfile(): DelegateProfile | null {
  const profile = getCurrentProfile()
  if (!profile) return null
  return getDelegateProfile(profile.id)
}

/**
 * Get all delegates (organizers who qualify for app governance voting)
 */
export function getAllDelegates(): DelegateProfile[] {
  const allProfiles = getStoredProfiles()
  const delegates: DelegateProfile[] = []

  for (const profile of allProfiles) {
    if (profile.role === 'organizer' || profile.role === 'admin') {
      const delegateProfile = getDelegateProfile(profile.id)
      if (delegateProfile && delegateProfile.canVoteOnAppGovernance) {
        delegates.push(delegateProfile)
      }
    }
  }

  // Sort by delegate weight (highest first)
  return delegates.sort((a, b) => b.delegateWeight - a.delegateWeight)
}

/**
 * Get overall delegate statistics
 */
export function getDelegateStats(): DelegateStats {
  const delegates = getAllDelegates()

  const totalDelegateWeight = delegates.reduce((sum, d) => sum + d.delegateWeight, 0)
  const totalTenantsRepresented = delegates.reduce(
    (sum, d) => sum + d.verifiedTenantsRepresented,
    0
  )

  return {
    totalDelegates: delegates.length,
    totalDelegateWeight,
    totalTenantsRepresented,
    topDelegates: delegates.slice(0, 5),
  }
}

/**
 * Check if a specific profile can vote on app governance
 */
export function canVoteOnAppGovernance(profileId: string): boolean {
  const delegateProfile = getDelegateProfile(profileId)
  return delegateProfile?.canVoteOnAppGovernance ?? false
}

/**
 * Get the voting weight for a delegate
 * Returns 0 if not a qualified delegate
 */
export function getVotingWeight(profileId: string): number {
  const delegateProfile = getDelegateProfile(profileId)
  if (!delegateProfile?.canVoteOnAppGovernance) return 0
  return delegateProfile.delegateWeight
}

/**
 * Calculate what percentage of total delegate weight a profile has
 */
export function getDelegateWeightPercentage(profileId: string): number {
  const stats = getDelegateStats()
  if (stats.totalDelegateWeight === 0) return 0

  const weight = getVotingWeight(profileId)
  return (weight / stats.totalDelegateWeight) * 100
}

// ============================================================================
// Admin Recall Threshold
// ============================================================================

/**
 * Calculate the threshold needed for admin recall
 * Requires combined delegate weight representing 2/3 of total
 */
export function getAdminRecallThreshold(): {
  requiredWeight: number
  currentTotalWeight: number
  percentageNeeded: number
} {
  const stats = getDelegateStats()
  const requiredWeight = stats.totalDelegateWeight * (2 / 3)

  return {
    requiredWeight,
    currentTotalWeight: stats.totalDelegateWeight,
    percentageNeeded: 66.67,
  }
}

/**
 * Check if enough delegates have voted for admin recall
 */
export function hasAdminRecallPassed(voterWeights: number[]): boolean {
  const threshold = getAdminRecallThreshold()
  const totalVoteWeight = voterWeights.reduce((sum, w) => sum + w, 0)
  return totalVoteWeight >= threshold.requiredWeight
}
