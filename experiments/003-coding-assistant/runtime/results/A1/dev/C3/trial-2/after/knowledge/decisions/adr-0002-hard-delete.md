---
type: Decision
name: ADR 0002 Hard Delete
created: 2026-02-22
updated: 2026-02-22
tags: [decision, adr, data]
status: accepted
---

# ADR 0002: Hard Delete

Task deletion is a hard delete. Soft-delete (a `deleted_at` tombstone) was
considered and rejected: Tasklet keeps no history and a deleted task is gone.

`DELETE /tasks/<id>` removes the row and returns 204. `delete_task` in the
service layer checks ownership first, then calls `store.delete`.
