'use client'
import { createLogger } from './logger'

const log = createLogger('Notification')

import { supabase, USE_SUPABASE } from './supabase'
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

interface NotificationState {
  notifications: SystemNotification[]
  lastModified: number
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'rstu_system_notifications'
const MAX_NOTIFICATIONS = 100

// ============================================================================
// Storage Functions
// ============================================================================

function getState(): NotificationState {
  if (typeof window === 'undefined') {
    return { notifications: [], lastModified: 0 }
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    log.error('Failed to parse notification state:', e)
  }
  return { notifications: [], lastModified: 0 }
}

function saveState(state: NotificationState): void {
  if (typeof window === 'undefined') return
  state.lastModified = Date.now()

  // Keep only most recent notifications
  if (state.notifications.length > MAX_NOTIFICATIONS) {
    state.notifications = state.notifications.slice(-MAX_NOTIFICATIONS)
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    log.error('Failed to save notification state:', e)
  }
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Create a system notification (for feedback submissions)
 */
export function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  metadata?: Record<string, any>
): SystemNotification {
  const notification: SystemNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    metadata,
    createdAt: Date.now(),
    readBy: [],
  }

  const state = getState()
  state.notifications.push(notification)
  saveState(state)

  log.info('Created notification:', type, title)
  return notification
}

/**
 * Get all notifications for the current admin user
 */
export function getAdminNotifications(): SystemNotification[] {
  const profile = getCurrentProfile()
  if (!profile || profile.role !== 'admin') {
    return []
  }

  const state = getState()
  return state.notifications.sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * Get unread notification count for current admin
 */
export function getUnreadNotificationCount(): number {
  const profile = getCurrentProfile()
  if (!profile || profile.role !== 'admin') {
    return 0
  }

  const state = getState()
  return state.notifications.filter(n => !n.readBy.includes(profile.id)).length
}

/**
 * Mark notification as read
 */
export function markNotificationAsRead(notificationId: string): void {
  const profile = getCurrentProfile()
  if (!profile) return

  const state = getState()
  const notification = state.notifications.find(n => n.id === notificationId)

  if (notification && !notification.readBy.includes(profile.id)) {
    notification.readBy.push(profile.id)
    saveState(state)
  }
}

/**
 * Mark all notifications as read for current user
 */
export function markAllNotificationsAsRead(): void {
  const profile = getCurrentProfile()
  if (!profile) return

  const state = getState()
  let changed = false

  state.notifications.forEach(n => {
    if (!n.readBy.includes(profile.id)) {
      n.readBy.push(profile.id)
      changed = true
    }
  })

  if (changed) {
    saveState(state)
  }
}

/**
 * Delete a notification (admin only)
 */
export function deleteNotification(notificationId: string): boolean {
  const profile = getCurrentProfile()
  if (!profile || profile.role !== 'admin') {
    return false
  }

  const state = getState()
  const initialLength = state.notifications.length
  state.notifications = state.notifications.filter(n => n.id !== notificationId)

  if (state.notifications.length !== initialLength) {
    saveState(state)
    return true
  }
  return false
}
