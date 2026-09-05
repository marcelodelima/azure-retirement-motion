/* Ravi Runbook — generate consolidated customer Execution Plan from retirements.json */
const fs = require('fs');
const path = require('path');

const OUTPUT_ROOT = path.resolve(__dirname, '..', 'output');
function latestRunDir() {
  const dirs = fs.readdirSync(OUTPUT_ROOT)
    .map((d) => path.join(OUTPUT_ROOT, d))
    .filter((p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } });
  dirs.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return dirs[0];
}
const RUN = process.env.RUN_DIR || latestRunDir();
const DATA = process.env.DATA_FILE || path.join(RUN, 'retirement-data', 'retirements.json');
const CUSTOMER = process.env.CUSTOMER_NAME || 'Customer';
const FILE_CUST = process.env.FILE_CUST || 'Customer';
const DATE = process.env.REPORT_DATE || new Date().toISOString().slice(0, 10);
const OUT = process.env.EXECPLAN_OUTPUT || path.join(RUN, 'customer', `ExecutionPlan-${FILE_CUST}-${DATE}.md`);

const URGENCY_RANK = { Overdue: 0, Critical: 1, Upcoming: 2, Future: 3 };
const IMPACT_RANK = { High: 0, Medium: 1, Low: 2 };
const retirements = JSON.parse(fs.readFileSync(DATA, 'utf-8'));
retirements.sort((a, b) => {
  if (URGENCY_RANK[a.urgency] !== URGENCY_RANK[b.urgency]) return URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency];
  if (IMPACT_RANK[a.impact] !== IMPACT_RANK[b.impact]) return (IMPACT_RANK[a.impact] ?? 9) - (IMPACT_RANK[b.impact] ?? 9);
  return (b.impacted_resources || 0) - (a.impacted_resources || 0);
});

const d10 = (s) => new Date(s).toISOString().slice(0, 10);

// Curated runbook knowledge keyed by service/feature pattern.
function runbook(r) {
  const s = (r.service_name || '').toLowerCase();
  const f = (r.retiring_feature || '').toLowerCase();
  const link = r.learn_more_link;
  const K = (o) => ({ replacement: o.replacement, prereqs: o.prereqs, validation: o.validation, rollback: o.rollback, downtime: o.downtime, effort: o.effort });

  if (s.includes('application insights') && f.includes('classic')) return K({
    replacement: 'Workspace-based Application Insights (linked to a Log Analytics workspace)',
    prereqs: ['Owner/Contributor on each Application Insights component.', 'A target Log Analytics workspace in the same region (or create one).', 'Inventory of alerts, dashboards, workbooks, and continuous-export configs that reference the classic resource.'],
    validation: ['Confirm `IngestionMode` is `LogAnalytics` on each migrated component.', 'Verify live metrics, recent requests/dependencies appear in the linked workspace.', 'Confirm alerts and dashboards still resolve data.'],
    rollback: 'Workspace migration is one-way (cannot revert to classic). Mitigate by validating in a non-prod component first; no data is lost during migration.',
    downtime: 'None — telemetry continues during and after migration.',
    effort: 'Medium — ~15–30 min per component, scriptable across the estate.',
  });
  if (f.includes('tls 1.0') || f.includes('tls 1.1')) return K({
    replacement: 'Enforce TLS 1.2 (or 1.3) minimum (configuration change)',
    prereqs: ['Confirm client SDKs/drivers/OS negotiate TLS 1.2+ (most modern stacks do).', 'Identify legacy callers (old .NET Framework, Java 7, OpenSSL <1.0.1).'],
    validation: ['Monitor for connection/handshake failures for 48h after enforcement.', 'Check resource metrics for TLS/auth errors.'],
    rollback: 'Temporarily revert the minimum TLS version setting (not recommended; the platform will enforce 1.2 at the retirement date regardless).',
    downtime: 'None when clients already support TLS 1.2; legacy clients lose connectivity until updated.',
    effort: 'Low — configuration change, scriptable; effort is in updating legacy clients.',
  });
  if (s.includes('public ip') && f.includes('basic')) return K({
    replacement: 'Standard SKU public IP address (zone-redundant, secure-by-default)',
    prereqs: ['Map each Basic public IP to its attached resource (NIC, LB, gateway, NAT gateway).', 'Note that Standard public IPs are closed to inbound by default — NSG rules required.', 'Plan a maintenance window per attached resource.'],
    validation: ['Confirm the resource has a Standard public IP and inbound/outbound flows work.', 'Verify NSG rules permit required traffic.'],
    rollback: 'Re-associate the original Basic public IP (retained until deleted) within the maintenance window.',
    downtime: 'Brief — the public IP is detached/replaced; expect a short connectivity gap per resource.',
    effort: 'Medium — guided upgrade where available; otherwise recreate, ~30–60 min per resource.',
  });
  if (s.includes('load balancer') && f.includes('basic')) return K({
    replacement: 'Standard Load Balancer',
    prereqs: ['Document frontend IPs, backend pools, rules, health probes, and outbound rules.', 'Provision Standard public IPs for the new frontends.', 'Plan a maintenance window; Basic and Standard LBs cannot share a backend simultaneously.'],
    validation: ['Confirm traffic distributes across the backend pool.', 'Verify health probes pass and outbound connectivity works (Standard requires explicit outbound rules or NAT gateway).'],
    rollback: 'Re-point DNS/clients to the retained Basic LB during the maintenance window.',
    downtime: 'Brief cutover window per LB.',
    effort: 'Medium — use the upgrade script/module; ~1–2 h per LB.',
  });
  if (s.includes('load balancer') && f.includes('nat')) return K({
    replacement: 'Inbound NAT rule V2 (port-mapping based)',
    prereqs: ['Document existing Inbound NAT rule V1 port mappings and backend targets.'],
    validation: ['Confirm inbound connectivity to each backend instance on the mapped ports.'],
    rollback: 'Recreate the V1 rule during the maintenance window if needed.',
    downtime: 'Brief — rule re-creation.',
    effort: 'Low — ~15–30 min per LB.',
  });
  if (s.includes('storage account') && f.includes('general-purpose v1')) return K({
    replacement: 'General-Purpose v2 storage account (in-place upgrade — no data movement)',
    prereqs: ['Inventory GPv1 accounts via Azure Resource Graph.', 'Review access-tier/pricing differences; confirm lifecycle policies are desired post-upgrade.'],
    validation: ['Confirm `kind = StorageV2` on each account.', 'Verify application connectivity and that access tiers behave as expected.'],
    rollback: 'GPv2 upgrade is one-way; data and endpoints are unchanged so functional risk is minimal.',
    downtime: 'None — in-place metadata upgrade.',
    effort: 'Low — `az storage account update --upgrade-to-gpv2`, scriptable; ~5 min per account.',
  });
  if (s.includes('storage account') && f.includes('dnszone')) return K({
    replacement: 'Standard storage endpoints / private endpoints',
    prereqs: ['Identify accounts using AzureDnsZone endpoints and their DNS dependencies.'],
    validation: ['Confirm resolution and application connectivity over the new endpoints.'],
    rollback: 'Restore prior DNS/endpoint configuration.',
    downtime: 'Brief during DNS cutover.',
    effort: 'Low — single account.',
  });
  if (s.includes('key vault') && f.includes('api version')) return K({
    replacement: 'Key Vault data-plane API version 2026-02-01 or later',
    prereqs: ['Inventory apps, SDKs, scripts, and automation calling Key Vault data-plane APIs.', 'Map each caller to the SDK version that emits the new API version.'],
    validation: ['Confirm secret/key/certificate operations succeed against the new API version in non-prod.', 'Use Key Vault diagnostic logs to confirm no calls on deprecated API versions remain.'],
    rollback: 'Pin the SDK/REST call back to the previous API version (only until the retirement date — after that it stops working).',
    downtime: 'None — client-side change; roll out before the retirement date.',
    effort: 'Medium-High — touches many client apps across many subscriptions; coordinate SDK upgrades.',
  });
  if (s.includes('disk') && f.includes('standard hdd')) return K({
    replacement: 'Standard SSD (or Premium SSD) managed disks for OS disks',
    prereqs: ['Inventory OS disks on Standard HDD via Azure Resource Graph.', 'Confirm target VM size supports the chosen SSD tier.', 'Schedule maintenance windows (disk SKU change requires VM deallocation).'],
    validation: ['Confirm OS boots and the disk SKU is the new tier.', 'Validate application performance post-change.'],
    rollback: 'Change the disk SKU back to Standard HDD (deallocate → update → start).',
    downtime: 'Per-VM — requires deallocate/restart for the SKU change.',
    effort: 'Medium — `az disk update --sku StandardSSD_LRS`; ~15–30 min per VM incl. reboot.',
  });
  if (s.includes('virtual machine') && (f.includes('series') || f.includes('av2') || f.includes('dsv2') || f.includes('nvv') || f.includes('lsv2'))) return K({
    replacement: 'A current, supported VM size family (e.g., Dv5/Ev5/Dasv5, NVadsA10 v5 for GPU)',
    prereqs: ['Inventory VMs on the retiring series via Azure Resource Graph.', 'Select a replacement family matching vCPU/memory/GPU/local-SSD needs.', 'Verify quota for the target size in each region; schedule maintenance windows.'],
    validation: ['Confirm the VM resizes to the new SKU and boots.', 'Validate application performance and any GPU/driver dependencies.'],
    rollback: 'Resize back to the original family if quota allows (deallocate → resize → start).',
    downtime: 'Per-VM — resize requires deallocate/restart.',
    effort: 'Medium — `az vm resize`; ~15–30 min per VM; GPU workloads need driver validation.',
  });
  if (s.includes('virtual machine') && f.includes('desired state')) return K({
    replacement: 'Azure Machine Configuration (guest configuration)',
    prereqs: ['Inventory VMs using the DSC extension and their configurations.'],
    validation: ['Confirm the new configuration policy reports compliant.'],
    rollback: 'Re-add the DSC extension if parity is not achieved.',
    downtime: 'None.',
    effort: 'Medium — re-author configurations as machine-config policies.',
  });
  if (s.includes('virtual machine') && (f.includes('dependency agent') || f.includes('vm insights'))) return K({
    replacement: 'Azure Monitor Agent (AMA)-based VM Insights with Data Collection Rules',
    prereqs: ['Inventory VMs reporting via the legacy Dependency Agent / VM Insights Map.', 'Prepare AMA + Data Collection Rules for performance and map data.'],
    validation: ['Confirm AMA heartbeat and that perf/map data flows to the workspace.'],
    rollback: 'Re-enable the legacy dependency agent if needed.',
    downtime: 'None.',
    effort: 'Medium — deploy AMA + DCRs, then remove the legacy agent.',
  });
  if (s.includes('kubernetes') && f.includes('container insights')) return K({
    replacement: 'Managed-identity authentication for Container Insights / Azure Monitor',
    prereqs: ['Identify AKS clusters using legacy (non-MSI) auth for Container Insights.'],
    validation: ['Confirm metrics/logs continue to flow after enabling MSI auth.'],
    rollback: 'Revert the monitoring add-on auth configuration.',
    downtime: 'None.',
    effort: 'Low — reconfigure the monitoring add-on; ~15 min per cluster.',
  });
  if (s.includes('kubernetes') && f.includes('ubuntu 22.04')) return K({
    replacement: 'Supported AKS node image (current Ubuntu / Azure Linux)',
    prereqs: ['Identify node pools on Ubuntu 22.04.', 'Confirm workloads tolerate a node image upgrade (PDBs, surge settings).'],
    validation: ['Confirm node image version and that all workloads/DaemonSets are healthy.'],
    rollback: 'Node image upgrades are roll-forward; mitigate with surge upgrade and PodDisruptionBudgets.',
    downtime: 'Rolling — none with proper PDBs/surge.',
    effort: 'Low-Medium — `az aks nodepool upgrade --node-image-only`.',
  });
  if (s.includes('kubernetes') && f.includes('kubenet')) return K({
    replacement: 'Azure CNI Overlay networking',
    prereqs: ['Identify clusters using Kubenet.', 'Plan new node pools / cluster with CNI Overlay; review pod CIDR.'],
    validation: ['Confirm pod-to-pod and egress connectivity; validate ingress.'],
    rollback: 'Keep the original cluster until the new one is validated, then cut traffic over.',
    downtime: 'Migration-dependent — blue/green to minimize impact.',
    effort: 'Medium-High — networking model change; validate thoroughly.',
  });
  if (s.includes('app service') && f.includes('linux consumption')) return K({
    replacement: 'Azure Functions Flex Consumption plan',
    prereqs: ['Identify Function Apps on Linux Consumption.', 'Review Flex Consumption feature parity (VNet, concurrency, always-ready instances).'],
    validation: ['Confirm triggers fire, scaling works, and networking is correct on the new app.'],
    rollback: 'Keep the original app until the Flex app is validated; repoint as needed.',
    downtime: 'Cutover window per app (recreate + redeploy).',
    effort: 'Medium — recreate on Flex Consumption and redeploy code.',
  });
  if (s.includes('app service') && (f.includes('python') || f.includes('node') || f.includes('.net'))) return K({
    replacement: 'A supported runtime version (current Python / Node LTS / .NET LTS)',
    prereqs: ['Identify apps/functions on the retiring runtime version.', 'Confirm code/dependency compatibility with the target version.'],
    validation: ['Smoke-test the app on the new stack in a staging slot before swapping.'],
    rollback: 'Swap back to the previous slot/runtime setting.',
    downtime: 'None with slot swap; brief if updating in place.',
    effort: 'Low-Medium — update stack setting + redeploy; validate dependencies.',
  });
  if (s.includes('redis')) return K({
    replacement: 'Azure Managed Redis (or a supported Azure Cache for Redis tier/version)',
    prereqs: ['Inventory affected Redis instances and their client connection strings.', 'Provision the target instance; plan data migration (export/import or dual-write).'],
    validation: ['Confirm clients connect, latency/throughput meet expectations, and data is intact.'],
    rollback: 'Repoint clients to the original instance (retained until cutover is validated).',
    downtime: 'Brief cutover; near-zero with dual-write/replication strategy.',
    effort: 'Medium — provision, migrate data, repoint clients.',
  });
  if (s.includes('postgresql')) return K({
    replacement: 'PostgreSQL Flexible Server on a supported major version (e.g., v16)',
    prereqs: ['Identify instances on the retiring major version (v11).', 'Take a backup/restore point.', 'Test application compatibility against the target version on a restored copy.'],
    validation: ['Confirm the engine version, run application smoke tests, verify extensions.'],
    rollback: 'Restore from the pre-upgrade backup (major-version upgrade is irreversible in place).',
    downtime: 'Yes — in-place major version upgrade incurs an outage window.',
    effort: 'Medium — `az postgres flexible-server upgrade`; test extensions/app first.',
  });
  if (s.includes('databricks')) return K({
    replacement: 'Azure Databricks Premium tier',
    prereqs: ['Identify Standard-tier workspaces.', 'Coordinate the tier change with workspace owners (impacts pricing and features).'],
    validation: ['Confirm jobs, clusters, and access controls function on Premium.'],
    rollback: 'Tier change is a workspace setting; coordinate with the owner if reversal is needed.',
    downtime: 'Minimal — coordinate with running jobs.',
    effort: 'Low-Medium — tier change + validation.',
  });
  if (s.includes('front door')) return K({
    replacement: 'Azure Front Door Standard/Premium (current)',
    prereqs: ['Inventory classic Standard (classic) profiles, routes, WAF, and origins.', 'Plan DNS cutover.'],
    validation: ['Confirm routing, caching, WAF, and origin health on the new profile.'],
    rollback: 'Repoint DNS to the original profile (retained until cutover validated).',
    downtime: 'Brief during DNS cutover.',
    effort: 'Medium — recreate config and migrate.',
  });
  if (s.includes('container registry') && f.includes('content trust')) return K({
    replacement: 'Notation / ORAS artifact signing (supported image-signing model)',
    prereqs: ['Identify registries using Docker Content Trust.', 'Define the new signing/verification flow in CI/CD.'],
    validation: ['Confirm images are signed and verification gates pass in the pipeline.'],
    rollback: 'Re-enable Content Trust until parity is confirmed (only until retirement).',
    downtime: 'None.',
    effort: 'Medium — update CI/CD signing/verification.',
  });
  if (s.includes('flow log') || f.includes('nsg flow log')) return K({
    replacement: 'VNet Flow Logs',
    prereqs: ['Identify NSG Flow Logs and their storage/Log Analytics targets.'],
    validation: ['Confirm VNet Flow Logs data arrives in the target; compare against NSG logs.'],
    rollback: 'NSG Flow Logs remain available until retirement; disable VNet logs if needed.',
    downtime: 'None.',
    effort: 'Low — enable VNet Flow Logs, then disable NSG Flow Logs.',
  });
  if (s.includes('availability test') || f.includes('url ping')) return K({
    replacement: 'Standard availability tests in Application Insights',
    prereqs: ['Identify classic URL Ping Tests and their alert rules/locations.'],
    validation: ['Confirm Standard tests run from the expected locations and alerts fire.'],
    rollback: 'Recreate the ping test if needed (until retirement).',
    downtime: 'None.',
    effort: 'Low — recreate as Standard tests.',
  });
  if (s.includes('maps')) return K({
    replacement: 'Azure Maps current Route APIs (replacing Route v1)',
    prereqs: ['Identify applications calling Route v1 APIs.', 'Map v1 endpoints to current equivalents.'],
    validation: ['Compare routing responses for parity; run regression tests.'],
    rollback: 'Pin to v1 (only until retirement).',
    downtime: 'None — client-side change.',
    effort: 'Low-Medium — update API calls and test.',
  });
  if ((s.includes('scale set') || s.includes('batch') || s.includes('virtual machine')) && f.includes('disk encryption')) return K({
    replacement: 'Encryption at host / server-side encryption (platform or customer-managed keys)',
    prereqs: ['Identify VMs/VMSS/Batch pools using Azure Disk Encryption (ADE).', 'Confirm region/SKU support for encryption at host.'],
    validation: ['Confirm encryption is active and resources boot/operate normally.'],
    rollback: 'Re-enable ADE if the new method is not viable (until retirement).',
    downtime: 'Per-resource — may require reconfiguration/reboot.',
    effort: 'Medium — reconfigure encryption model.',
  });
  if (s.includes('event grid')) return K({
    replacement: 'Enforce TLS 1.2 minimum on Event Grid topics',
    prereqs: ['Identify publishers/subscribers and confirm TLS 1.2+ support.'],
    validation: ['Monitor event delivery after enforcement.'],
    rollback: 'Revert the TLS setting (until retirement).',
    downtime: 'None for modern clients.',
    effort: 'Low — config + client validation.',
  });
  if (s.includes('sql server')) return K({
    replacement: 'Enforce TLS 1.2 minimum on Azure SQL logical servers',
    prereqs: ['Inventory clients/drivers (ODBC/JDBC/.NET) and confirm TLS 1.2 support.'],
    validation: ['Set `minimalTlsVersion = 1.2`; monitor for connection failures.'],
    rollback: 'Lower the minimum TLS setting temporarily (until retirement).',
    downtime: 'None for modern clients.',
    effort: 'Low — config + driver updates.',
  });
  if (s.includes('solution')) return K({
    replacement: 'Confirm the supported replacement for this retiring solution with the product team',
    prereqs: ['Identify the specific solution and its dependents from the impacted resources.', 'Review the retirement notice for the recommended successor.'],
    validation: ['Confirm the replacement delivers equivalent functionality.'],
    rollback: 'Maintain the current solution until the replacement is validated (until retirement).',
    downtime: 'Solution-dependent.',
    effort: 'Medium — confirm path with the product team before executing.',
  });
  // Generic fallback
  return K({
    replacement: 'The supported alternative named in the official retirement notice',
    prereqs: ['Inventory affected resources via Azure Resource Graph.', 'Review the official retirement notice for the supported replacement and timeline.'],
    validation: ['Confirm the migrated/updated resources function as expected.'],
    rollback: 'Retain the original configuration until the replacement is validated (until retirement).',
    downtime: 'Resource-dependent.',
    effort: 'Medium — confirm the exact path against official docs before executing.',
  });
}

function scopeBlock(r) {
  const detail = r.resources_detail || [];
  const total = detail.length;
  if (total === 0) return `**Scope (${r.impacted_resources || 0} impacted):** no resource-level detail returned for this retirement.`;
  const cap = 10;
  const shown = detail.slice(0, cap);
  const rows = shown.map((d) => `| ${d.name || ''} | ${d.subscription || ''} | ${d.resource_group || ''} | ${d.location || ''} | ${d.workload || ''} |`).join('\n');
  const more = total > cap ? `\n\n_…and ${total - cap} more — see the Excel sheet for this retirement for the full list._` : '';
  return `**Scope (${total} impacted resource${total === 1 ? '' : 's'})** — full list in the Excel workbook.\n\n| Resource | Subscription | Resource Group | Location | Workload |\n|---|---|---|---|---|\n${rows}${more}`;
}

let toc = '';
let body = '';
retirements.forEach((r, i) => {
  const n = i + 1;
  const rb = runbook(r);
  const title = `${r.service_name} — ${r.retiring_feature}`;
  toc += `| ${n} | ${title} | ${r.urgency} | ${r.impact} | ${d10(r.retirement_date)} | ${r.impacted_resources || 0} |\n`;
  const steps = (r.migration_steps || []).map((st, idx) => `${idx + 1}. ${st}`).join('\n');
  body += `## ${n}. ${title} → ${rb.replacement}\n`;
  body += `**Retirement date:** ${d10(r.retirement_date)} · **Urgency:** ${r.urgency} · **Impact:** ${r.impact} · **Resources:** ${r.impacted_resources || 0} · **Subscriptions:** ${r.impacted_subscriptions || 0}\n\n`;
  if (r.description) body += `${r.description}.\n\n`;
  body += `${scopeBlock(r)}\n\n`;
  body += `### Prerequisites\n${rb.prereqs.map((p) => `- ${p}`).join('\n')}\n\n`;
  body += `### Migration steps\n${steps}\n\n`;
  body += `### Validation\n${rb.validation.map((v) => `- ${v}`).join('\n')}\n\n`;
  body += `### Rollback\n${rb.rollback}\n\n`;
  body += `### Downtime\n${rb.downtime}\n\n`;
  body += `### Effort\n${rb.effort}\n\n`;
  if (r.learn_more_link) body += `**Reference:** [${r.service_name} retirement notice](${r.learn_more_link})\n\n`;
  body += `---\n\n`;
});

const overdue = retirements.filter((r) => r.urgency === 'Overdue').length;
const upcoming = retirements.filter((r) => r.urgency === 'Upcoming').length;
const future = retirements.filter((r) => r.urgency === 'Future').length;

const header = `# Execution Plan — ${CUSTOMER}

Generated ${DATE} · Reference date ${DATE}

This consolidated execution plan provides an engineer-grade runbook for each Azure service retirement affecting ${CUSTOMER}. Sections are ordered by urgency (Overdue first), then impact, then impacted-resource count. Each section names the concrete replacement service and includes scope, prerequisites, ordered migration steps, validation, rollback, downtime, and an effort estimate. Per-resource lists are in the companion Excel workbook \`RetirementImpact-${FILE_CUST}-${DATE}.xlsx\`.

**Summary:** ${retirements.length} retirements — 🔴 ${overdue} Overdue · 🔵 ${upcoming} Upcoming (3–12 mo) · 🟢 ${future} Future (>12 mo). Start with the Overdue items, which are already past their retirement date.

## Contents

| # | Retirement | Urgency | Impact | Date | Resources |
|---|------------|---------|--------|------|-----------|
${toc}
---

`;

fs.writeFileSync(OUT, header + body, 'utf-8');
console.log('WROTE ' + OUT);
console.log('SECTIONS ' + retirements.length);
console.log('BYTES ' + fs.statSync(OUT).size);
