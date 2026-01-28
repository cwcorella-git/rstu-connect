'use client'
import { createLogger } from './logger'

const log = createLogger('Notification')

import { getSocket, ensureConnected } from './socketio'
import { getCurrentProfile } from './profileStorage'

// ============================================================================
// Types
// ============================================================================

export type NotificationType = 'feedback_feature' | 'feedback_bug' | 'system'

export interface SystemNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  metadata?: Record<string, any>  // Additional data (e.g., contact email, page)
  createdAt: number
  readBy: string[]  // Profile IDs that have read this
}

// ============================================================================
// State
// ============================================================================

let notificationListeners: Set<(notifications: SystemNotification[]) => void> = new Set()
let cachedNotifications: SystemNotification[] = []
let isSubscribed = false

// ============================================================================
// Socket Event Setup
// ============================================================================

function setupSocketListeners() {
  const socket = getSocket()
  if (!socket) return

  // Handle incoming notification list
  socket.off('notification:list')
  socket.on('notification:list', ({ notifications }: { notifications: SystemNotification[] }) => {
    cachedNotifications = notifications
    notifyListeners()
  })

  // Handle new notification
  socket.off('notification:new')
  socket.on('notification:new', ({ notification }: { notification: SystemNotification }) => {
    // Add to front of list (most recent first)
    cachedNotifications = [notification, ...cachedNotifications.filter(n => n.id !== notification.id)]
    notifyListeners()
  })

  // Handle notification removed
  socket.off('notification:removed')
  socket.on('notification:removed', ({ notificationId }: { notificationId: string }) => {
    cachedNotifications = cachedNotifications.filter(n => n.id !== notificationId)
    notifyListeners()
  })
}

function notifyListeners() {
  notificationListeners.forEach(listener => listener([...cachedNotifications]))
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Subscribe to admin notifications (call this when admin panel opens)
 */
export async function subscribeToNotifications(): Promise<void> {
  const profile = getCurrentProfile()
  if (!profile || profile.role !== 'admin') {
    return
  }

  await ensureConnected()
  const socket = getSocket()
  if (!socket) return

  setupSocketListeners()

  socket.emit('notification:subscribe', { profileId: profile.id })
  isSubscribed = true
  log.info('Subscribed to admin notifications')
}

/**
 * Add a listener for notification updates
 */
export function onNotificationsChange(callback: (notifications: SystemNotification[]) => void): () => void {
  notificationListeners.add(callback)
  // Immediately call with current data
  callback([...cachedNotifications])
  return () => notificationListeners.delete(callback)
}

/**
 * Create a system notification (for feedback submissions)
 * This sends to the server which broadcasts to all admins
 */
export async function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  metadata?: Record<string, any>
): Promise<SystemNotification | null> {
  const notification: SystemNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    metadata,
    createdAt: Date.now(),
    readBy: [],
  }

  await ensureConnected()
  const socket = getSocket()

  if (socket) {
    return new Promise((resolve) => {
      socket.emit('notification:create', { notification })

      // Listen for confirmation
      socket.once('notification:created', ({ notification: created, success }: { notification: SystemNotification, success: boolean }) => {
        if (success) {
          log.info('Notification created:', type, title)
          resolve(created)
        } else {
          log.error('Failed to create notification')
          resolve(null)
        }
      })

      // Timeout after 5 seconds
      setTimeout(() => resolve(notification), 5000)
    })
  }

  log.warn('Socket not connected, notification not sent')
  return null
}

/**
 * Get all notifications for the current admin user
 */
export function getAdminNotifications(): SystemNotification[] {
  const profile = getCurrentProfile()
  if (!profile || profile.role !== 'admin') {
    return []
  }
  return [...cachedNotifications]
}

/**
 * Get unread notification count for current admin
 */
export function getUnreadNotificationCount(): number {
  const profile = getCurrentProfile()
  if (!profile || profile.role !== 'admin') {
    return 0
  }
  return cachedNotifications.filter(n => !n.readBy.includes(profile.id)).length
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const profile = getCurrentProfile()
  if (!profile) return

  // Update local cache immediately for responsiveness
  const notification = cachedNotifications.find(n => n.id === notificationId)
  if (notification && !notification.readBy.includes(profile.id)) {
    notification.readBy.push(profile.id)
    notifyListeners()
  }

  // Sync to server
  const socket = getSocket()
  if (socket) {
    socket.emit('notification:mark_read', { notificationId, profileId: profile.id })
  }
}

/**
 * Mark all notifications as read for current user
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  const profile = getCurrentProfile()
  if (!profile) return

  // Update local cache immediately
  let changed = false
  cachedNotifications.forEach(n => {
    if (!n.readBy.includes(profile.id)) {
      n.readBy.push(profile.id)
      changed = true
    }
  })

  if (changed) {
    notifyListeners()
  }

  // Sync to server
  const socket = getSocket()
  if (socket) {
    socket.emit('notification:mark_all_read', { profileId: profile.id })
  }
}

/**
 * Delete a notification (admin only)
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  const profile = getCurrentProfile()
  if (!profile || profile.role !== 'admin') {
    return false
  }

  // Update local cache immediately
  cachedNotifications = cachedNotifications.filter(n => n.id !== notificationId)
  notifyListeners()

  // Sync to server
  const socket = getSocket()
  if (socket) {
    socket.emit('notification:delete', { notificationId, profileId: profile.id })
    return true
  }

  return false
}

/**
 * Refresh notifications from server
 */
export async function refreshNotifications(): Promise<void> {
  const profile = getCurrentProfile()
  if (!profile || profile.role !== 'admin') return

  const socket = getSocket()
  if (socket) {
    socket.emit('notification:get_all', { profileId: profile.id })
  }
}
