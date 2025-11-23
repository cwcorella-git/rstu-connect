'use client'

import { getBuildingChatNode } from './gun'

/**
 * Clear all local Gun.js data from browser
 * This deletes IndexedDB and localStorage used by Gun
 */
export async function clearLocalGunData(): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    // Clear localStorage keys related to Gun
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('gun/') || key.startsWith('radata'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))

    // Also clear our chat username
    localStorage.removeItem('rstu_chat_username')

    // Clear IndexedDB databases used by Gun
    const databases = await window.indexedDB.databases()
    for (const db of databases) {
      if (db.name && (db.name.includes('gun') || db.name.includes('radata'))) {
        window.indexedDB.deleteDatabase(db.name)
      }
    }

    console.log('[Gun Admin] Cleared local Gun.js data')
  } catch (error) {
    console.error('[Gun Admin] Error clearing local data:', error)
  }
}

/**
 * Delete all messages from a specific chat room
 * This removes messages from the Gun graph (affects all peers via relay)
 */
export function clearChatMessages(chatSlug: string): void {
  const chatNode = getBuildingChatNode(chatSlug)
  if (!chatNode) {
    console.error('[Gun Admin] Cannot clear chat: Gun not initialized')
    return
  }

  // Get all messages
  const messagesNode = chatNode.get('messages')

  // Delete each message by setting it to null
  // @ts-ignore - Gun.js has incomplete TypeScript definitions
  messagesNode.map().once((messageData: any, messageId: string) => {
    if (messageData) {
      // Set to null to delete
      // @ts-ignore
      messagesNode.get(messageId).put(null)
    }
  })

  console.log(`[Gun Admin] Cleared all messages for chat: ${chatSlug}`)
}
