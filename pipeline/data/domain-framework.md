# Domain Framework — Azure Retirement Motion

The operational backbone of the "Azure Retirement Motion": turn raw Azure
service/feature retirement data into proactive, revenue-aware customer and
internal artifacts.

## North Star

1. **Transparency** — increase visibility of Microsoft lifecycle roadmaps for the customer.
2. **Revenue** — recognize and attain ACR/UCR potential from identified retirements (JOB2).
3. **Predictability** — give the customer clear lifecycle dates and runway.

## The Data Source: Azure Service Retirements skill

The cloned skill (configure its local path in `squad.yaml` under
`external_skills`) is the single source of retirement truth. It is a
Copilot-CLI style skill driven by `AGENTS.md` and `agent-retirements/agent.md`.
The squad orchestrates it; it does NOT re-implement its API logic.

### Authentication
- Uses the CSA's own `az login`. No service accounts.
- Token: `az account get-access-token --resource "api://f748ae1d-5e8a-4aa0-bfb3-67beda3d3676" --query accessToken -o tsv`
- Rule of thumb: if the CSA can see the customer in CXObserve, the skill can too.

### CXObserve APIs (executed by the skill)
- **API 2** `serviceretirementsbytpidv2` — customer summary + TPID lookup by `SearchText`.
  Fields: `RetiringServicesCount`, `ImpactedWorkloadsCount`, `SubscriptionImpactedCount`, `ResourcesImpactedCount`.
- **API 1** `serviceretirementsservicesv2` — per-retirement detail.
  Fields: `ServiceName`, `RetiringFeature`, `RetirementDate`, `Impact`, `Description`, `LearnMoreLink`, `PotentialBenefit`, `ResourceType`, `ImpactedResourcesCount`, `ImpactedSubscriptionsCount`, `ImpactedWorkloadsCount`.
- **API 3** `serviceRetirementsCustomersFlattened` — per-resource detail.
  Fields: `ServiceName`, `RetiringFeature`, `RetirementDate`, `Name`, `SubscriptionName`, `ResourceGroup`, `Location`, `EntityName` (workload), `ResourceType`, `ArmResourceId`.

### Canonical artifact: `retirements.json`
The skill writes the enriched array to `CustomerData/<Customer>/retirements.json`.
**This file is the contract** every downstream squad agent reads. Per element:
`service_name`, `retiring_feature`, `label`, `retirement_date`, `urgency`,
`impact`, `category`, `description`, `potential_benefit`, `resource_type`,
`learn_more_link`, `impacted_resources`, `impacted_subscriptions`,
`impacted_workloads`, `migration_steps[]`, `exec_comment`, `resources_detail[]`
(each: `name`, `subscription`, `resource_group`, `location`, `workload`).

## Urgency Classification (relative to run date)
- **Overdue** — retirement date has passed.
- **Critical** — retires within the next 3 months.
- **Upcoming** — retires in 3–12 months.
- **Future** — retires in more than 12 months.

Ordering everywhere: Overdue → Critical → Upcoming → Future, then Impact
(High → Medium → Low), then impacted-resource count descending.

## Output Map (per run = per customer)

### Customer-facing
1. **PowerPoint deck** — generated unchanged by the skill (`npm run generate`).
2. **Excel workbook** — single `.xlsx`, ONE sheet per retirement, columns:
   `Resource | Subscription | Resource Group | Location | Workload`.
3. **Execution / migration plan** — single consolidated Markdown document, ONE
   section per retirement: scope, prerequisites, ordered steps, validation,
   rollback, downtime, effort.

### Internal
4. **Motion / opportunity plan** — retirements → MSX JOB2 opportunities &
   milestones, CSA next actions, ACR/UCR angle, **rough ACR estimate per item**.
   The motion summary table **must** include a **Resources** column (number of
   affected resources per retirement) — a squad standard across all reports.
5. **Executive briefing** — revenue-at-risk, ROI, JOB2 framing; rolls up ACR.
6. **Internal briefing deck (PowerPoint)** — visual companion to the executive
   briefing for CSAM & v-team. Reuses the customer assessment deck template
   (`RetirementAssessment-<Customer>-<date>`) but, being internal, may include
   ACR bands, MSX motions and confidence. Generated on every run by
   `_build/build-internal-deck.js`.
7. **Follow-up email** — proactive customer outreach draft.

## ACR Estimation Method (Morgan Motion)
Rough, assumption-driven — never presented as a quote.
1. Anchor on `impacted_resources` and `resource_type` per retirement.
2. Map the retiring SKU/feature to its **replacement** service (the JOB2 target).
3. Estimate monthly consumption of the replacement using public Azure list
   pricing as the band anchor (e.g., Flexible Server vCore + storage).
4. Annualize: `ACR ≈ monthly_replacement_run_rate × 12`.
5. ALWAYS state assumptions inline (resource count, SKU, region, utilization).
6. Present as a band (low–high), not a point figure. Flag confidence.

## Confidentiality
One run = one customer. Never reference another customer's resources, TPID, or
ACR. Treat `resources_detail` (resource names, subscriptions) as customer
confidential — it belongs only in that customer's outputs.
