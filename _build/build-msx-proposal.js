/* Moxie MSX — deterministic, write-free MSX proposal builder.
   This script only creates local proposal artifacts. It never calls Dataverse. */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { classifyAll, d10 } = require('./motion-classify');

const REQUIRED_SALES_PROGRAM = 'Belux | Resiliency | Service Retirements';
const SALES_PROGRAM_RELATIONSHIP = 'msp_opportunitysalesprograms_association';

const OUTPUT_ROOT = path.resolve(__dirname, '..', 'output');
function latestRunDir() {
  return fs.readdirSync(OUTPUT_ROOT)
    .map((name) => path.join(OUTPUT_ROOT, name))
    .filter((candidate) => {
      try { return fs.statSync(candidate).isDirectory(); } catch { return false; }
    })
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
}

function latestVersionedFile(dir, filename) {
  const direct = path.join(dir, filename);
  if (fs.existsSync(direct)) return direct;
  const versions = fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^v\d+$/.test(entry.name))
    .sort((a, b) => Number(b.name.slice(1)) - Number(a.name.slice(1)));
  for (const version of versions) {
    const candidate = path.join(dir, version.name, filename);
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(`Missing ${filename} under ${dir}`);
}

function parseRunMetadata(runDir) {
  const confirmed = fs.readFileSync(latestVersionedFile(runDir, 'confirmed-customer.md'), 'utf8');
  const intake = fs.readFileSync(latestVersionedFile(runDir, 'intake.md'), 'utf8');
  const customer = confirmed.match(/^# Confirmed Customer — (.+)$/m)?.[1]?.trim();
  const tpid = confirmed.match(/\*\*Confirmed TPID:\*\*\s*(\d+)/)?.[1];
  const reportingDate = intake.match(/\*\*Reporting date:\*\*\s*(\d{4}-\d{2}-\d{2})/)?.[1];
  if (!customer || !tpid || !reportingDate) throw new Error('Could not parse confirmed customer, TPID, or reporting date');
  return { customer, tpid, reportingDate };
}

function fiscalYear(dateText) {
  const date = new Date(`${dateText}T00:00:00Z`);
  const year = date.getUTCFullYear() + (date.getUTCMonth() >= 6 ? 1 : 0);
  return String(year).slice(-2);
}

function fiscalMidpoint(dateText) {
  const date = new Date(`${dateText}T00:00:00Z`);
  const fiscalStartYear = date.getUTCFullYear() - (date.getUTCMonth() < 6 ? 1 : 0);
  return `${fiscalStartYear}-12-30`;
}

function proposedMilestoneDate(retirement, midpoint) {
  const retirementDate = d10(retirement.retirement_date);
  if (retirement.urgency === 'Overdue' || retirementDate < midpoint) return midpoint;
  return retirementDate;
}

function sourceKey(retirement) {
  return `${retirement.service_name} — ${retirement.retiring_feature}`;
}

function workloadSearch(retirement) {
  const text = sourceKey(retirement).toLowerCase();
  if (text.includes('redis')) return 'Azure Managed Redis';
  if (text.includes('function') || text.includes('linux consumption')) return 'Functions (Modernize)';
  if (text.includes('disk') || text.includes('storage')) return 'Storage and File Systems';
  if (text.includes('virtual machine')) return 'Linux (Azure Linux for VM)';
  if (text.includes('postgresql')) return 'PostgreSQL';
  if (text.includes('databricks')) return 'Databricks';
  if (text.includes('front door')) return 'Front Door';
  if (text.includes('load balancer') || text.includes('public ip')) return 'Networking';
  return retirement.service_name;
}

function roundMonthlyLower(annualLower) {
  if (annualLower <= 0) return 0;
  return Math.floor((annualLower / 12) / 100) * 100;
}

function money(value) {
  return `€${Number(value).toLocaleString('en-US')}`;
}

function markdownCell(value) {
  return String(value).replaceAll('|', '\\|');
}

function readResolution() {
  const resolutionPath = process.env.MSX_RESOLUTION_FILE;
  if (!resolutionPath || !fs.existsSync(resolutionPath)) return {};
  return JSON.parse(fs.readFileSync(resolutionPath, 'utf8'));
}

const runDir = path.resolve(process.env.RUN_DIR || latestRunDir());
const dataPath = process.env.DATA_FILE || latestVersionedFile(path.join(runDir, 'retirement-data'), 'retirements.json');
const proposalMd = path.resolve(process.env.MSX_PROPOSAL_MD || path.join(runDir, 'internal', 'MSXProposal.md'));
const proposalJson = path.resolve(process.env.MSX_PROPOSAL_JSON || proposalMd.replace(/\.md$/i, '.json'));
const { customer, tpid, reportingDate } = parseRunMetadata(runDir);

function readOptionalJson(envName) {
  const filePath = process.env[envName];
  if (!filePath || !fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
const retirements = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const resolution = readResolution();
const malCoverageArtifact = readOptionalJson('MAL_COVERAGE_FILE');
const sharedAzureSpecialist = malCoverageArtifact?.roles?.azureSpecialist;
const explicitOwnerOverride = resolution.ownerOverride || null;
const owner = explicitOwnerOverride ? {
  id: explicitOwnerOverride.id,
  name: explicitOwnerOverride.name,
  email: explicitOwnerOverride.email,
  type: 'systemuser',
  sourceAlias: explicitOwnerOverride.alias,
  enabled: explicitOwnerOverride.enabled,
  source: 'explicit_existing_opportunity_owner_override',
} : sharedAzureSpecialist ? {
  id: sharedAzureSpecialist.msxSystemUserId,
  name: sharedAzureSpecialist.displayName,
  email: sharedAzureSpecialist.mail,
  type: 'systemuser',
  sourceAlias: sharedAzureSpecialist.alias,
  enabled: sharedAzureSpecialist.accountEnabled,
} : (resolution.owner || null);
const malCoverage = malCoverageArtifact ? {
  workbookName: malCoverageArtifact.source?.workbookName,
  workbookUrl: malCoverageArtifact.source?.workbookUrl,
  sheet: malCoverageArtifact.source?.sheet,
  specialistColumn: 'Azure Specialist',
  accountName: malCoverageArtifact.match?.accountName,
  tpid: malCoverageArtifact.match?.tpid,
  territory: malCoverageArtifact.match?.territory,
  specialistAlias: sharedAzureSpecialist?.alias,
  retrievedOn: malCoverageArtifact.source?.retrievedAt,
  sourceDocumentId: malCoverageArtifact.source?.sourceDocumentId,
  coverageArtifact: process.env.MAL_COVERAGE_FILE,
} : (resolution.malCoverage || null);
const existingOpportunity = resolution.existingOpportunity || null;
const coveredSourceKeys = new Set(resolution.coveredSourceKeys || []);
const allRevenue = classifyAll(retirements).filter(({ m, r }) => m.type === 'revenue' && (r.impacted_resources || 0) > 0);
const revenue = allRevenue.filter(({ r }) => !coveredSourceKeys.has(sourceKey(r)));
const midpoint = fiscalMidpoint(reportingDate);

if (allRevenue.length === 0) throw new Error('No revenue-classified retirements with impacted resources; no MSX action should be proposed');

const opportunityName = existingOpportunity?.name || `FY${fiscalYear(reportingDate)} - ${customer} - Service Retirement`;
const milestones = revenue.map(({ r, m }) => {
  const key = sourceKey(r);
  const retirementDate = d10(r.retirement_date);
  const estimationDate = proposedMilestoneDate(r, midpoint);
  const lowerAnnualAcr = Math.round(m.loRate * r.impacted_resources);
  const proposedMonthlyUse = roundMonthlyLower(lowerAnnualAcr);
  const workload = resolution.workloads?.[key] || null;
  return {
    sourceKey: key,
    source: {
      service: r.service_name,
      feature: r.retiring_feature,
      urgency: r.urgency,
      retirementDate,
      impactedResources: r.impacted_resources,
      learnMoreLink: r.learn_more_link || null,
    },
    schedule: {
      estimationDate,
      fiscalMidpoint: midpoint,
      adjustedToFiscalMidpoint: estimationDate !== retirementDate,
      rule: 'Overdue or before current fiscal midpoint → December 30; otherwise retain retirement date',
    },
    calculation: {
      lowerAnnualAcr,
      unroundedMonthlyLower: Number((lowerAnnualAcr / 12).toFixed(2)),
      proposedMonthlyUse,
      rule: 'floor lower annual ACR / 12 to €100 increments',
    },
    workloadSearch: workloadSearch(r),
    workload,
    payload: {
      msp_name: `(${r.urgency}) ${key}`.slice(0, 200),
      msp_milestonecategory: 861980002,
      msp_milestonedate: estimationDate,
      msp_milestonecomments: `Service retirement modernization for ${key}; ${r.impacted_resources} impacted resource(s); retirement ${retirementDate}.`,
      ...(workload?.id ? { 'msp_WorkloadlkId@odata.bind': `/msp_workloads(${workload.id})` } : {}),
      ...(owner?.id ? { 'ownerid@odata.bind': `/systemusers(${owner.id})` } : {}),
      ...(resolution.currency?.id ? { 'transactioncurrencyid@odata.bind': `/transactioncurrencies(${resolution.currency.id})` } : {}),
      msp_monthlyuse: proposedMonthlyUse,
      msp_commitmentrecommendation: 861980000,
      msp_milestonestatus: 861980000,
    },
  };
});

const account = resolution.account || null;
const currency = resolution.currency || null;
const priceList = resolution.priceList || null;
const salesProgram = resolution.salesProgram || null;
const duplicateCheck = resolution.duplicateCheck || { performed: false, matches: [] };
const unresolved = [];
const salesProgramActiveOnReportingDate = salesProgram?.active === true &&
  Boolean(salesProgram.startDate) && Boolean(salesProgram.endDate) &&
  reportingDate >= d10(salesProgram.startDate) && reportingDate <= d10(salesProgram.endDate);
if (!account?.id || String(account.tpid) !== String(tpid)) unresolved.push('account (exact TPID match)');
if (!currency?.id || !currency?.isoCode) unresolved.push('transaction currency');
if (!existingOpportunity && (!priceList?.id || priceList.currencyId !== currency?.id)) unresolved.push('active price list matching transaction currency');
if (!existingOpportunity && (!salesProgram?.id || salesProgram.name !== REQUIRED_SALES_PROGRAM || !salesProgramActiveOnReportingDate)) {
  unresolved.push(`active sales program: ${REQUIRED_SALES_PROGRAM}`);
}
if (!duplicateCheck.performed) unresolved.push('duplicate opportunity check');
if (!malCoverage?.workbookUrl || !malCoverage?.sheet || !malCoverage?.specialistColumn ||
    String(malCoverage.tpid) !== String(tpid) || !malCoverage?.specialistAlias) {
  unresolved.push('current Azure Specialist from latest BELUX MAL (exact TPID match)');
}
const validExplicitOwnerOverride = existingOpportunity && explicitOwnerOverride &&
  explicitOwnerOverride.authorization === 'explicit_user_instruction' &&
  explicitOwnerOverride.id === existingOpportunity.ownerId;
if (!owner?.id || !owner?.name || !owner?.email || owner.type !== 'systemuser' || owner.enabled !== true ||
    (!validExplicitOwnerOverride && owner.sourceAlias?.toLowerCase() !== malCoverage?.specialistAlias?.toLowerCase())) {
  unresolved.push('enabled MSX system user matching MAL Azure Specialist');
}
if (explicitOwnerOverride && !validExplicitOwnerOverride) unresolved.push('valid explicit existing-opportunity owner override');
if (existingOpportunity && (!existingOpportunity.id || existingOpportunity.state !== 'Open' ||
    String(existingOpportunity.accountTpid) !== String(tpid))) {
  unresolved.push('open existing opportunity matching the confirmed TPID');
}
if (existingOpportunity && coveredSourceKeys.size === 0) unresolved.push('audited existing milestone coverage');
for (const milestone of milestones) {
  if (!milestone.workload?.id) unresolved.push(`workload: ${milestone.sourceKey}`);
}
const unexpectedDuplicates = (duplicateCheck.matches || []).filter((match) => !existingOpportunity || match.id !== existingOpportunity.id);
if (unexpectedDuplicates.length || (!existingOpportunity && duplicateCheck.matches?.length)) unresolved.push('duplicate opportunity exists');

const closeDate = milestones.map((item) => item.payload.msp_milestonedate).sort().at(-1);
const opportunityPayload = {
  name: opportunityName,
  estimatedvalue: 0,
  msp_opportunitytype: '606820001',
  msp_eststartdate: reportingDate,
  estimatedclosedate: closeDate,
  ...(account?.id ? {
    'parentaccountid@odata.bind': `/accounts(${account.id})`,
    'customerid_account@odata.bind': `/accounts(${account.id})`,
  } : {}),
  ...(currency?.id ? { 'transactioncurrencyid@odata.bind': `/transactioncurrencies(${currency.id})` } : {}),
  ...(priceList?.id ? { 'pricelevelid@odata.bind': `/pricelevels(${priceList.id})` } : {}),
  ...(owner?.id ? { 'ownerid@odata.bind': `/systemusers(${owner.id})` } : {}),
  ...(!existingOpportunity && salesProgram?.id ? {
    [`${SALES_PROGRAM_RELATIONSHIP}@odata.bind`]: [`/msp_salesprograms(${salesProgram.id})`],
  } : {}),
  msp_solutionarea: 394380000,
  msp_dealtype: 861980001,
  msp_recommendationcode: 861980003,
  description: `Identified Azure services being retired by Microsoft that impact ${customer}'s Azure environment.`,
};

const approvalMaterial = {
  customer: { name: customer, tpid, account, currency, priceList, malCoverage, owner },
  salesProgram: existingOpportunity ? null : salesProgram,
  opportunity: existingOpportunity
    ? { mode: 'reuse_existing', id: existingOpportunity.id, name: existingOpportunity.name }
    : { mode: 'create', payload: opportunityPayload },
  coveredSourceKeys: [...coveredSourceKeys].sort(),
  milestones: milestones.map((item) => ({ sourceKey: item.sourceKey, payload: item.payload })),
};
const approvalHash = unresolved.length === 0
  ? crypto.createHash('sha256').update(JSON.stringify(approvalMaterial)).digest('hex').slice(0, 16)
  : null;
const totalAnnualLower = milestones.reduce((sum, item) => sum + item.calculation.lowerAnnualAcr, 0);
const totalMonthlyUse = milestones.reduce((sum, item) => sum + item.calculation.proposedMonthlyUse, 0);

const proposal = {
  schemaVersion: 2,
  status: unresolved.length ? 'blocked' : 'ready_for_approval',
  generatedAt: new Date().toISOString(),
  writeCallsMade: 0,
  approvalHash,
  unresolved,
  template: {
    opportunityId: 'df4bcf3c-00a2-f111-b8dc-002248329321',
    opportunityName: 'FY27 - UCB - Service Retirement',
    pattern: 'Consumption opportunity with uncommitted Production milestones and workload bindings',
  },
  policy: {
    includedRetirements: 'Revenue-classified retirements with at least one impacted resource',
    existingMilestoneHandling: 'Exclude only explicitly audited covered source keys; bind proposed delta to the approved existing opportunity',
    annualLowerAcr: 'motion.loRate × impacted_resources from motion-classify.js',
    monthlyUse: 'floor annual lower ACR / 12 to €100 increments',
    milestoneEstimationDate: 'Overdue or before current fiscal midpoint → December 30; otherwise retain retirement date',
    currentFiscalMidpoint: midpoint,
    opportunityEstimatedValue: 0,
    monetaryIncrement: 100,
    ownerPolicy: explicitOwnerOverride
      ? 'Explicit user-authorized reuse of the enabled owner already bound to the existing opportunity'
      : 'Current Azure Specialist from FY MAL',
    salesProgram: existingOpportunity
      ? 'No automatic association in reuse mode'
      : `Atomically associate ${REQUIRED_SALES_PROGRAM} during opportunity creation`,
  },
  source: { runDir, dataPath },
  customer: { name: customer, tpid, account, currency, priceList, malCoverage, owner },
  malCoverage,
  owner,
  priceList,
  salesProgram: existingOpportunity ? null : {
    ...salesProgram,
    relationship: SALES_PROGRAM_RELATIONSHIP,
    bind: salesProgram?.id ? `/msp_salesprograms(${salesProgram.id})` : null,
  },
  duplicateCheck,
  existingCoverage: {
    coveredSourceKeys: [...coveredSourceKeys].sort(),
    existingMilestones: resolution.existingMilestones || [],
    excludedMilestoneCount: allRevenue.length - revenue.length,
  },
  opportunity: existingOpportunity
    ? { mode: 'reuse_existing', id: existingOpportunity.id, name: existingOpportunity.name, payload: null }
    : { mode: 'create', id: null, name: opportunityName, payload: opportunityPayload },
  milestones,
  totals: { milestoneCount: milestones.length, lowerAnnualAcr: totalAnnualLower, proposedMonthlyUse: totalMonthlyUse },
};

for (const value of [opportunityPayload.estimatedvalue, ...milestones.map((item) => item.payload.msp_monthlyuse)]) {
  if (!Number.isInteger(value) || value % 100 !== 0) throw new Error(`Monetary value is not a whole multiple of 100: ${value}`);
}

let rows = milestones.map((item, index) =>
  `| ${index + 1} | ${item.payload.msp_name} | ${item.source.retirementDate} | ${item.payload.msp_milestonedate}${item.schedule.adjustedToFiscalMidpoint ? ' (adjusted)' : ''} | ${item.source.impactedResources} | ${money(item.calculation.lowerAnnualAcr)}/yr | ${money(item.payload.msp_monthlyuse)}/mo | ${item.workload?.name || `UNRESOLVED (${item.workloadSearch})`} |`
).join('\n');
const markdown = `# MSX Creation Proposal — ${customer}

> **INTERNAL — PREVIEW ONLY. No MSX writes have been made.**

**Status:** ${proposal.status}
**Proposal hash:** ${approvalHash || 'NOT AVAILABLE — proposal is blocked'}
**TPID:** ${tpid}
**Account:** ${account ? `${account.name} (${account.id})` : 'UNRESOLVED'}
**Currency:** ${currency ? `${currency.name} / ${currency.isoCode || 'ISO unresolved'} (${currency.id})` : 'UNRESOLVED'}
**Price list:** ${priceList ? `${priceList.name} (${priceList.id})` : 'UNRESOLVED'}
**Sales program:** ${existingOpportunity ? 'Existing opportunity — no automatic association proposed' : salesProgram ? `${salesProgram.name} (${salesProgram.id})` : 'UNRESOLVED'}
**MAL source:** ${malCoverage ? `${malCoverage.workbookName || 'BELUX MAL'} · ${malCoverage.sheet} · ${malCoverage.specialistColumn}` : 'UNRESOLVED'}
**Opportunity and milestone owner:** ${owner ? `${owner.name} / ${owner.email} (${owner.id})` : 'UNRESOLVED'}
**Duplicate check:** ${duplicateCheck.performed ? `${duplicateCheck.matches.length} exact open match(es)` : 'NOT PERFORMED'}
**Opportunity action:** ${existingOpportunity ? `Reuse existing ${existingOpportunity.name} (${existingOpportunity.id})` : 'Create new opportunity'}
**Existing retirement coverage excluded:** ${allRevenue.length - revenue.length} source retirement(s)

## ${existingOpportunity ? 'Existing opportunity to reuse' : 'Proposed opportunity'}

| Field | Value |
|-------|-------|
| Name | ${opportunityName} |
| Action | ${existingOpportunity ? `Reuse existing opportunity ${existingOpportunity.id}; create no opportunity` : 'Create opportunity'} |
| Intent | Consumption |
| Solution area | Cloud and AI |
| Deal type | Future Month |
| Recommendation | Uncommitted |
| Start / close | ${reportingDate} / ${closeDate} |
| Estimated value | ${money(0)} (milestone monthly use carries the consumption estimate) |
| Price list | ${priceList ? `${markdownCell(priceList.name)} (${priceList.id})` : 'UNRESOLVED'} |
| Sales program | ${existingOpportunity ? 'Not changed in reuse mode' : salesProgram ? `${markdownCell(salesProgram.name)} (${salesProgram.id})` : 'UNRESOLVED'} |
| Owner | ${owner ? `${owner.name} / ${owner.email} (${owner.id})` : 'UNRESOLVED'} |

## Proposed Production milestones

Only revenue-classified retirements are included. Each monthly-use value starts
from the canonical lower annual ACR estimate, divides by 12, and floors it to
€100 increments. This keeps the MSX value conservative and can yield €0/month
for a very small positive motion. The current fiscal midpoint is ${midpoint}.
Overdue retirements and retirements scheduled before that midpoint use
${midpoint} as their MSX estimation date; later dates remain unchanged.

| # | Milestone | Retirement date | Estimation date | Resources | Lower ACR | MSX monthly use | Workload |
|---|-----------|-----------------|-----------------|-----------|-----------|-----------------|----------|
${rows}
| | **TOTAL** | | | | **${money(totalAnnualLower)}/yr** | **${money(totalMonthlyUse)}/mo** | |

## Guardrails

- Monetary values are whole multiples of €100.
- Estimation dates follow the current-fiscal-midpoint floor rule.
- ${explicitOwnerOverride ? 'The opportunity and every milestone retain the same explicitly authorized existing owner.' : 'The opportunity and every milestone bind to the same MAL-resolved Azure Specialist owner.'}
- ${existingOpportunity ? `No opportunity create is allowed; milestones bind to existing opportunity ${existingOpportunity.id}.` : 'Opportunity must be created first; milestones bind to its returned GUID.'}
- ${existingOpportunity ? 'Sales Program associations on the existing opportunity are not changed.' : `The new opportunity atomically binds the active ${REQUIRED_SALES_PROGRAM} Sales Program.`}
- Existing milestones are excluded only through the audited covered-source-key list in this proposal.
- A receipt must be updated after every successful create for retry safety.
- Approval is valid only for this exact proposal hash.

${unresolved.length ? `## BLOCKERS\n\n${unresolved.map((item) => `- ${item}`).join('\n')}` : `## Approval phrase\n\n\`APPROVE MSX ${approvalHash}\``}
`;

fs.mkdirSync(path.dirname(proposalMd), { recursive: true });
fs.writeFileSync(proposalJson, `${JSON.stringify(proposal, null, 2)}\n`, 'utf8');
fs.writeFileSync(proposalMd, markdown, 'utf8');
console.log(`WROTE ${proposalJson}`);
console.log(`WROTE ${proposalMd}`);
console.log(`STATUS ${proposal.status} MILESTONES ${milestones.length} HASH ${approvalHash || 'none'}`);
if (unresolved.length) process.exitCode = 2;