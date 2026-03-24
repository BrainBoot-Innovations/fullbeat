-- FullBeat Phase 2-5 Schema
-- Run this AFTER phase1-schema.sql in Supabase SQL Editor

-- ============================================================
-- Phase 2: Test Cases
-- ============================================================

CREATE TABLE test_cases (
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

CREATE TRIGGER test_cases_updated_at
  BEFORE UPDATE ON test_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE test_case_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_case_id UUID NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
  revision INTEGER NOT NULL,
  scenario TEXT,
  steps TEXT,
  expected_result TEXT,
  category TEXT,
  module TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Phase 3: Test Plans
-- ============================================================

CREATE TABLE test_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  plan_id TEXT UNIQUE NOT NULL,
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('smoke','sanity','regression','custom')),
  environment TEXT NOT NULL CHECK (environment IN ('testing','production')),
  release_version TEXT,
  release_notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','completed','archived')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE test_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES test_plans(id) ON DELETE CASCADE,
  test_case_id UUID NOT NULL REFERENCES test_cases(id),
  assigned_to UUID REFERENCES auth.users(id),
  execution_order INTEGER DEFAULT 0,
  UNIQUE(plan_id, test_case_id)
);

-- ============================================================
-- Phase 4: Test Executions
-- ============================================================

CREATE TABLE test_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES test_plans(id),
  test_case_id UUID NOT NULL REFERENCES test_cases(id),
  executed_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL CHECK (status IN ('pass','fail','blocked','skipped')),
  bug_id UUID,
  remarks TEXT,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_seconds INTEGER
);

-- ============================================================
-- Phase 5: Bugs
-- ============================================================

CREATE TABLE bugs (
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

-- Add foreign key from test_executions to bugs
ALTER TABLE test_executions
  ADD CONSTRAINT fk_execution_bug
  FOREIGN KEY (bug_id) REFERENCES bugs(id);

-- ============================================================
-- Realtime
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE test_executions;
ALTER PUBLICATION supabase_realtime ADD TABLE bugs;

-- ============================================================
-- Indexes for performance
-- ============================================================

CREATE INDEX idx_test_cases_project ON test_cases(project_id);
CREATE INDEX idx_test_cases_module ON test_cases(project_id, module);
CREATE INDEX idx_test_plans_project ON test_plans(project_id);
CREATE INDEX idx_test_plan_items_plan ON test_plan_items(plan_id);
CREATE INDEX idx_test_executions_plan ON test_executions(plan_id);
CREATE INDEX idx_bugs_project ON bugs(project_id);
CREATE INDEX idx_bugs_status ON bugs(fix_status);
