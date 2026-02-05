'use client';
import { createLogger } from '../utils/logger'
import { generateShortId } from '../utils/idUtils'

const log = createLogger('LinkedProperties')

export interface BannedProfile {
  profileId: string;
  ip?: string;
  originalUnit?: string;
  leaseExpiration?: string;
  bannedAt: number;
  bannedBy: string;
  reason?: string;
}

export interface LinkedPropertyGroup {
  id: string;
  name: string;
  apns: string[];
  createdBy: string;
  createdAt: number;
  notes?: string;
  isSameBuilding?: boolean; // true = same physical building (don't sum units), false = different buildings coordinating

  // Governance fields
  memberProfiles?: string[];     // Verified member profile IDs
  alliances?: string[];          // Allied group IDs
  mutedProfiles?: string[];      // Muted (can't chat but still tracked)
  bannedProfiles?: BannedProfile[]; // Full bans with tracking
}

const STORAGE_KEY = 'rstu-linked-properties';

// Generate ID with lp- prefix for linked properties
function generateId(): string {
  return `lp-${Date.now()}-${generateShortId()}`
}

export function getLinkedGroups(): LinkedPropertyGroup[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveLinkedGroups(groups: LinkedPropertyGroup[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch (e) {
    log.error('Failed to save - storage quota may be exceeded:', e);
  }
}

export function createLinkedGroup(
  apns: string[],
  name: string,
  createdBy: string,
  notes?: string,
  isSameBuilding?: boolean
): LinkedPropertyGroup {
  const group: LinkedPropertyGroup = {
    id: generateId(),
    name,
    apns,
    createdBy,
    createdAt: Date.now(),
    notes,
    isSameBuilding,
  };

  const groups = getLinkedGroups();
  groups.push(group);
  saveLinkedGroups(groups);

  return group;
}

/**
 * Create a linked group, merging with any existing groups that contain the selected APNs.
 * If selected APNs span multiple existing groups, those groups are combined into one.
 * Preserves members, alliances, and notes from merged groups.
 */
export function createOrMergeLinkedGroup(
  apns: string[],
  name: string,
  createdBy: string,
  notes?: string,
  isSameBuilding?: boolean
): LinkedPropertyGroup {
  const groups = getLinkedGroups();

  // Find all existing groups that contain any of the selected APNs
  const overlappingGroups = groups.filter(g =>
    g.apns.some(apn => apns.includes(apn))
  );

  if (overlappingGroups.length === 0) {
    // No overlap - just create a new group
    return createLinkedGroup(apns, name, createdBy, notes, isSameBuilding);
  }

  // Collect all APNs from overlapping groups + the new selection
  const mergedApns = new Set<string>(apns);
  const mergedMembers = new Set<string>();
  const mergedAlliances = new Set<string>();
  const mergedBanned: BannedProfile[] = [];
  const mergedMuted = new Set<string>();
  const mergedNotes: string[] = [];
  let earliestCreatedAt = Date.now();

  for (const group of overlappingGroups) {
    for (const apn of group.apns) mergedApns.add(apn);
    for (const m of group.memberProfiles || []) mergedMembers.add(m);
    for (const a of group.alliances || []) mergedAlliances.add(a);
    for (const m of group.mutedProfiles || []) mergedMuted.add(m);
    if (group.bannedProfiles) mergedBanned.push(...group.bannedProfiles);
    if (group.notes) mergedNotes.push(group.notes);
    if (group.createdAt < earliestCreatedAt) earliestCreatedAt = group.createdAt;
  }

  // Remove the overlapping groups
  const overlappingIds = new Set(overlappingGroups.map(g => g.id));
  const remainingGroups = groups.filter(g => !overlappingIds.has(g.id));

  // Generate a name from ALL addresses in the merged group
  const allApnsList = Array.from(mergedApns);

  // Determine isSameBuilding: false if merging multiple groups (they're different buildings)
  const mergedIsSameBuilding = overlappingGroups.length === 1
    ? overlappingGroups[0].isSameBuilding
    : false;

  // Create the merged group
  const mergedGroup: LinkedPropertyGroup = {
    id: generateId(),
    name,
    apns: allApnsList,
    createdBy,
    createdAt: earliestCreatedAt,
    notes: mergedNotes.length > 0 ? mergedNotes.join('; ') : notes,
    isSameBuilding: isSameBuilding ?? mergedIsSameBuilding,
    memberProfiles: mergedMembers.size > 0 ? Array.from(mergedMembers) : undefined,
    alliances: mergedAlliances.size > 0 ? Array.from(mergedAlliances) : undefined,
    mutedProfiles: mergedMuted.size > 0 ? Array.from(mergedMuted) : undefined,
    bannedProfiles: mergedBanned.length > 0 ? mergedBanned : undefined,
  };

  remainingGroups.push(mergedGroup);
  saveLinkedGroups(remainingGroups);

  log.info(`Merged ${overlappingGroups.length} group(s) into "${name}" with ${allApnsList.length} properties`);

  return mergedGroup;
}

export function updateLinkedGroup(id: string, updates: Partial<LinkedPropertyGroup>): void {
  const groups = getLinkedGroups();
  const index = groups.findIndex(g => g.id === id);
  if (index !== -1) {
    groups[index] = { ...groups[index], ...updates };
    saveLinkedGroups(groups);
  }
}

export function deleteLinkedGroup(id: string): void {
  const groups = getLinkedGroups();
  saveLinkedGroups(groups.filter(g => g.id !== id));
}

export function getGroupForApn(apn: string): LinkedPropertyGroup | undefined {
  return getLinkedGroups().find(g => g.apns.includes(apn));
}

export function getLinkedApns(apn: string): string[] {
  const group = getGroupForApn(apn);
  return group ? group.apns : [];
}

// Generate auto-name from first address + count
export function generateGroupName(addresses: string[]): string {
  if (addresses.length === 0) return 'Linked Properties';
  if (addresses.length === 1) return addresses[0];
  return `${addresses[0]} + ${addresses.length - 1} more`;
}

// ============================================================================
// Bloc Name Generation
// ============================================================================

/**
 * Extract street name from an address
 * e.g., "2500 E 2ND ST" → "E 2ND ST"
 * e.g., "123 MAIN AVE APT 4" → "MAIN AVE"
 */
export function extractStreetName(address: string): string {
  if (!address) return '';

  // Normalize to uppercase
  const normalized = address.toUpperCase().trim();

  // Remove unit/apt suffixes first
  const withoutUnit = normalized.replace(/\s+(APT|UNIT|STE|SUITE|#|BLDG|BUILDING)\s*.*$/i, '');

  // Match: street number(s) followed by street name
  // Handles "2500 E 2ND ST", "123-125 MAIN AVE", "100A PINE RD"
  const match = withoutUnit.match(/^[\d\-]+[A-Z]?\s+(.+)$/);

  return match ? match[1].trim() : normalized;
}

/**
 * Format street name for display
 * e.g., "E 2ND ST" → "E 2nd St"
 */
export function formatStreetName(street: string): string {
  if (!street) return '';

  return street
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Keep directionals uppercase for readability
      if (['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].includes(word)) {
        return word.toUpperCase();
      }
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Generate a bloc name from property addresses
 * Uses the most common street name among the addresses
 * e.g., ["2500 E 2ND ST", "2510 E 2ND ST", "100 MAIN AVE"] → "E 2nd St Bloc"
 */
export function generateBlocName(addresses: string[]): string {
  if (!addresses || addresses.length === 0) return 'Unnamed Bloc';
  if (addresses.length === 1) {
    const street = extractStreetName(addresses[0]);
    return street ? `${formatStreetName(street)} Bloc` : 'Unnamed Bloc';
  }

  // Count occurrences of each street
  const streetCounts: Record<string, number> = {};
  addresses.forEach(addr => {
    const street = extractStreetName(addr);
    if (street) {
      streetCounts[street] = (streetCounts[street] || 0) + 1;
    }
  });

  // Find the most common street
  const entries = Object.entries(streetCounts);
  if (entries.length === 0) return 'Unnamed Bloc';

  entries.sort((a, b) => b[1] - a[1]);
  const mostCommonStreet = entries[0][0];

  return `${formatStreetName(mostCommonStreet)} Bloc`;
}

// ============================================================================
// Bloc Formation Validation
// ============================================================================

const MIN_REGISTERED_UNITS = 2;

/**
 * Count the number of registered/interested tenants for a given building (APN)
 * Uses profiles with matching buildingId as indicator of registration
 */
export function getRegisteredTenantsCount(apn: string): number {
  if (typeof window === 'undefined') return 0;

  try {
    // Import here to avoid circular dependency
    const { getStoredProfiles } = require('./profileStorage');
    const profiles = getStoredProfiles();
    return profiles.filter((p: any) => p.buildingId === apn).length;
  } catch {
    return 0;
  }
}

/**
 * Validate that selected buildings have minimum registered tenants for bloc formation voting
 * Returns validation result with list of buildings that don't meet threshold
 */
export function validateBlocFormationRequirement(apns: string[]): {
  valid: boolean;
  shortfalls: { apn: string; current: number; needed: number }[];
} {
  const shortfalls = [];

  for (const apn of apns) {
    const count = getRegisteredTenantsCount(apn);
    if (count < MIN_REGISTERED_UNITS) {
      shortfalls.push({ apn, current: count, needed: MIN_REGISTERED_UNITS });
    }
  }

  return {
    valid: shortfalls.length === 0,
    shortfalls,
  };
}
