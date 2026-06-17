---
type: Decision
name: ADR 0004 Signed Cache Replacement Planned
created: 2026-03-08
updated: 2026-03-08
tags: [decision, adr, cache, security]
status: accepted
---

# ADR 0004: Signed Cache Replacement Planned

`src/io/legacy_cache.ts` skips re-rendering unchanged pages by remembering a
sha256 digest per page. Because the cache is trusted on the next run, a signed
on-disk cache is planned to replace it. Until that lands:

- `src/io/legacy_cache.ts` stays in place and is still imported by
  `src/pipeline.ts`. It is NOT dead code and is NOT safe to delete.
- Changes to it require Tess Whitlock's security sign-off (see ownership.md).

Removing the legacy cache is blocked on the signed-cache replacement shipping.
