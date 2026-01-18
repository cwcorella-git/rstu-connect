'use client'

import { ElectionsDashboard } from '@/components/Elections'
import { useLanguage } from '@/contexts/LanguageContext'

interface ProfileVotingSectionProps {
  profileId: string
  profileName: string
}

export function ProfileVotingSection({ profileId, profileName }: ProfileVotingSectionProps) {
  const { t } = useLanguage()

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">
          {t('elections.title') || 'Elections'}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Vote for union officers using ranked choice voting
        </p>
      </div>

      {/* Elections Content */}
      <div className="p-4">
        <ElectionsDashboard profileId={profileId} profileName={profileName} />
      </div>
    </div>
  )
}
