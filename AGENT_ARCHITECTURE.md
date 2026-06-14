# An Architecture for Agentic Work

### A technology-agnostic vision for organizing AI work by **roles** — from a single agent to a whole-business system

**Audience:** the operator who wants AI to do real work across their day, and any builder (in any stack) who will implement it.
**Companion document:** [`BRAIN_BRIEF.md`](./BRAIN_BRIEF.md) details the **Context plane** (the brain) referenced throughout. This document describes the *system around the brain* — how work is organized, run, observed, governed, and improved.

---

## 0. What this is, and what it is not

This is a **vision and a set of invariants**, not an implementation. It names the parts, says what each is responsible for, and fixes the rules that hold them together — and deliberately says nothing about which language, model harness, database, or SaaS you use.

That is the point. Two people should be able to read this and build compliant systems that share no code:

- Person A: Claude Code + Python + local SQLite + cron on a Mac mini.
- Person B: Codex + Node.js + Postgres + a hosted scheduler and queue.

Both are "correct" if they honor the invariants in §3. **The architecture is the contract; the technology is a fill-in-the-blank.**

A second, equally important kind of restraint runs through this document:

> **It is opinionated about *mechanism* and agnostic about *policy*.**

The architecture is firm about *what capabilities must exist and how they are wired* (mechanism). It is silent about *the settings you choose* (policy) — most importantly **how much autonomy** you grant and **which surfaces** you use to interact. Those depend on your taste, your risk appetite, and the maturity of the work. The architecture's job is to make those choices legible and safe to change — not to make them for you.

**Read it as a compass, not a checklist.** Start with one role. Add capability only when the work demands it.

---

## 1. The three core ideas

Everything in this document descends from three ideas. Hold these and the rest is elaboration.

### 1.1 The brain is the bus. Agents are disposable.

All durable state — context, work to do, what was done, how well it went, how to improve — lives in **one substrate: the brain** (files in a git repo, per `BRAIN_BRIEF.md`). Agents never call each other. They coordinate *only* by reading and writing the brain.

This single rule keeps the system simple at one agent and still simple at fifty:

- **Agents are stateless and replaceable.** Kill one, restart it, rewrite it in another language, swap the model — nothing is lost, because the agent held nothing. The brain held everything.
- **Coordination needs no special machinery.** No message bus, no service mesh, no orchestration server. "Agent A tells Agent B something" is just "Agent A writes a file Agent B reads."
- **The whole system is inspectable.** Its entire state is human-readable files under version control. You can understand it at any time by reading it.

### 1.2 Roles are the unit of understanding

How we organize agentic work has progressed with one underlying driver: **the task horizon a model can sustain on its own.** Each generation reliably handles a longer, more complex task than the last — and every jump unlocks a new way of organizing the work:

| As models sustain longer tasks… | A representative task | We organize the work as… |
|---|---|---|
| **seconds** — a single answer | answer a question | a **prompt** |
| **a session** — a dialogue | draft, brainstorm, look something up | a **chatbot / assistant** |
| **minutes to hours** — a task loop | write & test a component; debug a flaky test suite | an **agent** |
| **days, then continuous** | clear the backlog overnight; run a pipeline end-to-end | a **role** *(a.k.a. "virtual employee")* |

The left column is the engine. A **prompt** is all you can organize around when a model holds the thread for seconds; a **role** only becomes viable once the horizon stretches from *finishing a task* to *holding ongoing responsibility across many tasks*. That threshold is the one we're crossing now — which is why roles, not tasks, are the right unit to build around: the work we hand AI has outgrown any single task. Organizing around the ephemeral task — what most multi-agent systems still do, spawning an agent per job — leaves that new capability on the table; organizing around a durable, accountable owner captures it.

A **role** is a contract of **responsibility + authority** — "Communications Manager," "Product Development Lead," "Scheduler." It is the abstraction that **encapsulates the technical machinery**: a role wraps a set of schedules, loops, skills, prompts, tools, and training into one thing you can name, reason about, and relate to other roles. Just as a function signature hides its body and a domain hides its tables, **a role hides its agents.**

**The virtual employee is the *role*, not the agent.** This cuts against the common convention — people say "my research agent," "my coding agent," as if the agent were the employee — but here the durable, accountable unit is deliberately the role. The reason is the one property that makes an employee an employee: *continuity.* A real employee persists — they carry memory, relationships, and accumulated skill, and the org backfills them when they leave. This architecture's agents are the exact opposite by design: stateless, disposable, kill-and-replace, holding nothing between runs (invariant #3). So the agent is the one component you should *not* map onto "person" — it lacks the continuity that defines one. The agent is a **pair of hands** the role uses to get a shift of work done; the role is the seat that persists across them. That is precisely why the agent *can* be disposable — its memory and desk live in the brain, not in the agent.

This matters because humanity already spent centuries building the "role" abstraction to make large-scale coordinated work legible — the org chart. Adopting it gives the whole architecture a vocabulary you already have intuitions for (see §2): every employee-like action — hiring, performance review, coaching, promotion, reorg — attaches to the role.

### 1.3 Opinionated about mechanism, agnostic about policy

Stated in §0; repeated here because it is load-bearing. The two places it bites hardest are **autonomy** (§8) and **human interaction surfaces** (§9). In both, the architecture supplies primitives and a way to reason about the choice — and refuses to crown one setting as correct.

---

## 2. Roles: the operator's view of the system

The architecture has **two complementary views**:

- **The builder's view — planes (§4).** How capability is decomposed for implementation: context, work, activation, telemetry, learning, interface.
- **The operator's view — roles.** How the running system is understood and managed: an org of accountable roles.

Roles are what make the system *relatable*. Everything technical contextualizes into something you already know how to think about:

| Architecture concept | Role / org vocabulary |
|---|---|
| a role's domain | its area of responsibility |
| autonomy level | its authority / seniority |
| schedules, loops, skills, prompts | *how it does the job* — its internals |
| the run-ledger (§6) | activity reporting |
| evaluation (§10) | performance review |
| the improvement loop (§11) | coaching, training, promotion |
| human intervention (§9) | a manager stepping in |
| adding a role | hiring |
| splitting/merging roles | reorg |

Three guardrails keep this abstraction honest:

1. **A role is a responsibility contract, not a persona.** Its popular name — "virtual employee" — is convenient, but treat a role as a *position*, not a *person*: the value is *what it is accountable for and what it may do*, not a name and a personality. Personifying the *agents* ("Sam from Comms") is the worse error — the agent is a disposable pair of hands, not a colleague — and it invites the misplaced trust a stateless work-session hasn't earned. Keep roles structural and agents anonymous.
2. **A role is not one-to-one with an agent.** A role is the unit of *understanding*; an agent is a unit of *execution* — a single shift of bounded work, not a little employee in its own right. A role may be staffed by several agents, loops, and skills — just as a human job is done with many tools and routines. The role is the interface; the agents are the implementation.
3. **Roles coordinate brain-as-bus.** Employees don't read each other's minds; they coordinate through shared systems and documents. Roles inherit §1.1 unchanged.

**Taxonomy is not fixed.** Start with one role. Split a role when its charter is trying to be good at two different jobs at once. Merge two when they never act without each other. The org serves the work.

---

## 3. The invariants (the constitution)

An implementation is compliant if and only if it honors these. Everything else is free.

1. **One substrate.** All durable state lives in the brain. If it isn't in the brain, it doesn't survive a restart and doesn't exist to the rest of the system.
2. **The brain is the bus.** No direct agent-to-agent calls. Agents coordinate exclusively through the brain. Coupling stays at zero.
3. **Agents are disposable.** Any agent may be killed or replaced at any time with no loss of state and no coordination required.
4. **Every capability rolls up to a role.** No orphan automation. Every schedule, loop, and skill is owned by a named, accountable role, so responsibility is always legible.
5. **Every run is recorded.** No agent does work without writing a run record (who, when, why, what it touched, tokens, cost, outcome). Observability is not optional and not bolted on later.
6. **Every action declares its consequence.** Each action a role can take is tagged by reversibility/impact. This tag is the raw material of autonomy (§8) — mechanism, not policy.
7. **Intervention is always possible, and always captured as feedback.** The human can always step in; whenever they do, that event is recorded as a labeled example (§11). *That* intervention exists and is captured is mechanism; *which surface* it happens through is policy (§9).
8. **Opinionated about mechanism, agnostic about policy.** The architecture fixes capabilities and wiring; the operator chooses settings — autonomy levels and interaction surfaces above all.
9. **Degrade gracefully.** With the queue, telemetry, and tooling all deleted, the brain must still be a useful pile of markdown a human can read. Tooling is a convenience over the substrate, never a dependency of it.
10. **Simplicity is the tiebreaker.** When two designs both work, choose the one you can still explain in six months. Complexity must pay rent in present value, not anticipated need.

---

## 4. The architecture at a glance (the builder's view)

Six **planes**, each a thin layer over the same brain. You adopt them in order; each is independently useful. Roles live in the Work plane; the management lens (§2) reinterprets the rest.

```
   YOU
    │   drive · oversee · observe
    ▼
  ┌─────────────────────────────────────────────┐
  │  ROLES                                       │
  │  Comms · Tasks · Scheduler · Product-Dev · … │
  │  each staffed by agents, loops & skills      │
  └─────────────────────────────────────────────┘
    │   read · write
    ▼
  ┌─────────────────────────────────────────────┐
  │  THE BRAIN — the bus                         │
  │  every durable thing lives here              │
  └─────────────────────────────────────────────┘
```

The spine is just three layers: **you** drive/oversee/observe, **roles** do the work, and **the brain** is the only thing they share. The six planes below are how a *builder* decomposes that spine — the diagram is the *operator's* view.

| Plane | Responsibility | Stored as | Adopt when |
|---|---|---|---|
| **Context** | Single source of truth | brain files (`BRAIN_BRIEF.md`) | Day one |
| **Work** | Roles that own outcomes, staffed by agents | role-charters + a work queue | Day one (one role) |
| **Activation** | What wakes agents — loops, events, dreaming | schedule/trigger config | When you want hands-off running |
| **Telemetry** | A record of every run: tokens, cost, actions, outcome | append-only run-ledger | As soon as you have >1 loop |
| **Learning** | Review roles; turn feedback into improvement | eval-results + feedback files | Once a role does steady work |
| **Interface** | How you drive, oversee, and observe | surfaces you choose (§9) | As soon as roles act on their own |

---

## 5. Anatomy of a role (and the agents that staff it)

A **role** is the unit of work and the unit of understanding. It is defined entirely by files in the brain, so it stays inspectable and improvable.

**A role is defined by:**

| Part | What it is | Why it lives in the brain |
|---|---|---|
| **Charter** | Its responsibilities, scope, and **authority level** (§8) — a `CLAUDE.md`-style policy file | So improvement and promotion are diffs to this file (§11) |
| **Staff** | The agents, loops, and skills that execute the work | So capability is explicit and owned, never orphaned (invariant #4) |
| **Tools** | The actions its staff may take, each tagged by consequence (#6) | So autonomy is governed by data, not buried in code |
| **Schedule** | When its agents wake (§7) | So activation is inspectable config |
| **Reporting** | Its run records, scorecard, and digest contributions | So the role is observable and reviewable like an employee |

Memory is conspicuously absent: a role keeps **no state of its own** — it borrows the brain. That is what keeps agents disposable.

**An agent — the execution unit that staffs a role — is best read as a single *shift of work*, a pair of hands the role puts to a task, not a miniature employee. It is anything that:**
1. **Wakes** on a trigger (a schedule, an event, or you).
2. **Reads** the brain to load only the context its task needs.
3. **Does bounded work** using its role's tools, against its role's charter.
4. **Writes back** results to the brain — and always a **run record** (#5).
5. **Stops.** It holds no state between runs.

The shift ends and the hands are gone; the role — the durable, accountable seat — persists, and the next shift reloads everything it needs from the brain. That is the whole reason an agent can be thrown away without loss: it never *was* the employee.

That contract is satisfied equally by a Claude Code session, a Codex script, a cron'd Python process, or a hosted function. **Why roles get multiple agents rather than one do-everything agent:** smaller context, sharper charters, independent schedules, independent review, and independent failure. A bug in the Communications role never touches Product Development. You add a specialist — a new agent or a new role — only when the work earns it.

---

## 6. Activation: loops and dreaming

A role does work without you because something **wakes** its agents. Three trigger types, in increasing sophistication — most systems only ever need the first.

1. **Heartbeat loops (the default).** An agent wakes on a schedule and asks, "what's new in my area, and what should I do about it?" — read new email, triage new bug reports, reconcile the calendar. Cadence matches the role: comms hourly, product-dev a few times a day, billing weekly. A loop is just *trigger → read brain → bounded work → write back → stop*.

2. **Event triggers (optional).** A webhook or watcher wakes an agent on a specific event (a deploy finished, a high-priority ticket opened) instead of waiting for the next tick. Use only where latency genuinely matters; otherwise a slightly faster heartbeat is simpler and has fewer moving parts.

3. **Dreaming (the nightly consolidation).** One agent runs when the day is quiet and does the work that belongs to no single role: read everything new in the brain, organize and file it, reconcile contradictions, surface cross-role patterns, prune and link, and prepare tomorrow's digest. This is the nightly ingestion/triage job in `BRAIN_BRIEF.md §7`, generalized — and the natural home for the improvement pass (§11).

> **Loops react. Dreaming reflects.** A system with only loops is busy but never gets smarter. Dreaming turns a day of activity into organized knowledge and a better system tomorrow.

---

## 7. Telemetry: knowing where the work and the tokens go

Invariant #5 says every run writes a record. The **run-ledger** is the append-only collection of those records — *just more files in the brain*, so you get observability without a separate monitoring stack. In role terms, this is each role's **activity report.**

**Every run record carries, at minimum:**

```yaml
role:         communications-manager
agent:        comms-triage
run_id:       2026-06-14T09:00:03Z-comms
trigger:      heartbeat            # heartbeat | event | manual
started:      2026-06-14T09:00:03Z
duration_s:   42
tokens_in:    18204
tokens_out:   3110
cost_usd:     0.21
actions:      [read_inbox, drafted_reply:3, filed_to_brain:2]
escalated:    1
outcome:      ok                   # ok | partial | failed | needs_human
notes:        "1 reply escalated: contract question from Acme"
```

From this one stream you get:

- **Where tokens and money go**, rolled up by role and by day — the biggest spenders become obvious.
- **A high-level activity view** of what every role did, without reading transcripts.
- **Debuggability** — a bad outcome links straight to the run that caused it.
- **The denominator for evaluation** — you can't measure work-done-per-dollar without recording the dollar.

Two rules keep it honest: the record is written by the harness around the agent, not by the agent's own say-so (so it can't be flattered); and it is append-only (runs are history, never edited).

---

## 8. Autonomy: a dial, not a default

This is where "agnostic about policy" matters most. **How much autonomy a role has is a choice — your taste, your risk appetite, the maturity of the work — not something the architecture decides.** Reframed through roles, the question becomes one every manager already knows how to answer: **what authority does this role have?**

### The dial

The architecture treats autonomy as a continuous dial and presents **every position as legitimate:**

| Setting | The role… | Like a… |
|---|---|---|
| **Advisory** | only proposes; you execute everything | intern drafting for your signature |
| **Supervised** | acts on reversible work; gates consequential actions | new hire whose big moves you check |
| **Delegated** | acts; escalates only genuine judgment calls | trusted employee with periodic 1:1s |
| **Autonomous** | acts within policy; you review outcomes, not actions | senior leader you set objectives for |

### The mechanism (fixed) vs. the policy (yours)

**Mechanism the architecture guarantees:**
- every action carries a **consequence tag** (#6);
- every role carries an **authority level** in its charter;
- the rule that runs everywhere: **an action proceeds when the role's authority covers its consequence; otherwise it escalates** (§9);
- **reversibility and audit** (the run-ledger, git history) so that acting-then-reviewing is safe;
- **graduated trust**: authority can rise as a role's evals prove it out (§10–11) — promotion with evidence, not by vibe.

**Policy you set, per role, and revise over time:** where each role sits on the dial; which of its actions count as consequential; how high the escalation bar is.

### A deliberate design bias

The architecture refuses to *mandate* high autonomy — but it is **built to make raising autonomy cheap and safe.** This encodes a belief without imposing it:

> The value ceiling of an agentic system scales with how much work it can do *without* a human in the critical path. A system held at low autonomy is capped at human throughput — it can never do the massive volume of work that is the entire reason to build it. So the architecture is designed so that the natural gradient is *upward*: as a role earns trust, moving it up the dial should be a small, reversible, well-instrumented change.

You are free to keep any role at Advisory forever. The architecture simply ensures that when you *want* to delegate more, nothing structural is in your way.

---

## 9. The human surfaces: drive, oversee, observe

The other place policy dominates. A common mistake — and the one baked into "just use an approval queue" — is to assume a single surface for all human↔system interaction. There are really **three distinct surfaces**, and they need not be the same thing:

| Surface | What you're doing | Example mechanisms |
|---|---|---|
| **Drive** | initiating work; setting objectives and guardrails | a chat front-desk, creating a task, editing a charter |
| **Oversee** | steering, correcting, or approving *ongoing* autonomous work | approval queue, exception escalations, real-time interrupts, guardrail rules |
| **Observe** | seeing what already happened | the daily digest, the run-ledger, a dashboard |

### The surface follows the autonomy level

The **Oversee** surface is not a fixed choice — the right one *follows the dial* in §8, exactly as a manager's style follows an employee's seniority:

| Autonomy setting | How you'd oversee a person | The matching surface |
|---|---|---|
| Supervised | check the work before it goes out | **approval queue** (per-action gate) |
| Delegated | they act; escalate judgment calls; weekly 1:1 | **exception escalation + digest review** |
| Autonomous | set objectives and guardrails; review outcomes | **policy/guardrails + post-hoc review & rollback** |

This is the resolution to the approval-queue question. An approval queue is a **legitimate but low-autonomy** surface: it puts the human back in the critical path of every action, which caps throughput at human speed — self-defeating at exactly the autonomy level where the system's value is highest. As you move a role up the dial, you stop approving individual actions and start **setting policy up front and reviewing outcomes** — you manage a senior leader, you don't proofread their email.

### Engagement varies in time, not just by surface

The surfaces above are *what* you do; engagement also varies in *when* and *how continuously* — a spectrum from synchronous to fully asynchronous:

- **Conversational** — stay in the loop, steering and interrupting a running role in real time (natural at Supervised/Delegated).
- **Outcome-oriented** — hand over a goal and let the role iterate until the result is satisfactory, judging the outcome, not the steps (Delegated/Autonomous). The loop only terminates because "satisfactory" is *defined* — and those acceptance checks are the same ones evaluation uses (§10).
- **Start and resume later** — kick a task off and pick it up days afterward.

The last is the clearest payoff of brain-as-bus: you never resume an *agent* — no state lives in one — so a fresh agent reloads durable state from the brain and continues, making a days-long gap free (#1, #3). It is the human-side mirror of the lengthening task horizon (§1.2): as work runs for days, your involvement spans days too.

One distinction this exposes: an **inbound** queue of *your* instructions waiting for a role is not the **outbound** approval queue of the role's actions waiting for *you* (§8). Same word, opposite directions.

### What stays invariant

Whatever surfaces you choose (#7, #8): **intervention must always be possible, and every intervention is captured as feedback.** That two-part guarantee is mechanism. Everything about *which* surfaces, *how many*, and *how they look* is policy — pick what fits you, and let it differ per role and evolve as roles mature.

---

## 10. Evaluation: the performance review

You can't improve what you don't measure, and "the role seems fine" is not measurement. **Evaluation benchmarks how well a role does *real work*** — its periodic performance review.

- **Outcomes, not vibes.** Define, per role, what a good result *is*: comms = the right messages got the right replies and nothing important dropped; product-dev = bugs triaged at the correct priority, plans sound. Write these as a small, growing set of checks.
- **Real cases as the test set.** The best benchmark is past real work with a known-good outcome — often the outcome *after* you intervened (§11). Replay it; see if the role now gets it right.
- **A scorecard per role**, written back to the brain: pass rate on its checks, **work-done-per-dollar** (from telemetry, §7), **intervention rate** (how often you had to step in), and trend over time.
- **An LLM-as-judge for the fuzzy parts**, calibrated against your interventions as ground truth.

The **intervention rate** is the headline metric: a maturing role needs you less over time. If it doesn't, evaluation tells you *which* role and *on what kind of task* — precisely the input improvement needs, and the evidence that justifies a promotion up the autonomy dial (§8).

---

## 11. Improvement: coaching, and promotion

Improvement is a **loop, and it is automated** — but it lands its changes through a gate you control. Its fuel is what the system has been quietly collecting all along:

1. **Your interventions** (#7). Every correction, override, answered escalation, or contributed fact was captured as a **feedback record** — a labeled example of "what the role should have done."
2. **Eval results** (§10) — which roles fall short, and on what.

**The improvement pass (a natural job for the dreaming agent, §6):**

```
read feedback records + role scorecards
        │
        ▼
cluster recurring mistakes per role        ("keeps mis-prioritizing UI bugs")
        │
        ▼
propose a concrete change                  (edit the charter, add a check, adjust a
        │                                    tool, or recommend a promotion up the dial)
        ▼
open it as a diff (a PR) against the
role's charter files in the brain
        │
        ▼
YOU review the diff ── approve ─► merged; next run uses it
                    └─ reject ──► feedback for the next pass
```

Why this gets better on its own *without* getting opaque:

- **Improvement = a readable diff to a charter.** Because a role's behavior is defined by files (§5), "the system improved itself" is a git commit you can read, question, and revert. No hidden weights, no mystery. This is **coaching** made auditable.
- **Promotion is just one kind of improvement.** When evals prove a role out, the proposed diff may *raise its authority* (§8) — the system recommending its own promotion, with the scorecard as the case for it. You approve the raise; the role takes on more without a human in the critical path.
- **Your scarce attention compounds.** A correction made once becomes a labeled example that prevents the whole class of mistake — instead of the same correction every week.
- **The loop closes.** Intervene → captured → clustered → proposed as a fix or promotion → you approve the diff → evals confirm the gain → intervention rate drops. The system's job is to need you less, and to *prove* it earned the trust.

Keep the human as the gate on **self-modification** for as long as it's cheap to — it's the one place where full autonomy is genuinely dangerous, and a diff review is genuinely cheap.

---

## 12. The maturity path: start small, grow without re-architecting

The architecture is the same at every size. You grow by **hiring roles and adding planes** — never by reorganizing the foundation. Each stage is a place you can *stop* and have a coherent, useful system.

| Stage | What exists | What you get |
|---|---|---|
| **0 — Brain** | Just the brain (`BRAIN_BRIEF.md`), no roles | A durable, queryable context store you and a chat agent use by hand |
| **1 — One role** | Brain + one role on a heartbeat loop + run records | Hands-off work in your highest-value area; telemetry from day one |
| **2 — A few roles** | Several roles, all coordinating via the brain | A small org of specialists; your chosen surfaces (§9) become the control room |
| **3 — Dreaming** | A nightly consolidation/improvement agent | The system organizes itself and starts getting smarter, not just busier |
| **4 — Self-improving** | Evals + feedback + the improvement loop running | Measured roles that need you less over time, provably — and earn promotions |
| **5 — Business system** | Many roles spanning operations, mostly autonomous | A system that helps operate the business, still readable as plain files |

Because nothing above stage 0 changes the substrate or the invariants, **stage 5 is stage 1 with more of the same** — more roles on the same bus, more files of the same kinds. That is the whole reason for brain-as-bus and roles-as-encapsulation: **scaling is hiring, never migration.**

The direction is yours. One person scales toward a personal chief-of-staff; another scales a single Product-Dev role into a full delivery org; another spreads across every domain of a business. Same architecture, different emphasis.

---

## 13. Filling in the blanks: the same architecture, two stacks

Every box above is a contract with an open implementation. Two compliant builds, sharing no code:

| Component | Person A (local/DIY) | Person B (cloud/SaaS) |
|---|---|---|
| Agent harness | Claude Code sessions | Codex / custom agent SDK |
| Language | Python | Node.js / TypeScript |
| Brain substrate | Markdown + git + SQLite FTS index | Markdown + git + Postgres |
| Work queue | Files in a `queue/` dir | A hosted queue service |
| Activation | `cron` on a Mac mini | A managed scheduler + webhooks |
| Telemetry store | Append-only files in the brain | Same files, mirrored to a dashboard |
| Eval / judge | Local model calls | Hosted eval tooling |
| Drive/oversee/observe surfaces | A digest file + a queue file | A chat app + a web console |

Both honor §3. Both can read this document and recognize their own system. **If a future technology slots into one of these cells without touching the invariants, the architecture already accommodates it** — that is the test of a good fill-in-the-blank.

---

## 14. Anti-patterns: how this stays simple

The architecture's worst enemy is well-meant complexity. Resist:

- **A central orchestrator that "coordinates" roles.** It becomes the bottleneck, the single point of failure, and the thing you can no longer understand. The brain coordinates; roles are peers. (A thin *planner* that only writes a "today's priorities" file is fine — it commands no one.)
- **Agents that call agents.** The moment A awaits B, you've rebuilt a distributed system with no observability. A writes a file; B reads it on its own schedule.
- **Personifying roles — and worse, personifying agents.** Names and personalities invite misplaced trust and obscure the only thing that matters: what the role is accountable for and what it may do. The "virtual employee" is the *role* (the durable seat), never the agent (a disposable shift of work). Keep roles structural and agents anonymous.
- **One surface for everything.** Drive, oversee, and observe are different jobs (§9); forcing them through a single approval queue caps your system at human throughput. Match the oversee-surface to each role's autonomy.
- **Treating autonomy as a global switch.** It's a per-role dial set by policy and earned by evidence (§8), not one setting for the whole system.
- **State outside the brain.** A cache, a hidden memory, a side database an agent relies on — anything that breaks "kill the agent, lose nothing." If it matters, it goes in the brain.
- **Skipping the run record** to save effort. Then you're blind on tokens, cost, and behavior — and the learning plane has no fuel.
- **A heavier retrieval stack before retrieval has demonstrably failed.** Per `BRAIN_BRIEF.md §9`, vectors/graphs are an upgrade you earn by hitting a wall, not a foundation you start with.
- **Full autonomy on self-modification.** Let roles act freely in their domains; keep the diff that changes a charter behind your review. Cheapest insurance in the system.
- **More roles or planes than the work needs.** Every role is a charter to maintain and a review to run. Hire one when the work earns it; not before.

> **The test, always:** can you still explain the whole system, out loud, in a few minutes, by pointing at files and naming roles? If not, something needs deleting — not documenting.

---

## 15. Glossary

- **Brain** — the single durable substrate; all state lives here (`BRAIN_BRIEF.md`).
- **Bus** — the role the brain plays: the only channel agents use to coordinate.
- **Role** — a contract of responsibility + authority; the unit of *understanding* and the system's **"virtual employee"** (the durable, accountable seat), staffed by one or more agents. Encapsulates schedules/loops/skills.
- **Agent** — a disposable execution unit that staffs a role; a single *shift of work* / pair of hands, **not** a little employee: wake → read → bounded work → write back → stop. It holds no state between runs.
- **Charter** — a role's policy file: its responsibilities and authority level; the thing improvement and promotion edit.
- **Authority level** — where a role sits on the autonomy dial (advisory → supervised → delegated → autonomous).
- **Plane** — a builder's-view layer of capability over the brain (context, work, activation, telemetry, learning, interface).
- **Mechanism vs. policy** — what the architecture fixes (capabilities, wiring) vs. what the operator chooses (autonomy, surfaces).
- **Heartbeat loop** — an agent waking on a schedule to handle what's new in its role's area.
- **Dreaming** — the nightly job that consolidates, organizes, and improves rather than reacts.
- **Run record / run-ledger** — the per-run telemetry entry / the append-only collection of them; a role's activity report.
- **Consequence tag** — reversible vs. consequential label on an action; the raw material of autonomy.
- **Drive / oversee / observe** — the three distinct human↔system surfaces.
- **Feedback record** — a captured human intervention, used as a labeled example for improvement.
- **Intervention rate** — how often you must step in; the headline metric of a role's maturity and the case for its promotion.
- **Promotion** — raising a role's authority once evals justify it.

---

*Prime directive, restated: simplicity, maintainability, scalability — in that order. The brain serves the work; the agents serve their role; the roles serve you; and the whole thing must stay readable as plain files you can understand at any time. The architecture fixes the mechanism and leaves the policy to you. When in doubt, remove something.*
