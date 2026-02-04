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
  type ExternalOrganization,
  type ExternalResourceCategory,
  type CustomCategory,
} from '@/lib/organizationStorage'
import { getCurrentProfile } from '@/lib/profileStorage'
import { useLanguage } from '@/contexts/LanguageContext'
import { AddCategoryModal } from './AddCategoryModal'
import { AddOrganizationModal } from './AddOrganizationModal'
import { EditCategoryModal } from './EditCategoryModal'
import { DeleteCategoryDialog } from './DeleteCategoryDialog'
import { EditOrganizationModal } from './EditOrganizationModal'
import { DeleteOrganizationDialog } from './DeleteOrganizationDialog'
import { ResourceCard } from './ResourceCard'

// Load seed data
import externalResourcesData from '@/data/external-resources.json'

// Category order for filter pills
const CATEGORY_ORDER: ExternalResourceCategory[] = [
  'food',
  'shelter',
  'emergency_aid',
  'housing_services',
  'legal_aid',
  'health_services',
  'crisis_mental_health',
  'senior_services',
  'employment_training',
  'childcare',
  'transportation',
  'disability_services',
  'lgbtq_services',
  'reentry_services',
  'government',
  'mutual_aid',
  'advocacy',
  'faith',
  'pet_services',
  'other',
]

export function ResourcesPage() {
  const { t } = useLanguage()
  const [organizations, setOrganizations] = useState<ExternalOrganization[]>([])
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())

  // Modal state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [showAddOrgModal, setShowAddOrgModal] = useState(false)
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false)
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false)
  const [showEditOrgModal, setShowEditOrgModal] = useState(false)
  const [showDeleteOrgDialog, setShowDeleteOrgDialog] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<ExternalOrganization | null>(null)
  const [selectedCustomCat, setSelectedCustomCat] = useState<CustomCategory | null>(null)

  // Load organizations
  useEffect(() => {
    let orgs = getExternalOrganizations()
    if (orgs.length === 0) {
      orgs = externalResourcesData.organizations as ExternalOrganization[]
    }
    orgs.sort((a, b) => a.name.localeCompare(b.name))
    setOrganizations(orgs)
    setCustomCategories(getCustomCategories())
  }, [])

  // Check permissions
  const profile = getCurrentProfile()
  const canManage = profile?.role === 'admin' || profile?.role === 'organizer'

  // Count orgs per category
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    organizations.forEach(org => {
      counts.set(org.category, (counts.get(org.category) || 0) + 1)
    })
    return counts
  }, [organizations])

  // Categories that have orgs (built-in + custom)
  const categoriesWithOrgs = useMemo(() => {
    const builtIn = CATEGORY_ORDER.filter(cat => (categoryCounts.get(cat) || 0) > 0)
    const custom = customCategories.filter(cat => (categoryCounts.get(cat.id) || 0) > 0)
    return { builtIn, custom }
  }, [categoryCounts, customCategories])

  // Filter organizations
  const filteredOrgs = useMemo(() => {
    let result = organizations

    // Category filter
    if (selectedCategories.size > 0) {
      result = result.filter(org => selectedCategories.has(org.category))
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(org =>
        org.name.toLowerCase().includes(q) ||
        org.description.toLowerCase().includes(q) ||
        (org.eligibility?.toLowerCase().includes(q)) ||
        (org.serviceArea?.toLowerCase().includes(q))
      )
    }

    return result
  }, [organizations, selectedCategories, searchQuery])

  // Toggle category filter
  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev)
      if (next.has(catId)) {
        next.delete(catId)
      } else {
        next.add(catId)
      }
      return next
    })
  }

  const clearFilters = () => {
    setSelectedCategories(new Set())
    setSearchQuery('')
  }

  // CRUD handlers
  const handleCategoryCreated = (category: CustomCategory) => {
    setCustomCategories(prev => [...prev, category])
    setShowAddCategoryModal(false)
  }

  const handleCategoryUpdated = (updated: CustomCategory) => {
    setCustomCategories(prev => prev.map(c => c.id === updated.id ? updated : c))
    setShowEditCategoryModal(false)
    setSelectedCustomCat(null)
  }

  const handleCategoryDeleted = () => {
    if (selectedCustomCat) {
      setCustomCategories(prev => prev.filter(c => c.id !== selectedCustomCat.id))
    }
    setShowDeleteCategoryDialog(false)
    setSelectedCustomCat(null)
  }

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

  // Get category label for filter pills
  const getCategoryLabel = (catId: string): string => {
    // Check built-in first
    if (CATEGORY_ORDER.includes(catId as ExternalResourceCategory)) {
      return t(`resources.cat.${catId}`)
    }
    // Custom category
    const custom = customCategories.find(c => c.id === catId)
    return custom?.name || catId
  }

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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title={t('resources.addCategory')}
              >
                <PlusIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowAddOrgModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rstu-red text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <PlusIcon className="w-4 h-4" />
                {t('resources.addOrganization')}
              </button>
            </div>
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

        {/* Category filter pills */}
        <div
          role="group"
          aria-label={t('resources.filterByCategory')}
          className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide"
        >
          {/* All button */}
          <button
            onClick={clearFilters}
            aria-pressed={selectedCategories.size === 0}
            className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              selectedCategories.size === 0
                ? 'bg-rstu-red text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('resources.all')} ({organizations.length})
          </button>

          {/* Built-in category pills */}
          {categoriesWithOrgs.builtIn.map(cat => {
            const count = categoryCounts.get(cat) || 0
            const isSelected = selectedCategories.has(cat)
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                aria-pressed={isSelected}
                className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  isSelected
                    ? 'bg-rstu-red text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t(`resources.cat.${cat}`)} ({count})
              </button>
            )
          })}

          {/* Custom category pills */}
          {categoriesWithOrgs.custom.map(cat => {
            const count = categoryCounts.get(cat.id) || 0
            const isSelected = selectedCategories.has(cat.id)
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                aria-pressed={isSelected}
                className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  isSelected
                    ? 'bg-rstu-red text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            )
          })}
        </div>

        {/* Result count */}
        <p aria-live="polite" className="text-xs text-gray-500">
          {filteredOrgs.length === organizations.length
            ? t('resources.totalCount', { count: organizations.length.toString() })
            : `${filteredOrgs.length} / ${organizations.length} ${t('resources.resourcesPlural')}`
          }
          {(selectedCategories.size > 0 || searchQuery) && (
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
          {filteredOrgs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium text-gray-700">{t('resources.noResults')}</p>
              <p className="text-sm mt-1">{t('resources.tryDifferentSearch')}</p>
              {(selectedCategories.size > 0 || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="mt-3 text-sm text-rstu-red hover:underline font-medium"
                >
                  {t('resources.clearFilters')}
                </button>
              )}
            </div>
          ) : (
            filteredOrgs.map(org => (
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
            ))
          )}

          {/* Footer */}
          {filteredOrgs.length > 0 && (
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
      {showAddCategoryModal && profile && (
        <AddCategoryModal
          isOpen={showAddCategoryModal}
          onClose={() => setShowAddCategoryModal(false)}
          onCreated={handleCategoryCreated}
          creatorId={profile.id}
        />
      )}

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

      {showEditCategoryModal && selectedCustomCat && (
        <EditCategoryModal
          isOpen={showEditCategoryModal}
          onClose={() => { setShowEditCategoryModal(false); setSelectedCustomCat(null) }}
          onUpdated={handleCategoryUpdated}
          category={selectedCustomCat}
        />
      )}

      {showDeleteCategoryDialog && selectedCustomCat && (
        <DeleteCategoryDialog
          isOpen={showDeleteCategoryDialog}
          onClose={() => { setShowDeleteCategoryDialog(false); setSelectedCustomCat(null) }}
          onDeleted={handleCategoryDeleted}
          category={selectedCustomCat}
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
