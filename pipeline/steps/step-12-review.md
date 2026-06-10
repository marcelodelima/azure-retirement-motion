---
execution: inline
agent: quinn-quality
inputFile: squads/azure-retirement-motion/output/retirement-data/retirements.json
outputFile: squads/azure-retirement-motion/output/review-verdict.md
---

# Step 12: Quality Review

Quinn Quality (inline) performs the final QA pass across **every** artifact — customer-facing (deck, Excel, execution plan, follow-up email) and internal (motion plan, executive briefing) — against `retirements.json` and the squad's quality criteria. She issues a PASS/FAIL verdict and, on FAIL, names the specific agent/step to re-run.

## Context Loading

All artifacts produced in this run:
- `squads/azure-retirement-motion/output/customer/RetirementImpact-<Customer>-<date>.xlsx`
- `squads/azure-retirement-motion/output/customer/ExecutionPlan-<Customer>-<date>.md`
- `squads/azure-retirement-motion/output/customer/FollowUpEmail-<Customer>-<date>.md`
- `squads/azure-retirement-motion/output/internal/MotionPlan-<Customer>-<date>.md`
- `squads/azure-retirement-motion/output/internal/ExecutiveBriefing-<Customer>-<date>.md`

Reference materials:
- `squads/azure-retirement-motion/output/retirement-data/retirements.json` — source of truth
- `squads/azure-retirement-motion/pipeline/data/quality-criteria.md` — every checklist
- `squads/azure-retirement-motion/pipeline/data/anti-patterns.md` — what to flag
- `squads/azure-retirement-motion/pipeline/data/customer-confidentiality-guard.md` — confidentiality rules

## Instructions

### Process
1. **Global checks**: customer-name fidelity, no cross-customer data, urgency labels vs the reporting date, consistent ordering, no fabricated facts.
2. **Per-artifact checks** against each block of `quality-criteria.md` (Excel, execution plan, motion plan, briefing, email).
3. **Confidentiality sweep**: scan every customer-facing artifact for ACR / opportunity / MSX / revenue terms or another customer's name — any hit is a **hard fail**.
4. **Reconcile** counts (Excel rows vs `resources_detail`, summary counts) and figures (briefing vs motion plan).
5. **Verdict**: PASS only if every block passes; otherwise FAIL with findings + a named loop-back target.

### Loop-back routing
- Excel count mismatch → Step 06 (Ethan)
- Execution plan gap → Step 07 (Ravi)
- Motion plan / ACR error → Step 09 (Morgan)
- Briefing inconsistency → Step 10 (Bianca)
- Email leak / tone → Step 11 (Felix)

## Output Format

```markdown
# Review Verdict — {customer_display_name} (run {run_id})

**Verdict:** ✅ PASS | ❌ FAIL
**Reviewed at:** {ISO timestamp}

| Artifact | Result | Finding | Loop-back |
|----------|--------|---------|-----------|
| Excel workbook | PASS/FAIL | {note} | {agent/step} |
| Execution plan | PASS/FAIL | {note} | {agent/step} |
| Motion plan | PASS/FAIL | {note} | {agent/step} |
| Executive briefing | PASS/FAIL | {note} | {agent/step} |
| Follow-up email | PASS/FAIL | {note} | {agent/step} |

**Global:** urgency vs {reporting_date}, ordering, no cross-customer data, no leakage — {summary}.
```

## Output Example

See `agents/quinn-quality.agent.md` — the PASS and FAIL verdict examples.

## Veto Conditions

1. Any stale urgency label (computed against a wrong/old date).
2. Any internal/ACR content in a customer-facing artifact (hard fail).
3. Any Excel sheet whose row count ≠ `resources_detail.length`.
4. Any cross-customer data leak.

## Quality Criteria

- [ ] Every artifact checked against its quality-criteria block.
- [ ] Confidentiality sweep run on all customer-facing artifacts.
- [ ] Verdict is PASS only if all blocks pass; FAIL lists findings + loop-back targets.
- [ ] Verdict saved to `output/{run_id}/review-verdict.md`.
