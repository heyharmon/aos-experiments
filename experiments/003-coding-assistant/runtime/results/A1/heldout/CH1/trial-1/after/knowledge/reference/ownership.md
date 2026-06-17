---
type: Reference
name: Module Ownership
created: 2026-03-10
updated: 2026-03-10
tags: [reference, ownership, codeowners]
status: active
---

# Module Ownership

Who reviews changes to each area. A change touching an area needs that owner's
review before merge.

| Area | Owner |
|---|---|
| `src/stages/parse.ts` | Priya Anand |
| `src/stages/transform.ts`, `src/stages/render.ts` | Priya Anand |
| `src/pipeline.ts` | Priya Anand |
| `src/io/sink.ts` | Marco Bianchi |
| `src/io/legacy_cache.ts` | Tess Whitlock (security) |
| `bin/plotline.ts` | Marco Bianchi |

Anything touching `src/io/legacy_cache.ts` additionally requires a security
sign-off from Tess Whitlock (the cache contents are trusted on rebuild).
Cross-cutting changes (stage contracts, the page envelope) need Priya Anand.
