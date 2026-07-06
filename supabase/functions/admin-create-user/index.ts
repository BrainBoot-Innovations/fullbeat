// ============================================================
// Edge Function: admin-create-user
// POST /functions/v1/admin-create-user
// Auth: the CALLER's Supabase JWT; must be an admin. Uses the service role to
// create the user server-side, so the admin's own browser session is NOT replaced.
// Fixes the current defect where signUp() signs the admin out. (SP-FB-A06)
// Ref: BB-DOC-FULLBEAT-TMS-PRD-V1 §10.8, §12.4
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { adminClient, bearer, json, preflight } from "../_shared/util.ts";

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  // Verify the caller is an authenticated admin.
  const token = bearer(req);
  if (!token) return json({ error: "missing caller token" }, 401);
  const asCaller = createClient(
    Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } },
  );
  const { data: { user: caller } } = await asCaller.auth.getUser();
  if (!caller) return json({ error: "invalid caller token" }, 401);

  const db = adminClient();
  const { data: callerProfile } = await db.from("user_profiles")
    .select("role").eq("id", caller.id).maybeSingle();
  if (!callerProfile || callerProfile.role !== "admin") {
    return json({ error: "admin only" }, 403);
  }

  const body = await req.json().catch(() => ({}));
  const { email, display_name, tester_code, role = "engineer", projects = [], temp_password } = body;
  if (!email || !display_name || !tester_code) {
    return json({ error: "email, display_name, tester_code required" }, 400);
  }
  if (!String(email).toLowerCase().endsWith("@brainboot.co.in")) {
    return json({ error: "email must be @brainboot.co.in" }, 400);
  }

  // Create the auth user (service role → does NOT touch the caller's session).
  const password = temp_password || crypto.randomUUID().slice(0, 12) + "A1!";
  const { data: created, error: createErr } = await db.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { display_name, tester_code, role, must_change_password: true },
  });
  if (createErr) return json({ error: createErr.message }, 400);
  const newId = created.user!.id;

  // Profile is auto-created by the handle_new_user trigger; ensure fields (idempotent).
  await db.from("user_profiles").upsert({
    id: newId, email, display_name, tester_code, role, must_change_password: true, is_active: true,
  });

  // Project memberships
  for (const code of projects) {
    const { data: p } = await db.from("projects").select("id").eq("code", String(code).toLowerCase()).maybeSingle();
    if (p) await db.from("project_members").upsert(
      { project_id: p.id, user_id: newId, role }, { onConflict: "project_id,user_id" });
  }

  return json({ ok: true, user_id: newId, email, temp_password: password, projects });
});
