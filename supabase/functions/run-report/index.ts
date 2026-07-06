// ============================================================
// Edge Function: run-report
// POST /functions/v1/run-report
// Auth: automation token (Bearer). Records an automated run:
//   - 1 automation_runs row
//   - 1 test_executions row per case (source=automated, run_id)
//   - updates the plan item's current status (if plan given)
//   - auto-files a deduped bug for any case still FAILED after auto-fix attempts
// Ref: BB-DOC-FULLBEAT-TMS-PRD-V1 §7.1, §12.3
// ============================================================
import { adminClient, json, preflight, resolveCase, verifyAutomationToken } from "../_shared/util.ts";

interface CaseResult {
  tc_index: string;
  revision?: number;
  status: "pass" | "fail" | "blocked" | "skipped";
  duration_ms?: number;
  auto_fix_attempts?: number;
  failure_signature?: string;
  log_url?: string;
  screenshot_url?: string;
  message?: string;
}

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "invalid JSON" }, 400); }

  const projectCode = String(body.project || "").toLowerCase();
  const results: CaseResult[] = Array.isArray(body.results) ? body.results : [];
  if (!projectCode) return json({ error: "project is required" }, 400);
  if (!body.run_id) return json({ error: "run_id is required" }, 400);
  if (!results.length) return json({ error: "results[] is empty" }, 400);

  const db = adminClient();
  const auth = await verifyAutomationToken(db, req, projectCode);
  if (!auth.ok) return json({ error: auth.error }, 401);
  if (!auth.scopes?.includes("run:write")) return json({ error: "token lacks run:write" }, 403);
  const canBug = auth.scopes?.includes("bug:write");
  const projectId = auth.projectId!;

  // Resolve the plan (optional)
  let planUuid: string | null = null;
  if (body.plan_id) {
    const { data: p } = await db.from("test_plans")
      .select("id").eq("project_id", projectId).eq("plan_id", body.plan_id).maybeSingle();
    planUuid = p?.id ?? null;
  }

  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;

  // 1) automation_runs header (idempotent on run_id)
  await db.from("automation_runs").upsert({
    run_id: body.run_id, project_id: projectId, plan_id: planUuid,
    runner: body.runner || "claude-code", source: "automated",
    commit_ref: body.commit || null, environment: body.environment || "testing",
    total: results.length, passed, failed, started_at: body.started_at || new Date().toISOString(),
    finished_at: new Date().toISOString(), created_by: auth.label || "token",
  }, { onConflict: "run_id" });

  let executionsWritten = 0, bugsOpened = 0, bugsDeduped = 0, unresolved = 0;

  for (const r of results) {
    const resolved = await resolveCase(db, projectId, r.tc_index);
    if (!resolved) continue; // unknown case — skip silently (reported in summary)
    const revision = r.revision ?? resolved.revision;

    // 2) execution event
    const { data: execRow } = await db.from("test_executions").insert({
      project_id: projectId, plan_id: planUuid, test_case_id: resolved.id,
      status: r.status, source: "automated", run_id: body.run_id,
      runner: body.runner || "claude-code", revision, commit_ref: body.commit || null,
      remarks: r.message || null, duration_seconds: r.duration_ms ? Math.round(r.duration_ms / 1000) : null,
      log_url: r.log_url || null, screenshot_url: r.screenshot_url || null,
      auto_fix_attempts: r.auto_fix_attempts ?? 0,
    }).select("id").single();
    executionsWritten++;

    // 3) update plan item current state
    if (planUuid) {
      await db.from("test_plan_items")
        .update({ status: r.status, executed_at: new Date().toISOString() })
        .eq("plan_id", planUuid).eq("test_case_id", resolved.id);
    }

    // 4) auto-bug for unresolved failures
    if (r.status === "fail") {
      unresolved++;
      if (!canBug) continue;
      const signature = r.failure_signature || `auto:${r.tc_index}:r${revision}`;

      // dedup: existing OPEN auto-bug for (project, case, signature)?
      const { data: existing } = await db.from("bugs")
        .select("id, occurrences").eq("project_id", projectId)
        .eq("test_case_id", resolved.id).eq("failure_signature", signature)
        .in("fix_status", ["open", "in_progress"]).eq("auto_filed", true).maybeSingle();

      if (existing) {
        await db.from("bugs").update({
          occurrences: (existing.occurrences || 1) + 1, run_id: body.run_id,
          screenshot_url: r.screenshot_url || null, log_url: r.log_url || null,
        }).eq("id", existing.id);
        bugsDeduped++;
      } else {
        const { count } = await db.from("bugs")
          .select("id", { count: "exact", head: true }).eq("project_id", projectId);
        const bugCode = `BUG-${auth.projectCode!.toUpperCase()}-${String((count || 0) + 1).padStart(3, "0")}`;
        await db.from("bugs").insert({
          project_id: projectId, plan_id: planUuid, test_case_id: resolved.id,
          bug_code: bugCode, severity: body.default_severity || "major",
          title: `[auto] ${r.tc_index} failed: ${(r.message || "assertion failed").slice(0, 120)}`,
          description: `Auto-filed by ${body.runner || "claude-code"} on run ${body.run_id}` +
            (body.commit ? ` (commit ${body.commit})` : "") +
            (r.auto_fix_attempts ? `\nAuto-fix attempts: ${r.auto_fix_attempts}` : "") +
            (r.message ? `\n\n${r.message}` : ""),
          fix_status: "open", auto_filed: true, run_id: body.run_id,
          failure_signature: signature, environment: body.environment || "testing",
          screenshot_url: r.screenshot_url || null, log_url: r.log_url || null,
        });
        bugsOpened++;
      }
    }

    // 5) auto-verify: a pass closes any open auto-bug for this case
    if (r.status === "pass" && canBug) {
      await db.from("bugs").update({
        fix_status: "verified", retest_status: "pass", retested_at: new Date().toISOString(),
      }).eq("project_id", projectId).eq("test_case_id", resolved.id)
        .eq("auto_filed", true).in("fix_status", ["open", "in_progress", "fixed"]);
    }
  }

  await db.from("automation_runs").update({ bugs_opened: bugsOpened }).eq("run_id", body.run_id);

  return json({
    run_id: body.run_id, executions_written: executionsWritten,
    bugs_opened: bugsOpened, bugs_deduped: bugsDeduped, failures: unresolved,
  });
});
