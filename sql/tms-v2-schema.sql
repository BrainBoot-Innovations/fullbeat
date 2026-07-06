-- ============================================================
-- FULLBEAT — TEST MANAGER SYSTEM (TMS) v2 MIGRATION
-- Ref: BB-DOC-FULLBEAT-TMS-PRD-V1  (Planet: MARS)
-- Additive + idempotent. Safe to run on top of setup-production.sql.
-- Run in Supabase SQL Editor. Does NOT drop or rewrite existing data.
-- ============================================================

-- ------------------------------------------------------------
-- 0. Roles: add 'viewer' (read-only stakeholder / client owner)
-- ------------------------------------------------------------
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'viewer';

-- ------------------------------------------------------------
-- 1. TEST CASES — provenance + lifecycle + automation metadata
--    (UETS/Orbit sync writes provenance; lifecycle gates plans)
-- ------------------------------------------------------------
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE'
  CHECK (status IN ('DRAFT','IN_REVIEW','ACTIVE','DEPRECATED'));
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'P2'
  CHECK (priority IN ('P0','P1','P2','P3'));
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS is_automatable BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS automation_ref TEXT;          -- e.g. e2e/login.spec.ts
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS source_planet TEXT;           -- UETS god_name (MARS, SATURN…)
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS source_page TEXT;             -- Orbit page PG-NN
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS source_sp_code TEXT;          -- universe.db story point
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS source_commit TEXT;           -- commit hash that triggered it
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS content_hash TEXT;            -- idempotency key for sync
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS origin TEXT NOT NULL DEFAULT 'manual'
  CHECK (origin IN ('manual','sync','import'));

-- Idempotency: one live case per (project, source SP, content). Sync uses this
-- to decide create vs new-revision vs skip.
CREATE UNIQUE INDEX IF NOT EXISTS uq_test_cases_sync
  ON test_cases(project_id, source_sp_code, content_hash)
  WHERE source_sp_code IS NOT NULL;

-- ------------------------------------------------------------
-- 2. TEST PLAN ITEMS — direct project scope, pinned revision,
--    and the per-case current state the app reads (status/remarks/bug/executed).
--    (execution.js reads status/remarks/bug_id/executed_at from the plan item)
-- ------------------------------------------------------------
ALTER TABLE test_plan_items ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
ALTER TABLE test_plan_items ADD COLUMN IF NOT EXISTS pinned_revision INTEGER;   -- null = follow ACTIVE
ALTER TABLE test_plan_items ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'
  CHECK (status IN ('pending','pass','fail','blocked','skipped'));
ALTER TABLE test_plan_items ADD COLUMN IF NOT EXISTS remarks TEXT;
ALTER TABLE test_plan_items ADD COLUMN IF NOT EXISTS bug_id UUID REFERENCES bugs(id);
ALTER TABLE test_plan_items ADD COLUMN IF NOT EXISTS executed_at TIMESTAMPTZ;

-- ------------------------------------------------------------
-- 3. TEST EXECUTIONS — provenance (human vs machine) + run link + evidence.
--    test_executions is the immutable event log; plan_items holds current state.
-- ------------------------------------------------------------
ALTER TABLE test_executions ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
ALTER TABLE test_executions ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual'
  CHECK (source IN ('manual','automated'));
ALTER TABLE test_executions ADD COLUMN IF NOT EXISTS run_id TEXT;              -- FK-ish to automation_runs.run_id
ALTER TABLE test_executions ADD COLUMN IF NOT EXISTS runner TEXT;             -- claude-code | ci | human tester_code
ALTER TABLE test_executions ADD COLUMN IF NOT EXISTS revision INTEGER;        -- case revision this run targeted
ALTER TABLE test_executions ADD COLUMN IF NOT EXISTS commit_ref TEXT;
ALTER TABLE test_executions ADD COLUMN IF NOT EXISTS log_url TEXT;
ALTER TABLE test_executions ADD COLUMN IF NOT EXISTS screenshot_url TEXT;
ALTER TABLE test_executions ADD COLUMN IF NOT EXISTS auto_fix_attempts INTEGER DEFAULT 0;

-- ------------------------------------------------------------
-- 4. BUGS — automation provenance + dedup + assignment + env
-- ------------------------------------------------------------
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS auto_filed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS run_id TEXT;
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS failure_signature TEXT;             -- dedup key
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS occurrences INTEGER NOT NULL DEFAULT 1;
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'testing'
  CHECK (environment IN ('dev','testing','production'));
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS log_url TEXT;

-- Dedup: at most one OPEN auto-bug per (project, case, signature).
CREATE UNIQUE INDEX IF NOT EXISTS uq_bugs_autodedup
  ON bugs(project_id, test_case_id, failure_signature)
  WHERE auto_filed = true AND fix_status IN ('open','in_progress');

-- ------------------------------------------------------------
-- 5. NEW: project_members — who belongs to which project (drives RLS in Phase B)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'engineer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- ------------------------------------------------------------
-- 6. NEW: automation_runs — one row per Claude Code / CI run
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS automation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id TEXT UNIQUE NOT NULL,                       -- run-2026-07-06-001
  project_id UUID NOT NULL REFERENCES projects(id),
  plan_id UUID REFERENCES test_plans(id),
  runner TEXT NOT NULL,                              -- claude-code | ci
  source TEXT NOT NULL DEFAULT 'automated',
  commit_ref TEXT,
  environment TEXT DEFAULT 'testing',
  total INTEGER DEFAULT 0,
  passed INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  bugs_opened INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  created_by TEXT                                    -- token label / user who triggered
);

-- ------------------------------------------------------------
-- 7. NEW: attachments — many evidence files per bug/execution
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  bug_id UUID REFERENCES bugs(id) ON DELETE CASCADE,
  execution_id UUID REFERENCES test_executions(id) ON DELETE CASCADE,
  kind TEXT DEFAULT 'screenshot' CHECK (kind IN ('screenshot','log','video','file')),
  url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 8. NEW: sync_state — per-planet cursor for the UETS→FullBeat bridge
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sync_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  planet TEXT NOT NULL UNIQUE,
  sync_cursor TEXT,                                  -- last processed commit / SP marker
  last_run_at TIMESTAMPTZ,
  last_drafted INTEGER DEFAULT 0,
  last_revised INTEGER DEFAULT 0,
  last_skipped INTEGER DEFAULT 0
);

-- ------------------------------------------------------------
-- 9. NEW: automation_tokens — scoped machine identities (hashed)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS automation_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  label TEXT NOT NULL,
  token_hash TEXT NOT NULL,                          -- store hash only, never the token
  scopes TEXT NOT NULL DEFAULT 'plan:read,run:write,bug:write',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

-- ------------------------------------------------------------
-- 10. Seed ALL planets as projects (multi-project hub).
--     Mirrors UETS repos. Idempotent on code.
-- ------------------------------------------------------------
INSERT INTO projects (name, code, description) VALUES
  ('FullBeat (MARS)',       'mars',     'MARS — the Test Manager itself'),
  ('dev.brainboot (SATURN)','saturn',   'SATURN — BrainBoot dev app'),
  ('QuestionMotor (JUPITER)','jupiter', 'JUPITER — question engine'),
  ('HistoryMotor (EARTH)',  'earth',    'EARTH — history engine'),
  ('ScoreMotor (MERCURY)',  'mercury',  'MERCURY — scoring engine'),
  ('BMC-Bala (VENUS)',      'venus',    'VENUS'),
  ('TruthTriumps (SUN)',    'sun',      'SUN'),
  ('Compass (PLUTO)',       'pluto',    'PLUTO'),
  ('ChemLab (TITAN)',       'titan',    'TITAN'),
  ('Company_Site (MILKYWAY)','milkyway','MILKYWAY — company site'),
  ('Evolve (MOON)',         'moon',     'MOON — Evolve'),
  ('HariBiriyani (URANUS)', 'uranus',   'URANUS')
ON CONFLICT (code) DO NOTHING;

-- ------------------------------------------------------------
-- 11. RLS for new tables — permissive for now (trusted team),
--     matching the existing model. Phase B tightens to project scope.
-- ------------------------------------------------------------
ALTER TABLE project_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_runs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_state       ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_tokens ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['project_members','automation_runs','attachments','sync_state','automation_tokens'])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "auth read" ON %I;', t);
    EXECUTE format('CREATE POLICY "auth read" ON %I FOR SELECT TO authenticated USING (true);', t);
    EXECUTE format('DROP POLICY IF EXISTS "auth write" ON %I;', t);
    EXECUTE format('CREATE POLICY "auth write" ON %I FOR INSERT TO authenticated WITH CHECK (true);', t);
    EXECUTE format('DROP POLICY IF EXISTS "auth update" ON %I;', t);
    EXECUTE format('CREATE POLICY "auth update" ON %I FOR UPDATE TO authenticated USING (true);', t);
  END LOOP;
END $$;

-- Realtime for automation_runs (dashboards watch live runs)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE automation_runs;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- 12. Indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tc_status        ON test_cases(project_id, status);
CREATE INDEX IF NOT EXISTS idx_tc_source_sp      ON test_cases(source_sp_code);
CREATE INDEX IF NOT EXISTS idx_tpi_project       ON test_plan_items(project_id);
CREATE INDEX IF NOT EXISTS idx_exec_project      ON test_executions(project_id);
CREATE INDEX IF NOT EXISTS idx_exec_run          ON test_executions(run_id);
CREATE INDEX IF NOT EXISTS idx_exec_source       ON test_executions(source);
CREATE INDEX IF NOT EXISTS idx_bugs_run          ON bugs(run_id);
CREATE INDEX IF NOT EXISTS idx_runs_project      ON automation_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_members_user      ON project_members(user_id);

-- ============================================================
-- PHASE B (DO NOT ENABLE YET) — project-scoped, role-aware RLS.
-- Enable only after project_members is populated for every user,
-- or you will lock people out. Kept here as the migration to run
-- when client-app data is about to enter the hub.
-- ============================================================
-- Example (test_cases): replace permissive policies with membership checks.
--
-- DROP POLICY IF EXISTS "Authenticated read all" ON test_cases;
-- CREATE POLICY "member read" ON test_cases FOR SELECT TO authenticated
--   USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid()));
-- DROP POLICY IF EXISTS "Authenticated write" ON test_cases;
-- CREATE POLICY "member write" ON test_cases FOR INSERT TO authenticated
--   WITH CHECK (project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid()));
-- (repeat for test_plans, test_plan_items, test_executions, bugs, attachments)

-- ============================================================
-- STORAGE (run once, in Dashboard → Storage, not SQL):
--   Create a PRIVATE bucket named 'evidence'.
--   Folder convention: evidence/<PLANET>/<run_id>/<PG-TC>.png
--   Access via short-lived signed URLs from Edge Functions.
-- ============================================================

-- DONE. v2 migration complete.
