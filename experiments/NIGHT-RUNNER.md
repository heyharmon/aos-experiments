# Night-runner doctrine

The self-steering contract for unattended overnight experimentation. The operator is
asleep and unreachable. This document is the agent's authority and its leash: it says
what the night-runner may decide alone, what it must never do, and how it avoids fooling
itself with nobody watching. It is law. The Workflow driver (`bin/night-runner.mjs`)
executes this doctrine; if the two disagree, this document wins and the driver is the bug.

Read `PROCESS.md` first. This doctrine does not replace it; it operationalizes it for the
no-operator case and removes the "stop and ask the operator" steps by replacing each one
with a mechanical rule.

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

Every iteration begins with a **Director** that reads repo state and chooses exactly ONE
action from this closed set. It may not act outside the menu; that is what keeps a 3am agent
from wandering.

| Action | When | Guard |
|---|---|---|
| `run` | An open charter needs more trials/data | Uses existing world+tasks; N≥3 trials |
| `revise` | A diagnosed failure has a single-variable fix | Exactly one variable; recorded as an intervention |
| `conclude` | A stopping criterion is met | Must pass the auditor gate before publish |
| `open` | No open experiment has live work, or a divergent bet is ready | Requires a written `charter.md` with "Refutes if" first |
| `furnish` | The benchmark is non-discriminating (H-18) | New tasks/worlds under held-out discipline |
| `halt` | A hard-stop condition is met | Writes report, exits |

The Director outputs its choice as structured data with a one-line rationale tied to a
specific charter or hypothesis id. A choice it cannot anchor to one is invalid and becomes
`halt` or a queued note.

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
   ┌─────────────────────────────────────────────────────────────┐
   │ while  spend < $100  and  iters left  and  no hard-stop:     │
   │                                                              │
   │   Director  → pick ONE action from the menu (anchored to a   │
   │               charter/hypothesis id)                         │
   │      │                                                       │
   │      ├─ run/revise/furnish/open → Executor does the work     │
   │      │      via the existing rig (run-arch.sh, tournament,   │
   │      │      score.py, brain CLI), writes results, returns    │
   │      │      metrics + this-iteration spend                   │
   │      │                                                       │
   │      ├─ conclude → Executor assembles the takeaway →         │
   │      │      Auditor (independent) refutes/clears →           │
   │      │      publish only on pass                             │
   │      │                                                       │
   │      └─ Recorder → update HYPOTHESES/CHANGELOG, commit to    │
   │             main, append one entry to the morning report     │
   │                                                              │
   │   accumulate spend; next iteration reads fresh repo state    │
   └─────────────────────────────────────────────────────────────┘
```

State passes through the **filesystem** (the repo), not through the driver. Each agent reads
current repo state at the top of its turn, so the loop is resumable: re-running picks up
from whatever is on disk and in git.

## Spend accounting (why $100 is enforced by hand)

There are two cost streams and the ceiling covers both:

1. **Experiment spend** — the agent-under-test runs as `claude -p` subprocesses (`harness/*/loop.sh`). Their cost lands in `runtime/runs/*.json` `cost_usd`, billed separately, and is **invisible** to the Workflow's own token budget. This is the large stream.
2. **Orchestration spend** — the Director/Executor/Auditor/Recorder reasoning. Bounded by the Workflow `budget.total`, but it is the small stream.

The driver cannot read files, so each iteration's Executor sums `cost_usd` across the
night's run JSONs and returns the cumulative figure. The loop halts when that figure plus an
orchestration estimate reaches $100. `budget.total` is set as a backstop, not the primary
gate. Cost is still a **signal, not a bar** (`PROCESS.md`): the ceiling bounds runaway, it
never decides pass/fail and is never edited to make a result look better.

## Benchmark discipline when authoring worlds/tasks

The night-runner may furnish the benchmark, but the anti-overfit rules in `PROCESS.md` hold
without an operator to enforce them:
- **Held-out stays blind.** Held-out worlds/tasks are authored by an agent told not to inspect the system's internals and to try to break it. Never tune against held-out; run it only at conclusion; always report the dev-vs-held-out gap.
- **Tune building blocks, not the instance.** No task, world, or change may reference a specific entity or message. General mechanism or it does not ship.
- **Author to discriminate (H-18).** New tasks must target a bet's *weakness* (over- and under-escalation traps, adversarial retrieval, ambiguous phrasing), or they do not earn their place — a benchmark everything passes teaches nothing.

## The morning report

Written to `results/NIGHT-<date>.md`, newest entry last, one block per iteration, plus a
header the operator can read in 30 seconds:

```
# Night run <date>

## TL;DR
- spend: $X.XX of $100   iterations: N   commits: M (on main)
- moved: <hypotheses/architectures that changed status>
- ⚠ flags: <safety-floor findings, failed audits, anything red>
- QUEUE for operator: <decisions deferred — unanchored ideas, scoring changes, pivots not taken>

## Iterations
### iter k — <action> on <experiment> → <one-line outcome>
  metrics: ...   spend this iter: $...   commit: <sha>
  ...
```

The QUEUE section is the morning hand-back: everything the doctrine told it *not* to
self-authorize ends up here as a crisp, decidable item, so the operator can clear the queue
over coffee and the next night starts from a sanctioned backlog again.

## How to launch

The driver is a Workflow script, reviewable and version-controlled at
`experiments/bin/night-runner.mjs`. Launch it (typically at end of day) with:

- `Workflow({ scriptPath: "experiments/bin/night-runner.mjs", args: { date: "<YYYY-MM-DD>", budgetUsd: 100, maxIterations: 12 } })`

It runs in the background and notifies on completion. To validate cheaply before a full
night, launch with `args: { ..., budgetUsd: 5, maxIterations: 1, smoke: true }` for a
single-iteration smoke test. Resume a killed/edited run with
`Workflow({ scriptPath, resumeFromRunId: "<id>" })`.
