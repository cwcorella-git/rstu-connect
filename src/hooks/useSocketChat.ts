'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getSocket } from '@/lib/socketio'
import type { Socket } from 'socket.io-client'

export interface ChatMessage {
  id: string
  text: string
  username: string
  timestamp: number
}

interface UseSocketChatReturn {
  messages: ChatMessage[]
  sendMessage: (text: string, username: string) => void
  isConnected: boolean
  clearMessages: () => void  // No-op for backward compatibility
}

/**
 * Custom hook for Socket.io chat functionality
 * Provides real-time message sync with server persistence
 */
export function useSocketChat(chatSlug: string): UseSocketChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Server-side: skip Socket.io setup
    if (typeof window === 'undefined') return

    const socket = getSocket()
    if (!socket) {
      console.error('[useSocketChat] Failed to initialize Socket.io')
      return
    }

    socketRef.current = socket

    // Connection status tracking
    const handleConnect = () => {
      setIsConnected(true)

      // Join the room when connected
      socket.emit('join_room', { room: chatSlug })
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }

    // Message history (received on room join)
    const handleMessageHistory = ({ messages: historyMessages }: { messages: ChatMessage[] }) => {
      console.log(`[useSocketChat] Loaded ${historyMessages.length} messages for room: ${chatSlug}`)
      setMessages(historyMessages)
    }

    // Real-time new message
    const handleNewMessage = ({ message }: { message: ChatMessage }) => {
      setMessages(prev => {
        // Prevent duplicates
        if (prev.some(m => m.id === message.id)) {
          return prev
        }
        // Add new message and sort by timestamp
        return [...prev, message].sort((a, b) => a.timestamp - b.timestamp)
      })
    }

    // Register event listeners
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('message_history', handleMessageHistory)
    socket.on('new_message', handleNewMessage)

    // Set initial connection state
    setIsConnected(socket.connected)

    // If already connected, join room immediately
    if (socket.connected) {
      socket.emit('join_room', { room: chatSlug })
    }

    // Cleanup on unmount
    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('message_history', handleMessageHistory)
      socket.off('new_message', handleNewMessage)

      setMessages([])
      setIsConnected(false)
    }
  }, [chatSlug])

  /**
   * Send a new message to the chat
   */
  const sendMessage = useCallback((text: string, username: string) => {
    if (!text.trim()) return

    const socket = socketRef.current
    if (!socket || !socket.connected) {
      console.error('[useSocketChat] Cannot send message: not connected')
      return
    }

    socket.emit('send_message', {
      room: chatSlug,
      text: text.trim(),
      username: username || 'Anonymous'
    })
  }, [chatSlug])

  /**
   * Clear messages (no-op - kept for backward compatibility)
   * Admin tools removed per user requirements
   */
  const clearMessages = useCallback(() => {
    console.log('[useSocketChat] clearMessages called (no-op)')
  }, [])

  return {
    messages,
    sendMessage,
    isConnected,
    clearMessages
  }
}
