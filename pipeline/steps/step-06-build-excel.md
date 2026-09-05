---
execution: subagent
agent: ethan-excel
model_tier: fast
inputFile: squads/azure-retirement-motion/output/retirement-data/retirements.json
outputFile: squads/azure-retirement-motion/output/customer/RetirementImpact-report.md
---

# Step 06: Build Impacted-Resources Excel Workbook

Ethan Excel runs as a subagent. He builds a **single `.xlsx` workbook with `Read Me`, `Summary`, and one numbered resource sheet per retirement**. This is the customer-facing retirement and resource-level breakdown.

## Context Loading

- `squads/azure-retirement-motion/output/retirement-data/retirements.json` — full contract (source of truth)
- `squads/azure-retirement-motion/output/confirmed-customer.md` — display name
- `squads/azure-retirement-motion/pipeline/data/output-examples.md` — Example 1 (Excel layout)
- `squads/azure-retirement-motion/pipeline/data/customer-confidentiality-guard.md` — customer-facing rules

## Instructions

### Process
1. **Load** `retirements.json`; iterate retirements in the canonical order (urgency → impact → resource count).
2. **Read Me sheet.** Explain scope, source/report date, urgency, filtering, sheet roles, official links, and confidentiality. Wrap text and set every used row, including title and spacer, to a fixed height of 80 pixels (60 points at 96 DPI); do not add a Data Limitations row.
3. **Summary columns** (exact): `#` · `Service Name` · `Retirement` · `Urgency` · `Impact` · `Retirement Date` · `Impacted Resources` · `Impacted Subscriptions` · `Impacted Workloads` · `Recommendation` · `Potential Benefit` · `Resource Type` · `Learn More`. Use `label` as the official full retirement name, falling back to `retiring_feature` only when absent.
4. **One resource sheet per retirement.** Name each sheet `{number}. {official full retirement name}` in canonical Summary order; replace Excel-illegal characters, collapse whitespace, and truncate the complete title to Excel's maximum 31 characters.
5. **Resource columns** (exact): `Retirement` · `Subscription Name` · `Subscription ID` · `Resource Group` · `Resource Name` · `Resource Type` · `Location` · `Resource ID` · `Azure Portal`. The Retirement column uses the official full name.
6. **One resource row per entry** in that retirement's `resources_detail[]`. Each sheet's row count MUST equal its own source length; do not add placeholder rows.
7. **Style, freeze, and filter** Summary and every resource header; align header text vertically in the middle and horizontally left. Each populated official notice cell displays `Learn More` and links to that retirement's full `learn_more_link` URL. `Azure Portal` links from a real `resource_id`. Derive a missing Subscription ID from `/subscriptions/{id}` in the ARM resource ID; otherwise leave missing source values blank.
8. **No ACR / opportunity / internal columns** — this file goes to the customer.
9. **Write** the workbook via code execution to `output/{run_id}/customer/RetirementImpact-<Customer>-<date>.xlsx`. Write a short markdown confirmation report (this step's `outputFile`).

### Decision Criteria
- **Retirement with zero resources_detail:** include it in Summary; add no placeholder resource row.
- **Missing ID/date/link:** leave the cell blank; never infer or fabricate it.
- **Very large resource lists:** keep all rows (do not truncate); Excel handles it.

## Output Format

```markdown
# Excel Build Report — {customer_display_name}

**Built at:** {ISO timestamp}
**Workbook:** output/{run_id}/customer/RetirementImpact-{Customer}-{date}.xlsx
**Sheets:** Read Me | Summary | {n numbered retirement sheets}

| Sheet | Retirement | Rows | Source count | Match |
|-------|------------|------|--------------|-------|
| 1. {truncated official name} | {official full name} | {d} | {resources_detail.length} | ✓ |
```

## Output Example

See `pipeline/data/output-examples.md` Example 1 — the numbered sheet layout and columns.

## Veto Conditions

1. Resource sheet count/order differs from the canonical retirement list.
2. A resource sheet name does not follow `{number}. {official name}`, is unsafe, duplicated, or exceeds 31 characters.
3. Summary or per-retirement resource row counts do not reconcile to source.
4. Column names/order differ from the documented schemas.
5. Any source-backed hyperlink is missing or any link/ID is fabricated.
6. Any ACR/opportunity/internal column present (customer-facing breach).

## Quality Criteria

- [ ] Single workbook with Read Me and Summary first, then one numbered sheet per retirement.
- [ ] Summary and every resource sheet use the official full retirement name.
- [ ] Resource sheet names follow `{number}. {official name}`, are Excel-safe and unique, and do not exceed 31 characters.
- [ ] Summary and resource columns match their exact schemas.
- [ ] Summary and each resource sheet's row counts reconcile to source.
- [ ] Summary and every resource sheet are filterable with frozen, styled headers.
- [ ] Data headers are vertically centered and horizontally left-aligned.
- [ ] Every official notice displays `Learn More` and targets that retirement's source URL; Portal hyperlinks are source-backed.
- [ ] Subscription IDs are present when supplied directly or embedded in ARM resource IDs.
- [ ] Read Me has no Data Limitations row; every used row is wrapped and fixed at 80 pixels high.
- [ ] No internal data; saved under `output/{run_id}/customer/`.
