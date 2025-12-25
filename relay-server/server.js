/**
 * RSTU Socket.IO Relay Server
 *
 * Handles:
 * - Chat messages (per-room persistence)
 * - Direct messages (1:1, groups, blocs)
 * - Profile sync (cross-device)
 * - User list (organizers+)
 * - Role management (admins)
 */

const { createServer } = require('http');
const { Server } = require('socket.io');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const webpush = require('web-push');

// ============================================
// Configuration
// ============================================

const PORT = process.env.PORT || 10000;

// VAPID keys for web push (generate with: npx web-push generate-vapid-keys)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BH5qbRwr6El_ccyQplmhsVHaitlpPmZMGBuv7VNl0hFIah5iIfM7W_Q3P4GpSMeM--tdY0wpLL6fM8LszhyinoE';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'xLL4V50C8np0YvfHxgmK5v-N--xcXO0JIThpTIoo-VI';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:contact@renosparkstenantsunion.org';

// Configure web-push
webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
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

    -- Direct message threads
    CREATE TABLE IF NOT EXISTS dm_threads (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      participants TEXT NOT NULL,
      participant_names TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      bloc_id TEXT,
      name TEXT,
      last_message_id TEXT,
      last_message_text TEXT,
      last_message_sender_id TEXT,
      last_message_sender_name TEXT,
      last_message_timestamp INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_dm_threads_participants ON dm_threads(participants);

    -- Direct messages
    CREATE TABLE IF NOT EXISTS direct_messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      text TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      read_by TEXT DEFAULT '[]'
    );
    CREATE INDEX IF NOT EXISTS idx_dm_thread ON direct_messages(thread_id);
    CREATE INDEX IF NOT EXISTS idx_dm_timestamp ON direct_messages(timestamp);

    -- Push notification subscriptions
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      endpoint TEXT NOT NULL UNIQUE,
      keys TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      settings TEXT DEFAULT '{}'
    );
    CREATE INDEX IF NOT EXISTS idx_push_profile ON push_subscriptions(profile_id);

    -- Elections
    CREATE TABLE IF NOT EXISTS elections (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_elections_status ON elections(status);

    -- Nominations
    CREATE TABLE IF NOT EXISTS nominations (
      id TEXT PRIMARY KEY,
      election_id TEXT NOT NULL,
      position_id TEXT NOT NULL,
      nominee_id TEXT NOT NULL,
      data TEXT NOT NULL,
      accepted INTEGER,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_nominations_election ON nominations(election_id);
    CREATE INDEX IF NOT EXISTS idx_nominations_nominee ON nominations(nominee_id);

    -- Votes
    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      election_id TEXT NOT NULL,
      position_id TEXT NOT NULL,
      voter_id TEXT NOT NULL,
      candidate_id TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      UNIQUE(election_id, position_id, voter_id)
    );
    CREATE INDEX IF NOT EXISTS idx_votes_election ON votes(election_id);
    CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter_id);

    -- Tasks
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'todo',
      campaign_id TEXT,
      building_id TEXT,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_campaign ON tasks(campaign_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_building ON tasks(building_id);
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

// ============================================
// DM Database Helper Functions
// ============================================

function upsertDMThread(thread) {
  const existing = getDMThread(thread.id);

  if (existing) {
    // Update existing thread
    db.run(
      `UPDATE dm_threads SET
        participants = ?,
        participant_names = ?,
        name = ?,
        last_message_id = ?,
        last_message_text = ?,
        last_message_sender_id = ?,
        last_message_sender_name = ?,
        last_message_timestamp = ?
      WHERE id = ?`,
      [
        JSON.stringify(thread.participants),
        JSON.stringify(thread.participantNames),
        thread.name || null,
        thread.lastMessage?.id || null,
        thread.lastMessage?.text || null,
        thread.lastMessage?.senderId || null,
        thread.lastMessage?.senderName || null,
        thread.lastMessage?.timestamp || null,
        thread.id
      ]
    );
  } else {
    // Insert new thread
    db.run(
      `INSERT INTO dm_threads (id, type, participants, participant_names, created_by, created_at, bloc_id, name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        thread.id,
        thread.type,
        JSON.stringify(thread.participants),
        JSON.stringify(thread.participantNames),
        thread.createdBy,
        thread.createdAt,
        thread.blocId || null,
        thread.name || null
      ]
    );
  }
  saveDatabase();
}

function getDMThread(threadId) {
  const stmt = db.prepare('SELECT * FROM dm_threads WHERE id = ?');
  stmt.bind([threadId]);
  let result = null;
  if (stmt.step()) {
    const row = stmt.getAsObject();
    result = {
      id: row.id,
      type: row.type,
      participants: JSON.parse(row.participants),
      participantNames: JSON.parse(row.participant_names),
      createdBy: row.created_by,
      createdAt: row.created_at,
      blocId: row.bloc_id,
      name: row.name,
      lastMessage: row.last_message_id ? {
        id: row.last_message_id,
        text: row.last_message_text,
        senderId: row.last_message_sender_id,
        senderName: row.last_message_sender_name,
        timestamp: row.last_message_timestamp
      } : null
    };
  }
  stmt.free();
  return result;
}

function getThreadsForUser(profileId) {
  const stmt = db.prepare('SELECT * FROM dm_threads ORDER BY COALESCE(last_message_timestamp, created_at) DESC');
  const results = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    const participants = JSON.parse(row.participants);
    if (participants.includes(profileId)) {
      results.push({
        id: row.id,
        type: row.type,
        participants,
        participantNames: JSON.parse(row.participant_names),
        createdBy: row.created_by,
        createdAt: row.created_at,
        blocId: row.bloc_id,
        name: row.name,
        lastMessage: row.last_message_id ? {
          id: row.last_message_id,
          text: row.last_message_text,
          senderId: row.last_message_sender_id,
          senderName: row.last_message_sender_name,
          timestamp: row.last_message_timestamp
        } : null,
        unreadCount: 0 // Will be calculated from messages
      });
    }
  }
  stmt.free();

  // Calculate unread counts
  results.forEach(thread => {
    thread.unreadCount = getUnreadCount(thread.id, profileId);
  });

  return results;
}

function insertDMMessage(message) {
  db.run(
    `INSERT INTO direct_messages (id, thread_id, sender_id, sender_name, text, timestamp, read_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [message.id, message.threadId, message.senderId, message.senderName, message.text, message.timestamp, JSON.stringify(message.readBy)]
  );

  // Update thread's last message
  db.run(
    `UPDATE dm_threads SET
      last_message_id = ?,
      last_message_text = ?,
      last_message_sender_id = ?,
      last_message_sender_name = ?,
      last_message_timestamp = ?
    WHERE id = ?`,
    [message.id, message.text, message.senderId, message.senderName, message.timestamp, message.threadId]
  );

  saveDatabase();
}

function getDMMessages(threadId, limit = 100, offset = 0) {
  const stmt = db.prepare(
    'SELECT * FROM direct_messages WHERE thread_id = ? ORDER BY timestamp ASC LIMIT ? OFFSET ?'
  );
  stmt.bind([threadId, limit, offset]);
  const results = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push({
      id: row.id,
      threadId: row.thread_id,
      senderId: row.sender_id,
      senderName: row.sender_name,
      text: row.text,
      timestamp: row.timestamp,
      readBy: JSON.parse(row.read_by)
    });
  }
  stmt.free();
  return results;
}

function markMessagesAsRead(threadId, profileId) {
  // Get all unread messages for this user in this thread
  const stmt = db.prepare(
    'SELECT id, read_by FROM direct_messages WHERE thread_id = ?'
  );
  stmt.bind([threadId]);

  const updates = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    const readBy = JSON.parse(row.read_by);
    if (!readBy.includes(profileId)) {
      readBy.push(profileId);
      updates.push({ id: row.id, readBy: JSON.stringify(readBy) });
    }
  }
  stmt.free();

  // Update each message
  updates.forEach(({ id, readBy }) => {
    db.run('UPDATE direct_messages SET read_by = ? WHERE id = ?', [readBy, id]);
  });

  if (updates.length > 0) {
    saveDatabase();
  }

  return updates.length;
}

function getUnreadCount(threadId, profileId) {
  const stmt = db.prepare(
    'SELECT COUNT(*) as count FROM direct_messages WHERE thread_id = ? AND sender_id != ?'
  );
  stmt.bind([threadId, profileId]);
  let total = 0;
  if (stmt.step()) {
    total = stmt.getAsObject().count;
  }
  stmt.free();

  // Subtract messages already read
  const readStmt = db.prepare(
    'SELECT read_by FROM direct_messages WHERE thread_id = ? AND sender_id != ?'
  );
  readStmt.bind([threadId, profileId]);
  let readCount = 0;
  while (readStmt.step()) {
    const readBy = JSON.parse(readStmt.getAsObject().read_by);
    if (readBy.includes(profileId)) {
      readCount++;
    }
  }
  readStmt.free();

  return total - readCount;
}

// ============================================
// Push Notification Helper Functions
// ============================================

function savePushSubscription(profileId, subscription, settings = {}) {
  const id = `push-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Remove existing subscription with same endpoint
  db.run('DELETE FROM push_subscriptions WHERE endpoint = ?', [subscription.endpoint]);

  db.run(
    `INSERT INTO push_subscriptions (id, profile_id, endpoint, keys, created_at, settings)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, profileId, subscription.endpoint, JSON.stringify(subscription.keys), Date.now(), JSON.stringify(settings)]
  );
  saveDatabase();
  return id;
}

function removePushSubscription(endpoint) {
  db.run('DELETE FROM push_subscriptions WHERE endpoint = ?', [endpoint]);
  saveDatabase();
}

function getPushSubscriptionsForProfile(profileId) {
  const stmt = db.prepare('SELECT * FROM push_subscriptions WHERE profile_id = ?');
  stmt.bind([profileId]);
  const results = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push({
      id: row.id,
      profileId: row.profile_id,
      endpoint: row.endpoint,
      keys: JSON.parse(row.keys),
      createdAt: row.created_at,
      settings: JSON.parse(row.settings || '{}')
    });
  }
  stmt.free();
  return results;
}

function getAllPushSubscriptions() {
  const stmt = db.prepare('SELECT * FROM push_subscriptions');
  const results = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push({
      id: row.id,
      profileId: row.profile_id,
      endpoint: row.endpoint,
      keys: JSON.parse(row.keys),
      createdAt: row.created_at,
      settings: JSON.parse(row.settings || '{}')
    });
  }
  stmt.free();
  return results;
}

async function sendPushNotification(profileId, notification) {
  const subscriptions = getPushSubscriptionsForProfile(profileId);

  const payload = JSON.stringify({
    title: notification.title,
    body: notification.body,
    icon: '/rstu-connect/icon-192.png',
    badge: '/rstu-connect/badge-72.png',
    tag: notification.tag || 'rstu-notification',
    data: notification.data || {}
  });

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      // Check if this notification type is enabled
      const settings = sub.settings || {};
      const notifType = notification.data?.type || 'other';
      if (settings[notifType] === false) {
        return { skipped: true, reason: 'disabled' };
      }

      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        );
        return { success: true };
      } catch (err) {
        // Remove invalid subscriptions (410 Gone)
        if (err.statusCode === 410) {
          removePushSubscription(sub.endpoint);
          console.log(`[Push] Removed expired subscription for ${profileId}`);
        }
        throw err;
      }
    })
  );

  const successful = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
  console.log(`[Push] Sent to ${successful}/${subscriptions.length} devices for ${profileId}`);
  return successful;
}

async function sendPushToMultiple(profileIds, notification) {
  const results = await Promise.allSettled(
    profileIds.map(profileId => sendPushNotification(profileId, notification))
  );
  return results.filter(r => r.status === 'fulfilled').length;
}

// Parse @mentions from message text
function parseMentions(text) {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1].toLowerCase());
  }
  return mentions;
}

// Find profiles by nickname (case-insensitive)
function findProfilesByNickname(nicknames) {
  if (nicknames.length === 0) return [];

  const placeholders = nicknames.map(() => '?').join(',');
  const stmt = db.prepare(
    `SELECT id, nickname FROM profiles WHERE LOWER(nickname) IN (${placeholders})`
  );
  stmt.bind(nicknames.map(n => n.toLowerCase()));

  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// ============================================
// Election Helper Functions
// ============================================

function upsertElection(election) {
  const existing = getElection(election.id);
  const dataJson = JSON.stringify(election);

  if (existing) {
    db.run(
      'UPDATE elections SET data = ?, status = ? WHERE id = ?',
      [dataJson, election.status, election.id]
    );
  } else {
    db.run(
      'INSERT INTO elections (id, data, status, created_at) VALUES (?, ?, ?, ?)',
      [election.id, dataJson, election.status, election.createdAt]
    );
  }
  saveDatabase();
}

function getElection(electionId) {
  const stmt = db.prepare('SELECT * FROM elections WHERE id = ?');
  stmt.bind([electionId]);
  let result = null;
  if (stmt.step()) {
    const row = stmt.getAsObject();
    result = JSON.parse(row.data);
  }
  stmt.free();
  return result;
}

function getAllElections() {
  const stmt = db.prepare('SELECT * FROM elections ORDER BY created_at DESC');
  const results = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(JSON.parse(row.data));
  }
  stmt.free();
  return results;
}

function getActiveElection() {
  const now = Date.now();
  const elections = getAllElections();
  return elections.find(e =>
    e.status === 'nominations' || e.status === 'voting' ||
    (e.status !== 'closed' && e.nominationStart <= now && now < e.votingEnd)
  ) || null;
}

function upsertNomination(nomination) {
  const existing = getNomination(nomination.id);
  const dataJson = JSON.stringify(nomination);
  const accepted = nomination.accepted === true ? 1 : (nomination.accepted === false ? 0 : null);

  if (existing) {
    db.run(
      'UPDATE nominations SET data = ?, accepted = ? WHERE id = ?',
      [dataJson, accepted, nomination.id]
    );
  } else {
    db.run(
      'INSERT INTO nominations (id, election_id, position_id, nominee_id, data, accepted, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nomination.id, nomination.electionId, nomination.positionId, nomination.nomineeId, dataJson, accepted, nomination.createdAt]
    );
  }
  saveDatabase();
}

function getNomination(nominationId) {
  const stmt = db.prepare('SELECT * FROM nominations WHERE id = ?');
  stmt.bind([nominationId]);
  let result = null;
  if (stmt.step()) {
    const row = stmt.getAsObject();
    result = JSON.parse(row.data);
  }
  stmt.free();
  return result;
}

function getNominationsForElection(electionId) {
  const stmt = db.prepare('SELECT * FROM nominations WHERE election_id = ? ORDER BY created_at ASC');
  stmt.bind([electionId]);
  const results = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(JSON.parse(row.data));
  }
  stmt.free();
  return results;
}

function getNominationsForPosition(electionId, positionId) {
  const stmt = db.prepare('SELECT * FROM nominations WHERE election_id = ? AND position_id = ? AND accepted = 1 ORDER BY created_at ASC');
  stmt.bind([electionId, positionId]);
  const results = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(JSON.parse(row.data));
  }
  stmt.free();
  return results;
}

function insertVote(vote) {
  try {
    db.run(
      'INSERT INTO votes (id, election_id, position_id, voter_id, candidate_id, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
      [vote.id, vote.electionId, vote.positionId, vote.voterId, vote.candidateId, vote.timestamp]
    );
    saveDatabase();
    return true;
  } catch (err) {
    // Unique constraint violation means already voted
    return false;
  }
}

function getVotesForElection(electionId) {
  const stmt = db.prepare('SELECT * FROM votes WHERE election_id = ? ORDER BY timestamp ASC');
  stmt.bind([electionId]);
  const results = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push({
      id: row.id,
      electionId: row.election_id,
      positionId: row.position_id,
      voterId: row.voter_id,
      candidateId: row.candidate_id,
      timestamp: row.timestamp
    });
  }
  stmt.free();
  return results;
}

function getUserVotesForElection(electionId, voterId) {
  const stmt = db.prepare('SELECT * FROM votes WHERE election_id = ? AND voter_id = ?');
  stmt.bind([electionId, voterId]);
  const results = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push({
      id: row.id,
      electionId: row.election_id,
      positionId: row.position_id,
      voterId: row.voter_id,
      candidateId: row.candidate_id,
      timestamp: row.timestamp
    });
  }
  stmt.free();
  return results;
}

function hasVotedForPosition(electionId, positionId, voterId) {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM votes WHERE election_id = ? AND position_id = ? AND voter_id = ?');
  stmt.bind([electionId, positionId, voterId]);
  let count = 0;
  if (stmt.step()) {
    count = stmt.getAsObject().count;
  }
  stmt.free();
  return count > 0;
}

// ============================================
// Task Helper Functions
// ============================================

function upsertTask(task) {
  const existing = getTask(task.id);
  const dataJson = JSON.stringify(task);
  const now = Date.now();

  if (existing) {
    db.run(
      'UPDATE tasks SET status = ?, campaign_id = ?, building_id = ?, data = ?, updated_at = ? WHERE id = ?',
      [task.status, task.campaignId || null, task.buildingId || null, dataJson, now, task.id]
    );
  } else {
    db.run(
      'INSERT INTO tasks (id, status, campaign_id, building_id, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [task.id, task.status, task.campaignId || null, task.buildingId || null, dataJson, task.createdAt || now, now]
    );
  }
  saveDatabase();
}

function getTask(taskId) {
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  stmt.bind([taskId]);
  let result = null;
  if (stmt.step()) {
    const row = stmt.getAsObject();
    result = JSON.parse(row.data);
  }
  stmt.free();
  return result;
}

function getAllTasks() {
  const stmt = db.prepare('SELECT * FROM tasks ORDER BY updated_at DESC');
  const results = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(JSON.parse(row.data));
  }
  stmt.free();
  return results;
}

function getTasksByCampaign(campaignId) {
  const stmt = db.prepare('SELECT * FROM tasks WHERE campaign_id = ? ORDER BY updated_at DESC');
  stmt.bind([campaignId]);
  const results = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(JSON.parse(row.data));
  }
  stmt.free();
  return results;
}

function getTasksByBuilding(buildingId) {
  const stmt = db.prepare('SELECT * FROM tasks WHERE building_id = ? ORDER BY updated_at DESC');
  stmt.bind([buildingId]);
  const results = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(JSON.parse(row.data));
  }
  stmt.free();
  return results;
}

function getTasksByAssignee(profileId) {
  // Need to search within JSON data for assigneeIds
  const allTasks = getAllTasks();
  return allTasks.filter(t => t.assigneeIds && t.assigneeIds.includes(profileId));
}

function deleteTask(taskId) {
  db.run('DELETE FROM tasks WHERE id = ?', [taskId]);
  saveDatabase();
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

  // Get VAPID public key for push subscriptions
  if (req.url === '/vapid-public-key') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ publicKey: VAPID_PUBLIC_KEY }));
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

  socket.on('send_message', async ({ room, text, username }) => {
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

      // Check for @mentions and send push notifications
      const mentions = parseMentions(message.text);
      if (mentions.length > 0) {
        const mentionedProfiles = findProfilesByNickname(mentions);
        const profileIds = mentionedProfiles.map(p => p.id);

        if (profileIds.length > 0) {
          const truncatedText = message.text.length > 100
            ? message.text.slice(0, 97) + '...'
            : message.text;

          // Extract building name from room slug (e.g., rstu-2500-e-2nd-st)
          const buildingName = room.replace(/^rstu-/, '').replace(/-/g, ' ').toUpperCase();

          sendPushToMultiple(profileIds, {
            title: `${message.username} mentioned you`,
            body: truncatedText,
            tag: `mention-${room}`,
            data: {
              type: 'mention',
              room,
              building: buildingName,
              url: '/rstu-connect/'
            }
          }).catch(err => console.error('[Push] Mention notification error:', err));
        }
      }
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
  // Direct Message Events
  // ----------------------------------------

  // Subscribe to DM updates for a user
  socket.on('dm:subscribe', ({ profileId }) => {
    if (!profileId) return;

    // Join user-specific DM room
    socket.join(`dm-user-${profileId}`);
    console.log(`[Socket.io] ${profileId} subscribed to DM updates`);

    // Send current threads
    try {
      const threads = getThreadsForUser(profileId);
      socket.emit('dm:threads', { threads });
    } catch (err) {
      console.error('[Socket.io] Error fetching DM threads:', err);
      socket.emit('dm:error', { code: 'FETCH_FAILED', message: err.message });
    }
  });

  // Join a specific thread room for real-time updates
  socket.on('dm:join_thread', ({ threadId, profileId }) => {
    if (!threadId || !profileId) return;

    // Verify user is participant
    const thread = getDMThread(threadId);
    if (!thread || !thread.participants.includes(profileId)) {
      socket.emit('dm:error', { code: 'FORBIDDEN', message: 'Not a participant' });
      return;
    }

    socket.join(`dm-thread-${threadId}`);
    console.log(`[Socket.io] ${profileId} joined thread: ${threadId}`);

    // Send message history
    try {
      const messages = getDMMessages(threadId);
      socket.emit('dm:messages', { threadId, messages });
    } catch (err) {
      console.error('[Socket.io] Error fetching DM messages:', err);
    }
  });

  // Leave a thread room
  socket.on('dm:leave_thread', ({ threadId }) => {
    if (!threadId) return;
    socket.leave(`dm-thread-${threadId}`);
  });

  // Create a new thread
  socket.on('dm:create_thread', ({ thread }) => {
    if (!thread || !thread.id || !thread.participants) {
      socket.emit('dm:error', { code: 'INVALID', message: 'Invalid thread data' });
      return;
    }

    try {
      upsertDMThread(thread);
      const savedThread = getDMThread(thread.id);

      // Notify all participants
      thread.participants.forEach(participantId => {
        io.to(`dm-user-${participantId}`).emit('dm:thread_created', { thread: savedThread });
      });

      socket.emit('dm:thread_created', { thread: savedThread, success: true });
      console.log(`[Socket.io] Thread created: ${thread.id}`);
    } catch (err) {
      console.error('[Socket.io] Error creating thread:', err);
      socket.emit('dm:error', { code: 'CREATE_FAILED', message: err.message });
    }
  });

  // Send a message
  socket.on('dm:send_message', async ({ message }) => {
    if (!message || !message.threadId || !message.text) {
      socket.emit('dm:error', { code: 'INVALID', message: 'Invalid message data' });
      return;
    }

    // Verify sender is participant
    const thread = getDMThread(message.threadId);
    if (!thread || !thread.participants.includes(message.senderId)) {
      socket.emit('dm:error', { code: 'FORBIDDEN', message: 'Not a participant' });
      return;
    }

    try {
      // Generate ID if not provided
      if (!message.id) {
        message.id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      }
      if (!message.timestamp) {
        message.timestamp = Date.now();
      }
      if (!message.readBy) {
        message.readBy = [message.senderId];
      }

      insertDMMessage(message);

      // Broadcast to thread room
      io.to(`dm-thread-${message.threadId}`).emit('dm:new_message', { message });

      // Notify all participants (for unread badges)
      thread.participants.forEach(participantId => {
        if (participantId !== message.senderId) {
          io.to(`dm-user-${participantId}`).emit('dm:thread_updated', {
            threadId: message.threadId,
            lastMessage: {
              id: message.id,
              text: message.text,
              senderId: message.senderId,
              senderName: message.senderName,
              timestamp: message.timestamp
            }
          });
        }
      });

      socket.emit('dm:message_sent', { message, success: true });
      console.log(`[Socket.io] DM sent in thread: ${message.threadId}`);

      // Send push notifications to offline participants
      const offlineParticipants = thread.participants.filter(pid => {
        // Skip sender
        if (pid === message.senderId) return false;
        // Check if they have any active sockets
        return !profileSockets.has(pid) || profileSockets.get(pid).size === 0;
      });

      if (offlineParticipants.length > 0) {
        const truncatedText = message.text.length > 100
          ? message.text.slice(0, 97) + '...'
          : message.text;

        sendPushToMultiple(offlineParticipants, {
          title: `Message from ${message.senderName}`,
          body: truncatedText,
          tag: `dm-${message.threadId}`,
          data: {
            type: 'dm',
            threadId: message.threadId,
            url: '/rstu-connect/'
          }
        }).catch(err => console.error('[Push] DM notification error:', err));
      }
    } catch (err) {
      console.error('[Socket.io] Error sending DM:', err);
      socket.emit('dm:error', { code: 'SEND_FAILED', message: err.message });
    }
  });

  // Mark messages as read
  socket.on('dm:mark_read', ({ threadId, profileId }) => {
    if (!threadId || !profileId) return;

    try {
      const count = markMessagesAsRead(threadId, profileId);
      if (count > 0) {
        socket.emit('dm:marked_read', { threadId, count });

        // Notify other participants that messages were read
        io.to(`dm-thread-${threadId}`).emit('dm:read_receipt', {
          threadId,
          profileId,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      console.error('[Socket.io] Error marking messages as read:', err);
    }
  });

  // Get threads for a user
  socket.on('dm:get_threads', ({ profileId }) => {
    if (!profileId) return;

    try {
      const threads = getThreadsForUser(profileId);
      socket.emit('dm:threads', { threads });
    } catch (err) {
      console.error('[Socket.io] Error fetching threads:', err);
      socket.emit('dm:error', { code: 'FETCH_FAILED', message: err.message });
    }
  });

  // Get messages for a thread
  socket.on('dm:get_messages', ({ threadId, profileId, limit, offset }) => {
    if (!threadId || !profileId) return;

    // Verify user is participant
    const thread = getDMThread(threadId);
    if (!thread || !thread.participants.includes(profileId)) {
      socket.emit('dm:error', { code: 'FORBIDDEN', message: 'Not a participant' });
      return;
    }

    try {
      const messages = getDMMessages(threadId, limit || 100, offset || 0);
      socket.emit('dm:messages', { threadId, messages });
    } catch (err) {
      console.error('[Socket.io] Error fetching messages:', err);
      socket.emit('dm:error', { code: 'FETCH_FAILED', message: err.message });
    }
  });

  // ----------------------------------------
  // Push Notification Events
  // ----------------------------------------

  // Subscribe to push notifications
  socket.on('push:subscribe', async ({ profileId, subscription, settings }) => {
    if (!profileId || !subscription) {
      socket.emit('push:error', { code: 'INVALID', message: 'Invalid subscription data' });
      return;
    }

    try {
      const id = savePushSubscription(profileId, subscription, settings || {});
      socket.emit('push:subscribed', { id, success: true });
      console.log(`[Push] Subscription saved for ${profileId}`);
    } catch (err) {
      console.error('[Push] Error saving subscription:', err);
      socket.emit('push:error', { code: 'SAVE_FAILED', message: err.message });
    }
  });

  // Unsubscribe from push notifications
  socket.on('push:unsubscribe', ({ endpoint }) => {
    if (!endpoint) return;

    try {
      removePushSubscription(endpoint);
      socket.emit('push:unsubscribed', { success: true });
      console.log(`[Push] Subscription removed`);
    } catch (err) {
      console.error('[Push] Error removing subscription:', err);
    }
  });

  // Update notification settings
  socket.on('push:update_settings', ({ profileId, settings }) => {
    if (!profileId || !settings) return;

    try {
      // Update settings for all subscriptions of this profile
      const subs = getPushSubscriptionsForProfile(profileId);
      subs.forEach(sub => {
        db.run(
          'UPDATE push_subscriptions SET settings = ? WHERE id = ?',
          [JSON.stringify(settings), sub.id]
        );
      });
      saveDatabase();
      socket.emit('push:settings_updated', { success: true, settings });
    } catch (err) {
      console.error('[Push] Error updating settings:', err);
    }
  });

  // Get current settings
  socket.on('push:get_settings', ({ profileId }) => {
    if (!profileId) return;

    try {
      const subs = getPushSubscriptionsForProfile(profileId);
      const settings = subs.length > 0 ? subs[0].settings : {};
      socket.emit('push:settings', { settings, subscriptionCount: subs.length });
    } catch (err) {
      console.error('[Push] Error getting settings:', err);
    }
  });

  // Admin broadcast alert (strike alerts, important announcements)
  socket.on('admin:broadcast_alert', async ({ adminId, title, body, targetRoles }) => {
    // Verify admin
    const adminProfile = getProfile(adminId);
    if (!adminProfile || adminProfile.role !== 'admin') {
      socket.emit('admin:broadcast_response', { success: false, error: 'Unauthorized' });
      return;
    }

    try {
      // Get all profiles matching target roles (or all if not specified)
      const profiles = getAllProfiles();
      const targetProfiles = targetRoles
        ? profiles.filter(p => targetRoles.includes(p.role))
        : profiles;

      const profileIds = targetProfiles.map(p => p.id);

      // Send push notifications
      const sent = await sendPushToMultiple(profileIds, {
        title: title || 'RSTU Alert',
        body: body || '',
        tag: 'rstu-alert',
        data: { type: 'alert', url: '/rstu-connect/' }
      });

      socket.emit('admin:broadcast_response', {
        success: true,
        sent,
        total: profileIds.length
      });

      console.log(`[Push] Admin broadcast sent to ${sent}/${profileIds.length} users`);
    } catch (err) {
      console.error('[Push] Error broadcasting:', err);
      socket.emit('admin:broadcast_response', { success: false, error: err.message });
    }
  });

  // ----------------------------------------
  // Election Events
  // ----------------------------------------

  // Get active election
  socket.on('election:get_active', () => {
    try {
      const election = getActiveElection();
      socket.emit('election:active', { election });
    } catch (err) {
      console.error('[Socket.io] Error getting active election:', err);
      socket.emit('election:error', { code: 'FETCH_FAILED', message: err.message });
    }
  });

  // Get all elections (admin)
  socket.on('election:get_all', ({ profileId }) => {
    const profile = getProfile(profileId);
    if (!profile || profile.role !== 'admin') {
      socket.emit('election:error', { code: 'FORBIDDEN', message: 'Admin access required' });
      return;
    }

    try {
      const elections = getAllElections();
      socket.emit('election:all', { elections });
    } catch (err) {
      console.error('[Socket.io] Error getting elections:', err);
      socket.emit('election:error', { code: 'FETCH_FAILED', message: err.message });
    }
  });

  // Create/update election (admin)
  socket.on('election:save', ({ election, profileId }) => {
    const profile = getProfile(profileId);
    if (!profile || profile.role !== 'admin') {
      socket.emit('election:error', { code: 'FORBIDDEN', message: 'Admin access required' });
      return;
    }

    try {
      upsertElection(election);
      socket.emit('election:saved', { election, success: true });
      // Broadcast to all connected clients
      io.emit('election:updated', { election });
      console.log(`[Socket.io] Election saved: ${election.id}`);
    } catch (err) {
      console.error('[Socket.io] Error saving election:', err);
      socket.emit('election:error', { code: 'SAVE_FAILED', message: err.message });
    }
  });

  // Get nominations for election
  socket.on('election:get_nominations', ({ electionId }) => {
    try {
      const nominations = getNominationsForElection(electionId);
      socket.emit('election:nominations', { electionId, nominations });
    } catch (err) {
      console.error('[Socket.io] Error getting nominations:', err);
      socket.emit('election:error', { code: 'FETCH_FAILED', message: err.message });
    }
  });

  // Submit nomination
  socket.on('election:nominate', ({ nomination }) => {
    if (!nomination || !nomination.electionId || !nomination.positionId) {
      socket.emit('election:error', { code: 'INVALID', message: 'Invalid nomination data' });
      return;
    }

    try {
      // Generate ID if needed
      if (!nomination.id) {
        nomination.id = `nom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      }
      if (!nomination.createdAt) {
        nomination.createdAt = Date.now();
      }

      upsertNomination(nomination);
      socket.emit('election:nominated', { nomination, success: true });
      // Broadcast to election subscribers
      io.emit('election:nomination_added', { nomination });
      console.log(`[Socket.io] Nomination submitted: ${nomination.id}`);
    } catch (err) {
      console.error('[Socket.io] Error submitting nomination:', err);
      socket.emit('election:error', { code: 'NOMINATE_FAILED', message: err.message });
    }
  });

  // Accept/decline nomination
  socket.on('election:accept_nomination', ({ nominationId, accepted, profileId }) => {
    try {
      const nomination = getNomination(nominationId);
      if (!nomination) {
        socket.emit('election:error', { code: 'NOT_FOUND', message: 'Nomination not found' });
        return;
      }

      // Verify the nominee is responding
      if (nomination.nomineeId !== profileId) {
        socket.emit('election:error', { code: 'FORBIDDEN', message: 'Only nominee can respond' });
        return;
      }

      nomination.accepted = accepted;
      upsertNomination(nomination);
      socket.emit('election:nomination_responded', { nomination, success: true });
      io.emit('election:nomination_updated', { nomination });
      console.log(`[Socket.io] Nomination ${accepted ? 'accepted' : 'declined'}: ${nominationId}`);
    } catch (err) {
      console.error('[Socket.io] Error responding to nomination:', err);
      socket.emit('election:error', { code: 'RESPOND_FAILED', message: err.message });
    }
  });

  // Cast vote
  socket.on('election:vote', ({ vote }) => {
    if (!vote || !vote.electionId || !vote.positionId || !vote.voterId || !vote.candidateId) {
      socket.emit('election:error', { code: 'INVALID', message: 'Invalid vote data' });
      return;
    }

    try {
      // Check if already voted
      if (hasVotedForPosition(vote.electionId, vote.positionId, vote.voterId)) {
        socket.emit('election:error', { code: 'ALREADY_VOTED', message: 'Already voted for this position' });
        return;
      }

      // Generate ID if needed
      if (!vote.id) {
        vote.id = `vote-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      }
      if (!vote.timestamp) {
        vote.timestamp = Date.now();
      }

      const success = insertVote(vote);
      if (success) {
        socket.emit('election:voted', { vote, success: true });
        console.log(`[Socket.io] Vote cast: ${vote.id}`);
      } else {
        socket.emit('election:error', { code: 'VOTE_FAILED', message: 'Could not record vote' });
      }
    } catch (err) {
      console.error('[Socket.io] Error casting vote:', err);
      socket.emit('election:error', { code: 'VOTE_FAILED', message: err.message });
    }
  });

  // Get user's votes for election
  socket.on('election:get_my_votes', ({ electionId, profileId }) => {
    try {
      const votes = getUserVotesForElection(electionId, profileId);
      socket.emit('election:my_votes', { electionId, votes });
    } catch (err) {
      console.error('[Socket.io] Error getting votes:', err);
    }
  });

  // Get election results (after voting ends)
  socket.on('election:get_results', ({ electionId }) => {
    try {
      const election = getElection(electionId);
      if (!election) {
        socket.emit('election:error', { code: 'NOT_FOUND', message: 'Election not found' });
        return;
      }

      // Only show results after voting ends
      const now = Date.now();
      if (election.status !== 'closed' && now < election.votingEnd) {
        socket.emit('election:error', { code: 'NOT_AVAILABLE', message: 'Results not yet available' });
        return;
      }

      const votes = getVotesForElection(electionId);
      const nominations = getNominationsForElection(electionId);
      const profiles = getAllProfiles();
      const eligibleVoters = profiles.length; // Could filter by role/trust level

      // Calculate results
      const uniqueVoters = new Set(votes.map(v => v.voterId)).size;
      const quorumMet = eligibleVoters > 0
        ? (uniqueVoters / eligibleVoters) >= (election.quorumPercent / 100)
        : false;

      const positionResults = election.positions.map(position => {
        const posVotes = votes.filter(v => v.positionId === position.id);
        const posNoms = nominations.filter(n => n.positionId === position.id && n.accepted === true);

        const voteCounts = new Map();
        posNoms.forEach(n => voteCounts.set(n.id, 0));
        posVotes.forEach(v => {
          const count = voteCounts.get(v.candidateId) || 0;
          voteCounts.set(v.candidateId, count + 1);
        });

        const totalVotes = posVotes.length;
        const candidates = posNoms.map(n => ({
          nominationId: n.id,
          nomineeId: n.nomineeId,
          nomineeName: n.nomineeName,
          voteCount: voteCounts.get(n.id) || 0,
          percentage: totalVotes > 0 ? ((voteCounts.get(n.id) || 0) / totalVotes) * 100 : 0
        })).sort((a, b) => b.voteCount - a.voteCount);

        const winner = candidates.find(c => c.percentage > 50);
        const needsRunoff = candidates.length > 1 && !winner && totalVotes > 0;

        return {
          positionId: position.id,
          positionTitle: position.title,
          candidates,
          winnerId: winner?.nomineeId || null,
          winnerName: winner?.nomineeName || null,
          totalVotes,
          needsRunoff
        };
      });

      socket.emit('election:results', {
        electionId,
        positions: positionResults,
        totalEligibleVoters: eligibleVoters,
        totalVoters: uniqueVoters,
        quorumMet
      });
    } catch (err) {
      console.error('[Socket.io] Error getting results:', err);
      socket.emit('election:error', { code: 'RESULTS_FAILED', message: err.message });
    }
  });

  // ----------------------------------------
  // Task Events
  // ----------------------------------------

  // Get all tasks
  socket.on('task:get_all', ({ filters }) => {
    try {
      let tasks = getAllTasks();

      // Apply filters
      if (filters) {
        if (filters.campaignId) {
          tasks = tasks.filter(t => t.campaignId === filters.campaignId);
        }
        if (filters.buildingId) {
          tasks = tasks.filter(t => t.buildingId === filters.buildingId);
        }
        if (filters.status) {
          tasks = tasks.filter(t => t.status === filters.status);
        }
        if (filters.assigneeId) {
          tasks = tasks.filter(t => t.assigneeIds && t.assigneeIds.includes(filters.assigneeId));
        }
        if (filters.priority) {
          tasks = tasks.filter(t => t.priority === filters.priority);
        }
        if (filters.type) {
          tasks = tasks.filter(t => t.type === filters.type);
        }
      }

      socket.emit('task:all', { tasks });
    } catch (err) {
      console.error('[Socket.io] Error getting tasks:', err);
      socket.emit('task:error', { code: 'FETCH_FAILED', message: err.message });
    }
  });

  // Get tasks by campaign
  socket.on('task:get_by_campaign', ({ campaignId }) => {
    try {
      const tasks = getTasksByCampaign(campaignId);
      socket.emit('task:by_campaign', { campaignId, tasks });
    } catch (err) {
      console.error('[Socket.io] Error getting campaign tasks:', err);
      socket.emit('task:error', { code: 'FETCH_FAILED', message: err.message });
    }
  });

  // Get tasks by building
  socket.on('task:get_by_building', ({ buildingId }) => {
    try {
      const tasks = getTasksByBuilding(buildingId);
      socket.emit('task:by_building', { buildingId, tasks });
    } catch (err) {
      console.error('[Socket.io] Error getting building tasks:', err);
      socket.emit('task:error', { code: 'FETCH_FAILED', message: err.message });
    }
  });

  // Get my tasks
  socket.on('task:get_my_tasks', ({ profileId }) => {
    try {
      const tasks = getTasksByAssignee(profileId);
      socket.emit('task:my_tasks', { tasks });
    } catch (err) {
      console.error('[Socket.io] Error getting my tasks:', err);
      socket.emit('task:error', { code: 'FETCH_FAILED', message: err.message });
    }
  });

  // Create/update task
  socket.on('task:save', ({ task }) => {
    if (!task || !task.title) {
      socket.emit('task:error', { code: 'INVALID', message: 'Invalid task data' });
      return;
    }

    try {
      // Generate ID if needed
      if (!task.id) {
        task.id = `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      }
      if (!task.createdAt) {
        task.createdAt = Date.now();
      }
      task.updatedAt = Date.now();
      if (!task.status) {
        task.status = 'todo';
      }

      upsertTask(task);
      socket.emit('task:saved', { task, success: true });
      // Broadcast to all clients
      io.emit('task:updated', { task });
      console.log(`[Socket.io] Task saved: ${task.id}`);
    } catch (err) {
      console.error('[Socket.io] Error saving task:', err);
      socket.emit('task:error', { code: 'SAVE_FAILED', message: err.message });
    }
  });

  // Move task (change status)
  socket.on('task:move', ({ taskId, newStatus }) => {
    try {
      const task = getTask(taskId);
      if (!task) {
        socket.emit('task:error', { code: 'NOT_FOUND', message: 'Task not found' });
        return;
      }

      task.status = newStatus;
      task.updatedAt = Date.now();
      if (newStatus === 'done' && !task.completedAt) {
        task.completedAt = Date.now();
      }

      upsertTask(task);
      socket.emit('task:moved', { task, success: true });
      io.emit('task:updated', { task });
      console.log(`[Socket.io] Task moved: ${taskId} -> ${newStatus}`);
    } catch (err) {
      console.error('[Socket.io] Error moving task:', err);
      socket.emit('task:error', { code: 'MOVE_FAILED', message: err.message });
    }
  });

  // Assign/unassign user to task
  socket.on('task:assign', ({ taskId, profileId, profileName, assign }) => {
    try {
      const task = getTask(taskId);
      if (!task) {
        socket.emit('task:error', { code: 'NOT_FOUND', message: 'Task not found' });
        return;
      }

      if (!task.assigneeIds) task.assigneeIds = [];
      if (!task.assigneeNames) task.assigneeNames = [];

      if (assign) {
        if (!task.assigneeIds.includes(profileId)) {
          task.assigneeIds.push(profileId);
          task.assigneeNames.push(profileName);
        }
      } else {
        const idx = task.assigneeIds.indexOf(profileId);
        if (idx >= 0) {
          task.assigneeIds.splice(idx, 1);
          task.assigneeNames.splice(idx, 1);
        }
      }

      task.updatedAt = Date.now();
      upsertTask(task);
      socket.emit('task:assigned', { task, success: true });
      io.emit('task:updated', { task });
      console.log(`[Socket.io] Task ${assign ? 'assigned to' : 'unassigned from'} ${profileId}: ${taskId}`);
    } catch (err) {
      console.error('[Socket.io] Error assigning task:', err);
      socket.emit('task:error', { code: 'ASSIGN_FAILED', message: err.message });
    }
  });

  // Delete task
  socket.on('task:delete', ({ taskId }) => {
    try {
      deleteTask(taskId);
      socket.emit('task:deleted', { taskId, success: true });
      io.emit('task:removed', { taskId });
      console.log(`[Socket.io] Task deleted: ${taskId}`);
    } catch (err) {
      console.error('[Socket.io] Error deleting task:', err);
      socket.emit('task:error', { code: 'DELETE_FAILED', message: err.message });
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
