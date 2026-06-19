# Wire Signature Elements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the DESIGN.md signature elements visible by wiring the already-defined `.accent-bar`, `.curve-glow`, `.stagger-in`, and `.pulse-brass` classes into their intended React consumers without adding new CSS.

**Architecture:** Treat this as P0 design-system wiring, not a refactor. The CSS already exists in `src/index.css`; implementation should add semantic class consumers at the smallest stable seams: global page header (`PageLayout`), reusable chart panel (`ChartWrapper`), active normal-distribution chart/result badge, and active hypothesis-testing result/conclusion panels. Avoid extracting new components or changing calculation logic.

**Tech Stack:** React 19 + TypeScript + Tailwind v4 utility classes + existing CSS signature classes in `src/index.css`.

---

## Source Evidence

- `DESIGN.md:646-653` defines the required signature elements:
  - `.accent-bar` — page titles, hero sections, primary actions.
  - `.curve-glow` — active calculation panels and live results.
  - `.stagger-in` — page load and mode switches.
  - `.pulse-brass` — live calculation indicator.
- `src/index.css:254-340` already implements all four classes and reduced-motion handling.
- Repository search confirms zero `.tsx` consumers for these classes before this work.
- Primary consumer seams:
  - `src/components/ui/PageLayout.tsx:37-43` wraps every calculator page header/main.
  - `src/components/ui/CustomComponents.tsx:171-209` defines `ChartWrapper`, the reusable chart panel.
  - `src/NormalDistributionCalculator.tsx:357-365` renders the active normal chart panel and live result badge.
  - `src/NormalDistributionCalculator.tsx:1597-1636` renders mode-switched content with `AnimatePresence`.
  - `src/components/HypothesisTestingCalculator.tsx:1671-1761` renders active hypothesis testing/result accordion areas.

---

## Confidence Summary

- High (≥90): 4 tasks
- Medium (70-89): 1 task
- Low (50-69): 0 tasks
- Blocked (<50): 0 tasks

No spikes required. The work is class wiring only; risk is visual overuse, not technical feasibility.

---

## File Structure

```text
src/
├── components/
│   ├── ui/
│   │   ├── PageLayout.tsx              # add page-title accent bar + optional main stagger wrapper
│   │   └── CustomComponents.tsx        # add reusable curve-glow support to ChartWrapper
│   └── HypothesisTestingCalculator.tsx # add live result pulse/glow at active conclusion/result seams
└── NormalDistributionCalculator.tsx    # add active chart glow, result badge pulse, mode content stagger
```

Do **not** modify `src/index.css` unless verification proves one of the existing classes is defective. Current CSS already includes reduced-motion handling.

---

## Task 1: Wire `.accent-bar` into global page titles

- **Files:**
  - Modify: `src/components/ui/PageLayout.tsx:37-43`
  - Optional inspect only: `src/NormalDistributionCalculator.tsx:1557-1595`
- **Confidence:** 95%
- **Dependencies:** None
- **Est. Effort:** 10 min
- **Gate:** `npm run lint:tsc` passes and `rg "accent-bar" src --glob "*.tsx"` returns at least one consumer in `PageLayout.tsx`.

### Rationale

`PageLayout` is the smallest global seam for page-title identity. Adding the bar here makes every page header comply without editing every calculator header.

### Steps

- [ ] Add an accent bar as a decorative child inside the header wrapper, before `{header}`.

Target shape:

```tsx
{header && (
  <header className="w-full max-w-[1800px] mx-auto mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[var(--color-border)] pb-5">
    <div className="accent-bar self-start md:self-center" aria-hidden="true" />
    {header}
  </header>
)}
```

- [ ] Verify the bar does not break the existing header layout at `src/NormalDistributionCalculator.tsx:1557-1595`; if it crowds tabs on desktop, change the wrapper to `gap-4 md:gap-6` rather than moving the bar into calculator-specific code.
- [ ] Run: `npm run lint:tsc`.
- [ ] Run: `rg "accent-bar" src --glob "*.tsx"`.

Expected:

```text
src/components/ui/PageLayout.tsx:... accent-bar ...
```

---

## Task 2: Wire `.stagger-in` into page load and mode-switched content

- **Files:**
  - Modify: `src/components/ui/PageLayout.tsx:43-45`
  - Modify: `src/NormalDistributionCalculator.tsx:1597-1636`
- **Confidence:** 90%
- **Dependencies:** Task 1
- **Est. Effort:** 15 min
- **Gate:** `npm run lint:tsc` passes and `rg "stagger-in" src --glob "*.tsx"` returns consumers in `PageLayout.tsx` and `NormalDistributionCalculator.tsx`.

### Rationale

The class is designed for child choreography (`.stagger-in > *`). It belongs on wrappers that contain multiple children, not on single leaf cards.

### Steps

- [ ] In `PageLayout.tsx`, add `stagger-in` to the main content wrapper:

```tsx
<main className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 stagger-in" dir={dir}>
  {children}
</main>
```

- [ ] In `NormalDistributionCalculator.tsx`, add `stagger-in` to the mode-switched content wrappers inside `AnimatePresence`. Apply it to the wrappers that own visible sections:

```tsx
<motion.div
  key="hypothesis"
  ...
  className="stagger-in"
>
  <HypothesisTestingCalculator />
</motion.div>
```

```tsx
<motion.div
  key="formula-sheet"
  ...
  className="stagger-in"
>
  <FormulaSheet theme="dark" />
</motion.div>
```

```tsx
<motion.div
  key="table"
  ...
  className="stagger-in"
>
  <ZTable activeZ={calculation ? calculation.z1 : null} showSearch={true} />
</motion.div>
```

```tsx
<motion.div
  key="calculators"
  ...
  className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start stagger-in"
>
```

- [ ] Do not add new `motion` transitions; `AnimatePresence` already handles route-level fades and `stagger-in` handles child entrance.
- [ ] Run: `npm run lint:tsc`.
- [ ] Run: `rg "stagger-in" src --glob "*.tsx"`.

---

## Task 3: Wire `.curve-glow` into active chart/result panels

- **Files:**
  - Modify: `src/components/ui/CustomComponents.tsx:171-209`
  - Modify: `src/NormalDistributionCalculator.tsx:357-365`
  - Optional inspect only: `src/components/HypothesisTestingCalculator.tsx:1560-1667`
- **Confidence:** 85%
- **Dependencies:** Task 2
- **Est. Effort:** 20 min
- **Gate:** `npm run lint:tsc` passes and `rg "curve-glow" src --glob "*.tsx"` returns consumers in reusable chart wrapper and normal chart panel.

### Rationale

`curve-glow` is for the active calculation surface. The reusable `ChartWrapper` should expose a controlled opt-in prop so future charts can use the signature without duplicating class strings; the existing inline normal chart panel can consume it directly until the monolith is refactored.

### Steps

- [ ] Extend `ChartWrapperProps` in `src/components/ui/CustomComponents.tsx` with an explicit opt-in prop:

```tsx
/** When true, applies the DESIGN.md signature glow to the active chart panel. */
highlightActive?: boolean;
```

- [ ] Destructure the prop with default `false`:

```tsx
highlightActive = false,
```

- [ ] Add the class conditionally to the outer panel:

```tsx
className={`rounded-lg p-4 md:p-5 border shadow-md transition-all bg-[var(--color-surface)] border-[var(--color-border)] w-full min-w-0 ${highlightActive ? 'curve-glow' : ''} ${className}`}
```

- [ ] In the inline `NormalChart` panel (`src/NormalDistributionCalculator.tsx:357-358`), add `curve-glow` to the outer chart container because this chart is the current active calculation panel:

```tsx
<div className="w-full rounded-lg p-4 border transition-colors bg-[var(--color-surface)] border-[var(--color-border)] curve-glow">
```

- [ ] If any existing `ChartWrapper` consumer already represents a live calculation panel, pass `highlightActive`. Do not add it to static/empty panels.
- [ ] Run: `npm run lint:tsc`.
- [ ] Run: `rg "curve-glow|highlightActive" src --glob "*.tsx"`.

---

## Task 4: Wire `.pulse-brass` into live result badges

- **Files:**
  - Modify: `src/NormalDistributionCalculator.tsx:363-365`
  - Modify: `src/components/HypothesisTestingCalculator.tsx:1723-1744` or the final conclusion badge/result seam near `decisionData` rendering
- **Confidence:** 80%
- **Dependencies:** Task 3
- **Est. Effort:** 25 min
- **Gate:** `npm run lint:tsc` passes and `rg "pulse-brass" src --glob "*.tsx"` returns at least one normal-calculator result badge plus one hypothesis-testing result/conclusion consumer.

### Rationale

The pulse should indicate an actively computed result, not decorate every static badge. Use it only when valid calculation data exists.

### Steps

- [ ] In `NormalDistributionCalculator.tsx`, add `pulse-brass` to the live result badge at `NormalChart` lines 363-365:

```tsx
<span className="px-3 py-1 rounded-full text-xs font-black tracking-wide shrink-0 bg-[var(--color-accent-cobalt-strong)]/30 text-[var(--color-accent-brass)] pulse-brass">
  {type === 'conditional' ? `P(A|B) = ${probability.toFixed(4)}` : `שטח מחושב: ${(probability * 100).toFixed(2)}%`}
</span>
```

- [ ] In `HypothesisTestingCalculator.tsx`, add `pulse-brass` to the first valid live-result control/badge that is only rendered when `isValid && decisionData` is true. The current safe seam is the “קפיצה למסקנה” button at `src/components/HypothesisTestingCalculator.tsx:1723-1744`:

```tsx
className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm sm:text-base font-black bg-[var(--color-surface)] hover:bg-[var(--color-accent-cobalt-bg)] text-[var(--color-text-primary)] hover:text-[var(--color-accent-cobalt)] border border-[var(--color-border)] shadow-md transition-all duration-300 leading-none group pulse-brass"
```

- [ ] If implementation finds a more semantically direct final result badge/conclusion panel later in the file, prefer that over the jump button. Constraint: the class must only render when `isValid && decisionData` is truthy.
- [ ] Do not apply `pulse-brass` to inactive tabs, static labels, or all status badges.
- [ ] Run: `npm run lint:tsc`.
- [ ] Run: `rg "pulse-brass" src --glob "*.tsx"`.

---

## Task 5: Verify design-system wiring and visual behavior

- **Files:**
  - No planned edits unless verification fails.
- **Confidence:** 90%
- **Dependencies:** Tasks 1-4
- **Est. Effort:** 15 min
- **Gate:** all deterministic checks pass; manual visual checks have clear pass/fail indicators.

### Verification Plan

- Success criteria: all four signature classes have TSX consumers; no new CSS is added; TypeScript/color lint/build pass; visible UI shows one accent bar in the page header, glow on the active chart panel, staggered entrance on mode changes, and pulse only on live computed result controls/badges.
- Checkpoints:
  1. Consumer audit -> verify: `rg "accent-bar|curve-glow|stagger-in|pulse-brass" src --glob "*.tsx"` returns all four classes.
  2. No CSS scope creep -> verify: `git diff -- src/index.css` is empty unless explicitly justified.
  3. Type/lint -> verify: `npm run lint` passes.
  4. Production build -> verify: `npm run build` passes.
  5. Visual smoke -> verify: dev server renders page and mode switches without layout breakage.
- Critic model: deterministic scripts only for this phase; reviewer profile should do visual QA after implementation.
- External signals: `npm run lint`, `npm run build`, `rg` class-consumer audit, browser manual inspection.

### Commands

- [ ] Run class-consumer audit:

```bash
rg "accent-bar|curve-glow|stagger-in|pulse-brass" src --glob "*.tsx"
```

Expected: at least one `.tsx` hit for each of the four classes.

- [ ] Run CSS no-op audit:

```bash
git diff -- src/index.css
```

Expected: no diff. If there is a diff, it must be explicitly explained because this plan should only wire existing CSS.

- [ ] Run full project verification:

```bash
npm run lint
npm run build
```

Expected: both commands exit `0`.

- [ ] Manual visual smoke test:

```bash
npm run dev
```

Open the Vite URL and check:

| Area | Pass indicator | Fail indicator |
|------|----------------|----------------|
| Header | One 48×4 brass→teal bar appears beside/above page identity without pushing tabs off-screen | Bar duplicates, overlaps tabs, or causes horizontal scroll |
| Normal chart | Active bell-curve panel has subtle brass/teal glow | Glow appears on every panel or is visually overwhelming |
| Result badge | “שטח מחושב” / `P(A|B)` badge pulses only while result is valid | Static labels or inactive tabs pulse |
| Mode switch | Content enters with subtle stagger; reduced-motion users see no animation | Children stay invisible, flicker heavily, or animate despite reduced-motion |
| Hypothesis test | Valid conclusion/result affordance has one live-result pulse | Pulse appears when form is invalid or across all accordions |

---

## Integration Checklist

- [ ] All low-confidence tasks resolved: none required.
- [ ] Dependencies form valid DAG: Task 1 → Task 2 → Task 3 → Task 4 → Task 5.
- [ ] Gates are executable: every task has `npm run lint:tsc` or full `npm run lint`/`npm run build` plus `rg` audits.
- [ ] No new CSS added unless verification proves existing CSS is broken.
- [ ] Signature classes are used semantically, not sprayed across every panel.
- [ ] Ready for `ce-work` consumption.

---

## Handoff to ce-work

Recommended executor: **engineer profile**.

Scope for execution: implement only the class wiring in the four files listed above, run the verification commands, and report exact manual visual pass/fail indicators for Robert to inspect. Do not refactor monoliths, extract components, or change calculation logic in this task.
