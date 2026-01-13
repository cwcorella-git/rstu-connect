'use client'

import { useState, useEffect } from 'react'
import { getCurrentProfile } from '@/lib/profileStorage'
import {
  getExternalOrganizations,
  getPublicCollectives,
  getUserCollectives,
  type ExternalOrganization,
  type InternalOrganization,
  type ExternalResourceCategory,
  EXTERNAL_CATEGORY_LABELS,
} from '@/lib/organizationStorage'
import { ExternalOrgCard } from './ExternalOrgCard'
import { InternalOrgCard } from './InternalOrgCard'
import { InternalOrgDetailView } from './InternalOrgDetailView'
import { FormCollectiveModal } from './FormCollectiveModal'
import { getInternalOrganization } from '@/lib/organizationStorage'

// Load seed data on first use
import externalResourcesData from '@/data/external-resources.json'

type NetworkView = 'resources' | 'collectives'
type ResourceFilter = 'all' | ExternalResourceCategory
type CollectiveFilter = 'all' | 'my-collectives'

interface NetworkTabProps {
  onSelectCollective?: (org: InternalOrganization) => void
}

export function NetworkTab({ onSelectCollective }: NetworkTabProps) {
  const [activeView, setActiveView] = useState<NetworkView>('resources')
  const [resourceFilter, setResourceFilter] = useState<ResourceFilter>('all')
  const [collectiveFilter, setCollectiveFilter] = useState<CollectiveFilter>('all')

  const [externalOrgs, setExternalOrgs] = useState<ExternalOrganization[]>([])
  const [collectives, setCollectives] = useState<InternalOrganization[]>([])
  const [selectedCollective, setSelectedCollective] = useState<InternalOrganization | null>(null)
  const [showDetailView, setShowDetailView] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)

  const profile = getCurrentProfile()

  // Load external organizations (from localStorage or seed data)
  useEffect(() => {
    let orgs = getExternalOrganizations()

    // If no orgs in storage, use seed data
    if (orgs.length === 0) {
      orgs = externalResourcesData.organizations as ExternalOrganization[]
    }

    setExternalOrgs(orgs)
  }, [])

  // Load collectives
  useEffect(() => {
    if (collectiveFilter === 'my-collectives' && profile) {
      setCollectives(getUserCollectives(profile.id))
    } else {
      setCollectives(getPublicCollectives())
    }
  }, [collectiveFilter, profile])

  // Filter external orgs by category
  const filteredExternalOrgs = resourceFilter === 'all'
    ? externalOrgs
    : externalOrgs.filter(org => org.category === resourceFilter)

  // Resource category counts
  const categoryCounts = externalOrgs.reduce((acc, org) => {
    acc[org.category] = (acc[org.category] || 0) + 1
    return acc
  }, {} as Record<ExternalResourceCategory, number>)

  const handleCollectiveClick = (org: InternalOrganization) => {
    setSelectedCollective(org)
    setShowDetailView(true)
    onSelectCollective?.(org)
  }

  const handleCloseDetailView = () => {
    setShowDetailView(false)
  }

  const handleOrganizationUpdated = () => {
    // Refresh the selected organization
    if (selectedCollective) {
      const updated = getInternalOrganization(selectedCollective.id)
      if (updated) {
        setSelectedCollective(updated)
      }
    }
    // Refresh collectives list
    if (collectiveFilter === 'my-collectives' && profile) {
      setCollectives(getUserCollectives(profile.id))
    } else {
      setCollectives(getPublicCollectives())
    }
  }

  const handleCollectiveCreated = () => {
    // Refresh collectives list
    if (collectiveFilter === 'my-collectives' && profile) {
      setCollectives(getUserCollectives(profile.id))
    } else {
      setCollectives(getPublicCollectives())
    }
    // Switch to collectives view
    setActiveView('collectives')
  }

  return (
    <div className="h-full flex flex-col">
      {/* Sub-navigation */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-4">
        <div className="flex gap-1 py-2">
          <button
            onClick={() => setActiveView('resources')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeView === 'resources'
                ? 'bg-rstu-red text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Resources
            <span className="ml-1.5 text-xs opacity-75">({externalOrgs.length})</span>
          </button>
          <button
            onClick={() => setActiveView('collectives')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeView === 'collectives'
                ? 'bg-rstu-red text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Collectives
            <span className="ml-1.5 text-xs opacity-75">({collectives.length})</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Resources View */}
        {activeView === 'resources' && (
          <div className="p-4">
            {/* Category filter */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setResourceFilter('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    resourceFilter === 'all'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All ({externalOrgs.length})
                </button>
                {(Object.keys(EXTERNAL_CATEGORY_LABELS) as ExternalResourceCategory[]).map(category => {
                  const count = categoryCounts[category] || 0
                  if (count === 0) return null
                  return (
                    <button
                      key={category}
                      onClick={() => setResourceFilter(category)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                        resourceFilter === category
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {EXTERNAL_CATEGORY_LABELS[category]} ({count})
                    </button>
                  )
                })}
              </div>
            </div>

            {/* External org cards */}
            <div className="space-y-3">
              {filteredExternalOrgs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No resources found in this category.</p>
                </div>
              ) : (
                filteredExternalOrgs.map(org => (
                  <ExternalOrgCard key={org.id} organization={org} />
                ))
              )}
            </div>

            {/* Footer info */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Resources curated from community knowledge.{' '}
                {profile?.role === 'admin' && (
                  <button className="text-blue-600 hover:underline">
                    Manage resources
                  </button>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Collectives View */}
        {activeView === 'collectives' && (
          <div className="p-4">
            {/* Filter */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setCollectiveFilter('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    collectiveFilter === 'all'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Public
                </button>
                {profile && (
                  <button
                    onClick={() => setCollectiveFilter('my-collectives')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      collectiveFilter === 'my-collectives'
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    My Collectives
                  </button>
                )}
              </div>

              {/* Form Collective button */}
              {profile && (
                <button
                  onClick={() => setShowFormModal(true)}
                  className="px-3 py-1.5 text-xs font-medium bg-rstu-red text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  + Form Collective
                </button>
              )}
            </div>

            {/* Collective cards */}
            <div className="space-y-3">
              {collectives.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium mb-1">No collectives yet</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {collectiveFilter === 'my-collectives'
                      ? "You haven't joined any collectives yet."
                      : 'Be the first to form a tenant collective!'}
                  </p>
                  {profile && collectiveFilter !== 'my-collectives' && (
                    <button
                      onClick={() => setShowFormModal(true)}
                      className="px-4 py-2 text-sm font-medium bg-rstu-red text-white rounded-lg hover:bg-red-700"
                    >
                      Form a Collective
                    </button>
                  )}
                </div>
              ) : (
                collectives.map(org => (
                  <InternalOrgCard
                    key={org.id}
                    organization={org}
                    onClick={() => handleCollectiveClick(org)}
                    isSelected={selectedCollective?.id === org.id}
                  />
                ))
              )}
            </div>

            {/* Info about collectives */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-1">What are Collectives?</h4>
                <p className="text-xs text-blue-700">
                  Collectives are tenant-formed groups organized around shared interests - working groups, neighborhood groups, or affinity groups. They have shared chat, events, and governance.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Collective Modal */}
      <FormCollectiveModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onCreated={handleCollectiveCreated}
      />

      {/* Collective Detail View Modal */}
      {showDetailView && selectedCollective && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 h-[90vh] overflow-hidden">
            <InternalOrgDetailView
              organization={selectedCollective}
              onClose={handleCloseDetailView}
              onOrganizationUpdated={handleOrganizationUpdated}
            />
          </div>
        </div>
      )}
    </div>
  )
}
