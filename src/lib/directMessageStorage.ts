'use client'
import { createLogger } from './logger'

const log = createLogger('DirectMessage')

import { getCurrentProfile } from './profileStorage'
import { sanitizeText } from './sanitize'
import { tryAction } from './rateLimit'
import { generateShortId } from './idUtils'

// ============================================================================
// Types
// ============================================================================

export type ThreadType = 'dm' | 'group' | 'bloc'

export interface DirectMessageThread {
  id: string
  type: ThreadType
  participants: string[]          // Profile IDs
  participantNames: string[]      // Display names for quick lookup
  createdBy: string               // Profile ID who started the thread
  createdAt: number
  blocId?: string                 // For bloc-wide threads
  name?: string                   // Custom name for groups
  lastMessage?: {
    text: string
    senderId: string
    senderName: string
    timestamp: number
  }
  unreadCount: number
}

export interface DirectMessage {
  id: string
  threadId: string
  senderId: string
  senderName: string
  text: string
  timestamp: number
  readBy: string[]                // Profile IDs who have read this message
}

export interface DirectMessageState {
  threads: DirectMessageThread[]
  messages: Record<string, DirectMessage[]>  // threadId -> messages
  lastModified: number
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'rstu-direct-messages'
const MAX_MESSAGES_PER_THREAD = 100

// ============================================================================
// Storage Functions
// ============================================================================

function getState(): DirectMessageState {
  if (typeof window === 'undefined') {
    return { threads: [], messages: {}, lastModified: 0 }
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    log.error('Failed to parse DM state:', e)
  }
  return { threads: [], messages: {}, lastModified: 0 }
}

function saveState(state: DirectMessageState): void {
  if (typeof window === 'undefined') return
  state.lastModified = Date.now()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    log.error('Failed to save - storage quota may be exceeded:', e)
    // Try to clean up old messages
    cleanupOldMessages()
  }
}

// ============================================================================
// Thread Management
// ============================================================================

/**
 * Get or create a 1:1 DM thread between current user and target
 */
export function getOrCreateDMThread(
  targetProfileId: string,
  targetProfileName: string
): DirectMessageThread | null {
  const profile = getCurrentProfile()
  if (!profile) return null

  const state = getState()

  // Check for existing thread
  const existing = state.threads.find(t =>
    t.type === 'dm' &&
    t.participants.length === 2 &&
    t.participants.includes(profile.id) &&
    t.participants.includes(targetProfileId)
  )

  if (existing) return existing

  // Create new thread
  const sortedIds = [profile.id, targetProfileId].sort()
  const thread: DirectMessageThread = {
    id: `dm-${sortedIds.join('-')}`,
    type: 'dm',
    participants: sortedIds,
    participantNames: sortedIds[0] === profile.id
      ? [profile.nickname, targetProfileName]
      : [targetProfileName, profile.nickname],
    createdBy: profile.id,
    createdAt: Date.now(),
    unreadCount: 0,
  }

  state.threads.push(thread)
  state.messages[thread.id] = []
  saveState(state)

  return thread
}

/**
 * Create a group chat thread
 */
export function createGroupThread(
  participantIds: string[],
  participantNames: string[],
  groupName?: string
): DirectMessageThread | null {
  const profile = getCurrentProfile()
  if (!profile) return null

  // Ensure creator is in the group
  if (!participantIds.includes(profile.id)) {
    participantIds = [profile.id, ...participantIds]
    participantNames = [profile.nickname, ...participantNames]
  }

  const state = getState()

  const thread: DirectMessageThread = {
    id: `group-${Date.now()}-${generateShortId()}`,
    type: 'group',
    participants: participantIds,
    participantNames,
    createdBy: profile.id,
    createdAt: Date.now(),
    name: groupName || `Group (${participantIds.length})`,
    unreadCount: 0,
  }

  state.threads.push(thread)
  state.messages[thread.id] = []
  saveState(state)

  return thread
}

/**
 * Create a bloc-wide private channel
 */
export function createBlocThread(
  blocId: string,
  blocName: string,
  memberIds: string[],
  memberNames: string[]
): DirectMessageThread | null {
  const profile = getCurrentProfile()
  if (!profile) return null

  const state = getState()

  // Check for existing bloc thread
  const existing = state.threads.find(t =>
    t.type === 'bloc' && t.blocId === blocId
  )

  if (existing) return existing

  const thread: DirectMessageThread = {
    id: `bloc-${blocId}-private`,
    type: 'bloc',
    participants: memberIds,
    participantNames: memberNames,
    createdBy: profile.id,
    createdAt: Date.now(),
    blocId,
    name: `${blocName} (Private)`,
    unreadCount: 0,
  }

  state.threads.push(thread)
  state.messages[thread.id] = []
  saveState(state)

  return thread
}

/**
 * Get all threads for current user
 */
export function getUserThreads(): DirectMessageThread[] {
  const profile = getCurrentProfile()
  if (!profile) return []

  const state = getState()
  return state.threads
    .filter(t => t.participants.includes(profile.id))
    .sort((a, b) => {
      const aTime = a.lastMessage?.timestamp || a.createdAt
      const bTime = b.lastMessage?.timestamp || b.createdAt
      return bTime - aTime // Most recent first
    })
}

/**
 * Get a specific thread by ID
 */
export function getThread(threadId: string): DirectMessageThread | undefined {
  const state = getState()
  return state.threads.find(t => t.id === threadId)
}

/**
 * Update thread name (for groups)
 */
export function updateThreadName(threadId: string, name: string): void {
  const state = getState()
  const thread = state.threads.find(t => t.id === threadId)
  if (thread && thread.type === 'group') {
    thread.name = name
    saveState(state)
  }
}

/**
 * Add participant to group thread
 */
export function addParticipant(
  threadId: string,
  profileId: string,
  profileName: string
): void {
  const state = getState()
  const thread = state.threads.find(t => t.id === threadId)
  if (thread && thread.type === 'group' && !thread.participants.includes(profileId)) {
    thread.participants.push(profileId)
    thread.participantNames.push(profileName)
    saveState(state)
  }
}

/**
 * Leave a group thread
 */
export function leaveThread(threadId: string): void {
  const profile = getCurrentProfile()
  if (!profile) return

  const state = getState()
  const thread = state.threads.find(t => t.id === threadId)

  if (thread && thread.type !== 'dm') {
    const idx = thread.participants.indexOf(profile.id)
    if (idx !== -1) {
      thread.participants.splice(idx, 1)
      thread.participantNames.splice(idx, 1)

      // Delete thread if empty
      if (thread.participants.length === 0) {
        state.threads = state.threads.filter(t => t.id !== threadId)
        delete state.messages[threadId]
      }

      saveState(state)
    }
  }
}

// ============================================================================
// Message Management
// ============================================================================

/**
 * Send a message to a thread
 */
export function sendDirectMessage(
  threadId: string,
  text: string
): DirectMessage | null {
  const profile = getCurrentProfile()
  if (!profile || !text.trim()) return null

  // Check rate limit
  const rateLimitResult = tryAction('message_send', profile.id)
  if (!rateLimitResult.allowed) {
    log.warn('Rate limited:', rateLimitResult.error)
    return null
  }

  const state = getState()
  const thread = state.threads.find(t => t.id === threadId)
  if (!thread || !thread.participants.includes(profile.id)) return null

  const message: DirectMessage = {
    id: `msg-${Date.now()}-${generateShortId()}`,
    threadId,
    senderId: profile.id,
    senderName: sanitizeText(profile.nickname),
    text: sanitizeText(text.trim()),
    timestamp: Date.now(),
    readBy: [profile.id],
  }

  // Initialize messages array if needed
  if (!state.messages[threadId]) {
    state.messages[threadId] = []
  }

  state.messages[threadId].push(message)

  // Update thread's last message
  thread.lastMessage = {
    text: message.text,
    senderId: message.senderId,
    senderName: message.senderName,
    timestamp: message.timestamp,
  }

  // Increment unread count for other participants
  thread.unreadCount = thread.participants.length - 1

  saveState(state)
  return message
}

/**
 * Get messages for a thread
 */
export function getThreadMessages(threadId: string): DirectMessage[] {
  const state = getState()
  return state.messages[threadId] || []
}

/**
 * Mark messages as read
 */
export function markThreadAsRead(threadId: string): void {
  const profile = getCurrentProfile()
  if (!profile) return

  const state = getState()
  const thread = state.threads.find(t => t.id === threadId)
  const messages = state.messages[threadId]

  if (thread && messages) {
    messages.forEach(msg => {
      if (!msg.readBy.includes(profile.id)) {
        msg.readBy.push(profile.id)
      }
    })

    thread.unreadCount = 0
    saveState(state)
  }
}

/**
 * Get total unread count across all threads
 */
export function getTotalUnreadCount(): number {
  const profile = getCurrentProfile()
  if (!profile) return 0

  const state = getState()
  let total = 0

  state.threads.forEach(thread => {
    if (thread.participants.includes(profile.id)) {
      const messages = state.messages[thread.id] || []
      const unread = messages.filter(m =>
        m.senderId !== profile.id && !m.readBy.includes(profile.id)
      ).length
      total += unread
    }
  })

  return total
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get display name for a thread (from perspective of current user)
 */
export function getThreadDisplayName(thread: DirectMessageThread): string {
  const profile = getCurrentProfile()

  if (thread.name) return thread.name

  if (thread.type === 'dm' && profile) {
    // Show the other person's name
    const otherIdx = thread.participants.indexOf(profile.id) === 0 ? 1 : 0
    return thread.participantNames[otherIdx] || 'Unknown'
  }

  return thread.name || `Thread ${thread.id.slice(0, 8)}`
}

/**
 * Generate room name for Socket.io
 */
export function getSocketRoomName(thread: DirectMessageThread): string {
  return thread.id
}

// ============================================================================
// Cleanup
// ============================================================================

function cleanupOldMessages(): void {
  const state = getState()

  Object.keys(state.messages).forEach(threadId => {
    const messages = state.messages[threadId]
    if (messages.length > MAX_MESSAGES_PER_THREAD) {
      state.messages[threadId] = messages.slice(-MAX_MESSAGES_PER_THREAD)
    }
  })

  saveState(state)
}
