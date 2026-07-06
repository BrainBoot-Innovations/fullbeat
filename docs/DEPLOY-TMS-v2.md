# FullBeat TMS v2 — Deploy & Verify Runbook

Ref: `BB-DOC-FULLBEAT-TMS-PRD-V1`. Planet: **MARS**. Everything here needs network
+ credentials, so it runs on your machine / in the Supabase dashboard — not from the
sandbox. Do the steps in order; each has a verify check.

Project: `fullbeat-qa` · URL `https://dmiynjnxwwilbxjygvzi.supabase.co`

---

## 1. Apply the SQL

In **Supabase → SQL Editor**, run in this order (both are idempotent):
1. `sql/setup-production.sql` (only if the base tables aren't there yet)
2. `sql/tms-v2-schema.sql`  ← new: provenance, automation, new tables, all planets seeded

**Verify:** `select code from projects order by code;` → shows mars, saturn, jupiter, … (12 planets).
`select column_name from information_schema.columns where table_name='test_cases' and column_name='source_sp_code';` → 1 row.

## 2. Create the evidence bucket

**Supabase → Storage → New bucket** → name `evidence`, **Private**.
Folder convention: `evidence/<PLANET>/<run_id>/<PG-TC>.png`.

## 3. Set Edge Function secrets

```bash
supabase secrets set \
  SUPABASE_URL="https://dmiynjnxwwilbxjygvzi.supabase.co" \
  SUPABASE_ANON_KEY="<anon key>" \
  SUPABASE_SERVICE_ROLE_KEY="<service role key — from Settings → API>" \
  SYNC_INGEST_SECRET="$(openssl rand -hex 24)"
```
Keep the `SYNC_INGEST_SECRET` value — the sync bridge needs the same string.

## 4. Deploy the Edge Functions

```bash
supabase functions deploy plan-pull
supabase functions deploy run-report
supabase functions deploy sync-ingest
supabase functions deploy admin-create-user
```
**Verify:** `supabase functions list` shows all four.

## 5. Mint an automation token (per project)

Tokens are stored **hashed**. Generate a raw token, store its SHA-256:
```bash
RAW="fbt_$(openssl rand -hex 20)"; echo "RAW TOKEN (give to the runner, store as FULLBEAT_AUTOMATION_TOKEN): $RAW"
HASH=$(printf "%s" "$RAW" | sha256sum | cut -d' ' -f1); echo "HASH: $HASH"
```
Then in SQL Editor (example for MARS):
```sql
insert into automation_tokens (project_id, label, token_hash, scopes)
select id, 'claude-code', '<HASH>', 'plan:read,run:write,bug:write'
from projects where code='mars';
```

## 6. Provision the first admin

Create the admin once in **Supabase → Authentication → Users** (email `@brainboot.co.in`),
then set their role:
```sql
update user_profiles set role='admin', must_change_password=false
where email='<you>@brainboot.co.in';
```
After that, all further users are created from the FullBeat Admin page (which calls
`admin-create-user` — the admin is **not** signed out).

## 7. Smoke-test the automation bridge

```bash
FB=https://dmiynjnxwwilbxjygvzi.supabase.co ; TOK=<RAW token from step 5>
# pull (expects 200 + cases[])
curl -s "$FB/functions/v1/plan-pull?project=mars&page=PG-00" -H "Authorization: Bearer $TOK" | jq .
# report a fake run (expects executions_written + bugs_opened)
curl -s -X POST "$FB/functions/v1/run-report" -H "Authorization: Bearer $TOK" \
  -H "Content-Type: application/json" -d '{
    "run_id":"run-smoke-001","project":"mars","runner":"claude-code",
    "results":[{"tc_index":"<a real tc_index>","status":"fail","failure_signature":"smoke","message":"smoke"}]}' | jq .
```
**Verify:** the bug appears on the Bugs page (flagged auto-filed); re-posting the same
failure returns `bugs_deduped: 1`.

## 8. Run the UETS sync bridge

```bash
export FULLBEAT_URL=https://dmiynjnxwwilbxjygvzi.supabase.co
export SYNC_INGEST_SECRET="<same value as step 3>"
python "D:/BrainBoot_Innovations/GitHub_Space/Full Beat/tools/fullbeat_sync.py" MARS --dry-run   # inspect drafts
python "D:/BrainBoot_Innovations/GitHub_Space/Full Beat/tools/fullbeat_sync.py" MARS             # push
```
**Verify:** drafted cases show in the FullBeat **Repository → Sync Inbox** as `DRAFT`.
Optional: schedule this alongside the existing 5-minute UETS GitHub sync (or as hook H5).

## 9. Frontend

The static site auto-deploys from `main` to GitHub Pages. The landing page
(`index.html`) and styles are already in the repo. The in-app data-layer switch to
Supabase-primary (retire DEV_MODE, wire plans/bugs/dashboard to the live tables +
realtime) is the remaining app work — do that pass with the browser open against the
live DB so each screen is verified end-to-end.

---

### Rollback
- Edge Functions: `supabase functions delete <name>`.
- SQL v2 is additive; to remove a new table: `drop table if exists <t> cascade;` (data loss).
- Automation token: `update automation_tokens set is_active=false, revoked_at=now() where label='claude-code';`
