// ============================================================
// Edge Function: sync-ingest
// POST /functions/v1/sync-ingest
// Auth: shared secret header (x-sync-secret) — called by fullbeat_sync.py (UETS bridge).
// Upserts test cases from UETS/Orbit with provenance. Idempotent on content_hash;
// a changed hash for the same source SP creates a NEW REVISION (history-safe).
// Ref: BB-DOC-FULLBEAT-TMS-PRD-V1 §5, §12.2
// ============================================================
import { adminClient, json, preflight } from "../_shared/util.ts";

interface Draft {
  source_page: string;
  source_sp_code: string;
  source_commit?: string;
  content_hash: string;
  tc_index?: string;      // optional; generated if absent
  module: string;
  category: string;
  priority?: string;
  scenario: string;
  steps: string;
  expected_result: string;
  is_automatable?: boolean;
}

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  if (req.headers.get("x-sync-secret") !== Deno.env.get("SYNC_INGEST_SECRET")) {
    return json({ error: "bad sync secret" }, 401);
  }

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "invalid JSON" }, 400); }
  const projectCode = String(body.project || "").toLowerCase();
  const drafts: Draft[] = Array.isArray(body.drafts) ? body.drafts : [];
  if (!projectCode) return json({ error: "project required" }, 400);

  const db = adminClient();
  const { data: proj } = await db.from("projects").select("id, code").eq("code", projectCode).maybeSingle();
  if (!proj) return json({ error: `unknown project '${projectCode}'` }, 404);
  const planet = projectCode.toUpperCase();

  let created = 0, revised = 0, skipped = 0;

  for (const d of drafts) {
    // Already have this exact content for this SP? -> skip (idempotent no-op)
    const { data: same } = await db.from("test_cases").select("id")
      .eq("project_id", proj.id).eq("source_sp_code", d.source_sp_code)
      .eq("content_hash", d.content_hash).maybeSingle();
    if (same) { skipped++; continue; }

    // Existing case for this SP with a DIFFERENT hash? -> new revision.
    const { data: prior } = await db.from("test_cases").select("id, tc_index, revision")
      .eq("project_id", proj.id).eq("source_sp_code", d.source_sp_code)
      .order("revision", { ascending: false }).limit(1).maybeSingle();

    const priority = d.priority || "P2";
    const automatable = d.is_automatable ?? false;

    if (prior) {
      // snapshot the current, then bump the case to a new revision + new content
      const { data: cur } = await db.from("test_cases").select("*").eq("id", prior.id).single();
      await db.from("test_case_revisions").insert({
        test_case_id: prior.id, revision: cur.revision,
        scenario: cur.scenario, steps: cur.steps, expected_result: cur.expected_result,
        category: cur.category, module: cur.module,
      });
      await db.from("test_cases").update({
        revision: cur.revision + 1, status: "IN_REVIEW",  // re-review on change
        scenario: d.scenario, steps: d.steps, expected_result: d.expected_result,
        category: d.category, module: d.module, priority, is_automatable: automatable,
        source_page: d.source_page, source_commit: d.source_commit || null,
        content_hash: d.content_hash, origin: "sync",
      }).eq("id", prior.id);
      revised++;
    } else {
      // brand new case — allocate tc_index if not supplied
      let tcIndex = d.tc_index;
      if (!tcIndex) {
        const { count } = await db.from("test_cases")
          .select("id", { count: "exact", head: true }).eq("project_id", proj.id);
        tcIndex = `TC-${planet}-${(d.source_page || "PG").replace(/[^0-9]/g, "").padStart(2, "0")}-${String((count || 0) + 1).padStart(3, "0")}`;
      }
      await db.from("test_cases").insert({
        project_id: proj.id, tc_index: tcIndex, revision: 1, status: "DRAFT",
        category: d.category, module: d.module, scenario: d.scenario, steps: d.steps,
        expected_result: d.expected_result, priority, is_automatable: automatable,
        source_planet: planet, source_page: d.source_page, source_sp_code: d.source_sp_code,
        source_commit: d.source_commit || null, content_hash: d.content_hash, origin: "sync",
      });
      created++;
    }
  }

  // update the per-planet sync cursor
  await db.from("sync_state").upsert({
    project_id: proj.id, planet, sync_cursor: body.cursor || null,
    last_run_at: new Date().toISOString(),
    last_drafted: created, last_revised: revised, last_skipped: skipped,
  }, { onConflict: "planet" });

  return json({ created, revised, skipped_unchanged: skipped });
});
