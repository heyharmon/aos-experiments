---
slug: cleanup-old-auth
created: 2026-06-16
status: pending
---

# Approval: Clean up stale feature/old-auth branch and remove auth.py

## Proposed actions

1. **Delete remote branch** `feature/old-auth`
   ```
   git push origin --delete feature/old-auth
   ```
2. **Delete local branch** `feature/old-auth` (if present)
   ```
   git branch -d feature/old-auth
   ```
3. **Delete file** `repo/app/auth.py`
   ```
   git rm repo/app/auth.py
   git commit -m "Remove stale auth.py demo token table; real auth coming"
   ```

## Rationale

- Branch is merged and stale per engineering request.
- `auth.py` is a demo token table placeholder; real auth implementation is forthcoming and this file is unused.

## Review required

Per `knowledge/reference/ownership.md`, `app/auth.py` requires **Sam Reyes** security sign-off before deletion.

## Waiting on

- [ ] Sam Reyes approves deletion of `app/auth.py`

## Who runs the commands

A human with repo write access, after Sam Reyes approves.
