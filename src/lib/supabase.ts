import { createClient } from '@supabase/supabase-js'
import { createLogger } from './logger'

const log = createLogger('Supabase')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
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
  rent_history: string | null
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
  // Household info
  has_children: boolean | null
  has_pets: boolean | null
  pet_types: string | null
  accessibility_needs: string | null
  // Unit details
  unit_type: string | null
  bedroom_count: number | null
  bathroom_count: number | null
  unit_sqft: number | null
  // Lease info
  move_in_date: string | null
  lease_type: string | null
  lease_expires: string | null
  security_deposit: number | null
  deposit_issues: string | null
  last_rent_increase_amount: number | null
  last_rent_increase_date: string | null
  // Schedule
  work_hours: string | null
  best_time_to_reach: string | null
  best_days: string[] | null
  // Maintenance
  maintenance_rating: string | null
  avg_response_days: number | null
  outstanding_repairs: string | null
  // Community
  knows_neighbors: string | null
  ideal_rent: number | null
  has_organizing_experience: boolean | null
  suggestions: string | null
  // Habitability
  habitability_issues: string[] | null
  habitability_quotes: string | null
  // Subsidy
  subsidy_type: string | null
  subsidy_details: string | null
  // Utilities
  utilities_included: string[] | null
  // Profile linking
  profile_nickname: string | null
  linked_at: string | null
  contact_date: string | null
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
  land_use_desc: string | null
  neighborhood: string | null
  acres: number | null
  land_value: number | null
  improvement_value: number | null
  lat: number | null
  lon: number | null
  chat_slug: string | null
  // Management company (extracted from owner_address C/O or ATTN patterns)
  management_company_id: string | null
  // Intelligence fields
  eviction_count: number
  organizing_priority: number
  estimated_tenants: number | null
  corporate_landlord: boolean
  portfolio_size: number
  organizing_status: 'active' | 'emerging' | 'inactive'
  created_at: string
}

export interface DbEviction {
  id: string
  property_apn: string | null
  landlord_name: string
  case_number: string | null
  case_type: 'non-payment' | 'breach' | 'holdover' | 'unlawful-detainer' | 'other'
  filing_date: string | null
  judgment: 'landlord_win' | 'dismissed' | 'settled' | 'pending' | 'unknown'
  judgment_date: string | null
  attorney_fees: number | null
  defendant_represented: boolean
  defendant_name: string | null
  court: string | null
  notes: string | null
  created_at: string
}

export interface DbLandlordScore {
  id: string
  landlord_name: string
  normalized_name: string | null
  total_properties: number
  total_units: number
  total_estimated_tenants: number
  eviction_count: number
  eviction_success_rate: number | null
  evictions_per_100_units: number | null
  habitability_score: number | null
  tenant_rights_score: number | null
  legal_compliance_score: number | null
  overall_score: number | null
  worst_landlord_rank: number | null
  violation_count: number
  media_mentions: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DbManagementCompany {
  id: string
  name: string
  normalized_name: string
  detection_method: 'c/o' | 'attn'
  total_properties: number
  total_units: number
  total_evictions: number
  evictions_per_100_units: number | null
  city: string | null
  state: string | null
  confidence_score: number
  notes: string | null
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
  sqft: number | null
  neighborhood: string | null
  management_company_id: string | null
  eviction_count: number
  organizing_priority: number
  corporate_landlord: boolean
  portfolio_size: number
  organizing_status: string
  rank: number
}

export interface ManagementCompanySearchResult {
  id: string
  name: string
  detection_method: string
  total_properties: number
  total_units: number
  total_evictions: number
  evictions_per_100_units: number | null
  rank: number
}

export interface EvictionSearchResult {
  id: string
  property_apn: string | null
  landlord_name: string
  case_number: string | null
  case_type: string
  filing_date: string | null
  judgment: string
  judgment_date: string | null
  attorney_fees: number | null
  defendant_represented: boolean
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
    log.error('Property search error:', error)
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
    log.error('Document search error:', error)
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
    log.error('Autocomplete error:', error)
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
    log.error('Get documents error:', error)
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
    log.error('Get categories error:', error)
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

// ============================================
// Eviction & Landlord Score Functions
// ============================================

/**
 * Get evictions for a property
 */
export async function getEvictionsForProperty(
  apn: string,
  limit: number = 50
): Promise<EvictionSearchResult[]> {
  if (!supabase) return []

  const { data, error } = await supabase.rpc('search_evictions', {
    search_query: null,
    property_apn_filter: apn,
    result_limit: limit
  })

  if (error) {
    log.error('Get evictions error:', error)
    return []
  }

  return data || []
}

/**
 * Search evictions by landlord name
 */
export async function searchEvictions(
  query: string,
  limit: number = 100
): Promise<EvictionSearchResult[]> {
  if (!supabase) return []

  const { data, error } = await supabase.rpc('search_evictions', {
    search_query: query,
    property_apn_filter: null,
    result_limit: limit
  })

  if (error) {
    log.error('Search evictions error:', error)
    return []
  }

  return data || []
}

/**
 * Get landlord score by name
 */
export async function getLandlordScore(
  landlordName: string
): Promise<DbLandlordScore | null> {
  if (!supabase) return null

  const { data, error } = await supabase.rpc('get_landlord_score', {
    landlord_name_query: landlordName
  })

  if (error) {
    log.error('Get landlord score error:', error)
    return null
  }

  return data?.[0] || null
}

/**
 * Get eviction stats for a property
 */
export interface PropertyEvictionStats {
  total_evictions: number
  landlord_wins: number
  dismissed: number
  avg_attorney_fees: number | null
  most_recent_filing: string | null
  defendant_represented_pct: number | null
}

export async function getPropertyEvictionStats(
  apn: string
): Promise<PropertyEvictionStats | null> {
  if (!supabase) return null

  const { data, error } = await supabase.rpc('get_property_eviction_stats', {
    property_apn_filter: apn
  })

  if (error) {
    // Suppress known type mismatch error (42804) - function returns double precision but expects real
    // This is a Supabase-side issue that needs migration to fix
    if (error.code !== '42804') {
      log.error('Get eviction stats error:', error)
    }
    return null
  }

  return data?.[0] || null
}

/**
 * Get properties with high eviction counts
 */
export async function getHighEvictionProperties(
  limit: number = 20
): Promise<PropertySearchResult[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('properties')
    .select('apn, address, name, owner, units, value, year_built, lat, lon, chat_slug, sqft, neighborhood, management_company_id, eviction_count, organizing_priority, corporate_landlord, portfolio_size, organizing_status')
    .gt('eviction_count', 0)
    .order('eviction_count', { ascending: false })
    .limit(limit)

  if (error) {
    log.error('Get high eviction properties error:', error)
    return []
  }

  return (data || []).map(p => ({ ...p, rank: 1 }))
}

/**
 * Get properties by organizing status
 */
export async function getPropertiesByOrganizingStatus(
  status: 'active' | 'emerging' | 'inactive',
  limit: number = 50
): Promise<PropertySearchResult[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('properties')
    .select('apn, address, name, owner, units, value, year_built, lat, lon, chat_slug, sqft, neighborhood, management_company_id, eviction_count, organizing_priority, corporate_landlord, portfolio_size, organizing_status')
    .eq('organizing_status', status)
    .order('organizing_priority', { ascending: false })
    .limit(limit)

  if (error) {
    log.error('Get properties by status error:', error)
    return []
  }

  return (data || []).map(p => ({ ...p, rank: 1 }))
}

// ============================================
// Geo-Query Functions
// ============================================

export interface NearbyPropertyResult {
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
  sqft: number | null
  neighborhood: string | null
  property_type: string | null
  eviction_count: number
  organizing_priority: number
  corporate_landlord: boolean
  distance_miles: number
}

/**
 * Search properties within a radius of a center point
 * Uses Haversine formula for accurate distance calculation
 */
export async function searchNearbyProperties(
  centerLat: number,
  centerLon: number,
  radiusMiles: number = 0.3,
  limit: number = 50
): Promise<NearbyPropertyResult[]> {
  if (!supabase) return []

  const { data, error } = await supabase.rpc('search_properties_nearby', {
    center_lat: centerLat,
    center_lon: centerLon,
    radius_miles: radiusMiles,
    result_limit: limit
  })

  if (error) {
    log.error('Nearby properties error:', error)
    return []
  }

  return data || []
}

/**
 * Search properties with property type filter
 */
export async function searchPropertiesWithType(
  query: string,
  propertyType: string | null = null,
  limit: number = 50
): Promise<PropertySearchResult[]> {
  if (!supabase) return []

  const { data, error } = await supabase.rpc('search_properties', {
    search_query: query,
    property_type_filter: propertyType,
    result_limit: limit
  })

  if (error) {
    log.error('Property search with type error:', error)
    return []
  }

  return data || []
}

// ============================================
// Management Company Functions
// ============================================

/**
 * Search management companies
 */
export async function searchManagementCompanies(
  query: string,
  limit: number = 50
): Promise<ManagementCompanySearchResult[]> {
  if (!supabase) return []

  const { data, error } = await supabase.rpc('search_management_companies', {
    search_query: query,
    result_limit: limit
  })

  if (error) {
    log.error('Management company search error:', error)
    return []
  }

  return data || []
}

/**
 * Get properties managed by a management company
 */
export async function getPropertiesByManagementCompany(
  companyId: string,
  limit: number = 100
): Promise<PropertySearchResult[]> {
  if (!supabase) return []

  const { data, error } = await supabase.rpc('get_properties_by_management_company', {
    mgmt_company_id: companyId,
    result_limit: limit
  })

  if (error) {
    log.error('Get properties by management company error:', error)
    return []
  }

  return (data || []).map((p: PropertySearchResult) => ({ ...p, rank: 1 }))
}

/**
 * Get management company by ID
 */
export async function getManagementCompanyById(
  companyId: string
): Promise<DbManagementCompany | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('management_companies')
    .select('*')
    .eq('id', companyId)
    .single()

  if (error) return null
  return data as DbManagementCompany
}

/**
 * Get all management companies (sorted by units)
 */
export async function getAllManagementCompanies(
  limit: number = 200
): Promise<ManagementCompanySearchResult[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('management_companies')
    .select('id, name, detection_method, total_properties, total_units, total_evictions, evictions_per_100_units')
    .order('total_units', { ascending: false })
    .limit(limit)

  if (error) {
    log.error('Get all management companies error:', error)
    return []
  }

  return (data || []).map(mc => ({ ...mc, rank: 1 }))
}

/**
 * Get management company count
 */
export async function getManagementCompanyCount(): Promise<number> {
  if (!supabase) return 0

  const { count, error } = await supabase
    .from('management_companies')
    .select('*', { count: 'exact', head: true })

  if (error) return 0
  return count || 0
}

// ============================================
// Profile Management Functions
// ============================================

/**
 * Generate a deterministic UUID from a legacy ID
 * Same legacy ID always produces same UUID (prevents duplicates on multi-device sync)
 */
function generateDeterministicUUID(legacyId: string): string {
  const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
  const data = `${namespace}:rstu-profile:${legacyId}`

  // Hash-based approach (djb2 and sdbm variants for more entropy)
  let hash1 = 5381
  let hash2 = 0
  for (let i = 0; i < data.length; i++) {
    hash1 = ((hash1 << 5) + hash1) + data.charCodeAt(i)
    hash1 = hash1 & hash1
    hash2 = ((hash2 << 5) - hash2) + data.charCodeAt(i)
    hash2 = hash2 & hash2
  }

  // Generate more entropy for the remaining segments
  let hash3 = 0
  let hash4 = 0
  for (let i = 0; i < data.length; i++) {
    hash3 = data.charCodeAt(i) + ((hash3 << 6) + (hash3 << 16) - hash3)
    hash3 = hash3 & hash3
    hash4 = ((hash4 << 5) + hash4) ^ data.charCodeAt(i)
    hash4 = hash4 & hash4
  }

  // Format as UUID v5 (namespace-based)
  const hex1 = Math.abs(hash1).toString(16).padStart(8, '0').slice(0, 8)
  const hex2 = Math.abs(hash2).toString(16).padStart(8, '0').slice(0, 8)
  const hex3 = Math.abs(hash3).toString(16).padStart(8, '0').slice(0, 8)
  const hex4 = Math.abs(hash4).toString(16).padStart(12, '0').slice(0, 12)

  return `${hex1.slice(0, 8)}-${hex2.slice(0, 4)}-5${hex2.slice(5, 8)}-${hex3.slice(0, 4)}-${hex4}`
}

/**
 * Sync a profile to Supabase (upsert)
 */
export async function syncProfileToSupabase(profile: {
  id: string
  nickname: string
  role: 'tenant' | 'organizer' | 'admin'
  trustLevel: 'self_registered' | 'invited' | 'verified'
  buildingId?: string
  buildingAddress?: string
  unitNumber?: string
  phone?: string
  email?: string
  preferredContact?: 'phone' | 'text' | 'email'
  language?: string
  rentAmount?: number
  moveInDate?: string
  leaseType?: 'fixed' | 'month-to-month'
  leaseExpires?: string
  invitedBy?: string
  inviteCode?: string
  created: number
  lastActive?: number
}): Promise<{ success: boolean; error?: string; newId?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' }
  }

  // Check if ID is a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  let profileId = profile.id
  let newId: string | undefined

  if (!uuidRegex.test(profile.id)) {
    // FIXED: Use deterministic UUID instead of random
    // Same legacy ID always gets same UUID (prevents duplicates on multi-device sync)
    profileId = generateDeterministicUUID(profile.id)
    newId = profileId

    // CRITICAL FIX: Update localStorage immediately so next sync uses the new UUID
    try {
      const { updateProfile } = await import('./profileStorage')
      updateProfile({ id: profileId })
    } catch {
      // Failed to update localStorage with new UUID
    }
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: profileId,
      nickname: profile.nickname,
      role: profile.role,
      trust_level: profile.trustLevel,
      building_id: profile.buildingId || null,
      building_address: profile.buildingAddress || null,
      unit_number: profile.unitNumber || null,
      phone: profile.phone || null,
      email: profile.email || null,
      preferred_contact: profile.preferredContact || null,
      language: profile.language || null,
      rent_amount: profile.rentAmount || null,
      move_in_date: profile.moveInDate || null,
      lease_type: profile.leaseType || null,
      lease_expires: profile.leaseExpires || null,
      invited_by: profile.invitedBy || null,
      invite_code: profile.inviteCode || null,
      created_at: new Date(profile.created).toISOString(),
      last_active: profile.lastActive ? new Date(profile.lastActive).toISOString() : new Date().toISOString(),
    }, { onConflict: 'id' })

  if (error) {
    log.error('Profile sync error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, newId }
}

/**
 * Get all profiles (for organizer/admin user list)
 */
export async function getAllProfiles(): Promise<DbProfile[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('last_active', { ascending: false })

  if (error) {
    log.error('Get all profiles error:', error)
    return []
  }

  return data || []
}

/**
 * Get profile count
 */
export async function getProfileCount(): Promise<number> {
  if (!supabase) return 0

  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  if (error) return 0
  return count || 0
}

/**
 * Update profile role (admin only)
 */
export async function updateProfileRole(
  profileId: string,
  newRole: 'tenant' | 'organizer' | 'admin'
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', profileId)

  if (error) {
    log.error('Update role error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ============================================
// Document Admin State Functions
// ============================================

export interface DbDocumentAdminState {
  id: string
  hidden: boolean
  deleted: boolean
  hidden_by: string | null
  deleted_by: string | null
  hidden_at: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface DbDocumentEdit {
  id: string
  title: string
  content: string | null
  edited_by: string
  edited_at: string
  created_at: string
}

/**
 * Get all document admin state (hidden/deleted status)
 */
export async function getDocumentAdminState(): Promise<{
  hidden: string[]
  deleted: string[]
}> {
  if (!supabase) return { hidden: [], deleted: [] }

  const { data, error } = await supabase
    .from('document_admin_state')
    .select('id, hidden, deleted')

  if (error) {
    log.error('Get admin state error:', error)
    return { hidden: [], deleted: [] }
  }

  return {
    hidden: (data || []).filter(d => d.hidden).map(d => d.id),
    deleted: (data || []).filter(d => d.deleted).map(d => d.id)
  }
}

/**
 * Set document hidden status
 */
export async function setDocumentHidden(
  docId: string,
  hidden: boolean,
  adminId: string
): Promise<boolean> {
  if (!supabase) return false

  const { error } = await supabase
    .from('document_admin_state')
    .upsert({
      id: docId,
      hidden,
      hidden_by: hidden ? adminId : null,
      hidden_at: hidden ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' })

  if (error) {
    log.error('Set hidden error:', error)
    return false
  }

  return true
}

/**
 * Set document deleted status
 */
export async function setDocumentDeleted(
  docId: string,
  deleted: boolean,
  adminId: string
): Promise<boolean> {
  if (!supabase) return false

  const { error } = await supabase
    .from('document_admin_state')
    .upsert({
      id: docId,
      deleted,
      deleted_by: deleted ? adminId : null,
      deleted_at: deleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' })

  if (error) {
    log.error('Set deleted error:', error)
    return false
  }

  return true
}

/**
 * Get all document edits
 */
export async function getDocumentEdits(): Promise<Map<string, { title: string; content?: string }>> {
  if (!supabase) return new Map()

  const { data, error } = await supabase
    .from('document_edits')
    .select('id, title, content')

  if (error) {
    log.error('Get document edits error:', error)
    return new Map()
  }

  return new Map((data || []).map(d => [d.id, { title: d.title, content: d.content || undefined }]))
}

/**
 * Save a document edit
 */
export async function saveDocumentEdit(
  docId: string,
  title: string,
  content: string | null,
  adminId: string
): Promise<boolean> {
  if (!supabase) return false

  const { error } = await supabase
    .from('document_edits')
    .upsert({
      id: docId,
      title,
      content,
      edited_by: adminId,
      edited_at: new Date().toISOString()
    }, { onConflict: 'id' })

  if (error) {
    log.error('Save document edit error:', error)
    return false
  }

  return true
}

/**
 * Delete a document edit (restore original)
 */
export async function deleteDocumentEdit(docId: string): Promise<boolean> {
  if (!supabase) return false

  const { error } = await supabase
    .from('document_edits')
    .delete()
    .eq('id', docId)

  if (error) {
    log.error('Delete document edit error:', error)
    return false
  }

  return true
}

// ============================================
// User Context for RLS Policies
// ============================================

/**
 * Set the current user ID in Supabase session context.
 * This is required for RLS policies to know who the current user is.
 *
 * Call this before any Supabase operation that requires user context.
 * The context persists for the database session (typically one request).
 */
export async function setUserContext(userId: string): Promise<boolean> {
  if (!supabase) return false

  try {
    const { error } = await supabase.rpc('set_user_context', {
      user_id: userId
    })

    if (error) {
      log.error('Failed to set user context:', error)
      return false
    }

    return true
  } catch (err) {
    log.error('Exception setting user context:', err)
    return false
  }
}

/**
 * Clear the current user context.
 * Call this on logout or when switching users.
 */
export async function clearUserContext(): Promise<boolean> {
  if (!supabase) return false

  try {
    const { error } = await supabase.rpc('clear_user_context')

    if (error) {
      log.error('Failed to clear user context:', error)
      return false
    }

    return true
  } catch (err) {
    log.error('Exception clearing user context:', err)
    return false
  }
}

/**
 * Execute a Supabase operation with user context.
 * This is a convenience wrapper that sets context before the operation.
 *
 * @param userId - The current user's profile ID
 * @param operation - Async function containing Supabase operations
 * @returns The result of the operation
 */
export async function withUserContext<T>(
  userId: string,
  operation: () => Promise<T>
): Promise<T> {
  await setUserContext(userId)
  return operation()
}
