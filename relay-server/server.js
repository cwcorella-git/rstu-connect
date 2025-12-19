/**
 * RSTU Socket.IO Relay Server
 *
 * Handles:
 * - Chat messages (per-room persistence)
 * - Profile sync (cross-device)
 * - User list (organizers+)
 * - Role management (admins)
 */

const { createServer } = require('http');
const { Server } = require('socket.io');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// ============================================
// Configuration
// ============================================

const PORT = process.env.PORT || 10000;
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://rstu-connect.neocities.org',
  'https://cwcorella-git.github.io',
];

// ============================================
// Database Setup (sql.js - pure JavaScript SQLite)
// ============================================

let db = null;
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'rstu.db');

async function initDatabase() {
  const SQL = await initSqlJs();

  // Try to load existing database
  try {
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
      console.log('[RSTU Socket.io Relay] Loaded existing database');
    } else {
      db = new SQL.Database();
      console.log('[RSTU Socket.io Relay] Created new database');
    }
  } catch (err) {
    console.warn('[RSTU Socket.io Relay] Could not load database, creating new:', err.message);
    db = new SQL.Database();
  }

  // Initialize tables
  db.run(`
    -- Chat messages
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      room TEXT NOT NULL,
      text TEXT NOT NULL,
      username TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room);
    CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);

    -- User profiles
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      nickname TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'tenant',
      trust_level TEXT NOT NULL DEFAULT 'self_registered',
      building_id TEXT,
      building_address TEXT,
      unit_number TEXT,
      last_active INTEGER,
      created INTEGER,
      data TEXT,
      updated_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
    CREATE INDEX IF NOT EXISTS idx_profiles_building ON profiles(building_id);

    -- Role change audit log
    CREATE TABLE IF NOT EXISTS role_audits (
      id TEXT PRIMARY KEY,
      target_user_id TEXT NOT NULL,
      target_user_nickname TEXT,
      previous_role TEXT NOT NULL,
      new_role TEXT NOT NULL,
      changed_by TEXT NOT NULL,
      changed_by_nickname TEXT,
      reason TEXT,
      timestamp INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_role_audits_target ON role_audits(target_user_id);
    CREATE INDEX IF NOT EXISTS idx_role_audits_timestamp ON role_audits(timestamp);
  `);

  // Save database periodically
  setInterval(saveDatabase, 60000); // Every minute

  console.log('[RSTU Socket.io Relay] Database initialized');
}

function saveDatabase() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
    console.log('[RSTU Socket.io Relay] Database saved');
  } catch (err) {
    console.error('[RSTU Socket.io Relay] Error saving database:', err);
  }
}

// ============================================
// Database Helper Functions
// ============================================

function insertMessage(id, room, text, username, timestamp) {
  db.run(
    'INSERT INTO messages (id, room, text, username, timestamp) VALUES (?, ?, ?, ?, ?)',
    [id, room, text, username, timestamp]
  );
  saveDatabase();
}

function getMessages(room) {
  const stmt = db.prepare('SELECT id, text, username, timestamp FROM messages WHERE room = ? ORDER BY timestamp ASC LIMIT 500');
  stmt.bind([room]);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function deleteMessage(id, room) {
  db.run('DELETE FROM messages WHERE id = ? AND room = ?', [id, room]);
  saveDatabase();
}

function upsertProfile(id, nickname, role, trustLevel, buildingId, buildingAddress, unitNumber, lastActive, created, data, updatedAt) {
  // Check if profile exists
  const existing = getProfile(id);

  if (existing) {
    // Update - preserve server role unless explicitly changed
    db.run(
      `UPDATE profiles SET
        nickname = ?,
        trust_level = ?,
        building_id = ?,
        building_address = ?,
        unit_number = ?,
        last_active = ?,
        data = ?,
        updated_at = ?
      WHERE id = ?`,
      [nickname, trustLevel, buildingId, buildingAddress, unitNumber, lastActive, data, updatedAt, id]
    );
  } else {
    // Insert new
    db.run(
      `INSERT INTO profiles (id, nickname, role, trust_level, building_id, building_address, unit_number, last_active, created, data, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, nickname, role, trustLevel, buildingId, buildingAddress, unitNumber, lastActive, created, data, updatedAt]
    );
  }
  saveDatabase();
}

function getProfile(id) {
  const stmt = db.prepare('SELECT * FROM profiles WHERE id = ?');
  stmt.bind([id]);
  let result = null;
  if (stmt.step()) {
    result = stmt.getAsObject();
  }
  stmt.free();
  return result;
}

function getAllProfiles() {
  const stmt = db.prepare('SELECT id, nickname, role, trust_level, building_id, building_address, unit_number, last_active, created FROM profiles ORDER BY last_active DESC');
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function updateProfileRole(id, newRole, updatedAt) {
  db.run('UPDATE profiles SET role = ?, updated_at = ? WHERE id = ?', [newRole, updatedAt, id]);
  saveDatabase();
}

function insertAudit(id, targetUserId, targetUserNickname, previousRole, newRole, changedBy, changedByNickname, reason, timestamp) {
  db.run(
    `INSERT INTO role_audits (id, target_user_id, target_user_nickname, previous_role, new_role, changed_by, changed_by_nickname, reason, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, targetUserId, targetUserNickname, previousRole, newRole, changedBy, changedByNickname, reason, timestamp]
  );
  saveDatabase();
}

function getAuditLog() {
  const stmt = db.prepare('SELECT * FROM role_audits ORDER BY timestamp DESC LIMIT 100');
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Check if any admin account exists (for one-time bootstrap code)
function checkAdminExists() {
  if (!db) return false;
  const stmt = db.prepare("SELECT COUNT(*) as count FROM profiles WHERE role = 'admin'");
  let count = 0;
  if (stmt.step()) {
    count = stmt.getAsObject().count;
  }
  stmt.free();
  return count > 0;
}

// ============================================
// Server Setup
// ============================================

const httpServer = createServer((req, res) => {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
    return;
  }

  // Check if admin exists (for one-time bootstrap code)
  if (req.url === '/admin-exists') {
    try {
      const adminExists = checkAdminExists();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ exists: adminExists }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ exists: false, error: err.message }));
    }
    return;
  }

  res.writeHead(404);
  res.end();
});

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Track online users
const onlineUsers = new Map(); // socketId -> profileId
const profileSockets = new Map(); // profileId -> Set<socketId>

// ============================================
// Socket.IO Event Handlers
// ============================================

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // ----------------------------------------
  // Chat Events
  // ----------------------------------------

  socket.on('join_room', ({ room }) => {
    if (!room) return;

    socket.join(room);
    console.log(`[Socket.io] ${socket.id} joined room: ${room}`);

    // Send message history
    try {
      const messages = getMessages(room);
      socket.emit('message_history', { messages });
    } catch (err) {
      console.error('[Socket.io] Error fetching messages:', err);
    }
  });

  socket.on('send_message', ({ room, text, username }) => {
    if (!room || !text) return;

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim(),
      username: username || 'Anonymous',
      timestamp: Date.now(),
    };

    try {
      insertMessage(message.id, room, message.text, message.username, message.timestamp);
      io.to(room).emit('new_message', { message });
    } catch (err) {
      console.error('[Socket.io] Error saving message:', err);
    }
  });

  socket.on('delete_message', ({ room, messageId }) => {
    if (!room || !messageId) return;

    try {
      deleteMessage(messageId, room);
      io.to(room).emit('message_deleted', { messageId });
    } catch (err) {
      console.error('[Socket.io] Error deleting message:', err);
    }
  });

  // ----------------------------------------
  // Profile Sync Events
  // ----------------------------------------

  socket.on('profile:sync', ({ profile, deviceId }) => {
    if (!profile || !profile.id) {
      socket.emit('profile:error', { code: 'INVALID', message: 'Invalid profile data' });
      return;
    }

    try {
      const now = Date.now();

      // Upsert profile
      upsertProfile(
        profile.id,
        profile.nickname || 'Anonymous',
        profile.role || 'tenant',
        profile.trustLevel || 'self_registered',
        profile.buildingId || null,
        profile.buildingAddress || null,
        profile.unitNumber || null,
        profile.lastActive || now,
        profile.created || now,
        JSON.stringify(profile),
        now
      );

      // Track online status
      onlineUsers.set(socket.id, profile.id);
      if (!profileSockets.has(profile.id)) {
        profileSockets.set(profile.id, new Set());
      }
      profileSockets.get(profile.id).add(socket.id);

      // Send back synced profile
      const savedProfile = getProfile(profile.id);
      socket.emit('profile:synced', {
        profile: {
          ...profile,
          role: savedProfile?.role || profile.role, // Server role is authoritative
        },
        timestamp: now,
      });

      // Notify organizers of profile update
      io.to('organizers').to('admins').emit('profile:updated', {
        ...profile,
        role: savedProfile?.role || profile.role,
        isOnline: true,
      });

    } catch (err) {
      console.error('[Socket.io] Error syncing profile:', err);
      socket.emit('profile:error', { code: 'SYNC_FAILED', message: err.message });
    }
  });

  // ----------------------------------------
  // User List Events (Organizers+)
  // ----------------------------------------

  socket.on('profile:subscribe', ({ profileId, role }) => {
    if (!role || (role !== 'organizer' && role !== 'admin')) {
      socket.emit('profile:error', { code: 'FORBIDDEN', message: 'Insufficient permissions' });
      return;
    }

    // Join appropriate room
    if (role === 'admin') {
      socket.join('admins');
    }
    socket.join('organizers');

    console.log(`[Socket.io] ${profileId} subscribed to profiles (${role})`);

    // Send profile list
    try {
      const profiles = getAllProfiles().map(p => ({
        ...p,
        id: p.id,
        nickname: p.nickname,
        role: p.role,
        trustLevel: p.trust_level,
        buildingId: p.building_id,
        buildingAddress: p.building_address,
        unitNumber: p.unit_number,
        lastActive: p.last_active,
        created: p.created,
        isOnline: profileSockets.has(p.id) && profileSockets.get(p.id).size > 0,
      }));

      socket.emit('profile:list', {
        profiles,
        totalCount: profiles.length,
      });
    } catch (err) {
      console.error('[Socket.io] Error fetching profiles:', err);
      socket.emit('profile:error', { code: 'FETCH_FAILED', message: err.message });
    }
  });

  socket.on('profile:unsubscribe', () => {
    socket.leave('organizers');
    socket.leave('admins');
  });

  // ----------------------------------------
  // Role Management Events (Admins Only)
  // ----------------------------------------

  socket.on('profile:update_role', ({ adminId, adminNickname, targetId, newRole, reason }) => {
    if (!targetId || !newRole) {
      socket.emit('profile:role_change_response', { success: false, error: 'Missing required fields' });
      return;
    }

    // Verify admin (check from database, not just client claim)
    const adminProfile = getProfile(adminId);
    if (!adminProfile || adminProfile.role !== 'admin') {
      socket.emit('profile:role_change_response', { success: false, error: 'Unauthorized' });
      return;
    }

    // Get target profile
    const targetProfile = getProfile(targetId);
    if (!targetProfile) {
      socket.emit('profile:role_change_response', { success: false, error: 'User not found' });
      return;
    }

    const oldRole = targetProfile.role;
    if (oldRole === newRole) {
      socket.emit('profile:role_change_response', { success: true, targetId, oldRole, newRole });
      return;
    }

    try {
      const now = Date.now();

      // Update role
      updateProfileRole(targetId, newRole, now);

      // Create audit entry
      const auditId = `audit_${now}_${Math.random().toString(36).substr(2, 9)}`;
      insertAudit(
        auditId,
        targetId,
        targetProfile.nickname,
        oldRole,
        newRole,
        adminId,
        adminNickname || 'Unknown',
        reason || null,
        now
      );

      // Notify the admin who made the change
      socket.emit('profile:role_change_response', {
        success: true,
        targetId,
        oldRole,
        newRole,
      });

      // Broadcast to all organizers/admins
      io.to('organizers').to('admins').emit('profile:role_changed', {
        targetId,
        oldRole,
        newRole,
      });

      // Notify the target user directly (if online)
      if (profileSockets.has(targetId)) {
        profileSockets.get(targetId).forEach(socketId => {
          io.to(socketId).emit('profile:role_changed', {
            targetId,
            oldRole,
            newRole,
          });
        });
      }

      console.log(`[Socket.io] Role changed: ${targetId} ${oldRole} -> ${newRole} by ${adminId}`);

    } catch (err) {
      console.error('[Socket.io] Error updating role:', err);
      socket.emit('profile:role_change_response', { success: false, error: err.message });
    }
  });

  // Get audit log
  socket.on('profile:get_audit_log', () => {
    const profileId = onlineUsers.get(socket.id);
    if (!profileId) {
      socket.emit('profile:audit_log', { audits: [] });
      return;
    }

    const profile = getProfile(profileId);
    if (!profile || profile.role !== 'admin') {
      socket.emit('profile:audit_log', { audits: [] });
      return;
    }

    try {
      const audits = getAuditLog().map(a => ({
        id: a.id,
        targetUserId: a.target_user_id,
        targetUserNickname: a.target_user_nickname,
        previousRole: a.previous_role,
        newRole: a.new_role,
        changedBy: a.changed_by,
        changedByNickname: a.changed_by_nickname,
        reason: a.reason,
        timestamp: a.timestamp,
      }));
      socket.emit('profile:audit_log', { audits });
    } catch (err) {
      console.error('[Socket.io] Error fetching audit log:', err);
      socket.emit('profile:audit_log', { audits: [] });
    }
  });

  // ----------------------------------------
  // Disconnect Handling
  // ----------------------------------------

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);

    const profileId = onlineUsers.get(socket.id);
    if (profileId) {
      onlineUsers.delete(socket.id);

      if (profileSockets.has(profileId)) {
        profileSockets.get(profileId).delete(socket.id);

        // If no more sockets for this profile, mark offline
        if (profileSockets.get(profileId).size === 0) {
          profileSockets.delete(profileId);

          // Notify organizers of offline status
          io.to('organizers').to('admins').emit('profile:presence', {
            profileId,
            isOnline: false,
          });
        }
      }
    }
  });
});

// ============================================
// Start Server
// ============================================

async function start() {
  await initDatabase();

  httpServer.listen(PORT, () => {
    console.log(`[RSTU Socket.io Relay] Server started on port ${PORT}`);
    console.log(`[RSTU Socket.io Relay] Health check: http://localhost:${PORT}/health`);
  });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('[RSTU Socket.io Relay] Shutting down...');
  saveDatabase();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[RSTU Socket.io Relay] Shutting down...');
  saveDatabase();
  process.exit(0);
});

start();
