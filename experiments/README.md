# experiments/

An experiment is a **system-under-test** paired with a **benchmark** and one or more **pre-registered hypotheses** it bears on.

The system-under-test is something you actually built and ran. The benchmark is a reproducible way to measure it. The hypotheses are claims from `/HYPOTHESES.md` that the experiment is designed to confirm or refute — registered before results are collected, not after.

```
experiments/
  001-personal-assistant/   # first experiment: local brain + PA agent
    brain.md                #   how to build the brain (local-brain recipe)
    build.md                #   how to build and run the PA agent
```

## 001-personal-assistant

A local brain (plain markdown files, `bin/brain` CLI, ripgrep) paired with a personal assistant agent running on Claude Code (`claude -p`) on a cron heartbeat. The smallest possible end-to-end system: one brain, one agent, no external accounts.

Hypotheses it bears on: see `/HYPOTHESES.md` (H-01 and related entries on brain-as-bus coordination, reversible-vs-escalate authority gating, and run-record telemetry).

To build and run it, start with `brain.md` then `build.md` in this directory.
