'use client'
import { createLogger } from './logger'

const log = createLogger('Socketio')

import { io, Socket } from 'socket.io-client'

/**
 * Socket.io Client for RSTU Connect Chat
 *
 * Replaces Gun.js P2P with reliable client-server architecture.
 * Messages persist to server database, providing unlimited history.
 */

let socketInstance: Socket | null = null
let connectionErrorCount = 0
let lastErrorLogTime = 0
const ERROR_LOG_THROTTLE_MS = 30000 // Only log errors every 30 seconds

export function getSocket(): Socket | null {
  if (typeof window === 'undefined') {
    // Server-side: return null (chat is client-side only)
    return null
  }

  if (!socketInstance) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKETIO_URL || 'http://localhost:8765'

    socketInstance = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 30000,  // Back off to 30 seconds max
      reconnectionAttempts: 10,     // Limit retries (stops after ~5 minutes of trying)
      transports: ['websocket', 'polling']
    })

    // Reset error count on successful connection
    socketInstance.on('connect', () => {
      connectionErrorCount = 0
    })

    socketInstance.on('disconnect', () => {
      // Connection lost
    })

    socketInstance.on('connect_error', () => {
      connectionErrorCount++
      const now = Date.now()
      // Throttle error logging to avoid console spam
      if (now - lastErrorLogTime > ERROR_LOG_THROTTLE_MS) {
        lastErrorLogTime = now
        log.warn(`Chat server unavailable (attempt ${connectionErrorCount})`)
      }
    })

    socketInstance.on('error', ({ code, message }) => {
      log.error(`Server error [${code}]:`, message)
    })
  }

  return socketInstance
}

/**
 * Check if the socket has given up reconnecting
 */
export function isSocketUnavailable(): boolean {
  return connectionErrorCount >= 10
}
