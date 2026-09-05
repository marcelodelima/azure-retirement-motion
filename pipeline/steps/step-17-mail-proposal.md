---
execution: inline
agent: maurice-mailing
inputFile: squads/azure-retirement-motion/output/internal/MSXCreationReceipt.json
outputFile: squads/azure-retirement-motion/output/internal/MailProposal.md
---

# Step 17: Build Account-Team Mail Proposal (Read-Only)

Maurice prepares the complete internal notification after successful MSX
creation. This step must make zero mailbox writes.

## Context Loading

- completed `MSXCreationReceipt.json` and approved `MSXProposal.json`
- live MSX opportunity and milestone readback
- Moxie's canonical `MALCoverage.json` for the exact confirmed TPID
- latest `InternalBriefing-*.pptx`
- `pipeline/data/msx-created-mail-template.md`
- `squad.yaml` Retirement Motion v-team configuration

## Instructions

1. Follow Maurice's Proposal Process completely.
2. Reuse `MALCoverage.json`; do not reopen or redownload the BELUX MAL. Validate
   the cached identities before composing recipients.
3. Generate `Why now` from the current live milestone set. Reconcile Overdue,
   Critical, Upcoming, and Future counts; identify the most urgent workload
   areas; and describe only continuity/supportability outcomes supported by
   those records. Do not reuse wording from another customer.
4. Produce `MailProposal.md` at the transformed output path plus sibling
   `MailProposal.json`, `MailProposal.html`, the exported Top Revenue Motions
   PNG, and an Outlook-ready `<Customer>-Azure-Service-Retirements-MSX-Draft.eml`.
5. Present To, Cc, subject, full body, every milestone, links, inline image preview,
   image SHA-256, send hash, and a clickable download link to the `.eml`.
6. Do not create a mailbox draft and do not send. Step 18 owns approval.
7. Validate that the `.eml` has `X-Unsent: 1`, exactly matches the proposal,
   renders the image inline, and contains no normal attachment.

## Veto Conditions

1. Any mailbox write is made.
2. `mailWritesMade` is not exactly zero.
3. Required MAL roles, directory identities, MSX records, or image are missing.
4. Message does not follow the reference template or omits a milestone.
5. Downloadable `.eml` is missing, invalid, or differs from the proposal.

## Quality Criteria

- [ ] Proposal is complete, deterministic, and read-only.
- [ ] Recipients follow To/Cc rules and are deduplicated.
- [ ] All live MSX records and links reconcile.
- [ ] Top Revenue Motions PNG is rendered inline under its heading, not as an attachment.
- [ ] Outlook-compatible `.eml` is downloadable, unsent, and MIME-validated.