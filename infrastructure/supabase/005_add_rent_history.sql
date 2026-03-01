-- Migration: Add rent_history column to profiles table
-- Reason: ProfileStorage syncs rent history data but column was missing
-- This caused profile sync failures and blocked invite code sync

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS rent_history TEXT;

-- Verify the column exists
SELECT COUNT(*) as profiles_with_rent_history_column
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'rent_history';
