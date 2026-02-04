/**
 * useOfflineMode Hook
 *
 * React hook for managing offline state and read-only mode.
 * When offline, the app operates in read-only mode using cached data.
 */

import { useState, useEffect, useCallback } from 'react'
import { isOnline, subscribeToOnlineState, OfflineError } from '../lib/services/authService'
import { USE_SUPABASE } from '../lib/services/supabase'

export interface OfflineModeState {
  /** Whether the browser is connected to the internet */
  isOnline: boolean
  /** Whether the app is in read-only mode (offline or no server) */
  isReadOnly: boolean
  /** Whether Supabase is configured */
  hasServer: boolean
  /** Human-readable status message */
  statusMessage: string
  /** Check if an action is allowed (returns error message if not) */
  checkAction: (action: string) => string | null
  /** Wrap an async action with offline check */
  withOnlineCheck: <T>(action: string, fn: () => Promise<T>) => Promise<T>
}

/**
 * Hook for managing offline mode state
 */
export function useOfflineMode(): OfflineModeState {
  const [online, setOnline] = useState(() => isOnline())

  useEffect(() => {
    // Subscribe to online state changes
    const unsubscribe = subscribeToOnlineState((newState) => {
      setOnline(newState)
    })

    return unsubscribe
  }, [])

  const hasServer = USE_SUPABASE
  const isReadOnly = !online || !hasServer

  const statusMessage = !online
    ? "You're offline. Viewing cached data."
    : !hasServer
    ? 'Server not configured. Running in local mode.'
    : 'Connected'

  /**
   * Check if an action is allowed
   * Returns error message if not allowed, null if allowed
   */
  const checkAction = useCallback((action: string): string | null => {
    if (!online) {
      return `Cannot ${action} while offline. Please reconnect to continue.`
    }
    if (!hasServer) {
      return `Cannot ${action} without server connection.`
    }
    return null
  }, [online, hasServer])

  /**
   * Wrap an async function with offline check
   * Throws OfflineError if offline
   */
  const withOnlineCheck = useCallback(async <T>(action: string, fn: () => Promise<T>): Promise<T> => {
    const error = checkAction(action)
    if (error) {
      throw new OfflineError(error)
    }
    return fn()
  }, [checkAction])

  return {
    isOnline: online,
    isReadOnly,
    hasServer,
    statusMessage,
    checkAction,
    withOnlineCheck,
  }
}

/**
 * Hook for tracking when the app comes back online
 * Useful for triggering data refresh after reconnection
 */
export function useOnlineReconnect(callback: () => void): void {
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToOnlineState((online) => {
      if (online && wasOffline) {
        // Just came back online
        callback()
      }
      setWasOffline(!online)
    })

    return unsubscribe
  }, [callback, wasOffline])
}

/**
 * Hook for showing toast/notification when going offline/online
 */
export function useOfflineNotifications(
  onOffline?: () => void,
  onOnline?: () => void
): void {
  const [prevOnline, setPrevOnline] = useState(() => isOnline())

  useEffect(() => {
    const unsubscribe = subscribeToOnlineState((online) => {
      if (!online && prevOnline) {
        // Just went offline
        onOffline?.()
      } else if (online && !prevOnline) {
        // Just came back online
        onOnline?.()
      }
      setPrevOnline(online)
    })

    return unsubscribe
  }, [onOffline, onOnline, prevOnline])
}

/**
 * Hook that returns a disabled state for write actions
 * Use this to disable buttons/inputs when offline
 */
export function useWriteDisabled(): {
  disabled: boolean
  title: string
} {
  const { isReadOnly, statusMessage } = useOfflineMode()

  return {
    disabled: isReadOnly,
    title: isReadOnly ? statusMessage : '',
  }
}

/**
 * Component props helper for disabling write actions
 */
export function getWriteDisabledProps(isReadOnly: boolean, statusMessage: string) {
  return isReadOnly
    ? {
        disabled: true,
        title: statusMessage,
        'aria-disabled': true,
        style: { cursor: 'not-allowed', opacity: 0.6 },
      }
    : {}
}

export default useOfflineMode
