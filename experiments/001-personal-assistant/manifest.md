# Manifest: 001-personal-assistant

A sandboxed personal-assistant agent OS with a seeded fabricated brain, a
harness, a 3-task benchmark, and a Tier-1 scorer.

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
- `bin/run-task.sh <task_id>` — hermetic runner: scratch dir outside the repo,
  reset from seed, run the harness, snapshot to `runtime/evals/<id>/after/`,
  then score.
- `bin/score.py <task_id>` — Tier-1 assertions; writes
  `runtime/evals/<id>/score.json`.
- `harness/personal-assistant/` — system-prompt.md, actions.md, loop.sh.
- `tasks/tasks.yaml` — 3 tasks: T1 retrieval, T4 drafting, T7 escalate-vs-act.

## Run records

`harness/.../loop.sh` reads usage from the provider JSON
(`total_cost_usd`, `usage.input_tokens`, `usage.output_tokens`, `num_turns`,
`duration_ms`, `result`, `session_id`, `is_error`) and writes
`runtime/runs/<run_id>.json`. Missing fields are written as null, never
estimated.

## Scorer

Tier-1 assertions only (string/file presence + forbidden-mutation checks).
LLM-judge (Tier-2) scoring is deferred.

## How to run (a later step does this)

    bin/run-task.sh T1
    bin/run-task.sh T4
    bin/run-task.sh T7
