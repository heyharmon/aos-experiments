#!/usr/bin/env bash
# run-suite.sh
# Runs all 10 tasks (T1..T10) at TRIALS trials each (default 3), then writes
# results/scorecard.md from the per-task aggregate score.json files.
#
# Env:
#   TRIALS  trials per task (default 3) — passed through to run-task.sh.
#   TASKS   space-separated task ids to run (default: T1..T10).
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

TRIALS="${TRIALS:-3}"
TASKS="${TASKS:-T1 T2 T3 T4 T5 T6 T7 T8 T9 T10}"

export TRIALS

for t in $TASKS; do
  "$SCRIPT_DIR/run-task.sh" "$t"
done

# Build results/scorecard.md from runtime/evals/<task>/score.json plus
# tasks.yaml (for kind + expects_escalation).
EXP_DIR="$EXP_DIR" TASKS="$TASKS" TRIALS="$TRIALS" python3 - <<'PY'
import os, json, pathlib, datetime

exp = pathlib.Path(os.environ["EXP_DIR"])
task_ids = os.environ["TASKS"].split()
trials = os.environ["TRIALS"]

# Parse kind, scoring, expects_escalation per task from tasks.yaml.
meta = {}
cur = None
for line in (exp / "tasks" / "tasks.yaml").read_text().splitlines():
    st = line.strip()
    if st.startswith("- id:"):
        cur = st.split(":", 1)[1].strip()
        meta[cur] = {"kind": "", "scoring": "assertion", "expects_escalation": "false"}
    elif cur:
        for key in ("kind", "scoring", "expects_escalation"):
            if st.startswith(key + ":"):
                meta[cur][key] = st.split(":", 1)[1].strip()

rows = []
for tid in task_ids:
    sj = exp / "runtime" / "evals" / tid / "score.json"
    agg = json.loads(sj.read_text()) if sj.exists() else {}
    rows.append((tid, meta.get(tid, {}), agg))

def fmt(x):
    return "" if x is None else (f"{x:.6f}" if isinstance(x, float) else str(x))

lines = []
lines.append("# Scorecard, exp 001 personal-assistant, full 10-task suite")
lines.append("")
lines.append(f"Date: {datetime.date.today().isoformat()}")
lines.append("Model (agent-under-test): claude-sonnet-4-6 (via `claude -p`)")
lines.append("Judge model: claude-sonnet-4-6 (Tier-2 LLM judge, via `claude -p`)")
lines.append(f"Trials per task: {trials} (pass = majority of trials; cost_usd = median agent cost across trials)")
lines.append("")
lines.append("Agent cost/token figures are read from the provider JSON run records, never estimated. "
             "Judge cost is the judge call's own `total_cost_usd`, recorded separately from agent cost.")
lines.append("")
lines.append("| Task | Kind | Scoring | Pass | Flaky | Judge score | Median agent cost | Judge cost (total) |")
lines.append("|---|---|---|---|---|---|---|---|")

total_agent = 0.0
total_judge = 0.0
n_pass = 0
esc_total = 0
esc_correct = 0

for tid, m, agg in rows:
    kind = m.get("kind", "")
    scoring = agg.get("scoring") or m.get("scoring", "assertion")
    passed = agg.get("pass", False)
    flaky = agg.get("flaky", False)
    js = agg.get("judge_score_median")
    js_disp = "" if js is None else str(js)
    ac = agg.get("cost_usd")
    jc = agg.get("judge_cost_usd_total")
    if isinstance(ac, (int, float)):
        total_agent += ac
    if isinstance(jc, (int, float)):
        total_judge += jc
    if passed:
        n_pass += 1
    if m.get("expects_escalation", "false") == "true":
        esc_total += 1
        if passed:
            esc_correct += 1
    lines.append(f"| {tid} | {kind} | {scoring} | "
                 f"{'PASS' if passed else 'FAIL'} | "
                 f"{'yes' if flaky else 'no'} | {js_disp} | "
                 f"{fmt(ac)} | {fmt(jc)} |")

n = len(rows)
total_cost = total_agent + total_judge
mean_per_task = (total_agent / n) if n else 0.0
esc_acc = (esc_correct / esc_total) if esc_total else None

lines.append("")
lines.append("## Totals")
lines.append("")
lines.append(f"- Pass rate: {n_pass}/{n} ({(100*n_pass/n):.0f}%)" if n else "- Pass rate: n/a")
lines.append(f"- Total cost incl. judge: {total_cost:.6f} "
             f"(agent {total_agent:.6f} + judge {total_judge:.6f})")
lines.append(f"- Mean agent cost per task: {mean_per_task:.6f}")
if esc_acc is None:
    lines.append("- Escalation accuracy: n/a (no expects_escalation tasks)")
else:
    lines.append(f"- Escalation accuracy: {esc_correct}/{esc_total} "
                 f"({(100*esc_acc):.0f}%) of expects_escalation tasks handled correctly")

(exp / "results" / "scorecard.md").write_text("\n".join(lines) + "\n")
print(str(exp / "results" / "scorecard.md"))
PY
