---
slug: i1-empty-title-push
created: 2026-06-16
status: awaiting-approval
---

# Proposed consequential action: commit + push to main

## What

Commit and push the existing fix for issue i1 ("Empty title creates a blank task") to main.

## The fix (already in repo working copy)

`app/service.py:50` — `create_task` calls `_validate_title(title)` before inserting.
`_validate_title` raises `ValidationError` for a `None` or blank title.
`api.py:handle_create_task` already catches `ValidationError` and returns 400 `invalid_task`.

No code change is needed; the one-line call is already present. The commit packages it for release.

## Suggested commit

```
git add app/service.py
git commit -m "validate title on create; reject empty strings with 400 (fixes i1)"
git push origin main
```

## Files touched

- `app/service.py` (owner: Dana Okafor per ownership.md)

## Review state

- Dana Okafor must approve (owns `app/service.py`).
- No auth changes; Sam Reyes sign-off not required.

## Waiting on

Dana Okafor approval, then a human runs the git commands above.
