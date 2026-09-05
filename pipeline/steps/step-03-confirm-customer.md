---
type: checkpoint
outputFile: squads/azure-retirement-motion/output/confirmed-customer.md
---

# Step 03: Confirm Customer / TPID

Human checkpoint. The CSA confirms the correct customer and TPID from Reese's candidate list before any retirement data is pulled. This locks the identity for the rest of the run.

This checkpoint remains mandatory when intake came from the portfolio scorer.

## Context Loading

- `squads/azure-retirement-motion/output/retirement-data/customer-candidates.md` — Reese's candidate table

## Questions to ask

1. **Which candidate is correct?** (Pick a TPID from the table, or paste a known TPID.)
2. **Confirm the customer display name** to use in customer-facing deliverables.

## Output Format

```markdown
# Confirmed Customer — {customer_name}

- **Confirmed TPID:** {tpid}
- **Display name (customer-facing):** {customer_display_name}
- **Confirmed by:** {CSA name}
- **Confirmed at:** {ISO timestamp}
- **Portfolio handoff acknowledged:** {yes/no}
```

## Veto Conditions

1. No TPID selected (cannot pull retirement data without a confirmed TPID).
2. CSA flags the candidate list as wrong → loop back to Step 02 with a corrected search term.

## Quality Criteria

- [ ] Exactly one TPID confirmed.
- [ ] Display name matches the intended customer.
