'use client'

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { EnhancedBuilding } from '@/lib/getBuildingsData';
import { getGroupForApn, getLinkedGroups, type LinkedPropertyGroup } from '@/lib/linkedPropertiesStorage';

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

export function PropertyMapTab({ building, allBuildings = [], onSelectBuilding, linkingSelection = [], onToggleLinkSelection }: PropertyMapTabProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const nearbyMarkers = useRef<maplibregl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

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

      // Add 3D buildings layer when style loads
      map.current.on('load', () => {
        if (!map.current) return;

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
        } catch (e) {
          console.log('Could not add 3D buildings layer:', e);
        }
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Failed to load map tiles');
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError('Failed to initialize map');
    }

    return () => {
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
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

    // Check if current building is part of a linked group and get its color
    const allGroups = getLinkedGroups();
    let mainMarkerColor = '#374151'; // Default dark gray
    const buildingGroup = allGroups.find(g => g.apns.includes(building.apn));
    if (buildingGroup) {
      mainMarkerColor = getGroupColor(buildingGroup);
    }
    // Override with red if in linking selection
    if (isInSelection) {
      mainMarkerColor = '#cc0000';
    }

    // Create custom dot element for main marker (larger than nearby markers)
    const mainEl = document.createElement('div');
    mainEl.className = 'main-marker';
    mainEl.style.cssText = `
      width: 18px; height: 18px;
      background: ${mainMarkerColor};
      border: 3px solid #fff;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    `;
    mainEl.title = `${building.propertyName || building.address} (${building.units} units) - Ctrl+click (or Cmd+click) to add to linking selection`;

    // Add click handler for Ctrl+click (or Cmd+click on Mac) linking
    mainEl.addEventListener('click', (e) => {
      e.stopPropagation();
      // Support both Ctrl (Windows/Linux) and Cmd (Mac)
      if ((e.ctrlKey || e.metaKey) && onToggleLinkSelection) {
        onToggleLinkSelection(building);
      }
    });

    marker.current = new maplibregl.Marker({ element: mainEl })
      .setLngLat([lon, lat])
      .addTo(map.current);

    // Clear existing nearby markers
    nearbyMarkers.current.forEach(m => m.remove());
    nearbyMarkers.current = [];

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
      } catch (e) {
        console.log('Could not add group lines:', e);
      }

      // Add colored markers for group buildings (if not the main building)
      buildings.forEach(b => {
        if (b.apn === building.apn) return; // Skip main building
        const isInSel = linkingSelection.some(s => s.apn === b.apn);
        const el = document.createElement('div');
        el.className = 'linked-marker';
        // Show selection state: brighter/larger when selected
        el.style.cssText = `width: ${isInSel ? '16px' : '14px'}; height: ${isInSel ? '16px' : '14px'}; background: ${isInSel ? '#cc0000' : color}; border: 2px solid #fff; border-radius: 50%; cursor: pointer;`;
        el.title = `${group.name}: ${b.propertyName || b.address} (${b.units} units) - Click to view, Ctrl/Cmd+click to link`;

        const linkedMarker = new maplibregl.Marker({ element: el })
          .setLngLat([b.longitude!, b.latitude!])
          .addTo(map.current!);

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          // Support both Ctrl (Windows/Linux) and Cmd (Mac)
          if ((e.ctrlKey || e.metaKey) && onToggleLinkSelection) {
            onToggleLinkSelection(b);
          } else if (onSelectBuilding) {
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
      groupEl.innerHTML = `<span style="color:white;font-size:11px;font-weight:bold;">${buildings.length}</span>`;
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
        el.style.cssText = `width: 12px; height: 12px; background: ${isInSel ? '#cc0000' : '#888'}; border: 2px solid #fff; border-radius: 50%; cursor: pointer;`;
        el.title = `${b.propertyName || b.address} (${b.units} units) - Click to view, Ctrl/Cmd+click to link`;

        const nearbyMarker = new maplibregl.Marker({ element: el })
          .setLngLat([b.longitude!, b.latitude!])
          .addTo(map.current!);

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          // Support both Ctrl (Windows/Linux) and Cmd (Mac)
          if ((e.ctrlKey || e.metaKey) && onToggleLinkSelection) {
            onToggleLinkSelection(b);
          } else if (onSelectBuilding) {
            onSelectBuilding(b);
          }
        });

        nearbyMarkers.current.push(nearbyMarker);
      });
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
        } catch (e) {
          console.log('Could not add selection lines:', e);
        }
      }
    }

    // Fly to new location
    map.current.flyTo({
      center: [lon, lat],
      zoom: 16,
      pitch: 45,
      duration: 1500
    });
  }, [building.apn, building.latitude, building.longitude, building.address, building.units, allBuildings, onSelectBuilding, linkingSelection, onToggleLinkSelection]);

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
