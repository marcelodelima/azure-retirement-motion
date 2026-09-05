---
type: checkpoint
outputFile: squads/azure-retirement-motion/output/internal/msx-approval.md
---

# Step 15: Explicit MSX Creation Approval

Show the full proposal from `internal/MSXProposal.md`, including the opportunity,
every milestone, totals, workload mappings, and proposal hash.

## Required response

Offer exactly these choices:

1. `APPROVE MSX <proposal-hash>` — authorize only the displayed proposal.
2. `SKIP MSX <proposal-hash>` — finish the run without creating MSX records.
3. `REVISE MSX` — return to Step 12 with requested changes.

Only choice 1 authorizes writes. Save the user's verbatim response plus timestamp
to `msx-approval.md`. Never infer approval from prior messages or Step 14.

## Veto Conditions

1. Proposal status is not `ready_for_approval` or Quinn did not PASS.
2. The displayed hash differs from the JSON proposal hash.
3. Approval is generic, altered, or missing the exact hash.