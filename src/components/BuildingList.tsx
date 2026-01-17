'use client'

import { useState, useMemo, useEffect, useCallback, useRef, useDeferredValue } from 'react';
import { EnhancedBuilding } from '@/lib/getBuildingsData';
import { BuildingCard } from './BuildingCard';
import { LinkedGroupCard } from './LinkedGroupCard';
import { getFavorites, toggleFavorite } from '@/lib/favoritesStorage';
import { getLinkedGroups, getGroupForApn, type LinkedPropertyGroup } from '@/lib/linkedPropertiesStorage';
import { searchProperties, USE_SUPABASE, PropertySearchResult } from '@/lib/supabase';
import { buildSearchIndex, searchWithIndex, buildPropertyMap } from '@/lib/searchIndex';
import { useLanguage } from '@/contexts/LanguageContext';
import { getHabitabilityScore } from '@/lib/canvassStorage';

// Sort options for the property list
type SortOption =
  | 'units-desc' | 'units-asc'
  | 'priority-desc'
  | 'habitability-asc'
  | 'evictions-desc'
  | 'violations-desc'
  | 'year-asc' | 'year-desc'
  | 'portfolio-desc'
  | 'value-desc' | 'value-per-unit-desc'
  | 'address-asc' | 'owner-asc';

// Filter options for the property list
type FilterOption =
  | 'all'
  | 'corporate'
  | 'individual'
  | 'trust'
  | 'active-organizing'
  | 'emerging'
  | 'has-violations'
  | 'high-evictions'
  | 'favorites';

// Sort option translation keys
const SORT_OPTIONS: { value: SortOption; labelKey: string }[] = [
  { value: 'units-desc', labelKey: 'buildings.sort.mostUnits' },
  { value: 'units-asc', labelKey: 'buildings.sort.fewestUnits' },
  { value: 'priority-desc', labelKey: 'buildings.sort.highestPriority' },
  { value: 'habitability-asc', labelKey: 'buildings.sort.worstConditions' },
  { value: 'evictions-desc', labelKey: 'buildings.sort.mostEvictions' },
  { value: 'violations-desc', labelKey: 'buildings.sort.mostViolations' },
  { value: 'year-asc', labelKey: 'buildings.sort.oldestBuildings' },
  { value: 'year-desc', labelKey: 'buildings.sort.newestBuildings' },
  { value: 'portfolio-desc', labelKey: 'buildings.sort.largestLandlord' },
  { value: 'value-desc', labelKey: 'buildings.sort.highestValue' },
  { value: 'value-per-unit-desc', labelKey: 'buildings.sort.valuePerUnit' },
  { value: 'address-asc', labelKey: 'buildings.sort.addressAZ' },
  { value: 'owner-asc', labelKey: 'buildings.sort.ownerAZ' },
];

// Filter option translation keys
const FILTER_OPTIONS: { value: FilterOption; labelKey: string }[] = [
  { value: 'all', labelKey: 'buildings.filter.all' },
  { value: 'corporate', labelKey: 'buildings.filter.corporate' },
  { value: 'individual', labelKey: 'buildings.filter.individual' },
  { value: 'trust', labelKey: 'buildings.filter.trust' },
  { value: 'active-organizing', labelKey: 'buildings.filter.activeOrganizing' },
  { value: 'emerging', labelKey: 'buildings.filter.emerging' },
  { value: 'has-violations', labelKey: 'buildings.filter.hasViolations' },
  { value: 'high-evictions', labelKey: 'buildings.filter.highEvictions' },
  { value: 'favorites', labelKey: 'buildings.filter.favorites' },
];

// Type for display items - either a building or a linked group
type DisplayItem =
  | { type: 'building'; building: EnhancedBuilding }
  | { type: 'group'; group: LinkedPropertyGroup; buildings: EnhancedBuilding[] };

// Compressed property format from all-properties.json
interface CompressedProperty {
  a: string;  // apn
  d: string;  // address
  o: string;  // owner
  u: number;  // units
  v: number | null;  // value
  y: number | null;  // yearBuilt
  z: string | null;  // zoning
  l: string | null;  // landUseCode
  cs?: string;  // chat_slug (pre-computed for performance)
}

// Generate a chat slug from an address
function generateChatSlug(address: string): string {
  return 'rstu-' + address
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// Expand compressed property to minimal EnhancedBuilding
function expandProperty(p: CompressedProperty): EnhancedBuilding {
  return {
    apn: p.a,
    address: p.d,
    owner: p.o,
    units: p.u,
    value: p.v || 0,
    yearBuilt: p.y,
    sqft: null,
    // Use pre-computed chat slug if available, fallback to generating for backward compatibility
    chatSlug: p.cs || generateChatSlug(p.d),
    zoning: p.z || undefined,
    landUseCode: p.l || undefined,
  } as EnhancedBuilding;
}

interface BuildingListProps {
  buildings: EnhancedBuilding[];
  selectedBuilding: EnhancedBuilding;
  onSelectBuilding: (building: EnhancedBuilding) => void;
  linkingSelection?: EnhancedBuilding[];
  onToggleLinkSelection?: (building: EnhancedBuilding) => void;
  isLinkMode?: boolean;
  onToggleLinkMode?: () => void;
}

// Convert Supabase search result to EnhancedBuilding
function searchResultToBuilding(result: PropertySearchResult): EnhancedBuilding {
  return {
    apn: result.apn,
    address: result.address,
    owner: result.owner,
    units: result.units,
    value: result.value || 0,
    yearBuilt: result.year_built,
    sqft: null,
    chatSlug: result.chat_slug || generateChatSlug(result.address),
    propertyName: result.name || undefined,
    latitude: result.lat || undefined,
    longitude: result.lon || undefined,
  } as EnhancedBuilding;
}

export function BuildingList({ buildings, selectedBuilding, onSelectBuilding, linkingSelection = [], onToggleLinkSelection, isLinkMode = false, onToggleLinkMode }: BuildingListProps) {
  const { t } = useLanguage();

  // Split search state: inputValue is immediate (responsive typing), searchQuery is deferred (for expensive operations)
  const [inputValue, setInputValue] = useState('');
  const searchQuery = useDeferredValue(inputValue);
  const [allProperties, setAllProperties] = useState<CompressedProperty[]>([]);
  const [searchResults, setSearchResults] = useState<EnhancedBuilding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [linkedGroups, setLinkedGroups] = useState<ReturnType<typeof getLinkedGroups>>([]);
  const [sortOption, setSortOption] = useState<SortOption>('units-desc');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const listContainerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search result cache for faster repeated queries (LRU with max 20 entries)
  const searchCacheRef = useRef(new Map<string, EnhancedBuilding[]>());

  // Use ref for favorites in useMemo to avoid recomputing on every toggle
  const favoritesRef = useRef(favorites);
  favoritesRef.current = favorites;

  // Load favorites and linked groups on mount
  useEffect(() => {
    setFavorites(getFavorites());
    setLinkedGroups(getLinkedGroups());
  }, []);

  // Refresh linked groups when linking selection changes
  useEffect(() => {
    if (linkingSelection.length === 0) {
      setLinkedGroups(getLinkedGroups());
    }
  }, [linkingSelection]);

  // Load all properties on mount (fallback for when Supabase is unavailable)
  useEffect(() => {
    const basePath = '/rstu-connect';
    fetch(`${basePath}/data/all-properties.json`)
      .then(res => res.json())
      .then(data => {
        setAllProperties(data.p || []);
        setTotalCount(data.c || 0);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load all properties:', err);
        setIsLoading(false);
      });
  }, []);

  // Pre-build inverted search index for fast client-side fallback search
  const [searchIndex, propertyMap] = useMemo(() => {
    if (allProperties.length === 0) {
      return [new Map<string, Set<string>>(), new Map<string, CompressedProperty>()];
    }
    return [buildSearchIndex(allProperties), buildPropertyMap(allProperties)];
  }, [allProperties]);

  // Debounced Supabase FTS search with caching
  useEffect(() => {
    const query = searchQuery.trim();

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If no query, clear search results
    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Check cache first for instant results
    const cached = searchCacheRef.current.get(query);
    if (cached) {
      setSearchResults(cached);
      setIsSearching(false);
      return;
    }

    // Debounce search by 300ms
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      let results: EnhancedBuilding[] = [];

      if (USE_SUPABASE) {
        // Use Supabase FTS
        const ftsResults = await searchProperties(query, 50);
        if (ftsResults.length > 0) {
          results = ftsResults.map(searchResultToBuilding);
          // Cache the results
          searchCacheRef.current.set(query, results);
          // LRU eviction if cache gets too large
          if (searchCacheRef.current.size > 20) {
            const firstKey = searchCacheRef.current.keys().next().value;
            if (firstKey) searchCacheRef.current.delete(firstKey);
          }
          setSearchResults(results);
          setIsSearching(false);
          return;
        }
      }

      // Fallback to client-side search using inverted index for O(1) lookups
      const queryLower = query.toLowerCase();

      // Search featured buildings first (small array, O(n) is fine)
      for (const building of buildings) {
        if (
          building.address.toLowerCase().includes(queryLower) ||
          building.owner.toLowerCase().includes(queryLower) ||
          building.apn.includes(query)
        ) {
          results.push(building);
        }
      }

      // Use inverted index for all properties search (O(1) vs O(n))
      const featuredApns = new Set(results.map(b => b.apn));
      if (searchIndex.size > 0) {
        // Fast path: use inverted index
        const matchedApns = searchWithIndex(query, searchIndex);
        const matchedApnArray = Array.from(matchedApns);
        for (let i = 0; i < matchedApnArray.length && results.length < 50; i++) {
          const apn = matchedApnArray[i];
          if (featuredApns.has(apn)) continue;
          const p = propertyMap.get(apn);
          if (p) {
            results.push(expandProperty(p));
          }
        }
      } else {
        // Fallback: linear scan (index not yet built)
        for (const p of allProperties) {
          if (featuredApns.has(p.a)) continue;
          if (
            p.d.toLowerCase().includes(queryLower) ||
            p.o.toLowerCase().includes(queryLower) ||
            p.a.includes(query)
          ) {
            results.push(expandProperty(p));
            if (results.length >= 50) break;
          }
        }
      }

      // Cache the results
      searchCacheRef.current.set(query, results);
      // LRU eviction if cache gets too large
      if (searchCacheRef.current.size > 20) {
        const firstKey = searchCacheRef.current.keys().next().value;
        if (firstKey) searchCacheRef.current.delete(firstKey);
      }

      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, buildings, allProperties, searchIndex, propertyMap]);

  // Handle favorite toggle - use functional update to avoid creating new Set reference
  const handleToggleFavorite = useCallback((apn: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Don't select the building
    toggleFavorite(apn); // Persist to localStorage
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(apn)) {
        next.delete(apn);
      } else {
        next.add(apn);
      }
      return next;
    });
  }, []);

  // Get filtered buildings - use search results or featured buildings
  // Note: Uses favoritesRef.current instead of favorites to avoid recomputing on every toggle
  const filteredBuildings = useMemo(() => {
    const query = searchQuery.trim();

    // Use search results if searching, otherwise show featured buildings
    let results = query ? searchResults : [...buildings];

    const favs = favoritesRef.current;

    // Apply filter based on filterOption
    if (filterOption !== 'all') {
      results = results.filter((b) => {
        switch (filterOption) {
          case 'corporate':
            return b.isCorporateOwned === true;
          case 'individual':
            return b.isCorporateOwned === false && b.propertyType !== 'mt';
          case 'trust':
            return b.propertyType === 'mt';
          case 'active-organizing':
            return b.organizingStatus === 'active';
          case 'emerging':
            return b.organizingStatus === 'emerging';
          case 'has-violations':
            return (b.totalViolations || 0) > 0;
          case 'high-evictions':
            return (b.evictionsPer100Units || 0) > 5; // Threshold: >5 evictions per 100 units
          case 'favorites':
            return favs.has(b.apn);
          default:
            return true;
        }
      });
    }

    // Sort results with favorites pinned to top, then by selected sort option
    return results.sort((a, b) => {
      // First priority: always sort favorites to top
      const aFav = favs.has(a.apn);
      const bFav = favs.has(b.apn);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      // Then apply selected sort option
      switch (sortOption) {
        case 'units-desc':
          return (b.units || 0) - (a.units || 0);
        case 'units-asc':
          return (a.units || 0) - (b.units || 0);
        case 'priority-desc':
          return (b.organizingPriority || 0) - (a.organizingPriority || 0);
        case 'habitability-asc': {
          // Worst conditions = lowest score first (nulls last)
          const aData = getHabitabilityScore(a.apn);
          const bData = getHabitabilityScore(b.apn);
          const aScore = aData?.score ?? 101;
          const bScore = bData?.score ?? 101;
          return aScore - bScore;
        }
        case 'evictions-desc':
          return (b.evictionsPer100Units || 0) - (a.evictionsPer100Units || 0);
        case 'violations-desc':
          return (b.totalViolations || 0) - (a.totalViolations || 0);
        case 'year-asc':
          // Oldest first (nulls last)
          return (a.yearBuilt || 9999) - (b.yearBuilt || 9999);
        case 'year-desc':
          // Newest first (nulls last)
          return (b.yearBuilt || 0) - (a.yearBuilt || 0);
        case 'portfolio-desc':
          return (b.portfolioSize || 0) - (a.portfolioSize || 0);
        case 'value-desc':
          return (b.value || 0) - (a.value || 0);
        case 'value-per-unit-desc': {
          const aVpu = a.units > 0 ? (a.value || 0) / a.units : 0;
          const bVpu = b.units > 0 ? (b.value || 0) / b.units : 0;
          return bVpu - aVpu;
        }
        case 'address-asc':
          return a.address.localeCompare(b.address);
        case 'owner-asc':
          return a.owner.localeCompare(b.owner);
        default:
          return 0;
      }
    });
  }, [buildings, searchResults, searchQuery, sortOption, filterOption]);

  // Pre-build apnToGroup map for O(1) lookups instead of O(n) per building
  const apnToGroup = useMemo(() => {
    const map = new Map<string, LinkedPropertyGroup>();
    for (const group of linkedGroups) {
      for (const apn of group.apns) {
        map.set(apn, group);
      }
    }
    return map;
  }, [linkedGroups]);

  // Collapse linked groups into single entries
  // Keep groups in their original position (where the first group member appears)
  const displayItems = useMemo((): DisplayItem[] => {
    const seenGroups = new Set<string>();
    const seenApns = new Set<string>();
    const items: DisplayItem[] = [];

    for (const building of filteredBuildings) {
      // Skip if we've already processed this APN (part of an earlier group)
      if (seenApns.has(building.apn)) continue;

      const group = apnToGroup.get(building.apn);
      if (group) {
        // Skip if we've already added this group
        if (seenGroups.has(group.id)) continue;
        seenGroups.add(group.id);

        // Get all buildings in this group from filtered results
        const groupApnSet = new Set(group.apns);
        const groupBuildings = filteredBuildings.filter(b => groupApnSet.has(b.apn));

        // Mark all group APNs as seen
        group.apns.forEach(apn => seenApns.add(apn));

        // Skip empty groups
        if (groupBuildings.length > 0) {
          items.push({ type: 'group', group, buildings: groupBuildings });
        }
      } else {
        seenApns.add(building.apn);
        items.push({ type: 'building', building });
      }
    }

    return items;
  }, [filteredBuildings, apnToGroup]);

  // Handle unlink - refresh linked groups
  const handleUnlink = useCallback(() => {
    setLinkedGroups(getLinkedGroups());
  }, []);

  // Auto-scroll to selected building when it changes
  useEffect(() => {
    if (!selectedBuilding || !listContainerRef.current) return;

    // Small delay to ensure DOM is updated after render
    const timeoutId = setTimeout(() => {
      if (!listContainerRef.current) return;

      // Find the card element using data attribute (use pre-built map for O(1) lookup)
      const group = apnToGroup.get(selectedBuilding.apn);
      const selector = group
        ? `[data-group-id="${group.id}"]`
        : `[data-apn="${selectedBuilding.apn}"]`;

      const cardEl = listContainerRef.current.querySelector(selector);

      if (cardEl) {
        // Check if card is already visible
        const container = listContainerRef.current;
        const cardRect = cardEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Only scroll if card is not in view
        if (cardRect.top < containerRect.top || cardRect.bottom > containerRect.bottom) {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [selectedBuilding?.apn, apnToGroup]);

  // Determine what count to show
  const hasQuery = inputValue.trim().length > 0;
  const displayCount = hasQuery ? filteredBuildings.length : buildings.length;
  const showingSubset = hasQuery && filteredBuildings.length >= 50;
  const favoriteCount = favorites.size;

  return (
    <div className="h-full border-r border-gray-200 flex flex-col bg-white">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <input
          type="text"
          placeholder={t('buildings.searchFull')}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />

        {/* Sort and Filter Controls */}
        <div className="flex gap-2 mt-2">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="flex-1 text-xs px-2 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-rstu-red"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </select>

          <select
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value as FilterOption)}
            className="flex-1 text-xs px-2 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-rstu-red"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            {isSearching ? (
              <span className="text-gray-400">{t('buildings.searching')}</span>
            ) : hasQuery ? (
              <>
                {displayCount} {displayCount !== 1 ? t('buildings.results') : t('buildings.result')}
                {showingSubset && <span className="text-gray-400"> ({t('buildings.showingFirst', { count: 50 })})</span>}
              </>
            ) : (
              <>
                {displayCount} {displayCount !== 1 ? t('buildings.featuredProperties') : t('buildings.featuredProperty')}
                {favoriteCount > 0 && (
                  <span className="text-yellow-600"> ({favoriteCount} {t('buildings.starred')})</span>
                )}
              </>
            )}
          </p>

          {/* Link Mode Toggle Button - touch-friendly */}
          {onToggleLinkMode && (
            <button
              onClick={onToggleLinkMode}
              className={`flex items-center gap-1 px-2 py-1.5 text-xs rounded transition-colors min-h-[36px] ${
                isLinkMode
                  ? 'bg-rstu-red text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isLinkMode ? 'Exit link mode' : 'Enter link mode to select multiple properties'}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="hidden sm:inline">{isLinkMode ? 'Linking...' : 'Link'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Building List */}
      <div ref={listContainerRef} className="flex-1 overflow-y-auto">
        {isLoading && !USE_SUPABASE ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {t('buildings.loadingData')}
          </div>
        ) : isSearching ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            <div className="animate-pulse">{t('buildings.searchingProperties')}</div>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-gray-200">
              {displayItems.map((item) => {
                if (item.type === 'group') {
                  // Render combined card for linked group
                  const hasAnyFavorite = item.buildings.some(b => favorites.has(b.apn));
                  return (
                    <LinkedGroupCard
                      key={item.group.id}
                      data-group-id={item.group.id}
                      group={item.group}
                      buildings={item.buildings}
                      isSelected={item.buildings.some(b => b.apn === selectedBuilding.apn)}
                      isFavorite={hasAnyFavorite}
                      onClick={() => {
                        const first = item.buildings[0]
                        if (first) onSelectBuilding(first)
                      }}
                      onUnlink={handleUnlink}
                    />
                  );
                }

                // Render regular building card
                const building = item.building;
                return (
                  <BuildingCard
                    key={building.apn}
                    data-apn={building.apn}
                    building={building}
                    isSelected={selectedBuilding.apn === building.apn}
                    isFavorite={favorites.has(building.apn)}
                    isInLinkingSelection={linkingSelection.some(b => b.apn === building.apn)}
                    isLinked={false}
                    isLinkMode={isLinkMode}
                    onClick={() => onSelectBuilding(building)}
                    onToggleFavorite={(e) => handleToggleFavorite(building.apn, e)}
                    onCtrlClick={onToggleLinkSelection ? () => onToggleLinkSelection(building) : undefined}
                  />
                );
              })}
            </ul>

            {filteredBuildings.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">
                {hasQuery ? (
                  <>{t('buildings.noMatch')} &quot;{searchQuery}&quot;</>
                ) : (
                  <>{t('buildings.noBuildings')}</>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
