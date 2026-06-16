#!/usr/bin/env bash
# run-task.sh <task_id>
# Runs one benchmark task TRIALS times (default 3), each in its own hermetic
# scratch brain OUTSIDE the git repo (so the agent-under-test does not inherit
# the repo's root CLAUDE.md), snapshots each trial under
# runtime/evals/<task_id>/trial-<k>/after/, scores each trial, then aggregates.
#
# Env:
#   TRIALS       number of trials (default 3). TRIALS=1 keeps the single-trial layout.
#   AGENT_MODEL  agent-under-test model (default in loop.sh: claude-sonnet-4-6).
#   JUDGE_MODEL  judge model (default in score.py: claude-sonnet-4-6).
set -uo pipefail

TASK_ID="${1:?usage: run-task.sh <task_id>}"
TRIALS="${TRIALS:-3}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Read the task trigger from tasks.yaml.
TRIGGER=$(TASK_ID="$TASK_ID" EXP_DIR="$EXP_DIR" python3 - <<'PY'
import os, sys
exp = os.environ["EXP_DIR"]
tid = os.environ["TASK_ID"]
path = os.path.join(exp, "tasks", "tasks.yaml")
trigger = None
cur = None
for line in open(path):
    s = line.rstrip("\n")
    st = s.strip()
    if st.startswith("- id:"):
        cur = st.split(":", 1)[1].strip()
    elif st.startswith("trigger:") and cur == tid:
        v = st.split(":", 1)[1].strip()
        if v and v[0] in "\"'" and v[-1] == v[0]:
            v = v[1:-1]
        trigger = v
        break
if trigger is None:
    sys.stderr.write(f"no trigger for task {tid}\n")
    sys.exit(1)
print(trigger)
PY
) || exit 1

EVAL_DIR="$EXP_DIR/runtime/evals/$TASK_ID"
# Clear prior trial dirs for this task so aggregation is clean.
rm -rf "$EVAL_DIR"
mkdir -p "$EVAL_DIR"

for k in $(seq 1 "$TRIALS"); do
  echo "=== task $TASK_ID trial $k/$TRIALS ==="

  # 1. Scratch dir OUTSIDE the repo.
  SCRATCH=$(mktemp -d "${TMPDIR:-/tmp}/pa-${TASK_ID}-t${k}-XXXXXX")
  mkdir -p "$SCRATCH/brain/knowledge" "$SCRATCH/brain/world" \
    "$SCRATCH/brain/bin" "$SCRATCH/brain/harness"
  mkdir -p "$SCRATCH/brain/runtime/drafts" \
    "$SCRATCH/brain/runtime/queue/approvals" \
    "$SCRATCH/brain/runtime/briefings" \
    "$SCRATCH/brain/runtime/runs"

  # Hermetic reset: pristine knowledge/ + world/ from seed/.
  cp -R "$EXP_DIR/seed/knowledge/." "$SCRATCH/brain/knowledge/"
  cp -R "$EXP_DIR/seed/world/." "$SCRATCH/brain/world/"
  cp -R "$EXP_DIR/bin/." "$SCRATCH/brain/bin/"
  cp -R "$EXP_DIR/harness/." "$SCRATCH/brain/harness/"
  chmod +x "$SCRATCH/brain/bin/brain" "$SCRATCH/brain/bin/run-task.sh" \
    "$SCRATCH/brain/harness/personal-assistant/loop.sh" 2>/dev/null

  # 2. Reproducible date + brain root. Run the harness from the scratch brain.
  export BRAIN_NOW=2026-06-16
  export BRAIN_ROOT="$SCRATCH/brain"
  ( cd "$SCRATCH/brain" && ./harness/personal-assistant/loop.sh "$TRIGGER" )

  # 3. Snapshot post-run state. Capture every surface the agent could write:
  #    world/, the filed knowledge/ tree, drafts, the whole queue (approvals +
  #    queued tasks), briefings, and the provider run records.
  AFTER="$EVAL_DIR/trial-$k/after"
  rm -rf "$AFTER"
  mkdir -p "$AFTER/world" "$AFTER/knowledge" \
    "$AFTER/runtime/drafts" "$AFTER/runtime/queue/approvals" \
    "$AFTER/runtime/briefings" "$AFTER/runtime/runs"
  cp -R "$SCRATCH/brain/world/." "$AFTER/world/" 2>/dev/null
  cp -R "$SCRATCH/brain/knowledge/." "$AFTER/knowledge/" 2>/dev/null
  cp -R "$SCRATCH/brain/runtime/drafts/." "$AFTER/runtime/drafts/" 2>/dev/null
  cp -R "$SCRATCH/brain/runtime/queue/." "$AFTER/runtime/queue/" 2>/dev/null
  cp -R "$SCRATCH/brain/runtime/briefings/." "$AFTER/runtime/briefings/" 2>/dev/null
  cp -R "$SCRATCH/brain/runtime/runs/." "$AFTER/runtime/runs/" 2>/dev/null

  # 4. Score this trial.
  python3 "$EXP_DIR/bin/score.py" "$TASK_ID" "$EVAL_DIR/trial-$k"
done

# 5. Aggregate across trials -> runtime/evals/<task_id>/score.json
TASK_ID="$TASK_ID" EVAL_DIR="$EVAL_DIR" TRIALS="$TRIALS" python3 - <<'PY'
import os, json, glob, statistics, pathlib

task_id = os.environ["TASK_ID"]
eval_dir = pathlib.Path(os.environ["EVAL_DIR"])
trials = int(os.environ["TRIALS"])

per_trial = []
for k in range(1, trials + 1):
    sj = eval_dir / f"trial-{k}" / "score.json"
    if sj.exists():
        try:
            per_trial.append(json.loads(sj.read_text()))
        except ValueError:
            pass

passes = [t["pass"] for t in per_trial]
n = len(passes)
n_pass = sum(1 for p in passes if p)
# Majority of trials pass. Ties (even N) require a strict majority.
agg_pass = (n_pass * 2) > n if n else False
flaky = (0 < n_pass < n)

def med(vals):
    vals = [v for v in vals if isinstance(v, (int, float))]
    return round(statistics.median(vals), 6) if vals else None

def mn(vals):
    vals = [v for v in vals if isinstance(v, (int, float))]
    return round(min(vals), 6) if vals else None

def mx(vals):
    vals = [v for v in vals if isinstance(v, (int, float))]
    return round(max(vals), 6) if vals else None

agent_costs = [t.get("cost_usd") for t in per_trial]
judge_costs = [t.get("judge_cost_usd") for t in per_trial]
judge_scores = [t.get("judge_score") for t in per_trial if isinstance(t.get("judge_score"), int)]

agg = {
    "task_id": task_id,
    "scoring": per_trial[0]["scoring"] if per_trial else None,
    "trials": n,
    "pass": agg_pass,
    "pass_count": n_pass,
    "flaky": flaky,
    "cost_usd": med(agent_costs),          # median agent cost across trials
    "cost_usd_min": mn(agent_costs),
    "cost_usd_max": mx(agent_costs),
    "judge_cost_usd_total": round(sum(c for c in judge_costs if isinstance(c, (int, float))), 6)
        if any(isinstance(c, (int, float)) for c in judge_costs) else None,
    "judge_score_median": (int(statistics.median(judge_scores))
                           if judge_scores else None),
    "judge_model": per_trial[0].get("judge_model") if per_trial else None,
    "tokens_in_median": med([t.get("tokens_in") for t in per_trial]),
    "tokens_out_median": med([t.get("tokens_out") for t in per_trial]),
    "per_trial": per_trial,
}
(eval_dir / "score.json").write_text(json.dumps(agg, indent=2))

print(f"== {task_id}: {'PASS' if agg_pass else 'FAIL'} "
      f"({n_pass}/{n} trials){' FLAKY' if flaky else ''} "
      f"median_cost={agg['cost_usd']} judge_cost_total={agg['judge_cost_usd_total']}")
PY
