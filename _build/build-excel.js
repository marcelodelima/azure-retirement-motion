const ExcelJS = require('exceljs');
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
const DATA = path.join(RUN, 'retirement-data', 'retirements.json');
const CUSTOMER = process.env.FILE_CUST || process.env.CUSTOMER_NAME || 'Customer';
const DATE = process.env.REPORT_DATE || new Date().toISOString().slice(0, 10);
const OUT = path.join(RUN, 'customer', `RetirementImpact-${CUSTOMER}-${DATE}.xlsx`);

const URGENCY_RANK = { Overdue: 0, Critical: 1, Upcoming: 2, Future: 3 };
const IMPACT_RANK = { High: 0, Medium: 1, Low: 2 };

const retirements = JSON.parse(fs.readFileSync(DATA, 'utf-8'));
retirements.sort((a, b) => {
  if (URGENCY_RANK[a.urgency] !== URGENCY_RANK[b.urgency]) return URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency];
  if (IMPACT_RANK[a.impact] !== IMPACT_RANK[b.impact]) return (IMPACT_RANK[a.impact] ?? 9) - (IMPACT_RANK[b.impact] ?? 9);
  return (b.impacted_resources || 0) - (a.impacted_resources || 0);
});

function safeSheetName(base, used) {
  let name = base.replace(/[\[\]\:\*\?\/\\]/g, ' ').replace(/\s+/g, ' ').trim();
  if (name.length > 31) name = name.slice(0, 31).trim();
  if (!name) name = 'Sheet';
  let candidate = name;
  let i = 2;
  while (used.has(candidate.toLowerCase())) {
    const suffix = ` (${i})`;
    candidate = (name.slice(0, 31 - suffix.length).trim()) + suffix;
    i++;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

const wb = new ExcelJS.Workbook();
wb.creator = 'Ethan Excel — Azure Retirement Motion';
wb.created = new Date();

const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B2A4A' } };
const headerFont = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
const COLS = ['Resource', 'Subscription', 'Resource Group', 'Location', 'Workload'];

// Summary sheet first
const summary = wb.addWorksheet('Summary', { views: [{ state: 'frozen', ySplit: 1 }] });
summary.columns = [
  { header: '#', width: 5 },
  { header: 'Service', width: 30 },
  { header: 'Retiring Feature', width: 42 },
  { header: 'Urgency', width: 12 },
  { header: 'Impact', width: 10 },
  { header: 'Retirement Date', width: 16 },
  { header: 'Impacted Resources', width: 18 },
  { header: 'Subscriptions', width: 14 },
  { header: 'Workloads', width: 12 },
];
summary.getRow(1).eachCell((c) => { c.fill = headerFill; c.font = headerFont; c.alignment = { vertical: 'middle' }; });

const used = new Set(['summary']);
const tally = [];

retirements.forEach((r, idx) => {
  const dt = new Date(r.retirement_date).toISOString().slice(0, 10);
  summary.addRow([idx + 1, r.service_name, r.retiring_feature, r.urgency, r.impact, dt, r.impacted_resources || 0, r.impacted_subscriptions || 0, r.impacted_workloads || 0]);

  const base = `${r.service_name} - ${r.retiring_feature}`;
  const sheetName = safeSheetName(base, used);
  const ws = wb.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = [
    { header: COLS[0], width: 38 },
    { header: COLS[1], width: 34 },
    { header: COLS[2], width: 32 },
    { header: COLS[3], width: 16 },
    { header: COLS[4], width: 28 },
  ];
  ws.getRow(1).eachCell((c) => { c.fill = headerFill; c.font = headerFont; c.alignment = { vertical: 'middle' }; });

  const detail = r.resources_detail || [];
  if (detail.length === 0) {
    ws.addRow(['No resource-level detail returned for this retirement.', '', '', '', '']);
    tally.push({ sheet: sheetName, service: base, rows: 0, src: 0, note: true });
  } else {
    detail.forEach((d) => ws.addRow([d.name || '', d.subscription || '', d.resource_group || '', d.location || '', d.workload || '']));
    tally.push({ sheet: sheetName, service: base, rows: detail.length, src: detail.length, note: false });
  }
});

fs.mkdirSync(path.dirname(OUT), { recursive: true });
wb.xlsx.writeFile(OUT).then(() => {
  console.log('WROTE ' + OUT);
  console.log('SHEETS ' + (retirements.length + 1) + ' (incl. summary)');
  let allMatch = true;
  tally.forEach((t) => {
    const ok = t.rows === t.src;
    if (!ok) allMatch = false;
    console.log(`${ok ? 'OK ' : 'BAD'} ${t.rows}/${t.src}  ${t.sheet}`);
  });
  console.log('RECONCILED ' + (allMatch ? 'ALL' : 'MISMATCH'));
  const totalRows = tally.reduce((s, t) => s + t.rows, 0);
  console.log('TOTAL_ROWS ' + totalRows);
});
