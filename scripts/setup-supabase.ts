#!/usr/bin/env node
/**
 * Supabase Schema Setup Script
 * Creates all necessary tables for RSTU Connect
 * Usage: npx ts-node scripts/setup-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment variables')
  console.error('   NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// SQL to create all tables
const setupSQL = `
-- RSTU Connect Database Schema

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname VARCHAR(30) NOT NULL,
  role TEXT NOT NULL DEFAULT 'tenant' CHECK (role IN ('tenant', 'organizer', 'admin')),
  trust_level TEXT NOT NULL DEFAULT 'self_registered' CHECK (trust_level IN ('self_registered', 'invited', 'verified')),
  building_id TEXT,
  building_address TEXT,
  unit_number TEXT,
  phone TEXT,
  email TEXT,
  preferred_contact TEXT CHECK (preferred_contact IN ('phone', 'text', 'email')),
  language TEXT,
  rent_amount INTEGER,
  move_in_date DATE,
  lease_type TEXT CHECK (lease_type IN ('fixed', 'month-to-month')),
  lease_expires DATE,
  assigned_buildings TEXT[],
  invited_by UUID REFERENCES profiles(id),
  invite_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INVITE CODES TABLE
CREATE TABLE IF NOT EXISTS invite_codes (
  code VARCHAR(6) PRIMARY KEY,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  building_id TEXT,
  unit_number TEXT,
  grant_role TEXT DEFAULT 'tenant',
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  used_by UUID[],
  revoked BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ADMIN STATE TABLE (for document hiding/deletion)
CREATE TABLE IF NOT EXISTS document_admin_state (
  id TEXT PRIMARY KEY,
  hidden BOOLEAN DEFAULT false,
  deleted BOOLEAN DEFAULT false,
  hidden_by TEXT,
  deleted_by TEXT,
  hidden_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DOCUMENT EDITS TABLE
CREATE TABLE IF NOT EXISTS document_edits (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  edited_by TEXT NOT NULL,
  edited_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CANVASS UNITS TABLE
CREATE TABLE IF NOT EXISTS canvass_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id TEXT NOT NULL,
  building_address TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  status TEXT DEFAULT 'NOT_CONTACTED' CHECK (status IN ('NOT_CONTACTED', 'NO_ANSWER', 'CONTACTED', 'INTERESTED', 'NOT_INTERESTED', 'FOLLOW_UP', 'ACTIVE_MEMBER')),
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  preferred_contact TEXT,
  language TEXT,
  occupants INTEGER,
  rent_amount INTEGER,
  complaints TEXT[],
  complaint_details TEXT,
  interest_levels TEXT[],
  notes TEXT,
  follow_up_date DATE,
  organizer_id UUID REFERENCES profiles(id),
  linked_profile_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(building_id, unit_number)
);

-- 6. BUILDING COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS building_complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  submitted_by UUID REFERENCES profiles(id) NOT NULL,
  submitted_by_name TEXT NOT NULL,
  status TEXT DEFAULT 'voting' CHECK (status IN ('pending', 'voting', 'demand', 'resolved', 'rejected')),
  upvotes UUID[] DEFAULT '{}',
  downvotes UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BUILDING DEMANDS TABLE
CREATE TABLE IF NOT EXISTS building_demands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  source_complaint_id UUID REFERENCES building_complaints(id),
  support_votes UUID[] DEFAULT '{}',
  escalation_level TEXT DEFAULT 'letter' CHECK (escalation_level IN ('letter', 'petition', 'action', 'strike')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. LINKED PROPERTY GROUPS TABLE
CREATE TABLE IF NOT EXISTS linked_property_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  apns TEXT[] NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  is_same_building BOOLEAN DEFAULT FALSE,
  member_profiles UUID[],
  alliances UUID[],
  muted_profiles UUID[],
  banned_profiles JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. GOVERNANCE PROPOSALS TABLE
CREATE TABLE IF NOT EXISTS governance_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('rename', 'merge', 'alliance', 'add-property', 'remove-property', 'mute-tenant', 'escalate', 'split')),
  group_id TEXT NOT NULL,
  target_group_id TEXT,
  target_apn TEXT,
  target_profile_id UUID,
  target_value TEXT,
  target_apns TEXT[],
  proposed_by UUID REFERENCES profiles(id) NOT NULL,
  proposed_by_name TEXT NOT NULL,
  reason TEXT,
  upvotes UUID[] DEFAULT '{}',
  downvotes UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'passed', 'rejected', 'pending-finalize', 'pending-partner', 'executed')),
  partner_proposal_id UUID,
  partner_group_passed BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  executed_at TIMESTAMPTZ,
  finalized_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_canvass_building ON canvass_units(building_id);
CREATE INDEX IF NOT EXISTS idx_complaints_building ON building_complaints(building_id);
CREATE INDEX IF NOT EXISTS idx_demands_building ON building_demands(building_id);
CREATE INDEX IF NOT EXISTS idx_proposals_group ON governance_proposals(group_id);
CREATE INDEX IF NOT EXISTS idx_profiles_building ON profiles(building_id);
CREATE INDEX IF NOT EXISTS idx_document_admin_state_hidden ON document_admin_state(hidden) WHERE hidden = true;
CREATE INDEX IF NOT EXISTS idx_document_admin_state_deleted ON document_admin_state(deleted) WHERE deleted = true;

-- DISABLE RLS (we handle auth in app)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_admin_state DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_edits DISABLE ROW LEVEL SECURITY;
ALTER TABLE canvass_units DISABLE ROW LEVEL SECURITY;
ALTER TABLE building_complaints DISABLE ROW LEVEL SECURITY;
ALTER TABLE building_demands DISABLE ROW LEVEL SECURITY;
ALTER TABLE linked_property_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE governance_proposals DISABLE ROW LEVEL SECURITY;

-- ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE building_complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE building_demands;
ALTER PUBLICATION supabase_realtime ADD TABLE governance_proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE document_admin_state;
ALTER PUBLICATION supabase_realtime ADD TABLE invite_codes;
`

async function main() {
  console.log('🔧 RSTU Connect - Supabase Setup')
  console.log('=' .repeat(50))

  try {
    // Test connection
    console.log('\n📡 Testing Supabase connection...')
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' }).limit(1)

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Connection failed:', error.message)
      process.exit(1)
    }

    console.log('✅ Connected to Supabase')

    // Check existing tables
    console.log('\n📋 Checking existing tables...')
    const tables = [
      'profiles',
      'invite_codes',
      'document_admin_state',
      'document_edits',
      'canvass_units',
      'building_complaints',
      'building_demands',
      'linked_property_groups',
      'governance_proposals'
    ]

    const existingTables: string[] = []
    const missingTables: string[] = []

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('count', { count: 'exact' }).limit(1)
        if (!error || error.code === 'PGRST116') {
          existingTables.push(table)
          console.log(`  ✅ ${table}`)
        } else {
          missingTables.push(table)
          console.log(`  ❌ ${table}`)
        }
      } catch (e) {
        missingTables.push(table)
        console.log(`  ❌ ${table}`)
      }
    }

    console.log(`\n📊 Summary: ${existingTables.length}/${tables.length} tables exist`)

    if (missingTables.length === 0) {
      console.log('\n✅ All tables exist! Setup complete.')
      console.log('\nNext steps:')
      console.log('1. Test invite code sync: Create an invite on desktop, scan on mobile')
      console.log('2. Monitor browser console for: [InviteCode:create] Successfully synced to Supabase')
      return
    }

    // Show SQL for manual creation
    console.log('\n⚠️  Some tables are missing. Run this SQL in Supabase:')
    console.log('\nGo to: https://supabase.com/dashboard/project/dxkwzvweaqlhmpwgpzsa/sql')
    console.log('\nPaste and execute:\n')
    console.log(setupSQL)
    console.log('\nAfter running, tables will be ready for use.')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

main()
