#!/usr/bin/env python3
"""Aggregate 008 results into a roles-vs-skills comparison table."""
import json
import pathlib

EXP = pathlib.Path(__file__).resolve().parent
RES = EXP / "runtime" / "results"

DELIVERIES = ["roles", "skills"]
WORLDS = ["dev", "heldout"]


def load(delivery, world, task):
    p = RES / delivery / world / task / "score.json"
    if not p.exists():
        return None
    return json.loads(p.read_text())


def cell(delivery, world, task):
    d = load(delivery, world, task)
    if not d:
        return "   -   "
    s = f"{d['pass_count']}/{d['trials']}"
    tag = "PASS" if d["pass"] else "FAIL"
    if d.get("flaky"):
        tag = "FLAKY"
    return f"{tag} {s}"


def costs(delivery, world, task):
    d = load(delivery, world, task)
    if not d:
        return None, None
    ac = [t.get("cost_usd") for t in d["per_trial"] if isinstance(t.get("cost_usd"), (int, float))]
    jc = [t.get("judge_cost_usd") for t in d["per_trial"] if isinstance(t.get("judge_cost_usd"), (int, float))]
    return (round(sum(ac) / len(ac), 4) if ac else None,
            round(sum(jc), 4) if jc else None)


tasks_by_world = {"dev": ["FAB-GAP", "FAB-USE"],
                  "heldout": ["FAB-GAP-H", "FAB-USE-H"]}

print("\n=== 008 roles vs skills: outcome matrix ===\n")
hdr = f"{'task':<12} {'world':<8} {'A_roles':<12} {'A_skills':<12}"
print(hdr)
print("-" * len(hdr))
total_agent = {"roles": 0.0, "skills": 0.0}
total_judge = {"roles": 0.0, "skills": 0.0}
for world in WORLDS:
    for task in tasks_by_world[world]:
        print(f"{task:<12} {world:<8} {cell('roles', world, task):<12} "
              f"{cell('skills', world, task):<12}")
        for deliv in DELIVERIES:
            ac, jc = costs(deliv, world, task)
            if ac:
                total_agent[deliv] += ac * (load(deliv, world, task)["trials"])
            if jc:
                total_judge[deliv] += jc

print("\n=== cost (provider JSON) ===")
for deliv in DELIVERIES:
    print(f"  A_{deliv}: agent ${total_agent[deliv]:.3f} "
          f"+ judge ${total_judge[deliv]:.3f} "
          f"= ${total_agent[deliv] + total_judge[deliv]:.3f}")

print("\n=== judge scores (FAB-USE, over-escalation control) ===")
for world in WORLDS:
    t = "FAB-USE" if world == "dev" else "FAB-USE-H"
    for deliv in DELIVERIES:
        d = load(deliv, world, t)
        if d:
            js = [pt.get("judge_score") for pt in d["per_trial"]]
            print(f"  {t:<10} {world:<8} A_{deliv:<6} judge_scores={js}")
