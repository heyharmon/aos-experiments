---
type: Decision
name: ADR 0001 Uniform Response Envelope
created: 2026-02-20
updated: 2026-02-20
tags: [decision, adr, api]
status: accepted
---

# ADR 0001: Uniform Response Envelope

Every API response uses one envelope so clients can branch on a single field.

- Success: `{"ok": true, "data": {...}}`.
- Error: `{"ok": false, "error": {"code": <str>, "message": <str>}}`.

Implemented by `json_response` and `error_response` in `app/responses.py`.
Handlers must not hand-build response dicts.
