'use client'

import { useState, useEffect, useRef, memo } from 'react'
import {
  updateProfile,
  type UserProfile,
  canAccessTools,
} from '@/lib/profileStorage'
import { COMPLAINT_CATEGORIES, INTEREST_LEVELS } from '@/lib/canvassStorage'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import { searchProperties, USE_SUPABASE, PropertySearchResult } from '@/lib/supabase'

// Generate a chat slug from an address
function generateChatSlug(address: string): string {
  return 'rstu-' + address
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)
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
    sqft: result.sqft,
    chatSlug: result.chat_slug || generateChatSlug(result.address),
    propertyName: result.name || undefined,
    latitude: result.lat || undefined,
    longitude: result.lon || undefined,
    neighborhood: result.neighborhood || undefined,
  } as EnhancedBuilding
}

// Compressed property format from all-properties.json
interface CompressedProperty {
  a: string  // apn
  d: string  // address
  o: string  // owner
  u: number  // units
  v: number | null  // value
  y: number | null  // yearBuilt
  z: string | null  // zoning
  l: string | null  // landUseCode
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
    chatSlug: generateChatSlug(p.d),
    zoning: p.z || undefined,
    landUseCode: p.l || undefined,
  } as EnhancedBuilding
}

interface ProfileEditorProps {
  profile: UserProfile
  buildings: EnhancedBuilding[]
  onSave: (updated: UserProfile) => void
  onCancel: () => void
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Section component - defined OUTSIDE ProfileEditor to prevent re-creation on each render
interface SectionProps {
  id: string
  title: string
  isExpanded: boolean
  onToggle: (id: string) => void
  children: React.ReactNode
}

const Section = memo(function Section({ id, title, isExpanded, onToggle, children }: SectionProps) {
  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
})

export function ProfileEditor({ profile, buildings, onSave, onCancel }: ProfileEditorProps) {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    nickname: profile.nickname,
    buildingId: profile.buildingId || '',
    buildingAddress: profile.buildingAddress || '',
    unitNumber: profile.unitNumber || '',
    phone: profile.phone || '',
    email: profile.email || '',
    preferredContact: profile.preferredContact,
    language: profile.language || 'English',
    occupants: profile.occupants,
    hasChildren: profile.hasChildren,
    hasPets: profile.hasPets,
    petTypes: profile.petTypes || '',
    accessibilityNeeds: profile.accessibilityNeeds || '',
    rentAmount: profile.rentAmount,
    moveInDate: profile.moveInDate || '',
    leaseType: profile.leaseType,
    leaseExpires: profile.leaseExpires || '',
    securityDeposit: profile.securityDeposit,
    monthlyIncome: profile.monthlyIncome,
    unitType: profile.unitType,
    unitSqft: profile.unitSqft,
    bedroomCount: profile.bedroomCount,
    bathroomCount: profile.bathroomCount,
    workHours: profile.workHours || '',
    bestTimeToReach: profile.bestTimeToReach || '',
    bestDays: profile.bestDays || [],
    complaints: profile.complaints || [],
    complaintDetails: profile.complaintDetails || '',
    maintenanceRating: profile.maintenanceRating,
    outstandingRepairs: profile.outstandingRepairs || '',
    knowsNeighbors: profile.knowsNeighbors,
    hasOrganizingExperience: profile.hasOrganizingExperience,
    interestLevel: profile.interestLevel || [],
    suggestions: profile.suggestions || '',
  })

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['basic', 'contact'])
  )

  // Building search state
  const [buildingSearch, setBuildingSearch] = useState('')
  const [showBuildingDropdown, setShowBuildingDropdown] = useState(false)
  const [searchResults, setSearchResults] = useState<EnhancedBuilding[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [allProperties, setAllProperties] = useState<CompressedProperty[]>([])
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isOrganizer = canAccessTools()

  // Load all properties on mount (fallback for when Supabase is unavailable)
  useEffect(() => {
    const basePath = process.env.NODE_ENV === 'production' ? '/rstu-connect' : ''
    fetch(`${basePath}/data/all-properties.json`)
      .then(res => res.json())
      .then(data => {
        setAllProperties(data.p || [])
      })
      .catch(err => {
        console.error('Failed to load all properties:', err)
      })
  }, [])

  // Debounced FTS search
  useEffect(() => {
    const query = buildingSearch.trim()

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

    // Debounce search by 300ms
    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      if (USE_SUPABASE) {
        // Use Supabase FTS
        const results = await searchProperties(query, 20)
        if (results.length > 0) {
          setSearchResults(results.map(searchResultToBuilding))
          setIsSearching(false)
          return
        }
      }

      // Fallback to client-side search
      const queryLower = query.toLowerCase()
      const results: EnhancedBuilding[] = []

      // Search featured buildings first
      for (const building of buildings) {
        if (
          building.address.toLowerCase().includes(queryLower) ||
          building.owner.toLowerCase().includes(queryLower) ||
          building.apn.includes(query)
        ) {
          results.push(building)
        }
      }

      // Then search all properties
      const featuredApns = new Set(results.map(b => b.apn))
      for (const p of allProperties) {
        if (featuredApns.has(p.a)) continue
        if (
          p.d.toLowerCase().includes(queryLower) ||
          p.o.toLowerCase().includes(queryLower) ||
          p.a.includes(query)
        ) {
          results.push(expandProperty(p))
          if (results.length >= 20) break
        }
      }

      setSearchResults(results)
      setIsSearching(false)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [buildingSearch, buildings, allProperties])

  // Get buildings to display - search results or featured
  const displayBuildings = buildingSearch.trim() ? searchResults : buildings.slice(0, 20)

  // Find the currently selected building
  const selectedBuilding = buildings.find(b => b.chatSlug === formData.buildingId)
    || searchResults.find(b => b.chatSlug === formData.buildingId)
    || (formData.buildingId && allProperties.length > 0
      ? (() => {
          const chatSlugLower = formData.buildingId?.toLowerCase() || ''
          const found = allProperties.find(p => generateChatSlug(p.d) === chatSlugLower)
          return found ? expandProperty(found) : undefined
        })()
      : undefined)

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  const handleSave = () => {
    updateProfile(formData)
    onSave({ ...profile, ...formData } as UserProfile)
  }

  const toggleComplaint = (key: string) => {
    setFormData(prev => ({
      ...prev,
      complaints: prev.complaints?.includes(key)
        ? prev.complaints.filter(c => c !== key)
        : [...(prev.complaints || []), key],
    }))
  }

  const toggleInterest = (key: string) => {
    setFormData(prev => ({
      ...prev,
      interestLevel: prev.interestLevel?.includes(key)
        ? prev.interestLevel.filter(i => i !== key)
        : [...(prev.interestLevel || []), key],
    }))
  }

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      bestDays: prev.bestDays?.includes(day)
        ? prev.bestDays.filter(d => d !== day)
        : [...(prev.bestDays || []), day],
    }))
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-sm text-gray-500">Update your information</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable Form */}
      <div className="flex-1 overflow-y-auto">
        {/* Basic Info */}
        <Section id="basic" title="Basic Info" isExpanded={expandedSections.has('basic')} onToggle={toggleSection}>
          <input
            type="text"
            placeholder="Your name / nickname"
            value={formData.nickname}
            onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <select
            value={formData.language}
            onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="Other">Other</option>
          </select>
        </Section>

        {/* Your Building */}
        <Section id="building" title="Your Building" isExpanded={expandedSections.has('building')} onToggle={toggleSection}>
          {/* Selected Building Display or Search Input */}
          {formData.buildingId && !showBuildingDropdown ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50">
                {selectedBuilding?.address.split(',')[0] || formData.buildingId}
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, buildingId: undefined, buildingAddress: undefined }))
                  setBuildingSearch('')
                  setShowBuildingDropdown(true)
                }}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={buildingSearch}
                onChange={(e) => {
                  setBuildingSearch(e.target.value)
                  setShowBuildingDropdown(true)
                }}
                onFocus={() => setShowBuildingDropdown(true)}
                placeholder="Search by address, owner, or APN..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
              />

              {/* Building Dropdown */}
              {showBuildingDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {/* Skip option */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, buildingId: undefined, buildingAddress: undefined }))
                      setShowBuildingDropdown(false)
                      setBuildingSearch('')
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-100 border-b border-gray-100"
                  >
                    Clear selection
                  </button>

                  {/* Loading state */}
                  {isSearching ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      <span className="animate-pulse">Searching properties...</span>
                    </div>
                  ) : displayBuildings.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500 italic">
                      {buildingSearch.trim()
                        ? `No properties match "${buildingSearch}"`
                        : 'Type to search all properties...'}
                    </div>
                  ) : (
                    displayBuildings.map((building) => (
                      <button
                        key={building.apn}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            buildingId: building.chatSlug,
                            buildingAddress: building.address,
                          }))
                          setBuildingSearch('')
                          setShowBuildingDropdown(false)
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-rstu-red hover:text-white"
                      >
                        <div className="font-medium">{building.address.split(',')[0]}</div>
                        {building.propertyName && (
                          <div className="text-xs opacity-70">{building.propertyName}</div>
                        )}
                      </button>
                    ))
                  )}

                  {!isSearching && !buildingSearch.trim() && (
                    <div className="px-3 py-2 text-xs text-gray-400 border-t border-gray-100">
                      Search 21,000+ rental properties
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {formData.buildingId && (
            <input
              type="text"
              placeholder="Unit number (e.g., 101, A2)"
              value={formData.unitNumber || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, unitNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          )}
          <p className="text-xs text-gray-400">
            Link your profile to see building-specific info and connect with organizers.
          </p>
        </Section>

        {/* Contact Info - Only organizers can see contact details */}
        <Section id="contact" title="Contact Info" isExpanded={expandedSections.has('contact')} onToggle={toggleSection}>
          {isOrganizer ? (
            <>
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Contact info is only visible to organizers
            </p>
          )}
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">Preferred:</span>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="preferredContact"
                checked={formData.preferredContact === 'phone'}
                onChange={() => setFormData(prev => ({ ...prev, preferredContact: 'phone' }))}
              />
              Phone
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="preferredContact"
                checked={formData.preferredContact === 'text'}
                onChange={() => setFormData(prev => ({ ...prev, preferredContact: 'text' }))}
              />
              Text
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="preferredContact"
                checked={formData.preferredContact === 'email'}
                onChange={() => setFormData(prev => ({ ...prev, preferredContact: 'email' }))}
              />
              Email
            </label>
          </div>
        </Section>

        {/* Household */}
        <Section id="household" title="Household" isExpanded={expandedSections.has('household')} onToggle={toggleSection}>
          <input
            type="number"
            placeholder="Number of occupants"
            value={formData.occupants || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, occupants: parseInt(e.target.value) || undefined }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">Children:</span>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="hasChildren"
                checked={formData.hasChildren === true}
                onChange={() => setFormData(prev => ({ ...prev, hasChildren: true }))}
              />
              Yes
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="hasChildren"
                checked={formData.hasChildren === false}
                onChange={() => setFormData(prev => ({ ...prev, hasChildren: false }))}
              />
              No
            </label>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">Pets:</span>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="hasPets"
                checked={formData.hasPets === true}
                onChange={() => setFormData(prev => ({ ...prev, hasPets: true }))}
              />
              Yes
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="hasPets"
                checked={formData.hasPets === false}
                onChange={() => setFormData(prev => ({ ...prev, hasPets: false }))}
              />
              No
            </label>
          </div>
          {formData.hasPets && (
            <input
              type="text"
              placeholder="Pet types"
              value={formData.petTypes}
              onChange={(e) => setFormData(prev => ({ ...prev, petTypes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          )}
          <input
            type="text"
            placeholder="Accessibility needs"
            value={formData.accessibilityNeeds}
            onChange={(e) => setFormData(prev => ({ ...prev, accessibilityNeeds: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </Section>

        {/* Lease & Rent */}
        <Section id="lease" title="Lease & Rent" isExpanded={expandedSections.has('lease')} onToggle={toggleSection}>
          <div className="flex gap-2">
            <span className="text-gray-600 text-sm pt-2">$</span>
            <input
              type="number"
              placeholder="Rent amount"
              value={formData.rentAmount || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, rentAmount: parseInt(e.target.value) || undefined }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <span className="text-gray-600 text-sm pt-2">/month</span>
          </div>
          <input
            type="text"
            placeholder="Move-in date (e.g., 2019 or Jan 2020)"
            value={formData.moveInDate}
            onChange={(e) => setFormData(prev => ({ ...prev, moveInDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">Lease:</span>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="leaseType"
                checked={formData.leaseType === 'fixed'}
                onChange={() => setFormData(prev => ({ ...prev, leaseType: 'fixed' }))}
              />
              Fixed-term
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="leaseType"
                checked={formData.leaseType === 'month-to-month'}
                onChange={() => setFormData(prev => ({ ...prev, leaseType: 'month-to-month' }))}
              />
              Month-to-month
            </label>
          </div>
          {formData.leaseType === 'fixed' && (
            <input
              type="text"
              placeholder="Lease expires (e.g., March 2025)"
              value={formData.leaseExpires}
              onChange={(e) => setFormData(prev => ({ ...prev, leaseExpires: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          )}
          <div className="flex gap-2">
            <span className="text-gray-600 text-sm pt-2">Deposit: $</span>
            <input
              type="number"
              placeholder="Security deposit"
              value={formData.securityDeposit || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, securityDeposit: parseInt(e.target.value) || undefined }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          {/* Unit Details */}
          <div className="pt-3 mt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3">
              Optional: Add unit details for rent comparison
            </p>

            {/* Unit Type */}
            <div className="mb-3">
              <label className="text-sm text-gray-600 mb-1 block">Unit Type</label>
              <select
                value={formData.unitType ?? ''}
                onChange={(e) => setFormData(prev => ({ ...prev, unitType: e.target.value === '' ? undefined : e.target.value as typeof formData.unitType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Select...</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="townhouse">Townhouse</option>
                <option value="duplex">Duplex</option>
                <option value="condo">Condo</option>
                <option value="mobile">Mobile Home</option>
                <option value="room">Room</option>
              </select>
            </div>

            {/* Bedroom/Bathroom Count */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Bedrooms</label>
                <select
                  value={formData.bedroomCount ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, bedroomCount: e.target.value === '' ? undefined : parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">--</option>
                  <option value="0">Studio</option>
                  <option value="1">1 BR</option>
                  <option value="2">2 BR</option>
                  <option value="3">3 BR</option>
                  <option value="4">4+ BR</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Bathrooms</label>
                <select
                  value={formData.bathroomCount ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, bathroomCount: e.target.value === '' ? undefined : parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">--</option>
                  <option value="1">1 BA</option>
                  <option value="1.5">1.5 BA</option>
                  <option value="2">2 BA</option>
                  <option value="2.5">2.5 BA</option>
                  <option value="3">3+ BA</option>
                </select>
              </div>
            </div>

            {/* Unit Square Footage */}
            <div className="mb-3">
              <label className="text-sm text-gray-600 mb-1 block">Unit size (sq ft)</label>
              <input
                type="number"
                placeholder="e.g., 750"
                value={formData.unitSqft || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, unitSqft: parseInt(e.target.value) || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            {/* Monthly Income (Private) */}
            <div className="mb-2">
              <label className="text-sm text-gray-600 mb-1 block">Monthly income (optional)</label>
              <div className="flex gap-2">
                <span className="text-gray-600 text-sm pt-2">$</span>
                <input
                  type="number"
                  placeholder="Gross monthly"
                  value={formData.monthlyIncome || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyIncome: parseInt(e.target.value) || undefined }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Private - stays on your device only
              </p>
            </div>
          </div>
        </Section>

        {/* Schedule */}
        <Section id="schedule" title="Availability" isExpanded={expandedSections.has('schedule')} onToggle={toggleSection}>
          <input
            type="text"
            placeholder="Work hours (e.g., 9-5 M-F)"
            value={formData.workHours}
            onChange={(e) => setFormData(prev => ({ ...prev, workHours: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <input
            type="text"
            placeholder="Best time to reach"
            value={formData.bestTimeToReach}
            onChange={(e) => setFormData(prev => ({ ...prev, bestTimeToReach: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <div>
            <span className="text-sm text-gray-600 mb-2 block">Best days:</span>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.bestDays?.includes(day)
                      ? 'bg-rstu-red text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Issues */}
        <Section id="issues" title="Issues & Complaints" isExpanded={expandedSections.has('issues')} onToggle={toggleSection}>
          <div className="space-y-2">
            {COMPLAINT_CATEGORIES.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.complaints?.includes(key)}
                  onChange={() => toggleComplaint(key)}
                  className="rounded border-gray-300 text-rstu-red focus:ring-rstu-red"
                />
                {label}
              </label>
            ))}
          </div>
          <textarea
            placeholder="Details about your issues..."
            value={formData.complaintDetails}
            onChange={(e) => setFormData(prev => ({ ...prev, complaintDetails: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">Maintenance:</span>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="maintenanceRating"
                checked={formData.maintenanceRating === 'good'}
                onChange={() => setFormData(prev => ({ ...prev, maintenanceRating: 'good' }))}
              />
              Good
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="maintenanceRating"
                checked={formData.maintenanceRating === 'ok'}
                onChange={() => setFormData(prev => ({ ...prev, maintenanceRating: 'ok' }))}
              />
              OK
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="maintenanceRating"
                checked={formData.maintenanceRating === 'bad'}
                onChange={() => setFormData(prev => ({ ...prev, maintenanceRating: 'bad' }))}
              />
              Bad
            </label>
          </div>
          <input
            type="text"
            placeholder="Outstanding repair requests"
            value={formData.outstandingRepairs}
            onChange={(e) => setFormData(prev => ({ ...prev, outstandingRepairs: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </Section>

        {/* Interest */}
        <Section id="interest" title="Community & Interest" isExpanded={expandedSections.has('interest')} onToggle={toggleSection}>
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">Know neighbors:</span>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="knowsNeighbors"
                checked={formData.knowsNeighbors === 'yes'}
                onChange={() => setFormData(prev => ({ ...prev, knowsNeighbors: 'yes' }))}
              />
              Yes
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="knowsNeighbors"
                checked={formData.knowsNeighbors === 'somewhat'}
                onChange={() => setFormData(prev => ({ ...prev, knowsNeighbors: 'somewhat' }))}
              />
              Some
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="knowsNeighbors"
                checked={formData.knowsNeighbors === 'no'}
                onChange={() => setFormData(prev => ({ ...prev, knowsNeighbors: 'no' }))}
              />
              No
            </label>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">Organizing experience:</span>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="hasOrganizingExperience"
                checked={formData.hasOrganizingExperience === true}
                onChange={() => setFormData(prev => ({ ...prev, hasOrganizingExperience: true }))}
              />
              Yes
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="hasOrganizingExperience"
                checked={formData.hasOrganizingExperience === false}
                onChange={() => setFormData(prev => ({ ...prev, hasOrganizingExperience: false }))}
              />
              No
            </label>
          </div>
          <div className="mt-3">
            <span className="text-sm text-gray-600 mb-2 block">Interested in:</span>
            <div className="space-y-2">
              {INTEREST_LEVELS.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.interestLevel?.includes(key)}
                    onChange={() => toggleInterest(key)}
                    className="rounded border-gray-300 text-rstu-red focus:ring-rstu-red"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <textarea
            placeholder="What would you like to see changed?"
            value={formData.suggestions}
            onChange={(e) => setFormData(prev => ({ ...prev, suggestions: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </Section>

        {/* Lease Details (Organizer-Only) */}
        {isOrganizer && (
          <Section
            id="lease"
            title="Lease Details (Organizer tracking)"
            isExpanded={expandedSections.has('lease')}
            onToggle={toggleSection}
          >
            <div className="space-y-4">
              {/* Month-to-Month Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="monthToMonth"
                  checked={formData.isMonthToMonth || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, isMonthToMonth: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="monthToMonth" className="text-sm text-gray-700">
                  Month-to-month lease
                </label>
              </div>

              {/* Lease Dates (only if not month-to-month) */}
              {!formData.isMonthToMonth && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Lease Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.leaseStartDate || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, leaseStartDate: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Lease End Date
                    </label>
                    <input
                      type="date"
                      value={formData.leaseEndDate || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, leaseEndDate: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500">
                Organizers can track lease dates to know when to follow up with tenants
                about rent increases or lease renewals.
              </p>
            </div>
          </Section>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 flex-shrink-0 bg-white">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-rstu-red text-white rounded-md text-sm font-medium hover:bg-red-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
