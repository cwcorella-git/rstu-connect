'use client'
import { createLogger } from '@/lib/utils/logger'
const log = createLogger('PropertyMap')

import { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { EnhancedBuilding } from '@/lib/data/getBuildingsData';
import { getGroupForApn, getLinkedGroups, type LinkedPropertyGroup } from '@/lib/storage/linkedPropertiesStorage';
import { useLanguage } from '@/contexts/LanguageContext';

interface PropertyMapTabProps {
  building: EnhancedBuilding;
  allBuildings?: EnhancedBuilding[];
  onSelectBuilding?: (building: EnhancedBuilding) => void;
  linkingSelection?: EnhancedBuilding[];
  onToggleLinkSelection?: (building: EnhancedBuilding) => void;
}

// Calculate distance in miles between two points
function getDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Get group color matching LinkedGroupCard (blue for merged, orange for linked)
function getGroupColor(group: LinkedPropertyGroup): string {
  return group.isSameBuilding
    ? '#60a5fa'  // blue-400 for merged (same building)
    : '#fb923c'; // orange-400 for linked (different buildings)
}

// Build a nearest-neighbor chain connecting all buildings
// Creates n-1 lines instead of n*(n-1)/2 (complete graph)
function buildNearestNeighborChain(
  buildings: EnhancedBuilding[],
  getDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number
): GeoJSON.Feature<GeoJSON.LineString>[] {
  if (buildings.length < 2) return [];

  // Calculate centroid
  const centroidLat = buildings.reduce((s, b) => s + b.latitude!, 0) / buildings.length;
  const centroidLon = buildings.reduce((s, b) => s + b.longitude!, 0) / buildings.length;

  // Find starting point (closest to centroid)
  let current = buildings.reduce((closest, b) => {
    const distToCentroid = getDistance(b.latitude!, b.longitude!, centroidLat, centroidLon);
    const closestDist = getDistance(closest.latitude!, closest.longitude!, centroidLat, centroidLon);
    return distToCentroid < closestDist ? b : closest;
  });

  const visited = new Set<string>([current.apn]);
  const lines: GeoJSON.Feature<GeoJSON.LineString>[] = [];

  while (visited.size < buildings.length) {
    // Find nearest unvisited
    let nearest: EnhancedBuilding | null = null;
    let nearestDist = Infinity;

    for (const b of buildings) {
      if (visited.has(b.apn)) continue;
      const dist = getDistance(current.latitude!, current.longitude!, b.latitude!, b.longitude!);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = b;
      }
    }

    if (nearest) {
      // Draw line from current to nearest
      lines.push({
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: [
            [current.longitude!, current.latitude!],
            [nearest.longitude!, nearest.latitude!]
          ]
        }
      });
      visited.add(nearest.apn);
      current = nearest;
    }
  }

  return lines;
}

// Reno center coordinates
const RENO_CENTER: [number, number] = [-119.8138, 39.5296];

// Convert buildings to GeoJSON for clustering
function buildingsToGeoJSON(buildings: EnhancedBuilding[]): GeoJSON.FeatureCollection {
  const features = buildings
    .filter(b => b.latitude && b.longitude)
    .map((b, index) => ({
      type: 'Feature' as const,
      id: index,
      properties: {
        apn: b.apn,
        address: b.address,
        units: b.units,
        owner: b.owner,
        propertyName: b.propertyName || '',
        organizingPriority: b.organizingPriority || 0,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [b.longitude!, b.latitude!],
      },
    }));

  return {
    type: 'FeatureCollection',
    features,
  };
}

export function PropertyMapTab({ building, allBuildings = [], onSelectBuilding, linkingSelection = [], onToggleLinkSelection }: PropertyMapTabProps) {
  const { t } = useLanguage();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const nearbyMarkers = useRef<maplibregl.Marker[]>([]);
  const portfolioMarkers = useRef<maplibregl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState(16);
  const [showPortfolio, setShowPortfolio] = useState(true);

  // Get portfolio buildings (same owner, excluding current building)
  const portfolioBuildings = useMemo(() => {
    if (!building.owner || allBuildings.length === 0) return [];

    // Normalize owner name for comparison
    const normalizedOwner = building.owner.toUpperCase().trim().replace(/\s+/g, ' ');

    return allBuildings.filter(b => {
      if (!b.latitude || !b.longitude) return false;
      if (b.apn === building.apn) return false;
      const bOwner = b.owner.toUpperCase().trim().replace(/\s+/g, ' ');
      return bOwner === normalizedOwner;
    });
  }, [building.owner, building.apn, allBuildings]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Check if building has valid coordinates
    const hasCoords = building.latitude && building.longitude &&
      building.latitude > 39 && building.latitude < 40 &&
      building.longitude > -120 && building.longitude < -119;

    if (!hasCoords) {
      setMapError('No valid coordinates for this building');
      return;
    }

    // TypeScript: we've already validated coords above
    const buildingLon = building.longitude!;
    const buildingLat = building.latitude!;

    try {
      // Initialize map with OpenFreeMap tiles (free, no API key)
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [buildingLon, buildingLat],
        zoom: 16,
        pitch: 45,
        bearing: -17.6,
      });

      // Add navigation controls
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      // Add fullscreen control
      map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

      // Add marker for current building (red dot, not pin)
      // Note: main marker is created but will be updated in the effect below
      marker.current = new maplibregl.Marker({ color: '#cc0000' })
        .setLngLat([buildingLon, buildingLat])
        .addTo(map.current);

      // Track zoom level changes for clustering logic
      const handleZoomChange = () => {
        if (map.current) {
          setCurrentZoom(map.current.getZoom());
        }
      };
      map.current.on('zoom', handleZoomChange);

      // Add 3D buildings layer when style loads
      map.current.on('load', () => {
        if (!map.current) return;

        // Add clustering data source (all buildings with clustering enabled)
        try {
          map.current.addSource('all-properties-cluster', {
            type: 'geojson',
            data: buildingsToGeoJSON(allBuildings),
            cluster: true,
            clusterMaxZoom: 14,  // Clustering stops at zoom level 15
            clusterRadius: 50,   // Cluster radius in pixels
          });
        } catch {
          // Silently handle clustering source error
        }

        // Add cluster circle layer (shows at zoom < 15)
        try {
          map.current!.addLayer({
            id: 'cluster-circles',
            type: 'circle',
            source: 'all-properties-cluster',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': '#cc0000',  // RSTU red
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,  // radius for 2-100 properties
                100, 30,  // radius for 100-750 properties
                750, 40   // radius for 750+ properties
              ],
              'circle-opacity': 0.8,
            }
          });
        } catch {
          // Silently handle cluster circles error
        }

        // Add cluster count labels (shows cluster count)
        try {
          map.current!.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'all-properties-cluster',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': 12,
            },
            paint: {
              'text-color': '#fff',
              'text-opacity': 1,
            }
          });
        } catch {
          // Silently handle cluster count error
        }

        // Add unclustered point layer (shows individual properties at high zoom)
        try {
          map.current!.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'all-properties-cluster',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': '#888',  // Gray for unselected
              'circle-radius': 6,
              'circle-stroke-width': 1,
              'circle-stroke-color': '#fff',
              'circle-opacity': 0.7,
            }
          });
        } catch {
          // Silently handle unclustered points error
        }

        // Add click handler for clusters to zoom in
        map.current!.on('click', 'cluster-circles', (e) => {
          if (!map.current) return;
          const features = map.current.querySourceFeatures('all-properties-cluster', {
            filter: ['has', 'point_count']
          });
          const clusteredFeature = features.find(f =>
            f.geometry.type === 'Point' &&
            f.geometry.coordinates[0] === (e.lngLat.lng) &&
            f.geometry.coordinates[1] === (e.lngLat.lat)
          );

          if (clusteredFeature && 'properties' in clusteredFeature) {
            const zoom = map.current.getZoom();
            map.current.easeTo({
              center: e.lngLat,
              zoom: zoom + 2,
              duration: 750
            });
          }
        });

        // Change cursor on cluster hover
        map.current!.on('mouseenter', 'cluster-circles', () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });
        map.current!.on('mouseleave', 'cluster-circles', () => {
          if (map.current) map.current.getCanvas().style.cursor = '';
        });

        // Change cursor on unclustered point hover
        map.current!.on('mouseenter', 'unclustered-point', () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });
        map.current!.on('mouseleave', 'unclustered-point', () => {
          if (map.current) map.current.getCanvas().style.cursor = '';
        });

        // Click handler for unclustered points
        map.current!.on('click', 'unclustered-point', (e) => {
          if (!onSelectBuilding || !e.features || !e.features.length) return;
          const feature = e.features[0];
          if ('properties' in feature && feature.properties) {
            const apn = feature.properties.apn;
            const building = allBuildings.find(b => b.apn === apn);
            if (building) {
              onSelectBuilding(building);
            }
          }
        });

        // OpenFreeMap uses OpenMapTiles source
        // Try to add 3D building extrusion layer
        try {
          map.current.addLayer({
            id: '3d-buildings',
            source: 'openmaptiles',
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 14,
            paint: {
              'fill-extrusion-color': '#d4d4d4',  // Gray for all buildings
              'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'],
                14, 0,
                14.5, ['coalesce', ['get', 'render_height'], ['get', 'height'], 10]
              ],
              'fill-extrusion-base': [
                'interpolate', ['linear'], ['zoom'],
                14, 0,
                14.5, ['coalesce', ['get', 'render_min_height'], 0]
              ],
              'fill-extrusion-opacity': 0.7
            }
          });
        } catch {
          // Silently handle 3D buildings layer error
        }
      });

      map.current.on('error', (e) => {
        log.error('Map error:', e);
        setMapError('Failed to load map tiles');
      });

    } catch (error) {
      log.error('Map initialization error:', error);
      setMapError('Failed to initialize map');
    }

    return () => {
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      if (map.current) {
        // Clean up clustering layers and source
        try {
          if (map.current.getLayer('cluster-circles')) map.current.removeLayer('cluster-circles');
          if (map.current.getLayer('cluster-count')) map.current.removeLayer('cluster-count');
          if (map.current.getLayer('unclustered-point')) map.current.removeLayer('unclustered-point');
          if (map.current.getSource('all-properties-cluster')) map.current.removeSource('all-properties-cluster');
        } catch (e) {
          // Ignore cleanup errors
        }
        map.current.remove();
        map.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only init once

  // Update marker when building changes
  useEffect(() => {
    if (!map.current) return;

    const lat = building.latitude;
    const lon = building.longitude;
    if (!lat || !lon) return;

    // Remove old main marker and create new one with custom element
    if (marker.current) {
      marker.current.remove();
    }

    // Check if current building is in linking selection
    const isInSelection = linkingSelection.some(b => b.apn === building.apn);

    // Determine main marker color:
    // - Default: RSTU red (#cc0000)
    // - If in existing linked group: use group color (blue for merged, orange for linked)
    // - If in linking selection: always red (takes priority)
    const allGroups = getLinkedGroups();
    let mainMarkerColor = '#cc0000'; // Default RSTU red
    const buildingGroup = allGroups.find(g => g.apns.includes(building.apn));
    if (buildingGroup && !isInSelection) {
      mainMarkerColor = getGroupColor(buildingGroup);
    }

    // Create custom dot element for main marker
    // When in linking selection, match the size of other selected markers for consistency
    const mainEl = document.createElement('div');
    mainEl.className = 'main-marker';
    const mainSize = isInSelection ? '14px' : '18px';
    const mainBorder = isInSelection ? '2px' : '3px';
    mainEl.style.cssText = `
      width: ${mainSize}; height: ${mainSize};
      background: ${mainMarkerColor};
      border: ${mainBorder} solid #fff;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      pointer-events: auto;
      user-select: none;
      -webkit-user-select: none;
    `;
    mainEl.title = `${building.propertyName || building.address} (${building.units} units) - Ctrl+click to add to linking selection`;

    // Add click handler for linking - Ctrl/Cmd+click to select
    mainEl.addEventListener('click', (e) => {
      if (onToggleLinkSelection && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();
        onToggleLinkSelection(building);
      }
    });

    marker.current = new maplibregl.Marker({ element: mainEl })
      .setLngLat([lon, lat])
      .addTo(map.current);

    // Clear existing nearby markers
    nearbyMarkers.current.forEach(m => m.remove());
    nearbyMarkers.current = [];

    // Clear existing portfolio markers
    portfolioMarkers.current.forEach(m => m.remove());
    portfolioMarkers.current = [];

    // Helper to safely add/remove map layers
    const safeRemoveLayer = (layerId: string) => {
      try {
        if (map.current?.getLayer(layerId)) map.current.removeLayer(layerId);
      } catch (e) { /* ignore */ }
    };
    const safeRemoveSource = (sourceId: string) => {
      try {
        if (map.current?.getSource(sourceId)) map.current.removeSource(sourceId);
      } catch (e) { /* ignore */ }
    };

    // Clean up existing line layers
    safeRemoveLayer('selection-lines-layer');
    safeRemoveSource('selection-lines');
    safeRemoveLayer('portfolio-lines-layer');
    safeRemoveSource('portfolio-lines');
    // Clean up all group line layers (use allGroups from above)
    allGroups.forEach((_, i) => {
      safeRemoveLayer(`group-lines-layer-${i}`);
      safeRemoveSource(`group-lines-${i}`);
    });

    // Build list of groups with their buildings for drawing
    const groupsWithBuildings: Array<{ group: LinkedPropertyGroup; buildings: EnhancedBuilding[]; color: string }> = [];

    allGroups.forEach((group) => {
      const buildings = group.apns
        .map(apn => allBuildings.find(b => b.apn === apn))
        .filter((b): b is EnhancedBuilding => !!b && !!b.latitude && !!b.longitude);

      if (buildings.length >= 2) {
        groupsWithBuildings.push({
          group,
          buildings,
          color: getGroupColor(group)
        });
      }
    });

    // Draw persistent lines for ALL linked groups (not just current building's group)
    groupsWithBuildings.forEach(({ group, buildings, color }, index) => {
      // Use nearest-neighbor chain instead of complete graph (n-1 lines vs n*(n-1)/2)
      const lines = buildNearestNeighborChain(buildings, getDistanceMiles);

      try {
        map.current!.addSource(`group-lines-${index}`, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: lines }
        });

        map.current!.addLayer({
          id: `group-lines-layer-${index}`,
          type: 'line',
          source: `group-lines-${index}`,
          paint: {
            'line-color': color,
            'line-width': 2,
            'line-dasharray': [3, 2]
          }
        });
      } catch {
        // Silently handle group lines error
      }

      // Add colored markers for group buildings (if not the main building)
      buildings.forEach(b => {
        if (b.apn === building.apn) return; // Skip main building
        const isInSel = linkingSelection.some(s => s.apn === b.apn);
        const el = document.createElement('div');
        el.className = 'linked-marker';
        // Show selection state: brighter/larger when selected
        el.style.cssText = `width: 14px; height: 14px; background: ${isInSel ? '#cc0000' : color}; border: 2px solid #fff; border-radius: 50%; cursor: pointer; pointer-events: auto; user-select: none;`;
        el.title = `${group.name}: ${b.propertyName || b.address} (${b.units} units) - Click to view, hold or Ctrl+click to link`;

        const linkedMarker = new maplibregl.Marker({ element: el })
          .setLngLat([b.longitude!, b.latitude!])
          .addTo(map.current!);

        el.addEventListener('click', (e) => {
          // Ctrl/Cmd+click to add to selection
          if ((e.ctrlKey || e.metaKey) && onToggleLinkSelection) {
            e.preventDefault();
            e.stopPropagation();
            onToggleLinkSelection(b);
            return;
          }
          // Regular click to select building
          if (onSelectBuilding) {
            e.stopPropagation();
            onSelectBuilding(b);
          }
        });

        nearbyMarkers.current.push(linkedMarker);
      });

      // Add centroid marker for each group
      const centroidLat = buildings.reduce((sum, b) => sum + b.latitude!, 0) / buildings.length;
      const centroidLon = buildings.reduce((sum, b) => sum + b.longitude!, 0) / buildings.length;

      const groupEl = document.createElement('div');
      groupEl.className = 'group-centroid-marker';
      groupEl.style.cssText = `
        width: 24px; height: 24px;
        background: ${color};
        border: 2px solid #fff;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      // Use safe DOM manipulation instead of innerHTML to prevent XSS
      const spanEl = document.createElement('span');
      spanEl.style.cssText = 'color:white;font-size:11px;font-weight:bold;';
      spanEl.textContent = String(buildings.length);
      groupEl.appendChild(spanEl);
      groupEl.title = `${group.name} - ${buildings.length} linked properties`;

      const centroidMarker = new maplibregl.Marker({ element: groupEl })
        .setLngLat([centroidLon, centroidLat])
        .addTo(map.current!);

      nearbyMarkers.current.push(centroidMarker);
    });

    // Add nearby property markers (within 0.3 miles) - exclude those in linked groups
    const linkedApns = new Set(allGroups.flatMap(g => g.apns));

    if (allBuildings.length > 0 && onSelectBuilding) {
      const nearby = allBuildings.filter(b => {
        if (!b.latitude || !b.longitude) return false;
        if (b.apn === building.apn) return false;
        if (linkedApns.has(b.apn)) return false; // Skip if already shown as linked
        const dist = getDistanceMiles(lat, lon, b.latitude, b.longitude);
        return dist < 0.3;
      }).slice(0, 50);

      nearby.forEach(b => {
        const isInSel = linkingSelection.some(s => s.apn === b.apn);
        const el = document.createElement('div');
        el.className = 'nearby-marker';
        const nearbySize = isInSel ? '14px' : '12px';
        el.style.cssText = `width: ${nearbySize}; height: ${nearbySize}; background: ${isInSel ? '#cc0000' : '#888'}; border: 2px solid #fff; border-radius: 50%; cursor: pointer; pointer-events: auto; user-select: none;`;
        el.title = `${b.propertyName || b.address} (${b.units} units) - Click to view, hold or Ctrl+click to link`;

        const nearbyMarker = new maplibregl.Marker({ element: el })
          .setLngLat([b.longitude!, b.latitude!])
          .addTo(map.current!);

        el.addEventListener('click', (e) => {
          // Ctrl/Cmd+click to add to selection
          if ((e.ctrlKey || e.metaKey) && onToggleLinkSelection) {
            e.preventDefault();
            e.stopPropagation();
            onToggleLinkSelection(b);
            return;
          }
          // Regular click to select building
          if (onSelectBuilding) {
            e.stopPropagation();
            onSelectBuilding(b);
          }
        });

        nearbyMarkers.current.push(nearbyMarker);
      });
    }

    // Add portfolio property markers (purple) - same landlord's other properties
    if (showPortfolio && portfolioBuildings.length > 0 && onSelectBuilding) {
      // Skip portfolio buildings that are already in linked groups (they have their own markers)
      const portfolioNotLinked = portfolioBuildings.filter(b => !linkedApns.has(b.apn));

      if (portfolioNotLinked.length > 0) {
        // Draw dashed lines connecting portfolio properties using nearest-neighbor
        const portfolioWithCurrent = [building, ...portfolioNotLinked];
        const portfolioLines = buildNearestNeighborChain(portfolioWithCurrent, getDistanceMiles);

        try {
          map.current.addSource('portfolio-lines', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: portfolioLines }
          });

          map.current.addLayer({
            id: 'portfolio-lines-layer',
            type: 'line',
            source: 'portfolio-lines',
            paint: {
              'line-color': '#9333ea', // purple-600
              'line-width': 2,
              'line-dasharray': [4, 4],
              'line-opacity': 0.7
            }
          });
        } catch {
          // Silently handle portfolio lines error
        }

        // Add markers for portfolio properties
        portfolioNotLinked.forEach(b => {
          const el = document.createElement('div');
          el.className = 'portfolio-marker';
          el.style.cssText = `
            width: 12px;
            height: 12px;
            background: #9333ea;
            border: 2px solid #fff;
            border-radius: 50%;
            cursor: pointer;
            pointer-events: auto;
            user-select: none;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          `;
          el.title = `${b.propertyName || b.address} (${b.units} units) - Same landlord`;

          const portfolioMarker = new maplibregl.Marker({ element: el })
            .setLngLat([b.longitude!, b.latitude!])
            .addTo(map.current!);

          el.addEventListener('click', (e) => {
            e.stopPropagation();
            onSelectBuilding(b);
          });

          portfolioMarkers.current.push(portfolioMarker);
        });
      }
    }

    // Draw preview lines for current linking selection (blue dashed)
    if (linkingSelection.length >= 2) {
      const selectionWithCoords = linkingSelection.filter(b => b.latitude && b.longitude);
      if (selectionWithCoords.length >= 2) {
        const selectionLines: GeoJSON.Feature<GeoJSON.LineString>[] = [];
        for (let i = 0; i < selectionWithCoords.length - 1; i++) {
          selectionLines.push({
            type: 'Feature' as const,
            properties: {},
            geometry: {
              type: 'LineString' as const,
              coordinates: [
                [selectionWithCoords[i].longitude!, selectionWithCoords[i].latitude!],
                [selectionWithCoords[i + 1].longitude!, selectionWithCoords[i + 1].latitude!]
              ]
            }
          });
        }

        try {
          map.current.addSource('selection-lines', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: selectionLines }
          });

          map.current.addLayer({
            id: 'selection-lines-layer',
            type: 'line',
            source: 'selection-lines',
            paint: {
              'line-color': '#2563eb',
              'line-width': 3,
              'line-dasharray': [4, 3]
            }
          });
        } catch {
          // Silently handle selection lines error
        }
      }
    }

    // Update clustering source with latest buildings data
    try {
      const source = map.current.getSource('all-properties-cluster') as maplibregl.GeoJSONSource | undefined;
      if (source && source.type === 'geojson') {
        source.setData(buildingsToGeoJSON(allBuildings));
      }
    } catch {
      // Silently handle clustering data update error
    }

    // Fly to new location
    map.current.flyTo({
      center: [lon, lat],
      zoom: 16,
      pitch: 45,
      duration: 1500
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [building.apn, building.latitude, building.longitude, building.address, building.units, allBuildings, onSelectBuilding, linkingSelection, onToggleLinkSelection, showPortfolio, portfolioBuildings]);

  // Show/hide clustering and individual markers based on zoom level
  useEffect(() => {
    if (!map.current) return;

    const showClustering = currentZoom < 15;

    try {
      // Toggle clustering layers visibility
      map.current.setLayoutProperty('cluster-circles', 'visibility', showClustering ? 'visible' : 'none');
      map.current.setLayoutProperty('cluster-count', 'visibility', showClustering ? 'visible' : 'none');
      map.current.setLayoutProperty('unclustered-point', 'visibility', !showClustering ? 'visible' : 'none');
    } catch {
      // Layers may not exist yet if map is still loading
    }
  }, [currentZoom]);

  if (mapError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8 text-center">
        <div className="w-16 h-16 mb-4 text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Map Unavailable</h3>
        <p className="text-sm text-gray-500">{mapError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Map container */}
      <div ref={mapContainer} className="flex-1 min-h-0" />

      {/* Portfolio toggle (if landlord owns multiple properties) */}
      {portfolioBuildings.length > 0 && (
        <div className="px-3 py-2 bg-purple-50 border-t border-purple-200 flex-shrink-0">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPortfolio}
              onChange={(e) => setShowPortfolio(e.target.checked)}
              className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-xs text-purple-700">
              {t('landlord.mapToggle', { count: portfolioBuildings.length })}
            </span>
          </label>
        </div>
      )}

      {/* Info bar */}
      <div className="p-3 bg-white border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">{building.address}</p>
            <p className="text-xs text-gray-500">
              {building.latitude?.toFixed(4)}, {building.longitude?.toFixed(4)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-rstu-red">{building.units} units</p>
            <p className="text-xs text-gray-500">{building.owner}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
