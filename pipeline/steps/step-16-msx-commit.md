---
execution: inline
agent: moxie-msx
inputFile: squads/azure-retirement-motion/output/internal/msx-approval.md
outputFile: squads/azure-retirement-motion/output/internal/MSXCreationReceipt.md
---

# Step 16: Commit Approved MSX Records and Finalize

Moxie either commits the exact hash-approved proposal or records a clean skip.

## Context Loading

- approved version of `output/{run_id}/internal/MSXProposal.json`
- `output/{run_id}/internal/msx-approval.md`
- any existing `MSXCreationReceipt.json` from a prior partial attempt

## Instructions

1. Follow Moxie's Commit Process exactly.
2. If the response is `SKIP MSX <hash>`, make zero writes and create skipped
   Markdown/JSON receipts.
3. If approved, recheck duplicates and existing milestone coverage. In create
   mode, create the opportunity once and bind each milestone to its returned GUID.
   The create payload must atomically bind the approved Sales Program; read it
   back through `msp_opportunitysalesprograms_association` before completion.
   In reuse mode, make no opportunity write and bind only approved delta milestones
   to the existing GUID after confirming no covered source key has changed.
4. Write `MSXCreationReceipt.md` to the transformed `outputFile` and a sibling
   `MSXCreationReceipt.json` after every state change.
5. Append the run result to `_memory/runs.md`, including `MSX completed`,
   `MSX skipped`, or `MSX partial` and the opportunity ID when available.

## Veto Conditions

1. Any write without an exact matching approval phrase.
2. Any payload differs from the approved proposal except insertion of the
   returned opportunity binding in milestone payloads.
3. A duplicate is found during the immediate pre-commit check.
4. Parent opportunity is recreated after its GUID has been persisted or approved for reuse.
5. A reuse-mode source key is now represented by an existing milestone but remains in the create delta.
6. Receipt omits a successful or failed operation.
7. A newly created opportunity does not read back with exactly the approved
   `Belux | Resiliency | Service Retirements` Sales Program.

## Quality Criteria

- [ ] Approval hash and proposal hash match.
- [ ] Receipt is complete and retry-safe.
- [ ] Created record IDs are listed, or skip/partial status is explicit.
- [ ] Run history records the MSX outcome.
- [ ] Create-mode receipt records and verifies the Sales Program association;
   reuse mode records that no Sales Program change was attempted.