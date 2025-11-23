'use client'

import { useEffect, useRef } from 'react'
import { ChatMessage, TypingUser } from '@/hooks/useGunChat'

interface MessageListProps {
  messages: ChatMessage[]
  typingUsers: TypingUser[]
  isConnected: boolean
}

export function MessageList({ messages, typingUsers, isConnected }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Format timestamp to readable time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50 p-4 space-y-3">
      {/* Connection status */}
      <div className="flex items-center justify-center py-2">
        <div className={`flex items-center gap-2 text-xs ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
          {isConnected ? 'Connected to P2P network' : 'Connecting...'}
        </div>
      </div>

      {/* Messages */}
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm text-center px-8">
          <div>
            <p className="font-medium mb-1">No messages yet</p>
            <p className="text-xs">Start the conversation! Your messages sync peer-to-peer.</p>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <div key={message.id} className="bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow">
            <div className="flex items-baseline justify-between mb-1">
              <span className="font-semibold text-gray-900 text-sm">
                {message.username}
              </span>
              <span className="text-xs text-gray-400 ml-2">
                {formatTime(message.timestamp)}
              </span>
            </div>
            <p className="text-gray-700 text-sm whitespace-pre-wrap break-words">
              {message.text}
            </p>
          </div>
        ))
      )}

      {/* Typing indicators */}
      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500 italic px-3 py-2">
          <div className="flex gap-1">
            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
            <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
          </div>
          <span>
            {typingUsers.length === 1
              ? `${typingUsers[0].username} is typing...`
              : typingUsers.length === 2
              ? `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`
              : `${typingUsers.length} people are typing...`
            }
          </span>
        </div>
      )}

      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  )
}
