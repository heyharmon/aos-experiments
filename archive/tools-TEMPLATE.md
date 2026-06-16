---
type: tool-recipe
name: kebab-case-id            # the implementation / service, e.g. gmail, dataforseo
title: "Human Readable Title"
description: "One line: what external capability this gives an agent."
provides: tool:<capability>    # the capability, e.g. tool:email; many impls can provide one (gmail, outlook)
requires: []                   # the wiring is standalone; the registry + grants need a brain (pairs-with)
pairs-with: []                 # brains that hold the registry + grants, agents that use this
stack: []                      # headline tech, e.g. [cli, oauth] or [bash, curl, api-key]
---

# {{Title}}

> One-paragraph pitch: which capability/service this gives an agent, and why you'd add it. Plain language. See `TOOLS.md` for the model this fills in.

## Yields

A reusable **`tool:<capability>`**: the wiring (with the runner), one or more **accounts** (credentials in the secret manager, by handle), and **consequence-tagged actions** a granted role can take. Consumed by an agent via `requires: [tool:<capability>]`.

How this maps to the three layers (`TOOLS.md §1`):

| Layer | This tool |
|---|---|
| **Tool** | this recipe: the capability + its wiring |
| **Account** | a credentialed instance (one inbox, one key). 1..N |
| **Grant** | a role bound to an account + an action subset |

## Direction

**Outbound** (actions the agent calls) / **Inbound** (events that wake an agent) / **Both**. If inbound, name the **routing rule** (one owner per event) and exactly-once handling.

## Method

Both knobs are recipe choices (`TOOLS.md §3`); state yours.

- **Reach:** CLI (default) / MCP / API / bash.
- **Data strategy:** live calls (default) or local materialization (a cache in the runtime area, for intense queries; `TOOLS.md §5`).

Build for the power user, and for token efficiency under intense use (`TOOLS.md §4`).

## Actions it exposes

Granted per-role as a subset (least-privilege). Tag each by consequence (`AGENT_ARCHITECTURE.md` inv. #6).

| Action | Direction | Consequence |
|---|---|---|
| … (e.g. search/read) | outbound | reversible |
| … (e.g. send/create/delete) | outbound | consequential |

## Accounts & grants

- **Account count is a deployment choice, not a recipe change** (`TOOLS.md §1`): shared = one account, many grants; separate = one account each.
- **Handles, not secrets, in the brain.** Record each account by handle in `knowledge/tools/<name>/`; the credential lives in the secret manager keyed by that handle.
- **Least-privilege grants.** A read-only role gets read actions; only the role that should act gets the consequential ones.

> **Shared-account caution.** Two roles on one mutable resource can collide. Add a claim (`runtime/`) before acting, or route inbound so each item has one owner (`TOOLS.md §7`).

## Prerequisites

- **Accounts / keys:** the external account(s) and credentials.
- **Runtimes:** the CLI, SDK, MCP server, or HTTP client the wiring needs.

## Ingredients

One pinned path; alternatives go in *Substitutions*.

| Component | Choice | Why this one |
|---|---|---|
| Reach | CLI / MCP / API / bash | how the actions call out |
| Auth | OAuth / API key / token | where the secret lives, how it refreshes |
| Data strategy | live / materialized | matches the query load |

## Steps

1. **Wire the reach** (with the runner): install and configure the CLI / MCP server / client.
2. **Store the credential** in the secret manager; record the account **handle(s)** in `knowledge/tools/<name>/`.
3. **Define the actions** with consequence tags (the table above).
4. **Grant to a role:** add the account handle + action subset to the consuming agent's role.
5. **Wire inbound / a cache** if the recipe uses them.

## Doneness

- [ ] A granted agent runs a **reversible** action (e.g. read) and gets real data.
- [ ] A **consequential** action (e.g. send) is gated by the role's authority and escalates (`§8`–`§9`).
- [ ] The credential is in the secret manager, not the brain or harness.
- [ ] The account handle(s) appear in `knowledge/tools/<name>/`; no credentials there.
- [ ] (Inbound) one event wakes the right agent, exactly once.

## Pairs with

The agents that use this tool (`requires: [tool:<capability>]`) and the brain that holds its registry and grants.

## Substitutions

| Instead of… | Use… | When |
|---|---|---|
| CLI | MCP server / direct API / bash | the runner favors it, or no CLI exists |
| live calls | a local cache (SQLite) in `runtime/` | intense or repeated queries (`TOOLS.md §5`) |
| single account | multiple accounts (per identity) | senders/identities must differ |
| shared account | per-role accounts | roles must not collide |
