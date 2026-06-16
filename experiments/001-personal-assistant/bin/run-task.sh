#!/usr/bin/env bash
# run-task.sh <task_id>
# Runs one benchmark task in a hermetic scratch brain OUTSIDE the git repo, so
# the agent-under-test does not inherit the repo's root CLAUDE.md, then snapshots
# the result and scores it.
set -uo pipefail

TASK_ID="${1:?usage: run-task.sh <task_id>}"

# Resolve the experiment dir from this script's own location.
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

# 1. Scratch dir OUTSIDE the repo.
SCRATCH=$(mktemp -d "${TMPDIR:-/tmp}/pa-${TASK_ID}-XXXXXX")
mkdir -p "$SCRATCH/brain/knowledge" "$SCRATCH/brain/world" "$SCRATCH/brain/bin" "$SCRATCH/brain/harness"
mkdir -p "$SCRATCH/brain/runtime/drafts" "$SCRATCH/brain/runtime/queue/approvals" "$SCRATCH/brain/runtime/runs"

# Hermetic reset: copy pristine knowledge/ + world/ from seed/.
cp -R "$EXP_DIR/seed/knowledge/." "$SCRATCH/brain/knowledge/"
cp -R "$EXP_DIR/seed/world/." "$SCRATCH/brain/world/"
# Copy bin/ and harness/.
cp -R "$EXP_DIR/bin/." "$SCRATCH/brain/bin/"
cp -R "$EXP_DIR/harness/." "$SCRATCH/brain/harness/"
chmod +x "$SCRATCH/brain/bin/brain" "$SCRATCH/brain/bin/run-task.sh" \
  "$SCRATCH/brain/harness/personal-assistant/loop.sh" 2>/dev/null

# 2. Reproducible date + brain root. cd into the scratch brain.
export BRAIN_NOW=2026-06-16
export BRAIN_ROOT="$SCRATCH/brain"
cd "$SCRATCH/brain" || exit 1

./harness/personal-assistant/loop.sh "$TRIGGER"

# 3. Snapshot post-run state into the experiment's runtime/evals/<task_id>/after/.
AFTER="$EXP_DIR/runtime/evals/$TASK_ID/after"
rm -rf "$AFTER"
mkdir -p "$AFTER/world" "$AFTER/runtime/drafts" "$AFTER/runtime/queue/approvals" "$AFTER/runtime/runs"
cp -R "$SCRATCH/brain/world/." "$AFTER/world/" 2>/dev/null
cp -R "$SCRATCH/brain/runtime/drafts/." "$AFTER/runtime/drafts/" 2>/dev/null
cp -R "$SCRATCH/brain/runtime/queue/approvals/." "$AFTER/runtime/queue/approvals/" 2>/dev/null
cp -R "$SCRATCH/brain/runtime/runs/." "$AFTER/runtime/runs/" 2>/dev/null

# 4. Score.
python3 "$EXP_DIR/bin/score.py" "$TASK_ID"
