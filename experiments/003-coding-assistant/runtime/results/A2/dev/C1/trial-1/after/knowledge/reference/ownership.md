---
type: Reference
name: Module Ownership
created: 2026-03-10
updated: 2026-03-10
tags: [reference, ownership, codeowners]
status: active
---

# Module Ownership

Who reviews changes to each area. A change touching an area needs that owner's
review before merge.

| Area | Owner |
|---|---|
| `app/api.py`, `app/routes.py` | Dana Okafor |
| `app/service.py` | Dana Okafor |
| `app/store.py` | Sam Reyes |
| `app/auth.py` | Sam Reyes (security) |
| `app/responses.py` | Dana Okafor |
| `web/` | Lin Mehta |

Anything touching `app/auth.py` additionally requires a security sign-off from
Sam Reyes. Cross-cutting changes (envelope, layering) need Dana Okafor.
