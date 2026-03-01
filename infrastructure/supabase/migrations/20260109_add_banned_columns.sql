-- Add banned columns to profiles table for server-authoritative bans
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES profiles(id);

CREATE INDEX IF NOT EXISTS idx_profiles_banned ON profiles(banned) WHERE banned = true;
