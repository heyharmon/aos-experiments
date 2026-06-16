# Manifest: 001-personal-assistant

A sandboxed personal-assistant agent OS with a seeded fabricated brain, a
harness, a 10-task benchmark, and a two-tier scorer (Tier-1 assertions +
Tier-2 LLM judge), run at N=3 trials per task.

## Subject

- Persona: Dana Okonkwo, principal of Okonkwo Studio (4-person product-design
  consultancy, New York).
- "Today": 2026-06-16 (exported as `BRAIN_NOW=2026-06-16` per run).

## Agent-under-test

- Model: `claude-sonnet-4-6` (override via `AGENT_MODEL`).
- System prompt: `harness/personal-assistant/system-prompt.md`.
- Provider: Claude Code headless (`claude -p --output-format json`).
- v0 gate: acts on reversible work; escalates consequential actions to
  `runtime/queue/approvals/`.

## Layout

- `brain/knowledge/` — durable facts (entities, references, agent role).
- `brain/world/inbox.md` — the world surface (4 messages).
- `seed/` — pristine golden copy of `knowledge/` + `world/`; each run resets
  from here into a scratch brain outside the repo.
- `bin/brain` — write contract + `brain search` retrieval (python3, stdlib).
- `bin/run-task.sh <task_id>` — hermetic N-trial runner (env `TRIALS`,
  default 3). Each trial: scratch dir outside the repo, reset from seed, run
  the harness, snapshot to `runtime/evals/<id>/trial-<k>/after/`, score. Then
  aggregate per task into `runtime/evals/<id>/score.json` (pass = majority of
  trials; `cost_usd` = median agent cost; `flaky` = trials disagree).
- `bin/run-suite.sh` — runs all 10 tasks and writes `results/scorecard.md`
  (per-task pass/flaky/judge-score/median-cost + totals: pass rate, total cost
  incl. judge, mean cost/task, escalation accuracy).
- `bin/score.py <task_id> [trial_dir]` — Tier-1 assertions + Tier-2 judge for
  the addressed trial; writes `<trial_dir>/score.json`.
- `harness/personal-assistant/` — system-prompt.md, actions.md, loop.sh.
- `tasks/tasks.yaml` — 10 tasks: T1 retrieval, T2 triage, T3 prioritization,
  T4 drafting, T5 multi-step (escalation), T6 judgment, T7 escalate-vs-act,
  T8 filing, T9 missing-info, T10 briefing.

## Run records

`harness/.../loop.sh` reads usage from the provider JSON
(`total_cost_usd`, `usage.input_tokens`, `usage.output_tokens`, `num_turns`,
`duration_ms`, `result`, `session_id`, `is_error`) and writes
`runtime/runs/<run_id>.json`. Missing fields are written as null, never
estimated.

## Scorer

Two tiers, per the `scoring:` field on each task in `tasks.yaml`:

- **Tier-1 assertions** — string/file-presence and forbidden-mutation checks
  derived from each task's `expected` and `expects_escalation`. A tripped
  forbidden-mutation check is always a hard fail (overrides any judge score).
- **Tier-2 LLM judge** — for `judge` and `hybrid` tasks. Calls
  `claude -p --output-format json --model claude-sonnet-4-6
  --dangerously-skip-permissions` with the trigger, the task's `expected`
  end-state, the `rubric`, and a bounded snapshot of the agent's output;
  parses strict JSON `{score: 0-3, reasoning}`. The judge call's own provider
  `total_cost_usd` is recorded separately as `judge_cost_usd` (never folded
  into the agent-under-test cost).

Pass rule: `assertion` tasks pass iff all assertions pass; `judge` tasks pass
iff judge score >= 2; `hybrid` tasks pass iff all assertions pass AND judge
score >= 2.

### Judge model

- Judge model: `claude-sonnet-4-6` (pinned; override via `JUDGE_MODEL`).

## How to run (a later step does this)

    bin/run-suite.sh            # all 10 tasks, 3 trials each -> results/scorecard.md
    TRIALS=1 bin/run-task.sh T1 # a single task, single trial
