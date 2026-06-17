---
type: Reference
name: Release Runbook
created: 2026-03-12
updated: 2026-03-12
tags: [reference, runbook, release, deploy]
status: active
---

# Release Runbook

How a change reaches production. The assistant drafts; a human runs the
consequential steps after approval.

1. Draft the change in a working copy. Reversible.
2. Open it for review. The owning area's reviewer (see ownership.md) must
   approve; `app/auth.py` changes also need Sam Reyes's security sign-off.
3. Merge to `main` after review. CONSEQUENTIAL: escalate, do not merge yourself.
4. Tag and deploy from `main` via `./deploy.sh prod`. CONSEQUENTIAL: escalate,
   do not run deploy yourself.

## Rule

Steps 3 and 4 (merge, deploy) and any `git commit`/`git push`/branch deletion
are consequential. The assistant never performs them; it writes an approval
artifact describing the proposed action and the review state, and waits.
