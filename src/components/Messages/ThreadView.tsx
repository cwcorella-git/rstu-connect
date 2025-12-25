'use client'

import { useState, useEffect, useRef } from 'react'
import {
  getThreadDisplayName,
  type DirectMessageThread,
  type DirectMessage,
} from '@/lib/directMessageStorage'
import { useThreadMessages } from '@/hooks/useDirectMessages'
import { getCurrentProfile } from '@/lib/profileStorage'

interface ThreadViewProps {
  thread: DirectMessageThread
  onBack: () => void
  onClose: () => void
}

export function ThreadView({ thread, onBack, onClose }: ThreadViewProps) {
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const profile = getCurrentProfile()
  const displayName = getThreadDisplayName(thread)
  const { messages, isLoading, sendMessage, markAsRead } = useThreadMessages(thread.id)

  // Mark as read when opening
  useEffect(() => {
    markAsRead()
  }, [markAsRead])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!inputText.trim()) return
    sendMessage(inputText.trim())
    setInputText('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
    }
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: DirectMessage[] }[] = []
  messages.forEach(msg => {
    const dateStr = formatDate(msg.timestamp)
    const lastGroup = groupedMessages[groupedMessages.length - 1]
    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.messages.push(msg)
    } else {
      groupedMessages.push({ date: dateStr, messages: [msg] })
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 flex-shrink-0">
          <button
            onClick={onBack}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 truncate">{displayName}</h2>
            <p className="text-xs text-gray-500">
              {thread.type === 'dm' ? 'Direct Message' :
               thread.type === 'group' ? `${thread.participants.length} members` :
               'Bloc Channel'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rstu-red" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm text-gray-500">
                No messages yet. Say hello!
              </p>
            </div>
          ) : (
            groupedMessages.map((group, groupIdx) => (
              <div key={groupIdx}>
                {/* Date Separator */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">{group.date}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Messages for this date */}
                <div className="space-y-3">
                  {group.messages.map((msg, idx) => {
                    const isOwn = msg.senderId === profile?.id
                    const showAvatar = idx === 0 ||
                      group.messages[idx - 1]?.senderId !== msg.senderId

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${isOwn ? 'order-1' : ''}`}>
                          {!isOwn && showAvatar && (
                            <p className="text-xs text-gray-500 mb-1 ml-1">
                              {msg.senderName}
                            </p>
                          )}
                          <div
                            className={`px-3 py-2 rounded-2xl ${
                              isOwn
                                ? 'bg-rstu-red text-white rounded-br-sm'
                                : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {msg.text}
                            </p>
                          </div>
                          <p className={`text-xs text-gray-400 mt-0.5 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rstu-red focus:border-transparent resize-none max-h-24"
              style={{ minHeight: '40px' }}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={`p-2 rounded-lg transition ${
                inputText.trim()
                  ? 'bg-rstu-red text-white hover:bg-red-700'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
