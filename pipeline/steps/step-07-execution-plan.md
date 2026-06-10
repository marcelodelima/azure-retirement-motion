---
execution: inline
agent: ravi-runbook
inputFile: squads/azure-retirement-motion/output/retirement-data/retirements.json
outputFile: squads/azure-retirement-motion/output/customer/ExecutionPlan-report.md
---

# Step 07: Author Consolidated Execution / Migration Plan

Ravi Runbook (inline) writes the **complete execution plan** — a single consolidated document with **one section per retirement** — giving the customer a concrete, step-by-step path from the retiring service to its replacement. This is a customer-facing deliverable.

## Context Loading

- `squads/azure-retirement-motion/output/retirement-data/retirements.json` — migration_steps[], replacement, resource detail
- `squads/azure-retirement-motion/pipeline/data/research-brief.md` — retirement→replacement mappings
- `squads/azure-retirement-motion/pipeline/data/output-examples.md` — Example 2 (execution plan section)
- `squads/azure-retirement-motion/pipeline/data/customer-confidentiality-guard.md` — customer-facing rules
- MS Learn MCP (`microsoft_docs_search` / `microsoft_docs_fetch`) — authoritative migration guidance

## Instructions

### Process
1. **Load** `retirements.json`; process retirements in canonical order.
2. For **each retirement**, write a section containing:
   - **Scope** — what's retiring, the replacement, retirement date, affected resource/workload count.
   - **Prerequisites** — access, tooling, versions, backups.
   - **Migration steps** — concrete, ordered, executable (use `migration_steps[]` + MS Learn enrichment; include CLI/portal where useful).
   - **Validation** — how to confirm the migration succeeded.
   - **Rollback** — how to revert if it fails.
   - **Downtime** — expected impact window.
   - **Effort** — rough sizing (S/M/L or hours).
3. **Enrich** every step against MS Learn so guidance is current and correct.
4. **No internal data** (no ACR/opportunity) — customer-facing.
5. **Write** the consolidated plan to `output/{run_id}/customer/ExecutionPlan-<Customer>-<date>.md`. Write a short confirmation report (this step's `outputFile`).

### Decision Criteria
- **Config-only retirement (e.g., TLS enforcement):** keep all blocks but note "no migration, configuration change only"; still provide validation + rollback.
- **Retirement with no documented replacement:** state the recommended modern alternative and cite the source.
- **Conflicting guidance:** prefer the most recent MS Learn doc and cite it.

## Output Format

```markdown
# Execution Plan — {customer_display_name}

Generated {date} · Reference date {reporting_date}

## 1. {Service} — {Retiring feature} → {Replacement}
**Retirement date:** {date} · **Urgency:** {label} · **Resources:** {n}

### Scope
...
### Prerequisites
...
### Migration steps
1. ...
### Validation
...
### Rollback
...
### Downtime
...
### Effort
...

## 2. {next retirement} ...
```

## Output Example

See `pipeline/data/output-examples.md` Example 2 — the PostgreSQL 11 → PG 16 section.

## Veto Conditions

1. Any retirement from `retirements.json` missing its section.
2. A section missing Migration steps, Validation, or Rollback.
3. Any internal/ACR content present (customer-facing breach).

## Quality Criteria

- [ ] One section per retirement, in canonical order.
- [ ] Each section has Scope, Prerequisites, Migration steps, Validation, Rollback, Downtime, Effort.
- [ ] Steps are concrete and MS Learn-enriched (with links).
- [ ] No internal data; saved under `output/{run_id}/customer/`.
