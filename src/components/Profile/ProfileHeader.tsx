'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import type { UserProfile } from '@/lib/profileStorage'
import { getRoleLabel, getTrustLabel, getActivityStatus, canAccessTools, getCurrentProfile } from '@/lib/profileStorage'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import { CheckBadgeIcon } from '@heroicons/react/24/solid'
import { UserDropdown } from './UserDropdown'

interface ProfileHeaderProps {
  profile: UserProfile
  selectedBuilding?: EnhancedBuilding
  unreadMessagesCount?: number
  onOpenMessages: () => void
  onOpenEditor: () => void
  onOpenAdmin?: () => void
}

export function ProfileHeader({
  profile,
  selectedBuilding,
  unreadMessagesCount = 0,
  onOpenMessages,
  onOpenEditor,
  onOpenAdmin,
}: ProfileHeaderProps) {
  const { t } = useLanguage()
  const currentUser = getCurrentProfile()
  const isOwnProfile = currentUser?.id === profile.id
  const canViewBuilding = isOwnProfile || canAccessTools()

  return (
    <div className="bg-gradient-to-br from-rstu-red to-red-700 rounded-lg shadow-md p-4">

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rstu-red to-red-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {profile.nickname.charAt(0).toUpperCase()}
        </div>

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
              {getRoleLabel(profile.role)}
            </span>

            {profile.trustLevel && profile.trustLevel !== 'verified' && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-white/25 text-white border border-white/40">
                {getTrustLabel(profile.trustLevel)}
              </span>
            )}

            {(() => {
              const status = getActivityStatus(profile)
              return (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-white/25 text-white border border-white/40">
                  {status === 'active' ? 'Active' : status === 'inactive' ? 'Inactive' : 'New'}
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

              {/* Edit Profile Button */}
              <button
                onClick={onOpenEditor}
                className="flex items-center gap-1 px-3 py-1.5 bg-white text-rstu-red rounded-md text-sm font-medium hover:bg-white/90 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                {t('common.edit') || 'Edit'}
              </button>

              {/* User Dropdown Menu (Admin + Sign Out) */}
              <UserDropdown
                userInitial={profile.nickname.charAt(0).toUpperCase()}
                userName={profile.nickname}
                onOpenAdmin={onOpenAdmin}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
