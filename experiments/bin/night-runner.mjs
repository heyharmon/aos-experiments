export const meta = {
  name: 'night-runner',
  description: 'Self-steering OUTER loop for unattended overnight agent-os experimentation: pick the next experiment from the backlog, delegate it to the bounded run-experiment engine, audit the conclusion, commit, and move on under a hard nightly $ ceiling. Governed by experiments/NIGHT-RUNNER.md.',
  whenToUse: 'Launch at end of day to run agent-os experiments overnight without an operator.',
  phases: [
    { title: 'Reset', detail: 'wipe runtime scratch so spend accounting is marginal (tonight-only)' },
    { title: 'Direct', detail: 'pick ONE next experiment from the backlog/charters' },
    { title: 'Delegate', detail: 'run the bounded run-experiment engine on that charter (no free-form executor)' },
    { title: 'Audit', detail: 'independent refutation gate on the published conclusion' },
    { title: 'Record', detail: 'commit the audited result to main, update backlog, append the report' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────
// Night-runner = the OUTER self-steering shell. It does NOT run experiments
// itself (that was the bug: a free-form Executor ran a multi-hour tournament
// and detached runaway processes inside one iteration). Instead each experiment
// is delegated to the INNER engine, .claude/workflows/run-experiment.js, which
// is structurally bounded (fixed trials, fixed max-iterations, per-call wall
// timeouts, concurrency <=4, no detached processes, records each trial to disk).
//
// Hard invariants this driver enforces (see experiments/NIGHT-RUNNER.md):
//   1. NO detached/background processes anywhere. Every claude -p runs in the
//      foreground under loop.sh's timeout and dies with its parent. No `&`-to-
//      init, no setsid/nohup, no watchers, no out-of-repo run copies.
//   2. Marginal spend accounting. runtime/ is wiped at the start so the sum of
//      cost_usd across runtime JSONs is TONIGHT's spend only. Checked after
//      every experiment; the $ ceiling halts the loop.
//   3. One experiment per outer iteration, bounded by the inner engine, so a
//      single iteration can never run away in time or money.
//   4. No conclusion is committed until an independent auditor clears it.
// Scripts have NO filesystem access, so every repo touch happens via agents.
// ──────────────────────────────────────────────────────────────────────────

const REPO = '/Users/ryanharmon/Documents/Code/agent-os'
const INNER = REPO + '/.claude/workflows/run-experiment.js'
const DOCTRINE = 'experiments/NIGHT-RUNNER.md'
const BACKLOG = 'experiments/BACKLOG.md'

const DATE = (args && args.date) || 'UNDATED'
const BUDGET_USD = (args && args.budgetUsd) || 100
const MAX_EXPERIMENTS = (args && args.maxExperiments) || 8
const TRIALS = (args && args.trials) || 3
const INNER_MAX_ITER = (args && args.maxIterations) || 3
const SMOKE = !!(args && args.smoke)            // validate OUTER wiring only; never delegate a real run
const REPORT = `results/NIGHT-${DATE}.md`

const NO_DETACH = `ABSOLUTE RULE: never start a detached or background process. No "&" that orphans to init, no setsid, no nohup, no disown, no watcher/supervisor scripts, no copying the experiment out of the repo to run it elsewhere. Every command runs in the foreground and must finish (or time out) before you continue. The rig's loop.sh already wraps each claude -p in a wall-clock timeout; rely on that. If a run wedges, let the timeout kill it and record a failed trial.`

const CONTEXT = `You are one role inside the agent-os NIGHT-RUNNER (OUTER shell), running UNATTENDED overnight (no operator). Your authority and leash: ${DOCTRINE}. Read it, ${BACKLOG}, and experiments/PROCESS.md before acting. Working dir is the repo root.
${NO_DETACH}
Self-authorize WITHIN BOUNDS only: any new direction must trace to VISION.md's spectrum or an open HYPOTHESES.md bet, and needs a charter.md with a falsifiable "Refutes if" BEFORE any trial runs. NEVER weaken a task expectation or edit the agent-under-test prompt to force a pass. NEVER tune on held-out. NEVER change scoring after results exist except the one PROCESS-sanctioned mechanism->outcome fix (and prefer to QUEUE even that). Nothing outward-facing or irreversible beyond the repo; never touch archive/ or rewrite git history. Cost is a SIGNAL, not a bar: report real provider numbers, never edit a cost. A safety-floor FAILURE by the agent-under-test is a finding to RECORD, not a reason to stop the night.`

// ── Schemas ────────────────────────────────────────────────────────────────
const DIRECTOR_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['action', 'anchor', 'rationale'],
  properties: {
    action: { type: 'string', enum: ['delegate', 'halt'] },
    anchor: { type: 'string', description: 'backlog item id or HYPOTHESES id this experiment serves; "none" only with halt' },
    rationale: { type: 'string', description: 'one line: why this experiment next, given repo state' },
    experimentDir: { type: 'string', description: 'repo-relative dir holding (or to hold) charter.md, e.g. experiments/004-name' },
    needsCharter: { type: 'boolean', description: 'true if charter.md does not yet exist and must be written first' },
    charterSpec: { type: 'string', description: 'if needsCharter: the use-case/goal/bar/divergent-architectures/hypotheses/stopping-criteria to encode, anchored to the backlog item' },
    haltReason: { type: 'string', description: 'set only when action=halt' },
  },
}
const SPEND_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['cumulativeSpendUsd', 'breakdown'],
  properties: {
    cumulativeSpendUsd: { type: 'number', description: 'sum of cost_usd across ALL experiments/*/runtime/**/*.json (skip *.raw.json) plus judge/checker/gate costs from score.json/gate.json. Read the files; do not estimate.' },
    breakdown: { type: 'string', description: 'per-experiment $ and agent/judge/checker/gate split' },
  },
}
const AUDIT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['verdict', 'checks', 'violations', 'downgradeTo'],
  properties: {
    verdict: { type: 'string', enum: ['pass', 'fail', 'na'] },
    checks: { type: 'string', description: 'each PROCESS validity check: pre-registered scoring? headline=held-out + gap reported? no prompt/expectation edit (inspect git diff)? a bet fired its enforcement/failure path (else INCONCLUSIVE not a winner)? every claim links to a run?' },
    violations: { type: 'array', items: { type: 'string' } },
    downgradeTo: { type: 'string', enum: ['none', 'SUPPORTED-but-thin', 'INCONCLUSIVE'] },
  },
}
const RECORD_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['committed', 'commitSha', 'hypothesesMoved', 'reportEntry'],
  properties: {
    committed: { type: 'boolean' },
    commitSha: { type: 'string' },
    hypothesesMoved: { type: 'array', items: { type: 'string' } },
    reportEntry: { type: 'string' },
    queueItems: { type: 'array', items: { type: 'string' } },
  },
}

// ── Run ─────────────────────────────────────────────────────────────────────
log(`night-runner: date=${DATE} ceiling=$${BUDGET_USD} maxExp=${SMOKE ? 1 : MAX_EXPERIMENTS} trials=${TRIALS} innerMaxIter=${INNER_MAX_ITER}${SMOKE ? ' (SMOKE: outer wiring only, no real experiment)' : ''}`)

// Reset: wipe scratch so all subsequent cost sums are tonight-only.
phase('Reset')
await agent(
  `${CONTEXT}\n\nReset step. Delete all disposable scratch so tonight's spend accounting is marginal: remove every experiments/*/runtime/ directory (they are gitignored and rebuilt per run). Some seed dirs are chmod read-only; chmod -R u+w before removing if needed. Do NOT touch anything outside runtime/. Confirm no runtime/ dirs remain and report what you cleared. ${NO_DETACH}`,
  { label: 'reset', phase: 'Reset' },
)

let spentUsd = 0
let done = 0
const cap = SMOKE ? 1 : MAX_EXPERIMENTS
const queue = []
const moved = []
const flags = []
const tokenGuard = () => !budget.total || budget.remaining() > 60_000

while (done < cap && spentUsd < BUDGET_USD && tokenGuard()) {
  const n = done + 1
  phase('Direct')
  const dir = await agent(
    `${CONTEXT}\n\nEXPERIMENT SLOT ${n}. Cumulative spend so far tonight: $${spentUsd.toFixed(2)} of $${BUDGET_USD}.\n` +
    `Read repo state: git status, HYPOTHESES.md statuses, FINDINGS/, every experiments/*/charter.md Status line, and ${BACKLOG}. ` +
    `Pick the ONE highest-value next experiment to run, anchored to a backlog item or open hypothesis. Prefer an existing chartered-but-unfinished experiment over a new one. ` +
    `If its charter.md does not exist yet, set needsCharter=true and give the charterSpec (use case + spectrum position, goal, bar = pass rate + safety floor, pre-registered outcome scoring, DIVERGENT architectures designed to discriminate per H-18, hypotheses with "Refutes if", stopping criteria). ` +
    `If no anchored work remains, the budget is nearly gone, or a hard-stop condition holds, choose halt.`,
    { label: `direct:${n}`, phase: 'Direct', schema: DIRECTOR_SCHEMA },
  )
  if (!dir || dir.action === 'halt') {
    flags.push(`halt at slot ${n}: ${(dir && (dir.haltReason || dir.rationale)) || 'director returned null'}`)
    break
  }
  log(`slot ${n}: delegate ${dir.experimentDir} (anchor ${dir.anchor}) — ${dir.rationale}`)

  // Write the charter first if the experiment is new (still "within bounds": anchored + pre-registered).
  if (dir.needsCharter) {
    await agent(
      `${CONTEXT}\n\nWrite ${dir.experimentDir}/charter.md per PROCESS.md before any run. Encode exactly this, anchored to ${dir.anchor}:\n${dir.charterSpec}\n` +
      `It MUST have a falsifiable "Refutes if" per hypothesis and a pre-registered outcome-based scoring section. Do not build the world or run anything yet; just the charter.`,
      { label: `charter:${n}`, phase: 'Direct' },
    )
  }

  // Delegate to the BOUNDED inner engine. This is the whole experiment: build dev,
  // blind-author held-out, run the tournament, iterate Decide/Revise up to
  // INNER_MAX_ITER, publish the takeaway to files (it does NOT commit).
  phase('Delegate')
  if (SMOKE) {
    log(`SMOKE: skipping real delegation; validating outer wiring only`)
    await agent(
      `${CONTEXT}\n\nSMOKE VALIDATION (no spend): do NOT run run-experiment. Just confirm you CAN read ${dir.experimentDir}/charter.md (or that needsCharter was handled), and report in one line what the real run WOULD delegate to the inner engine. ${NO_DETACH}`,
      { label: `smoke-check:${n}`, phase: 'Delegate' },
    )
  } else {
    try {
      await workflow({ scriptPath: INNER }, { dir: dir.experimentDir, trials: TRIALS, maxIterations: INNER_MAX_ITER })
    } catch (e) {
      flags.push(`slot ${n}: inner engine threw on ${dir.experimentDir}: ${String(e).slice(0, 200)}`)
    }
  }

  // Marginal spend: sum cost across runtime JSONs (only tonight's, since we wiped at Reset).
  phase('Audit')
  const acct = await agent(
    `${CONTEXT}\n\nSum tonight's provider spend: cost_usd across ALL experiments/*/runtime/**/*.json (skip *.raw.json) plus judge_cost_usd/checker/gate totals in score.json + gate.json. Read the files, do not estimate. Report the number and a per-experiment breakdown. ${NO_DETACH}`,
    { label: `spend:${n}`, phase: 'Audit', schema: SPEND_SCHEMA },
  )
  if (acct) spentUsd = Math.max(spentUsd, acct.cumulativeSpendUsd || spentUsd)
  log(`slot ${n}: cumulative spend $${spentUsd.toFixed(2)} of $${BUDGET_USD}`)

  // Independent auditor: refute the just-published conclusion BEFORE it is committed.
  let audit = null
  if (!SMOKE) {
    audit = await agent(
      `${CONTEXT}\n\nYou are the INDEPENDENT AUDITOR for the conclusion the inner engine just published (uncommitted) for ${dir.experimentDir}. You did NOT see its reasoning. Try to REFUTE it. Inspect the actual git diff and result files, not the claims. Run every validity check in ${DOCTRINE} (auditor gate). Default to fail if uncertain. verdict=na only if nothing was concluded (e.g. the inner engine stopped for an operator fork). On fail, say what to downgrade to.`,
      { label: `audit:${n}`, phase: 'Audit', schema: AUDIT_SCHEMA },
    )
    if (audit && audit.verdict === 'fail') flags.push(`slot ${n}: AUDIT FAILED → downgrade to ${audit.downgradeTo}; ${audit.violations.join('; ')}`)
  }

  // Record: gate publish on the audit, commit to main, update backlog + report.
  phase('Record')
  const rec = await agent(
    `${CONTEXT}\n\nBookkeeping for ${dir.experimentDir} (anchor ${dir.anchor}).\n` +
    (audit ? `AUDITOR: ${audit.verdict}. ${audit.verdict === 'fail' ? `Downgrade the published conclusion to ${audit.downgradeTo} and write the violations into the result log; do NOT present it as a clean win. Violations: ${audit.violations.join('; ')}` : audit.verdict === 'na' ? 'Nothing concluded; record the partial state and any operator fork.' : 'Conclusion cleared the audit.'}\n` : 'SMOKE: no real conclusion; just verify the report/commit path works.\n') +
    `Ensure HYPOTHESES.md statuses reflect ONLY what the evidence supports (every move links a run). Update FINDINGS/ if an architecture conclusion changed. Update CHANGELOG.md (Keep a Changelog, newest first, dated ${DATE}). Update ${BACKLOG} (strike finished entries, append anchored new ideas as PROPOSED). ` +
    `Commit ONLY durable files for this experiment to main (results/registers/findings/charter/backlog — never runtime/ scratch) with an experiment-result-altitude message ending in the Co-Authored-By trailer for Claude. ` +
    `Then write one morning-report block: experiment, outcome, key metrics (held-out headline + gap), spend, commit sha. Put anything NOT self-authorizable (unanchored ideas, scoring changes, genuine pivots, blocked multi-agent work, operator forks the inner engine surfaced) into queueItems.`,
    { label: `record:${n}`, phase: 'Record', schema: RECORD_SCHEMA },
  )
  if (rec) {
    if (rec.hypothesesMoved) moved.push(...rec.hypothesesMoved)
    if (rec.queueItems) queue.push(...rec.queueItems)
  }

  done++
}

// ── Morning report ──────────────────────────────────────────────────────────
phase('Record')
const stopReason = spentUsd >= BUDGET_USD ? `budget ceiling ($${BUDGET_USD}) reached`
  : !tokenGuard() ? 'orchestration token budget nearly exhausted'
  : done >= cap ? `experiment cap (${cap}) reached`
  : 'no anchored work left / hard-stop'

await agent(
  `${CONTEXT}\n\nThe night is over. Write/finalize the morning report at ${REPORT} in the format from ${DOCTRINE} (a 30-second TL;DR header, then one block per experiment). ` +
  `Facts: experiments run=${done}, cumulative spend=$${spentUsd.toFixed(2)} of $${BUDGET_USD}, stop reason="${stopReason}". ` +
  `Hypotheses moved: ${moved.length ? moved.join(', ') : 'none'}. Flags (surface in red): ${flags.length ? flags.join(' || ') : 'none'}. OPERATOR QUEUE: ${queue.length ? queue.join(' || ') : 'none'}. ` +
  `Fill any missing per-experiment blocks from git log. Commit the report to main. ${NO_DETACH}`,
  { label: 'report', phase: 'Record' },
)

return {
  date: DATE, experimentsRun: done,
  spentUsd: Number(spentUsd.toFixed(2)), budgetUsd: BUDGET_USD,
  stopReason, hypothesesMoved: moved, flags, operatorQueue: queue, report: REPORT,
}
