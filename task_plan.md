# Task Plan: Normal Calculator Refactor

## Goal
Normalize the normal-distribution calculator architecture deliberately: shared math first, then component extraction, with behavior preserved and verification after each phase.

## Current Phase
Complete

## Phases

### Phase 0: Location Normalization
- [x] Move `web/src/NormalDistributionCalculator.tsx` to `web/src/components/NormalDistributionCalculator.tsx`
- [x] Update `web/src/App.tsx` lazy import and `CalcMode` type import
- [x] Update local path references in `AGENTS.md` and `CONTEXT.md`
- **Status:** complete

### Phase 1: Shared Math Source Of Truth
- [x] Replace duplicate local helpers in `web/src/components/NormalDistributionCalculator.tsx` with imports from `web/src/lib/statistics/math.ts`
- [x] Replace duplicate local helpers in `web/src/components/HypothesisTestingCalculator.tsx` with imports from `web/src/lib/statistics/math.ts`
- [x] Keep helper signatures stable: `erf`, `normalCDF`, `normalPDF`, `inverseNormalCDF`, `studentTCDF`, `studentTPPFInitial`, `studentTPPF`
- [x] Delete local duplicate helper implementations after imports compile
- [x] Run `npm run lint:tsc`, `npm test`, `npm run lint:colors`, `npm run build`
- **Status:** complete

### Phase 2: Extract Normal Calculator Internal UI Units
- [x] Extract `CalculatorModeSwitch` into `web/src/components/calc-ui/CalculatorModeSwitch.tsx`
- [x] Extract `CalculationVariantPicker` into `web/src/components/calc-ui/CalculationVariantPicker.tsx`
- [x] Extract `ParameterInputCell`, `CellWatermark`, and conditional-probability controls only after dependency audit
- [x] Keep exports narrow and typed; no `any`
- [x] Run verification after each extraction group
- **Status:** complete

### Phase 3: Extract Chart And Table Surfaces
- [x] Extract `NormalChart` into `web/src/components/charts/NormalChart.tsx`
- [x] Extract `ZTable` and related table-only helpers into `web/src/components/tables/ZTable.tsx`
- [x] Do not split Student t table separately unless code boundaries are already clean
- [x] Run verification after each extraction group
- **Status:** complete

### Phase 4: Thin Orchestrator Cleanup
- [x] Extract `FormattedStep` into `web/src/components/results/FormattedStep.tsx`
- [x] Reduce `NormalDistributionCalculator.tsx` toward state orchestration, mode routing, and page composition
- [x] Keep mode persistence keys unchanged: `ND_mode`, `ND_forwardType`, `ND_inverseType`
- [x] Preserve navigation behavior from `SiteHeader` and `App`
- [x] Run full verification
- **Status:** complete

### Phase 5: Final Review
- [x] Re-read diff for accidental behavior changes
- [x] Confirm no stale imports or dead duplicate functions remain
- [x] Confirm docs reflect current paths only
- [x] Record final verification in `progress.md`
- **Status:** complete

### Phase 6: Cross-Calculator UI Consistency Plan
- [ ] Audit shared visual patterns across normal distribution and hypothesis testing pages
- [ ] Extract shared chart foundation for axis ticks, grid, tooltip shell, legend chips, reference labels, margins, and semantic color mapping
- [ ] Extract shared body/layout primitives for calculator sections, panels, parameter grids, calculation blocks, formula blocks, result blocks, and step lists
- [ ] Standardize typography: Hebrew section headers, English formal-term translations in dark gray, body text size, caption size, and math text size
- [ ] Standardize math notation: use inline math components for variables and symbols inside prose instead of plain text variables
- [ ] Use customized `FormulaBlock`, `CalcBlock`, and `ResultBlock` consistently where they match the content role
- [ ] Preserve domain-specific layers: H0/H1, alpha/beta/power for hypothesis; probability/percentile shading for normal
- [ ] Run visual and code verification: `npm run lint:tsc`, `npm test`, `npm run lint:colors`, `npm run build`, plus manual RTL/light-dark review
- **Status:** pending

## Key Questions
1. Which functions were already extracted? Answer: pure probability/statistics helpers in `web/src/lib/statistics/math.ts`.
2. Where are duplicates still present? Answer: both main calculators still define local copies.
3. What should be reused first? Answer: shared math helpers before UI/component extraction.
4. What should not be extracted first? Answer: mode orchestration and conditional UI until dependencies are audited.
5. What is the next UI goal? Answer: maximum shared visual/template consistency across calculators, with domain-specific chart/content layers on top.

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Math dedupe before UI split | Shared domain logic is lowest-risk and removes real duplication immediately. |
| Keep orchestrator behavior stable during extraction | Avoid mixing architecture cleanup with UX or state behavior changes. |
| Verify after each extraction group | Massive TSX file has many hidden dependencies; smaller gates catch regressions early. |
| Use existing `web/src/lib/statistics/math.ts` instead of creating new math files | Source already exists and is exported with typed functions. |
| Treat cross-calculator UI consistency as a new phase | Architecture cleanup is complete; shared UI/template extraction needs its own audit and visual gates. |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| `Get-ChildItem -Filter` received an array and failed | 1 | Reran explicit file checks for each planning file. |
| Code graph initially showed old normal-calculator path after move | 1 | Reindexed repository with codebase-memory fast mode. |
| `studentTPDF` missing after deleting local hypothesis helpers | 1 | Imported `studentTPDF` from shared `web/src/lib/statistics/math.ts`. |
| `HelpCircle` missing after extracting `ZTable` | 1 | Imported `HelpCircle` in `web/src/components/tables/ZTable.tsx`. |

## Verification Gates
- `cd web; npm run lint:tsc`
- `cd web; npm test`
- `cd web; npm run lint:colors`
- `cd web; npm run build`
