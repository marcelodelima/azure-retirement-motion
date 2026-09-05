# Output Examples — Azure Retirement Motion

Reference quality for the squad's artifacts. Use as a quality bar, not a rigid
template. All figures below are illustrative.

---

## Example 1 — Excel workbook layout (Ethan)

Single workbook `RetirementImpact-Contoso-2026-06-10.xlsx` with sheets in this
order: `Read Me`, `Summary`, then one numbered resource sheet per retirement.

**Sheet: `Summary`**

| # | Service Name | Retirement | Urgency | Impact | Retirement Date | Impacted Resources | Impacted Subscriptions | Impacted Workloads | Recommendation | Potential Benefit | Resource Type | Learn More |
|---|--------------|------------|---------|--------|-----------------|--------------------|------------------------|--------------------|----------------|-------------------|---------------|------------|
| 1 | Azure Database for PostgreSQL | Azure Database for PostgreSQL version 11 is retiring | Critical | High | 2026-08-31 | 3 | 3 | 3 | Upgrade to a supported major version. | Continued support and security updates. | Microsoft.DBforPostgreSQL/flexibleServers | Learn More |

**Sheet: `1. Azure Database for Postgre`**

| Retirement | Subscription Name | Subscription ID | Resource Group | Resource Name | Resource Type | Location | Resource ID | Azure Portal |
|------------|-------------------|-----------------|----------------|---------------|---------------|----------|-------------|--------------|
| Azure Database for PostgreSQL version 11 is retiring | Contoso EDRIVE | 00000000-0000-0000-0000-000000000000 | rg-edrive | pg-edrive | Microsoft.DBforPostgreSQL/flexibleServers | westeurope | /subscriptions/.../pg-edrive | Open in Azure Portal |

`Learn More` links to the row's official retirement notice. `Read Me` explains
purpose, scope, urgency, filters, official notice links, and confidentiality;
every used row has wrapped text and a fixed 80-pixel height. Rule: Summary rows
equal the retirement count and each numbered sheet equals that retirement's
`resources_detail[]` length.

---

## Example 2 — Execution plan section (Ravi)

> Part of the consolidated `ExecutionPlan-Contoso-2026-06-10.md`, one such
> section per retirement, ordered by urgency.

### 2. PostgreSQL 11 on Azure Database for PostgreSQL flexible server is retiring
**Urgency:** Critical (retires 2026-08-31) · **Impact:** High · **Replacement:** PostgreSQL 16 on Flexible Server

**Scope (3 impacted resources)**
- `pg-billing-prod` (Contoso PROD-01 / rg-billing / westeurope / Billing Platform)
- `pg-analytics` (Contoso DATA / rg-analytics / northeurope / Data Lake)
- `pg-edrive` (Contoso EDRIVE / rg-edrive / westeurope / E-Drive Platform)

**Prerequisites**
- Verify each server's current version: `az postgres flexible-server show -g <rg> -n <name> --query version`.
- Confirm extensions in use are supported on PG 16; review `azure.extensions` server parameter.
- Take a point-in-time snapshot / on-demand backup before upgrade.

**Migration steps**
1. Stage: restore a copy of `pg-billing-prod` to a test server and run the major-version upgrade there first.
2. Run the in-place major version upgrade: `az postgres flexible-server upgrade -g rg-billing -n pg-billing-prod --version 16`.
3. Re-point application connection strings if the endpoint changes; redeploy app config.
4. Re-run `ANALYZE` on large tables to refresh planner statistics post-upgrade.

**Validation**
- App smoke test against the upgraded server; confirm key queries and write paths.
- Compare row counts on critical tables pre/post.

**Rollback**
- Restore from the pre-upgrade backup/snapshot to a new server and re-point the app. (Major upgrade is not reversible in place.)

**Downtime:** Yes — brief (server restart during upgrade). Schedule a maintenance window.
**Effort:** Medium — ~0.5 day per server incl. validation; staging copy recommended.

---

## Example 3 — Motion / opportunity plan row with ACR (Morgan)

> Internal only.

| # | Retirement | JOB2 motion | Replacement (target) | Rough ACR band (annual) | Assumptions | CSA next action |
|---|------------|-------------|----------------------|-------------------------|-------------|-----------------|
| 1 | PostgreSQL 11 flexible server | Opportunity: PG 16 modernization | Flexible Server PG 16, 3 servers | **€18k – €27k** | 3× GP_Standard_D4ds_v5 (4 vCore) + 512 GB storage, westeurope list price, ~70% utilization | Book modernization workshop w/ data team by 2026-06-30 |
| 2 | TLS 1.0/1.1 storage enforcement | Milestone: security hardening (no net-new ACR) | Config change | **No revenue motion** | Config-only; enforce MinTLS=1.2 | Include in next CCoE sync |

**Total estimated ACR opportunity: €18k – €27k** (1 revenue motion; 1 hygiene milestone).

ACR method: replacement run-rate (list price × count × utilization), annualized.
Bands, not quotes. Confidence: Medium.

---

## Example 4 — Executive briefing opener (Bianca)

> Internal.

**Contoso — Azure Lifecycle & Retirement Briefing (2026-06-10)**

Contoso has **7 Azure retirements** affecting **41 resources** across 4 subscriptions
over the next 12 months — 1 Overdue, 2 Critical, 4 Upcoming. The most urgent,
PostgreSQL 11 Flexible Server (retires 2026-08-31), touches the Billing Platform.

These retirements are a modernization trigger: replacing end-of-life services
with current-generation Azure services represents an estimated **€18k–€27k annual
ACR opportunity** (JOB2), while improving the customer's security and reliability
posture. Recommended next step: a half-day modernization workshop with the data
and platform teams before the PostgreSQL deadline.

---

## Example 5 — Follow-up email (Felix)

> Customer-facing. No ACR figures.

**Subject: Heads-up — upcoming Azure service retirements in your environment**

Hi <Name>,

As part of our ongoing cost and lifecycle reviews, we ran a retirement assessment
across your Azure environment. A few items are worth getting ahead of:

- **PostgreSQL 11 (Flexible Server)** — retires **31 Aug 2026**, affects your Billing Platform.
- **TLS 1.0/1.1 on Storage** — being enforced; a low-effort config change.

None of these require action this week, but the PostgreSQL change benefits from a
little runway. We've prepared a resource-level breakdown and a step-by-step plan
for each item.

Would a short session in the next two weeks work to walk through it together?

Best regards,
<CSA name> · Microsoft CSU Belux
