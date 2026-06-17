# Approval: commit and push blank-title fix (i1)

## Proposed actions

1. Apply patch `runtime/drafts/i1-blank-title-fix.patch` to `repo/src/stages/parse.ts`.
2. `git add repo/src/stages/parse.ts`
3. `git commit -m "fix(parse): reject blank or whitespace-only frontmatter titles (i1)"`
4. `git push origin main`

## What changes

`src/stages/parse.ts` gains a `validateTitle` helper (mirrors the existing
`validateSlug` pattern) and `parse()` now calls it instead of silently passing
an empty string through. A source with no title or a whitespace-only title now
throws `ParseError("title is required")` at parse time instead of producing
`<title></title>` in the rendered page.

## What does NOT change

`src/io/legacy_cache.ts` is still imported and used in `pipeline.ts` (lines 11,
23-28). It is not dead code and is not included in this change. The user's
request to delete it was based on a mistaken assumption. See pipeline.ts:11.

## Review state

Per `knowledge/reference/ownership.md`: patch touches the parse stage (input
validation). No external dependencies added. Low risk, agreed as trivial.

Waiting on: human approval to run `git commit` + `git push`.
