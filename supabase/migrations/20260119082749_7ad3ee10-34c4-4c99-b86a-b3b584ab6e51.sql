-- Add email and contact_number fields to companies table
ALTER TABLE public.companies
ADD COLUMN email text DEFAULT NULL,
ADD COLUMN contact_number text DEFAULT NULL,
ADD COLUMN verified boolean DEFAULT false,
ADD COLUMN verification_token text DEFAULT NULL;