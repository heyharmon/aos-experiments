---
type: kit
name: starter-kit
title: "Starter Kit"
description: "The smallest end-to-end agentic system: a Local Brain plus one Personal Assistant. The base most people should start from and build upon."
stage: 1
provides: system:starter
requires: [local-brain, personal-assistant]
pairs-with: []
stack: [markdown, git, python, ripgrep, claude-code, cron]
---

# Starter Kit

> The whole thing, smallest version: a durable brain and one role that works for you on a schedule — nothing cloud, nothing you can't read. Grab this if you want a single thing to build first. It's two modular recipes presented as one menu; once it runs, you grow it by adding more role recipes onto the same brain, never by rebuilding.

## Yields

A working **Stage 1** system (`AGENT_ARCHITECTURE.md §12`): a git-backed brain you can query by hand, and a Personal Assistant that captures and triages what you hand it, keeps a prioritized task list, writes you a daily briefing, drafts outputs, escalates the consequential, and logs every run. The end-to-end "hello world" of the architecture.

## The footprint — what you get

Everything the kit deploys lives in **one git repo**. Three areas, one role, one write tool — nothing hidden, nothing cloud.

```
~/brain/                         ← one git repo · the entire system · plain text
│
├─ knowledge/                    ← what's true   (curated · durable · OKF)
│   ├─ roles/
│   │   └─ personal-assistant/
│   │       └─ index.md          · the PA's charter — its job description & authority
│   └─ entities/ projects/ decisions/ reference/   · facts the PA files for you
│
├─ agents/                       ← the machinery (durable · not state)
│   └─ personal-assistant/
│       ├─ system-prompt.md      · who the agent is and how it must work
│       ├─ tools.md              · what it may do, each tagged by consequence
│       └─ loop.sh               · the harness cron runs (heartbeat | brief)
│
├─ runtime/                      ← the exhaust   (transient · safe to delete)
│   ├─ queue/                    · tasks YOU hand it
│   │   └─ approvals/            · the PA's asks back to you (consequential actions)
│   ├─ runs/                     · the run-ledger — tokens, cost, outcome per run
│   ├─ drafts/                   · outputs waiting for your review
│   ├─ briefings/                · the daily brief
│   └─ feedback/ evals/          · fuel for later self-improvement
│
├─ bin/brain                     ← the write contract — the only sanctioned way to write
│
├─ AGENTS.md                     ← how an agent must work here (+ CLAUDE.md shim)
├─ .agent-architecture/          ← pinned, read-only copy of the architecture it conforms to
└─ .claude/skills/…              ← /architecture-update — pull upstream changes & reconcile
```

That last block is what keeps the brain honest as it grows: an agent opening this repo reads `AGENTS.md`, learns the invariants and the supported way to extend it, and can run `/architecture-update` to pull the latest architecture and apply its changelog. The brain references the framework it was built from — and can update itself.

And how it runs — a quiet loop you can step into any time. Everything reads from and writes to the brain; nothing else holds state:

```
   cron ──► loop.sh ──► claude -p ──┐   the agent (swappable): reads charter + queue,
  (7am/hr) (harness)                │   writes facts / drafts / approvals via bin/brain
              │                     │
              │ writes run record   │ reads & writes
              ▼                     ▼
        ┌────────────────────────────────────────────┐
        │   THE BRAIN  ·  one git repo                │
        │   knowledge/     agents/     runtime/       │
        └────────────────────────────────────────────┘
                          ▲
                          │ drop tasks · read briefings · approve actions
                         YOU
```

**The one thing to internalize:** the agent holds nothing. Kill it mid-run and the next wake-up reloads everything from the brain. The brain *is* the system; the agent is the worker filling the role — swap the session or the provider and nothing is lost.

## Prerequisites

- **Runtimes:** `git`, `python3` + `pyyaml`, `ripgrep`, `bash`, `cron`/`launchd`.
- **Accounts:** a headless-authenticated Claude Code (`claude -p`).
- Nothing else — no cloud, no database, no accounts.

## Ingredients

This kit is a combination, not a new stack. It bundles:

| Part | Recipe | Reaches |
|---|---|---|
| The foundation | [`brains/local-brain`](../brains/local-brain.md) | Stage 0 |
| The first role | [`roles/personal-assistant`](../roles/personal-assistant.md) | Stage 1 |

## Steps

1. **Build the brain.** Follow [`local-brain`](../brains/local-brain.md) end to end. Stop when its *Doneness* checks pass — you now have Stage 0.
2. **Hire the role.** Follow [`personal-assistant`](../roles/personal-assistant.md), which runs on the brain from step 1. Stop when its *Doneness* checks pass — you now have Stage 1.
3. **Smoke-test end to end** (the kit's own check, below).

## Doneness

The combined test — both recipes' Doneness, plus the round trip that proves they work *together*:

- [ ] `brain queue add "draft a welcome note for new client Acme (urgent); note that Acme renewed for 12 months"` then trigger a heartbeat (or wait for cron).
- [ ] The next run: triages the task, files the durable fact by creating `knowledge/entities/acme/` via `bin/brain`, marks the task urgent, drafts the note to the brain, and appends a run record to `runtime/runs/`.
- [ ] The morning `brief` run writes `runtime/briefings/<today>.md` with the urgent Acme item at the top.
- [ ] `brain search Acme` finds the new entity.
- [ ] A consequential task lands in `runtime/queue/approvals/` instead of executing.
- [ ] `git log` reads as a clean, human-readable history of everything the system did.

## Pairs with

This is the base you build *onto*:

- **Add more role recipes** on the same brain to go from one role to a team (Stage 2) — Comms Manager, Scheduler, Product-Dev, etc. Each declares `requires: [local-brain]`, so it drops in with no change to the foundation. Scaling is hiring, not migrating (`§12`).
- **Add a dreaming recipe** (Stage 3) for nightly consolidation and the self-improvement loop (`§11`).

## Substitutions

Inherit the substitutions from both component recipes — swap the harness, the scheduler, the search layer, or raise the role's autonomy independently. Because the kit is just two modular recipes, you can replace either side without touching the other; that decoupling is the entire reason brain and role are separate recipes.
