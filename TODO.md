# TODO

## Question: standardize the experiment process into a reusable workflow now?

Answered as Elon would, not to please:

**No. That is premature automation.** We have run exactly one experiment, on one world, with one agent. Standardizing a process you have done once codifies assumptions from a sample of one, and you will throw most of it away after experiment 002 shows you what was actually 001-specific versus what is invariant. Automate is step 5 of the algorithm for a reason: it comes after the process is simplified and proven, and "proven" means repeated. Wrapping a workflow around a single run is polishing a step you might delete.

What we already have is enough structure: the rig (`bin/brain`, `run-task.sh`, `score.py`, `seed/`, the harness) and the experiment-folder shape (brain + world + tasks + scorer) ARE the reusable core. Reuse them by hand.

The rule: run 002 and 003 by hand on different worlds. When you have copy-pasted the same setup three times and felt the same friction three times, the standard will have announced itself, and you will extract a proven pattern instead of guessing one. Build the workflow then, not now.

## Follow-ups from experiment 001 (lean core, 2026-06-16)

- [x] Fix token accounting. `tokens_in` now records TOTAL input (uncached + cache-read + cache-creation) in `loop.sh` and `score.py`; scorecard and results log regenerated from saved raw JSON. Real input was ~105k to 195k per task, not 6 to 9.
- [x] Run the full 10-task suite (T1-T10), 3 trials each. Done 2026-06-16: 8/10 pass, T5 and T8 fail 0/3, T9 flaky (assertion phrase list, not agent). See `results/2026-06-16-exp001-full-suite.md`. Both failures are write-contract failures (escalation artifact not written; hand-edit instead of `./bin/brain`), not reasoning failures.
- [ ] High fixed per-task cost (~$0.13 average for trivial work), almost all cache-read of the brain + Claude Code system prompt. Measure how cost scales as the brain grows. Bears on H-02 and H-14.
- [ ] Add an unscoped baseline (no role file) so H-05 (roles earn their keep) can be tested, not just observed.

## Next round: failure-seeking tasks (from the full-suite run, 2026-06-16)

Little broke on *reasoning*: the model found every conflict, fabricated nothing, never wired money or silently mutated state. The 8/10 is mostly the suite confirming the model is a strong reasoner. The only real breaks were write-contract failures (T5, T8). Read that as the suite being too easy on judgment and too lenient otherwise: the next move is harder adversarial tasks, not more easy ones.

- [ ] Test H-16 directly: add a checked harness step (validator/gate that refuses an escalation lacking a `runtime/queue/approvals/` artifact, and refuses a hand-edit to `knowledge/`) and re-run T5/T8 plus new write-contract tasks. Measure prose-only compliance vs. with-gate compliance.
- [ ] Add more `expects_escalation` tasks (the suite has one, T5). Escalation accuracy of 0/1 is not a real rate. Include traps for *over*-escalation (a trivial reversible action the agent should just do, not gate) and *under*-escalation (a consequential action dressed up as routine), so the binary tag (H-08) is stressed in both directions.
- [ ] Adversarial retrieval for H-02: plant a fact under a synonym/paraphrase the agent is unlikely to query verbatim, and a near-duplicate distractor, to find the lexical-miss boundary. Also add more missing-info/refusal tasks (T9-style) with the absent fact made tempting to fabricate.
- [ ] Harden the T9-class assertions: replace the brittle keyword whitelist (`admits_gap_or_offers_next_step`) with a judge-scored "admits the gap, no fabrication" rubric so a correct refusal phrased differently does not flake.
- [ ] Cheaper judge: judge spend ($2.11) exceeded agent spend ($1.40). Try a smaller judge model or push more tasks to assertion-only, and confirm scores hold. Bears on H-14.

## Open hypotheses needing experiments

See `HYPOTHESES.md`. H-03 is blocked (needs a second agent). H-01 (self-improvement loop) is the marquee bet and still UNTESTED. Completed pre-pivot design notes are in `archive/todos.md`.
