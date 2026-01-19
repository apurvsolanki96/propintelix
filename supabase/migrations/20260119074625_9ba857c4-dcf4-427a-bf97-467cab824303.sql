-- Profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  role TEXT,
  phone TEXT,
  plan TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '14 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sector TEXT,
  website TEXT,
  headquarters TEXT,
  employee_count TEXT,
  revenue TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own companies" ON public.companies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own companies" ON public.companies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own companies" ON public.companies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own companies" ON public.companies FOR DELETE USING (auth.uid() = user_id);

-- Client requirements table
CREATE TABLE public.client_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  requirement_type TEXT NOT NULL,
  location TEXT,
  area_sqft TEXT,
  budget TEXT,
  timeline TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.client_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own requirements" ON public.client_requirements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own requirements" ON public.client_requirements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own requirements" ON public.client_requirements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own requirements" ON public.client_requirements FOR DELETE USING (auth.uid() = user_id);

-- Meetings table
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  attendees TEXT[],
  agenda TEXT,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own meetings" ON public.meetings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own meetings" ON public.meetings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own meetings" ON public.meetings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own meetings" ON public.meetings FOR DELETE USING (auth.uid() = user_id);

-- AI Insights/Briefs table
CREATE TABLE public.ai_briefs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  brief_type TEXT DEFAULT 'meeting',
  content JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own briefs" ON public.ai_briefs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own briefs" ON public.ai_briefs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own briefs" ON public.ai_briefs FOR DELETE USING (auth.uid() = user_id);

-- News items table
CREATE TABLE public.news_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  source TEXT,
  url TEXT,
  category TEXT,
  relevance_sectors TEXT[],
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view news" ON public.news_items FOR SELECT USING (true);

-- Demo requests table
CREATE TABLE public.demo_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  company_size TEXT,
  role TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create demo requests" ON public.demo_requests FOR INSERT WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_requirements_updated_at BEFORE UPDATE ON public.client_requirements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample news data for Indian CRE market
INSERT INTO public.news_items (title, summary, source, category, relevance_sectors, published_at) VALUES
('Mumbai Office Space Demand Hits Record High in Q4 2025', 'Commercial office leasing in Mumbai reached 15.2 million sq ft, driven by IT/ITES and BFSI sectors expansion.', 'Economic Times', 'market', ARRAY['IT/ITES', 'BFSI', 'Office'], now() - interval '2 hours'),
('Government Approves 3 New SEZs in Hyderabad', 'The Ministry of Commerce approved three new Special Economic Zones in Hyderabad, expected to generate 50,000 jobs.', 'Business Standard', 'policy', ARRAY['IT/ITES', 'Manufacturing', 'SEZ'], now() - interval '5 hours'),
('FDI in Real Estate Sector Crosses $8 Billion in 2025', 'Foreign direct investment in Indian real estate reached $8.2 billion, with commercial segment leading at 65%.', 'Mint', 'investment', ARRAY['Commercial', 'Investment', 'FDI'], now() - interval '8 hours'),
('Bengaluru Emerges as Top Data Center Destination', 'Bengaluru leads with 450+ MW of data center capacity, attracting global hyperscalers and cloud providers.', 'Financial Express', 'infrastructure', ARRAY['Data Center', 'IT/ITES', 'Technology'], now() - interval '12 hours'),
('RERA Compliance Deadline Extended for Commercial Projects', 'Real Estate Regulatory Authority extends compliance deadline for commercial projects to March 2026.', 'Hindu Business Line', 'regulatory', ARRAY['Regulatory', 'Commercial', 'Compliance'], now() - interval '1 day'),
('Pune Warehousing Sector Witnesses 40% Growth', 'Industrial and logistics sector in Pune sees unprecedented growth with e-commerce and 3PL driving demand.', 'ET Realty', 'market', ARRAY['Logistics', 'Warehousing', 'E-commerce'], now() - interval '1 day'),
('Delhi-NCR Commercial Rentals Up 15% YoY', 'Prime commercial rentals in Gurugram and Noida witness double-digit growth amid limited Grade A supply.', 'Times Property', 'market', ARRAY['Office', 'Retail', 'NCR'], now() - interval '2 days'),
('Smart City Mission Phase 2 to Boost CRE Development', 'Government announces Phase 2 of Smart City Mission with focus on commercial infrastructure development.', 'India Today', 'policy', ARRAY['Infrastructure', 'Smart City', 'Government'], now() - interval '2 days');