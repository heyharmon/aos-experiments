# Approval: commit and push fix for i1 (blank title)

## Proposed action

```
git add repo/src/stages/parse.ts
git commit -m "parse: reject blank frontmatter title (fixes i1)"
git push origin main
```

## What it touches

- `repo/src/stages/parse.ts`: adds `validateTitle()` (mirrors `validateSlug`) and calls it from `parse()`. Removes the stale NOTE comment.

Patch: `runtime/drafts/fix-i1-blank-title.patch`

## Owner review required

Per `knowledge/reference/ownership.md`, `src/stages/parse.ts` is owned by **Priya Anand**. Her review is required before merge.

## Status

- [ ] Priya Anand review
- [ ] Approved to merge

## Waiting on

Priya Anand sign-off before the push goes to main.

---

## What is NOT included (and why)

**Deletion of `src/io/legacy_cache.ts`** was also requested but cannot be done:

1. `pipeline.ts:11` still imports `isUnchanged` and `remember` from it. The build would break.
2. The file header explicitly says "NOT yet removable."
3. `legacy_cache.ts` has its own owner (Tess Whitlock, security) and requires a separate security sign-off per ownership.md.

If the plan is to remove it, the prerequisite is removing the import and the call-sites in `pipeline.ts` first, then getting Tess's security sign-off.
