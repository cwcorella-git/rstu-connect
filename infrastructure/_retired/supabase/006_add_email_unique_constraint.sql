-- Migration: Add email unique constraint and merge duplicate profiles
-- Run this in Supabase SQL Editor before deploying code changes
-- https://supabase.com/dashboard/project/dxkwzvweaqlhmpwgpzsa/sql

-- =============================================
-- STEP 1: BACKUP CHRIS PROFILES (view before delete)
-- =============================================
-- Run this first to see which profiles will be affected:
-- SELECT id, nickname, email, role, created_at, last_active
-- FROM profiles
-- WHERE nickname ILIKE 'Chris' AND role = 'admin'
-- ORDER BY created_at;

-- =============================================
-- STEP 2: MERGE DUPLICATE CHRIS PROFILES
-- =============================================
-- Update any invited_by references to point to oldest Chris before deletion
WITH chris_profiles AS (
  SELECT
    id,
    created_at,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
  FROM profiles
  WHERE nickname ILIKE 'Chris' AND role = 'admin'
),
oldest_chris AS (
  SELECT id FROM chris_profiles WHERE rn = 1
),
duplicate_chris AS (
  SELECT id FROM chris_profiles WHERE rn > 1
)
UPDATE profiles
SET invited_by = (SELECT id FROM oldest_chris LIMIT 1)
WHERE invited_by IN (SELECT id FROM duplicate_chris);

-- Delete duplicate Chris profiles (keep oldest by created_at)
DELETE FROM profiles
WHERE id IN (
  SELECT id FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
    FROM profiles
    WHERE nickname ILIKE 'Chris' AND role = 'admin'
  ) duplicates
  WHERE rn > 1
);

-- =============================================
-- STEP 3: ADD UNIQUE CONSTRAINT ON EMAIL
-- =============================================
-- NULLS NOT DISTINCT means:
-- - NULL emails are allowed (for legacy profiles without email)
-- - Non-NULL emails must be unique
-- - Cannot have two rows with same non-NULL email
ALTER TABLE profiles
ADD CONSTRAINT profiles_email_key UNIQUE NULLS NOT DISTINCT (email);

-- =============================================
-- STEP 4: ADD INDEX FOR EMAIL LOOKUPS
-- =============================================
-- Partial index only on non-NULL emails (more efficient)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email) WHERE email IS NOT NULL;

-- =============================================
-- STEP 5: VERIFY CHANGES
-- =============================================
-- Run these queries to verify:

-- Verify only 1 Chris admin remains:
-- SELECT COUNT(*) FROM profiles WHERE nickname ILIKE 'Chris' AND role = 'admin';

-- Verify unique constraint exists:
-- SELECT constraint_name, constraint_type
-- FROM information_schema.table_constraints
-- WHERE table_name = 'profiles' AND constraint_name = 'profiles_email_key';

-- Check for any remaining duplicate emails (should return 0 rows):
-- SELECT email, COUNT(*) as count
-- FROM profiles
-- WHERE email IS NOT NULL
-- GROUP BY email
-- HAVING COUNT(*) > 1;

-- View all remaining profiles:
-- SELECT id, nickname, email, role, created_at FROM profiles ORDER BY created_at;
