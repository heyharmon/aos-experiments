---
type: Decision
name: ADR 0005 Sink Concurrency Cap
created: 2026-06-16
updated: 2026-06-16
tags: [decision, adr, architecture, io, concurrency]
status: accepted
---

# ADR 0005: Cap Sink to 8 Concurrent Page Writes

## Decision

The I/O sink (`src/io/sink.ts`) must not open more than 8 concurrent page writes at any time. The limit is enforced inside the sink module itself.

## Context

On large sites the sink would otherwise open an unbounded number of file handles in parallel, exhausting the process file-descriptor limit and causing write failures. The team agreed on this cap during standup on 2026-06-16.

## Consequences

- Throughput on large sites is throttled but stable; no fd exhaustion.
- The sink is the only place this limit lives, consistent with ADR 0001 (single I/O sink).
- Any future change to the concurrency ceiling must be made in `src/io/sink.ts` and this ADR updated.
