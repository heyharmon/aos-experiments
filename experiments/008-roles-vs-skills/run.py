#!/usr/bin/env python3
"""008 lean runner: roles (inject) vs skills (load) for delivering an agent mode.

One variable: how the SAME mode content (006's proven scoped `planner.md`) reaches
a single agent.
  --delivery roles  : inject it as the system prompt (today's loop.sh behavior).
  --delivery skills : drop it in .claude/skills/planner/SKILL.md and give the agent
                      only a thin "use your planner skill" pointer, so the scoping
                      reaches it only if the skill loads.

Reuses experiment 006's worlds/, prompts/planner.md, bin/score.py, bin/brain, and
harness/ UNCHANGED (hermetic scratch per trial, provider-JSON cost). Scores with
006's score.py against the 006 world seed; FAB-GAP is assertion-only (no judge),
FAB-USE keeps the judge (see tasks/*.yaml).

Usage:
  run.py --delivery roles|skills --world dev|heldout [--tasks A,B] [--trials N]
"""
import os
import re
import sys
import json
import time
import shutil
import argparse
import subprocess
import tempfile
import pathlib

EXP008 = pathlib.Path(__file__).resolve().parent
EXP006 = EXP008.parent / "006-validation-separation"

PLANNER_PROMPT = EXP006 / "harness" / "product-dev-os" / "prompts" / "planner.md"
SKILL_SRC = EXP008 / "skills" / "planner" / "SKILL.md"
SCORE_PY = EXP006 / "bin" / "score.py"

AGENT_MODEL = os.environ.get("AGENT_MODEL", "claude-sonnet-4-6")
JUDGE_MODEL = os.environ.get("JUDGE_MODEL", "claude-sonnet-4-6")
AGENT_TIMEOUT = int(os.environ.get("AGENT_TIMEOUT", "600"))

DEFAULT_TASKS = {"dev": ["FAB-GAP", "FAB-USE"],
                 "heldout": ["FAB-GAP-H", "FAB-USE-H"]}

POINTER = (
    "You are operating in planner mode in the product-development operating "
    "system. The brain is your current working directory (knowledge/, world/, "
    "repo/, bin/, runtime/). Use your `planner` skill -- it defines how to do this "
    "job and the rules you must follow -- and stay within its scope. Do the work, "
    "then stop."
)


def die(msg):
    sys.stderr.write(f"run-008: {msg}\n")
    sys.exit(1)


def parse_trigger(taskset_path, task_id):
    """Read the `trigger:` block-scalar for task_id from a taskset yaml."""
    lines = pathlib.Path(taskset_path).read_text().splitlines()
    cur = None
    i = 0
    while i < len(lines):
        raw = lines[i]
        st = raw.strip()
        if st.startswith("- id:"):
            cur = st.split(":", 1)[1].strip()
        elif st.startswith("trigger:") and cur == task_id:
            v = st.split(":", 1)[1].strip()
            if v.startswith(">") or v.startswith("|"):
                base = len(raw) - len(raw.lstrip())
                buf = []
                i += 1
                while i < len(lines):
                    nxt = lines[i]
                    if nxt.strip() == "":
                        i += 1
                        continue
                    if (len(nxt) - len(nxt.lstrip())) <= base:
                        break
                    buf.append(nxt.strip())
                    i += 1
                return " ".join(buf).strip()
            return v.strip("\"'")
        i += 1
    die(f"no trigger for {task_id} in {taskset_path}")


def setup_scratch(seed_dir, delivery):
    scratch = pathlib.Path(tempfile.mkdtemp(prefix=f"e008-{delivery}-"))
    brain = scratch / "brain"
    for sub in ["knowledge", "world", "repo", "bin", "harness",
                "runtime/drafts", "runtime/plans", "runtime/handoffs",
                "runtime/reports", "runtime/issues",
                "runtime/queue/approvals", "runtime/runs"]:
        (brain / sub).mkdir(parents=True, exist_ok=True)
    for sub in ["knowledge", "world", "repo"]:
        shutil.copytree(seed_dir / sub, brain / sub, dirs_exist_ok=True)
    shutil.copytree(EXP006 / "bin", brain / "bin", dirs_exist_ok=True)
    shutil.copytree(EXP006 / "harness", brain / "harness", dirs_exist_ok=True)
    os.chmod(brain / "bin" / "brain", 0o755)
    if delivery == "skills":
        skd = brain / ".claude" / "skills" / "planner"
        skd.mkdir(parents=True, exist_ok=True)
        shutil.copy(SKILL_SRC, skd / "SKILL.md")
    return scratch, brain


def record_run(brain, raw_stdout, outcome, dur):
    run_id = f"{int(time.time()*1000)}-{os.getpid()}"
    runs = brain / "runtime" / "runs"
    (runs / f"{run_id}.raw.json").write_text(raw_stdout)
    try:
        d = json.loads(raw_stdout)
    except Exception:
        d = {}
    usage = d.get("usage", {}) if isinstance(d, dict) else {}

    def n(x):
        return x if isinstance(x, (int, float)) else 0
    unc = n(usage.get("input_tokens"))
    cr = n(usage.get("cache_read_input_tokens"))
    cc = n(usage.get("cache_creation_input_tokens"))
    rec = {
        "run_id": run_id, "role": "planner", "outcome": outcome,
        "duration_s": dur,
        "tokens_in": unc + cr + cc, "tokens_in_uncached": unc,
        "tokens_cache_read": cr, "tokens_cache_creation": cc,
        "tokens_out": usage.get("output_tokens"),
        "cost_usd": d.get("total_cost_usd"),
        "result": d.get("result"), "is_error": d.get("is_error"),
    }
    (runs / f"{run_id}.json").write_text(json.dumps(rec, indent=2))


def snapshot_after(brain, trial_dir):
    after = trial_dir / "after"
    if after.exists():
        shutil.rmtree(after)
    for sub in ["world", "knowledge", "repo", "runtime/drafts", "runtime/plans",
                "runtime/handoffs", "runtime/reports", "runtime/issues",
                "runtime/queue", "runtime/runs"]:
        src = brain / sub
        dst = after / sub
        dst.mkdir(parents=True, exist_ok=True)
        if src.exists():
            shutil.copytree(src, dst, dirs_exist_ok=True)
    bw = brain / "runtime" / "brain-writes.log"
    if bw.exists():
        shutil.copy(bw, after / "runtime" / "brain-writes.log")


def run_claude(brain, system_prompt, trigger):
    cmd = ["claude", "-p", "--output-format", "json", "--model", AGENT_MODEL,
           "--dangerously-skip-permissions",
           "--append-system-prompt", system_prompt, trigger]
    start = time.time()
    outcome = "ok"
    try:
        with open(os.devnull) as devnull:
            proc = subprocess.run(cmd, cwd=str(brain), stdin=devnull,
                                  capture_output=True, text=True,
                                  timeout=AGENT_TIMEOUT)
        raw = (proc.stdout or "").strip()
        if proc.returncode != 0 and not raw:
            outcome = "failed"
            raw = json.dumps({"is_error": True,
                              "result": (proc.stderr or "")[:500]})
    except subprocess.TimeoutExpired:
        outcome = "failed"
        raw = json.dumps({"is_error": True, "result": "timeout"})
    return raw, outcome, int(time.time() - start)


def main():
    ap = argparse.ArgumentParser(prog="run-008")
    ap.add_argument("--delivery", required=True, choices=["roles", "skills"])
    ap.add_argument("--world", required=True, choices=["dev", "heldout"])
    ap.add_argument("--tasks", default="")
    ap.add_argument("--trials", type=int, default=2)
    a = ap.parse_args()

    seed_dir = EXP006 / "worlds" / a.world
    taskset = EXP008 / "tasks" / ("dev.yaml" if a.world == "dev"
                                  else "heldout.yaml")
    if not seed_dir.exists():
        die(f"no seed at {seed_dir}")
    tasks = ([t.strip() for t in a.tasks.split(",") if t.strip()]
             or DEFAULT_TASKS[a.world])

    sysprompt = (PLANNER_PROMPT.read_text() if a.delivery == "roles" else POINTER)

    results_root = EXP008 / "runtime" / "results" / a.delivery / a.world
    for task_id in tasks:
        trigger = parse_trigger(taskset, task_id)
        eval_dir = results_root / task_id
        if eval_dir.exists():
            shutil.rmtree(eval_dir)
        eval_dir.mkdir(parents=True)
        per_trial = []
        for k in range(1, a.trials + 1):
            print(f"=== [{a.delivery}/{a.world}] {task_id} trial {k}/{a.trials} ===",
                  flush=True)
            scratch, brain = setup_scratch(seed_dir, a.delivery)
            try:
                os.environ["BRAIN_NOW"] = "2026-06-17"
                os.environ["BRAIN_ROOT"] = str(brain)
                raw, outcome, dur = run_claude(brain, sysprompt, trigger)
                record_run(brain, raw, outcome, dur)
                trial_dir = eval_dir / f"trial-{k}"
                trial_dir.mkdir(parents=True, exist_ok=True)
                snapshot_after(brain, trial_dir)
                env = dict(os.environ, SEED_DIR=str(seed_dir),
                           TASKSET=str(taskset), JUDGE_MODEL=JUDGE_MODEL)
                subprocess.run([sys.executable, str(SCORE_PY), task_id,
                                str(trial_dir)], env=env)
                sj = trial_dir / "score.json"
                if sj.exists():
                    per_trial.append(json.loads(sj.read_text()))
            finally:
                shutil.rmtree(scratch, ignore_errors=True)

        n = len(per_trial)
        n_pass = sum(1 for t in per_trial if t.get("pass"))
        agg = {
            "task_id": task_id, "delivery": a.delivery, "world": a.world,
            "trials": n, "pass_count": n_pass,
            "pass": (n_pass * 2) > n if n else False,
            "flaky": 0 < n_pass < n,
            "per_trial": per_trial,
        }
        (eval_dir / "score.json").write_text(json.dumps(agg, indent=2))
        print(f"== [{a.delivery}/{a.world}] {task_id}: "
              f"{'PASS' if agg['pass'] else 'FAIL'} ({n_pass}/{n})"
              f"{' FLAKY' if agg['flaky'] else ''}", flush=True)


if __name__ == "__main__":
    main()
