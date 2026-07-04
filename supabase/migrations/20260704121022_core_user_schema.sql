-- Core Schema Migration: User Profiles and Roles

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger helper function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create public.roles table (integer PK)
CREATE TABLE public.roles (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create public.user_profiles table linking to auth.users (roles is int[] array of roles.id)
CREATE TABLE public.user_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    phone text,
    first_name text,
    last_name text,
    roles int[] NOT NULL DEFAULT '{}',
    status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'SUSPENDED')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- GIN Index on roles array for high performance array overlap lookup (&&)
CREATE INDEX idx_user_profiles_roles ON public.user_profiles USING gin (roles);
CREATE INDEX idx_user_profiles_status ON public.user_profiles (status);

-- Create update trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Helper function to check roles inside RLS policies (marked as STABLE for query optimizer caching)
CREATE OR REPLACE FUNCTION public.has_role(user_uuid uuid, role_name text)
RETURNS boolean SECURITY DEFINER STABLE AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = user_uuid 
          AND up.roles && ARRAY[(SELECT r.id FROM public.roles r WHERE r.name = role_name)]::int[]
    );
END;
$$ language plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- RLS POLICIES FOR user_profiles
-- =========================================================================

-- 1. Users can select their own profile
CREATE POLICY "Users can read own profile" ON public.user_profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);

-- 2. BankAgents, PropertyOwners, and Admins can read profiles to evaluate roles/loans
CREATE POLICY "Agents, owners, admins can read all profiles" ON public.user_profiles
    FOR SELECT TO authenticated USING (
        public.has_role(auth.uid(), 'BankAgent') OR
        public.has_role(auth.uid(), 'PropertyOwner') OR
        public.has_role(auth.uid(), 'Admin')
    );

-- 3. Users can update their own personal info (but NOT their roles or status)
CREATE POLICY "Users can update own personal info" ON public.user_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        AND roles = (SELECT roles FROM public.user_profiles WHERE id = auth.uid())
        AND status = (SELECT status FROM public.user_profiles WHERE id = auth.uid())
    );

-- =========================================================================
-- RLS POLICIES FOR roles
-- =========================================================================

-- 1. All authenticated users can read roles
CREATE POLICY "Authenticated users can read roles" ON public.roles
    FOR SELECT TO authenticated USING (true);

-- 2. Only Admins can manage roles
CREATE POLICY "Admins can manage roles" ON public.roles
    FOR ALL TO authenticated USING (
        public.has_role(auth.uid(), 'Admin')
    );

-- =========================================================================
-- AUTH TRIGGER FOR AUTOMATIC PROFILE CREATION ON SIGNUP
-- =========================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  role_name_val text;
  roles_arr text[];
  role_id_val int;
  roles_ids_arr int[] := '{}';
BEGIN
  -- Extract roles array if present in metadata, or fallback to single role
  IF new.raw_user_meta_data ? 'roles' THEN
    SELECT array_agg(val) INTO roles_arr
    FROM jsonb_array_elements_text(new.raw_user_meta_data->'roles') AS val;
  ELSE
    role_name_val := coalesce(new.raw_user_meta_data->>'role', 'borrower');
    roles_arr := ARRAY[role_name_val];
  END IF;

  -- Map text roles to their respective integer IDs
  FOREACH role_name_val IN ARRAY roles_arr LOOP
    SELECT id INTO role_id_val FROM public.roles WHERE name = role_name_val;
    IF role_id_val IS NOT NULL THEN
      roles_ids_arr := array_append(roles_ids_arr, role_id_val);
    END IF;
  END LOOP;

  INSERT INTO public.user_profiles (id, email, phone, roles, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    new.phone,
    roles_ids_arr,
    coalesce(new.raw_user_meta_data->>'firstName', ''),
    coalesce(new.raw_user_meta_data->>'lastName', '')
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger to execute when a new auth user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
