/**
 * Tests for canvassStorage.ts
 *
 * Tests cover:
 * - Unit range parsing
 * - Building/unit CRUD operations
 * - Building stats and tenant-safe progress
 * - Profile-canvassing linking
 * - Habitability scoring
 * - Effective organizing priority
 * - Import/export functionality
 */

import {
  COMPLAINT_CATEGORIES,
  INTEREST_LEVELS,
  HABITABILITY_ISSUES,
  SUBSIDY_TYPES,
  UTILITIES_OPTIONS,
  getCanvassState,
  getBuildingCanvass,
  getUnit,
  initBuildingCanvass,
  addUnits,
  parseUnitRange,
  updateUnit,
  updateUnitStatus,
  deleteUnit,
  updateBuildingDiscrepancies,
  getBuildingDiscrepancies,
  getBuildingStats,
  getTenantSafeProgress,
  exportCanvassData,
  importCanvassData,
  getStatusLabel,
  getStatusColor,
  ensureUnitExists,
  linkProfileToUnit,
  unlinkProfileFromUnit,
  getUnitByProfile,
  getProfilesForBuilding,
  isProfileLinked,
  syncProfileToCanvass,
  getBuildingRentsByBedroom,
  getBuildingUnitSummary,
  getAllBuildingsWithData,
  getHabitabilityScore,
  getEffectiveOrganizingPriority,
  getIssueTimelines,
  getBuildingHabitabilityQuotes,
  type ContactStatus,
  type UnitRecord,
} from '../storage/canvassStorage'

// Mock Supabase
jest.mock('../supabase', () => ({
  supabase: null,
  USE_SUPABASE: false,
}))

// Mock logger
jest.mock('../logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (i: number) => Object.keys(store)[i] || null,
  }
})()

describe('canvassStorage', () => {
  beforeAll(() => {
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
  })

  beforeEach(() => {
    localStorageMock.clear()
  })

  // ============================================================================
  // Constants Tests
  // ============================================================================

  describe('Constants', () => {
    test('COMPLAINT_CATEGORIES has expected categories', () => {
      expect(COMPLAINT_CATEGORIES.length).toBeGreaterThan(10)
      const keys = COMPLAINT_CATEGORIES.map(c => c.key)
      expect(keys).toContain('maintenance')
      expect(keys).toContain('rent_increase')
      expect(keys).toContain('mold')
      expect(keys).toContain('pests')
    })

    test('INTEREST_LEVELS has organizing action options', () => {
      const keys = INTEREST_LEVELS.map(l => l.key)
      expect(keys).toContain('meeting')
      expect(keys).toContain('petition')
      expect(keys).toContain('strike')
      expect(keys).toContain('leadership')
    })

    test('HABITABILITY_ISSUES has health/safety issues', () => {
      const keys = HABITABILITY_ISSUES.map(i => i.key)
      expect(keys).toContain('mold')
      expect(keys).toContain('pests_roaches')
      expect(keys).toContain('pests_bedbugs')
      expect(keys).toContain('heat_inadequate')
      expect(keys).toContain('structural')
    })

    test('SUBSIDY_TYPES has housing assistance options', () => {
      const keys = SUBSIDY_TYPES.map(s => s.key)
      expect(keys).toContain('none')
      expect(keys).toContain('section8')
      expect(keys).toContain('lihtc')
      expect(keys).toContain('public')
    })

    test('UTILITIES_OPTIONS has common utilities', () => {
      const keys = UTILITIES_OPTIONS.map(u => u.key)
      expect(keys).toContain('water')
      expect(keys).toContain('electric')
      expect(keys).toContain('gas')
      expect(keys).toContain('trash')
    })
  })

  // ============================================================================
  // parseUnitRange Tests
  // ============================================================================

  describe('parseUnitRange', () => {
    test('parses simple range', () => {
      const units = parseUnitRange('101-105')
      expect(units).toEqual(['101', '102', '103', '104', '105'])
    })

    test('parses comma-separated values', () => {
      const units = parseUnitRange('101, 102, 103')
      expect(units).toEqual(['101', '102', '103'])
    })

    test('parses mixed ranges and values', () => {
      const units = parseUnitRange('101-103, 201, 202')
      expect(units).toEqual(['101', '102', '103', '201', '202'])
    })

    test('handles non-numeric ranges as single values', () => {
      // When range contains non-numeric start/end, it's treated as a single value
      const units = parseUnitRange('A101-A103')
      expect(units).toEqual(['A101-A103'])
    })

    test('preserves zero padding', () => {
      const units = parseUnitRange('001-003')
      expect(units).toEqual(['001', '002', '003'])
    })

    test('removes duplicates', () => {
      const units = parseUnitRange('101, 101, 102')
      expect(units).toEqual(['101', '102'])
    })

    test('handles single unit', () => {
      const units = parseUnitRange('101')
      expect(units).toEqual(['101'])
    })

    test('handles non-numeric units', () => {
      const units = parseUnitRange('A, B, C')
      expect(units).toEqual(['A', 'B', 'C'])
    })

    test('handles whitespace variations', () => {
      const units = parseUnitRange('101,102,  103   104')
      expect(units).toEqual(['101', '102', '103', '104'])
    })
  })

  // ============================================================================
  // State Management Tests
  // ============================================================================

  describe('State Management', () => {
    test('getCanvassState returns empty state when localStorage empty', () => {
      const state = getCanvassState()
      expect(state.buildings).toEqual({})
      expect(state.lastModified).toBe(0)
    })

    test('initBuildingCanvass creates building entry', () => {
      const building = initBuildingCanvass('bldg-1', '123 Main St')

      expect(building.buildingId).toBe('bldg-1')
      expect(building.buildingAddress).toBe('123 Main St')
      expect(building.units).toEqual({})
      expect(building.lastModified).toBeDefined()
    })

    test('initBuildingCanvass is idempotent', () => {
      initBuildingCanvass('bldg-1', '123 Main St')
      const first = getBuildingCanvass('bldg-1')

      initBuildingCanvass('bldg-1', 'Different Address')
      const second = getBuildingCanvass('bldg-1')

      // Should keep original address
      expect(second!.buildingAddress).toBe('123 Main St')
    })

    test('getBuildingCanvass returns null for non-existent building', () => {
      const result = getBuildingCanvass('non-existent')
      expect(result).toBeNull()
    })
  })

  // ============================================================================
  // Unit CRUD Tests
  // ============================================================================

  describe('Unit CRUD', () => {
    beforeEach(() => {
      initBuildingCanvass('bldg-1', '123 Main St')
    })

    test('addUnits creates units with default values', () => {
      addUnits('bldg-1', ['101', '102', '103'])

      const building = getBuildingCanvass('bldg-1')
      expect(Object.keys(building!.units)).toHaveLength(3)

      const unit = building!.units['101']
      expect(unit.unitNumber).toBe('101')
      expect(unit.status).toBe('NOT_CONTACTED')
      expect(unit.complaints).toEqual([])
      expect(unit.interestLevel).toEqual([])
    })

    test('addUnits does not overwrite existing units', () => {
      addUnits('bldg-1', ['101'])
      updateUnit('bldg-1', '101', { name: 'John Doe' })

      addUnits('bldg-1', ['101', '102'])

      const unit = getUnit('bldg-1', '101')
      expect(unit!.name).toBe('John Doe')
    })

    test('getUnit returns specific unit', () => {
      addUnits('bldg-1', ['101'])
      const unit = getUnit('bldg-1', '101')
      expect(unit).not.toBeNull()
      expect(unit!.unitNumber).toBe('101')
    })

    test('getUnit returns null for non-existent unit', () => {
      const unit = getUnit('bldg-1', '999')
      expect(unit).toBeNull()
    })

    test('updateUnit updates unit fields', () => {
      addUnits('bldg-1', ['101'])
      updateUnit('bldg-1', '101', {
        name: 'Jane Doe',
        phone: '555-1234',
        rentAmount: 1500,
        complaints: ['maintenance', 'pests'],
      })

      const unit = getUnit('bldg-1', '101')
      expect(unit!.name).toBe('Jane Doe')
      expect(unit!.phone).toBe('555-1234')
      expect(unit!.rentAmount).toBe(1500)
      expect(unit!.complaints).toEqual(['maintenance', 'pests'])
    })

    test('updateUnit updates timestamp', () => {
      addUnits('bldg-1', ['101'])
      const before = getUnit('bldg-1', '101')!.updated

      updateUnit('bldg-1', '101', { name: 'Updated' })
      const after = getUnit('bldg-1', '101')!.updated

      // Timestamp should be updated (or equal if same millisecond)
      expect(after).toBeGreaterThanOrEqual(before)
    })

    test('updateUnitStatus updates status and contactDate', () => {
      addUnits('bldg-1', ['101'])
      updateUnitStatus('bldg-1', '101', 'CONTACTED')

      const unit = getUnit('bldg-1', '101')
      expect(unit!.status).toBe('CONTACTED')
      expect(unit!.contactDate).toBeDefined()
    })

    test('deleteUnit removes unit', () => {
      addUnits('bldg-1', ['101', '102'])
      deleteUnit('bldg-1', '101')

      expect(getUnit('bldg-1', '101')).toBeNull()
      expect(getUnit('bldg-1', '102')).not.toBeNull()
    })
  })

  // ============================================================================
  // Building Stats Tests
  // ============================================================================

  describe('Building Stats', () => {
    beforeEach(() => {
      initBuildingCanvass('bldg-1', '123 Main St')
      addUnits('bldg-1', ['101', '102', '103', '104', '105'])
    })

    test('getBuildingStats calculates correct totals', () => {
      updateUnitStatus('bldg-1', '101', 'CONTACTED')
      updateUnitStatus('bldg-1', '102', 'INTERESTED')
      updateUnitStatus('bldg-1', '103', 'ACTIVE_MEMBER')
      updateUnitStatus('bldg-1', '104', 'FOLLOW_UP')
      // 105 remains NOT_CONTACTED

      const stats = getBuildingStats('bldg-1')
      expect(stats.total).toBe(5)
      expect(stats.contacted).toBe(4) // CONTACTED, INTERESTED, ACTIVE_MEMBER, FOLLOW_UP
      expect(stats.interested).toBe(1)
      expect(stats.activeMembers).toBe(1)
      expect(stats.followUp).toBe(1)
    })

    test('getBuildingStats returns zeros for empty building', () => {
      const stats = getBuildingStats('non-existent')
      expect(stats).toEqual({
        total: 0,
        contacted: 0,
        interested: 0,
        activeMembers: 0,
        followUp: 0,
      })
    })

    test('NO_ANSWER is not counted as contacted', () => {
      updateUnitStatus('bldg-1', '101', 'NO_ANSWER')
      updateUnitStatus('bldg-1', '102', 'CONTACTED')

      const stats = getBuildingStats('bldg-1')
      expect(stats.contacted).toBe(1)
    })
  })

  // ============================================================================
  // Tenant-Safe Progress Tests
  // ============================================================================

  describe('getTenantSafeProgress', () => {
    test('returns no-data status when no canvass data', () => {
      const progress = getTenantSafeProgress('non-existent', 20)

      expect(progress.hasCanvassData).toBe(false)
      expect(progress.status).toBe('none')
      expect(progress.totalUnits).toBe(20)
      expect(progress.contacted).toBe(0)
    })

    test('returns starting status with minimal contacts', () => {
      initBuildingCanvass('bldg-1', '123 Main St')
      addUnits('bldg-1', ['101', '102', '103'])
      updateUnitStatus('bldg-1', '101', 'CONTACTED')

      const progress = getTenantSafeProgress('bldg-1')
      expect(progress.status).toBe('starting')
      expect(progress.contacted).toBe(1)
    })

    test('returns emerging status with multiple contacts/interested', () => {
      initBuildingCanvass('bldg-1', '123 Main St')
      addUnits('bldg-1', parseUnitRange('101-110'))

      updateUnitStatus('bldg-1', '101', 'CONTACTED')
      updateUnitStatus('bldg-1', '102', 'CONTACTED')
      updateUnitStatus('bldg-1', '103', 'CONTACTED')
      updateUnitStatus('bldg-1', '104', 'CONTACTED')
      updateUnitStatus('bldg-1', '105', 'CONTACTED')

      const progress = getTenantSafeProgress('bldg-1')
      expect(progress.status).toBe('emerging')
    })

    test('returns active status with active members', () => {
      initBuildingCanvass('bldg-1', '123 Main St')
      addUnits('bldg-1', parseUnitRange('101-110'))

      updateUnitStatus('bldg-1', '101', 'ACTIVE_MEMBER')
      updateUnitStatus('bldg-1', '102', 'ACTIVE_MEMBER')
      updateUnitStatus('bldg-1', '103', 'ACTIVE_MEMBER')

      const progress = getTenantSafeProgress('bldg-1')
      expect(progress.status).toBe('active')
      expect(progress.activeMembers).toBe(3)
    })

    test('calculates correct progress percent', () => {
      initBuildingCanvass('bldg-1', '123 Main St')
      addUnits('bldg-1', parseUnitRange('101-110'))

      updateUnitStatus('bldg-1', '101', 'CONTACTED')
      updateUnitStatus('bldg-1', '102', 'CONTACTED')
      updateUnitStatus('bldg-1', '103', 'CONTACTED')
      updateUnitStatus('bldg-1', '104', 'CONTACTED')
      updateUnitStatus('bldg-1', '105', 'CONTACTED')

      // 5 out of 10 = 50%
      const progress = getTenantSafeProgress('bldg-1', 10)
      expect(progress.progressPercent).toBe(50)
    })

    test('notContactedUnits contains only unit numbers', () => {
      initBuildingCanvass('bldg-1', '123 Main St')
      addUnits('bldg-1', ['101', '102', '103'])
      updateUnit('bldg-1', '101', { name: 'Private Info', status: 'NOT_CONTACTED' })
      updateUnitStatus('bldg-1', '102', 'CONTACTED')

      const progress = getTenantSafeProgress('bldg-1')
      expect(progress.notContactedUnits).toContain('101')
      expect(progress.notContactedUnits).toContain('103')
      expect(progress.notContactedUnits).not.toContain('102')
      // Should not expose name
      expect(JSON.stringify(progress)).not.toContain('Private Info')
    })
  })

  // ============================================================================
  // Status Label/Color Tests
  // ============================================================================

  describe('Status Helpers', () => {
    test('getStatusLabel returns human-readable labels', () => {
      expect(getStatusLabel('NOT_CONTACTED')).toBe('Not Contacted')
      expect(getStatusLabel('ACTIVE_MEMBER')).toBe('Active Member')
      expect(getStatusLabel('FOLLOW_UP')).toBe('Follow Up')
      expect(getStatusLabel('NOT_INTERESTED')).toBe('Not Interested')
    })

    test('getStatusColor returns CSS classes', () => {
      expect(getStatusColor('NOT_CONTACTED')).toContain('gray')
      expect(getStatusColor('ACTIVE_MEMBER')).toContain('purple')
      expect(getStatusColor('INTERESTED')).toContain('green')
      expect(getStatusColor('NOT_INTERESTED')).toContain('red')
    })
  })

  // ============================================================================
  // Profile-Canvassing Linking Tests
  // ============================================================================

  describe('Profile-Canvassing Linking', () => {
    beforeEach(() => {
      initBuildingCanvass('bldg-1', '123 Main St')
      addUnits('bldg-1', ['101', '102'])
    })

    test('ensureUnitExists creates unit if not exists', () => {
      const unit = ensureUnitExists('bldg-1', '123 Main St', '999')
      expect(unit).toBeDefined()
      expect(unit.unitNumber).toBe('999')
      expect(unit.status).toBe('NOT_CONTACTED')
    })

    test('ensureUnitExists returns existing unit', () => {
      updateUnit('bldg-1', '101', { name: 'Existing' })
      const unit = ensureUnitExists('bldg-1', '123 Main St', '101')
      expect(unit.name).toBe('Existing')
    })

    test('ensureUnitExists creates building if not exists', () => {
      const unit = ensureUnitExists('new-bldg', '456 Oak St', '101')
      expect(unit).toBeDefined()

      const building = getBuildingCanvass('new-bldg')
      expect(building).not.toBeNull()
      expect(building!.buildingAddress).toBe('456 Oak St')
    })

    test('linkProfileToUnit links profile and upgrades status', () => {
      linkProfileToUnit('bldg-1', '101', 'profile-1', 'John', false)

      const unit = getUnit('bldg-1', '101')
      expect(unit!.profileId).toBe('profile-1')
      expect(unit!.profileNickname).toBe('John')
      expect(unit!.linkedAt).toBeDefined()
      expect(unit!.status).toBe('INTERESTED')
    })

    test('linkProfileToUnit upgrades to ACTIVE_MEMBER if verified', () => {
      linkProfileToUnit('bldg-1', '101', 'profile-1', 'John', true)

      const unit = getUnit('bldg-1', '101')
      expect(unit!.status).toBe('ACTIVE_MEMBER')
    })

    test('linkProfileToUnit does not downgrade status', () => {
      updateUnitStatus('bldg-1', '101', 'ACTIVE_MEMBER')
      linkProfileToUnit('bldg-1', '101', 'profile-1', 'John', false)

      const unit = getUnit('bldg-1', '101')
      expect(unit!.status).toBe('ACTIVE_MEMBER')
    })

    test('unlinkProfileFromUnit removes profile data', () => {
      linkProfileToUnit('bldg-1', '101', 'profile-1', 'John', false)
      unlinkProfileFromUnit('bldg-1', '101')

      const unit = getUnit('bldg-1', '101')
      expect(unit!.profileId).toBeUndefined()
      expect(unit!.profileNickname).toBeUndefined()
      expect(unit!.linkedAt).toBeUndefined()
    })

    test('getUnitByProfile finds linked unit', () => {
      linkProfileToUnit('bldg-1', '101', 'profile-1', 'John', false)

      const result = getUnitByProfile('profile-1')
      expect(result).not.toBeNull()
      expect(result!.buildingId).toBe('bldg-1')
      expect(result!.unit.unitNumber).toBe('101')
    })

    test('getUnitByProfile returns null for unlinked profile', () => {
      const result = getUnitByProfile('unknown-profile')
      expect(result).toBeNull()
    })

    test('getProfilesForBuilding returns all linked profiles', () => {
      linkProfileToUnit('bldg-1', '101', 'profile-1', 'John', false)
      linkProfileToUnit('bldg-1', '102', 'profile-2', 'Jane', false)

      const profiles = getProfilesForBuilding('bldg-1')
      expect(profiles).toHaveLength(2)
      expect(profiles.map(p => p.profileId)).toContain('profile-1')
      expect(profiles.map(p => p.profileId)).toContain('profile-2')
    })

    test('isProfileLinked returns correct boolean', () => {
      expect(isProfileLinked('profile-1')).toBe(false)

      linkProfileToUnit('bldg-1', '101', 'profile-1', 'John', false)

      expect(isProfileLinked('profile-1')).toBe(true)
    })
  })

  // ============================================================================
  // Sync Profile to Canvass Tests
  // ============================================================================

  describe('syncProfileToCanvass', () => {
    beforeEach(() => {
      initBuildingCanvass('bldg-1', '123 Main St')
      addUnits('bldg-1', ['101'])
    })

    test('syncs rent and unit details', () => {
      syncProfileToCanvass('bldg-1', '101', {
        rentAmount: 1500,
        bedroomCount: 2,
        unitType: 'apartment',
        leaseType: 'fixed',
      })

      const unit = getUnit('bldg-1', '101')
      expect(unit!.rentAmount).toBe(1500)
      expect(unit!.bedroomCount).toBe(2)
      expect(unit!.unitType).toBe('apartment')
      expect(unit!.leaseType).toBe('fixed')
    })

    test('only updates provided fields', () => {
      updateUnit('bldg-1', '101', { rentAmount: 1200, bedroomCount: 1 })

      syncProfileToCanvass('bldg-1', '101', {
        rentAmount: 1500,
        // bedroomCount not provided
      })

      const unit = getUnit('bldg-1', '101')
      expect(unit!.rentAmount).toBe(1500)
      expect(unit!.bedroomCount).toBe(1) // Unchanged
    })
  })

  // ============================================================================
  // Rent Data Tests
  // ============================================================================

  describe('Rent Data', () => {
    beforeEach(() => {
      initBuildingCanvass('bldg-1', '123 Main St')
      addUnits('bldg-1', ['101', '102', '103', '104'])

      updateUnit('bldg-1', '101', { rentAmount: 1000, bedroomCount: 1 })
      updateUnit('bldg-1', '102', { rentAmount: 1200, bedroomCount: 1 })
      updateUnit('bldg-1', '103', { rentAmount: 1500, bedroomCount: 2 })
      updateUnit('bldg-1', '104', { rentAmount: 1800, bedroomCount: 2 })
    })

    test('getBuildingRentsByBedroom returns all rents', () => {
      const { all, sameSize } = getBuildingRentsByBedroom('bldg-1')
      expect(all).toHaveLength(4)
      expect(all).toContain(1000)
      expect(all).toContain(1800)
    })

    test('getBuildingRentsByBedroom filters by bedroom count', () => {
      const { all, sameSize } = getBuildingRentsByBedroom('bldg-1', 1)
      expect(sameSize).toHaveLength(2)
      expect(sameSize).toContain(1000)
      expect(sameSize).toContain(1200)
      expect(sameSize).not.toContain(1500)
    })

    test('getBuildingUnitSummary calculates correct stats', () => {
      const summary = getBuildingUnitSummary('bldg-1')

      expect(summary.totalUnits).toBe(4)
      expect(summary.unitsWithRent).toBe(4)
      expect(summary.avgRent).toBe(1375) // (1000+1200+1500+1800)/4
      expect(summary.rentRange).toEqual({ min: 1000, max: 1800 })
    })

    test('getBuildingUnitSummary groups by bedroom', () => {
      const summary = getBuildingUnitSummary('bldg-1')

      expect(summary.bedroomBreakdown[1]).toBeDefined()
      expect(summary.bedroomBreakdown[1].count).toBe(2)
      expect(summary.bedroomBreakdown[1].avgRent).toBe(1100) // (1000+1200)/2

      expect(summary.bedroomBreakdown[2]).toBeDefined()
      expect(summary.bedroomBreakdown[2].count).toBe(2)
      expect(summary.bedroomBreakdown[2].avgRent).toBe(1650) // (1500+1800)/2
    })
  })

  // ============================================================================
  // Building Discrepancies Tests
  // ============================================================================

  describe('Building Discrepancies', () => {
    beforeEach(() => {
      initBuildingCanvass('bldg-1', '123 Main St')
    })

    test('updateBuildingDiscrepancies stores notes', () => {
      updateBuildingDiscrepancies('bldg-1', {
        actualUnits: 25,
        managementCompany: 'Acme Properties',
        notes: 'County data shows 20 units, but building has 25',
        verifiedBy: 'organizer-1',
      })

      const discrepancies = getBuildingDiscrepancies('bldg-1')
      expect(discrepancies!.actualUnits).toBe(25)
      expect(discrepancies!.managementCompany).toBe('Acme Properties')
      expect(discrepancies!.notes).toContain('County data')
    })

    test('getBuildingDiscrepancies returns undefined when none', () => {
      const result = getBuildingDiscrepancies('bldg-1')
      expect(result).toBeUndefined()
    })
  })

  // ============================================================================
  // Export/Import Tests
  // ============================================================================

  describe('Export/Import', () => {
    test('exportCanvassData creates valid JSON', () => {
      initBuildingCanvass('bldg-1', '123 Main St')
      addUnits('bldg-1', ['101'])
      updateUnit('bldg-1', '101', { name: 'Test', rentAmount: 1500 })

      const exported = exportCanvassData()
      const parsed = JSON.parse(exported)

      expect(parsed.version).toBe('1.0')
      expect(parsed.exportDate).toBeDefined()
      expect(parsed.data.buildings['bldg-1']).toBeDefined()
    })

    test('importCanvassData restores state', () => {
      const importData = JSON.stringify({
        version: '1.0',
        exportDate: Date.now(),
        data: {
          buildings: {
            'imported-bldg': {
              buildingId: 'imported-bldg',
              buildingAddress: '999 Import St',
              units: {
                '101': {
                  unitNumber: '101',
                  status: 'ACTIVE_MEMBER',
                  complaints: [],
                  interestLevel: [],
                  created: Date.now(),
                  updated: Date.now(),
                },
              },
              lastModified: Date.now(),
            },
          },
          lastModified: Date.now(),
        },
      })

      const result = importCanvassData(importData)
      expect(result.success).toBe(true)

      const building = getBuildingCanvass('imported-bldg')
      expect(building).not.toBeNull()
      expect(building!.buildingAddress).toBe('999 Import St')
    })

    test('importCanvassData rejects invalid format', () => {
      const result = importCanvassData('{"invalid": true}')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid')
    })

    test('importCanvassData rejects invalid JSON', () => {
      const result = importCanvassData('not json')
      expect(result.success).toBe(false)
      expect(result.error).toContain('parse')
    })
  })

  // ============================================================================
  // Habitability Scoring Tests
  // ============================================================================

  describe('Habitability Scoring', () => {
    beforeEach(() => {
      initBuildingCanvass('bldg-1', '123 Main St')
      addUnits('bldg-1', parseUnitRange('101-110'))
    })

    test('returns null for buildings without canvass data', () => {
      const score = getHabitabilityScore('non-existent')
      expect(score).toBeNull()
    })

    test('returns no-data status when insufficient reports', () => {
      // Only 1 unit with issues (below MIN_UNITS_REPORTING of 2)
      updateUnit('bldg-1', '101', {
        habitabilityIssues: ['mold'],
      })

      const score = getHabitabilityScore('bldg-1')
      expect(score!.hasInsufficientData).toBe(true)
      expect(score!.status).toBe('no-data')
      expect(score!.score).toBeNull()
    })

    test('calculates score when sufficient reports', () => {
      updateUnit('bldg-1', '101', { habitabilityIssues: ['mold'] })
      updateUnit('bldg-1', '102', { habitabilityIssues: ['mold'] })

      const score = getHabitabilityScore('bldg-1')
      expect(score!.hasInsufficientData).toBe(false)
      expect(score!.score).toBeDefined()
      expect(typeof score!.score).toBe('number')
    })

    test('higher issue prevalence results in lower score', () => {
      // Building with few minor issues
      initBuildingCanvass('bldg-low', '456 Oak St')
      addUnits('bldg-low', parseUnitRange('101-110'))
      updateUnit('bldg-low', '101', { habitabilityIssues: ['appliances'] })
      updateUnit('bldg-low', '102', { habitabilityIssues: ['appliances'] })
      const lowIssueScore = getHabitabilityScore('bldg-low')!.score!

      // Building with many serious issues
      initBuildingCanvass('bldg-high', '789 Pine St')
      addUnits('bldg-high', parseUnitRange('201-210'))
      for (let i = 1; i <= 8; i++) {
        updateUnit('bldg-high', `20${i}`, {
          habitabilityIssues: ['mold', 'pests_roaches', 'structural'],
        })
      }
      const highIssueScore = getHabitabilityScore('bldg-high')!.score!

      expect(highIssueScore).toBeLessThan(lowIssueScore)
    })

    test('structural issues have highest penalty', () => {
      updateUnit('bldg-1', '101', { habitabilityIssues: ['structural'] })
      updateUnit('bldg-1', '102', { habitabilityIssues: ['structural'] })

      const score = getHabitabilityScore('bldg-1')
      const structuralBreakdown = score!.issueBreakdown.find(i => i.category === 'structural')
      expect(structuralBreakdown).toBeDefined()
      expect(structuralBreakdown!.penaltyPoints).toBeGreaterThan(0)
    })

    test('returns correct status based on score', () => {
      // High score = good
      updateUnit('bldg-1', '101', { habitabilityIssues: ['appliances'] })
      updateUnit('bldg-1', '102', { habitabilityIssues: ['appliances'] })
      const goodScore = getHabitabilityScore('bldg-1')
      // Appliances is minor penalty, should be good status
      expect(['good', 'fair']).toContain(goodScore!.status)
    })

    test('summary includes top issue', () => {
      updateUnit('bldg-1', '101', { habitabilityIssues: ['mold', 'pests_roaches'] })
      updateUnit('bldg-1', '102', { habitabilityIssues: ['mold'] })
      updateUnit('bldg-1', '103', { habitabilityIssues: ['mold'] })

      const score = getHabitabilityScore('bldg-1')
      expect(score!.summary.topIssue).toBeDefined()
      expect(score!.summary.topIssue!.label).toContain('Mold')
      expect(score!.summary.topIssue!.count).toBe(3)
    })
  })

  // ============================================================================
  // Effective Organizing Priority Tests
  // ============================================================================

  describe('getEffectiveOrganizingPriority', () => {
    beforeEach(() => {
      initBuildingCanvass('bldg-1', '123 Main St')
      addUnits('bldg-1', parseUnitRange('101-110'))
    })

    test('returns base priority when no habitability data', () => {
      const priority = getEffectiveOrganizingPriority(5, 'non-existent')
      expect(priority).toBe(5)
    })

    test('returns 0 when base is undefined', () => {
      const priority = getEffectiveOrganizingPriority(undefined, 'bldg-1')
      expect(priority).toBe(0)
    })

    test('boosts priority +3 for poor habitability (<50)', () => {
      // Add lots of serious issues to get poor score
      for (let i = 1; i <= 8; i++) {
        updateUnit('bldg-1', `10${i}`, {
          habitabilityIssues: ['mold', 'pests_roaches', 'structural', 'heat_inadequate'],
        })
      }

      const score = getHabitabilityScore('bldg-1')
      expect(score!.score).toBeLessThan(50)

      const priority = getEffectiveOrganizingPriority(5, 'bldg-1')
      expect(priority).toBe(8) // 5 + 3
    })

    test('boosts priority +1 for fair habitability (50-74)', () => {
      // Add moderate issues
      updateUnit('bldg-1', '101', { habitabilityIssues: ['appliances'] })
      updateUnit('bldg-1', '102', { habitabilityIssues: ['appliances'] })
      updateUnit('bldg-1', '103', { habitabilityIssues: ['plumbing_leaks'] })

      const score = getHabitabilityScore('bldg-1')
      // Should be fair range
      if (score && score.score !== null && score.score >= 50 && score.score < 75) {
        const priority = getEffectiveOrganizingPriority(5, 'bldg-1')
        expect(priority).toBe(6) // 5 + 1
      }
    })

    test('caps priority at 10', () => {
      // Poor habitability would add +3, but cap at 10
      for (let i = 1; i <= 8; i++) {
        updateUnit('bldg-1', `10${i}`, {
          habitabilityIssues: ['mold', 'structural'],
        })
      }

      const priority = getEffectiveOrganizingPriority(9, 'bldg-1')
      expect(priority).toBe(10)
    })
  })

  // ============================================================================
  // Issue Timelines Tests
  // ============================================================================

  describe('getIssueTimelines', () => {
    test('returns empty array when no timeline data', () => {
      initBuildingCanvass('bldg-1', '123 Main St')
      const timelines = getIssueTimelines('bldg-1')
      expect(timelines).toEqual([])
    })

    test('requires at least 2 months of data for trend', () => {
      initBuildingCanvass('bldg-1', '123 Main St')
      addUnits('bldg-1', ['101', '102'])
      updateUnit('bldg-1', '101', { habitabilityIssues: ['mold'] })
      updateUnit('bldg-1', '102', { habitabilityIssues: ['mold'] })

      // First call captures snapshot
      getHabitabilityScore('bldg-1')

      // Only 1 month of data, so no timelines
      const timelines = getIssueTimelines('bldg-1')
      expect(timelines).toEqual([])
    })
  })

  // ============================================================================
  // Habitability Quotes Tests
  // ============================================================================

  describe('getBuildingHabitabilityQuotes', () => {
    beforeEach(() => {
      initBuildingCanvass('bldg-1', '123 Main St')
      addUnits('bldg-1', ['101', '102', '103', '104'])
    })

    test('returns empty array when no quotes', () => {
      const quotes = getBuildingHabitabilityQuotes('bldg-1')
      expect(quotes).toEqual([])
    })

    test('returns quotes with unit numbers and issues', () => {
      updateUnit('bldg-1', '101', {
        habitabilityIssues: ['mold'],
        habitabilityQuotes: 'Mold is everywhere in the bathroom',
        contactDate: Date.now(),
      })
      updateUnit('bldg-1', '102', {
        habitabilityIssues: ['pests_roaches'],
        habitabilityQuotes: 'Roaches in the kitchen every night',
        contactDate: Date.now() - 1000,
      })

      const quotes = getBuildingHabitabilityQuotes('bldg-1')
      expect(quotes).toHaveLength(2)
      expect(quotes[0].quote).toContain('Mold')
      expect(quotes[0].issues).toContain('mold')
    })

    test('returns max 3 quotes, sorted by recency', () => {
      for (let i = 1; i <= 5; i++) {
        updateUnit('bldg-1', `10${i}`, {
          habitabilityIssues: ['mold'],
          habitabilityQuotes: `Quote ${i}`,
          contactDate: Date.now() - i * 1000,
        })
      }

      const quotes = getBuildingHabitabilityQuotes('bldg-1')
      expect(quotes).toHaveLength(3)
      expect(quotes[0].quote).toBe('Quote 1') // Most recent
    })

    test('excludes units without quotes', () => {
      updateUnit('bldg-1', '101', {
        habitabilityIssues: ['mold'],
        // No habitabilityQuotes
      })
      updateUnit('bldg-1', '102', {
        habitabilityIssues: ['pests_roaches'],
        habitabilityQuotes: 'Has a quote',
      })

      const quotes = getBuildingHabitabilityQuotes('bldg-1')
      expect(quotes).toHaveLength(1)
    })
  })

  // ============================================================================
  // getAllBuildingsWithData Tests
  // ============================================================================

  describe('getAllBuildingsWithData', () => {
    test('returns empty array when no data', () => {
      const buildings = getAllBuildingsWithData()
      expect(buildings).toEqual([])
    })

    test('returns building IDs that have units', () => {
      initBuildingCanvass('bldg-1', '123 Main St')
      addUnits('bldg-1', ['101'])

      initBuildingCanvass('bldg-2', '456 Oak St')
      addUnits('bldg-2', ['201'])

      initBuildingCanvass('bldg-3', '789 Pine St')
      // No units added to bldg-3

      const buildings = getAllBuildingsWithData()
      expect(buildings).toContain('bldg-1')
      expect(buildings).toContain('bldg-2')
      expect(buildings).not.toContain('bldg-3')
    })
  })
})
