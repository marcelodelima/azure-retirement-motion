---
execution: inline
agent: maurice-mailing
inputFile: squads/azure-retirement-motion/output/internal/mail-approval.md
outputFile: squads/azure-retirement-motion/output/internal/MailSendReceipt.md
---

# Step 19: Send Approved Account-Team Mail

Maurice either sends the exact hash-approved message or records a clean skip.

## Instructions

1. Follow Maurice's Send Process exactly.
2. For `SKIP MAIL <hash>`, make zero mailbox writes and write skipped receipts.
3. For exact approval, revalidate and send the approved HTML with its approved
   recipients and CID-backed inline Top Revenue Motions PNG.
4. Write `MailSendReceipt.md` and sibling `MailSendReceipt.json`.
5. Append `Mail sent`, `Mail skipped`, or `Mail failed` to `_memory/runs.md`.

## Veto Conditions

1. Any send without exact matching approval.
2. Any unapproved change to recipients, subject, body, links, or image.
3. A completed receipt already exists for the same hash.
4. Send receipt omits message result or attachment evidence.

## Quality Criteria

- [ ] Approval and proposal hashes match.
- [ ] Sent message exactly matches the approved preview.
- [ ] Receipt is complete and prevents duplicate sending.