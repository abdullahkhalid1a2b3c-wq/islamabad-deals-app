-- 0001_profiles_and_roles.sql
-- Migration: Profiles table, user roles, security-definer checks, triggers, and RLS policies

-- 1. Create user_role ENUM
CREATE TYPE public.user_role AS ENUM ('USER', 'RESTAURANT_OWNER', 'ADMIN');

-- 2. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NULL,
  avatar_url TEXT NULL,
  role public.user_role NOT NULL DEFAULT 'USER',
  preferred_area_id UUID NULL, -- FK to areas table added in Prompt 04
  notification_prefs JSONB NOT NULL DEFAULT '{"email_deals": true, "push_deals": true, "expiry_alerts": true}'::jsonb,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Helper function: is_admin() SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'ADMIN'::public.user_role
  );
$$;

-- 5. Trigger function to handle new user registration from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone,
    role
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    'USER'::public.user_role
  );
  RETURN NEW;
END;
$$;

-- Trigger firing on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Trigger preventing non-admin from changing role on profiles
CREATE OR REPLACE FUNCTION public.prevent_role_tampering()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If role is changing and user is not an admin, block the update
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Unauthorized: Only an ADMIN can change user roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER enforce_role_change_permissions
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_tampering();

-- 7. Updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. RLS Policies for profiles
-- Policy A: Users can view their own profile, Admins can view all profiles
CREATE POLICY "Users can view own profile or Admin views all"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id OR public.is_admin()
  );

-- Policy B: Users can update their own profile, Admins can update all
CREATE POLICY "Users can update own profile or Admin updates all"
  ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = id OR public.is_admin()
  );
