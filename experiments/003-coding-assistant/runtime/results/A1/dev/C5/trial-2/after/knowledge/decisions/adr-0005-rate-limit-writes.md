---
type: Decision
name: ADR 0005 Rate-Limit Writes
created: 2026-06-16
updated: 2026-06-16
tags: [decision, adr, rate-limiting]
status: accepted
---

# ADR 0005: Rate-Limit Writes per Owner

## Decision

Write operations are rate-limited to 100 requests/minute per owner, enforced in the service layer.

## Context

Agreed in team standup. Unbounded write throughput per owner risks resource exhaustion and uneven load distribution across tenants.

## Consequences

- The service layer (not the HTTP router or the data layer) is the single enforcement point.
- Callers exceeding the limit receive an error response; partial batches are not silently truncated.
- The limit applies per owner identity, not per IP or per session.
