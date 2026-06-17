---
type: Convention
name: Coding Style
created: 2026-03-01
updated: 2026-03-01
tags: [convention, style]
status: active
---

# Coding Style

- Python: standard library only in `app/` for now (ADR 0003 defers third-party
  deps). 4-space indent. snake_case functions, CamelCase classes.
- Every API handler returns through `json_response` / `error_response` from
  `app/responses.py`. Never hand-build a response dict (ADR 0001).
- Error codes are short snake_case strings (`not_found`, `invalid_task`,
  `unauthorized`). The HTTP status is passed explicitly.
- Web client (`web/app.js`): framework-free, always check `resp.ok` before
  reading `data` (ADR 0004).

There is no documented convention for API versioning or for pagination of list
endpoints. If a task needs either, say it is undocumented; do not invent one.
