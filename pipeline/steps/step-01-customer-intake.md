---
type: checkpoint
outputFile: squads/azure-retirement-motion/output/intake.md
---

# Step 01: Customer Intake

Entry checkpoint for every Azure Retirement Motion run. Captures the minimum needed to resolve the customer in the Azure Service Retirements data before Reese runs.

The run may optionally start from a portfolio-scorer handoff matching
`skills/retirement-intelligence-model/schemas/handoff.schema.json`. The handoff
pre-fills customer name and TPID but never bypasses resolution, confirmation,
current telemetry extraction, or any write approval.

## Context Loading

- `_opensquad/_memory/company.md` — CSU Belux identity
- `squads/azure-retirement-motion/pipeline/data/customer-confidentiality-guard.md` — confidentiality rules
- `squads/azure-retirement-motion/pipeline/data/domain-framework.md` — North Star & data source

## Questions to ask

Ask the CSA the following, **one question at a time**:

1. **Customer name** — the brand/legal name used to search the retirements data (e.g., "Contoso N.V."). Reese uses this as `SearchText`.
2. **TPID (optional)** — if the CSA already knows the customer's TPID, paste it to skip the lookup. Otherwise leave blank and Reese will resolve candidates.
3. **Reporting date (optional)** — defaults to today; sets the reference date for urgency classification.
4. **Portfolio handoff (optional)** — path to a selected `handoffs/{TPID}.json`.
	Validate its schema, `handoffType`, model version, and safety guardrails.

## Output Format

```markdown
# Engagement Intake — {customer_name}

- **Customer name:** {customer_name}
- **TPID (if known):** {tpid | "to be resolved"}
- **Reporting date:** {YYYY-MM-DD}
- **Run started by:** {CSA name}
- **Portfolio handoff:** {path | "none"}
- **Portfolio rank / estimated lower ACR:** {values | "not supplied"}
```

## Veto Conditions

1. Customer name missing or empty (cannot search the retirements data without it).
2. A supplied handoff authorizes MSX writes/customer distribution or does not
	require customer-level validation.

## Quality Criteria

- [ ] Customer name captured.
- [ ] Reporting date defaults to today if not provided.
- [ ] No PII beyond the CSA's own name.
