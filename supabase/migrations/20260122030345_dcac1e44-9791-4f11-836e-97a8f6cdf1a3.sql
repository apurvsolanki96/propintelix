-- Fix OTP table policies to be more secure using service role
-- The OTP operations should be done via edge functions with service role key

DROP POLICY IF EXISTS "Anyone can insert OTP" ON public.auth_otps;
DROP POLICY IF EXISTS "Anyone can select OTP for verification" ON public.auth_otps;
DROP POLICY IF EXISTS "Anyone can update OTP" ON public.auth_otps;
DROP POLICY IF EXISTS "Cleanup expired OTPs" ON public.auth_otps;

-- Create a security definer function to handle OTP operations
CREATE OR REPLACE FUNCTION public.verify_otp(
  p_identifier TEXT,
  p_otp_code TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valid BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.auth_otps
    WHERE identifier = p_identifier
      AND otp_code = p_otp_code
      AND expires_at > now()
      AND verified = false
  ) INTO v_valid;
  
  IF v_valid THEN
    UPDATE public.auth_otps
    SET verified = true
    WHERE identifier = p_identifier AND otp_code = p_otp_code;
  END IF;
  
  RETURN v_valid;
END;
$$;

-- Create function to generate OTP (called from edge function)
CREATE OR REPLACE FUNCTION public.create_otp(
  p_identifier TEXT,
  p_identifier_type TEXT,
  p_otp_code TEXT,
  p_expires_minutes INTEGER DEFAULT 10
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Delete existing OTPs for this identifier
  DELETE FROM public.auth_otps WHERE identifier = p_identifier;
  
  -- Insert new OTP
  INSERT INTO public.auth_otps (identifier, identifier_type, otp_code, expires_at)
  VALUES (p_identifier, p_identifier_type, p_otp_code, now() + (p_expires_minutes || ' minutes')::interval)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;