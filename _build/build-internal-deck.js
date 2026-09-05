/* Internal Briefing deck (CSAM / v-team) — Azure Retirement Motion.
   Reuses the customer assessment deck visual template (palette, KPI cards, tiles).
   INTERNAL ONLY: includes ACR bands and motion classification.
   Usage: set RUN_DIR, CUSTOMER_NAME, FILE_CUST, REPORT_DATE env vars (defaults below). */

const path = require('path');
const fs = require('fs');
const PptxGenJS = require(path.join(__dirname, 'node_modules', 'pptxgenjs'));
const { classifyAll, d10, eur } = require('./motion-classify');

// ─── Config ──────────────────────────────────────
// Robust for any run: env vars override, else auto-detect the latest run
// folder and derive customer/date from the MotionPlan-<Customer>-<date>.md file.
const OUTPUT_ROOT = path.resolve(__dirname, '..', 'output');

function latestRunDir() {
  const dirs = fs.readdirSync(OUTPUT_ROOT)
    .map((d) => path.join(OUTPUT_ROOT, d))
    .filter((p) => fs.statSync(p).isDirectory());
  dirs.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return dirs[0];
}

const RUN_DIR = process.env.RUN_DIR || latestRunDir();

// Derive FILE_CUST + DATE from the internal MotionPlan filename when not provided.
let derivedCust = '', derivedDate = '';
try {
  const mp = fs.readdirSync(path.join(RUN_DIR, 'internal'))
    .find((f) => /^MotionPlan-.+-\d{4}-\d{2}-\d{2}\.md$/.test(f));
  if (mp) {
    const m = mp.match(/^MotionPlan-(.+)-(\d{4}-\d{2}-\d{2})\.md$/);
    derivedCust = m[1];
    derivedDate = m[2];
  }
} catch { /* internal folder may not exist yet */ }

const FILE_CUST = process.env.FILE_CUST || derivedCust || 'Customer';
const DATE = process.env.REPORT_DATE || derivedDate || new Date().toISOString().slice(0, 10);
const CUSTOMER = process.env.CUSTOMER_NAME || FILE_CUST.replace(/-/g, '/');
const DATA = process.env.DATA_FILE || path.join(RUN_DIR, 'retirement-data', 'retirements.json');
const INTERNAL_DIR = process.env.INTERNAL_DIR || path.join(RUN_DIR, 'internal');
const OUT = path.join(INTERNAL_DIR, `InternalBriefing-${FILE_CUST}-${DATE}.pptx`);
const TPID = process.env.TPID || '';

// ─── Palette (matches RetirementAssessment customer deck) ───
const C = {
  navy: '1B2A4A', navyMid: '2A3F6A', blue: '4472C4', lightBlue: 'D6E4F0',
  accentBlue: '2E75B6', skyBlue: 'DEEAF6', white: 'FFFFFF', darkGrey: '333333',
  midGrey: '666666', lightGrey: 'E8E8E8', paleGrey: 'F7F9FC', green: '70AD47',
  greenLight: 'E2EFDA', amber: 'ED7D31', amberLight: 'FCE4CC', red: 'C00000',
  redLight: 'F4CCCC', teal: '00B0F0',
};
const URG = {
  Overdue: { col: C.red, bg: 'FDF2F2', emoji: '🔴' },
  Critical: { col: C.amber, bg: 'FFF8EC', emoji: '🟠' },
  Upcoming: { col: C.blue, bg: 'EBF5FB', emoji: '🔵' },
  Future: { col: C.green, bg: 'F0FAF0', emoji: '🟢' },
};

function addBackground(slide) {
  slide.background = { color: C.white };
  slide.addShape('rect', { x: 0, y: 0, w: 13.33, h: 0.06, fill: { color: C.blue } });
  slide.addShape('rect', { x: 0, y: 7.3, w: 13.33, h: 0.03, fill: { color: C.lightGrey } });
}
function addFooter(slide, text) {
  slide.addText('INTERNAL ONLY — contains ACR estimates · ' + text, {
    x: 0.5, y: 7.05, w: 12.33, h: 0.3, fontSize: 8, color: C.midGrey, align: 'right',
  });
}
function fmtDate(s) {
  if (!s) return 'TBD';
  const d = new Date(s);
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── Data ───────────────────────────────────────
const retirements = JSON.parse(fs.readFileSync(DATA, 'utf-8'));
const enriched = classifyAll(retirements);
const byUrg = (u) => retirements.filter((r) => r.urgency === u);
const overdue = byUrg('Overdue'), critical = byUrg('Critical'), upcoming = byUrg('Upcoming'), future = byUrg('Future');
const resOf = (arr) => arr.reduce((s, r) => s + (r.impacted_resources || 0), 0);
const totalResources = resOf(retirements);

let totalLo = 0, totalHi = 0;
const revenue = [], hygiene = [];
enriched.forEach(({ r, m }) => {
  const c = r.impacted_resources || 0;
  if (m.type === 'revenue') { const lo = m.loRate * c, hi = m.hiRate * c; totalLo += lo; totalHi += hi; revenue.push({ r, m, lo, hi, c }); }
  else hygiene.push({ r, m, c });
});

// ══════════════════════════════════════════════════════════════
const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'CSU Belux — Azure Retirement Motion';
pptx.title = `${CUSTOMER} — Azure Retirement Motion (Internal Briefing)`;

// ── SLIDE 1: TITLE ───────────────────────────────────
const t = pptx.addSlide();
t.background = { color: C.navy };
t.addShape('rect', { x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: C.teal } });
t.addShape('rect', { x: 9.5, y: 0, w: 3.83, h: 7.5, fill: { color: C.navyMid } });
t.addShape('roundRect', { x: 0.5, y: 0.4, w: 2.2, h: 0.4, rectRadius: 0.08, fill: { color: C.red } });
t.addText('INTERNAL ONLY', { x: 0.5, y: 0.4, w: 2.2, h: 0.4, fontSize: 11, bold: true, color: C.white, align: 'center', valign: 'middle' });
t.addShape('rect', { x: 0.5, y: 2.2, w: 1.2, h: 0.06, fill: { color: C.teal } });
t.addText('Azure Retirement Motion', { x: 0.5, y: 2.4, w: 8.5, h: 0.8, fontSize: 40, bold: true, color: C.white, fontFace: 'Segoe UI' });
t.addText('Internal Briefing — CSAM & v-team', { x: 0.5, y: 3.15, w: 8.5, h: 0.6, fontSize: 22, color: C.teal, fontFace: 'Segoe UI Light' });
t.addText(`${CUSTOMER}${TPID ? '  ·  TPID ' + TPID : ''}`, { x: 0.5, y: 4.1, w: 8.5, h: 0.5, fontSize: 18, color: 'B0C4DE', fontFace: 'Segoe UI' });
t.addText(fmtDate(DATE), { x: 0.5, y: 4.55, w: 8.5, h: 0.4, fontSize: 14, color: 'B0C4DE', fontFace: 'Segoe UI' });
const stats = [
  { val: `${retirements.length}`, lab: 'Service Retirements', col: C.blue },
  { val: `${overdue.length}`, lab: 'Overdue', col: C.red },
  { val: `${eur(totalLo)}–${eur(totalHi)}`, lab: 'ACR Opportunity / yr', col: C.teal, small: true },
  { val: `${totalResources}`, lab: 'Resources Impacted', col: C.green },
];
stats.forEach((s, i) => {
  const sy = 1.4 + i * 1.4;
  t.addText(s.val, { x: 9.8, y: sy, w: 3.0, h: 0.6, fontSize: s.small ? 18 : 36, bold: true, color: s.col, align: 'center', fontFace: 'Segoe UI' });
  t.addText(s.lab, { x: 9.8, y: sy + (s.small ? 0.45 : 0.55), w: 3.0, h: 0.3, fontSize: 11, color: 'B0C4DE', align: 'center', fontFace: 'Segoe UI' });
});
t.addText('CSU Belux  •  JOB2 Retirement Motion  •  Internal — not for customer distribution', { x: 0.5, y: 6.8, w: 8.5, h: 0.3, fontSize: 9, color: '5A7CB0' });

// ── SLIDE 2: THE STORY / HEADLINE ──────────────────────
const s2 = pptx.addSlide();
addBackground(s2);
s2.addText('The Motion at a Glance', { x: 0.5, y: 0.25, w: 12.3, h: 0.6, fontSize: 28, bold: true, color: C.navy, fontFace: 'Segoe UI' });
const headline = `${retirements.length} Azure retirements across ${totalResources} resources — ${eur(totalLo)}–${eur(totalHi)}/yr modernization (ACR) opportunity.`;
s2.addText(headline, { x: 0.5, y: 1.05, w: 12.3, h: 0.5, fontSize: 16, bold: true, color: overdue.length ? C.red : C.accentBlue, fontFace: 'Segoe UI' });
s2.addText('A proactive lifecycle motion: replace end-of-life services (JOB2), refresh the customer on current Azure, and convert the largest motions into MSX opportunities. Hygiene/security retirements carry no net-new ACR but build trust and reduce risk.', { x: 0.5, y: 1.55, w: 12.3, h: 0.55, fontSize: 11.5, color: C.darkGrey, fontFace: 'Segoe UI', lineSpacingMultiple: 1.25 });

// Two KPI cards
const kY = 2.25, kW = 5.95;
s2.addShape('roundRect', { x: 0.5, y: kY, w: kW, h: 1.45, rectRadius: 0.12, fill: { color: 'FDF2F2' }, line: { color: C.red, width: 2 } });
s2.addShape('rect', { x: 0.5, y: kY, w: kW, h: 0.07, fill: { color: C.red } });
s2.addText(`${overdue.length}`, { x: 0.5, y: kY + 0.13, w: kW, h: 0.55, fontSize: 40, bold: true, color: C.red, align: 'center', fontFace: 'Segoe UI' });
s2.addText('Overdue retirements', { x: 0.5, y: kY + 0.68, w: kW, h: 0.3, fontSize: 13, bold: true, color: C.darkGrey, align: 'center', fontFace: 'Segoe UI' });
s2.addText(`${resOf(overdue)} resources on unsupported services — act now.`, { x: 0.5, y: kY + 1.0, w: kW, h: 0.3, fontSize: 10.5, color: C.midGrey, align: 'center', fontFace: 'Segoe UI' });
const rX = 0.5 + kW + 0.4;
s2.addShape('roundRect', { x: rX, y: kY, w: kW, h: 1.45, rectRadius: 0.12, fill: { color: 'EBFAF5' }, line: { color: C.teal, width: 2 } });
s2.addShape('rect', { x: rX, y: kY, w: kW, h: 0.07, fill: { color: C.teal } });
s2.addText(`${revenue.length}`, { x: rX, y: kY + 0.13, w: kW, h: 0.55, fontSize: 40, bold: true, color: C.accentBlue, align: 'center', fontFace: 'Segoe UI' });
s2.addText('Revenue motions', { x: rX, y: kY + 0.68, w: kW, h: 0.3, fontSize: 13, bold: true, color: C.darkGrey, align: 'center', fontFace: 'Segoe UI' });
s2.addText(`${eur(totalLo)}–${eur(totalHi)}/yr ACR · ${hygiene.length} hygiene/posture items.`, { x: rX, y: kY + 1.0, w: kW, h: 0.3, fontSize: 10.5, color: C.midGrey, align: 'center', fontFace: 'Segoe UI' });

// Urgency tiles
const fY = 4.0;
s2.addText('Retirement Timeline', { x: 0.5, y: fY, w: 12.3, h: 0.4, fontSize: 16, bold: true, color: C.navy, fontFace: 'Segoe UI' });
const tileY = fY + 0.55, tileW = 2.95;
[['Overdue', overdue], ['Critical (< 3 mo)', critical], ['Upcoming (3-12 mo)', upcoming], ['Future (> 12 mo)', future]].forEach(([lab, arr], i) => {
  const key = lab.split(' ')[0];
  const u = URG[key];
  const tx = 0.5 + i * (tileW + 0.2);
  s2.addShape('roundRect', { x: tx, y: tileY, w: tileW, h: 1.35, rectRadius: 0.1, fill: { color: u.bg }, line: { color: u.col, width: 1.5 } });
  s2.addText(`${arr.length}`, { x: tx, y: tileY + 0.08, w: tileW, h: 0.45, fontSize: 30, bold: true, color: u.col, align: 'center', fontFace: 'Segoe UI' });
  s2.addText(lab, { x: tx, y: tileY + 0.52, w: tileW, h: 0.25, fontSize: 11, bold: true, color: C.darkGrey, align: 'center', fontFace: 'Segoe UI' });
  s2.addText(`${resOf(arr)} resources`, { x: tx, y: tileY + 0.8, w: tileW, h: 0.25, fontSize: 10, color: C.midGrey, align: 'center', fontFace: 'Segoe UI' });
});
addFooter(s2, `${CUSTOMER} · Motion at a Glance`);

// ── SLIDE 3: TOP REVENUE MOTIONS TABLE ──────────────────
const s3 = pptx.addSlide();
addBackground(s3);
s3.addText('Top Revenue Motions (by ACR)', { x: 0.5, y: 0.25, w: 12.3, h: 0.6, fontSize: 28, bold: true, color: C.navy, fontFace: 'Segoe UI' });
s3.addText(`${revenue.length} revenue motions · total ${eur(totalLo)}–${eur(totalHi)}/yr ACR. Bands are assumption-driven estimates (westeurope list, annualized) — not quotes.`, { x: 0.5, y: 0.95, w: 12.3, h: 0.4, fontSize: 11, color: C.midGrey, fontFace: 'Segoe UI' });

const head = ['Retirement', 'Urg.', 'Resources', 'MSX motion', 'ACR band €/yr', 'Conf.'];
const colW = [3.5, 1.0, 1.1, 3.9, 1.9, 0.9];
const tRows = [head.map((h) => ({ text: h, options: { bold: true, color: C.white, fill: { color: C.navy }, fontSize: 10, align: 'center', valign: 'middle' } }))];
revenue.slice(0, 10).forEach(({ r, m, lo, hi, c }, i) => {
  const u = URG[r.urgency];
  const bg = i % 2 ? C.paleGrey : C.white;
  tRows.push([
    { text: `${r.service_name} — ${r.retiring_feature}`, options: { fontSize: 9, color: C.darkGrey, fill: { color: bg }, valign: 'middle' } },
    { text: r.urgency, options: { fontSize: 8.5, bold: true, color: C.white, fill: { color: u.col }, align: 'center', valign: 'middle' } },
    { text: `${c}`, options: { fontSize: 10, bold: true, color: C.navy, fill: { color: bg }, align: 'center', valign: 'middle' } },
    { text: m.vehicle.replace('Opportunity — ', ''), options: { fontSize: 9, color: C.darkGrey, fill: { color: bg }, valign: 'middle' } },
    { text: `${eur(lo)}–${eur(hi)}`, options: { fontSize: 9.5, bold: true, color: C.accentBlue, fill: { color: bg }, align: 'center', valign: 'middle' } },
    { text: m.conf, options: { fontSize: 9, color: C.midGrey, fill: { color: bg }, align: 'center', valign: 'middle' } },
  ]);
});
tRows.push([
  { text: 'TOTAL (revenue motions)', options: { bold: true, fontSize: 10, color: C.navy, fill: { color: C.lightBlue }, valign: 'middle' } },
  { text: '', options: { fill: { color: C.lightBlue } } },
  { text: `${revenue.reduce((s, x) => s + x.c, 0)}`, options: { bold: true, fontSize: 10, color: C.navy, fill: { color: C.lightBlue }, align: 'center', valign: 'middle' } },
  { text: '', options: { fill: { color: C.lightBlue } } },
  { text: `${eur(totalLo)}–${eur(totalHi)}`, options: { bold: true, fontSize: 10, color: C.navy, fill: { color: C.lightBlue }, align: 'center', valign: 'middle' } },
  { text: '', options: { fill: { color: C.lightBlue } } },
]);
s3.addTable(tRows, { x: 0.5, y: 1.45, w: 12.3, colW, border: { type: 'solid', color: C.lightGrey, pt: 0.5 }, rowH: 0.34, valign: 'middle' });
addFooter(s3, `${CUSTOMER} · Top Revenue Motions`);

// ── SLIDE 4: HYGIENE / POSTURE ───────────────────────
const s4 = pptx.addSlide();
addBackground(s4);
s4.addText('Hygiene & Posture (no net-new ACR)', { x: 0.5, y: 0.25, w: 12.3, h: 0.6, fontSize: 28, bold: true, color: C.navy, fontFace: 'Segoe UI' });
s4.addText(`${hygiene.length} retirements are security/lifecycle hygiene — no revenue motion, but real risk reduction and trust value. Track as posture milestones in MSX.`, { x: 0.5, y: 0.95, w: 12.3, h: 0.45, fontSize: 11.5, color: C.darkGrey, fontFace: 'Segoe UI' });
const hygTop = hygiene.slice().sort((a, b) => b.c - a.c).slice(0, 8);
const hRows = [[
  { text: 'Retirement', options: { bold: true, color: C.white, fill: { color: C.navy }, fontSize: 10, valign: 'middle' } },
  { text: 'Resources', options: { bold: true, color: C.white, fill: { color: C.navy }, fontSize: 10, align: 'center', valign: 'middle' } },
  { text: 'Posture milestone', options: { bold: true, color: C.white, fill: { color: C.navy }, fontSize: 10, valign: 'middle' } },
]];
hygTop.forEach(({ r, m, c }, i) => {
  const bg = i % 2 ? C.paleGrey : C.white;
  hRows.push([
    { text: `${r.service_name} — ${r.retiring_feature}`, options: { fontSize: 9.5, color: C.darkGrey, fill: { color: bg }, valign: 'middle' } },
    { text: `${c}`, options: { fontSize: 10, bold: true, color: C.navy, fill: { color: bg }, align: 'center', valign: 'middle' } },
    { text: m.vehicle.replace('Milestone — ', ''), options: { fontSize: 9.5, color: C.midGrey, fill: { color: bg }, valign: 'middle' } },
  ]);
});
s4.addTable(hRows, { x: 0.5, y: 1.5, w: 12.3, colW: [5.8, 1.3, 5.2], border: { type: 'solid', color: C.lightGrey, pt: 0.5 }, rowH: 0.42, valign: 'middle' });
const topHyg = hygiene.slice().sort((a, b) => b.c - a.c)[0];
if (topHyg) {
  const hSubs = topHyg.r.impacted_subscriptions || 0;
  s4.addText(`Note: ${topHyg.r.service_name} — ${topHyg.r.retiring_feature} (${topHyg.c} resources${hSubs ? `, ${hSubs} subscriptions` : ''}) is the largest hygiene item — flag the cross-subscription engineering effort to the account team.`, { x: 0.5, y: 6.2, w: 12.3, h: 0.6, fontSize: 10, italic: true, color: C.midGrey, fontFace: 'Segoe UI' });
}
addFooter(s4, `${CUSTOMER} · Hygiene & Posture`);

// ── SLIDE 5: NEXT STEPS ────────────────────────────
const s5 = pptx.addSlide();
addBackground(s5);
s5.addText('Recommended Next Steps', { x: 0.5, y: 0.25, w: 12.3, h: 0.6, fontSize: 28, bold: true, color: C.navy, fontFace: 'Segoe UI' });
const steps = [
  { h: 'Close the overdue items now', d: `${overdue.length} retirements are past their date (${resOf(overdue)} resources). Lead with ${overdue.slice(0, 3).map((r) => r.service_name).join(', ') || 'the overdue items'} this quarter.`, col: C.red },
  { h: 'Convert the top motions to MSX opportunities', d: `${revenue.slice(0, 4).map((x) => x.r.service_name).join(', ') || 'The top revenue motions'} carry the bulk of the ${eur(totalLo)}–${eur(totalHi)}/yr opportunity.`, col: C.accentBlue },
  { h: 'Run a joint lifecycle & modernization workshop', d: 'Book a session within 30 days to confirm scope, validate usage-dependent bands (Databricks, Front Door) and agree a sequence with the customer.', col: C.green },
  { h: 'Position FinOps alongside the refresh', d: 'Attach reservations / savings plans to the modernized VM fleet to protect margin while growing ACR.', col: C.amber },
];
steps.forEach((s, i) => {
  const y = 1.2 + i * 1.35;
  s5.addShape('roundRect', { x: 0.5, y, w: 12.3, h: 1.15, rectRadius: 0.1, fill: { color: C.paleGrey }, line: { color: s.col, width: 1.5 } });
  s5.addShape('rect', { x: 0.5, y, w: 0.12, h: 1.15, fill: { color: s.col } });
  s5.addText(`${i + 1}`, { x: 0.7, y: y + 0.2, w: 0.7, h: 0.7, fontSize: 28, bold: true, color: s.col, align: 'center', fontFace: 'Segoe UI' });
  s5.addText(s.h, { x: 1.5, y: y + 0.13, w: 11.0, h: 0.4, fontSize: 14, bold: true, color: C.navy, fontFace: 'Segoe UI' });
  s5.addText(s.d, { x: 1.5, y: y + 0.52, w: 11.1, h: 0.55, fontSize: 10.5, color: C.darkGrey, fontFace: 'Segoe UI', lineSpacingMultiple: 1.2 });
});
addFooter(s5, `${CUSTOMER} · Next Steps`);

// ── WRITE ────────────────────────────────────
fs.mkdirSync(path.dirname(OUT), { recursive: true });
pptx.writeFile({ fileName: OUT }).then(() => {
  console.log('WROTE ' + OUT);
  console.log(`SLIDES 5 · REVENUE ${revenue.length} · HYGIENE ${hygiene.length} · ACR ${eur(totalLo)}-${eur(totalHi)}`);
});
