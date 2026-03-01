import { createLogger } from '../utils/logger'

const log = createLogger('ProfileSync')

// Profile sync client for cross-device persistence
// Server: rstu-gun-relay.onrender.com (Socket.io)

import { io, Socket } from 'socket.io-client'
import {
  getCurrentProfile,
  updateProfile,
  applyRoleChange,
  getDeviceId,
  hasRole,
  isAdmin,
  type UserProfile,
  type UserRole,
  type RoleChangeAudit,
} from './profileStorage'

// Synced profile with online status
export interface SyncedProfile extends UserProfile {
  isOnline?: boolean
}

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

    // Auto-sync on connect if we have a profile
    const profile = getCurrentProfile()
    if (profile) {
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
    // Server confirmed auth - update local profile sync metadata
    const profile = getCurrentProfile()
    if (profile) {
      updateProfile({
        syncMeta: {
          ...(profile.syncMeta || { syncVersion: 1, deviceId: getDeviceId(), pendingSync: false }),
          lastSyncedAt: Date.now(),
        },
      })
    }
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
        syncMeta: {
          ...(profile.syncMeta || { syncVersion: 1, deviceId: getDeviceId(), pendingSync: false }),
          lastSyncedAt: data.timestamp,
          pendingSync: false,
        },
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

  // Clear sync metadata
  const profile = getCurrentProfile()
  if (profile) {
    updateProfile({
      syncMeta: undefined,
    })
  }

  syncState.lastSync = null
  notifyListeners()
}

// Sync profile to server
export async function syncProfile(): Promise<{ success: boolean; error?: string }> {
  if (!socket?.connected) {
    return { success: false, error: 'Not connected to server' }
  }

  const profile = getCurrentProfile()
  if (!profile) {
    return { success: false, error: 'No profile' }
  }

  return new Promise((resolve) => {
    syncState.isSyncing = true
    notifyListeners()

    socket!.emit('profile:sync', {
      profile: {
        id: profile.id,
        nickname: profile.nickname,
        role: profile.role,
        trustLevel: profile.trustLevel,
        buildingId: profile.buildingId,
        buildingAddress: profile.buildingAddress,
        unitNumber: profile.unitNumber,
        lastActive: profile.lastActive,
        created: profile.created,
        syncMeta: profile.syncMeta,
      },
      deviceId: getDeviceId(),
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
  if (!profile) {
    return { error: 'No profile' }
  }

  return new Promise((resolve) => {
    socket!.emit('device:generate-link', { profileId: profile.id, deviceId: getDeviceId() })

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
  if (socket?.connected && profile) {
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

// ============================================
// User List & Role Management (NEW)
// ============================================

// Profile list response
export interface ProfileListResponse {
  profiles: SyncedProfile[]
  totalCount: number
}

// Role change request
export interface RoleChangeRequest {
  targetId: string
  newRole: UserRole
  reason?: string
}

// Role change response
export interface RoleChangeResponse {
  success: boolean
  error?: string
  targetId?: string
  oldRole?: UserRole
  newRole?: UserRole
}

// Listeners for user list events
const profileListListeners: Set<(profiles: SyncedProfile[]) => void> = new Set()
const roleChangedListeners: Set<(data: { targetId: string; oldRole: UserRole; newRole: UserRole }) => void> = new Set()

// Subscribe to profile list updates
export function onProfileListUpdate(callback: (profiles: SyncedProfile[]) => void): () => void {
  profileListListeners.add(callback)
  return () => profileListListeners.delete(callback)
}

// Subscribe to role change notifications
export function onRoleChanged(callback: (data: { targetId: string; oldRole: UserRole; newRole: UserRole }) => void): () => void {
  roleChangedListeners.add(callback)
  return () => roleChangedListeners.delete(callback)
}

// Initialize user list event handlers (call after socket is connected)
export function initUserListEvents(): void {
  if (!socket) return

  // Receive profile list (organizers+)
  socket.on('profile:list', (data: ProfileListResponse) => {
    profileListListeners.forEach(cb => cb(data.profiles))
  })

  // Real-time profile update
  socket.on('profile:updated', (profile: SyncedProfile) => {
    // If it's our profile, apply changes
    const current = getCurrentProfile()
    if (current && current.id === profile.id && profile.role !== current.role) {
      applyRoleChange(profile.role)
    }
    // Notify all list listeners to refresh
    // (they'll need to handle deduplication)
  })

  // Role change notification
  socket.on('profile:role_changed', (data: { targetId: string; oldRole: UserRole; newRole: UserRole }) => {
    // If it's our profile, apply the change
    const current = getCurrentProfile()
    if (current && current.id === data.targetId) {
      applyRoleChange(data.newRole)
    }
    roleChangedListeners.forEach(cb => cb(data))
  })

  // Presence updates
  socket.on('profile:presence', (data: { profileId: string; isOnline: boolean }) => {
    // Listeners can handle this by updating their local list
    profileListListeners.forEach(cb => {
      // Signal to refresh - callback with empty array triggers refresh
    })
  })
}

/**
 * Subscribe to profile list (organizers+ only)
 * Returns unsubscribe function
 */
export function subscribeToProfiles(): () => void {
  if (!socket?.connected) return () => {}

  if (!hasRole('organizer')) {
    log.warn('Insufficient permissions to subscribe to profiles')
    return () => {}
  }

  const profile = getCurrentProfile()
  socket.emit('profile:subscribe', {
    profileId: profile?.id,
    role: profile?.role,
    deviceId: getDeviceId(),
  })

  return () => {
    socket?.emit('profile:unsubscribe')
  }
}

/**
 * Request role change for a user (admin only)
 */
export function requestRoleChange(request: RoleChangeRequest): Promise<RoleChangeResponse> {
  return new Promise((resolve) => {
    if (!socket?.connected) {
      resolve({ success: false, error: 'No socket connection' })
      return
    }

    if (!isAdmin()) {
      resolve({ success: false, error: 'Insufficient permissions' })
      return
    }

    const profile = getCurrentProfile()

    // Set up one-time response handler
    const responseHandler = (response: RoleChangeResponse) => {
      socket!.off('profile:role_change_response', responseHandler)
      resolve(response)
    }
    socket.on('profile:role_change_response', responseHandler)

    // Send request
    socket.emit('profile:update_role', {
      adminId: profile?.id,
      adminNickname: profile?.nickname,
      targetId: request.targetId,
      newRole: request.newRole,
      reason: request.reason,
    })

    // Timeout after 10s
    setTimeout(() => {
      socket!.off('profile:role_change_response', responseHandler)
      resolve({ success: false, error: 'Request timed out' })
    }, 10000)
  })
}

/**
 * Get audit log (admin only)
 */
export function getAuditLog(): Promise<RoleChangeAudit[]> {
  return new Promise((resolve) => {
    if (!socket?.connected) {
      resolve([])
      return
    }

    if (!isAdmin()) {
      resolve([])
      return
    }

    const responseHandler = (data: { audits: RoleChangeAudit[] }) => {
      socket!.off('profile:audit_log', responseHandler)
      resolve(data.audits)
    }
    socket.on('profile:audit_log', responseHandler)

    socket.emit('profile:get_audit_log')

    setTimeout(() => {
      socket!.off('profile:audit_log', responseHandler)
      resolve([])
    }, 10000)
  })
}

/**
 * Check if current user can view profiles list
 */
export function canViewProfileList(): boolean {
  return hasRole('organizer')
}

/**
 * Check if current user can change a profile's role
 */
export function canChangeRole(): boolean {
  return isAdmin()
}
