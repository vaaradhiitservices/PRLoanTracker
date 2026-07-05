-- Migration: Borrower KYC Document Types Registry and Vault Table

-- 0. Extend public.user_profiles with address columns
ALTER TABLE public.user_profiles 
    ADD COLUMN IF NOT EXISTS address_line1 text,
    ADD COLUMN IF NOT EXISTS address_line2 text,
    ADD COLUMN IF NOT EXISTS city text,
    ADD COLUMN IF NOT EXISTS state text,
    ADD COLUMN IF NOT EXISTS postal_code text,
    ADD COLUMN IF NOT EXISTS aadhaar_number text,
    ADD COLUMN IF NOT EXISTS pan_number text;

-- 1. Create public.document_types table (Integer primary key)
CREATE TABLE public.document_types (
    id serial PRIMARY KEY,
    name text NOT NULL,
    code text NOT NULL UNIQUE,
    is_profile_doc boolean DEFAULT false,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create public.borrower_documents table (UUID primary key)
CREATE TABLE public.borrower_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    borrower_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    document_type_id int REFERENCES public.document_types(id) ON DELETE CASCADE NOT NULL,
    doc_number text,
    file_path text NOT NULL,
    status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    rejection_comment text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(borrower_id, document_type_id)
);

-- Indexing for lookup speed
CREATE INDEX idx_borrower_documents_borrower ON public.borrower_documents(borrower_id);
CREATE INDEX idx_borrower_documents_type ON public.borrower_documents(document_type_id);

-- Enable RLS
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrower_documents ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- RLS POLICIES FOR public.document_types
-- =========================================================================

-- 1. Anyone authenticated can view available document types
CREATE POLICY "Anyone authenticated can read document types" ON public.document_types
    FOR SELECT TO authenticated USING (true);

-- 2. Only Admins can manage document types
CREATE POLICY "Only Admins can manage document types" ON public.document_types
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'Admin'));

-- =========================================================================
-- RLS POLICIES FOR public.borrower_documents
-- =========================================================================

-- 1. Borrower can view own, BankAgents and Admins can view all to verify
CREATE POLICY "Eligible roles can read vault documents" ON public.borrower_documents
    FOR SELECT TO authenticated
    USING (
        borrower_id = auth.uid() OR
        public.has_role(auth.uid(), 'BankAgent') OR
        public.has_role(auth.uid(), 'Admin')
    );

-- 2. Borrowers can insert/update their own document vault items
CREATE POLICY "Borrowers can manage own vault documents" ON public.borrower_documents
    FOR ALL TO authenticated
    USING (borrower_id = auth.uid())
    WITH CHECK (borrower_id = auth.uid());

-- =========================================================================
-- STORAGE SECURITY POLICIES FOR 'kyc' BUCKET
-- =========================================================================

-- 1. Allow authenticated users to upload files to their own folder in the kyc bucket
CREATE POLICY "Allow borrowers to upload kyc" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'kyc' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- 2. Allow owners, bank agents, and admins to read kyc files
CREATE POLICY "Allow owners and appraisers to read kyc" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'kyc' AND (
            (storage.foldername(name))[1] = auth.uid()::text OR
            public.has_role(auth.uid(), 'BankAgent') OR
            public.has_role(auth.uid(), 'Admin')
        )
    );

-- =========================================================================
-- API GRANTS FOR DATA API ACCESS
-- =========================================================================
GRANT SELECT ON public.document_types TO authenticated, anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.borrower_documents TO authenticated, service_role;
GRANT SELECT ON public.borrower_documents TO anon;

-- =========================================================================
-- SEED INITIAL CORE KYC DOCUMENT TYPES
-- =========================================================================
INSERT INTO public.document_types (name, code, is_profile_doc, description) VALUES
('Aadhaar Card', 'AADHAAR', true, '12-digit Indian national identity card'),
('PAN Card', 'PAN', true, '10-character Permanent Account Number card'),
('Passport Size Photo', 'PHOTO', true, 'Recent color passport size photograph'),
('Address Proof', 'ADDRESS_PROOF', true, 'Aadhaar, Driving License, Passport, or Utility Bill'),
('Salary Slip Month 1', 'PAYSLIP_1', true, 'Latest month salary payslip'),
('Salary Slip Month 2', 'PAYSLIP_2', true, 'Salary payslip from 2 months ago'),
('Salary Slip Month 3', 'PAYSLIP_3', true, 'Salary payslip from 3 months ago'),
('Salary Slip Month 4', 'PAYSLIP_4', true, 'Salary payslip from 4 months ago'),
('Salary Slip Month 5', 'PAYSLIP_5', true, 'Salary payslip from 5 months ago'),
('Salary Slip Month 6', 'PAYSLIP_6', true, 'Salary payslip from 6 months ago'),
('Salary Offer Letter', 'OFFER_LETTER', true, 'Employment offer or confirmation letter'),
('Form 16 Year 1', 'FORM16_1', true, 'Income Tax deduction certificate (latest year)'),
('Form 16 Year 2', 'FORM16_2', true, 'Income Tax deduction certificate (previous year)'),
('Employee ID Card', 'EMPLOYEE_ID', true, 'Company issued photographic employee identity card');

-- =========================================================================
-- DATABASE TRIGGER: AUTOMATIC STATUS SYNC
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_document_upload()
RETURNS trigger AS $$
BEGIN
    -- Update borrower status to PENDING if they upload a document
    UPDATE public.user_profiles
    SET status = 'PENDING'
    WHERE id = NEW.borrower_id AND status = 'ACTIVE';
    RETURN NEW;
END;
$$ language plpgsql security definer;

CREATE OR REPLACE TRIGGER on_document_uploaded
  AFTER INSERT OR UPDATE ON public.borrower_documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_document_upload();
