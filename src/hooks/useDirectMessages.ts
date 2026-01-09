'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { getSocket } from '@/lib/socketio'
import { getCurrentProfile } from '@/lib/profileStorage'
import type { DirectMessageThread, DirectMessage } from '@/lib/directMessageStorage'

// Generate a cryptographically secure short ID
function generateShortId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().split('-')[0]
  }
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(4)
    crypto.getRandomValues(bytes)
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  }
  throw new Error('Crypto API not available')
}

// ============================================================================
// Types
// ============================================================================

export interface DMState {
  threads: DirectMessageThread[]
  isConnected: boolean
  isLoading: boolean
  error: string | null
}

export interface ThreadMessagesState {
  messages: DirectMessage[]
  isLoading: boolean
  error: string | null
}

interface LastMessage {
  id: string
  text: string
  senderId: string
  senderName: string
  timestamp: number
}

// ============================================================================
// Main Hook - Subscribe to DM updates
// ============================================================================

export function useDirectMessages() {
  const [state, setState] = useState<DMState>({
    threads: [],
    isConnected: false,
    isLoading: true,
    error: null,
  })

  const profileRef = useRef(getCurrentProfile())

  useEffect(() => {
    const profile = getCurrentProfile()
    if (!profile) {
      setState(prev => ({ ...prev, isLoading: false, error: 'Not logged in' }))
      return
    }
    profileRef.current = profile

    const socket = getSocket()
    if (!socket) {
      setState(prev => ({ ...prev, isLoading: false, error: 'Socket not available' }))
      return
    }

    // Connection events
    const handleConnect = () => {
      setState(prev => ({ ...prev, isConnected: true, error: null }))
      // Subscribe to DM updates
      socket.emit('dm:subscribe', { profileId: profile.id })
    }

    const handleDisconnect = () => {
      setState(prev => ({ ...prev, isConnected: false }))
    }

    const handleConnectError = (err: Error) => {
      setState(prev => ({ ...prev, isConnected: false, error: err.message }))
    }

    // DM events
    const handleThreads = ({ threads }: { threads: DirectMessageThread[] }) => {
      setState(prev => ({ ...prev, threads, isLoading: false }))
    }

    const handleThreadCreated = ({ thread }: { thread: DirectMessageThread }) => {
      setState(prev => {
        // Avoid duplicates
        const exists = prev.threads.some(t => t.id === thread.id)
        if (exists) {
          return {
            ...prev,
            threads: prev.threads.map(t => t.id === thread.id ? thread : t)
          }
        }
        return {
          ...prev,
          threads: [thread, ...prev.threads]
        }
      })
    }

    const handleThreadUpdated = ({ threadId, lastMessage }: { threadId: string; lastMessage: LastMessage }) => {
      setState(prev => ({
        ...prev,
        threads: prev.threads.map(t => {
          if (t.id === threadId) {
            return {
              ...t,
              lastMessage,
              unreadCount: t.unreadCount + 1
            }
          }
          return t
        }).sort((a, b) => {
          const aTime = a.lastMessage?.timestamp || a.createdAt
          const bTime = b.lastMessage?.timestamp || b.createdAt
          return bTime - aTime
        })
      }))
    }

    const handleError = ({ code, message }: { code: string; message: string }) => {
      console.error('[useDirectMessages] Error:', code, message)
      setState(prev => ({ ...prev, error: message }))
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.on('dm:threads', handleThreads)
    socket.on('dm:thread_created', handleThreadCreated)
    socket.on('dm:thread_updated', handleThreadUpdated)
    socket.on('dm:error', handleError)

    // Initial subscribe if already connected
    if (socket.connected) {
      socket.emit('dm:subscribe', { profileId: profile.id })
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
      socket.off('dm:threads', handleThreads)
      socket.off('dm:thread_created', handleThreadCreated)
      socket.off('dm:thread_updated', handleThreadUpdated)
      socket.off('dm:error', handleError)
    }
  }, [])

  // Create a new thread
  const createThread = useCallback((thread: DirectMessageThread) => {
    const socket = getSocket()
    if (!socket) return

    socket.emit('dm:create_thread', { thread })
  }, [])

  // Refresh threads
  const refreshThreads = useCallback(() => {
    const profile = profileRef.current
    const socket = getSocket()
    if (!socket || !profile) return

    setState(prev => ({ ...prev, isLoading: true }))
    socket.emit('dm:get_threads', { profileId: profile.id })
  }, [])

  // Get total unread count
  const totalUnread = state.threads.reduce((sum, t) => sum + (t.unreadCount || 0), 0)

  return {
    ...state,
    totalUnread,
    createThread,
    refreshThreads,
  }
}

// ============================================================================
// Thread Messages Hook - Subscribe to a specific thread
// ============================================================================

export function useThreadMessages(threadId: string | null) {
  const [state, setState] = useState<ThreadMessagesState>({
    messages: [],
    isLoading: true,
    error: null,
  })

  const profileRef = useRef(getCurrentProfile())

  useEffect(() => {
    if (!threadId) {
      setState({ messages: [], isLoading: false, error: null })
      return
    }

    const profile = getCurrentProfile()
    if (!profile) {
      setState({ messages: [], isLoading: false, error: 'Not logged in' })
      return
    }
    profileRef.current = profile

    const socket = getSocket()
    if (!socket) {
      setState({ messages: [], isLoading: false, error: 'Not connected' })
      return
    }

    // Join thread room
    socket.emit('dm:join_thread', { threadId, profileId: profile.id })

    // Listen for messages
    const handleMessages = ({ threadId: tid, messages }: { threadId: string; messages: DirectMessage[] }) => {
      if (tid === threadId) {
        setState({ messages, isLoading: false, error: null })
      }
    }

    const handleNewMessage = ({ message }: { message: DirectMessage }) => {
      if (message.threadId === threadId) {
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, message]
        }))
      }
    }

    const handleError = ({ code, message }: { code: string; message: string }) => {
      console.error('[useThreadMessages] Error:', code, message)
      setState(prev => ({ ...prev, error: message, isLoading: false }))
    }

    socket.on('dm:messages', handleMessages)
    socket.on('dm:new_message', handleNewMessage)
    socket.on('dm:error', handleError)

    return () => {
      socket.emit('dm:leave_thread', { threadId })
      socket.off('dm:messages', handleMessages)
      socket.off('dm:new_message', handleNewMessage)
      socket.off('dm:error', handleError)
    }
  }, [threadId])

  // Send a message
  const sendMessage = useCallback((text: string) => {
    const profile = profileRef.current
    const socket = getSocket()
    if (!socket || !profile || !threadId || !text.trim()) return

    const message: DirectMessage = {
      id: `msg-${Date.now()}-${generateShortId()}`,
      threadId,
      senderId: profile.id,
      senderName: profile.nickname,
      text: text.trim(),
      timestamp: Date.now(),
      readBy: [profile.id],
    }

    // Optimistic update
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }))

    socket.emit('dm:send_message', { message })
  }, [threadId])

  // Mark as read
  const markAsRead = useCallback(() => {
    const profile = profileRef.current
    const socket = getSocket()
    if (!socket || !profile || !threadId) return

    socket.emit('dm:mark_read', { threadId, profileId: profile.id })
  }, [threadId])

  return {
    ...state,
    sendMessage,
    markAsRead,
  }
}

// ============================================================================
// Unread Count Hook - Just for badge updates
// ============================================================================

export function useUnreadCount() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const profile = getCurrentProfile()
    if (!profile) return

    const socket = getSocket()
    if (!socket) return

    // Listen for thread updates that affect unread count
    const handleThreads = ({ threads }: { threads: DirectMessageThread[] }) => {
      const total = threads.reduce((sum, t) => sum + (t.unreadCount || 0), 0)
      setCount(total)
    }

    const handleThreadUpdated = () => {
      // Increment count when new message arrives
      setCount(prev => prev + 1)
    }

    const handleMarkedRead = ({ threadId }: { threadId: string }) => {
      // Refresh count after marking as read
      socket.emit('dm:get_threads', { profileId: profile.id })
    }

    socket.on('dm:threads', handleThreads)
    socket.on('dm:thread_updated', handleThreadUpdated)
    socket.on('dm:marked_read', handleMarkedRead)

    // Initial fetch
    if (socket.connected) {
      socket.emit('dm:get_threads', { profileId: profile.id })
    }

    return () => {
      socket.off('dm:threads', handleThreads)
      socket.off('dm:thread_updated', handleThreadUpdated)
      socket.off('dm:marked_read', handleMarkedRead)
    }
  }, [])

  return count
}
