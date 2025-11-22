'use client'

import { useState, useEffect, FormEvent } from 'react'

interface MessageInputProps {
  onSendMessage: (text: string, username: string) => void
  isConnected: boolean
}

export function MessageInput({ onSendMessage, isConnected }: MessageInputProps) {
  const [messageText, setMessageText] = useState('')
  const [username, setUsername] = useState('')

  // Load username from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUsername = localStorage.getItem('rstu_chat_username')
      if (savedUsername) {
        setUsername(savedUsername)
      }
    }
  }, [])

  // Save username to localStorage when it changes
  useEffect(() => {
    if (username && typeof window !== 'undefined') {
      localStorage.setItem('rstu_chat_username', username)
    }
  }, [username])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!messageText.trim()) return
    if (!username.trim()) {
      alert('Please enter your name')
      return
    }

    onSendMessage(messageText, username)
    setMessageText('')
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Username input (only show if not set) */}
        {!username && (
          <div>
            <label htmlFor="username" className="block text-xs font-medium text-gray-700 mb-1">
              Your Name (saved locally)
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rstu-red focus:border-transparent text-sm"
              maxLength={30}
            />
          </div>
        )}

        {/* Username display (when set) */}
        {username && (
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              Posting as: <span className="font-semibold text-gray-900">{username}</span>
            </span>
            <button
              type="button"
              onClick={() => setUsername('')}
              className="text-rstu-red hover:underline"
            >
              Change name
            </button>
          </div>
        )}

        {/* Message input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected || !username}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rstu-red focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!isConnected || !messageText.trim() || !username}
            className="px-4 py-2 bg-rstu-red text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-sm transition-colors"
          >
            Send
          </button>
        </div>

        {/* Character counter */}
        <div className="text-xs text-gray-400 text-right">
          {messageText.length}/500
        </div>
      </form>
    </div>
  )
}
