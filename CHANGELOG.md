# Changelog

Notable changes to the **agent & brain architecture** (the docs in this directory and the `recipes/` implementation layer).

**For implementers:** if you've built an agentic system from these docs, this is your update feed. Skim new entries and apply the **Impact** notes to your own project — you can point your coding agent straight at this file and ask it to reconcile your implementation with the latest architecture. Entries are written at meaningful stopping points, not on every edit.

The format follows [Keep a Changelog](https://keepachangelog.com): newest first, grouped into **Added / Changed / Fixed**, with an **Impact** line wherever a change asks something of downstream projects. Dates are `YYYY-MM-DD`; changes that ask nothing of implementers (typos, internal phrasing) are left out.

---

## 2026-06-15 — "Agents take on roles" (role/agent reframe)

A terminology and framing change, not a structural one. The brain layout, charters, run records, and recipes are unchanged on disk.

### Changed
- **The agent is now the foreground actor; a role is the job it holds.** Reversed the earlier framing that demoted "agent" to a "disposable shift of work / pair of hands" and crowned the **role** the "virtual employee." Now: **agents take on roles the way people take jobs** — the agent is the worker (it holds a bounded context, tools, and knowledge); the role is the durable, well-defined job that owns accountability and the tools+knowledge for the work. The "virtual employee" term is retired.
  **Impact:** mostly wording. If your own docs, prompts, or charters call the role a "virtual employee" or the agent a "shift of work / pair of hands," update them — agent = the worker that *fills* a role; role = the job it holds. No change to the brain's areas, charters, or the `agents/` machinery.
- **Swappability is now told through stateless runs + agent providers.** Invariant #3 is renamed **"Agents are swappable"** (was "disposable"): a run holds no state, and the **provider** behind an agent — the model + harness (Anthropic, OpenAI, an open-source model) — can be swapped without touching the role or the brain. New glossary term **Agent provider**.
  **Impact:** if a single model/vendor is baked into your role definitions, move provider choice to the harness layer so it's swappable, per the architecture. No brain or charter changes required.

---

## 2026-06-15 — Three-area brain, System role, and the recipes layer

Inaugural entry establishing the current baseline.

### Added
- **`recipes/` implementation layer.** A prescriptive, stack-specific build layer beneath the tech-agnostic docs, in three kinds: **brain recipes** (the foundation), **role recipes** (one role each, modular), and **kits** (a brain + role(s) combined). The architecture docs stay agnostic; recipes are where a concrete stack is chosen.
  **Impact:** none required — additive. If you want a turnkey build instead of interpreting the architecture yourself, start from a kit.

### Changed
- **The brain is now three areas, not two layers.** `knowledge/` (curated, durable, OKF) · `agents/` (role machinery — prompts, loops, tool lists, skills — durable but *not* OKF) · `runtime/` (work-queue, run-ledger, feedback, evals — transient, not OKF). Role machinery previously had no clear home; it now gets its own area, separated from regenerable runtime exhaust along two axes (*OKF vs. not* and *durable vs. transient*).
  **Impact:** if you implemented the old two-layer split, add an **`agents/`** area and move role machinery (system prompts, loop scripts, tool definitions, skills) into it, out of the runtime/operational layer. The knowledge layer is unchanged. Brain invariant #4 is now "three areas, never confused."
- **Dreaming is owned by a dedicated System role** and split by nature of work: **cross-cutting consolidation** (ingest, reconcile across roles, surface cross-role patterns, the digest) — always global — and **per-role reflection** (a role reviewing its own runs/feedback/charter) — an *earned* split you make only when the global pass is too coarse.
  **Impact:** if you ran dreaming as a role-less nightly job, reassign it to an explicit **System role** so it rolls up to an accountable owner. Start with that one role doing all reflection; split per-role only when warranted.

### Fixed
- **Invariant #4 ("every capability rolls up to a role") is now absolute** — dreaming no longer contradicts it, since the System role owns the cross-cutting work. No carve-out needed.
- **Write contract surfaced in the agent doc.** Agents write back *through the brain's write contract*, not by editing raw files — aligning the agent doc with brain invariant #5.
- **OKF restored to the example stacks**, and database cells labeled as *indexes* over the files, so no example reads as a database-as-source-of-truth (which the brain anti-patterns forbid).
- **Run-ledger format clarified** as illustrative operational-layer state (not OKF knowledge), and stale section cross-references corrected.
