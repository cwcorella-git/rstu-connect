'use client'

import { useState, useEffect } from 'react'
import { useSocketChat } from '@/hooks/useSocketChat'
import { MessageList } from '@/components/GunChat/MessageList'
import { MessageInput } from '@/components/GunChat/MessageInput'
import { MeetingSuggestion } from '@/components/Chat/MeetingSuggestion'
import { LocationSuggestion } from '@/components/Chat/LocationSuggestion'
import { IssueSuggestion } from '@/components/Chat/IssueSuggestion'
import { IssuesPanel } from '@/components/Chat/IssuesPanel'
import { getBuildingComplaints, getBuildingDemands } from '@/lib/buildingOrganizingStorage'
import type { PropertyTab } from './PropertyTabBar'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'

interface PropertyChatTabProps {
  chatSlug: string;
  building: EnhancedBuilding;
  buildingAddress: string;
  onOpenMap?: () => void; // Callback to switch to map tab
}

export function PropertyChatTab({ chatSlug, buildingAddress, onOpenMap }: PropertyChatTabProps) {
  // Initialize Socket.io chat for this building
  const { messages, sendMessage, deleteMessage, isConnected } = useSocketChat(chatSlug)

  // Get username from localStorage
  const [username, setUsername] = useState('')

  // Modal states
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)

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
  }

  // Handle location suggestion - uses current username or 'Organizer'
  const handleLocationSuggestion = (message: string) => {
    const name = username || 'Organizer'
    sendMessage(message, name)
  }

  return (
    <div className="flex flex-col h-full">
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
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition"
        >
          <span className="text-gray-600">Suggest Meeting</span>
        </button>
        <button
          onClick={() => {
            if (onOpenMap) {
              // Future: open map for location selection
              onOpenMap();
            } else {
              setShowLocationModal(true);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition"
        >
          <span className="text-gray-600">Suggest Location</span>
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

      {/* Location Suggestion Modal */}
      {showLocationModal && (
        <LocationSuggestion
          buildingAddress={buildingAddress}
          onSubmit={handleLocationSuggestion}
          onClose={() => setShowLocationModal(false)}
        />
      )}
    </div>
  );
}
