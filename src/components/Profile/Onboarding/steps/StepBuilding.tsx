'use client';
import { createLogger } from '@/lib/logger'
const log = createLogger('Onboarding')

import { useState, useEffect, useRef } from 'react';
import type { EnhancedBuilding } from '@/lib/getBuildingsData';
import { searchProperties, USE_SUPABASE } from '@/lib/supabase';
import type { OnboardingFormData } from '../types';

interface StepBuildingProps {
  formData: OnboardingFormData;
  onFormDataChange: (data: OnboardingFormData) => void;
  buildings: EnhancedBuilding[];
}

interface CompressedProperty {
  a: string; // apn
  d: string; // address
  o: string; // owner
  u: number; // units
  v: number | null; // value
  y: number | null; // yearBuilt
  z: string | null; // zoning
  l: string | null; // landUseCode
}

function generateChatSlug(address: string): string {
  return (
    'rstu-' +
    address
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50)
  );
}

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

export function StepBuilding({ formData, onFormDataChange, buildings }: StepBuildingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<EnhancedBuilding[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [allProperties, setAllProperties] = useState<CompressedProperty[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<EnhancedBuilding | null>(null);
  const [unitNumber, setUnitNumber] = useState(formData.unitNumber || '');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load all properties on mount
  useEffect(() => {
    const basePath = '/rstu-connect';
    fetch(`${basePath}/data/all-properties.json`)
      .then((res) => res.json())
      .then((data) => {
        setAllProperties(data.p || []);
      })
      .catch((err) => {
        log.error('Failed to load properties:', err);
      });
  }, []);

  // Load selected building from formData
  useEffect(() => {
    if (formData.buildingId) {
      const building = buildings.find((b) => b.chatSlug === formData.buildingId);
      if (building) {
        setSelectedBuilding(building);
      }
    }
  }, [formData.buildingId, buildings]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      let results: EnhancedBuilding[] = [];

      if (USE_SUPABASE) {
        try {
          const supabaseResults = await searchProperties(query, 15);
          results = supabaseResults.map((r: any) => ({
            apn: r.apn,
            address: r.address,
            owner: r.owner,
            units: r.units,
            value: r.value || 0,
            yearBuilt: r.year_built,
            sqft: r.sqft,
            chatSlug: r.chat_slug || generateChatSlug(r.address),
            propertyName: r.name || undefined,
          } as EnhancedBuilding));

          if (results.length > 0) {
            setSearchResults(results);
            setIsSearching(false);
            setShowResults(true);
            return;
          }
        } catch (err) {
          log.error('Supabase search failed:', err);
        }
      }

      // Fallback to client-side search
      const queryLower = query.toLowerCase();

      // Search featured buildings first
      for (const building of buildings) {
        if (
          building.address.toLowerCase().includes(queryLower) ||
          building.owner.toLowerCase().includes(queryLower) ||
          building.apn.includes(query)
        ) {
          results.push(building);
        }
      }

      // Then search all properties
      const featuredApns = new Set(results.map((b) => b.apn));
      for (const p of allProperties) {
        if (featuredApns.has(p.a)) continue;
        if (
          p.d.toLowerCase().includes(queryLower) ||
          p.o.toLowerCase().includes(queryLower) ||
          p.a.includes(query)
        ) {
          results.push(expandProperty(p));
          if (results.length >= 15) break;
        }
      }

      setSearchResults(results);
      setIsSearching(false);
      setShowResults(true);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, buildings, allProperties]);

  // Handle building selection
  const handleSelectBuilding = (building: EnhancedBuilding) => {
    setSelectedBuilding(building);
    setSearchQuery('');
    setShowResults(false);
    onFormDataChange({
      ...formData,
      buildingId: building.chatSlug,
      buildingAddress: building.address,
    });
  };

  // Handle building deselection
  const handleClearBuilding = () => {
    setSelectedBuilding(null);
    setSearchQuery('');
    setUnitNumber('');
    onFormDataChange({
      ...formData,
      buildingId: undefined,
      buildingAddress: undefined,
      unitNumber: undefined,
    });
  };

  // Update unit number
  const handleUnitChange = (value: string) => {
    setUnitNumber(value);
    onFormDataChange({
      ...formData,
      unitNumber: value || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Your Property (Optional)</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Connect with neighbors in your building. You can skip this and add it later if you prefer.
        </p>
      </div>

      {/* Building search section */}
      {!selectedBuilding && (
        <div className="space-y-3">
          <label htmlFor="building-search" className="block text-sm font-medium text-gray-700">
            Building Search
          </label>

          <div className="relative">
            <input
              id="building-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowResults(true)}
              placeholder="Search by address, owner, or APN..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
            />

            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Search results dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="border border-gray-200 rounded-lg bg-white shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((building) => (
                <button
                  key={building.chatSlug}
                  onClick={() => handleSelectBuilding(building)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <p className="font-medium text-sm text-gray-900">{building.address}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {building.owner} · {building.units} units
                  </p>
                </button>
              ))}
            </div>
          )}

          {showResults && searchQuery && searchResults.length === 0 && !isSearching && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">No buildings found. Try a different search or skip to continue.</p>
            </div>
          )}
        </div>
      )}

      {/* Selected building display */}
      {selectedBuilding && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{selectedBuilding.address}</p>
              <p className="text-xs text-gray-600 mt-1">
                Owner: {selectedBuilding.owner} · {selectedBuilding.units} units
              </p>
            </div>
            <button
              onClick={handleClearBuilding}
              className="flex-shrink-0 ml-3 text-green-700 hover:text-green-900"
              aria-label="Change building"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Unit number input */}
          <div className="mt-4">
            <label htmlFor="unit-number" className="block text-xs font-medium text-gray-700 mb-1">
              Unit Number (optional)
            </label>
            <input
              id="unit-number"
              type="text"
              value={unitNumber}
              onChange={(e) => handleUnitChange(e.target.value)}
              placeholder="e.g., 101, A2"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Info section */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 leading-relaxed">
          <strong>Why connect to your property?</strong> This lets you chat with neighbors, coordinate on
          building issues, and build collective power together.
        </p>
      </div>

      {/* Privacy notice */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-xs text-green-800">
          <strong>Shared with organizers only:</strong> Your property selection is visible only to verified
          organizers and neighbors in your building. Landlords and property managers cannot access this
          information.
        </p>
      </div>
    </div>
  );
}
