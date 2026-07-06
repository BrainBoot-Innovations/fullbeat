// ============================================================
// Edge Function: plan-pull
// GET /functions/v1/plan-pull?project=mars&plan=PLAN-MARS-007
//   (or &page=PG-05 to pull all ACTIVE cases for a page)
// Auth: automation token (Bearer). Returns the execution plan a runner may execute.
// Ref: BB-DOC-FULLBEAT-TMS-PRD-V1 §7, §12.1
// ============================================================
import { adminClient, json, preflight, verifyAutomationToken } from "../_shared/util.ts";

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  if (req.method !== "GET") return json({ error: "GET only" }, 405);

  const url = new URL(req.url);
  const projectCode = (url.searchParams.get("project") || "").toLowerCase();
  const planCode = url.searchParams.get("plan");
  const page = url.searchParams.get("page");
  if (!projectCode) return json({ error: "project is required" }, 400);
  if (!planCode && !page) return json({ error: "plan or page is required" }, 400);

  const db = adminClient();
  const auth = await verifyAutomationToken(db, req, projectCode);
  if (!auth.ok) return json({ error: auth.error }, 401);
  if (!auth.scopes?.includes("plan:read")) return json({ error: "token lacks plan:read" }, 403);

  // Shape one runnable case row from a joined test_case.
  const shape = (tc: any, item?: any) => ({
    tc_index: tc.tc_index,
    revision: item?.pinned_revision ?? tc.revision,
    priority: tc.priority,
    category: tc.category,
    module: tc.module,
    scenario: tc.scenario,
    steps: tc.steps,
    expected_result: tc.expected_result,
    is_automatable: tc.is_automatable,
    automation_ref: tc.automation_ref,
  });

  if (planCode) {
    const { data: plan } = await db
      .from("test_plans")
      .select("id, plan_id, plan_name, environment, status")
      .eq("project_id", auth.projectId).eq("plan_id", planCode).maybeSingle();
    if (!plan) return json({ error: `plan '${planCode}' not found` }, 404);

    const { data: items } = await db
      .from("test_plan_items")
      .select(`pinned_revision, execution_order,
               test_cases ( tc_index, revision, priority, category, module,
                            scenario, steps, expected_result, is_automatable, automation_ref, status )`)
      .eq("plan_id", plan.id)
      .order("execution_order", { ascending: true });

    const cases = (items || [])
      .filter((i: any) => i.test_cases && i.test_cases.status !== "DEPRECATED")
      .map((i: any) => shape(i.test_cases, i));

    return json({
      project: auth.projectCode, plan_id: plan.plan_id, plan_name: plan.plan_name,
      environment: plan.environment, count: cases.length, cases,
    });
  }

  // page mode — all ACTIVE cases for a page
  const { data: cases } = await db
    .from("test_cases")
    .select("tc_index, revision, priority, category, module, scenario, steps, expected_result, is_automatable, automation_ref")
    .eq("project_id", auth.projectId).eq("source_page", page).eq("status", "ACTIVE")
    .order("priority", { ascending: true });

  return json({
    project: auth.projectCode, page, count: (cases || []).length,
    cases: (cases || []).map((c: any) => shape(c)),
  });
});
