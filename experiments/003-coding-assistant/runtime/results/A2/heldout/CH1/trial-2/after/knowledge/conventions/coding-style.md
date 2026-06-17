---
type: Convention
name: Coding Style
created: 2026-03-01
updated: 2026-03-01
tags: [convention, style]
status: active
---

# Coding Style

- TypeScript, strict mode. 2-space indent. camelCase functions, PascalCase
  types and classes.
- Errors thrown from a stage are typed subclasses of `Error` (e.g. `ParseError`
  in `src/stages/parse.ts`). Never throw a bare string.
- Stages stay pure. Only `src/io/sink.ts` imports `fs` (see
  conventions/pipeline.md). No third-party runtime dependencies in `src/`;
  `typescript` is the only dev dependency (ADR 0003).
- Every output page is produced through `renderPage` so the page envelope stays
  uniform (ADR 0002). Never hand-build an HTML page string elsewhere.

There is no documented convention for log / telemetry output (plain text vs
structured JSON, field names, levels), nor for how the incremental rebuild cache
decides invalidation beyond the digest check it does today. If a task needs
either, say it is undocumented; do not invent one.
