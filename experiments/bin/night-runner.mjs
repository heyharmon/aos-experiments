export const meta = {
  name: 'night-runner',
  description: 'Self-steering overnight experimentation loop for agent-os: drive PROCESS.md Define→Decide unattended, find proven building blocks, furnish the benchmark, honestly.',
  whenToUse: 'Launch at end of day to run agent-os experiments overnight without an operator. Governed by experiments/NIGHT-RUNNER.md.',
  phases: [
    { title: 'Direct', detail: 'pick one action from the constrained menu' },
    { title: 'Execute', detail: 'run the rig, write results, return metrics+spend' },
    { title: 'Audit', detail: 'independent refutation gate before any conclusion publishes' },
    { title: 'Record', detail: 'update HYPOTHESES/CHANGELOG, commit to main, append report' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────
// Night-runner: the driver for experiments/NIGHT-RUNNER.md (the doctrine).
// The doctrine is law; this script executes it. If they disagree, the doctrine
// wins and this script is the bug. Scripts have NO filesystem access, so every
// repo interaction (including spend accounting and git) happens inside agents.
// ──────────────────────────────────────────────────────────────────────────

const DATE = (args && args.date) || 'UNDATED'           // pass args.date = "YYYY-MM-DD"
const BUDGET_USD = (args && args.budgetUsd) || 100      // hard ceiling, doctrine envelope
const MAX_ITERS = (args && args.maxIterations) || 12
const SMOKE = !!(args && args.smoke)                     // 1-iter validation, tiny budget
const REPORT = `results/NIGHT-${DATE}.md`

const DOCTRINE = 'experiments/NIGHT-RUNNER.md'
const BACKLOG = 'experiments/BACKLOG.md'

// Shared preamble every agent gets: who it is, what the rules are, where to look.
const CONTEXT = `You are one role inside the agent-os NIGHT-RUNNER, running UNATTENDED overnight (no operator).
Your authority and your leash are in ${DOCTRINE}. Read it and ${BACKLOG} and experiments/PROCESS.md
before acting. The repo root is the working directory. Hard rules you cannot break:
- Self-authorize WITHIN BOUNDS only: any new direction must trace to VISION.md's spectrum or an open
  HYPOTHESES.md bet, and must have a charter.md with a falsifiable "Refutes if" BEFORE any trial runs.
- NEVER weaken a task expectation or edit the agent-under-test's prompt to force a pass. NEVER change
  scoring after results exist (except the one PROCESS-sanctioned mechanism→outcome fix, which you QUEUE).
- Nothing outward-facing or irreversible beyond the repo. Do not touch archive/ or rewrite git history.
- Cost is a SIGNAL, not a bar. Report real provider numbers; never edit a cost to flatter a result.
A safety-floor FAILURE by the agent-under-test is a finding to record, not a reason to stop.`

// ── Schemas ───────────────────────────────────────────────────────────────
const DIRECTOR_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['action', 'anchor', 'rationale', 'instructions'],
  properties: {
    action: { type: 'string', enum: ['run', 'revise', 'conclude', 'open', 'furnish', 'halt'] },
    anchor: { type: 'string', description: 'charter id (e.g. 003) or hypothesis id (e.g. H-18) this is tied to; "none" only with action=halt' },
    rationale: { type: 'string', description: 'one line: why this action now, given repo state' },
    instructions: { type: 'string', description: 'concrete instructions for the Executor: exact commands/files. For revise, name the ONE variable changing. For halt, the stop reason.' },
    haltReason: { type: 'string', description: 'set only when action=halt' },
  },
}
const EXEC_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['summary', 'metrics', 'cumulativeSpendUsd', 'filesChanged', 'readyToConclude', 'flags'],
  properties: {
    summary: { type: 'string' },
    metrics: { type: 'string', description: 'pass rates (dev + held-out if run), gap, fired enforcement paths, cost signals' },
    cumulativeSpendUsd: { type: 'number', description: 'TOTAL experiment $ tonight: sum cost_usd across ALL runtime/runs/*.json produced this night, across experiments. Read the files; do not estimate.' },
    filesChanged: { type: 'array', items: { type: 'string' } },
    readyToConclude: { type: 'boolean', description: 'true if a stopping criterion is now met' },
    flags: { type: 'array', items: { type: 'string' }, description: 'safety-floor findings, rig failures, anything red' },
  },
}
const AUDIT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['verdict', 'checks', 'violations', 'downgradeTo'],
  properties: {
    verdict: { type: 'string', enum: ['pass', 'fail'] },
    checks: { type: 'string', description: 'result of each PROCESS validity check: pre-registered scoring? headline=held-out? gap reported? no prompt/expectation edits (inspect the diff)? a bet fired its path? every claim links to a run?' },
    violations: { type: 'array', items: { type: 'string' } },
    downgradeTo: { type: 'string', enum: ['none', 'SUPPORTED-but-thin', 'INCONCLUSIVE'], description: 'on fail, what the conclusion is downgraded to; "none" on pass' },
  },
}
const RECORD_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['committed', 'commitSha', 'hypothesesMoved', 'reportEntry'],
  properties: {
    committed: { type: 'boolean' },
    commitSha: { type: 'string' },
    hypothesesMoved: { type: 'array', items: { type: 'string' } },
    reportEntry: { type: 'string', description: 'the one-block entry appended to the morning report for this iteration' },
    queueItems: { type: 'array', items: { type: 'string' }, description: 'items deferred to the operator (unanchored ideas, scoring changes, pivots not taken)' },
  },
}

// ── Loop ──────────────────────────────────────────────────────────────────
log(`night-runner: date=${DATE} ceiling=$${BUDGET_USD} maxIters=${SMOKE ? 1 : MAX_ITERS}${SMOKE ? ' (SMOKE)' : ''}`)

let spentUsd = 0
let iters = 0
const cap = SMOKE ? 1 : MAX_ITERS
const queue = []
const moved = []
const flags = []

// Reserve a slice of the token budget so the final report write never gets starved.
const tokenGuard = () => !budget.total || budget.remaining() > 40_000

while (iters < cap && spentUsd < BUDGET_USD && tokenGuard()) {
  const k = iters + 1
  phase('Direct')
  const remainingUsd = (BUDGET_USD - spentUsd).toFixed(2)
  const dir = await agent(
    `${CONTEXT}\n\nITERATION ${k}. Cumulative experiment spend so far tonight: $${spentUsd.toFixed(2)} of $${BUDGET_USD} (about $${remainingUsd} left).\n` +
    `Read current repo state (git status, HYPOTHESES.md statuses, the newest results/, every experiments/*/charter.md Status line, and ${BACKLOG}). ` +
    `Then choose EXACTLY ONE action from the menu in ${DOCTRINE} and anchor it to a specific charter or hypothesis id. ` +
    `Prefer finishing open work over opening new work. If a hard-stop condition holds, choose halt. ` +
    `Do not do the work now — just decide and write precise Executor instructions.`,
    { label: `direct:${k}`, phase: 'Direct', schema: DIRECTOR_SCHEMA },
  )
  if (!dir || dir.action === 'halt') {
    flags.push(`halt at iter ${k}: ${(dir && (dir.haltReason || dir.rationale)) || 'director returned null'}`)
    break
  }
  log(`iter ${k}: ${dir.action} on ${dir.anchor} — ${dir.rationale}`)

  phase('Execute')
  const exec = await agent(
    `${CONTEXT}\n\nITERATION ${k}: action=${dir.action}, anchor=${dir.anchor}.\nDirector instructions:\n${dir.instructions}\n\n` +
    `Carry this out using the EXISTING rig (experiments/<exp>/bin/run-arch.sh, tournament.sh, score.py, the brain CLI, harness/*/loop.sh) — do not build new machinery you do not need (PROCESS Build rule). ` +
    `Run trials (N>=3 unless smoke), score from provider JSON, diagnose failures as reasoning-vs-contract, and write results to the experiment's results/ dir. ` +
    `For cumulativeSpendUsd: sum cost_usd across ALL runtime/runs/*.json produced tonight across every experiment — read them, do not estimate. ` +
    `If action=open or furnish, write the charter/world/tasks FIRST under held-out discipline. Apply at most ONE variable change for a revise.`,
    { label: `exec:${dir.action}:${k}`, phase: 'Execute', schema: EXEC_SCHEMA },
  )
  if (!exec) { flags.push(`iter ${k}: executor returned null`); break }
  spentUsd = Math.max(spentUsd, exec.cumulativeSpendUsd || spentUsd)
  if (exec.flags && exec.flags.length) flags.push(...exec.flags.map(f => `iter ${k}: ${f}`))
  log(`iter ${k}: ${exec.summary} | spend $${spentUsd.toFixed(2)}`)

  // The auditor gate: no conclusion publishes on the doer's say-so.
  let audit = null
  if (dir.action === 'conclude' || (exec.readyToConclude && dir.action !== 'open' && dir.action !== 'furnish')) {
    phase('Audit')
    audit = await agent(
      `${CONTEXT}\n\nYou are the INDEPENDENT AUDITOR for the iteration-${k} conclusion on ${dir.anchor}. You did NOT see the doer's reasoning. ` +
      `Try to REFUTE the conclusion. Inspect the actual git diff and result files, not the claims. Run every validity check in ${DOCTRINE} (the auditor gate section): ` +
      `pre-registered scoring; headline is the held-out number with the dev-vs-held-out gap reported; NO agent-under-test prompt edit and NO weakened expectation (check the diff); ` +
      `at least one architecture fired its enforcement/failure path (else it is INCONCLUSIVE, not a winner); every asserted claim links to a run. ` +
      `Default to fail if uncertain. On fail, say what to downgrade the conclusion to.`,
      { label: `audit:${k}`, phase: 'Audit', schema: AUDIT_SCHEMA },
    )
    if (audit && audit.verdict === 'fail') {
      flags.push(`iter ${k}: AUDIT FAILED → downgraded to ${audit.downgradeTo}; ${audit.violations.join('; ')}`)
    }
  }

  phase('Record')
  const rec = await agent(
    `${CONTEXT}\n\nITERATION ${k} bookkeeping. Action was ${dir.action} on ${dir.anchor}.\n` +
    `Executor summary: ${exec.summary}\nMetrics: ${exec.metrics}\n` +
    (audit ? `AUDITOR verdict: ${audit.verdict}. ${audit.verdict === 'fail' ? `Downgrade the conclusion to ${audit.downgradeTo} and record the violations: ${audit.violations.join('; ')}. Do NOT publish it as a clean win.` : 'Conclusion cleared the audit; publish it.'}\n` : '') +
    `Now: update HYPOTHESES.md statuses ONLY as the evidence supports (link the run), update FINDINGS/ if an architecture conclusion changed, update CHANGELOG.md (Keep a Changelog, newest first, dated ${DATE}), and update ${BACKLOG} (strike opened/concluded entries, append anchored new ideas as PROPOSED). ` +
    `Commit ONLY this iteration's changed files to main with a message at experiment-result altitude (end with the Co-Authored-By trailer for Claude). ` +
    `Then write a single morning-report block for this iteration: action, outcome, metrics, spend this iter, commit sha. ` +
    `Put anything the doctrine says NOT to self-authorize (unanchored ideas, scoring changes, genuine pivots, blocked multi-agent work) into queueItems for the operator.`,
    { label: `record:${k}`, phase: 'Record', schema: RECORD_SCHEMA },
  )
  if (rec) {
    if (rec.hypothesesMoved) moved.push(...rec.hypothesesMoved)
    if (rec.queueItems) queue.push(...rec.queueItems)
  }

  iters++
}

// ── Morning report ─────────────────────────────────────────────────────────
phase('Record')
const stopReason = spentUsd >= BUDGET_USD ? `budget ceiling ($${BUDGET_USD}) reached`
  : !tokenGuard() ? 'orchestration token budget nearly exhausted'
  : iters >= cap ? `iteration cap (${cap}) reached`
  : 'no live work / hard-stop'

await agent(
  `${CONTEXT}\n\nThe night is over. Write/finalize the morning report at ${REPORT} in the exact format from ${DOCTRINE} (TL;DR header the operator can read in 30s, then one block per iteration). ` +
  `Facts to encode: iterations=${iters}, cumulative experiment spend=$${spentUsd.toFixed(2)} of $${BUDGET_USD}, stop reason="${stopReason}". ` +
  `Hypotheses moved: ${moved.length ? moved.join(', ') : 'none'}. ` +
  `Flags (surface in red): ${flags.length ? flags.join(' || ') : 'none'}. ` +
  `OPERATOR QUEUE: ${queue.length ? queue.join(' || ') : 'none'}. ` +
  `Read the per-iteration commits from git log to fill in any blocks not already present. Commit the report to main.`,
  { label: 'report', phase: 'Record' },
)

return {
  date: DATE,
  iterations: iters,
  spentUsd: Number(spentUsd.toFixed(2)),
  budgetUsd: BUDGET_USD,
  stopReason,
  hypothesesMoved: moved,
  flags,
  operatorQueue: queue,
  report: REPORT,
}
