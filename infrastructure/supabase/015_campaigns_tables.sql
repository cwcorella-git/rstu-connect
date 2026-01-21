-- Migration: Campaigns Tables
-- Tracks building organizing campaigns from intelligence gathering through resolution.
-- Integrates with events and canvassing systems.

-- ============================================================================
-- CAMPAIGNS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  landlord_name TEXT NOT NULL,

  -- Status
  stage TEXT NOT NULL DEFAULT 'intelligence'
    CHECK (stage IN ('intelligence', 'organizing', 'commitment', 'preparation', 'active', 'resolved')),
  outcome TEXT NOT NULL DEFAULT 'pending'
    CHECK (outcome IN ('pending', 'won', 'lost', 'partial')),

  -- Timeline
  start_date DATE NOT NULL,
  target_date DATE,
  resolved_date DATE,

  -- Metrics
  estimated_units INTEGER,
  participating_units INTEGER,
  monthly_rent_at_risk INTEGER,

  -- Next action
  next_action TEXT,
  next_action_date DATE,
  next_action_assignee TEXT,

  -- Outcome details
  outcome_details TEXT,

  -- Meta
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_stage ON public.campaigns(stage);
CREATE INDEX IF NOT EXISTS idx_campaigns_outcome ON public.campaigns(outcome);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON public.campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_landlord ON public.campaigns(landlord_name);

-- ============================================================================
-- CAMPAIGN BUILDINGS JUNCTION TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.campaign_buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  building_chat_slug TEXT NOT NULL,
  building_address TEXT,
  strike_preparation_id UUID,  -- Links to strike preparation if exists
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(campaign_id, building_chat_slug)
);

CREATE INDEX IF NOT EXISTS idx_campaign_buildings_campaign ON public.campaign_buildings(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_buildings_slug ON public.campaign_buildings(building_chat_slug);

-- ============================================================================
-- CAMPAIGN STAGE CHANGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.campaign_stage_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  stage TEXT NOT NULL
    CHECK (stage IN ('intelligence', 'organizing', 'commitment', 'preparation', 'active', 'resolved')),
  changed_at DATE NOT NULL,
  changed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_stage_changes_campaign ON public.campaign_stage_changes(campaign_id);

-- ============================================================================
-- CAMPAIGN DEMANDS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.campaign_demands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed', 'approved', 'won', 'lost', 'compromised')),
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_demands_campaign ON public.campaign_demands(campaign_id);

-- ============================================================================
-- CAMPAIGN NOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.campaign_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  note_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_notes_campaign ON public.campaign_notes(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_notes_date ON public.campaign_notes(note_date DESC);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_stage_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_notes ENABLE ROW LEVEL SECURITY;

-- Campaigns: organizers+ can view and modify
CREATE POLICY campaigns_select_organizer ON public.campaigns
  FOR SELECT USING (is_current_user_organizer_or_higher());

CREATE POLICY campaigns_insert_organizer ON public.campaigns
  FOR INSERT WITH CHECK (is_current_user_organizer_or_higher());

CREATE POLICY campaigns_update_organizer ON public.campaigns
  FOR UPDATE USING (is_current_user_organizer_or_higher());

CREATE POLICY campaigns_delete_admin ON public.campaigns
  FOR DELETE USING (is_current_user_admin());

-- Campaign buildings: follow campaign permissions
CREATE POLICY campaign_buildings_select ON public.campaign_buildings
  FOR SELECT USING (is_current_user_organizer_or_higher());

CREATE POLICY campaign_buildings_insert ON public.campaign_buildings
  FOR INSERT WITH CHECK (is_current_user_organizer_or_higher());

CREATE POLICY campaign_buildings_update ON public.campaign_buildings
  FOR UPDATE USING (is_current_user_organizer_or_higher());

CREATE POLICY campaign_buildings_delete ON public.campaign_buildings
  FOR DELETE USING (is_current_user_organizer_or_higher());

-- Stage changes: follow campaign permissions
CREATE POLICY campaign_stage_changes_select ON public.campaign_stage_changes
  FOR SELECT USING (is_current_user_organizer_or_higher());

CREATE POLICY campaign_stage_changes_insert ON public.campaign_stage_changes
  FOR INSERT WITH CHECK (is_current_user_organizer_or_higher());

-- Demands: follow campaign permissions
CREATE POLICY campaign_demands_select ON public.campaign_demands
  FOR SELECT USING (is_current_user_organizer_or_higher());

CREATE POLICY campaign_demands_insert ON public.campaign_demands
  FOR INSERT WITH CHECK (is_current_user_organizer_or_higher());

CREATE POLICY campaign_demands_update ON public.campaign_demands
  FOR UPDATE USING (is_current_user_organizer_or_higher());

CREATE POLICY campaign_demands_delete ON public.campaign_demands
  FOR DELETE USING (is_current_user_organizer_or_higher());

-- Notes: follow campaign permissions
CREATE POLICY campaign_notes_select ON public.campaign_notes
  FOR SELECT USING (is_current_user_organizer_or_higher());

CREATE POLICY campaign_notes_insert ON public.campaign_notes
  FOR INSERT WITH CHECK (is_current_user_organizer_or_higher());

CREATE POLICY campaign_notes_delete ON public.campaign_notes
  FOR DELETE USING (is_current_user_organizer_or_higher());

-- ============================================================================
-- SERVER FUNCTIONS
-- ============================================================================

-- Create campaign with server-side validation (already referenced in campaignStorage.ts)
CREATE OR REPLACE FUNCTION create_campaign_secure(
  p_creator_id UUID,
  p_name TEXT,
  p_building_ids TEXT[],
  p_building_addresses TEXT[],
  p_landlord_name TEXT,
  p_start_date DATE,
  p_target_date DATE DEFAULT NULL,
  p_estimated_units INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_campaign_id UUID;
  v_building_id TEXT;
  v_building_address TEXT;
  v_idx INTEGER;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  -- Verify creator matches current user
  IF p_creator_id != v_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Creator ID must match current user');
  END IF;

  -- Check permission (organizer+ only)
  IF NOT is_current_user_organizer_or_higher() THEN
    RETURN json_build_object('success', false, 'error', 'Only organizers can create campaigns');
  END IF;

  -- Validate input
  IF p_name IS NULL OR length(trim(p_name)) = 0 THEN
    RETURN json_build_object('success', false, 'error', 'Campaign name is required');
  END IF;

  IF p_landlord_name IS NULL OR length(trim(p_landlord_name)) = 0 THEN
    RETURN json_build_object('success', false, 'error', 'Landlord name is required');
  END IF;

  IF p_building_ids IS NULL OR array_length(p_building_ids, 1) = 0 THEN
    RETURN json_build_object('success', false, 'error', 'At least one building is required');
  END IF;

  -- Create campaign
  INSERT INTO public.campaigns (
    name,
    landlord_name,
    stage,
    outcome,
    start_date,
    target_date,
    estimated_units,
    created_by
  ) VALUES (
    trim(p_name),
    trim(p_landlord_name),
    'intelligence',
    'pending',
    p_start_date,
    p_target_date,
    p_estimated_units,
    p_creator_id
  ) RETURNING id INTO v_campaign_id;

  -- Link buildings
  v_idx := 1;
  FOREACH v_building_id IN ARRAY p_building_ids LOOP
    v_building_address := NULL;
    IF p_building_addresses IS NOT NULL AND v_idx <= array_length(p_building_addresses, 1) THEN
      v_building_address := p_building_addresses[v_idx];
    END IF;

    INSERT INTO public.campaign_buildings (campaign_id, building_chat_slug, building_address)
    VALUES (v_campaign_id, v_building_id, v_building_address);

    v_idx := v_idx + 1;
  END LOOP;

  -- Record initial stage change
  INSERT INTO public.campaign_stage_changes (campaign_id, stage, changed_at, changed_by)
  VALUES (v_campaign_id, 'intelligence', p_start_date, p_creator_id);

  RETURN json_build_object('success', true, 'campaign_id', v_campaign_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Update campaign stage
CREATE OR REPLACE FUNCTION update_campaign_stage_secure(
  p_campaign_id UUID,
  p_new_stage TEXT,
  p_resolved_date DATE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_current_stage TEXT;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  IF NOT is_current_user_organizer_or_higher() THEN
    RETURN json_build_object('success', false, 'error', 'Only organizers can update campaigns');
  END IF;

  -- Validate stage
  IF p_new_stage NOT IN ('intelligence', 'organizing', 'commitment', 'preparation', 'active', 'resolved') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid stage');
  END IF;

  -- Get current stage
  SELECT stage INTO v_current_stage
  FROM public.campaigns
  WHERE id = p_campaign_id;

  IF v_current_stage IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Campaign not found');
  END IF;

  -- Update campaign
  UPDATE public.campaigns
  SET
    stage = p_new_stage,
    resolved_date = CASE WHEN p_new_stage = 'resolved' THEN COALESCE(p_resolved_date, CURRENT_DATE) ELSE resolved_date END,
    updated_at = NOW()
  WHERE id = p_campaign_id;

  -- Record stage change
  INSERT INTO public.campaign_stage_changes (campaign_id, stage, changed_at, changed_by)
  VALUES (p_campaign_id, p_new_stage, CURRENT_DATE, v_user_id);

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Update campaign outcome
CREATE OR REPLACE FUNCTION update_campaign_outcome_secure(
  p_campaign_id UUID,
  p_outcome TEXT,
  p_outcome_details TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  IF NOT is_current_user_organizer_or_higher() THEN
    RETURN json_build_object('success', false, 'error', 'Only organizers can update campaigns');
  END IF;

  -- Validate outcome
  IF p_outcome NOT IN ('pending', 'won', 'lost', 'partial') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid outcome');
  END IF;

  UPDATE public.campaigns
  SET
    outcome = p_outcome,
    outcome_details = COALESCE(p_outcome_details, outcome_details),
    updated_at = NOW()
  WHERE id = p_campaign_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Campaign not found');
  END IF;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Add demand to campaign
CREATE OR REPLACE FUNCTION add_campaign_demand_secure(
  p_campaign_id UUID,
  p_text TEXT,
  p_status TEXT DEFAULT 'proposed'
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_demand_id UUID;
  v_max_order INTEGER;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  IF NOT is_current_user_organizer_or_higher() THEN
    RETURN json_build_object('success', false, 'error', 'Only organizers can add demands');
  END IF;

  -- Get max sort order
  SELECT COALESCE(MAX(sort_order), 0) INTO v_max_order
  FROM public.campaign_demands
  WHERE campaign_id = p_campaign_id;

  INSERT INTO public.campaign_demands (campaign_id, text, status, sort_order)
  VALUES (p_campaign_id, trim(p_text), p_status, v_max_order + 1)
  RETURNING id INTO v_demand_id;

  -- Update campaign timestamp
  UPDATE public.campaigns SET updated_at = NOW() WHERE id = p_campaign_id;

  RETURN json_build_object('success', true, 'demand_id', v_demand_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Update demand status
CREATE OR REPLACE FUNCTION update_campaign_demand_secure(
  p_demand_id UUID,
  p_status TEXT DEFAULT NULL,
  p_text TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_campaign_id UUID;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  IF NOT is_current_user_organizer_or_higher() THEN
    RETURN json_build_object('success', false, 'error', 'Only organizers can update demands');
  END IF;

  -- Validate status if provided
  IF p_status IS NOT NULL AND p_status NOT IN ('proposed', 'approved', 'won', 'lost', 'compromised') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid status');
  END IF;

  UPDATE public.campaign_demands
  SET
    status = COALESCE(p_status, status),
    text = COALESCE(trim(p_text), text),
    notes = COALESCE(p_notes, notes),
    updated_at = NOW()
  WHERE id = p_demand_id
  RETURNING campaign_id INTO v_campaign_id;

  IF v_campaign_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Demand not found');
  END IF;

  -- Update campaign timestamp
  UPDATE public.campaigns SET updated_at = NOW() WHERE id = v_campaign_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Add note to campaign
CREATE OR REPLACE FUNCTION add_campaign_note_secure(
  p_campaign_id UUID,
  p_author TEXT,
  p_text TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_note_id UUID;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  IF NOT is_current_user_organizer_or_higher() THEN
    RETURN json_build_object('success', false, 'error', 'Only organizers can add notes');
  END IF;

  INSERT INTO public.campaign_notes (campaign_id, author, text, created_by)
  VALUES (p_campaign_id, trim(p_author), trim(p_text), v_user_id)
  RETURNING id INTO v_note_id;

  -- Update campaign timestamp
  UPDATE public.campaigns SET updated_at = NOW() WHERE id = p_campaign_id;

  RETURN json_build_object('success', true, 'note_id', v_note_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Link strike preparation to campaign building
CREATE OR REPLACE FUNCTION link_strike_to_campaign_secure(
  p_campaign_id UUID,
  p_chat_slug TEXT,
  p_strike_preparation_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  IF NOT is_current_user_organizer_or_higher() THEN
    RETURN json_build_object('success', false, 'error', 'Only organizers can link strikes');
  END IF;

  UPDATE public.campaign_buildings
  SET strike_preparation_id = p_strike_preparation_id
  WHERE campaign_id = p_campaign_id AND building_chat_slug = p_chat_slug;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Campaign building not found');
  END IF;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Get campaigns for a building
CREATE OR REPLACE FUNCTION get_building_campaigns(p_chat_slug TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  landlord_name TEXT,
  stage TEXT,
  outcome TEXT,
  start_date DATE,
  target_date DATE,
  estimated_units INTEGER,
  participating_units INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.landlord_name,
    c.stage,
    c.outcome,
    c.start_date,
    c.target_date,
    c.estimated_units,
    c.participating_units
  FROM public.campaigns c
  JOIN public.campaign_buildings cb ON cb.campaign_id = c.id
  WHERE cb.building_chat_slug = p_chat_slug
  ORDER BY c.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS campaigns_updated_at ON public.campaigns;
CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION update_campaigns_updated_at();

DROP TRIGGER IF EXISTS campaign_demands_updated_at ON public.campaign_demands;
CREATE TRIGGER campaign_demands_updated_at
  BEFORE UPDATE ON public.campaign_demands
  FOR EACH ROW EXECUTE FUNCTION update_campaigns_updated_at();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON public.campaigns TO authenticated;
GRANT INSERT, UPDATE ON public.campaigns TO authenticated;
GRANT DELETE ON public.campaigns TO authenticated;

GRANT SELECT ON public.campaign_buildings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.campaign_buildings TO authenticated;

GRANT SELECT ON public.campaign_stage_changes TO authenticated;
GRANT INSERT ON public.campaign_stage_changes TO authenticated;

GRANT SELECT ON public.campaign_demands TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.campaign_demands TO authenticated;

GRANT SELECT ON public.campaign_notes TO authenticated;
GRANT INSERT, DELETE ON public.campaign_notes TO authenticated;

GRANT EXECUTE ON FUNCTION create_campaign_secure TO authenticated;
GRANT EXECUTE ON FUNCTION update_campaign_stage_secure TO authenticated;
GRANT EXECUTE ON FUNCTION update_campaign_outcome_secure TO authenticated;
GRANT EXECUTE ON FUNCTION add_campaign_demand_secure TO authenticated;
GRANT EXECUTE ON FUNCTION update_campaign_demand_secure TO authenticated;
GRANT EXECUTE ON FUNCTION add_campaign_note_secure TO authenticated;
GRANT EXECUTE ON FUNCTION link_strike_to_campaign_secure TO authenticated;
GRANT EXECUTE ON FUNCTION get_building_campaigns TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.campaigns IS 'Organizing campaigns from intelligence gathering through resolution';
COMMENT ON TABLE public.campaign_buildings IS 'Buildings linked to organizing campaigns';
COMMENT ON TABLE public.campaign_stage_changes IS 'History of campaign stage transitions';
COMMENT ON TABLE public.campaign_demands IS 'Tenant demands for each campaign';
COMMENT ON TABLE public.campaign_notes IS 'Campaign activity notes and updates';

COMMENT ON FUNCTION create_campaign_secure IS 'Create campaign with server-side organizer permission check';
COMMENT ON FUNCTION update_campaign_stage_secure IS 'Update campaign stage with automatic stage change tracking';
COMMENT ON FUNCTION update_campaign_outcome_secure IS 'Update campaign outcome (won/lost/partial)';
COMMENT ON FUNCTION add_campaign_demand_secure IS 'Add a demand to a campaign';
COMMENT ON FUNCTION update_campaign_demand_secure IS 'Update demand status or text';
COMMENT ON FUNCTION add_campaign_note_secure IS 'Add a note to a campaign';
COMMENT ON FUNCTION link_strike_to_campaign_secure IS 'Link strike preparation to campaign building';
COMMENT ON FUNCTION get_building_campaigns IS 'Get all campaigns for a building';
