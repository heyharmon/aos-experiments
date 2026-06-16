# Agent OS — an experiment

This repo is not a doctrine. It is an experiment to discover what actually works for putting agents to work.

We build small agent operating systems, give them realistic tasks, and measure outcome quality and token cost. Principles emerge from evidence, not assertion.

## Structure

| Path | What it is |
| --- | --- |
| `HYPOTHESES.md` | Every unproven claim as a falsifiable bet |
| `experiments/` | Each experiment: a system-under-test, a benchmark, and the hypotheses it bears on |
| `experiments/001-personal-assistant/` | First experiment: a personal assistant agent on a shared brain |
| `results/` | The evidence log: run outputs, scores, costs |
| `archive/` | Earlier architecture docs, kept for provenance only. Not authoritative. |

## The one operating principle

For any claim in this repo, you should be able to point at a run in `results/` that supports it. If you cannot, it is a hypothesis, not a fact.

## How to contribute

Pick a hypothesis from `HYPOTHESES.md`, design an experiment, run it, and log the results. If the evidence contradicts the hypothesis, update or retire it.
