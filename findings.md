# Findings: Normal Calculator Refactor

## Existing Shared Helpers
`web/src/lib/statistics/math.ts` already exports:

- `erf`
- `normalCDF`
- `normalPDF`
- `inverseNormalCDF`
- `lnGamma`
- `studentTPDF`
- `studentTCDF`
- `studentTPPFInitial`
- `studentTPPF`

## Duplicate Local Helpers
`web/src/components/NormalDistributionCalculator.tsx` still defines local copies:

- `normalCDF`
- `erf`
- `normalPDF`
- `inverseNormalCDF`
- `studentTCDF`

`web/src/components/HypothesisTestingCalculator.tsx` still defines local copies:

- `normalCDF`
- `erf`
- `normalPDF`
- `inverseNormalCDF`
- `studentTCDF`
- `studentTPPFInitial`
- `studentTPPF`

## Existing Shared Hypothesis Logic
`web/src/lib/statistics/hypothesis.ts` exports `unifiedDecision`, plus `Tail`, `Variance`, `UnifiedInput`, and `UnifiedResult`.

`web/src/components/HypothesisTestingCalculator.tsx` already imports `unifiedDecision`, but it does not yet import math helpers from `math.ts`.

## Architecture Implication
Math extraction has started but is not fully consumed. Correct next refactor is not to create another `lib/statistics.ts`; it is to make both calculators use the existing `web/src/lib/statistics/math.ts` exports and delete local duplicate implementations.

## Phase 1 Result
Both calculators now import probability helpers from `web/src/lib/statistics/math.ts`.

`web/src/lib/statistics/math.ts` is the only remaining definition site for:

- `erf`
- `normalCDF`
- `normalPDF`
- `inverseNormalCDF`
- `lnGamma`
- `studentTPDF`
- `studentTCDF`
- `studentTPPFInitial`
- `studentTPPF`

Shared edge behavior was adjusted to preserve the normal calculator boundary handling:

- `inverseNormalCDF(0) = -5`
- `inverseNormalCDF(1) = 5`
- `studentTCDF(_, df <= 0) = 0.5`
- normal approximation starts at `df >= 500`

## Current Dirty Worktree
Current branch: `Codex/extract-components`.

Known dirty files from Phase 0:

- `web/src/App.tsx`
- deleted old `web/src/NormalDistributionCalculator.tsx`
- new `web/src/components/NormalDistributionCalculator.tsx`

Docs patched in working tree:

- `AGENTS.md`
- `CONTEXT.md`

New test:

- `web/src/lib/statistics/math.test.ts`

## Phase 2 Result
Created `web/src/components/calc-ui/` for calculator-local reusable UI:

- `types.ts`
- `InlineMathToken.tsx`
- `CalculationVariantPicker.tsx`
- `CalculatorModeSwitch.tsx`
- `CellWatermark.tsx`
- `ConditionalEventControls.tsx`
- `ParameterInputCell.tsx`
- `index.ts`

`web/src/components/NormalDistributionCalculator.tsx` now imports these instead of defining them inline.

## Phase 3 Result
Created chart/table surface modules:

- `web/src/components/charts/NormalChart.tsx`
- `web/src/components/tables/ZTable.tsx`

Moved `studentTInverseCDF` into `web/src/lib/statistics/math.ts` because it is table/domain logic, not page orchestration.

## Phase 4 Result
Created `web/src/components/results/FormattedStep.tsx`.

`web/src/components/NormalDistributionCalculator.tsx` is now about 1003 lines. It is not a tiny 100-line orchestrator yet, but major visual/table/control/domain helper blocks have been removed:

- shared math helpers
- mode switch
- variant picker
- parameter input cell
- conditional event controls
- normal chart
- Z/t tables
- formatted result step renderer

## Next UI Consistency Requirements
Robert wants maximum shared visual/template consistency wherever the calculators overlap.

Shared chart candidates:

- X-axis tick rules
- grid/axis colors
- tooltip shell
- legend chips
- reference-line labels
- chart margins
- responsive chart frame
- semantic color mapping

Shared body/layout candidates:

- calculator page body layout
- section header structure
- Hebrew title plus English formal-term translation in dark gray
- paragraph/body typography
- parameter cards/grids
- custom `FormulaBlock`
- `CalcBlock`
- `ResultBlock`
- calculation step lists
- result cards

Math notation rule:

- prose variables and symbols should use inline math rendering, not plain text, when representing formal notation.

Domain-specific chart layers stay separate:

- hypothesis testing: H0/H1 curves, alpha/beta/power, critical regions
- normal distribution: probability/percentile regions and conditional probability shading
