# Agent OS — document set

A technology-agnostic vision for organizing AI work by **roles**, and for the **brain** that work runs on. Two peer architecture docs — one for the system, one for its foundation — plus a digest and this index. Read only as far as you need.

| Doc | What it is | Answers |
|---|---|---|
| [`OVERVIEW.md`](./OVERVIEW.md) | **The 2-minute digest** | The whole thing, distilled — start here. |
| [`AGENT_ARCHITECTURE.md`](./AGENT_ARCHITECTURE.md) | **Vision & invariants — the system** | *What* the agent system is and *why* — roles, loops, telemetry, autonomy, evaluation, improvement. |
| [`BRAIN_ARCHITECTURE.md`](./BRAIN_ARCHITECTURE.md) | **Vision & invariants — the brain** | *What* the context substrate is and *why* — the three areas, OKF, the conventions agents read and write through. |

## How the two architecture docs relate

They are **peers at the same altitude** — each is a vision plus a set of invariants — and they are deliberately compatible:

- `AGENT_ARCHITECTURE.md` describes the *system around the brain*. It treats the brain as a substrate governed by invariants ("all durable state lives in the brain; it degrades to plain markdown").
- `BRAIN_ARCHITECTURE.md` describes that *substrate itself* — the **Context plane** — at the same level of abstraction. It picks up exactly where the agent doc's invariants leave off.

Neither prescribes technology, with **one exception**: the brain commits to **OKF + git** as its storage format (see below). That single, deliberate commitment is the only thing that distinguishes the brain doc's stance from the agent doc's pure "fill-in-the-blank."

## On the Open Knowledge Format (OKF)

The brain's one technology commitment is [OKF](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf) + git: the knowledge layer conforms to OKF (markdown + YAML frontmatter), the agents and runtime areas sit outside its scope, and we reference the standard rather than vendor it. `BRAIN_ARCHITECTURE.md §0` is the full rationale for why this is the only thing the set commits to.
