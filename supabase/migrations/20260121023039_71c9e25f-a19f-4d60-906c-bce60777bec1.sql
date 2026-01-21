-- Fix the overly permissive INSERT policy on notifications
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create a more restrictive policy - only authenticated users can create notifications for themselves
CREATE POLICY "Users can create their own notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);