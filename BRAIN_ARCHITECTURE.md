# An Architecture for a Brain

### A technology-agnostic vision for the shared memory an agent system reads, writes, and coordinates through — from a personal notes store to the working memory of a whole agent organization

**Audience:** the operator who wants a durable, understandable memory for their agent system, and any builder (in any stack) who will implement it.
**Companion document:** [`AGENT_ARCHITECTURE.md`](./AGENT_ARCHITECTURE.md) describes the *system around the brain* — the roles, loops, and learning that read and write it. This document describes the **brain itself**: the Context plane. See [`README.md`](./README.md) for how the docs relate.

---

## 0. What this is, and what it is not

This is a **vision and a set of invariants** — the rules that don't bend — not an implementation, the same contract as the agent architecture doc applied to its foundation. It fixes the *structure, strategy, and conventions* of the brain and says nothing about which search tool, write tool, scheduler, or agent you use.

> **It is opinionated about structure and convention, and agnostic about technology — with one deliberate exception.**

That exception is the **storage format**: the brain is **plain text kept in git, following the [Open Knowledge Format (OKF)](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf)** — markdown files with a small structured header (YAML frontmatter). This is the only technology the brain commits to, and it is barely a commitment: a brain *must* be saved and versioned somehow, and git is the obvious choice — free history and an undo button for every change. Everything built *on top* of the files — how they're searched, written to, and kept current, and the agents themselves — stays fill-in-the-blank.

Why commit to OKF and nothing else? Because the format is the one decision that determines **portability and longevity**. Get it right and the brain outlives every tool that touches it — any agent, any model, any vendor that speaks OKF can read and write it. Get it wrong and you rebuild your whole setup every time your tools change.

**Read it as a compass, not a checklist.** Start with a handful of files. Add structure only when the work demands it.

---

## 1. The core ideas

### 1.1 The brain is the single source of truth — and the bus

All the lasting information the agent system relies on lives here, and agents coordinate *through* it rather than by talking to each other (see `AGENT_ARCHITECTURE.md §1.1`). One home per fact; everything else links to it. This is what lets agents stay disposable: their memory and their desk are in the brain, not in them.

### 1.2 Two layers: knowledge and operations

The brain holds two kinds of state, and keeping them distinct is its most important structural decision:

- **The knowledge layer** — curated, durable "what is true": entities, projects, decisions, reference, and the **role-charters** that define the agent org. This layer conforms to OKF.
- **The operational layer** — the moment-to-moment state of work in progress: the work-queue (the to-do list), the run-ledger (the activity log), captured feedback, and evaluation results. These are short-lived working records, and they sit outside OKF (OKF describes knowledge, not the mechanics of who's doing what).

### 1.3 The AI organizes; the files just store

The brain is kept current by *agents doing the tidying* — filing, linking, reconciling — not by some rigid import system. Keeping the knowledge organized is itself agent work (the dreaming job, §7). This is the bet that makes plain files work at scale: the thing that made wikis rot — the tedium of upkeep — is exactly what an AI doesn't mind.

---

## 2. The invariants (the constitution)

A brain is compliant if and only if it honors these. Everything else is free.

1. **One source of truth.** Every fact lives in exactly one canonical file; everything else links to it.
2. **Plain text in git, conforming to OKF.** The knowledge layer is markdown + YAML frontmatter in a versioned repo. This is the brain's one technology commitment; git history is its audit log and undo.
3. **Frontmatter is the schema.** If a detail isn't in the frontmatter, nothing can reliably search or sort by it. Keep the set of fields small — resist any you won't actually use.
4. **Two layers, never confused.** Curated knowledge (durable, OKF) and operational runtime state (transient, brain-specific) stay clearly separated.
5. **Writes go through a contract.** Agents add and update through one defined doorway, not by editing raw files however they like, so the brain stays consistent. (What that doorway looks like is yours to choose — see §6.)
6. **Retrieval is earned complexity.** Begin with plain text search over frontmatter and content; add vectors or a graph only when that demonstrably falls short.
7. **Degrade gracefully.** Delete the index, the tooling, and the entire operational layer, and the knowledge layer is still a valid OKF bundle a human can read.
8. **Sensitivity is explicit; secrets never live here.** Restricted material is marked as such; credentials go in a secret manager, never the brain.
9. **Simplicity is the tiebreaker.** When two designs both work, choose the one you can still read in six months.

---

## 3. The shape: two layers

```
  THE BRAIN  ·  one git repo, plain text
  │
  ├─ Knowledge layer    curated · durable · OKF-conformant
  │     roles · entities · projects · decisions · reference
  │
  └─ Operational layer  runtime state · transient or append-only
        work-queue · run-ledger · feedback · eval-results
```

Directory names are conventional, not mandated — what matters is the two-layer split and that the knowledge layer is an OKF bundle. The two layers map onto the agent architecture's planes: the knowledge layer *is* the Context plane; the operational layer is where the Work, Telemetry, and Learning planes persist their state.

| Layer | Holds | Shape | OKF? |
|---|---|---|---|
| **Knowledge** | what is true: roles, entities, projects, decisions, reference | documents that link to each other | yes |
| **Operational** | work in progress: queue, run-ledger, feedback, evals | short-lived working records | no |

---

## 4. The knowledge layer

Curated, durable, OKF-conformant. The conventions:

- **One canonical document per concept**, identified by its path. Dated history lives beside it (OKF's `log.md`); a directory's `index.md` is its table of contents.
- **Frontmatter is the schema, and it follows OKF** — a required `type`, OKF's recommended fields, and any extra fields you need as OKF extension keys (conformant tools preserve them). Lightly:

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

- **Documents link to each other** with ordinary links in the text — a web of connected knowledge with no special database behind it. Broken links are fine; they simply mark knowledge you haven't filled in yet.
- **Role-charters are first-class knowledge.** A role (per `AGENT_ARCHITECTURE.md §2`) is defined by a charter document (`type: Role Charter`) holding its responsibilities, its authority level, and its consequence-tagged tools. Because it's a knowledge file, improving or promoting a role is a readable diff to it.

---

## 5. The operational layer

The runtime state of work, kept deliberately separate from curated knowledge because it is mechanical, not authored. Four conventional collections:

- **Work-queue** — the tasks roles claim and complete (the inbound side of coordination).
- **Run-ledger** — an append-only record of every agent run: tokens, cost, actions, outcome (`AGENT_ARCHITECTURE.md §7`).
- **Feedback** — captured human interventions, the labeled examples the improvement loop learns from (`§11`).
- **Eval results** — per-role acceptance checks and dated scorecards (`§10`).

These are files too, but they are not OKF and not curated: they can be regenerated or replayed, you only ever add to them, and they are safe to delete. Deleting them loses history but never corrupts knowledge — which is the whole point of the split.

---

## 6. The write contract and retrieval

Two components sit over the files. The architecture fixes the *pattern*; you choose the technology.

- **A write contract.** Agents create and update through a small, defined interface rather than editing raw files at will — so frontmatter stays valid, links stay consistent, and the change timestamp always bumps. *One way:* a tiny `brain` CLI; equally valid: a library, an API, or an MCP server. The contract is the invariant; its form is not.
- **A retrieval path, kept as simple as the work allows.** Agents are excellent at search; lean on it. *Start* with plain text search over the files — for example a lightweight full-text index — and treat fancier approaches (embeddings, a knowledge graph) as an upgrade you earn only when plain search visibly fails (invariant #6).

---

## 7. Curation: ingestion and dreaming

A brain stays useful only if something keeps it current — and that something is a scheduled agent, not a pipeline. This is the **dreaming** job of `AGENT_ARCHITECTURE.md §6`, run when things are quiet:

1. **Ingest.** Pull new raw material (mail, transcripts, exports) into a staging area, then file each item into the right place in the knowledge layer — extracting durable facts, updating frontmatter, appending to history. **Flag, don't guess:** ambiguous or sensitive items wait for a human.
2. **Consolidate.** Reconcile contradictions, add links, prune, and generate the digest.
3. **Improve.** Cluster the feedback against the eval scorecards and open diffs against role-charters (`§11`).

The whole operation is one agent session, fully inspectable in git — the format makes the curation auditable.

---

## 8. The growth path

The brain is the same thing at every size; you grow it by adding files, never by changing its nature.

- **A handful of notes** — a personal brain you and a chat agent use by hand. Already useful (the agent architecture's Stage 0).
- **A structured knowledge layer** — entities, projects, decisions seeded from real work; retrievable.
- **Roles + the operational layer** — charters and the queue/ledger, so agents do real work and report it.
- **A maintained, self-improving brain** — the dreaming job keeps it current and proposes charter improvements.

Scaling is addition, not migration — the same reason the agent architecture scales. **When to reach past plain files:** questions that hop across many connected facts ("what led to this decision?"), many agents writing at once and colliding, or non-technical teammates who need a point-and-click interface. Then add a heavier search or graph layer *over the same files* — and because the knowledge layer is OKF, the wider OKF ecosystem (catalogs, visualizers) works with zero migration. The OKF files are the export format; nothing is trapped.

---

## 9. Filling in the blanks

OKF + git is fixed. Everything else is a choice — two compliant brains that share a format but no code:

| Component | Example A (local) | Example B (hosted) |
|---|---|---|
| Storage | markdown + git, OKF | markdown + git, OKF |
| Write contract | a small CLI | an API or MCP server |
| Retrieval | local full-text index | a managed search service |
| Curation schedule | cron on an always-on machine | a managed scheduler |
| Curating agent | a headless coding agent | any agent runtime |

Both honor §2. Both are readable raw. Swap any cell without touching the others — that is what the format-only commitment buys.

---

## 10. Anti-patterns

- **A database as the source of truth.** The moment the real, canonical state lives somewhere you can't just open and read, you've lost the brain's core properties. The files are the truth; everything else is just an index over them.
- **Prescribing technology the format doesn't require.** Pinning a specific index, language, or harness re-creates the lock-in the OKF commitment exists to prevent. Commit to the format; stay loose on the rest.
- **Confusing the two layers.** Telemetry and queue items are not curated knowledge; forcing them into OKF documents adds friction, and letting them sprawl into the knowledge layer rots it.
- **A retrieval stack ahead of need.** Vectors and graphs before plain search has demonstrably failed is complexity you can't eyeball, paid for up front.
- **Manual upkeep as the plan.** If keeping the brain current depends on human discipline, it will rot. Curation is the dreaming agent's job; humans clear flags, they don't file everything.
- **Secrets in the brain.** Ever. Use a secret manager.

> **The test, always:** delete the tooling and open the repo raw — is it still a clear, current account of what's true? If not, the problem is the content, not the tools.

---

## 11. Glossary

- **Brain** — the durable, shared store an agent system reads, writes, and coordinates through; the Context plane.
- **OKF (Open Knowledge Format)** — the open standard the knowledge layer conforms to: markdown + YAML frontmatter in git.
- **Knowledge layer** — curated, durable, OKF-conformant documents (roles, entities, projects, decisions, reference).
- **Operational layer** — transient runtime state (work-queue, run-ledger, feedback, eval results); not OKF.
- **Role-charter** — the knowledge document that defines a role (`AGENT_ARCHITECTURE.md §5`).
- **Write contract** — the defined interface agents write through, in place of editing raw files.
- **Dreaming** — the scheduled curation agent that keeps the brain current and improving (`AGENT_ARCHITECTURE.md §6`).

---

*Prime directive, restated: the brain is plain, versioned text you can understand at any time, structured so agents retrieve and update it reliably, and committed to one format so it outlives every tool that touches it. Opinionated about structure; agnostic about technology; loyal to OKF. When in doubt, keep it readable.*
