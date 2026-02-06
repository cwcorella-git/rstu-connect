'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import type { UserProfile } from '@/lib/storage/profileStorage'
import { getRoleLabel, getTrustLabel, getActivityStatus, canAccessTools, getCurrentProfile } from '@/lib/storage/profileStorage'
import { getOfficerTitleForUser } from '@/lib/storage/electionStorage'
import type { EnhancedBuilding } from '@/lib/data/getBuildingsData'
import { CheckBadgeIcon } from '@heroicons/react/24/solid'

interface ProfileHeaderProps {
  profile: UserProfile
  selectedBuilding?: EnhancedBuilding
  unreadMessagesCount?: number
  onOpenMessages: () => void
  onOpenTenantProfile: () => void
  onOpenSettings: () => void
}

export function ProfileHeader({
  profile,
  selectedBuilding,
  unreadMessagesCount = 0,
  onOpenMessages,
  onOpenTenantProfile,
  onOpenSettings,
}: ProfileHeaderProps) {
  const { t } = useLanguage()
  const currentUser = getCurrentProfile()
  const isOwnProfile = currentUser?.id === profile.id
  const canViewBuilding = isOwnProfile || canAccessTools()

  return (
    <div className="bg-gradient-to-br from-rstu-red to-red-700 rounded-lg shadow-md p-4">

      <div className="flex items-start">
        {/* Profile Info */}
        <div className="flex-1">
          {/* Nickname with Verified Checkmark */}
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold text-white drop-shadow-sm">{profile.nickname}</h2>
            {profile.trustLevel === 'verified' && (
              <CheckBadgeIcon
                className="w-7 h-7 text-white drop-shadow-md flex-shrink-0"
                title={`Verified by ${profile.verifiedBy ? 'organizer' : 'system'}`}
                aria-label="Verified"
              />
            )}
          </div>

          {/* Role Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-white/30 text-white border border-white/50">
              {t(`profile.${profile.role}`)}
            </span>

            {(() => {
              const officerTitle = profile.officerTitle || getOfficerTitleForUser(profile.id)
              return officerTitle ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-amber-400/80 text-amber-950 border border-amber-300">
                  {officerTitle}
                </span>
              ) : null
            })()}

            {profile.trustLevel && profile.trustLevel !== 'verified' && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-white/25 text-white border border-white/40">
                {profile.trustLevel === 'self_registered' ? t('trust.selfRegistered') : t('trust.invited')}
              </span>
            )}

            {(() => {
              const status = getActivityStatus(profile)
              return (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-white/25 text-white border border-white/40">
                  {status === 'active' ? t('status.active') : status === 'inactive' ? t('status.inactive') : t('status.new')}
                </span>
              )
            })()}
          </div>

          {/* Action Buttons - Only for Own Profile */}
          {isOwnProfile && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Messages Button */}
              <button
                onClick={onOpenMessages}
                className="flex items-center gap-1 px-3 py-1.5 bg-white text-rstu-red rounded-md text-sm font-medium hover:bg-white/90 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                {t('profile.messages') || 'Messages'}
                {unreadMessagesCount > 0 && (
                  <span className="bg-rstu-red text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>

              {/* Tenant Profile Button */}
              <button
                onClick={onOpenTenantProfile}
                className="flex items-center gap-1 px-3 py-1.5 bg-white text-rstu-red rounded-md text-sm font-medium hover:bg-white/90 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {t('profile.tenantProfile') || 'Tenant Profile'}
              </button>

              {/* Settings Button */}
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1 px-3 py-1.5 bg-white text-rstu-red rounded-md text-sm font-medium hover:bg-white/90 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {t('profile.settings') || 'Settings'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
