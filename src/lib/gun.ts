'use client'

import Gun from 'gun'

/**
 * Gun.js P2P Database Initialization
 *
 * This creates a decentralized peer-to-peer database for tenant organizing chat.
 * No central server required - messages sync across all peers in real-time.
 */

// Configure Gun with RSTU self-hosted relay peer
// Using our own Render.com relay + local storage for offline-first functionality
const gunConfig = {
  peers: [
    // RSTU Gun relay server (hosted on Render.com free tier)
    'https://rstu-gun-relay.onrender.com/gun',
  ],
  // Local storage for offline-first functionality
  // Data stored in browser IndexedDB
  localStorage: true,
  radisk: true,
}

// Create singleton Gun instance
let gunInstance: ReturnType<typeof Gun> | null = null

export function getGun() {
  if (typeof window === 'undefined') {
    // Server-side: return mock Gun instance
    return null
  }

  if (!gunInstance) {
    gunInstance = Gun(gunConfig)

    // Debug: Log peer connection status
    console.log('[Gun.js] Initializing with peers:', gunConfig.peers)

    // @ts-ignore - Gun.js peer debugging
    const peers = gunInstance.back('opt.peers')
    if (peers) {
      Object.keys(peers).forEach(peerUrl => {
        const peer = peers[peerUrl]
        console.log(`[Gun.js] Peer ${peerUrl}:`, peer ? 'connected' : 'failed')
      })
    }
  }

  return gunInstance
}

/**
 * Get Gun graph for a specific building's chat room
 * Each building gets its own isolated chat space
 */
export function getBuildingChatNode(chatSlug: string) {
  const gun = getGun()
  if (!gun) return null

  // Create unique graph path for this building
  // Format: rstu/chat/{chatSlug}
  // @ts-ignore - Gun.js has incomplete TypeScript definitions
  return gun.get('rstu').get('chat').get(chatSlug)
}
