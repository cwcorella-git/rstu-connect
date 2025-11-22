'use client'

import { useState, useEffect, useCallback } from 'react'
import { getBuildingChatNode } from '@/lib/gun'

export interface ChatMessage {
  id: string
  text: string
  username: string
  timestamp: number
}

interface UseGunChatReturn {
  messages: ChatMessage[]
  sendMessage: (text: string, username: string) => void
  isConnected: boolean
  clearMessages: () => void
}

/**
 * Custom hook for Gun.js P2P chat functionality
 * Provides real-time message sync across all peers
 */
export function useGunChat(chatSlug: string): UseGunChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)

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

    // Listen for new messages in real-time
    // Gun uses .map() to iterate over all items in the collection
    messagesNode.map().on((messageData: any, messageId: string) => {
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

    // Cleanup on unmount
    return () => {
      setIsConnected(false)
      setMessages([])
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
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const message = {
      text: text.trim(),
      username: username || 'Anonymous',
      timestamp: Date.now()
    }

    // Store in Gun
    chatNode.get('messages').get(messageId).put(message)
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
    isConnected,
    clearMessages
  }
}
