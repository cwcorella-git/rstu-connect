'use client'

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { EnhancedBuilding } from '@/lib/getBuildingsData';

interface PropertyMapTabProps {
  building: EnhancedBuilding;
  allBuildings?: EnhancedBuilding[];
  onSelectBuilding?: (building: EnhancedBuilding) => void;
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

// Reno center coordinates
const RENO_CENTER: [number, number] = [-119.8138, 39.5296];

export function PropertyMapTab({ building, allBuildings = [], onSelectBuilding }: PropertyMapTabProps) {
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

      // Add marker for current building
      marker.current = new maplibregl.Marker({ color: '#cc0000' })
        .setLngLat([buildingLon, buildingLat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 })
            .setHTML(`
              <div style="padding: 8px;">
                <strong>${building.address}</strong><br/>
                <span style="color: #666; font-size: 12px;">${building.units} units</span>
              </div>
            `)
        )
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

    // Update marker position
    if (marker.current) {
      marker.current.setLngLat([lon, lat]);
      marker.current.setPopup(
        new maplibregl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 8px;">
              <strong>${building.address}</strong><br/>
              <span style="color: #666; font-size: 12px;">${building.units} units</span>
            </div>
          `)
      );
    }

    // Fly to new location
    map.current.flyTo({
      center: [lon, lat],
      zoom: 16,
      pitch: 45,
      duration: 1500
    });
  }, [building.apn, building.latitude, building.longitude, building.address, building.units]);

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
