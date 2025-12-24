'use client'

import { useState, useEffect, useMemo } from 'react'
import { EnhancedBuilding } from '@/lib/getBuildingsData'
import { getCurrentProfile, UserProfile } from '@/lib/profileStorage'
import { MutualAidPost, ResourceItem, MutualAidCategory, CATEGORY_LABELS, getMutualAidPosts, getResourceItems, createPost, SkillProfile, SkillCategory, SKILL_LABELS, SkillEntry, getSkillProfiles, saveSkillProfile, getSkillProfile, ResourceCategory, RESOURCE_LABELS, createResourceItem, checkOutResource, returnResource } from '@/lib/mutualAidStorage'
import { LinkedPropertyGroup, getLinkedGroups, generateBlockName } from '@/lib/linkedPropertiesStorage'
import { BlockCard } from './BlockCard'
import { BlockDetailView } from './BlockDetailView'
import { BlockEventForm } from './BlockEventForm'

type ViewMode = 'needs' | 'offers' | 'skills' | 'library' | 'blocks'
type FilterMode = 'all' | 'byBuilding' | 'myBuilding'

interface MutualAidPageProps {
  buildings: EnhancedBuilding[]
}

// All categories as arrays
const CATEGORIES = Object.keys(CATEGORY_LABELS) as MutualAidCategory[]
const SKILL_CATEGORIES = Object.keys(SKILL_LABELS) as SkillCategory[]
const RESOURCE_CATEGORIES = Object.keys(RESOURCE_LABELS) as ResourceCategory[]

export function MutualAidPage({ buildings }: MutualAidPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('needs')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [selectedBuilding, setSelectedBuilding] = useState<EnhancedBuilding | null>(null)
  const [posts, setPosts] = useState<MutualAidPost[]>([])
  const [resources, setResources] = useState<ResourceItem[]>([])
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list')
  const [selectedItem, setSelectedItem] = useState<MutualAidPost | ResourceItem | null>(null)
  const [hasProfile, setHasProfile] = useState(false)
  const [myBuildingId, setMyBuildingId] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [skillProfiles, setSkillProfiles] = useState<SkillProfile[]>([])
  const [mySkillProfile, setMySkillProfile] = useState<SkillProfile | null>(null)

  // Create Post Form State
  const [showSkillForm, setShowSkillForm] = useState(false)
  const [skillFormEntries, setSkillFormEntries] = useState<SkillEntry[]>([])
  const [skillFormAvailability, setSkillFormAvailability] = useState('')
  const [skillFormLanguages, setSkillFormLanguages] = useState('')

  // Resource Library Form State
  const [showResourceForm, setShowResourceForm] = useState(false)
  const [resourceName, setResourceName] = useState('')
  const [resourceDescription, setResourceDescription] = useState('')
  const [resourceCategory, setResourceCategory] = useState<ResourceCategory>('tool')
  const [resourceBuildingApn, setResourceBuildingApn] = useState('')
  const [resourceBuildingSearch, setResourceBuildingSearch] = useState('')

  // Create Post Form State
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createType, setCreateType] = useState<'need' | 'offer'>('need')
  const [formTitle, setFormTitle] = useState('')
  const [formCategory, setFormCategory] = useState<MutualAidCategory>('other')
  const [formDetails, setFormDetails] = useState('')
  const [formBuildingApn, setFormBuildingApn] = useState('')
  const [buildingSearch, setBuildingSearch] = useState('')

  // Filter buildings for post form selector
  const filteredBuildings = useMemo(() => {
    if (!buildingSearch.trim()) return buildings.slice(0, 20)
    const search = buildingSearch.toLowerCase()
    return buildings
      .filter(b =>
        b.address.toLowerCase().includes(search) ||
        (b.propertyName && b.propertyName.toLowerCase().includes(search))
      )
      .slice(0, 20)
  }, [buildings, buildingSearch])

  // Filter buildings for resource form selector
  const filteredResourceBuildings = useMemo(() => {
    if (!resourceBuildingSearch.trim()) return buildings.slice(0, 20)
    const search = resourceBuildingSearch.toLowerCase()
    return buildings
      .filter(b =>
        b.address.toLowerCase().includes(search) ||
        (b.propertyName && b.propertyName.toLowerCase().includes(search))
      )
      .slice(0, 20)
  }, [buildings, resourceBuildingSearch])

  // Check profile on mount
  useEffect(() => {
    const currentProfile = getCurrentProfile()
    setProfile(currentProfile)
    setHasProfile(!!currentProfile)
    // Get user's building from profile (buildingId is the APN)
    setMyBuildingId(currentProfile?.buildingId || null)
    // Default form buildings to user's building
    if (currentProfile?.buildingId) {
      setFormBuildingApn(currentProfile.buildingId)
      setResourceBuildingApn(currentProfile.buildingId)
    }
  }, [])

  // Load data on mount
  useEffect(() => {
    setPosts(getMutualAidPosts())
    setResources(getResourceItems())
    setSkillProfiles(getSkillProfiles())
    setLinkedGroups(getLinkedGroups().filter(g => g.apns.length > 0))
  }, [])

  // Load user's skill profile
  useEffect(() => {
    if (profile) {
      const myProfile = getSkillProfile(profile.id)
      setMySkillProfile(myProfile)
    }
  }, [profile])

  // Filter posts based on view mode and filter
  const filteredPosts = posts.filter(post => {
    // Filter by type (needs vs offers)
    if (viewMode === 'needs' && post.type !== 'need') return false
    if (viewMode === 'offers' && post.type !== 'offer') return false

    // Filter by building
    if (filterMode === 'myBuilding' && myBuildingId) {
      if (post.buildingApn !== myBuildingId) return false
    }
    if (filterMode === 'byBuilding' && selectedBuilding) {
      if (post.buildingApn !== selectedBuilding.apn) return false
    }

    // Filter out expired
    if (post.status === 'expired') return false

    return true
  })

  // Filter resources
  const filteredResources = resources.filter(item => {
    if (filterMode === 'myBuilding' && myBuildingId) {
      if (item.buildingApn !== myBuildingId) return false
    }
    if (filterMode === 'byBuilding' && selectedBuilding) {
      if (item.buildingApn !== selectedBuilding.apn) return false
    }
    return true
  })

  // Filter skill profiles
  const filteredSkillProfiles = skillProfiles.filter(sp => {
    if (filterMode === 'myBuilding' && myBuildingId) {
      if (sp.buildingApn !== myBuildingId) return false
    }
    if (filterMode === 'byBuilding' && selectedBuilding) {
      if (sp.buildingApn !== selectedBuilding.apn) return false
    }
    return true
  })

  const handleSelectPost = (post: MutualAidPost) => {
    setSelectedItem(post)
    setMobileView('detail')
  }

  const handleSelectResource = (resource: ResourceItem) => {
    setSelectedItem(resource)
    setMobileView('detail')
  }

  // Open create form
  const handleOpenCreateForm = (type: 'need' | 'offer') => {
    setCreateType(type)
    setFormTitle('')
    setFormCategory('other')
    setFormDetails('')
    setBuildingSearch('')
    // Keep the building at user's default if set
    if (profile?.buildingId) {
      setFormBuildingApn(profile.buildingId)
    }
    setShowCreateForm(true)
  }

  // Submit post
  const handleSubmitPost = () => {
    if (!profile || !formTitle.trim() || !formDetails.trim() || !formBuildingApn) return

    const building = buildings.find(b => b.apn === formBuildingApn)
    if (!building) return

    createPost(
      createType,
      formCategory,
      formTitle.trim(),
      formDetails.trim(),
      formBuildingApn,
      building.address,
      profile.id,
      profile.nickname
    )

    // Refresh posts and close form
    setPosts(getMutualAidPosts())
    setShowCreateForm(false)
  }

  // Get selected building info for form
  const selectedFormBuilding = useMemo(() => {
    return buildings.find(b => b.apn === formBuildingApn) || null
  }, [buildings, formBuildingApn])

  // Open skill registration form
  const handleOpenSkillForm = () => {
    if (mySkillProfile) {
      // Edit existing profile
      setSkillFormEntries([...mySkillProfile.skills])
      setSkillFormAvailability(mySkillProfile.availability)
      setSkillFormLanguages(mySkillProfile.languages?.join(', ') || '')
    } else {
      // New profile
      setSkillFormEntries([])
      setSkillFormAvailability('')
      setSkillFormLanguages('')
    }
    setShowSkillForm(true)
  }

  // Toggle skill in form
  const handleToggleSkill = (category: SkillCategory) => {
    setSkillFormEntries(prev => {
      const existing = prev.find(e => e.category === category)
      if (existing) {
        return prev.filter(e => e.category !== category)
      } else {
        return [...prev, { category }]
      }
    })
  }

  // Submit skill profile
  const handleSubmitSkills = () => {
    if (!profile || skillFormEntries.length === 0) return

    const building = profile.buildingId ? buildings.find(b => b.apn === profile.buildingId) : null

    const skillProfile: SkillProfile = {
      memberId: profile.id,
      memberName: profile.nickname,
      buildingApn: profile.buildingId,
      buildingAddress: building?.address,
      skills: skillFormEntries,
      availability: skillFormAvailability,
      contactPreference: 'profile',
      languages: skillFormLanguages ? skillFormLanguages.split(',').map(l => l.trim()).filter(Boolean) : undefined
    }

    saveSkillProfile(skillProfile)
    setMySkillProfile(skillProfile)
    setSkillProfiles(getSkillProfiles())
    setShowSkillForm(false)
  }

  // Select skill profile for detail view
  const handleSelectSkillProfile = (sp: SkillProfile) => {
    setSelectedItem(null) // Clear other selections
    setMobileView('detail')
    // We'll use a special state or pass to detail view
  }

  // Currently selected skill profile for detail view
  const [selectedSkillProfile, setSelectedSkillProfile] = useState<SkillProfile | null>(null)

  // Blocks state
  const [linkedGroups, setLinkedGroups] = useState<LinkedPropertyGroup[]>([])
  const [selectedBlock, setSelectedBlock] = useState<LinkedPropertyGroup | null>(null)
  const [showBlockEventForm, setShowBlockEventForm] = useState(false)

  const handleViewSkillProfile = (sp: SkillProfile) => {
    setSelectedSkillProfile(sp)
    setSelectedItem(null)
    setMobileView('detail')
  }

  // Resource Library Handlers
  const handleOpenResourceForm = () => {
    setResourceName('')
    setResourceDescription('')
    setResourceCategory('tool')
    setResourceBuildingSearch('')
    if (profile?.buildingId) {
      setResourceBuildingApn(profile.buildingId)
    }
    setShowResourceForm(true)
  }

  const handleSubmitResource = () => {
    if (!profile || !resourceName.trim() || !resourceDescription.trim() || !resourceBuildingApn) return

    const building = buildings.find(b => b.apn === resourceBuildingApn)
    if (!building) return

    createResourceItem(
      resourceName.trim(),
      resourceDescription.trim(),
      resourceCategory,
      profile.id,
      profile.nickname,
      resourceBuildingApn,
      building.address
    )

    // Refresh resources and close form
    setResources(getResourceItems())
    setShowResourceForm(false)
  }

  const handleCheckOutResource = (resourceId: string) => {
    if (!profile) return
    checkOutResource(resourceId, profile.id)
    setResources(getResourceItems())
  }

  const handleReturnResource = (resourceId: string) => {
    returnResource(resourceId)
    setResources(getResourceItems())
  }

  // Get selected resource building for form
  const selectedResourceBuilding = useMemo(() => {
    return buildings.find(b => b.apn === resourceBuildingApn) || null
  }, [buildings, resourceBuildingApn])

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-gray-50">
      {/* Left Panel - Browse & Filter */}
      <div className={`${mobileView === 'list' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-2/5 bg-white border-r border-gray-200 h-full overflow-hidden`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-gray-900">Mutual Aid</h1>
            {hasProfile && (viewMode === 'needs' || viewMode === 'offers') && (
              <button
                onClick={() => handleOpenCreateForm(viewMode === 'needs' ? 'need' : 'offer')}
                className="px-3 py-1 text-xs font-medium bg-rstu-red text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Post
              </button>
            )}
            {hasProfile && viewMode === 'library' && (
              <button
                onClick={handleOpenResourceForm}
                className="px-3 py-1 text-xs font-medium bg-rstu-red text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
            )}
          </div>

          {/* View Mode Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-3">
            {(['needs', 'offers', 'skills', 'library', 'blocks'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setViewMode(mode)
                  if (mode !== 'blocks') {
                    setSelectedBlock(null)
                  }
                }}
                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode === 'needs' ? 'Needs' : mode === 'offers' ? 'Offers' : mode === 'skills' ? 'Skills' : mode === 'library' ? 'Library' : 'Blocks'}
              </button>
            ))}
          </div>

          {/* Filter Mode */}
          <div className="flex gap-2">
            {(['all', 'byBuilding', 'myBuilding'] as FilterMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`flex-1 px-2 py-1 text-xs rounded-md border transition-colors ${
                  filterMode === mode
                    ? 'bg-gray-800 border-gray-800 text-white'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {mode === 'all' ? 'All' : mode === 'byBuilding' ? 'By Building' : 'My Building'}
              </button>
            ))}
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'needs' || viewMode === 'offers' ? (
            filteredPosts.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {filteredPosts.map((post) => (
                  <li
                    key={post.id}
                    onClick={() => handleSelectPost(post)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedItem && 'id' in selectedItem && selectedItem.id === post.id ? 'bg-red-50 border-l-4 border-rstu-red' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-gray-900 truncate">{post.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{post.buildingAddress}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            post.type === 'need' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {CATEGORY_LABELS[post.category]}
                          </span>
                          <span className={`text-xs ${
                            post.status === 'open' ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {post.status === 'open' ? 'Open' : post.status === 'in_progress' ? 'In Progress' : 'Fulfilled'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">No {viewMode} posted yet.</p>
                {hasProfile ? (
                  <button
                    onClick={() => handleOpenCreateForm(viewMode === 'needs' ? 'need' : 'offer')}
                    className="mt-4 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Post a {viewMode === 'needs' ? 'Need' : 'Offer'}
                  </button>
                ) : (
                  <p className="mt-2 text-xs text-gray-400">Create a profile to post</p>
                )}
              </div>
            )
          ) : viewMode === 'library' ? (
            filteredResources.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {filteredResources.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => handleSelectResource(item)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedItem && 'id' in selectedItem && selectedItem.id === item.id ? 'bg-red-50 border-l-4 border-rstu-red' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-gray-900 truncate">{item.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{item.buildingAddress}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {item.category}
                          </span>
                          <span className={`text-xs ${
                            item.status === 'available' ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {item.status === 'available' ? 'Available' : 'Checked Out'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">No items in the library yet.</p>
                {hasProfile ? (
                  <button
                    onClick={handleOpenResourceForm}
                    className="mt-4 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Add an Item
                  </button>
                ) : (
                  <p className="mt-2 text-xs text-gray-400">Create a profile to add items</p>
                )}
              </div>
            )
          ) : viewMode === 'skills' ? (
            // Skills directory
            <div>
              {/* My Skills Banner */}
              {hasProfile && (
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  {mySkillProfile ? (
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        You&apos;re sharing {mySkillProfile.skills.length} skill{mySkillProfile.skills.length !== 1 ? 's' : ''}
                      </div>
                      <button
                        onClick={handleOpenSkillForm}
                        className="text-xs text-rstu-red hover:underline"
                      >
                        Edit Skills
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleOpenSkillForm}
                      className="w-full py-2 text-sm font-medium text-rstu-red border border-rstu-red rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Register Your Skills
                    </button>
                  )}
                </div>
              )}

              {filteredSkillProfiles.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {filteredSkillProfiles.map((sp) => (
                    <li
                      key={sp.memberId}
                      onClick={() => handleViewSkillProfile(sp)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedSkillProfile?.memberId === sp.memberId ? 'bg-red-50 border-l-4 border-rstu-red' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-gray-900">{sp.memberName}</h3>
                          {sp.buildingAddress && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{sp.buildingAddress}</p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {sp.skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill.category}
                                className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700"
                              >
                                {SKILL_LABELS[skill.category]}
                              </span>
                            ))}
                            {sp.skills.length > 3 && (
                              <span className="text-xs text-gray-400">+{sp.skills.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-sm">No skills registered yet.</p>
                  {hasProfile ? (
                    <button
                      onClick={handleOpenSkillForm}
                      className="mt-4 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Be the First
                    </button>
                  ) : (
                    <p className="mt-2 text-xs text-gray-400">Create a profile to register skills</p>
                  )}
                </div>
              )}
            </div>
          ) : viewMode === 'blocks' ? (
            // Blocks directory
            <div className="p-4">
              {linkedGroups.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {linkedGroups.map((group) => {
                    const groupAddresses = buildings.filter(b => group.apns.includes(b.apn)).map(b => b.address)
                    return (
                      <BlockCard
                        key={group.id}
                        group={group}
                        addresses={groupAddresses}
                        onClick={() => {
                          setSelectedBlock(group)
                          setSelectedSkillProfile(null)
                          setSelectedItem(null)
                          setMobileView('detail')
                        }}
                        isSelected={selectedBlock?.id === group.id}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-sm font-medium">No Blocks Yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Blocks are created when properties are linked together in the Organize tab.
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Should not reach here
            null
          )}
        </div>
      </div>

      {/* Right Panel - Detail View */}
      <div className={`${mobileView === 'detail' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-3/5 bg-white h-full overflow-hidden`}>
        {/* Mobile back button */}
        <div className="md:hidden p-4 border-b border-gray-200 flex items-center gap-3">
          <button
            onClick={() => setMobileView('list')}
            className="p-1 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-900">Back to list</span>
        </div>

        {selectedBlock ? (
          // Block detail view
          <BlockDetailView
            group={selectedBlock}
            buildings={buildings}
            onClose={() => {
              setSelectedBlock(null)
              setMobileView('list')
            }}
            onOpenEventForm={() => setShowBlockEventForm(true)}
          />
        ) : selectedSkillProfile ? (
          // Skill profile detail view
          <div className="flex-1 overflow-y-auto p-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedSkillProfile.memberName}</h2>
                  {selectedSkillProfile.buildingAddress && (
                    <p className="text-sm text-gray-500">{selectedSkillProfile.buildingAddress}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSkillProfile.skills.map((skill) => (
                    <span
                      key={skill.category}
                      className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-700"
                    >
                      {SKILL_LABELS[skill.category]}
                    </span>
                  ))}
                </div>
              </div>

              {selectedSkillProfile.languages && selectedSkillProfile.languages.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkillProfile.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedSkillProfile.availability && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Availability</h3>
                  <p className="text-sm text-gray-600">{selectedSkillProfile.availability}</p>
                </div>
              )}

              <p className="text-xs text-gray-400 italic mt-6">
                Contact through their profile to request help
              </p>
            </div>
          </div>
        ) : selectedItem ? (
          <div className="flex-1 overflow-y-auto p-6">
            {'type' in selectedItem ? (
              // Post detail
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedItem.type === 'need' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {selectedItem.type === 'need' ? 'Need' : 'Offer'}: {CATEGORY_LABELS[selectedItem.category]}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 mt-2">{selectedItem.title}</h2>
                  </div>
                  <span className={`text-sm font-medium ${
                    selectedItem.status === 'open' ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {selectedItem.status === 'open' ? 'Open' : selectedItem.status === 'in_progress' ? 'In Progress' : 'Fulfilled'}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{selectedItem.details}</p>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Building</h3>
                  <p className="text-sm text-gray-600">{selectedItem.buildingAddress}</p>
                </div>

                <div className="text-xs text-gray-400">
                  Posted by {selectedItem.authorName} &middot; {new Date(selectedItem.createdAt).toLocaleDateString()}
                </div>

                {hasProfile && selectedItem.status === 'open' && (
                  <button className="mt-6 w-full px-4 py-3 bg-rstu-red text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                    {selectedItem.type === 'need' ? 'Offer to Help' : 'Request This'}
                  </button>
                )}
              </div>
            ) : (
              // Resource detail
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {selectedItem.category}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 mt-2">{selectedItem.name}</h2>
                  </div>
                  <span className={`text-sm font-medium ${
                    selectedItem.status === 'available' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {selectedItem.status === 'available' ? 'Available' : 'Checked Out'}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{selectedItem.description}</p>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Pickup Location</h3>
                  <p className="text-sm text-gray-600">{selectedItem.buildingAddress}</p>
                </div>

                <div className="text-xs text-gray-400">
                  Shared by {selectedItem.ownerName}
                </div>

                {hasProfile && selectedItem.status === 'available' && selectedItem.ownerId !== profile?.id && (
                  <button
                    onClick={() => handleCheckOutResource(selectedItem.id)}
                    className="mt-6 w-full px-4 py-3 bg-rstu-red text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Check Out
                  </button>
                )}

                {hasProfile && selectedItem.status === 'checked_out' && selectedItem.checkedOutBy === profile?.id && (
                  <button
                    onClick={() => handleReturnResource(selectedItem.id)}
                    className="mt-6 w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Return Item
                  </button>
                )}

                {selectedItem.status === 'checked_out' && selectedItem.returnBy && (
                  <p className="mt-4 text-xs text-gray-400 text-center">
                    Expected return: {new Date(selectedItem.returnBy).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          // Empty state
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-sm">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Mutual Aid Network</h2>
              <p className="text-sm text-gray-500 mb-4">
                Share resources, skills, and support with fellow tenants. Select an item from the list to view details.
              </p>
              <p className="text-xs text-gray-400 italic">
                &quot;Mutual aid is collective coordination to meet each other&apos;s needs, usually from an awareness that the systems we have in place are not going to meet them.&quot;
              </p>
              <p className="text-xs text-gray-400 mt-1">— Dean Spade</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCreateForm(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                Post a {createType === 'need' ? 'Need' : 'Offer'}
              </h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="p-4 space-y-4">
              {/* Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCreateType('need')}
                    className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                      createType === 'need'
                        ? 'border-orange-300 bg-orange-50 text-orange-700 font-medium'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Need
                  </button>
                  <button
                    onClick={() => setCreateType('offer')}
                    className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                      createType === 'offer'
                        ? 'border-green-300 bg-green-50 text-green-700 font-medium'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Offer
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={createType === 'need' ? 'What do you need?' : 'What can you offer?'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as MutualAidCategory)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                <textarea
                  value={formDetails}
                  onChange={(e) => setFormDetails(e.target.value)}
                  placeholder="Describe your situation or what you can provide..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent resize-none"
                />
              </div>

              {/* Building Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
                {selectedFormBuilding ? (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedFormBuilding.address}</p>
                      {selectedFormBuilding.propertyName && (
                        <p className="text-xs text-gray-500">{selectedFormBuilding.propertyName}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setFormBuildingApn('')}
                      className="text-xs text-rstu-red hover:underline"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={buildingSearch}
                      onChange={(e) => setBuildingSearch(e.target.value)}
                      placeholder="Search by address or name..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                    />
                    {filteredBuildings.length > 0 && (
                      <div className="mt-1 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                        {filteredBuildings.map((b) => (
                          <button
                            key={b.apn}
                            onClick={() => {
                              setFormBuildingApn(b.apn)
                              setBuildingSearch('')
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                          >
                            <span className="font-medium text-gray-900">{b.address}</span>
                            {b.propertyName && (
                              <span className="text-gray-500 text-xs ml-2">{b.propertyName}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPost}
                disabled={!formTitle.trim() || !formDetails.trim() || !formBuildingApn}
                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  formTitle.trim() && formDetails.trim() && formBuildingApn
                    ? 'bg-rstu-red hover:bg-red-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Post {createType === 'need' ? 'Need' : 'Offer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skills Registration Modal */}
      {showSkillForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowSkillForm(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {mySkillProfile ? 'Edit Your Skills' : 'Register Your Skills'}
              </h2>
              <button
                onClick={() => setShowSkillForm(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="p-4 space-y-4">
              {/* Skills Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What skills can you offer? (select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SKILL_CATEGORIES.map((cat) => {
                    const isSelected = skillFormEntries.some(e => e.category === cat)
                    return (
                      <button
                        key={cat}
                        onClick={() => handleToggleSkill(cat)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left ${
                          isSelected
                            ? 'border-purple-300 bg-purple-50 text-purple-700 font-medium'
                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {SKILL_LABELS[cat]}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Languages you speak (comma separated)
                </label>
                <input
                  type="text"
                  value={skillFormLanguages}
                  onChange={(e) => setSkillFormLanguages(e.target.value)}
                  placeholder="e.g. English, Spanish, Tagalog"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                />
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  When are you available?
                </label>
                <input
                  type="text"
                  value={skillFormAvailability}
                  onChange={(e) => setSkillFormAvailability(e.target.value)}
                  placeholder="e.g. Weekends, Evenings after 6pm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowSkillForm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitSkills}
                disabled={skillFormEntries.length === 0}
                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  skillFormEntries.length > 0
                    ? 'bg-rstu-red hover:bg-red-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Save Skills
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resource Library Form Modal */}
      {showResourceForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowResourceForm(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Add to Library</h2>
              <button
                onClick={() => setShowResourceForm(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="p-4 space-y-4">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={resourceName}
                  onChange={(e) => setResourceName(e.target.value)}
                  placeholder="e.g. Electric Drill, The Grapes of Wrath"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {RESOURCE_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setResourceCategory(cat)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        resourceCategory === cat
                          ? 'border-blue-300 bg-blue-50 text-blue-700 font-medium'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {RESOURCE_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={resourceDescription}
                  onChange={(e) => setResourceDescription(e.target.value)}
                  placeholder="Describe the item, condition, any notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent resize-none"
                />
              </div>

              {/* Pickup Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                {selectedResourceBuilding ? (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedResourceBuilding.address}</p>
                      {selectedResourceBuilding.propertyName && (
                        <p className="text-xs text-gray-500">{selectedResourceBuilding.propertyName}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setResourceBuildingApn('')}
                      className="text-xs text-rstu-red hover:underline"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={resourceBuildingSearch}
                      onChange={(e) => setResourceBuildingSearch(e.target.value)}
                      placeholder="Search by address or name..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                    />
                    {filteredResourceBuildings.length > 0 && (
                      <div className="mt-1 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                        {filteredResourceBuildings.map((b) => (
                          <button
                            key={b.apn}
                            onClick={() => {
                              setResourceBuildingApn(b.apn)
                              setResourceBuildingSearch('')
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                          >
                            <span className="font-medium text-gray-900">{b.address}</span>
                            {b.propertyName && (
                              <span className="text-gray-500 text-xs ml-2">{b.propertyName}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowResourceForm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitResource}
                disabled={!resourceName.trim() || !resourceDescription.trim() || !resourceBuildingApn}
                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  resourceName.trim() && resourceDescription.trim() && resourceBuildingApn
                    ? 'bg-rstu-red hover:bg-red-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Add to Library
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Event Form Modal */}
      {showBlockEventForm && selectedBlock && (
        <BlockEventForm
          group={selectedBlock}
          buildings={buildings}
          onClose={() => setShowBlockEventForm(false)}
          onSuccess={() => {
            setShowBlockEventForm(false)
            // Refresh to show new event
            setLinkedGroups(getLinkedGroups().filter(g => g.apns.length > 0))
          }}
        />
      )}
    </div>
  )
}
