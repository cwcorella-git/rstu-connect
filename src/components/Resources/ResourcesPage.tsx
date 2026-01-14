'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  HomeIcon,
  ScaleIcon,
  HeartIcon,
  BuildingLibraryIcon,
  HandRaisedIcon,
  MegaphoneIcon,
  SparklesIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  MapPinIcon,
  ArrowLeftIcon,
  PlusIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline'
import {
  getExternalOrganizations,
  type ExternalOrganization,
  type ExternalResourceCategory,
  EXTERNAL_CATEGORY_LABELS,
} from '@/lib/organizationStorage'
import { getCurrentProfile } from '@/lib/profileStorage'
import { useLanguage } from '@/contexts/LanguageContext'

// Load seed data
import externalResourcesData from '@/data/external-resources.json'

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

// Category icons mapping
function getCategoryIcon(category: ExternalResourceCategory) {
  const iconClass = 'w-8 h-8'
  switch (category) {
    case 'food':
      // Custom fork/knife icon for food
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v18m-6-6c0 3 2.5 4 6 4s6-1 6-4c0-2-2-3-6-3s-6 1-6 3zm0-6V3m0 8c0-2 2.5-3 6-3s6 1 6 3m-12 0v4" />
        </svg>
      )
    case 'shelter':
      return <HomeIcon className={iconClass} />
    case 'emergency_aid':
      return <ExclamationTriangleIcon className={iconClass} />
    case 'housing_services':
      return <KeyIcon className={iconClass} />
    case 'legal_aid':
      return <ScaleIcon className={iconClass} />
    case 'health_services':
      return <HeartIcon className={iconClass} />
    case 'government':
      return <BuildingLibraryIcon className={iconClass} />
    case 'mutual_aid':
      return <HandRaisedIcon className={iconClass} />
    case 'advocacy':
      return <MegaphoneIcon className={iconClass} />
    case 'faith':
      return <SparklesIcon className={iconClass} />
    case 'pet_services':
      // Custom paw icon
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18c-3.5 0-6-2.5-6-5.5 0-2 1.5-3.5 3-3.5 1 0 1.8.5 2.3 1.2.3.5.7.8.7.8s.4-.3.7-.8c.5-.7 1.3-1.2 2.3-1.2 1.5 0 3 1.5 3 3.5 0 3-2.5 5.5-6 5.5zM7.5 7c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM16.5 7c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM10 10c.8 0 1.5-.7 1.5-1.5S10.8 7 10 7s-1.5.7-1.5 1.5S9.2 10 10 10zM14 10c.8 0 1.5-.7 1.5-1.5S14.8 7 14 7s-1.5.7-1.5 1.5.7 1.5 1.5 1.5z" />
        </svg>
      )
    case 'other':
    default:
      return <DocumentTextIcon className={iconClass} />
  }
}

// Category accent colors (subtle, for icon tinting)
const CATEGORY_COLORS: Record<ExternalResourceCategory, string> = {
  food: 'text-amber-500',
  shelter: 'text-blue-500',
  legal_aid: 'text-purple-500',
  housing_services: 'text-teal-500',
  emergency_aid: 'text-red-500',
  government: 'text-slate-500',
  advocacy: 'text-orange-500',
  health_services: 'text-green-500',
  mutual_aid: 'text-pink-500',
  faith: 'text-indigo-500',
  pet_services: 'text-cyan-500',
  other: 'text-gray-500',
}

// Category card for grid view
function CategoryCard({
  category,
  label,
  count,
  onClick,
}: {
  category: ExternalResourceCategory
  label: string
  count: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl p-6 flex flex-col items-center justify-center
        border border-gray-200 hover:border-gray-300 hover:shadow-md
        cursor-pointer transition-all min-h-[160px] text-center"
    >
      <h3 className="text-gray-900 font-semibold">{label}</h3>
      <span className="text-gray-500 text-sm mt-1">{count}</span>
      <div className={`mt-4 ${CATEGORY_COLORS[category]}`}>
        {getCategoryIcon(category)}
      </div>
    </button>
  )
}

// Organization card for category detail view
function OrganizationCard({ organization }: { organization: ExternalOrganization }) {
  const { t } = useLanguage()
  const { name, description, contacts } = organization

  // Find website and address from contacts
  const websiteContact = contacts.find(c => c.type === 'website')
  const addressContact = contacts.find(c => c.type === 'address')

  const websiteUrl = websiteContact
    ? (websiteContact.value.startsWith('http') ? websiteContact.value : `https://${websiteContact.value}`)
    : null

  const mapsUrl = addressContact
    ? `https://maps.google.com/?q=${encodeURIComponent(addressContact.value)}`
    : null

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <h3 className="font-bold text-gray-900">{name}</h3>
      <p className="text-gray-600 text-sm mt-2 line-clamp-3">{description}</p>

      {addressContact && (
        <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
          <MapPinIcon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{addressContact.value}</span>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        {websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <GlobeAltIcon className="w-4 h-4" />
            {t('resources.visitWebsite')}
          </a>
        )}
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            <MapPinIcon className="w-4 h-4" />
            {t('resources.openMaps')}
          </a>
        )}
      </div>
    </div>
  )
}

// Main Resources Page component
export function ResourcesPage() {
  const { t } = useLanguage()
  const [organizations, setOrganizations] = useState<ExternalOrganization[]>([])
  const [selectedCategory, setSelectedCategory] = useState<ExternalResourceCategory | null>(null)

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

  // Check if user can add categories (admin or organizer)
  const profile = getCurrentProfile()
  const canAddCategory = profile?.role === 'admin' || profile?.role === 'organizer'

  // Group organizations by category with counts
  const categoryCounts = useMemo(() => {
    const counts = new Map<ExternalResourceCategory, number>()

    // Initialize all categories with 0
    CATEGORY_ORDER.forEach(cat => counts.set(cat, 0))

    // Count organizations per category
    organizations.forEach(org => {
      const current = counts.get(org.category) || 0
      counts.set(org.category, current + 1)
    })

    return counts
  }, [organizations])

  // Get organizations for selected category
  const categoryOrgs = useMemo(() => {
    if (!selectedCategory) return []
    return organizations.filter(org => org.category === selectedCategory)
  }, [organizations, selectedCategory])

  // Handle category selection
  const handleCategoryClick = (category: ExternalResourceCategory) => {
    setSelectedCategory(category)
  }

  // Handle back to grid
  const handleBackClick = () => {
    setSelectedCategory(null)
  }

  // Handle add category (MVP: show coming soon message)
  const handleAddCategory = () => {
    alert(t('resources.comingSoon'))
  }

  // Category detail view
  if (selectedCategory) {
    return (
      <div className="h-full flex flex-col overflow-hidden bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackClick}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {EXTERNAL_CATEGORY_LABELS[selectedCategory]}
              </h1>
              <p className="text-sm text-gray-500">
                {t('resources.orgsInCategory', { count: categoryOrgs.length })}
              </p>
            </div>
          </div>
        </div>

        {/* Organization List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            {categoryOrgs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>{t('resources.noOrgsInCategory')}</p>
              </div>
            ) : (
              categoryOrgs.map(org => (
                <OrganizationCard key={org.id} organization={org} />
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  // Grid view (default)
  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex-shrink-0">
        <h1 className="text-lg font-bold text-gray-900">{t('resources.directory')}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {t('resources.totalCount', { count: organizations.length })}
        </p>
      </div>

      {/* Category Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {CATEGORY_ORDER.map(category => {
            const count = categoryCounts.get(category) || 0
            // Only show categories with organizations
            if (count === 0) return null
            return (
              <CategoryCard
                key={category}
                category={category}
                label={EXTERNAL_CATEGORY_LABELS[category]}
                count={count}
                onClick={() => handleCategoryClick(category)}
              />
            )
          })}

          {/* Add Category button (admin only) */}
          {canAddCategory && (
            <button
              onClick={handleAddCategory}
              className="bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center
                border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-100
                transition-all min-h-[160px]"
            >
              <PlusIcon className="w-8 h-8 text-gray-400" />
              <span className="text-gray-500 text-sm mt-2">{t('resources.addCategory')}</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pb-4 text-center">
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
      </div>
    </div>
  )
}
