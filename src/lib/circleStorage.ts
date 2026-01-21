import { createLogger } from './logger'

const log = createLogger('Circle')

// Circle storage for tenant-created interest groups
// Lightweight alternative to Collectives - any tenant can create

import { getCurrentProfile, getProfileById, type UserProfile } from './profileStorage'
import { safeJsonParse } from './safeStorage'

// ============================================
// Types
// ============================================

export type CircleCategory =
  | 'social'         // Book clubs, gaming, hobbies
  | 'mutual_aid'     // Skill sharing, resource pooling
  | 'advocacy'       // Issue-based organizing
  | 'neighborhood'   // Geographic community
  | 'activity'       // Regular activities (walks, gardening)
  | 'support'        // Support groups
  | 'other'

export interface Circle {
  id: string
  name: string
  description: string
  category: CircleCategory
  interests: string[]        // Interest tags for discovery
  creatorId: string          // Profile ID of creator
  memberIds: string[]        // Profile IDs of members
  buildingApns: string[]     // Optional property association (empty = city-wide)
  isOpen: boolean            // Anyone can join vs. request required
  chatEnabled: boolean       // Whether circle has a chat room
  chatSlug?: string          // Chat room slug if enabled
  createdAt: string          // ISO date
  updatedAt: string          // ISO date
}

// ============================================
// Constants
// ============================================

export const CIRCLE_CATEGORIES: Record<CircleCategory, string> = {
  social: 'Social',
  mutual_aid: 'Mutual Aid',
  advocacy: 'Advocacy',
  neighborhood: 'Neighborhood',
  activity: 'Activity',
  support: 'Support',
  other: 'Other',
}

export const CIRCLE_CATEGORY_COLORS: Record<CircleCategory, string> = {
  social: 'bg-purple-100 text-purple-800',
  mutual_aid: 'bg-green-100 text-green-800',
  advocacy: 'bg-red-100 text-red-800',
  neighborhood: 'bg-blue-100 text-blue-800',
  activity: 'bg-yellow-100 text-yellow-800',
  support: 'bg-pink-100 text-pink-800',
  other: 'bg-gray-100 text-gray-800',
}

const STORAGE_KEY = 'rstu_circles'

// ============================================
// Storage Helpers
// ============================================

function getCircleState(): Circle[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []
  return safeJsonParse(stored, [])
}

function saveCircleState(circles: Circle[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(circles))
  } catch (e) {
    log.error('Failed to save:', e)
  }
}

// Generate a unique ID
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'circle_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9)
}

// Generate chat slug from circle name
function generateChatSlug(name: string): string {
  return 'circle-' + name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 30)
}

// ============================================
// CRUD Operations
// ============================================

/**
 * Get all circles
 */
export function getCircles(): Circle[] {
  return getCircleState()
}

/**
 * Get a circle by ID
 */
export function getCircle(id: string): Circle | undefined {
  return getCircleState().find(c => c.id === id)
}

/**
 * Create a new circle
 */
export function createCircle(data: {
  name: string
  description: string
  category: CircleCategory
  interests?: string[]
  buildingApns?: string[]
  isOpen?: boolean
  chatEnabled?: boolean
}): Circle | null {
  const profile = getCurrentProfile()
  if (!profile) {
    log.error('Must be logged in to create a circle')
    return null
  }

  const now = new Date().toISOString()
  const circle: Circle = {
    id: generateId(),
    name: data.name.trim(),
    description: data.description.trim(),
    category: data.category,
    interests: data.interests || [],
    creatorId: profile.id,
    memberIds: [profile.id], // Creator is automatically a member
    buildingApns: data.buildingApns || [],
    isOpen: data.isOpen ?? true,
    chatEnabled: data.chatEnabled ?? false,
    chatSlug: data.chatEnabled ? generateChatSlug(data.name) : undefined,
    createdAt: now,
    updatedAt: now,
  }

  const circles = getCircleState()
  circles.push(circle)
  saveCircleState(circles)

  // Add circle to user's profile
  import('./profileStorage').then(({ updateProfile }) => {
    const currentCircleIds = profile.circleIds || []
    updateProfile({ circleIds: [...currentCircleIds, circle.id] })
  })

  return circle
}

/**
 * Update a circle
 */
export function updateCircle(id: string, updates: Partial<Omit<Circle, 'id' | 'creatorId' | 'createdAt'>>): Circle | null {
  const profile = getCurrentProfile()
  if (!profile) return null

  const circles = getCircleState()
  const index = circles.findIndex(c => c.id === id)
  if (index < 0) return null

  const circle = circles[index]

  // Only creator can update
  if (circle.creatorId !== profile.id) {
    log.error('Only the creator can update this circle')
    return null
  }

  const updated: Circle = {
    ...circle,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  // Update chat slug if name changed and chat is enabled
  if (updates.name && updated.chatEnabled) {
    updated.chatSlug = generateChatSlug(updates.name)
  }

  circles[index] = updated
  saveCircleState(circles)

  return updated
}

/**
 * Delete a circle
 */
export function deleteCircle(id: string): boolean {
  const profile = getCurrentProfile()
  if (!profile) return false

  const circles = getCircleState()
  const circle = circles.find(c => c.id === id)

  if (!circle) return false

  // Only creator can delete
  if (circle.creatorId !== profile.id) {
    log.error('Only the creator can delete this circle')
    return false
  }

  const filtered = circles.filter(c => c.id !== id)
  saveCircleState(filtered)

  return true
}

// ============================================
// Member Management
// ============================================

/**
 * Join a circle
 */
export function joinCircle(circleId: string): boolean {
  const profile = getCurrentProfile()
  if (!profile) return false

  const circles = getCircleState()
  const index = circles.findIndex(c => c.id === circleId)
  if (index < 0) return false

  const circle = circles[index]

  // Check if already a member
  if (circle.memberIds.includes(profile.id)) {
    return true
  }

  // Check if circle is open
  if (!circle.isOpen) {
    log.error('This circle requires an invitation')
    return false
  }

  // Add to members
  circle.memberIds.push(profile.id)
  circle.updatedAt = new Date().toISOString()
  circles[index] = circle
  saveCircleState(circles)

  // Add to user's profile
  import('./profileStorage').then(({ updateProfile }) => {
    const currentCircleIds = profile.circleIds || []
    if (!currentCircleIds.includes(circleId)) {
      updateProfile({ circleIds: [...currentCircleIds, circleId] })
    }
  })

  return true
}

/**
 * Leave a circle
 */
export function leaveCircle(circleId: string): boolean {
  const profile = getCurrentProfile()
  if (!profile) return false

  const circles = getCircleState()
  const index = circles.findIndex(c => c.id === circleId)
  if (index < 0) return false

  const circle = circles[index]

  // Creator cannot leave their own circle
  if (circle.creatorId === profile.id) {
    log.error('Creator cannot leave their own circle. Delete it instead.')
    return false
  }

  // Remove from members
  circle.memberIds = circle.memberIds.filter(id => id !== profile.id)
  circle.updatedAt = new Date().toISOString()
  circles[index] = circle
  saveCircleState(circles)

  // Remove from user's profile
  import('./profileStorage').then(({ updateProfile }) => {
    const currentCircleIds = profile.circleIds || []
    updateProfile({ circleIds: currentCircleIds.filter(id => id !== circleId) })
  })

  return true
}

/**
 * Get members of a circle with profile details
 */
export async function getCircleMembers(circleId: string): Promise<UserProfile[]> {
  const circle = getCircle(circleId)
  if (!circle) return []

  const members: UserProfile[] = []
  for (const memberId of circle.memberIds) {
    const profile = await getProfileById(memberId)
    if (profile) {
      members.push(profile)
    }
  }

  return members
}

/**
 * Check if user is a member of a circle
 */
export function isMember(circleId: string): boolean {
  const profile = getCurrentProfile()
  if (!profile) return false

  const circle = getCircle(circleId)
  if (!circle) return false

  return circle.memberIds.includes(profile.id)
}

/**
 * Check if user is the creator of a circle
 */
export function isCreator(circleId: string): boolean {
  const profile = getCurrentProfile()
  if (!profile) return false

  const circle = getCircle(circleId)
  if (!circle) return false

  return circle.creatorId === profile.id
}

// ============================================
// Discovery & Search
// ============================================

/**
 * Get circles by category
 */
export function getCirclesByCategory(category: CircleCategory): Circle[] {
  return getCircleState().filter(c => c.category === category)
}

/**
 * Get circles by interest tags
 */
export function getCirclesByInterest(interests: string[]): Circle[] {
  if (interests.length === 0) return []

  const interestSet = new Set(interests.map(i => i.toLowerCase()))
  return getCircleState().filter(circle =>
    circle.interests.some(i => interestSet.has(i.toLowerCase()))
  )
}

/**
 * Get circles the current user is a member of
 */
export function getMyCircles(): Circle[] {
  const profile = getCurrentProfile()
  if (!profile) return []

  return getCircleState().filter(c => c.memberIds.includes(profile.id))
}

/**
 * Get circles created by the current user
 */
export function getMyCreatedCircles(): Circle[] {
  const profile = getCurrentProfile()
  if (!profile) return []

  return getCircleState().filter(c => c.creatorId === profile.id)
}

/**
 * Get recommended circles based on user profile interests
 */
export function getRecommendedCircles(profile: UserProfile): Circle[] {
  const userInterests = profile.interests || []
  if (userInterests.length === 0) return []

  const myCircleIds = new Set(profile.circleIds || [])
  const allCircles = getCircleState()

  // Find circles with matching interests that user isn't already in
  return allCircles
    .filter(c => !myCircleIds.has(c.id))
    .map(circle => {
      const matchCount = circle.interests.filter(i =>
        userInterests.some(ui => ui.toLowerCase() === i.toLowerCase())
      ).length
      return { circle, matchCount }
    })
    .filter(({ matchCount }) => matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .map(({ circle }) => circle)
}

/**
 * Search circles by name or description
 */
export function searchCircles(query: string): Circle[] {
  const queryLower = query.toLowerCase().trim()
  if (!queryLower) return getCircleState()

  return getCircleState().filter(circle =>
    circle.name.toLowerCase().includes(queryLower) ||
    circle.description.toLowerCase().includes(queryLower) ||
    circle.interests.some(i => i.toLowerCase().includes(queryLower))
  )
}

/**
 * Get circles associated with a building
 */
export function getCirclesByBuilding(buildingApn: string): Circle[] {
  return getCircleState().filter(c =>
    c.buildingApns.includes(buildingApn)
  )
}
