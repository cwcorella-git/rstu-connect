'use client'

import { useMemo } from 'react'
import { getTenantSafeProgress } from '@/lib/storage/canvassStorage'
import { getActiveCases } from '@/lib/storage/escalationStorage'
import { getActiveCommitments, getCommitmentProgress, COMMITMENT_LABELS } from '@/lib/storage/commitmentStorage'
import { useLanguage } from '@/contexts/LanguageContext'

interface SolidaritySectionProps {
  chatSlug: string
  totalUnits?: number
}

export function SolidaritySection({ chatSlug, totalUnits }: SolidaritySectionProps) {
  const { t } = useLanguage()

  // Get organizing progress data
  const progress = useMemo(() => {
    return getTenantSafeProgress(chatSlug, totalUnits)
  }, [chatSlug, totalUnits])

  // Get active issues count
  const issuesCount = useMemo(() => {
    return getActiveCases(chatSlug).length
  }, [chatSlug])

  // Get active commitments
  const commitments = useMemo(() => {
    return getActiveCommitments(chatSlug)
  }, [chatSlug])

  // Calculate total neighbors (activeMembers + interested)
  const neighborCount = progress.activeMembers + progress.interested

  // Check if we have any signals to show
  const hasAnySignals = neighborCount > 0 || issuesCount > 0 || commitments.length > 0

  // Don't show if no canvass data, no issues, and no commitments
  if (!progress.hasCanvassData && issuesCount === 0 && commitments.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-cyan-50 to-indigo-50 border border-cyan-200 rounded-lg p-3 mx-4 mt-2">
      <h4 className="text-sm font-semibold text-gray-800 mb-2">
        {t('solidarity.title')}
      </h4>

      {hasAnySignals ? (
        <>
          <div className="space-y-1.5">
            {/* Neighbors here */}
            {neighborCount >= 2 && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-cyan-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
                <span>
                  {neighborCount >= 5 ? '5+' : neighborCount} {t('solidarity.neighborsHere')}
                </span>
              </div>
            )}

            {/* Actively organizing */}
            {progress.activeMembers >= 1 && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-green-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </span>
                <span>
                  {progress.activeMembers} {t('solidarity.activelyOrganizing')}
                </span>
              </div>
            )}

            {/* Issues reported */}
            {issuesCount >= 1 && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-amber-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                <span>
                  {issuesCount} {issuesCount === 1 ? t('solidarity.issueReported') : t('solidarity.issuesReported')}
                </span>
              </div>
            )}

            {/* Active commitments */}
            {commitments.map(commitment => {
              const prog = getCommitmentProgress(commitment)
              const label = COMMITMENT_LABELS[commitment.type]
              return (
                <div key={commitment.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-blue-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <span>
                    {prog.current}/{prog.threshold} {t('solidarity.committedTo')} {label.title.toLowerCase()}
                    {prog.remaining > 0 && (
                      <span className="text-gray-500"> ({t('solidarity.needMore', { count: prog.remaining })})</span>
                    )}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Progress bar if we have enough data */}
          {progress.progressPercent > 0 && (
            <div className="mt-3">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all"
                  style={{ width: `${Math.min(progress.progressPercent, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {progress.progressPercent}% {t('solidarity.buildingReached')}
              </p>
            </div>
          )}

          {/* Call to action */}
          <p className="text-xs text-indigo-600 mt-2 font-medium">
            {t('solidarity.joinThem')}
          </p>
        </>
      ) : (
        /* Zero state */
        <p className="text-sm text-gray-600">
          {t('solidarity.beFirst')}
        </p>
      )}

      {/* Privacy note */}
      <p className="text-[10px] text-gray-400 mt-2">
        {t('solidarity.privacyNote')}
      </p>
    </div>
  )
}
