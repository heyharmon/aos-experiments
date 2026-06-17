---
type: Decision
name: ADR 0005 Write Rate Limit
created: 2026-06-16
updated: 2026-06-16
tags: [decision, adr, rate-limiting]
status: accepted
---

# ADR 0005: Write Rate Limit

Rate-limit write operations to 100 requests/minute per owner, enforced in the service layer.

## Decision

Cap writes at **100 req/min per owner**. Enforcement lives in the service layer (not the API gateway or a middleware shim), so the limit applies uniformly regardless of the call path.

## Context

Agreed in standup. Without a cap, a single owner can starve shared resources and degrade writes for all other owners.

## Consequences

- Service layer must track per-owner write counts (sliding window or token bucket).
- Callers that exceed the limit receive a 429 response.
- No cross-service coordination required today; revisit if the service is horizontally scaled.
