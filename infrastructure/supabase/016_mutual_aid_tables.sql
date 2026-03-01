-- Migration: Mutual Aid Tables
-- Manages needs/offers posts, skills directory, and resource library.
-- Based on Dean Spade's mutual aid principles.

-- ============================================================================
-- CLEANUP: Drop tables if they exist with wrong schema (from failed runs)
-- ============================================================================

-- Only drop if columns are missing (check via function)
DO $$
BEGIN
  -- Check if mutual_aid_posts exists but is missing building_apn
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mutual_aid_posts' AND table_schema = 'public')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mutual_aid_posts' AND column_name = 'building_apn' AND table_schema = 'public')
  THEN
    DROP TABLE IF EXISTS public.mutual_aid_posts CASCADE;
  END IF;

  -- Check if mutual_aid_resources exists but is missing building_apn
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mutual_aid_resources' AND table_schema = 'public')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mutual_aid_resources' AND column_name = 'building_apn' AND table_schema = 'public')
  THEN
    DROP TABLE IF EXISTS public.mutual_aid_resources CASCADE;
  END IF;

  -- Check if mutual_aid_skill_profiles exists but is missing building_apn
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mutual_aid_skill_profiles' AND table_schema = 'public')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mutual_aid_skill_profiles' AND column_name = 'building_apn' AND table_schema = 'public')
  THEN
    DROP TABLE IF EXISTS public.mutual_aid_skill_profiles CASCADE;
  END IF;
END $$;

-- ============================================================================
-- MUTUAL AID POSTS TABLE (needs/offers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mutual_aid_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('need', 'offer')),
  category TEXT NOT NULL CHECK (category IN (
    'rent_bills', 'legal', 'food', 'childcare', 'moving', 'transportation',
    'housing_search', 'job_referrals', 'emotional_support', 'translation',
    'tech_support', 'labor_physical', 'media_communications', 'cooking_meals', 'other'
  )),
  title TEXT NOT NULL,
  details TEXT,
  building_apn TEXT NOT NULL,
  building_address TEXT,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  author_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'fulfilled', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,

  -- Skill offer fields (standing offers)
  is_skill_offer BOOLEAN DEFAULT FALSE,
  availability TEXT,
  languages TEXT[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mutual_aid_posts_building ON public.mutual_aid_posts(building_apn);
CREATE INDEX IF NOT EXISTS idx_mutual_aid_posts_author ON public.mutual_aid_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_mutual_aid_posts_type ON public.mutual_aid_posts(type);
CREATE INDEX IF NOT EXISTS idx_mutual_aid_posts_status ON public.mutual_aid_posts(status);
CREATE INDEX IF NOT EXISTS idx_mutual_aid_posts_category ON public.mutual_aid_posts(category);
CREATE INDEX IF NOT EXISTS idx_mutual_aid_posts_skill ON public.mutual_aid_posts(is_skill_offer) WHERE is_skill_offer = TRUE;

-- ============================================================================
-- MUTUAL AID RESOURCES TABLE (tool library)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mutual_aid_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('tool', 'book', 'equipment', 'other')),
  owner_id UUID NOT NULL REFERENCES public.profiles(id),
  owner_name TEXT NOT NULL,
  building_apn TEXT NOT NULL,
  building_address TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'checked_out')),
  checked_out_by UUID REFERENCES public.profiles(id),
  checked_out_at TIMESTAMPTZ,
  return_by TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mutual_aid_resources_building ON public.mutual_aid_resources(building_apn);
CREATE INDEX IF NOT EXISTS idx_mutual_aid_resources_owner ON public.mutual_aid_resources(owner_id);
CREATE INDEX IF NOT EXISTS idx_mutual_aid_resources_status ON public.mutual_aid_resources(status);

-- ============================================================================
-- SKILL PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mutual_aid_skill_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.profiles(id) UNIQUE,
  member_name TEXT NOT NULL,
  building_apn TEXT,
  building_address TEXT,
  availability TEXT NOT NULL,
  contact_preference TEXT NOT NULL CHECK (contact_preference IN ('chat', 'profile')),
  languages TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skill_profiles_member ON public.mutual_aid_skill_profiles(member_id);
CREATE INDEX IF NOT EXISTS idx_skill_profiles_building ON public.mutual_aid_skill_profiles(building_apn);

-- ============================================================================
-- SKILL ENTRIES TABLE (skills for each profile)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mutual_aid_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.mutual_aid_skill_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'translation', 'legal', 'tech', 'transportation', 'labor', 'childcare', 'cooking', 'media', 'other'
  )),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skills_profile ON public.mutual_aid_skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.mutual_aid_skills(category);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE public.mutual_aid_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutual_aid_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutual_aid_skill_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutual_aid_skills ENABLE ROW LEVEL SECURITY;

-- Posts: anyone can read, authenticated users can create their own
DROP POLICY IF EXISTS mutual_aid_posts_select ON public.mutual_aid_posts;
CREATE POLICY mutual_aid_posts_select ON public.mutual_aid_posts
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS mutual_aid_posts_insert ON public.mutual_aid_posts;
CREATE POLICY mutual_aid_posts_insert ON public.mutual_aid_posts
  FOR INSERT WITH CHECK (author_id = get_current_user_id());

DROP POLICY IF EXISTS mutual_aid_posts_update ON public.mutual_aid_posts;
CREATE POLICY mutual_aid_posts_update ON public.mutual_aid_posts
  FOR UPDATE USING (author_id = get_current_user_id() OR is_current_user_organizer_or_higher());

DROP POLICY IF EXISTS mutual_aid_posts_delete ON public.mutual_aid_posts;
CREATE POLICY mutual_aid_posts_delete ON public.mutual_aid_posts
  FOR DELETE USING (author_id = get_current_user_id() OR is_current_user_admin());

-- Resources: anyone can read, owners manage their own
DROP POLICY IF EXISTS mutual_aid_resources_select ON public.mutual_aid_resources;
CREATE POLICY mutual_aid_resources_select ON public.mutual_aid_resources
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS mutual_aid_resources_insert ON public.mutual_aid_resources;
CREATE POLICY mutual_aid_resources_insert ON public.mutual_aid_resources
  FOR INSERT WITH CHECK (owner_id = get_current_user_id());

DROP POLICY IF EXISTS mutual_aid_resources_update ON public.mutual_aid_resources;
CREATE POLICY mutual_aid_resources_update ON public.mutual_aid_resources
  FOR UPDATE USING (owner_id = get_current_user_id() OR is_current_user_organizer_or_higher());

DROP POLICY IF EXISTS mutual_aid_resources_delete ON public.mutual_aid_resources;
CREATE POLICY mutual_aid_resources_delete ON public.mutual_aid_resources
  FOR DELETE USING (owner_id = get_current_user_id() OR is_current_user_admin());

-- Skill profiles: anyone can read, users manage their own
DROP POLICY IF EXISTS skill_profiles_select ON public.mutual_aid_skill_profiles;
CREATE POLICY skill_profiles_select ON public.mutual_aid_skill_profiles
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS skill_profiles_insert ON public.mutual_aid_skill_profiles;
CREATE POLICY skill_profiles_insert ON public.mutual_aid_skill_profiles
  FOR INSERT WITH CHECK (member_id = get_current_user_id());

DROP POLICY IF EXISTS skill_profiles_update ON public.mutual_aid_skill_profiles;
CREATE POLICY skill_profiles_update ON public.mutual_aid_skill_profiles
  FOR UPDATE USING (member_id = get_current_user_id());

DROP POLICY IF EXISTS skill_profiles_delete ON public.mutual_aid_skill_profiles;
CREATE POLICY skill_profiles_delete ON public.mutual_aid_skill_profiles
  FOR DELETE USING (member_id = get_current_user_id() OR is_current_user_admin());

-- Skills: follow profile permissions
DROP POLICY IF EXISTS skills_select ON public.mutual_aid_skills;
CREATE POLICY skills_select ON public.mutual_aid_skills
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS skills_insert ON public.mutual_aid_skills;
CREATE POLICY skills_insert ON public.mutual_aid_skills
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.mutual_aid_skill_profiles p WHERE p.id = profile_id AND p.member_id = get_current_user_id())
  );

DROP POLICY IF EXISTS skills_delete ON public.mutual_aid_skills;
CREATE POLICY skills_delete ON public.mutual_aid_skills
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.mutual_aid_skill_profiles p WHERE p.id = profile_id AND p.member_id = get_current_user_id())
  );

-- ============================================================================
-- SERVER FUNCTIONS
-- ============================================================================

-- Create mutual aid post
CREATE OR REPLACE FUNCTION create_mutual_aid_post_secure(
  p_type TEXT,
  p_category TEXT,
  p_title TEXT,
  p_details TEXT,
  p_building_apn TEXT,
  p_building_address TEXT,
  p_is_skill_offer BOOLEAN DEFAULT FALSE,
  p_availability TEXT DEFAULT NULL,
  p_languages TEXT[] DEFAULT NULL,
  p_expires_days INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_user_name TEXT;
  v_post_id UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  -- Get user name
  SELECT nickname INTO v_user_name FROM public.profiles WHERE id = v_user_id;
  IF v_user_name IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Profile not found');
  END IF;

  -- Validate input
  IF p_title IS NULL OR length(trim(p_title)) = 0 THEN
    RETURN json_build_object('success', false, 'error', 'Title is required');
  END IF;

  -- Skill offers expire in 1 year, regular posts in specified days
  v_expires_at := NOW() + (CASE WHEN p_is_skill_offer THEN 365 ELSE p_expires_days END || ' days')::INTERVAL;

  INSERT INTO public.mutual_aid_posts (
    type, category, title, details, building_apn, building_address,
    author_id, author_name, status, expires_at,
    is_skill_offer, availability, languages
  ) VALUES (
    p_type, p_category, trim(p_title), trim(p_details), p_building_apn, p_building_address,
    v_user_id, v_user_name, 'open', v_expires_at,
    p_is_skill_offer, p_availability, p_languages
  ) RETURNING id INTO v_post_id;

  RETURN json_build_object('success', true, 'post_id', v_post_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Update post status
CREATE OR REPLACE FUNCTION update_mutual_aid_post_status_secure(
  p_post_id UUID,
  p_status TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_author_id UUID;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  -- Validate status
  IF p_status NOT IN ('open', 'in_progress', 'fulfilled', 'expired') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid status');
  END IF;

  -- Get author
  SELECT author_id INTO v_author_id FROM public.mutual_aid_posts WHERE id = p_post_id;
  IF v_author_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Post not found');
  END IF;

  -- Check permission
  IF v_author_id != v_user_id AND NOT is_current_user_organizer_or_higher() THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized');
  END IF;

  UPDATE public.mutual_aid_posts
  SET status = p_status, updated_at = NOW()
  WHERE id = p_post_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create resource item
CREATE OR REPLACE FUNCTION create_resource_item_secure(
  p_name TEXT,
  p_description TEXT,
  p_category TEXT,
  p_building_apn TEXT,
  p_building_address TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_user_name TEXT;
  v_item_id UUID;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  SELECT nickname INTO v_user_name FROM public.profiles WHERE id = v_user_id;
  IF v_user_name IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Profile not found');
  END IF;

  INSERT INTO public.mutual_aid_resources (
    name, description, category, owner_id, owner_name, building_apn, building_address
  ) VALUES (
    trim(p_name), trim(p_description), p_category, v_user_id, v_user_name, p_building_apn, p_building_address
  ) RETURNING id INTO v_item_id;

  RETURN json_build_object('success', true, 'item_id', v_item_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Check out resource
CREATE OR REPLACE FUNCTION checkout_resource_secure(
  p_item_id UUID,
  p_return_days INTEGER DEFAULT 7
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_current_status TEXT;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  SELECT status INTO v_current_status FROM public.mutual_aid_resources WHERE id = p_item_id;
  IF v_current_status IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Item not found');
  END IF;

  IF v_current_status != 'available' THEN
    RETURN json_build_object('success', false, 'error', 'Item not available');
  END IF;

  UPDATE public.mutual_aid_resources
  SET
    status = 'checked_out',
    checked_out_by = v_user_id,
    checked_out_at = NOW(),
    return_by = NOW() + (p_return_days || ' days')::INTERVAL,
    updated_at = NOW()
  WHERE id = p_item_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Return resource
CREATE OR REPLACE FUNCTION return_resource_secure(p_item_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_checked_out_by UUID;
  v_owner_id UUID;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  SELECT checked_out_by, owner_id INTO v_checked_out_by, v_owner_id
  FROM public.mutual_aid_resources WHERE id = p_item_id;

  -- Must be borrower or owner to return
  IF v_checked_out_by != v_user_id AND v_owner_id != v_user_id AND NOT is_current_user_organizer_or_higher() THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized');
  END IF;

  UPDATE public.mutual_aid_resources
  SET
    status = 'available',
    checked_out_by = NULL,
    checked_out_at = NULL,
    return_by = NULL,
    updated_at = NOW()
  WHERE id = p_item_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Save skill profile
CREATE OR REPLACE FUNCTION save_skill_profile_secure(
  p_availability TEXT,
  p_contact_preference TEXT,
  p_building_apn TEXT DEFAULT NULL,
  p_building_address TEXT DEFAULT NULL,
  p_languages TEXT[] DEFAULT NULL,
  p_skills JSON DEFAULT '[]'::JSON
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_user_name TEXT;
  v_profile_id UUID;
  v_skill RECORD;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  SELECT nickname INTO v_user_name FROM public.profiles WHERE id = v_user_id;
  IF v_user_name IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Profile not found');
  END IF;

  -- Upsert skill profile
  INSERT INTO public.mutual_aid_skill_profiles (
    member_id, member_name, building_apn, building_address, availability, contact_preference, languages
  ) VALUES (
    v_user_id, v_user_name, p_building_apn, p_building_address, p_availability, p_contact_preference, p_languages
  )
  ON CONFLICT (member_id) DO UPDATE SET
    member_name = EXCLUDED.member_name,
    building_apn = EXCLUDED.building_apn,
    building_address = EXCLUDED.building_address,
    availability = EXCLUDED.availability,
    contact_preference = EXCLUDED.contact_preference,
    languages = EXCLUDED.languages,
    updated_at = NOW()
  RETURNING id INTO v_profile_id;

  -- Delete existing skills
  DELETE FROM public.mutual_aid_skills WHERE profile_id = v_profile_id;

  -- Insert new skills
  FOR v_skill IN SELECT * FROM json_array_elements(p_skills)
  LOOP
    INSERT INTO public.mutual_aid_skills (profile_id, category, description)
    VALUES (
      v_profile_id,
      v_skill.value->>'category',
      v_skill.value->>'description'
    );
  END LOOP;

  RETURN json_build_object('success', true, 'profile_id', v_profile_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Get building mutual aid stats
CREATE OR REPLACE FUNCTION get_building_mutual_aid_stats(p_building_apn TEXT)
RETURNS JSON AS $$
DECLARE
  v_needs_count INTEGER;
  v_offers_count INTEGER;
  v_resources_count INTEGER;
  v_skills_count INTEGER;
  v_skill_offers_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_needs_count
  FROM public.mutual_aid_posts
  WHERE building_apn = p_building_apn AND type = 'need' AND status != 'expired';

  SELECT COUNT(*) INTO v_offers_count
  FROM public.mutual_aid_posts
  WHERE building_apn = p_building_apn AND type = 'offer' AND (is_skill_offer IS NULL OR is_skill_offer = FALSE) AND status != 'expired';

  SELECT COUNT(*) INTO v_resources_count
  FROM public.mutual_aid_resources
  WHERE building_apn = p_building_apn;

  SELECT COUNT(*) INTO v_skills_count
  FROM public.mutual_aid_skill_profiles
  WHERE building_apn = p_building_apn;

  SELECT COUNT(*) INTO v_skill_offers_count
  FROM public.mutual_aid_posts
  WHERE building_apn = p_building_apn AND is_skill_offer = TRUE AND status != 'expired';

  RETURN json_build_object(
    'needs_count', v_needs_count,
    'offers_count', v_offers_count,
    'resources_count', v_resources_count,
    'skills_count', v_skills_count,
    'skill_offers_count', v_skill_offers_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_mutual_aid_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS mutual_aid_posts_updated_at ON public.mutual_aid_posts;
CREATE TRIGGER mutual_aid_posts_updated_at
  BEFORE UPDATE ON public.mutual_aid_posts
  FOR EACH ROW EXECUTE FUNCTION update_mutual_aid_updated_at();

DROP TRIGGER IF EXISTS mutual_aid_resources_updated_at ON public.mutual_aid_resources;
CREATE TRIGGER mutual_aid_resources_updated_at
  BEFORE UPDATE ON public.mutual_aid_resources
  FOR EACH ROW EXECUTE FUNCTION update_mutual_aid_updated_at();

DROP TRIGGER IF EXISTS skill_profiles_updated_at ON public.mutual_aid_skill_profiles;
CREATE TRIGGER skill_profiles_updated_at
  BEFORE UPDATE ON public.mutual_aid_skill_profiles
  FOR EACH ROW EXECUTE FUNCTION update_mutual_aid_updated_at();

-- ============================================================================
-- AUTO-EXPIRE POSTS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION expire_mutual_aid_posts()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.mutual_aid_posts
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'open'
    AND (is_skill_offer IS NULL OR is_skill_offer = FALSE)
    AND expires_at < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON public.mutual_aid_posts TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.mutual_aid_posts TO authenticated;

GRANT SELECT ON public.mutual_aid_resources TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.mutual_aid_resources TO authenticated;

GRANT SELECT ON public.mutual_aid_skill_profiles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.mutual_aid_skill_profiles TO authenticated;

GRANT SELECT ON public.mutual_aid_skills TO authenticated;
GRANT INSERT, DELETE ON public.mutual_aid_skills TO authenticated;

GRANT EXECUTE ON FUNCTION create_mutual_aid_post_secure TO authenticated;
GRANT EXECUTE ON FUNCTION update_mutual_aid_post_status_secure TO authenticated;
GRANT EXECUTE ON FUNCTION create_resource_item_secure TO authenticated;
GRANT EXECUTE ON FUNCTION checkout_resource_secure TO authenticated;
GRANT EXECUTE ON FUNCTION return_resource_secure TO authenticated;
GRANT EXECUTE ON FUNCTION save_skill_profile_secure TO authenticated;
GRANT EXECUTE ON FUNCTION get_building_mutual_aid_stats TO authenticated;
GRANT EXECUTE ON FUNCTION expire_mutual_aid_posts TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.mutual_aid_posts IS 'Mutual aid needs and offers (including skill offers)';
COMMENT ON TABLE public.mutual_aid_resources IS 'Shareable resources (tool library, books, equipment)';
COMMENT ON TABLE public.mutual_aid_skill_profiles IS 'Member skill profiles for directory';
COMMENT ON TABLE public.mutual_aid_skills IS 'Individual skills for each profile';

COMMENT ON FUNCTION create_mutual_aid_post_secure IS 'Create a need or offer post';
COMMENT ON FUNCTION update_mutual_aid_post_status_secure IS 'Update post status (open/in_progress/fulfilled/expired)';
COMMENT ON FUNCTION create_resource_item_secure IS 'Add item to tool library';
COMMENT ON FUNCTION checkout_resource_secure IS 'Check out a resource item';
COMMENT ON FUNCTION return_resource_secure IS 'Return a checked out item';
COMMENT ON FUNCTION save_skill_profile_secure IS 'Save or update skill profile with skills';
COMMENT ON FUNCTION get_building_mutual_aid_stats IS 'Get mutual aid statistics for a building';
COMMENT ON FUNCTION expire_mutual_aid_posts IS 'Mark expired posts (call periodically)';
