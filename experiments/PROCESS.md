# Experiment process

How we run an experiment from question to clear-cut takeaway. The point of writing it down is so that progress follows a process instead of a series of judgment calls: most steps run without asking the operator, and the few that need a human are named explicitly (see Decision rights).

## What an experiment is

An experiment answers one question about how to build an agent operating system for a use case at a position on the complexity spectrum (see `VISION.md`). It is not open-ended. Every experiment has a **charter** before it starts and a **takeaway** when it ends.

### Charter (write `charter.md` before building)

- **Use case + spectrum position.** What it is, and where on basic-to-sophisticated it sits.
- **Goal.** The question being answered, stated so a result can settle it. "Optimal" here means the simplest architecture that meets the bar, not the most capable.
- **Bar.** The success threshold, on two axes only: a target pass rate and a safety floor (failures that are never acceptable). Cost is NOT part of the bar (see Cost below).
- **Scoring.** Pre-registered, before the first run: the tasks, what a correct outcome is, and how it is checked. Score outcomes, not mechanism or phrasing.
- **Hypotheses in play.** Which `HYPOTHESES.md` entries this experiment tests (each with a pre-registered "Refutes if").
- **Stopping criteria.** The conditions under which the experiment ends (below).
- **Budget.** A spend and/or iteration cap before you check in with the operator. This bounds autonomous spend so a loop cannot run away; it is not a success criterion (see Cost).

## The loop

```
   Define          Build              Run               Diagnose
  (charter)  -->  (system under  -->  (N trials,   -->  (where did it
                   test + bench)       measured)         break, and why)
                                                              |
        ^                                                     v
        |                                                  Revise
     Decide  <----  Re-run & compare  <-------------  (one change:
   (continue or      (better? no                       gate, prompt,
    conclude)         regression?)                      tool, architecture)
```

1. **Define.** Write the charter.
2. **Build.** The system under test (brain, agent(s), tools, harness) and the benchmark (seeded realistic world, task set, scorer). Reuse the rig (`bin/brain`, `run-task.sh`, `score.py`, `seed/`) by hand; do not build new machinery you do not yet need.
   - *Lesson (001):* benchmark assertions must score OUTCOMES (was the fact durably captured? was the gap admitted without fabrication?), never an implementation choice or specific phrasing (`brain new` vs `brain update`; a keyword whitelist). Mechanism/phrasing assertions produce false failures and punish reasonable agent behavior; two of 001's three "failures" were eval-rig artifacts that vanished under outcome scoring with no expectation weakened.
3. **Run.** Each task in a hermetic scratch reset from `seed/`, N trials (default 3) to measure variance. Record outcome correctness, cost and tokens from provider JSON (never estimated), and escalation/intervention accuracy.
4. **Diagnose.** Classify every failure. The most useful distinction we have found: does it fail at *reasoning* (wrong judgment) or at *contract* (right judgment, wrong execution of how the system requires it to act)? They have different fixes.
5. **Revise.** Change one variable, recorded as an intervention: a harness gate, a prompt edit, a tool, an architecture change. One change at a time so the re-run attributes cause.
6. **Re-run and compare.** Did the change move the metric without regressing a previously passing case? Provider numbers, same tasks.
7. **Decide.** Continue the loop, or conclude (stopping criteria).

## Validity: no overfitting, no moving goalposts

The benchmark is worth something only if a high score predicts real-world performance. Two failure modes destroy that, and both are banned.

**Overfitting** (tuning the system to the tests instead of to the world):
- **Dev / held-out split.** Iterate only on a dev set. Keep a held-out set, and at least one held-out world, that is never inspected during tuning. Run it only at conclusion. The headline result is the held-out score; always report the dev-vs-held-out gap.
- **Multiple, varied worlds.** Generate several seeded worlds (different personas, inboxes, calendars) from a template. Conclude on worlds the system never saw. A system that memorizes one world fails here.
- **Blind/adversarial authoring.** Held-out tasks are written by an agent that does not see the system's internals and is told to try to break it.
- **Tune building blocks, not the instance.** No change may reference a specific task, entity, or message (no "if the sender is BrightPath, decline"). Changes are general mechanisms or they do not ship.

**Moving the goalposts** (changing what counts as success because the system did poorly):
- Scoring is pre-registered (charter). A scoring change after results exist is allowed ONLY to fix a measurement that tests the wrong thing (implementation or phrasing instead of outcome), and only with a recorded justification, a fixture proving the corrected check still FAILS on genuinely-wrong behavior, and an independent auditor-agent sign-off. Relaxing an expectation because the agent failed is never allowed, nor is editing the agent's prompt to pass a specific task.

Failed, inconclusive, and refuted are valid, valuable outcomes. An experiment that refutes a hypothesis is a win: we carry the learning into the next one.

## Cost: a signal, not a bar

Token cost is tracked on every run and reported, but it is NOT a pass/fail bar and never a reason to move a goalpost. The real yardstick is value: an agent OS that does the job well, saves time, and offloads human labor is almost always far cheaper than the person it replaces, and often faster, so a good-but-expensive design is a success, not a failure. Use cost only to (a) break ties between designs that otherwise meet the bar, (b) flag runaway waste worth fixing, and (c) frame value against a human-labor baseline. Never adjust a cost number to make a design pass or fail; report what it actually cost and what that buys.

## Divergence: try different bets, not just smaller steps

Going from one experiment to the next, do not just iterate the current design. Put several DIVERGENT architectures on the same fixed benchmark and compare them head to head: different agent counts, different retrieval, gate vs no-gate, even a stripped null (for example, no brain) you expect to fail. Pre-register the bets, including the unlikely ones, because a surprising failure or success teaches more than another small step. Incremental tuning climbs one hill; divergent bets find out whether it is the right hill.

## Stopping criteria

An experiment ends when one of these is true. Each yields a clear-cut takeaway.

- **Goal reached.** Hits the bar (pass rate + safety floor) on the held-out world/tasks with no regression across N trials. Takeaway: this architecture is proven for this use case; these building blocks are load-bearing, these are not.
- **Diminishing returns.** K consecutive iterations (default 3) with no material improvement. Takeaway: this is the ceiling of this architecture for this use case; here is the limiting factor.
- **Refutation.** A core charter hypothesis meets its pre-registered "Refutes if." Takeaway: the bet was wrong; here is what that rules out, and what to try instead.

A "we are not sure yet" ending is not allowed. If the evidence is thin, the takeaway says so and names the single next experiment that would settle it.

## The takeaway (write it when the experiment ends)

A concluded experiment writes a takeaway in its `results/` log that states, in plain terms:
- the answer to the charter's goal,
- the architecture and the building blocks that earned their place (and those that did not),
- the metrics that back it (pass rate, cost, escalation accuracy), with links to runs,
- the hypotheses it moved, and
- what it does not yet establish.

## Decision rights (what runs without the operator)

The agent proceeds autonomously on:
- mechanical rig fixes (paths, parsing, scorer bugs) that expose rather than hide a result,
- single-variable revisions and re-runs inside the charter,
- updating hypothesis status and writing results,
- running trials and independent tasks in parallel.

The agent stops and consults the operator on:
- changing the charter (goal, bar, stopping criteria) or the spectrum target,
- an architecture-level direction change not anticipated by the charter,
- exceeding the budget cap,
- any safety-floor failure (e.g. the agent took a consequential action it should have escalated),
- anything irreversible or outward-facing (sending, paying, publishing, deleting beyond the sandbox).

Weakening a task's expectation or editing the agent's prompt to force a pass is never allowed. A real failure is the result.

## Promotion to proven

- A **building block** is proven when it has earned its place across at least two experiments (or two use cases), with the metric that justifies it recorded each time.
- An **architecture** is proven when an experiment reaches its goal with no safety-floor failures and the result holds across N trials AND on the held-out world/tasks. Among compositions that meet the bar, prefer the simplest; use cost only to break ties.
- Promotion is an edit to the benchmark (the proven-architectures library) plus the hypothesis status changes that support it. Provisional results stay labeled SUPPORTED-but-thin until a second experiment confirms them.

## Running at scale, and automation

The rig already runs tasks and trials in parallel (hermetic scratch per run). Independent experiments can run in parallel the same way.

We will encode this process as a dynamic workflow (one that drives Define-through-Decide and only surfaces the Decision-rights escalations) once the loop has held across at least two experiments, including a held-out result, so the automation generalizes from more than one data point. Automating the loop before it is proven would lock in a guessed process; automate last.
