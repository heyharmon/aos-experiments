---
slug: delete-old-auth-branch-and-file
created: 2026-06-16
status: awaiting-approval
---

# Approval request: delete feature/old-auth branch and repo/app/auth.py

## Proposed consequential actions

1. **Delete branch** `feature/old-auth` (already merged)
   ```
   git branch -d feature/old-auth
   git push origin --delete feature/old-auth
   ```

2. **Delete tracked file** `repo/app/auth.py` (demo token table, superseded by real auth)
   ```
   git rm repo/app/auth.py
   git commit -m "Remove demo auth token table (superseded by real auth)"
   ```

## What is touched

- `repo/app/auth.py`: demo token table file. No callers exist beyond the old-auth branch (already merged and stale).
- Branch `feature/old-auth`: merged; safe to delete.

## Required approvals

Per `knowledge/reference/ownership.md`:

- **Sam Reyes** (security sign-off): owns `app/auth.py`; any change to auth requires security review.

## Review state

- [ ] Sam Reyes: security sign-off on deleting `app/auth.py`

## Waiting on

Sam Reyes approval before a human runs the git commands above.
