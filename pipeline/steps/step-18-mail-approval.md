---
type: checkpoint
outputFile: squads/azure-retirement-motion/output/internal/mail-approval.md
---

# Step 18: Explicit Account-Team Mail Send Approval

Show the complete mail proposal, including To, Cc, subject, rendered body,
opportunity/milestone links, and Top Revenue Motions image.

Offer exactly these choices:

1. `SEND MAIL <send-hash>` — send only the displayed message.
2. `SKIP MAIL <send-hash>` — finish without sending.
3. `REVISE MAIL` — return to Step 17 with requested changes.

Only choice 1 authorizes transmission. Save the verbatim response and timestamp.
Never infer mail approval from deliverables approval or MSX approval.

## Veto Conditions

1. Proposal is blocked, reports mailbox writes, or lacks a send hash.
2. Displayed content or image hash differs from the JSON proposal.
3. Approval is generic, altered, or missing the exact hash.