/**
 * Display preferences storage
 * Manages user customization for layout, sections, density, and tabs
 */

import { safeGetJson, safeSetItem } from './safeStorage'

// ============================================================================
// Types
// ============================================================================

export type LayoutPreset = 'default' | 'focus' | 'compact' | 'wide-list' | 'wide-content'
export type DisplayDensity = 'comfortable' | 'compact' | 'spacious'
export type TabId = 'home' | 'reading' | 'mutualAid' | 'tools' | 'profile'

export interface PanelConfig {
  width: number      // 20-80 percent
  visible: boolean
}

export interface SectionVisibility {
  home: {
    stats: boolean
    progress: boolean
    favorites: boolean
    linkedGroups: boolean
  }
  reading: {
    categories: boolean
    filters: boolean
    meta: boolean
  }
  mutualAid: {
    skills: boolean
    library: boolean
    blocs: boolean
  }
  tools: {
    tasks: boolean
    powerMap: boolean
    canvassing: boolean
  }
  profile: {
    rentComparison: boolean
    activity: boolean
    habitability: boolean
  }
}

export interface TabConfig {
  order: TabId[]
  hidden: TabId[]
}

export interface DisplayPreferences {
  layoutPreset: LayoutPreset
  density: DisplayDensity

  panelConfig: {
    home: PanelConfig
    reading: PanelConfig
    mutualAid: PanelConfig
    tools: PanelConfig
  }

  sectionVisibility: SectionVisibility
  tabConfig: TabConfig

  version: number
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'rstu_display_preferences'
const CURRENT_VERSION = 1

// Default panel configs per preset
export const PRESET_CONFIGS: Record<LayoutPreset, { width: number; density: DisplayDensity }> = {
  'default': { width: 40, density: 'comfortable' },
  'focus': { width: 0, density: 'comfortable' },      // Hidden left panel
  'compact': { width: 30, density: 'compact' },
  'wide-list': { width: 55, density: 'comfortable' },
  'wide-content': { width: 25, density: 'comfortable' },
}

export const PRESET_LABELS: Record<LayoutPreset, string> = {
  'default': 'Default',
  'focus': 'Focus',
  'compact': 'Compact',
  'wide-list': 'Wide List',
  'wide-content': 'Wide Content',
}

export const DENSITY_LABELS: Record<DisplayDensity, string> = {
  'comfortable': 'Comfortable',
  'compact': 'Compact',
  'spacious': 'Spacious',
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_PANEL_CONFIG: PanelConfig = {
  width: 40,
  visible: true,
}

const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  home: {
    stats: true,
    progress: true,
    favorites: true,
    linkedGroups: true,
  },
  reading: {
    categories: true,
    filters: true,
    meta: true,
  },
  mutualAid: {
    skills: true,
    library: true,
    blocs: true,
  },
  tools: {
    tasks: true,
    powerMap: true,
    canvassing: true,
  },
  profile: {
    rentComparison: true,
    activity: true,
    habitability: true,
  },
}

const DEFAULT_TAB_ORDER: TabId[] = ['home', 'reading', 'mutualAid', 'tools', 'profile']

export const DEFAULT_PREFERENCES: DisplayPreferences = {
  layoutPreset: 'default',
  density: 'comfortable',
  panelConfig: {
    home: { ...DEFAULT_PANEL_CONFIG },
    reading: { ...DEFAULT_PANEL_CONFIG },
    mutualAid: { ...DEFAULT_PANEL_CONFIG },
    tools: { ...DEFAULT_PANEL_CONFIG },
  },
  sectionVisibility: DEFAULT_SECTION_VISIBILITY,
  tabConfig: {
    order: [...DEFAULT_TAB_ORDER],
    hidden: [],
  },
  version: CURRENT_VERSION,
}

// ============================================================================
// Storage Functions
// ============================================================================

/**
 * Get display preferences from localStorage
 */
export function getDisplayPreferences(): DisplayPreferences {
  const stored = safeGetJson<Partial<DisplayPreferences>>(STORAGE_KEY, {})

  // Merge with defaults to ensure all fields exist
  return {
    ...DEFAULT_PREFERENCES,
    ...stored,
    panelConfig: {
      ...DEFAULT_PREFERENCES.panelConfig,
      ...stored.panelConfig,
    },
    sectionVisibility: {
      ...DEFAULT_PREFERENCES.sectionVisibility,
      ...stored.sectionVisibility,
      home: { ...DEFAULT_PREFERENCES.sectionVisibility.home, ...stored.sectionVisibility?.home },
      reading: { ...DEFAULT_PREFERENCES.sectionVisibility.reading, ...stored.sectionVisibility?.reading },
      mutualAid: { ...DEFAULT_PREFERENCES.sectionVisibility.mutualAid, ...stored.sectionVisibility?.mutualAid },
      tools: { ...DEFAULT_PREFERENCES.sectionVisibility.tools, ...stored.sectionVisibility?.tools },
      profile: { ...DEFAULT_PREFERENCES.sectionVisibility.profile, ...stored.sectionVisibility?.profile },
    },
    tabConfig: {
      ...DEFAULT_PREFERENCES.tabConfig,
      ...stored.tabConfig,
    },
  }
}

/**
 * Save display preferences to localStorage
 */
export function saveDisplayPreferences(prefs: DisplayPreferences): boolean {
  return safeSetItem(STORAGE_KEY, JSON.stringify(prefs))
}

/**
 * Update partial display preferences
 */
export function updateDisplayPreferences(updates: Partial<DisplayPreferences>): DisplayPreferences {
  const current = getDisplayPreferences()
  const updated = { ...current, ...updates }
  saveDisplayPreferences(updated)
  return updated
}

/**
 * Apply a layout preset (updates width and density)
 */
export function applyLayoutPreset(preset: LayoutPreset): DisplayPreferences {
  const current = getDisplayPreferences()
  const presetConfig = PRESET_CONFIGS[preset]

  const updated: DisplayPreferences = {
    ...current,
    layoutPreset: preset,
    density: presetConfig.density,
    panelConfig: {
      home: { width: presetConfig.width, visible: presetConfig.width > 0 },
      reading: { width: presetConfig.width, visible: presetConfig.width > 0 },
      mutualAid: { width: presetConfig.width, visible: presetConfig.width > 0 },
      tools: { width: presetConfig.width, visible: presetConfig.width > 0 },
    },
  }

  saveDisplayPreferences(updated)
  return updated
}

/**
 * Update panel width for a specific tab
 */
export function setPanelWidth(tab: keyof DisplayPreferences['panelConfig'], width: number): DisplayPreferences {
  const current = getDisplayPreferences()
  const clampedWidth = Math.max(20, Math.min(80, width))

  const updated: DisplayPreferences = {
    ...current,
    layoutPreset: 'default', // Reset preset when manually adjusting
    panelConfig: {
      ...current.panelConfig,
      [tab]: { ...current.panelConfig[tab], width: clampedWidth },
    },
  }

  saveDisplayPreferences(updated)
  return updated
}

/**
 * Toggle panel visibility for a specific tab
 */
export function togglePanelVisibility(tab: keyof DisplayPreferences['panelConfig']): DisplayPreferences {
  const current = getDisplayPreferences()

  const updated: DisplayPreferences = {
    ...current,
    panelConfig: {
      ...current.panelConfig,
      [tab]: {
        ...current.panelConfig[tab],
        visible: !current.panelConfig[tab].visible,
      },
    },
  }

  saveDisplayPreferences(updated)
  return updated
}

/**
 * Toggle section visibility
 */
export function toggleSectionVisibility<T extends keyof SectionVisibility>(
  tab: T,
  section: keyof SectionVisibility[T]
): DisplayPreferences {
  const current = getDisplayPreferences()

  const updated: DisplayPreferences = {
    ...current,
    sectionVisibility: {
      ...current.sectionVisibility,
      [tab]: {
        ...current.sectionVisibility[tab],
        [section]: !current.sectionVisibility[tab][section],
      },
    },
  }

  saveDisplayPreferences(updated)
  return updated
}

/**
 * Set display density
 */
export function setDisplayDensity(density: DisplayDensity): DisplayPreferences {
  const current = getDisplayPreferences()
  const updated = { ...current, density }
  saveDisplayPreferences(updated)
  return updated
}

/**
 * Update tab order
 */
export function setTabOrder(order: TabId[]): DisplayPreferences {
  const current = getDisplayPreferences()
  const updated: DisplayPreferences = {
    ...current,
    tabConfig: {
      ...current.tabConfig,
      order,
    },
  }
  saveDisplayPreferences(updated)
  return updated
}

/**
 * Toggle tab visibility
 */
export function toggleTabVisibility(tab: TabId): DisplayPreferences {
  const current = getDisplayPreferences()
  const isHidden = current.tabConfig.hidden.includes(tab)

  const updated: DisplayPreferences = {
    ...current,
    tabConfig: {
      ...current.tabConfig,
      hidden: isHidden
        ? current.tabConfig.hidden.filter(t => t !== tab)
        : [...current.tabConfig.hidden, tab],
    },
  }

  saveDisplayPreferences(updated)
  return updated
}

/**
 * Reset to default preferences
 */
export function resetDisplayPreferences(): DisplayPreferences {
  saveDisplayPreferences(DEFAULT_PREFERENCES)
  return DEFAULT_PREFERENCES
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get CSS classes for density
 */
export function getDensityClasses(density: DisplayDensity): string {
  switch (density) {
    case 'compact':
      return 'text-sm gap-1 p-2'
    case 'spacious':
      return 'text-base gap-4 p-4'
    case 'comfortable':
    default:
      return 'text-sm gap-2 p-3'
  }
}

/**
 * Get panel width style
 */
export function getPanelWidthStyle(config: PanelConfig): React.CSSProperties {
  if (!config.visible) {
    return { display: 'none' }
  }
  return { width: `${config.width}%` }
}
