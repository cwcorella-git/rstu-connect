'use client'

/**
 * OfflineBanner Component
 *
 * Displays a banner when the user is offline, indicating they are
 * viewing cached data and cannot make changes.
 */

import { useOfflineMode } from '../../hooks/useOfflineMode'

interface OfflineBannerProps {
  /** Additional CSS classes */
  className?: string
  /** Whether to show even when online (for testing) */
  forceShow?: boolean
}

export function OfflineBanner({ className = '', forceShow = false }: OfflineBannerProps) {
  const { isOnline, isReadOnly, hasServer } = useOfflineMode()

  // Don't show if online with server (unless forced)
  if (!forceShow && isOnline && hasServer) {
    return null
  }

  // Determine message based on state
  let message: string
  let bgColor: string
  let icon: string

  if (!isOnline) {
    message = "You're offline. Viewing cached data - changes require internet."
    bgColor = 'bg-yellow-500'
    icon = '📶'
  } else if (!hasServer) {
    message = 'Running in local mode. Some features may be limited.'
    bgColor = 'bg-blue-500'
    icon = '💻'
  } else {
    // Shouldn't reach here unless forceShow
    message = 'Connected to server.'
    bgColor = 'bg-green-500'
    icon = '✓'
  }

  return (
    <div
      className={`${bgColor} text-white px-4 py-2 text-center text-sm font-medium ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="mr-2">{icon}</span>
      {message}
    </div>
  )
}

/**
 * Compact offline indicator for header/footer
 */
export function OfflineIndicator({ className = '' }: { className?: string }) {
  const { isOnline, hasServer } = useOfflineMode()

  if (isOnline && hasServer) {
    return null
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        !isOnline ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
      } ${className}`}
      title={!isOnline ? 'Offline - viewing cached data' : 'Local mode'}
    >
      {!isOnline ? (
        <>
          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1 animate-pulse" />
          Offline
        </>
      ) : (
        <>
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
          Local
        </>
      )}
    </span>
  )
}

/**
 * Read-only mode warning for forms and input areas
 */
export function ReadOnlyWarning({ action = 'make changes' }: { action?: string }) {
  const { isReadOnly, statusMessage } = useOfflineMode()

  if (!isReadOnly) {
    return null
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm">
      <div className="flex items-start">
        <span className="text-yellow-400 mr-2">⚠️</span>
        <div>
          <p className="text-yellow-700 font-medium">Read-only mode</p>
          <p className="text-yellow-600">
            Cannot {action} right now. {statusMessage}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Wrapper component that disables children when offline
 */
export function OfflineDisabled({
  children,
  action = 'perform this action',
  showWarning = true,
}: {
  children: React.ReactNode
  action?: string
  showWarning?: boolean
}) {
  const { isReadOnly, statusMessage } = useOfflineMode()

  if (!isReadOnly) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none select-none">
        {children}
      </div>
      {showWarning && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/10 rounded"
          title={`Cannot ${action}. ${statusMessage}`}
        >
          <div className="bg-white px-3 py-1.5 rounded shadow text-sm text-gray-600">
            <span className="mr-1">🔒</span>
            {!isReadOnly ? 'Reconnect to ' : 'Connect to '}{action}
          </div>
        </div>
      )}
    </div>
  )
}

export default OfflineBanner
