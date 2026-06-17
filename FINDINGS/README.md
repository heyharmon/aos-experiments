# FINDINGS

This directory is the project's authoritative output for builders. It maps what has actually been proven against the complexity spectrum from `VISION.md`, with honest confidence labels and links to the raw evidence in `results/`.

Nothing here is asserted without a run behind it. "SUPPORTED-but-thin" means: one experiment, one world, evidence exists but generalizability is not yet shown.

## How to read this

`VISION.md` defines a spectrum of use-case sophistication. This map shows where proven results sit today. Every position not labeled is UNTESTED at the architecture level (individual hypotheses may be in play but no architecture conclusion has been reached).

```
basic ----------------------------------------------------> sophisticated

[001] single-agent PA         a PA that does more        multi-agent OS,
      few tools (schedule,    (more tools, more           many tools,
      reminders, draft,       surface, richer brain)      coordination,
      triage, escalate)        [002]                      autonomy
      simple file brain
                                                          other domains:
[003] single-agent coding                                 marketing, sales,
      assistant (same blocks,                             broader business ops
      different domain)
```

The map now spans TWO domains at the basic position: 001 (personal assistant) and 003 (coding assistant). 003 ran the same basic blocks on a software-engineering project to test whether they were PA-specific. They were not: the file brain, plain-text retrieval, binary reversible/escalate tag, named role, and provider-JSON cost all carried, so they have crossed the two-domain threshold and are closer to PROVEN. The one block that did NOT carry is the enforcement gate (see 003 page and building-blocks.md).

### Positions with results

| Position | Status | Findings page |
|---|---|---|
| Basic single-agent PA, file brain | SUPPORTED-but-thin | [001-basic-personal-assistant.md](./001-basic-personal-assistant.md) |
| One notch up (richer brain), code-gate vs doer+checker | INCONCLUSIVE (machinery validated; ranking open) | [002-capable-personal-assistant-lean.md](./002-capable-personal-assistant-lean.md) |
| Basic single-agent coding assistant (cross-domain) | SUPPORTED-but-thin (blocks carry PA -> coding; gate did NOT) | [003-coding-assistant-lean.md](./003-coding-assistant-lean.md) |
| Everything further right | UNTESTED | (no experiment concluded) |

"SUPPORTED-but-thin" means the architecture passed its bar (9/10 tasks, 3 trials, zero safety-floor failures) on one seeded world with the same authors writing both the system and the tests. It is a valid starting point, not a guarantee of generalization.

Experiment 002 (lean cut) was designed as the generalization test and the first divergent tournament. It **validated the anti-overfit + tournament machinery** (dev/held-out split, two worlds, blind held-out authoring, generalization-gap reporting, cost-as-signal) but did **not** produce an architecture ranking: a single-agent code-gate (A1) and a doer+checker pair (A2) both passed dev and held-out at 100% with zero safety failures, because the benchmark was too easy to stress either bet. The lesson (H-18): a divergent tournament only ranks the bets if the tasks trigger each bet's weakness. A fuller 002-scale run with harder, weakness-targeting tasks is the next step, and an operator-level decision.

## What lives here

- **README.md** (this file): the spectrum map.
- **building-blocks.md**: a reference table of every building block evaluated so far, with a verdict and confidence label per block.
- **001-basic-personal-assistant.md**: the consumable findings page for the basic single-agent PA use case.
- **002-capable-personal-assistant-lean.md**: the machinery-validation result and the inconclusive A1-vs-A2 tournament from the 002 lean cut.
- **003-coding-assistant-lean.md**: the cross-domain generalization result, the basic blocks carry from PA to coding; the enforcement gate did not.

## The raw evidence

Every claim in these pages points to a run in `results/`. Read the findings pages for the plain-language summary; read `results/` for the full trial logs, scorecards, and cost breakdowns. The experiment charters live in `experiments/`.
