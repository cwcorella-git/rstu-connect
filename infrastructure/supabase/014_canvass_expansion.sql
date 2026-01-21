-- Migration: Canvass Expansion
-- Adds missing columns to canvass_units table and creates server functions
-- for secure operations with RLS enforcement.

-- ============================================================================
-- ADD MISSING COLUMNS TO CANVASS_UNITS
-- ============================================================================

-- Household info
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS has_children BOOLEAN;
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS has_pets BOOLEAN;
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS pet_types TEXT;
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS accessibility_needs TEXT;

-- Unit details
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS unit_type TEXT
  CHECK (unit_type IS NULL OR unit_type IN ('apartment', 'house', 'townhouse', 'duplex', 'condo', 'mobile', 'room'));
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS bedroom_count INTEGER;
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS bathroom_count NUMERIC(3,1);
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS unit_sqft INTEGER;

-- Lease info
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS move_in_date DATE;
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS lease_type TEXT
  CHECK (lease_type IS NULL OR lease_type IN ('fixed', 'month-to-month'));
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS lease_expires DATE;
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS security_deposit INTEGER;
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS deposit_issues TEXT;
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS last_rent_increase_amount INTEGER;
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS last_rent_increase_date DATE;

-- Schedule & availability
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS work_hours TEXT;
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS best_time_to_reach TEXT;
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS best_days TEXT[];

-- Maintenance
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS maintenance_rating TEXT
  CHECK (maintenance_rating IS NULL OR maintenance_rating IN ('good', 'ok', 'bad'));
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS avg_response_days INTEGER;
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS outstanding_repairs TEXT;

-- Community & interest
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS knows_neighbors TEXT
  CHECK (knows_neighbors IS NULL OR knows_neighbors IN ('yes', 'somewhat', 'no'));
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS ideal_rent INTEGER;
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS has_organizing_experience BOOLEAN;
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS suggestions TEXT;

-- Habitability & housing quality
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS habitability_issues TEXT[];
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS habitability_quotes TEXT;

-- Subsidy/assistance
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS subsidy_type TEXT
  CHECK (subsidy_type IS NULL OR subsidy_type IN ('none', 'section8', 'lihtc', 'public', 'other'));
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS subsidy_details TEXT;

-- Utilities
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS utilities_included TEXT[];

-- Profile linking
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS profile_nickname TEXT;
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS linked_at TIMESTAMPTZ;

-- Contact tracking
ALTER TABLE public.canvass_units ADD COLUMN IF NOT EXISTS contact_date TIMESTAMPTZ;

-- ============================================================================
-- ADDITIONAL INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_canvass_status ON public.canvass_units(status);
CREATE INDEX IF NOT EXISTS idx_canvass_linked_profile ON public.canvass_units(linked_profile_id) WHERE linked_profile_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_canvass_habitability ON public.canvass_units USING gin(habitability_issues) WHERE habitability_issues IS NOT NULL;

-- ============================================================================
-- BUILDING DATA DISCREPANCIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.building_discrepancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id TEXT NOT NULL UNIQUE,
  actual_units INTEGER,
  actual_name TEXT,
  actual_address TEXT,
  management_company TEXT,
  notes TEXT,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_building_discrepancies_building ON public.building_discrepancies(building_id);

-- RLS for building_discrepancies
ALTER TABLE public.building_discrepancies ENABLE ROW LEVEL SECURITY;

CREATE POLICY building_discrepancies_select_organizer ON public.building_discrepancies
  FOR SELECT USING (is_current_user_organizer_or_higher());

CREATE POLICY building_discrepancies_insert_organizer ON public.building_discrepancies
  FOR INSERT WITH CHECK (is_current_user_organizer_or_higher());

CREATE POLICY building_discrepancies_update_organizer ON public.building_discrepancies
  FOR UPDATE USING (is_current_user_organizer_or_higher());

-- ============================================================================
-- ISSUE TIMELINES TABLE (for habitability trend tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.issue_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id TEXT NOT NULL,
  issue_key TEXT NOT NULL,
  month TEXT NOT NULL,  -- 'YYYY-MM' format
  unit_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One snapshot per building/issue/month
  UNIQUE(building_id, issue_key, month)
);

CREATE INDEX IF NOT EXISTS idx_issue_snapshots_building ON public.issue_snapshots(building_id);
CREATE INDEX IF NOT EXISTS idx_issue_snapshots_month ON public.issue_snapshots(month);

-- RLS for issue_snapshots
ALTER TABLE public.issue_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY issue_snapshots_select_organizer ON public.issue_snapshots
  FOR SELECT USING (is_current_user_organizer_or_higher());

CREATE POLICY issue_snapshots_insert_organizer ON public.issue_snapshots
  FOR INSERT WITH CHECK (is_current_user_organizer_or_higher());

-- ============================================================================
-- SERVER FUNCTIONS FOR CANVASS OPERATIONS
-- ============================================================================

-- Function to update unit with permission check
CREATE OR REPLACE FUNCTION update_canvass_unit_secure(
  p_building_id TEXT,
  p_unit_number TEXT,
  p_status TEXT DEFAULT NULL,
  p_contact_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_rent_amount INTEGER DEFAULT NULL,
  p_complaints TEXT[] DEFAULT NULL,
  p_interest_levels TEXT[] DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_habitability_issues TEXT[] DEFAULT NULL,
  p_habitability_quotes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_is_organizer BOOLEAN;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  -- Check permission (organizer+ only for canvass data)
  v_is_organizer := is_current_user_organizer_or_higher();
  IF NOT v_is_organizer THEN
    RETURN json_build_object('success', false, 'error', 'Only organizers can update canvass data');
  END IF;

  -- Validate status if provided
  IF p_status IS NOT NULL AND p_status NOT IN ('NOT_CONTACTED', 'NO_ANSWER', 'CONTACTED', 'INTERESTED', 'NOT_INTERESTED', 'FOLLOW_UP', 'ACTIVE_MEMBER') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid status');
  END IF;

  -- Update the unit
  UPDATE public.canvass_units
  SET
    status = COALESCE(p_status, status),
    contact_name = COALESCE(p_contact_name, contact_name),
    phone = COALESCE(p_phone, phone),
    email = COALESCE(p_email, email),
    rent_amount = COALESCE(p_rent_amount, rent_amount),
    complaints = COALESCE(p_complaints, complaints),
    interest_levels = COALESCE(p_interest_levels, interest_levels),
    notes = COALESCE(p_notes, notes),
    habitability_issues = COALESCE(p_habitability_issues, habitability_issues),
    habitability_quotes = COALESCE(p_habitability_quotes, habitability_quotes),
    contact_date = CASE WHEN p_status IS NOT NULL THEN NOW() ELSE contact_date END,
    updated_at = NOW()
  WHERE building_id = p_building_id AND unit_number = p_unit_number;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Unit not found');
  END IF;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to link profile to unit
CREATE OR REPLACE FUNCTION link_profile_to_unit_secure(
  p_building_id TEXT,
  p_unit_number TEXT,
  p_profile_id UUID,
  p_profile_nickname TEXT,
  p_is_verified BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_current_status TEXT;
  v_new_status TEXT;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  -- Users can only link themselves (or organizers can link anyone)
  IF p_profile_id != v_user_id AND NOT is_current_user_organizer_or_higher() THEN
    RETURN json_build_object('success', false, 'error', 'Can only link your own profile');
  END IF;

  -- Get current status
  SELECT status INTO v_current_status
  FROM public.canvass_units
  WHERE building_id = p_building_id AND unit_number = p_unit_number;

  IF v_current_status IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Unit not found');
  END IF;

  -- Determine new status based on current and verification
  v_new_status := v_current_status;
  IF v_current_status IN ('NOT_CONTACTED', 'NO_ANSWER') THEN
    v_new_status := CASE WHEN p_is_verified THEN 'ACTIVE_MEMBER' ELSE 'INTERESTED' END;
  ELSIF p_is_verified AND v_current_status = 'INTERESTED' THEN
    v_new_status := 'ACTIVE_MEMBER';
  END IF;

  -- Update the unit
  UPDATE public.canvass_units
  SET
    linked_profile_id = p_profile_id,
    profile_nickname = p_profile_nickname,
    linked_at = NOW(),
    status = v_new_status,
    updated_at = NOW()
  WHERE building_id = p_building_id AND unit_number = p_unit_number;

  RETURN json_build_object('success', true, 'new_status', v_new_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to unlink profile from unit
CREATE OR REPLACE FUNCTION unlink_profile_from_unit_secure(
  p_building_id TEXT,
  p_unit_number TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_linked_profile UUID;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  -- Get linked profile
  SELECT linked_profile_id INTO v_linked_profile
  FROM public.canvass_units
  WHERE building_id = p_building_id AND unit_number = p_unit_number;

  -- Users can only unlink themselves (or organizers can unlink anyone)
  IF v_linked_profile != v_user_id AND NOT is_current_user_organizer_or_higher() THEN
    RETURN json_build_object('success', false, 'error', 'Can only unlink your own profile');
  END IF;

  -- Update the unit
  UPDATE public.canvass_units
  SET
    linked_profile_id = NULL,
    profile_nickname = NULL,
    linked_at = NULL,
    updated_at = NOW()
  WHERE building_id = p_building_id AND unit_number = p_unit_number;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to get building habitability score (aggregated)
CREATE OR REPLACE FUNCTION get_building_habitability_score(p_building_id TEXT)
RETURNS JSON AS $$
DECLARE
  v_total_units INTEGER;
  v_units_with_issues INTEGER;
  v_issue_counts JSON;
BEGIN
  -- Count total units
  SELECT COUNT(*) INTO v_total_units
  FROM public.canvass_units
  WHERE building_id = p_building_id;

  IF v_total_units = 0 THEN
    RETURN json_build_object('total_units', 0, 'units_with_issues', 0, 'issues', '{}');
  END IF;

  -- Count units with habitability issues
  SELECT COUNT(*) INTO v_units_with_issues
  FROM public.canvass_units
  WHERE building_id = p_building_id
    AND habitability_issues IS NOT NULL
    AND array_length(habitability_issues, 1) > 0;

  -- Get issue breakdown
  SELECT json_object_agg(issue, cnt) INTO v_issue_counts
  FROM (
    SELECT unnest(habitability_issues) as issue, COUNT(*) as cnt
    FROM public.canvass_units
    WHERE building_id = p_building_id
      AND habitability_issues IS NOT NULL
    GROUP BY issue
  ) issues;

  RETURN json_build_object(
    'total_units', v_total_units,
    'units_with_issues', v_units_with_issues,
    'issues', COALESCE(v_issue_counts, '{}'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to record issue snapshot
CREATE OR REPLACE FUNCTION record_issue_snapshot(
  p_building_id TEXT,
  p_issue_key TEXT,
  p_unit_count INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_month TEXT;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  IF NOT is_current_user_organizer_or_higher() THEN
    RETURN json_build_object('success', false, 'error', 'Only organizers can record snapshots');
  END IF;

  v_month := to_char(NOW(), 'YYYY-MM');

  INSERT INTO public.issue_snapshots (building_id, issue_key, month, unit_count)
  VALUES (p_building_id, p_issue_key, v_month, p_unit_count)
  ON CONFLICT (building_id, issue_key, month) DO UPDATE
  SET unit_count = p_unit_count;

  RETURN json_build_object('success', true, 'month', v_month);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

DROP TRIGGER IF EXISTS building_discrepancies_updated_at ON public.building_discrepancies;
CREATE TRIGGER building_discrepancies_updated_at
  BEFORE UPDATE ON public.building_discrepancies
  FOR EACH ROW EXECUTE FUNCTION update_events_tables_updated_at();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON public.canvass_units TO authenticated;
GRANT INSERT, UPDATE ON public.canvass_units TO authenticated;

GRANT SELECT ON public.building_discrepancies TO authenticated;
GRANT INSERT, UPDATE ON public.building_discrepancies TO authenticated;

GRANT SELECT ON public.issue_snapshots TO authenticated;
GRANT INSERT ON public.issue_snapshots TO authenticated;

GRANT EXECUTE ON FUNCTION update_canvass_unit_secure TO authenticated;
GRANT EXECUTE ON FUNCTION link_profile_to_unit_secure TO authenticated;
GRANT EXECUTE ON FUNCTION unlink_profile_from_unit_secure TO authenticated;
GRANT EXECUTE ON FUNCTION get_building_habitability_score TO authenticated;
GRANT EXECUTE ON FUNCTION record_issue_snapshot TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.building_discrepancies IS 'Organizer notes about building data discrepancies from county records';
COMMENT ON TABLE public.issue_snapshots IS 'Monthly snapshots of habitability issues for trend tracking';

COMMENT ON FUNCTION update_canvass_unit_secure IS 'Update canvass unit with organizer permission check';
COMMENT ON FUNCTION link_profile_to_unit_secure IS 'Link a profile to a canvass unit';
COMMENT ON FUNCTION unlink_profile_from_unit_secure IS 'Unlink a profile from a canvass unit';
COMMENT ON FUNCTION get_building_habitability_score IS 'Get aggregated habitability score for a building';
COMMENT ON FUNCTION record_issue_snapshot IS 'Record monthly issue snapshot for trend tracking';
