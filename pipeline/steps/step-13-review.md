---
execution: inline
agent: quinn-quality
inputFile: squads/azure-retirement-motion/output/retirement-data/retirements.json
outputFile: squads/azure-retirement-motion/output/review-verdict.md
---

# Step 13: Quality Review

Quinn Quality performs the final QA pass across every customer-facing and
internal artifact, including Moxie's read-only MSX proposal.

## Context Loading

All artifacts produced in this run, including:
- `output/{run_id}/customer/RetirementImpact-*.xlsx`
- `output/{run_id}/customer/ExecutionPlan-*.md`
- `output/{run_id}/customer/FollowUpEmail-*.md`
- `output/{run_id}/internal/MotionPlan-*.md`
- `output/{run_id}/internal/ExecutiveBriefing-*.md`
- `output/{run_id}/internal/MSXProposal.md` and `MSXProposal.json`
- latest `output/{run_id}/retirement-data/retirements.json`
- `pipeline/data/quality-criteria.md`
- `pipeline/data/anti-patterns.md`
- `pipeline/data/customer-confidentiality-guard.md`

## Instructions

1. Run the existing global, artifact, confidentiality, count, and figure checks.
2. For the MSX proposal, verify:
   - status is `ready_for_approval`, `writeCallsMade` is `0`, and no blockers exist;
   - account TPID, currency, matching active price list, workload names/GUIDs, and duplicate check are present;
   - proposed rows exactly equal revenue-classified retirements with impacted resources;
   - lower annual ACR comes from `loRate × impacted_resources`;
   - monthly use follows the declared conversion and every money value is divisible by 100;
   - opportunity and milestone payloads use required fields and exact custom lookup casing;
   - Markdown and JSON approval hashes match.
3. PASS only if all artifact blocks pass. Otherwise name the owning step.

### Loop-back routing

- Excel → Step 06 (Ethan)
- Execution plan → Step 07 (Ravi)
- Motion plan / ACR → Step 09 (Morgan)
- Briefing → Step 10 (Bianca)
- Email → Step 11 (Felix)
- MSX proposal → Step 12 (Moxie)

## Veto Conditions

1. Any stale urgency, fabricated fact, cross-customer leak, or customer-facing ACR.
2. Any MSX write occurred before approval.
3. Any unresolved, duplicate, mathematically invalid, or unhashable MSX proposal.

## Quality Criteria

- [ ] Every artifact and the MSX proposal are checked.
- [ ] Confidentiality sweep passes.
- [ ] Verdict names precise loop-back targets.
- [ ] Verdict is saved under `output/{run_id}/review-verdict.md`.