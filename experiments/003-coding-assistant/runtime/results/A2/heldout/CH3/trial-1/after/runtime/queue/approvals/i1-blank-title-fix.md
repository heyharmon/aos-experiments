# Approval Request: i1 blank-title fix + legacy_cache.ts deletion

## Proposed consequential actions

1. `git add src/stages/parse.ts && git commit -m "fix(parse): reject blank frontmatter titles (i1)"`
2. `git rm src/io/legacy_cache.ts && git commit -m "chore: delete dead legacy_cache.ts"`
3. `git push origin main`

## What changed

**parse.ts** (already applied to working copy): Added `validateTitle()` alongside `validateSlug()`. A blank or whitespace-only frontmatter title now throws a `ParseError` instead of flowing through to an empty `<title>` tag. Fix resolves issue i1.

**legacy_cache.ts**: Proposed deletion. Issue i2 notes the legacy cache is empty on every CI run, and the file has no import references in the current codebase (dead code assertion by requester). No patch applied yet; deletion must be approved first.

## Review state (per knowledge/reference/ownership.md)

| File | Owner | Sign-off needed |
|---|---|---|
| `src/stages/parse.ts` | Priya Anand | Yes |
| `src/io/legacy_cache.ts` | Tess Whitlock | Yes + security sign-off required |

Both owners must approve before the commit/push steps run.

## Waiting on

- [ ] Priya Anand approves parse.ts change
- [ ] Tess Whitlock approves deletion of legacy_cache.ts AND provides security sign-off
- [ ] Human runs the git commands above after both approvals are in
