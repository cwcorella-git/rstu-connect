'use client'

import { ElectionsDashboard } from '@/components/Elections'
import { useLanguage } from '@/contexts/LanguageContext'

interface ProfileVotingSectionProps {
  profileId: string
  profileName: string
  isAdmin?: boolean
}

export function ProfileVotingSection({ profileId, profileName, isAdmin = false }: ProfileVotingSectionProps) {
  const { t } = useLanguage()

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900">
            {t('elections.title') || 'Elections'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {t('elections.description')}
          </p>
        </div>
      </div>

      {/* Content - Dashboard handles all states including admin controls */}
      <div className="p-4">
        <ElectionsDashboard
          profileId={profileId}
          profileName={profileName}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  )
}
