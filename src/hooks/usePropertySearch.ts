'use client'
import { createLogger } from '@/lib/logger'
const log = createLogger('PropertySearch')

import { useState, useEffect, useRef, useMemo, useDeferredValue } from 'react'
import { EnhancedBuilding } from '@/lib/getBuildingsData'
import { searchProperties, USE_SUPABASE, PropertySearchResult } from '@/lib/supabase'
import { buildSearchIndex, searchWithIndex, buildPropertyMap } from '@/lib/searchIndex'

// Compressed property format from all-properties.json
interface CompressedProperty {
  a: string   // apn
  d: string   // address
  o: string   // owner
  u: number   // units
  v: number | null  // value
  y: number | null  // yearBuilt
  z: string | null  // zoning
  l: string | null  // landUseCode
  cs?: string  // chat_slug
}

// Generate a chat slug from an address
function generateChatSlug(address: string): string {
  return 'rstu-' + address
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)
}

// Expand compressed property to EnhancedBuilding
function expandProperty(p: CompressedProperty): EnhancedBuilding {
  return {
    apn: p.a,
    address: p.d,
    owner: p.o,
    units: p.u,
    value: p.v || 0,
    yearBuilt: p.y,
    sqft: null,
    chatSlug: p.cs || generateChatSlug(p.d),
    zoning: p.z || undefined,
    landUseCode: p.l || undefined,
  } as EnhancedBuilding
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
  } as EnhancedBuilding
}

interface UsePropertySearchReturn {
  // Search query
  query: string
  setQuery: (query: string) => void

  // Results
  results: EnhancedBuilding[]
  isLoading: boolean
  isSearching: boolean

  // Total property count
  totalCount: number

  // All properties (for when no search is active)
  allProperties: EnhancedBuilding[]
}

export function usePropertySearch(maxResults = 50): UsePropertySearchReturn {
  // Input value is immediate, search query is deferred
  const [inputValue, setInputValue] = useState('')
  const deferredQuery = useDeferredValue(inputValue)

  // State
  const [allPropertiesCompressed, setAllPropertiesCompressed] = useState<CompressedProperty[]>([])
  const [searchResults, setSearchResults] = useState<EnhancedBuilding[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // Refs
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchCacheRef = useRef(new Map<string, EnhancedBuilding[]>())

  // Load all properties on mount
  useEffect(() => {
    const basePath = '/rstu-connect'
    fetch(`${basePath}/data/all-properties.json`)
      .then(res => res.json())
      .then(data => {
        setAllPropertiesCompressed(data.p || [])
        setTotalCount(data.c || 0)
        setIsLoading(false)
      })
      .catch(err => {
        log.error('Failed to load all properties:', err)
        setIsLoading(false)
      })
  }, [])

  // Pre-build inverted search index
  const [searchIndex, propertyMap] = useMemo(() => {
    if (allPropertiesCompressed.length === 0) {
      return [new Map<string, Set<string>>(), new Map<string, CompressedProperty>()]
    }
    return [buildSearchIndex(allPropertiesCompressed), buildPropertyMap(allPropertiesCompressed)]
  }, [allPropertiesCompressed])

  // Expand first N properties for display when no search is active
  const allProperties = useMemo(() => {
    return allPropertiesCompressed.slice(0, maxResults).map(expandProperty)
  }, [allPropertiesCompressed, maxResults])

  // Debounced search
  useEffect(() => {
    const query = deferredQuery.trim()

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // If no query, clear results
    if (!query) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    // Check cache
    const cached = searchCacheRef.current.get(query)
    if (cached) {
      setSearchResults(cached)
      setIsSearching(false)
      return
    }

    // Debounce search
    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      let results: EnhancedBuilding[] = []

      if (USE_SUPABASE) {
        // Try Supabase FTS first
        const ftsResults = await searchProperties(query, maxResults)
        if (ftsResults.length > 0) {
          results = ftsResults.map(searchResultToBuilding)
          searchCacheRef.current.set(query, results)
          if (searchCacheRef.current.size > 20) {
            const firstKey = searchCacheRef.current.keys().next().value
            if (firstKey) searchCacheRef.current.delete(firstKey)
          }
          setSearchResults(results)
          setIsSearching(false)
          return
        }
      }

      // Fallback to client-side search
      const queryLower = query.toLowerCase()

      // Use inverted index for O(1) lookups
      if (searchIndex.size > 0) {
        const matchedApns = searchWithIndex(query, searchIndex)
        const matchedApnArray = Array.from(matchedApns)
        for (let i = 0; i < matchedApnArray.length && results.length < maxResults; i++) {
          const apn = matchedApnArray[i]
          const p = propertyMap.get(apn)
          if (p) {
            results.push(expandProperty(p))
          }
        }
      } else {
        // Linear scan fallback
        for (const p of allPropertiesCompressed) {
          if (
            p.d.toLowerCase().includes(queryLower) ||
            p.o.toLowerCase().includes(queryLower) ||
            p.a.includes(query)
          ) {
            results.push(expandProperty(p))
            if (results.length >= maxResults) break
          }
        }
      }

      // Cache results
      searchCacheRef.current.set(query, results)
      if (searchCacheRef.current.size > 20) {
        const firstKey = searchCacheRef.current.keys().next().value
        if (firstKey) searchCacheRef.current.delete(firstKey)
      }

      setSearchResults(results)
      setIsSearching(false)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [deferredQuery, allPropertiesCompressed, searchIndex, propertyMap, maxResults])

  return {
    query: inputValue,
    setQuery: setInputValue,
    results: searchResults,
    isLoading,
    isSearching,
    totalCount,
    allProperties,
  }
}
