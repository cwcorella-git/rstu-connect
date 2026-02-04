'use client'

import { useState, useMemo, useDeferredValue } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { getCurrentProfile } from '@/lib/storage/profileStorage'
import {
  type ExternalOrganization,
  type ExternalResourceCategory,
  EXTERNAL_CATEGORY_LABELS,
} from '@/lib/storage/organizationStorage'

interface ResourceDirectoryProps {
  organizations: ExternalOrganization[]
  onAddResource?: () => void
}

// Category icons for visual distinction
const CATEGORY_ICONS: Record<ExternalResourceCategory, string> = {
  food: '🍽️',
  shelter: '🏠',
  legal_aid: '⚖️',
  housing_services: '🔑',
  emergency_aid: '🆘',
  government: '🏛️',
  advocacy: '📢',
  health_services: '🏥',
  mutual_aid: '🤝',
  faith: '⛪',
  pet_services: '🐕',
  crisis_mental_health: '💚',
  senior_services: '👴',
  employment_training: '💼',
  childcare: '👶',
  transportation: '🚌',
  disability_services: '♿',
  lgbtq_services: '🏳️‍🌈',
  reentry_services: '🔓',
  other: '📋',
}

export function ResourceDirectory({ organizations, onAddResource }: ResourceDirectoryProps) {
  const { t } = useLanguage()
  const profile = getCurrentProfile()

  const [searchInput, setSearchInput] = useState('')
  const searchQuery = useDeferredValue(searchInput)
  const [selectedCategory, setSelectedCategory] = useState<ExternalResourceCategory | 'all'>('all')

  // Get categories that have organizations
  const activeCategories = useMemo(() => {
    const cats = new Set<ExternalResourceCategory>()
    organizations.forEach(org => cats.add(org.category as ExternalResourceCategory))
    // Return in defined order
    return (Object.keys(EXTERNAL_CATEGORY_LABELS) as ExternalResourceCategory[])
      .filter(cat => cats.has(cat))
  }, [organizations])

  // Filter organizations
  const filteredOrgs = useMemo(() => {
    let result = organizations

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(org => org.category === selectedCategory)
    }

    // Filter by search
    const query = searchQuery.toLowerCase().trim()
    if (query) {
      result = result.filter(org =>
        org.name.toLowerCase().includes(query) ||
        org.description.toLowerCase().includes(query) ||
        (org.serviceArea && org.serviceArea.toLowerCase().includes(query)) ||
        (org.eligibility && org.eligibility.toLowerCase().includes(query))
      )
    }

    return result
  }, [organizations, selectedCategory, searchQuery])

  // Count by category for badges
  const categoryCounts = useMemo(() => {
    const counts = new Map<ExternalResourceCategory, number>()
    organizations.forEach(org => {
      const cat = org.category as ExternalResourceCategory
      counts.set(cat, (counts.get(cat) || 0) + 1)
    })
    return counts
  }, [organizations])

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/[^0-9+]/g, '')}`
  }

  const handleVisit = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        {/* Search Bar */}
        <div className="p-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search resources..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent bg-gray-50"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Chips - Horizontally Scrollable */}
        <div className="px-3 pb-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {/* All button */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-rstu-red text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              All
              <span className={`text-xs ${selectedCategory === 'all' ? 'text-red-200' : 'text-gray-400'}`}>
                {organizations.length}
              </span>
            </button>

            {/* Category buttons */}
            {activeCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-rstu-red text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                }`}
              >
                <span>{CATEGORY_ICONS[cat]}</span>
                <span className="hidden sm:inline">{EXTERNAL_CATEGORY_LABELS[cat]}</span>
                <span className="sm:hidden">{EXTERNAL_CATEGORY_LABELS[cat].split(' ')[0]}</span>
                <span className={`text-xs ${selectedCategory === cat ? 'text-red-200' : 'text-gray-400'}`}>
                  {categoryCounts.get(cat) || 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex-shrink-0 px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {filteredOrgs.length} {filteredOrgs.length === 1 ? 'resource' : 'resources'}
          {selectedCategory !== 'all' && ` in ${EXTERNAL_CATEGORY_LABELS[selectedCategory]}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </span>
        {profile?.role === 'admin' && onAddResource && (
          <button
            onClick={onAddResource}
            className="text-xs text-rstu-red font-medium hover:underline"
          >
            + Add Resource
          </button>
        )}
      </div>

      {/* Organization Grid - Scrollable */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredOrgs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">No resources found</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery ? 'Try a different search term' : 'Try selecting a different category'}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOrgs.map(org => {
              const phone = org.contacts.find(c => c.type === 'phone')
              const website = org.contacts.find(c => c.type === 'website')
              const address = org.contacts.find(c => c.type === 'address')
              const hours = org.contacts.find(c => c.type === 'hours')

              return (
                <div
                  key={org.id}
                  className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-xl flex-shrink-0">{CATEGORY_ICONS[org.category as ExternalResourceCategory]}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{org.name}</h3>
                      <span className="text-xs text-gray-500">{EXTERNAL_CATEGORY_LABELS[org.category as ExternalResourceCategory]}</span>
                    </div>
                    {org.verified && (
                      <span className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center" title="Verified">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">{org.description}</p>

                  {/* Quick Info */}
                  <div className="space-y-1 mb-3">
                    {hours && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="truncate">{hours.value}</span>
                      </div>
                    )}
                    {address && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="truncate">{address.value}</span>
                      </div>
                    )}
                    {org.eligibility && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-600">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="truncate">{org.eligibility}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {phone && (
                      <button
                        onClick={() => handleCall(phone.value)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call
                      </button>
                    )}
                    {website && (
                      <button
                        onClick={() => handleVisit(website.value)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Website
                      </button>
                    )}
                    {!phone && !website && address && (
                      <button
                        onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(address.value)}`, '_blank')}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Directions
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        {filteredOrgs.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Resources curated for the Reno-Sparks community.
              {profile?.role === 'admin' && onAddResource && (
                <>
                  {' '}
                  <button onClick={onAddResource} className="text-rstu-red hover:underline">
                    Add more resources
                  </button>
                </>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Hide scrollbar but keep scroll functionality */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
