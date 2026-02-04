'use client'

import {
  type ExternalOrganization,
  type OrganizationContact,
  type ExternalResourceCategory,
  isCustomCategory,
} from '@/lib/storage/organizationStorage'
import { useLanguage } from '@/contexts/LanguageContext'

interface ResourceCardProps {
  organization: ExternalOrganization
  onEdit?: () => void
  onDelete?: () => void
}

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
  crisis_mental_health: 'bg-violet-100 text-violet-800',
  senior_services: 'bg-rose-100 text-rose-800',
  employment_training: 'bg-lime-100 text-lime-800',
  childcare: 'bg-sky-100 text-sky-800',
  transportation: 'bg-fuchsia-100 text-fuchsia-800',
  disability_services: 'bg-emerald-100 text-emerald-800',
  lgbtq_services: 'bg-gradient-to-r from-red-100 via-yellow-100 to-blue-100 text-purple-800',
  reentry_services: 'bg-stone-100 text-stone-800',
  other: 'bg-gray-100 text-gray-800',
}

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

function ContactButton({ contact, t }: { contact: OrganizationContact; t: (key: string) => string }) {
  const { type, value, label } = contact

  const getHref = () => {
    switch (type) {
      case 'phone':
        return `tel:${value.replace(/[^0-9+]/g, '')}`
      case 'email':
        return `mailto:${value}`
      case 'website':
        return value.startsWith('http') ? value : `https://${value}`
      case 'address':
        return `https://maps.google.com/?q=${encodeURIComponent(value)}`
      default:
        return undefined
    }
  }

  const getDefaultLabel = () => {
    switch (type) {
      case 'phone':
        return t('resources.contactCall')
      case 'website':
        return t('resources.contactWebsite')
      case 'address':
        return t('resources.contactMap')
      case 'email':
        return t('resources.contactEmail')
      default:
        return value
    }
  }

  const href = getHref()

  if (type === 'hours') {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {getContactIcon(type)}
        <span className="font-medium">{value}</span>
      </div>
    )
  }

  return (
    <a
      href={href}
      target={type === 'website' ? '_blank' : undefined}
      rel={type === 'website' ? 'noopener noreferrer' : undefined}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
    >
      {getContactIcon(type)}
      <span>{label || getDefaultLabel()}</span>
    </a>
  )
}

export function ResourceCard({ organization, onEdit, onDelete }: ResourceCardProps) {
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

  // Get category label (translated for built-in, name for custom)
  const categoryLabel = isCustomCategory(category)
    ? category // Custom categories show their name from the org data
    : t(`resources.cat.${category}`)

  // Separate hours from other contacts
  const hoursContact = contacts.find(c => c.type === 'hours')
  const actionContacts = contacts.filter(c => c.type !== 'hours')

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
            {verified && (
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${CATEGORY_COLORS[category as ExternalResourceCategory] || 'bg-gray-100 text-gray-800'}`}>
            {categoryLabel}
          </span>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit() }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                aria-label={t('resources.editOrg')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete() }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                aria-label={t('resources.deleteOrg')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>

      {/* Hours (if available) */}
      {hoursContact && (
        <div className="mb-3 py-2 px-3 bg-amber-50 rounded-lg border border-amber-100">
          <ContactButton contact={hoursContact} t={t} />
        </div>
      )}

      {/* Eligibility */}
      {eligibility && (
        <div className="mb-3 text-sm">
          <span className="text-gray-500">{t('resources.whoLabel')}</span>{' '}
          <span className="text-gray-700 font-medium">{eligibility}</span>
        </div>
      )}

      {/* Service Area + Languages */}
      <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-500">
        {serviceArea && (
          <span className="inline-flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {serviceArea}
          </span>
        )}
        {languages && languages.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            {languages.join(', ')}
          </span>
        )}
      </div>

      {/* Contact Actions */}
      {actionContacts.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          {actionContacts.map((contact, idx) => (
            <ContactButton key={`${contact.type}-${idx}`} contact={contact} t={t} />
          ))}
        </div>
      )}
    </div>
  )
}
