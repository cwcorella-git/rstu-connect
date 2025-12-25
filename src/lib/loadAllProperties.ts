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
  ld?: string;    // landUseDescription (more readable)
  sf?: number;    // sqft (building square feet)
  nb?: string;    // neighborhood
  ac?: number;    // acres
  lv?: number;    // landValue (assessed land value)
  iv?: number;    // improvementValue (assessed improvement value)
  t?: number;     // latitude (centroid for multi-parcel)
  g?: number;     // longitude (centroid for multi-parcel)
  pt?: string;    // property type: mc, mi, mt (multi-unit), sc, st (single-family)
  mc?: string;    // management_company_id (extracted from owner_address C/O or ATTN)
  pf?: string;    // portfolio_id (address-based, 2+ owners at same mailing address)
  cs?: string;    // chat_slug (pre-computed for performance)
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
    sqft: p.sf || null,
    // Use pre-computed chat slug if available, fallback to generating for backward compatibility
    chatSlug: p.cs || generateChatSlug(p.d),

    // Extended fields
    propertyName: p.n,
    zoning: p.z || undefined,
    landUseCode: p.l || undefined,
    landUseDescription: p.ld || undefined,
    neighborhood: p.nb || undefined,
    acres: p.ac || undefined,
    latitude: p.t,
    longitude: p.g,

    // Multi-parcel fields (condos, large complexes)
    allApns: p.apns,
    allAddresses: p.addrs,

    // Property type: mc, mi, mt (multi-unit), sc, st (single-family)
    propertyType: p.pt as EnhancedBuilding['propertyType'],

    // Management company (extracted from owner_address C/O or ATTN patterns)
    managementCompanyId: p.mc || undefined,

    // Portfolio ID (address-based, 2+ owners at same mailing address)
    portfolioId: p.pf || undefined,

    // Assessed values
    ownerAddress: undefined,
    assessedLandValue: p.lv || undefined,
    assessedImprovementValue: p.iv || undefined,
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
