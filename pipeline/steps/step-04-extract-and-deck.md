---
execution: subagent
agent: reese-retirement
model_tier: powerful
inputFile: squads/azure-retirement-motion/output/confirmed-customer.md
outputFile: squads/azure-retirement-motion/output/retirement-data/collection-report.md
---

# Step 04: Extract Retirements & Generate Deck

Reese Retirement runs as a subagent. Using the confirmed TPID, she pulls the full retirement picture across all three CXObserve APIs, enriches each item, writes the `retirements.json` contract, and then orchestrates the external skill's PowerPoint generation end-to-end.

This step executes Reese's `extract-retirements` and `generate-deck` tasks. See `agents/reese-retirement/tasks/extract-retirements.md` and `agents/reese-retirement/tasks/generate-deck.md`.

## Context Loading

- `squads/azure-retirement-motion/output/confirmed-customer.md` — confirmed TPID + display name
- `squads/azure-retirement-motion/output/intake.md` — reporting date (urgency reference)
- `squads/azure-retirement-motion/pipeline/data/domain-framework.md` — APIs, retirements.json contract, urgency rules
- `squads/azure-retirement-motion/pipeline/data/research-brief.md` — retirement→replacement mappings, MS Learn enrichment
- External skill at `<cloned retirements-agent repo>`

## Instructions

### Process
1. **API 2** (`serviceretirementsbytpidv2`) — summary for the confirmed TPID.
2. **API 1** (`serviceretirementsservicesv2`) — per-retirement detail for each retiring feature.
3. **API 3** (`serviceRetirementsCustomersFlattened`) — per-resource detail (resources_detail[]).
4. **Classify urgency** of every retirement against the reporting date: Overdue / Critical (≤3mo) / Upcoming (3–12mo) / Future (>12mo).
5. **Enrich** each retirement with replacement service, migration steps, and a learn_more_link (use MS Learn MCP where the skill leaves gaps).
6. **Order** everything: urgency → impact (High→Med→Low) → impacted-resource count desc.
7. **Write** `CustomerData/<Customer>/retirements.json` (full contract) and **mirror** it to `output/{run_id}/retirement-data/retirements.json`.
8. **Generate the deck** — `npm install`, set `CUSTOMER_NAME` + `CUSTOMER_DATA_DIR`, run `npm run generate`. Copy the resulting `.pptx` to `output/{run_id}/customer/`.
9. **Write** the collection report summarizing counts and the deck path.

### Decision Criteria
- **Zero retirements for the TPID:** write an empty contract + report it; the run can still produce a "clean bill of health" briefing/email.
- **API 3 missing resource detail for an item:** keep the retirement with impacted counts; note the resource gap in the report.
- **Deck generation fails:** capture the npm error; preserve `retirements.json` so downstream agents still run.

## Output Format

```markdown
# Retirement Collection Report — {customer_display_name}

**Collected at:** {ISO timestamp}
**TPID:** {tpid}
**Reporting date:** {YYYY-MM-DD}
**Total retirements:** {n}
**Urgency split:** Overdue {a} · Critical {b} · Upcoming {c} · Future {d}
**Total impacted resources:** {r} across {s} subscriptions, {w} workloads

## Retirements (ordered)

| # | Service | Retiring feature | Retirement date | Urgency | Impact | Resources |
|---|---------|------------------|-----------------|---------|--------|-----------|
| 1 | {svc} | {feature} | {date} | Critical | High | {n} |

## Artifacts
- retirements.json → output/{run_id}/retirement-data/retirements.json
- Deck → output/{run_id}/customer/RetirementAssessment-{Customer}-{date}.pptx

## Gaps / errors
- {any missing resource detail, enrichment gap, or deck error}
```

## Veto Conditions

1. `retirements.json` not written or fails the contract (missing required fields).
2. Urgency labels not computed against the reporting date.
3. Deck path reported but file does not exist (and no error captured).

## Quality Criteria

- [ ] All three APIs queried; counts reconcile across summary and detail.
- [ ] Every retirement classified by urgency vs the reporting date.
- [ ] `retirements.json` matches the contract in domain-framework.md.
- [ ] Deck generated (or error captured) and copied to `output/{run_id}/customer/`.
- [ ] No data written outside `output/{run_id}/`.
