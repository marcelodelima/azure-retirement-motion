---
type: checkpoint
---

# Step 13: Final Approval

Final human checkpoint. Quinn has issued her verdict. The CSA reviews the full output package and approves the run for delivery. This closes the engagement and updates the squad's run history.

## Context Loading

- `squads/azure-retirement-motion/output/review-verdict.md` — Quinn's verdict
- `squads/azure-retirement-motion/output/customer/` — deck, Excel, execution plan, follow-up email
- `squads/azure-retirement-motion/output/internal/` — motion plan, executive briefing

## What to present

Summarize the full package:
- **Customer artifacts:** deck, Excel impact workbook, execution plan, follow-up email.
- **Internal artifacts:** motion plan (with ACR band), executive briefing.
- **Quinn's verdict:** PASS/FAIL and any notes.
- **Headline numbers:** retirement count, urgency split, total ACR opportunity band.

## Questions to ask

1. **Approve this run for delivery?** (approve / send back)
2. **Any final notes to record in the run history?**

## On approval

- Append a row to `_memory/runs.md` (Date | Run ID | Customer | TPID | Retirements | Output | Result).
- Capture key learnings in `_memory/memories.md` (data quirks, ACR assumptions that held, customer-specific notes).

## Veto Conditions

1. Quinn's verdict is FAIL and the named rework has not been completed → loop back to the named step.

## Quality Criteria

- [ ] CSA has explicitly approved.
- [ ] Run history updated in `_memory/runs.md`.
- [ ] Key learnings captured in `_memory/memories.md`.
