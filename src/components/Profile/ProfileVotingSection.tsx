'use client'

import { useState } from 'react'
import { ElectionsDashboard, ElectionAdmin } from '@/components/Elections'
import { DelegateStatusCard } from './DelegateStatusCard'
import { AppGovernancePanel } from './AppGovernancePanel'
import { useLanguage } from '@/contexts/LanguageContext'

type VotingTab = 'elections' | 'delegate' | 'governance'

interface ProfileVotingSectionProps {
  profileId: string
  profileName: string
  isAdmin?: boolean
}

export function ProfileVotingSection({ profileId, profileName, isAdmin = false }: ProfileVotingSectionProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<VotingTab>('elections')
  const [showAdmin, setShowAdmin] = useState(false)

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header with Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="px-4 pt-3 pb-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {t('profile.votingGovernance') || 'Voting & Governance'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Union elections and delegate representation
              </p>
            </div>
            {isAdmin && activeTab === 'elections' && (
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

          {/* Tab Buttons */}
          <div className="flex gap-1">
            <button
              onClick={() => { setActiveTab('elections'); setShowAdmin(false); }}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'elections'
                  ? 'bg-white text-gray-900 border-t border-x border-gray-200'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                {t('elections.title') || 'Elections'}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('delegate')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'delegate'
                  ? 'bg-white text-gray-900 border-t border-x border-gray-200'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {t('governance.delegateStatus') || 'Delegate Status'}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('governance')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'governance'
                  ? 'bg-white text-gray-900 border-t border-x border-gray-200'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {t('governance.appGovernance') || 'App Governance'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'elections' ? (
          showAdmin ? (
            <ElectionAdmin profileId={profileId} />
          ) : (
            <ElectionsDashboard profileId={profileId} profileName={profileName} />
          )
        ) : activeTab === 'delegate' ? (
          <DelegateStatusCard profileId={profileId} />
        ) : (
          <AppGovernancePanel profileId={profileId} />
        )}
      </div>
    </div>
  )
}
