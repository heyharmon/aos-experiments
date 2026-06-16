# TODO

## Question: standardize the experiment process into a reusable workflow now?

Answered as Elon would, not to please:

**No. That is premature automation.** We have run exactly one experiment, on one world, with one agent. Standardizing a process you have done once codifies assumptions from a sample of one, and you will throw most of it away after experiment 002 shows you what was actually 001-specific versus what is invariant. Automate is step 5 of the algorithm for a reason: it comes after the process is simplified and proven, and "proven" means repeated. Wrapping a workflow around a single run is polishing a step you might delete.

What we already have is enough structure: the rig (`bin/brain`, `run-task.sh`, `score.py`, `seed/`, the harness) and the experiment-folder shape (brain + world + tasks + scorer) ARE the reusable core. Reuse them by hand.

The rule: run 002 and 003 by hand on different worlds. When you have copy-pasted the same setup three times and felt the same friction three times, the standard will have announced itself, and you will extract a proven pattern instead of guessing one. Build the workflow then, not now.

## Follow-ups from experiment 001 (lean core, 2026-06-16)

- [x] Fix token accounting. `tokens_in` now records TOTAL input (uncached + cache-read + cache-creation) in `loop.sh` and `score.py`; scorecard and results log regenerated from saved raw JSON. Real input was ~105k to 195k per task, not 6 to 9.
- [ ] High fixed per-task cost (~$0.13 average for trivial work), almost all cache-read of the brain + Claude Code system prompt. Measure how cost scales as the brain grows. Bears on H-02 and H-14.
- [ ] Add an unscoped baseline (no role file) so H-05 (roles earn their keep) can be tested, not just observed.

## Open hypotheses needing experiments

See `HYPOTHESES.md`. H-03 is blocked (needs a second agent). H-01 (self-improvement loop) is the marquee bet and still UNTESTED. Completed pre-pivot design notes are in `archive/todos.md`.
