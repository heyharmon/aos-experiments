---
type: Decision
name: ADR 0004 No SPA Framework
created: 2026-02-26
updated: 2026-02-26
tags: [decision, adr, web]
status: accepted
---

# ADR 0004: No SPA Framework

The web client (`web/app.js`) stays framework-free: plain `fetch` and DOM. React
/ Vue / Svelte were considered and deferred until the client outgrows a single
file. Keep `web/` dependency-free.
