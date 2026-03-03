import { createLogger } from '../utils/logger'

const log = createLogger('AdminSettings')

/**
 * Admin Settings Storage
 * Site-wide settings controlled by admins that affect all users
 *
 * For now, stored in localStorage with a sync mechanism via Supabase.
 * Non-admin users read these settings but cannot modify them.
 */

import { safeGetJson, safeSetItem } from '../utils/safeStorage'
import { isAdmin } from './profileStorage'
import type { Tab } from '@/contexts/TabContext'

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
    userFeedback: boolean   // Enable user feedback system
  }

  // Landing page as home
  landingAsHome: boolean    // Default users to landing page

  // Custom Navigation Labels (admin-editable)
  customNavLabels?: Record<Tab, string>  // Custom labels for each tab

  // Custom Navigation Order (admin-controlled)
  navOrder?: Tab[]                       // Custom navigation order

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
    userFeedback: true,     // User feedback system enabled
  },
  landingAsHome: true,      // Landing page is the home
  customNavLabels: {},      // Empty = use translation keys
  navOrder: ['landing', 'home', 'reading', 'mutualAid', 'resources', 'tools', 'profile', 'governance'],
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
    customNavLabels: stored.customNavLabels || DEFAULT_ADMIN_SETTINGS.customNavLabels,
    navOrder: stored.navOrder || DEFAULT_ADMIN_SETTINGS.navOrder,
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
    log.warn('Non-admin attempted to save admin settings')
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
    log.warn('Non-admin attempted to update admin settings')
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
// Navigation Customization Functions
// ============================================================================

/**
 * Get custom label for a tab (returns null if using default translation)
 */
export function getNavLabel(tabId: Tab): string | null {
  const settings = getAdminSettings()
  return settings.customNavLabels?.[tabId] || null
}

/**
 * Set custom label for a tab (admin only)
 */
export function setNavLabel(tabId: Tab, customLabel: string, adminProfileId?: string): boolean {
  if (!isAdmin()) {
    log.warn('Non-admin attempted to set nav label')
    return false
  }

  const current = getAdminSettings()
  const updated = updateAdminSettings({
    customNavLabels: {
      ...current.customNavLabels,
      [tabId]: customLabel,
    },
  }, adminProfileId)

  return updated !== null
}

/**
 * Reset a tab label to use translation key (admin only)
 */
export function resetNavLabel(tabId: Tab, adminProfileId?: string): boolean {
  if (!isAdmin()) {
    log.warn('Non-admin attempted to reset nav label')
    return false
  }

  const current = getAdminSettings()
  const newLabels = { ...current.customNavLabels }
  delete newLabels[tabId]

  const updated = updateAdminSettings({
    customNavLabels: newLabels,
  }, adminProfileId)

  return updated !== null
}

/**
 * Get current navigation order
 */
export function getNavOrder(): Tab[] {
  const settings = getAdminSettings()
  return settings.navOrder || DEFAULT_ADMIN_SETTINGS.navOrder!
}

/**
 * Set custom navigation order (admin only)
 */
export function setNavOrder(order: Tab[], adminProfileId?: string): boolean {
  if (!isAdmin()) {
    log.warn('Non-admin attempted to set nav order')
    return false
  }

  // Validate that all tabs are present (no duplicates, no missing)
  const defaultOrder = DEFAULT_ADMIN_SETTINGS.navOrder!
  if (order.length !== defaultOrder.length) {
    log.warn('Invalid nav order: incorrect length')
    return false
  }

  const orderSet = new Set(order)
  if (orderSet.size !== order.length) {
    log.warn('Invalid nav order: contains duplicates')
    return false
  }

  for (const tab of defaultOrder) {
    if (!orderSet.has(tab)) {
      log.warn(`Invalid nav order: missing tab ${tab}`)
      return false
    }
  }

  const updated = updateAdminSettings({
    navOrder: order,
  }, adminProfileId)

  return updated !== null
}

/**
 * Move a tab left or right in the navigation order (admin only)
 */
export function moveTab(tabId: Tab, direction: 'left' | 'right', adminProfileId?: string): boolean {
  if (!isAdmin()) {
    log.warn('Non-admin attempted to move tab')
    return false
  }

  const currentOrder = getNavOrder()
  const index = currentOrder.indexOf(tabId)

  if (index === -1) {
    log.warn(`Tab ${tabId} not found in nav order`)
    return false
  }

  // Can't move left from first position
  if (direction === 'left' && index === 0) {
    return false
  }

  // Can't move right from last position
  if (direction === 'right' && index === currentOrder.length - 1) {
    return false
  }

  // Create new order with swapped positions
  const newOrder = [...currentOrder]
  const swapIndex = direction === 'left' ? index - 1 : index + 1
  ;[newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]]

  return setNavOrder(newOrder, adminProfileId)
}

