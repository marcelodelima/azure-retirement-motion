# Quality Criteria — Azure Retirement Motion

Scoring rubric applied by Quinn Quality. Each artifact is scored pass/fail on
its block. A run is **release-ready** only when every block passes.

## Global (all artifacts)
- [ ] Every factual claim traces to `retirements.json` (service name, feature, date, counts).
- [ ] Urgency labels match the run date (Overdue/Critical/Upcoming/Future computed correctly).
- [ ] Ordering = urgency → impact → impacted-resource count descending.
- [ ] No cross-customer data: only THIS customer's TPID, resources, ACR appear.
- [ ] Customer name spelled consistently and matches the confirmed CXObserve `TPName`.
- [ ] No fabricated retirements, dates, or resource counts.

## Retirement data (Reese)
- [ ] `retirements.json` exists, is valid JSON, and is a non-empty array (or explicitly reports zero retirements).
- [ ] Each element has all contract fields incl. `resources_detail[]`.
- [ ] PPTX file generated at `CustomerData/<Customer>/RetirementAssessment-*.pptx`.
- [ ] Skill version check was run; any update prompt surfaced to the CSA.

## Excel workbook (Ethan)
- [ ] Single workbook, one sheet per retirement; sheet names map to retirements (truncated/escaped to ≤31 chars, Excel-safe).
- [ ] Columns exactly: Resource | Subscription | Resource Group | Location | Workload.
- [ ] Row count per sheet == that retirement's `resources_detail` length.
- [ ] No empty/placeholder rows; header styled; sheet for a 0-resource retirement still present with a note.

## Execution plan (Ravi)
- [ ] One consolidated document, one section per retirement, ordered by urgency.
- [ ] Each section: Scope · Prerequisites · Migration steps (ordered, concrete) · Validation · Rollback · Downtime · Effort.
- [ ] Steps are specific & actionable (Portal/CLI), never "plan your migration".
- [ ] Each section names the concrete replacement service and cites the official `learn_more_link` / MS Learn.
- [ ] Downtime and prerequisites explicitly stated (even if "none / no downtime").

## Motion / opportunity plan (Morgan)
- [ ] Each retirement maps to ≥1 JOB2 opportunity or milestone (or is explicitly marked "no revenue motion").
- [ ] Every opportunity/milestone carries a **rough ACR band** with stated assumptions.
- [ ] ACR method documented (replacement SKU, count, region, utilization assumption).
- [ ] CSA next action is concrete and owns a date or trigger.
- [ ] **Resources** column (affected-resource count per retirement) present in the motion summary, with a reconciling total.
- [ ] Totals row sums the ACR bands.

## Executive briefing (Bianca)
- [ ] One page; opens with revenue-at-risk + total ACR opportunity band.
- [ ] No engineer-level jargon; business-outcome language.
- [ ] JOB2 narrative present (replace EOL → new services → ACR/UCR).
- [ ] All figures consistent with Morgan's plan.
- [ ] **Internal briefing deck** (`InternalBriefing-<Customer>-<date>.pptx`) generated, non-empty; ACR/motion figures reconcile with Morgan's plan; visual template mirrors the customer assessment deck.

## Follow-up email (Felix)
- [ ] Professional consultative tone; no FUD, no aggressive selling.
- [ ] Names the top 2–3 most urgent retirements with dates.
- [ ] Clear, low-friction next step (offer a session/workshop).
- [ ] Under ~250 words; no internal ACR figures leaked to the customer.
