-- RSTU Connect Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/dxkwzvweaqlhmpwgpzsa/sql

-- =============================================
-- 1. PROFILES TABLE
-- =============================================
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

-- =============================================
-- 2. INVITE CODES TABLE
-- =============================================
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

-- =============================================
-- 3. CANVASS UNITS TABLE
-- =============================================
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

-- =============================================
-- 4. BUILDING COMPLAINTS TABLE
-- =============================================
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

-- =============================================
-- 5. BUILDING DEMANDS TABLE
-- =============================================
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

-- =============================================
-- 6. LINKED PROPERTY GROUPS TABLE
-- =============================================
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

-- =============================================
-- 7. GOVERNANCE PROPOSALS TABLE
-- =============================================
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

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_canvass_building ON canvass_units(building_id);
CREATE INDEX IF NOT EXISTS idx_canvass_building_address_fts ON canvass_units USING gin(to_tsvector('english', building_address));
CREATE INDEX IF NOT EXISTS idx_complaints_building ON building_complaints(building_id);
CREATE INDEX IF NOT EXISTS idx_demands_building ON building_demands(building_id);
CREATE INDEX IF NOT EXISTS idx_proposals_group ON governance_proposals(group_id);
CREATE INDEX IF NOT EXISTS idx_profiles_building ON profiles(building_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) - DISABLED FOR NOW
-- Since we're not using Supabase Auth, we'll use
-- application-level security instead
-- =============================================

-- Disable RLS for public access (we handle auth in app)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE canvass_units DISABLE ROW LEVEL SECURITY;
ALTER TABLE building_complaints DISABLE ROW LEVEL SECURITY;
ALTER TABLE building_demands DISABLE ROW LEVEL SECURITY;
ALTER TABLE linked_property_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE governance_proposals DISABLE ROW LEVEL SECURITY;

-- =============================================
-- FULL-TEXT SEARCH FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION search_canvass_buildings(search_query TEXT)
RETURNS TABLE (
  building_id TEXT,
  building_address TEXT,
  unit_count BIGINT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (cu.building_id)
    cu.building_id,
    cu.building_address,
    COUNT(*) OVER (PARTITION BY cu.building_id) as unit_count,
    ts_rank(to_tsvector('english', cu.building_address), plainto_tsquery('english', search_query)) as rank
  FROM canvass_units cu
  WHERE to_tsvector('english', cu.building_address) @@ plainto_tsquery('english', search_query)
  ORDER BY cu.building_id, rank DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ENABLE REALTIME FOR LIVE UPDATES
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE building_complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE building_demands;
ALTER PUBLICATION supabase_realtime ADD TABLE governance_proposals;
