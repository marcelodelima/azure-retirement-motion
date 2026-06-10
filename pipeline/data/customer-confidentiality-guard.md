# Customer Confidentiality Guard — Azure Retirement Motion

This squad handles customer-identifiable Azure data (resource names,
subscriptions, TPIDs, workloads). Every agent MUST follow these rules.

## Hard rules
1. **One run = one customer.** Never reference, compare, or carry over another
   customer's resources, TPID, retirements, or ACR into this run's outputs.
2. **`resources_detail` is confidential.** Resource names, subscription names,
   resource groups, and workloads belong ONLY in this customer's customer-facing
   artifacts (Excel, execution plan) and the internal artifacts for this run.
3. **Internal-only data stays internal.** ACR estimates, JOB2 opportunity framing,
   MSX milestones, and revenue-at-risk NEVER appear in customer-facing artifacts
   (PPTX content additions, Excel, execution plan, follow-up email).
4. **No secrets.** Never echo access tokens or `az account get-access-token`
   output. The skill requests tokens at runtime; treat them as transient.
5. **Customer name fidelity.** Use the exact `TPName` confirmed against CXObserve.
   Do not invent or abbreviate the legal/brand name inconsistently.

## Output separation
| Artifact | Audience | May contain ACR? | May contain resource detail? |
|----------|----------|------------------|------------------------------|
| PowerPoint deck (skill) | Customer | No | Yes |
| Excel workbook | Customer | No | Yes |
| Execution plan | Customer | No | Yes |
| Motion / opportunity plan | Internal | **Yes** | Yes |
| Executive briefing | Internal | **Yes** | Summary only |
| Follow-up email | Customer | No | Top items only, no full lists |

## When in doubt
Flag to the CSA at the next checkpoint rather than guessing. A withheld figure is
recoverable; a leaked customer/ACR detail is not.
