# Agent OS — document set

A technology-agnostic vision for organizing AI work by **roles**, and for the **brain** that work runs on. Two peer architecture docs — one for the system, one for its foundation — plus a digest and this index. Read only as far as you need.

| Doc | What it is | Answers | Status |
|---|---|---|---|
| [`OVERVIEW.md`](./OVERVIEW.md) | **The 2-minute digest** | The whole thing, distilled — start here. | Current |
| [`AGENT_ARCHITECTURE.md`](./AGENT_ARCHITECTURE.md) | **Vision & invariants — the system** | *What* the agent system is and *why* — roles, loops, telemetry, autonomy, evaluation, improvement. | Current |
| [`BRAIN_ARCHITECTURE.md`](./BRAIN_ARCHITECTURE.md) | **Vision & invariants — the brain** | *What* the context substrate is and *why* — the three areas, OKF, the conventions agents read and write through. | Current |

## How the two architecture docs relate

They are **peers at the same altitude** — each is a vision plus a set of invariants — and they are deliberately compatible:

- `AGENT_ARCHITECTURE.md` describes the *system around the brain*. It treats the brain as a substrate governed by invariants ("all durable state lives in the brain; it degrades to plain markdown").
- `BRAIN_ARCHITECTURE.md` describes that *substrate itself* — the **Context plane** — at the same level of abstraction. It picks up exactly where the agent doc's invariants leave off.

Neither prescribes technology, with **one exception**: the brain commits to **OKF + git** as its storage format (see below). That single, deliberate commitment is the only thing that distinguishes the brain doc's stance from the agent doc's pure "fill-in-the-blank."

## On the Open Knowledge Format (OKF)

[OKF](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf) is an external, vendor-neutral standard for curated knowledge as markdown + YAML frontmatter in git. We **reference it, not vendor it.**

- The brain's **knowledge layer** (entities, reference, decisions, role-charters) **conforms to OKF**, so the substrate is portable across the whole ecosystem, not just our own tools.
- The brain's **agents and runtime areas** (machinery; and work-queue, run-ledger, feedback, eval-results) are **outside OKF's scope** — OKF is a knowledge format, not a coordination protocol or a place for code.
- OKF is **not a replacement for the brain**: a format is not a system. Committing to it is a *convention* (like "frontmatter is the schema"), not a technology choice — which is why the brain doc can adopt it without breaking the set's tech-agnostic ethos. Git is treated the same way: a brain must be versioned somehow, and git is the obvious choice, so it is barely a prescription.
