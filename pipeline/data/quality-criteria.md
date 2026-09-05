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
- [ ] Single workbook with Read Me and Summary first, followed by one resource sheet per retirement in canonical order.
- [ ] Summary columns exactly match the 13-column customer contract; every resource sheet matches the 9-column resource contract.
- [ ] Summary and resource rows use the official full retirement `label`, falling back only when absent.
- [ ] Every resource sheet is numbered `{number}. {official name}`, Excel-safe, unique, and at most 31 characters.
- [ ] Summary row count == retirement count; each resource sheet row count == its retirement's `resources_detail[]` length.
- [ ] Summary and every resource sheet have styled, frozen, filterable headers aligned middle-left; Read Me explains scope, urgency, use, official links, and confidentiality with wrapped text and every used row fixed at 80 pixels high.
- [ ] Every populated official notice cell displays `Learn More` and links to its retirement's full `learn_more_link`; Azure Portal hyperlinks exist only for real ARM resource IDs.
- [ ] Subscription IDs use the source value or the `/subscriptions/{id}` segment of the ARM resource ID.
- [ ] Missing source IDs or dates are blank, never fabricated; no ACR/opportunity/internal fields are present.

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

## MSX proposal and commit (Moxie)
- [ ] Proposal generation made zero Dataverse writes and reports `writeCallsMade: 0`.
- [ ] Account is resolved by exact TPID; currency matches; create-new mode also
	resolves a matching active price list.
- [ ] Create-new mode resolves exactly one active `Belux | Resiliency | Service
	Retirements` Sales Program and atomically binds it through
	`msp_opportunitysalesprograms_association@odata.bind`; receipt readback verifies
	the association. Reuse-existing mode makes no Sales Program change.
- [ ] The latest FY BELUX MAL has exactly one matching TPID row; its `Azure
	Specialist` alias resolves to one enabled MSX user.
- [ ] One canonical `MALCoverage.json` contains Azure Specialist, CSAM, and AE
	with source metadata and active identities; downstream steps reuse it.
- [ ] The opportunity and every milestone explicitly bind that same owner GUID.
- [ ] Exact-name duplicate check and all workload GUID resolutions are recorded.
- [ ] One Production milestone exists per revenue-classified retirement with impacted resources; hygiene rows are excluded.
- [ ] Every Overdue milestone and every other retirement before the current
	fiscal midpoint uses December 30 as its estimation date; dates on or
	after the midpoint are retained. Source retirement dates remain auditable.
- [ ] Lower annual ACR equals classifier `loRate × impacted_resources`; monthly use is that estimate divided by 12 and rounded down to €100 increments.
- [ ] Every monetary value is a whole multiple of 100; Markdown/JSON approval hashes match.
- [ ] No write occurs without the exact hash-bound approval; receipt supports idempotent partial retries.

## Account-team mail (Maurice)
- [ ] Completed MSX receipt and live record readback reconcile before drafting.
- [ ] Maurice reuses Moxie's canonical MAL coverage for Azure Specialist, CSAM,
	  and AE and does not independently retrieve the workbook.
- [ ] Maurice's `Why now` paragraph is generated from the current customer's
	milestone urgency counts and workload areas, with no copied customer-specific claims.
- [ ] To contains Azure Specialist + CSAM; Cc contains configured v-team + AE; recipients are deduplicated.
- [ ] Mail follows the approved UCB template and lists every created Production milestone exactly once with live links.
- [ ] Top Revenue Motions slide is exported from the run's Internal Briefing deck and rendered as a hash-verified CID inline PNG directly under its heading, not as a normal attachment.
- [ ] A downloadable Outlook-compatible `.eml` is generated before approval,
	  marked `X-Unsent: 1`, contains no normal attachment, and exactly matches
	  the proposal recipients, subject, HTML, links, image, and send hash.
- [ ] Proposal generation makes zero mailbox writes and displays the full message before approval.
- [ ] Only exact `SEND MAIL <hash>` authorization permits transmission; receipt prevents duplicate sends.
