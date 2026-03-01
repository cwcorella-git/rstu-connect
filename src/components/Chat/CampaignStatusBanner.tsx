'use client'

import { useBuildingCampaign } from '@/hooks/useBuildingCampaign'
import { useLanguage } from '@/contexts/LanguageContext'

interface CampaignStatusBannerProps {
  chatSlug: string
  onViewDetails?: () => void
}

export function CampaignStatusBanner({ chatSlug, onViewDetails }: CampaignStatusBannerProps) {
  const { t } = useLanguage()
  const { campaignInfo, isLoading } = useBuildingCampaign(chatSlug)

  if (isLoading || !campaignInfo.isActive || !campaignInfo.campaign) {
    return null
  }

  const { campaign, stageName, stageProgress, participationRate, monthlyRentAtRisk } = campaignInfo
  const participating = campaign.participatingUnits || 0
  const estimated = campaign.estimatedUnits || 0

  // Format rent at risk
  const formatRent = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}k`
    }
    return `$${amount.toLocaleString()}`
  }

  // Determine banner color based on stage
  const isActiveStrike = campaign.stage === 'active'
  const bgColor = isActiveStrike ? 'bg-red-50' : 'bg-amber-50'
  const borderColor = isActiveStrike ? 'border-red-500' : 'border-amber-500'
  const textColor = isActiveStrike ? 'text-red-900' : 'text-amber-900'
  const textSecondary = isActiveStrike ? 'text-red-700' : 'text-amber-700'
  const iconBg = isActiveStrike ? 'bg-red-100' : 'bg-amber-100'
  const iconColor = isActiveStrike ? 'text-red-600' : 'text-amber-600'

  return (
    <div className={`${bgColor} border-l-4 ${borderColor} p-3 rounded mb-3`}>
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center`}>
            {isActiveStrike ? (
              <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            ) : (
              <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold text-sm ${textColor}`}>
              {isActiveStrike
                ? (t('campaign.strikeActive') || 'Strike Active')
                : (t('campaign.campaignActive') || 'Campaign Active')
              }
            </h3>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              isActiveStrike ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'
            }`}>
              {stageName}
            </span>
          </div>

          <p className={`text-sm ${textSecondary} mt-0.5 font-medium truncate`}>
            {campaign.name}
          </p>

          {/* Stats row */}
          <div className={`flex items-center gap-3 mt-2 text-xs ${textSecondary}`}>
            {estimated > 0 && (
              <span>
                {participating}/{estimated} {t('campaign.committed') || 'committed'}
              </span>
            )}
            {monthlyRentAtRisk > 0 && (
              <>
                <span className="opacity-50">·</span>
                <span>{formatRent(monthlyRentAtRisk)}/mo {t('campaign.atRisk') || 'at risk'}</span>
              </>
            )}
            {campaign.targetDate && (
              <>
                <span className="opacity-50">·</span>
                <span>{t('campaign.target') || 'Target'}: {new Date(campaign.targetDate).toLocaleDateString()}</span>
              </>
            )}
          </div>

          {/* View Details button */}
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className={`mt-2 text-xs font-medium ${textColor} hover:underline`}
            >
              {t('campaign.viewDetails') || 'View Details'} →
            </button>
          )}
        </div>

        {/* Progress indicator */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center">
          <div className={`text-lg font-bold ${textColor}`}>{stageProgress}%</div>
          <div className={`text-[10px] ${textSecondary}`}>{t('campaign.progress') || 'progress'}</div>
        </div>
      </div>
    </div>
  )
}
