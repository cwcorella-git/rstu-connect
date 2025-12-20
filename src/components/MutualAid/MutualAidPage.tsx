'use client'

import { useState, useEffect } from 'react'
import { EnhancedBuilding } from '@/lib/getBuildingsData'
import { getCurrentProfile } from '@/lib/profileStorage'
import { MutualAidPost, ResourceItem, MutualAidCategory, CATEGORY_LABELS, getMutualAidPosts, getResourceItems } from '@/lib/mutualAidStorage'

type ViewMode = 'needs' | 'offers' | 'skills' | 'library'
type FilterMode = 'all' | 'byBuilding' | 'myBuilding'

interface MutualAidPageProps {
  buildings: EnhancedBuilding[]
}

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

  // Check profile on mount
  useEffect(() => {
    const profile = getCurrentProfile()
    setHasProfile(!!profile)
    // Get user's building from profile (buildingId is the APN)
    setMyBuildingId(profile?.buildingId || null)
  }, [])

  // Load data on mount
  useEffect(() => {
    setPosts(getMutualAidPosts())
    setResources(getResourceItems())
  }, [])

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

  const handleSelectPost = (post: MutualAidPost) => {
    setSelectedItem(post)
    setMobileView('detail')
  }

  const handleSelectResource = (resource: ResourceItem) => {
    setSelectedItem(resource)
    setMobileView('detail')
  }

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-gray-50">
      {/* Left Panel - Browse & Filter */}
      <div className={`${mobileView === 'list' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-2/5 bg-white border-r border-gray-200 h-full overflow-hidden`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-lg font-bold text-gray-900 mb-3">Mutual Aid</h1>

          {/* View Mode Tabs */}
          <div className="flex gap-1 mb-3">
            {(['needs', 'offers', 'skills', 'library'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                  viewMode === mode
                    ? 'bg-rstu-red text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {mode === 'needs' ? 'Needs' : mode === 'offers' ? 'Offers' : mode === 'skills' ? 'Skills' : 'Library'}
              </button>
            ))}
          </div>

          {/* Filter Mode */}
          <div className="flex gap-1">
            {(['all', 'byBuilding', 'myBuilding'] as FilterMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                  filterMode === mode
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                  <button className="mt-4 px-4 py-2 bg-rstu-red text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
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
                  <button className="mt-4 px-4 py-2 bg-rstu-red text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                    Add an Item
                  </button>
                ) : (
                  <p className="mt-2 text-xs text-gray-400">Create a profile to add items</p>
                )}
              </div>
            )
          ) : (
            // Skills view - coming soon
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">Skills directory coming soon.</p>
              <p className="mt-2 text-xs text-gray-400">Browse skills offered by other tenants</p>
            </div>
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

        {selectedItem ? (
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

                {hasProfile && selectedItem.status === 'available' && (
                  <button className="mt-6 w-full px-4 py-3 bg-rstu-red text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                    Request to Borrow
                  </button>
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
    </div>
  )
}
