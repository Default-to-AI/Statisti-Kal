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

## Power Panel Isolation Audit
- Current power flow in `web/src/components/HypothesisTestingCalculator.tsx` still uses a separate `muH1` / `muH1Input` state pair and localStorage keys `HT_muH1`, `HT_muH1Input`.
- Current decision flow still reuses `mu1` as fallback `xBar` sample mean. That is acceptable for hypothesis testing, but it violates the browser comment if power also depends on a sixth parameter.
- Existing power math already has most of the requested one-sided normal-approx structure:
  - `SE = sigma / sqrt(n)`
  - critical value from `mu0 + zCrit * SE` or `mu0 + zCritLower * SE`
  - `beta` and `power` computed from CDF areas under `H1`
- Main gap is architectural, not library choice:
  - remove separate `muH1`
  - reuse existing chart/formula/card surfaces
  - rewrite labels/copy so power is explicitly driven by `mu1` as alternative mean, not by sample mean
- Existing shared rendering primitives already fit task:
  - `ChartLegend`, `ChartTooltipShell`, `renderChartMathReferenceLabel` in `web/src/components/charts/ChartPrimitives.tsx`
  - existing `FormulaBlock`, `CalcBlock`, `ResultBlock` wrappers in `HypothesisTestingCalculator.tsx`
  - global token source in `web/src/index.css`

## 2026-07-02 Power Panel Request
- Browser comment targets the `Statistical Power` / `עוצמת מבחן` section inside `web/src/components/HypothesisTestingCalculator.tsx`.
- Requested scope is explicit: power component must be fully independent from sample mean `\bar{X}` input, validation, and display.
- Required inputs for the new logic:
  - `\mu_0`
  - `\mu_1`
  - `\sigma`
  - `n`
  - `\alpha`
- Required calculations:
  - `SE = \sigma / \sqrt{n}`
  - choose left/right test direction by comparing `\mu_1` vs `\mu_0`
  - compute critical value `C` from `\mu_0`, `Z_{1-\alpha}`, and `SE`
  - compute `Z = (C - \mu_1) / SE`
  - compute power from normal CDF over rejection region under `H_1`
  - compute type-II error `\beta = 1 - power`
- Required UI outputs:
  - vertical line at critical value `C`
  - shaded `\alpha` region under `H_0`
  - shaded `1-\beta` region under `H_1`
  - numeric cards for `C`, power percent, and `\beta`
- Design constraint:
  - reuse existing global design tokens, shared chart primitives, and dark-mode-compatible calculator cards/buttons/tooltips
  - prefer existing chart stack in project over introducing a new chart library unless current primitives cannot support the rendering cleanly

## 2026-07-02 Current Power Implementation Audit
- Current power section is inline inside `web/src/components/HypothesisTestingCalculator.tsx` around the `power-panel` block.
- Current stats computation depends on broader hypothesis-calculator state:
  - `tailType`
  - `varianceKnown`
  - `muH1`
  - `calculatePower`
  - optional `sampleMean` line in `HypothesisChart`
- Current power math supports:
  - one-tailed left/right
  - two-tailed
  - normal and Student-t paths
  - non-central t approximation path
- Current chart rendering already has the right visual building blocks:
  - H0 curve
  - H1 curve
  - alpha rejection shading
  - power shading
  - critical-value reference line
  - shared `ChartPrimitives` label renderer
- Current mismatch versus request:
  - power explanation text and formulas still speak in terms of general hypothesis flow, not a self-contained five-input power module
  - existing chart can render `\bar{X}` sample-mean line via `sampleMean`
  - current power result path is coupled to global `tailType` and `varianceKnown`, while requested behavior infers direction only from `\mu_1` vs `\mu_0` and always uses the normal CDF formulas
- Best-fit implementation stack from current codebase:
  - math: `web/src/lib/statistics/math.ts`
  - charting: Recharts already used in `web/src/components/charts/HypothesisChart.tsx`
  - shared chart labels: `web/src/components/charts/ChartPrimitives.tsx`
  - card/layout primitives: existing calculator `Card`/`ResultBlock`-style patterns already used on hypothesis page

## 2026-07-02 Implementation Result
- Added dedicated five-input power helper module:
  - `web/src/lib/statistics/power.ts`
  - `web/src/lib/statistics/power.test.ts`
- The power helper now owns:
  - direction inference from `mu1` vs `mu0`
  - critical value computation
  - `Z = (C - \mu_1) / SE`
  - `\beta` and power via normal CDF
  - power-only chart domain/data generation
- `web/src/components/HypothesisTestingCalculator.tsx` now:
  - keeps sample-mean decision flow on `xBar`
  - uses `mu1` as the alternative-mean input for power
  - renders a dedicated power chart inside the power accordion
  - shows power-specific cards for `C`, `1-\beta`, and `\beta`
  - routes `DecisionMatrix` power numbers through the isolated five-input power result

## 2026-07-02 Power Visual Follow-Up
- Latest browser comments require the power explanation steps to match the main hypothesis-step component pattern, not a custom card variant.
- Correct reuse target inside `web/src/components/HypothesisTestingCalculator.tsx` is:
  - `AnimatedDetails` for step container and numbered summary row
  - `FormulaBlock` for symbolic formulas
  - `CalcBlock` for substituted calculations
- The standalone `יישום מספרי` label and the raw dashed formula container are both mismatches and should be removed.
