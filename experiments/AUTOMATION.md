# Automation: two layers, one system

There are two drivers, with distinct jobs. Do not confuse them.

```
  experiments/bin/night-runner.mjs        OUTER, self-steering, UNATTENDED overnight.
  (the thing you launch for a night)       Picks the next experiment from the backlog,
                                           enforces a nightly $ ceiling, delegates each
                                           experiment to the inner engine, audits the
                                           conclusion, commits to main. Governed by
                                           experiments/NIGHT-RUNNER.md (read it first).
        | delegates one bounded experiment per slot (via workflow())
        v
  .claude/workflows/run-experiment.js     INNER engine. Runs ONE chartered experiment end
  (also usable directly, attended)         to end and stops. Structurally bounded; does
                                           NOT self-steer and does NOT git commit.
```

- **For an unattended night**, launch the OUTER driver (see `NIGHT-RUNNER.md` -> How to launch). It calls the inner engine for you.
- **To run a single chartered experiment yourself**, call the INNER engine directly as below.

The inner loop (build -> blind held-out -> tournament -> iterate Decide/Revise/Re-run -> publish) is encoded at `.claude/workflows/run-experiment.js`. It exists because the loop held unchanged across experiments 001, 002, and 003, so it is safe to automate (PROCESS.md: automate after the loop holds across >=2 experiments incl. a held-out result).

## Hard rule both layers obey: no detached processes

Never background or detach a run (`&`-to-init, `setsid`, `nohup`, watcher/unwedge scripts, out-of-repo run copies). Every `claude -p` runs in the foreground under `loop.sh`'s wall-clock timeout and dies with its parent; a wedged trial is killed by the timeout and recorded as a FAILED trial. This is the rule a runaway smoke test violated (it detached tournaments to init and a watcher kept respawning them, burning spend after the run should have stopped); it is now the first invariant of both drivers.

## Running the inner engine directly

## How to use it

1. Write the one human-authored artifact: `experiments/NNN-name/charter.md` (use case + spectrum position, goal, bar = pass rate + safety floor, pre-registered scoring, divergent architectures, hypotheses, stopping criteria, budget). Cost is a signal, not part of the bar.
2. Launch the loop with a thin inline wrapper that passes the charter dir via the `workflow()` helper (whose second argument binds the child's `args` global):

   ```js
   const r = await workflow(
     { scriptPath: "/abs/path/to/.claude/workflows/run-experiment.js" },
     { dir: "experiments/NNN-name", trials: 2, maxIterations: 3 }
   )
   return r
   ```

   Optional args: `trials` (default 2), `maxIterations` (default 3).

   Note: a bare top-level `Workflow({ scriptPath, args })` did NOT forward `args` to the script in testing, and the file is not registered for `Workflow({ name })` lookup. The `workflow()`-helper wrapper above is the path that reliably binds `args`.

## What it does without you

- Builds the dev world, discriminating tasks, the charter's architectures, and the rig (reusing the most recent experiment's rig).
- Has a blind agent author an unseen held-out world and tasks.
- Runs the tournament on dev + held-out, then iterates Decide -> Revise (one variable) -> Re-run until a stopping criterion or the iteration cap.
- Publishes the takeaway, updates `HYPOTHESES.md` and `FINDINGS/`, and writes a `CHANGELOG.md` entry.

## What it surfaces to you (operator-level forks only)

It returns `final_status` and stops for you on:
- a safety-floor breach by the system under test,
- the iteration/budget cap reached without a conclusion,
- an architecture-level direction change or charter change,
- anything irreversible or outward-facing.

It never weakens an expectation to force a pass, never tunes on the held-out world, and never patches machinery against observed held-out behavior (it reports that as a finding). Those guardrails are baked into every phase prompt and enforced by `PROCESS.md`.

## What it does NOT decide

Starting a new experiment, choosing the next use case or spectrum position, and changing a charter are operator decisions. The loop runs one chartered experiment to a takeaway; you choose what gets chartered.
