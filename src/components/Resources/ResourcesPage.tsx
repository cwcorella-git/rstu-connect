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
  PhoneIcon,
  ClockIcon,
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  BriefcaseIcon,
  TruckIcon,
  AcademicCapIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import {
  getExternalOrganizations,
  getCustomCategories,
  getExternalOrganizationsByCategory,
  type ExternalOrganization,
  type ExternalResourceCategory,
  type CustomCategory,
} from '@/lib/organizationStorage'
import { getCurrentProfile } from '@/lib/profileStorage'
import { useLanguage } from '@/contexts/LanguageContext'
import { AddCategoryModal, CUSTOM_ICON_MAP } from './AddCategoryModal'
import { AddOrganizationModal } from './AddOrganizationModal'
import { EditCategoryModal } from './EditCategoryModal'
import { DeleteCategoryDialog } from './DeleteCategoryDialog'
import { EditOrganizationModal } from './EditOrganizationModal'
import { DeleteOrganizationDialog } from './DeleteOrganizationDialog'

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

// Category icons mapping
function getCategoryIcon(category: ExternalResourceCategory) {
  const iconClass = 'w-8 h-8'
  switch (category) {
    case 'food':
      // Bowl/plate icon for food
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6c-4.97 0-9 2.69-9 6h18c0-3.31-4.03-6-9-6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12c0 3.31 3.13 6 7 6s7-2.69 7-6" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v3M9 4.5l1 2M15 4.5l-1 2" />
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
    case 'crisis_mental_health':
      return <PhoneIcon className={iconClass} />
    case 'senior_services':
      return <UserGroupIcon className={iconClass} />
    case 'employment_training':
      return <BriefcaseIcon className={iconClass} />
    case 'childcare':
      // Parent and child icon
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="9" cy="5" r="2.5" strokeWidth={1.5} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 21v-3a4 4 0 014-4h0a4 4 0 014 4v3" />
          <circle cx="17" cy="9" r="2" strokeWidth={1.5} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 21v-2a3 3 0 013-3h0a3 3 0 013 3v2" />
        </svg>
      )
    case 'transportation':
      return <TruckIcon className={iconClass} />
    case 'disability_services':
      // Wheelchair accessibility icon
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="11" cy="5" r="2" strokeWidth={1.5} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 8v4H8" />
          <circle cx="8" cy="17" r="3" strokeWidth={1.5} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 12h4l2 6h2" />
        </svg>
      )
    case 'lgbtq_services':
      // Rainbow/pride heart icon
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 11h10M8.5 14h7" />
        </svg>
      )
    case 'reentry_services':
      return <ArrowPathIcon className={iconClass} />
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
  crisis_mental_health: 'text-violet-500',
  senior_services: 'text-rose-500',
  employment_training: 'text-lime-500',
  childcare: 'text-sky-500',
  transportation: 'text-fuchsia-500',
  disability_services: 'text-emerald-500',
  lgbtq_services: 'text-pink-500',
  reentry_services: 'text-stone-500',
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

// Custom category card for grid view
function CustomCategoryCard({
  customCategory,
  count,
  onClick,
}: {
  customCategory: CustomCategory
  count: number
  onClick: () => void
}) {
  const IconComponent = CUSTOM_ICON_MAP[customCategory.icon] || DocumentTextIcon
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl p-6 flex flex-col items-center justify-center
        border border-gray-200 hover:border-gray-300 hover:shadow-md
        cursor-pointer transition-all min-h-[160px] text-center"
    >
      <h3 className="text-gray-900 font-semibold">{customCategory.name}</h3>
      <span className="text-gray-500 text-sm mt-1">{count}</span>
      <div className={`mt-4 ${customCategory.color}`}>
        <IconComponent className="w-8 h-8" />
      </div>
    </button>
  )
}

// Organization card for category detail view
interface OrganizationCardProps {
  organization: ExternalOrganization
  onEdit?: () => void
  onDelete?: () => void
}

function OrganizationCard({ organization, onEdit, onDelete }: OrganizationCardProps) {
  const { t } = useLanguage()
  const { name, description, contacts, eligibility, serviceArea } = organization

  // Extract contact information
  const phoneContact = contacts.find(c => c.type === 'phone')
  const hoursContact = contacts.find(c => c.type === 'hours')
  const websiteContact = contacts.find(c => c.type === 'website')
  const addressContact = contacts.find(c => c.type === 'address')

  const websiteUrl = websiteContact
    ? (websiteContact.value.startsWith('http') ? websiteContact.value : `https://${websiteContact.value}`)
    : null

  const mapsUrl = addressContact
    ? `https://maps.google.com/?q=${encodeURIComponent(addressContact.value)}`
    : null

  const phoneUrl = phoneContact
    ? `tel:${phoneContact.value.replace(/[^0-9+]/g, '')}`
    : null

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-lg text-gray-900">{name}</h3>
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title={t('resources.editOrg')}
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title={t('resources.deleteOrg')}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description - no line clamp, show full text */}
      <p className="text-gray-600 mt-2">{description}</p>

      {/* Info Grid */}
      <div className="mt-4 space-y-2">
        {/* Hours */}
        {hoursContact && (
          <div className="flex items-start gap-2 text-sm">
            <ClockIcon className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
            <span className="text-gray-700">{hoursContact.value}</span>
          </div>
        )}

        {/* Phone */}
        {phoneContact && (
          <div className="flex items-start gap-2 text-sm">
            <PhoneIcon className="w-4 h-4 flex-shrink-0 text-green-600 mt-0.5" />
            <a href={phoneUrl!} className="text-gray-700 hover:text-green-700 hover:underline">
              {phoneContact.value}
            </a>
          </div>
        )}

        {/* Address */}
        {addressContact && (
          <div className="flex items-start gap-2 text-sm">
            <MapPinIcon className="w-4 h-4 flex-shrink-0 text-blue-600 mt-0.5" />
            <span className="text-gray-700">{addressContact.value}</span>
          </div>
        )}

        {/* Eligibility / Who it's for */}
        {eligibility && (
          <div className="flex items-start gap-2 text-sm">
            <UserGroupIcon className="w-4 h-4 flex-shrink-0 text-purple-600 mt-0.5" />
            <span className="text-gray-700">
              <span className="font-medium">{t('resources.whoItsFor')}:</span> {eligibility}
            </span>
          </div>
        )}

        {/* Service Area */}
        {serviceArea && (
          <div className="flex items-start gap-2 text-sm">
            <GlobeAltIcon className="w-4 h-4 flex-shrink-0 text-teal-600 mt-0.5" />
            <span className="text-gray-700">
              <span className="font-medium">{t('resources.serviceArea')}:</span> {serviceArea}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-5">
        {/* Call button */}
        {phoneUrl && (
          <a
            href={phoneUrl}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <PhoneIcon className="w-4 h-4" />
            {t('resources.call')}
          </a>
        )}

        {/* Website button */}
        {websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <GlobeAltIcon className="w-4 h-4" />
            {t('resources.visitWebsite')}
          </a>
        )}

        {/* Maps button */}
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
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
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([])
  const [selectedCustomCategory, setSelectedCustomCategory] = useState<CustomCategory | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddOrgModal, setShowAddOrgModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditOrgModal, setShowEditOrgModal] = useState(false)
  const [showDeleteOrgDialog, setShowDeleteOrgDialog] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<ExternalOrganization | null>(null)

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

    // Load custom categories
    setCustomCategories(getCustomCategories())
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
      const cat = org.category as ExternalResourceCategory
      const current = counts.get(cat) || 0
      counts.set(cat, current + 1)
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
    setSelectedCustomCategory(null)
  }

  // Handle add category - open modal
  const handleAddCategory = () => {
    setShowAddModal(true)
  }

  // Handle custom category created
  const handleCategoryCreated = (category: CustomCategory) => {
    setCustomCategories(prev => [...prev, category])
    setShowAddModal(false)
  }

  // Handle custom category selection
  const handleCustomCategoryClick = (category: CustomCategory) => {
    setSelectedCustomCategory(category)
  }

  // Handle organization created in custom category
  const handleOrgCreated = (org: ExternalOrganization) => {
    setOrganizations(prev => [org, ...prev])
    setShowAddOrgModal(false)
  }

  // Handle custom category updated
  const handleCategoryUpdated = (updated: CustomCategory) => {
    setCustomCategories(prev => prev.map(c => c.id === updated.id ? updated : c))
    setSelectedCustomCategory(updated)
    setShowEditModal(false)
  }

  // Handle custom category deleted
  const handleCategoryDeleted = () => {
    if (selectedCustomCategory) {
      setCustomCategories(prev => prev.filter(c => c.id !== selectedCustomCategory.id))
      setSelectedCustomCategory(null)
    }
    setShowDeleteDialog(false)
  }

  // Handle organization edit click
  const handleEditOrg = (org: ExternalOrganization) => {
    setSelectedOrg(org)
    setShowEditOrgModal(true)
  }

  // Handle organization updated
  const handleOrgUpdated = (updated: ExternalOrganization) => {
    setOrganizations(prev => prev.map(o => o.id === updated.id ? updated : o))
    setSelectedOrg(null)
    setShowEditOrgModal(false)
  }

  // Handle organization delete click
  const handleDeleteOrg = (org: ExternalOrganization) => {
    setSelectedOrg(org)
    setShowDeleteOrgDialog(true)
  }

  // Handle organization deleted
  const handleOrgDeleted = () => {
    if (selectedOrg) {
      setOrganizations(prev => prev.filter(o => o.id !== selectedOrg.id))
    }
    setSelectedOrg(null)
    setShowDeleteOrgDialog(false)
  }

  // Get organizations for custom category
  const customCategoryOrgs = useMemo(() => {
    if (!selectedCustomCategory) return []
    return organizations.filter(org => org.category === selectedCustomCategory.id)
  }, [organizations, selectedCustomCategory])

  // Category detail view (built-in categories)
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
                {t(`resources.cat.${selectedCategory}`)}
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
                <OrganizationCard
                  key={org.id}
                  organization={org}
                  onEdit={canAddCategory ? () => handleEditOrg(org) : undefined}
                  onDelete={canAddCategory ? () => handleDeleteOrg(org) : undefined}
                />
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  // Custom category detail view
  if (selectedCustomCategory) {
    const CustomIcon = CUSTOM_ICON_MAP[selectedCustomCategory.icon] || DocumentTextIcon
    return (
      <div className="h-full flex flex-col overflow-hidden bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackClick}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className={selectedCustomCategory.color}>
                  <CustomIcon className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    {selectedCustomCategory.name}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {t('resources.orgsInCategory', { count: customCategoryOrgs.length })}
                  </p>
                </div>
              </div>
            </div>
            {/* Action buttons */}
            {canAddCategory && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title={t('resources.editCategory')}
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t('resources.deleteCategory')}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowAddOrgModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-rstu-red text-white rounded-lg hover:bg-rstu-red-dark transition-colors text-sm font-medium"
                >
                  <PlusIcon className="w-4 h-4" />
                  {t('resources.addOrganization')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Organization List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            {customCategoryOrgs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CustomIcon className={`w-16 h-16 mx-auto mb-4 ${selectedCustomCategory.color}`} />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{selectedCustomCategory.name}</h2>
                <p className="text-gray-600 mb-4">
                  {t('resources.customCategoryEmpty')}
                </p>
                {canAddCategory && (
                  <button
                    onClick={() => setShowAddOrgModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-rstu-red text-white rounded-lg hover:bg-rstu-red-dark transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    {t('resources.addFirstOrg')}
                  </button>
                )}
              </div>
            ) : (
              customCategoryOrgs.map(org => (
                <OrganizationCard
                  key={org.id}
                  organization={org}
                  onEdit={canAddCategory ? () => handleEditOrg(org) : undefined}
                  onDelete={canAddCategory ? () => handleDeleteOrg(org) : undefined}
                />
              ))
            )}
          </div>
        </div>

        {/* Add Organization Modal */}
        {showAddOrgModal && profile && (
          <AddOrganizationModal
            isOpen={showAddOrgModal}
            onClose={() => setShowAddOrgModal(false)}
            onCreated={handleOrgCreated}
            categoryId={selectedCustomCategory.id}
            categoryName={selectedCustomCategory.name}
            creatorId={profile.id}
          />
        )}

        {/* Edit Category Modal */}
        {showEditModal && (
          <EditCategoryModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onUpdated={handleCategoryUpdated}
            category={selectedCustomCategory}
          />
        )}

        {/* Delete Category Dialog */}
        {showDeleteDialog && (
          <DeleteCategoryDialog
            isOpen={showDeleteDialog}
            onClose={() => setShowDeleteDialog(false)}
            onDeleted={handleCategoryDeleted}
            category={selectedCustomCategory}
          />
        )}

        {/* Edit Organization Modal */}
        {showEditOrgModal && selectedOrg && (
          <EditOrganizationModal
            isOpen={showEditOrgModal}
            onClose={() => { setShowEditOrgModal(false); setSelectedOrg(null); }}
            onUpdated={handleOrgUpdated}
            organization={selectedOrg}
          />
        )}

        {/* Delete Organization Dialog */}
        {showDeleteOrgDialog && selectedOrg && (
          <DeleteOrganizationDialog
            isOpen={showDeleteOrgDialog}
            onClose={() => { setShowDeleteOrgDialog(false); setSelectedOrg(null); }}
            onDeleted={handleOrgDeleted}
            organization={selectedOrg}
          />
        )}
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
                label={t(`resources.cat.${category}`)}
                count={count}
                onClick={() => handleCategoryClick(category)}
              />
            )
          })}

          {/* Custom categories */}
          {customCategories.map(cat => (
            <CustomCategoryCard
              key={cat.id}
              customCategory={cat}
              count={0}
              onClick={() => handleCustomCategoryClick(cat)}
            />
          ))}

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

        {/* Add Category Modal */}
        {showAddModal && profile && (
          <AddCategoryModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onCreated={handleCategoryCreated}
            creatorId={profile.id}
          />
        )}

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
