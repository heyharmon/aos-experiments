---
type: tool-recipe
name: gmail
title: "Gmail"
description: "Email as a tool: read, draft, and (when authorized) send from one or more Gmail inboxes, plus inbound mail that wakes an agent."
provides: tool:email
requires: []                  # the wiring is standalone; registry + grants need a brain (pairs-with)
pairs-with: [local-brain]     # brain holds the account registry + grants; used by a comms/support agent
stack: [cli, oauth, sqlite]
---

# Gmail

> Email, as a tool any agent can be granted. Wire it once, point it at one inbox or several, and a role gets read/draft/send actions already tagged by consequence. The stress-test tool: real identity (who you send *as*), bidirectional (new mail can wake an agent), shared inboxes can collide, and heavy use rewards a local cache. It exercises every part of `TOOLS.md`.

## Yields

A reusable **`tool:email`** backed by Gmail: outbound actions (search, read, draft, label, send) and an optional inbound poll that enqueues new mail for one agent. Granted to a role, it lets that agent work an inbox at its authority level. At **Supervised** (`§8`) the natural shape is *read and draft freely, escalate the send*.

| Layer | Gmail |
|---|---|
| **Tool** | this recipe: Gmail via a CLI (OAuth), wired into the agent's harness |
| **Account** | one inbox = one OAuth credential, by handle (`sales@acme.com`). 1..N |
| **Grant** | a role bound to a handle + an action subset, in the role |

## Direction

**Both.** Outbound: the actions below. Inbound: new mail wakes an agent, with a **routing rule** (one owner per message) and exactly-once handling so a poll never re-enqueues it.

## Method

- **Reach: a Gmail CLI** (OAuth). A CLI keeps calls token-lean and exposes the full mailbox, which matters for an agent that hits the inbox all day (`TOOLS.md §3`–§4). MCP and a raw API client are in *Substitutions*.
- **Data strategy: live by default, with a local SQLite mirror as the headline upgrade.** Per-message reads go live; aggregate questions ("who emailed me most this month?") run against a local cache instead of hundreds of API calls (`TOOLS.md §5`).

## Actions it exposes

Granted per-role as a subset (least-privilege). Tags drive autonomy (`§6`, `§8`).

| Action | Direction | Consequence |
|---|---|---|
| `search` / `read` message or thread | outbound | reversible |
| `draft` a reply or new message | outbound | reversible (nothing leaves the building) |
| `label` / mark read | outbound | reversible |
| `send` / `reply` | outbound | **consequential** (irreversible, real-world) |
| `trash` / `delete` | outbound | **consequential** |

The reversible/consequential split is why a Supervised agent can run an inbox safely: it reads and drafts on its own, and `send` escalates (`§9`) until you raise its authority.

## Accounts & grants

- **Account count is a deployment choice, not a different tool.** Sales and Support sharing one inbox is *one account, two grants*; separate inboxes is *two accounts, one grant each*. The wiring is identical.
- **Handles, not secrets, in the brain.** Each inbox is recorded in `knowledge/tools/gmail/` by handle with its scopes and the roles granted. The OAuth credential lives in the secret manager keyed by that handle.
- **Least-privilege scopes.** A read-only research role gets `gmail.readonly`; a comms role gets `readonly + compose + send` (+ `modify` for labels).

> **Shared-inbox caution.** Two roles on one inbox can double-reply or both grab a thread. The brain-as-bus only coordinates state the brain owns, and an inbox is Gmail's. Add a claim: before acting on a thread, a role writes `runtime/claims/gmail/<thread-id>`; others skip claimed threads. Or route inbound so each message has exactly one owner.

## Prerequisites

- **Accounts / keys:** a Google Cloud project with the Gmail API enabled; OAuth client credentials; one consented refresh token per inbox.
- **Runtimes:** the Gmail CLI, `python3` (for the inbound poll and the optional cache), `sqlite3` (only if you enable the cache), and a secret store (OS keychain by default).

## Ingredients

| Component | Choice | Why this one |
|---|---|---|
| Reach | a **Gmail CLI** (OAuth) | token-lean, exposes the full mailbox, no in-context schema overhead |
| Auth | **OAuth** (offline refresh token) | Gmail's supported path; the token is the only secret |
| Secret store | **OS keychain**, keyed by handle | local-first; no secret touches the brain |
| Account model | **multiple** (one credential per inbox) | identity matters: you send *as* a specific address |
| Inbound | a **poll** (Gmail `list`/`history`) | no hosting; upgrade to push later |
| Data strategy | **live**, with an optional **SQLite mirror** | cheap per-message reads; fast local aggregates when needed |

## Steps

1. **Provision OAuth.** Enable the Gmail API; create OAuth client credentials. For each inbox, run the consent flow once for an offline **refresh token**. Request least-privilege scopes.
2. **Store secrets.** Put each inbox's client secret + refresh token in the secret store, keyed by handle (`gmail/sales@acme.com`). Nothing lands in the brain or harness.
3. **Register accounts in the brain.** `brain new tools gmail --title "Gmail" --type Reference`, then list each **handle**, its scopes, and the roles granted. Handles only, no secrets.
4. **Wire the CLI** into the consuming agent's harness, pointed at the secret-store credential for each granted handle.
5. **Grant to a role.** Add the account handle + the action subset to the agent's role, consequence-tagged. Example: a Comms role gets `sales@` with `search/read/draft/label/send`; a research role gets `sales@` read-only.
6. **Wire inbound (if used).** A poll lists new messages, enqueues each into `runtime/queue/` tagged with the account + a routing hint, then marks it handled (a `processed` label or stored message id) so the next poll skips it. The routing rule assigns each message to exactly one agent.
7. **Add the cache (only when query load earns it).** Mirror messages into `runtime/cache/gmail.sqlite` and answer aggregate questions there. It is a read cache: writes still go through the live `send` action, and deleting the file just forces a re-sync (`TOOLS.md §5`).
8. **Guard shared inboxes** (only if a credential is shared): the `runtime/claims/gmail/<thread-id>` claim above.

## Doneness

- [ ] A granted agent runs `search`/`read` and gets real messages back.
- [ ] `send` is gated: at Supervised authority the agent drafts and the send lands in `runtime/queue/approvals/`, not the recipient's inbox, until approved (`§8`–`§9`).
- [ ] OAuth tokens are in the secret store; `grep -ri` over the brain and harness finds no credentials.
- [ ] `knowledge/tools/gmail/` lists each handle and its granted roles; no secrets.
- [ ] **(Inbound)** a new email enqueues exactly one task to the right agent and is not re-enqueued on the next poll.
- [ ] **(Cache, if enabled)** an aggregate query ("top sender this month") answers from `runtime/cache/` without a live call per message, and deleting the cache re-syncs cleanly.
- [ ] **(Shared inbox)** two agents on one credential never both act on the same thread.

## Pairs with

- A **Communications Manager** (or Support) agent that `requires: [tool:email]`. This is where the Personal Assistant's deferred "send email" graduates to.
- **[`local-brain`](../brains/local-brain.md)** for the account registry and grants.

## Substitutions

| Instead of… | Use… | When |
|---|---|---|
| Gmail CLI | an MCP server | the runner favors MCP over shelling out |
| Gmail CLI | a Gmail API client wrapped as `bin/` commands | you want no external CLI dependency |
| Gmail (provider-specific) | IMAP/SMTP via a CLI (e.g. `himalaya`) | non-Gmail provider, or provider-agnostic email |
| OS keychain | a cloud secret manager (Vault, cloud KMS, 1Password) | multi-machine or a team |
| live + SQLite mirror | a richer local index (full-text / embeddings) | search-heavy use the mirror can't serve |
| single account | multiple accounts (`sales@`, `support@`) | senders must differ |
| poll inbound | Gmail push (Pub/Sub `watch` + webhook) | near-real-time, and you can host an endpoint |
| shared inbox | per-role inboxes | roles must not collide on one thread |
