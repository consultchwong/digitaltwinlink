-- Allow viewing characters that are part of accessible sessions
CREATE POLICY "Users can view characters in accessible sessions"
ON public.characters
FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM sessions s
    WHERE s.character_id = characters.id
      AND public.has_session_access(s.id)
  )
);