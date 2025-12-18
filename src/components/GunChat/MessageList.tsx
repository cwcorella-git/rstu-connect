'use client'

import { useEffect, useRef, useMemo } from 'react'
import { ChatMessage } from '@/hooks/useSocketChat'

interface MessageListProps {
  messages: ChatMessage[]
  isConnected: boolean
  currentUsername?: string
  onDeleteMessage?: (messageId: string, username: string) => void
  onSendMessage?: (text: string, username: string) => void
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

// Check if message is a vote
function isVote(text: string): { proposalId: string; vote: 'up' | 'down' } | null {
  const match = text.match(/^\[VOTE:(up|down):(.+)\]$/)
  if (match) {
    return { vote: match[1] as 'up' | 'down', proposalId: match[2] }
  }
  return null
}

// Generate a stable ID for a proposal based on content
function getProposalId(text: string): string {
  return text.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20).toLowerCase()
}

export function MessageList({ messages, isConnected, currentUsername, onDeleteMessage, onSendMessage }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  // Filter out vote messages from display
  const displayMessages = messages.filter(msg => !isVote(msg.text))

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50 p-4 space-y-3">
      {/* Connection status */}
      <div className="flex items-center justify-center py-2">
        <div className={`flex items-center gap-2 text-xs ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
          {isConnected ? 'Connected to server' : 'Connecting...'}
        </div>
      </div>

      {/* Messages */}
      {displayMessages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm text-center px-8">
          <div>
            <p className="font-medium mb-1">No messages yet</p>
            <p className="text-xs">Start the conversation! Your messages are saved and synced in real-time.</p>
          </div>
        </div>
      ) : (
        displayMessages.map((message) => {
          const isOwnMessage = currentUsername && message.username === currentUsername
          const proposal = isProposal(message.text)

          if (proposal) {
            // Render proposal with special styling and vote buttons
            const proposalId = getProposalId(message.text)
            const votes = votesByProposal[proposalId] || { up: new Set(), down: new Set() }
            const userVote = getUserVote(proposalId)

            return (
              <div
                key={message.id}
                className={`rounded-lg shadow-sm p-3 border-2 ${
                  proposal.type === 'location'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-purple-50 border-purple-200'
                }`}
              >
                <div className="flex items-baseline justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      proposal.type === 'location'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {proposal.type === 'location' ? '📍 LOCATION' : '📅 MEETING'}
                    </span>
                    <span className="font-semibold text-gray-900 text-sm">
                      {message.username}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatTime(message.timestamp)}
                  </span>
                </div>

                <p className="text-gray-800 text-sm font-medium my-2">
                  {proposal.content}
                </p>

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
                    title={currentUsername ? 'Vote yes' : 'Set a username to vote'}
                  >
                    <span>👍</span>
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
                    title={currentUsername ? 'Vote no' : 'Set a username to vote'}
                  >
                    <span>👎</span>
                    <span>{votes.down.size}</span>
                  </button>
                  {votes.up.size > 0 && (
                    <span className="text-xs text-gray-400 ml-auto">
                      {Array.from(votes.up).slice(0, 3).join(', ')}
                      {votes.up.size > 3 && ` +${votes.up.size - 3} more`}
                    </span>
                  )}
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
                  <span className="text-xs text-gray-400">
                    {formatTime(message.timestamp)}
                  </span>
                  {isOwnMessage && onDeleteMessage && (
                    <button
                      onClick={() => onDeleteMessage(message.id, message.username)}
                      className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1"
                      title="Delete message"
                      aria-label="Delete message"
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
