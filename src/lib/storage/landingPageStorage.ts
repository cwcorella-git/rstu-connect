import { safeGetJson, safeSetItem } from '../utils/safeStorage'
import { supabase } from '../services/supabase'

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
const MIGRATION_KEY = 'rstu_landing_page_version'
const CURRENT_VERSION = 2 // Bump when DEFAULT_PAGE_1 changes

let _uid = 0
function uid() {
  return `s-${Date.now()}-${++_uid}`
}

export const SECTION_TYPES = [
  { type: 'columns', label: 'Column Row' },
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
  { type: 'how-it-works', label: 'How It Works' },
] as const

export const COLUMN_LAYOUTS = [
  { id: '1-1',     label: 'Two Equal',    cols: 2, template: '1fr 1fr' },
  { id: '1-2',     label: 'Narrow + Wide', cols: 2, template: '1fr 2fr' },
  { id: '2-1',     label: 'Wide + Narrow', cols: 2, template: '2fr 1fr' },
  { id: '1-1-1',   label: 'Three Equal',  cols: 3, template: '1fr 1fr 1fr' },
  { id: '1-1-1-1', label: 'Four Equal',   cols: 4, template: '1fr 1fr 1fr 1fr' },
] as const

export const SECTION_CATEGORIES = [
  {
    label: 'Layout',
    items: [
      { type: 'columns', label: 'Column Row', description: 'Multi-column layout row' },
    ],
  },
  {
    label: 'Content',
    items: [
      { type: 'text', label: 'Custom Text', description: 'Heading and body text' },
      { type: 'cards', label: 'Custom Cards', description: 'Grid of editable cards' },
      { type: 'image-banner', label: 'Image Banner', description: 'Full-width colored banner' },
      { type: 'hero', label: 'Hero', description: 'Logo, headline, and CTAs' },
      { type: 'cta', label: 'Call to Action', description: 'Main call-to-action block' },
    ],
  },
  {
    label: 'Prebuilt',
    items: [
      { type: 'rights', label: 'Tenant Rights', description: 'Nevada tenant rights listing' },
      { type: 'organizing', label: 'Organizing Works', description: 'How organizing works overview' },
      { type: 'crisis', label: 'Local Crisis', description: 'Reno housing crisis stats' },
      { type: 'action', label: 'What You Can Do', description: 'Legal help and resources' },
      { type: 'mission', label: 'Mission Statement', description: 'Mission, vision, principles' },
      { type: 'values', label: 'Core Values', description: 'Racial justice, anti-gentrification' },
      { type: 'philosophy', label: 'Philosophy', description: 'Municipalism, mutual aid, dual power' },
      { type: 'readings', label: 'Featured Readings', description: 'Curated document highlights' },
      { type: 'how-it-works', label: 'How It Works', description: '6-step feature tour' },
    ],
  },
] as const

export const DEFAULT_PAGE_1: LandingPageConfig = {
  id: 'page-1',
  name: 'Default',
  sections: [
    { id: 'def-hero', type: 'hero', config: {} },
    {
      id: 'def-stronger',
      type: 'text',
      config: {
        heading: "We're Stronger Together",
        body: "As Reno renters face skyrocketing housing costs, limited housing supply, and state laws that put profits over people — we must band together to fight for safe, secure, affordable, and fair housing for all in the Reno-Sparks area.\n\nTogether, we can win safe, dignified, and affordable housing for all.",
        bgColor: 'gray',
      },
    },
    {
      id: 'def-values',
      type: 'cards',
      config: {
        heading: 'Our Core Values',
        cards: [
          {
            title: 'Housing is a Human Right',
            body: "Everyone deserves safe, stable, affordable housing regardless of circumstances. The commodification of housing has led to the vast inequality that we see today. We fight for a city in which no one is left without a home.",
          },
          {
            title: "We're a Tenants Organization First and Foremost",
            body: "We fight for tenants, not for housing. The crisis in our region is not solely due to a lack of housing and will not be solved simply with more development. True justice will only be achieved by giving power to tenants to control their own housing.",
          },
          {
            title: 'Houselessness is the Result of the Commodification of Housing',
            body: "Houselessness is an inevitable consequence of treating housing like a commodity. We oppose any laws and policies that criminalize houselessness or target unhoused people for harassment. We are fighting for a future where houselessness ends because everyone has a home.",
          },
        ],
      },
    },
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

export const PRESET_PAGE_3: LandingPageConfig = {
  id: 'page-3',
  name: 'Feature Tour',
  sections: [
    {
      id: 'tour-hero',
      type: 'hero',
      config: {
        showLogo: true,
        headlineOverride: 'Tools for Tenant Power',
        taglineOverride: 'Everything you need to organize your building and win.',
        missionOverride: 'RSTU Connect gives you the tools to find neighbors, build community, and take collective action for housing justice.',
      },
    },
    {
      id: 'tour-how',
      type: 'how-it-works',
      config: {
        heading: 'How RSTU Connect Works',
        subtitle: 'Six steps from finding your building to building tenant power',
      },
    },
    {
      id: 'tour-text',
      type: 'text',
      config: {
        heading: 'Built By and For Tenants',
        body: "RSTU Connect is a free, open-source tool built by tenant organizers in Reno-Sparks. We don't collect your personal data or sell your information. Everything stays between you and your neighbors.\n\nThis platform exists because we believe tenants deserve the same sophisticated tools that landlords use to coordinate against us. Now we can coordinate too.",
        bgColor: 'gray',
      },
    },
    {
      id: 'tour-cta',
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
    const defaults = [DEFAULT_PAGE_1, PRESET_PAGE_2, PRESET_PAGE_3]
    safeSetItem(PAGES_KEY, JSON.stringify(defaults))
    safeSetItem(MIGRATION_KEY, String(CURRENT_VERSION))
    return defaults
  }

  // Check for migration
  const version = parseInt(safeGetJson<string>(MIGRATION_KEY, '1') || '1', 10)
  let changed = false

  if (version < CURRENT_VERSION) {
    // Migrate page-1 to include new sections (v2: added "Stronger Together" and "Values")
    const page1Idx = stored.findIndex(p => p.id === 'page-1')
    if (page1Idx >= 0) {
      const page1 = stored[page1Idx]
      // Only migrate if user hasn't customized it (still has original 2-section layout)
      const hasOnlyHeroAndCta = page1.sections.length === 2 &&
        page1.sections[0]?.type === 'hero' &&
        page1.sections[1]?.type === 'cta'
      if (hasOnlyHeroAndCta) {
        stored[page1Idx] = DEFAULT_PAGE_1
        changed = true
      }
    }
    safeSetItem(MIGRATION_KEY, String(CURRENT_VERSION))
  }

  // Ensure preset pages exist (restore if deleted)
  if (!stored.find(p => p.id === 'page-1')) {
    stored.unshift(DEFAULT_PAGE_1)
    changed = true
  }
  if (!stored.find(p => p.id === 'page-2')) {
    stored.splice(1, 0, PRESET_PAGE_2)
    changed = true
  }
  if (!stored.find(p => p.id === 'page-3')) {
    stored.splice(2, 0, PRESET_PAGE_3)
    changed = true
  }
  if (changed) {
    safeSetItem(PAGES_KEY, JSON.stringify(stored))
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
    sections: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export function createSection(type: string): SectionDescriptor {
  const base: SectionDescriptor = { id: uid(), type, config: {} }
  if (type === 'columns') {
    base.config = {
      layout: '1-1',
      columns: [
        { id: uid(), type: 'text', config: { heading: 'Column 1', body: 'Content here.', bgColor: 'white' } },
        { id: uid(), type: 'text', config: { heading: 'Column 2', body: 'Content here.', bgColor: 'white' } },
      ],
      gap: 'md',
      bgColor: 'transparent',
    }
  } else if (type === 'text') {
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
