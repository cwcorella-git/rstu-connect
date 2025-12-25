-- SQL schema for document admin state persistence
-- Run this in Supabase SQL Editor to create the required tables

-- Table for global admin state (hidden/deleted documents)
CREATE TABLE IF NOT EXISTS document_admin_state (
  id TEXT PRIMARY KEY,              -- document ID
  hidden BOOLEAN DEFAULT false,
  deleted BOOLEAN DEFAULT false,
  hidden_by TEXT,                   -- profile ID of admin who hid
  deleted_by TEXT,                  -- profile ID of admin who deleted
  hidden_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_document_admin_state_hidden ON document_admin_state(hidden) WHERE hidden = true;
CREATE INDEX IF NOT EXISTS idx_document_admin_state_deleted ON document_admin_state(deleted) WHERE deleted = true;

-- Table for document edits
CREATE TABLE IF NOT EXISTS document_edits (
  id TEXT PRIMARY KEY,              -- document ID
  title TEXT NOT NULL,
  content TEXT,                     -- Full markdown content (optional)
  edited_by TEXT NOT NULL,          -- profile ID of admin who edited
  edited_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies (drop existing first to avoid conflicts)
ALTER TABLE document_admin_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_edits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read admin state" ON document_admin_state;
DROP POLICY IF EXISTS "Allow modifications to admin state" ON document_admin_state;
DROP POLICY IF EXISTS "Anyone can read edits" ON document_edits;
DROP POLICY IF EXISTS "Allow modifications to edits" ON document_edits;

-- Recreate policies
CREATE POLICY "Anyone can read admin state" ON document_admin_state
  FOR SELECT USING (true);

CREATE POLICY "Allow modifications to admin state" ON document_admin_state
  FOR ALL USING (true);

CREATE POLICY "Anyone can read edits" ON document_edits
  FOR SELECT USING (true);

CREATE POLICY "Allow modifications to edits" ON document_edits
  FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON document_admin_state TO authenticated;
GRANT ALL ON document_admin_state TO anon;
GRANT ALL ON document_edits TO authenticated;
GRANT ALL ON document_edits TO anon;
