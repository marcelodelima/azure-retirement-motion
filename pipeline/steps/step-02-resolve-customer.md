---
execution: subagent
agent: reese-retirement
model_tier: fast
inputFile: squads/azure-retirement-motion/output/intake.md
outputFile: squads/azure-retirement-motion/output/retirement-data/customer-candidates.md
---

# Step 02: Resolve Customer & TPID

Reese Retirement runs as a subagent. She performs the **mandatory version check** on the external Azure Service Retirements skill, then resolves the customer to a TPID using CXObserve API 2 (`serviceretirementsbytpidv2` with `SearchText`). She returns a candidate table for the CSA to confirm.

This step executes Reese's `resolve-customer` task. See `agents/reese-retirement/tasks/resolve-customer.md`.

## Context Loading

- `squads/azure-retirement-motion/output/intake.md` — customer name + optional TPID
- `squads/azure-retirement-motion/pipeline/data/domain-framework.md` — CXObserve API 2 details
- `squads/azure-retirement-motion/pipeline/data/research-brief.md` — skill engine details
- External skill at `<cloned retirements-agent repo>` — `AGENTS.md`, `agent-retirements/agent.md`

## Instructions

### Process
1. **Version check** — compare local `VERSION` against `git show origin/main:VERSION` in the cloned retirements-agent repo. If behind, stop and instruct the CSA to `git pull` before continuing.
2. **Auth** — confirm `az login` is active; acquire token for `api://f748ae1d-5e8a-4aa0-bfb3-67beda3d3676`.
3. **Resolve** — if a TPID was provided in intake, validate it via API 2 and skip search. Otherwise call API 2 with `SearchText` = customer name and build a candidate list.
4. **Write** the candidate table to the output file.

### Decision Criteria
- **Exact single match:** present it as the confirmed candidate (still require CSA confirmation at step 03).
- **Multiple candidates:** list all with TPID, matched name, and retirement count; let the CSA pick.
- **No match:** report it and suggest alternate spellings; do not fabricate a TPID.

## Output Format

```markdown
# Customer Candidates — {customer_name}

**Resolved at:** {ISO timestamp}
**Skill version:** {local VERSION} (up to date: yes/no)

| # | TPID | Matched name | Retirement count | Confidence |
|---|------|--------------|------------------|------------|
| 1 | {tpid} | {name} | {n} | high/med/low |

**Recommended:** Candidate #{n}
```

## Veto Conditions

1. Skill version is behind origin/main (must update before proceeding).
2. Auth/token acquisition failed (CSA must `az login`).
3. No customer name available in intake.

## Quality Criteria

- [ ] Version check performed and result recorded.
- [ ] Candidates include TPID + matched name + retirement count.
- [ ] No fabricated TPIDs; "no match" reported honestly.
- [ ] Output written under `output/{run_id}/retirement-data/`.
