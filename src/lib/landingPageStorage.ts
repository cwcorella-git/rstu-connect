import { safeGetJson, safeSetItem } from './safeStorage'
import { supabase } from './supabase'

// ============================================================================
// Types
// ============================================================================

export interface SectionDescriptor {
  id: string
  type: string
  config: Record<string, unknown>
}

export interface LandingPageConfig {
  id: string
  name: string
  sections: SectionDescriptor[]
  created_at: string
  updated_at: string
}

// ============================================================================
// Constants
// ============================================================================

const PAGES_KEY = 'rstu_landing_pages'
const ACTIVE_KEY = 'rstu_active_landing_page'

let _uid = 0
function uid() {
  return `s-${Date.now()}-${++_uid}`
}

export const SECTION_TYPES = [
  { type: 'hero', label: 'Hero' },
  { type: 'rights', label: 'Tenant Rights' },
  { type: 'organizing', label: 'Organizing Works' },
  { type: 'crisis', label: 'Local Crisis' },
  { type: 'action', label: 'What You Can Do' },
  { type: 'cta', label: 'Call to Action' },
  { type: 'mission', label: 'Mission Statement' },
  { type: 'values', label: 'Core Values' },
  { type: 'philosophy', label: 'Philosophy' },
  { type: 'readings', label: 'Featured Readings' },
  { type: 'text', label: 'Custom Text' },
  { type: 'cards', label: 'Custom Cards' },
  { type: 'image-banner', label: 'Image Banner' },
] as const

export const DEFAULT_PAGE_1: LandingPageConfig = {
  id: 'page-1',
  name: 'Default',
  sections: [
    { id: 'def-hero', type: 'hero', config: {} },
    { id: 'def-rights', type: 'rights', config: {} },
    { id: 'def-organizing', type: 'organizing', config: {} },
    { id: 'def-crisis', type: 'crisis', config: {} },
    { id: 'def-action', type: 'action', config: {} },
    { id: 'def-cta', type: 'cta', config: {} },
  ],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

export const PRESET_PAGE_2: LandingPageConfig = {
  id: 'page-2',
  name: 'RSTU.org Mirror',
  sections: [
    {
      id: 'mirror-hero',
      type: 'hero',
      config: {
        showLogo: true,
        headlineOverride: 'Homes for people, not for profit.',
        taglineOverride: 'A volunteer-led union building and protecting tenant power through collective action.',
        missionOverride: 'As Reno renters face skyrocketing housing costs, limited housing supply, and state laws that put profits over people — we fight for safe, secure, affordable, and fair housing for all.',
      },
    },
    {
      id: 'mirror-mission',
      type: 'text',
      config: {
        heading: "We're Stronger Together",
        body: "Together, we can win safe, dignified, and affordable housing for all. When tenants organize, we have the power to hold landlords accountable, change unjust laws, and build a movement for housing justice.",
        bgColor: 'white',
      },
    },
    {
      id: 'mirror-values',
      type: 'cards',
      config: {
        heading: 'Our Core Values',
        cards: [
          {
            title: 'Housing is a Human Right',
            body: 'Housing is a basic human necessity, not a commodity. Everyone deserves safe, stable, affordable shelter regardless of income.',
          },
          {
            title: "We're a Tenants Organization First",
            body: 'Our focus is building tenant power — not just housing supply. Tenants deserve a seat at the table in every decision that affects their homes.',
          },
          {
            title: 'Houselessness Results from Commodification',
            body: 'When housing is treated as an investment, people suffer. We oppose the criminalization of poverty and include all tenants in our mission.',
          },
        ],
      },
    },
    {
      id: 'mirror-cta',
      type: 'cta',
      config: {},
    },
  ],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

// ============================================================================
// Local Storage CRUD
// ============================================================================

export function getLandingPages(): LandingPageConfig[] {
  const stored = safeGetJson<LandingPageConfig[]>(PAGES_KEY, [])
  if (stored.length === 0) {
    // Initialize with defaults
    const defaults = [DEFAULT_PAGE_1, PRESET_PAGE_2]
    safeSetItem(PAGES_KEY, JSON.stringify(defaults))
    return defaults
  }
  return stored
}

export function saveLandingPage(config: LandingPageConfig): void {
  const pages = getLandingPages()
  const idx = pages.findIndex(p => p.id === config.id)
  config.updated_at = new Date().toISOString()
  if (idx >= 0) {
    pages[idx] = config
  } else {
    pages.push(config)
  }
  safeSetItem(PAGES_KEY, JSON.stringify(pages))
  pushToSupabase(config)
}

export function deleteLandingPage(id: string): void {
  const pages = getLandingPages().filter(p => p.id !== id)
  safeSetItem(PAGES_KEY, JSON.stringify(pages))
  // Also remove from Supabase
  if (supabase) {
    supabase.from('landing_pages').delete().eq('id', id).then(() => {})
  }
  // If active page was deleted, reset to page-1
  if (getActiveLandingPageId() === id) {
    setActiveLandingPageId('page-1')
  }
}

export function getActiveLandingPageId(): string {
  return safeGetJson<string>(ACTIVE_KEY, 'page-1') || 'page-1'
}

export function setActiveLandingPageId(id: string): void {
  safeSetItem(ACTIVE_KEY, JSON.stringify(id))
}

// ============================================================================
// Helpers
// ============================================================================

export function createBlankPage(name: string): LandingPageConfig {
  return {
    id: `page-${Date.now()}`,
    name,
    sections: [
      { id: uid(), type: 'hero', config: {} },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export function createSection(type: string): SectionDescriptor {
  const base: SectionDescriptor = { id: uid(), type, config: {} }
  if (type === 'text') {
    base.config = { heading: 'New Section', body: 'Add your content here.', bgColor: 'white' }
  } else if (type === 'cards') {
    base.config = {
      heading: 'New Cards Section',
      cards: [
        { title: 'Card 1', body: 'Description here.' },
        { title: 'Card 2', body: 'Description here.' },
      ],
    }
  } else if (type === 'image-banner') {
    base.config = { bgColor: '#cc0000', overlayText: 'Banner Text', textColor: 'white' }
  }
  return base
}

// ============================================================================
// Supabase Sync
// ============================================================================

async function pushToSupabase(config: LandingPageConfig): Promise<void> {
  if (!supabase) return
  try {
    await supabase.from('landing_pages').upsert({
      id: config.id,
      name: config.name,
      sections: config.sections,
      created_at: config.created_at,
      updated_at: config.updated_at,
    })
  } catch {
    // Silent fail — localStorage is primary
  }
}

export async function syncFromSupabase(): Promise<LandingPageConfig[]> {
  if (!supabase) return getLandingPages()
  try {
    const { data, error } = await supabase
      .from('landing_pages')
      .select('*')
      .order('created_at', { ascending: true })
    if (error || !data || data.length === 0) return getLandingPages()

    const pages = data.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      name: row.name as string,
      sections: row.sections as SectionDescriptor[],
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    }))
    safeSetItem(PAGES_KEY, JSON.stringify(pages))
    return pages
  } catch {
    return getLandingPages()
  }
}
