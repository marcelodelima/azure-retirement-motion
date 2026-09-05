const ExcelJS = require('exceljs');
const fs = require('fs');
const os = require('os');
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
const CUSTOMER = process.env.FILE_CUST || process.env.CUSTOMER_NAME || 'Customer';
const DATE = process.env.REPORT_DATE || new Date().toISOString().slice(0, 10);
const OUT = process.env.EXCEL_OUTPUT || path.join(RUN, 'customer', `RetirementImpact-${CUSTOMER}-${DATE}.xlsx`);

const URGENCY_RANK = { Overdue: 0, Critical: 1, Upcoming: 2, Future: 3 };
const IMPACT_RANK = { High: 0, Medium: 1, Low: 2 };

const retirements = JSON.parse(fs.readFileSync(DATA, 'utf-8'));
retirements.sort((a, b) => {
  if (URGENCY_RANK[a.urgency] !== URGENCY_RANK[b.urgency]) return URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency];
  if (IMPACT_RANK[a.impact] !== IMPACT_RANK[b.impact]) return (IMPACT_RANK[a.impact] ?? 9) - (IMPACT_RANK[b.impact] ?? 9);
  return (b.impacted_resources || 0) - (a.impacted_resources || 0);
});

const wb = new ExcelJS.Workbook();
wb.creator = 'Ethan Excel - Azure Retirement Motion';
wb.created = new Date();

const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B2A4A' } };
const headerFont = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
const sectionFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
const linkFont = { color: { argb: 'FF0563C1' }, underline: true };

function styleHeader(sheet) {
  sheet.getRow(1).height = 28;
  sheet.getRow(1).eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  });
}

function dateOnly(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

function officialLink(url) {
  return url ? { text: 'Learn More', hyperlink: url, tooltip: url } : '';
}

function subscriptionId(detail) {
  if (detail.subscription_id) return detail.subscription_id;
  const match = String(detail.resource_id || '').match(/\/subscriptions\/([^/]+)/i);
  return match ? match[1] : '';
}

function officialRetirementName(retirement) {
  return retirement.label || retirement.retiring_feature || retirement.service_name || 'Retirement';
}

function retirementSheetName(index, retirement) {
  const prefix = `${index + 1}. `;
  const title = officialRetirementName(retirement)
    .replace(/[\[\]:*?/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return `${prefix}${title}`.slice(0, 31).trim();
}

function portalLink(resourceId) {
  if (!resourceId) return '';
  return {
    text: 'Open in Azure Portal',
    hyperlink: `https://portal.azure.com/#@/resource${resourceId}`,
    tooltip: resourceId,
  };
}

const readMe = wb.addWorksheet('Read Me', { properties: { tabColor: { argb: 'FF5B9BD5' } } });
readMe.columns = [{ width: 24 }, { width: 100 }];
readMe.mergeCells('A1:B1');
readMe.getCell('A1').value = 'Azure Retirement Impact Workbook';
readMe.getCell('A1').fill = headerFill;
readMe.getCell('A1').font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 16 };
readMe.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left' };
const readMeRows = [
  ['Customer', process.env.CUSTOMER_NAME || CUSTOMER],
  ['Report date', DATE],
  ['Purpose', 'This workbook identifies Azure service retirements currently applicable to the customer and the known impacted Azure resources.'],
  ['Summary', 'One row per applicable retirement, including impact, recommendation, potential benefit, and a link to the official Azure retirement notice.'],
  ['Impacted Resources', 'Each numbered retirement tab contains its filterable resource-level inventory. Use the column filters to isolate a subscription, resource group, resource type, or location.'],
  ['Urgency', 'Overdue: retirement date has passed. Critical: within 3 months. Upcoming: within 3-12 months. Future: more than 12 months away.'],
  ['Learn More', 'Use the links in the Summary tab to open the official Azure Updates retirement notice and confirm current dates and guidance.'],
  ['Confidentiality', 'Customer confidential. Resource names, subscription identifiers, and resource IDs must only be shared with the intended customer team.'],
];
readMeRows.forEach(([label, text], index) => {
  const row = readMe.getRow(index + 3);
  row.values = [label, text];
  row.getCell(1).font = { bold: true, color: { argb: 'FF1B2A4A' } };
  row.getCell(1).fill = sectionFill;
  row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
});
for (let rowNumber = 1; rowNumber <= readMeRows.length + 2; rowNumber += 1) {
  readMe.getRow(rowNumber).height = 60; // 80 px at Excel's standard 96 DPI.
}

const summary = wb.addWorksheet('Summary', { views: [{ state: 'frozen', ySplit: 1 }] });
summary.columns = [
  { header: '#', width: 5 },
  { header: 'Service Name', width: 28 },
  { header: 'Retirement', width: 44 },
  { header: 'Urgency', width: 12 },
  { header: 'Impact', width: 10 },
  { header: 'Retirement Date', width: 16 },
  { header: 'Impacted Resources', width: 18 },
  { header: 'Impacted Subscriptions', width: 22 },
  { header: 'Impacted Workloads', width: 19 },
  { header: 'Recommendation', width: 48 },
  { header: 'Potential Benefit', width: 44 },
  { header: 'Resource Type', width: 38 },
  { header: 'Learn More', width: 54 },
];
styleHeader(summary);
summary.autoFilter = 'A1:M1';

let resourceRows = 0;

retirements.forEach((r, idx) => {
  const retirementName = officialRetirementName(r);
  const summaryRow = summary.addRow([
    idx + 1, r.service_name || '', retirementName, r.urgency || '', r.impact || '',
    dateOnly(r.retirement_date), r.impacted_resources || 0, r.impacted_subscriptions || 0,
    r.impacted_workloads || 0, r.recommendation || r.description || '', r.potential_benefit || '',
    r.resource_type || '', officialLink(r.learn_more_link),
  ]);
  summaryRow.alignment = { vertical: 'top', wrapText: true };
  if (r.learn_more_link) summaryRow.getCell(13).font = linkFont;

  const resources = wb.addWorksheet(retirementSheetName(idx, r), { views: [{ state: 'frozen', ySplit: 1 }] });
  resources.columns = [
    { header: 'Retirement', width: 44 },
    { header: 'Subscription Name', width: 32 },
    { header: 'Subscription ID', width: 38 },
    { header: 'Resource Group', width: 30 },
    { header: 'Resource Name', width: 38 },
    { header: 'Resource Type', width: 40 },
    { header: 'Location', width: 18 },
    { header: 'Resource ID', width: 72 },
    { header: 'Azure Portal', width: 22 },
  ];
  styleHeader(resources);
  resources.autoFilter = 'A1:I1';

  const detail = r.resources_detail || [];
  detail.forEach((d) => {
    const row = resources.addRow([
      retirementName, d.subscription || '', subscriptionId(d),
      d.resource_group || '', d.name || '', d.resource_type || r.resource_type || '',
      d.location || '', d.resource_id || '', portalLink(d.resource_id),
    ]);
    row.alignment = { vertical: 'top' };
    row.getCell(8).alignment = { vertical: 'top', wrapText: true };
    if (d.resource_id) row.getCell(9).font = linkFont;
    resourceRows += 1;
  });
});

fs.mkdirSync(path.dirname(OUT), { recursive: true });
const tempOutput = path.join(os.tmpdir(), `ethan-${process.pid}-${Date.now()}.xlsx`);
wb.xlsx.writeFile(tempOutput).then(() => {
  fs.copyFileSync(tempOutput, OUT);
  fs.unlinkSync(tempOutput);
  console.log('WROTE ' + OUT);
  console.log('SHEETS Read Me | Summary | ' + retirements.length + ' retirement sheets');
  console.log('SUMMARY_ROWS ' + retirements.length);
  console.log('RESOURCE_ROWS ' + resourceRows);
});
