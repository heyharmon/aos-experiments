---
type: kit
name: kebab-case-id
title: "Human Readable Title"
description: "One line: the system this assembles and who it's for."
stage: 1
provides: system:<name>
requires: []                  # the brain + agent(s) (+ tools) it bundles
pairs-with: []
stack: []                     # headline tech across the bundle
---

# {{Title}}

> One-paragraph pitch: the whole system in its smallest useful form, and why you'd grab it.

## Yields

The working system you end up with, and the stage it reaches (`AGENT_ARCHITECTURE.md §12`).

## Prerequisites

- **Runtimes:** anything the bundled recipes need.
- **Accounts:** anything external.

## Ingredients

A kit is a combination, not a new stack. It bundles:

| Part | Recipe | Reaches |
|---|---|---|
| The foundation | [`brains/…`](../brains/….md) | Stage 0 |
| The agent(s) | [`agents/…`](../agents/….md) | Stage 1 |

## Steps

Follow each recipe in order, then prove they work together.

1. **Build the brain.** Follow its recipe to *Doneness*.
2. **Hire the agent(s).** Follow each recipe to *Doneness*.
3. **Smoke-test end to end** (below).

## Doneness

The round trip that proves the parts work *together*.

- [ ] …

## Substitutions

Inherit the substitutions from each component recipe; swap either side without touching the other.
