'use client'

import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { useOrganizingProgress, formatUnitRanges, type RegisteredMember } from '@/hooks/useOrganizingProgress'
import { useLanguage } from '@/contexts/LanguageContext'

interface OrganizingStatusBarProps {
  buildingId: string
  buildingAddress: string
  totalUnits?: number
}

export function OrganizingStatusBar({ buildingId, buildingAddress, totalUnits }: OrganizingStatusBarProps) {
  const { t } = useLanguage()
  const { progress, isLoading, refresh } = useOrganizingProgress(buildingId, totalUnits)
  const [isExpanded, setIsExpanded] = useState(false)

  if (isLoading) {
    return (
      <div className="border-t border-gray-200 bg-gray-50 px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
          {t('common.loading') || 'Loading...'}
        </div>
      </div>
    )
  }

  const hasMembers = progress && progress.registeredMembers.length > 0
  const hasCanvassData = progress?.hasCanvassData
  const hasAnyProgress = hasCanvassData || hasMembers
  const hasStats = progress && (progress.activeMembers > 0 || progress.interested > 0 || progress.followUp > 0)

  // Determine status color
  const getStatusColor = () => {
    if (!progress) return 'bg-gray-300'
    switch (progress.status) {
      case 'active': return 'bg-green-500'
      case 'emerging': return 'bg-yellow-500'
      case 'starting': return 'bg-blue-500'
      default: return 'bg-gray-300'
    }
  }

  return (
    <div className="border-t border-gray-200 bg-gray-50">
      {/* Collapsed Status Bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-100 transition-colors"
      >
        {/* Mini Progress Bar */}
        <div className="flex-1 flex items-center gap-2">
          <UserGroupIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />

          {hasAnyProgress && progress ? (
            <>
              {/* Progress indicator */}
              <div className="flex-1 max-w-[120px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getStatusColor()}`}
                  style={{ width: `${Math.min(progress.progressPercent, 100)}%` }}
                />
              </div>

              {/* Stats summary */}
              <span className="text-xs text-gray-600">
                {progress.contacted}/{progress.totalUnits || '?'}
              </span>

              {/* Key metrics */}
              <div className="flex items-center gap-1.5 text-xs">
                {progress.activeMembers > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                    {progress.activeMembers} {t('organizing.active') || 'Active'}
                  </span>
                )}
                {progress.interested > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                    {progress.interested} {t('organizing.interestedShort') || 'Int.'}
                  </span>
                )}
                {!hasStats && progress.contacted > 0 && (
                  <span className="text-gray-500">
                    {progress.progressPercent}% {t('organizing.reached') || 'reached'}
                  </span>
                )}
              </div>
            </>
          ) : (
            <span className="text-xs text-gray-500">
              {t('organizing.noProgressYet') || 'No organizing progress yet'}
            </span>
          )}
        </div>

        {/* Expand/Collapse indicator */}
        {isExpanded ? (
          <ChevronUpIcon className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-gray-200">
          {/* Header with refresh */}
          <div className="flex items-center justify-between pt-2">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              {t('organizing.progress') || 'Organizing Progress'}
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation()
                refresh()
              }}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {t('common.refresh') || 'Refresh'}
            </button>
          </div>

          {/* Detailed Progress Bar */}
          {hasAnyProgress && progress && (
            <div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>
                  {progress.contacted}/{progress.totalUnits || '?'} {t('organizing.unitsReached') || 'units reached'}
                </span>
                <span className="font-medium">{progress.progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getStatusColor()}`}
                  style={{ width: `${progress.progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats Breakdown */}
          {hasStats && progress && (
            <div className="flex flex-wrap gap-2">
              {progress.activeMembers > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {progress.activeMembers} {t('organizing.activeMembers') || 'Active'}
                </span>
              )}
              {progress.interested > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {progress.interested} {t('organizing.interested') || 'Interested'}
                </span>
              )}
              {progress.followUp > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {progress.followUp} {t('organizing.followUp') || 'Follow-up'}
                </span>
              )}
              {progress.notInterested > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {progress.notInterested} {t('organizing.notInterested') || 'Not interested'}
                </span>
              )}
            </div>
          )}

          {/* Registered Members */}
          {hasMembers && progress && (
            <div>
              <h5 className="text-xs font-medium text-gray-700 mb-2">
                {t('organizing.membersWithAccounts') || 'Members with Accounts'} ({progress.registeredMembers.length})
              </h5>
              <div className="space-y-1.5">
                {progress.registeredMembers.map((member: RegisteredMember) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700">
                      {member.nickname.charAt(0).toUpperCase()}
                    </span>
                    <span className="font-medium text-gray-900 text-xs">{member.nickname}</span>
                    {member.unitNumber && (
                      <span className="text-xs text-gray-500">#{member.unitNumber}</span>
                    )}
                    {member.isVerified && (
                      <span className="text-xs text-green-600">✓</span>
                    )}
                    {member.role !== 'tenant' && (
                      <span className={`text-[10px] px-1 py-0.5 rounded ${
                        member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {member.role}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Units Needing Contact (verified users only) */}
          {progress?.canSeeUnitDetails && progress.notContactedUnits.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              <h5 className="text-xs font-medium text-amber-800 mb-1">
                {t('organizing.stillNeedToReach') || 'Still Need to Reach'} ({progress.notContactedUnits.length})
              </h5>
              <p className="text-xs text-amber-700">
                {formatUnitRanges(progress.notContactedUnits)}
              </p>
            </div>
          )}

          {/* Not verified - show limited info */}
          {progress && !progress.canSeeUnitDetails && progress.notContactedUnits.length > 0 && (
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-2.5">
              <p className="text-xs text-gray-600">
                {progress.notContactedUnits.length} {t('organizing.unitsNotYetReached') || 'units not yet reached'}
              </p>
              <p className="text-xs text-gray-500 italic mt-0.5">
                {t('organizing.getVerifiedToSeeUnits') || 'Get verified to see which units need outreach'}
              </p>
            </div>
          )}

          {/* No progress - call to action */}
          {!hasAnyProgress && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
              <p className="text-xs font-medium text-blue-800 mb-0.5">
                {t('organizing.noProgressYet') || 'No organizing progress yet'}
              </p>
              <p className="text-xs text-blue-600">
                {t('organizing.beFirstToOrganize') || 'Be the first to start organizing in this building!'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
