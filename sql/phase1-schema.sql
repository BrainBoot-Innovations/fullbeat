-- FullBeat Phase 1 Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'lead', 'engineer');

-- 2. Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT NOT NULL,
  tester_code TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'engineer',
  must_change_password BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. Seed project
INSERT INTO projects (name, code, description)
VALUES ('BrainBoot App', 'brainboot', 'BrainBoot main application QA testing');

-- 6. Enable realtime for user_profiles (optional, useful for admin page)
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;

-- 7. Create function to handle new user signup → auto-create profile
--    (This is triggered when admin creates users via Edge Function)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, display_name, tester_code, role, must_change_password)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'tester_code', 'T00'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'engineer'),
    COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, true)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger: auto-create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
