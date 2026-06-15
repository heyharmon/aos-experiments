# CLAUDE.md — agent-architecture

## What this directory is

A set of **documentation** that lays out an opinionated, technology-agnostic architecture for **building and using agents to do real work** — from a single agent up to a system that helps run a business. These are vision-and-invariants docs, not code. Your job here is to help write, edit, and expand them.

## The files

| File | What it is |
|---|---|
| `OVERVIEW.md` | The 2-minute digest. Start here. |
| `AGENT_ARCHITECTURE.md` | The system: roles, planes, activation/loops, telemetry, autonomy, human surfaces, evaluation, improvement, maturity path. |
| `BRAIN_ARCHITECTURE.md` | The foundation: the "brain" — the shared context substrate, its three areas (knowledge / agents / runtime), and OKF. |
| `README.md` | Index explaining how the docs relate. |
| `CHANGELOG.md` | Consumer-facing record of architecture changes. See "Committing & the changelog" below. |
| `todos.md` | Working notes / backlog. |

`AGENT_ARCHITECTURE.md` and `BRAIN_ARCHITECTURE.md` are **peer docs at the same altitude** — one for the system, one for its foundation.

## Subdirectory: `recipes/`

These docs are deliberately tech-agnostic. The **`recipes/`** subdirectory is the implementation layer that *does* prescribe a stack and a build plan — friendly specs a coding agent can execute. Three kinds: **brain recipes** (the foundation), **role recipes** (one role each, modular), and **kits** (a brain + role(s) combined). See `recipes/README.md`.

## The core thesis (so edits stay coherent)

- **The brain is the bus.** All durable state lives in one place — plain markdown in git. Agents coordinate only by reading/writing the brain, never by calling each other. So agents are **swappable** (a new session, or a different provider).
- **Agents take on roles.** Organize work by hiring each agent into an accountable *role* — a durable, well-defined job (like "Communications Manager") that holds the tools and knowledge for the work. The role persists; the agent that fills it is swappable.
- **Opinionated about mechanism, agnostic about policy.** The architecture fixes how things are wired; the operator chooses the settings — above all, how much **autonomy** each role gets (a per-role dial) and which **surfaces** they use.
- **Self-improving, auditably.** Interventions become feedback → dreaming clusters them → proposes a diff to a role's charter → human approves. Every change is a readable git diff.
- One deliberate technology commitment: the brain uses **OKF + git** (the [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf)) for its knowledge layer. Everything else is fill-in-the-blank.

## Committing & the changelog

Commit progress and maintain `CHANGELOG.md` **proactively** — but only at a **meaningful stopping point**, never on every edit. The judgment of "meaningful" is yours; this is guidance you act on, not an automated hook.

**When to commit + log.** A scope of work is done: a section reworked, a contradiction resolved across both docs, a new role/recipe added, an invariant changed. A burst of typo fixes or mid-thought edits is *not* a stopping point — let it ride until the work coheres.

**How:**
1. **Commit directly to `main`** (this is a solo docs repo; the changelog + git history are the record — no branch/PR ceremony). Stage only the architecture files involved; never sweep in unrelated working files.
2. **Update `CHANGELOG.md` in the same commit** so history and changelog never drift.

**Changelog altitude — this is the important part.** The audience is *consuming users and their coding agents* who will update their own projects from these entries. So write what changed in the **architecture / invariants / conventions** and what an implementer should **do about it** — not "fixed cross-ref in §5." Every entry that asks something of downstream projects gets an **Impact:** line. Follow the format already in `CHANGELOG.md` (Keep a Changelog: newest first, Added/Changed/Fixed, dated). Add a new dated section per stopping point, or extend today's if one exists.

**What's changelog-worthy:** changes to invariants, the brain's areas/shape, role/dreaming/autonomy model, the recipes layer, or anything that changes how a consumer would build. **What's not:** typos, internal phrasing, formatting — commit those, but don't log them.

## Conventions & voice

- These are **vision + invariants** documents — opinionated, principle-first, tech-agnostic. Keep that register.
- Prose is tight and declarative, leaning on tables, short ASCII diagrams, and the org/employee vocabulary (hiring, performance review, promotion). Match it.
- Cross-reference between docs and sections (e.g. `AGENT_ARCHITECTURE.md §8`) as the existing text does.
- The recurring litmus test: *can you explain the whole system out loud in a few minutes by pointing at files and naming roles?* If a change adds complexity that fails this test, push back.
- When asked to add or change content, keep the two docs consistent with each other and with the invariants/glossaries.
