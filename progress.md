# Progress: Normal Calculator Refactor

## 2026-06-29

### Phase 0 Completed
- Moved normal calculator from `web/src/NormalDistributionCalculator.tsx` to `web/src/components/NormalDistributionCalculator.tsx`.
- Updated `web/src/App.tsx` imports.
- Updated `AGENTS.md` and `CONTEXT.md` path references.

### Phase 0 Verification
- `npm run lint:tsc` passed.
- `npm run lint:colors` passed.
- `npm run build` passed with existing large chunk warning.
- `npm test` passed: 3 files, 9 tests.

### Planning Session
- Loaded `planning-with-files` skill.
- Confirmed no existing root `task_plan.md`, `findings.md`, or `progress.md`.
- Refreshed codebase-memory index after file move.
- Identified shared math helpers and duplicate local helper implementations.

### Next Action
Start Phase 2: extract normal calculator internal UI units.

### Phase 1 Completed
- Replaced local math helpers in `NormalDistributionCalculator.tsx` with imports from `web/src/lib/statistics/math.ts`.
- Replaced local math helpers in `HypothesisTestingCalculator.tsx` with imports from `web/src/lib/statistics/math.ts`.
- Updated shared math edge behavior to preserve the normal calculator's boundary behavior.
- Added `web/src/lib/statistics/math.test.ts`.

### Phase 1 Verification
- `npm run lint:tsc` passed.
- `npm test` passed: 4 files, 12 tests.
- `npm run lint:colors` passed.
- `npm run build` passed with existing large chunk warning.

### Phase 2 Completed
- Extracted normal calculator UI controls under `web/src/components/calc-ui/`.
- Moved mode switch, variant picker, inline KaTeX token, parameter input cell, watermark, and conditional-probability definition controls out of `NormalDistributionCalculator.tsx`.
- Updated `App.tsx` to import `CalcMode` from `calc-ui` types.

### Phase 2 Verification
- `npm run lint:tsc` passed.
- `npm run lint:colors` passed.
- `npm test` passed: 4 files, 12 tests.
- `npm run build` passed with existing large chunk warning.

### Phase 3 Completed
- Extracted `NormalChart` into `web/src/components/charts/NormalChart.tsx`.
- Extracted `ZTable` and popular Z-score table card into `web/src/components/tables/ZTable.tsx`.
- Moved `studentTInverseCDF` into `web/src/lib/statistics/math.ts`.
- Extended math tests for `studentTInverseCDF`.

### Phase 3 Verification
- `npm run lint:tsc` passed.
- `npm test` passed: 4 files, 12 tests.
- `npm run lint:colors` passed.
- `npm run build` passed with existing large chunk warning.

### Phase 4 Completed
- Extracted `FormattedStep` into `web/src/components/results/FormattedStep.tsx`.
- Removed throwaway extraction scripts from `.scratch`.
- Normal calculator now keeps page-level state, mode routing, calculation composition, and render layout while importing chart/table/control/result surfaces.

### Phase 4 Verification
- `npm run lint:tsc` passed.
- `npm run lint:colors` passed.
- `npm test` passed: 4 files, 12 tests.
- `npm run build` passed with existing large chunk warning.

### Phase 5 Completed
- Updated `AGENTS.md` and `CONTEXT.md` to remove stale claims about normal calculator size, missing primitives, inline normal math helpers, and missing test script.
- Confirmed probability helper definitions now exist only in `web/src/lib/statistics/math.ts`.
- Removed temporary extraction scripts from `.scratch`.

### Final Verification
- `npm run lint:tsc` passed.
- `npm test` passed: 4 files, 12 tests.
- `npm run lint:colors` passed.
- `npm run build` passed with existing large chunk warning.

### Added Follow-Up Scope
- Added Phase 6 to `task_plan.md` for cross-calculator UI consistency.
- Captured requirements for shared chart rules, body layout, custom `FormulaBlock`/`CalcBlock`/`ResultBlock`, calculation steps, result blocks, font/color consistency, inline math notation, and Hebrew headers with English formal-term translations.

### Phase 6 Slice Completed
- Added `web/src/components/charts/ChartPrimitives.tsx`.
- Reused shared chart legend chips, tooltip shell, and math reference-line labels in `NormalChart`.
- Reused the same shared chart primitives in the hypothesis chart while preserving domain-specific `H_0`, `H_1`, `\alpha`, `1-\beta`, and critical-value layers.
- Replaced raw mini alpha-chart colors with semantic chart/accent tokens.
- Routed hypothesis `FormulaBlock` and `CalcBlock` wrappers through shared UI primitives while keeping existing side icons and visual density.
- Fixed hidden tooltip portals so SSR/static-render tests do not call `createPortal` while tooltip content is not visible.

### Phase 6 Verification
- Restored declared npm dependencies with `npm install` because local `node_modules` was missing declared test packages.
- `npm run lint:tsc` passed.
- `npm test` passed: 5 files, 24 tests.
- `npm run lint:colors` passed.
- `npm run build` passed with existing large chunk warning.

## 2026-07-02

### Phase 7 Planning Started
- Loaded `planning-with-files`, `ce-plan`, and `ce-work` guidance for a plan-first execution flow.
- Audited the current power panel in `web/src/components/HypothesisTestingCalculator.tsx` and the chart surface in `web/src/components/charts/HypothesisChart.tsx`.
- Captured that the current power implementation is coupled to `tailType`, `varianceKnown`, `muH1`, and a chart contract that can render `\bar{X}`.
- Wrote `docs/plans/power-panel-isolation-plan.md` to define the five-input power rebuild with confidence scores and executable gates.

### Next Action
- Execute Task 1 from `docs/plans/power-panel-isolation-plan.md`: isolate five-input power math, then rebuild the chart/UI around that contract.

### Phase 7 Completed
- Added `web/src/lib/statistics/power.ts` and `web/src/lib/statistics/power.test.ts` to isolate five-parameter power math and chart data generation.
- Rewired `web/src/components/HypothesisTestingCalculator.tsx` so the sample-mean decision flow stays on `xBar`, while the power panel uses only `mu0`, `mu1`, `sigma`, `n`, and `alpha`.
- Rebuilt the power accordion body with:
  - a dedicated chart using existing `HypothesisChart` + shared chart primitives
  - summary cards for `C`, `1-\beta`, and `\beta`
  - one-sided normal-CDF formulas and substituted calculations derived from the isolated helper
- Updated `web/src/components/HypothesisTestingCalculator.integration.test.tsx` to drop legacy `muH1` storage expectations.

### Phase 7 Verification
- `npm run lint:tsc` passed.
- `npm test` passed: 6 files, 28 tests.
- `npm run lint:colors` passed.
- `npm run build` passed with the existing Vite chunk-size warning on `HypothesisTestingCalculator`.

## 2026-07-02

### Phase 7 Started
- Loaded `planning-with-files` again because the browser comment explicitly required plan-first execution.
- Restored planning context from existing `task_plan.md`, `findings.md`, and `progress.md`.
- Audited `HypothesisTestingCalculator.tsx` power section and confirmed current mismatch:
  - power still uses separate `muH1`
  - decision flow still uses `mu1` as sample mean fallback
  - browser request requires power to rely on only five parameters: `mu0`, `mu1`, `sigma`, `n`, `alpha`
- Confirmed best-fit implementation path is reuse, not new library work:
  - existing hypothesis chart already shades `alpha` and `power`
  - existing formula/result blocks already match design system
  - token source remains `web/src/index.css`

### Next Action
- Patch `HypothesisTestingCalculator.tsx` to remove `muH1` from power logic and UI, then update tests and run full verification gates.

### Phase 7 Completed
- Added explicit `xBar` / `xBarInput` state so sample-mean logic no longer overloads `mu1`.
- Removed the separate `muH1` / `muH1Input` power path and made the power panel consume `mu1` consistently as the alternative mean under `H_1`.
- Repointed CI and hypothesis-step sample-mean formulas back to `xBar`.
- Added power summary cards for critical value, power, and type-II error inside the accordion using existing design tokens.
- Hardened tooltip/error portals with client-mount guards so static-render tests no longer hit React server-render portal failures.
- Updated `HypothesisTestingCalculator.integration.test.tsx` to cover explicit `xBar` state and the no-`muH1` power path.

### Phase 7 Verification
- `npx tsc --noEmit --pretty false` passed.
- `npx vitest run src/components/HypothesisTestingCalculator.integration.test.tsx` passed.
- `npm test` passed: 6 files, 28 tests.
- `npm run lint:colors` passed.
- `npm run build` passed with the existing Vite chunk-size warning for large calculator bundles.

### Phase 8 Started
- Restored planning context from `task_plan.md`, `progress.md`, and `findings.md` per `planning-with-files`.
- Re-audited the latest browser comments on the power panel.
- Confirmed required visual parity changes:
  - reuse `AnimatedDetails` summary/header shell from the hypothesis steps
  - move symbolic math into `FormulaBlock`
  - pair each symbolic step with its own `CalcBlock`
  - remove `יישום מספרי`
- Patched `PowerStepCard` in `web/src/components/HypothesisTestingCalculator.tsx` accordingly.

### Phase 8 Verification
- `npx tsc --noEmit --pretty false` passed.
- `npx vitest run src/components/HypothesisTestingCalculator.integration.test.tsx` passed.
