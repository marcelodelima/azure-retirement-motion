---
task: "Extract Retirements"
order: 2
input: |
  - resolved: Confirmed customer TPName + TPID + customer_data_dir
output: |
  - retirements_json: Path to the enriched retirements.json
  - collection_report: Summary table of APIs called, counts, and gaps
---

# Extract Retirements

Drive the cloned skill's Stage 1 (data extraction) and Stage 2 (enrichment) to
produce `retirements.json` for the confirmed customer.

## Process

1. **Acquire token** (skill does this): `az account get-access-token --resource
   "api://f748ae1d-5e8a-4aa0-bfb3-67beda3d3676"`. Never echo it.
2. **API 2 — summary** (`serviceretirementsbytpidv2`, `Filter: TPID eq '{tpid}'`):
   capture `RetiringServicesCount`, `ImpactedWorkloadsCount`,
   `SubscriptionImpactedCount`, `ResourcesImpactedCount`. Report immediately.
3. **API 1 — detail** (`serviceretirementsservicesv2`, `OrderBy: RetirementDate asc`,
   `Top: 100`): one record per retirement with `ServiceName`, `RetiringFeature`,
   `RetirementDate`, `Impact`, `Description`, `LearnMoreLink`, `PotentialBenefit`,
   `ResourceType`, `FirstSeenDate`, and impacted counts.
4. **API 3 — flattened** (`serviceRetirementsCustomersFlattened`, `Top: 30000`):
   per-resource rows with `Name`, `SubscriptionName`, `SubscriptionId`,
   `ResourceGroup`, `Location`, `EntityName` (workload), `ResourceType`,
   `ArmResourceId`. Group by retirement and retain every row without truncation.
5. **Enrichment (Stage 2):** for each retirement classify urgency
   (Overdue/Critical/Upcoming/Future vs the run date), generate `migration_steps`
   and `exec_comment`, attach `resources_detail[]`. Sort by urgency → impact →
   impacted-resource count desc.
6. **Write** `CustomerData/<Customer>/retirements.json` (skill schema). Validate it
   is a well-formed array with all contract fields incl. `resources_detail`.
7. **Mirror** the json and a `collection-report.md` into
   `output/{run_id}/retirement-data/` for the rest of the squad.

## Output Format

```markdown
# Retirement Data Collection — {TPName}

**Run date:** {YYYY-MM-DD} · **TPID:** {tpid}
**Summary:** {RetiringServicesCount} retirements · {ResourcesImpactedCount} resources · {SubscriptionImpactedCount} subscriptions · {ImpactedWorkloadsCount} workloads

| API | Endpoint | Records | File |
|-----|----------|---------|------|
| 2 | serviceretirementsbytpidv2 | summary | (in report) |
| 1 | serviceretirementsservicesv2 | {N} | retirements.json |
| 3 | serviceRetirementsCustomersFlattened | {M} | retirements.json (resources_detail) |

## Retirements (ordered by urgency)
| Service | Retiring feature | Date | Urgency | Impact | Resources |
|---------|------------------|------|---------|--------|-----------|
| ... | ... | ... | ... | ... | ... |

## Gaps / errors
- {none | description}
```

## Output Example

See `pipeline/data/output-examples.md`. The `retirements.json` schema is defined
in `pipeline/data/domain-framework.md` (canonical contract).

## Quality Criteria

- [ ] All three APIs called in order; summary reported before detail.
- [ ] `retirements.json` is valid JSON, array, all contract fields present.
- [ ] Each retirement has `resources_detail[]` whose length == its impacted-resource count (or gap noted).
- [ ] Retirements sorted by urgency → impact → resource count desc.
- [ ] Mirrored copy written under `output/{run_id}/retirement-data/`.

## Veto Conditions

Reject and redo if ANY are true:
1. `retirements.json` is missing, empty, or malformed when CXObserve returned retirements.
2. Urgency was computed against any date other than the run date.
