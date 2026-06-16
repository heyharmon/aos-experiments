---
type: brain-recipe
name: kebab-case-id
title: "Human Readable Title"
description: "One line: what this brain build gives you."
stage: 0
provides: brain
requires: []                  # a brain needs no prior recipe
pairs-with: []                # agents commonly run on it
stack: []                     # e.g. [markdown, python, ripgrep]
---

# {{Title}}

> One-paragraph pitch: what you'll build and why you'd want it.

## Yields

What you end up with, and the stage it reaches (`AGENT_ARCHITECTURE.md §12`).

## Prerequisites

- **Accounts / keys:** anything external.
- **Runtimes:** languages, CLIs, tools to install.

## Ingredients

The pinned stack. One choice per row; alternatives go in *Substitutions*.

| Component | Choice | Why this one |
|---|---|---|
| Storage | … | … |
| Write contract | … | … |
| Retrieval | … | … |

## Steps

Ordered, concrete enough for a coding agent to execute cold.

1. …
2. …

## Doneness

Checkable, not vibes. These become the first evals (`AGENT_ARCHITECTURE.md §10`).

- [ ] …

## Pairs with

Agents that run on this brain.

## Substitutions

| Instead of… | Use… | When |
|---|---|---|
| … | … | … |
