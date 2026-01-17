'use client'

import { useState, useEffect } from 'react'
import { useSocketChat } from '@/hooks/useSocketChat'
import { MessageList } from '@/components/SocketChat/MessageList'
import { MessageInput } from '@/components/SocketChat/MessageInput'
import { EscalationForm } from '@/components/Escalation/EscalationForm'
import { EscalationModal } from '@/components/Escalation/EscalationModal'
import { IssuesPanel } from '@/components/Chat/IssuesPanel'
import { VoteSuggestion } from '@/components/Chat/VoteSuggestion'
import { CrossGroupBanner } from '@/components/Chat/CrossGroupBanner'
import { BlocFormationProposalBanner } from '@/components/Chat/BlocFormationProposalBanner'
import { CampaignStatusBanner } from '@/components/Chat/CampaignStatusBanner'
import { EvictionAlertBanner } from '@/components/Chat/EvictionAlertBanner'
import { LandlordAlertBanner } from '@/components/Chat/LandlordAlertBanner'
import { QuickActionsBar, type ProposalType } from '@/components/Chat/QuickActionsBar'
import { BlocFormationProposal } from '@/components/Chat/BlocFormationProposal'
import { BlocJoinProposal } from '@/components/Chat/BlocJoinProposal'
import { EvictionCaseForm } from '@/components/MutualAid/EvictionCaseForm'
import { EvictionCaseDetail } from '@/components/MutualAid/EvictionCaseDetail'
import { getActiveCases } from '@/lib/escalationStorage'
import { getGroupForApn, type LinkedPropertyGroup } from '@/lib/linkedPropertiesStorage'
import { getActiveProposals } from '@/lib/governanceStorage'
import { OrganizingStatusBar } from './OrganizingStatusBar'
import type { PropertyTab } from './PropertyTabBar'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import type { EvictionCase } from '@/lib/evictionDefenseStorage'

interface PropertyChatTabProps {
  chatSlug: string;
  building: EnhancedBuilding;
  buildingAddress: string;
  allBuildings?: EnhancedBuilding[];
}

export function PropertyChatTab({ chatSlug, building, buildingAddress, allBuildings = [] }: PropertyChatTabProps) {
  // Initialize Socket.io chat for this building
  const { messages, sendMessage, deleteMessage, isConnected } = useSocketChat(chatSlug)

  // Get username from localStorage
  const [username, setUsername] = useState('')

  // Modal states
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [showEscalationModal, setShowEscalationModal] = useState(false)
  const [showIssuesPanel, setShowIssuesPanel] = useState(false)
  const [issuesPanelInitialTab, setIssuesPanelInitialTab] = useState<'issues' | 'governance' | 'campaign'>('campaign')
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [showBlocFormation, setShowBlocFormation] = useState(false)
  const [showBlocJoin, setShowBlocJoin] = useState(false)
  const [showEvictionForm, setShowEvictionForm] = useState(false)
  const [selectedEvictionCaseId, setSelectedEvictionCaseId] = useState<string | null>(null)

  // Profile ID for eviction alert dismissals
  const [profileId, setProfileId] = useState<string | null>(null)

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
      // Load profile ID for alert dismissals
      const storedProfile = localStorage.getItem('rstu_profile')
      if (storedProfile) {
        try {
          const profile = JSON.parse(storedProfile)
          setProfileId(profile.odellId || null)
        } catch {
          // Ignore parse errors
        }
      }
      // Load governance data on client side only
      const group = getGroupForApn(building.apn)
      setPropertyGroup(group || null)
      if (group) {
        setActiveVotesCount(getActiveProposals(group.id).length)
      }
    }
  }, [building.apn])

  // Load issues count from escalation storage
  useEffect(() => {
    const updateCount = () => {
      // Use chatSlug as buildingId for escalation cases
      const activeCases = getActiveCases(chatSlug)
      setIssuesCount(activeCases.length)
    }
    updateCount()
    // Re-check when modal closes (user may have updated cases)
    if (!showEscalationModal && !showIssueModal) {
      updateCount()
    }
  }, [chatSlug, showEscalationModal, showIssueModal])

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
      case 'start-vote':
        setShowVoteModal(true)
        break
      case 'report-eviction':
        setShowEvictionForm(true)
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

      {/* Bloc Formation Proposal Banner */}
      <div className="flex-shrink-0 px-4 pt-2">
        <BlocFormationProposalBanner
          buildingApn={building.apn}
          chatSlug={chatSlug}
          onProposalStatusChange={() => {
            // Could refresh other data if needed
          }}
        />
      </div>

      {/* Campaign Status Banner */}
      <div className="flex-shrink-0 px-4 pt-2">
        <CampaignStatusBanner
          chatSlug={chatSlug}
          onViewDetails={() => {
            setIssuesPanelInitialTab('campaign')
            setShowIssuesPanel(true)
          }}
        />
      </div>

      {/* Eviction Alert Banner */}
      <div className="flex-shrink-0 px-4 pt-2">
        <EvictionAlertBanner
          buildingApn={building.apn}
          allBuildings={allBuildings}
          profileId={profileId}
          onViewCase={(caseId) => setSelectedEvictionCaseId(caseId)}
          onReportCase={() => setShowEvictionForm(true)}
        />
      </div>

      {/* Landlord Portfolio Alert Banner - alerts from same landlord's other buildings */}
      <div className="flex-shrink-0 px-4 pt-2">
        <LandlordAlertBanner
          buildingApn={building.apn}
          allBuildings={allBuildings}
        />
      </div>

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
        onViewIssues={() => {
          setShowEscalationModal(true)
        }}
        onViewCampaign={() => {
          setIssuesPanelInitialTab('campaign')
          setShowIssuesPanel(true)
        }}
      />

      {/* Organizing Status Bar */}
      <OrganizingStatusBar
        buildingId={chatSlug}
        buildingAddress={buildingAddress}
        totalUnits={building.units}
      />

      {/* Escalation Form - Report New Issue */}
      {showIssueModal && (
        <EscalationForm
          buildingId={chatSlug}
          buildingAddress={buildingAddress}
          onSuccess={() => {
            setShowIssueModal(false)
            // Refresh issue count
            setIssuesCount(getActiveCases(chatSlug).length)
          }}
          onCancel={() => setShowIssueModal(false)}
        />
      )}

      {/* Escalation Modal - View All Issues */}
      {showEscalationModal && (
        <EscalationModal
          isOpen={showEscalationModal}
          onClose={() => {
            setShowEscalationModal(false)
            // Refresh issue count when closing
            setIssuesCount(getActiveCases(chatSlug).length)
          }}
          chatSlug={chatSlug}
          buildingAddress={buildingAddress}
        />
      )}

      {/* Issues Panel - For Governance and Campaign tabs */}
      {showIssuesPanel && (
        <IssuesPanel
          building={building}
          initialTab={issuesPanelInitialTab}
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

      {/* Eviction Case Report Modal */}
      {showEvictionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto">
            <button
              onClick={() => setShowEvictionForm(false)}
              className="absolute top-4 right-4 z-10 p-1 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <EvictionCaseForm
              buildings={allBuildings}
              initialBuilding={building}
              onCaseCreated={() => {
                setShowEvictionForm(false)
              }}
              onCancel={() => setShowEvictionForm(false)}
            />
          </div>
        </div>
      )}

      {/* Eviction Case Detail Modal */}
      {selectedEvictionCaseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-auto">
            <button
              onClick={() => setSelectedEvictionCaseId(null)}
              className="absolute top-4 right-4 z-10 p-1 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <EvictionCaseDetail
              caseId={selectedEvictionCaseId}
              onCaseUpdated={() => {
                // Refresh data if needed
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
