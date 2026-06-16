# Tools: how agents reach beyond the brain

### A technology-agnostic building block: how an agent reads an inbox, sends a message, or queries an external service

**Audience:** the operator wiring a real capability into an agent, and any builder who implements one.
**This is a building block, not a peer.** `AGENT_ARCHITECTURE.md` (the system) and `BRAIN_ARCHITECTURE.md` (the foundation) are the two constitutions. This doc describes one part agents use. It adds no plane and no invariant (`§9`); it names the building block and the beliefs for building a good one.

---

## 0. What a tool is

A **tool** is what an agent uses to reach a capability or external service: Gmail, DataForSEO, web search, the brain's own CLI. Human-sized, on purpose: "my agent needs gmail," "we do keyword research, so the agent needs dataforseo."

Each tool offers **actions** the agent can take (Gmail: search, read, draft, send). **Every action carries a consequence tag** (`AGENT_ARCHITECTURE.md` inv. #6): reversible (read, draft) or consequential (send, delete). That tag is the whole hook into governance: a **Supervised** agent (`§8`) runs reversible actions on its own and **escalates** the consequential ones (`§9`). Tools change *what* an agent can do; the consequence tag keeps *how much it may do on its own* a dial you control.

---

## 1. Three layers: tool, account, grant

A tool separates into three things. How many collapse is what makes one clean and another fiddly.

| Layer | What it is | Where it lives |
|---|---|---|
| **Tool** | the capability + its wiring (a tool recipe) | with the runner |
| **Account** | a credentialed instance: one inbox, one API key. 1..N per tool | secret in the secret manager; **handle** in a `knowledge/` registry |
| **Grant** | a role bound to an account + an allowed action subset | the role |

A read-only key service (DataForSEO: one key, no identity) collapses all three: tool = account = grant. An identity-bearing service (Gmail, where you send *as* sales@ vs support@) keeps them apart. **Account count is a deployment choice, not a different tool:** a shared inbox is one account with two grants; separate inboxes are two accounts with one grant each. The wiring is identical.

---

## 2. Direction

- **Outbound:** actions the agent calls (Work plane). Most tools.
- **Inbound:** events that wake an agent (Activation plane). Needs a **routing rule** (each event has exactly one owner) and **exactly-once** handling.
- **Both:** e.g. email (read/send out, new-mail-wakes-a-loop in).

---

## 3. The method is modular

Like an agent or a brain, a tool has a **durable capability** and a **swappable build**. Two knobs, both agnostic at this altitude and pinned only in the recipe:

- **Reach:** CLI / MCP / API / raw bash.
- **Data strategy:** live calls, or local materialization (§5).

**Default lean for a CLI-driven runner: CLI-first.** A CLI is token-lean (the agent runs a command and gets compact stdout, where MCP carries tool schemas and verbose results in-context) and a good CLI exposes the service's full power instead of a lowest-common-denominator subset. Not dogma: MCP is more portable across runners, an API client suits a long-running service. The architecture stays agnostic; the recipe picks, and lists the rest under Substitutions.

---

## 4. Two principles for a good tool

1. **Build for the power user.** Expose the real capability and stress-test it. No toy subset that falls over under heavy or adversarial use.
2. **Token-efficient under intense use.** Optimize the hundredth call, not the first: compact I/O (favoring CLI), and materialize data locally when the query load justifies it. This is measurable against the run-ledger's cost record (`AGENT_ARCHITECTURE.md` inv. #5).

These are design beliefs for the *build*, not new rules. The contract stays: consequence-tagged actions, secrets out of the brain, granted to a role.

---

## 5. Local materialization (the cache)

For intense or repeated queries ("who emailed me most this month?"), a tool can **sync external data into a local store** (e.g. SQLite) and query it locally, instead of many slow remote round-trips. The rules that keep it honest:

- It lives in the **runtime area / with the runner**, never `knowledge/`. It is regenerable, not curated truth (`BRAIN_ARCHITECTURE.md §5`).
- The **external service stays source of truth**; the cache is a read cache; **writes still go remote and stay consequential**.
- It is an **earned upgrade, not the base.** This is "retrieval is earned complexity" (`BRAIN_ARCHITECTURE.md` inv. #6) applied to tools: the thin live reach is the default; you materialize when the query load demands it, not by reflex. Otherwise every tool bloats into a sync engine.

---

## 6. Where the pieces live

One home per fact, consistent with the brain's two-area split and the secrets rule.

| Piece | Home |
|---|---|
| Tool wiring (CLI/MCP/API) | with the runner (harness) |
| Credential | the **secret manager**, never the brain (`BRAIN_ARCHITECTURE.md` inv. #8) |
| Account handle + which roles may use it | a `knowledge/` registry (handles only, no secrets) |
| The grant (account + action subset) | the role |
| Local cache | the runtime area (regenerable) |

---

## 7. Shared external state

Brain-as-bus coordinates only the state the **brain owns**. An inbox, a CRM record, a calendar belongs to the service, so two agents sharing one account can collide (double-reply, double-book). Guard it: a role **claims** the thread/record in `runtime/` before acting and others skip what is claimed, or route inbound so each item has exactly one owner and the question never arises.

---

## 8. What this does not add

No new plane, no new invariant. A tool is a Work-plane (and sometimes Activation-plane) capability that rides entirely on mechanics already fixed: consequence tags (inv. #6), autonomy (`§8`), escalation (`§9`), secrets (`BRAIN_ARCHITECTURE.md` inv. #8), and the runtime area. Naming the building block and its design beliefs is all this doc does; the two constitutions are untouched.

---

## Recipes

Tool recipes live in `recipes/tools/`, one per service. Each `provides: tool:<capability>` (e.g. `tool:email`), and an agent recipe consumes it with `requires: [tool:<capability>]`. The capability is the durable interface (any email tool satisfies `tool:email`); the recipe name is the familiar service (`gmail`). The template is `recipes/tools/TEMPLATE.md`.

---

*In one line: a tool is what an agent uses to reach the outside world, exposing consequence-tagged actions, built for power users and token efficiency, with its credential in the secret manager and nothing new added to the constitution.*
