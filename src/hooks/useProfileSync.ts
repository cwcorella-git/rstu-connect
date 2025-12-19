'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSocket } from '@/lib/socketio'
import {
  getCurrentProfile,
  needsSync,
  markProfilePendingSync,
  getDeviceId,
  type UserProfile,
} from '@/lib/profileStorage'
import {
  initSync,
  getSyncState,
  onSyncStateChange,
  syncProfile,
  initUserListEvents,
  onRoleChanged,
  type SyncState,
} from '@/lib/profileSync'

interface UseProfileSyncReturn {
  profile: UserProfile | null
  syncState: SyncState
  isConnected: boolean
  syncNow: () => Promise<void>
  roleChanged: boolean // True if role was changed externally
}

/**
 * Hook for automatic profile synchronization
 * Auto-syncs profile on changes and reconnection
 */
export function useProfileSync(): UseProfileSyncReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [syncState, setSyncState] = useState<SyncState>(getSyncState())
  const [isConnected, setIsConnected] = useState(false)
  const [roleChanged, setRoleChanged] = useState(false)

  // Initialize on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Get initial profile
    setProfile(getCurrentProfile())

    // Initialize sync system
    initSync()
    initUserListEvents()

    // Subscribe to sync state changes
    const unsubscribeSyncState = onSyncStateChange((state) => {
      setSyncState(state)
      setIsConnected(state.isConnected)
    })

    // Subscribe to role changes
    const unsubscribeRoleChange = onRoleChanged((data) => {
      const current = getCurrentProfile()
      if (current && current.id === data.targetId) {
        setProfile(getCurrentProfile())
        setRoleChanged(true)
        // Reset flag after 5 seconds
        setTimeout(() => setRoleChanged(false), 5000)
      }
    })

    // Socket connection listener
    const socket = getSocket()
    if (socket) {
      const handleConnect = () => {
        setIsConnected(true)
        // Auto-sync on connect if needed
        if (needsSync()) {
          syncProfile()
        }
      }

      const handleDisconnect = () => {
        setIsConnected(false)
      }

      socket.on('connect', handleConnect)
      socket.on('disconnect', handleDisconnect)
      setIsConnected(socket.connected)

      // Sync on connect if already connected
      if (socket.connected && needsSync()) {
        syncProfile()
      }

      return () => {
        socket.off('connect', handleConnect)
        socket.off('disconnect', handleDisconnect)
        unsubscribeSyncState()
        unsubscribeRoleChange()
      }
    }

    return () => {
      unsubscribeSyncState()
      unsubscribeRoleChange()
    }
  }, [])

  // Listen for localStorage changes (profile updates)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'rstu_profile_data') {
        setProfile(getCurrentProfile())
        markProfilePendingSync()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Manual sync trigger
  const syncNow = useCallback(async () => {
    await syncProfile()
    setProfile(getCurrentProfile())
  }, [])

  return {
    profile,
    syncState,
    isConnected,
    syncNow,
    roleChanged,
  }
}
