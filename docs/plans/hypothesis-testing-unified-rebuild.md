# Hypothesis Testing Unified Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current three-method final-decision UI with one unified critical-value + p-value decision flow powered by `unifiedDecision`, while preserving the existing Hebrew RTL calculator experience and not expanding the known accordion/accessibility debt.

**Architecture:** Keep the monolithic calculator stable except for one narrow integration seam: calculate a `unifiedDecisionResult` beside the existing `decisionData`, then render a new focused `HypothesisTestDisplay` component inside Step 6. The new component is presentational, RTL-first, server-render-testable, and receives all values as props so math behavior remains owned by `src/lib/statistics/hypothesis.ts`.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, `react-dom/server`, `react-katex`, existing CSS design tokens, existing `src/components/ui` primitives where useful.

---

## Grounding Context

- Repo: `C:/Users/Tiger/Agents/Projects/statistics`
- Branch at planning time: `main`
- Current uncommitted prerequisites: P1 UI primitives, `src/lib/statistics/math.ts`, `src/lib/statistics/hypothesis.ts`, Vitest setup, package updates.
- Review input: `docs/reviews/hypothesis-testing-refactor-20260619-review.md`
- Existing decision seam:
  - `src/components/HypothesisTestingCalculator.tsx:750-835` calculates `decisionData` manually.
  - `src/components/HypothesisTestingCalculator.tsx:2662+` renders Step 6 final decision.
  - `src/lib/statistics/hypothesis.ts` exports `unifiedDecision(input)`.

## Non-Goals / Scope Guard

- Do not redesign the whole calculator.
- Do not restructure the large accordion trigger in this pass except for any changes required to avoid breaking Step 6 rendering.
- Do not add Testing Library, jsdom, Playwright, or new chart/math dependencies in this pass.
- Do not remove existing chart, CI, or power sections.
- Do not attempt bundle-size lazy-loading in this pass.

## File Structure

- Create: `src/components/HypothesisTestDisplay.tsx`
  - Presentational Step 6 summary component.
  - Shows both methods together: critical-value rule and p-value rule.
  - Displays agreement status: both methods must produce the same decision.
  - Owns formatting only; no distribution math.

- Create: `src/components/HypothesisTestDisplay.test.tsx`
  - Server-render tests using `renderToStaticMarkup`.
  - Verifies reject and fail-to-reject Hebrew labels.
  - Verifies critical-value and p-value sections appear in one unified display.

- Modify: `src/components/HypothesisTestingCalculator.tsx`
  - Import `unifiedDecision` and `HypothesisTestDisplay`.
  - Add `unifiedDecisionResult` with `useMemo` near `decisionData`.
  - Replace only the final decision-card body in Step 6 with `HypothesisTestDisplay`.
  - Keep existing `decisionData` available for CI formulas and other sections until a later cleanup pass.

- Optional modify only if lint requires it: `src/lib/statistics/hypothesis.ts`
  - Fix the currently unused `evidence` variable by either appending it to `summary` or removing it.

---

## Acceptance Criteria

1. `src/components/HypothesisTestDisplay.tsx` exists and is focused on rendering only.
2. Step 6 visibly presents a single decision card with:
   - final decision label,
   - test statistic,
   - critical-value rule,
   - p-value rule,
   - agreement message showing both methods align.
3. The three old method-selection buttons are removed from Step 6:
   - `גישת סטטיסטי המבחן`
   - `גישת אזור הדחייה`
   - `גישת מובהקות התוצאה (P-Value)`
4. The calculator calls `unifiedDecision` for the displayed decision.
5. Existing CI and power sections still compile.
6. Verification commands pass:
   - `npx vitest run src/lib/statistics/hypothesis.test.ts src/components/HypothesisTestDisplay.test.tsx`
   - `npm run lint:tsc`
   - `npm run lint:colors`
   - `npm run build`
7. Browser/manual verification confirms Step 6 displays the unified card in Hebrew RTL.

---

## Task 1: Create the Presentational Unified Display Component

**Files:**
- Create: `src/components/HypothesisTestDisplay.tsx`

- [ ] **Step 1: Create the component file**

Use this implementation as the starting point:

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle, XCircle, Scale, Target } from 'lucide-react';
import { InlineMath } from 'react-katex';
import type { UnifiedResult, Tail } from '../lib/statistics/hypothesis';

export interface HypothesisTestDisplayProps {
  result: UnifiedResult;
  alpha: number;
  sample: number;
  nullMean: number;
  tail: Tail;
  varianceKnown: boolean;
  statisticSymbol: string;
  parameterSymbol: string;
}

function formatNumber(value: number, digits = 4): string {
  if (!Number.isFinite(value)) return '—';
  return value.toFixed(digits);
}

function formatPValue(value: number): string {
  if (!Number.isFinite(value)) return '—';
  if (value < 0.0001) return '< 0.0001';
  return value.toFixed(4);
}

function formatCritical(critical: UnifiedResult['critical']): string {
  if (Array.isArray(critical)) {
    return `${formatNumber(critical[0])} / ${formatNumber(critical[1])}`;
  }
  return formatNumber(critical);
}

function criticalRuleText(result: UnifiedResult, tail: Tail, statisticSymbol: string): string {
  if (Array.isArray(result.critical)) {
    return `${statisticSymbol} ≤ ${formatNumber(result.critical[0])} או ${statisticSymbol} ≥ ${formatNumber(result.critical[1])}`;
  }
  if (tail === 'left') return `${statisticSymbol} ≤ ${formatNumber(result.critical)}`;
  return `${statisticSymbol} ≥ ${formatNumber(result.critical)}`;
}

function tailLabel(tail: Tail): string {
  if (tail === 'right') return 'ימני';
  if (tail === 'left') return 'שמאלי';
  return 'דו-צדדי';
}

export default function HypothesisTestDisplay({
  result,
  alpha,
  sample,
  nullMean,
  tail,
  varianceKnown,
  statisticSymbol,
  parameterSymbol,
}: HypothesisTestDisplayProps) {
  const isReject = result.decisionLabel === 'reject';
  const decisionText = isReject ? 'דוחים את השערת האפס' : 'אין לדחות את השערת האפס';
  const decisionTone = isReject ? 'success' : 'error';
  const DecisionIcon = isReject ? CheckCircle : XCircle;
  const statName = varianceKnown ? 'Z' : 't';
  const pRule = isReject ? 'P-value < α' : 'P-value ≥ α';

  return (
    <section
      dir="rtl"
      aria-labelledby="hypothesis-unified-decision-title"
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-md overflow-hidden"
    >
      <header className="flex flex-col gap-4 border-b border-[var(--color-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-2 ${isReject ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]' : 'bg-[var(--color-error)]/15 text-[var(--color-error)]'}`}>
            <DecisionIcon size={24} aria-hidden="true" />
          </div>
          <div>
            <h3 id="hypothesis-unified-decision-title" className="m-0 text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
              החלטה מאוחדת
            </h3>
            <p className="mt-1 text-sm font-bold text-[var(--color-text-secondary)]">
              בדיקה לפי ערך קריטי ולפי P-value באותו מהלך החלטה
            </p>
          </div>
        </div>

        <div
          data-decision={result.decisionLabel}
          className={`inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm sm:text-base font-black ${isReject ? 'border-[var(--color-success)]/50 bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'border-[var(--color-error)]/50 bg-[var(--color-error)]/10 text-[var(--color-error)]'}`}
        >
          {decisionText}
        </div>
      </header>

      <div className="grid gap-4 p-5 lg:grid-cols-3">
        <article className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="mb-3 flex items-center gap-2 font-black text-[var(--color-accent-cobalt)]">
            <Target size={18} aria-hidden="true" />
            <span>סטטיסטי המבחן</span>
          </div>
          <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
            <p>
              המדגם: <span dir="ltr" className="font-mono text-[var(--color-text-primary)]">{formatNumber(sample, 3)}</span>
            </p>
            <p>
              השערת האפס: <span dir="ltr" className="font-mono text-[var(--color-text-primary)]">{parameterSymbol} = {formatNumber(nullMean, 3)}</span>
            </p>
            <p>
              סטטיסטי: <span dir="ltr" className="font-mono text-[var(--color-text-primary)]">{statName} = {formatNumber(result.stat)}</span>
            </p>
          </div>
        </article>

        <article className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="mb-3 flex items-center gap-2 font-black text-[var(--color-accent-brass)]">
            <Scale size={18} aria-hidden="true" />
            <span>כלל הערך הקריטי</span>
          </div>
          <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
            <p>מבחן {tailLabel(tail)} ברמת מובהקות <span dir="ltr">α = {alpha}</span></p>
            <p>ערך קריטי: <span dir="ltr" className="font-mono text-[var(--color-text-primary)]">{formatCritical(result.critical)}</span></p>
            <p>כלל החלטה: <span dir="ltr" className="font-mono text-[var(--color-text-primary)]">{criticalRuleText(result, tail, statName)}</span></p>
          </div>
        </article>

        <article className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="mb-3 flex items-center gap-2 font-black text-[var(--color-accent-teal)]">
            <CheckCircle size={18} aria-hidden="true" />
            <span>כלל P-value</span>
          </div>
          <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
            <p>P-value: <span dir="ltr" className="font-mono text-[var(--color-text-primary)]">{formatPValue(result.pValue)}</span></p>
            <p>כלל החלטה: <span dir="ltr" className="font-mono text-[var(--color-text-primary)]">{pRule}</span></p>
            <p className="font-bold text-[var(--color-text-primary)]">שתי הגישות מובילות לאותה החלטה.</p>
          </div>
        </article>
      </div>

      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm sm:text-base leading-8 text-[var(--color-text-primary)]">
        <p>
          מאחר שסטטיסטי המבחן הוא <span dir="ltr" className="inline-block font-mono"><InlineMath math={`${statName} = ${formatNumber(result.stat)}`} /></span>
          {' '}והמובהקות היא <span dir="ltr" className="inline-block font-mono">P-value = {formatPValue(result.pValue)}</span>,
          {' '}ההחלטה הסופית היא: <strong data-testid="unified-final-decision">{decisionText}</strong>.
        </p>
      </footer>
    </section>
  );
}
```

- [ ] **Step 2: Run TypeScript check for the new file only through project tsc**

Run:

```bash
npm run lint:tsc
```

Expected at this point: it may fail because the component is not wired yet or because pre-existing TypeScript issues are exposed, but it must not report syntax errors inside `src/components/HypothesisTestDisplay.tsx`.

---

## Task 2: Add Server-Rendered Component Tests

**Files:**
- Create: `src/components/HypothesisTestDisplay.test.tsx`

- [ ] **Step 1: Create tests without adding new dependencies**

Use `react-dom/server` so the current Vitest node environment is enough:

```tsx
import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import HypothesisTestDisplay from './HypothesisTestDisplay';
import type { UnifiedResult } from '../lib/statistics/hypothesis';

function renderDisplay(result: UnifiedResult) {
  return renderToStaticMarkup(
    <HypothesisTestDisplay
      result={result}
      alpha={0.05}
      sample={115}
      nullMean={100}
      tail="right"
      varianceKnown={true}
      statisticSymbol="Z"
      parameterSymbol="μ"
    />
  );
}

describe('HypothesisTestDisplay', () => {
  it('renders one unified reject decision with critical-value and p-value sections', () => {
    const html = renderDisplay({
      reject: true,
      stat: 6,
      critical: 1.6449,
      pValue: 0.00001,
      decisionLabel: 'reject',
      ruleLabel: 'הוחלט לדחות את השערת האפס (H0)',
      summary: 'reject',
    });

    expect(html).toContain('החלטה מאוחדת');
    expect(html).toContain('דוחים את השערת האפס');
    expect(html).toContain('כלל הערך הקריטי');
    expect(html).toContain('כלל P-value');
    expect(html).toContain('שתי הגישות מובילות לאותה החלטה');
  });

  it('renders a fail-to-reject decision', () => {
    const html = renderDisplay({
      reject: false,
      stat: 0.8,
      critical: [-1.96, 1.96],
      pValue: 0.4237,
      decisionLabel: 'fail-to-reject',
      ruleLabel: 'לא הוכחו ראיות מספיקות לדחיית H0',
      summary: 'fail',
    });

    expect(html).toContain('אין לדחות את השערת האפס');
    expect(html).toContain('P-value ≥ α');
  });
});
```

- [ ] **Step 2: Run the new test and confirm it passes**

Run:

```bash
npx vitest run src/components/HypothesisTestDisplay.test.tsx
```

Expected:

```text
PASS  src/components/HypothesisTestDisplay.test.tsx
```

If Vitest prints the newer `✓` format instead of `PASS`, accept it as long as both tests pass and exit code is `0`.

---

## Task 3: Wire `unifiedDecision` into the Calculator

**Files:**
- Modify: `src/components/HypothesisTestingCalculator.tsx`

- [ ] **Step 1: Add imports**

Near the top of `src/components/HypothesisTestingCalculator.tsx`, add:

```tsx
import HypothesisTestDisplay from './HypothesisTestDisplay';
import { unifiedDecision } from '../lib/statistics/hypothesis';
import type { Tail } from '../lib/statistics/hypothesis';
```

- [ ] **Step 2: Remove obsolete local math helper imports only if they become unused**

After wiring, run TypeScript. If imports or local helpers become unused and TypeScript flags them, remove only the unused symbols. Do not delete the local helper definitions wholesale because charts and CI still use them in this pass.

- [ ] **Step 3: Add a small tail mapping helper inside `HypothesisTestingCalculator` before `unifiedDecisionResult`**

Add this after `decisionData` or directly before the new `useMemo`:

```tsx
const hypothesisTail = tailType as Tail;
```

This is safe because local `TailType` and exported `Tail` currently share the same literal values: `'right' | 'left' | 'two-tailed'`.

- [ ] **Step 4: Add `unifiedDecisionResult` beside the existing decision calculation**

Place this after the existing `decisionData` `useMemo` so both structures are available:

```tsx
const unifiedDecisionResult = useMemo(() => {
    if (!isValid) return null;

    return unifiedDecision({
        sample: mu1,
        nullMean: mu0,
        stdDev: sigma,
        n,
        alpha,
        tail: hypothesisTail,
        varianceKnown,
        alternativeMean: calculatePower ? muH1 : undefined,
    });
}, [isValid, mu1, mu0, sigma, n, alpha, hypothesisTail, varianceKnown, calculatePower, muH1]);
```

- [ ] **Step 5: Keep the old `decisionData` temporarily**

Do not delete `decisionData` in this task. It is still referenced by CI and legacy formulas below Step 6. Cleanup can happen only after a separate dependency search proves all references are gone.

- [ ] **Step 6: Run TypeScript**

Run:

```bash
npm run lint:tsc
```

Expected: no TypeScript errors from the new import or `unifiedDecisionResult` block.

---

## Task 4: Replace Step 6 Final Decision Body with the Unified Display

**Files:**
- Modify: `src/components/HypothesisTestingCalculator.tsx`

- [ ] **Step 1: Locate Step 6**

Find:

```tsx
<AnimatedDetails id="step-6"
```

This section currently starts around line `2662`.

- [ ] **Step 2: Preserve the Step 6 accordion wrapper and summary**

Keep:

```tsx
<AnimatedDetails id="step-6" ...>
  <summary ...>
    ... קבלת החלטה / הסקת מסקנות ...
  </summary>
```

This preserves the existing jump target and avoids expanding the review-documented accordion accessibility scope.

- [ ] **Step 3: Replace only the old inner final-decision card content**

Inside the Step 6 body, replace the old method selector and final decision card with:

```tsx
{unifiedDecisionResult && (
    <HypothesisTestDisplay
        result={unifiedDecisionResult}
        alpha={alpha}
        sample={mu1}
        nullMean={mu0}
        tail={hypothesisTail}
        varianceKnown={varianceKnown}
        statisticSymbol={varianceKnown ? 'Z' : 't'}
        parameterSymbol={testType === 'sum' ? '\\sum X' : testType === 'single' ? 'X' : '\\bar{X}'}
    />
)}
```

If there is explanatory formula content inside Step 6 that is not part of the three-method decision selector, keep it below the new display only if it still compiles and does not repeat contradictory conclusions.

- [ ] **Step 4: Remove the three old method buttons**

Remove the block that renders these exact labels:

```text
גישת סטטיסטי המבחן
גישת אזור הדחייה
גישת מובהקות התוצאה (P-Value)
```

- [ ] **Step 5: Remove `conclusionMethod` state if no references remain**

Search for `conclusionMethod` and `setConclusionMethod`.

Expected after Step 4: only the state declaration remains. If so, delete:

```tsx
const [conclusionMethod, setConclusionMethod] = useLocalStorageState<'test_statistic' | 'rejection_region' | 'p_value'>('HT_conclusionMethod', 'test_statistic');
```

If references remain in kept explanatory content, do not delete it yet; instead keep the state until Task 5 cleanup.

- [ ] **Step 6: Run targeted search**

Run:

```bash
python - <<'PY'
from pathlib import Path
p = Path('src/components/HypothesisTestingCalculator.tsx')
text = p.read_text(encoding='utf-8')
for needle in ['גישת סטטיסטי המבחן', 'גישת אזור הדחייה', 'גישת מובהקות התוצאה', 'conclusionMethod']:
    print(needle, text.count(needle))
PY
```

Expected:

```text
גישת סטטיסטי המבחן 0
גישת אזור הדחייה 0
גישת מובהקות התוצאה 0
conclusionMethod 0
```

If `conclusionMethod` is not `0`, inspect remaining references and either remove the stale block or keep the state with a comment explaining why it still exists.

---

## Task 5: Align Existing Math API and Lint Hygiene

**Files:**
- Modify if required: `src/lib/statistics/hypothesis.ts`
- Modify if required: `src/components/HypothesisTestingCalculator.tsx`

- [ ] **Step 1: Run the math tests and display tests together**

Run:

```bash
npx vitest run src/lib/statistics/hypothesis.test.ts src/components/HypothesisTestDisplay.test.tsx
```

Expected: all tests pass.

- [ ] **Step 2: Run TypeScript**

Run:

```bash
npm run lint:tsc
```

Expected: no errors.

- [ ] **Step 3: If TypeScript flags `evidence` as unused in `hypothesis.ts`, remove it**

Replace this block:

```ts
  const evidence =
    alternativeMean !== undefined
      ? `. בדוגמה זו, X̄ = ${sample.toFixed(3)} נבדל ${stat.toFixed(3)} יחידות MAE מ-H0.`
      : '';

  const summary = `${option} במבחן ${tailWord}.reveal:${stat.toFixed(3)}`;
```

With:

```ts
  const summary = `${option} במבחן ${tailWord}. סטטיסטי המבחן: ${stat.toFixed(3)}`;
```

Then remove `alternativeMean` from the destructuring only if TypeScript reports it as unused. If removing it, keep `alternativeMean?: number;` in `UnifiedInput` because callers may still pass it and the API can use it in a future explanatory copy pass.

- [ ] **Step 4: If TypeScript flags unused icons/imports in `HypothesisTestingCalculator.tsx`, remove only those imports**

Do not remove visual sections to satisfy lint. Remove only import names that TypeScript identifies as unused.

---

## Task 6: Full Verification and Manual Visual Check

**Files:**
- No planned source edits unless verification fails.

- [ ] **Step 1: Run full verification**

Run:

```bash
npx vitest run src/lib/statistics/hypothesis.test.ts src/components/HypothesisTestDisplay.test.tsx
npm run lint:tsc
npm run lint:colors
npm run build
```

Expected:

```text
all Vitest tests pass
npm run lint:tsc exits 0
npm run lint:colors exits 0
npm run build exits 0
```

- [ ] **Step 2: Start the app for visual verification**

Run:

```bash
npm run dev
```

Expected: Vite starts on `http://localhost:3000/`.

- [ ] **Step 3: Browser/manual check**

Open `http://localhost:3000/`, navigate to the hypothesis testing calculator, and check:

- The page remains RTL.
- Step 6 still has the title `קבלת החלטה / הסקת מסקנות`.
- Step 6 contains a card titled `החלטה מאוחדת`.
- The card includes both `כלל הערך הקריטי` and `כלל P-value`.
- The old three selector buttons are absent.
- The decision badge changes correctly when sample value or tail direction changes.
- The `קפיצה למסקנה` control still scrolls to Step 6.

Pass indicator: the unified card is visible and no browser console errors appear.

Fail indicator: blank Step 6, duplicated conflicting decisions, broken RTL layout, console error, or failed jump-to-conclusion behavior.

---

## Rollback Boundary

If implementation breaks build or visible Step 6 behavior, rollback only these files:

```bash
git checkout -- src/components/HypothesisTestingCalculator.tsx src/components/HypothesisTestDisplay.tsx src/components/HypothesisTestDisplay.test.tsx src/lib/statistics/hypothesis.ts
```

Do not rollback the P1 primitives or math extraction files unless the failure is proven to originate there.

---

## Engineer Handoff

Recommended execution profile: **Engineer**.

Recommended execution skill: **subagent-driven-development** for isolated task execution, or **executing-plans** if staying in one session.

Execution prompt:

```text
Implement docs/plans/hypothesis-testing-unified-rebuild.md task-by-task in C:/Users/Tiger/Agents/Projects/statistics. Keep scope narrow: create HypothesisTestDisplay, add server-rendered Vitest assertions, wire unifiedDecision into Step 6, remove the old three-method selector, and run the verification commands. Do not redesign the rest of the calculator or add new test dependencies. Return exact command outputs and browser/manual verification notes.
```

## Self-Review

- Spec coverage: The plan covers the handoff-required plan file, UI test, new `HypothesisTestDisplay.tsx`, calculator wiring to `unifiedDecision`, build/color verification, and visual/manual evidence.
- Placeholder scan: No implementation step depends on unspecified test libraries or hidden follow-up work.
- Type consistency: `Tail` matches local `TailType` literals; `UnifiedResult` is imported from `src/lib/statistics/hypothesis.ts`; display props use current calculator state names.
- Risk control: The known review blockers are acknowledged, but this plan avoids widening the monolithic accordion/accessibility refactor beyond the Step 6 decision seam.
