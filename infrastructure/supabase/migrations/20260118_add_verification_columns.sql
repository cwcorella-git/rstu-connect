-- Add verification tracking columns to profiles table

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.profiles(id);

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
AND column_name IN ('verified_at', 'verified_by');
