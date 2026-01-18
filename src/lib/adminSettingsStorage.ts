/**
 * Admin Settings Storage
 * Site-wide settings controlled by admins that affect all users
 *
 * For now, stored in localStorage with a sync mechanism via Supabase.
 * Non-admin users read these settings but cannot modify them.
 */

import { safeGetJson, safeSetItem } from './safeStorage'
import { isAdmin } from './profileStorage'

// ============================================================================
// Types
// ============================================================================

export interface AdminSettings {
  // Tab Visibility (site-wide)
  tabVisibility: {
    organize: boolean       // Show/hide Organize tab for all verified users
    mutualAid: boolean      // Show/hide Mutual Aid tab
    tools: boolean          // Show/hide Tools tab (still requires organizer role)
    reading: boolean        // Show/hide Reading tab
  }

  // Feature Flags
  features: {
    appGovernance: boolean  // Enable app-wide governance voting
    userFeedback: boolean   // Enable user feedback system
    contentVoting: boolean  // Enable content block voting
    delegateVoting: boolean // Enable delegate-weighted voting
  }

  // Landing page as home
  landingAsHome: boolean    // Default users to landing page

  // Governance thresholds (can be voted on later)
  governanceThresholds: {
    minVerifiedTenants: number    // Min tenants to become delegate
    minBlocs: number              // Min blocs to participate
    minActivityScore: number      // Min activity for voting
  }

  // Metadata
  lastUpdatedBy: string | null
  lastUpdatedAt: number | null
  version: number
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'rstu_admin_settings'
const CURRENT_VERSION = 1

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  tabVisibility: {
    organize: true,   // Visible by default (still requires verification)
    mutualAid: true,
    tools: true,      // Visible by default (still requires organizer role)
    reading: true,
  },
  features: {
    appGovernance: false,   // Off until implemented
    userFeedback: false,    // Off until implemented
    contentVoting: false,   // Off until implemented
    delegateVoting: false,  // Off until implemented
  },
  landingAsHome: true,      // Landing page is the home
  governanceThresholds: {
    minVerifiedTenants: 10,
    minBlocs: 1,
    minActivityScore: 50,
  },
  lastUpdatedBy: null,
  lastUpdatedAt: null,
  version: CURRENT_VERSION,
}

// ============================================================================
// Storage Functions
// ============================================================================

/**
 * Get admin settings - all users can read
 */
export function getAdminSettings(): AdminSettings {
  const stored = safeGetJson<Partial<AdminSettings>>(STORAGE_KEY, {})

  // Merge with defaults
  return {
    ...DEFAULT_ADMIN_SETTINGS,
    ...stored,
    tabVisibility: {
      ...DEFAULT_ADMIN_SETTINGS.tabVisibility,
      ...stored.tabVisibility,
    },
    features: {
      ...DEFAULT_ADMIN_SETTINGS.features,
      ...stored.features,
    },
    governanceThresholds: {
      ...DEFAULT_ADMIN_SETTINGS.governanceThresholds,
      ...stored.governanceThresholds,
    },
  }
}

/**
 * Save admin settings - only admins can write
 */
export function saveAdminSettings(
  settings: AdminSettings,
  adminProfileId?: string
): boolean {
  if (!isAdmin()) {
    console.warn('[AdminSettings] Non-admin attempted to save admin settings')
    return false
  }

  const updated: AdminSettings = {
    ...settings,
    lastUpdatedBy: adminProfileId || null,
    lastUpdatedAt: Date.now(),
    version: CURRENT_VERSION,
  }

  return safeSetItem(STORAGE_KEY, JSON.stringify(updated))
}

/**
 * Update partial admin settings - only admins can write
 */
export function updateAdminSettings(
  updates: Partial<AdminSettings>,
  adminProfileId?: string
): AdminSettings | null {
  if (!isAdmin()) {
    console.warn('[AdminSettings] Non-admin attempted to update admin settings')
    return null
  }

  const current = getAdminSettings()
  const updated: AdminSettings = {
    ...current,
    ...updates,
    tabVisibility: {
      ...current.tabVisibility,
      ...updates.tabVisibility,
    },
    features: {
      ...current.features,
      ...updates.features,
    },
    governanceThresholds: {
      ...current.governanceThresholds,
      ...updates.governanceThresholds,
    },
    lastUpdatedBy: adminProfileId || null,
    lastUpdatedAt: Date.now(),
  }

  if (saveAdminSettings(updated, adminProfileId)) {
    return updated
  }
  return null
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Check if Organize tab is enabled site-wide
 */
export function isOrganizeTabEnabled(): boolean {
  return getAdminSettings().tabVisibility.organize
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof AdminSettings['features']): boolean {
  return getAdminSettings().features[feature]
}

/**
 * Toggle a tab's visibility (admin only)
 */
export function toggleAdminTabVisibility(
  tab: keyof AdminSettings['tabVisibility'],
  adminProfileId?: string
): AdminSettings | null {
  const current = getAdminSettings()
  return updateAdminSettings({
    tabVisibility: {
      ...current.tabVisibility,
      [tab]: !current.tabVisibility[tab],
    },
  }, adminProfileId)
}

/**
 * Toggle a feature flag (admin only)
 */
export function toggleFeature(
  feature: keyof AdminSettings['features'],
  adminProfileId?: string
): AdminSettings | null {
  const current = getAdminSettings()
  return updateAdminSettings({
    features: {
      ...current.features,
      [feature]: !current.features[feature],
    },
  }, adminProfileId)
}

/**
 * Reset admin settings to defaults (admin only)
 */
export function resetAdminSettings(adminProfileId?: string): AdminSettings | null {
  if (!isAdmin()) {
    return null
  }
  const reset = {
    ...DEFAULT_ADMIN_SETTINGS,
    lastUpdatedBy: adminProfileId || null,
    lastUpdatedAt: Date.now(),
  }
  if (safeSetItem(STORAGE_KEY, JSON.stringify(reset))) {
    return reset
  }
  return null
}

// ============================================================================
// App Governance Thresholds
// ============================================================================

/**
 * Get the current threshold for delegate voting qualification
 */
export function getDelegateThresholds() {
  return getAdminSettings().governanceThresholds
}

/**
 * Update governance thresholds (admin only, or via passed governance vote)
 */
export function updateGovernanceThresholds(
  thresholds: Partial<AdminSettings['governanceThresholds']>,
  adminProfileId?: string
): AdminSettings | null {
  const current = getAdminSettings()
  return updateAdminSettings({
    governanceThresholds: {
      ...current.governanceThresholds,
      ...thresholds,
    },
  }, adminProfileId)
}
