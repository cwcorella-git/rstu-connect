/**
 * Mutual Aid Storage
 *
 * Manages needs/offers posts, skills, and resource library items.
 * Uses localStorage for persistence with optional Gun.js sync (future).
 *
 * Based on Dean Spade's mutual aid principles:
 * - Meet survival needs AND build shared understanding
 * - Mobilize people, expand solidarity, build movements
 * - Participatory - collective action, not waiting for saviors
 */

// === TYPES ===

export type MutualAidCategory =
  | 'rent_bills'
  | 'legal'
  | 'food'
  | 'childcare'
  | 'moving'
  | 'transportation'
  | 'housing_search'
  | 'job_referrals'
  | 'emotional_support'
  | 'translation'
  | 'tech_support'
  | 'other'

export const CATEGORY_LABELS: Record<MutualAidCategory, string> = {
  rent_bills: 'Rent/Bills',
  legal: 'Legal Aid',
  food: 'Food',
  childcare: 'Childcare',
  moving: 'Moving Help',
  transportation: 'Transportation',
  housing_search: 'Housing Search',
  job_referrals: 'Job Referrals',
  emotional_support: 'Peer Support',
  translation: 'Translation',
  tech_support: 'Tech Support',
  other: 'Other',
}

export type PostStatus = 'open' | 'in_progress' | 'fulfilled' | 'expired'

export interface MutualAidPost {
  id: string
  type: 'need' | 'offer'
  category: MutualAidCategory
  title: string
  details: string
  buildingApn: string
  buildingAddress: string
  authorId: string
  authorName: string
  status: PostStatus
  createdAt: number
  expiresAt: number
}

export type SkillCategory =
  | 'translation'
  | 'legal'
  | 'tech'
  | 'transportation'
  | 'labor'
  | 'childcare'
  | 'cooking'
  | 'media'
  | 'other'

export const SKILL_LABELS: Record<SkillCategory, string> = {
  translation: 'Translation',
  legal: 'Legal Knowledge',
  tech: 'Tech Support',
  transportation: 'Transportation',
  labor: 'Physical Labor',
  childcare: 'Childcare',
  cooking: 'Cooking/Food',
  media: 'Media/PR',
  other: 'Other',
}

export interface SkillEntry {
  category: SkillCategory
  description?: string
}

export interface SkillProfile {
  memberId: string
  memberName: string
  buildingApn?: string
  buildingAddress?: string
  skills: SkillEntry[]
  availability: string
  contactPreference: 'chat' | 'profile'
  languages?: string[]
}

export type ResourceCategory = 'tool' | 'book' | 'equipment' | 'other'

export const RESOURCE_LABELS: Record<ResourceCategory, string> = {
  tool: 'Tool',
  book: 'Book',
  equipment: 'Equipment',
  other: 'Other',
}

export interface ResourceItem {
  id: string
  name: string
  description: string
  category: ResourceCategory
  ownerId: string
  ownerName: string
  buildingApn: string
  buildingAddress: string
  status: 'available' | 'checked_out'
  checkedOutBy?: string
  checkedOutAt?: number
  returnBy?: number
}

// === STORAGE KEYS ===

const POSTS_KEY = 'rstu_mutual_aid_posts'
const RESOURCES_KEY = 'rstu_mutual_aid_resources'
const SKILLS_KEY = 'rstu_mutual_aid_skills'

// === HELPER FUNCTIONS ===

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

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}

// === POSTS (NEEDS/OFFERS) ===

export function getMutualAidPosts(): MutualAidPost[] {
  const posts = getFromStorage<MutualAidPost[]>(POSTS_KEY, [])

  // Check for expired posts
  const now = Date.now()
  let hasExpired = false
  const updatedPosts = posts.map(post => {
    if (post.status === 'open' && post.expiresAt < now) {
      hasExpired = true
      return { ...post, status: 'expired' as PostStatus }
    }
    return post
  })

  if (hasExpired) {
    saveToStorage(POSTS_KEY, updatedPosts)
  }

  return updatedPosts
}

export function createPost(
  type: 'need' | 'offer',
  category: MutualAidCategory,
  title: string,
  details: string,
  buildingApn: string,
  buildingAddress: string,
  authorId: string,
  authorName: string
): MutualAidPost {
  const now = Date.now()
  const post: MutualAidPost = {
    id: generateId(),
    type,
    category,
    title,
    details,
    buildingApn,
    buildingAddress,
    authorId,
    authorName,
    status: 'open',
    createdAt: now,
    expiresAt: now + 30 * 24 * 60 * 60 * 1000, // 30 days
  }

  const posts = getMutualAidPosts()
  posts.unshift(post)
  saveToStorage(POSTS_KEY, posts)

  return post
}

export function updatePostStatus(postId: string, status: PostStatus): void {
  const posts = getMutualAidPosts()
  const index = posts.findIndex(p => p.id === postId)
  if (index !== -1) {
    posts[index] = { ...posts[index], status }
    saveToStorage(POSTS_KEY, posts)
  }
}

export function deletePost(postId: string): void {
  const posts = getMutualAidPosts()
  const filtered = posts.filter(p => p.id !== postId)
  saveToStorage(POSTS_KEY, filtered)
}

// === RESOURCE LIBRARY ===

export function getResourceItems(): ResourceItem[] {
  return getFromStorage<ResourceItem[]>(RESOURCES_KEY, [])
}

export function createResourceItem(
  name: string,
  description: string,
  category: ResourceCategory,
  ownerId: string,
  ownerName: string,
  buildingApn: string,
  buildingAddress: string
): ResourceItem {
  const item: ResourceItem = {
    id: generateId(),
    name,
    description,
    category,
    ownerId,
    ownerName,
    buildingApn,
    buildingAddress,
    status: 'available',
  }

  const items = getResourceItems()
  items.unshift(item)
  saveToStorage(RESOURCES_KEY, items)

  return item
}

export function checkOutResource(itemId: string, borrowerId: string, daysToReturn: number = 7): void {
  const items = getResourceItems()
  const index = items.findIndex(i => i.id === itemId)
  if (index !== -1 && items[index].status === 'available') {
    const now = Date.now()
    items[index] = {
      ...items[index],
      status: 'checked_out',
      checkedOutBy: borrowerId,
      checkedOutAt: now,
      returnBy: now + daysToReturn * 24 * 60 * 60 * 1000,
    }
    saveToStorage(RESOURCES_KEY, items)
  }
}

export function returnResource(itemId: string): void {
  const items = getResourceItems()
  const index = items.findIndex(i => i.id === itemId)
  if (index !== -1) {
    items[index] = {
      ...items[index],
      status: 'available',
      checkedOutBy: undefined,
      checkedOutAt: undefined,
      returnBy: undefined,
    }
    saveToStorage(RESOURCES_KEY, items)
  }
}

export function deleteResourceItem(itemId: string): void {
  const items = getResourceItems()
  const filtered = items.filter(i => i.id !== itemId)
  saveToStorage(RESOURCES_KEY, filtered)
}

// === SKILLS DIRECTORY ===

export function getSkillProfiles(): SkillProfile[] {
  return getFromStorage<SkillProfile[]>(SKILLS_KEY, [])
}

export function getSkillProfile(memberId: string): SkillProfile | null {
  const profiles = getSkillProfiles()
  return profiles.find(p => p.memberId === memberId) || null
}

export function saveSkillProfile(profile: SkillProfile): void {
  const profiles = getSkillProfiles()
  const index = profiles.findIndex(p => p.memberId === profile.memberId)
  if (index !== -1) {
    profiles[index] = profile
  } else {
    profiles.push(profile)
  }
  saveToStorage(SKILLS_KEY, profiles)
}

export function deleteSkillProfile(memberId: string): void {
  const profiles = getSkillProfiles()
  const filtered = profiles.filter(p => p.memberId !== memberId)
  saveToStorage(SKILLS_KEY, filtered)
}

// === STATS ===

export function getBuildingStats(buildingApn: string): {
  needsCount: number
  offersCount: number
  resourcesCount: number
  skillsCount: number
} {
  const posts = getMutualAidPosts().filter(
    p => p.buildingApn === buildingApn && p.status !== 'expired'
  )
  const resources = getResourceItems().filter(r => r.buildingApn === buildingApn)
  const skills = getSkillProfiles().filter(s => s.buildingApn === buildingApn)

  return {
    needsCount: posts.filter(p => p.type === 'need').length,
    offersCount: posts.filter(p => p.type === 'offer').length,
    resourcesCount: resources.length,
    skillsCount: skills.length,
  }
}
