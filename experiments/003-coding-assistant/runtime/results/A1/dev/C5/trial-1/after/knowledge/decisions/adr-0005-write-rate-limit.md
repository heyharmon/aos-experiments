---
type: ADR
name: Write Rate Limit: 100 req/min per owner
status: accepted
created: 2026-06-16
updated: 2026-06-16
tags: [decisions]
---

# ADR-0005: Write Rate Limit: 100 req/min per owner

## Status

Accepted

## Context

Unconstrained write throughput per owner creates risk of runaway clients saturating the service and degrading other tenants. The team agreed a per-owner cap is needed at the service layer.

## Decision

Rate-limit writes to 100 requests per minute per owner, enforced in the service layer (not at the HTTP gateway or database).

## Consequences

- Clients that burst above 100 writes/min will receive rate-limit errors (HTTP 429 or equivalent).
- Enforcement in the service layer means the limit applies regardless of which HTTP handler or internal caller triggers the write.
- The limit may need tuning once real traffic patterns are observed; revisit if legitimate use cases routinely hit it.
