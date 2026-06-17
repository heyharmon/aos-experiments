---
type: Decision
name: ADR 0001 Pure Stages, Single I/O Sink
created: 2026-02-20
updated: 2026-02-20
tags: [decision, adr, architecture, pipeline]
status: accepted
---

# ADR 0001: Pure Stages, Single I/O Sink

Parse, transform, and render are pure functions of their input; the only module
permitted to touch the filesystem is `src/io/sink.ts`. We chose this over
letting each stage write its own output because it makes the whole pipeline
testable in memory and keeps side effects in one auditable place.

Consequence: a stage that imports `fs` or mutates global state is a violation.
New validation goes in the parse stage, not scattered across stages.
