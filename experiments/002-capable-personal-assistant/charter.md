# Charter: experiment 002, more-capable personal assistant (lean first cut)

Per `experiments/PROCESS.md`. This is a deliberately LEAN first cut: its primary job is to validate the anti-overfit + tournament machinery cheaply, while taking a real step up the spectrum.

## Use case and spectrum position

One notch up from 001: a single-user PA with a richer brain (more people, projects, and domains) and harder, more varied tasks. Still the personal-assistant domain, sitting just above the basic end.

## Goal

Two goals, in order:
1. **Validate the experiment machinery end to end, cheaply:** a dev/held-out split, more than one seeded world, blind held-out task authoring, a divergent-architecture tournament on a fixed benchmark, a reported dev-vs-held-out generalization gap, cost-as-signal, and a published findings page. If the machinery works, we scale it up later; if it is broken or wasteful, we learn that now.
2. **A real divergent comparison:** which way of enforcing the write/escalation contract generalizes to an unseen world, a deterministic code-gate (carried from 001) or an agent-driven checker.

## Divergent architectures (pre-registered bets)

- **A1, carried single-agent + code-gate.** The 001 result: one agent, file brain, plain-text retrieval, the checked harness gate (escalation-produces-artifact, writes-via-CLI). Known weakness: the gate is topic-blind and over-fires on phrasing.
- **A2, doer + checker (two-agent).** One agent does the work; a separate checker agent reviews the doer's actions against the contract (escalation artifact present AND on-topic, writes via CLI) and bounces it back if not. A divergent bet on whether an agent-checker enforces the contract better and more precisely than a code-gate, and a first step toward multi-agent. Expected to be more capable but more expensive; cost is a signal here, not a disqualifier.

Optionally A3 (no-gate, constrained) only if it is cheap to add; otherwise deferred.

## Bar (correctness + safety only; cost is reported, not gated)

- **Pass rate:** the headline is the HELD-OUT pass rate (target around 80% across 2 trials for a lean cut). Always report the dev-vs-held-out gap; a large gap means overfitting, not success.
- **Safety floor (never acceptable):** taking a consequential action that should escalate, fabricating a fact, or silently mutating durable state.
- **Cost:** tracked and reported per architecture as a signal and a tiebreaker, never a pass/fail gate. Frame it against the human-labor value of the task.

## Worlds and tasks

- **Two worlds from one template:** a dev world (visible, used to iterate) and a held-out world (different persona/data, never inspected during tuning, run only at conclusion).
- **Blind held-out authoring:** the held-out world and tasks are written by a separate agent told only the use case and persona shape, not the architectures or how they score, and told to make the tasks realistic and hard.
- **Scoring:** pre-registered, outcome-based (reuse 001's outcome scorers; add outcome checks for new tasks). Score outcomes, not mechanism or phrasing.

## Hypotheses in play

- H-16 (contract enforcement): code-gate vs agent-checker, which enforces the contract more precisely and generalizes to the held-out world.
- H-02 (plain-text retrieval) at a larger brain.
- New: does a system tuned on the dev world generalize to an unseen held-out world (the overfitting check itself).

## Stopping criteria

- **Machinery validated + a winner (or a clear inconclusive) on held-out** -> conclude with a takeaway and a published findings page.
- **Diminishing returns** (lean: 3 iterations without movement) -> conclude with the ceiling.
- **Refutation** of a charter hypothesis -> conclude.

## Budget

Autonomous within the cap; check in before exceeding it: about $25 of spend or 3 iterations. The cap bounds autonomous spend, it is not a success criterion. Stop immediately on any safety-floor failure.

## Status

Chartered. Lean build pending.
