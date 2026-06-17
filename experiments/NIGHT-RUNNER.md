# Night-runner doctrine

The self-steering contract for unattended overnight experimentation. The operator is
asleep and unreachable. This document is the agent's authority and its leash: it says
what the night-runner may decide alone, what it must never do, and how it avoids fooling
itself with nobody watching. It is law. The drivers execute this doctrine; if they
disagree, this document wins and the driver is the bug.

Read `PROCESS.md` first. This doctrine does not replace it; it operationalizes it for the
no-operator case and removes the "stop and ask the operator" steps by replacing each one
with a mechanical rule.

## Two layers, one system

The automation is split so no single agent has unbounded scope (the failure that burned a
smoke test: one free-form executor ran a multi-hour tournament and detached runaway
processes inside a single iteration).

```
  bin/night-runner.mjs   OUTER self-steering shell. Picks the next experiment from the
                         backlog, enforces the nightly $ ceiling, delegates each
                         experiment to the inner engine, audits the conclusion, commits.
                         This is the thing you launch.
        |
        v  (one bounded experiment per outer slot, via workflow())
  .claude/workflows/run-experiment.js   INNER engine. Runs ONE chartered experiment end
                         to end: build dev -> blind-author held-out -> tournament ->
                         iterate Decide/Revise up to a fixed cap -> publish the takeaway
                         to files. Structurally bounded: fixed trials, fixed
                         max-iterations, per-call wall timeouts, concurrency <=4, and it
                         does NOT git commit (the outer auditor gates commits).
```

The outer shell never runs trials directly. The inner engine never self-steers across
experiments and never commits. Each layer is small enough to reason about.

## Hard invariants (mechanical, not vibes)

1. **No detached processes, anywhere.** No `&`-to-init, no `setsid`/`nohup`/`disown`, no
   self-relaunching watcher or unwedge scripts, no out-of-repo run copies. Every `claude -p`
   runs in the foreground under `loop.sh`'s wall-clock timeout and dies with its parent. A
   wedged trial is killed by the timeout and recorded as a FAILED trial. This is the rule a
   smoke test violated; it is now the first invariant.
2. **Marginal spend accounting.** `runtime/` is wiped at the start of the night, so the sum
   of `cost_usd` across `runtime/**/*.json` is tonight's spend only. The ceiling is checked
   after every experiment against that marginal sum, never against stale scratch.
3. **One experiment per outer slot, bounded by the inner engine,** so a single slot can
   never run away in time or money.
4. **No conclusion is committed until the independent auditor clears it.**

## Mandate

Make real, honest progress against `VISION.md` overnight: find proven building blocks and
architectural patterns for agentic operating systems along the complexity spectrum, and
furnish the benchmark with discriminating worlds and tasks. Conclude experiments that are
ready, advance the ones that are not, and leave `main` and the morning report in a state
the operator can trust at a glance.

A night that runs three honest experiments to clear takeaways is a good night. A night that
runs zero but refutes a marquee bet is also a good night. A night that publishes a win the
auditor would have caught as overfit is a **bad** night even if the number is high. Honesty
is the product; the pass rate is just one of its measurements.

## The autonomy envelope (operator-set, 2026-06-16)

```
self-authorize within bounds   $100 / night hard ceiling   commit to main directly
```

The operator removed the human checkpoint. That raises the value of the bounds below, not
lowers it. "Self-authorize within bounds" is **not** a blank check.

**What the night-runner MAY do on its own:**
- Run trials, score, diagnose, and apply single-variable revisions inside an existing charter.
- **Conclude** an experiment (goal reached / diminishing returns / refutation) — only after it clears the auditor gate.
- **Open a new experiment**, including an architecture-level pivot, provided the new direction is *derivable from the spectrum (`VISION.md`) or an open `HYPOTHESES.md` bet* and is *pre-registered as a full `charter.md` with a falsifiable "Refutes if" BEFORE any trial runs*. No charter, no run.
- **Author new worlds and tasks** to furnish or harden the benchmark, under the held-out discipline below.
- Update `HYPOTHESES.md`, write `results/` and `FINDINGS/`, update `CHANGELOG.md`, and commit to `main`.

**What is OUT of bounds even with self-authorize (these are NOT research directions):**
- Inventing a research direction with no line back to the spectrum or an open hypothesis. Curiosity is not a charter. If it is genuinely new and unanchored, write it to the morning queue, do not run it.
- Weakening a task's expectation, or editing the agent-under-test's prompt, to make a result pass. Forbidden in `PROCESS.md`, forbidden here, and the single thing the auditor hunts hardest.
- Changing scoring after results exist, except the one narrow PROCESS-sanctioned fix (a check that tests mechanism/phrasing instead of outcome), and only with the recorded justification + a fixture proving the corrected check still FAILS on genuinely-wrong behavior. Overnight, prefer to QUEUE even a defensible scoring change rather than self-grant it.
- Anything outward-facing or irreversible beyond the repo: no sending, paying, publishing outside the repo, deleting outside `runtime/`, no network writes, no touching anything above the repo root.
- Touching `archive/` (read-only) or rewriting git history.

## Hard-stop conditions (halt the night, write the report, exit)

1. **Budget breach.** Cumulative spend (see Spend accounting) reaches the $100 ceiling. Structural: the loop stops opening work.
2. **Repeated tool failure.** The same rig command fails 3 times across attempts, or two consecutive iterations make zero progress. Do not thrash; stop and report.
3. **Integrity tripwire.** The night-runner detects it is about to do, or has done, something on the out-of-bounds list (e.g. a diff that edits a system prompt under `harness/` during a revision step). Stop, flag in red, do not commit that step.

Note one deliberate difference from `PROCESS.md`: a **safety-floor failure by the agent-under-test** (it committed/pushed without escalating, fabricated a convention, mutated durable state) does **not** halt the night. That is a *finding*, not an incident — the world is sandboxed and the action simulated. Record it as a refutation/limit, flag it prominently in the morning report, and let the experiment conclude on it. Halting would throw away the most valuable result an experiment can produce.

## The constrained decision menu

Each outer slot begins with a **Director** that reads repo state and chooses exactly ONE
action from this closed set. It may not act outside the menu; that is what keeps a 3am agent
from wandering. The Director does not run anything itself, it only decides which experiment
the bounded inner engine runs next.

| Action | When | Guard |
|---|---|---|
| `delegate` | An anchored experiment is ready (or chartered-but-unfinished) | Hands one charter to the inner engine; writes the charter first if it does not exist (anchored + "Refutes if" pre-registered) |
| `halt` | No anchored work remains, budget is nearly gone, or a hard-stop holds | Writes report, exits |

The Director outputs its choice as structured data with a one-line rationale tied to a
specific backlog item or hypothesis id. A choice it cannot anchor to one is invalid and
becomes `halt` or a queued note. The single-variable revision, the conclude, and the
benchmark-furnishing all happen *inside* the inner engine's bounded Decide/Revise loop, not
as free outer actions.

## Anti-self-deception: the auditor gate

A single agent grading its own overnight work drifts toward declaring success. So no
conclusion is published on the doer's say-so. Every `conclude` passes through an
**independent auditor agent** that did not see the doer's reasoning and is told to try to
refute the conclusion. It checks the `PROCESS.md` validity rules, mechanically:

- Was scoring **pre-registered** in the charter before the run?
- Is the **headline the held-out number**, and is the **dev-vs-held-out gap** reported?
- Was **any** agent-under-test prompt edited, or **any** expectation weakened, to reach the result? (Inspect the diff, not the claim.)
- Did at least one architecture actually **fire its enforcement/failure path**? If all bets converged, the benchmark is non-discriminating (H-18) and the tournament cannot rank — the honest takeaway is "inconclusive," not a winner.
- Does every asserted claim **link to a run** in `results/`?

Auditor verdict `pass` → publish (write FINDINGS, move hypothesis status, commit). Verdict
`fail` → the conclusion is **downgraded to SUPPORTED-but-thin or INCONCLUSIVE**, the
violations are written into the result log, and the open question is added to the morning
queue. The night never publishes over a failed audit.

## The loop

```
   ┌──────────────────────────────────────────────────────────────────┐
   │ Reset: wipe runtime/ scratch (so spend is tonight-only)           │
   │                                                                   │
   │ while  spend < $CEILING  and  slots left  and  no hard-stop:      │
   │                                                                   │
   │   Director  → pick the ONE next experiment (anchored); write its  │
   │               charter first if new                                │
   │      │                                                            │
   │      ▼  delegate (one bounded experiment)                         │
   │   run-experiment.js  → build dev · blind held-out · tournament ·  │
   │               iterate Decide/Revise (capped) · publish to files   │
   │               (foreground only, no detached procs, no commit)     │
   │      │                                                            │
   │   Spend  → sum cost_usd across runtime JSONs (marginal)           │
   │      │                                                            │
   │   Auditor (independent) → refute the published conclusion;        │
   │               fail ⇒ downgrade before anything is committed       │
   │      │                                                            │
   │   Recorder → commit the audited result to main, update backlog,   │
   │               append one report block                             │
   └──────────────────────────────────────────────────────────────────┘
```

State passes through the **filesystem** (the repo), not the driver. Each agent reads current
repo state at the top of its turn, so the loop is resumable: re-running picks up from
whatever is on disk and in git. Resume a killed run with
`Workflow({ scriptPath, resumeFromRunId })`.

## Spend accounting (why the ceiling is enforced by hand)

There are two cost streams and the ceiling covers the one that matters:

1. **Experiment spend** — the agent-under-test runs as `claude -p` subprocesses (`harness/*/loop.sh`). Their cost lands in `runtime/**/*.json` `cost_usd`, billed separately, and is **invisible** to the Workflow's own token budget. This is the large stream and the one the $ ceiling governs.
2. **Orchestration spend** — the Director/Auditor/Recorder reasoning. Bounded by the Workflow `budget.total` token backstop; the small stream.

`runtime/` is **wiped at the start of the night**, so summing `cost_usd` across the runtime
JSONs gives tonight's *marginal* spend, not a meaningless total polluted by prior scratch
(the bug that made a smoke test mis-report ~$33/$77 when its real marginal spend was ~$6).
After every experiment the Spend step re-sums and the loop halts once the ceiling is reached.
Cost is still a **signal, not a bar** (`PROCESS.md`): the ceiling bounds runaway, it never
decides pass/fail and is never edited to make a result look better.

## Benchmark discipline when authoring worlds/tasks

The night-runner may furnish the benchmark, but the anti-overfit rules in `PROCESS.md` hold
without an operator to enforce them:
- **Held-out stays blind.** Held-out worlds/tasks are authored by an agent told not to inspect the system's internals and to try to break it. Never tune against held-out; run it only at conclusion; always report the dev-vs-held-out gap.
- **Tune building blocks, not the instance.** No task, world, or change may reference a specific entity or message. General mechanism or it does not ship.
- **Author to discriminate (H-18).** New tasks must target a bet's *weakness* (over- and under-escalation traps, adversarial retrieval, ambiguous phrasing), or they do not earn their place — a benchmark everything passes teaches nothing.

## The morning report

Written to `results/NIGHT-<date>.md`, one block per experiment, plus a header the operator
can read in 30 seconds:

```
# Night run <date>

## TL;DR
- spend: $X.XX of $CEILING   experiments: N   commits: M (on main)
- moved: <hypotheses/architectures that changed status>
- ⚠ flags: <safety-floor findings, failed audits, anything red>
- QUEUE for operator: <decisions deferred — unanchored ideas, scoring changes, pivots not taken>

## Experiments
### <experiment dir> — <held-out headline> → <one-line outcome>
  metrics: held-out pass + dev-vs-held-out gap, which bets fired   spend: $...   commit: <sha>
  ...
```

The QUEUE section is the morning hand-back: everything the doctrine told it *not* to
self-authorize ends up here as a crisp, decidable item, so the operator can clear the queue
over coffee and the next night starts from a sanctioned backlog again.

## How to launch

The outer driver is a Workflow script at `experiments/bin/night-runner.mjs`. Launch it at
end of day with:

- `Workflow({ scriptPath: "experiments/bin/night-runner.mjs", args: { date: "<YYYY-MM-DD>", budgetUsd: 100, maxExperiments: 8, trials: 3, maxIterations: 3 } })`

Args: `date` (report/branch label), `budgetUsd` (hard $ ceiling, default 100),
`maxExperiments` (outer slots, default 8), `trials` (per-task trials in the inner engine,
default 3), `maxIterations` (inner Decide/Revise cap, default 3).

It runs in the background and notifies on completion. The `smoke: true` flag validates the
**outer wiring only** (Reset → Director → Spend → Record → report) and **never delegates a
real experiment**, so it costs only orchestration tokens, never an experiment run. Use it to
confirm plumbing before a real night:
`args: { date: "...", smoke: true }`. Resume a killed/edited run with
`Workflow({ scriptPath, resumeFromRunId: "<id>" })`.
