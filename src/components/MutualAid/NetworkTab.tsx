'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { getCurrentProfile } from '@/lib/storage/profileStorage'
import {
  getExternalOrganizations,
  getPublicCollectives,
  getUserCollectives,
  type ExternalOrganization,
  type InternalOrganization,
  getInternalOrganization,
} from '@/lib/storage/organizationStorage'
import { InternalOrgCard } from './InternalOrgCard'
import { InternalOrgDetailView } from './InternalOrgDetailView'
import { FormCollectiveModal } from './FormCollectiveModal'
import { ResourceDirectory } from './ResourceDirectory'

// Load seed data on first use
import externalResourcesData from '@/data/external-resources.json'

type NetworkView = 'resources' | 'collectives'
type CollectiveFilter = 'all' | 'my-collectives'

interface NetworkTabProps {
  onSelectCollective?: (org: InternalOrganization) => void
}

export function NetworkTab({ onSelectCollective }: NetworkTabProps) {
  const { t } = useLanguage()
  const [activeView, setActiveView] = useState<NetworkView>('resources')
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
      orgs = externalResourcesData.organizations as unknown as ExternalOrganization[]
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
            {t('network.resources')}
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
            {t('network.collectives')}
            <span className="ml-1.5 text-xs opacity-75">({collectives.length})</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Resources View */}
        {activeView === 'resources' && (
          <ResourceDirectory organizations={externalOrgs} />
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
                  {t('network.allPublic')}
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
                    {t('network.myCollectives')}
                  </button>
                )}
              </div>

              {/* Form Collective button */}
              {profile && (
                <button
                  onClick={() => setShowFormModal(true)}
                  className="px-3 py-1.5 text-xs font-medium bg-rstu-red text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t('network.formCollectiveBtn')}
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
                  <p className="text-gray-600 font-medium mb-1">{t('network.noCollectivesYet')}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {collectiveFilter === 'my-collectives'
                      ? t('network.notJoinedAny')
                      : t('network.beFirstToForm')}
                  </p>
                  {profile && collectiveFilter !== 'my-collectives' && (
                    <button
                      onClick={() => setShowFormModal(true)}
                      className="px-4 py-2 text-sm font-medium bg-rstu-red text-white rounded-lg hover:bg-red-700"
                    >
                      {t('network.formACollective')}
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
                <h4 className="text-sm font-medium text-blue-900 mb-1">{t('network.whatAreCollectives')}</h4>
                <p className="text-xs text-blue-700">
                  {t('network.collectivesDescription')}
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
