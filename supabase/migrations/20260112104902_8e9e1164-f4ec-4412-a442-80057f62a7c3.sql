-- Fix the session_access_attempts RLS warnings
-- This table should ONLY be written to by SECURITY DEFINER functions
-- No direct user access is needed

-- Drop the existing INSERT policy if it exists (shouldn't exist yet)
DROP POLICY IF EXISTS "Anyone can create session access" ON public.session_access;

-- Create a restrictive INSERT policy for session_access (existing table)
-- Only allow inserts where session_id matches an active session
-- This doesn't affect SECURITY DEFINER functions
CREATE POLICY "Session access restricted insert"
ON public.session_access
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sessions s 
    WHERE s.id = session_id 
    AND s.status = 'active'
  )
);

-- For session_access_attempts, we don't need any policies
-- since it's only accessed by SECURITY DEFINER functions
-- But to satisfy the linter, add a restrictive policy that denies all direct access

-- Add a SELECT policy that denies all (false condition)
CREATE POLICY "No direct read access"
ON public.session_access_attempts
FOR SELECT
USING (false);

-- Add an INSERT policy that denies all direct inserts
-- SECURITY DEFINER functions bypass RLS so this is fine
CREATE POLICY "No direct insert access"
ON public.session_access_attempts
FOR INSERT
WITH CHECK (false);