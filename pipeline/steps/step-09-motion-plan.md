---
execution: inline
agent: morgan-motion
inputFile: squads/azure-retirement-motion/output/retirement-data/retirements.json
outputFile: squads/azure-retirement-motion/output/internal/MotionPlan-report.md
---

# Step 09: Motion & Opportunity Plan (with ACR)

Morgan Motion (inline) builds the **internal motion plan** — mapping each retirement to MSX opportunities/milestones and estimating the ACR (Azure Consumed Revenue) each modernization could generate. This is an internal-only artifact; it must never reach the customer.

## Context Loading

- `squads/azure-retirement-motion/output/retirement-data/retirements.json` — retirements + impacted scale
- `squads/azure-retirement-motion/output/retirement-data/collection-report.md` — totals
- `squads/azure-retirement-motion/pipeline/data/domain-framework.md` — ACR estimation method, North Star (JOB2)
- `squads/azure-retirement-motion/pipeline/data/research-brief.md` — ACR reference points, retirement→replacement
- `squads/azure-retirement-motion/pipeline/data/output-examples.md` — Example 3 (motion table with ACR)
- `squads/azure-retirement-motion/pipeline/data/customer-confidentiality-guard.md` — internal-only rules

## Instructions

### Process
1. **Load** `retirements.json`, the collection report, and the shared
	`retirement-intelligence-model`; record its model version in the output.
2. For **each retirement**, use the shared model to decide the motion type:
	**revenue motion** (modernization → new/expanded consumption) or **hygiene**
	(config change, no net-new ACR).
3. For revenue motions, map to an **MSX opportunity / milestone** (name the modern target service and the consumption it drives).
4. **Estimate ACR as a band** (low–high) per item, with **stated assumptions** (resource count, SKU, region, utilization) and a **confidence** level. Never present fake-precise figures.
5. **Roll up** a total ACR opportunity band across all revenue motions, and a total **impacted-resource count** across all motions.
6. **Order** by ACR potential desc within urgency.
7. **Write** the plan to `output/{run_id}/internal/MotionPlan-<Customer>-<date>.md`. Write a short confirmation report (this step's `outputFile`).

### Decision Criteria
- **Pure hygiene retirement:** label "hygiene — no net-new ACR"; capture the risk/posture value instead.
- **Thin data (no resource count):** widen the band and lower confidence; state the assumption explicitly.
- **Like-for-like migration (e.g., PG11→PG16):** ACR uplift is modest (managed-service/SKU delta), not a greenfield estimate.

## Output Format

```markdown
# Motion Plan (INTERNAL) — {customer_display_name}

**Built at:** {ISO timestamp}
**Total ACR opportunity (rolled up):** €{low}–€{high} / year
**Total impacted resources:** {count}

| # | Retirement | Resources | Motion type | MSX opportunity / milestone | ACR band (€/yr) | Assumptions | Confidence |
|---|------------|-----------|-------------|------------------------------|-----------------|-------------|------------|
| 1 | {svc – feature} | {count} | revenue | {target service / milestone} | {low}–{high} | {drivers} | med |
| 2 | {svc – feature} | {count} | hygiene | — (posture/risk) | — | config change | — |

> The **Resources** column (number of affected resources per retirement) is **mandatory** in the motion summary table — it sizes each motion and is a squad standard across all reports.

## Per-retirement detail
### {retirement}
- **Motion:** ...
- **ACR estimate:** €{low}–€{high}; assumes {…}; confidence {…}
- **Next MSX action:** {create/advance opportunity X}
```

## Output Example

See `pipeline/data/output-examples.md` Example 3 — the motion table with the €18k–€27k band.

## Veto Conditions

1. Any ACR figure presented without stated assumptions / as fake-precise.
2. Total roll-up doesn't reconcile with the per-item bands.
3. Artifact written anywhere other than `output/{run_id}/internal/`.

## Quality Criteria

- [ ] Every retirement has a motion verdict (revenue or hygiene).
- [ ] Every ACR estimate is a band with assumptions + confidence.
- [ ] Total ACR band reconciles with per-item bands.
- [ ] **Resources** (affected-resource count) column present in the motion summary table, with a reconciling total.
- [ ] Internal only; saved under `output/{run_id}/internal/`.
