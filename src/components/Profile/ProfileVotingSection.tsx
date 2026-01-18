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
      <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {t('elections.title') || 'Elections'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Vote for union officers using ranked choice voting
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAdmin(!showAdmin)}
              className={`p-2 rounded-lg transition-colors ${
                showAdmin
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title={showAdmin ? 'Back to Elections' : 'Manage Elections'}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
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
