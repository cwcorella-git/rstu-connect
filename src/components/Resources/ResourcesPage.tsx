'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  getExternalOrganizations,
  type ExternalOrganization,
  type ExternalResourceCategory,
  EXTERNAL_CATEGORY_LABELS,
} from '@/lib/organizationStorage'
import { ResourceCard } from './ResourceCard'
import { useLanguage } from '@/contexts/LanguageContext'

// Load seed data
import externalResourcesData from '@/data/external-resources.json'

type FilterCategory = 'all' | ExternalResourceCategory

// Quick filter buttons for common needs
const QUICK_FILTERS: { label: string; categories: ExternalResourceCategory[] }[] = [
  { label: 'Food', categories: ['food', 'mutual_aid'] },
  { label: 'Shelter', categories: ['shelter', 'housing_services'] },
  { label: 'Legal', categories: ['legal_aid'] },
  { label: 'Health', categories: ['health_services'] },
  { label: 'Emergency', categories: ['emergency_aid'] },
]

export function ResourcesPage() {
  const { t } = useLanguage()
  const [organizations, setOrganizations] = useState<ExternalOrganization[]>([])
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Load organizations (from localStorage or seed data)
  useEffect(() => {
    let orgs = getExternalOrganizations()

    // If no orgs in storage, use seed data
    if (orgs.length === 0) {
      orgs = externalResourcesData.organizations as ExternalOrganization[]
    }

    // Sort by name
    orgs.sort((a, b) => a.name.localeCompare(b.name))
    setOrganizations(orgs)
  }, [])

  // Get category counts
  const categoryCounts = useMemo(() => {
    return organizations.reduce((acc, org) => {
      acc[org.category] = (acc[org.category] || 0) + 1
      return acc
    }, {} as Record<ExternalResourceCategory, number>)
  }, [organizations])

  // Filter organizations
  const filteredOrgs = useMemo(() => {
    let filtered = organizations

    // Category filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(org => org.category === activeFilter)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(query) ||
        org.description.toLowerCase().includes(query) ||
        org.eligibility?.toLowerCase().includes(query) ||
        org.serviceArea?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [organizations, activeFilter, searchQuery])

  // Group by category for display
  const groupedOrgs = useMemo(() => {
    if (activeFilter !== 'all') {
      return { [activeFilter]: filteredOrgs }
    }

    return filteredOrgs.reduce((acc, org) => {
      if (!acc[org.category]) {
        acc[org.category] = []
      }
      acc[org.category].push(org)
      return acc
    }, {} as Record<string, ExternalOrganization[]>)
  }, [filteredOrgs, activeFilter])

  // Category order for display
  const categoryOrder: ExternalResourceCategory[] = [
    'food',
    'shelter',
    'emergency_aid',
    'housing_services',
    'legal_aid',
    'health_services',
    'government',
    'mutual_aid',
    'advocacy',
    'faith',
    'pet_services',
    'other',
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('resources.title')}</h1>
          <p className="text-sm text-gray-600 mb-4">{t('resources.subtitle')}</p>

          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('resources.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rstu-red focus:border-rstu-red"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                activeFilter === 'all'
                  ? 'bg-rstu-red text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('resources.all')} ({organizations.length})
            </button>
            {QUICK_FILTERS.map(filter => {
              const count = filter.categories.reduce((sum, cat) => sum + (categoryCounts[cat] || 0), 0)
              if (count === 0) return null
              return (
                <button
                  key={filter.label}
                  onClick={() => setActiveFilter(filter.categories[0])}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    filter.categories.includes(activeFilter as ExternalResourceCategory)
                      ? 'bg-rstu-red text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5">
            {categoryOrder.map(category => {
              const count = categoryCounts[category] || 0
              if (count === 0) return null
              return (
                <button
                  key={category}
                  onClick={() => setActiveFilter(activeFilter === category ? 'all' : category)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    activeFilter === category
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
      </div>

      {/* Resource List */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {filteredOrgs.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 font-medium">{t('resources.noResults')}</p>
              <p className="text-sm text-gray-500 mt-1">{t('resources.tryDifferentSearch')}</p>
              <button
                onClick={() => {
                  setActiveFilter('all')
                  setSearchQuery('')
                }}
                className="mt-4 px-4 py-2 text-sm text-rstu-red hover:underline"
              >
                {t('resources.clearFilters')}
              </button>
            </div>
          ) : (
            <>
              {/* Show count */}
              <p className="text-sm text-gray-500 mb-4">
                {t('resources.showing')} {filteredOrgs.length} {filteredOrgs.length === 1 ? t('resources.resource') : t('resources.resourcesPlural')}
              </p>

              {/* Grouped display */}
              {categoryOrder.map(category => {
                const orgs = groupedOrgs[category]
                if (!orgs || orgs.length === 0) return null
                return (
                  <div key={category} className="mb-8">
                    {activeFilter === 'all' && (
                      <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        {EXTERNAL_CATEGORY_LABELS[category]}
                        <span className="text-sm font-normal text-gray-500">({orgs.length})</span>
                      </h2>
                    )}
                    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                      {orgs.map(org => (
                        <ResourceCard key={org.id} organization={org} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              {t('resources.footerText')}{' '}
              <a
                href="mailto:info@renosparkstenantsunion.org"
                className="text-rstu-red hover:underline"
              >
                {t('resources.contactUs')}
              </a>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {t('resources.lastUpdated')}: {externalResourcesData.lastUpdated}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
