# Research Brief — Azure Retirement Motion

Compiled context for the squad. Not exhaustive — the live source of truth is
always the customer's `retirements.json` from the Azure Service Retirements skill.

## The motion (why this squad exists)
- 50–100+ Azure services/features/versions retire per year (full product
  retirements, feature deprecations, version retirements).
- The process is predictable; the opportunity is proactive management.
- CSU Belux objectives: **JOB2** (replace EOL services, track in MSX as
  opportunities/milestones), **refresh customers** on new Azure services, and
  **boost ACR/UCR** by positioning CSA activity around retirements.

## Data engine: Azure Service Retirements skill
- Cloned locally (set its path in `squad.yaml` under `external_skills`). Driven by
  `AGENTS.md` + `agent-retirements/agent.md`. Node 18+, Azure CLI, `pptxgenjs` via
  `npm install`.
- Auth = CSA's own `az login`; CXObserve resource id
  `api://f748ae1d-5e8a-4aa0-bfb3-67beda3d3676`.
- Three CXObserve APIs (summary by TPID, per-retirement detail, per-resource
  flattened). Enriches each retirement with urgency + migration steps + exec
  comment, writes `CustomerData/<Customer>/retirements.json`, then
  `npm run generate` builds the PPTX.
- Manual deck path (if json already exists):
  `$env:CUSTOMER_NAME=...; $env:CUSTOMER_DATA_DIR=...; npm run generate`.

## Common Azure retirement → replacement mappings (for enrichment cross-check)
- Azure Database for MariaDB → Azure Database for MySQL Flexible Server.
- PostgreSQL Single Server / old major versions → PostgreSQL Flexible Server (current major).
- Classic / unsupported VM SKUs → current-gen Dv5/Ev5 families.
- TLS 1.0/1.1 → enforce TLS 1.2 (config; no net-new ACR).
- Old runtime versions (e.g., .NET 7 in Functions, Spark 3.2 in Synapse,
  Grafana v9) → supported runtime/version upgrade.
- Azure Remote Rendering → retiring product; migration/exit guidance only.

Always confirm the authoritative path via the retirement's `learn_more_link`
and Microsoft Learn before writing steps.

## ACR estimation references
- Use public Azure list pricing as the band anchor for the replacement service
  (vCore + storage for databases, vCPU-hours for compute, etc.).
- Annual ACR ≈ replacement monthly run-rate × 12; present as a low–high band.
- Adjust for region (westeurope/northeurope for Belux) and a utilization
  assumption (state it). Never present as a quote.

## Tone references
- Executive: ROI / business-outcome language (Bianca).
- Consultative: data-driven, advisory (Morgan, Felix).
- Technical: engineer-to-engineer, concrete CLI/Portal (Ravi).
- Always Microsoft-aligned naming; evidence-based; no FUD.

## Microsoft Learn (live enrichment)
Use `mcp_microsoftdocs_microsoft_docs_search` / `_fetch` to confirm the official
migration path per retirement before authoring execution steps.
