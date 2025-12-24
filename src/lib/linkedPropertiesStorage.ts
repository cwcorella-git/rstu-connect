'use client';

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

function generateId(): string {
  return `lp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
    console.error('[LinkedPropertiesStorage] Failed to save - storage quota may be exceeded:', e);
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
// Block Name Generation
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
 * Generate a block name from property addresses
 * Uses the most common street name among the addresses
 * e.g., ["2500 E 2ND ST", "2510 E 2ND ST", "100 MAIN AVE"] → "E 2nd St Block"
 */
export function generateBlockName(addresses: string[]): string {
  if (!addresses || addresses.length === 0) return 'Unnamed Block';
  if (addresses.length === 1) {
    const street = extractStreetName(addresses[0]);
    return street ? `${formatStreetName(street)} Block` : 'Unnamed Block';
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
  if (entries.length === 0) return 'Unnamed Block';

  entries.sort((a, b) => b[1] - a[1]);
  const mostCommonStreet = entries[0][0];

  return `${formatStreetName(mostCommonStreet)} Block`;
}
