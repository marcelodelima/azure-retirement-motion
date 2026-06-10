# Anti-Patterns — Azure Retirement Motion

Mistakes that have sunk lifecycle/retirement motions before. Avoid all of them.

## Data & accuracy
1. **Inventing retirements or dates.** If it's not in `retirements.json`, it does
   not exist. Never "round" a retirement date or guess one from memory — customers
   plan migrations around these dates.
2. **Stale urgency.** Computing Overdue/Critical against an old date instead of the
   run date. A "Critical" that already retired erodes all credibility.
3. **Counting mismatch.** Excel sheet rows that don't equal the retirement's
   `resources_detail` count, or summary counts that contradict the deck.
4. **Skipping the skill version check.** Running on an outdated skill silently —
   the data schema or API may have changed.

## Confidentiality
5. **Cross-customer bleed.** Referencing another customer's resources, TPID, or ACR
   in this customer's output. One run = one customer, full stop.
6. **Leaking internal ACR to the customer.** ACR estimates and JOB2 opportunity
   framing are INTERNAL. They never appear in the customer email, Excel, or
   execution plan.

## Migration guidance
7. **Vague steps.** "Plan your migration", "assess your environment" — these are
   non-actions. Every step names a Portal blade or CLI command and a concrete object.
8. **No rollback / downtime statement.** Engineers will not execute a runbook that
   doesn't tell them whether it's reversible or causes an outage.
9. **Ignoring the official LearnMore link.** Guessing a migration path from memory
   when the retirement carries an authoritative `learn_more_link`.

## Revenue / motion
10. **ACR as a quote.** Presenting a single precise ACR figure with no assumptions,
    as if it were a contracted number. Always a band, always assumption-stated.
11. **Every retirement = an opportunity.** Some retirements are config changes with
    no revenue motion (e.g., enforce TLS 1.2). Forcing a JOB2 onto them looks like
    selling, not advising. Mark them "no revenue motion".
12. **FUD selling.** Framing retirements as catastrophes to pressure the customer.
    The tone is advisory: clear dates, clear runway, clear options.

## Always Do
1. **Treat `retirements.json` as the contract** — read it, never reinterpret the APIs.
2. **State every assumption** behind an ACR band (count, SKU, region, utilization).
3. **Order by urgency consistently** across every artifact so the story is coherent.
4. **Name the concrete replacement service** for each retirement — that's the JOB2 hook.
5. **Keep internal and customer artifacts separated** — never merge ACR into customer files.
