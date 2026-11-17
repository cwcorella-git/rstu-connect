-- Migration: Supabase Auth Integration
-- Replaces localStorage-based authentication with Supabase Auth
--
-- Strategy:
-- 1. Add auth_user_id column to link profiles to Supabase Auth users
-- 2. Create trigger to auto-link profiles when auth users are created
-- 3. Update get_current_user_id() to support both auth.uid() and session variable
-- 4. Add email_verified column to track verification status

-- ============================================================================
-- Step 1: Add auth_user_id column to profiles table
-- ============================================================================

-- Add column to link profiles to Supabase Auth users
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add email_verified column to track verification status
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON public.profiles(auth_user_id);

-- ============================================================================
-- Step 2: Auto-link profile when auth user is created with matching email
-- ============================================================================

CREATE OR REPLACE FUNCTION public.link_profile_to_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to link to existing profile with matching email
  UPDATE public.profiles
  SET
    auth_user_id = NEW.id,
    email_verified = COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE)
  WHERE email = NEW.email AND auth_user_id IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.link_profile_to_auth_user();

-- ============================================================================
-- Step 3: Handle email verification updates
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- When email is confirmed, update profile
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.profiles
    SET email_verified = TRUE
    WHERE auth_user_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_email_verified ON auth.users;

-- Create trigger for email verification updates
CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_email_verification();

-- ============================================================================
-- Step 4: Update get_current_user_id to support both methods
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
DECLARE
  profile_id UUID;
BEGIN
  -- First try Supabase Auth (preferred method)
  IF auth.uid() IS NOT NULL THEN
    SELECT id INTO profile_id
    FROM public.profiles
    WHERE auth_user_id = auth.uid();

    IF profile_id IS NOT NULL THEN
      RETURN profile_id;
    END IF;
  END IF;

  -- Fallback to session variable (for offline/legacy support)
  RETURN NULLIF(current_setting('app.current_user_id', true), '')::UUID;
EXCEPTION
  WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';

-- ============================================================================
-- Step 5: Helper function to get profile by auth_user_id
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_profile_by_auth_id(auth_id UUID)
RETURNS TABLE (
  id UUID,
  nickname TEXT,
  email TEXT,
  role TEXT,
  trust_level TEXT,
  building_id TEXT,
  building_address TEXT,
  unit_number TEXT,
  email_verified BOOLEAN,
  created_at TIMESTAMPTZ,
  last_active TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.nickname,
    p.email,
    p.role,
    p.trust_level,
    p.building_id,
    p.building_address,
    p.unit_number,
    p.email_verified,
    p.created_at,
    p.last_active
  FROM public.profiles p
  WHERE p.auth_user_id = auth_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';

-- ============================================================================
-- Step 6: Function to check if user needs migration
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_user_needs_migration(user_email TEXT)
RETURNS TABLE (
  needs_migration BOOLEAN,
  profile_id UUID,
  nickname TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (p.auth_user_id IS NULL) as needs_migration,
    p.id as profile_id,
    p.nickname
  FROM public.profiles p
  WHERE p.email = lower(user_email);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';

-- ============================================================================
-- Step 7: Function to link existing profile to new auth user
-- ============================================================================

CREATE OR REPLACE FUNCTION public.migrate_profile_to_auth(
  profile_id_input UUID,
  auth_user_id_input UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.profiles
  SET
    auth_user_id = auth_user_id_input,
    email_verified = TRUE
  WHERE id = profile_id_input AND auth_user_id IS NULL;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================================================
-- Step 8: Update RLS policies for profiles to use auth.uid()
-- ============================================================================

-- Drop and recreate insert policy to allow auth users to insert
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_auth ON public.profiles;

-- Allow insert if:
-- 1. No current user (initial registration before login)
-- 2. Inserting own profile (matching get_current_user_id())
-- 3. Auth user is creating/linking their profile
CREATE POLICY profiles_insert_auth ON public.profiles
  FOR INSERT WITH CHECK (
    get_current_user_id() IS NULL
    OR id = get_current_user_id()
    OR (auth.uid() IS NOT NULL AND (auth_user_id = auth.uid() OR auth_user_id IS NULL))
  );

-- Update policy to allow auth users to update their linked profile
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_auth ON public.profiles;

CREATE POLICY profiles_update_auth ON public.profiles
  FOR UPDATE USING (
    id = get_current_user_id()
    OR (auth.uid() IS NOT NULL AND auth_user_id = auth.uid())
  );

-- ============================================================================
-- Done - Summary
-- ============================================================================

-- Changes made:
-- 1. Added auth_user_id column to link profiles to Supabase Auth users
-- 2. Added email_verified column to track verification status
-- 3. Created trigger to auto-link profiles when auth users are created
-- 4. Created trigger to sync email verification status
-- 5. Updated get_current_user_id() to prefer auth.uid() over session variable
-- 6. Added helper functions for migration workflow
-- 7. Updated RLS policies to support both auth methods
