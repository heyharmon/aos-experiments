# Handoff: strengthen the evidence base (thin -> backed; sufficiency -> superiority)

## Context you need

The goal of this repo (`VISION.md`): become the authoritative answer to "what's the optimal way to build an agentic solution for my use case?" across a complexity spectrum, with every claim backed by a run in `results/`. Four experiments are concluded (001 PA, 002 capable-PA, 003 coding) and two are chartered-not-run (`003b-gate-discriminate`, `004-enforcement-stress`).

Read before doing anything: `HYPOTHESES.md`, `CHANGELOG.md`, `experiments/PROCESS.md`, `FINDINGS/README.md`. This handoff is interpretation, not a substitute for those.

**Where we actually stand.** The basic single-agent composition is the only thing with evidence: file brain (markdown `knowledge/` + transient `runtime/`, written via `./bin/brain`), plain-text ripgrep retrieval, one named role, the binary reversible/escalate tag, provider-JSON cost. It hit 9/10 on PA (001) and carried to a blind coding project (003). Headline behavioral finding: **the model reasons about consequence well but follows a written contract poorly** (so enforce protocols in a checked harness step, not prose). Everything else in `archive/` (multi-agent/brain-as-bus, dreaming, the 4-rung autonomy dial, OKF, tool/account/grant, six planes, self-improvement loop) is UNTESTED.

**Two structural weaknesses in the evidence, which are the point of this handoff:**

1. **Everything is thin.** 1-2 trials, one world per domain, benchmarks too easy to separate competing designs (H-18). "SUPPORTED-but-thin" is the ceiling any current finding has earned. Thin findings need more trials, more worlds, harder tasks before they can advance toward PROVEN.

2. **Every block was tested for SUFFICIENCY, never SUPERIORITY.** We showed plain-text retrieval *worked* (zero misses, H-02); we never ran an embeddings or graph arm against it. Same for the file brain, the named role, the CLI heartbeat. The refute clauses are all "does it fail," none are "does X beat Y." So "plain-text is enough" is supported; "plain-text is the best choice" is unevidenced. The enforcement layer is the one exception: 002/003 *did* run gate vs checker vs prose-only head-to-head (and the gate lost / was a no-op in coding), so that pattern exists, it just hasn't been applied to the foundational blocks.

**Important scoping caveat (do not overcorrect).** The experiments so far are deliberately simple single-agent, simple use cases. At the basic end, an embeddings/graph arm would have been premature complexity (delete-before-optimize, earned-complexity per PROCESS.md): a small single-operator brain has nothing for embeddings to beat. So we are NOT retroactively faulting 001-003 for skipping an embeddings arm. The correction is forward-looking, see below.

## What I want you to do, in order

1. **Adopt A/B (superiority) thinking as the default, triggered by spectrum position.** State every block finding with honest scope: "plain-text is *sufficient at small scale*," not "plain-text *beats embeddings*." Then, as a use case climbs the spectrum to where an alternative becomes plausible (a large brain, real retrieval pressure, paraphrase/synonym recall, multi-agent shared memory), pre-register a head-to-head arm so the claim upgrades from "sufficient here" to "superior to the named alternative." A sufficiency result and a superiority result are different claims; label which one each run earns. This is the same machinery PROCESS.md already calls a divergent tournament, now pointed at the foundational blocks, not just the enforcement layer.

2. **Run the two already-chartered gate experiments; they settle "checked gate beats prose."** Both exist and are ready:
   - `experiments/003b-gate-discriminate/charter.md`: three arms (A_old presence-keyed gate, A_fix `repo_changed AND NOT drafted`, A_null prose-only) on a benchmark built to *make the gate fire* and to test the H-20 fix. Pays down the 003 debt where the gate fired 0/22 and could not be ranked.
   - `experiments/004-enforcement-stress/charter.md`: A_gate (with the H-20 fix pre-registered) vs A_nogate, on violation-inducing tasks (explicit "just push it," authority/urgency pressure) designed so the gate is the only thing that could stop a breach. Resolves whether enforcement is load-bearing or whether the model self-complies enough to delete the gate (best part is no part). Run via `.claude/workflows/run-experiment.js`.
   These directly answer your "test that the checked gate beats prose" requirement. Today the claim is PA-only (helped in 001's T5) and a no-op-with-a-blind-spot in coding (003); these two runs make it a backed, cross-domain verdict instead of a domain-anecdote.

3. **Re-state existing findings with correct scope in `FINDINGS/` and `HYPOTHESES.md`.** Each block row should read: claim, what was tested (sufficiency vs superiority), trial count, world count, domain count, and the named alternative NOT yet compared against. A reader must be able to tell "proven better than X" from "worked once, nothing else tried." This is honesty maintenance, not new runs.

4. **When you climb the spectrum, design the superiority arm in at charter time, not after.** The first place this bites is retrieval: a large brain with paraphrase recall and near-duplicate distractors is where plain-text *could* lose to embeddings, so that is the experiment where an embeddings arm is finally earned and required (it is already a 001 carry-forward: "adversarial retrieval for H-02"). Same logic for the named role (H-05 unscoped baseline) and any block whose alternative becomes real at higher complexity.

## How to know a run is good enough to back a claim

- Pass/fail outcome is scored, not mechanism or phrasing (PROCESS.md Build lesson: two of 001's "failures" were eval-rig false failures from scoring the command used instead of the outcome).
- At least one architecture actually fired its enforcement/failure path; if all arms converge, the benchmark is non-discriminating and ranks nothing (H-18). Verify this *after* the run, before writing any ranking.
- The claim's scope matches the test: sufficiency claims need a not-fail result; superiority claims need a named alternative arm that lost on the same benchmark.
- Held-out world is blind-authored and run once at conclusion; report the dev-vs-held-out gap as the headline (H-17).

## Constraints

- Do NOT weaken a task's expectation or edit the agent's prompt to force a pass. A real failure is the result (CLAUDE.md, PROCESS.md).
- Do NOT add a named concept/plane/role/invariant to the running system to satisfy a hypothesis before the cheapest experiment that could refute it. Automate last.
- Do NOT introduce complexity (embeddings, a graph, multi-agent, a richer tag) at a spectrum position where the simpler thing has not yet failed. The superiority arm is earned by the use case demanding it, not by wanting a head-to-head for its own sake.
- Writes go through `./bin/brain`; `runtime/` is disposable; no secrets in the repo.
- Operator-only decisions (do not do these autonomously): charter changes, architecture-level pivots (scale-up, new domain, multi-agent), budget breach, any safety-floor failure, anything irreversible or outward-facing. The decision menus are in `TODO.md`.
- Voice: terse, declarative, tables over prose, ASCII diagrams only, no em dashes.

## When you're done

- Each run: a record in `results/` + a `FINDINGS/` page + the `HYPOTHESES.md` status move + a `CHANGELOG.md` entry (newest first, dated), all in one commit, staged narrowly.
- Label each advanced claim explicitly as sufficiency-backed or superiority-backed, with trial/world/domain counts.
- One-line completion summary. Propose a commit; do not push without operator approval.
