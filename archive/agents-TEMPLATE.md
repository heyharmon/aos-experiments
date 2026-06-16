---
type: agent-recipe
name: kebab-case-id
title: "Human Readable Title"
description: "One line: what this agent does and for whom."
stage: 1
provides: agent:<name>
requires: [local-brain]       # the brain it runs on (or any that `provides: brain`)
pairs-with: []                # tools it uses, agents that complement it
stack: []                     # e.g. [claude-code, bash, cron]
---

# {{Title}}

> One-paragraph pitch: what you'll hire and why you'd want it.

## Yields

What you end up with, and the stage it reaches (`AGENT_ARCHITECTURE.md §12`). Note its starting authority (`§8`).

## Prerequisites

- **Brain:** which brain recipe must already exist.
- **Tools:** any `tool:<capability>` this agent needs granted (`recipes/tools/`).
- **Accounts / keys:** anything else external.
- **Runtimes:** languages, CLIs, tools to install.

## Ingredients

The pinned stack. One choice per row; alternatives go in *Substitutions*.

| Component | Choice | Why this one |
|---|---|---|
| Provider | … | … |
| Activation | … | … |
| Tools | … | consequence-tagged (`§6`) |

## Steps

Ordered, concrete enough for a coding agent to execute cold.

1. **Write the role** (in the brain): responsibilities, authority level, consequence-tagged tools, escalation rule.
2. **Create the harness** (with the runner): system prompt, loop, tool wiring, model.
3. …

## Doneness

Checkable, not vibes. These become the first evals (`AGENT_ARCHITECTURE.md §10`).

- [ ] …

## Pairs with

Brains it runs on, tools it consumes, agents that complement it.

## Substitutions

| Instead of… | Use… | When |
|---|---|---|
| … | … | … |
