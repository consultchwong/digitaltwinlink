-- Add DELETE policy for sessions table to allow users to delete their own sessions
CREATE POLICY "Senders can delete their sessions"
ON public.sessions
FOR DELETE
USING (auth.uid() = sender_id);