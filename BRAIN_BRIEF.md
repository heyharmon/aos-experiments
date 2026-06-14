# Building a Brain

### The Context-plane blueprint: a filesystem substrate a role-based agent system reads, writes, and coordinates through

**Where this sits:** the [`AGENT_ARCHITECTURE.md`](./AGENT_ARCHITECTURE.md) vision treats the brain as a black box governed by invariants ("all durable state lives in the brain; it degrades to plain markdown"). This document opens that box — it is one concrete, buildable implementation of the **Context plane**. See [`README.md`](./README.md) for how the docs relate.

**Audience:** Claude Code (builder) and the human operator (owner).
**Use:** Hand this to Claude Code with one sentence of context ("build a brain for X") and it should scaffold, populate, and operate the system below. It is useful on its own — a brain with no agents yet is architecture **Stage 0**.

---

## 1. What this is and why this approach

A "brain" is the central, durable store that an agent system coordinates through — clients, projects, decisions, relationships, operations, and the **roles** that do the work, plus the running state of that work. Structured so agents can retrieve it reliably and write back as work happens.

The brain has **two layers**, and keeping them distinct is the most important idea in this document:

- **The knowledge layer** — curated, durable "what is true": entities, projects, decisions, SOPs, people, reference, and **role-charters**. This layer **conforms to the [Open Knowledge Format (OKF)](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf)** — markdown + YAML frontmatter in git — so it is portable across the whole ecosystem (other agents, visualizers, Google's Knowledge Catalog), not just our own tools.
- **The operational layer** — the runtime state of work in flight: the work-queue, the run-ledger (telemetry), captured feedback, and eval scorecards. This is **brain-specific and outside OKF's scope** (OKF is a knowledge format, not a coordination protocol). It lives in underscore-prefixed directories so it never gets confused with curated knowledge.

The approach is deliberately the **pragmatic middle ground**:

- **Plain files in a git repo** are the substrate. Human-readable, agent-writable, portable across any harness, with git history as a free audit log and undo button.
- **Agentic retrieval over embeddings.** A SQLite FTS5 index over frontmatter and content covers ~90% of retrieval needs at ~5% of the complexity of a vector pipeline. Vectors are a late bolt-on, not a foundation.
- **The LLM does the organizing, the filesystem does the storing.** Ingestion and consolidation are scheduled agent jobs (the "dream" cycle), not an ETL system.
- **CLI-as-contract.** Agents interact through a small `brain` CLI rather than free-roaming the tree. This keeps writes consistent and the substrate composable.

Why not a database + pgvector + a bespoke pipeline? For a sub-10-person org or one person, that architecture's failure mode is maintenance burden: embedding drift, schema migrations, a retrieval layer you can't eyeball. This architecture's failure mode is just messy markdown — which a human or an agent fixes by reading it.

**Design principles (non-negotiable):**
1. Every fact lives in exactly one canonical file; everything else links to it.
2. **Frontmatter is the schema, and the knowledge layer conforms to OKF** — `type` is required, OKF's recommended fields are used, and our extra fields ride along as OKF extension keys (which conformant consumers must preserve).
3. **Two layers, never confused** — curated knowledge (OKF, top-level) vs. operational runtime state (brain-specific, `_`-prefixed).
4. Append and update via the CLI or PRs; never let an agent restructure directories without an SOP.
5. **Degrade gracefully** — delete the index, the CLI, and the entire operational layer, and the knowledge layer is still a valid OKF bundle you can read raw.
6. Sensitive data gets a clearly-marked directory with access rules in `BRAIN.md`; secrets never enter the brain at all (use a secret manager).

---

## 2. Repository layout

One repo per brain. Business and personal brains are separate repos (they cross-link by URL).

```
brain/
├── BRAIN.md              # Constitution: what this brain is, rules, taxonomy, access policy
├── CLAUDE.md             # Agent entrypoint: how to query, when to write, links to BRAIN.md
├── index.md              # OKF bundle root — declares okf_version; lists top-level concepts
│
│   # ── Knowledge layer (curated, durable — OKF-conformant) ──
├── roles/                # Role-charters: the positions that do the work  (first-class)
│   └── <role>/
│       ├── charter.md    # type: Role Charter — responsibilities, authority, tools, schedule
│       └── log.md        # OKF chronological history of changes to the role
├── entities/             # The nouns: clients, institutions, ongoing relationships
│   └── <slug>/
│       ├── profile.md    # Canonical OKF concept document
│       └── log.md        # Dated interaction history (OKF reserved file)
├── projects/             # Bounded efforts with a start and an end
├── decisions/            # ADR-style records: one file per significant decision
├── ops/                  # How things are done: sops/ + policies/
├── people/               # Individuals (contacts, team, family) — slim profiles
├── reference/            # Stable facts: stack docs, account inventories, glossary
│
│   # ── Operational layer (runtime state — brain-specific, NOT OKF) ──
├── _queue/               # Work items: one file per task; roles claim and complete them
├── _runs/                # Run-ledger: append-only per-run telemetry records
├── _feedback/            # Captured human interventions — labeled examples for improvement
├── _evals/               # Per-role acceptance checks + dated scorecards
├── _digests/             # Generated summaries (daily digest, open-loops report)
├── _inbox/               # Unfiled raw material awaiting ingestion/triage
│
└── .brain/
    ├── index.db          # SQLite (FTS5 + frontmatter tables) — generated, gitignored
    └── config.yml        # Ingestion sources, schedules, model settings
```

**Business mapping:** `entities/` = clients; `projects/` = engagements; `ops/` = delivery SOPs/pricing; `people/` = contacts. **Personal mapping:** `entities/` = institutions (bank, school, doctor); `projects/` = life goals; `ops/` = routines; add `journal/` if desired.

Each knowledge directory is an OKF subtree: canonical files are OKF concept documents, and the reserved files `index.md` (progressive-disclosure listing) and `log.md` (chronological history) follow OKF conventions.

---

## 3. The knowledge layer: OKF frontmatter

Every knowledge file starts with frontmatter. The required and recommended keys are OKF's; the rest are our extensions, which OKF consumers preserve untouched.

```yaml
---
# ── OKF core ──
type: Entity                         # REQUIRED. Free string: Entity | Project | Decision | SOP |
                                     #   Policy | Person | Reference | Role Charter | …
title: "Acme Daycare"                # recommended
description: "Retainer client; daycare SaaS; primary contact Jane Doe."   # recommended (one sentence)
resource: https://acme.monday.com/boards/123        # recommended — URI of the underlying asset, if any
tags: [client, daycare, retainer]    # recommended
timestamp: 2026-06-14T14:30:00Z      # recommended — last meaningful change (ISO 8601)
# ── our extensions (OKF preserves unknown keys) ──
slug: acme-daycare
status: active                       # active | paused | done | archived
source: manual                       # manual | email | transcript | slack | import
created: 2026-06-11
sensitivity: normal                  # normal | restricted  (restricted ⇒ ask before surfacing externally)
---
```

**Cross-links are OKF body links**, not a frontmatter array: write `[customers](/entities/customers/profile.md)` in the prose, bundle-relative (leading `/`) so links survive moves. Consumers treat every cross-link as a graph edge — a knowledge graph with no graph database. Broken links are tolerated; they mark future knowledge.

Type-specific fields are defined in `BRAIN.md` (entities get `next_review`, `mrr`; decisions get `options_considered`, `outcome`). Keep the schema small — resist fields you won't query.

---

## 4. Role-charters (first-class knowledge)

A **role** is the unit of work in the architecture (see `AGENT_ARCHITECTURE.md §2, §5`). Its charter is a knowledge document — curated, OKF-conformant, and the thing the improvement loop edits.

```yaml
---
type: Role Charter
title: "Communications Manager"
description: "Owns inbound/outbound communications across email, Slack, and meeting follow-ups."
tags: [role, comms]
timestamp: 2026-06-14T14:30:00Z
slug: communications-manager
status: active
authority: supervised                # advisory | supervised | delegated | autonomous  (the §8 dial)
staff: [comms-triage, comms-drafter] # agent/loop identifiers that execute this role
schedule: hourly                     # or a reference into .brain/config.yml
---
# Responsibilities
What this role owns, and what is explicitly out of scope.

# Tools
| Tool          | Consequence    |
|---------------|----------------|
| draft_reply   | reversible     |
| send_email    | consequential  |   ← gated until authority covers it (§8)

# Escalation policy
When to act, when to ask, what a "judgment call" looks like here.
```

The charter is where the autonomy **dial** (`authority`) and the **consequence tags** on tools live — the data that governs what the role's agents may do without asking. Raising `authority` is a promotion (`AGENT_ARCHITECTURE.md §11`), landed as a reviewable diff to this file.

---

## 5. The operational layer (runtime state, not OKF)

These directories hold the state of work in flight. They are append-only or transient, mechanical rather than curated, and deliberately **not** OKF.

- **`_queue/`** — one file per work item. Frontmatter: `id`, `role` (owner), `status` (open | claimed | done | blocked), `priority`, `created`, `claimed_by`. Body: the task. A role claims an item by setting `status: claimed`; this is the inbound side of coordination (`AGENT_ARCHITECTURE.md §9`).
- **`_runs/`** — the run-ledger. One record per agent run, append-only, written by the harness (not the agent), under `_runs/<date>/<run_id>.yml`. Schema is the run record in `AGENT_ARCHITECTURE.md §7` (role, tokens, cost, actions, outcome). This is the telemetry the whole system rolls up.
- **`_feedback/`** — one file per human intervention. Frontmatter: `role`, `run` (the run_id it corrects), `kind` (correction | override | answer | contribution), `created`. Body: what the human did and what the right outcome was. These are the labeled examples the improvement loop clusters (`§11`).
- **`_evals/`** — per role: `checks/` (the acceptance criteria that define "good") and `scorecards/<date>.md` (pass rate, cost-per-unit, intervention rate, trend). The acceptance checks double as the termination condition for outcome-oriented work (`§9`).

Because this layer is regenerable or replayable, deleting it loses history but never corrupts the knowledge layer — which is the point of keeping them separate.

---

## 6. The `brain` CLI (contract)

A single executable (Node or Python, no daemon), discovered by walking up directories. Knowledge commands plus operational commands:

```
# knowledge layer
brain init                          # scaffold repo + BRAIN.md + index.md + config
brain add <type> --title --tags…    # create an OKF concept doc from a template
brain query "<text>" [--type --tag --status --since]   # FTS5 search → ranked paths + snippets
brain show <slug>                   # print canonical file + backlinks (resolved from body links)
brain role add <name>               # scaffold roles/<name>/charter.md
brain reindex                       # rebuild .brain/index.db
brain doctor                        # validate OKF conformance, broken links, stale timestamps

# operational layer
brain enqueue --role --title…       # add a work item to _queue/
brain queue [--role --status]       # list work items
brain run-log <record.yml>          # append a run record to _runs/  (called by the harness)
brain feedback --run <id> --kind…   # capture an intervention into _feedback/
brain eval <role>                   # run a role's checks → write a scorecard to _evals/
brain digest [--day]                # generate the _digests/ summary (calls an LLM)
```

**Index design:** `reindex` parses all knowledge frontmatter into a `documents` table (columns for OKF + extension fields, JSON for the rest) plus an FTS5 table over title + body; `query` joins them. **`doctor` enforces the one hard OKF rule** — every non-reserved knowledge `.md` has parseable frontmatter with a non-empty `type` — and warns (never rejects) on the soft stuff. A few hundred lines total.

**Agent rules (in CLAUDE.md):** start every task with `brain query`; read full files via `brain show`; write through `brain add`/`brain file`; bump `timestamp` on any edit; never delete — set `status: archived`.

---

## 7. Ingestion & dreaming: the nightly job

A cron job runs a headless agent session — this is the **dreaming** agent of `AGENT_ARCHITECTURE.md §6`, and it does three things:

1. **Ingest.** Pull new raw material per `.brain/config.yml` (email, transcripts, Slack/Monday exports) into `_inbox/`, then **triage**: identify the owning entity/project, extract durable facts, and file each item into the knowledge layer as OKF documents — appending to `log.md`, updating frontmatter. **Flag, don't guess:** conflicts, ambiguous ownership, or `sensitivity: restricted` candidates stay in `_inbox/` tagged `needs-human`.
2. **Consolidate.** Reconcile contradictions, prune, add cross-links, and regenerate the daily digest into `_digests/`.
3. **Improve.** Cluster `_feedback/` against `_evals/` scorecards and open **diffs against role-charters** (`roles/<role>/charter.md`) — fixes or promotions — for the owner to review. This is the self-improvement loop (`§11`), and it is exactly the "LLMs don't get bored, they touch 15 files in one pass" pattern OKF was built for.

Each step commits with a structured message and runs `brain doctor`. The whole operation is one scheduled session, fully inspectable in git.

---

## 8. Build plan

Build in phases; each is independently useful.

- **Phase 1 — Substrate (Stage 0):** `brain init`, templates per type, `BRAIN.md` + `CLAUDE.md` for the specific owner, seed 5–10 real entities/projects. A usable brain with no agents yet.
- **Phase 2 — Index + CLI:** SQLite FTS5 index, the knowledge commands, `brain doctor` OKF validation.
- **Phase 3 — Roles + operational layer:** add the first `roles/<role>/charter.md`, the `_queue`/`_runs` directories, and `run-log`/`enqueue` — enough for one role to do real work and report it (architecture Stage 1).
- **Phase 4 — Dreaming + learning:** the nightly ingest/consolidate job, then `_feedback`/`_evals` and the improvement pass (architecture Stages 3–4).
- **Phase 5 — Optional upgrades (only when retrieval demonstrably falls short):** sqlite-vec embeddings on the same DB; an MCP server wrapping the CLI; a read-only web viewer (or an off-the-shelf OKF visualizer).

Acceptance test: a fresh agent session, given only `CLAUDE.md`, answers "what's the status of `<entity>` and what should happen next?" correctly in under three tool calls.

---

## 9. Buy-side: when you outgrow this

Signals: retrieval needs multi-hop relationship queries ("what decisions caused X?"), many concurrent agents contending on writes, per-end-user memory inside a product you ship, or non-technical teammates needing a UI.

- **OKF ecosystem first.** Because the knowledge layer is already OKF, external OKF consumers — Google's Knowledge Catalog, static graph visualizers, conformance validators — work with **zero migration**. Reach for these before replacing anything.
- **Cognee** — point it at the same documents for a combined knowledge-graph + vector index when FTS can't answer relationship queries.
- **Zep / Graphiti** — temporal knowledge graph, when "how facts changed over time" matters.
- **Mem0** — when memory becomes a *product feature* you ship to end users.
- **Letta** — a full agent runtime with self-managed, auditable memory for long-horizon autonomy.

Migration is low-risk by design: the OKF knowledge layer *is* the export format. Any of these can ingest it.

---

*Maintenance budget: ~15 min/week clearing `_inbox/` flags, skimming the digest, and reviewing charter diffs. If it takes more, simplify the schema — the brain serves the work, not the other way around.*
