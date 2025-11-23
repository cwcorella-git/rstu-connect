'use client'

import { useState, useEffect, FormEvent } from 'react'

interface MessageInputProps {
  onSendMessage: (text: string, username: string) => void
  isConnected: boolean
}

export function MessageInput({ onSendMessage, isConnected }: MessageInputProps) {
  const [messageText, setMessageText] = useState('')
  const [username, setUsername] = useState('')
  const [usernameInput, setUsernameInput] = useState('')
  const [isUsernameConfirmed, setIsUsernameConfirmed] = useState(false)

  // Load username from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUsername = localStorage.getItem('rstu_chat_username')
      if (savedUsername) {
        setUsername(savedUsername)
        setIsUsernameConfirmed(true)
      }
    }
  }, [])

  const handleUsernameConfirm = () => {
    if (!usernameInput.trim()) {
      alert('Please enter a name')
      return
    }

    const confirmedName = usernameInput.trim()
    setUsername(confirmedName)
    setIsUsernameConfirmed(true)

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('rstu_chat_username', confirmedName)
    }
  }

  const handleUsernameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleUsernameConfirm()
    }
  }

  const handleChangeUsername = () => {
    setIsUsernameConfirmed(false)
    setUsernameInput(username)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!messageText.trim()) return
    if (!isUsernameConfirmed) {
      alert('Please confirm your name first')
      return
    }

    onSendMessage(messageText, username)
    setMessageText('')
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Username input (only show if not confirmed) */}
        {!isUsernameConfirmed && (
          <div>
            <label htmlFor="username" className="block text-xs font-medium text-gray-700 mb-1">
              Your Name (saved locally)
            </label>
            <div className="flex gap-2">
              <input
                id="username"
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                onKeyPress={handleUsernameKeyPress}
                placeholder="Enter your name..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rstu-red focus:border-transparent text-sm"
                maxLength={30}
                autoFocus
              />
              <button
                type="button"
                onClick={handleUsernameConfirm}
                className="px-4 py-2 bg-rstu-red text-white rounded-lg hover:bg-red-700 font-medium text-sm transition-colors"
              >
                Set Name
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Press Enter or click "Set Name" to confirm</p>
          </div>
        )}

        {/* Username display (when confirmed) */}
        {isUsernameConfirmed && (
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              Posting as: <span className="font-semibold text-gray-900">{username}</span>
            </span>
            <button
              type="button"
              onClick={handleChangeUsername}
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
            disabled={!isConnected || !isUsernameConfirmed}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rstu-red focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!isConnected || !messageText.trim() || !isUsernameConfirmed}
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
