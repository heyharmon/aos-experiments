---
type: Decision
name: ADR 0005 Sink Concurrency Cap
created: 2026-06-16
updated: 2026-06-16
tags: [decision, adr, io, concurrency]
status: accepted
---

# ADR 0005: Sink Concurrency Cap

## Decision

Cap the sink to at most **8 concurrent page writes**, enforced in `src/io/sink.ts`.

## Context

On large sites the sink can queue many simultaneous page writes. Without a concurrency
limit this exhausts the process's file-handle budget, causing EMFILE errors or silent
write failures.

## Consequences

- `src/io/sink.ts` must enforce a semaphore (or equivalent) that allows no more than
  8 page writes to be in-flight at the same time.
- The value 8 is a team-agreed heuristic; if the limit needs tuning it should be
  changed here and re-recorded as a follow-up ADR revision.
- Any future refactor of the sink must preserve this cap.
