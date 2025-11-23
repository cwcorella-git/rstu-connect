'use client'

import { useState } from 'react'
import { clearLocalGunData, clearChatMessages } from '@/lib/gunAdmin'

interface ChatAdminPanelProps {
  chatSlug: string
  onDataCleared?: () => void
}

export function ChatAdminPanel({ chatSlug, onDataCleared }: ChatAdminPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const handleClearLocalData = async () => {
    if (!confirm('Clear all local chat data from your browser? This will reset your username and local message cache. You can still see messages from the server.')) {
      return
    }

    setIsClearing(true)
    await clearLocalGunData()
    setIsClearing(false)

    alert('Local data cleared! Refreshing page...')

    // Notify parent and refresh
    if (onDataCleared) onDataCleared()
    window.location.reload()
  }

  const handleDeleteAllMessages = () => {
    if (!confirm('Delete ALL messages from this chat room? This affects everyone and cannot be undone!')) {
      return
    }

    if (!confirm('Are you ABSOLUTELY sure? This will delete all messages for all users in this building.')) {
      return
    }

    clearChatMessages(chatSlug)
    alert('All messages deleted from chat room. You may need to refresh to see changes.')

    if (onDataCleared) onDataCleared()
  }

  return (
    <div className="border-t border-gray-200 bg-gray-50">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-between"
      >
        <span>⚙️ Admin Tools</span>
        <span className="text-gray-400">{isOpen ? '▼' : '▶'}</span>
      </button>

      {/* Admin panel content */}
      {isOpen && (
        <div className="px-4 py-3 space-y-3 bg-white border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">
            Use these tools if chat is not working properly or to clear data.
          </div>

          {/* Clear local data button */}
          <button
            onClick={handleClearLocalData}
            disabled={isClearing}
            className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isClearing ? 'Clearing...' : '🔄 Clear My Local Data'}
          </button>
          <p className="text-xs text-gray-500">
            Clears your browser's Gun.js cache and resets your username. Use this if chat stops syncing.
          </p>

          {/* Delete all messages button */}
          <button
            onClick={handleDeleteAllMessages}
            className="w-full px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            🗑️ Delete All Messages
          </button>
          <p className="text-xs text-gray-500">
            <strong>Warning:</strong> Deletes all messages for everyone in this chat room. Cannot be undone!
          </p>
        </div>
      )}
    </div>
  )
}
