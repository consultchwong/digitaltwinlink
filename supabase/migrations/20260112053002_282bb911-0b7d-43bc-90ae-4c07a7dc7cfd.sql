-- Create session access tracking table
-- This allows us to track when a user accesses a session via link token
-- and enforce access at the RLS level
CREATE TABLE IF NOT EXISTS public.session_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  UNIQUE(session_id, access_token)
);

-- Enable RLS on session_access
ALTER TABLE public.session_access ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert access records (when they have a valid link token)
CREATE POLICY "Anyone can create session access"
ON public.session_access
FOR INSERT
WITH CHECK (true);

-- Policy: Users can view their own access records
CREATE POLICY "Users can view their access records"
ON public.session_access
FOR SELECT
USING (true);

-- Create a secure function to verify link token and grant access
CREATE OR REPLACE FUNCTION public.verify_session_access(session_link_token TEXT)
RETURNS TABLE(session_id UUID, access_token TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_session_id UUID;
  new_access_token TEXT;
BEGIN
  -- Find the session by link token
  SELECT s.id INTO found_session_id
  FROM sessions s
  WHERE s.link_token = session_link_token
    AND s.status = 'active'
  LIMIT 1;
  
  IF found_session_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Generate a new access token
  new_access_token := encode(extensions.gen_random_bytes(16), 'hex');
  
  -- Insert access record
  INSERT INTO session_access (session_id, access_token, expires_at)
  VALUES (found_session_id, new_access_token, now() + interval '24 hours')
  ON CONFLICT (session_id, access_token) DO UPDATE 
    SET expires_at = now() + interval '24 hours';
  
  RETURN QUERY SELECT found_session_id, new_access_token;
END;
$$;

-- Create function to check if user has valid access to a session
CREATE OR REPLACE FUNCTION public.has_session_access(check_session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if there's a valid unexpired access record
  RETURN EXISTS (
    SELECT 1 FROM session_access sa
    WHERE sa.session_id = check_session_id
      AND sa.expires_at > now()
  );
END;
$$;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view session by link token" ON public.sessions;

-- Create new secure policy for sessions
-- Only allow viewing if user is sender OR has valid access
CREATE POLICY "Users can view accessible sessions"
ON public.sessions
FOR SELECT
USING (
  auth.uid() = sender_id 
  OR public.has_session_access(id)
);

-- Update chat_messages SELECT policy to also check session access
DROP POLICY IF EXISTS "Users can view messages in accessible sessions" ON public.chat_messages;

CREATE POLICY "Users can view messages in accessible sessions"
ON public.chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM sessions s
    WHERE s.id = chat_messages.session_id
      AND (s.sender_id = auth.uid() OR public.has_session_access(s.id))
  )
);

-- Update chat_messages INSERT policy to check session access
DROP POLICY IF EXISTS "Users can insert messages in active sessions" ON public.chat_messages;

CREATE POLICY "Users can insert messages in active sessions"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sessions s
    WHERE s.id = chat_messages.session_id
      AND s.status = 'active'
      AND (s.sender_id = auth.uid() OR public.has_session_access(s.id))
  )
);