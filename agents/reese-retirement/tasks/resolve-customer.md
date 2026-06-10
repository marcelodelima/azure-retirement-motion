---
task: "Resolve Customer"
order: 1
input: |
  - customer_name: Customer name from intake.md (required)
  - tpid: Customer TPID if the CSA already provided one (optional)
output: |
  - candidates: Table of CXObserve matches (TPName, TPID, RetiringServicesCount, ResourcesImpactedCount)
  - resolved: The single confirmed customer + TPID (after checkpoint)
---

# Resolve Customer

Resolve the customer to a single confirmed CXObserve TPID before any data is
pulled. This task drives the cloned skill's pre-flight (API 2 `SearchText`).

## Process

1. **Run the skill version check** (`AGENTS.md` mandatory step): read local
   `VERSION`, fetch `git show origin/main:VERSION`, print `Retirements Agent
   v<local>`. If remote is newer, surface the update prompt to the CSA.
2. **Ensure auth.** Confirm `az login` is active. The skill will request a token
   via `az account get-access-token --resource "api://f748ae1d-5e8a-4aa0-bfb3-67beda3d3676"`. Never echo the token.
3. **If a TPID was provided in intake**, use it directly and fetch the summary to
   confirm the name. Otherwise, call **API 2** (`serviceretirementsbytpidv2`) with
   `SearchText = customer_name`, `Top: 10`, ordered by `RetiringServicesCount desc`.
4. **Present candidates** as a table: TPName · TPID · RetiringServicesCount ·
   ResourcesImpactedCount. Do NOT auto-select — even a single match goes to the
   confirmation checkpoint.
5. **Determine the customer data dir**: scan `CustomerData/` for a case-insensitive
   match; reuse it if present, otherwise note that it will be created.

## Output Format

```yaml
version: "Retirements Agent v<local>"   # plus update note if any
candidates:
  - tpname: "Contoso NV"
    tpid: "1234567"
    retiring_services_count: 7
    resources_impacted_count: 41
resolved:        # populated only after the checkpoint confirms
  tpname: ""
  tpid: ""
  customer_data_dir: "CustomerData/<Customer>"
```

## Output Example

> Use as quality reference, not as rigid template.

```yaml
version: "Retirements Agent v1.3 (up to date)"
candidates:
  - tpname: "Contoso NV"
    tpid: "1234567"
    retiring_services_count: 7
    resources_impacted_count: 41
  - tpname: "Contoso Belgium SA"
    tpid: "7654321"
    retiring_services_count: 2
    resources_impacted_count: 5
resolved:
  tpname: ""        # awaiting Step 03 confirmation checkpoint
  tpid: ""
  customer_data_dir: "CustomerData/Contoso"
```

## Quality Criteria

- [ ] Version check ran and result reported.
- [ ] At least one CXObserve candidate returned (or an explicit "no match" reported).
- [ ] Each candidate shows TPName, TPID, and impact counts.
- [ ] No access token echoed anywhere in the output.

## Veto Conditions

Reject and redo if ANY are true:
1. A TPID was auto-selected without surfacing candidates for confirmation.
2. The version check was skipped.
