---
type: checkpoint
---

# Step 05: Data Review

Human checkpoint. The CSA reviews Reese's collection report and the generated deck before the squad builds the rest of the deliverables. This is the gate that confirms the data is correct and complete.

## Context Loading

- `squads/azure-retirement-motion/output/retirement-data/collection-report.md` — counts + urgency split
- `squads/azure-retirement-motion/output/retirement-data/retirements.json` — full contract
- `squads/azure-retirement-motion/output/customer/RetirementAssessment-*.pptx` — generated deck

## What to review

Present the CSA with:
1. **Totals** — retirement count, urgency split, impacted resource/subscription/workload counts.
2. **Ordered retirement table** — top items by urgency and impact.
3. **Deck status** — generated successfully? Spot-check it opens and reflects the data.
4. **Gaps** — any missing resource detail or enrichment flagged in the report.

## Questions to ask

1. **Does the retirement data look correct and complete?** (yes / fix needed)
2. **Any retirements to exclude or re-scope?** (e.g., out-of-scope subscriptions)
3. **Proceed to build the Excel, execution plan, and internal artifacts?**

## Veto Conditions

1. CSA reports the data is wrong → loop back to Step 04 (re-extract) or Step 02 (wrong customer).
2. Deck failed to generate and the CSA wants it before proceeding → re-run Step 04 deck task.

## Quality Criteria

- [ ] CSA has explicitly approved the data.
- [ ] Any exclusions are recorded for downstream agents.
