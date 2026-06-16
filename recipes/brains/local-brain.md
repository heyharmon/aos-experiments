---
type: brain-recipe
name: local-brain
title: "Local Brain"
description: "The maximally-simple brain: markdown + frontmatter, plain-text search, a tiny write-contract CLI. Runs on one machine, no cloud."
stage: 0
provides: brain
requires: []
pairs-with: [personal-assistant]
stack: [markdown, yaml, python, ripgrep]
---

# Local Brain

> The foundation everything else cooks on. A durable, human-readable memory your agents read, write, and coordinate through — built from plain files and nothing else. This is the smallest thing that honors every invariant in `BRAIN_ARCHITECTURE.md`. Start here; grow it by adding files, never by re-pouring it.

> **Layout:** two brain areas, matching `BRAIN_ARCHITECTURE.md §3` — `knowledge/` (world facts *and* agent roles) and `runtime/` (the exhaust of running) — plus `harness/`, each agent's machinery, which belongs to the runner rather than the brain (colocated here for a one-machine setup).

## Yields

A directory of plain files: the brain's curated **knowledge** area (OKF-conformant markdown, including agent roles) and transient **runtime** area, plus each agent's **harness** (its machinery — the runner's code, not a brain area) and a one-file `brain` CLI that is the write contract with a `brain search` retrieval path. Reaches **Stage 0** (`AGENT_ARCHITECTURE.md §12`) — a queryable context store you and a chat agent use by hand, ready for an agent recipe to run on.

## Prerequisites

- **Brain:** none — this *is* the brain.
- **Accounts / keys:** none. Everything is local.
- **Runtimes:** `python3` (3.10+), `pyyaml` (`pip install pyyaml`), and `ripgrep` (`rg`).

## Ingredients

| Component | Choice | Why this one |
|---|---|---|
| Storage | Markdown + YAML frontmatter | OKF's format; readable raw; frontmatter is the schema (`BRAIN_ARCHITECTURE.md` inv. #3) |
| Write contract | a single-file `brain` Python CLI | enforces valid frontmatter, bumps timestamps — so writes stay consistent (inv. #5) |
| Retrieval | `ripgrep` via `brain search` | plain-text search is all most brains ever need; earn anything fancier (inv. #6) |
| Knowledge format | OKF bundle | portability + longevity; the wider OKF ecosystem reads it with zero migration |

## Steps

1. **Create the directory tree.**

   ```
   brain/
     knowledge/        # curated · durable · OKF-conformant
       agents/         #   agent roles (type: Agent)
       entities/       #   people, clients, systems
       projects/       #   ongoing work
       decisions/      #   why things are the way they are
       reference/      #   durable facts, how-tos
     runtime/          # exhaust of running · transient or append-only · NOT OKF
       queue/          #   tasks agents claim (+ queue/approvals/ for escalations)
       runs/           #   run-ledger: append-only run records (§7)
       feedback/       #   captured human interventions (§11)
       evals/          #   per-agent scorecards (§10)
     harness/          # each agent's machinery (prompts, loops, tools, model) — the runner's code, NOT a brain area; agent recipes fill this
     bin/
       brain           # the write-contract CLI (below)
     README.md         # explains the layout; this file
     AGENTS.md         # how an agent must work here: invariants, how to extend, how to update
     CLAUDE.md         # one-line shim → AGENTS.md
     .agent-os/                  # pinned, read-only vendored copy of the architecture (managed)
     .claude/skills/architecture-update/   # the /architecture-update skill
   ```
   Those are the only directories you need to start; the steps below fill them in.

2. **Write the `brain` CLI** (`bin/brain`, executable, `chmod +x`). One file, stdlib + `pyyaml`. It is the *only* sanctioned way to write to the brain. Commands:

   | Command | Does | Honors |
   |---|---|---|
   | `brain new <collection> <slug> --title T [--type T] [--tags a,b] [--desc D]` | creates `knowledge/<collection>/<slug>/index.md` with valid OKF frontmatter | inv. #1, #3 |
   | `brain update <path> [--set key=val ...]` | edits frontmatter fields, **always bumps `timestamp`** | inv. #3, #5 |
   | `brain log <path> "<entry>"` | appends a dated line to the doc's `log.md` (OKF history) | one-source-of-truth history |
   | `brain queue add "<task>" [--for <agent>]` | drops a task file into `runtime/queue/` | the inbound coordination side |
   | `brain run --agent A --session S --json '<record>'` | appends a run record to `runtime/runs/` (written by an agent's harness, never by the session itself) | telemetry (§7), inv. #5 |
   | `brain search "<query>"` | `rg` over the whole brain; prints file:line matches | retrieval (inv. #6) |

   Reference skeleton (the agent fills in the rest):

   ```python
   #!/usr/bin/env python3
   import sys, datetime, pathlib, yaml
   ROOT = pathlib.Path(__file__).resolve().parent.parent
   def now(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
   def write_doc(path, fm, body=""):
       path.parent.mkdir(parents=True, exist_ok=True)
       path.write_text("---\n"+yaml.safe_dump(fm,sort_keys=False)+"---\n\n"+body)
   # dispatch on sys.argv[1]: new | update | log | queue | run | search ...
   ```

   Every write goes through one of these commands — never a raw file edit — so frontmatter stays valid and the timestamp always bumps (inv. #5).

3. **Seed the knowledge layer** with a couple of real docs via `brain new` (e.g. one `entity`, one `reference`) so search and structure have something to chew on. Each gets `type`, `title`, `description`, `tags`, `timestamp`, `status` in frontmatter. Add an `index.md` to each populated collection as its table of contents.

4. **Write `README.md`** at the repo root: state the two brain areas (`knowledge/` · `runtime/`) plus the agents' `harness/` (the runner's machinery, colocated here), that `bin/brain` is the only write path, that `runtime/` is disposable, and that **secrets never live here** (use a secret manager) — inv. #8.

5. **Install the architecture reference.** This is what keeps a brain faithful to the architecture as it grows — an agent working here can read the vision and invariants, extend the brain the supported way, and pull updates. Three parts:
   - **Vendor a pinned snapshot.** Clone the architecture ([github.com/heyharmon/agent-os](https://github.com/heyharmon/agent-os)) at a specific commit/tag and copy `OVERVIEW.md`, `AGENT_ARCHITECTURE.md`, `BRAIN_ARCHITECTURE.md`, `CHANGELOG.md`, `VERSION`, and `recipes/` into `.agent-os/` (drop the `.git`). Add `.agent-os/README.md` recording the **pin** (version + commit + upstream URL) and that it is read-only/managed. Vendoring it keeps the brain self-contained and durable offline.
   - **Write `AGENTS.md`** at the repo root: what this system is; the invariants it must keep (two brain areas, harness with the runner; write only through `bin/brain`; brain-as-bus; every run recorded; agents hold roles); the **supported way to extend it** (add an agent via an agent recipe — never bolt features onto an existing agent ad hoc); a "This brain's agents" list (agent recipes append themselves here); and how to update (the skill below). Add a one-line `CLAUDE.md` pointing to `AGENTS.md` (the cross-tool standard; Claude Code reads `CLAUDE.md`).
   - **Install the update skill** at `.claude/skills/architecture-update/SKILL.md`: it fetches the latest upstream, diffs `CHANGELOG.md` from the pinned version, applies each entry's **Impact** note to reconcile this brain, then re-pins.
   (Both `.agent-os/` and `.claude/` are hidden, so `brain search` — ripgrep — won't conflate the framework with your brain's content; `AGENTS.md` points agents to them.)

## Doneness

- [ ] `brain new entities acme --title "Acme" --type Entity` creates a doc whose frontmatter is valid OKF (`type` present) and parseable by `pyyaml`.
- [ ] `brain update` on that doc bumps its `timestamp`.
- [ ] `brain search Acme` returns the file.
- [ ] **Degrades gracefully (inv. #7):** delete `bin/`, `harness/`, and `runtime/` and the `knowledge/` tree is still a valid, readable OKF bundle — open it in any markdown viewer and it makes sense.
- [ ] No secrets anywhere in the repo.
- [ ] **Self-references the architecture:** `AGENTS.md` exists at the root and a fresh Claude Code session in the brain reads it and can state the invariants and how to add an agent; `.agent-os/README.md` records a version pin; `/architecture-update` is installed.

## Pairs with

- **[`personal-assistant`](../agents/personal-assistant.md)** — the first agent to run on this brain (Stage 1).
- Any future agent recipe: they all declare `requires: [local-brain]` (or a compatible brain).

## Substitutions

The base stays maximally simple. Grow it only when the work demands it — and here's the signal that says it's time.

| Instead of… | Use… | When |
|---|---|---|
| `ripgrep` plain-text search | SQLite FTS index (rebuilt by dreaming) | search gets slow or noisy as the brain grows past a few hundred docs |
| plain-text search | embeddings / a knowledge graph over the same files | you need questions that hop across many connected facts ("what led to this decision?") and plain search demonstrably fails (`BRAIN_ARCHITECTURE.md §8`) |
| `brain` CLI write contract | an MCP server or HTTP API (same guarantees) | non-CLI agents must write, or multiple harnesses share the brain |
| markdown viewer | the OKF ecosystem (catalogs, visualizers) | non-technical teammates need a point-and-click view — works with zero migration because the layer is OKF |
