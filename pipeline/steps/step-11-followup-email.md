---
execution: inline
agent: felix-followup
inputFile: squads/azure-retirement-motion/output/retirement-data/retirements.json
outputFile: squads/azure-retirement-motion/output/customer/FollowUpEmail-report.md
---

# Step 11: Customer Follow-up Email

Felix Followup (inline) drafts the **customer-facing follow-up email** — a short, consultative note flagging the most urgent retirements, pointing to the prepared deliverables, and proposing a low-friction next step. Customer-facing: no internal/ACR content.

## Context Loading

- `squads/azure-retirement-motion/output/retirement-data/retirements.json` — top urgent items + dates
- `squads/azure-retirement-motion/output/confirmed-customer.md` — display name
- `squads/azure-retirement-motion/pipeline/data/output-examples.md` — Example 5 (follow-up email)
- `squads/azure-retirement-motion/pipeline/data/customer-confidentiality-guard.md` — customer-facing rules

## Instructions

### Process
1. **Load** `retirements.json`; select the **top 2–3 highest-urgency** retirements (Overdue/Critical first) with their dates.
2. **Write a subject line** that signals a helpful heads-up (not an alarm).
3. **Draft the body**: brief context → top items with dates → reassurance about runway → note that a resource-level breakdown and step-by-step plan are ready.
4. **Propose** a short session in the next 1–2 weeks.
5. **Sign off** as the CSA / Microsoft CSU Belux. Keep under ~250 words.
6. **Scrub** for any ACR/internal content before saving.
7. **Write** to `output/{run_id}/customer/FollowUpEmail-<Customer>-<date>.md`. Write a short confirmation report (this step's `outputFile`).

### Decision Criteria
- **All low-urgency:** soften framing; emphasize getting ahead of it.
- **One Overdue item:** lead with it but stay advisory.
- **Many items:** name only the top 2–3; reference the full breakdown for the rest.

## Output Format

```
Subject: {helpful heads-up subject}

Hi {Name},

{Brief context paragraph.}

- {Retirement 1} — retiring {date}
- {Retirement 2} — retiring {date}

{Reassurance + reference to breakdown and step-by-step plan.}

{Offer of a short session in the next 1–2 weeks.}

Best regards,
{CSA name} · Microsoft CSU Belux
```

## Output Example

See `pipeline/data/output-examples.md` Example 5 — the Contoso follow-up email.

## Veto Conditions

1. Any ACR / opportunity / revenue language present (customer-facing breach).
2. FUD / "urgent action required" alarmism.
3. Over ~250 words, or full resource lists dumped inline.

## Quality Criteria

- [ ] Consultative tone; no FUD, no selling.
- [ ] Top 2–3 urgent retirements named with dates.
- [ ] One clear, low-friction next step.
- [ ] Under ~250 words; no internal data; saved under `output/{run_id}/customer/`.
