-- Migration: Secure Proposal Finalization RPC
-- Adds server-side finalization for proposals that require organizer approval
-- Prevents client-side authorization bypass for mute-tenant and other finalization-required proposals

-- ============================================================================
-- SECURE PROPOSAL FINALIZATION
-- Validates: user is organizer or admin, proposal is in pending-finalize status
-- For mute-tenant proposals, also updates linked_property_groups.muted_profiles
-- ============================================================================

CREATE OR REPLACE FUNCTION finalize_proposal_secure(
  p_actor_id UUID,
  p_proposal_id UUID
) RETURNS JSONB
SET search_path = ''
LANGUAGE plpgsql AS $$
DECLARE
  actor_record RECORD;
  proposal_record RECORD;
  current_muted UUID[];
BEGIN
  -- Get actor info
  SELECT id, role, banned
  INTO actor_record
  FROM public.profiles
  WHERE id = p_actor_id;

  IF actor_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  IF actor_record.banned THEN
    RETURN jsonb_build_object('success', false, 'error', 'Account is banned');
  END IF;

  -- Only organizers and admins can finalize proposals
  IF actor_record.role NOT IN ('organizer', 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only organizers can finalize proposals');
  END IF;

  -- Get proposal info
  SELECT id, type, status, group_id, target_profile_id
  INTO proposal_record
  FROM public.governance_proposals
  WHERE id = p_proposal_id;

  IF proposal_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Proposal not found');
  END IF;

  -- Check proposal status
  IF proposal_record.status != 'pending-finalize' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Proposal is not awaiting finalization');
  END IF;

  -- Update proposal to executed
  UPDATE public.governance_proposals SET
    status = 'executed',
    finalized_by = p_actor_id,
    executed_at = NOW()
  WHERE id = p_proposal_id;

  -- Execute side effects based on proposal type
  IF proposal_record.type = 'mute-tenant' AND proposal_record.target_profile_id IS NOT NULL THEN
    -- Get current muted profiles for the group
    SELECT COALESCE(muted_profiles, '{}')
    INTO current_muted
    FROM public.linked_property_groups
    WHERE id = proposal_record.group_id::UUID;

    -- Add target to muted_profiles if not already muted
    IF current_muted IS NOT NULL AND NOT (proposal_record.target_profile_id = ANY(current_muted)) THEN
      UPDATE public.linked_property_groups SET
        muted_profiles = array_append(COALESCE(muted_profiles, '{}'), proposal_record.target_profile_id)
      WHERE id = proposal_record.group_id::UUID;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'proposal_id', p_proposal_id,
    'finalized_by', p_actor_id
  );
EXCEPTION
  WHEN undefined_table THEN
    RETURN jsonb_build_object('success', false, 'error', 'Required tables not configured');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ============================================================================
-- GRANT EXECUTE TO ANON/AUTHENTICATED ROLES
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.finalize_proposal_secure TO anon, authenticated;
