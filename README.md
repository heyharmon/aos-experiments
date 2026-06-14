# Agent Architecture — document set

A technology-agnostic vision for organizing AI work by **roles**, plus the buildable blueprint for its foundation. The docs are **layered by altitude** — each answers a different question, and you can read down only as far as you need.

| Doc | Altitude | Answers | Status |
|---|---|---|---|
| [`OVERVIEW.md`](./OVERVIEW.md) | **The 2-minute digest** | The whole thing, distilled — start here. | Current |
| [`AGENT_ARCHITECTURE.md`](./AGENT_ARCHITECTURE.md) | **Vision & invariants** | *What* the system is and *why* — the parts, the rules, the principles. Tech-agnostic. | Current |
| [`BRAIN_BRIEF.md`](./BRAIN_BRIEF.md) | **Context-plane blueprint** | *How* to build the brain (the substrate every role reads and writes). Opinionated, buildable. | Current — aligned to roles + OKF |

## How the two relate

`AGENT_ARCHITECTURE.md` describes the *system around the brain*: roles, loops, telemetry, autonomy, evaluation, improvement. It treats the brain as a black box governed by invariants (e.g. "all durable state lives in the brain; it degrades to plain markdown").

`BRAIN_BRIEF.md` opens that black box for the one plane deep enough to warrant it — the **Context plane** — and shows a concrete way to build it. The architecture is the contract; the brief is one compliant implementation of its foundation.

Most planes will never need their own doc. The Context plane does, because it's the foundation everything else writes to.

## On the Open Knowledge Format (OKF)

[OKF](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf) is an external, vendor-neutral standard for curated knowledge as markdown + YAML frontmatter in git. It is **inspiration and a conformance target, not a doc we vendor here.**

- The brain's **knowledge layer** (entities, reference, decisions, role-charters) should **conform to OKF**, so our substrate is portable across the whole ecosystem, not just our own tools.
- The brain's **operational layer** (work-queue, run-ledger/telemetry, feedback, eval-results) is **outside OKF's scope** — OKF is a knowledge format, not a coordination protocol.
- OKF is therefore **not a replacement for the brain**: a format is not a system. We follow it for the knowledge layer and reference the real spec rather than copying it.

## How BRAIN_BRIEF aligns (done)

`BRAIN_BRIEF.md` has been brought in line with the architecture:
1. **Roles** — role-charters are now first-class knowledge (`roles/<role>/charter.md`), holding the autonomy dial and consequence-tagged tools.
2. **OKF conformance** — the knowledge layer follows OKF (required `type`, OKF-recommended fields, our extras as extension keys, cross-links as bundle-relative body links).
3. **Two-layer split** — a curated **knowledge layer** (OKF) vs. an **operational layer** (`_queue/`, `_runs/`, `_feedback/`, `_evals/`) the architecture assumes lives in the brain.
