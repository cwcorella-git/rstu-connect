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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
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
