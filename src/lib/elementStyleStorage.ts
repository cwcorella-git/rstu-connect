/**
 * Per-element style overrides storage
 * Stores font size and max-width overrides keyed by translation key (tKey)
 */

import { safeGetJson, safeSetItem } from './safeStorage'

const STORAGE_KEY = 'rstu_element_styles'

export interface ElementStyleOverride {
  fontSize?: number   // px
  maxWidth?: number   // px
}

function getAllStyles(): Record<string, ElementStyleOverride> {
  return safeGetJson<Record<string, ElementStyleOverride>>(STORAGE_KEY, {})
}

export function getElementStyle(tKey: string): ElementStyleOverride | null {
  const all = getAllStyles()
  return all[tKey] || null
}

export function setElementStyle(tKey: string, override: ElementStyleOverride): void {
  const all = getAllStyles()
  // Remove empty overrides
  const clean: ElementStyleOverride = {}
  if (override.fontSize) clean.fontSize = override.fontSize
  if (override.maxWidth) clean.maxWidth = override.maxWidth

  if (Object.keys(clean).length === 0) {
    delete all[tKey]
  } else {
    all[tKey] = clean
  }
  safeSetItem(STORAGE_KEY, JSON.stringify(all))
}

export function clearElementStyle(tKey: string): void {
  const all = getAllStyles()
  delete all[tKey]
  safeSetItem(STORAGE_KEY, JSON.stringify(all))
}

export function getAllElementStyles(): Record<string, ElementStyleOverride> {
  return getAllStyles()
}
