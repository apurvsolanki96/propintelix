-- Create client_feedback table for removal and deal closure feedback
CREATE TABLE public.client_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('removal', 'deal_closure')),
  reason TEXT,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 10),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 10),
  response_time_rating INTEGER CHECK (response_time_rating >= 1 AND response_time_rating <= 10),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 10),
  would_recommend BOOLEAN,
  competitor_name TEXT,
  improvement_suggestions TEXT,
  additional_comments TEXT,
  deal_value TEXT,
  is_repeat_customer BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own feedback"
ON public.client_feedback FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create feedback"
ON public.client_feedback FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
ON public.client_feedback FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
ON public.client_feedback FOR DELETE
USING (auth.uid() = user_id);

-- Add status column to companies for tracking deal lifecycle
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deal_closed', 'removed', 'on_hold'));

-- Create OTP table for email/phone verification
CREATE TABLE public.auth_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('email', 'phone')),
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS for OTP table (public access for verification)
ALTER TABLE public.auth_otps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert OTP"
ON public.auth_otps FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can select OTP for verification"
ON public.auth_otps FOR SELECT
USING (true);

CREATE POLICY "Anyone can update OTP"
ON public.auth_otps FOR UPDATE
USING (true);

CREATE POLICY "Cleanup expired OTPs"
ON public.auth_otps FOR DELETE
USING (expires_at < now());