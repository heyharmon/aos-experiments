# Building blocks

A reference table of every architectural building block evaluated so far, with a plain-language verdict, an honest confidence label, and a link to the experiment behind it.

Nothing here is claimed beyond what the runs show. Labels:

- **SUPPORTED-but-thin**: at least one experiment supports this block, but on a single world with the same authors writing system and tests. Not yet shown to generalize.
- **SUPPORTED across two domains**: the block earned its place in two distinct domains (e.g. PA and coding). Per the promotion rule (`experiments/PROCESS.md`) this is closer to PROVEN, but still thin if each domain is a single lean cut.
- **UNTESTED**: the block was in use but no controlled comparison was run (e.g. no baseline without it). Cannot yet measure its contribution.
- **INCONCLUSIVE**: the experiment ran but the evidence does not settle the question. Named carry-forward test needed.
- **REFUTED**: a pre-registered refute condition was met. Do not build on this.

---

## Cross-domain status (experiment 003: PA -> coding)

Experiment 003 ported the basic single-agent blocks to a coding assistant on a blind held-out software project (`FINDINGS/003-coding-assistant-lean.md`). The result: the five core blocks below ALL carried with no break and no domain-specific rework, so they crossed the two-domain threshold and are now closer to PROVEN. The one block that did NOT carry is the checked enforcement gate: in coding it fired 0/22 trials and would not have caught the single real breach (its consequential rule is suppressed by approval-presence, the H-20 blind spot). The confidence column below reflects this.

---

## Blocks evaluated in experiment 001 (basic single-agent PA), extended by 003 (coding)

| Building block | What it is | Verdict | Confidence | Experiment |
|---|---|---|---|---|
| File brain | Plain markdown files in knowledge/ (durable facts) and runtime/ (queues, approvals, inbox). No database, no vector store. | Keep. Every fact had a findable home in 001 (30 runs); in 003 it held project conventions, ADRs, ownership, and runbooks for two software projects, and the agent learned each from the brain and used it. Degrade-to-plain-text never violated. | SUPPORTED across two domains (PA + coding; each thin) | [001](../results/2026-06-16-exp001-iter2.md), [003](../results/2026-06-16-exp003-lean.md) |
| Plain-text retrieval (H-02) | ripgrep over frontmatter and content; no embeddings, no graph layer. | Keep. Zero retrieval-miss failures in 001 (30 runs); in 003, the sternest test yet (grepping CODE), it found the exact validation home + cap + correct layer/stage on both software projects from the brain's conventions, zero misses. Reported true absences without fabricating in both domains. Sufficiency at brain scale still not measured. | SUPPORTED across two domains (PA + coding; scale untested) | [001](../results/2026-06-16-exp001-iter2.md), [003](../results/2026-06-16-exp003-lean.md) |
| Binary reversible/escalate tag (H-08) | Every action tagged as either reversible (act) or consequential (escalate). No finer taxonomy. | Keep, sufficient in both domains. In 001 the tag drove the right escalate-vs-act call on every action; in 003 it mapped cleanly onto draft-a-patch (reversible) vs commit/push/delete (escalate), correct on the explicit code traps in nearly every trial. No case forced a wrong call; no operator wished for a finer tag in either domain. The refute clause still needs two-sided escalation traps to fully settle; not yet REFUTED. | INCONCLUSIVE, leaning no-refute, now held in two domains | [001](../results/2026-06-16-exp001-iter2.md), [003](../results/2026-06-16-exp003-lean.md) |
| Checked escalation/write gate (H-16, H-20) | A harness step that requires an approval artifact to exist before proceeding and issues a corrective re-prompt if not. | KEEP for PA, but did NOT carry to coding. In 001 (PA) prose-only failed the escalation contract 0/3 and the gate is what made escalation happen at all. In 003 (coding) the gate fired 0/22 trials, did no work, and on the one real breach recorded `would_have_fired=false`: its consequential rule `(repo_changed OR claimed) AND NOT approvals` is suppressed by approval-presence, so it would have let an in-place repo mutation (a simulated commit) through even though an approval also existed. The H-20 blind spot. A_proven beat A_null by doer behavior, not the gate. Fix the rule to `repo_changed AND NOT drafted` (gate the action, not approval-presence) before re-testing. | SUPPORTED-but-thin in PA only; did NOT earn its place in coding; design flaw (H-20) | [001](../results/2026-06-16-exp001-iter2.md), [003](../results/2026-06-16-exp003-lean.md) |
| Missing-info / refusal | The agent states an absent fact/convention plainly and does not fabricate it; offers to capture it instead. | Keep. In 001 (T9) the agent reported a true absence (no Northwind phone) without fabricating; in 003 (C4/CH4) it stated plainly that the project has no documented versioning/logging convention and offered to draft an ADR, no fabrication, on both projects. | SUPPORTED across two domains (PA + coding; each thin) | [001](../results/2026-06-16-exp001-iter2.md), [003](../results/2026-06-16-exp003-lean.md) |
| Named role (H-05) | A scoped role file that defines the agent's accountabilities, constraints, and capabilities. | Keep provisionally. The role scoped the agent's behavior throughout 001 and 003 (PA and coding); the agent never acted outside it. BUT no experiment has run the unscoped do-everything baseline, so the role's advantage over a baseline agent is observed, not measured. | UNTESTED as a comparison (no baseline without it), used in two domains | [001 charter](../experiments/001-personal-assistant/charter.md), [003](../results/2026-06-16-exp003-lean.md) |
| Provider-JSON cost measurement (H-14) | Per-run tokens and cost read directly from provider usage JSON, not estimated. Recorded per task and per trial including corrective re-prompts. | Keep. Every cost figure in 001 and 003 (including each gate corrective pass) came from provider JSON, reproducible per trial; framed against human-labor value in both. Thin because the decisions so far are about the eval rig's cost (cut the judge; the gate added nothing), not yet an operator changing an agent's cadence or retiring it on a work-per-dollar basis. | SUPPORTED across two domains (real numbers, thin decision set) | [001](../results/2026-06-16-exp001-iter2.md), [003](../results/2026-06-16-exp003-lean.md) |

---

## Blocks not yet evaluated

These are in `HYPOTHESES.md` but no experiment has concluded on them.

| Building block | Hypothesis | Status |
|---|---|---|
| Self-improvement loop | H-01 | UNTESTED |
| Brain-as-bus inter-agent coordination | H-03 | UNTESTED (blocked: needs 2nd agent) |
| Autonomy dial granularity | H-04 | UNTESTED |
| Dreaming / nightly consolidation | H-06 | UNTESTED |
| OKF format vs plain frontmatter | H-07 | UNTESTED |
| Runner/provider swap | H-09 | UNTESTED |
| Staged ingestion | H-10 | UNTESTED |
| Tool/account/grant model | H-11 | UNTESTED |
| Six-planes decomposition | H-12 | UNTESTED |
| Heartbeat loop as default activation | H-13 | UNTESTED |
| Degrade-to-plain-text | H-15 | UNTESTED |
