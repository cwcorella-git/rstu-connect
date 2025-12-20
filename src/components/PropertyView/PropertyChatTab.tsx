'use client'

import { useState, useEffect } from 'react'
import { useSocketChat } from '@/hooks/useSocketChat'
import { MessageList } from '@/components/GunChat/MessageList'
import { MessageInput } from '@/components/GunChat/MessageInput'
import { MeetingSuggestion } from '@/components/Chat/MeetingSuggestion'
import { LocationSuggestion } from '@/components/Chat/LocationSuggestion'
import { IssueSuggestion } from '@/components/Chat/IssueSuggestion'
import { IssuesPanel } from '@/components/Chat/IssuesPanel'
import { VoteSuggestion } from '@/components/Chat/VoteSuggestion'
import { CrossGroupBanner } from '@/components/Chat/CrossGroupBanner'
import { getBuildingComplaints, getBuildingDemands } from '@/lib/buildingOrganizingStorage'
import { getGroupForApn, type LinkedPropertyGroup } from '@/lib/linkedPropertiesStorage'
import { getActiveProposals } from '@/lib/governanceStorage'
import type { PropertyTab } from './PropertyTabBar'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'

interface PropertyChatTabProps {
  chatSlug: string;
  building: EnhancedBuilding;
  buildingAddress: string;
  onOpenMap?: () => void; // Callback to switch to map tab
}

export function PropertyChatTab({ chatSlug, building, buildingAddress, onOpenMap }: PropertyChatTabProps) {
  // Initialize Socket.io chat for this building
  const { messages, sendMessage, deleteMessage, isConnected } = useSocketChat(chatSlug)

  // Get username from localStorage
  const [username, setUsername] = useState('')

  // Modal states
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [showIssuesPanel, setShowIssuesPanel] = useState(false)
  const [showVoteModal, setShowVoteModal] = useState(false)

  // Issues count for badge
  const [issuesCount, setIssuesCount] = useState(0)

  // Governance - get group info for this property (load in useEffect to avoid hydration mismatch)
  const [propertyGroup, setPropertyGroup] = useState<LinkedPropertyGroup | null>(null)
  const [activeVotesCount, setActiveVotesCount] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUsername = localStorage.getItem('rstu_chat_username')
      if (savedUsername) {
        setUsername(savedUsername)
      }
      // Load governance data on client side only
      const group = getGroupForApn(building.apn)
      setPropertyGroup(group || null)
      if (group) {
        setActiveVotesCount(getActiveProposals(group.id).length)
      }
    }
  }, [building.apn])

  // Load issues count
  useEffect(() => {
    const updateCount = () => {
      const complaints = getBuildingComplaints(building.chatSlug)
      const demands = getBuildingDemands(building.chatSlug)
      const activeCount = complaints.filter(c => c.status === 'voting').length + demands.length
      setIssuesCount(activeCount)
    }
    updateCount()
    // Re-check when panel closes (user may have voted)
    if (!showIssuesPanel) {
      updateCount()
    }
  }, [building.chatSlug, showIssuesPanel])

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

  // Handle issue suggestion - uses current username or 'Tenant'
  const handleIssueSuggestion = (message: string) => {
    const name = username || 'Tenant'
    sendMessage(message, name)
  }

  // Handle governance vote submission
  const handleVoteSuggestion = (message: string) => {
    const name = username || 'Tenant'
    sendMessage(message, name)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Cross-group banner for incoming requests */}
      {propertyGroup && (
        <div className="flex-shrink-0 px-4 pt-2">
          <CrossGroupBanner
            groupId={propertyGroup.id}
            currentUsername={username}
            onViewProposal={() => setShowIssuesPanel(true)}
          />
        </div>
      )}

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

      {/* Quick Actions */}
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
        <button
          onClick={() => setShowIssueModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-red-200 rounded-full hover:bg-red-50 transition"
        >
          <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-red-600">Report Issue</span>
        </button>
        <button
          onClick={() => setShowIssuesPanel(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition"
        >
          <span className="text-gray-600">View Issues</span>
          {issuesCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {issuesCount}
            </span>
          )}
        </button>
        {propertyGroup && (
          <button
            onClick={() => setShowVoteModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-purple-200 rounded-full hover:bg-purple-50 transition"
          >
            <svg className="w-3 h-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-purple-600">Start a Vote</span>
            {activeVotesCount > 0 && (
              <span className="bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {activeVotesCount}
              </span>
            )}
          </button>
        )}
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

      {/* Issue Suggestion Modal */}
      {showIssueModal && (
        <IssueSuggestion
          buildingAddress={buildingAddress}
          onSubmit={handleIssueSuggestion}
          onClose={() => setShowIssueModal(false)}
        />
      )}

      {/* Issues Panel */}
      {showIssuesPanel && (
        <IssuesPanel
          building={building}
          onClose={() => setShowIssuesPanel(false)}
        />
      )}

      {/* Vote Suggestion Modal */}
      {showVoteModal && propertyGroup && (
        <VoteSuggestion
          groupId={propertyGroup.id}
          groupName={propertyGroup.name}
          building={building}
          onSubmit={handleVoteSuggestion}
          onClose={() => setShowVoteModal(false)}
        />
      )}
    </div>
  );
}
