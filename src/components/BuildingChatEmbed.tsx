'use client'

import { useState, useEffect } from 'react'
import { useSocketChat } from '@/hooks/useSocketChat'
import { MessageList } from '@/components/GunChat/MessageList'
import { MessageInput } from '@/components/GunChat/MessageInput'
import { MeetingSuggestion } from '@/components/Chat/MeetingSuggestion'

interface BuildingChatEmbedProps {
  chatSlug: string;
  buildingAddress: string;
}

export function BuildingChatEmbed({ chatSlug, buildingAddress }: BuildingChatEmbedProps) {
  // Initialize Socket.io chat for this building
  const { messages, sendMessage, deleteMessage, isConnected } = useSocketChat(chatSlug)

  // Get username from localStorage
  const [username, setUsername] = useState('')

  // Modal states
  const [showMeetingModal, setShowMeetingModal] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUsername = localStorage.getItem('rstu_chat_username')
      if (savedUsername) {
        setUsername(savedUsername)
      }
    }
  }, [])

  // Handle meeting suggestion - uses current username or 'Organizer'
  const handleMeetingSuggestion = (message: string) => {
    const name = username || 'Organizer'
    sendMessage(message, name)
    setShowMeetingModal(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <h2 className="text-lg font-bold text-gray-900">{buildingAddress}</h2>
        <p className="text-xs text-gray-500 mt-1">
          Real-time organizing chat • No login required • Unlimited message history
        </p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          isConnected={isConnected}
          currentUsername={username}
          onDeleteMessage={deleteMessage}
          onSendMessage={sendMessage}
        />
      </div>

      {/* Message input */}
      <MessageInput onSendMessage={sendMessage} isConnected={isConnected} />

      {/* Scheduling Quick Actions */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex gap-2 flex-wrap">
        <button
          onClick={() => setShowMeetingModal(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition"
        >
          <span>📅</span>
          <span>Suggest Meeting</span>
        </button>
      </div>

      {/* Meeting Suggestion Modal */}
      {showMeetingModal && (
        <MeetingSuggestion
          buildingAddress={buildingAddress}
          onSubmit={handleMeetingSuggestion}
          onClose={() => setShowMeetingModal(false)}
        />
      )}
    </div>
  );
}
