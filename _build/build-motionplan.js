/* Morgan Motion — internal motion/opportunity plan with ACR bands from retirements.json */
const fs = require('fs');
const path = require('path');
const { classifyAll, d10, eur } = require('./motion-classify');

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
const CUSTOMER = process.env.CUSTOMER_NAME || 'Customer';
const FILE_CUST = process.env.FILE_CUST || 'Customer';
const DATE = process.env.REPORT_DATE || new Date().toISOString().slice(0, 10);
const TPID = process.env.TPID || '';
const OUT = path.join(RUN, 'internal', `MotionPlan-${FILE_CUST}-${DATE}.md`);

const retirements = JSON.parse(fs.readFileSync(DATA, 'utf-8'));

// Classify + order (urgency → ACR potential desc) via the shared module.
const enriched = classifyAll(retirements);

let totalLo = 0, totalHi = 0, revCount = 0, hygCount = 0, totalResources = 0;
let rows = '';
let detail = '';
enriched.forEach(({ r, m }, i) => {
  const n = i + 1;
  const c = r.impacted_resources || 0;
  totalResources += c;
  const title = `${r.service_name} — ${r.retiring_feature}`;
  if (m.type === 'revenue') {
    const lo = m.loRate * c, hi = m.hiRate * c;
    totalLo += lo; totalHi += hi; revCount++;
    rows += `| ${n} | ${title} | ${c} | revenue | ${m.vehicle} | ${eur(lo)}–${eur(hi)} | ${m.conf} |\n`;
    detail += `### ${n}. ${title}\n`;
    detail += `- **Urgency:** ${r.urgency} · **Date:** ${d10(r.retirement_date)} · **Impacted resources:** ${c}\n`;
    detail += `- **Motion:** Revenue — ${m.vehicle}\n`;
    detail += `- **ACR band:** ${eur(lo)}–${eur(hi)} / yr\n`;
    detail += `- **Assumptions:** ${m.assume}\n`;
    detail += `- **Confidence:** ${m.conf}\n`;
    detail += `- **CSA next action:** ${m.action}\n\n`;
  } else {
    hygCount++;
    rows += `| ${n} | ${title} | ${c} | hygiene | ${m.vehicle} | — | — |\n`;
    detail += `### ${n}. ${title}\n`;
    detail += `- **Urgency:** ${r.urgency} · **Date:** ${d10(r.retirement_date)} · **Impacted resources:** ${c}\n`;
    detail += `- **Motion:** Hygiene — no net-new ACR\n`;
    detail += `- **Rationale:** ${m.assume}\n`;
    detail += `- **CSA next action:** ${m.action}\n\n`;
  }
});

const header = `# Motion Plan (INTERNAL) — ${CUSTOMER}

> **INTERNAL ONLY.** Contains ACR estimates and MSX framing. Never share with the customer.

**Built at:** ${new Date().toISOString()} · **Reference date:** ${DATE}${TPID ? ` · **TPID:** ${TPID}` : ''}
**Retirements:** ${retirements.length} (${revCount} revenue motions · ${hygCount} hygiene/posture)
**Total ACR opportunity (rolled up, revenue motions only):** ${eur(totalLo)}–${eur(totalHi)} / year

ACR figures are rough, assumption-driven bands anchored on impacted-resource counts and Azure public list pricing (westeurope), annualized — **estimates, not quotes**. Each band carries its assumptions and a confidence tag. Hygiene/security retirements carry no net-new ACR and are tracked as posture milestones.

## Motion summary

| # | Retirement | Resources | Motion | MSX vehicle | ACR band (€/yr) | Confidence |
|---|------------|-----------|--------|-------------|-----------------|------------|
${rows}| | **TOTAL (revenue motions)** | **${totalResources}** | | | **${eur(totalLo)}–${eur(totalHi)}** | |

## Per-retirement detail

${detail}`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, header, 'utf-8');
console.log('WROTE ' + OUT);
console.log(`REVENUE ${revCount} HYGIENE ${hygCount} TOTAL_ACR ${eur(totalLo)}-${eur(totalHi)}`);
console.log('TLO ' + totalLo + ' THI ' + totalHi);
