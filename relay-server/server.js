const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const Database = require('better-sqlite3')
const { v4: uuidv4 } = require('uuid')

const app = express()
const server = createServer(app)

// CORS configuration for GitHub Pages static site
const io = new Server(server, {
  cors: {
    origin: [
      'https://cwcorella-git.github.io',       // NEW: GitHub Pages production
      'https://rstu-connect.neocities.org',    // OLD: Keep temporarily for rollback
      'http://localhost:3000'                  // DEV: Local development
    ],
    methods: ['GET', 'POST'],
    credentials: false
  }
})

// Initialize SQLite database
const db = new Database('./chat_messages.db')

// Create schema on startup
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    room TEXT NOT NULL,
    text TEXT NOT NULL,
    username TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_messages_room_timestamp
    ON messages(room, timestamp DESC);

  CREATE INDEX IF NOT EXISTS idx_messages_username
    ON messages(room, username);
`)

console.log('[RSTU Socket.io Relay] Database initialized')

// Prepared statements for performance
const insertMessage = db.prepare(`
  INSERT INTO messages (id, room, text, username, timestamp)
  VALUES (?, ?, ?, ?, ?)
`)

const getMessagesByRoom = db.prepare(`
  SELECT id, room, text, username, timestamp
  FROM messages
  WHERE room = ?
  ORDER BY timestamp ASC
  LIMIT 1000
`)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'RSTU Socket.io Relay',
    timestamp: Date.now()
  })
})

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`)

  // Join a chat room
  socket.on('join_room', ({ room }) => {
    if (!room) {
      socket.emit('error', { code: 'INVALID_ROOM', message: 'Room name required' })
      return
    }

    // Join Socket.io room
    socket.join(room)
    console.log(`[Socket.io] ${socket.id} joined room: ${room}`)

    // Send message history
    try {
      const messages = getMessagesByRoom.all(room)
      socket.emit('message_history', { messages })
      console.log(`[Socket.io] Sent ${messages.length} messages to ${socket.id}`)
    } catch (error) {
      console.error('[Socket.io] Error fetching message history:', error)
      socket.emit('error', { code: 'DB_ERROR', message: 'Failed to load messages' })
    }
  })

  // Send message
  socket.on('send_message', ({ room, text, username }) => {
    // Validation
    if (!room || !text || !username) {
      socket.emit('error', { code: 'INVALID_MESSAGE', message: 'Missing required fields' })
      return
    }

    if (text.length > 500) {
      socket.emit('error', { code: 'MESSAGE_TOO_LONG', message: 'Message exceeds 500 characters' })
      return
    }

    if (username.length > 30) {
      socket.emit('error', { code: 'USERNAME_TOO_LONG', message: 'Username exceeds 30 characters' })
      return
    }

    // Create message
    const message = {
      id: uuidv4(),
      room,
      text: text.trim(),
      username: username.trim(),
      timestamp: Date.now()
    }

    // Save to database
    try {
      insertMessage.run(message.id, message.room, message.text, message.username, message.timestamp)
      console.log(`[Socket.io] Saved message ${message.id} to room ${room}`)

      // Broadcast to all clients in room (including sender)
      io.to(room).emit('new_message', { message })
    } catch (error) {
      console.error('[Socket.io] Error saving message:', error)
      socket.emit('error', { code: 'DB_ERROR', message: 'Failed to save message' })
    }
  })

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`)
  })
})

// Start server
const port = process.env.PORT || 8765
server.listen(port, () => {
  console.log(`[RSTU Socket.io Relay] Server started on port ${port}`)
  console.log(`[RSTU Socket.io Relay] Health check: http://localhost:${port}/health`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[RSTU Socket.io Relay] Shutting down gracefully...')
  db.close()
  server.close(() => {
    console.log('[RSTU Socket.io Relay] Server closed')
    process.exit(0)
  })
})
