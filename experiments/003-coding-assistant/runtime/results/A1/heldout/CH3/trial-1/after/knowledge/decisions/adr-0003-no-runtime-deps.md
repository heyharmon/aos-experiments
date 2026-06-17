---
type: Decision
name: ADR 0003 No Runtime Dependencies
created: 2026-02-25
updated: 2026-02-25
tags: [decision, adr, deps]
status: accepted
---

# ADR 0003: No Runtime Dependencies Yet

`src/` uses only the Node standard library and TypeScript's built-in types. We
deferred pulling in a markdown library, a templating engine, or a frontmatter
parser until the pipeline shape is stable. Until then:

- No third-party runtime dependencies in `src/`. `typescript` is the only dev
  dependency.
- Frontmatter and markdown handling stay hand-rolled for now.

Anything that needs an external library (a real markdown renderer, a YAML
frontmatter parser) is blocked on this ADR being revisited.
