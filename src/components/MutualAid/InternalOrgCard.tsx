'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { type InternalOrganization, COLLECTIVE_CATEGORY_LABELS } from '@/lib/storage/organizationStorage'
import { getCurrentProfile } from '@/lib/storage/profileStorage'

interface InternalOrgCardProps {
  organization: InternalOrganization
  onClick?: () => void
  isSelected?: boolean
}

export function InternalOrgCard({ organization, onClick, isSelected }: InternalOrgCardProps) {
  const { t } = useLanguage()
  const { name, description, memberProfiles, createdAt, isPublic, category, pointPersons } = organization
  const memberCount = memberProfiles?.length || 0

  const profile = getCurrentProfile()
  const isMember = profile ? memberProfiles.includes(profile.id) : false
  const isPointPerson = profile ? pointPersons.includes(profile.id) : false

  const createdDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  })

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white border rounded-lg p-4 transition-colors ${
        isSelected
          ? 'border-rstu-red ring-1 ring-rstu-red'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
          <span className="text-sm font-bold text-rstu-red">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 truncate">{name}</h3>
            {!isPublic && (
              <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded">
                {t('network.private')}
              </span>
            )}
            {isMember && (
              <span className={`flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium rounded ${
                isPointPerson ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {isPointPerson ? t('network.pointPerson') : t('network.member')}
              </span>
            )}
          </div>

          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 mb-2">
            {COLLECTIVE_CATEGORY_LABELS[category]}
          </span>

          {description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {description}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {memberCount !== 1 ? t('network.memberCountPlural', { count: memberCount }) : t('network.memberCount', { count: memberCount })}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {t('network.since', { date: createdDate })}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  )
}
