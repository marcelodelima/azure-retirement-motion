# MSX Opportunity Created Mail Template

Source: manually authored mail `[UCB] MSX opportunity + milestones created — Azure Service Retirements (FY27)`, sent 2026-08-27. Use the same structure and tone; replace only customer-specific facts.

## Addressing

- **To:** current Azure Specialist; current CSAM.
- **Cc:** configured Azure Retirement Motion v-team members; current Account Executive.

## Subject

`[{Customer}] MSX opportunity + milestones created — Azure Service Retirements (FY{NN})`

## Body structure

```text
Hi team,

Heads-up that an MSX opportunity has been logged to drive the Azure Service Retirement remediation for {Customer}, so it is tracked and we can align the v-team on delivery.

Opportunity: {Opportunity name} [linked to the live MSX record]

• Account: {Customer} · Owner: {Azure Specialist}
• Stage: {read-back MCEM stage}
• Total estimated monthly consumption across milestones: €{total}

Milestones created (all Production):

• {Milestone number} — {concise modernization label} [linked]: {customer-specific description}. Est. completion: {DD-MMM-YYYY} · Est. monthly consumption: €{amount}.

Why now: {customer-specific urgency paragraph grounded in the retirement data}.

Top Revenue Motions (by ACR):
{Render the exported Top Revenue Motions PNG inline immediately here.}

Happy to walk through it on a quick call, in case of any question.
Cheers,

{Signed-in user's standard Outlook signature}
```

## Rules

- List every created Production milestone exactly once.
- Use live MSX readback for opportunity/milestone IDs, numbers, owner, stage, dates, values, statuses, and workload names.
- Use the internal deck only for the Top Revenue Motions screenshot.
- Keep ACR content internal; this mail is addressed only to Microsoft account-team and v-team recipients.
- Use a CID-backed inline MIME image. Do not expose the PNG as a normal attachment.