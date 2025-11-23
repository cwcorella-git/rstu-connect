'use client'

import { useState, useEffect, useCallback } from 'react'
import { getBuildingChatNode } from '@/lib/gun'

export interface ChatMessage {
  id: string
  text: string
  username: string
  timestamp: number
}

export interface TypingUser {
  username: string
  timestamp: number
}

interface UseGunChatReturn {
  messages: ChatMessage[]
  sendMessage: (text: string, username: string) => void
  setTyping: (username: string) => void
  typingUsers: TypingUser[]
  isConnected: boolean
  clearMessages: () => void
}

/**
 * Custom hook for Gun.js P2P chat functionality
 * Provides real-time message sync across all peers
 */
export function useGunChat(chatSlug: string): UseGunChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isConnected, setIsConnected] = useState(false)

  // Messages listener
  useEffect(() => {
    // Server-side: skip Gun setup
    if (typeof window === 'undefined') return

    const chatNode = getBuildingChatNode(chatSlug)
    if (!chatNode) {
      console.error('Failed to initialize Gun chat node')
      return
    }

    // Get the messages collection for this building
    const messagesNode = chatNode.get('messages')

    // Set connected state
    setIsConnected(true)

    // Listen for messages in real-time
    // Gun uses .map().on() to iterate over all items (historical + new)
    // This pattern syncs both existing messages and live updates across peers
    // @ts-ignore - Gun.js has incomplete TypeScript definitions
    const listener = messagesNode.map().on((messageData: any, messageId: string) => {
      if (!messageData) return

      // Parse message data
      const message: ChatMessage = {
        id: messageId,
        text: messageData.text || '',
        username: messageData.username || 'Anonymous',
        timestamp: messageData.timestamp || Date.now()
      }

      // Update messages state
      setMessages(prevMessages => {
        // Check if message already exists
        const exists = prevMessages.some(m => m.id === messageId)
        if (exists) {
          // Update existing message
          return prevMessages.map(m =>
            m.id === messageId ? message : m
          )
        } else {
          // Add new message and sort by timestamp
          return [...prevMessages, message].sort((a, b) => a.timestamp - b.timestamp)
        }
      })
    })

    // Cleanup on unmount - properly unsubscribe
    return () => {
      // @ts-ignore - Gun.js .off() method
      if (listener && listener.off) {
        listener.off()
      }
      setIsConnected(false)
      setMessages([])
    }
  }, [chatSlug])

  // Typing indicator listener
  useEffect(() => {
    if (typeof window === 'undefined') return

    const chatNode = getBuildingChatNode(chatSlug)
    if (!chatNode) return

    // Get typing status collection
    const typingNode = chatNode.get('typing')

    // Listen for typing status updates
    // @ts-ignore - Gun.js has incomplete TypeScript definitions
    const typingListener = typingNode.map().on((typingData: any, username: string) => {
      if (!typingData || !typingData.timestamp) {
        // User stopped typing or data expired
        setTypingUsers(prev => prev.filter(u => u.username !== username))
        return
      }

      const now = Date.now()
      const age = now - typingData.timestamp

      // Ignore typing events older than 3 seconds
      if (age > 3000) {
        setTypingUsers(prev => prev.filter(u => u.username !== username))
        return
      }

      // Add or update typing user
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.username !== username)
        return [...filtered, { username, timestamp: typingData.timestamp }]
      })
    })

    // Clean up expired typing indicators every second
    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      setTypingUsers(prev => prev.filter(u => now - u.timestamp < 3000))
    }, 1000)

    // Cleanup on unmount
    return () => {
      // @ts-ignore - Gun.js .off() method
      if (typingListener && typingListener.off) {
        typingListener.off()
      }
      clearInterval(cleanupInterval)
      setTypingUsers([])
    }
  }, [chatSlug])

  /**
   * Send a new message to the chat
   */
  const sendMessage = useCallback((text: string, username: string) => {
    if (!text.trim()) return

    const chatNode = getBuildingChatNode(chatSlug)
    if (!chatNode) {
      console.error('Cannot send message: Gun not initialized')
      return
    }

    // Create message object
    const message = {
      text: text.trim(),
      username: username || 'Anonymous',
      timestamp: Date.now()
    }

    // Store in Gun using .set() for proper peer-to-peer persistence
    // .set() creates persistent records that sync across all peers
    // Unlike .put(), .set() ensures historical data is available to new peers
    // @ts-ignore - Gun.js has incomplete TypeScript definitions
    chatNode.get('messages').set(message)

    // Clear typing indicator when message is sent
    // @ts-ignore - Gun.js has incomplete TypeScript definitions
    chatNode.get('typing').get(username).put(null)
  }, [chatSlug])

  /**
   * Set typing indicator for current user
   * Call this when user types in the message input
   */
  const setTyping = useCallback((username: string) => {
    if (!username) return

    const chatNode = getBuildingChatNode(chatSlug)
    if (!chatNode) return

    // Store ephemeral typing status
    // This will broadcast to all peers that this user is typing
    // @ts-ignore - Gun.js has incomplete TypeScript definitions
    chatNode.get('typing').get(username).put({
      timestamp: Date.now()
    })
  }, [chatSlug])

  /**
   * Clear all messages (for testing/admin)
   */
  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    sendMessage,
    setTyping,
    typingUsers,
    isConnected,
    clearMessages
  }
}
