---
type: Decision
name: ADR 0005 Sink Concurrency Cap
created: 2026-06-16
updated: 2026-06-16
tags: [decision, adr, architecture, io]
status: accepted
---

# ADR 0005: Sink Concurrency Cap (max 8 concurrent page writes)

`src/io/sink.ts` limits concurrent page writes to **8** at any one time.

## Context

On large sites the sink can queue hundreds of page-write operations. Without a
cap, opening all of them in parallel exhausts OS file-descriptor limits and
causes write failures.

## Decision

Enforce a semaphore of 8 in `src/io/sink.ts`. Writes beyond the cap queue and
drain as slots free. The number 8 was chosen as a practical ceiling that stays
well below typical per-process fd limits while still providing high throughput.

## Consequences

- Large-site renders remain stable under fd pressure.
- Throughput is bounded; a pathological page that holds a write slot for a long
  time can delay others. Monitor p99 write latency if this becomes a concern.
- Any future change to the concurrency ceiling must update this ADR.

_Decided in team standup; see world/notes.md note n1._
