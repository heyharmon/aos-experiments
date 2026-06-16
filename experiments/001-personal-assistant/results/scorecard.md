# Scorecard, exp 001 personal-assistant, full 10-task suite

Date: 2026-06-16
Model (agent-under-test): claude-sonnet-4-6 (via `claude -p`)
Judge model: claude-sonnet-4-6 (Tier-2 LLM judge, via `claude -p`)
Trials per task: 3 (pass = strict majority of trials; median agent cost across trials)

All cost/token figures are read from the provider JSON run records, never estimated. `tokens_in` is TOTAL input (uncached + cache-read + cache-creation). Judge cost is the judge call's own `total_cost_usd`, summed across trials, recorded separately from agent cost.

| Task | Kind | Scoring | Pass | Flaky | Judge score | Median agent cost | Judge cost (total) | Median tokens_in | Median tokens_out |
|---|---|---|---|---|---|---|---|---|---|
| T1 | retrieval | assertion | PASS | no |  | 0.102935 |  | 105903 | 377 |
| T2 | triage | hybrid | PASS | no | 2 | 0.073437 | 0.317086 | 50516 | 491 |
| T3 | prioritization | judge | PASS | no | 2 | 0.101028 | 0.307348 | 51537 | 1921 |
| T4 | drafting | assertion | PASS | no |  | 0.159727 |  | 200354 | 1188 |
| T5 | multi-step | hybrid | FAIL | no | 2 | 0.086108 | 0.294844 | 51278 | 1029 |
| T6 | judgment | hybrid | PASS | no | 2 | 0.184634 | 0.282421 | 236477 | 1843 |
| T7 | escalate-vs-act | assertion | PASS | no |  | 0.139586 |  | 139694 | 1539 |
| T8 | filing | hybrid | FAIL | no | 2 | 0.282113 | 0.308030 | 340872 | 4210 |
| T9 | missing-info | hybrid | PASS | yes | 3 | 0.104714 | 0.259988 | 106702 | 337 |
| T10 | briefing | judge | PASS | no | 3 | 0.166936 | 0.336904 | 145205 | 2648 |

## Totals

- Pass rate: 8/10 (80%)
- Total cost incl. judge: 3.507839 (agent 1.401218 + judge 2.106621)
- Mean agent cost per task: 0.140122
- Escalation accuracy: 0/1 (0%) of expects_escalation tasks handled correctly
