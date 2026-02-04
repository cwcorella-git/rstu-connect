'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  type EvictionAlert,
  type AlertScope,
  type WitnessSignup,
  getAlertsForBuilding,
  dismissEvictionAlert,
  isAlertDismissed,
  addCrossBuildingSupport,
} from '@/lib/storage/evictionDefenseStorage'
import { getCurrentProfile } from '@/lib/storage/profileStorage'
import type { EnhancedBuilding } from '@/lib/data/getBuildingsData'
import { useLanguage } from '@/contexts/LanguageContext'

interface EvictionAlertBannerProps {
  buildingApn: string
  allBuildings: EnhancedBuilding[]
  profileId: string | null
  onViewCase?: (caseId: string) => void
  onReportCase?: () => void
}

// Colors and styling per scope
const scopeStyles: Record<AlertScope, {
  bg: string
  border: string
  text: string
  textSecondary: string
  iconBg: string
  icon: string
}> = {
  building: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-900',
    textSecondary: 'text-red-700',
    iconBg: 'bg-red-100',
    icon: 'text-red-600',
  },
  bloc: {
    bg: 'bg-orange-50',
    border: 'border-orange-500',
    text: 'text-orange-900',
    textSecondary: 'text-orange-700',
    iconBg: 'bg-orange-100',
    icon: 'text-orange-600',
  },
  alliance: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-500',
    text: 'text-yellow-900',
    textSecondary: 'text-yellow-700',
    iconBg: 'bg-yellow-100',
    icon: 'text-yellow-600',
  },
  owner: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    text: 'text-blue-900',
    textSecondary: 'text-blue-700',
    iconBg: 'bg-blue-100',
    icon: 'text-blue-600',
  },
}

const scopeLabels: Record<AlertScope, string> = {
  building: 'This Building',
  bloc: 'Your Bloc',
  alliance: 'Allied Building',
  owner: 'Same Landlord',
}

export function EvictionAlertBanner({
  buildingApn,
  allBuildings,
  profileId,
  onViewCase,
  onReportCase,
}: EvictionAlertBannerProps) {
  const { t } = useLanguage()
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState(false)
  const [supportCaseId, setSupportCaseId] = useState<string | null>(null)
  const [supportRole, setSupportRole] = useState<WitnessSignup['role']>('neighbor')
  const [supportSubmitting, setSupportSubmitting] = useState(false)
  const [supportSuccess, setSupportSuccess] = useState(false)

  // Get all alerts for this building, filtered by dismissed
  const alerts = useMemo(() => {
    const allAlerts = getAlertsForBuilding(buildingApn, allBuildings)
    return allAlerts.filter(alert => {
      if (dismissedIds.has(alert.caseId)) return false
      if (profileId && isAlertDismissed(alert.caseId, profileId)) return false
      return true
    })
  }, [buildingApn, allBuildings, profileId, dismissedIds])

  const handleDismiss = useCallback((caseId: string) => {
    if (profileId) {
      dismissEvictionAlert(caseId, profileId)
    }
    setDismissedIds(prev => new Set([...Array.from(prev), caseId]))
  }, [profileId])

  const handlePledgeSupport = useCallback((caseId: string) => {
    setSupportCaseId(caseId)
    setSupportRole('neighbor')
    setSupportSuccess(false)
  }, [])

  const handleSubmitSupport = useCallback(() => {
    if (!supportCaseId || !profileId) return

    setSupportSubmitting(true)
    const profile = getCurrentProfile()
    const witness: WitnessSignup & { sourceBuildingApn?: string } = {
      name: profile?.nickname || 'Anonymous Supporter',
      role: supportRole,
      status: 'interested',
      signedUpAt: new Date().toISOString(),
      signedUpBy: profileId,
      sourceBuildingApn: buildingApn,
    }

    const result = addCrossBuildingSupport(supportCaseId, witness)
    setSupportSubmitting(false)

    if (result) {
      setSupportSuccess(true)
      setTimeout(() => {
        setSupportCaseId(null)
        setSupportSuccess(false)
      }, 2000)
    }
  }, [supportCaseId, profileId, supportRole, buildingApn])

  // No alerts - show nothing
  if (alerts.length === 0) {
    return null
  }

  // Get the most urgent alert to display prominently
  const primaryAlert = alerts[0]
  const additionalAlerts = alerts.slice(1)
  const style = scopeStyles[primaryAlert.scope]

  // Format days remaining
  const formatDaysRemaining = (days: number | null): string => {
    if (days === null) return ''
    if (days < 0) return 'Overdue'
    if (days === 0) return 'Today'
    if (days === 1) return '1 day'
    return `${days} days`
  }

  // Get urgency badge
  const getUrgencyBadge = (alert: EvictionAlert) => {
    if (alert.urgency === 'critical') {
      return (
        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded uppercase">
          Critical
        </span>
      )
    }
    if (alert.urgency === 'urgent') {
      return (
        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-orange-500 text-white rounded uppercase">
          Urgent
        </span>
      )
    }
    return null
  }

  // Format alert message
  const getAlertMessage = (alert: EvictionAlert): string => {
    const parts: string[] = []

    if (alert.scope === 'building') {
      parts.push(`${alert.unitDisplay} is facing eviction`)
    } else {
      parts.push(`Eviction case at ${alert.sourceAddress.split(',')[0]}`)
    }

    if (alert.noticeType) {
      parts.push(`(${alert.noticeType} notice)`)
    }

    if (alert.daysRemaining !== null && alert.daysRemaining >= 0) {
      parts.push(`- ${formatDaysRemaining(alert.daysRemaining)} to respond`)
    } else if (alert.stage === 'court') {
      parts.push('- Court date scheduled')
    }

    return parts.join(' ')
  }

  return (
    <div className="space-y-2 mb-3">
      {/* Primary Alert */}
      <div className={`${style.bg} border-l-4 ${style.border} p-3 rounded`}>
        <div className="flex gap-3">
          {/* Warning Icon */}
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full ${style.iconBg} flex items-center justify-center`}>
              <svg className={`w-5 h-5 ${style.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-semibold text-sm ${style.text}`}>
                {t('eviction.alertTitle') || 'Eviction Alert'}
              </h3>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${style.iconBg} ${style.icon}`}>
                {scopeLabels[primaryAlert.scope]}
              </span>
              {getUrgencyBadge(primaryAlert)}
            </div>

            <p className={`text-sm ${style.textSecondary} mt-1`}>
              {getAlertMessage(primaryAlert)}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {onViewCase && (
                <button
                  onClick={() => onViewCase(primaryAlert.caseId)}
                  className={`px-3 py-1 text-xs font-medium rounded transition ${
                    primaryAlert.scope === 'building'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-800 text-white hover:bg-gray-900'
                  }`}
                >
                  {primaryAlert.scope === 'building'
                    ? (t('eviction.viewCase') || 'View Case')
                    : (t('eviction.viewDetails') || 'View Details')
                  }
                </button>
              )}
              {primaryAlert.scope !== 'building' && profileId && (
                <button
                  onClick={() => handlePledgeSupport(primaryAlert.caseId)}
                  className="px-3 py-1 text-xs font-medium rounded transition bg-green-600 text-white hover:bg-green-700"
                >
                  {t('eviction.pledgeSupport') || 'I Can Support'}
                </button>
              )}
              <button
                onClick={() => handleDismiss(primaryAlert.caseId)}
                className={`px-3 py-1 text-xs ${style.textSecondary} hover:underline`}
              >
                {t('common.dismiss') || 'Dismiss'}
              </button>
            </div>
          </div>

          {/* Days Counter */}
          {primaryAlert.daysRemaining !== null && primaryAlert.daysRemaining >= 0 && (
            <div className="flex-shrink-0 flex flex-col items-center justify-center">
              <div className={`text-lg font-bold ${style.text}`}>
                {primaryAlert.daysRemaining}
              </div>
              <div className={`text-[10px] ${style.textSecondary}`}>
                {primaryAlert.daysRemaining === 1 ? 'day' : 'days'}
              </div>
            </div>
          )}
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
              {additionalAlerts.length} more eviction {additionalAlerts.length === 1 ? 'alert' : 'alerts'}
            </button>
          )}

          {expanded && (
            <>
              {additionalAlerts.map(alert => {
                const alertStyle = scopeStyles[alert.scope]
                return (
                  <div
                    key={alert.caseId}
                    className={`${alertStyle.bg} border-l-4 ${alertStyle.border} p-2 rounded flex items-center gap-2`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-medium px-1 py-0.5 rounded ${alertStyle.iconBg} ${alertStyle.icon}`}>
                          {scopeLabels[alert.scope]}
                        </span>
                        {getUrgencyBadge(alert)}
                      </div>
                      <p className={`text-xs ${alertStyle.textSecondary} mt-0.5 truncate`}>
                        {getAlertMessage(alert)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {onViewCase && (
                        <button
                          onClick={() => onViewCase(alert.caseId)}
                          className={`px-2 py-1 text-[10px] font-medium ${alertStyle.text} hover:underline`}
                        >
                          View
                        </button>
                      )}
                      {alert.scope !== 'building' && profileId && (
                        <button
                          onClick={() => handlePledgeSupport(alert.caseId)}
                          className="px-2 py-1 text-[10px] font-medium text-green-600 hover:underline"
                        >
                          Support
                        </button>
                      )}
                      <button
                        onClick={() => handleDismiss(alert.caseId)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Dismiss"
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

      {/* Report New Case Button (only shown for building scope when there are alerts) */}
      {onReportCase && alerts.some(a => a.scope === 'building') && (
        <button
          onClick={onReportCase}
          className="w-full py-2 px-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition"
        >
          Report Another Eviction in This Building
        </button>
      )}

      {/* Support Pledge Modal */}
      {supportCaseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-4">
            {supportSuccess ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {t('eviction.supportPledged') || 'Support Pledged!'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('eviction.supportThanks') || 'Thank you for standing with your neighbor.'}
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('eviction.pledgeSupportTitle') || 'Pledge Your Support'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t('eviction.pledgeSupportDesc') || 'Your neighbor is facing eviction. How would you like to help?'}
                </p>

                <div className="space-y-2 mb-4">
                  <label className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="supportRole"
                      value="neighbor"
                      checked={supportRole === 'neighbor'}
                      onChange={() => setSupportRole('neighbor')}
                      className="text-green-600"
                    />
                    <div>
                      <span className="text-sm font-medium">Neighbor Witness</span>
                      <p className="text-xs text-gray-500">Attend court to show community support</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="supportRole"
                      value="organizer"
                      checked={supportRole === 'organizer'}
                      onChange={() => setSupportRole('organizer')}
                      className="text-green-600"
                    />
                    <div>
                      <span className="text-sm font-medium">Organizer Support</span>
                      <p className="text-xs text-gray-500">Help coordinate defense efforts</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="supportRole"
                      value="other"
                      checked={supportRole === 'other'}
                      onChange={() => setSupportRole('other')}
                      className="text-green-600"
                    />
                    <div>
                      <span className="text-sm font-medium">Other Support</span>
                      <p className="text-xs text-gray-500">Moving help, childcare, meals, etc.</p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSubmitSupport}
                    disabled={supportSubmitting}
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 font-medium text-sm disabled:opacity-50"
                  >
                    {supportSubmitting
                      ? (t('common.submitting') || 'Submitting...')
                      : (t('eviction.confirmSupport') || 'Confirm Support')
                    }
                  </button>
                  <button
                    onClick={() => setSupportCaseId(null)}
                    className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium text-sm"
                  >
                    {t('common.cancel') || 'Cancel'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
