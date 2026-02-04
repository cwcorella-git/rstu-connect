'use client'

import { useEffect, useRef, useMemo } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { ChatMessage } from '@/hooks/useSocketChat'
import { GovernanceVoteCard } from '@/components/Chat/GovernanceVoteCard'
import { parseVoteMessage as parseGovVote, parseProposalMessage as parseGovProposal } from '@/lib/storage/governanceStorage'
import {
  parseEventFromChat,
  getEventById,
  formatEventDateTime,
  getEventTypeIcon,
  getRsvpCounts,
  createEvent,
  getAllEvents,
  type EventType
} from '@/lib/storage/eventStorage'

interface MessageListProps {
  messages: ChatMessage[]
  isConnected: boolean
  currentUsername?: string
  onDeleteMessage?: (messageId: string, username: string) => void
  onSendMessage?: (text: string, username: string) => void
  chatSlug?: string
  buildingAddress?: string
}

// Parse meeting suggestion format: [MEETING] Place @ Address | Time | Notes
function parseMeetingProposal(text: string): {
  type: 'meeting'
  location: string
  address?: string
  time: string
  notes?: string
  content: string
} | null {
  if (!text.startsWith('[MEETING]')) return null

  const content = text.replace('[MEETING]', '').trim()
  const parts = content.split(' | ')

  if (parts.length < 2) return null

  // Parse location (may include @ address)
  const locationPart = parts[0]
  const atIndex = locationPart.indexOf(' @ ')
  const location = atIndex > 0 ? locationPart.substring(0, atIndex) : locationPart
  const address = atIndex > 0 ? locationPart.substring(atIndex + 3) : undefined

  return {
    type: 'meeting',
    location,
    address,
    time: parts[1] || '',
    notes: parts[2],
    content
  }
}

// Check if message is a proposal (location or meeting suggestion)
function isProposal(text: string): { type: 'location' | 'meeting'; content: string } | null {
  if (text.startsWith('[LOCATION]')) {
    return { type: 'location', content: text.replace('[LOCATION]', '').trim() }
  }
  if (text.startsWith('[MEETING]')) {
    return { type: 'meeting', content: text.replace('[MEETING]', '').trim() }
  }
  return null
}

// Check if message is an issue report
// Format: [ISSUE:category:title@address] description
function isIssue(text: string): { category: string; title: string; address: string | null; description: string } | null {
  const match = text.match(/^\[ISSUE:([^:]+):([^\]]+)\](.*)$/)
  if (match) {
    // Parse title@address format
    const titlePart = match[2]
    const atIndex = titlePart.lastIndexOf('@')
    const hasAddress = atIndex > 0

    return {
      category: match[1],
      title: hasAddress ? titlePart.substring(0, atIndex) : titlePart,
      address: hasAddress ? titlePart.substring(atIndex + 1) : null,
      description: match[3]?.trim() || ''
    }
  }
  return null
}

// Category translation keys
const CATEGORY_KEYS: Record<string, string> = {
  maintenance: 'issues.maintenance',
  slow_repair: 'issues.slowRepairs',
  rent_increase: 'issues.rentIncrease',
  pests: 'issues.pests',
  mold: 'issues.moldWater',
  hvac: 'issues.hvac',
  plumbing: 'issues.plumbing',
  security: 'issues.security',
  noise: 'issues.noise',
  parking: 'issues.parking',
  management: 'issues.management',
  harassment: 'issues.harassment',
  privacy: 'issues.privacy',
  illegal_fees: 'issues.illegalFees',
  lease_violation: 'issues.leaseViolation',
}

// Check if message is a vote
function isVote(text: string): { proposalId: string; vote: 'up' | 'down' } | null {
  const match = text.match(/^\[VOTE:(up|down):(.+)\]$/)
  if (match) {
    return { vote: match[1] as 'up' | 'down', proposalId: match[2] }
  }
  return null
}

// Check if message is a governance proposal
function isGovernanceProposal(text: string): boolean {
  return text.startsWith('[GOV:') && !text.startsWith('[GOV-VOTE:')
}

// Check if message is a governance vote
function isGovernanceVote(text: string): { proposalId: string; vote: 'up' | 'down' } | null {
  const match = text.match(/^\[GOV-VOTE:(up|down):(.+)\]$/)
  if (match) {
    return { vote: match[1] as 'up' | 'down', proposalId: match[2] }
  }
  return null
}

// Extract proposal ID from governance proposal message
function getGovernanceProposalId(text: string): string | null {
  // Format: [GOV:type:groupId:...] - extract a unique ID
  const match = text.match(/^\[GOV:([^:]+):([^:\]]+)/)
  if (match) {
    return `gov-${match[1]}-${match[2]}`.slice(0, 30).toLowerCase()
  }
  return null
}

// Generate a stable ID for a proposal based on content
function getProposalId(text: string): string {
  return text.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20).toLowerCase()
}

// Parse time description to actual date/time
function parseTimeToTimestamp(timeStr: string): number {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday

  // Default to a week from now at 6pm if we can't parse
  let targetDate = new Date(now)
  targetDate.setDate(targetDate.getDate() + 7)
  targetDate.setHours(18, 0, 0, 0)

  const lowerTime = timeStr.toLowerCase()

  if (lowerTime.includes('weekday evening')) {
    // Next weekday (Mon-Fri) at 6pm
    const daysUntilWeekday = dayOfWeek === 0 ? 1 : dayOfWeek === 6 ? 2 : dayOfWeek === 5 ? 3 : 1
    targetDate = new Date(now)
    targetDate.setDate(targetDate.getDate() + daysUntilWeekday)
    targetDate.setHours(18, 0, 0, 0)
  } else if (lowerTime.includes('weekend morning')) {
    // Next Saturday or Sunday at 10am
    const daysUntilWeekend = dayOfWeek === 0 ? 7 : 6 - dayOfWeek
    targetDate = new Date(now)
    targetDate.setDate(targetDate.getDate() + daysUntilWeekend)
    targetDate.setHours(10, 0, 0, 0)
  } else if (lowerTime.includes('weekend afternoon')) {
    // Next Saturday or Sunday at 2pm
    const daysUntilWeekend = dayOfWeek === 0 ? 7 : 6 - dayOfWeek
    targetDate = new Date(now)
    targetDate.setDate(targetDate.getDate() + daysUntilWeekend)
    targetDate.setHours(14, 0, 0, 0)
  } else {
    // Try to parse custom format like "12/25 at 3pm" or just use default
    const dateMatch = timeStr.match(/(\d{1,2})\/(\d{1,2})/)
    const timeMatch = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i)

    if (dateMatch) {
      targetDate.setMonth(parseInt(dateMatch[1]) - 1)
      targetDate.setDate(parseInt(dateMatch[2]))
      if (targetDate < now) {
        targetDate.setFullYear(targetDate.getFullYear() + 1)
      }
    }

    if (timeMatch) {
      let hours = parseInt(timeMatch[1])
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0
      const isPm = timeMatch[3].toLowerCase() === 'pm'
      if (isPm && hours !== 12) hours += 12
      if (!isPm && hours === 12) hours = 0
      targetDate.setHours(hours, minutes, 0, 0)
    }
  }

  return targetDate.getTime()
}

// Check if an event already exists for a chat message
function eventExistsForMessage(messageId: string): boolean {
  const allEvents = getAllEvents()
  return allEvents.some(e => e.chatMessageId === messageId)
}

export function MessageList({ messages, isConnected, currentUsername, onDeleteMessage, onSendMessage, chatSlug, buildingAddress }: MessageListProps) {
  const { t } = useLanguage()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const createdEventsRef = useRef<Set<string>>(new Set())

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Aggregate votes for proposals
  const votesByProposal = useMemo(() => {
    const votes: Record<string, { up: Set<string>; down: Set<string> }> = {}

    for (const msg of messages) {
      const vote = isVote(msg.text)
      if (vote) {
        if (!votes[vote.proposalId]) {
          votes[vote.proposalId] = { up: new Set(), down: new Set() }
        }
        // Remove from opposite vote set if user changed their vote
        if (vote.vote === 'up') {
          votes[vote.proposalId].down.delete(msg.username)
          votes[vote.proposalId].up.add(msg.username)
        } else {
          votes[vote.proposalId].up.delete(msg.username)
          votes[vote.proposalId].down.add(msg.username)
        }
      }
    }

    return votes
  }, [messages])

  // Aggregate votes for governance proposals
  const govVotesByProposal = useMemo(() => {
    const votes: Record<string, { up: Set<string>; down: Set<string> }> = {}

    for (const msg of messages) {
      const vote = isGovernanceVote(msg.text)
      if (vote) {
        if (!votes[vote.proposalId]) {
          votes[vote.proposalId] = { up: new Set(), down: new Set() }
        }
        if (vote.vote === 'up') {
          votes[vote.proposalId].down.delete(msg.username)
          votes[vote.proposalId].up.add(msg.username)
        } else {
          votes[vote.proposalId].up.delete(msg.username)
          votes[vote.proposalId].down.add(msg.username)
        }
      }
    }

    return votes
  }, [messages])

  // Check if current user has voted on a proposal
  const getUserVote = (proposalId: string): 'up' | 'down' | null => {
    if (!currentUsername) return null
    const votes = votesByProposal[proposalId]
    if (!votes) return null
    if (votes.up.has(currentUsername)) return 'up'
    if (votes.down.has(currentUsername)) return 'down'
    return null
  }

  // Handle vote
  const handleVote = (proposalId: string, vote: 'up' | 'down') => {
    if (!onSendMessage || !currentUsername) return
    onSendMessage(`[VOTE:${vote}:${proposalId}]`, currentUsername)
  }

  // Format timestamp to readable time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Handle governance vote
  const handleGovVote = (proposalId: string, vote: 'up' | 'down') => {
    if (!onSendMessage || !currentUsername) return
    onSendMessage(`[GOV-VOTE:${vote}:${proposalId}]`, currentUsername)
  }

  // Filter out vote messages from display (both regular and governance votes)
  const displayMessages = messages.filter(msg => !isVote(msg.text) && !isGovernanceVote(msg.text))

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50 p-4 space-y-3">
      {/* Connection status */}
      <div className="flex items-center justify-center py-2">
        <div className={`flex items-center gap-2 text-xs ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
          {isConnected ? (t('common.connected') || 'Connected to server') : (t('common.loading') || 'Connecting...')}
        </div>
      </div>

      {/* Messages */}
      {displayMessages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm text-center px-8">
          <div>
            <p className="font-medium mb-1">{t('messages.noMessages') || 'No messages yet'}</p>
            <p className="text-xs">{t('messages.sayHello') || 'Start the conversation! Your messages are saved and synced in real-time.'}</p>
          </div>
        </div>
      ) : (
        displayMessages.map((message) => {
          const isOwnMessage = currentUsername && message.username === currentUsername
          const proposal = isProposal(message.text)
          const issue = isIssue(message.text)

          if (issue) {
            // Render issue with special styling and vote buttons
            const issueId = getProposalId(message.text)
            const votes = votesByProposal[issueId] || { up: new Set(), down: new Set() }
            const userVote = getUserVote(issueId)
            const netVotes = votes.up.size - votes.down.size
            const votesToDemand = 5 - netVotes

            return (
              <div
                key={message.id}
                className="rounded-lg shadow-sm p-3 border-2 bg-red-50 border-red-200"
              >
                <div className="flex items-baseline justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                      ISSUE
                    </span>
                    <span className="text-xs text-gray-500">
                      {CATEGORY_KEYS[issue.category] ? t(CATEGORY_KEYS[issue.category]) : issue.category}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400" suppressHydrationWarning>
                    {formatTime(message.timestamp)}
                  </span>
                </div>

                <p className="text-gray-900 text-sm font-medium my-2">
                  {issue.title}
                </p>
                {issue.description && (
                  <p className="text-gray-600 text-xs mb-2">
                    {issue.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 mb-2">
                  {t('messages.reportedBy')} {message.username}
                  {issue.address && <span> {t('common.at')} {issue.address}</span>}
                </p>

                {/* Vote buttons */}
                <div className="flex items-center gap-3 pt-2 border-t border-red-200">
                  <button
                    onClick={() => handleVote(issueId, 'up')}
                    disabled={!currentUsername || !onSendMessage}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition ${
                      userVote === 'up'
                        ? 'bg-green-100 text-green-700 font-medium'
                        : 'hover:bg-gray-100 text-gray-600'
                    } ${!currentUsername ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={currentUsername ? t('messages.supportIssue') : t('messages.setUsernameToVote')}
                  >
                    <span>+</span>
                    <span>{votes.up.size}</span>
                  </button>
                  <button
                    onClick={() => handleVote(issueId, 'down')}
                    disabled={!currentUsername || !onSendMessage}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition ${
                      userVote === 'down'
                        ? 'bg-red-100 text-red-700 font-medium'
                        : 'hover:bg-gray-100 text-gray-600'
                    } ${!currentUsername ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={currentUsername ? t('messages.opposeIssue') : t('messages.setUsernameToVote')}
                  >
                    <span>-</span>
                    <span>{votes.down.size}</span>
                  </button>
                  <span className={`text-xs ml-auto ${netVotes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {netVotes >= 0 ? '+' : ''}{netVotes}
                    {netVotes >= 5 ? (
                      <span className="text-green-700 font-medium ml-1">{t('messages.demand')}</span>
                    ) : votesToDemand > 0 ? (
                      <span className="text-gray-400 ml-1">({t('messages.moreToDemand', { count: votesToDemand })})</span>
                    ) : null}
                  </span>
                </div>
              </div>
            )
          }

          if (proposal) {
            // Render proposal with special styling and vote buttons
            const proposalId = getProposalId(message.text)
            const votes = votesByProposal[proposalId] || { up: new Set(), down: new Set() }
            const userVote = getUserVote(proposalId)
            const netVotes = votes.up.size - votes.down.size
            const votesNeeded = 3 - netVotes
            const isApproved = netVotes >= 3

            // Parse meeting details if it's a meeting proposal
            const meetingDetails = proposal.type === 'meeting' ? parseMeetingProposal(message.text) : null

            return (
              <div
                key={message.id}
                className={`rounded-lg shadow-sm p-3 border-2 ${
                  isApproved
                    ? 'bg-green-50 border-green-300'
                    : proposal.type === 'location'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-purple-50 border-purple-200'
                }`}
              >
                <div className="flex items-baseline justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      isApproved
                        ? 'bg-green-100 text-green-700'
                        : proposal.type === 'location'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                    }`}>
                      {isApproved ? `✓ ${t('messages.approved').toUpperCase()}` : proposal.type === 'location' ? `📍 ${t('messages.location').toUpperCase()}` : `📅 ${t('messages.meeting').toUpperCase()}`}
                    </span>
                    <span className="text-xs text-gray-500">
                      {t('common.by')} {message.username}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400" suppressHydrationWarning>
                    {formatTime(message.timestamp)}
                  </span>
                </div>

                {/* Meeting details - parsed nicely */}
                {meetingDetails ? (
                  <div className="my-2 space-y-1">
                    <p className="text-gray-900 text-sm font-semibold flex items-center gap-1">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {meetingDetails.location}
                    </p>
                    {meetingDetails.address && (
                      <p className="text-gray-600 text-xs pl-5">{meetingDetails.address}</p>
                    )}
                    <p className="text-gray-700 text-sm flex items-center gap-1">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {meetingDetails.time}
                    </p>
                    {meetingDetails.notes && (
                      <p className="text-gray-600 text-xs pl-5 italic">{meetingDetails.notes}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-800 text-sm font-medium my-2">
                    {proposal.content}
                  </p>
                )}

                {/* Status message */}
                {isApproved && proposal.type === 'meeting' && (
                  <div className="bg-green-100 rounded px-2 py-1 text-xs text-green-700 mb-2">
                    {t('messages.addedToCalendar')}
                  </div>
                )}

                {/* Vote buttons */}
                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => handleVote(proposalId, 'up')}
                    disabled={!currentUsername || !onSendMessage}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition ${
                      userVote === 'up'
                        ? 'bg-green-100 text-green-700 font-medium'
                        : 'hover:bg-gray-100 text-gray-600'
                    } ${!currentUsername ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={currentUsername ? t('messages.voteYes') : t('messages.setUsernameToVote')}
                  >
                    <span>+</span>
                    <span>{votes.up.size}</span>
                  </button>
                  <button
                    onClick={() => handleVote(proposalId, 'down')}
                    disabled={!currentUsername || !onSendMessage}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition ${
                      userVote === 'down'
                        ? 'bg-red-100 text-red-700 font-medium'
                        : 'hover:bg-gray-100 text-gray-600'
                    } ${!currentUsername ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={currentUsername ? t('messages.voteNo') : t('messages.setUsernameToVote')}
                  >
                    <span>-</span>
                    <span>{votes.down.size}</span>
                  </button>
                  <span className={`text-xs ml-auto ${isApproved ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                    {isApproved ? (
                      t('messages.approvedExclaim')
                    ) : votesNeeded > 0 ? (
                      t('messages.moreToApprove', { count: votesNeeded })
                    ) : null}
                  </span>
                </div>
              </div>
            )
          }

          // Check for governance proposal
          if (isGovernanceProposal(message.text)) {
            const proposalId = getGovernanceProposalId(message.text)
            if (proposalId) {
              const govVotes = govVotesByProposal[proposalId] || { up: new Set(), down: new Set() }
              return (
                <GovernanceVoteCard
                  key={message.id}
                  proposalId={proposalId}
                  upvotes={govVotes.up}
                  downvotes={govVotes.down}
                  currentUsername={currentUsername}
                  onVote={handleGovVote}
                />
              )
            }
          }

          // Check for event announcement
          const eventData = parseEventFromChat(message.text)
          if (eventData) {
            const event = getEventById(eventData.eventId)
            const counts = event ? getRsvpCounts(event) : { yes: 0, no: 0, maybe: 0 }

            return (
              <div
                key={message.id}
                className="rounded-lg shadow-sm p-3 border-2 bg-green-50 border-green-200"
              >
                <div className="flex items-baseline justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getEventTypeIcon(eventData.type)}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-100 text-green-700 uppercase">
                      Event
                    </span>
                  </div>
                  <span className="text-xs text-gray-400" suppressHydrationWarning>
                    {formatTime(message.timestamp)}
                  </span>
                </div>

                <p className="text-gray-900 text-sm font-semibold my-2">
                  {eventData.title}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatEventDateTime(eventData.dateTime)}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {eventData.location}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-green-200">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-green-600">
                      <span className="font-medium">{counts.yes}</span> {t('events.going')}
                    </span>
                    {counts.maybe > 0 && (
                      <span className="text-yellow-600">
                        <span className="font-medium">{counts.maybe}</span> {t('events.maybe')}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {t('common.by')} {message.username}
                  </span>
                </div>
              </div>
            )
          }

          // Regular message
          return (
            <div key={message.id} className="bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow group">
              <div className="flex items-baseline justify-between mb-1">
                <span className="font-semibold text-gray-900 text-sm">
                  {message.username}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400" suppressHydrationWarning>
                    {formatTime(message.timestamp)}
                  </span>
                  {isOwnMessage && onDeleteMessage && (
                    <button
                      onClick={() => onDeleteMessage(message.id, message.username)}
                      className="text-gray-400 hover:text-red-600 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity text-xs px-1 min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title={t('messages.deleteMessage')}
                      aria-label={t('messages.deleteMessage')}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap break-words">
                {message.text}
              </p>
            </div>
          )
        })
      )}

      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  )
}
