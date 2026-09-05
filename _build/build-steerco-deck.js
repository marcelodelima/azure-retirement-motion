const path = require('path');
const PptxGenJS = require(path.join(__dirname, 'node_modules', 'pptxgenjs'));

const OUT = process.env.STEERCO_OUTPUT || path.resolve(__dirname, '..', '..', '..', 'output', 'Service-Retirement-SteerCo-2026-09-04-v2.pptx');
const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Microsoft CSU Belgium & Luxembourg';
pptx.subject = 'Azure Service Retirement initiative progress';
pptx.title = 'Azure Service Retirement Initiative - Executive SteerCo';
pptx.company = 'Microsoft';
pptx.lang = 'en-US';
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'en-US',
};

const C = {
  navy: '0B3654', azure: '0078D4', cyan: '00A4EF', teal: '008C95', green: '107C10',
  orange: 'FF8C00', purple: '5C2D91', red: 'C50F1F', ink: '242424', muted: '616161',
  pale: 'F5F7FA', line: 'D2D2D2', white: 'FFFFFF', msRed: 'F25022', msGreen: '7FBA00',
  msBlue: '00A4EF', msYellow: 'FFB900',
};
const opps = [
  { account: 'AB InBev', number: '7-3I5PCGKNRC', id: '70652743-73a0-f111-b8dc-7c1e52ff074d', owner: 'Bert Vandebroek', stage: 'Listen & Consult', milestones: 10, value: 291500 },
  { account: 'AG Insurance', number: '7-3I7CRHRUIT', id: 'eb9b7b04-7aa5-f111-b8de-7ced8ddac30d', owner: 'Thomas Costers', stage: 'Listen & Consult', milestones: 12, value: 51200 },
  { account: 'ArcelorMittal', number: '7-3I6BCBX6EO', id: '869f1327-35a2-f111-b8dc-7c1e52ff052f', owner: 'Marcelo Lima', stage: 'Listen & Consult', milestones: 3, value: 11500 },
  { account: 'ATLAS COPCO', number: '7-3I5QKDX3HX', id: '53c3a776-92a0-f111-b8dc-7c1e52ff074d', owner: 'Koen Surkijn', stage: 'Realize Value', milestones: 10, value: 115400 },
  { account: 'Barry Callebaut', number: '7-3I5QS2NZI5', id: '53db1278-98a0-f111-b8dc-7c1e52ff074d', owner: 'Wolf Boone', stage: 'Listen & Consult', milestones: 7, value: 4550 },
  { account: 'Bridgestone Europe', number: '7-3I7DE3DVKN', id: '534ff78e-88a5-f111-b8de-70a8a58bc621', owner: 'Wouter Baetens', stage: 'Listen & Consult', milestones: 12, value: 22800 },
  { account: 'Cargolux', number: '7-3I6AVBJRUO', id: 'b07a75fd-2aa2-f111-b8dc-7c1e52ff052f', owner: 'Jan Gezels', stage: 'Listen & Consult', milestones: 3, value: 11100 },
  { account: 'Eurocontrol', number: '7-3I5Z66LXSG', id: 'f77be1f5-69a1-f111-b8dc-7c1e52ff052f', owner: 'Jan Gezels', stage: 'Listen & Consult', milestones: 2, value: 5300 },
  { account: 'Eurofins Scientific', number: '7-3I72WVZODW', id: '51087b44-b6a4-f111-b8de-002248335b68', owner: 'Tom Devriese', stage: 'Listen & Consult', milestones: 11, value: 61400 },
  { account: 'NATO NCIA', number: '7-3I7D32HBUU', id: '24bfd580-81a5-f111-b8de-70a8a58bc509', owner: 'Joris Aeles', stage: 'Listen & Consult', milestones: 8, value: 46300 },
  { account: 'NMBS/SNCB', number: '7-3I5OR7M4PI', id: '28f166d4-65a0-f111-b8dc-00224832940a', owner: 'Stefan Lamberigts', stage: 'Inspire & Design', milestones: 13, value: 19700 },
  { account: 'Proximus', number: '7-3I5PZGB3CN', id: 'da28a139-85a0-f111-b8dc-00224832940a', owner: 'Patrick Vangoedsenhoven', stage: 'Listen & Consult', milestones: 9, value: 10900 },
  { account: 'S.W.I.F.T.', number: '7-3I7GR2KUPY', id: 'fc8026b1-dda5-f111-b8de-002248329771', owner: 'Wouter Baetens', stage: 'Listen & Consult', milestones: 6, value: 11000 },
  { account: 'UCB', number: '7-3I676KJPHD', id: 'df4bcf3c-00a2-f111-b8dc-002248329321', owner: 'Jan Van der Sanden', stage: 'Listen & Consult', milestones: 7, value: 9000 },
];
const totalValue = opps.reduce((sum, item) => sum + item.value, 0);
const totalMilestones = opps.reduce((sum, item) => sum + item.milestones, 0);
const portfolioResources = {
  'AB InBev': 21532,
  'AG Insurance': 3424,
  ArcelorMittal: 4193,
  'ATLAS COPCO': 8774,
  'Barry Callebaut': 1687,
  'Bridgestone Europe': 4631,
  Cargolux: 1249,
  Eurocontrol: 1595,
  'Eurofins Scientific': 10241,
  'NATO NCIA': 4700,
  'NMBS/SNCB': 2094,
  Proximus: 1730,
  'S.W.I.F.T.': 582,
  UCB: 1163,
};
const totalResources = Object.values(portfolioResources).reduce((sum, count) => sum + count, 0);
const euro = (value) => `€${value.toLocaleString('en-US')}`;
const oppUrl = (id) => `https://microsoftsales.crm.dynamics.com/main.aspx?pagetype=entityrecord&etn=opportunity&id=${id}`;

function microsoftMark(slide, x = 11.35, y = 0.28, dark = false) {
  const size = 0.13, gap = 0.025;
  [[C.msRed, 0, 0], [C.msGreen, 1, 0], [C.msBlue, 0, 1], [C.msYellow, 1, 1]].forEach(([color, col, row]) => {
    slide.addShape('rect', { x: x + col * (size + gap), y: y + row * (size + gap), w: size, h: size, fill: { color }, line: { color } });
  });
  slide.addText('Microsoft Azure', { x: x + 0.38, y: y - 0.01, w: 1.45, h: 0.3, fontFace: 'Aptos', fontSize: 10.5, color: dark ? C.white : C.ink, margin: 0, valign: 'mid' });
}
function footer(slide, source, page) {
  slide.addText(`Source: ${source}`, { x: 0.62, y: 7.15, w: 10.9, h: 0.18, fontSize: 7.5, color: C.muted, margin: 0 });
  slide.addText(String(page), { x: 12.35, y: 7.12, w: 0.35, h: 0.2, fontSize: 8, color: C.muted, align: 'right', margin: 0 });
}
function base(slide, eyebrow, title, page, source) {
  slide.background = { color: C.white };
  slide.addShape('rect', { x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: C.azure }, line: { color: C.azure } });
  microsoftMark(slide);
  slide.addText(eyebrow.toUpperCase(), { x: 0.7, y: 0.3, w: 4.2, h: 0.25, fontSize: 10, bold: true, color: C.azure, margin: 0 });
  slide.addText(title, { x: 0.7, y: 0.72, w: 11.6, h: 0.8, fontSize: 28, bold: true, color: C.ink, margin: 0, breakLine: false });
  footer(slide, source, page);
}
function stat(slide, x, y, w, value, label, color) {
  slide.addShape('roundRect', { x, y, w, h: 1.25, rectRadius: 0.06, fill: { color: C.pale }, line: { color: C.line, width: 1 } });
  slide.addText(value, { x: x + 0.15, y: y + 0.18, w: w - 0.3, h: 0.48, fontSize: 28, bold: true, color, margin: 0, align: 'center' });
  slide.addText(label, { x: x + 0.12, y: y + 0.78, w: w - 0.24, h: 0.25, fontSize: 10, color: C.muted, margin: 0, align: 'center' });
}

// 1. Title
{
  const s = pptx.addSlide();
  s.background = { color: C.navy };
  s.addShape('rect', { x: 0, y: 0, w: 0.22, h: 7.5, fill: { color: C.azure }, line: { color: C.azure } });
  microsoftMark(s, 10.8, 0.42, true);
  s.addText('SERVICE RETIREMENT INITIATIVE', { x: 0.9, y: 1.05, w: 5.3, h: 0.3, fontSize: 12, bold: true, color: 'B9DDF5', margin: 0 });
  s.addText('From proven execution\nto a scalable BELUX motion', { x: 0.9, y: 1.75, w: 7.4, h: 1.55, fontSize: 38, bold: true, color: C.white, margin: 0, breakLine: false });
  s.addText('Executive SteerCo briefing | 4 September 2026', { x: 0.92, y: 3.65, w: 6.7, h: 0.4, fontSize: 16, color: 'B9DDF5', margin: 0 });
  stat(s, 0.9, 5.0, 2.55, '14', 'opportunities created', C.azure);
  stat(s, 3.7, 5.0, 2.55, '113', 'live milestones', C.teal);
  stat(s, 6.5, 5.0, 2.85, '€671.7K', 'recurring value', C.orange);
  s.addText('INTERNAL ONLY', { x: 10.55, y: 6.86, w: 1.8, h: 0.25, fontSize: 9, bold: true, color: 'B9DDF5', align: 'right', margin: 0 });
}

// 2. Executive scorecard
{
  const s = pptx.addSlide();
  base(s, 'Executive scorecard', 'A measurable motion is now visible in live MSX', 2, 'live MSX readback + BELUX portfolio snapshot');
  stat(s, 0.7, 1.8, 2.2, '65', 'BELUX accounts assessed', C.azure);
  stat(s, 3.1, 1.8, 2.2, '50', 'qualified accounts', C.green);
  stat(s, 5.5, 1.8, 2.2, '14', 'opportunities created', C.purple);
  stat(s, 7.9, 1.8, 2.2, '113', 'live milestones', C.teal);
  stat(s, 10.3, 1.8, 2.35, '€671.7K', 'recurring value', C.orange);
  s.addText('Execution delivered', { x: 0.75, y: 3.5, w: 3.4, h: 0.35, fontSize: 18, bold: true, color: C.ink, margin: 0 });
  const wins = [
    ['14', 'priority accounts activated'], ['67,595', 'impacted resource relationships'],
    ['113', 'live milestones created'], ['107', 'milestones currently On Track'],
  ];
  wins.forEach(([value, label], index) => {
    const x = 0.75 + (index % 2) * 3.15, y = 4.05 + Math.floor(index / 2) * 0.92;
    const valueWidth = index === 1 ? 1.12 : 0.75;
    const labelOffset = index === 1 ? 1.28 : 0.92;
    s.addShape('rect', { x, y, w: 2.9, h: 0.7, fill: { color: index < 2 ? 'E8F3FB' : 'EAF5EA' }, line: { color: C.white } });
    s.addText(value, { x: x + 0.15, y: y + 0.12, w: valueWidth, h: 0.4, fontSize: index === 1 ? 18 : 20, bold: true, color: index < 2 ? C.azure : C.green, margin: 0 });
    s.addText(label, { x: x + labelOffset, y: y + 0.15, w: 2.72 - labelOffset, h: 0.34, fontSize: 10.5, bold: true, color: C.ink, margin: 0 });
  });
  s.addShape('roundRect', { x: 7.3, y: 3.55, w: 5.1, h: 2.3, rectRadius: 0.05, fill: { color: C.navy }, line: { color: C.navy } });
  s.addText('Leadership headline', { x: 7.65, y: 3.9, w: 4.4, h: 0.32, fontSize: 13, bold: true, color: C.cyan, margin: 0 });
  s.addText('We have moved beyond assessment. The motion now converts retirement telemetry into governed customer action, live pipeline and accountable milestones.', { x: 7.65, y: 4.45, w: 4.25, h: 1.05, fontSize: 18, bold: true, color: C.white, margin: 0, breakLine: false });
}

// 3. Operating model
{
  const s = pptx.addSlide();
  base(s, 'Operating model', 'Portfolio signal to governed customer execution', 3, 'pipeline.yaml + portfolio handoff schema + Moxie/Maurice contracts');
  const steps = [
    ['1', 'PRIORITIZE', 'Score 65 BELUX accounts\nwith shared ACR logic', C.azure],
    ['2', 'REVALIDATE', 'Confirm TPID and refresh\nCX Observe telemetry', C.teal],
    ['3', 'MOBILIZE', 'Customer workbook, deck\nand migration plan', C.purple],
    ['4', 'EXECUTE', 'Create MSX opportunities\nand retirement milestones', C.orange],
    ['5', 'GOVERN', 'Approve, validate and align\nall records to the program', C.green],
  ];
  steps.forEach(([num, label, text, color], index) => {
    const x = 0.7 + index * 2.5;
    s.addShape('roundRect', { x, y: 2.0, w: 2.15, h: 2.55, rectRadius: 0.08, fill: { color: C.pale }, line: { color, width: 1.5 } });
    s.addShape('ellipse', { x: x + 0.68, y: 1.68, w: 0.8, h: 0.8, fill: { color }, line: { color } });
    s.addText(num, { x: x + 0.68, y: 1.85, w: 0.8, h: 0.32, fontSize: 18, bold: true, color: C.white, align: 'center', margin: 0 });
    s.addText(label, { x: x + 0.2, y: 2.65, w: 1.75, h: 0.3, fontSize: 12, bold: true, color, align: 'center', margin: 0 });
    s.addText(text, { x: x + 0.2, y: 3.15, w: 1.75, h: 0.75, fontSize: 11, color: C.ink, align: 'center', valign: 'mid', margin: 0.03 });
    if (index < 4) s.addShape('chevron', { x: x + 2.15, y: 2.85, w: 0.32, h: 0.55, fill: { color: C.line }, line: { color: C.line } });
  });
  s.addShape('roundRect', { x: 0.75, y: 5.15, w: 11.85, h: 0.82, rectRadius: 0.04, fill: { color: 'E8F3FB' }, line: { color: 'B9DDF5' } });
  s.addText('19-step customer workflow  |  separate read-only portfolio scorer  |  exact TPID identity  |  controlled MSX creation  |  customer/internal data separation', { x: 1.0, y: 5.42, w: 11.35, h: 0.28, fontSize: 12.5, bold: true, color: C.navy, align: 'center', margin: 0 });
}

// 4. Account activation overview
{
  const s = pptx.addSlide();
  base(s, 'Account activation', '14 priority customers converted into live MSX execution', 4, 'portfolio scorer impacted-resource snapshot + live MSX opportunity and milestone readback');
  stat(s, 0.75, 1.45, 2.65, '14', 'opportunities created', C.azure);
  stat(s, 3.65, 1.45, 2.65, totalResources.toLocaleString('en-US'), 'impacted resource relationships*', C.teal);
  stat(s, 6.55, 1.45, 2.65, '113', 'live milestones created', C.purple);
  stat(s, 9.45, 1.45, 2.65, '€671.7K', 'recurring value', C.orange);
  const columns = [opps.slice(0, 7), opps.slice(7)];
  columns.forEach((items, column) => {
    const x = column === 0 ? 0.75 : 6.75;
    items.forEach((item, index) => {
      const y = 3.15 + index * 0.48;
      const resources = portfolioResources[item.account];
      s.addShape('rect', { x, y, w: 5.65, h: 0.38, fill: { color: index % 2 ? C.white : C.pale }, line: { color: C.line, width: 0.5 } });
      s.addText([{ text: item.account, options: { hyperlink: { url: oppUrl(item.id) }, color: C.azure, underline: true } }], { x: x + 0.12, y: y + 0.09, w: 2.05, h: 0.18, fontSize: 9.5, bold: true, margin: 0 });
      s.addText(resources.toLocaleString('en-US'), { x: x + 2.35, y: y + 0.09, w: 1.0, h: 0.18, fontSize: 9.5, bold: true, color: C.teal, align: 'right', margin: 0 });
      s.addText(String(item.milestones), { x: x + 3.8, y: y + 0.09, w: 0.55, h: 0.18, fontSize: 9.5, bold: true, color: C.purple, align: 'center', margin: 0 });
      s.addText(euro(item.value), { x: x + 4.45, y: y + 0.09, w: 1.0, h: 0.18, fontSize: 9.5, bold: true, color: C.orange, align: 'right', margin: 0 });
    });
  });
  ['CUSTOMER', 'RESOURCES*', 'MILESTONES', 'RECURRING'].forEach((label, index) => {
    const positions = [0.87, 3.1, 4.52, 5.28];
    s.addText(label, { x: positions[index], y: 2.86, w: index === 0 ? 1.6 : 0.95, h: 0.16, fontSize: 7.5, bold: true, color: C.muted, align: index === 0 ? 'left' : 'right', margin: 0 });
    s.addText(label, { x: positions[index] + 6.0, y: 2.86, w: index === 0 ? 1.6 : 0.95, h: 0.16, fontSize: 7.5, bold: true, color: C.muted, align: index === 0 ? 'left' : 'right', margin: 0 });
  });
  s.addText('* Portfolio snapshot counts impacted resource relationships, not unique Azure resources.', { x: 0.85, y: 6.62, w: 7.2, h: 0.2, fontSize: 8, color: C.muted, italic: true, margin: 0 });
}

// 5. Governance and contributors
{
  const s = pptx.addSlide();
  base(s, 'Scale with control', 'Governance is built into execution, not added afterward', 5, 'operating controls + live MSX validation + M365 contribution evidence');
  const controls = [
    ['ACCOUNT TEAM ALIGNMENT', 'Owners review the proposed opportunity and milestone plan before publication', C.azure],
    ['DUPLICATE RISK CHECKS', 'Existing opportunities and retirement milestones are compared before new records are added', C.teal],
    ['VERIFIED EXECUTION', 'Every created record is confirmed in MSX with accountable ownership and status', C.green],
    ['PROGRAM VISIBILITY', 'All opportunities align to the BELUX retirement program for roll-up reporting', C.orange],
  ];
  controls.forEach(([label, text, color], index) => {
    const x = 0.75 + (index % 2) * 3.25, y = 1.65 + Math.floor(index / 2) * 1.22;
    s.addShape('roundRect', { x, y, w: 3.0, h: 0.95, rectRadius: 0.04, fill: { color: C.pale }, line: { color, width: 1.4 } });
    s.addText(label, { x: x + 0.2, y: y + 0.16, w: 2.6, h: 0.2, fontSize: 9, bold: true, color, margin: 0 });
    s.addText(text, { x: x + 0.2, y: y + 0.45, w: 2.58, h: 0.32, fontSize: 10.5, color: C.ink, margin: 0 });
  });
  s.addText('Leadership and delivery', { x: 7.35, y: 1.55, w: 4.8, h: 0.35, fontSize: 18, bold: true, color: C.ink, margin: 0 });
  s.addShape('roundRect', { x: 7.35, y: 2.05, w: 2.35, h: 3.2, rectRadius: 0.05, fill: { color: 'E8F3FB' }, line: { color: 'B9DDF5' } });
  s.addText('Marcelo Lima', { x: 7.65, y: 2.35, w: 1.75, h: 0.3, fontSize: 16, bold: true, color: C.azure, align: 'center', margin: 0 });
  s.addText('Field motion & platform', { x: 7.65, y: 2.75, w: 1.75, h: 0.22, fontSize: 10, bold: true, color: C.ink, align: 'center', margin: 0 });
  s.addText('Initiative assets\nDashboard integration\nCustomer communication\nShared solution follow-through', { x: 7.65, y: 3.2, w: 1.75, h: 1.4, fontSize: 11, color: C.muted, align: 'center', valign: 'mid', margin: 0 });
  s.addShape('roundRect', { x: 9.95, y: 2.05, w: 2.35, h: 3.2, rectRadius: 0.05, fill: { color: 'EAF5EA' }, line: { color: 'C6E5C6' } });
  s.addText('Lieven Verdonck', { x: 10.2, y: 2.35, w: 1.85, h: 0.3, fontSize: 16, bold: true, color: C.green, align: 'center', margin: 0 });
  s.addText('Governance & execution', { x: 10.2, y: 2.75, w: 1.85, h: 0.22, fontSize: 10, bold: true, color: C.ink, align: 'center', margin: 0 });
  s.addText('Operating model\nMSX execution design\nCustomer prioritization\nBriefings and controls', { x: 10.2, y: 3.2, w: 1.85, h: 1.4, fontSize: 11, color: C.muted, align: 'center', valign: 'mid', margin: 0 });
  s.addShape('roundRect', { x: 0.75, y: 5.5, w: 11.55, h: 0.7, rectRadius: 0.03, fill: { color: C.navy }, line: { color: C.navy } });
  s.addText('Management sponsorship: Manoj Nair | Senior CSA Manager, CSU Belgium & Luxembourg', { x: 1.0, y: 5.72, w: 11.05, h: 0.24, fontSize: 13, bold: true, color: C.white, align: 'center', margin: 0 });
}

// 6. Next steps / asks
{
  const s = pptx.addSlide();
  s.background = { color: C.navy };
  microsoftMark(s, 10.8, 0.42, true);
  s.addText('NEXT STEPS', { x: 0.85, y: 0.55, w: 2.4, h: 0.25, fontSize: 10, bold: true, color: C.cyan, margin: 0 });
  s.addText('Scale what works — keep the controls', { x: 0.85, y: 1.15, w: 8.8, h: 0.7, fontSize: 32, bold: true, color: C.white, margin: 0 });
  const asks = [
    ['1', 'Institutionalize', 'Commit and review the implementation as a supported BELUX motion.'],
    ['2', 'Strengthen reporting', 'Use the Sales Program roll-up to monitor all Service Retirement opportunities.'],
    ['3', 'Scale coverage', 'Expand the repeatable motion toward the remaining qualified accounts.'],
    ['4', 'Resolve delivery friction', 'Stabilize Office protection handling and formalize the mail endpoint.'],
  ];
  asks.forEach(([num, title, text], index) => {
    const x = 0.85 + (index % 2) * 5.95, y = 2.15 + Math.floor(index / 2) * 1.55;
    s.addShape('roundRect', { x, y, w: 5.35, h: 1.15, rectRadius: 0.05, fill: { color: index === 0 ? C.azure : '174F6F' }, line: { color: index === 0 ? C.azure : '2F6F91' } });
    s.addText(num, { x: x + 0.25, y: y + 0.22, w: 0.55, h: 0.5, fontSize: 24, bold: true, color: C.cyan, align: 'center', margin: 0 });
    s.addText(title, { x: x + 0.95, y: y + 0.2, w: 3.95, h: 0.3, fontSize: 15, bold: true, color: C.white, margin: 0 });
    s.addText(text, { x: x + 0.95, y: y + 0.58, w: 3.95, h: 0.32, fontSize: 10.5, color: 'D4E8F5', margin: 0 });
  });
  s.addText('SteerCo support requested', { x: 0.9, y: 5.6, w: 3.5, h: 0.35, fontSize: 15, bold: true, color: C.cyan, margin: 0 });
  s.addText('Endorse the motion as a repeatable BELUX customer-health practice and support the path from working prototype to reviewed, maintainable capability.', { x: 0.9, y: 6.05, w: 10.9, h: 0.55, fontSize: 16, color: C.white, margin: 0 });
  s.addText('INTERNAL ONLY', { x: 11.0, y: 7.05, w: 1.3, h: 0.18, fontSize: 8, color: 'B9DDF5', align: 'right', margin: 0 });
}

pptx.writeFile({ fileName: OUT }).then(() => {
  console.log(`WROTE ${OUT}`);
  console.log(`SLIDES ${pptx._slides.length} OPEN_OPPS ${opps.length} MILESTONES ${totalMilestones} RECURRING ${totalValue}`);
});