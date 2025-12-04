'use client'

import { io, Socket } from 'socket.io-client'

/**
 * Socket.io Client for RSTU Connect Chat
 *
 * Replaces Gun.js P2P with reliable client-server architecture.
 * Messages persist to server database, providing unlimited history.
 */

let socketInstance: Socket | null = null

export function getSocket(): Socket | null {
  if (typeof window === 'undefined') {
    // Server-side: return null (chat is client-side only)
    return null
  }

  if (!socketInstance) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKETIO_URL || 'http://localhost:8765'

    socketInstance = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      transports: ['websocket', 'polling']
    })

    // Debug: Log connection events
    socketInstance.on('connect', () => {
      console.log('[Socket.io] Connected to server:', socketUrl)
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('[Socket.io] Disconnected:', reason)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('[Socket.io] Connection error:', error)
    })

    socketInstance.on('error', ({ code, message }) => {
      console.error(`[Socket.io] Server error [${code}]:`, message)
    })
  }

  return socketInstance
}
