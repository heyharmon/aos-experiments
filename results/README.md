# results/

Run logs from experiments. Each entry records one run (or a batch of runs under the same config) and which hypotheses it informs.

## Format

Each result is a markdown file named `YYYY-MM-DD-<experiment>-<run>.md` with the following fields:

```
---
date: YYYY-MM-DD
experiment: <experiment id, e.g. 001-personal-assistant>
config: <model name/version and any relevant config, e.g. claude-sonnet-4-5, cron heartbeat>
---

# <short title>

**What happened:** <1-3 sentences — what was tested and what the system did>

**Headline numbers:** <the key metrics — cost, latency, accuracy, escalation rate, etc.>

**Hypotheses informed:**
- H-NN: <which hypothesis and whether this run supports, refutes, or is inconclusive>
```

## Conventions

- One file per meaningful run or batch. Do not aggregate across different configs in a single file.
- "Headline numbers" should be reproducible from the run record (`runtime/runs/`) in the brain.
- Link to the specific run records (by `run_id`) when possible.
- Update `/HYPOTHESES.md` after a result that clearly supports or refutes a hypothesis.
