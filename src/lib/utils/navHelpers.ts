import type { Tab } from '@/contexts/TabContext'
import { getAdminSettings, getNavLabel, getNavOrder } from '@/lib/storage/adminSettingsStorage'

/**
 * Get effective label for a navigation tab
 * Returns custom label if set, otherwise falls back to translation key
 */
export function getEffectiveNavLabel(
  tabId: Tab,
  t: (key: string) => string
): string {
  const customLabel = getNavLabel(tabId)

  if (customLabel) {
    return customLabel
  }

  // Fallback to translation key
  const keyMap: Record<Tab, string> = {
    landing: 'nav.landing',
    home: 'nav.organize',
    reading: 'nav.reading',
    mutualAid: 'nav.mutualAid',
    resources: 'nav.resources',
    tools: 'nav.tools',
    profile: 'nav.profile',
    governance: 'nav.governance'
  }

  return t(keyMap[tabId])
}

/**
 * Get effective navigation order
 * Returns custom order if set, otherwise returns default order
 */
export function getEffectiveNavOrder(): Tab[] {
  return getNavOrder()
}
