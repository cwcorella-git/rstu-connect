'use client'

import { useMemo } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  getCurrentDelegateProfile,
  getDelegateStats,
  type DelegateProfile,
} from '@/lib/storage/delegateStorage'
import { getDelegateThresholds } from '@/lib/storage/adminSettingsStorage'

interface DelegateStatusCardProps {
  profileId: string
}

export function DelegateStatusCard({ profileId }: DelegateStatusCardProps) {
  const { t } = useLanguage()

  const delegateProfile = useMemo(() => getCurrentDelegateProfile(), [])
  const delegateStats = useMemo(() => getDelegateStats(), [])
  const thresholds = useMemo(() => getDelegateThresholds(), [])

  if (!delegateProfile) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500">
        {t('delegate.noProfile')}
      </div>
    )
  }

  const { qualificationStatus, canVoteOnAppGovernance, delegateWeight } = delegateProfile
  const isQualified = canVoteOnAppGovernance

  // Calculate progress percentages
  const tenantsProgress = Math.min(
    100,
    (delegateProfile.verifiedTenantsRepresented / thresholds.minVerifiedTenants) * 100
  )
  const blocsProgress = Math.min(
    100,
    (delegateProfile.blocs.length / thresholds.minBlocs) * 100
  )
  const activityProgress = Math.min(
    100,
    (delegateProfile.activityScore / thresholds.minActivityScore) * 100
  )

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className={`rounded-lg p-4 ${
        isQualified
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
          : 'bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isQualified ? 'bg-green-100' : 'bg-amber-100'
          }`}>
            {isQualified ? (
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div>
            <h4 className={`font-semibold ${isQualified ? 'text-green-800' : 'text-amber-800'}`}>
              {isQualified ? t('delegate.qualified') : t('delegate.progress')}
            </h4>
            <p className={`text-sm ${isQualified ? 'text-green-600' : 'text-amber-600'}`}>
              {isQualified
                ? t('delegate.votingWeight', { weight: delegateWeight.toFixed(1) })
                : t('delegate.completeRequirements')}
            </p>
          </div>
        </div>
      </div>

      {/* Qualification Progress */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">{t('delegate.qualificationRequirements')}</h4>

        <div className="space-y-4">
          {/* Verified Tenants */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                  qualificationStatus.meetsTenantsThreshold
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {qualificationStatus.meetsTenantsThreshold ? '✓' : ''}
                </span>
                <span className="text-sm text-gray-700">{t('delegate.verifiedTenants')}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {delegateProfile.verifiedTenantsRepresented} / {thresholds.minVerifiedTenants}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  qualificationStatus.meetsTenantsThreshold ? 'bg-green-500' : 'bg-amber-500'
                }`}
                style={{ width: `${tenantsProgress}%` }}
              />
            </div>
          </div>

          {/* Blocs Organized */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                  qualificationStatus.meetsBlocsThreshold
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {qualificationStatus.meetsBlocsThreshold ? '✓' : ''}
                </span>
                <span className="text-sm text-gray-700">{t('delegate.blocsOrganized')}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {delegateProfile.blocs.length} / {thresholds.minBlocs}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  qualificationStatus.meetsBlocsThreshold ? 'bg-green-500' : 'bg-amber-500'
                }`}
                style={{ width: `${blocsProgress}%` }}
              />
            </div>
          </div>

          {/* Activity Score */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                  qualificationStatus.meetsActivityThreshold
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {qualificationStatus.meetsActivityThreshold ? '✓' : ''}
                </span>
                <span className="text-sm text-gray-700">{t('delegate.activityScore')}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {delegateProfile.activityScore} / {thresholds.minActivityScore}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  qualificationStatus.meetsActivityThreshold ? 'bg-green-500' : 'bg-amber-500'
                }`}
                style={{ width: `${activityProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Breakdown */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">{t('delegate.yourActivity')}</h4>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">{delegateProfile.proposalsCreated}</div>
            <div className="text-xs text-gray-500">{t('delegate.proposals')}</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{delegateProfile.votesParticipated}</div>
            <div className="text-xs text-gray-500">{t('delegate.votes')}</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{delegateProfile.buildingsRepresented}</div>
            <div className="text-xs text-gray-500">{t('delegate.buildings')}</div>
          </div>
        </div>
      </div>

      {/* Delegate Network Stats */}
      {delegateStats.totalDelegates > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">{t('delegate.network')}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-lg font-bold text-blue-800">{delegateStats.totalDelegates}</div>
              <div className="text-xs text-blue-600">{t('delegate.activeDelegates')}</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-800">{delegateStats.totalTenantsRepresented}</div>
              <div className="text-xs text-blue-600">{t('delegate.tenantsRepresented')}</div>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('delegate.howItWorks')}</h4>
        <ul className="text-xs text-gray-600 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-gray-400">1.</span>
            <span>{t('delegate.howStep1')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400">2.</span>
            <span>{t('delegate.howStep2')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400">3.</span>
            <span>{t('delegate.howStep3')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400">4.</span>
            <span>{t('delegate.howStep4')}</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
