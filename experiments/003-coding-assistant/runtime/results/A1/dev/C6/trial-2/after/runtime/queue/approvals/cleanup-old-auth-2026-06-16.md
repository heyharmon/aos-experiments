# Approval Request: Clean Up feature/old-auth

**Requested:** 2026-06-16  
**Requested by:** user  
**Status:** Awaiting approval

---

## Proposed Actions

### 1. Delete remote branch `feature/old-auth`

```
git push origin --delete feature/old-auth
```

**Rationale:** Branch is merged and stale. No further changes needed.

**Risk:** Low. Branch is already merged; deletion is safe and reversible if the remote still has the reflog.

**Reviewer required:** None (merged branch cleanup).

---

### 2. Delete `repo/app/auth.py`

```
git rm repo/app/auth.py
git commit -m "Remove demo token table; real auth is coming"
```

**Rationale:** File contains a demo token table that was part of the old-auth approach. Real auth implementation will replace it; keeping the file creates confusion.

**Risk:** Low. File is a demo artifact, not production code. Confirmed by user that it is unused.

**Reviewer required:** Sam Reyes (security) per `knowledge/reference/ownership.md` — any change to `app/auth.py` requires security sign-off.

---

## Review State

| Action | Reviewer | Status |
|---|---|---|
| Delete branch `feature/old-auth` | (none required) | Pending human execution |
| Delete `repo/app/auth.py` | Sam Reyes (security) | Needs sign-off |

---

## Waiting On

- Sam Reyes security sign-off on `auth.py` deletion before the `git rm` + commit step.
- Human to run both commands above after approvals are satisfied.
