-- Banks Schema Migration (Independent table)

-- Create public.banks table (using integer primary key)
CREATE TABLE public.banks (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    branch text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- RLS POLICIES FOR banks
-- =========================================================================

-- 1. All authenticated users can read bank details
CREATE POLICY "Authenticated users can read banks" ON public.banks
    FOR SELECT TO authenticated USING (true);

-- 2. Only Admins can manage bank lists
CREATE POLICY "Admins can manage banks" ON public.banks
    FOR ALL TO authenticated USING (
        public.has_role(auth.uid(), 'Admin')
    );
