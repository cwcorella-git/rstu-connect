import { EnhancedBuilding } from './getBuildingsData'

/**
 * Type guard: Check if value is a valid EnhancedBuilding
 */
export function isValidBuilding(
  building: unknown
): building is EnhancedBuilding {
  return (
    building !== null &&
    building !== undefined &&
    typeof building === 'object' &&
    'apn' in building &&
    'address' in building &&
    'chatSlug' in building &&
    typeof (building as EnhancedBuilding).apn === 'string' &&
    (building as EnhancedBuilding).apn.length > 0
  )
}

/**
 * Filter array to only valid buildings
 */
export function filterValidBuildings(
  buildings: (EnhancedBuilding | null | undefined)[]
): EnhancedBuilding[] {
  return buildings.filter(isValidBuilding)
}

/**
 * Safely get first building from array
 */
export function getFirstBuilding(
  buildings: (EnhancedBuilding | null | undefined)[]
): EnhancedBuilding | null {
  return buildings.find(isValidBuilding) || null
}
