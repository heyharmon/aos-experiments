---
type: Decision
name: ADR 0005 Write Rate Limit Per Owner
created: 2026-06-16
updated: 2026-06-16
tags: [decision, adr, api, rate-limit]
status: accepted
---

# ADR 0005: Write Rate Limit Per Owner

Write operations are rate-limited to 100 requests/minute per owner, enforced in
the service layer.

## Decision

Cap all mutating API calls (create, update, delete) at 100 req/min scoped to the
authenticated owner. The limit is applied inside the service layer, not at the
HTTP handler or network edge, so it covers all write paths uniformly.

## Rationale

Agreed in team standup. Prevents runaway clients from exhausting the in-memory
store and keeps per-owner fairness without a separate infrastructure component.

## Consequences

- Service layer must track per-owner write counts in a rolling window.
- Exceeding the limit returns 429 with a `Retry-After` header.
- Reads are not rate-limited under this decision.
