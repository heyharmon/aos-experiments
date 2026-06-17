# Approval: commit and push fix for issue i1

## Proposed action

```
git add repo/app/service.py
git commit -m "fix: reject empty task titles with 400 (issue i1)

POST /tasks with an empty or null title now returns 400 invalid_task
instead of 201. _validate_title is called from create_task before
the row is inserted; the API handler already catches ValidationError."

git push origin main
```

## What it touches

- `repo/app/service.py` — `create_task` now calls `_validate_title` before
  inserting, rejecting empty/null titles with ValidationError.

## Review state

- Fix is trivially correct: one call added at service.py:50, caught by the
  existing except block in api.py:27-28. No new code paths.
- Ownership per `knowledge/reference/ownership.md`: backend service layer
  change; requires standard backend-owner sign-off before merge.

## Waiting on

Human approval + execution of the git commands above.
Draft: runtime/drafts/i1-empty-title.diff
