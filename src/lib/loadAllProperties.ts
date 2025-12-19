/**
 * Load all properties from the compressed JSON export.
 * Converts abbreviated keys to full EnhancedBuilding format.
 */

import { EnhancedBuilding } from './getBuildingsData';

// Abbreviated property format from all-properties.json
interface CompressedProperty {
  a: string;      // apn (primary)
  d: string;      // address (primary)
  n?: string;     // name (property marketing name)
  o: string;      // owner
  u: number;      // units
  v: number | null;  // value
  y: number | null;  // yearBuilt
  z: string | null;  // zoning
  l: string | null;  // landUseCode
  t?: number;     // latitude (centroid for multi-parcel)
  g?: number;     // longitude (centroid for multi-parcel)
  apns?: string[];   // all APNs (multi-parcel properties only)
  addrs?: string[];  // all addresses (multi-parcel properties only)
}

interface AllPropertiesData {
  p: CompressedProperty[];
  c: number;
}

/**
 * Generate a chat slug from an address
 */
function generateChatSlug(address: string): string {
  return 'rstu-' + address
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

/**
 * Convert compressed property to EnhancedBuilding format
 */
function expandProperty(p: CompressedProperty): EnhancedBuilding {
  return {
    // Required Building fields
    apn: p.a,
    address: p.d,
    owner: p.o,
    units: p.u,
    value: p.v || 0,
    yearBuilt: p.y,
    sqft: null,
    chatSlug: generateChatSlug(p.d),

    // Extended fields
    propertyName: p.n,
    zoning: p.z || undefined,
    landUseCode: p.l || undefined,
    latitude: p.t,
    longitude: p.g,

    // Multi-parcel fields (condos, large complexes)
    allApns: p.apns,
    allAddresses: p.addrs,

    // Placeholder fields (not in compressed data)
    ownerAddress: undefined,
    assessedLandValue: undefined,
    assessedImprovementValue: undefined,
    valuePerUnit: p.u > 0 && p.v ? Math.round(p.v / p.u) : undefined,
  };
}

/**
 * Load all properties from the JSON file.
 * This is loaded at build time via static import.
 */
export function loadAllProperties(data: AllPropertiesData): EnhancedBuilding[] {
  return data.p.map(expandProperty);
}

/**
 * Get display name for a building (property name or street address)
 */
export function getBuildingDisplayName(building: EnhancedBuilding): string {
  if (building.propertyName) {
    return building.propertyName;
  }
  // Extract street from full address
  const parts = building.address.split(',');
  return parts[0]?.trim() || building.address;
}
