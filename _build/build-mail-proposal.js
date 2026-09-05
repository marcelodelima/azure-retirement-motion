/* Maurice Mailing — deterministic, mailbox-write-free mail proposal builder. */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { buildWhyNow } = require('./mail-why-now');

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return path.resolve(value);
};
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (value) => `€${Number(value).toLocaleString('en-US')}`;
const date = (value) => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).replace(/ /g, '-');
const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');
const opportunityUrl = (id) => `https://microsoftsales.crm.dynamics.com/main.aspx?appid=fe0c3504-3700-e911-a849-000d3a10b7cc&forceUCI=1&pagetype=entityrecord&etn=opportunity&id=${id}`;
const milestoneUrl = (id) => `https://microsoftsales.crm.dynamics.com/main.aspx?pagetype=entityrecord&etn=msp_engagementmilestone&id=${id}`;
const annotation = (field) => `${field}@OData.Community.Display.V1.FormattedValue`;

const readback = readJson(required('MAIL_MSX_READBACK'));
const resolution = readJson(required('MAIL_RESOLUTION_FILE'));
const coverage = readJson(required('MAIL_MAL_COVERAGE'));
const receipt = readJson(required('MAIL_MSX_RECEIPT'));
const imagePath = required('MAIL_IMAGE_FILE');
const outJson = required('MAIL_PROPOSAL_JSON');
const outHtml = required('MAIL_PROPOSAL_HTML');
const outMd = required('MAIL_PROPOSAL_MD');

if (receipt.status !== 'completed') throw new Error('MSX creation receipt is not completed');
if (coverage.match?.tpid !== receipt.tpid || coverage.match?.rowCount !== 1) throw new Error('Shared MAL coverage does not match the MSX receipt');
if (!fs.existsSync(imagePath) || !fs.statSync(imagePath).size) throw new Error('Top Revenue Motions image is missing or empty');
const to = [
  { role: 'Azure Specialist', name: coverage.roles.azureSpecialist.displayName, email: coverage.roles.azureSpecialist.mail, directoryId: coverage.roles.azureSpecialist.directoryId, accountEnabled: coverage.roles.azureSpecialist.accountEnabled },
  { role: 'CSAM', name: coverage.roles.csam.displayName, email: coverage.roles.csam.mail, directoryId: coverage.roles.csam.directoryId, accountEnabled: coverage.roles.csam.accountEnabled },
];
const vteam = resolution.cc.filter((person) => person.role === 'Retirement Motion v-team');
const cc = [...vteam, { role: 'Account Executive', name: coverage.roles.ae.displayName, email: coverage.roles.ae.mail, directoryId: coverage.roles.ae.directoryId, accountEnabled: coverage.roles.ae.accountEnabled }];
for (const person of [...to, ...cc]) {
  if (!person.email || !person.directoryId || person.accountEnabled !== true) throw new Error(`Unresolved or inactive recipient: ${person.role}`);
}
const seen = new Set();
for (const person of to) {
  const key = person.email.toLowerCase();
  if (seen.has(key)) throw new Error(`Duplicate To recipient: ${person.email}`);
  seen.add(key);
}
for (const person of cc) {
  const key = person.email.toLowerCase();
  if (seen.has(key)) throw new Error(`Duplicate or To/Cc overlap: ${person.email}`);
  seen.add(key);
}
if (readback.opportunity.opportunityid !== receipt.opportunity.id) throw new Error('Opportunity readback does not match receipt');
if (readback.milestones.length !== receipt.milestones.length) throw new Error('Milestone readback does not match receipt count');

const customer = coverage.match.accountName;
const opp = readback.opportunity;
const owner = opp[annotation('_ownerid_value')] || 'Unknown';
const stage = opp.msp_activesalesstage;
const totalMonthly = readback.milestones.reduce((sum, item) => sum + Number(item.msp_monthlyuse || 0), 0);
const imageBytes = fs.readFileSync(imagePath);
const image = {
  fileName: `Top-Revenue-Motions-${customer.replace(/[^A-Za-z0-9]+/g, '_')}.png`,
  contentId: `top-revenue-motions-${receipt.tpid}@maurice-mailing`,
  path: imagePath,
  bytes: imageBytes.length,
  sha256: sha256(imageBytes),
  contentType: 'image/png',
  delivery: 'inline',
};
const subject = `[${customer}] MSX opportunity + milestones created — Azure Service Retirements (FY27)`;
const opportunityLink = opportunityUrl(opp.opportunityid);
const milestoneItems = readback.milestones.map((item) => {
  const workload = item[annotation('_msp_workloadlkid_value')] || 'N/A';
  return {
    id: item.msp_engagementmilestoneid,
    number: item.msp_milestonenumber,
    name: item.msp_name,
    date: item.msp_milestonedate,
    monthlyUse: Number(item.msp_monthlyuse || 0),
    workload,
    category: item[annotation('msp_milestonecategory')] || 'Production',
    commitment: item[annotation('msp_commitmentrecommendation')] || 'Uncommitted',
    status: item[annotation('msp_milestonestatus')] || 'On Track',
    owner: item[annotation('_ownerid_value')] || owner,
    url: milestoneUrl(item.msp_engagementmilestoneid),
  };
});
const whyNow = buildWhyNow(milestoneItems);
const milestoneHtml = milestoneItems.map((item) => `<li><a href="${esc(item.url)}"><b>${esc(item.number)} — ${esc(item.name)}</b></a>: ${esc(item.workload)}. Est. completion: ${esc(date(item.date))} · Est. monthly consumption: ${esc(money(item.monthlyUse))}.</li>`).join('');
const html = `<html><head><meta charset="utf-8"><style>p{margin-top:1em;margin-bottom:1em}li{margin-bottom:.55em}.motion-image{display:block;width:100%;max-width:960px;height:auto;margin-top:.5em}</style></head><body dir="ltr"><p>Hi team,</p><p>Heads-up that an MSX opportunity has been logged to drive the <b>Azure Service Retirement remediation for ${esc(customer)}</b>, so it is tracked and we can align the v-team on delivery.</p><p><a href="${esc(opportunityLink)}"><b>Opportunity: ${esc(opp.name)}</b></a></p><ul><li>Account: ${esc(customer)} · Owner: ${esc(owner)}</li><li>Stage: ${esc(stage)}</li><li>Total estimated monthly consumption across milestones: ${esc(money(totalMonthly))}</li></ul><p><b>Milestones created (all Production):</b></p><ul>${milestoneHtml}</ul><p><b>Why now:</b> ${esc(whyNow.text)}</p><p><b>Top Revenue Motions (by ACR):</b></p><p><img class="motion-image" src="cid:${esc(image.contentId)}" alt="Top Revenue Motions for ${esc(customer)}"></p><p>Happy to walk through it on a quick call, in case of any question.</p><p>Cheers,</p><p>${esc(resolution.sender.name)}<br>${esc(resolution.sender.title)}<br>Mobile: ${esc(resolution.sender.mobile)}<br><a href="mailto:${esc(resolution.sender.email)}">${esc(resolution.sender.email)}</a></p></body></html>`;
const recipients = { to, cc };
const canonical = JSON.stringify({ to: to.map((p) => p.email.toLowerCase()), cc: cc.map((p) => p.email.toLowerCase()), subject, html, imageSha256: image.sha256 });
const sendHash = sha256(Buffer.from(canonical)).slice(0, 16);
const proposal = {
  schemaVersion: 2,
  status: 'ready_for_approval',
  generatedAt: new Date().toISOString(),
  mailWritesMade: 0,
  sendHash,
  customer,
  tpid: receipt.tpid,
  malCoverage: coverage,
  recipients,
  subject,
  bodyHtml: html,
  opportunity: { id: opp.opportunityid, name: opp.name, stage, owner, url: opportunityLink },
  milestones: milestoneItems,
  whyNow,
  totalMonthlyUse: totalMonthly,
  inlineImage: image,
};
const mdRows = milestoneItems.map((item) => `| ${item.number} | ${item.name} | ${item.workload} | ${date(item.date)} | ${money(item.monthlyUse)} |`).join('\n');
const markdown = `# Account-Team Mail Proposal — ${customer}\n\n> **PREVIEW ONLY. No draft has been created and no mail has been sent.**\n\n**Status:** ${proposal.status}  \n**Mail writes made:** 0  \n**Send hash:** ${sendHash}\n\n## Recipients\n\n**To:** ${to.map((p) => `${p.name} (${p.role}) <${p.email}>`).join('; ')}  \n**Cc:** ${cc.map((p) => `${p.name} (${p.role}) <${p.email}>`).join('; ')}\n\n## Subject\n\n${subject}\n\n## Opportunity\n\n- ${opp.name}\n- Owner: ${owner}\n- Stage: ${stage}\n- Total monthly use: ${money(totalMonthly)}\n- Link: ${opportunityLink}\n\n## Why now\n\n${whyNow.text}\n\n- Urgency evidence: Overdue ${whyNow.evidence.counts.Overdue}; Critical ${whyNow.evidence.counts.Critical}; Upcoming ${whyNow.evidence.counts.Upcoming}; Future ${whyNow.evidence.counts.Future}\n- Priority areas: ${whyNow.evidence.priorityAreas.join(', ')}\n\n## Milestones\n\n| Number | Name | Workload | Est. completion | Monthly use |\n|---|---|---|---|---:|\n${mdRows}\n\n## Message body\n\nSee the fully rendered approved body in the sibling MailProposal.html. It follows the UCB template and contains all ${milestoneItems.length} linked milestones.\n\n## Inline image\n\n- ${image.fileName} — rendered directly under **Top Revenue Motions (by ACR)**\n- ${image.bytes} bytes · 1920×1080\n- Content-ID: ${image.contentId}\n- SHA-256: ${image.sha256}\n- Source: Top Revenue Motions slide from the run's Internal Briefing deck\n\n## Approval phrase\n\n\`SEND MAIL ${sendHash}\`\n`;
fs.mkdirSync(path.dirname(outJson), { recursive: true });
fs.writeFileSync(outJson, `${JSON.stringify(proposal, null, 2)}\n`, 'utf8');
fs.writeFileSync(outHtml, html, 'utf8');
fs.writeFileSync(outMd, markdown, 'utf8');
console.log(`STATUS ${proposal.status} MILESTONES ${milestoneItems.length} HASH ${sendHash} MAIL_WRITES 0`);
