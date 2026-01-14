'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import {
  getExternalOrganizations,
  type ExternalOrganization,
  type ExternalResourceCategory,
  type OrganizationContact,
  EXTERNAL_CATEGORY_LABELS,
} from '@/lib/organizationStorage'
import { useLanguage } from '@/contexts/LanguageContext'

// Load seed data
import externalResourcesData from '@/data/external-resources.json'

// Category colors
const CATEGORY_COLORS: Record<ExternalResourceCategory, string> = {
  food: 'bg-amber-100 text-amber-800',
  shelter: 'bg-blue-100 text-blue-800',
  legal_aid: 'bg-purple-100 text-purple-800',
  housing_services: 'bg-teal-100 text-teal-800',
  emergency_aid: 'bg-red-100 text-red-800',
  government: 'bg-slate-100 text-slate-800',
  advocacy: 'bg-orange-100 text-orange-800',
  health_services: 'bg-green-100 text-green-800',
  mutual_aid: 'bg-pink-100 text-pink-800',
  faith: 'bg-indigo-100 text-indigo-800',
  pet_services: 'bg-cyan-100 text-cyan-800',
  other: 'bg-gray-100 text-gray-800',
}

// Category order for display
const CATEGORY_ORDER: ExternalResourceCategory[] = [
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

function getContactIcon(type: OrganizationContact['type']) {
  switch (type) {
    case 'phone':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      )
    case 'website':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    case 'address':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    case 'email':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    case 'hours':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    default:
      return null
  }
}

// List item card for sidebar
function ResourceListItem({
  organization,
  isSelected,
  onClick,
}: {
  organization: ExternalOrganization
  isSelected: boolean
  onClick: () => void
}) {
  const { name, category, serviceArea, verified } = organization

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 transition-colors ${
        isSelected
          ? 'bg-red-50 border-l-4 border-rstu-red'
          : 'hover:bg-gray-50 border-l-4 border-transparent'
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-medium text-sm text-gray-900 truncate">{name}</h3>
            {verified && (
              <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          {serviceArea && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{serviceArea}</p>
          )}
        </div>
      </div>
    </button>
  )
}

// Detail view for selected organization
function ResourceDetail({ organization }: { organization: ExternalOrganization }) {
  const { t } = useLanguage()
  const {
    name,
    description,
    category,
    contacts,
    serviceArea,
    eligibility,
    languages,
    verified,
  } = organization

  const hoursContact = contacts.find(c => c.type === 'hours')
  const actionContacts = contacts.filter(c => c.type !== 'hours')

  const getHref = (contact: OrganizationContact) => {
    switch (contact.type) {
      case 'phone':
        return `tel:${contact.value.replace(/[^0-9+]/g, '')}`
      case 'email':
        return `mailto:${contact.value}`
      case 'website':
        return contact.value.startsWith('http') ? contact.value : `https://${contact.value}`
      case 'address':
        return `https://maps.google.com/?q=${encodeURIComponent(contact.value)}`
      default:
        return undefined
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${CATEGORY_COLORS[category]}`}>
            {EXTERNAL_CATEGORY_LABELS[category]}
          </span>
          {verified && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t('resources.verified')}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-6">{description}</p>

      {/* Hours */}
      {hoursContact && (
        <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2 text-amber-800">
            {getContactIcon('hours')}
            <span className="font-medium">{hoursContact.value}</span>
          </div>
        </div>
      )}

      {/* Info Grid */}
      <div className="grid gap-4 mb-6">
        {eligibility && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">{t('resources.eligibility')}</h3>
            <p className="text-gray-900">{eligibility}</p>
          </div>
        )}

        {serviceArea && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">{t('resources.serviceArea')}</h3>
            <p className="text-gray-900">{serviceArea}</p>
          </div>
        )}

        {languages && languages.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">{t('resources.languages')}</h3>
            <p className="text-gray-900">{languages.join(', ')}</p>
          </div>
        )}
      </div>

      {/* Contact Actions */}
      {actionContacts.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">{t('resources.contact')}</h3>
          <div className="space-y-3">
            {actionContacts.map((contact, idx) => {
              const href = getHref(contact)
              if (contact.type === 'phone') {
                return (
                  <a
                    key={`${contact.type}-${idx}`}
                    href={href}
                    className="flex items-center gap-3 p-4 bg-green-50 text-green-800 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    {getContactIcon(contact.type)}
                    <div>
                      <div className="font-medium">{contact.label || t('resources.call')}</div>
                      <div className="text-sm">{contact.value}</div>
                    </div>
                  </a>
                )
              }
              if (contact.type === 'website') {
                return (
                  <a
                    key={`${contact.type}-${idx}`}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-blue-50 text-blue-800 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    {getContactIcon(contact.type)}
                    <div>
                      <div className="font-medium">{contact.label || t('resources.website')}</div>
                      <div className="text-sm truncate max-w-xs">{contact.value}</div>
                    </div>
                  </a>
                )
              }
              if (contact.type === 'address') {
                return (
                  <a
                    key={`${contact.type}-${idx}`}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gray-50 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {getContactIcon(contact.type)}
                    <div>
                      <div className="font-medium">{t('resources.address')}</div>
                      <div className="text-sm">{contact.value}</div>
                    </div>
                  </a>
                )
              }
              return null
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function ResourcesPage() {
  const { t } = useLanguage()
  const [organizations, setOrganizations] = useState<ExternalOrganization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<ExternalOrganization | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list')

  // Load organizations (from localStorage or seed data)
  useEffect(() => {
    let orgs = getExternalOrganizations()

    // If no orgs in storage, use seed data
    if (orgs.length === 0) {
      orgs = externalResourcesData.organizations as ExternalOrganization[]
    }

    // Sort by name within each category
    orgs.sort((a, b) => a.name.localeCompare(b.name))
    setOrganizations(orgs)
  }, [])

  // Toggle category expansion
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }, [])

  // Filter organizations by search
  const filteredOrgs = useMemo(() => {
    if (!searchQuery.trim()) return organizations

    const query = searchQuery.toLowerCase()
    return organizations.filter(org =>
      org.name.toLowerCase().includes(query) ||
      org.description.toLowerCase().includes(query) ||
      org.eligibility?.toLowerCase().includes(query) ||
      org.serviceArea?.toLowerCase().includes(query) ||
      EXTERNAL_CATEGORY_LABELS[org.category].toLowerCase().includes(query)
    )
  }, [organizations, searchQuery])

  // Group organizations by category
  const groupedOrgs = useMemo(() => {
    const groups = new Map<ExternalResourceCategory, ExternalOrganization[]>()

    // Initialize all categories
    CATEGORY_ORDER.forEach(cat => groups.set(cat, []))

    // Populate groups
    filteredOrgs.forEach(org => {
      const list = groups.get(org.category)
      if (list) {
        list.push(org)
      }
    })

    // Return only non-empty groups
    return CATEGORY_ORDER
      .filter(cat => (groups.get(cat)?.length || 0) > 0)
      .map(cat => ({
        category: cat,
        label: EXTERNAL_CATEGORY_LABELS[cat],
        organizations: groups.get(cat) || []
      }))
  }, [filteredOrgs])

  const isSearching = searchQuery.trim().length > 0

  const handleSelectOrg = (org: ExternalOrganization) => {
    setSelectedOrg(org)
    setMobileView('detail')
  }

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-gray-50">
      {/* Left Panel - Resource List */}
      <div className={`${mobileView === 'list' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-2/5 bg-white border-r border-gray-200 h-full overflow-hidden`}>
        {/* Header with search */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-gray-900">{t('resources.title')}</h1>
            <span className="text-xs text-gray-500">
              {isSearching ? (
                t('resources.resultsCount', { count: filteredOrgs.length })
              ) : (
                t('resources.totalCount', { count: organizations.length })
              )}
            </span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('resources.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Groups */}
        <div className="flex-1 overflow-y-auto">
          {filteredOrgs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>{t('resources.noResults')}</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-sm text-rstu-red hover:underline"
              >
                {t('resources.clearFilters')}
              </button>
            </div>
          ) : isSearching ? (
            // Flat list when searching
            <div>
              {filteredOrgs.map(org => (
                <ResourceListItem
                  key={org.id}
                  organization={org}
                  isSelected={selectedOrg?.id === org.id}
                  onClick={() => handleSelectOrg(org)}
                />
              ))}
            </div>
          ) : (
            // Grouped by category when not searching
            <div>
              {groupedOrgs.map(({ category, label, organizations: orgs }) => (
                <div key={category} className="border-b border-gray-100">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 ${
                      expandedCategories.has(category)
                        ? 'bg-red-50 hover:bg-red-100'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <ChevronDownIcon
                      className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                        expandedCategories.has(category) ? 'rotate-0 text-rstu-red' : '-rotate-90 text-gray-400'
                      }`}
                    />
                    <span className={`font-semibold transition-colors duration-200 ${
                      expandedCategories.has(category) ? 'text-rstu-red' : 'text-gray-900'
                    }`}>
                      {label}
                    </span>
                    <span className="text-xs text-gray-500 font-normal ml-auto">
                      ({orgs.length})
                    </span>
                  </button>

                  {/* Organizations in Category */}
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedCategories.has(category) ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    {orgs.map(org => (
                      <ResourceListItem
                        key={org.id}
                        organization={org}
                        isSelected={selectedOrg?.id === org.id}
                        onClick={() => handleSelectOrg(org)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              {t('resources.footerText')}{' '}
              <a
                href="mailto:info@renosparkstenantsunion.org"
                className="text-rstu-red hover:underline"
              >
                {t('resources.contactUs')}
              </a>
            </p>
          </div>
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
          <span className="text-sm font-medium text-gray-900">{t('resources.backToList')}</span>
        </div>

        {selectedOrg ? (
          <div className="flex-1 overflow-y-auto">
            <ResourceDetail organization={selectedOrg} />
          </div>
        ) : (
          // Empty state
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-sm">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{t('resources.title')}</h2>
              <p className="text-sm text-gray-500">
                {t('resources.selectToView')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
