/* Deterministic, customer-specific "Why now" narrative for Maurice Mailing. */

const URGENCY_ORDER = { Overdue: 0, Critical: 1, Upcoming: 2, Future: 3 };

function urgencyOf(name) {
  return String(name || '').match(/^\((Overdue|Critical|Upcoming|Future)\)\s*/)?.[1] || 'Future';
}

function motionArea(item) {
  const text = `${item.name || ''} ${item.workload || ''}`.toLowerCase();
  if (/load balancer|public ip|network|front door|firewall|waf|ddos|bastion/.test(text)) return 'networking';
  if (/databricks|analytics|synapse|data factory/.test(text)) return 'analytics';
  if (/postgres|sql|cosmos|database/.test(text)) return 'database';
  if (/redis|cache/.test(text)) return 'caching';
  if (/storage|disk|blob|file|adls|san/.test(text)) return 'storage';
  if (/virtual machine|azure linux|compute|vm\b/.test(text)) return 'compute';
  if (/function|app service|application|container|kubernetes|aks/.test(text)) return 'application platform';
  if (/security|key vault|hsm|tls|encryption/.test(text)) return 'security';
  return 'platform';
}

function plural(count, singular, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function verb(count) {
  return count === 1 ? 'is' : 'are';
}

function joinAreas(areas) {
  if (areas.length === 1) return areas[0];
  if (areas.length === 2) return `${areas[0]} and ${areas[1]}`;
  return `${areas.slice(0, -1).join(', ')}, and ${areas.at(-1)}`;
}

function areaOutcome(areas) {
  const outcomes = [];
  if (areas.includes('networking')) outcomes.push('connectivity and service continuity');
  if (areas.some((area) => area === 'storage' || area === 'database')) outcomes.push('data-platform supportability');
  if (areas.includes('compute')) outcomes.push('compute capacity and performance');
  if (areas.some((area) => area === 'application platform' || area === 'caching')) outcomes.push('application continuity');
  if (areas.includes('analytics')) outcomes.push('analytics continuity');
  if (areas.includes('security')) outcomes.push('security posture');
  return joinAreas([...new Set(outcomes)].slice(0, 3)) || 'supportability and reliability';
}

function buildWhyNow(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      text: 'No production milestones were available to establish a retirement urgency narrative. Confirm the live MSX records before engaging the account team.',
      evidence: { counts: { Overdue: 0, Critical: 0, Upcoming: 0, Future: 0 }, priorityAreas: [] },
    };
  }

  const enriched = items.map((item) => ({ ...item, urgency: urgencyOf(item.name), area: motionArea(item) }));
  const counts = Object.fromEntries(Object.keys(URGENCY_ORDER).map((urgency) => [urgency, enriched.filter((item) => item.urgency === urgency).length]));
  const activeUrgencies = Object.keys(URGENCY_ORDER).filter((urgency) => counts[urgency] > 0);
  const highestUrgency = activeUrgencies.sort((a, b) => URGENCY_ORDER[a] - URGENCY_ORDER[b])[0];
  const focus = enriched.filter((item) => item.urgency === highestUrgency || (highestUrgency === 'Overdue' && item.urgency === 'Critical'));
  const priorityAreas = [...new Set(focus.sort((a, b) => Number(b.monthlyUse || 0) - Number(a.monthlyUse || 0)).map((item) => item.area))].slice(0, 3);
  const areaPhrase = joinAreas(priorityAreas);
  let opening;

  if (counts.Overdue && counts.Critical) {
    opening = `${plural(counts.Overdue, 'milestone')} ${verb(counts.Overdue)} already overdue, and ${plural(counts.Critical, 'milestone')} ${verb(counts.Critical)} critical. The immediate work spans ${areaPhrase}.`;
  } else if (counts.Overdue) {
    opening = `${plural(counts.Overdue, 'milestone')} ${verb(counts.Overdue)} already overdue, with the immediate work concentrated in ${areaPhrase}.`;
  } else if (counts.Critical) {
    opening = `${plural(counts.Critical, 'milestone')} ${verb(counts.Critical)} critical, with the most time-sensitive work spanning ${areaPhrase}.`;
  } else if (counts.Upcoming) {
    opening = `${plural(counts.Upcoming, 'milestone')} ${verb(counts.Upcoming)} upcoming, led by ${areaPhrase} modernization.`;
  } else {
    const largest = [...enriched].sort((a, b) => Number(b.monthlyUse || 0) - Number(a.monthlyUse || 0));
    const largestAreas = [...new Set(largest.map((item) => item.area))].slice(0, 3);
    priorityAreas.splice(0, priorityAreas.length, ...largestAreas);
    opening = `The current milestones are future-dated, with the largest modernization motions concentrated in ${joinAreas(largestAreas)}.`;
  }

  const outcome = areaOutcome(priorityAreas);
  const timing = counts.Overdue
    ? 'Starting now helps close expired-support gaps, protect'
    : counts.Critical
      ? 'Starting now preserves delivery runway and protects'
      : 'Planning now preserves delivery runway and protects';
  const text = `${opening} ${timing} ${outcome}, and gives the team time to validate dependencies, sequence migrations, and align delivery before the remaining end-of-support dates.`;

  return { text, evidence: { counts, highestUrgency, priorityAreas } };
}

module.exports = { buildWhyNow, urgencyOf, motionArea };
