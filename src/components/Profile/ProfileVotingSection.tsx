'use client'

import { useState } from 'react'
import { ElectionsDashboard, ElectionAdmin } from '@/components/Elections'
import { useLanguage } from '@/contexts/LanguageContext'

interface ProfileVotingSectionProps {
  profileId: string
  profileName: string
  isAdmin?: boolean
}

export function ProfileVotingSection({ profileId, profileName, isAdmin = false }: ProfileVotingSectionProps) {
  const { t } = useLanguage()
  const [showAdmin, setShowAdmin] = useState(false)

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {t('elections.title') || 'Elections'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Building officer elections via ranked-choice voting
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  showAdmin
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-rstu-red text-white hover:bg-red-700'
                }`}
              >
                {showAdmin ? 'Back to Elections' : 'Start an Election'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {showAdmin ? (
          <ElectionAdmin profileId={profileId} />
        ) : (
          <ElectionsDashboard profileId={profileId} profileName={profileName} />
        )}
      </div>
    </div>
  )
}
