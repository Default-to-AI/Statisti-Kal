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
