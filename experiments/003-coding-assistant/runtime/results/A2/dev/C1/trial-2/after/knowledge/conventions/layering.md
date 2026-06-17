---
type: Convention
name: Layering
created: 2026-03-01
updated: 2026-03-01
tags: [convention, architecture, layering]
status: active
---

# Layering

Tasklet has three layers, and code must respect their direction:

1. Handlers (`app/api.py`): thin. Parse the request, call the service, shape the
   response. NO business logic, NO direct store access.
2. Service (`app/service.py`): all business logic. Validation, ownership checks,
   and domain rules live here and ONLY here. Calls the store for persistence.
3. Store (`app/store.py`): the only module that touches persistence. Deals in
   plain row dicts, never domain objects. Raises `RecordMissing` on a miss; the
   service layer translates that into the domain `TaskNotFound`.

## Rule

- Validation and ownership belong in the service layer. A new field validation
  (e.g. a length cap) goes in `app/service.py`, never in a handler or the store.
- Handlers never import or call the store directly.
- The store never imports the service or raises domain exceptions.
