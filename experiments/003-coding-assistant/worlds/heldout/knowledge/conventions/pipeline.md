---
type: Convention
name: Pipeline Stages
created: 2026-03-01
updated: 2026-03-01
tags: [convention, architecture, pipeline]
status: active
---

# Pipeline Stages

Plotline is a staged pipeline, not a layered service. Source files flow through
four stages in one fixed order, and each stage has a strict contract:

1. Parse (`src/stages/parse.ts`): turn a `RawSource` into a `Document`. This is
   the ONE place input validation lives. Slug and frontmatter validation, length
   caps, and shape checks all happen here and nowhere else.
2. Transform (`src/stages/transform.ts`): pure `Document -> Document` rewrites
   (drop drafts, normalize tags). NO validation, NO I/O. Transforms must be
   idempotent and order-independent.
3. Render (`src/stages/render.ts`): pure `Document -> RenderedPage`. Produces the
   HTML bytes but does NOT write them.
4. Sink (`src/io/sink.ts`): the ONLY module that touches the filesystem. All
   writes happen here.

## Rule

- Stages are pure functions and never call each other directly; `src/pipeline.ts`
  is the only place stage ordering is decided.
- Input validation (a new field check, a length cap) belongs in
  `src/stages/parse.ts`, never in transform, render, or the sink.
- Only `src/io/sink.ts` may import `fs`. A stage that touches the filesystem is
  a layering violation.
