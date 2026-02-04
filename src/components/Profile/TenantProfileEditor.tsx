'use client'
import { createLogger } from '@/lib/utils/logger'
const log = createLogger('TenantProfileEditor')

import { useState, useEffect, useRef, memo, forwardRef, useImperativeHandle } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  updateProfile,
  type UserProfile,
  canAccessTools,
  SUGGESTED_INTERESTS,
  INTEREST_LABELS,
  COMMUNITY_ACTIVITIES,
  ACTIVITY_LABELS,
} from '@/lib/storage/profileStorage'
import { COMPLAINT_CATEGORIES, INTEREST_LEVELS } from '@/lib/storage/canvassStorage'
import type { EnhancedBuilding } from '@/lib/data/getBuildingsData'
import { searchProperties, USE_SUPABASE, PropertySearchResult } from '@/lib/services/supabase'

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

interface TenantProfileEditorProps {
  profile: UserProfile
  buildings: EnhancedBuilding[]
  onSave: (updated: UserProfile) => void
  onCancel: () => void
}

export interface TenantProfileEditorHandle {
  save: () => void
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Section component
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

export const TenantProfileEditor = forwardRef<TenantProfileEditorHandle, TenantProfileEditorProps>(
  function TenantProfileEditor({ profile, buildings, onSave, onCancel }, ref) {
  const { t } = useLanguage()

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
    interests: profile.interests || [],
    activities: profile.activities || [],
    connectionPreference: profile.connectionPreference,
    showInDirectory: profile.showInDirectory ?? false,
  })

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['basic', 'building'])
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
    const basePath = '/rstu-connect'
    fetch(`${basePath}/data/all-properties.json`)
      .then(res => res.json())
      .then(data => {
        setAllProperties(data.p || [])
      })
      .catch(err => {
        log.error('Failed to load all properties:', err)
      })
  }, [])

  // Debounced FTS search
  useEffect(() => {
    const query = buildingSearch.trim()

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!query) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      if (USE_SUPABASE) {
        const results = await searchProperties(query, 20)
        if (results.length > 0) {
          setSearchResults(results.map(searchResultToBuilding))
          setIsSearching(false)
          return
        }
      }

      const queryLower = query.toLowerCase()
      const results: EnhancedBuilding[] = []

      for (const building of buildings) {
        if (
          building.address.toLowerCase().includes(queryLower) ||
          building.owner.toLowerCase().includes(queryLower) ||
          building.apn.includes(query)
        ) {
          results.push(building)
        }
      }

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

  const displayBuildings = buildingSearch.trim() ? searchResults : buildings.slice(0, 20)

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

  useImperativeHandle(ref, () => ({
    save: handleSave,
  }))

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

  const togglePersonalInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests?.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...(prev.interests || []), interest],
    }))
  }

  const toggleActivity = (activity: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities?.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...(prev.activities || []), activity],
    }))
  }

  return (
    <div className="space-y-0">
        {/* Nickname */}
        <Section id="basic" title={t('profile.accountInfo') || 'Basic Info'} isExpanded={expandedSections.has('basic')} onToggle={toggleSection}>
          <input
            type="text"
            placeholder={t('profile.nicknamePlaceholder') || 'Your name / nickname'}
            value={formData.nickname}
            onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </Section>

        {/* Your Building */}
        <Section id="building" title={t('profile.yourBuilding') || 'Your Building'} isExpanded={expandedSections.has('building')} onToggle={toggleSection}>
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
                {t('common.change') || 'Change'}
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
                placeholder={t('profile.searchBuildingPlaceholder') || 'Search by address, owner, or APN...'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
              />

              {showBuildingDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, buildingId: undefined, buildingAddress: undefined }))
                      setShowBuildingDropdown(false)
                      setBuildingSearch('')
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-100 border-b border-gray-100"
                  >
                    {t('profile.skipAddBuildingLater') || 'Clear selection'}
                  </button>

                  {isSearching ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      <span className="animate-pulse">{t('profile.searchingProperties') || 'Searching properties...'}</span>
                    </div>
                  ) : displayBuildings.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500 italic">
                      {buildingSearch.trim()
                        ? t('profile.noPropertiesMatch')?.replace('{query}', buildingSearch) || `No properties match "${buildingSearch}"`
                        : t('profile.typeToSearchProperties') || 'Type to search all properties...'}
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
                      {t('profile.searchRentalPropertiesHint') || 'Search 21,000+ rental properties'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {formData.buildingId && (
            <input
              type="text"
              placeholder={t('profile.unitNumberPlaceholder') || 'Unit number (e.g., 101, A2)'}
              value={formData.unitNumber || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, unitNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          )}
          <p className="text-xs text-gray-400">
            {t('profile.buildingHelpText') || 'Link your profile to see building-specific info and connect with organizers.'}
          </p>
        </Section>

        {/* Contact Info */}
        <Section id="contact" title={t('profile.accountInfo') || 'Contact Info'} isExpanded={expandedSections.has('contact')} onToggle={toggleSection}>
          {isOrganizer ? (
            <>
              <input
                type="tel"
                placeholder={t('profile.phone') || 'Phone'}
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="email"
                placeholder={t('profile.email') || 'Email'}
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">
              {t('profile.emailHelpText') || 'Contact info is only visible to organizers'}
            </p>
          )}
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">Preferred contact:</span>
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
        <Section id="household" title={t('profile.household') || 'Household'} isExpanded={expandedSections.has('household')} onToggle={toggleSection}>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Number of occupants</label>
            <input
              type="number"
              placeholder="e.g., 3"
              value={formData.occupants || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, occupants: parseInt(e.target.value) || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Total people living in your unit, including yourself</p>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">Children in household:</span>
            <label className="flex items-center gap-1">
              <input type="radio" name="hasChildren" checked={formData.hasChildren === true} onChange={() => setFormData(prev => ({ ...prev, hasChildren: true }))} />
              {t('ui.yes') || 'Yes'}
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" name="hasChildren" checked={formData.hasChildren === false} onChange={() => setFormData(prev => ({ ...prev, hasChildren: false }))} />
              {t('ui.no') || 'No'}
            </label>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">Pets in household:</span>
            <label className="flex items-center gap-1">
              <input type="radio" name="hasPets" checked={formData.hasPets === true} onChange={() => setFormData(prev => ({ ...prev, hasPets: true }))} />
              {t('ui.yes') || 'Yes'}
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" name="hasPets" checked={formData.hasPets === false} onChange={() => setFormData(prev => ({ ...prev, hasPets: false }))} />
              {t('ui.no') || 'No'}
            </label>
          </div>
          {formData.hasPets && (
            <input
              type="text"
              placeholder="e.g., Dog, Cat"
              value={formData.petTypes}
              onChange={(e) => setFormData(prev => ({ ...prev, petTypes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          )}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Accessibility needs</label>
            <input
              type="text"
              placeholder="e.g., Wheelchair access, ground floor needed"
              value={formData.accessibilityNeeds}
              onChange={(e) => setFormData(prev => ({ ...prev, accessibilityNeeds: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Helps organizers understand accommodation needs</p>
          </div>
        </Section>

        {/* Lease & Rent */}
        <Section id="lease" title={'Lease & Rent'} isExpanded={expandedSections.has('lease')} onToggle={toggleSection}>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Monthly rent</label>
            <div className="flex gap-2">
              <span className="text-gray-600 text-sm pt-2">$</span>
              <input
                type="number"
                placeholder="e.g., 1200"
                value={formData.rentAmount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, rentAmount: parseInt(e.target.value) || undefined }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <span className="text-gray-600 text-sm pt-2">/month</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Used for rent comparison tools and tracking increases</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Move-in date</label>
            <input
              type="text"
              placeholder="e.g., 2019 or Jan 2020"
              value={formData.moveInDate}
              onChange={(e) => setFormData(prev => ({ ...prev, moveInDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">When you first moved into your current unit</p>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">Lease type:</span>
            <label className="flex items-center gap-1">
              <input type="radio" name="leaseType" checked={formData.leaseType === 'fixed'} onChange={() => setFormData(prev => ({ ...prev, leaseType: 'fixed' }))} />
              Fixed-term
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" name="leaseType" checked={formData.leaseType === 'month-to-month'} onChange={() => setFormData(prev => ({ ...prev, leaseType: 'month-to-month' }))} />
              Month-to-month
            </label>
          </div>
          {formData.leaseType === 'fixed' && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Lease expiration</label>
              <input
                type="text"
                placeholder="e.g., March 2025"
                value={formData.leaseExpires}
                onChange={(e) => setFormData(prev => ({ ...prev, leaseExpires: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Security deposit</label>
            <div className="flex gap-2">
              <span className="text-gray-600 text-sm pt-2">$</span>
              <input
                type="number"
                placeholder="Amount paid at move-in"
                value={formData.securityDeposit || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, securityDeposit: parseInt(e.target.value) || undefined }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          {/* Unit Details */}
          <div className="pt-3 mt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3">
              Unit details help compare your rent to similar units in the area.
            </p>

            <div className="mb-3">
              <label className="text-sm text-gray-600 mb-1 block">Unit type</label>
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

            <div className="mb-2">
              <label className="text-sm text-gray-600 mb-1 block">Monthly income</label>
              <div className="flex gap-2">
                <span className="text-gray-600 text-sm pt-2">$</span>
                <input
                  type="number"
                  placeholder="Gross monthly before taxes"
                  value={formData.monthlyIncome || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyIncome: parseInt(e.target.value) || undefined }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Private - never shared or synced. Used to calculate rent burden on your device only.
              </p>
            </div>
          </div>
        </Section>

        {/* Schedule */}
        <Section id="schedule" title={t('profile.availability') || 'Availability'} isExpanded={expandedSections.has('schedule')} onToggle={toggleSection}>
          <p className="text-xs text-gray-500">Helps organizers know when to reach out or schedule meetings.</p>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Work schedule</label>
            <input
              type="text"
              placeholder="e.g., 9-5 M-F, or nights/weekends"
              value={formData.workHours}
              onChange={(e) => setFormData(prev => ({ ...prev, workHours: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Best time to reach you</label>
            <input
              type="text"
              placeholder="e.g., Evenings after 6pm, weekday mornings"
              value={formData.bestTimeToReach}
              onChange={(e) => setFormData(prev => ({ ...prev, bestTimeToReach: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <span className="text-sm text-gray-600 mb-2 block">Best days to meet:</span>
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
        <Section id="issues" title={t('profile.complaints') || 'Issues & Complaints'} isExpanded={expandedSections.has('issues')} onToggle={toggleSection}>
          <p className="text-xs text-gray-500">Select any issues you are currently experiencing in your unit.</p>
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
          <div>
            <label className="block text-sm text-gray-600 mb-1">Additional details</label>
            <textarea
              placeholder="Describe your issues, when they started, and any responses from management..."
              value={formData.complaintDetails}
              onChange={(e) => setFormData(prev => ({ ...prev, complaintDetails: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">Maintenance responsiveness:</span>
            <label className="flex items-center gap-1">
              <input type="radio" name="maintenanceRating" checked={formData.maintenanceRating === 'good'} onChange={() => setFormData(prev => ({ ...prev, maintenanceRating: 'good' }))} />
              Good
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" name="maintenanceRating" checked={formData.maintenanceRating === 'ok'} onChange={() => setFormData(prev => ({ ...prev, maintenanceRating: 'ok' }))} />
              OK
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" name="maintenanceRating" checked={formData.maintenanceRating === 'bad'} onChange={() => setFormData(prev => ({ ...prev, maintenanceRating: 'bad' }))} />
              Bad
            </label>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Outstanding repair requests</label>
            <input
              type="text"
              placeholder="e.g., Broken heater since October, leaky faucet"
              value={formData.outstandingRepairs}
              onChange={(e) => setFormData(prev => ({ ...prev, outstandingRepairs: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Repairs you have requested that have not been completed</p>
          </div>
        </Section>

        {/* Interest */}
        <Section id="interest" title={'Community & Interest'} isExpanded={expandedSections.has('interest')} onToggle={toggleSection}>
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">Know your neighbors?</span>
            <label className="flex items-center gap-1">
              <input type="radio" name="knowsNeighbors" checked={formData.knowsNeighbors === 'yes'} onChange={() => setFormData(prev => ({ ...prev, knowsNeighbors: 'yes' }))} />
              {t('ui.yes') || 'Yes'}
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" name="knowsNeighbors" checked={formData.knowsNeighbors === 'somewhat'} onChange={() => setFormData(prev => ({ ...prev, knowsNeighbors: 'somewhat' }))} />
              Some
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" name="knowsNeighbors" checked={formData.knowsNeighbors === 'no'} onChange={() => setFormData(prev => ({ ...prev, knowsNeighbors: 'no' }))} />
              {t('ui.no') || 'No'}
            </label>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">Prior organizing experience?</span>
            <label className="flex items-center gap-1">
              <input type="radio" name="hasOrganizingExperience" checked={formData.hasOrganizingExperience === true} onChange={() => setFormData(prev => ({ ...prev, hasOrganizingExperience: true }))} />
              {t('ui.yes') || 'Yes'}
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" name="hasOrganizingExperience" checked={formData.hasOrganizingExperience === false} onChange={() => setFormData(prev => ({ ...prev, hasOrganizingExperience: false }))} />
              {t('ui.no') || 'No'}
            </label>
          </div>
          <div className="mt-3">
            <span className="text-sm text-gray-600 mb-2 block">What would you like to get involved with?</span>
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
          <div>
            <label className="block text-sm text-gray-600 mb-1">Suggestions for your building or community</label>
            <textarea
              placeholder="What changes would you like to see? What would make your building better?"
              value={formData.suggestions}
              onChange={(e) => setFormData(prev => ({ ...prev, suggestions: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </Section>

        {/* Personalization & Circles */}
        <Section id="personalization" title={t('profile.personalization') || 'Interests & Connections'} isExpanded={expandedSections.has('personalization')} onToggle={toggleSection}>
          <div>
            <span className="text-sm text-gray-600 mb-2 block">{t('profile.interests') || 'What are you interested in?'}</span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_INTERESTS.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => togglePersonalInterest(interest)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.interests?.includes(interest)
                      ? 'bg-rstu-red text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {INTEREST_LABELS[interest] || interest}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {t('profile.interestsHelp') || 'Select interests to find Circles and connect with neighbors'}
            </p>
          </div>

          <div className="mt-4">
            <span className="text-sm text-gray-600 mb-2 block">{t('profile.activities') || 'Community activities'}</span>
            <div className="space-y-2">
              {COMMUNITY_ACTIVITIES.map(activity => (
                <label key={activity} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.activities?.includes(activity)}
                    onChange={() => toggleActivity(activity)}
                    className="rounded border-gray-300 text-rstu-red focus:ring-rstu-red"
                  />
                  {ACTIVITY_LABELS[activity] || activity}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <span className="text-sm text-gray-600 mb-2 block">{t('profile.connectionPreference') || 'Connect with people in'}</span>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-1 text-sm">
                <input type="radio" name="connectionPreference" checked={formData.connectionPreference === 'building'} onChange={() => setFormData(prev => ({ ...prev, connectionPreference: 'building' }))} />
                {t('profile.connectionBuilding') || 'My building'}
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input type="radio" name="connectionPreference" checked={formData.connectionPreference === 'neighborhood'} onChange={() => setFormData(prev => ({ ...prev, connectionPreference: 'neighborhood' }))} />
                {t('profile.connectionNeighborhood') || 'My neighborhood'}
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input type="radio" name="connectionPreference" checked={formData.connectionPreference === 'city'} onChange={() => setFormData(prev => ({ ...prev, connectionPreference: 'city' }))} />
                {t('profile.connectionCity') || 'Reno-Sparks area'}
              </label>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.showInDirectory}
                onChange={(e) => setFormData(prev => ({ ...prev, showInDirectory: e.target.checked }))}
                className="rounded border-gray-300 text-rstu-red focus:ring-rstu-red"
              />
              <span>{t('profile.showInDirectory') || 'Show my profile in the community directory'}</span>
            </label>
            <p className="text-xs text-gray-400 mt-1 ml-6">
              {t('profile.showInDirectoryHelp') || 'Let other tenants discover you based on shared interests'}
            </p>
          </div>
        </Section>

        {/* Lease Details (Organizer-Only) */}
        {isOrganizer && (
          <Section
            id="leaseDetails"
            title={'Lease Details (Organizer tracking)'}
            isExpanded={expandedSections.has('leaseDetails')}
            onToggle={toggleSection}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="monthToMonth"
                  checked={formData.isMonthToMonth || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, isMonthToMonth: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="monthToMonth" className="text-sm text-gray-700">
                  {'Month-to-month lease'}
                </label>
              </div>

              {!formData.isMonthToMonth && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {'Lease Start Date'}
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
                      {'Lease End Date'}
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
                {'Organizers can track lease dates to know when to follow up with tenants about rent increases or lease renewals.'}
              </p>
            </div>
          </Section>
        )}
    </div>
  )
  }
)
