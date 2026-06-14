# CLAUDE.md — agent-architecture

## What this directory is

A set of **documentation** that lays out an opinionated, technology-agnostic architecture for **building and using agents to do real work** — from a single agent up to a system that helps run a business. These are vision-and-invariants docs, not code. Your job here is to help write, edit, and expand them.

## The files

| File | What it is |
|---|---|
| `OVERVIEW.md` | The 2-minute digest. Start here. |
| `AGENT_ARCHITECTURE.md` | The system: roles, planes, activation/loops, telemetry, autonomy, human surfaces, evaluation, improvement, maturity path. |
| `BRAIN_ARCHITECTURE.md` | The foundation: the "brain" — the shared context substrate, its two layers, and OKF. |
| `README.md` | Index explaining how the docs relate. |
| `todos.md` | Working notes / backlog. |

`AGENT_ARCHITECTURE.md` and `BRAIN_ARCHITECTURE.md` are **peer docs at the same altitude** — one for the system, one for its foundation.

## The core thesis (so edits stay coherent)

- **The brain is the bus.** All durable state lives in one place — plain markdown in git. Agents coordinate only by reading/writing the brain, never by calling each other. So agents are **disposable**.
- **Roles are the unit.** Organize work by accountable *role* (a "virtual employee" — a position, not a person), not by task or tool. A role wraps the machinery (schedules, loops, skills) into one nameable thing.
- **Opinionated about mechanism, agnostic about policy.** The architecture fixes how things are wired; the operator chooses the settings — above all, how much **autonomy** each role gets (a per-role dial) and which **surfaces** they use.
- **Self-improving, auditably.** Interventions become feedback → dreaming clusters them → proposes a diff to a role's charter → human approves. Every change is a readable git diff.
- One deliberate technology commitment: the brain uses **OKF + git** (the [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf)) for its knowledge layer. Everything else is fill-in-the-blank.

## Conventions & voice

- These are **vision + invariants** documents — opinionated, principle-first, tech-agnostic. Keep that register.
- Prose is tight and declarative, leaning on tables, short ASCII diagrams, and the org/employee vocabulary (hiring, performance review, promotion). Match it.
- Cross-reference between docs and sections (e.g. `AGENT_ARCHITECTURE.md §8`) as the existing text does.
- The recurring litmus test: *can you explain the whole system out loud in a few minutes by pointing at files and naming roles?* If a change adds complexity that fails this test, push back.
- When asked to add or change content, keep the two docs consistent with each other and with the invariants/glossaries.
