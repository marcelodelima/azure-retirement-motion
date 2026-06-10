# Squad Memory: Azure Retirement Motion

## Estilo de Escrita

## Design Visual

## Estrutura de Conteúdo

## Proibições Explícitas

## Técnico (específico do squad)
- **Resources column (standard):** the Morgan motion summary table must include a
  **Resources** column (affected-resource count per retirement) with a reconciling
  total. Enforced in `step-09`, `morgan-motion.agent.md`, `quality-criteria.md`,
  `domain-framework.md`.
- **Internal Briefing deck (standard):** every run produces
  `internal/InternalBriefing-<Customer>-<date>.pptx` via `_build/build-internal-deck.js`
  (Bianca / step-10). Reuses the customer assessment deck template
  (`RetirementAssessment-*`) and MAY include ACR/MSX (internal-only). Auto-detects
  the latest run folder + customer/date from the `MotionPlan-*.md` filename; env
  overrides: `RUN_DIR`, `CUSTOMER_NAME`, `FILE_CUST`, `REPORT_DATE`, `TPID`.
- **Shared ACR classifier:** `_build/motion-classify.js` is the single source of
  truth for motion/ACR classification — used by BOTH `build-motionplan.js` and
  `build-internal-deck.js` so figures always reconcile. Exports
  `{ motion, classifyAll, URGENCY_RANK, d10, eur }`.
- **Tooling:** all data processing in Node.js (no Python on this machine).
  `pptxgenjs` + `exceljs` installed under `_build/node_modules`.
- **PowerShell terminal caveat:** env vars persist between commands — clear stale
  `RUN_DIR`/`DATA` before running build scripts, or they double the path.
