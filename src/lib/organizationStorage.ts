/**
 * Organization Storage
 *
 * Manages external resources (community organizations) and internal collectives
 * (tenant-formed groups). Follows the LinkedPropertyGroup pattern for collectives.
 */

import { sanitizeText, sanitizeRichText } from './sanitize'

// === TYPES ===

export type OrganizationType = 'external' | 'internal'

// External resource categories (from linktr.ee/renounhoused analysis + community PDFs)
export type ExternalResourceCategory =
  | 'food'
  | 'shelter'
  | 'legal_aid'
  | 'housing_services'
  | 'emergency_aid'
  | 'government'
  | 'advocacy'
  | 'health_services'
  | 'mutual_aid'
  | 'faith'
  | 'pet_services'
  | 'other'

export const EXTERNAL_CATEGORY_LABELS: Record<ExternalResourceCategory, string> = {
  food: 'Food & Meals',
  shelter: 'Shelter',
  legal_aid: 'Legal Aid',
  housing_services: 'Housing Services',
  emergency_aid: 'Emergency Aid',
  government: 'Government Services',
  advocacy: 'Advocacy',
  health_services: 'Health Services',
  mutual_aid: 'Mutual Aid',
  faith: 'Faith-Based Services',
  pet_services: 'Pet Services',
  other: 'Other',
}

// Internal collective categories
export type InternalCollectiveCategory =
  | 'working_group'
  | 'neighborhood'
  | 'affinity'
  | 'committee'
  | 'other'

export const COLLECTIVE_CATEGORY_LABELS: Record<InternalCollectiveCategory, string> = {
  working_group: 'Working Group',
  neighborhood: 'Neighborhood',
  affinity: 'Affinity Group',
  committee: 'Committee',
  other: 'Other',
}

// Alias for backward compatibility
export const INTERNAL_CATEGORY_LABELS = COLLECTIVE_CATEGORY_LABELS

// Contact information for external organizations
export interface OrganizationContact {
  type: 'phone' | 'email' | 'website' | 'address' | 'hours'
  value: string
  label?: string // "Main Line", "Intake", "After Hours"
}

// Banned profile structure (reused from linkedPropertiesStorage)
export interface BannedProfile {
  profileId: string
  bannedAt: number
  bannedBy: string
  reason?: string
}

// Base organization interface
interface OrganizationBase {
  id: string
  name: string
  description: string
  type: OrganizationType
  createdAt: number
  updatedAt: number
}

// External organizations (admin-curated directory)
export interface ExternalOrganization extends OrganizationBase {
  type: 'external'
  category: ExternalResourceCategory
  contacts: OrganizationContact[]
  serviceArea?: string // "Washoe County", "Statewide", "Reno-Sparks"
  eligibility?: string // "Income-based", "Any tenant", "Veterans only"
  languages?: string[] // Languages supported
  websiteUrl?: string
  logoUrl?: string

  // Admin-managed
  addedBy: string // Admin profile ID
  verified: boolean
  lastVerified?: number
}

// Internal collectives (tenant-formed, full-featured)
export interface InternalOrganization extends OrganizationBase {
  type: 'internal'
  category: InternalCollectiveCategory

  // Membership (parallel to LinkedPropertyGroup)
  memberProfiles: string[]
  pointPersons: string[] // Leadership role
  alliances?: string[] // Allied org IDs
  mutedProfiles?: string[]
  bannedProfiles?: BannedProfile[]

  // Visibility
  isPublic: boolean
  inviteCode?: string

  // Chat integration (reuses socket.io pattern)
  chatSlug: string // org-${id}

  // Formation tracking
  formationProposalId?: string
  createdBy: string
}

// Union type for all organizations
export type Organization = ExternalOrganization | InternalOrganization

// === STORAGE KEYS ===

const EXTERNAL_ORGS_KEY = 'rstu_external_organizations'
const INTERNAL_ORGS_KEY = 'rstu_internal_organizations'

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

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed ambiguous: 0OI1
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
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

// === EXTERNAL ORGANIZATIONS (Admin-managed) ===

export function getExternalOrganizations(): ExternalOrganization[] {
  return getFromStorage<ExternalOrganization[]>(EXTERNAL_ORGS_KEY, [])
}

export function getExternalOrganization(id: string): ExternalOrganization | null {
  const orgs = getExternalOrganizations()
  return orgs.find(o => o.id === id) || null
}

export function getExternalOrganizationsByCategory(
  category: ExternalResourceCategory
): ExternalOrganization[] {
  return getExternalOrganizations().filter(o => o.category === category)
}

export function createExternalOrganization(
  name: string,
  description: string,
  category: ExternalResourceCategory,
  contacts: OrganizationContact[],
  addedBy: string,
  options?: {
    serviceArea?: string
    eligibility?: string
    languages?: string[]
    websiteUrl?: string
    logoUrl?: string
  }
): ExternalOrganization {
  const now = Date.now()
  const org: ExternalOrganization = {
    id: `ext-${generateId()}`,
    type: 'external',
    name: sanitizeText(name),
    description: sanitizeRichText(description),
    category,
    contacts: contacts.map(c => ({
      ...c,
      value: sanitizeText(c.value),
      label: c.label ? sanitizeText(c.label) : undefined,
    })),
    serviceArea: options?.serviceArea ? sanitizeText(options.serviceArea) : undefined,
    eligibility: options?.eligibility ? sanitizeText(options.eligibility) : undefined,
    languages: options?.languages?.map(sanitizeText),
    websiteUrl: options?.websiteUrl,
    logoUrl: options?.logoUrl,
    addedBy,
    verified: false,
    createdAt: now,
    updatedAt: now,
  }

  const orgs = getExternalOrganizations()
  orgs.unshift(org)
  saveToStorage(EXTERNAL_ORGS_KEY, orgs)

  return org
}

export function updateExternalOrganization(
  id: string,
  updates: Partial<Omit<ExternalOrganization, 'id' | 'type' | 'createdAt' | 'addedBy'>>
): ExternalOrganization | null {
  const orgs = getExternalOrganizations()
  const index = orgs.findIndex(o => o.id === id)
  if (index === -1) return null

  // Sanitize text fields
  const sanitizedUpdates: Partial<ExternalOrganization> = {
    ...updates,
    updatedAt: Date.now(),
  }
  if (updates.name) sanitizedUpdates.name = sanitizeText(updates.name)
  if (updates.description) sanitizedUpdates.description = sanitizeRichText(updates.description)
  if (updates.contacts) {
    sanitizedUpdates.contacts = updates.contacts.map(c => ({
      ...c,
      value: sanitizeText(c.value),
      label: c.label ? sanitizeText(c.label) : undefined,
    }))
  }

  orgs[index] = { ...orgs[index], ...sanitizedUpdates }
  saveToStorage(EXTERNAL_ORGS_KEY, orgs)

  return orgs[index]
}

export function verifyExternalOrganization(id: string): void {
  const orgs = getExternalOrganizations()
  const index = orgs.findIndex(o => o.id === id)
  if (index !== -1) {
    orgs[index] = {
      ...orgs[index],
      verified: true,
      lastVerified: Date.now(),
      updatedAt: Date.now(),
    }
    saveToStorage(EXTERNAL_ORGS_KEY, orgs)
  }
}

export function deleteExternalOrganization(id: string): void {
  const orgs = getExternalOrganizations()
  const filtered = orgs.filter(o => o.id !== id)
  saveToStorage(EXTERNAL_ORGS_KEY, filtered)
}

// === INTERNAL ORGANIZATIONS (Collectives) ===

export function getInternalOrganizations(): InternalOrganization[] {
  return getFromStorage<InternalOrganization[]>(INTERNAL_ORGS_KEY, [])
}

export function getInternalOrganization(id: string): InternalOrganization | null {
  const orgs = getInternalOrganizations()
  return orgs.find(o => o.id === id) || null
}

export function getInternalOrganizationByInviteCode(code: string): InternalOrganization | null {
  const orgs = getInternalOrganizations()
  return orgs.find(o => o.inviteCode === code) || null
}

export function getPublicCollectives(): InternalOrganization[] {
  return getInternalOrganizations().filter(o => o.isPublic)
}

export function getUserCollectives(profileId: string): InternalOrganization[] {
  return getInternalOrganizations().filter(o => o.memberProfiles.includes(profileId))
}

interface CreateInternalOrgOptions {
  name: string
  description: string
  category: InternalCollectiveCategory
  createdBy: string
  isPublic: boolean
  formationProposalId?: string
  initialPointPersons?: string[]
}

export function createInternalOrganization(
  options: CreateInternalOrgOptions
): InternalOrganization {
  const { name, description, category, createdBy, isPublic, formationProposalId, initialPointPersons } = options
  const now = Date.now()
  const id = `col-${generateId()}`

  const org: InternalOrganization = {
    id,
    type: 'internal',
    name: sanitizeText(name),
    description: sanitizeRichText(description),
    category,
    memberProfiles: [createdBy], // Founder is first member
    pointPersons: initialPointPersons || [createdBy], // Use provided or default to founder
    alliances: [],
    mutedProfiles: [],
    bannedProfiles: [],
    isPublic,
    inviteCode: isPublic ? undefined : generateInviteCode(),
    chatSlug: `org-${id}`,
    formationProposalId,
    createdBy,
    createdAt: now,
    updatedAt: now,
  }

  const orgs = getInternalOrganizations()
  orgs.unshift(org)
  saveToStorage(INTERNAL_ORGS_KEY, orgs)

  return org
}

export function updateInternalOrganization(
  id: string,
  updates: Partial<Omit<InternalOrganization, 'id' | 'type' | 'createdAt' | 'createdBy' | 'chatSlug'>>
): InternalOrganization | null {
  const orgs = getInternalOrganizations()
  const index = orgs.findIndex(o => o.id === id)
  if (index === -1) return null

  // Sanitize text fields
  const sanitizedUpdates: Partial<InternalOrganization> = {
    ...updates,
    updatedAt: Date.now(),
  }
  if (updates.name) sanitizedUpdates.name = sanitizeText(updates.name)
  if (updates.description) sanitizedUpdates.description = sanitizeRichText(updates.description)

  orgs[index] = { ...orgs[index], ...sanitizedUpdates }
  saveToStorage(INTERNAL_ORGS_KEY, orgs)

  return orgs[index]
}

// === MEMBERSHIP MANAGEMENT ===

export function addMember(orgId: string, profileId: string): boolean {
  const orgs = getInternalOrganizations()
  const index = orgs.findIndex(o => o.id === orgId)
  if (index === -1) return false

  const org = orgs[index]

  // Check if banned
  if (org.bannedProfiles?.some(b => b.profileId === profileId)) {
    return false
  }

  // Check if already member
  if (org.memberProfiles.includes(profileId)) {
    return true
  }

  orgs[index] = {
    ...org,
    memberProfiles: [...org.memberProfiles, profileId],
    updatedAt: Date.now(),
  }
  saveToStorage(INTERNAL_ORGS_KEY, orgs)

  return true
}

export function removeMember(orgId: string, profileId: string): boolean {
  const orgs = getInternalOrganizations()
  const index = orgs.findIndex(o => o.id === orgId)
  if (index === -1) return false

  const org = orgs[index]

  // Can't remove the creator if they're the only point person
  if (org.pointPersons.length === 1 && org.pointPersons[0] === profileId) {
    return false
  }

  orgs[index] = {
    ...org,
    memberProfiles: org.memberProfiles.filter(id => id !== profileId),
    pointPersons: org.pointPersons.filter(id => id !== profileId),
    updatedAt: Date.now(),
  }
  saveToStorage(INTERNAL_ORGS_KEY, orgs)

  return true
}

export function addPointPerson(orgId: string, profileId: string): boolean {
  const orgs = getInternalOrganizations()
  const index = orgs.findIndex(o => o.id === orgId)
  if (index === -1) return false

  const org = orgs[index]

  // Must be a member
  if (!org.memberProfiles.includes(profileId)) {
    return false
  }

  // Check if already point person
  if (org.pointPersons.includes(profileId)) {
    return true
  }

  orgs[index] = {
    ...org,
    pointPersons: [...org.pointPersons, profileId],
    updatedAt: Date.now(),
  }
  saveToStorage(INTERNAL_ORGS_KEY, orgs)

  return true
}

export function removePointPerson(orgId: string, profileId: string): boolean {
  const orgs = getInternalOrganizations()
  const index = orgs.findIndex(o => o.id === orgId)
  if (index === -1) return false

  const org = orgs[index]

  // Must have at least one point person
  if (org.pointPersons.length <= 1) {
    return false
  }

  orgs[index] = {
    ...org,
    pointPersons: org.pointPersons.filter(id => id !== profileId),
    updatedAt: Date.now(),
  }
  saveToStorage(INTERNAL_ORGS_KEY, orgs)

  return true
}

export function banMember(
  orgId: string,
  profileId: string,
  bannedBy: string,
  reason?: string
): boolean {
  const orgs = getInternalOrganizations()
  const index = orgs.findIndex(o => o.id === orgId)
  if (index === -1) return false

  const org = orgs[index]

  // Remove from members and point persons first
  const updatedOrg: InternalOrganization = {
    ...org,
    memberProfiles: org.memberProfiles.filter(id => id !== profileId),
    pointPersons: org.pointPersons.filter(id => id !== profileId),
    bannedProfiles: [
      ...(org.bannedProfiles || []),
      {
        profileId,
        bannedAt: Date.now(),
        bannedBy,
        reason,
      },
    ],
    updatedAt: Date.now(),
  }

  orgs[index] = updatedOrg
  saveToStorage(INTERNAL_ORGS_KEY, orgs)

  return true
}

export function unbanMember(orgId: string, profileId: string): boolean {
  const orgs = getInternalOrganizations()
  const index = orgs.findIndex(o => o.id === orgId)
  if (index === -1) return false

  const org = orgs[index]

  orgs[index] = {
    ...org,
    bannedProfiles: (org.bannedProfiles || []).filter(b => b.profileId !== profileId),
    updatedAt: Date.now(),
  }
  saveToStorage(INTERNAL_ORGS_KEY, orgs)

  return true
}

// === INVITE CODE MANAGEMENT ===

export function regenerateInviteCode(orgId: string): string | null {
  const orgs = getInternalOrganizations()
  const index = orgs.findIndex(o => o.id === orgId)
  if (index === -1) return null

  const newCode = generateInviteCode()
  orgs[index] = {
    ...orgs[index],
    inviteCode: newCode,
    updatedAt: Date.now(),
  }
  saveToStorage(INTERNAL_ORGS_KEY, orgs)

  return newCode
}

export function joinByInviteCode(code: string, profileId: string): InternalOrganization | null {
  const org = getInternalOrganizationByInviteCode(code)
  if (!org) return null

  if (addMember(org.id, profileId)) {
    return getInternalOrganization(org.id)
  }

  return null
}

// === ALLIANCES ===

export function addAlliance(orgId: string, allyOrgId: string): boolean {
  const orgs = getInternalOrganizations()
  const index = orgs.findIndex(o => o.id === orgId)
  if (index === -1) return false

  const org = orgs[index]

  // Check if already allied
  if (org.alliances?.includes(allyOrgId)) {
    return true
  }

  orgs[index] = {
    ...org,
    alliances: [...(org.alliances || []), allyOrgId],
    updatedAt: Date.now(),
  }
  saveToStorage(INTERNAL_ORGS_KEY, orgs)

  return true
}

export function removeAlliance(orgId: string, allyOrgId: string): boolean {
  const orgs = getInternalOrganizations()
  const index = orgs.findIndex(o => o.id === orgId)
  if (index === -1) return false

  orgs[index] = {
    ...orgs[index],
    alliances: (orgs[index].alliances || []).filter(id => id !== allyOrgId),
    updatedAt: Date.now(),
  }
  saveToStorage(INTERNAL_ORGS_KEY, orgs)

  return true
}

// === DELETE ===

export function deleteInternalOrganization(id: string): void {
  const orgs = getInternalOrganizations()
  const filtered = orgs.filter(o => o.id !== id)
  saveToStorage(INTERNAL_ORGS_KEY, filtered)
}

// === PERMISSION HELPERS ===

export function isPointPerson(orgId: string, profileId: string): boolean {
  const org = getInternalOrganization(orgId)
  return org?.pointPersons.includes(profileId) ?? false
}

export function isMember(orgId: string, profileId: string): boolean {
  const org = getInternalOrganization(orgId)
  return org?.memberProfiles.includes(profileId) ?? false
}

export function isBanned(orgId: string, profileId: string): boolean {
  const org = getInternalOrganization(orgId)
  return org?.bannedProfiles?.some(b => b.profileId === profileId) ?? false
}

// === CUSTOM CATEGORIES ===

export interface CustomCategory {
  id: string
  name: string
  icon: string        // Heroicon name e.g., "TruckIcon"
  color: string       // Tailwind class e.g., "text-rose-500"
  createdBy: string   // Profile ID
  createdAt: string   // ISO timestamp
}

const CUSTOM_CATEGORIES_KEY = 'rstu_custom_categories'

// Built-in category colors (used by ExternalResourceCategory)
const BUILTIN_CATEGORY_COLORS = [
  'text-amber-500',   // food
  'text-blue-500',    // shelter
  'text-purple-500',  // legal_aid
  'text-teal-500',    // housing_services
  'text-red-500',     // emergency_aid
  'text-slate-500',   // government
  'text-orange-500',  // advocacy
  'text-green-500',   // health_services
  'text-pink-500',    // mutual_aid
  'text-indigo-500',  // faith
  'text-cyan-500',    // pet_services
  'text-gray-500',    // other
]

// Additional colors for custom categories
const EXTRA_COLORS = [
  'text-rose-500',
  'text-lime-500',
  'text-emerald-500',
  'text-sky-500',
  'text-violet-500',
  'text-fuchsia-500',
  'text-yellow-500',
]

export const ALL_AVAILABLE_COLORS = [...BUILTIN_CATEGORY_COLORS, ...EXTRA_COLORS]

export function getCustomCategories(): CustomCategory[] {
  return getFromStorage<CustomCategory[]>(CUSTOM_CATEGORIES_KEY, [])
}

export function getCustomCategory(id: string): CustomCategory | null {
  const categories = getCustomCategories()
  return categories.find(c => c.id === id) || null
}

export function getUsedColors(): string[] {
  const customCategories = getCustomCategories()
  const customColors = customCategories.map(c => c.color)
  return [...BUILTIN_CATEGORY_COLORS, ...customColors]
}

export function getNextAvailableColor(): string {
  const usedColors = getUsedColors()
  const available = ALL_AVAILABLE_COLORS.find(c => !usedColors.includes(c))
  return available || 'text-gray-500'
}

export function createCustomCategory(
  name: string,
  icon: string,
  createdBy: string
): CustomCategory {
  const color = getNextAvailableColor()
  const id = `custom-${generateId()}`

  const category: CustomCategory = {
    id,
    name: sanitizeText(name),
    icon,
    color,
    createdBy,
    createdAt: new Date().toISOString(),
  }

  const categories = getCustomCategories()
  categories.push(category)
  saveToStorage(CUSTOM_CATEGORIES_KEY, categories)

  return category
}

export function deleteCustomCategory(id: string): boolean {
  const categories = getCustomCategories()
  const filtered = categories.filter(c => c.id !== id)
  if (filtered.length === categories.length) return false
  saveToStorage(CUSTOM_CATEGORIES_KEY, filtered)
  return true
}
