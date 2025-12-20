'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { EnhancedBuilding } from '@/lib/getBuildingsData';
import { BuildingCard } from './BuildingCard';
import { LinkedGroupCard } from './LinkedGroupCard';
import { getFavorites, toggleFavorite } from '@/lib/favoritesStorage';
import { getLinkedGroups, getGroupForApn, type LinkedPropertyGroup } from '@/lib/linkedPropertiesStorage';

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
    chatSlug: generateChatSlug(p.d),
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

export function BuildingList({ buildings, selectedBuilding, onSelectBuilding, linkingSelection = [], onToggleLinkSelection }: BuildingListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [allProperties, setAllProperties] = useState<CompressedProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [linkedGroups, setLinkedGroups] = useState<ReturnType<typeof getLinkedGroups>>([]);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLLIElement>>(new Map());

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

  // Load all properties on mount
  useEffect(() => {
    fetch('/data/all-properties.json')
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

  // Handle favorite toggle
  const handleToggleFavorite = useCallback((apn: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Don't select the building
    toggleFavorite(apn);
    setFavorites(getFavorites());
  }, []);

  // Filter and sort buildings - favorites first
  const filteredBuildings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let results: EnhancedBuilding[];

    if (!query) {
      // No search - show featured buildings
      results = [...buildings];
    } else {
      // Search all properties
      results = [];

      // First, check featured buildings (they have full data)
      for (const building of buildings) {
        if (
          building.address.toLowerCase().includes(query) ||
          building.owner.toLowerCase().includes(query) ||
          building.apn.includes(query)
        ) {
          results.push(building);
        }
      }

      // Then search all properties (skip if already in results)
      const featuredApns = new Set(results.map(b => b.apn));

      for (const p of allProperties) {
        if (featuredApns.has(p.a)) continue;
        if (
          p.d.toLowerCase().includes(query) ||
          p.o.toLowerCase().includes(query) ||
          p.a.includes(query)
        ) {
          results.push(expandProperty(p));
          if (results.length >= 50) break; // Limit results
        }
      }
    }

    // Sort: favorites first, then linked groups together, then original order
    // Create a map of APN to group ID for sorting
    const apnToGroupId = new Map<string, string>();
    linkedGroups.forEach(group => {
      group.apns.forEach(apn => apnToGroupId.set(apn, group.id));
    });

    return results.sort((a, b) => {
      // Favorites first
      const aFav = favorites.has(a.apn);
      const bFav = favorites.has(b.apn);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      // Then group linked properties together
      const aGroup = apnToGroupId.get(a.apn);
      const bGroup = apnToGroupId.get(b.apn);
      if (aGroup && bGroup && aGroup === bGroup) return 0; // Same group, keep together
      if (aGroup && !bGroup) return -1; // Linked before unlinked
      if (!aGroup && bGroup) return 1;
      if (aGroup && bGroup) return aGroup.localeCompare(bGroup); // Different groups, sort by group ID

      return 0;
    });
  }, [buildings, allProperties, searchQuery, favorites, linkedGroups]);

  // Collapse linked groups into single entries
  // Keep groups in their original position (where the first group member appears)
  const displayItems = useMemo((): DisplayItem[] => {
    const seenGroups = new Set<string>();
    const seenApns = new Set<string>();
    const items: DisplayItem[] = [];

    for (const building of filteredBuildings) {
      // Skip if we've already processed this APN (part of an earlier group)
      if (seenApns.has(building.apn)) continue;

      const group = getGroupForApn(building.apn);
      if (group) {
        // Skip if we've already added this group
        if (seenGroups.has(group.id)) continue;
        seenGroups.add(group.id);

        // Get all buildings in this group from filtered results
        const groupBuildings = filteredBuildings.filter(b => group.apns.includes(b.apn));

        // Mark all group APNs as seen
        group.apns.forEach(apn => seenApns.add(apn));

        items.push({ type: 'group', group, buildings: groupBuildings });
      } else {
        seenApns.add(building.apn);
        items.push({ type: 'building', building });
      }
    }

    return items;
  }, [filteredBuildings, linkedGroups]);

  // Handle unlink - refresh linked groups
  const handleUnlink = useCallback(() => {
    setLinkedGroups(getLinkedGroups());
  }, []);

  // Auto-scroll to selected building when it changes
  useEffect(() => {
    if (!selectedBuilding) return;

    // Find the card ref - could be the building's APN or a group ID containing it
    const group = getGroupForApn(selectedBuilding.apn);
    const refKey = group ? group.id : selectedBuilding.apn;
    const cardEl = cardRefs.current.get(refKey);

    if (cardEl && listContainerRef.current) {
      // Check if card is already visible
      const container = listContainerRef.current;
      const cardRect = cardEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Only scroll if card is not in view
      if (cardRect.top < containerRect.top || cardRect.bottom > containerRect.bottom) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedBuilding?.apn]);

  // Determine what count to show
  const isSearching = searchQuery.trim().length > 0;
  const displayCount = isSearching ? filteredBuildings.length : buildings.length;
  const showingSubset = isSearching && filteredBuildings.length >= 50;
  const favoriteCount = favorites.size;

  return (
    <div className="h-full border-r border-gray-200 flex flex-col bg-white">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <input
          type="text"
          placeholder="Search all properties by address, owner, or APN..."
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">
            {isSearching ? (
              <>
                {displayCount} result{displayCount !== 1 ? 's' : ''}
                {showingSubset && <span className="text-gray-400"> (showing first 50)</span>}
              </>
            ) : (
              <>
                {displayCount} featured building{displayCount !== 1 ? 's' : ''}
                {favoriteCount > 0 && (
                  <span className="text-yellow-600"> ({favoriteCount} starred)</span>
                )}
              </>
            )}
          </p>
          {!isLoading && totalCount > 0 && (
            <p className="text-xs text-gray-400">
              {totalCount.toLocaleString()} total searchable
            </p>
          )}
        </div>
      </div>

      {/* Building List */}
      <div ref={listContainerRef} className="flex-1 overflow-y-auto">
        {isLoading && isSearching ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            Loading property data...
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
                      ref={(el) => {
                        if (el) cardRefs.current.set(item.group.id, el);
                        else cardRefs.current.delete(item.group.id);
                      }}
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
                    ref={(el) => {
                      if (el) cardRefs.current.set(building.apn, el);
                      else cardRefs.current.delete(building.apn);
                    }}
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
                {isSearching ? (
                  <>No properties match &quot;{searchQuery}&quot;</>
                ) : (
                  <>No buildings available.</>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
