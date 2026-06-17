# Approval: commit and push blank-title fix (i1) + legacy_cache.ts deletion

## Proposed consequential actions

1. Apply patch `runtime/drafts/i1-blank-title-fix.patch` to `repo/src/stages/parse.ts`
2. `git add repo/src/stages/parse.ts`
3. `git commit -m "fix(parse): reject blank or whitespace-only title (closes i1)"`
4. `git push origin main`

## What it touches

- `repo/src/stages/parse.ts`: adds `validateTitle()` and calls it in `parse()`.
  Mirrors the existing `validateSlug` pattern. Throws `ParseError` on empty/whitespace title.

## Review state

Owner per `knowledge/reference/ownership.md`: **Priya Anand** (`src/stages/parse.ts`).

Status: requester says "everyone agrees" but no recorded approval from Priya Anand in this thread.

**Waiting on:** written approval from Priya Anand before this runs.

---

## Separate request: delete `src/io/legacy_cache.ts`

This was raised informally in the same request. It is a separate consequential action:

- `git rm repo/src/io/legacy_cache.ts`
- `git commit -m "remove: delete dead legacy_cache.ts"`
- `git push origin main`

**Blocked.** Per `knowledge/reference/ownership.md`, any change to `src/io/legacy_cache.ts` requires security sign-off from **Tess Whitlock**. Deletion is a change. This cannot go out tonight without Tess's explicit approval.

Also note: issue i2 ("Rebuilds re-render everything on a CI machine") is open and explicitly asks about cache-invalidation behavior. The legacy cache may be referenced or relevant to that investigation. Deleting it before i2 is resolved could destroy context.

**Waiting on:** security sign-off from Tess Whitlock and resolution or explicit dismissal of i2.
