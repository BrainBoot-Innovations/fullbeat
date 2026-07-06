#!/usr/bin/env python3
"""
FullBeat UETS → Test-case Sync Bridge
Ref: BB-DOC-FULLBEAT-TMS-PRD-V1 §5 (Sync Engine)

Reads UETS universe.db + Orbit page map for a planet, finds new/changed story
points tagged to pages, drafts test-case scenarios, and POSTs them to the
FullBeat `sync-ingest` Edge Function. Idempotent: the endpoint skips unchanged
content and creates a NEW REVISION when a case's content changes.

stdlib only (sqlite3 + urllib). No pip install.

Usage:
    python fullbeat_sync.py MARS            # sync one planet
    python fullbeat_sync.py MARS --dry-run  # print drafts, do not POST

Env:
    FULLBEAT_URL          e.g. https://dmiynjnxwwilbxjygvzi.supabase.co
    SYNC_INGEST_SECRET    shared secret matching the Edge Function env
    UNIVERSE_DB           path to universe.db (default ~/.claude/universe.db)
    ORBIT_DATA_DIR        path to ~/.claude/orbit/data
    CLAUDE_DRAFTER=1      (optional) call Claude to draft scenarios (see draft_scenarios)
"""
import os, sys, json, sqlite3, hashlib, urllib.request, urllib.error
from pathlib import Path

HOME = Path.home()
UNIVERSE_DB   = Path(os.environ.get("UNIVERSE_DB", HOME / ".claude" / "universe.db"))
ORBIT_DATA    = Path(os.environ.get("ORBIT_DATA_DIR", HOME / ".claude" / "orbit" / "data"))
FULLBEAT_URL  = os.environ.get("FULLBEAT_URL", "").rstrip("/")
SYNC_SECRET   = os.environ.get("SYNC_INGEST_SECRET", "")

# UETS tier → FullBeat default category
TIER_CATEGORY = {"fe": "functional", "be": "functional", "db": "negative"}


def content_hash(*parts) -> str:
    return hashlib.sha256("|".join(str(p or "") for p in parts).encode()).hexdigest()[:32]


def load_orbit_pages(planet: str) -> dict:
    """Return {sp_code: page_id} from Orbit's <PLANET>-data.json (best effort)."""
    f = ORBIT_DATA / f"{planet}-data.json"
    mapping = {}
    if not f.exists():
        return mapping
    try:
        data = json.loads(f.read_text(encoding="utf-8"))
        for grp in data.get("groups", []):
            for page in grp.get("pages", []):
                pid = page.get("id") or page.get("page") or "PG-00"
                for sp in page.get("sps", []):
                    mapping[str(sp)] = pid
    except Exception as e:
        print(f"  [warn] could not read Orbit map: {e}")
    return mapping


def draft_scenarios(sp: dict, page: str, tier: str) -> list:
    """
    Turn one story point into candidate test-case drafts.
    Default: a single heuristic scenario from the SP title + done_criteria.
    If CLAUDE_DRAFTER=1, replace this body with a Claude call (bbai) that returns
    a richer list — the shape below is the contract sync-ingest expects.
    """
    title = sp["title"].strip()
    dc = (sp.get("done_criteria") or "").strip()
    category = TIER_CATEGORY.get(tier, "functional")
    steps = dc or f"1. Exercise: {title}\n2. Observe the result"
    expected = dc or f"{title} works as specified with no error."
    return [{
        "source_page": page,
        "source_sp_code": sp["sp_code"],
        "source_commit": sp.get("commit"),
        "content_hash": content_hash(title, dc, sp.get("status")),
        "module": page,
        "category": category,
        "priority": "P1" if tier == "fe" else "P2",
        "scenario": title,
        "steps": steps,
        "expected_result": expected,
        "is_automatable": tier in ("fe", "be"),
    }]


def read_planet(planet: str) -> list:
    """Read story points for a planet and build drafts."""
    if not UNIVERSE_DB.exists():
        sys.exit(f"universe.db not found at {UNIVERSE_DB}")
    con = sqlite3.connect(f"file:{UNIVERSE_DB}?mode=ro", uri=True)
    con.row_factory = sqlite3.Row
    repo = con.execute("SELECT repo_id, god_name FROM repos WHERE god_name=?", (planet,)).fetchone()
    if not repo:
        sys.exit(f"planet '{planet}' not found in universe.db repos")

    orbit = load_orbit_pages(planet)
    rows = con.execute(
        """SELECT sp_code, title, status, done_criteria
           FROM story_points
           WHERE repo_id=? AND (legacy IS NULL OR legacy=0)
           ORDER BY created_at DESC LIMIT 500""",
        (repo["repo_id"],),
    ).fetchall()
    con.close()

    drafts = []
    for r in rows:
        sp = dict(r)
        page = orbit.get(sp["sp_code"], "PG-00")
        # tier heuristic: infer from sp_code / title keywords (fe/be/db); default fe
        blob = (sp["sp_code"] + " " + sp["title"]).lower()
        tier = "db" if any(k in blob for k in ["schema", "sql", "rls", "table"]) else \
               "be" if any(k in blob for k in ["api", "edge", "endpoint", "function"]) else "fe"
        drafts += draft_scenarios(sp, page, tier)
    return drafts


def post_ingest(planet: str, drafts: list) -> dict:
    if not FULLBEAT_URL or not SYNC_SECRET:
        sys.exit("Set FULLBEAT_URL and SYNC_INGEST_SECRET env vars to POST.")
    url = f"{FULLBEAT_URL}/functions/v1/sync-ingest"
    payload = json.dumps({"project": planet.lower(), "drafts": drafts}).encode()
    req = urllib.request.Request(url, data=payload, method="POST", headers={
        "Content-Type": "application/json", "x-sync-secret": SYNC_SECRET,
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        sys.exit(f"sync-ingest HTTP {e.code}: {e.read().decode()}")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry = "--dry-run" in sys.argv
    if not args:
        sys.exit("usage: python fullbeat_sync.py <PLANET> [--dry-run]")
    planet = args[0].upper()

    drafts = read_planet(planet)
    print(f"[fullbeat_sync] {planet}: built {len(drafts)} candidate draft(s)")
    if dry:
        print(json.dumps(drafts[:5], indent=2))
        print(f"... ({len(drafts)} total). --dry-run: nothing posted.")
        return
    result = post_ingest(planet, drafts)
    print(f"[fullbeat_sync] ingest result: {result}")


if __name__ == "__main__":
    main()
