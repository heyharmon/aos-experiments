---
type: Convention
name: Auth
created: 2026-03-04
updated: 2026-03-04
tags: [convention, auth, security]
status: active
---

# Auth

Authentication is applied at exactly one choke point: the `require_auth` wrapper
in `app/auth.py`. Every route in `app/routes.py` is wrapped exactly once.

## Rule

- New endpoints are registered in `app/routes.py` and wrapped with
  `require_auth`. Do not add a per-handler token check; the wrapper is the
  single source of truth.
- Handlers assume `request.user_id` is already populated by the wrapper.
- Token-to-user resolution lives in `app/auth.py` (`resolve_token`). The current
  table is a demo stub; real resolution is deferred (ADR 0003).
