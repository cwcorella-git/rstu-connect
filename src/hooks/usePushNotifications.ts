'use client'
import { createLogger } from '@/lib/utils/logger'
const log = createLogger('PushNotifications')

import { useState, useEffect, useCallback } from 'react'
import { getSocket } from '@/lib/services/socketio'

export interface NotificationSettings {
  dm: boolean
  mention: boolean
  event: boolean
  alert: boolean
}

export interface PushState {
  isSupported: boolean
  isSubscribed: boolean
  permission: NotificationPermission | 'unsupported'
  isLoading: boolean
  error: string | null
  settings: NotificationSettings
}

const DEFAULT_SETTINGS: NotificationSettings = {
  dm: true,
  mention: true,
  event: true,
  alert: true,
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKETIO_URL || 'http://localhost:8765'

/**
 * Hook for managing push notification subscriptions
 */
export function usePushNotifications(profileId: string | null) {
  const [state, setState] = useState<PushState>({
    isSupported: false,
    isSubscribed: false,
    permission: 'unsupported',
    isLoading: true,
    error: null,
    settings: DEFAULT_SETTINGS,
  })

  // Check browser support and current subscription status
  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkSupport = async () => {
      // Check if push notifications are supported
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window

      if (!isSupported) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          permission: 'unsupported',
          isLoading: false,
        }))
        return
      }

      const permission = Notification.permission

      // Check if we have an active subscription
      let isSubscribed = false
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        isSubscribed = subscription !== null
      } catch (err) {
        log.error('Error checking subscription:', err)
      }

      setState(prev => ({
        ...prev,
        isSupported: true,
        permission,
        isSubscribed,
        isLoading: false,
      }))
    }

    checkSupport()
  }, [])

  // Fetch current settings from server
  useEffect(() => {
    if (!profileId) return

    const socket = getSocket()
    if (!socket) return

    const handleSettings = ({ settings, subscriptionCount }: { settings: NotificationSettings, subscriptionCount: number }) => {
      setState(prev => ({
        ...prev,
        settings: { ...DEFAULT_SETTINGS, ...settings },
        isSubscribed: subscriptionCount > 0,
      }))
    }

    socket.on('push:settings', handleSettings)
    socket.emit('push:get_settings', { profileId })

    return () => {
      socket.off('push:settings', handleSettings)
    }
  }, [profileId])

  // Request permission and subscribe
  const subscribe = useCallback(async () => {
    if (!state.isSupported || !profileId) return false

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Request notification permission
      const permission = await Notification.requestPermission()
      setState(prev => ({ ...prev, permission }))

      if (permission !== 'granted') {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Notification permission denied',
        }))
        return false
      }

      // Get VAPID public key from server
      const vapidResponse = await fetch(`${SOCKET_URL}/vapid-public-key`)
      const { publicKey } = await vapidResponse.json()

      // Convert VAPID key to Uint8Array
      const vapidPublicKey = urlBase64ToUint8Array(publicKey)

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      })

      // Send subscription to server
      const socket = getSocket()
      if (socket) {
        socket.emit('push:subscribe', {
          profileId,
          subscription: subscription.toJSON(),
          settings: state.settings,
        })
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        isLoading: false,
      }))

      return true
    } catch (err) {
      log.error('Error subscribing:', err)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to subscribe',
      }))
      return false
    }
  }, [state.isSupported, state.settings, profileId])

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe from push manager
        await subscription.unsubscribe()

        // Tell server to remove subscription
        const socket = getSocket()
        if (socket) {
          socket.emit('push:unsubscribe', { endpoint: subscription.endpoint })
        }
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
      }))

      return true
    } catch (err) {
      log.error('Error unsubscribing:', err)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to unsubscribe',
      }))
      return false
    }
  }, [])

  // Update notification settings
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    if (!profileId) return

    const updatedSettings = { ...state.settings, ...newSettings }

    setState(prev => ({
      ...prev,
      settings: updatedSettings,
    }))

    const socket = getSocket()
    if (socket) {
      socket.emit('push:update_settings', {
        profileId,
        settings: updatedSettings,
      })
    }
  }, [profileId, state.settings])

  return {
    ...state,
    subscribe,
    unsubscribe,
    updateSettings,
  }
}

/**
 * Convert a base64 URL string to Uint8Array for VAPID key
 */
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray.buffer
}
