'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { type ExternalOrganization, type ExternalResourceCategory, EXTERNAL_CATEGORY_LABELS } from '@/lib/storage/organizationStorage'

interface ExternalOrgCardProps {
  organization: ExternalOrganization
}

export function ExternalOrgCard({ organization }: ExternalOrgCardProps) {
  const { t } = useLanguage()
  const { name, description, category, contacts, serviceArea, eligibility, verified, languages } = organization

  // Get contact by type
  const phone = contacts.find(c => c.type === 'phone')
  const website = contacts.find(c => c.type === 'website')
  const address = contacts.find(c => c.type === 'address')

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber.replace(/[^0-9+]/g, '')}`
  }

  const handleVisit = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">{name}</h3>
            {verified && (
              <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t('org.verified')}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">{EXTERNAL_CATEGORY_LABELS[category as ExternalResourceCategory] || category}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>

      {/* Info chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {serviceArea && (
          <span className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {serviceArea}
          </span>
        )}
        {eligibility && (
          <span className="inline-flex items-center px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded-full">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {eligibility}
          </span>
        )}
        {languages && languages.length > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 text-xs bg-purple-50 text-purple-600 rounded-full">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            {languages.join(', ')}
          </span>
        )}
      </div>

      {/* Address */}
      {address && (
        <p className="text-xs text-gray-500 mb-3 flex items-start gap-1">
          <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {address.value}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {phone && (
          <button
            onClick={() => handleCall(phone.value)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {t('org.call')}
          </button>
        )}
        {website && (
          <button
            onClick={() => handleVisit(website.value)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {t('org.website')}
          </button>
        )}
        {!phone && !website && address && (
          <button
            onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(address.value)}`, '_blank')}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            {t('org.directions')}
          </button>
        )}
      </div>
    </div>
  )
}
