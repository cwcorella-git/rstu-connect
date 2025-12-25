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

// Property type options for filter
const PROPERTY_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'mc', label: 'Multi-Unit (Corporate)' },
  { value: 'mi', label: 'Multi-Unit (Individual)' },
  { value: 'mt', label: 'Multi-Unit (Trust)' },
  { value: 'sc', label: 'SFR (Corporate)' },
  { value: 'st', label: 'SFR (Trust Investment)' },
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

// Management company type (from management-companies.json)
interface ManagementCompany {
  id: string;
  name: string;
  units: number;
  property_count: number;
}

export function BuildingList({ buildings, selectedBuilding, onSelectBuilding, linkingSelection = [], onToggleLinkSelection }: BuildingListProps) {
  const { t } = useLanguage();

  // Split search state: inputValue is immediate (responsive typing), searchQuery is deferred (for expensive operations)
  const [inputValue, setInputValue] = useState('');
  const searchQuery = useDeferredValue(inputValue);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('');
  const [managementCompanyFilter, setManagementCompanyFilter] = useState('');
  const [managementCompanies, setManagementCompanies] = useState<ManagementCompany[]>([]);
  const [allProperties, setAllProperties] = useState<CompressedProperty[]>([]);
  const [searchResults, setSearchResults] = useState<EnhancedBuilding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [linkedGroups, setLinkedGroups] = useState<ReturnType<typeof getLinkedGroups>>([]);
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
    const basePath = process.env.NODE_ENV === 'production' ? '/rstu-connect' : '';
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

    // Load management companies
    fetch(`${basePath}/data/management-companies.json`)
      .then(res => res.json())
      .then(data => {
        // Get top 50 by units for dropdown
        const companies = (data.companies || []).slice(0, 50);
        setManagementCompanies(companies);
      })
      .catch(err => {
        console.error('Failed to load management companies:', err);
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

  // Get filtered buildings - use search results or featured buildings, then apply filters
  // Note: Uses favoritesRef.current instead of favorites to avoid recomputing on every toggle
  const filteredBuildings = useMemo(() => {
    const query = searchQuery.trim();

    // Use search results if searching, otherwise show featured buildings
    let results = query ? searchResults : [...buildings];

    // Apply property type filter
    if (propertyTypeFilter) {
      results = results.filter(b => b.propertyType === propertyTypeFilter);
    }

    // Apply management company filter (also matches portfolios since they're merged)
    if (managementCompanyFilter) {
      results = results.filter(b =>
        b.managementCompanyId === managementCompanyFilter ||
        b.portfolioId === managementCompanyFilter
      );
    }

    // Sort: favorites first (use ref to avoid dependency on favorites state)
    const favs = favoritesRef.current;
    return results.sort((a, b) => {
      const aFav = favs.has(a.apn);
      const bFav = favs.has(b.apn);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });
  }, [buildings, searchResults, searchQuery, propertyTypeFilter, managementCompanyFilter]);

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

        items.push({ type: 'group', group, buildings: groupBuildings });
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
        {/* Filters */}
        <div className="mt-2 flex gap-2">
          <select
            value={propertyTypeFilter}
            onChange={(e) => setPropertyTypeFilter(e.target.value)}
            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rstu-red"
          >
            <option value="">{t('buildings.allTypes')}</option>
            <option value="mc">{t('buildings.multiCorp')}</option>
            <option value="mi">{t('buildings.multiIndiv')}</option>
            <option value="mt">{t('buildings.multiTrust')}</option>
            <option value="sc">{t('buildings.sfrCorp')}</option>
            <option value="st">{t('buildings.sfrTrust')}</option>
          </select>
          <select
            value={managementCompanyFilter}
            onChange={(e) => setManagementCompanyFilter(e.target.value)}
            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">{t('buildings.allManagers')}</option>
            {managementCompanies.map(mc => (
              <option key={mc.id} value={mc.id}>
                {mc.name.slice(0, 20)} ({mc.units.toLocaleString()})
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-500 mt-2">
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
                      onClick={() => onSelectBuilding(item.buildings[0])}
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
