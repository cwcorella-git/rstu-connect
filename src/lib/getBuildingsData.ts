import Database from 'better-sqlite3';
import path from 'path';

export interface Building {
  apn: string;
  address: string;
  owner: string;
  units: number;
  value: number;
  yearBuilt: number | null;
  sqft: number | null;
  matrixRoomId: string;
  matrixAlias: string;
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
