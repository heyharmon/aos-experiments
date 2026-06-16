# CLAUDE.md — agent-os

## What this directory is

A set of **documentation** that lays out an opinionated, technology-agnostic architecture for **building and using agents to do real work** — from a single agent up to a system that helps run a business. These are vision-and-invariants docs, not code. Your task here is to help write, edit, and expand them.

## The files

| File | What it is |
|---|---|
| `OVERVIEW.md` | The 2-minute digest. Start here. |
| `AGENT_ARCHITECTURE.md` | The system: agents, roles, planes, activation/loops, telemetry, autonomy, human surfaces, evaluation, improvement, maturity path. |
| `BRAIN_ARCHITECTURE.md` | The foundation: the "brain" — the shared context substrate, its two areas (knowledge / runtime), and OKF. The harness (each agent's machinery) lives with the runner, not the brain. |
| `README.md` | Index explaining how the docs relate. |
| `CHANGELOG.md` | Consumer-facing record of architecture changes. See "Committing & the changelog" below. |
| `todos.md` | Working notes / backlog. |

`AGENT_ARCHITECTURE.md` and `BRAIN_ARCHITECTURE.md` are **peer docs at the same altitude** — one for the system, one for its foundation.

## Subdirectory: `recipes/`

These docs are deliberately tech-agnostic. The **`recipes/`** subdirectory is the implementation layer that *does* prescribe a stack and a build plan — friendly specs a coding agent can execute. Three kinds: **brain recipes** (the foundation), **agent recipes** (one agent each, modular), and **kits** (a brain + agent(s) combined). See `recipes/README.md`.

## The core thesis (so edits stay coherent)

- **The brain is the bus.** All durable state lives in one place — plain markdown files. Agents coordinate only by reading/writing the brain, never by calling each other. So the **runner is swappable** (a new session, or a different provider) while the agent persists.
- **Agents hold roles.** Organize work by hiring each agent into an accountable **role** (like "Communications Manager") that scopes its work. The role lives in the brain and the agent persists; its machinery (the harness) lives with the runner, and the session and provider running it are swappable.
- **Opinionated about mechanism, agnostic about policy.** The architecture fixes how things are wired; the operator chooses the settings — above all, how much **autonomy** each agent gets (a per-agent dial) and which **surfaces** they use.
- **Self-improving, auditably.** Interventions become feedback → dreaming clusters them → proposes a diff to an agent's role → human approves. Every change is a readable diff you approve before it lands.
- One deliberate commitment, and it's a *format* not a technology: the brain's knowledge layer uses **OKF** (the [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf)) — the brain's only hard commitment. Everything else is fill-in-the-blank; technology is pinned only in `recipes/` and `kits/`.

## Committing & the changelog

Commit progress and maintain `CHANGELOG.md` **proactively** — but only at a **meaningful stopping point**, never on every edit. The judgment of "meaningful" is yours; this is guidance you act on, not an automated hook.

**When.** Commit when a scope of work coheres (a section reworked, a contradiction resolved, an agent/recipe or invariant changed), not on every edit; let a burst of typos or mid-thought edits ride until it settles.

**How.** Commit directly to `main` (solo docs repo, no branch/PR ceremony), staging only the architecture files involved, and update `CHANGELOG.md` in the *same* commit so the two never drift. Follow the existing Keep a Changelog format (newest first; Added/Changed/Fixed; dated); add a dated section per stopping point or extend today's.

**At what altitude.** The audience is consuming users and their coding agents who update their own projects from these entries, so log changes to *architecture, invariants, or conventions* and what an implementer should do about them (every downstream-affecting entry gets an **Impact:** line), never "fixed cross-ref in §5." Typos, phrasing, and formatting are committed but not logged.

## Conventions & voice

- These are **vision + invariants** documents — opinionated, principle-first, tech-agnostic. Keep that register.
- Prose is tight and declarative, leaning on tables, diagrams, and the org/employee vocabulary (hiring, performance review, promotion). Match it.
- **Diagrams: plain ASCII, always, kept extremely simple.** Use small ASCII for everything — flows, the spine, directory trees, and labeled spectrums (the autonomy dial, the maturity path) — so they read raw and stay diffable. No **Mermaid** (it doesn't render everywhere and reads worse as source) and no generated/raster images (not diffable, agent-editable, or `brain search`-able; they break the degrade-to-plain-text ethos). Prefer the fewest boxes and arrows that carry the idea.
- Cross-reference between docs and sections (e.g. `AGENT_ARCHITECTURE.md §8`) as the existing text does.
- The recurring litmus test: *can you explain the whole system out loud in a few minutes by pointing at files and naming agents?* If a change adds complexity that fails this test, push back.
- When asked to add or change content, keep the two docs consistent with each other and with the invariants/glossaries.
