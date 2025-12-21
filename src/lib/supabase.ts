import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] Missing environment variables - using localStorage fallback')
}

// Create Supabase client (returns null if not configured)
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Feature flag - set to true to enable Supabase, false for localStorage only
export const USE_SUPABASE = Boolean(supabase)

// Type definitions for database tables
export interface DbProfile {
  id: string
  nickname: string
  role: 'tenant' | 'organizer' | 'admin'
  trust_level: 'self_registered' | 'invited' | 'verified'
  building_id: string | null
  building_address: string | null
  unit_number: string | null
  phone: string | null
  email: string | null
  preferred_contact: 'phone' | 'text' | 'email' | null
  language: string | null
  rent_amount: number | null
  move_in_date: string | null
  lease_type: 'fixed' | 'month-to-month' | null
  lease_expires: string | null
  assigned_buildings: string[] | null
  invited_by: string | null
  invite_code: string | null
  created_at: string
  last_active: string
}

export interface DbInviteCode {
  code: string
  created_by: string
  building_id: string | null
  unit_number: string | null
  grant_role: string
  max_uses: number
  used_count: number
  used_by: string[] | null
  revoked: boolean
  expires_at: string | null
  created_at: string
}

export interface DbCanvassUnit {
  id: string
  building_id: string
  building_address: string
  unit_number: string
  status: 'NOT_CONTACTED' | 'NO_ANSWER' | 'CONTACTED' | 'INTERESTED' | 'NOT_INTERESTED' | 'FOLLOW_UP' | 'ACTIVE_MEMBER'
  contact_name: string | null
  phone: string | null
  email: string | null
  preferred_contact: string | null
  language: string | null
  occupants: number | null
  rent_amount: number | null
  complaints: string[] | null
  complaint_details: string | null
  interest_levels: string[] | null
  notes: string | null
  follow_up_date: string | null
  organizer_id: string | null
  linked_profile_id: string | null
  created_at: string
  updated_at: string
}

export interface DbBuildingComplaint {
  id: string
  building_id: string
  category: string
  title: string
  description: string | null
  submitted_by: string
  submitted_by_name: string
  status: 'pending' | 'voting' | 'demand' | 'resolved' | 'rejected'
  upvotes: string[]
  downvotes: string[]
  created_at: string
}

export interface DbBuildingDemand {
  id: string
  building_id: string
  title: string
  description: string | null
  source_complaint_id: string | null
  support_votes: string[]
  escalation_level: 'letter' | 'petition' | 'action' | 'strike'
  created_at: string
}

export interface DbLinkedPropertyGroup {
  id: string
  name: string
  apns: string[]
  created_by: string
  is_same_building: boolean
  member_profiles: string[] | null
  alliances: string[] | null
  muted_profiles: string[] | null
  banned_profiles: unknown[] | null
  notes: string | null
  created_at: string
}

export interface DbGovernanceProposal {
  id: string
  type: 'rename' | 'merge' | 'alliance' | 'add-property' | 'remove-property' | 'mute-tenant' | 'escalate' | 'split'
  group_id: string
  target_group_id: string | null
  target_apn: string | null
  target_profile_id: string | null
  target_value: string | null
  target_apns: string[] | null
  proposed_by: string
  proposed_by_name: string
  reason: string | null
  upvotes: string[]
  downvotes: string[]
  status: 'active' | 'passed' | 'rejected' | 'pending-finalize' | 'pending-partner' | 'executed'
  partner_proposal_id: string | null
  partner_group_passed: boolean
  expires_at: string
  executed_at: string | null
  finalized_by: string | null
  created_at: string
}

// ============================================
// FTS Search Types
// ============================================

export interface DbProperty {
  apn: string
  address: string
  name: string | null
  owner: string
  units: number
  value: number | null
  year_built: number | null
  sqft: number | null
  zoning: string | null
  land_use_code: string | null
  lat: number | null
  lon: number | null
  chat_slug: string | null
  created_at: string
}

export interface DbDocument {
  id: string
  title: string
  author: string | null
  date: string | null
  category: string
  filename: string
  slug: string
  excerpt: string | null
  content: string | null
  created_at: string
}

export interface PropertySearchResult {
  apn: string
  address: string
  name: string | null
  owner: string
  units: number
  value: number | null
  year_built: number | null
  lat: number | null
  lon: number | null
  chat_slug: string | null
  rank: number
}

export interface DocumentSearchResult {
  id: string
  title: string
  author: string | null
  date: string | null
  category: string
  filename: string
  slug: string
  excerpt: string | null
  rank: number
}

// ============================================
// FTS Search Functions
// ============================================

/**
 * Search properties using PostgreSQL Full-Text Search
 */
export async function searchProperties(
  query: string,
  limit: number = 50
): Promise<PropertySearchResult[]> {
  if (!supabase) return []

  const { data, error } = await supabase.rpc('search_properties', {
    search_query: query,
    result_limit: limit
  })

  if (error) {
    console.error('[Supabase] Property search error:', error)
    return []
  }

  return data || []
}

/**
 * Search documents using PostgreSQL Full-Text Search
 */
export async function searchDocuments(
  query: string,
  category?: string,
  limit: number = 100
): Promise<DocumentSearchResult[]> {
  if (!supabase) return []

  const { data, error } = await supabase.rpc('search_documents', {
    search_query: query,
    category_filter: category || null,
    result_limit: limit
  })

  if (error) {
    console.error('[Supabase] Document search error:', error)
    return []
  }

  return data || []
}

/**
 * Autocomplete properties (faster prefix search)
 */
export async function autocompleteProperties(
  prefix: string,
  limit: number = 10
): Promise<Pick<DbProperty, 'apn' | 'address' | 'name' | 'owner' | 'units'>[]> {
  if (!supabase || !prefix || prefix.length < 2) return []

  const { data, error } = await supabase.rpc('autocomplete_properties', {
    prefix: prefix,
    result_limit: limit
  })

  if (error) {
    console.error('[Supabase] Autocomplete error:', error)
    return []
  }

  return data || []
}

/**
 * Get all documents by category
 */
export async function getDocumentsByCategory(
  category: string
): Promise<DocumentSearchResult[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('documents')
    .select('id, title, author, date, category, filename, slug, excerpt')
    .eq('category', category)
    .order('title')

  if (error) {
    console.error('[Supabase] Get documents error:', error)
    return []
  }

  return (data || []).map(d => ({ ...d, rank: 1 }))
}

/**
 * Get all unique categories
 */
export async function getDocumentCategories(): Promise<string[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('documents')
    .select('category')

  if (error) {
    console.error('[Supabase] Get categories error:', error)
    return []
  }

  const categories = new Set(data?.map(d => d.category) || [])
  return Array.from(categories).sort()
}

/**
 * Get property by APN
 */
export async function getPropertyByApn(apn: string): Promise<DbProperty | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('apn', apn)
    .single()

  if (error) return null
  return data as DbProperty
}

/**
 * Get total property count
 */
export async function getPropertyCount(): Promise<number> {
  if (!supabase) return 0

  const { count, error } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })

  if (error) return 0
  return count || 0
}

/**
 * Get total document count
 */
export async function getDocumentCount(): Promise<number> {
  if (!supabase) return 0

  const { count, error } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })

  if (error) return 0
  return count || 0
}
