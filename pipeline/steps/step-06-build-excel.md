---
execution: subagent
agent: ethan-excel
model_tier: fast
inputFile: squads/azure-retirement-motion/output/retirement-data/retirements.json
outputFile: squads/azure-retirement-motion/output/customer/RetirementImpact-report.md
---

# Step 06: Build Impacted-Resources Excel Workbook

Ethan Excel runs as a subagent. He builds a **single `.xlsx` workbook with one sheet per retirement**, listing every impacted resource from `resources_detail[]`. This is the customer-facing resource-level breakdown.

## Context Loading

- `squads/azure-retirement-motion/output/retirement-data/retirements.json` — full contract (source of truth)
- `squads/azure-retirement-motion/output/confirmed-customer.md` — display name
- `squads/azure-retirement-motion/pipeline/data/output-examples.md` — Example 1 (Excel layout)
- `squads/azure-retirement-motion/pipeline/data/customer-confidentiality-guard.md` — customer-facing rules

## Instructions

### Process
1. **Load** `retirements.json`; iterate retirements in the canonical order (urgency → impact → resource count).
2. **One sheet per retirement.** Sheet name = Excel-safe (≤31 chars, no `: \ / ? * [ ]`), derived from service + feature; deduplicate collisions.
3. **Columns** (exact): `Resource` · `Subscription` · `Resource Group` · `Location` · `Workload`.
4. **One row per entry** in that retirement's `resources_detail[]`. Row count MUST equal `resources_detail.length`.
5. **Header row** styled/frozen; optional summary sheet listing each retirement, its date, urgency, and resource count.
6. **No ACR / opportunity / internal columns** — this file goes to the customer.
7. **Write** the workbook via code execution to `output/{run_id}/customer/RetirementImpact-<Customer>-<date>.xlsx`. Write a short markdown confirmation report (this step's `outputFile`).

### Decision Criteria
- **Retirement with zero resources_detail:** still create its sheet with the header and a "no resource detail available" note row.
- **Sheet-name collision after truncation:** append a numeric suffix within the 31-char limit.
- **Very large resource lists:** keep all rows (do not truncate); Excel handles it.

## Output Format

```markdown
# Excel Build Report — {customer_display_name}

**Built at:** {ISO timestamp}
**Workbook:** output/{run_id}/customer/RetirementImpact-{Customer}-{date}.xlsx
**Sheets:** {n} (one per retirement{+ summary})

| Sheet | Retirement | Rows | resources_detail length | Match |
|-------|------------|------|-------------------------|-------|
| {name} | {service – feature} | {r} | {r} | ✓ |
```

## Output Example

See `pipeline/data/output-examples.md` Example 1 — the per-retirement sheet layout and columns.

## Veto Conditions

1. Any sheet's row count ≠ its `resources_detail.length`.
2. Any sheet name exceeds 31 chars or contains forbidden characters.
3. Any ACR/opportunity/internal column present (customer-facing breach).

## Quality Criteria

- [ ] Single workbook, one sheet per retirement.
- [ ] Columns exactly: Resource, Subscription, Resource Group, Location, Workload.
- [ ] Row counts reconcile to `resources_detail` for every sheet.
- [ ] Excel-safe sheet names ≤31 chars, no collisions.
- [ ] No internal data; saved under `output/{run_id}/customer/`.
