'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  type LandlordAlert,
  type LandlordAlertEventType,
  type LandlordAlertUrgency,
  getLandlordAlertsForBuilding,
  dismissLandlordAlert,
  getLandlordPortfolioSize,
} from '@/lib/landlordAlertStorage'
import { getCurrentProfile } from '@/lib/profileStorage'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import { useLanguage } from '@/contexts/LanguageContext'

interface LandlordAlertBannerProps {
  buildingApn: string
  allBuildings: EnhancedBuilding[]
  onNavigateToBuilding?: (chatSlug: string) => void
}

// Colors and styling per event type
const eventStyles: Record<LandlordAlertEventType, {
  bg: string
  border: string
  text: string
  textSecondary: string
  iconBg: string
  icon: string
}> = {
  victory: {
    bg: 'bg-green-50',
    border: 'border-green-500',
    text: 'text-green-900',
    textSecondary: 'text-green-700',
    iconBg: 'bg-green-100',
    icon: 'text-green-600',
  },
  demand_escalated: {
    bg: 'bg-orange-50',
    border: 'border-orange-500',
    text: 'text-orange-900',
    textSecondary: 'text-orange-700',
    iconBg: 'bg-orange-100',
    icon: 'text-orange-600',
  },
  strike_started: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-900',
    textSecondary: 'text-red-700',
    iconBg: 'bg-red-100',
    icon: 'text-red-600',
  },
}

// Event labels are now handled inside the component using t() function

// Icons per event type
function EventIcon({ eventType, className }: { eventType: LandlordAlertEventType; className?: string }) {
  switch (eventType) {
    case 'victory':
      // Trophy icon
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      )
    case 'demand_escalated':
      // Megaphone icon
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      )
    case 'strike_started':
      // Raised fist icon (hand)
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
        </svg>
      )
  }
}

export function LandlordAlertBanner({
  buildingApn,
  allBuildings,
  onNavigateToBuilding,
}: LandlordAlertBannerProps) {
  const { t } = useLanguage()
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState(false)

  // Get profile for dismissal tracking
  const profile = useMemo(() => getCurrentProfile(), [])
  const profileId = profile?.id || null

  // Get all alerts for this building, filtered by locally dismissed
  const alerts = useMemo(() => {
    const allAlerts = getLandlordAlertsForBuilding(buildingApn, allBuildings)
    return allAlerts.filter(alert => !dismissedIds.has(alert.id))
  }, [buildingApn, allBuildings, dismissedIds])

  // Get portfolio size for context
  const portfolioSize = useMemo(() => {
    return getLandlordPortfolioSize(buildingApn, allBuildings)
  }, [buildingApn, allBuildings])

  const handleDismiss = useCallback((alertId: string) => {
    if (profileId) {
      dismissLandlordAlert(alertId, profileId)
    }
    setDismissedIds(prev => new Set([...Array.from(prev), alertId]))
  }, [profileId])

  const handleViewBuilding = useCallback((chatSlug: string) => {
    if (onNavigateToBuilding && chatSlug) {
      onNavigateToBuilding(chatSlug)
    }
  }, [onNavigateToBuilding])

  // No alerts - show nothing
  if (alerts.length === 0) {
    return null
  }

  // Get the most urgent alert to display prominently
  const primaryAlert = alerts[0]
  const additionalAlerts = alerts.slice(1)
  const style = eventStyles[primaryAlert.eventType]

  // Get event label based on type
  const getEventLabel = (eventType: LandlordAlertEventType): string => {
    switch (eventType) {
      case 'victory': return t('alerts.victory')
      case 'demand_escalated': return t('alerts.demand')
      case 'strike_started': return t('alerts.strike')
      default: return eventType
    }
  }

  // Format relative time
  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now()
    const diffMs = now - timestamp
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return t('common.today')
    if (diffDays === 1) return t('common.yesterday')
    if (diffDays < 7) return t('common.daysAgo', { count: diffDays })
    if (diffDays < 30) return t('common.weeksAgo', { count: Math.floor(diffDays / 7) })
    return t('common.monthsAgo', { count: Math.floor(diffDays / 30) })
  }

  // Get urgency badge
  const getUrgencyBadge = (urgency: LandlordAlertUrgency) => {
    if (urgency === 'urgent') {
      return (
        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded uppercase">
          {t('alerts.urgent')}
        </span>
      )
    }
    if (urgency === 'important') {
      return (
        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-orange-500 text-white rounded uppercase">
          {t('alerts.important')}
        </span>
      )
    }
    return null
  }

  return (
    <div className="space-y-2 mb-3">
      {/* Portfolio context badge */}
      {portfolioSize > 1 && (
        <div className="flex items-center gap-1 text-[10px] text-gray-500 px-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>{t('alerts.sameOwner', { count: portfolioSize })}</span>
        </div>
      )}

      {/* Primary Alert */}
      <div className={`${style.bg} border-l-4 ${style.border} p-3 rounded`}>
        <div className="flex gap-3">
          {/* Event Icon */}
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full ${style.iconBg} flex items-center justify-center`}>
              <EventIcon eventType={primaryAlert.eventType} className={`w-5 h-5 ${style.icon}`} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-semibold text-sm ${style.text}`}>
                {primaryAlert.title}
              </h3>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${style.iconBg} ${style.icon}`}>
                {getEventLabel(primaryAlert.eventType)}
              </span>
              {getUrgencyBadge(primaryAlert.urgency)}
            </div>

            <p className={`text-sm ${style.textSecondary} mt-1`}>
              {primaryAlert.description}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {formatRelativeTime(primaryAlert.timestamp)} at another {primaryAlert.landlordName.split(' ').slice(0, 2).join(' ')} property
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {onNavigateToBuilding && primaryAlert.sourceChatSlug && (
                <button
                  onClick={() => handleViewBuilding(primaryAlert.sourceChatSlug)}
                  className={`px-3 py-1 text-xs font-medium rounded transition ${
                    primaryAlert.eventType === 'strike_started'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : primaryAlert.eventType === 'victory'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  {t('alerts.viewBuilding')}
                </button>
              )}
              <button
                onClick={() => handleDismiss(primaryAlert.id)}
                className={`px-3 py-1 text-xs ${style.textSecondary} hover:underline`}
              >
                {t('common.dismiss')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Alerts (collapsed by default) */}
      {additionalAlerts.length > 0 && (
        <>
          {!expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="w-full py-2 px-3 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition flex items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('alerts.moreAlerts', { count: additionalAlerts.length, alertWord: additionalAlerts.length === 1 ? t('alerts.alert') : t('alerts.alertsPlural') })}
            </button>
          )}

          {expanded && (
            <>
              {additionalAlerts.map(alert => {
                const alertStyle = eventStyles[alert.eventType]
                return (
                  <div
                    key={alert.id}
                    className={`${alertStyle.bg} border-l-4 ${alertStyle.border} p-2 rounded flex items-center gap-2`}
                  >
                    <div className={`w-6 h-6 rounded-full ${alertStyle.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <EventIcon eventType={alert.eventType} className={`w-4 h-4 ${alertStyle.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-medium px-1 py-0.5 rounded ${alertStyle.iconBg} ${alertStyle.icon}`}>
                          {getEventLabel(alert.eventType)}
                        </span>
                        {getUrgencyBadge(alert.urgency)}
                      </div>
                      <p className={`text-xs ${alertStyle.textSecondary} mt-0.5 truncate`}>
                        {alert.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {onNavigateToBuilding && alert.sourceChatSlug && (
                        <button
                          onClick={() => handleViewBuilding(alert.sourceChatSlug)}
                          className={`px-2 py-1 text-[10px] font-medium ${alertStyle.text} hover:underline`}
                        >
                          {t('common.view')}
                        </button>
                      )}
                      <button
                        onClick={() => handleDismiss(alert.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title={t('common.dismiss')}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}

              <button
                onClick={() => setExpanded(false)}
                className="w-full py-1 text-xs text-gray-500 hover:text-gray-700"
              >
                Show less
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}
