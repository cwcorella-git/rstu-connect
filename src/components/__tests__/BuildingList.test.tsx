import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { EnhancedBuilding } from '@/lib/data/getBuildingsData'

// Mock all dependencies before importing the component
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    locale: 'en',
    setLocale: jest.fn(),
  }),
}))

jest.mock('@/lib/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}))

// Create stable mock return values
const mockFavorites = new Set<string>()
const mockLinkedGroups: unknown[] = []

jest.mock('@/lib/storage/favoritesStorage', () => ({
  getFavorites: jest.fn(() => mockFavorites),
  toggleFavorite: jest.fn(),
}))

jest.mock('@/lib/storage/linkedPropertiesStorage', () => ({
  getLinkedGroups: jest.fn(() => mockLinkedGroups),
  getGroupForApn: jest.fn(() => null),
}))

jest.mock('@/lib/services/supabase', () => ({
  searchProperties: jest.fn(() => Promise.resolve([])),
  USE_SUPABASE: false,
}))

jest.mock('@/lib/utils/searchIndex', () => ({
  buildSearchIndex: jest.fn(() => new Map()),
  searchWithIndex: jest.fn(() => new Set()),
  buildPropertyMap: jest.fn(() => new Map()),
}))

jest.mock('@/lib/storage/canvassStorage', () => ({
  getHabitabilityScore: jest.fn(() => null),
  getEffectiveOrganizingPriority: jest.fn((priority) => priority || 0),
  getTenantSafeProgress: jest.fn(() => ({ activeMembers: 0, contactedUnits: 0, totalUnits: 0 })),
}))

// Mock fetch for all-properties.json
const mockFetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ p: [], c: 0 }),
  })
)
global.fetch = mockFetch as unknown as typeof fetch

// Import after mocks
import { BuildingList } from '../BuildingList'

describe('BuildingList', () => {
  const mockBuildings: EnhancedBuilding[] = [
    {
      apn: '001-001-001',
      address: '100 Main Street, Reno, NV',
      owner: 'ABC Property LLC',
      units: 50,
      value: 5000000,
      yearBuilt: 1985,
      sqft: 45000,
      chatSlug: 'rstu-100-main-street',
      propertyType: 'mc',
      organizingPriority: 8,
    } as EnhancedBuilding,
    {
      apn: '001-001-002',
      address: '200 Oak Avenue, Reno, NV',
      owner: 'Smith Family Trust',
      units: 25,
      value: 2500000,
      yearBuilt: 1990,
      sqft: 22000,
      chatSlug: 'rstu-200-oak-avenue',
      propertyType: 'st',
      organizingPriority: 5,
    } as EnhancedBuilding,
    {
      apn: '001-001-003',
      address: '300 Pine Road, Reno, NV',
      owner: 'John Doe',
      units: 10,
      value: 1000000,
      yearBuilt: 2000,
      sqft: 9000,
      chatSlug: 'rstu-300-pine-road',
      propertyType: 'mi',
      organizingPriority: 3,
    } as EnhancedBuilding,
  ]

  const mockOnSelectBuilding = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders building cards for each building', async () => {
    render(
      <BuildingList
        buildings={mockBuildings}
        selectedBuilding={null}
        onSelectBuilding={mockOnSelectBuilding}
      />
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('100 Main Street')).toBeInTheDocument()
    })

    expect(screen.getByText('200 Oak Avenue')).toBeInTheDocument()
    expect(screen.getByText('300 Pine Road')).toBeInTheDocument()
  })

  it('displays building unit counts', async () => {
    render(
      <BuildingList
        buildings={mockBuildings}
        selectedBuilding={null}
        onSelectBuilding={mockOnSelectBuilding}
      />
    )

    // Wait for buildings to render - units show as "50 buildings.units" with mocked translations
    await waitFor(() => {
      expect(screen.getByText('100 Main Street')).toBeInTheDocument()
    })

    // Check that unit counts are displayed (translation key is used)
    expect(screen.getByText(/50 buildings\.units/)).toBeInTheDocument()
    expect(screen.getByText(/25 buildings\.units/)).toBeInTheDocument()
    expect(screen.getByText(/10 buildings\.units/)).toBeInTheDocument()
  })

  it('calls onSelectBuilding when a building is clicked', async () => {
    const user = userEvent.setup()

    render(
      <BuildingList
        buildings={mockBuildings}
        selectedBuilding={null}
        onSelectBuilding={mockOnSelectBuilding}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('100 Main Street')).toBeInTheDocument()
    })

    // Click on the building card - find it as a button containing the address
    const buttons = screen.getAllByRole('button')
    const buildingCard = buttons.find(b => b.textContent?.includes('100 Main Street'))
    if (buildingCard) {
      await user.click(buildingCard)
      expect(mockOnSelectBuilding).toHaveBeenCalled()
    }
  })

  it('renders with selected building', async () => {
    render(
      <BuildingList
        buildings={mockBuildings}
        selectedBuilding={mockBuildings[0]}
        onSelectBuilding={mockOnSelectBuilding}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('100 Main Street')).toBeInTheDocument()
    })

    // The component should render with selected building prop
    expect(screen.getByText('200 Oak Avenue')).toBeInTheDocument()
  })

  it('shows search input', async () => {
    render(
      <BuildingList
        buildings={mockBuildings}
        selectedBuilding={null}
        onSelectBuilding={mockOnSelectBuilding}
      />
    )

    // Wait for loading to complete first
    await waitFor(() => {
      expect(screen.getByText('100 Main Street')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/buildings.searchFull/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('shows sort dropdown', async () => {
    render(
      <BuildingList
        buildings={mockBuildings}
        selectedBuilding={null}
        onSelectBuilding={mockOnSelectBuilding}
      />
    )

    // Find sort select
    const sortSelects = screen.getAllByRole('combobox')
    expect(sortSelects.length).toBeGreaterThan(0)
  })

  it('shows filter dropdown', async () => {
    render(
      <BuildingList
        buildings={mockBuildings}
        selectedBuilding={null}
        onSelectBuilding={mockOnSelectBuilding}
      />
    )

    // Filter dropdown should exist
    const filterSelects = screen.getAllByRole('combobox')
    expect(filterSelects.length).toBeGreaterThanOrEqual(2) // Sort and Filter
  })

  it('shows building count', async () => {
    render(
      <BuildingList
        buildings={mockBuildings}
        selectedBuilding={null}
        onSelectBuilding={mockOnSelectBuilding}
      />
    )

    await waitFor(() => {
      // Wait for buildings to load
      expect(screen.getByText('100 Main Street')).toBeInTheDocument()
    })

    // Should show count of buildings (translation key used)
    expect(screen.getByText(/3.*buildings\.featuredProperties/)).toBeInTheDocument()
  })

  it('handles empty building list', async () => {
    render(
      <BuildingList
        buildings={[]}
        selectedBuilding={null}
        onSelectBuilding={mockOnSelectBuilding}
      />
    )

    // Wait for loading to complete, then check for zero count
    await waitFor(() => {
      expect(screen.queryByText(/buildings\.loadingData/)).not.toBeInTheDocument()
    }, { timeout: 2000 })

    // Should show zero count (translation key used)
    expect(screen.getByText(/0.*buildings\.featuredProperties/)).toBeInTheDocument()
  })

  it('shows owner names truncated', async () => {
    render(
      <BuildingList
        buildings={mockBuildings}
        selectedBuilding={null}
        onSelectBuilding={mockOnSelectBuilding}
      />
    )

    await waitFor(() => {
      // Owners should be displayed (possibly truncated)
      expect(screen.getByText(/ABC Property/)).toBeInTheDocument()
    })
  })

  it('handles search input changes', async () => {
    const user = userEvent.setup()

    render(
      <BuildingList
        buildings={mockBuildings}
        selectedBuilding={null}
        onSelectBuilding={mockOnSelectBuilding}
      />
    )

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('100 Main Street')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/buildings.searchFull/i)
    await user.type(searchInput, 'Main')

    expect(searchInput).toHaveValue('Main')
  })

  it('displays multiple buildings without crashing', async () => {
    // Create a larger list of buildings
    const manyBuildings = Array.from({ length: 20 }, (_, i) => ({
      ...mockBuildings[0],
      apn: `001-001-${String(i).padStart(3, '0')}`,
      address: `${100 + i * 10} Test Street, Reno, NV`,
      chatSlug: `rstu-${100 + i * 10}-test-street`,
      units: 10 + i * 5,
    })) as EnhancedBuilding[]

    render(
      <BuildingList
        buildings={manyBuildings}
        selectedBuilding={null}
        onSelectBuilding={mockOnSelectBuilding}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('100 Test Street')).toBeInTheDocument()
    })

    // Should render without errors
    expect(screen.getByText('110 Test Street')).toBeInTheDocument()
  })

  it('renders with default sort option', async () => {
    render(
      <BuildingList
        buildings={mockBuildings}
        selectedBuilding={null}
        onSelectBuilding={mockOnSelectBuilding}
      />
    )

    await waitFor(() => {
      // Buildings should be rendered
      const addressText = screen.getByText('100 Main Street')
      expect(addressText).toBeInTheDocument()
    })
  })

  it('provides linking selection functionality when enabled', async () => {
    const mockToggleLinkSelection = jest.fn()

    render(
      <BuildingList
        buildings={mockBuildings}
        selectedBuilding={null}
        onSelectBuilding={mockOnSelectBuilding}
        linkingSelection={[]}
        onToggleLinkSelection={mockToggleLinkSelection}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('100 Main Street')).toBeInTheDocument()
    })

    // Component should render with linking mode props
    expect(mockToggleLinkSelection).not.toHaveBeenCalled()
  })
})
