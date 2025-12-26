'use client'

import { useState } from 'react'
import {
  getThreadDisplayName,
  type DirectMessageThread,
} from '@/lib/directMessageStorage'
import { getCurrentProfile } from '@/lib/profileStorage'
import { useDirectMessages } from '@/hooks/useDirectMessages'
import { ThreadView } from './ThreadView'
import { NewMessageModal } from './NewMessageModal'

interface MessageHubProps {
  onClose?: () => void
  embedded?: boolean
}

export function MessageHub({ onClose, embedded = false }: MessageHubProps) {
  const [selectedThread, setSelectedThread] = useState<DirectMessageThread | null>(null)
  const [showNewMessage, setShowNewMessage] = useState(false)

  const profile = getCurrentProfile()
  const { threads, totalUnread, isConnected, isLoading, createThread, refreshThreads } = useDirectMessages()

  const handleThreadCreated = (thread: DirectMessageThread) => {
    setShowNewMessage(false)
    setSelectedThread(thread)
    createThread(thread)
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const getThreadIcon = (thread: DirectMessageThread) => {
    switch (thread.type) {
      case 'dm':
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )
      case 'group':
        return (
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )
      case 'bloc':
        return (
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )
    }
  }

  if (!profile) {
    if (embedded) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-sm px-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Sign In Required</h2>
            <p className="text-sm text-gray-600">
              Please create a profile to use direct messaging.
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-sm text-gray-600 mb-4">
            Please create a profile to use direct messaging.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-rstu-red rounded-lg hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  // Show thread view if selected
  if (selectedThread) {
    return (
      <ThreadView
        thread={selectedThread}
        onBack={() => {
          setSelectedThread(null)
          refreshThreads()
        }}
        onClose={onClose}
        embedded={embedded}
      />
    )
  }

  if (embedded) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Messages
              {totalUnread > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {totalUnread}
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              Private conversations
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
            </p>
          </div>
          <button
            onClick={() => setShowNewMessage(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            title="New message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rstu-red" />
            </div>
          ) : threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm text-gray-500 text-center mb-4">
                No messages yet. Start a conversation with a building member or organizer.
              </p>
              <button
                onClick={() => setShowNewMessage(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-rstu-red rounded-lg hover:bg-red-700"
              >
                New Message
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {threads.map(thread => {
                const displayName = getThreadDisplayName(thread)
                const hasUnread = thread.unreadCount > 0

                return (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThread(thread)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition text-left"
                  >
                    {getThreadIcon(thread)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {displayName}
                        </p>
                        {thread.lastMessage && (
                          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            {formatTime(thread.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      {thread.lastMessage && (
                        <p className={`text-xs truncate mt-0.5 ${hasUnread ? 'text-gray-700' : 'text-gray-500'}`}>
                          {thread.lastMessage.senderName}: {thread.lastMessage.text}
                        </p>
                      )}
                      {!thread.lastMessage && (
                        <p className="text-xs text-gray-400 mt-0.5">No messages yet</p>
                      )}
                    </div>
                    {hasUnread && (
                      <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                        {thread.unreadCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* New Message Modal */}
        {showNewMessage && (
          <NewMessageModal
            onClose={() => setShowNewMessage(false)}
            onThreadCreated={handleThreadCreated}
          />
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Messages
              {totalUnread > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {totalUnread}
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              Private conversations
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewMessage(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              title="New message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rstu-red" />
            </div>
          ) : threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm text-gray-500 text-center mb-4">
                No messages yet. Start a conversation with a building member or organizer.
              </p>
              <button
                onClick={() => setShowNewMessage(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-rstu-red rounded-lg hover:bg-red-700"
              >
                New Message
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {threads.map(thread => {
                const displayName = getThreadDisplayName(thread)
                const hasUnread = thread.unreadCount > 0

                return (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThread(thread)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition text-left"
                  >
                    {getThreadIcon(thread)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {displayName}
                        </p>
                        {thread.lastMessage && (
                          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            {formatTime(thread.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      {thread.lastMessage && (
                        <p className={`text-xs truncate mt-0.5 ${hasUnread ? 'text-gray-700' : 'text-gray-500'}`}>
                          {thread.lastMessage.senderName}: {thread.lastMessage.text}
                        </p>
                      )}
                      {!thread.lastMessage && (
                        <p className="text-xs text-gray-400 mt-0.5">No messages yet</p>
                      )}
                    </div>
                    {hasUnread && (
                      <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                        {thread.unreadCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessage && (
        <NewMessageModal
          onClose={() => setShowNewMessage(false)}
          onThreadCreated={handleThreadCreated}
        />
      )}
    </div>
  )
}
