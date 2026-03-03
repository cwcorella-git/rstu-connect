-- Migration: Add DELETE policy for profiles table
-- Allows admins/organizers to delete lower-ranked users
-- Permission checks are done in application code

-- Add DELETE policy for profiles
CREATE POLICY profiles_delete ON public.profiles
  FOR DELETE
  USING (true);

-- Note: Application-level checks in deleteProfileAsync():
-- 1. Only organizers/admins can delete
-- 2. Can only delete users with lower role rank
-- 3. Cannot delete self
