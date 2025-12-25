'use client'

import { useState } from 'react'
import { useDirectMessages } from '@/hooks/useDirectMessages'
import { getThreadDisplayName, type DirectMessageThread } from '@/lib/directMessageStorage'
import { MessageHub } from '@/components/Messages/MessageHub'
import { useLanguage } from '@/contexts/LanguageContext'

export function MessagesSection() {
  const { t } = useLanguage()
  const [showMessages, setShowMessages] = useState(false)
  const { threads, totalUnread, isConnected, isLoading } = useDirectMessages()

  // Get the 3 most recent threads for preview
  const recentThreads = threads.slice(0, 3)

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    } else if (diffDays === 1) {
      return t('messages.yesterday')
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
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )
      case 'group':
        return (
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )
      case 'bloc':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {/* Header with Messages title and badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">{t('messages.title')}</h3>
            {totalUnread > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {totalUnread}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}
              title={isConnected ? t('common.connected') : t('common.disconnected')}
            />
            <button
              onClick={() => setShowMessages(true)}
              className="text-sm text-rstu-red hover:underline"
            >
              {t('messages.newMessage')}
            </button>
          </div>
        </div>

        {/* Messages preview */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rstu-red" />
          </div>
        ) : recentThreads.length === 0 ? (
          <div className="text-center py-4">
            <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm text-gray-500 mb-3">{t('messages.noMessages')}</p>
            <button
              onClick={() => setShowMessages(true)}
              className="px-4 py-1.5 text-sm font-medium text-white bg-rstu-red rounded-lg hover:bg-red-700"
            >
              {t('messages.newMessage')}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentThreads.map(thread => {
              const displayName = getThreadDisplayName(thread)
              const hasUnread = thread.unreadCount > 0

              return (
                <button
                  key={thread.id}
                  onClick={() => setShowMessages(true)}
                  className="w-full flex items-center gap-3 p-2 -mx-2 hover:bg-gray-50 rounded-lg transition text-left"
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
                      <p className={`text-xs truncate ${hasUnread ? 'text-gray-700' : 'text-gray-500'}`}>
                        {thread.lastMessage.text}
                      </p>
                    )}
                  </div>
                  {hasUnread && (
                    <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                  )}
                </button>
              )
            })}

            {/* View all link */}
            {threads.length > 3 && (
              <button
                onClick={() => setShowMessages(true)}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2"
              >
                View all {threads.length} conversations &rarr;
              </button>
            )}

            {/* Open messages button if 1-3 threads */}
            {threads.length <= 3 && (
              <button
                onClick={() => setShowMessages(true)}
                className="w-full text-center text-sm text-rstu-red hover:underline py-2"
              >
                Open Messages &rarr;
              </button>
            )}
          </div>
        )}
      </div>

      {/* Messages Hub Modal */}
      {showMessages && (
        <MessageHub onClose={() => setShowMessages(false)} />
      )}
    </>
  )
}
