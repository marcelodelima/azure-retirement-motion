---
execution: inline
agent: moxie-msx
inputFile: squads/azure-retirement-motion/output/retirement-data/retirements.json
outputFile: squads/azure-retirement-motion/output/internal/MSXProposal.md
---

# Step 12: Build the MSX Creation Proposal (Read-Only)

Moxie resolves MSX IDs with read-only calls and generates the exact opportunity
and milestone payloads for human review. **This step must make zero MSX writes.**

## Context Loading

- `output/{run_id}/confirmed-customer.md`
- `output/{run_id}/intake.md`
- latest version of `output/{run_id}/retirement-data/retirements.json`
- `_build/motion-classify.js`
- `_build/build-msx-proposal.js`
- template opportunity `df4bcf3c-00a2-f111-b8dc-002248329321`

## Instructions

1. Follow Moxie's Proposal Process completely.
2. Resolve the account by exact confirmed TPID, its currency, all workloads, and
   open Service Retirement opportunities. A matching active currency price list
   is required when creating a parent, but not when reusing a supplied existing
   parent whose currency has been read back.
3. In create-new mode, resolve exactly one active Sales Program named
   `Belux | Resiliency | Service Retirements`, validate its active dates, and
   record its ID. Bind it through
   `msp_opportunitysalesprograms_association@odata.bind` in the opportunity
   create payload. Reuse-existing mode does not change Sales Programs.
4. In the configured latest FY BELUX MAL, match the same TPID in `Account
   Coverage Matrix` once via the shared MAL coverage skill. Resolve Azure
   Specialist, CSAM, and AE; save sibling `MALCoverage.json`; bind the enabled
   Azure Specialist MSX user to the opportunity and every milestone.
5. Generate both `MSXProposal.md` (the transformed `outputFile`) and a sibling
   `MSXProposal.json` in the same version directory.
6. Present the proposal status, hash, opportunity owner, Sales Program action,
   milestone count,
   annual lower ACR, proposed monthly use, and review path.
7. Do not request commit approval here; Step 15 owns the approval checkpoint.
8. For each milestone, show the source retirement date and proposed estimation
   date. Apply December 30 of the current fiscal year to every Overdue row and
   every other row before that midpoint; retain dates on or after it.
9. If the user supplies an existing opportunity, read back every milestone,
   record semantic `coveredSourceKeys`, exclude those source keys from the delta,
   and bind the proposal hash to the existing GUID plus audited coverage.
10. If the user explicitly requires the existing owner to remain, validate that
   the named enabled MSX user currently owns the supplied opportunity, audit all
   current milestone owners, disclose any MAL difference, and bind all proposed
   delta milestones to that same owner.

## Veto Conditions

1. Any Dataverse write call is made.
2. `writeCallsMade` is not exactly `0`.
3. Proposal status is not `ready_for_approval`.
4. A required account/currency/workload/owner GUID, MAL evidence, duplicate check,
   or approval hash is missing; price list is required only for create mode.
5. Reuse mode lacks an open user-supplied opportunity for the confirmed TPID or
   an audited mapping of all existing milestones to covered source keys.
6. Create-new mode lacks one exact active `Belux | Resiliency | Service Retirements`
   record or omits its association bind from the opportunity payload.
7. A monetary value is not a whole multiple of 100.
8. A milestone estimation date violates the fiscal midpoint rule.

## Quality Criteria

- [ ] Proposal is complete, deterministic, and read-only.
- [ ] One milestone exists per revenue-classified retirement with impacted resources.
- [ ] Every milestone shows source retirement, lower annual ACR, monthly conversion, and workload.
- [ ] MAL evidence is recorded and the opportunity plus every milestone bind the same enabled owner.
- [ ] Source and estimation dates are shown and comply with the fiscal midpoint rule.
- [ ] Markdown and JSON proposals carry the same approval hash.
- [ ] Reuse-mode proposal creates no parent and excludes every audited covered source key.
- [ ] Create-mode proposal hash includes the exact active Sales Program and the
   opportunity payload atomically binds it through the verified relationship.