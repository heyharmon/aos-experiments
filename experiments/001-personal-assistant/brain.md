---
type: brain-recipe
name: local-brain
title: "Local Brain"
description: "The maximally-simple brain: markdown + frontmatter, plain-text search, a tiny write-contract CLI. Runs on one machine, no cloud."
provides: brain
requires: []
pairs-with: [personal-assistant]
stack: [markdown, yaml, python, ripgrep]
---

# Local Brain

> The foundation everything else cooks on. A durable, human-readable memory your agents read, write, and coordinate through — built from plain files and nothing else. Start here; grow it by adding files, never by re-pouring it.

> **Layout:** two brain areas: `knowledge/` (world facts and agent roles) and `runtime/` (the exhaust of running), plus `harness/`, each agent's machinery, which belongs to the runner rather than the brain (colocated here for a one-machine setup).

## Yields

A directory of plain files: the brain's curated **knowledge** area (plain markdown + YAML frontmatter, including agent roles) and transient **runtime** area, plus each agent's **harness** (its machinery, the runner's code, not a brain area) and a one-file `brain` CLI that is the write contract with a `brain search` retrieval path.

## Prerequisites

- **Brain:** none — this *is* the brain.
- **Accounts / keys:** none. Everything is local.
- **Runtimes:** `python3` (3.10+), `pyyaml` (`pip install pyyaml`), and `ripgrep` (`rg`).

## Ingredients

| Component | Choice | Why this one |
|---|---|---|
| Storage | Markdown + YAML frontmatter | readable raw; frontmatter is the schema |
| Write contract | a single-file `brain` Python CLI | enforces valid frontmatter, bumps timestamps so writes stay consistent |
| Retrieval | `ripgrep` via `brain search` | plain-text search is all most brains ever need; earn anything fancier |
| Knowledge format | plain markdown + YAML frontmatter | portable, long-lived, readable in any editor |

## Steps

1. **Create the directory tree.**

   ```
   brain/
     knowledge/        # curated, durable
       agents/         #   agent roles
       entities/       #   people, clients, systems
       projects/       #   ongoing work
       decisions/      #   why things are the way they are
       reference/      #   durable facts, how-tos
     runtime/          # exhaust of running, transient or append-only
       queue/          #   tasks agents claim (+ queue/approvals/ for escalations)
       runs/           #   run-ledger: append-only run records
       feedback/       #   captured human interventions
       evals/          #   per-agent scorecards
     harness/          # each agent's machinery (prompts, loops, tools, model)
                       # the runner's code, NOT a brain area; agent recipes fill this
     bin/
       brain           # the write-contract CLI (below)
     README.md         # explains the layout
     AGENTS.md         # how an agent must work here: invariants, how to extend
     CLAUDE.md         # one-line shim to AGENTS.md
   ```

   Those are the only directories you need to start; the steps below fill them in.

2. **Write the `brain` CLI** (`bin/brain`, executable, `chmod +x`). One file, stdlib + `pyyaml`. It is the *only* sanctioned way to write to the brain. Commands:

   | Command | Does |
   |---|---|
   | `brain new <collection> <slug> --title T [--type T] [--tags a,b] [--desc D]` | creates `knowledge/<collection>/<slug>/index.md` with valid frontmatter |
   | `brain update <path> [--set key=val ...]` | edits frontmatter fields, **always bumps `timestamp`** |
   | `brain log <path> "<entry>"` | appends a dated line to the doc's `log.md` |
   | `brain queue add "<task>" [--for <agent>]` | drops a task file into `runtime/queue/` |
   | `brain run --agent A --session S --json '<record>'` | appends a run record to `runtime/runs/` (written by an agent's harness, never by the session itself) |
   | `brain search "<query>"` | `rg` over the whole brain; prints file:line matches |

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

   Every write goes through one of these commands — never a raw file edit — so frontmatter stays valid and the timestamp always bumps.

3. **Seed the knowledge layer** with a couple of real docs via `brain new` (e.g. one `entity`, one `reference`) so search and structure have something to chew on. Each gets `type`, `title`, `description`, `tags`, `timestamp`, `status` in frontmatter. Add an `index.md` to each populated collection as its table of contents.

4. **Write `README.md`** at the repo root: state the two brain areas (`knowledge/` and `runtime/`) plus the agents' `harness/` (the runner's machinery, colocated here), that `bin/brain` is the only write path, that `runtime/` is disposable, and that **secrets never live here** (use a secret manager).

5. **Write `AGENTS.md`** at the repo root: what this system is; the invariants it must keep (two brain areas, harness with the runner; write only through `bin/brain`; brain-as-bus; every run recorded; agents hold roles); the **supported way to extend it** (add an agent via an agent recipe, never bolt features onto an existing agent ad hoc); a "This brain's agents" list (agent recipes append themselves here). Add a one-line `CLAUDE.md` pointing to `AGENTS.md`.

## Doneness

- [ ] `brain new entities acme --title "Acme" --type Entity` creates a doc whose frontmatter is valid and parseable by `pyyaml`.
- [ ] `brain update` on that doc bumps its `timestamp`.
- [ ] `brain search Acme` returns the file.
- [ ] **Degrades gracefully:** delete `bin/`, `harness/`, and `runtime/` and the `knowledge/` tree is still a valid, readable collection of markdown files — open it in any editor and it makes sense.
- [ ] No secrets anywhere in the repo.
- [ ] **Self-documents:** `AGENTS.md` exists at the root and a fresh Claude Code session in the brain reads it and can state the invariants and how to add an agent.

## Pairs with

- **`personal-assistant`** (`build.md` in this directory) — the first agent to run on this brain.
- Any future agent recipe: they all declare `requires: [local-brain]` (or a compatible brain).

## Substitutions

The base stays maximally simple. Grow it only when the work demands it.

| Instead of... | Use... | When |
|---|---|---|
| `ripgrep` plain-text search | SQLite FTS index (rebuilt by dreaming) | search gets slow or noisy as the brain grows past a few hundred docs |
| plain-text search | embeddings / a knowledge graph over the same files | you need questions that hop across many connected facts and plain search demonstrably fails |
| `brain` CLI write contract | an MCP server or HTTP API (same guarantees) | non-CLI agents must write, or multiple harnesses share the brain |
| markdown viewer | a richer UI | non-technical teammates need a point-and-click view — works with zero migration because the underlying format is portable |
