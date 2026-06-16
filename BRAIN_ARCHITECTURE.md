# An Architecture for a Brain

### A technology-agnostic vision for the shared memory an agent system reads, writes, and coordinates through — from a personal notes store to a whole organization's working memory

One place that holds everything your agents know and produce: plain files you can open and read, durable enough to outlive any tool, and the only thing the agents share.

**Audience:** the operator who wants a durable, understandable memory for their agent system, and any builder (in any stack) who will implement it.
**Companion:** [`AGENT_ARCHITECTURE.md`](./AGENT_ARCHITECTURE.md) describes the *system around the brain* — the agents, loops, and learning that read and write it. This document describes the **brain itself**: the Context plane. See [`README.md`](./README.md) for how the docs relate.

---

## 0. What this is, and what it is not

This is a **vision and a set of invariants**, not an implementation. It fixes the brain's *structure, strategy, and conventions* and says nothing about which search tool, scheduler, or agent runs it.

> **Opinionated about structure and convention, agnostic about technology — with one deliberate exception.**

That exception is the **storage format**: the knowledge layer follows the [Open Knowledge Format (OKF)](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf) — plain-text markdown with a small YAML frontmatter header, the *only* thing the brain pins down. The format is pinned because it alone determines **portability and longevity** — anything that speaks OKF can read and write the brain, so it outlives every tool.

**Read it as a compass, not a checklist:** start with a handful of files, add structure only when the work demands it.

---

## 1. The core ideas

### 1.1 The brain is the single source of truth — and the bus

All the system's lasting information lives here, and agents coordinate *through* it rather than calling each other (`AGENT_ARCHITECTURE.md §1.1`). One home per fact; everything else links to it. Because an agent's memory lives in the brain, not the session, the runner stays swappable.

### 1.2 Two areas: knowledge and runtime

Keeping two kinds of file distinct is the brain's most important structural decision (§3 shows the shape; §4–§5 detail each):

- **Knowledge** — curated, durable "what is true," including the **agent roles** that define the org. OKF.
- **Runtime** — the transient **exhaust** of work in progress: regenerable, safe to delete, outside OKF.

An agent's **harness** — its prompts, loops, tools, and model binding — is machinery, not data, so it lives with the runner, not the brain (`AGENT_ARCHITECTURE.md §5`).

### 1.3 The AI organizes; the files just store

The brain is kept current by *agents tidying* — filing, linking, reconciling — not a rigid pipeline (dreaming, §7). That bet is what makes plain files work at scale: the upkeep tedium that rotted wikis is what an AI doesn't mind.

---

## 2. The invariants (the constitution)

A brain is compliant if and only if it honors these. Everything else is free.

No need to memorize them here — skim, and you'll meet each again in context below.

1. **One source of truth.** Every fact lives in exactly one canonical file; everything else links to it.
2. **Plain text, conforming to OKF.** Markdown + YAML frontmatter, readable raw with no database behind it.
3. **Frontmatter is the schema.** If a detail isn't in the frontmatter, nothing can reliably search or sort by it. Keep the field set small.
4. **Two areas, never confused.** Curated knowledge (OKF) and runtime state (transient, not OKF) stay clearly separated (§1.2); machinery — the harness — lives with the runner, not the brain.
5. **Writes go through a contract.** Agents add and update through one defined doorway, not by editing raw files freely (§6).
6. **Retrieval is earned complexity.** Begin with plain text search over frontmatter and content; add vectors or a graph only when that demonstrably falls short.
7. **Degrade gracefully.** Delete the index, the tooling, and the runtime area, and the knowledge area is still a valid OKF bundle a human can read.
8. **Sensitivity is explicit; secrets never live here.** Restricted material is marked as such; credentials go in a secret manager.
9. **Simplicity is the tiebreaker.** When two designs both work, pick the one you can still read in six months.

---

## 3. The shape: two areas

```
  THE BRAIN  ·  plain text in one place
  │
  ├─ knowledge/   curated · durable · OKF-conformant
  │     agents (roles) · entities · projects · decisions · reference
  │
  └─ runtime/     exhaust of running · transient or append-only · NOT OKF
        work-queue · run-ledger · feedback · eval-results

  each agent's harness (system-prompt · loop · tools · model) lives with the runner, not here
```

Directory names are conventional. The two areas map onto the agent architecture's planes: knowledge *is* the Context plane, runtime persists the Work, Telemetry, and Learning state. The Work and Activation *machinery* — the harness — lives with the runner (`AGENT_ARCHITECTURE.md §5`).

---

## 4. The knowledge layer

Conventions:

- **One canonical document per concept**, identified by its path. Dated history lives beside it (OKF's `log.md`); a directory's `index.md` is its contents.
- **Frontmatter is the schema, following OKF** — a required `type`, OKF's recommended fields, extras as extension keys (conformant tools preserve them):

```yaml
---
type: Entity                      # required (OKF)
title: "Acme Daycare"
description: "Retainer client; daycare SaaS."
tags: [client, retainer]
timestamp: 2026-06-14T14:30:00Z   # last meaningful change
status: active                    # an extension field
---
```

- **Documents link to each other** with ordinary text links — no database behind it. Broken links are fine; they mark knowledge you haven't filled in yet.
- **Agent roles are first-class knowledge.** An agent (`AGENT_ARCHITECTURE.md §2`) is defined by a **role** document (`type: Agent`) holding its responsibilities, authority level, and consequence-tagged tools — so improving or promoting an agent is a readable diff.

---

## 5. The runtime area, and where the harness lives

One non-OKF area sits beside the knowledge layer — **runtime** — and one piece of each agent deliberately sits *outside* the brain: its **harness**.

### Harness — machinery, with the runner

Each agent's **harness** — system prompt, loop/heartbeat script, tool wiring, skills, model binding — is authored code and config, not curated data, so it lives with the runner that executes it, not in the brain (`AGENT_ARCHITECTURE.md §5`). The agent's **role** — the durable contract — lives in the brain (`knowledge/agents/`); its **harness** — how that contract is run — travels with the session and provider. Rebuild the harness or swap the provider and the role and brain are untouched. (The improvement loop diffs the harness like it diffs the role, `AGENT_ARCHITECTURE.md §11`.)

### Runtime — transient exhaust

Mechanical state of work. Four conventional collections:

- **Work-queue** — the tasks agents claim and complete.
- **Run-ledger** — an append-only record of every agent run: tokens, cost, actions, outcome (`AGENT_ARCHITECTURE.md §7`).
- **Feedback** — captured human interventions, the labeled examples the improvement loop learns from (`AGENT_ARCHITECTURE.md §11`).
- **Eval results** — per-agent acceptance checks and dated scorecards (`AGENT_ARCHITECTURE.md §10`).

Regenerable, append-only, safe to delete: losing them loses history but never corrupts knowledge.

---

## 6. The write contract and retrieval

Two components sit over the files; fix the *pattern*, choose the technology.

- **A write contract.** Agents create and update through a small, defined interface rather than editing raw files at will — so frontmatter stays valid, links stay consistent, and timestamps bump. A `brain` CLI, a library, an API, or an MCP server all qualify; the contract is the invariant, not its form.
- **A retrieval path, as simple as possible.** *Start* with plain text search (e.g. a full-text index); add embeddings or a graph only when it visibly fails (invariant #6).

---

## 7. Curation: ingestion and dreaming

A brain stays current only if something keeps it so. Two distinct functions do that, and they're worth keeping apart: **ingestion** lands raw material; **dreaming** makes sense of it.

**Ingestion — getting raw material in.** Pull new material (mail, transcripts, exports) into a staging area. This is mechanical intake, no judgment about what's true: it can be a plain pipeline (a cron firing an API call, a webhook, a sync script), or an agent when fetching the source takes reasoning. Keep it dumb on purpose — it lands raw material in staging, it doesn't decide what to keep. Like every capability it rolls up to an owner (the System agent, `AGENT_ARCHITECTURE.md §6`), but ownership here is accountability, not a requirement that an LLM do the work.

**Dreaming — making sense of it.** A scheduled *agent* pass, run when things are quiet (`AGENT_ARCHITECTURE.md §6`, owned by the System agent), doing the thinking ingestion can't:

1. **File.** Process staged items — extract durable facts, update frontmatter, append to history. **Flag, don't guess:** ambiguous or sensitive items wait for a human.
2. **Consolidate.** Reconcile contradictions, add links, prune, generate the digest.
3. **Improve.** Cluster feedback against the eval scorecards and open diffs against agent roles (`AGENT_ARCHITECTURE.md §11`).

Ingestion can be a pipeline; dreaming is an agent. Each dreaming run is one agent session, recorded in the run-ledger and each doc's `log.md` — fully inspectable.

---

## 8. The growth path

The brain is the same at every size; you grow it by adding files, not by changing its nature.

- **A handful of notes** — a personal brain you and a chat agent use by hand (the agent architecture's Stage 0).
- **A structured knowledge layer** — entities, projects, decisions seeded from real work; retrievable.
- **Agents + runtime** — roles in the brain, harnesses with their runners, and the queue/ledger, so agents work and report.
- **A maintained, self-improving brain** — dreaming keeps it current and proposes role improvements.

**When to reach past plain files:** questions that hop across many connected facts, many agents writing at once and colliding, or non-technical teammates needing a point-and-click interface. Add a heavier search or graph layer *over the same files* — and because the layer is OKF, the wider ecosystem (catalogs, visualizers) works with zero migration.

---

## 9. Filling in the blanks

The OKF format is fixed; everything else is a choice. Two compliant brains, same format, no shared code:

| Component | Example A (local) | Example B (hosted) |
|---|---|---|
| Storage format | markdown + YAML, OKF | markdown + YAML, OKF |
| Write contract | a small CLI | an API or MCP server |
| Retrieval | local full-text index | a managed search service |
| Curation schedule | cron on an always-on machine | a managed scheduler |
| Curating agent | a headless coding agent | any agent runtime |

Both honor §2 and are readable raw; swap any cell without touching the others.

---

## 10. Anti-patterns

- **A database as the source of truth.** Once canonical state lives somewhere you can't just open and read, the brain's core properties are gone. The files are the truth; everything else indexes them.
- **Prescribing technology the format doesn't require.** Pinning a specific index, language, or harness re-creates the lock-in OKF prevents.
- **Confusing the areas.** Forcing telemetry or queue items into OKF adds friction; letting runtime state or harness code sprawl into the knowledge layer rots it.
- **A retrieval stack ahead of need.** Vectors and graphs before plain search has failed is complexity you can't eyeball.
- **Manual upkeep as the plan.** If staying current depends on human discipline, the brain rots. Curation is automated — ingestion as a pipeline or agent, sense-making as the dreaming agent's pass; humans only clear flags.
- **Secrets in the brain.** Ever. Use a secret manager.

> **The test, always:** open the repo raw — is it still a clear, current account of what's true? If not, the problem is the content, not the tools.

---

*Prime directive: plain text you can read at any time, structured so agents retrieve and update it reliably, committed to one format so it outlives every tool. Opinionated about structure, agnostic about technology, loyal to OKF.*
