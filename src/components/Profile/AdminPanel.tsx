'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import {
  exportProfileData,
  isAdmin,
  getCurrentProfile,
} from '@/lib/profileStorage'
import {
  getAdminSettings,
  updateAdminSettings,
  type AdminSettings,
} from '@/lib/adminSettingsStorage'
import { exportCanvassData, importCanvassData, getCanvassState } from '@/lib/canvassStorage'
import { AlertModal } from '@/components/ui/ConfirmModal'
import { ElectionAdmin } from '@/components/Elections'
import {
  getAdminNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  subscribeToNotifications,
  onNotificationsChange,
  type SystemNotification,
} from '@/lib/notificationStorage'

interface AdminPanelProps {
  buildings: EnhancedBuilding[]
  onClose: () => void
}

export function AdminPanel({ buildings, onClose }: AdminPanelProps) {
  const { t } = useLanguage()
  const [canvassStats, setCanvassStats] = useState<{
    buildings: number
    totalUnits: number
    contacted: number
  }>({ buildings: 0, totalUnits: 0, contacted: 0 })

  // Admin settings state
  const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null)

  // Notifications state
  const [notifications, setNotifications] = useState<SystemNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Alert modal state
  const [alertMessage, setAlertMessage] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)

  useEffect(() => {
    // Load admin settings
    setAdminSettings(getAdminSettings())

    // Subscribe to server notifications (real-time)
    subscribeToNotifications()

    // Listen for notification changes (real-time updates)
    const unsubscribe = onNotificationsChange((notifications) => {
      setNotifications(notifications)
      const profile = getCurrentProfile()
      if (profile) {
        const unread = notifications.filter(n => !n.readBy.includes(profile.id)).length
        setUnreadCount(unread)
      }
    })

    // Calculate canvass stats
    const state = getCanvassState()
    let totalUnits = 0
    let contacted = 0
    for (const building of Object.values(state.buildings)) {
      const units = Object.values(building.units)
      totalUnits += units.length
      contacted += units.filter(u => !['NOT_CONTACTED', 'NO_ANSWER'].includes(u.status)).length
    }
    setCanvassStats({
      buildings: Object.keys(state.buildings).length,
      totalUnits,
      contacted,
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Check admin access
  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500">{t('common.next') || 'Admin access required'}</p>
          <button onClick={onClose} className="mt-4 text-rstu-red hover:underline">
            {t('common.next') || 'Go Back'}
          </button>
        </div>
      </div>
    )
  }

  const handleExportCanvass = () => {
    const data = exportCanvassData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rstu-canvass-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportProfile = () => {
    const data = exportProfileData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rstu-profile-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportCanvass = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        const result = importCanvassData(content)
        if (result.success) {
          setAlertMessage({ message: 'Canvassing data imported successfully!', variant: 'success' })
          // Refresh stats
          const state = getCanvassState()
          let totalUnits = 0
          let contacted = 0
          for (const building of Object.values(state.buildings)) {
            const units = Object.values(building.units)
            totalUnits += units.length
            contacted += units.filter(u => !['NOT_CONTACTED', 'NO_ANSWER'].includes(u.status)).length
          }
          setCanvassStats({
            buildings: Object.keys(state.buildings).length,
            totalUnits,
            contacted,
          })
        } else {
          setAlertMessage({ message: `Import failed: ${result.error}`, variant: 'error' })
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  // Handle toggling site-wide settings
  const handleToggleTabVisibility = (tab: keyof NonNullable<AdminSettings>['tabVisibility']) => {
    if (!adminSettings) return
    const profile = getCurrentProfile()
    const result = updateAdminSettings({
      tabVisibility: {
        ...adminSettings.tabVisibility,
        [tab]: !adminSettings.tabVisibility[tab],
      },
    }, profile?.id)
    if (result) {
      setAdminSettings(result)
      setAlertMessage({
        message: `${tab.charAt(0).toUpperCase() + tab.slice(1)} tab ${result.tabVisibility[tab] ? 'enabled' : 'disabled'}`,
        variant: 'success',
      })
    }
  }

  const handleToggleFeature = (feature: keyof NonNullable<AdminSettings>['features']) => {
    if (!adminSettings) return
    const profile = getCurrentProfile()
    const result = updateAdminSettings({
      features: {
        ...adminSettings.features,
        [feature]: !adminSettings.features[feature],
      },
    }, profile?.id)
    if (result) {
      setAdminSettings(result)
      setAlertMessage({
        message: `${feature} ${result.features[feature] ? 'enabled' : 'disabled'}`,
        variant: 'success',
      })
    }
  }

  const handleMarkNotificationRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId)
    // Real-time updates via onNotificationsChange handle state
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead()
    // Real-time updates via onNotificationsChange handle state
  }

  const handleDeleteNotification = async (notificationId: string) => {
    await deleteNotification(notificationId)
    // Real-time updates via onNotificationsChange handle state
  }

  const formatNotificationTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-purple-600 text-white p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{t('common.next') || 'Admin Panel'}</h1>
            <p className="text-purple-200 text-sm">{t('common.next') || 'Manage roles and data'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-purple-500 rounded-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Canvassing Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">{t('common.next') || 'Canvassing Data'}</h3>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{canvassStats.buildings}</div>
                <div className="text-xs text-gray-500">{t('common.next') || 'Buildings'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{canvassStats.totalUnits}</div>
                <div className="text-xs text-gray-500">{t('common.next') || 'Units Tracked'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{canvassStats.contacted}</div>
                <div className="text-xs text-gray-500">{t('common.next') || 'Contacted'}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExportCanvass}
                className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100"
              >
                {t('common.next') || 'Export Data'}
              </button>
              <button
                onClick={handleImportCanvass}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
              >
                {t('common.next') || 'Import Data'}
              </button>
            </div>
          </div>

          {/* Notifications (Feedback) */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">Feedback Inbox</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {notifications.length > 0 && unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No feedback yet. Feature suggestions and bug reports will appear here.
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {notifications.map((notification) => {
                  const profile = getCurrentProfile()
                  const isUnread = profile && !notification.readBy.includes(profile.id)
                  const isFeature = notification.type === 'feedback_feature'

                  return (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        isUnread
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {isFeature ? (
                              <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{formatNotificationTime(notification.createdAt)}</span>
                            {notification.metadata?.contactEmail && (
                              <span className="truncate">
                                {notification.metadata.contactEmail}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {isUnread && (
                            <button
                              onClick={() => handleMarkNotificationRead(notification.id)}
                              className="p-1 text-gray-400 hover:text-blue-600"
                              title="Mark as read"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Profile Export */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">{t('common.next') || 'Profile Data'}</h3>
            <p className="text-sm text-gray-500 mb-4">
              {t('common.next') || 'Export your profile for backup or transfer'}
            </p>
            <button
              onClick={handleExportProfile}
              className="w-full py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
            >
              {t('common.next') || 'Export Profile'}
            </button>
          </div>

          {/* Site Settings */}
          {adminSettings && (
            <div className="bg-white rounded-lg border border-purple-200 p-4">
              <h3 className="font-medium text-gray-900 mb-1">Site Settings</h3>
              <p className="text-xs text-gray-500 mb-4">
                These settings affect all users site-wide
              </p>

              {/* Tab Visibility */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Tab Visibility</h4>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">Organize Tab</span>
                    <button
                      onClick={() => handleToggleTabVisibility('organize')}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        adminSettings.tabVisibility.organize ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          adminSettings.tabVisibility.organize ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </label>
                  <label className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">Reading Tab</span>
                    <button
                      onClick={() => handleToggleTabVisibility('reading')}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        adminSettings.tabVisibility.reading ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          adminSettings.tabVisibility.reading ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </label>
                  <label className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">Mutual Aid Tab</span>
                    <button
                      onClick={() => handleToggleTabVisibility('mutualAid')}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        adminSettings.tabVisibility.mutualAid ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          adminSettings.tabVisibility.mutualAid ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </label>
                  <label className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">Tools Tab</span>
                    <button
                      onClick={() => handleToggleTabVisibility('tools')}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        adminSettings.tabVisibility.tools ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          adminSettings.tabVisibility.tools ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Note: Organize requires verification, Tools requires organizer role
                </p>
              </div>

              {/* Feature Flags */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Feature Flags</h4>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="text-sm text-gray-700">App Governance</span>
                      <p className="text-xs text-gray-400">App-wide voting on features</p>
                    </div>
                    <button
                      onClick={() => handleToggleFeature('appGovernance')}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        adminSettings.features.appGovernance ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          adminSettings.features.appGovernance ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </label>
                  <label className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="text-sm text-gray-700">User Feedback</span>
                      <p className="text-xs text-gray-400">Feedback collection system</p>
                    </div>
                    <button
                      onClick={() => handleToggleFeature('userFeedback')}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        adminSettings.features.userFeedback ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          adminSettings.features.userFeedback ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </label>
                  <label className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="text-sm text-gray-700">Delegate Voting</span>
                      <p className="text-xs text-gray-400">Weighted voting by bloc size</p>
                    </div>
                    <button
                      onClick={() => handleToggleFeature('delegateVoting')}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        adminSettings.features.delegateVoting ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          adminSettings.features.delegateVoting ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </label>
                </div>
              </div>

              {/* Last Updated */}
              {adminSettings.lastUpdatedAt && (
                <p className="text-xs text-gray-400 mt-4 pt-3 border-t">
                  Last updated: {new Date(adminSettings.lastUpdatedAt).toLocaleString()}
                  {adminSettings.lastUpdatedBy && ` by ${adminSettings.lastUpdatedBy.slice(0, 8)}...`}
                </p>
              )}
            </div>
          )}

          {/* Elections Management */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <ElectionAdmin profileId={getCurrentProfile()?.id || ''} />
          </div>

          {/* System Info */}
          <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500">
            <h4 className="font-medium text-gray-700 mb-2">{t('common.next') || 'About This System'}</h4>
            <p className="mb-2">
              {t('common.next') || 'Profiles are stored locally in your browser (localStorage). Each device has its own profile.'}
            </p>
            <p>
              {t('common.next') || 'To sync profiles across devices, use the export/import feature or coordinate with other organizers.'}
            </p>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertMessage !== null}
        title={alertMessage?.variant === 'success' ? t('common.next') || 'Success' : t('common.next') || 'Error'}
        message={alertMessage?.message || ''}
        variant={alertMessage?.variant || 'info'}
        onClose={() => setAlertMessage(null)}
      />
    </div>
  )
}
