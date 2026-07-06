// ============================================================
// FullBeat Edge Functions — shared helpers
// Ref: BB-DOC-FULLBEAT-TMS-PRD-V1 §12
// ============================================================
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

export function preflight(req: Request): Response | null {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  return null;
}

// Service-role client — full DB access. Used server-side only, never shipped to browser.
export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

// SHA-256 hex of a string (for automation token verification).
export async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function bearer(req: Request): string | null {
  const h = req.headers.get("Authorization") || "";
  return h.startsWith("Bearer ") ? h.slice(7).trim() : null;
}

export interface MachineAuth {
  ok: boolean;
  projectId?: string;
  projectCode?: string;
  scopes?: string[];
  tokenId?: string;
  label?: string;
  error?: string;
}

// Verify an automation token: hash it, look it up in automation_tokens (active),
// and confirm it is scoped to the requested project (by code).
export async function verifyAutomationToken(
  db: SupabaseClient,
  req: Request,
  projectCode: string,
): Promise<MachineAuth> {
  const token = bearer(req);
  if (!token) return { ok: false, error: "missing bearer token" };
  const hash = await sha256(token);

  const { data: proj } = await db
    .from("projects").select("id, code").eq("code", projectCode).single();
  if (!proj) return { ok: false, error: `unknown project '${projectCode}'` };

  const { data: tok } = await db
    .from("automation_tokens")
    .select("id, label, scopes, is_active, project_id")
    .eq("token_hash", hash).eq("project_id", proj.id).eq("is_active", true)
    .maybeSingle();
  if (!tok) return { ok: false, error: "invalid or revoked token for project" };

  // touch last_used_at (best-effort)
  await db.from("automation_tokens")
    .update({ last_used_at: new Date().toISOString() }).eq("id", tok.id);

  return {
    ok: true,
    projectId: proj.id,
    projectCode: proj.code,
    scopes: String(tok.scopes || "").split(",").map((s) => s.trim()),
    tokenId: tok.id,
    label: tok.label,
  };
}

// Resolve a human tc_index (+ optional revision) to an internal test_case UUID.
export async function resolveCase(
  db: SupabaseClient,
  projectId: string,
  tcIndex: string,
): Promise<{ id: string; revision: number } | null> {
  const { data } = await db
    .from("test_cases")
    .select("id, revision")
    .eq("project_id", projectId).eq("tc_index", tcIndex)
    .maybeSingle();
  return data ? { id: data.id, revision: data.revision } : null;
}
