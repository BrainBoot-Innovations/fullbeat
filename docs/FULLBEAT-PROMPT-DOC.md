# FullBeat — QA Lifecycle Platform — Build Prompt

> **Use this document as the initial prompt when starting a new Claude Code session in the `fullbeat.brainboot` repo.**
> Copy-paste the relevant phase section to Claude to begin building.

---

## Project Identity

| Field | Value |
|-------|-------|
| **Product Name** | FullBeat |
| **Tagline** | Test. Track. Ship. |
| **Domain** | fullbeat.brainboot.co.in |
| **Repo** | BrainBoot-Innovations/fullbeat.brainboot |
| **Stack** | Vanilla HTML/CSS/JS + Supabase (CDN) |
| **Hosting** | GitHub Pages (auto-deploy from main) |
| **Cost** | $0/month |
| **Brand Color** | #6366f1 (BrainBoot Indigo) |

---

## Pre-Requisites (Do These First)

### 1. Create GitHub Repo
```
Organization: BrainBoot-Innovations
Name: fullbeat.brainboot
Visibility: Private
Initialize: with README
```

### 2. Create Supabase Project
```
Project Name: fullbeat-qa
Region: South Asia (Mumbai)
Plan: Free
```
Save the **Supabase URL** and **anon key** — you'll need them.

### 3. Namecheap DNS
```
Type: CNAME
Host: fullbeat
Value: brainboot-innovations.github.io
TTL: Automatic
```

### 4. GitHub Pages
```
Repo Settings → Pages → Source: Deploy from branch
Branch: main / root
Custom domain: fullbeat.brainboot.co.in
Enforce HTTPS: ✓
```

### 5. CNAME File
Create a file called `CNAME` in repo root with content:
```
fullbeat.brainboot.co.in
```

---

## Phase 1 Prompt — Foundation (Auth + User Management)

```
You are building FullBeat — a QA lifecycle platform for BrainBoot.
URL: fullbeat.brainboot.co.in
Stack: Vanilla HTML/CSS/JS + Supabase JS SDK (loaded via CDN)
Hosting: GitHub Pages (no build step, no framework)

SUPABASE CONFIG:
- URL: [PASTE YOUR SUPABASE URL]
- Anon Key: [PASTE YOUR ANON KEY]

DESIGN SYSTEM:
- Primary: #6366f1 (indigo)
- Success: #16a34a, Danger: #dc2626, Warning: #d97706
- Font: Segoe UI / system-ui, Mono: Consolas
- Border radius: 8px, Max width: 1400px centered
- Mobile-first responsive

BUILD PHASE 1 — Foundation:

1. Create Supabase schema:
   - user_profiles table (id UUID PK refs auth.users, display_name, tester_code UNIQUE, role ENUM admin/lead/engineer, must_change_password BOOLEAN DEFAULT true, is_active BOOLEAN DEFAULT true)
   - projects table (id UUID PK, name, code UNIQUE, description, created_by, is_active)
   - Insert seed project: name="BrainBoot App", code="brainboot"

2. Create index.html — Login page:
   - BrainBoot branded header: "FULLBEAT" logo + "Test. Track. Ship." tagline
   - Email + password login form
   - Supabase Auth signInWithPassword
   - After login: check user_profiles.must_change_password
   - If true → show password change form (min 8 chars, 1 upper, 1 number)
   - After password change → set must_change_password=false → redirect to dashboard

3. Create app shell (post-login):
   - Top bar: "FULLBEAT" brand, project selector dropdown, user name + tester code, logout button
   - Tab navigation: Dashboard | Repository | Plans | Execution | Bugs | Admin (admin only)
   - Content area: placeholder for each tab
   - Responsive: hamburger on mobile

4. Create admin.html — User Management (admin role only):
   - List all users (display_name, tester_code, role, is_active)
   - Create user form: email, display_name, tester_code (T01, T02...), role, temporary password
   - Uses Supabase Admin API or edge function to create auth user + profile
   - Deactivate user (soft delete)

5. Seed 3 test users:
   - Dhivya / T01 / engineer
   - Divish / T02 / engineer
   - Mugilan / T03 / engineer
   - Admin account (the project owner)

FILE STRUCTURE:
fullbeat.brainboot/
├── index.html          (login + password change)
├── dashboard.html      (app shell with tabs)
├── admin.html          (user management)
├── js/
│   ├── supabase-config.js  (URL + anon key)
│   ├── auth.js             (login, logout, password change, session check)
│   └── admin.js            (user CRUD)
├── css/
│   └── styles.css          (all styles)
├── CNAME                   (fullbeat.brainboot.co.in)
└── README.md

IMPORTANT:
- No npm, no build tools, no React. Pure HTML + JS.
- Supabase JS SDK loaded via CDN: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
- Every page checks auth state on load. No auth → redirect to index.html.
- RLS not required yet (small trusted team). Use anon key + auth.
```

---

## Phase 2 Prompt — Test Case Repository

```
Continue building FullBeat. Phase 1 (auth, login, user management) is complete.

BUILD PHASE 2 — Test Case Repository:

1. Create Supabase schema:
   - test_cases table:
     id UUID PK, project_id FK, tc_index TEXT UNIQUE (auto: TC-001, TC-002...),
     revision INTEGER DEFAULT 1, category ENUM (smoke/sanity/regression/performance/functional/negative),
     module TEXT, scenario TEXT, steps TEXT, expected_result TEXT, preconditions TEXT, test_data TEXT,
     last_3_runs JSONB DEFAULT '[]', previously_failed BOOLEAN DEFAULT false,
     is_active BOOLEAN DEFAULT true, created_by FK, created_at, updated_at

   - test_case_revisions table:
     id UUID PK, test_case_id FK, revision INTEGER, scenario, steps, expected_result,
     category, module, changed_by FK, changed_at

2. Create repository.html — Test Case Repository tab:
   - Table view: TC Index, Module, Category, Scenario, Revision, Previously Failed badge, Actions
   - Filter bar: module dropdown, category dropdown, search text, previously-failed toggle
   - Click row → expand to show full details (steps, expected, preconditions, test data, last 3 runs)
   - "Add Test Case" button (admin/lead only) → modal form
   - "Edit" button → modal form (creates new revision, saves old to revisions table)
   - "Archive" button (soft delete, admin only)
   - Previously Failed badge: red badge if any of last_3_runs has status=fail
   - Auto-generate tc_index: query max existing, increment

3. Import seed data:
   - Import the 60 test cases from the BrainBoot QA plan into the repository
   - Project: brainboot
   - Map types: "USE CASE" → "functional", "NEGATIVE" → "negative"
   - Here are the 60 test cases to import (TC-001 through TC-060):
     [The test cases are defined in BB-DOC-TESTING-QA-PLAN-V1.html —
      copy the test case data from BB-QA-TRACKER.html's JavaScript array]

IMPORTANT:
- tc_index auto-increments per project (TC-001, TC-002...)
- Revision starts at 1, increments on edit
- On edit: copy current state to test_case_revisions, then update test_cases
- previously_failed is auto-calculated from last_3_runs JSONB
```

---

## Phase 3 Prompt — Test Plans

```
Continue building FullBeat. Phase 1 (auth) and Phase 2 (repository) are complete.

BUILD PHASE 3 — Test Plans:

1. Create Supabase schema:
   - test_plans table:
     id UUID PK, project_id FK, plan_id TEXT UNIQUE (TP-2026-001 format),
     plan_name TEXT, plan_type ENUM (smoke/sanity/regression/custom),
     environment ENUM (testing/production), release_version TEXT, release_notes TEXT,
     status ENUM (draft/active/completed/archived) DEFAULT 'draft',
     created_by FK, created_at, started_at, completed_at

   - test_plan_items table:
     id UUID PK, plan_id FK, test_case_id FK, assigned_to FK,
     execution_order INTEGER DEFAULT 0, UNIQUE(plan_id, test_case_id)

2. Create plans.html — Test Plan Management tab:
   - List all plans: plan_id, name, type, environment, version, status, created date, progress bar
   - "Create Plan" button (admin/lead) → wizard:
     Step 1: Name, type, environment, release version, notes
     Step 2: Auto-populate test cases based on type:
       - smoke → all cases with category=smoke
       - sanity → all cases with category IN (smoke, sanity)
       - regression → ALL active cases
       - custom → empty (manual selection)
     Step 3: Manually add/remove cases from the auto-populated list
     Step 4: Assign testers to groups of cases (drag-drop or select)
     Step 5: Review and create (status=draft)
   - "Activate Plan" button → status=active, testers can now execute
   - "Complete Plan" / "Archive Plan" actions
   - Click plan → view details: all items, assignments, progress

3. Plan auto-generation rules:
   - Smoke plan for production: auto-includes all smoke-category TCs
   - Sanity plan for testing: auto-includes smoke + sanity TCs
   - Regression: all active TCs
   - Custom: start empty, manually add

4. plan_id format: TP-{YEAR}-{SEQ} auto-generated (TP-2026-001, TP-2026-002...)
```

---

## Phase 4 Prompt — Test Execution

```
Continue building FullBeat. Phases 1-3 (auth, repository, plans) are complete.

BUILD PHASE 4 — Test Execution:

1. Create Supabase schema:
   - test_executions table:
     id UUID PK, plan_id FK, test_case_id FK, executed_by FK,
     status ENUM (pass/fail/blocked/skipped),
     bug_id UUID FK NULLABLE (refs bugs table),
     remarks TEXT, executed_at TIMESTAMPTZ DEFAULT now(),
     duration_seconds INTEGER

2. Create execution.html — Test Execution tab:
   - Plan selector: dropdown of active plans assigned to current user
   - Execution table:
     TC Index | Module | Category | Scenario | Steps (expandable) | Expected |
     Previously Failed badge | Status Buttons | Bug ID | Remarks
   - Status buttons: PASS (green) | FAIL (red) | BLOCKED (amber) | SKIP (gray)
   - On FAIL click:
     a) Auto-generate bug_code: {tester_code}-{NNN} (T01-001, T01-002...)
     b) Create bug record in bugs table
     c) Open bug detail modal (severity, title, description, screenshot URL)
     d) Link bug to execution record
   - On status change: insert into test_executions
   - Previously Failed badge: show if test_case.previously_failed = true (red badge)
   - Progress bar at top: X of Y executed
   - Filter: module, status, category

3. After execution saved:
   - Update test_case.last_3_runs: push {plan_id, status, date, tester}, keep max 3
   - Recalculate test_case.previously_failed = any run in last_3_runs has status=fail
   - Update plan completion: if all items executed → plan.status = 'completed'

4. Real-time updates:
   - Subscribe to test_executions table via Supabase Realtime
   - When another tester submits a result, dashboard updates live

IMPORTANT:
- Each tester only sees their assigned items by default (can toggle "show all")
- Admin sees all testers' executions
- Bug ID auto-increments per tester per project (count existing bugs by that tester)
```

---

## Phase 5 Prompt — Bug Tracker + Dashboard

```
Continue building FullBeat. Phases 1-4 complete.

BUILD PHASE 5 — Bug Tracker + Dashboard:

1. Create Supabase schema (if not already):
   - bugs table:
     id UUID PK, project_id FK, plan_id FK, test_case_id FK,
     bug_code TEXT UNIQUE (T01-001), filed_by FK,
     severity ENUM (critical/major/minor/cosmetic),
     title TEXT, description TEXT, screenshot_url TEXT,
     fix_status ENUM (open/in_progress/fixed/verified/closed/wont_fix) DEFAULT 'open',
     fixed_by UUID, fix_description TEXT,
     retest_status ENUM (pending/pass/fail) DEFAULT 'pending',
     retested_by UUID, retested_at TIMESTAMPTZ,
     created_at, closed_at

2. Create bugs.html — Bug Tracker tab:
   - Bug list table: Bug ID, TC, Module, Severity, Title, Fix Status, Retest Status, Filed By, Date
   - Filter: severity, fix_status, tester
   - Click bug → detail view:
     - Bug info (read-only): ID, TC, scenario, tester, severity
     - Fix section (editable by admin/lead): fix_status, fixed_by, fix_description
     - Retest section (editable by assigned tester): retest_status, retested_by
     - Timeline: filed → in_progress → fixed → verified → closed (visual)
   - Bug lifecycle flow:
     open → in_progress (dev picks up) → fixed (dev marks) → verified (tester retests PASS) → closed
     OR → wont_fix (admin decides)
     OR → fail on retest → back to open

3. Create dashboard.html — Dashboard tab (update from Phase 1 placeholder):
   - Summary cards: Total TCs, Executed, Pass, Fail, Pass Rate, Open Bugs, Regression Flags
   - Verdict bar: GO / NO-GO / IN PROGRESS / NOT STARTED
   - Verdict logic:
     All executed + 0 fail → GO FOR PRODUCTION (green)
     All executed + any use-case fail → NO-GO (red)
     All executed + only negative fails ≤5 → CONDITIONAL GO (amber)
     Not all executed → IN PROGRESS (gray)
   - Per-tester cards: name, code, total, pass, fail, progress bar
   - Per-module table: module, total, pass, fail, pending, progress bar
   - Active plan info: plan name, type, environment, release version
   - Export buttons: CSV (results), CSV (bugs), JSON (all)

4. Realtime subscriptions:
   - Dashboard subscribes to test_executions and bugs tables
   - Live updates when any tester submits a result or bug status changes
```

---

## CLAUDE.md for the New Repo

> Create this file as `CLAUDE.md` in the repo root:

```markdown
# FullBeat — QA Lifecycle Platform

## What is this?
FullBeat is BrainBoot's internal QA platform at fullbeat.brainboot.co.in.
Stack: Vanilla HTML/JS + Supabase. Hosted on GitHub Pages. Zero cost.

## Tech Rules
- NO frameworks (no React, Vue, Angular). Pure HTML + CSS + JS.
- NO build tools (no npm, webpack, vite). Just push HTML files.
- Supabase JS SDK loaded via CDN.
- Every page must check auth state on load. No auth → redirect to index.html.
- All styles in css/styles.css. No inline styles except dynamic.
- Design system: Indigo #6366f1, Segoe UI font, 8px radius, 1400px max-width.

## File Structure
- index.html — Login + password change
- dashboard.html — App shell + dashboard tab
- repository.html — Test case repository
- plans.html — Test plan management
- execution.html — Test execution
- bugs.html — Bug tracker
- admin.html — User management (admin only)
- js/ — JavaScript modules
- css/ — Stylesheets
- CNAME — fullbeat.brainboot.co.in

## Supabase
- Project: fullbeat-qa
- Auth: email/password with user_profiles table for roles
- Realtime: enabled for test_executions and bugs tables

## Git
- Single branch: main (auto-deploys to GitHub Pages)
- Commit messages: descriptive, present tense
- No secrets in code — Supabase anon key is public by design
```

---

## Quick Reference: Domain Setup

| Step | Where | What |
|------|-------|------|
| 1 | GitHub | Create repo `BrainBoot-Innovations/fullbeat.brainboot` (private) |
| 2 | Supabase | Create project `fullbeat-qa` (free tier, Mumbai region) |
| 3 | Repo | Add `CNAME` file with `fullbeat.brainboot.co.in` |
| 4 | GitHub | Settings → Pages → main branch → Custom domain → Enforce HTTPS |
| 5 | Namecheap | Advanced DNS → Add CNAME: host=`fullbeat`, value=`brainboot-innovations.github.io` |
| 6 | Wait | 5-30 min DNS propagation + up to 1 hour for SSL |
| 7 | Verify | Visit https://fullbeat.brainboot.co.in |

---

*Document: FULLBEAT-PROMPT-DOC.md | Version: 1.0 | Date: 2026-03-24*
*BrainBoot Innovations Pvt Ltd — Internal Use Only*
