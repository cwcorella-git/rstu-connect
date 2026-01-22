-- Migration: Email Verification Codes Table
-- Stores temporary verification codes sent via email

-- ============================================================================
-- Create email_verification_codes table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_verification_codes (
  email TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for cleanup of expired codes
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires
  ON public.email_verification_codes(expires_at)
  WHERE NOT verified;

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE public.email_verification_codes ENABLE ROW LEVEL SECURITY;

-- No direct access from clients - only Edge Functions with service role can access
-- This is intentional for security - codes should not be readable by users

-- ============================================================================
-- Auto-update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_verification_code_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_verification_code_timestamp ON public.email_verification_codes;

CREATE TRIGGER update_verification_code_timestamp
  BEFORE UPDATE ON public.email_verification_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_verification_code_timestamp();

-- ============================================================================
-- Cleanup function for expired codes (can be called periodically)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.email_verification_codes
  WHERE expires_at < NOW() - INTERVAL '1 day'
    AND NOT verified;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Helper function to check if email is verified
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_email_verified(check_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_verified BOOLEAN;
BEGIN
  -- First check the verification codes table
  SELECT verified INTO is_verified
  FROM public.email_verification_codes
  WHERE email = lower(check_email);

  IF is_verified IS TRUE THEN
    RETURN TRUE;
  END IF;

  -- Also check the profiles table
  SELECT email_verified INTO is_verified
  FROM public.profiles
  WHERE email = lower(check_email);

  RETURN COALESCE(is_verified, FALSE);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- Done
-- ============================================================================

-- Summary:
-- 1. Created email_verification_codes table with email as primary key
-- 2. Added RLS (no client access - Edge Functions only)
-- 3. Added auto-update trigger for updated_at
-- 4. Added cleanup function for expired codes
-- 5. Added helper function to check verification status
