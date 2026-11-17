-- Migration: Close the profiles PII leak
--
-- Before this migration, any client holding the public anon key could read
-- every member's phone, email, unit, rent and lease (profiles_select_all
-- USING (true), from 011) and delete any profile (profiles_delete USING (true),
-- from 20260109_add_profiles_delete_policy.sql).
--
-- Identity for these policies comes ONLY from Supabase Auth (auth.uid()).
-- get_current_user_id() is not used here: its fallback reads
-- app.current_user_id, which any client can set to any id via
-- set_user_context(), so it cannot gate access to personal data.
--
-- After this migration:
--   * profiles (all columns): readable by the member themselves, and by
--     organizers/admins signed in with Supabase Auth.
--   * public_profiles (view): non-identifying columns only, readable by anyone.
--     No phone, email, address, unit, rent or lease.
--   * is_email_registered(email): yes/no check for signup duplicate
--     detection, without revealing who owns the address.
--   * DELETE on profiles: admins/organizers signed in with Supabase Auth.

-- ============================================================================
-- Auth-only identity helpers
-- ============================================================================

CREATE OR REPLACE FUNCTION public.auth_profile_id()
RETURNS UUID AS $$
  SELECT id FROM public.profiles
  WHERE auth.uid() IS NOT NULL AND auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.auth_is_organizer_or_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE((
    SELECT role IN ('organizer', 'admin') AND NOT COALESCE(banned, false)
    FROM public.profiles
    WHERE auth.uid() IS NOT NULL AND auth_user_id = auth.uid()
    LIMIT 1
  ), false);
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '';

-- ============================================================================
-- profiles: SELECT
-- ============================================================================

DROP POLICY IF EXISTS profiles_select_all ON public.profiles;
DROP POLICY IF EXISTS profiles_select ON public.profiles;
DROP POLICY IF EXISTS profiles_select_self ON public.profiles;
DROP POLICY IF EXISTS profiles_select_staff ON public.profiles;

CREATE POLICY profiles_select_self ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth_user_id = auth.uid());

CREATE POLICY profiles_select_staff ON public.profiles
  FOR SELECT USING (public.auth_is_organizer_or_admin());

-- ============================================================================
-- profiles: DELETE (was USING (true))
-- ============================================================================

DROP POLICY IF EXISTS profiles_delete ON public.profiles;

CREATE POLICY profiles_delete ON public.profiles
  FOR DELETE USING (public.auth_is_organizer_or_admin());

-- ============================================================================
-- public_profiles: what any visitor may see about a member
-- ============================================================================
-- A plain (security definer) view: it reads past profiles' RLS, so it must
-- list only columns that are safe to publish. Building is kept (the app shows
-- members per building); unit is not (building + unit identifies a tenant to
-- their landlord).

DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
  SELECT
    id,
    nickname,
    role,
    trust_level,
    building_id,
    COALESCE(banned, false) AS banned,
    created_at,
    last_active
  FROM public.profiles;

REVOKE ALL ON public.public_profiles FROM PUBLIC;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- ============================================================================
-- Signup duplicate check without exposing the account
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_email_registered(check_email TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE lower(email) = lower(trim(check_email))
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '';

REVOKE ALL ON FUNCTION public.is_email_registered(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_email_registered(TEXT) TO anon, authenticated;
