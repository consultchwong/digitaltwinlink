-- =============================================
-- FIX 1: Remove overly permissive SELECT policy on session_access
-- =============================================
DROP POLICY IF EXISTS "Users can view their access records" ON public.session_access;

-- =============================================
-- FIX 2: Create rate limiting table for session access attempts
-- =============================================
CREATE TABLE IF NOT EXISTS public.session_access_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL, -- Store hash of IP for privacy
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS on the attempts table (no one should read this directly)
ALTER TABLE public.session_access_attempts ENABLE ROW LEVEL SECURITY;

-- No SELECT policy - table is only for internal tracking
-- Only the SECURITY DEFINER function can insert

-- Create index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_attempts_ip_time 
ON public.session_access_attempts(ip_hash, attempted_at);

-- Auto-cleanup old attempts (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_access_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM session_access_attempts 
  WHERE attempted_at < now() - interval '1 hour';
END;
$$;

-- =============================================
-- FIX 3: Update verify_session_access with rate limiting
-- and session variable for access token validation
-- =============================================
CREATE OR REPLACE FUNCTION public.verify_session_access(session_link_token TEXT)
RETURNS TABLE(session_id UUID, access_token TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ip_hash_val TEXT;
  attempt_count INT;
  found_session_id UUID;
  new_access_token TEXT;
BEGIN
  -- Generate a hash from available request info for rate limiting
  -- Note: inet_client_addr() may not be available in all contexts,
  -- so we use a combination of available identifiers
  ip_hash_val := encode(
    sha256(
      COALESCE(
        current_setting('request.headers', true)::json->>'x-forwarded-for',
        current_setting('request.headers', true)::json->>'x-real-ip',
        'anonymous'
      )::bytea
    ),
    'hex'
  );
  
  -- Cleanup old attempts periodically (1% chance per request)
  IF random() < 0.01 THEN
    PERFORM cleanup_old_access_attempts();
  END IF;
  
  -- Check rate limit: max 10 attempts per minute per IP
  SELECT COUNT(*) INTO attempt_count
  FROM session_access_attempts
  WHERE session_access_attempts.ip_hash = ip_hash_val
    AND attempted_at > now() - interval '1 minute';
  
  IF attempt_count >= 10 THEN
    -- Log the rate-limited attempt
    INSERT INTO session_access_attempts (ip_hash, success)
    VALUES (ip_hash_val, false);
    
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;
  
  -- Find the session by link token
  SELECT s.id INTO found_session_id
  FROM sessions s
  WHERE s.link_token = session_link_token
    AND s.status = 'active'
  LIMIT 1;
  
  -- Log the attempt
  INSERT INTO session_access_attempts (ip_hash, success)
  VALUES (ip_hash_val, found_session_id IS NOT NULL);
  
  IF found_session_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Generate a new access token
  new_access_token := encode(extensions.gen_random_bytes(16), 'hex');
  
  -- Insert access record with reduced expiry (1 hour instead of 24)
  INSERT INTO session_access (session_id, access_token, expires_at)
  VALUES (found_session_id, new_access_token, now() + interval '1 hour')
  ON CONFLICT (session_id, access_token) DO UPDATE 
    SET expires_at = now() + interval '1 hour';
  
  -- Store the verified session and token in session variables for RLS
  PERFORM set_config('app.verified_session_id', found_session_id::text, true);
  PERFORM set_config('app.verified_access_token', new_access_token, true);
  
  RETURN QUERY SELECT found_session_id, new_access_token;
END;
$$;

-- =============================================
-- FIX 4: Update has_session_access to validate access token
-- Now checks both session variable AND stored access records
-- =============================================
CREATE OR REPLACE FUNCTION public.has_session_access(check_session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  verified_session TEXT;
  verified_token TEXT;
BEGIN
  -- Get the verified session from current transaction/request
  verified_session := current_setting('app.verified_session_id', true);
  verified_token := current_setting('app.verified_access_token', true);
  
  -- Check if this session was verified in the current request
  IF verified_session IS NOT NULL AND verified_token IS NOT NULL THEN
    -- Verify the token exists and is not expired
    RETURN EXISTS (
      SELECT 1 FROM session_access sa
      WHERE sa.session_id = check_session_id
        AND sa.session_id::text = verified_session
        AND sa.access_token = verified_token
        AND sa.expires_at > now()
    );
  END IF;
  
  -- No valid verification in this request
  RETURN false;
END;
$$;