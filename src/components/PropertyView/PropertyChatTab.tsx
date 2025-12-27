'use client'

import { useState, useEffect } from 'react'
import { useSocketChat } from '@/hooks/useSocketChat'
import { MessageList } from '@/components/GunChat/MessageList'
import { MessageInput } from '@/components/GunChat/MessageInput'
import { IssueSuggestion } from '@/components/Chat/IssueSuggestion'
import { IssuesPanel } from '@/components/Chat/IssuesPanel'
import { VoteSuggestion } from '@/components/Chat/VoteSuggestion'
import { CrossGroupBanner } from '@/components/Chat/CrossGroupBanner'
import { QuickActionsBar, type ProposalType } from '@/components/Chat/QuickActionsBar'
import { BlocFormationProposal } from '@/components/Chat/BlocFormationProposal'
import { BlocJoinProposal } from '@/components/Chat/BlocJoinProposal'
import { RentStrikeVote } from '@/components/Chat/RentStrikeVote'
import { DemandLetterProposal } from '@/components/Chat/DemandLetterProposal'
import { PetitionProposal } from '@/components/Chat/PetitionProposal'
import { getBuildingComplaints, getBuildingDemands } from '@/lib/buildingOrganizingStorage'
import { getGroupForApn, type LinkedPropertyGroup } from '@/lib/linkedPropertiesStorage'
import { getActiveProposals } from '@/lib/governanceStorage'
import type { PropertyTab } from './PropertyTabBar'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'

interface PropertyChatTabProps {
  chatSlug: string;
  building: EnhancedBuilding;
  buildingAddress: string;
}

export function PropertyChatTab({ chatSlug, building, buildingAddress }: PropertyChatTabProps) {
  // Initialize Socket.io chat for this building
  const { messages, sendMessage, deleteMessage, isConnected } = useSocketChat(chatSlug)

  // Get username from localStorage
  const [username, setUsername] = useState('')

  // Modal states
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [showIssuesPanel, setShowIssuesPanel] = useState(false)
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [showBlocFormation, setShowBlocFormation] = useState(false)
  const [showBlocJoin, setShowBlocJoin] = useState(false)
  const [showRentStrike, setShowRentStrike] = useState(false)
  const [showDemandLetter, setShowDemandLetter] = useState(false)
  const [showPetition, setShowPetition] = useState(false)

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

  // Handle proposal menu selection
  const handleProposalSelect = (type: ProposalType) => {
    switch (type) {
      case 'report-issue':
        setShowIssueModal(true)
        break
      case 'form-bloc':
        setShowBlocFormation(true)
        break
      case 'join-bloc':
        setShowBlocJoin(true)
        break
      case 'start-vote':
        setShowVoteModal(true)
        break
      case 'rent-strike':
        setShowRentStrike(true)
        break
      case 'demand-letter':
        setShowDemandLetter(true)
        break
      case 'petition':
        setShowPetition(true)
        break
    }
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
          chatSlug={chatSlug}
          buildingAddress={buildingAddress}
        />
      </div>

      {/* Message input */}
      <MessageInput onSendMessage={sendMessage} isConnected={isConnected} />

      {/* Quick Actions Bar */}
      <QuickActionsBar
        building={building}
        propertyGroup={propertyGroup}
        issuesCount={issuesCount}
        activeVotesCount={activeVotesCount}
        onSelectProposal={handleProposalSelect}
        onViewIssues={() => setShowIssuesPanel(true)}
      />

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

      {/* Bloc Formation Modal */}
      {showBlocFormation && (
        <BlocFormationProposal
          currentBuilding={building}
          onSubmit={handleVoteSuggestion}
          onClose={() => setShowBlocFormation(false)}
        />
      )}

      {/* Bloc Join Modal */}
      {showBlocJoin && (
        <BlocJoinProposal
          currentBuilding={building}
          buildings={[]} // Will need to pass buildings from parent
          onSubmit={handleVoteSuggestion}
          onClose={() => setShowBlocJoin(false)}
        />
      )}

      {/* Rent Strike Vote Modal */}
      {showRentStrike && (
        <RentStrikeVote
          building={building}
          propertyGroup={propertyGroup}
          onSubmit={handleVoteSuggestion}
          onClose={() => setShowRentStrike(false)}
        />
      )}

      {/* Demand Letter Modal */}
      {showDemandLetter && (
        <DemandLetterProposal
          building={building}
          propertyGroup={propertyGroup}
          onSubmit={handleVoteSuggestion}
          onClose={() => setShowDemandLetter(false)}
        />
      )}

      {/* Petition Modal */}
      {showPetition && (
        <PetitionProposal
          building={building}
          propertyGroup={propertyGroup}
          onSubmit={handleVoteSuggestion}
          onClose={() => setShowPetition(false)}
        />
      )}
    </div>
  );
}
