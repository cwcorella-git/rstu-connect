// Profile sync client for cross-device persistence
// Server: rstu-gun-relay.onrender.com (Socket.io)

import { io, Socket } from 'socket.io-client'
import { getCurrentProfile, updateProfile, type UserProfile } from './profileStorage'

// Sync state
export interface SyncState {
  isOnline: boolean
  isConnected: boolean
  isSyncing: boolean
  lastSync: number | null
  pendingChanges: boolean
  error: string | null
}

let socket: Socket | null = null
let syncState: SyncState = {
  isOnline: false,
  isConnected: false,
  isSyncing: false,
  lastSync: null,
  pendingChanges: false,
  error: null,
}

// Listeners for sync state changes
const stateListeners: Set<(state: SyncState) => void> = new Set()

function notifyListeners() {
  stateListeners.forEach(listener => listener({ ...syncState }))
}

// Subscribe to sync state changes
export function onSyncStateChange(callback: (state: SyncState) => void): () => void {
  stateListeners.add(callback)
  callback({ ...syncState })
  return () => stateListeners.delete(callback)
}

// Get current sync state
export function getSyncState(): SyncState {
  return { ...syncState }
}

// Initialize socket connection
export function initSync(): void {
  if (typeof window === 'undefined') return
  if (socket) return // Already initialized

  const serverUrl = process.env.NEXT_PUBLIC_SOCKETIO_URL || 'https://rstu-gun-relay.onrender.com'

  socket = io(serverUrl, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  socket.on('connect', () => {
    syncState.isConnected = true
    syncState.error = null
    notifyListeners()

    // Auto-sync on connect if we have a profile with server account
    const profile = getCurrentProfile()
    if (profile?.hasServerAccount && profile?.syncToken) {
      syncProfile()
    }
  })

  socket.on('disconnect', () => {
    syncState.isConnected = false
    notifyListeners()
  })

  socket.on('connect_error', (err) => {
    syncState.error = `Connection failed: ${err.message}`
    notifyListeners()
  })

  // Auth responses
  socket.on('auth:token', (data: { token: string; profile: Partial<UserProfile> }) => {
    // Server confirmed auth - update local profile with sync info
    updateProfile({
      hasServerAccount: true,
      syncToken: data.token,
      lastSyncedAt: Date.now(),
    })
    syncState.lastSync = Date.now()
    syncState.isSyncing = false
    notifyListeners()
  })

  socket.on('auth:error', (data: { error: string }) => {
    syncState.error = data.error
    syncState.isSyncing = false
    notifyListeners()
  })

  // Profile sync responses
  socket.on('profile:synced', (data: { profile: Partial<UserProfile>; timestamp: number }) => {
    // Merge server data with local (server wins for role changes)
    const profile = getCurrentProfile()
    if (profile) {
      updateProfile({
        ...data.profile,
        lastSyncedAt: data.timestamp,
      })
    }
    syncState.lastSync = data.timestamp
    syncState.isSyncing = false
    syncState.pendingChanges = false
    notifyListeners()
  })

  // Check online status
  syncState.isOnline = navigator.onLine
  window.addEventListener('online', () => {
    syncState.isOnline = true
    notifyListeners()
    if (!socket?.connected) {
      socket?.connect()
    }
  })
  window.addEventListener('offline', () => {
    syncState.isOnline = false
    notifyListeners()
  })

  // Connect if online
  if (syncState.isOnline) {
    socket.connect()
  }
}

// Register new account with email/password
export async function registerWithEmail(
  email: string,
  password: string,
  inviteCode?: string
): Promise<{ success: boolean; error?: string }> {
  if (!socket?.connected) {
    return { success: false, error: 'Not connected to server' }
  }

  const profile = getCurrentProfile()
  if (!profile) {
    return { success: false, error: 'No local profile exists' }
  }

  return new Promise((resolve) => {
    syncState.isSyncing = true
    notifyListeners()

    socket!.emit('auth:register', {
      email,
      password,
      nickname: profile.nickname,
      profileId: profile.id,
      inviteCode,
    })

    // Wait for response
    const timeout = setTimeout(() => {
      syncState.isSyncing = false
      notifyListeners()
      resolve({ success: false, error: 'Registration timeout' })
    }, 10000)

    socket!.once('auth:token', () => {
      clearTimeout(timeout)
      resolve({ success: true })
    })

    socket!.once('auth:error', (data: { error: string }) => {
      clearTimeout(timeout)
      resolve({ success: false, error: data.error })
    })
  })
}

// Login with email/password
export async function loginWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  if (!socket?.connected) {
    return { success: false, error: 'Not connected to server' }
  }

  return new Promise((resolve) => {
    syncState.isSyncing = true
    notifyListeners()

    socket!.emit('auth:login', { email, password })

    const timeout = setTimeout(() => {
      syncState.isSyncing = false
      notifyListeners()
      resolve({ success: false, error: 'Login timeout' })
    }, 10000)

    socket!.once('auth:token', () => {
      clearTimeout(timeout)
      resolve({ success: true })
    })

    socket!.once('auth:error', (data: { error: string }) => {
      clearTimeout(timeout)
      resolve({ success: false, error: data.error })
    })
  })
}

// Logout (server-side)
export function logout(): void {
  if (socket?.connected) {
    socket.emit('auth:logout')
  }

  // Clear sync-related profile fields
  updateProfile({
    hasServerAccount: false,
    syncToken: undefined,
    lastSyncedAt: undefined,
  })

  syncState.lastSync = null
  notifyListeners()
}

// Sync profile to server
export async function syncProfile(): Promise<{ success: boolean; error?: string }> {
  if (!socket?.connected) {
    return { success: false, error: 'Not connected to server' }
  }

  const profile = getCurrentProfile()
  if (!profile || !profile.syncToken) {
    return { success: false, error: 'No profile or not authenticated' }
  }

  return new Promise((resolve) => {
    syncState.isSyncing = true
    notifyListeners()

    socket!.emit('profile:save', {
      token: profile.syncToken,
      profile: {
        id: profile.id,
        nickname: profile.nickname,
        role: profile.role,
        buildingId: profile.buildingId,
        buildingAddress: profile.buildingAddress,
        unitNumber: profile.unitNumber,
        // Don't sync sensitive data like full contact info
      },
    })

    const timeout = setTimeout(() => {
      syncState.isSyncing = false
      notifyListeners()
      resolve({ success: false, error: 'Sync timeout' })
    }, 10000)

    socket!.once('profile:synced', () => {
      clearTimeout(timeout)
      resolve({ success: true })
    })

    socket!.once('profile:error', (data: { error: string }) => {
      clearTimeout(timeout)
      syncState.isSyncing = false
      notifyListeners()
      resolve({ success: false, error: data.error })
    })
  })
}

// Generate device link code (for linking another device)
export async function generateDeviceLinkCode(): Promise<{ code?: string; error?: string }> {
  if (!socket?.connected) {
    return { error: 'Not connected to server' }
  }

  const profile = getCurrentProfile()
  if (!profile?.syncToken) {
    return { error: 'Not authenticated' }
  }

  return new Promise((resolve) => {
    socket!.emit('device:generate-link', { token: profile.syncToken })

    const timeout = setTimeout(() => {
      resolve({ error: 'Timeout' })
    }, 10000)

    socket!.once('device:link-code', (data: { code: string }) => {
      clearTimeout(timeout)
      resolve({ code: data.code })
    })

    socket!.once('device:error', (data: { error: string }) => {
      clearTimeout(timeout)
      resolve({ error: data.error })
    })
  })
}

// Link this device using a code from another device
export async function linkDevice(code: string): Promise<{ success: boolean; error?: string }> {
  if (!socket?.connected) {
    return { success: false, error: 'Not connected to server' }
  }

  return new Promise((resolve) => {
    syncState.isSyncing = true
    notifyListeners()

    socket!.emit('device:link', { code })

    const timeout = setTimeout(() => {
      syncState.isSyncing = false
      notifyListeners()
      resolve({ success: false, error: 'Link timeout' })
    }, 10000)

    socket!.once('auth:token', () => {
      clearTimeout(timeout)
      resolve({ success: true })
    })

    socket!.once('device:error', (data: { error: string }) => {
      clearTimeout(timeout)
      syncState.isSyncing = false
      notifyListeners()
      resolve({ success: false, error: data.error })
    })
  })
}

// Mark that local changes are pending sync
export function markPendingChanges(): void {
  syncState.pendingChanges = true
  notifyListeners()

  // Auto-sync if connected
  const profile = getCurrentProfile()
  if (socket?.connected && profile?.hasServerAccount) {
    syncProfile()
  }
}

// Disconnect and cleanup
export function disconnectSync(): void {
  socket?.disconnect()
  socket = null
  syncState = {
    isOnline: false,
    isConnected: false,
    isSyncing: false,
    lastSync: null,
    pendingChanges: false,
    error: null,
  }
}
