# An Architecture for Agentic Work

### A technology-agnostic vision for putting AI agents to work in well-defined **roles** — from a single agent to a whole-business system

Put AI to work across your day, organized the way a company is: each agent owns an accountable role, and the system grows from one agent into something that helps run a business — without ever rebuilding the foundation.

**Audience:** the operator who wants AI doing real work across their day, and any builder (any stack) who'll implement it. **Companion:** `BRAIN_ARCHITECTURE.md` is the peer doc for the **Context plane** (the brain) referenced throughout. This one describes the *system around the brain* — how work is organized, run, watched, governed, and improved.

---

## 0. What this is, and what it is not

This is a **vision and a set of rules**, not an implementation. It says nothing about which model, database, or services you use. Two people should be able to build from it systems that work the same way but share no code.

It is **opinionated about *mechanism*, agnostic about *policy*** (§1.3): it fixes what must exist and how it fits together, and leaves the settings to you.

**Read it as a compass, not a checklist.** Start with one agent; add capability only when the work demands it.

---

## 1. The three core ideas

Three ideas; the rest is detail.

### 1.1 The brain is the bus. The runner is swappable.

All lasting state lives in **one place: the brain** (plain, human-readable files, per `BRAIN_ARCHITECTURE.md`). Agents never call each other; they coordinate *only* by reading and writing it. This keeps the system simple at one agent and at fifty:

- **The runner is stateless, so it's swappable.** An agent's work runs as a **session** (one run) on a **provider** (Anthropic, OpenAI, an open-source model). Kill it, restart it, rewrite it in another language, or swap the provider — nothing is lost, because the runner held nothing. The role and memory were in the brain.
- **Coordination needs no special machinery.** "Agent A tells Agent B something" is just "Agent A writes a file, and Agent B reads it."
- **The whole system is readable.** Its entire state is plain files; you understand it by reading it.

### 1.2 Agents hold roles

An **agent** has a **role**: a well-defined scope of work — what it's responsible for and what it's allowed to do ("Communications Manager," "Scheduler," "Product Development Lead") — written as a file in the brain. The machinery that runs it (prompt, loops, tools, model) is the agent's **harness**, which lives with the runner, not in the brain (§5). Organizing work this way gives the architecture a vocabulary you already have a feel for (§2): hiring, reviewing, coaching, promoting, reorganizing.

### 1.3 Opinionated about mechanism, agnostic about policy

Firm about *how things are wired* (mechanism), quiet about *the settings you choose* (policy). The two that matter most: **how much autonomy** each agent gets (§8) and **how you stay in the loop** (§9). It hands you the controls and never decides for you.

---

## 2. Agents have roles

One guardrail: **treat an agent as a role to fill, not a personality.** Don't let a friendly name ("Sam from Comms") buy trust the agent hasn't earned — trust comes from its track record (§10). The §1 properties hold: role and memory durable, session and provider swappable, coordination only through the brain.

**The org isn't fixed.** Start with one agent. Split an agent when its role is trying to do two different things at once; merge two when they never act without each other. The org serves the work.

---

## 3. The invariants (the rules that can't bend)

An implementation is compliant if and only if it honors these. Everything else is free.

You don't have to absorb all ten now — skim them, and you'll meet each again in context as you read on.

 1. **All state lives in the brain.** Everything the system learns or produces lives there; the only things outside it are stateless code — the agents' harnesses and the runner that executes them. What the brain doesn't hold, the system doesn't remember.
 2. **The brain is the bus.** No agent calls another; they coordinate only through the brain, so nothing is wired directly to anything else.
 3. **The runner is swappable.** Session and provider can be replaced anytime with no loss of state — the runner holds none (its harness is code, not state); the role and memory live in the brain.
 4. **Every capability belongs to an agent.** No loose automation: every schedule, loop, and skill is owned by a named, accountable agent.
 5. **Every run is recorded.** No agent works without writing a run record (who, when, why, what it touched, tokens, cost, outcome).
 6. **Every action declares its consequence.** Each action is tagged by how reversible and how risky it is — the raw material of autonomy (§8), mechanism not policy.
 7. **Intervention is always possible, and always captured as feedback.** You can always step in; each time, it's saved as a labeled example (§11). *That* it happens is mechanism; *which way* you do it is policy (§9).
 8. **Opinionated about mechanism, agnostic about policy.** The architecture fixes the capabilities and wiring; the operator chooses the settings — autonomy and surfaces above all.
 9. **Works even stripped bare.** Delete the queue, the logs, and the tooling, and the brain is still readable markdown a human can use. Tools sit on top of the files; the files never depend on them.
10. **Simplicity is the tiebreaker.** When two designs both work, choose the one you can still explain in six months. Complexity must pay its way now, not in some imagined future.

---

## 4. The architecture at a glance

Three layers: **you** drive, oversee, and observe; **agents**, each with a role, do the work; **the brain** is the only thing they share.

```
          YOU
           │   drive · oversee · observe
           ▼
   ┌───────────────────────────────────────┐
   │  AGENTS — each with a role            │
   │  Comms · Scheduler · Product-Dev · …  │
   └───────────────────────────────────────┘
           │   read · write
           ▼
   ┌───────────────────────────────────────┐
   │  THE BRAIN — the bus                  │
   │  all durable state lives here         │
   └───────────────────────────────────────┘
```

Builders implement that middle layer as six **planes**, each a thin layer over the brain, added in order (§12) and useful on its own:

| Plane | What it covers | Stored as |
| --- | --- | --- |
| **Context** | Single source of truth | brain files (`BRAIN_ARCHITECTURE.md`) |
| **Work** | Agents (each with a role) that own outcomes | roles (`knowledge/agents/`) + a work queue (`runtime/`); harness with the runner |
| **Activation** | What wakes agents — loops, events, dreaming | schedule/trigger config in the harness |
| **Telemetry** | Every run: tokens, cost, actions, outcome | append-only run-ledger |
| **Learning** | Review agents; turn feedback into improvement | eval-results + feedback files |
| **Interface** | How you drive, oversee, and observe | surfaces you choose (§9) |

---

## 5. Anatomy of an agent

An **agent** is a **role** in the brain plus a **harness** that runs it:

| Part | What it is | Where it lives, and why |
| --- | --- | --- |
| **Role** | What it's responsible for, its scope, its **authority level** (§8), and its **granted tools** | The brain (`knowledge/agents/<name>/`), so improvement and promotion are just edits to a file (§11) |
| **Harness** | How it runs: system prompt, loops, tools, model binding (its *machinery*) | With the runner — version-controlled code, ported or rebuilt when you swap the provider (`BRAIN_ARCHITECTURE.md §5`) |
| **Schedule** | When the agent wakes (§7) | With the harness — plain, readable activation config |
| **Reporting** | Its run records, scorecard, and digest contributions | The brain (`runtime/`), so the agent is as easy to review as an employee |

An agent's **tools** are what it uses to reach beyond the brain (email, a data API, the brain's own CLI): *wired* in the harness, *granted* in the role, each one offering consequence-tagged **actions** (`TOOLS.md`). The consequence tag (#6) is what lets autonomy (§8) decide which actions it runs alone and which it escalates.

An agent keeps **no state of its own** — that's what keeps the runner swappable. A **session** (one run) is a clean instance that:

1. **Wakes** on a trigger (a schedule, an event, or you).
2. **Reads** the brain to load only the context the task needs.
3. **Does bounded work** with the agent's tools, against its role.
4. **Writes back** through the write contract (`BRAIN_ARCHITECTURE.md §6`), not by editing raw files — always including a **run record** (#5).
5. **Stops**, holding no state.

Ending and resuming a run, or handing it to a new provider, loses nothing (#1, #3): a Claude Code session, a Codex script, a cron'd Python process, and a hosted function all meet the contract equally.

Why split work across agents at all, instead of one do-everything agent? Smaller context, sharper roles, and separate schedules, reviews, and failures — a bug in Comms never touches Product Dev. Add a specialist only when the work earns it.

---

## 6. Activation: loops and dreaming

An agent does work without you because something **wakes** it (starts a session). Three kinds of trigger — most systems only ever need the first.

1. **Heartbeat loops (the default).** An agent wakes on a schedule and asks "what's new in my area, and what should I do about it?" Cadence matches the role: comms hourly, product-dev a few times a day, billing weekly. A loop is just *wake → read brain → do bounded work → write back → stop*.

2. **Event triggers (optional).** A webhook wakes an agent on a specific event (a deploy finished, a ticket opened) instead of waiting for the next tick. Use only where speed genuinely matters; otherwise a faster heartbeat is simpler.

3. **Dreaming (the nightly tidy-up).** When the day is quiet, dreaming does the thinking the loops never get to, in two kinds:

   - **Whole-brain tidy-up** — process what ingestion has staged: file it, fix contradictions across agents, trim and connect, and prepare tomorrow's digest. This belongs to every agent and to none in particular, so a dedicated **System agent** owns it — along with ingestion itself (`BRAIN_ARCHITECTURE.md §7`) — keeping invariant #4 absolute.
   - **Per-agent reflection** — an agent reviewing its own runs and feedback and proposing changes to its own role (§11). Sharper with the agent's own context, but earn the split: start with the System agent doing it for everyone, and give an agent its own reflection only once the shared pass gets too coarse (#10).

> **Loops react. Dreaming reflects.** Only loops makes a system busy but never smarter; dreaming turns a day of activity into a better system tomorrow.

---

## 7. Telemetry: knowing where the work and the money go

Every run writes a record (#5). The **run-ledger** is all those records in one place — append-only, never edited, just more files in the brain. So you get full visibility without a separate monitoring tool. It's each agent's activity report; the format below is just an example:

```yaml
agent:        communications-manager
session:      comms-triage
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

- **Where the time and money go** — by agent and by day.
- **What each agent did** — at a glance, no transcripts to read.
- **Easy debugging** — a bad outcome points to the run that caused it.
- **The basis for evaluation** — you can't measure work per dollar without recording the dollar.

Two rules keep it honest: the harness writes the record, not the model (so it can't flatter itself), and you only ever add to it. **Tokens and cost come from the provider's own usage numbers** (most expose a JSON mode), never guessed — without a real cost there's no measuring *work per dollar* (§10).

---

## 8. Autonomy: a dial, not a default

This is where "agnostic about policy" matters most. **How much autonomy an agent has is your choice** — taste, risk appetite, maturity of the work — not the architecture's. Put it the way a manager would: **what authority does this agent have?**

| Setting | The agent… | Like a… |
| --- | --- | --- |
| **Advisory** | only proposes; you do everything | intern drafting for your signature |
| **Supervised** | acts on reversible work; checks with you on the big moves | new hire whose big moves you check |
| **Delegated** | acts; comes to you only on genuine judgment calls | trusted employee with periodic 1:1s |
| **Autonomous** | acts within policy; you review outcomes, not actions | senior leader you set objectives for |

**What the architecture guarantees:**

- Every action carries a **consequence tag** (#6); every agent carries an **authority level** in its role.
- The rule everywhere: **an action goes ahead when the agent's authority covers its consequence; otherwise it escalates and asks you first** (§9).
- Acting first and reviewing after is safe, because everything is recorded (the run-ledger).
- **Trust grows** — authority can rise as an agent's track record proves it out (§10–11), a promotion on evidence, not a hunch.

**What you set, per agent:** where it sits on the dial, which of its actions count as big, how high the bar to escalate is.

It won't *make* you raise autonomy, but it's **built to make raising it cheap and safe** — a belief built in, not forced:

> An agentic system is worth more the more work it can do **without** a human in the middle. Held at low autonomy, it can never outpace one person — which was the whole reason to build it. So the design pulls *upward*: as an agent earns trust, moving it up the dial is a small, safe, well-tracked change.

Keep any agent at Advisory forever if you like; nothing in the way stops you when you want to hand over more.

---

## 9. The human surfaces: drive, oversee, observe

Here too, the choices are yours. The mistake baked into "just use an approval queue" is assuming one surface handles everything between you and the system. There are really **three**:

| Surface | What you're doing | Example mechanisms |
| --- | --- | --- |
| **Drive** | starting work; setting goals and guardrails | a chat front-desk, creating a task, editing an agent's role |
| **Oversee** | steering, correcting, or approving *ongoing* autonomous work | approval queue, escalations, real-time interrupts, guardrail rules |
| **Observe** | seeing what already happened | the daily digest, the run-ledger, a dashboard |

The **Oversee** surface isn't fixed — the right one *follows the dial* (§8), the way a manager's style follows an employee's seniority:

| Autonomy setting | How you'd oversee a person | The matching surface |
| --- | --- | --- |
| Supervised | check the work before it goes out | **approval queue** (per-action gate) |
| Delegated | they act; escalate judgment calls; weekly 1:1 | **escalation + digest review** |
| Autonomous | set goals and guardrails; review outcomes | **guardrails + after-the-fact review & undo** |

An approval queue is **fine but low-autonomy**: it puts you back in the path of every action, capping the system's speed at yours — which defeats the purpose exactly where the system is most valuable. Move an agent up the dial and you stop approving actions and start setting policy and reviewing outcomes: you manage a senior leader, you don't proofread their email.

How closely you stay involved also varies, from in-the-loop to fully hands-off:

- **Conversational** — steer and interrupt a running agent in real time (Supervised/Delegated).
- **Outcome-oriented** — hand over a goal and let the agent keep going until the result is good enough (Delegated/Autonomous); it stops only because "good enough" is *defined* up front, and those checks are the same ones evaluation uses (§10).
- **Start and resume later** — kick a task off and pick it up days afterward.

That last is the clearest payoff of the brain-as-bus rule: there's no agent to resume — a fresh session reloads everything from the brain and continues, so a days-long gap is free (#1, #3). And note: a queue of *your* instructions waiting for an agent is not the queue of *its* actions waiting for *you* (§8) — same idea, opposite directions.

Whatever surfaces you choose: **you can always step in, and every time you do it's saved as feedback** (#7). That guarantee is mechanism; which surfaces, how many, and how they look is policy — let it differ per agent and change as agents mature.

---

## 10. Evaluation: the performance review

You can't improve what you don't measure, and "the agent seems fine" isn't a measurement. **Evaluation grades how well an agent does *real work*** — its regular performance review.

- **Outcomes, not vibes.** Spell out, per agent, what a good result *is*: comms = the right messages got the right replies and nothing important dropped; product-dev = bugs ranked at the right priority, plans sound. Write these as a small, growing set of checks.
- **Real cases as the test set.** The best test is past real work with a known-good outcome — often the outcome *after* you stepped in (§11). Replay it; see if the agent now gets it right.
- **A scorecard per agent**, written back to the brain: pass rate, **work per dollar** (§7), **intervention rate** (how often you had to step in), and the trend.
- **Let an LLM grade the fuzzy parts**, checked against your past corrections as the answer key.

The **intervention rate** is the headline number: a maturing agent needs you less over time. If it doesn't, evaluation tells you *which* agent and *on what kind of task* — exactly what improvement needs, and the case for moving it up the dial (§8).

---

## 11. Improvement: coaching, and promotion

Improvement is a **loop, and it runs on its own** — but its changes land only through a gate you control. Its fuel:

1. **Your interventions** (#7) — each saved as a **feedback record**, a labeled example of "what the agent should have done."
2. **Eval results** (§10) — which agents fall short, and on what.

**The improvement pass (naturally the dreaming agent's work, §6):**

```
   read feedback records + agent scorecards
        │
        ▼
   cluster the recurring mistakes per agent     (e.g. "keeps mis-prioritizing UI bugs")
        │
        ▼
   propose one concrete change                  (edit the role, add a check, adjust a
        │                                        tool, or suggest a promotion)
        ▼
   open it as a diff against the agent's role
        │
        ▼
   YOU review it ──approve──►  merged; the next run uses it
                 └─reject───►  becomes feedback for the next pass
```

Why this gets better on its own *without* turning into a black box:

- **Improvement = a readable change to a role.** An agent's behavior is just files (§5), so "the system improved itself" is a change you can read and question before it lands — coaching, made auditable.
- **Promotion is one kind of improvement.** When evals prove an agent out, the change may *raise its authority* (§8) — the system proposing its own promotion, with the scorecard as the case. You approve the raise.
- **Your attention compounds.** A correction made once becomes a labeled example that prevents the whole class — instead of the same correction every week.
- **The loop closes.** Step in → saved → clustered → proposed → you approve → evals confirm → intervention rate drops. The system's aim is to need you less, and to prove it.

Keep yourself as the gate on **the system changing itself** for as long as that's cheap — it's the one place full autonomy is genuinely dangerous, and reviewing a change is genuinely cheap.

---

## 12. The maturity path: start small, grow without rebuilding

The architecture is the same at every size. You grow by **hiring agents and adding planes**, never by reorganizing the foundation. Each stage is a place you can *stop* and have a coherent, useful system.

| Stage | What exists | What you get |
| --- | --- | --- |
| **0 — Brain** | Just the brain (`BRAIN_ARCHITECTURE.md`), no agents | A durable, searchable store you and a chat agent use by hand |
| **1 — One agent** | Brain + one agent on a heartbeat loop + run records | Hands-off work in your highest-value area; records from day one |
| **2 — A few agents** | Several agents, all coordinating via the brain | A small team of specialists; your chosen surfaces (§9) become the control room |
| **3 — Dreaming** | A **System agent** running the nightly tidy-up/improvement | The system organizes itself and starts getting smarter, not just busier |
| **4 — Self-improving** | Evals + feedback + the improvement loop running | Measured agents that need you less over time, provably — and earn promotions |
| **5 — Business system** | Many agents across operations, mostly autonomous | A system that helps run the business, still readable as plain files |

Nothing above stage 0 changes the foundation or the invariants, so **stage 5 is stage 1 with more of the same** — more agents on the same bus, more files of the same kinds. **Scaling is hiring, not rebuilding.** The direction is yours: a personal chief-of-staff, a single agent grown into a full delivery team, or coverage across a whole business.