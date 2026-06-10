---
execution: inline
agent: bianca-briefing
inputFile: squads/azure-retirement-motion/output/internal/MotionPlan-report.md
outputFile: squads/azure-retirement-motion/output/internal/ExecutiveBriefing-report.md
---

# Step 10: Executive Briefing

Bianca Briefing (inline) writes the **one-page internal executive briefing** — the C-suite narrative that rolls up Morgan's ACR into a revenue-at-risk / modernization-opportunity story for CSU leadership and the account team. Internal only.

Bianca also produces the **Internal Briefing PowerPoint deck** — a visual companion to the briefing for sharing with the **CSAM and v-team**. It reuses the customer assessment deck template (`RetirementAssessment-<Customer>-<date>`) but, being internal, it **may** include ACR bands, MSX motions and confidence. This deck is a **squad standard** — produce it on every run.

## Context Loading

- `squads/azure-retirement-motion/output/internal/MotionPlan-<Customer>-<date>.md` — motion verdicts + ACR bands
- `squads/azure-retirement-motion/output/retirement-data/collection-report.md` — headline counts + urgency split
- `squads/azure-retirement-motion/pipeline/data/output-examples.md` — Example 4 (briefing opener)
- `squads/azure-retirement-motion/pipeline/data/customer-confidentiality-guard.md` — internal-only rules

## Instructions

### Process
1. **Load** Morgan's motion plan and the collection report.
2. **Open** with the headline: number of retirements over 12 months, urgency split, most urgent item + date, and the **total ACR opportunity band**.
3. **Frame the opportunity** (JOB2): biggest 1–2 motions, posture/risk benefits.
4. **State revenue-at-risk / runway**: what's at stake if nothing is done.
5. **Close** with the recommended next step (workshop/session) and a timeframe.
6. **Keep to one page**; business register, no jargon. Every figure matches Morgan's plan.
7. **Write** to `output/{run_id}/internal/ExecutiveBriefing-<Customer>-<date>.md`. Write a short confirmation report (this step's `outputFile`).
8. **Generate the Internal Briefing deck** by running the squad's deck builder, which reads `retirements.json` and the shared motion classifier (`_build/motion-classify.js`) so the deck's ACR/motion figures match Morgan's plan exactly:
   ```powershell
   node "squads/azure-retirement-motion/_build/build-internal-deck.js"
   ```
   It auto-detects the latest run folder and derives customer/date from the `MotionPlan-<Customer>-<date>.md` filename, so no arguments are normally required. Optional env overrides: `RUN_DIR`, `CUSTOMER_NAME`, `FILE_CUST`, `REPORT_DATE`, `TPID`. It writes `output/{run_id}/internal/InternalBriefing-<Customer>-<date>.pptx` (5 slides: Title, Motion at a Glance, Top Revenue Motions, Hygiene & Posture, Next Steps). Visual template mirrors `RetirementAssessment-<Customer>-<date>`. Validate the file exists and is non-empty before continuing.

### Decision Criteria
- **All-hygiene engagement:** frame around risk reduction and posture; set ACR expectations honestly (no revenue motion).
- **Wide/low-confidence ACR:** present the band and label it an early estimate.

## Output Format

```markdown
# {Customer} — Azure Lifecycle & Retirement Briefing ({date}) [INTERNAL]

{Headline paragraph: N retirements, urgency split, most urgent + date, total ACR band.}

{Opportunity paragraph: top motions, posture benefits.}

{Runway / revenue-at-risk paragraph.}

**Recommended next step:** {workshop/session} within {timeframe}.
```

## Output Example

See `pipeline/data/output-examples.md` Example 4 — the Contoso briefing opener.

## Veto Conditions

1. Briefing exceeds one page.
2. Any figure contradicts Morgan's motion plan.
3. Written anywhere other than `output/{run_id}/internal/`.

## Quality Criteria

- [ ] One page; opens with ACR band + most urgent retirement.
- [ ] JOB2 modernization narrative present; business register, no jargon.
- [ ] All figures reconcile with the motion plan.
- [ ] Closes with a dated next step.
- [ ] **Internal Briefing deck** (`InternalBriefing-<Customer>-<date>.pptx`) generated, non-empty, ACR figures reconcile with Morgan's plan, template mirrors the customer assessment deck.
- [ ] Internal only; saved under `output/{run_id}/internal/`.
