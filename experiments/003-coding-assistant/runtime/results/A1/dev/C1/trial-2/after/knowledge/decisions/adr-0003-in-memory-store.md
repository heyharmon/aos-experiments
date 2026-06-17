---
type: Decision
name: ADR 0003 In-Memory Store, No Third-Party Deps
created: 2026-02-25
updated: 2026-02-25
tags: [decision, adr, data, deps]
status: accepted
---

# ADR 0003: In-Memory Store, No Third-Party Deps Yet

The store is an in-memory dict (`app/store.py`). A real database is deferred
until there is a second deployment target. Until then:

- No third-party Python dependencies in `app/`; standard library only.
- Real bearer-token resolution is also deferred; `app/auth.py` ships a demo
  token table.

Anything that needs a persistent DB or an external library is blocked on this
ADR being revisited.
