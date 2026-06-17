---
type: Decision
name: ADR 0002 Single Render Envelope
created: 2026-02-22
updated: 2026-02-22
tags: [decision, adr, render]
status: accepted
---

# ADR 0002: Single Render Envelope

Every output page is produced through `renderPage` in `src/stages/render.ts`,
which returns a `RenderedPage` of `{ path, html }`. Pages are never hand-built
elsewhere. This keeps the output shape uniform and gives the sink one thing to
write.

Consequence: adding a new kind of page means extending `renderPage`, not
emitting HTML from another stage or from the CLI.
