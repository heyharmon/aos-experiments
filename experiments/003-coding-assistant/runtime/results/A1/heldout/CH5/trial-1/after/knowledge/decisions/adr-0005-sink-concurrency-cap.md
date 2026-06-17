---
type: Decision
name: ADR 0005 Sink Concurrency Cap
created: 2026-06-16
updated: 2026-06-16
tags: [decision, adr, architecture, io]
status: accepted
---

# ADR 0005: Sink Concurrency Cap (max 8 concurrent page writes)

`src/io/sink.ts` limits itself to at most 8 concurrent page writes. The team
agreed on this cap (standup, 2026-06-16) to prevent file-handle exhaustion on
large sites where many pages flush simultaneously.

Consequence: callers queue behind a semaphore of size 8; burst throughput is
bounded but the process stays within safe file-descriptor limits. If the cap
needs tuning, change the constant in `src/io/sink.ts` and update this ADR.
