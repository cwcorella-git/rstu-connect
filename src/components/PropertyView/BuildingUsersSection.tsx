'use client'

import { useOrganizingProgress, formatUnitRanges, type RegisteredMember } from '@/hooks/useOrganizingProgress'
import { useLanguage } from '@/contexts/LanguageContext'

interface BuildingUsersSectionProps {
  buildingId: string
  buildingAddress: string
  totalUnits?: number
}

export function BuildingUsersSection({ buildingId, buildingAddress, totalUnits }: BuildingUsersSectionProps) {
  const { t } = useLanguage()
  const { progress, isLoading, refresh } = useOrganizingProgress(buildingId, totalUnits)

  if (isLoading) {
    return (
      <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
        {t('common.loading') || 'Loading...'}
      </div>
    )
  }

  const hasMembers = progress && progress.registeredMembers.length > 0
  const hasCanvassData = progress?.hasCanvassData
  const showProgress = hasCanvassData || hasMembers

  return (
    <div className="border-t border-gray-200 bg-gray-50">
      {/* Organizing Progress Panel */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
            <span>{t('organizing.progress') || 'Organizing Progress'}</span>
          </h4>
          <button
            onClick={refresh}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {t('common.refresh') || 'Refresh'}
          </button>
        </div>

        {/* Progress Bar */}
        {showProgress && progress && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>
                {progress.contacted}/{progress.totalUnits || '?'} {t('organizing.unitsReached') || 'units reached'}
              </span>
              <span className="font-medium">{progress.progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  progress.status === 'active' ? 'bg-green-500' :
                  progress.status === 'emerging' ? 'bg-yellow-500' :
                  progress.status === 'starting' ? 'bg-blue-500' :
                  'bg-gray-400'
                }`}
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats Pills */}
        {showProgress && progress && (progress.activeMembers > 0 || progress.interested > 0 || progress.followUp > 0) && (
          <div className="flex flex-wrap gap-2 mb-3">
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
          </div>
        )}

        {/* Registered Members */}
        {hasMembers && progress && (
          <div className="mb-3">
            <h5 className="text-xs font-medium text-gray-700 mb-2">
              {t('organizing.membersWithAccounts') || 'Members with Accounts'} ({progress.registeredMembers.length})
            </h5>
            <div className="space-y-1.5">
              {progress.registeredMembers.map((member: RegisteredMember) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700">
                    {member.nickname.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-medium text-gray-900">{member.nickname}</span>
                  {member.unitNumber && (
                    <span className="text-xs text-gray-500">Unit {member.unitNumber}</span>
                  )}
                  {member.isVerified && (
                    <span className="text-xs text-green-600">✓</span>
                  )}
                  {member.role !== 'tenant' && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
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

        {/* Units Still Needing Contact (verified users only) */}
        {progress?.canSeeUnitDetails && progress.notContactedUnits.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <h5 className="text-xs font-medium text-amber-800 mb-1.5">
              {t('organizing.stillNeedToReach') || 'Still Need to Reach'} ({progress.notContactedUnits.length} {t('buildings.units') || 'units'})
            </h5>
            <p className="text-xs text-amber-700 mb-2">
              {t('buildings.units') || 'Units'}: {formatUnitRanges(progress.notContactedUnits)}
            </p>
            <p className="text-xs text-amber-600 italic">
              {t('organizing.outreachTip') || 'Knock on doors, leave flyers, or share invite codes!'}
            </p>
          </div>
        )}

        {/* Not verified - show limited info */}
        {progress && !progress.canSeeUnitDetails && progress.notContactedUnits.length > 0 && (
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              {progress.notContactedUnits.length} {t('organizing.unitsNotYetReached') || 'units not yet reached'}
            </p>
            <p className="text-xs text-gray-500 italic mt-1">
              {t('organizing.getVerifiedToSeeUnits') || 'Get verified to see which units need outreach'}
            </p>
          </div>
        )}

        {/* No progress yet - call to action */}
        {!showProgress && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-800 mb-1">
              {t('organizing.noProgressYet') || 'No organizing progress yet'}
            </p>
            <p className="text-xs text-blue-600">
              {t('organizing.beFirstToOrganize') || 'Be the first to start organizing in this building! Share invite codes with your neighbors.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
