'use client'

import { useState, useEffect, useRef } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import {
  createProfile,
  createProfileAsync,
  updateProfile,
  validateInviteCode,
  parseProfileParams,
  bootstrapFirstAdmin,
  isEmailAvailable,
  type UserProfile,
} from '@/lib/profileStorage'
import { syncProfile } from '@/lib/profileSync'
import { searchProperties, USE_SUPABASE, syncProfileToSupabase, PropertySearchResult } from '@/lib/supabase'

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

interface ProfileCreateProps {
  buildings: EnhancedBuilding[]
  onProfileCreated: (profile: UserProfile) => void
  onCancel?: () => void
  existingProfile?: UserProfile // For edit mode
}

export function ProfileCreate({ buildings, onProfileCreated, onCancel, existingProfile }: ProfileCreateProps) {
  const isEditMode = !!existingProfile

  // Form state - pre-fill from existing profile if editing
  const [nickname, setNickname] = useState(existingProfile?.nickname || '')
  const [email, setEmail] = useState(existingProfile?.email || '')
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(existingProfile?.buildingId || '')
  const [unitNumber, setUnitNumber] = useState(existingProfile?.unitNumber || '')
  const [inviteCode, setInviteCode] = useState('')

  // Email validation state
  const [emailValidation, setEmailValidation] = useState<{
    checking: boolean
    available: boolean
    error?: string
  }>({ checking: false, available: true })

  // Validation state
  const [inviteValidation, setInviteValidation] = useState<{
    checked: boolean
    valid: boolean
    error?: string
    buildingId?: string
    unitNumber?: string
  }>({ checked: false, valid: false })

  // Bootstrap admin state
  const [isBootstrapMode, setIsBootstrapMode] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('')
  const [isCheckingBootstrap, setIsCheckingBootstrap] = useState(false)

  // Building search state
  const [buildingSearch, setBuildingSearch] = useState('')
  const [showBuildingList, setShowBuildingList] = useState(false)
  const [searchResults, setSearchResults] = useState<EnhancedBuilding[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [allProperties, setAllProperties] = useState<CompressedProperty[]>([])
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [error, setError] = useState<string | null>(null)

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

  // Debounced email availability check
  useEffect(() => {
    // Skip validation in edit mode (email can't change) or for bootstrap mode
    if (isEditMode || isBootstrapMode || !email.trim()) {
      setEmailValidation({ checking: false, available: true })
      return
    }

    // Basic format check first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setEmailValidation({
        checking: false,
        available: false,
        error: 'Please enter a valid email address'
      })
      return
    }

    // Debounce the availability check
    const timeoutId = setTimeout(async () => {
      setEmailValidation({ checking: true, available: true })

      try {
        const { available, existingNickname } = await isEmailAvailable(email)

        if (!available) {
          setEmailValidation({
            checking: false,
            available: false,
            error: `Email already registered to "${existingNickname}". Please login instead.`
          })
        } else {
          setEmailValidation({ checking: false, available: true })
        }
      } catch (err) {
        console.error('[ProfileCreate] Email check failed:', err)
        // Fail open - allow creation on network errors
        setEmailValidation({ checking: false, available: true })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [email, isEditMode, isBootstrapMode])

  // Debounced FTS search
  useEffect(() => {
    const query = buildingSearch.trim()

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // If no query, show featured buildings
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

  // Find selected building - check featured first, then search results, then all properties
  const selectedBuilding = buildings.find(b => b.chatSlug === selectedBuildingId)
    || searchResults.find(b => b.chatSlug === selectedBuildingId)
    || (selectedBuildingId && allProperties.length > 0
      ? (() => {
          // Look up in all properties if not found in featured/search
          const chatSlugLower = selectedBuildingId.toLowerCase()
          const found = allProperties.find(p => generateChatSlug(p.d) === chatSlugLower)
          return found ? expandProperty(found) : undefined
        })()
      : undefined)

  // Check for URL params on mount
  useEffect(() => {
    const params = parseProfileParams()
    if (params) {
      if (params.buildingId) {
        setSelectedBuildingId(params.buildingId)
      }
      if (params.unitNumber) {
        setUnitNumber(params.unitNumber)
      }
      if (params.inviteCode) {
        setInviteCode(params.inviteCode)
        handleValidateInvite(params.inviteCode)
      }
    }
  }, [])

  const handleValidateInvite = async (code: string) => {
    if (!code.trim()) {
      setInviteValidation({ checked: false, valid: false })
      setIsBootstrapMode(false)
      return
    }

    const trimmedCode = code.trim()

    // Check if it's a bootstrap admin code (starts with RSTU-)
    if (trimmedCode.toUpperCase().startsWith('RSTU-') && trimmedCode.length > 6) {
      // Enter bootstrap mode - require nickname and password
      setIsCheckingBootstrap(true)

      // Check with server if admin already exists
      try {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKETIO_URL || 'https://rstu-gun-relay.onrender.com'
        const response = await fetch(`${socketUrl}/admin-exists`)
        if (response.ok) {
          const data = await response.json()
          if (data.exists) {
            setInviteValidation({
              checked: true,
              valid: false,
              error: 'Admin code has already been used. Contact existing admin for an invite.',
            })
            setIsCheckingBootstrap(false)
            return
          }
        }
      } catch {
        // Server might not support this endpoint yet - allow local check as fallback
      }

      setIsCheckingBootstrap(false)
      setIsBootstrapMode(true)
      setInviteValidation({
        checked: true,
        valid: true,
      })
      return
    }

    // Regular invite code validation
    const result = validateInviteCode(trimmedCode)
    if (result.valid && result.invite) {
      setInviteValidation({
        checked: true,
        valid: true,
        buildingId: result.invite.buildingId,
        unitNumber: result.invite.unitNumber,
      })
      setIsBootstrapMode(false)
      // Auto-fill from invite
      if (result.invite.buildingId) {
        setSelectedBuildingId(result.invite.buildingId)
      }
      if (result.invite.unitNumber) {
        setUnitNumber(result.invite.unitNumber)
      }
    } else {
      setInviteValidation({
        checked: true,
        valid: false,
        error: result.error,
      })
      setIsBootstrapMode(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!nickname.trim()) {
      setError('Please enter a nickname')
      return
    }

    if (nickname.trim().length < 2) {
      setError('Nickname must be at least 2 characters')
      return
    }

    // Email validation for new profiles (not edit mode, not bootstrap)
    if (!isEditMode && !isBootstrapMode) {
      if (!email.trim()) {
        setError('Please enter your email address')
        return
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        setError('Please enter a valid email address')
        return
      }

      // Check if email validation passed
      if (!emailValidation.available) {
        setError(emailValidation.error || 'Email is already in use')
        return
      }

      // Check if still validating
      if (emailValidation.checking) {
        setError('Please wait while we verify your email')
        return
      }
    }

    // Bootstrap mode requires password
    if (isBootstrapMode) {
      if (!adminPassword) {
        setError('Please set a password for your admin account')
        return
      }
      if (adminPassword.length < 8) {
        setError('Password must be at least 8 characters')
        return
      }
      if (adminPassword !== adminPasswordConfirm) {
        setError('Passwords do not match')
        return
      }

      // Create bootstrap admin with password
      const profile = bootstrapFirstAdmin(inviteCode.trim(), nickname.trim(), adminPassword)
      if (!profile) {
        setError('Failed to create admin account. Code may have already been used.')
        return
      }

      // Sync to Supabase database
      if (USE_SUPABASE) {
        await syncProfileToSupabase(profile)
      }

      // Sync the new profile to server (Socket.io for real-time)
      syncProfile()

      // Clear URL params
      if (typeof window !== 'undefined' && window.history.replaceState) {
        window.history.replaceState({}, '', window.location.pathname)
      }

      onProfileCreated(profile)
      return
    }

    try {
      let profile: UserProfile | null

      if (isEditMode) {
        // Update existing profile (email can't change)
        profile = updateProfile({
          nickname: nickname.trim(),
          buildingId: selectedBuildingId || undefined,
          buildingAddress: selectedBuilding?.address,
          unitNumber: unitNumber.trim() || undefined,
        })

        if (!profile) {
          setError('Failed to update profile. Please try again.')
          return
        }

        // Sync updated profile to Supabase
        if (USE_SUPABASE) {
          await syncProfileToSupabase(profile)
        }
      } else {
        // Create new profile with email (uses createProfileAsync which handles Supabase sync)
        profile = await createProfileAsync({
          nickname: nickname.trim(),
          email: email.trim().toLowerCase(),  // Include email for duplicate prevention
          buildingId: selectedBuildingId || undefined,
          buildingAddress: selectedBuilding?.address,
          unitNumber: unitNumber.trim() || undefined,
          inviteCode: inviteCode.trim() || undefined,
        })
      }

      // Sync the new profile to server (Socket.io for real-time)
      syncProfile()

      // Clear URL params
      if (typeof window !== 'undefined' && window.history.replaceState) {
        window.history.replaceState({}, '', window.location.pathname)
      }

      onProfileCreated(profile)
    } catch (err) {
      console.error('[ProfileCreate] Error saving profile:', err)
      // Show the actual error message from createProfileAsync (e.g., duplicate email)
      const message = err instanceof Error ? err.message : 'Failed to save profile. Please try again.'
      setError(message)
    }
  }

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isEditMode ? 'Edit Profile' : 'Create Your Profile'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEditMode ? 'Update your profile information' : 'Join your building\'s tenant community'}
            </p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
          {/* Invite Code (optional) - only show when creating, not editing */}
          {!isEditMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invite Code
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value.toUpperCase())
                    if (inviteValidation.checked) {
                      setInviteValidation({ checked: false, valid: false })
                    }
                  }}
                  placeholder="Enter invite or admin code"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent font-mono uppercase"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={() => handleValidateInvite(inviteCode)}
                  disabled={!inviteCode.trim()}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 disabled:opacity-50"
                >
                  Check
                </button>
              </div>
              {isCheckingBootstrap && (
                <p className="text-xs mt-1 text-gray-500">Checking admin code...</p>
              )}
              {inviteValidation.checked && !isBootstrapMode && (
                <p className={`text-xs mt-1 ${inviteValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {inviteValidation.valid ? 'Valid invite code!' : inviteValidation.error}
                </p>
              )}
              {isBootstrapMode && (
                <p className="text-xs mt-1 text-green-600">
                  Admin code accepted. Set your nickname and password below.
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Got an invite code? Enter it here. Admin codes start with RSTU-.
              </p>
            </div>
          )}

          {/* Bootstrap Admin Password Fields */}
          {isBootstrapMode && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 space-y-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Creating Admin Account</p>
                  <p className="mt-1 text-xs">
                    You are creating the first admin account. Set a secure password - this code can only be used once.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="password"
                  value={adminPasswordConfirm}
                  onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                  minLength={8}
                />
                {adminPassword && adminPasswordConfirm && adminPassword !== adminPasswordConfirm && (
                  <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                )}
              </div>
            </div>
          )}

          {/* Nickname */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nickname
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="How should we call you?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
              maxLength={30}
            />
            <p className="text-xs text-gray-400 mt-1">
              This is how you&apos;ll appear to others. No real name required.
            </p>
          </div>

          {/* Email - Required for new profiles (not edit mode, not bootstrap) */}
          {!isEditMode && !isBootstrapMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent ${
                  !emailValidation.available && email.trim()
                    ? 'border-red-300 bg-red-50'
                    : emailValidation.available && email.trim() && !emailValidation.checking
                    ? 'border-green-300'
                    : 'border-gray-300'
                }`}
              />

              {/* Real-time email validation feedback */}
              {emailValidation.checking && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <span className="inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Checking availability...
                </p>
              )}
              {!emailValidation.checking && !emailValidation.available && emailValidation.error && (
                <p className="text-xs text-red-600 mt-1">
                  {emailValidation.error}
                </p>
              )}
              {!emailValidation.checking && emailValidation.available && email.trim() && (
                <p className="text-xs text-green-600 mt-1">
                  Email available
                </p>
              )}

              <p className="text-xs text-gray-400 mt-1">
                Used to prevent duplicate accounts and enable profile recovery. Only visible to organizers.
              </p>
            </div>
          )}

          {/* Show email as read-only in edit mode */}
          {isEditMode && existingProfile?.email && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={existingProfile.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">
                Email cannot be changed. Contact an admin if you need to update it.
              </p>
            </div>
          )}

          {/* Building Selection */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Building
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>

            {/* Selected Building Display / Search Input */}
            {selectedBuildingId && !showBuildingList ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50">
                  {selectedBuilding?.address.split(',')[0] || 'Unknown'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBuildingId('')
                    setBuildingSearch('')
                    setShowBuildingList(true)
                  }}
                  className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm"
                >
                  Change
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={buildingSearch}
                  onChange={(e) => {
                    setBuildingSearch(e.target.value)
                    setShowBuildingList(true)
                  }}
                  onFocus={() => setShowBuildingList(true)}
                  placeholder="Search for your building..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                />

                {/* Building List Dropdown */}
                {showBuildingList && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {/* Skip option */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBuildingId('')
                        setShowBuildingList(false)
                        setBuildingSearch('')
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-100 border-b border-gray-100"
                    >
                      Skip - I&apos;ll add later
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
                            setSelectedBuildingId(building.chatSlug)
                            setBuildingSearch('')
                            setShowBuildingList(false)
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
                        Search 21,000+ rental properties by address, owner, or APN
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-1">
              Link your profile to see building-specific info.
            </p>
          </div>

          {/* Unit Number */}
          {selectedBuildingId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Number
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <input
                type="text"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                placeholder="e.g., 101, A2, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                Helps us show you relevant info for your unit.
              </p>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-xs text-blue-700">
                <p className="font-medium">Privacy &amp; data sharing</p>
                <p className="mt-1">
                  Organizers can view profiles to coordinate tenant outreach. Rent data is only used for anonymous building averages.
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-md p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-rstu-red text-white rounded-md font-medium hover:bg-rstu-red-dark transition-colors"
          >
            {isEditMode ? 'Save Changes' : 'Create Profile'}
          </button>

          {/* Skip */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 text-gray-500 text-sm hover:text-gray-700"
            >
              Skip for now
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
