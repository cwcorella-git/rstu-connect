import Database from 'better-sqlite3';
import path from 'path';

// Base building interface (minimal required fields)
export interface Building {
  apn: string;
  address: string;
  owner: string;
  units: number;
  value: number;
  yearBuilt: number | null;
  sqft: number | null;
  chatSlug: string;
}

// Extended building interface with all available intelligence
export interface EnhancedBuilding extends Building {
  // === DISPLAY NAME ===
  propertyName?: string;  // Official marketing name (e.g., "The Montage")

  // === FROM main_properties.db ===
  ownerAddress?: string;
  legalDescription?: string;
  landUseCode?: string;
  landUseDescription?: string;
  zoning?: string;
  acres?: number;
  assessedLandValue?: number;
  assessedImprovementValue?: number;
  neighborhood?: string;
  schoolDistrict?: string;
  latitude?: number;
  longitude?: number;

  // === FROM landlord_accountability.db ===
  habitabilityScore?: number;
  tenantRightsScore?: number;
  legalComplianceScore?: number;
  overallAccountabilityScore?: number;
  worstLandlordRanking?: number;
  totalViolations?: number;
  criticalViolations?: number;
  openViolations?: number;
  avgDaysToResolution?: number;
  violationsPerProperty?: number;
  evictionsPer100Units?: number;
  tenantDefenseRate?: number;
  evictionSuccessRate?: number;
  mediaAttentionCount?: number;

  // === FROM property_intelligence.db ===
  organizingPriority?: number;
  organizingStatus?: string;
  isCorporateOwned?: boolean;
  portfolioSize?: number;
  tenantTurnoverPattern?: string;
  lastContactDate?: string;
  campaignNotes?: string;
  entityType?: string;

  // === FROM organizing_targets.db ===
  estimatedTenants?: number;
  landlordPortfolioSize?: number;

  // === CALCULATED FIELDS ===
  estimatedMortgageStatus?: 'likely_paid' | 'likely_active' | 'unknown';
  estimatedMortgageYear?: number;
  valuePerUnit?: number;

  // === MULTI-PARCEL PROPERTIES ===
  // For condo-style properties with multiple APNs (e.g., The Montage has 28 parcels)
  allApns?: string[];      // All APNs if multi-parcel
  allAddresses?: string[]; // All addresses if multi-parcel
}

/**
 * Fetch all buildings that have Matrix chat rooms assigned
 * This runs at build time only (server-side)
 */
export function getBuildingsWithMatrixRooms(): Building[] {
  // Database path relative to project root
  const dbPath = path.join(process.cwd(), 'data', 'databases', 'main_properties.db');

  const db = new Database(dbPath, { readonly: true });

  const buildings = db.prepare(`
    SELECT
      apn,
      property_address as address,
      owner_name as owner,
      units,
      total_assessed_value as value,
      year_built as yearBuilt,
      building_square_feet as sqft,
      matrix_room_id as matrixRoomId,
      matrix_room_alias as matrixAlias
    FROM parcels
    WHERE matrix_room_id IS NOT NULL
      AND matrix_room_id != ''
    ORDER BY units DESC
  `).all() as Building[];

  db.close();

  return buildings;
}

/**
 * Get a single building by APN
 */
export function getBuildingByApn(apn: string): Building | null {
  const dbPath = path.join(process.cwd(), 'data', 'databases', 'main_properties.db');
  const db = new Database(dbPath, { readonly: true });

  const building = db.prepare(`
    SELECT
      apn,
      property_address as address,
      owner_name as owner,
      units,
      total_assessed_value as value,
      year_built as yearBuilt,
      building_square_feet as sqft,
      matrix_room_id as matrixRoomId,
      matrix_room_alias as matrixAlias
    FROM parcels
    WHERE apn = ?
  `).get(apn) as Building | undefined;

  db.close();

  return building || null;
}
