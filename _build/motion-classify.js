/* Shared motion/ACR classification — single source of truth for the squad.
   Used by build-motionplan.js (Morgan) and build-internal-deck.js (internal deck). */

const URGENCY_RANK = { Overdue: 0, Critical: 1, Upcoming: 2, Future: 3 };
const d10 = (s) => new Date(s).toISOString().slice(0, 10);
const eur = (n) => '€' + Math.round(n).toLocaleString('en-US');

/*
 ACR bands are rough, assumption-driven estimates anchored on impacted-resource
 counts and westeurope public list pricing, annualized. Each entry returns either
 a revenue motion (low/high €/yr) or hygiene (no net-new ACR). Per-resource annual
 anchors (loRate/hiRate €/resource/yr) reflect the *incremental* run-rate uplift of
 the replacement vs. the retiring SKU, with a utilization assumption stated.
*/
function motion(r) {
  const s = (r.service_name || '').toLowerCase();
  const f = (r.retiring_feature || '').toLowerCase();
  const c = r.impacted_resources || 0;
  const M = (o) => ({ type: 'revenue', vehicle: o.vehicle, loRate: o.lo, hiRate: o.hi, assume: o.assume, conf: o.conf, action: o.action });
  const H = (o) => ({ type: 'hygiene', vehicle: o.vehicle || 'CSA milestone (risk/posture)', assume: o.assume, conf: '—', action: o.action });

  if (s.includes('application insights') && f.includes('classic'))
    return H({ vehicle: 'Milestone — observability modernization', assume: 'Workspace-based App Insights bills Log Analytics ingestion the customer already pays; migration is hygiene/posture, minimal net-new ACR.', action: 'Log a modernization milestone in MSX; bundle with a Log Analytics commitment-tier review.' });
  if (f.includes('tls 1.0') || f.includes('tls 1.1'))
    return H({ vehicle: 'Milestone — security hardening', assume: 'TLS 1.2 enforcement is a configuration change; no net-new consumption.', action: 'Track as a security-posture milestone; no opportunity.' });
  if (s.includes('public ip') && f.includes('basic'))
    return M({ vehicle: 'Opportunity — networking modernization (Standard SKU)', lo: 35, hi: 70, assume: `${c} Basic IPs → Standard public IPs at ~€0.005/hr base (~€3.6/mo) plus data-processing; uplift band per IP/yr, westeurope list.`, conf: 'Medium', action: 'Scope Standard SKU migration; attach to a networking modernization opportunity.' });
  if (s.includes('load balancer') && f.includes('basic'))
    return M({ vehicle: 'Opportunity — networking modernization (Standard LB)', lo: 180, hi: 320, assume: `${c} Basic LBs → Standard LB at ~€0.025/hr (~€18/mo) + rule/data charges; per-LB annual uplift band, westeurope list.`, conf: 'Medium', action: 'Scope Standard LB migration in MSX.' });
  if (s.includes('load balancer') && f.includes('nat'))
    return H({ vehicle: 'Milestone — networking hygiene', assume: 'Inbound NAT V1→V2 is a rule re-creation; no net-new consumption.', action: 'Track as networking hygiene milestone.' });
  if (s.includes('storage account') && f.includes('general-purpose v1'))
    return M({ vehicle: 'Opportunity — storage modernization (GPv2)', lo: 15, hi: 45, assume: `${c} GPv1 → GPv2 in-place; GPv2 unlocks tiering/lifecycle. Modest per-account uplift band/yr; depends on capacity & tier mix.`, conf: 'Low', action: 'Position GPv2 + lifecycle management; review capacity for cool/archive savings (FinOps angle).' });
  if (s.includes('storage account') && f.includes('dnszone'))
    return H({ vehicle: 'Milestone — storage endpoint hygiene', assume: 'Endpoint migration; no net-new consumption.', action: 'Track as hygiene milestone.' });
  if (s.includes('key vault') && f.includes('api version'))
    return H({ vehicle: 'Milestone — security/SDK hygiene', assume: 'Key Vault data-plane API upgrade is a client/SDK change across many subscriptions; no net-new ACR but high-touch posture work.', action: 'Track a security-hardening milestone; flag the cross-subscription SDK upgrade effort to the account team.' });
  if (s.includes('disk') && f.includes('standard hdd'))
    return M({ vehicle: 'Opportunity — storage performance modernization (SSD)', lo: 24, hi: 90, assume: `${c} OS disks Standard HDD → Standard/Premium SSD. Per-disk annual uplift band (e.g., E10/P10 vs S-tier), westeurope list; varies by disk size.`, conf: 'Medium', action: 'Scope SSD upgrade with reliability framing; attach to a storage modernization opportunity.' });
  if (s.includes('virtual machine') && (f.includes('series') || f.includes('av2') || f.includes('dsv2') || f.includes('nvv') || f.includes('lsv2')))
    return M({ vehicle: 'Opportunity — compute modernization (current-gen VMs)', lo: 600, hi: 1400, assume: `${c} VMs on retiring series → Dv5/Ev5/NVadsA10 v5. Per-VM annualized uplift band assuming ~60% utilization and like-for-like sizing, westeurope list; GPU SKUs sit at the high end.`, conf: 'Medium', action: 'Scope compute refresh; position reservations/savings plan (FinOps) on the new fleet.' });
  if (s.includes('virtual machine') && f.includes('desired state'))
    return H({ vehicle: 'Milestone — config-management modernization', assume: 'DSC → Machine Configuration; governance change, no net-new ACR.', action: 'Track as governance-modernization milestone.' });
  if (s.includes('virtual machine') && (f.includes('dependency agent') || f.includes('vm insights')))
    return H({ vehicle: 'Milestone — monitoring modernization (AMA)', assume: 'AMA-based VM Insights bills existing Log Analytics ingestion; hygiene/posture.', action: 'Bundle AMA migration with a monitoring-commitment review.' });
  if (s.includes('kubernetes') && f.includes('container insights'))
    return H({ vehicle: 'Milestone — AKS monitoring hygiene', assume: 'Managed-identity auth change; no net-new consumption.', action: 'Track as AKS hygiene milestone.' });
  if (s.includes('kubernetes') && f.includes('ubuntu 22.04'))
    return H({ vehicle: 'Milestone — AKS lifecycle', assume: 'Node image upgrade; no net-new ACR.', action: 'Track as AKS lifecycle milestone; reinforce upgrade cadence.' });
  if (s.includes('kubernetes') && f.includes('kubenet'))
    return H({ vehicle: 'Milestone — AKS networking modernization', assume: 'Kubenet → CNI Overlay; architectural change, no direct net-new ACR (may enable scale growth).', action: 'Track as AKS networking modernization; note scale-enablement upside qualitatively.' });
  if (s.includes('app service') && f.includes('linux consumption'))
    return M({ vehicle: 'Opportunity — Functions modernization (Flex Consumption)', lo: 120, hi: 360, assume: `${c} apps Linux Consumption → Flex Consumption. Flex always-ready instances/throughput drive incremental run-rate; per-app annual band, westeurope list.`, conf: 'Low', action: 'Scope Flex Consumption migration; size always-ready instances per app.' });
  if (s.includes('app service') && (f.includes('python') || f.includes('node') || f.includes('.net')))
    return H({ vehicle: 'Milestone — runtime currency', assume: 'Runtime version upgrade on existing plans; no net-new ACR.', action: 'Track as app-currency milestone; revisit plan SKU sizing opportunistically.' });
  if (s.includes('redis'))
    return M({ vehicle: 'Opportunity — caching modernization (Azure Managed Redis)', lo: 220, hi: 600, assume: `${c} caches → Azure Managed Redis. Per-instance annual uplift band (tier/throughput dependent), westeurope list; assumes like-for-like sizing.`, conf: 'Medium', action: 'Scope Azure Managed Redis migration in MSX.' });
  if (s.includes('postgresql'))
    return M({ vehicle: 'Opportunity — database modernization (PG16 Flexible Server)', lo: 1500, hi: 2600, assume: `${c} server v11 → v16 Flexible Server (e.g., GP D4ds_v5 + 256 GB). westeurope list, ~65% utilization, 12-mo run-rate. Like-for-like; modest delta.`, conf: 'Medium', action: 'Scope PG16 upgrade; target workshop before the retirement date.' });
  if (s.includes('databricks'))
    return M({ vehicle: 'Opportunity — analytics tier modernization (Premium)', lo: 1800, hi: 5200, assume: `${c} workspaces Standard → Premium. Premium DBU rate uplift × estimated monthly DBU consumption; per-workspace band, westeurope list. Highly usage-dependent.`, conf: 'Low', action: 'Scope Premium tier move; validate DBU consumption to tighten the band.' });
  if (s.includes('front door'))
    return M({ vehicle: 'Opportunity — edge modernization (Front Door Std/Premium)', lo: 300, hi: 900, assume: `${c} classic profiles → Front Door Standard/Premium. Base + routing/WAF; per-profile annual band, list pricing; Premium (with WAF/Private Link) at the high end.`, conf: 'Low', action: 'Scope Front Door Std/Premium migration; position WAF (Premium) where applicable.' });
  if (s.includes('container registry') && f.includes('content trust'))
    return H({ vehicle: 'Milestone — supply-chain security', assume: 'Content Trust → Notation/ORAS signing; CI/CD change, no net-new ACR.', action: 'Track as supply-chain security milestone.' });
  if (s.includes('flow log') || f.includes('nsg flow log'))
    return H({ vehicle: 'Milestone — network observability hygiene', assume: 'NSG → VNet Flow Logs; like-for-like, no net-new ACR.', action: 'Track as network observability hygiene milestone.' });
  if (s.includes('availability test') || f.includes('url ping'))
    return H({ vehicle: 'Milestone — observability hygiene', assume: 'Ping tests → Standard tests; negligible consumption change.', action: 'Track as observability hygiene milestone.' });
  if (s.includes('maps'))
    return H({ vehicle: 'Milestone — API currency', assume: 'Route v1 → current Route APIs; client change, no net-new ACR.', action: 'Track as API-currency milestone.' });
  if ((s.includes('scale set') || s.includes('batch') || s.includes('virtual machine')) && f.includes('disk encryption'))
    return H({ vehicle: 'Milestone — encryption modernization', assume: 'ADE → encryption at host / SSE; security change, no net-new ACR.', action: 'Track as encryption-modernization milestone.' });
  if (s.includes('event grid'))
    return H({ vehicle: 'Milestone — security hardening', assume: 'TLS 1.2 enforcement; no net-new consumption.', action: 'Track as security-posture milestone.' });
  if (s.includes('sql server'))
    return H({ vehicle: 'Milestone — security hardening', assume: 'TLS 1.2 enforcement; no net-new consumption.', action: 'Track as security-posture milestone.' });
  if (s.includes('solution'))
    return H({ vehicle: 'Milestone — confirm successor', assume: 'Replacement path TBD with product team; treat as posture until scoped.', action: 'Confirm successor service; reassess for an opportunity once scoped.' });
  // Generic fallback → hygiene unless data says otherwise
  return H({ vehicle: 'Milestone — lifecycle hygiene', assume: 'No clear net-new consumption from the documented replacement; treat as posture.', action: 'Track as lifecycle hygiene milestone; reassess if scope grows.' });
}

/* Classify + order all retirements: urgency → ACR potential (revenue first, hi band) desc. */
function classifyAll(retirements) {
  const enriched = retirements.map((r) => ({ r, m: motion(r) }));
  enriched.sort((a, b) => {
    if (URGENCY_RANK[a.r.urgency] !== URGENCY_RANK[b.r.urgency]) return URGENCY_RANK[a.r.urgency] - URGENCY_RANK[b.r.urgency];
    const ah = a.m.type === 'revenue' ? a.m.hiRate * (a.r.impacted_resources || 0) : -1;
    const bh = b.m.type === 'revenue' ? b.m.hiRate * (b.r.impacted_resources || 0) : -1;
    return bh - ah;
  });
  return enriched;
}

module.exports = { motion, classifyAll, URGENCY_RANK, d10, eur };
