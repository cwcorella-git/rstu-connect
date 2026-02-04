'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import {
  getExternalOrganizations,
  getCustomCategories,
  RESOURCE_GROUPS,
  getGroupForCategory,
  type ExternalOrganization,
  type ExternalResourceCategory,
  type CustomCategory,
  type ResourceGroupId,
} from '@/lib/storage/organizationStorage'
import { getGroupIcon } from '@/lib/resourceIcons'
import { getCurrentProfile } from '@/lib/storage/profileStorage'
import { useLanguage } from '@/contexts/LanguageContext'
import { AddOrganizationModal } from './AddOrganizationModal'
import { EditOrganizationModal } from './EditOrganizationModal'
import { DeleteOrganizationDialog } from './DeleteOrganizationDialog'
import { ResourceCard } from './ResourceCard'

// Load seed data
import externalResourcesData from '@/data/external-resources.json'

export function ResourcesPage() {
  const { t, locale } = useLanguage()
  const [organizations, setOrganizations] = useState<ExternalOrganization[]>([])
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<ResourceGroupId | null>(null)

  // Modal state
  const [showAddOrgModal, setShowAddOrgModal] = useState(false)
  const [showEditOrgModal, setShowEditOrgModal] = useState(false)
  const [showDeleteOrgDialog, setShowDeleteOrgDialog] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<ExternalOrganization | null>(null)

  // Load organizations
  useEffect(() => {
    let orgs = getExternalOrganizations()
    if (orgs.length === 0) {
      orgs = externalResourcesData.organizations as unknown as ExternalOrganization[]
    }
    orgs.sort((a, b) => a.name.localeCompare(b.name))
    setOrganizations(orgs)
    setCustomCategories(getCustomCategories())
  }, [])

  // Check permissions
  const profile = getCurrentProfile()
  const canManage = profile?.role === 'admin' || profile?.role === 'organizer'

  // Count orgs per group
  const groupCounts = useMemo(() => {
    const counts = new Map<ResourceGroupId, number>()
    organizations.forEach(org => {
      const groupId = getGroupForCategory(org.category)
      counts.set(groupId, (counts.get(groupId) || 0) + 1)
    })
    return counts
  }, [organizations])

  const isSearching = searchQuery.trim().length > 0

  // Helper to get localized org field for search
  const getOrgField = (org: ExternalOrganization, field: 'description' | 'eligibility' | 'serviceArea'): string => {
    if (locale !== 'en' && org.translations?.[locale]?.[field]) {
      return org.translations[locale][field]!
    }
    return org[field] || ''
  }

  // Search-filtered orgs
  const searchFilteredOrgs = useMemo(() => {
    if (!isSearching) return organizations
    const q = searchQuery.toLowerCase()
    return organizations.filter(org =>
      org.name.toLowerCase().includes(q) ||
      getOrgField(org, 'description').toLowerCase().includes(q) ||
      getOrgField(org, 'eligibility').toLowerCase().includes(q) ||
      getOrgField(org, 'serviceArea').toLowerCase().includes(q)
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizations, searchQuery, isSearching, locale])

  // Build grouped structure for non-search views
  const groupedOrgs = useMemo(() => {
    if (isSearching) return null

    const base = selectedGroup
      ? organizations.filter(org => getGroupForCategory(org.category) === selectedGroup)
      : organizations

    const groups: { group: typeof RESOURCE_GROUPS[number]; orgs: ExternalOrganization[] }[] = []
    for (const group of RESOURCE_GROUPS) {
      const orgs = base.filter(org => {
        const orgGroup = getGroupForCategory(org.category)
        return orgGroup === group.id
      })
      if (orgs.length > 0) {
        groups.push({ group, orgs: orgs.sort((a, b) => a.name.localeCompare(b.name)) })
      }
    }
    return groups
  }, [organizations, selectedGroup, isSearching])

  // Flat count for result display
  const flatCount = useMemo(() => {
    if (isSearching) return searchFilteredOrgs.length
    if (selectedGroup) {
      return organizations.filter(org => getGroupForCategory(org.category) === selectedGroup).length
    }
    return organizations.length
  }, [organizations, searchFilteredOrgs, selectedGroup, isSearching])

  const toggleGroup = (groupId: ResourceGroupId) => {
    setSelectedGroup(prev => prev === groupId ? null : groupId)
  }

  const clearFilters = () => {
    setSelectedGroup(null)
    setSearchQuery('')
  }

  // CRUD handlers
  const handleOrgCreated = (org: ExternalOrganization) => {
    setOrganizations(prev => [...prev, org].sort((a, b) => a.name.localeCompare(b.name)))
    setShowAddOrgModal(false)
  }

  const handleOrgUpdated = (updated: ExternalOrganization) => {
    setOrganizations(prev => prev.map(o => o.id === updated.id ? updated : o))
    setSelectedOrg(null)
    setShowEditOrgModal(false)
  }

  const handleOrgDeleted = () => {
    if (selectedOrg) {
      setOrganizations(prev => prev.filter(o => o.id !== selectedOrg.id))
    }
    setSelectedOrg(null)
    setShowDeleteOrgDialog(false)
  }

  const renderOrgCard = (org: ExternalOrganization) => (
    <article key={org.id}>
      <ResourceCard
        organization={org}
        onEdit={canManage ? () => {
          setSelectedOrg(org)
          setShowEditOrgModal(true)
        } : undefined}
        onDelete={canManage ? () => {
          setSelectedOrg(org)
          setShowDeleteOrgDialog(true)
        } : undefined}
      />
    </article>
  )

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Sticky header with search + filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0 space-y-3">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{t('resources.directory')}</h1>
          </div>
          {canManage && (
            <button
              onClick={() => setShowAddOrgModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rstu-red text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              {t('resources.addOrganization')}
            </button>
          )}
        </div>

        {/* Search */}
        <div role="search" aria-label={t('resources.title')}>
          <label htmlFor="resource-search" className="sr-only">
            {t('resources.title')}
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="resource-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('resources.searchPlaceholder')}
              aria-describedby="resource-search-hint"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
            />
            <span id="resource-search-hint" className="sr-only">
              {t('resources.searchHint')}
            </span>
          </div>
        </div>

        {/* Group filter pills */}
        <div
          role="group"
          aria-label={t('resources.filterByCategory')}
          className="flex flex-wrap gap-2"
        >
          {/* All button */}
          <button
            onClick={clearFilters}
            aria-pressed={selectedGroup === null && !isSearching}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              selectedGroup === null
                ? 'bg-rstu-red text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('resources.all')} ({organizations.length})
          </button>

          {/* Group pills */}
          {RESOURCE_GROUPS.map(group => {
            const count = groupCounts.get(group.id) || 0
            if (count === 0) return null
            const isSelected = selectedGroup === group.id
            const isEmergency = group.id === 'emergency'
            const GroupIcon = getGroupIcon(group.id)
            return (
              <button
                key={group.id}
                onClick={() => toggleGroup(group.id)}
                aria-pressed={isSelected}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  isSelected
                    ? isEmergency
                      ? 'bg-red-700 text-white ring-2 ring-red-300'
                      : 'bg-rstu-red text-white'
                    : isEmergency
                      ? 'bg-red-50 text-red-700 border border-red-200 font-bold hover:bg-red-100'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <GroupIcon className="w-4 h-4" />
                {t(`resources.group.${group.id}`)} ({count})
              </button>
            )
          })}
        </div>

        {/* Result count */}
        <p aria-live="polite" className="text-xs text-gray-500">
          {flatCount === organizations.length
            ? t('resources.totalCount', { count: organizations.length.toString() })
            : `${flatCount} / ${organizations.length} ${t('resources.resourcesPlural')}`
          }
          {(selectedGroup !== null || searchQuery) && (
            <button
              onClick={clearFilters}
              className="ml-2 text-rstu-red hover:underline"
            >
              {t('resources.clearFilters')}
            </button>
          )}
        </p>
      </div>

      {/* Scrollable card list */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3 max-w-3xl mx-auto">
          {flatCount === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium text-gray-700">{t('resources.noResults')}</p>
              <p className="text-sm mt-1">{t('resources.tryDifferentSearch')}</p>
              {(selectedGroup !== null || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="mt-3 text-sm text-rstu-red hover:underline font-medium"
                >
                  {t('resources.clearFilters')}
                </button>
              )}
            </div>
          ) : isSearching ? (
            /* Search mode: flat list */
            searchFilteredOrgs.map(renderOrgCard)
          ) : (
            /* Grouped mode: section headers with cards */
            groupedOrgs?.map(({ group, orgs }) => (
              <section key={group.id} aria-labelledby={`group-${group.id}`}>
                {/* Section header */}
                {(() => {
                  const SectionIcon = getGroupIcon(group.id)
                  return (
                    <div
                      id={`group-${group.id}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-2 ${
                        group.id === 'emergency'
                          ? 'bg-red-50 border border-red-200'
                          : 'bg-gray-100'
                      }`}
                    >
                      <SectionIcon className={`w-5 h-5 ${group.id === 'emergency' ? 'text-red-700' : 'text-gray-600'}`} />
                      <h2 className={`text-sm font-bold ${
                        group.id === 'emergency' ? 'text-red-700' : 'text-gray-800'
                      }`}>
                        {t(`resources.group.${group.id}`)}
                      </h2>
                      <span className="text-xs text-gray-500 ml-auto">
                        {orgs.length}
                      </span>
                    </div>
                  )
                })()}
                {/* Cards within this group */}
                <div className="space-y-3 mb-6">
                  {orgs.map(renderOrgCard)}
                </div>
              </section>
            ))
          )}

          {/* Footer */}
          {flatCount > 0 && (
            <div className="pt-4 pb-2 text-center">
              <p className="text-xs text-gray-500">
                {t('resources.footerText')}{' '}
                <a
                  href="mailto:info@renosparkstenantsunion.org"
                  className="text-rstu-red hover:underline"
                >
                  {t('resources.contactUs')}
                </a>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddOrgModal && profile && (
        <AddOrganizationModal
          isOpen={showAddOrgModal}
          onClose={() => setShowAddOrgModal(false)}
          onCreated={handleOrgCreated}
          categoryId=""
          categoryName=""
          creatorId={profile.id}
        />
      )}

      {showEditOrgModal && selectedOrg && (
        <EditOrganizationModal
          isOpen={showEditOrgModal}
          onClose={() => { setShowEditOrgModal(false); setSelectedOrg(null) }}
          onUpdated={handleOrgUpdated}
          organization={selectedOrg}
        />
      )}

      {showDeleteOrgDialog && selectedOrg && (
        <DeleteOrganizationDialog
          isOpen={showDeleteOrgDialog}
          onClose={() => { setShowDeleteOrgDialog(false); setSelectedOrg(null) }}
          onDeleted={handleOrgDeleted}
          organization={selectedOrg}
        />
      )}
    </div>
  )
}
