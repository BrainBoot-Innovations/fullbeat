-- ============================================================
-- FULLBEAT PRODUCTION SETUP
-- Run this ONE script in Supabase SQL Editor to set up everything
-- ============================================================

-- Skip if tables already exist (safe to re-run)

-- 1. Custom types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'lead', 'engineer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Tables
CREATE TABLE IF NOT EXISTS user_profiles (
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

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  tc_index TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  category TEXT NOT NULL CHECK (category IN ('smoke','sanity','regression','performance','functional','negative')),
  module TEXT NOT NULL,
  scenario TEXT NOT NULL,
  steps TEXT NOT NULL,
  expected_result TEXT NOT NULL,
  preconditions TEXT DEFAULT '',
  test_data TEXT DEFAULT '',
  last_3_runs JSONB DEFAULT '[]',
  previously_failed BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, tc_index)
);

CREATE TABLE IF NOT EXISTS test_case_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_case_id UUID NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
  revision INTEGER NOT NULL,
  scenario TEXT, steps TEXT, expected_result TEXT, category TEXT, module TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS test_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  plan_id TEXT UNIQUE NOT NULL,
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('smoke','sanity','regression','custom')),
  environment TEXT NOT NULL CHECK (environment IN ('testing','production')),
  release_version TEXT,
  release_notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','completed','archived')),
  deadline TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS test_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES test_plans(id) ON DELETE CASCADE,
  test_case_id UUID NOT NULL REFERENCES test_cases(id),
  assigned_to UUID REFERENCES auth.users(id),
  execution_order INTEGER DEFAULT 0,
  UNIQUE(plan_id, test_case_id)
);

CREATE TABLE IF NOT EXISTS bugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  plan_id UUID REFERENCES test_plans(id),
  test_case_id UUID REFERENCES test_cases(id),
  bug_code TEXT UNIQUE NOT NULL,
  filed_by UUID REFERENCES auth.users(id),
  severity TEXT NOT NULL CHECK (severity IN ('critical','major','minor','cosmetic')),
  title TEXT NOT NULL,
  description TEXT,
  screenshot_url TEXT,
  fix_status TEXT NOT NULL DEFAULT 'open' CHECK (fix_status IN ('open','in_progress','fixed','verified','closed','wont_fix')),
  fixed_by UUID REFERENCES auth.users(id),
  fix_description TEXT,
  retest_status TEXT DEFAULT 'pending' CHECK (retest_status IN ('pending','pass','fail')),
  retested_by UUID REFERENCES auth.users(id),
  retested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS test_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES test_plans(id),
  test_case_id UUID NOT NULL REFERENCES test_cases(id),
  executed_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL CHECK (status IN ('pass','fail','blocked','skipped')),
  bug_id UUID REFERENCES bugs(id),
  remarks TEXT,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_seconds INTEGER
);

-- 3. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS test_cases_updated_at ON test_cases;
CREATE TRIGGER test_cases_updated_at BEFORE UPDATE ON test_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, display_name, tester_code, role, must_change_password)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'tester_code', 'T00'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'engineer'),
    COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, true)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5. Seed project (skip if exists)
INSERT INTO projects (name, code, description)
VALUES ('BrainBoot App', 'brainboot', 'BrainBoot main application QA testing')
ON CONFLICT (code) DO NOTHING;

-- 6. RLS Policies (allow authenticated users to read/write)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_case_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read all data (small trusted team)
CREATE POLICY "Authenticated read all" ON user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON test_cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON test_case_revisions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON test_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON test_plan_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON test_executions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON bugs FOR SELECT TO authenticated USING (true);

-- All authenticated users can insert/update (small trusted team)
CREATE POLICY "Authenticated write" ON user_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update" ON user_profiles FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated write" ON projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated write" ON test_cases FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update" ON test_cases FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated write" ON test_case_revisions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated write" ON test_plans FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update" ON test_plans FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated write" ON test_plan_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update" ON test_plan_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated write" ON test_executions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update" ON test_executions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated write" ON bugs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update" ON bugs FOR UPDATE TO authenticated USING (true);

-- 7. Realtime (skip if already added)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE test_executions;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE bugs;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 8. Indexes
CREATE INDEX IF NOT EXISTS idx_test_cases_project ON test_cases(project_id);
CREATE INDEX IF NOT EXISTS idx_test_plans_project ON test_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_test_plan_items_plan ON test_plan_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_test_executions_plan ON test_executions(plan_id);
CREATE INDEX IF NOT EXISTS idx_bugs_project ON bugs(project_id);

-- DONE! Now create users in Supabase Auth dashboard.
