'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSocketChat } from '@/hooks/useSocketChat'
import { MessageList } from '@/components/SocketChat/MessageList'
import { MessageInput } from '@/components/SocketChat/MessageInput'
import {
  type InternalOrganization,
  COLLECTIVE_CATEGORY_LABELS,
  isMember,
  isPointPerson,
  addMember,
  removeMember,
  addPointPerson,
  removePointPerson,
  regenerateInviteCode,
} from '@/lib/organizationStorage'
import { getCurrentProfile, getProfileById, type UserProfile } from '@/lib/profileStorage'
import {
  getActiveProposals,
  createProposal,
  voteOnProposal,
  getUserVote,
  VOTE_THRESHOLDS,
  type GovernanceProposal,
} from '@/lib/governanceStorage'
import { getGroupEvents, type BuildingEvent, formatEventDateTime } from '@/lib/eventStorage'

interface InternalOrgDetailViewProps {
  organization: InternalOrganization
  onClose: () => void
  onOrganizationUpdated?: () => void
}

type TabType = 'chat' | 'members' | 'events' | 'governance'

export function InternalOrgDetailView({
  organization,
  onClose,
  onOrganizationUpdated,
}: InternalOrgDetailViewProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<TabType>('chat')
  const [showInviteCode, setShowInviteCode] = useState(false)
  const [showRenameForm, setShowRenameForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [memberProfiles, setMemberProfiles] = useState<UserProfile[]>([])

  const profile = getCurrentProfile()
  const userIsMember = profile ? isMember(organization.id, profile.id) : false
  const userIsPointPerson = profile ? isPointPerson(organization.id, profile.id) : false

  // Chat integration
  const { messages, sendMessage, deleteMessage, isConnected } = useSocketChat(organization.chatSlug)
  const [username, setUsername] = useState('')

  // Load username
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUsername = localStorage.getItem('rstu_chat_username')
      if (savedUsername) {
        setUsername(savedUsername)
      } else if (profile?.nickname) {
        setUsername(profile.nickname)
      }
    }
  }, [profile])

  // Load member profiles
  useEffect(() => {
    const loadProfiles = async () => {
      const profiles: UserProfile[] = []
      for (const memberId of organization.memberProfiles) {
        const memberProfile = await getProfileById(memberId)
        if (memberProfile) {
          profiles.push(memberProfile)
        }
      }
      setMemberProfiles(profiles)
    }
    loadProfiles()
  }, [organization.memberProfiles])

  // Get governance proposals for this org
  const proposals = getActiveProposals(organization.chatSlug)

  // Get events for this org
  const events = getGroupEvents(organization.chatSlug)
  const upcomingEvents = events
    .filter(e => e.dateTime > Date.now() && e.status !== 'cancelled' && e.status !== 'completed')
    .sort((a, b) => a.dateTime - b.dateTime)

  // Handle join request
  const handleRequestJoin = () => {
    if (!profile) return

    createProposal('join-collective', organization.chatSlug, {
      targetValue: organization.name,
      targetProfileId: profile.id,
      reason: `${profile.nickname} is requesting to join ${organization.name}`,
    })
  }

  // Handle rename proposal
  const handleProposeRename = () => {
    if (!profile || !newName.trim()) return

    createProposal('collective-rename', organization.chatSlug, {
      targetValue: newName.trim(),
      reason: `Rename collective to "${newName.trim()}"`,
    })

    setNewName('')
    setShowRenameForm(false)
  }

  // Handle voting
  const handleVote = (proposalId: string, vote: 'up' | 'down') => {
    voteOnProposal(proposalId, vote)
  }

  // Handle regenerate invite code
  const handleRegenerateCode = () => {
    if (!userIsPointPerson) return
    regenerateInviteCode(organization.id)
    onOrganizationUpdated?.()
  }

  // Handle promote to point person
  const handlePromoteToPointPerson = (memberId: string) => {
    if (!userIsPointPerson) return
    addPointPerson(organization.id, memberId)
    onOrganizationUpdated?.()
  }

  // Handle remove member
  const handleRemoveMember = (memberId: string) => {
    if (!userIsPointPerson) return
    removeMember(organization.id, memberId)
    onOrganizationUpdated?.()
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-rstu-red">
                {organization.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{organization.name}</h2>
                {!organization.isPublic && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded">
                    Private
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                  {COLLECTIVE_CATEGORY_LABELS[organization.category]}
                </span>
                <span className="text-xs text-gray-500">
                  {organization.memberProfiles.length} member{organization.memberProfiles.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Membership status / Join button */}
        {profile && !userIsMember && organization.isPublic && (
          <button
            onClick={handleRequestJoin}
            className="mt-3 w-full px-4 py-2 text-sm font-medium text-white bg-rstu-red rounded-lg hover:bg-red-700 transition-colors"
          >
            Request to Join
          </button>
        )}

        {userIsPointPerson && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
              Point Person
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mt-4 bg-gray-100 rounded-lg p-1">
          {(['chat', 'members', 'events', 'governance'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {userIsMember ? (
              <>
                {/* Messages area */}
                <div className="flex-1 overflow-hidden">
                  <MessageList
                    messages={messages}
                    isConnected={isConnected}
                    currentUsername={username}
                    onDeleteMessage={deleteMessage}
                    onSendMessage={sendMessage}
                    chatSlug={organization.chatSlug}
                    buildingAddress={organization.name}
                  />
                </div>

                {/* Message input */}
                <MessageInput onSendMessage={sendMessage} isConnected={isConnected} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <h3 className="font-medium text-gray-900 mb-1">Members Only</h3>
                  <p className="text-sm text-gray-500">
                    Join this collective to access the chat.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="flex-1 overflow-y-auto p-4">
            {/* Invite Code Section (Point Persons only) */}
            {userIsPointPerson && !organization.isPublic && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Invite Code</h4>
                    <p className="text-xs text-blue-700 mt-0.5">Share this code to invite new members</p>
                  </div>
                  <button
                    onClick={() => setShowInviteCode(!showInviteCode)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {showInviteCode ? 'Hide' : 'Show'}
                  </button>
                </div>
                {showInviteCode && (
                  <div className="mt-2 flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-white rounded border border-blue-200 text-lg font-mono text-center">
                      {organization.inviteCode || 'No code'}
                    </code>
                    <button
                      onClick={handleRegenerateCode}
                      className="px-3 py-2 text-xs text-blue-600 hover:bg-blue-100 rounded"
                    >
                      Regenerate
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Point Persons */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Point Persons</h3>
              <div className="space-y-2">
                {memberProfiles
                  .filter(p => organization.pointPersons.includes(p.id))
                  .map(member => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      isPointPerson={true}
                      canManage={userIsPointPerson && member.id !== profile?.id}
                      onDemote={() => removePointPerson(organization.id, member.id)}
                      onRemove={() => handleRemoveMember(member.id)}
                    />
                  ))}
              </div>
            </div>

            {/* Regular Members */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Members</h3>
              <div className="space-y-2">
                {memberProfiles
                  .filter(p => !organization.pointPersons.includes(p.id))
                  .map(member => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      isPointPerson={false}
                      canManage={userIsPointPerson}
                      onPromote={() => handlePromoteToPointPerson(member.id)}
                      onRemove={() => handleRemoveMember(member.id)}
                    />
                  ))}
                {memberProfiles.filter(p => !organization.pointPersons.includes(p.id)).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                    No other members yet
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Upcoming Events</h3>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-2">
                  {upcomingEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                  No upcoming events
                </p>
              )}
            </div>

            {/* Coming soon note */}
            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 text-center">
                Event creation for collectives coming soon.
              </p>
            </div>
          </div>
        )}

        {/* Governance Tab */}
        {activeTab === 'governance' && (
          <div className="flex-1 overflow-y-auto p-4">
            {/* Actions */}
            {userIsMember && (
              <div className="mb-4">
                <button
                  onClick={() => setShowRenameForm(true)}
                  className="w-full px-3 py-2 text-xs font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Propose Rename
                </button>
              </div>
            )}

            {/* Rename Form */}
            {showRenameForm && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <label className="block text-xs font-medium text-gray-700 mb-1">New Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter new name..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setShowRenameForm(false)}
                    className="flex-1 px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProposeRename}
                    disabled={!newName.trim()}
                    className="flex-1 px-3 py-1.5 text-xs text-white bg-rstu-red rounded-lg hover:bg-red-700 disabled:bg-gray-300"
                  >
                    Submit Proposal
                  </button>
                </div>
              </div>
            )}

            {/* Active Proposals */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Active Proposals</h3>
              {proposals.length > 0 ? (
                <div className="space-y-2">
                  {proposals.map(proposal => (
                    <ProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      canVote={userIsMember}
                      onVote={handleVote}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                  No active proposals
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Member Card Component
function MemberCard({
  member,
  isPointPerson,
  canManage,
  onPromote,
  onDemote,
  onRemove,
}: {
  member: UserProfile
  isPointPerson: boolean
  canManage: boolean
  onPromote?: () => void
  onDemote?: () => void
  onRemove?: () => void
}) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-600">
            {member.nickname.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{member.nickname}</p>
          {isPointPerson && (
            <span className="text-xs text-amber-600">Point Person</span>
          )}
        </div>
      </div>

      {canManage && (
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {showActions && (
            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {!isPointPerson && onPromote && (
                <button
                  onClick={() => { onPromote(); setShowActions(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Make Point Person
                </button>
              )}
              {isPointPerson && onDemote && (
                <button
                  onClick={() => { onDemote(); setShowActions(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Remove as Point Person
                </button>
              )}
              {onRemove && (
                <button
                  onClick={() => { onRemove(); setShowActions(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Remove from Collective
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Event Card Component
function EventCard({ event }: { event: BuildingEvent }) {
  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-sm text-blue-900">{event.title}</h4>
          <p className="text-xs text-blue-700 mt-0.5">
            {formatEventDateTime(event.dateTime)}
          </p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          event.status === 'confirmed' ? 'bg-green-100 text-green-700' :
          event.status === 'proposed' ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {event.status}
        </span>
      </div>
      {event.location && (
        <p className="text-xs text-blue-600 mt-1">
          {event.location.isVirtual ? 'Virtual' : event.location.name}
        </p>
      )}
    </div>
  )
}

// Proposal Card Component
function ProposalCard({
  proposal,
  canVote,
  onVote,
}: {
  proposal: GovernanceProposal
  canVote: boolean
  onVote: (id: string, vote: 'up' | 'down') => void
}) {
  const userVote = getUserVote(proposal.id)
  const netVotes = proposal.upvotes.length - proposal.downvotes.length
  const threshold = VOTE_THRESHOLDS[proposal.type] || 3

  const getProposalLabel = () => {
    switch (proposal.type) {
      case 'collective-rename':
        return `Rename to "${proposal.targetValue}"`
      case 'join-collective':
        return `Join request`
      case 'add-point-person':
        return 'Promote to Point Person'
      case 'remove-point-person':
        return 'Remove Point Person'
      default:
        return proposal.type
    }
  }

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full capitalize">
            {proposal.type.replace('collective-', '').replace(/-/g, ' ')}
          </span>
          <p className="font-medium text-sm text-gray-900 mt-1">{getProposalLabel()}</p>
          <p className="text-xs text-gray-500 mt-0.5">by {proposal.proposedByName}</p>
        </div>
      </div>

      {proposal.reason && (
        <p className="text-xs text-gray-600 mt-2 italic">{proposal.reason}</p>
      )}

      {/* Vote Progress */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span className={netVotes >= threshold ? 'text-green-600 font-medium' : ''}>
            {netVotes}/{threshold} votes
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${netVotes >= threshold ? 'bg-green-500' : 'bg-rstu-red'}`}
            style={{ width: `${Math.min(100, Math.max(0, (netVotes / threshold) * 100))}%` }}
          />
        </div>
      </div>

      {/* Vote Buttons */}
      {canVote && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onVote(proposal.id, 'up')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${
              userVote === 'up'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-green-50'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            Support ({proposal.upvotes.length})
          </button>
          <button
            onClick={() => onVote(proposal.id, 'down')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${
              userVote === 'down'
                ? 'bg-red-100 text-red-700 border border-red-300'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-red-50'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Oppose ({proposal.downvotes.length})
          </button>
        </div>
      )}
    </div>
  )
}
