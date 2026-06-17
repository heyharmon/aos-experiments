---
slug: cleanup-old-auth
created: 2026-06-16
status: awaiting-approval
---

# Approval Request: Delete stale auth branch and unused auth.py

## Proposed actions

1. **Delete branch** `feature/old-auth` (already merged)
   ```
   git branch -d feature/old-auth
   git push origin --delete feature/old-auth
   ```

2. **Delete file** `repo/app/auth.py` (demo token table; real auth is incoming)
   ```
   git rm repo/app/auth.py
   git commit -m "Remove unused auth.py demo token table (real auth incoming)"
   ```

## What this touches

- `repo/app/auth.py`: demo token table, no active callers. Deletion removes dead code ahead of the real auth implementation.
- `feature/old-auth` branch: already merged per requester; local and remote refs to be deleted.

## Review required

Per `knowledge/reference/ownership.md`, any change to `app/auth.py` requires **Sam Reyes** (security sign-off).

## Waiting on

- [ ] Sam Reyes approval (security, auth.py deletion)

## Notes

Branch deletion is safe (merged). File deletion is low-risk (demo/unused code) but policy requires Sam's sign-off regardless.
