---
task: "Generate Deck"
order: 3
input: |
  - retirements_json: Path to the enriched retirements.json (from extract task)
  - resolved: Confirmed customer TPName + customer_data_dir
output: |
  - pptx_path: Path to the generated customer PowerPoint deck
---

# Generate Deck

Run the cloned skill's Stage 3 to produce the customer PowerPoint deck from
`retirements.json`. The deck is generated **unchanged** — this squad never edits
the skill's deck format.

## Process

1. **Ensure dependencies.** In the cloned retirements-agent repo, run `npm install`
   if `node_modules` is absent (the skill uses `pptxgenjs`).
2. **Set environment** and generate:
   ```powershell
   $env:CUSTOMER_NAME = "<TPName>"
   $env:CUSTOMER_DATA_DIR = "<customer folder>"
   npm run generate
   ```
3. **Confirm output**: a file matching
   `CustomerData/<Customer>/RetirementAssessment-<customer>-YYYY-MM-DD.pptx` exists.
4. **Record the path** in the collection report and mirror a pointer into
   `output/{run_id}/retirement-data/`.
5. **On generation error**, capture stderr verbatim and report it — do not retry
   blindly or hand-craft a deck.

## Output Format

```yaml
deck:
  generated: true
  path: "CustomerData/<Customer>/RetirementAssessment-<customer>-YYYY-MM-DD.pptx"
  generator: "npm run generate"
  notes: ""
```

## Output Example

> Use as quality reference, not as rigid template.

```yaml
deck:
  generated: true
  path: "CustomerData/Contoso/RetirementAssessment-Contoso-2026-06-10.pptx"
  generator: "npm run generate (pptxgenjs)"
  notes: "node_modules already present; generated in 4.2s"
```

## Quality Criteria

- [ ] `npm run generate` completed without errors.
- [ ] PPTX file present at the expected `CustomerData/<Customer>/` path.
- [ ] Deck format left exactly as the skill produces it (no manual edits).
- [ ] Path recorded in the run's retirement-data folder.

## Veto Conditions

Reject and redo if ANY are true:
1. No PPTX file was produced but the task reported success.
2. The deck was hand-edited or regenerated with a modified template.
