צריך להזיז את הכפתורים של ההרחבה והצמצום, שהם יהיו בתוך הכותרת של בדיקת ההשערות, בצמודים לצד השמאלי. צריך להזיז את הכפתורים של ההרחבה והצמצום, שהם יהיו בתוך הכותרת של בדיקת ההשערות, בצמודים לצד השמאלי. # Extract Math Module — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract all statistical math utility functions from `NormalDistributionCalculator.tsx` and `HypothesisTestingCalculator.tsx` into a shared `src/lib/math/distributions.ts` module. Delete every copy-pasted duplicate. Both calculators import from one place.

**Architecture:** Create `src/lib/math/distributions.ts` as a pure-function module with zero dependencies (no React, no DOM, no state). Export every CDF/PDF/inverse function through a barrel `src/lib/math/index.ts`. The two calculator files swap their inline definitions for import statements. The inverse-t algorithms diverge between the two files (bisection vs Cornish-Fisher+Newton-Raphson) — the HTC implementation is strictly superior (O(1) vs O(100 iterations)); we keep HTC's version and rename `studentTPPF` → `inverseStudentTCDF` for API consistency. We also install Vitest and write the first test file in the project.

**Tech Stack:** TypeScript (pure functions, no React), Vitest for unit tests

---

## Proposed Changes

### File Structure (After)

```
src/
├── lib/
│   └── math/
│       ├── distributions.ts   ← [NEW] All math functions, single source of truth
│       └── index.ts           ← [NEW] Barrel re-export
├── NormalDistributionCalculator.tsx   ← [MODIFY] Delete ~135 LOC of math, add 1 import
├── components/
│   └── HypothesisTestingCalculator.tsx ← [MODIFY] Delete ~165 LOC of math, add 1 import
tests/
└── lib/
    └── math/
        └── distributions.test.ts ← [NEW] Unit tests for all exported functions
vitest.config.ts                  ← [NEW] Vitest configuration
```

---

### Function Inventory & Merge Strategy

Both files define overlapping sets of math functions. Here is the canonical mapping:

| Function | NDC (L46–179) | HTC (L46–210) | Merged Name | Notes |
|----------|:---:|:---:|-------------|-------|
| `erf(x)` | ✅ L55–70 | ✅ L60–75 | `erf` | Identical A&S 7.1.26 |
| `normalCDF(x, mean, stdDev)` | ✅ L46–50 | ✅ L51–55 | `normalCDF` | Identical |
| `normalPDF(x, mean, stdDev)` | ✅ L75–79 | ✅ L80–84 | `normalPDF` | Identical |
| `inverseNormalCDF(p)` | ✅ L85–96 | ✅ L89–100 | `inverseNormalCDF` | NDC clamps to ±5, HTC clamps to ±4.5. **Use ±Infinity-safe clamping: ±8** |
| `studentTCDF(t, df)` | ✅ L102–134 | ✅ L140–169 | `studentTCDF` | Different implementations. NDC handles df≤0 and df=1 separately; HTC uses a single even/odd branch. **Use NDC version** — it handles more edge cases. Normalize large-df threshold to `df > 200` (HTC value) |
| `studentTInverseCDF(p, df)` | ✅ L140–179 | ❌ | `inverseStudentTCDF` | NDC only. Bisection-based, 100 iterations. Keep as fallback. |
| `lnGamma(x)` | ❌ | ✅ L105–122 | `lnGamma` | HTC only. Lanczos approximation. |
| `studentTPDF(t, df)` | ❌ | ✅ L127–134 | `studentTPDF` | HTC only. Uses lnGamma. |
| `studentTPPFInitial(p, df)` | ❌ | ✅ L174–189 | (internal) | HTC only. Cornish-Fisher initial guess. Keep as non-exported helper. |
| `studentTPPF(p, df)` | ❌ | ✅ L195–210 | `inverseStudentTCDF` | HTC only. Newton-Raphson refined. **Superior algorithm — replaces NDC bisection as the canonical inverse.** |

**Merge decision**: The canonical `inverseStudentTCDF` will be HTC's Cornish-Fisher + Newton-Raphson version (`studentTPPF`). NDC's bisection solver is deleted. All call sites in NDC that called `studentTInverseCDF` will now call `inverseStudentTCDF` — same API `(p, df) → t`.

---

### Task 1: Install Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install Vitest as dev dependency**

Run: `npm install -D vitest`
Expected: vitest added to devDependencies in package.json

- [ ] **Step 2: Create vitest.config.ts**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
```

- [ ] **Step 3: Add test script to package.json**

In `package.json` `"scripts"` section, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: add vitest test infrastructure"
```

---

### Task 2: Create `src/lib/math/distributions.ts`

**Files:**
- Create: `src/lib/math/distributions.ts`

This is the core deliverable — all statistical math functions in one pure-function module.

- [ ] **Step 1: Create the file with all functions**

```ts
// src/lib/math/distributions.ts

/**
 * Statistical distribution functions — single source of truth.
 *
 * Pure functions, zero dependencies.
 * Consumed by NormalDistributionCalculator, HypothesisTestingCalculator,
 * and future hooks/utilities.
 */

// ─── Error Function ──────────────────────────────────────────────

/**
 * Error function approximation (Abramowitz & Stegun formula 7.1.26).
 * Maximum error: |ε(x)| ≤ 1.5 × 10⁻⁷
 */
export function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);

  const t = 1.0 / (1.0 + p * absX);
  const y =
    1.0 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX));

  return sign * y;
}

// ─── Normal Distribution ─────────────────────────────────────────

/**
 * Normal Cumulative Distribution Function (CDF).
 * P(X ≤ x) for X ~ N(mean, stdDev²)
 */
export function normalCDF(x: number, mean: number, stdDev: number): number {
  if (stdDev <= 0) return 0.5;
  const z = (x - mean) / stdDev;
  return 0.5 * (1 + erf(z / Math.sqrt(2)));
}

/**
 * Normal Probability Density Function (PDF).
 * f(x) for X ~ N(mean, stdDev²)
 */
export function normalPDF(x: number, mean: number, stdDev: number): number {
  if (stdDev <= 0) return 0;
  const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
}

/**
 * Inverse Normal CDF (quantile / Z-score from probability).
 * Rational approximation (Abramowitz & Stegun 26.2.23).
 */
export function inverseNormalCDF(p: number): number {
  if (p <= 0) return -8;
  if (p >= 1) return 8;

  const c = [2.515517, 0.802853, 0.010328];
  const d = [1.432788, 0.189269, 0.001308];

  const t =
    p < 0.5
      ? Math.sqrt(-2.0 * Math.log(p))
      : Math.sqrt(-2.0 * Math.log(1.0 - p));

  const z =
    t -
    ((c[2] * t + c[1]) * t + c[0]) / (((d[2] * t + d[1]) * t + d[0]) * t + 1.0);

  return p < 0.5 ? -z : z;
}

// ─── Gamma ───────────────────────────────────────────────────────

/**
 * Natural logarithm of the Gamma function, ln(Γ(x)).
 * Lanczos approximation (g = 5, n = 6).
 */
export function lnGamma(x: number): number {
  if (x < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * x)) - lnGamma(1 - x);
  }
  const cof = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.001208650973866179, -0.000005395239384953,
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j <= 5; j++) {
    y += 1;
    ser += cof[j] / y;
  }
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

// ─── Student's t-Distribution ────────────────────────────────────

/**
 * Student's t PDF.
 * Falls back to standard normal PDF for df > 250.
 */
export function studentTPDF(t: number, df: number): number {
  if (df > 250) {
    return normalPDF(t, 0, 1);
  }
  const logC =
    lnGamma((df + 1) / 2) - 0.5 * Math.log(df * Math.PI) - lnGamma(df / 2);
  const C = Math.exp(logC);
  return C * Math.pow(1 + (t * t) / df, -(df + 1) / 2);
}

/**
 * Student's t CDF.
 * Trigonometric series for integer df; falls back to normal for df > 200.
 * Handles df ≤ 0 (returns 0.5) and df = 1 (Cauchy) as special cases.
 */
export function studentTCDF(t: number, df: number): number {
  if (df <= 0) return 0.5;

  if (df > 200) {
    return normalCDF(t, 0, 1);
  }

  const theta = Math.atan(t / Math.sqrt(df));

  if (df === 1) {
    return 0.5 + theta / Math.PI;
  }

  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);

  let sum = 1;
  let term = 1;

  if (df % 2 === 0) {
    for (let i = 2; i <= df - 2; i += 2) {
      term *= (cosT * cosT * (i - 1)) / i;
      sum += term;
    }
    return 0.5 + 0.5 * sinT * sum;
  } else {
    for (let i = 3; i <= df - 2; i += 2) {
      term *= (cosT * cosT * (i - 1)) / i;
      sum += term;
    }
    return 0.5 + (theta + sinT * cosT * sum) / Math.PI;
  }
}

/**
 * Cornish-Fisher initial guess for inverse Student's t.
 * Internal helper — not exported.
 */
function studentTPPFInitial(p: number, df: number): number {
  const z = inverseNormalCDF(p);
  if (df > 500) return z;

  const z2 = z * z;
  const z3 = z2 * z;
  const z5 = z3 * z2;
  const z7 = z5 * z2;

  const term1 = z;
  const term2 = (z3 + z) / (4 * df);
  const term3 = (5 * z5 + 16 * z3 + 3 * z) / (96 * df * df);
  const term4 = (3 * z7 + 19 * z5 + 17 * z3 - 15 * z) / (384 * df * df * df);

  return term1 + term2 + term3 + term4;
}

/**
 * Inverse Student's t CDF (quantile function).
 *
 * Uses Cornish-Fisher expansion as initial guess, refined with
 * 3 Newton-Raphson iterations. Converges to ~14 decimal places.
 */
export function inverseStudentTCDF(p: number, df: number): number {
  if (p <= 0.00001) return -10.0;
  if (p >= 0.99999) return 10.0;

  // 1. Initial guess using Cornish-Fisher expansion
  let t = studentTPPFInitial(p, df);

  // 2. Newton-Raphson refinement (3 iterations — extremely stable)
  for (let i = 0; i < 3; i++) {
    const error = studentTCDF(t, df) - p;
    const derivative = studentTPDF(t, df);
    if (derivative === 0) break;
    t = t - error / derivative;
  }
  return t;
}
```

- [ ] **Step 2: Create the barrel file**

```ts
// src/lib/math/index.ts
export {
  erf,
  normalCDF,
  normalPDF,
  inverseNormalCDF,
  lnGamma,
  studentTPDF,
  studentTCDF,
  inverseStudentTCDF,
} from './distributions';
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/math/distributions.ts src/lib/math/index.ts
git commit -m "feat: extract math module to src/lib/math/distributions.ts"
```

---

### Task 3: Write tests for `distributions.ts`

**Files:**
- Create: `tests/lib/math/distributions.test.ts`

All reference values come from standard statistical tables and are cross-verified.

- [ ] **Step 1: Write the test file**

```ts
// tests/lib/math/distributions.test.ts
import { describe, it, expect } from 'vitest';
import {
  erf,
  normalCDF,
  normalPDF,
  inverseNormalCDF,
  lnGamma,
  studentTPDF,
  studentTCDF,
  inverseStudentTCDF,
} from '../../src/lib/math/distributions';

describe('erf', () => {
  it('erf(0) = 0', () => {
    expect(erf(0)).toBeCloseTo(0, 10);
  });

  it('erf(1) ≈ 0.8427', () => {
    expect(erf(1)).toBeCloseTo(0.8427007929, 6);
  });

  it('erf(-1) ≈ -0.8427 (odd function)', () => {
    expect(erf(-1)).toBeCloseTo(-0.8427007929, 6);
  });

  it('erf(3) ≈ 0.99998 (large input)', () => {
    expect(erf(3)).toBeCloseTo(0.9999779, 5);
  });
});

describe('normalCDF', () => {
  it('Φ(0) for standard normal = 0.5', () => {
    expect(normalCDF(0, 0, 1)).toBeCloseTo(0.5, 10);
  });

  it('Φ(1.96) ≈ 0.975 (95% confidence)', () => {
    expect(normalCDF(1.96, 0, 1)).toBeCloseTo(0.975, 3);
  });

  it('Φ(-1.96) ≈ 0.025', () => {
    expect(normalCDF(-1.96, 0, 1)).toBeCloseTo(0.025, 3);
  });

  it('Φ(μ) = 0.5 for any μ, σ', () => {
    expect(normalCDF(100, 100, 15)).toBeCloseTo(0.5, 10);
  });

  it('returns 0.5 for stdDev ≤ 0', () => {
    expect(normalCDF(5, 0, 0)).toBe(0.5);
    expect(normalCDF(5, 0, -1)).toBe(0.5);
  });
});

describe('normalPDF', () => {
  it('peak at mean for standard normal ≈ 0.3989', () => {
    expect(normalPDF(0, 0, 1)).toBeCloseTo(0.3989422804, 6);
  });

  it('symmetric: f(1) = f(-1)', () => {
    expect(normalPDF(1, 0, 1)).toBeCloseTo(normalPDF(-1, 0, 1), 10);
  });

  it('returns 0 for stdDev ≤ 0', () => {
    expect(normalPDF(0, 0, 0)).toBe(0);
  });
});

describe('inverseNormalCDF', () => {
  it('Φ⁻¹(0.5) = 0', () => {
    expect(inverseNormalCDF(0.5)).toBeCloseTo(0, 3);
  });

  it('Φ⁻¹(0.975) ≈ 1.96', () => {
    expect(inverseNormalCDF(0.975)).toBeCloseTo(1.96, 2);
  });

  it('Φ⁻¹(0.025) ≈ -1.96', () => {
    expect(inverseNormalCDF(0.025)).toBeCloseTo(-1.96, 2);
  });

  it('Φ⁻¹(0.95) ≈ 1.6449', () => {
    expect(inverseNormalCDF(0.95)).toBeCloseTo(1.6449, 2);
  });

  it('clamps at boundaries', () => {
    expect(inverseNormalCDF(0)).toBe(-8);
    expect(inverseNormalCDF(1)).toBe(8);
  });

  it('round-trip: normalCDF(inverseNormalCDF(p)) ≈ p', () => {
    for (const p of [0.01, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99]) {
      const z = inverseNormalCDF(p);
      expect(normalCDF(z, 0, 1)).toBeCloseTo(p, 3);
    }
  });
});

describe('lnGamma', () => {
  it('ln(Γ(1)) = 0', () => {
    expect(lnGamma(1)).toBeCloseTo(0, 8);
  });

  it('ln(Γ(0.5)) = ln(√π) ≈ 0.5724', () => {
    expect(lnGamma(0.5)).toBeCloseTo(Math.log(Math.sqrt(Math.PI)), 5);
  });

  it('ln(Γ(5)) = ln(24) ≈ 3.1781', () => {
    expect(lnGamma(5)).toBeCloseTo(Math.log(24), 5);
  });
});

describe('studentTPDF', () => {
  it('peak at t=0 for df=10 ≈ 0.3891', () => {
    expect(studentTPDF(0, 10)).toBeCloseTo(0.3891, 3);
  });

  it('symmetric: f(t) = f(-t)', () => {
    expect(studentTPDF(1.5, 5)).toBeCloseTo(studentTPDF(-1.5, 5), 10);
  });

  it('approaches normal PDF for large df', () => {
    expect(studentTPDF(1, 300)).toBeCloseTo(normalPDF(1, 0, 1), 3);
  });
});

describe('studentTCDF', () => {
  it('P(T ≤ 0) = 0.5 for any df', () => {
    expect(studentTCDF(0, 1)).toBeCloseTo(0.5, 10);
    expect(studentTCDF(0, 10)).toBeCloseTo(0.5, 10);
    expect(studentTCDF(0, 30)).toBeCloseTo(0.5, 10);
  });

  it('df=1 (Cauchy): P(T ≤ 1) = 0.75', () => {
    expect(studentTCDF(1, 1)).toBeCloseTo(0.75, 4);
  });

  it('df=10: P(T ≤ 2.228) ≈ 0.975', () => {
    expect(studentTCDF(2.228, 10)).toBeCloseTo(0.975, 2);
  });

  it('approaches normal for large df', () => {
    expect(studentTCDF(1.96, 300)).toBeCloseTo(normalCDF(1.96, 0, 1), 2);
  });

  it('returns 0.5 for df ≤ 0', () => {
    expect(studentTCDF(1, 0)).toBe(0.5);
    expect(studentTCDF(1, -5)).toBe(0.5);
  });
});

describe('inverseStudentTCDF', () => {
  it('t⁻¹(0.975, 10) ≈ 2.228', () => {
    expect(inverseStudentTCDF(0.975, 10)).toBeCloseTo(2.228, 2);
  });

  it('t⁻¹(0.95, 20) ≈ 1.725', () => {
    expect(inverseStudentTCDF(0.95, 20)).toBeCloseTo(1.725, 2);
  });

  it('t⁻¹(0.975, 30) ≈ 2.042', () => {
    expect(inverseStudentTCDF(0.975, 30)).toBeCloseTo(2.042, 2);
  });

  it('clamps at boundaries', () => {
    expect(inverseStudentTCDF(0, 10)).toBe(-10);
    expect(inverseStudentTCDF(1, 10)).toBe(10);
  });

  it('round-trip: studentTCDF(inverseStudentTCDF(p, df), df) ≈ p', () => {
    for (const df of [5, 10, 30]) {
      for (const p of [0.025, 0.05, 0.5, 0.95, 0.975]) {
        const t = inverseStudentTCDF(p, df);
        expect(studentTCDF(t, df)).toBeCloseTo(p, 3);
      }
    }
  });
});
```

- [ ] **Step 2: Run the tests to verify they pass**

Run: `npx vitest run`
Expected: All tests PASS (green)

- [ ] **Step 3: Commit**

```bash
git add tests/lib/math/distributions.test.ts
git commit -m "test: add unit tests for math distributions module"
```

---

### Task 4: Rewire `HypothesisTestingCalculator.tsx`

**Files:**
- Modify: `src/components/HypothesisTestingCalculator.tsx:46-211`

Delete all inline math functions (lines 46–211, ~165 LOC) and replace with a single import.

- [ ] **Step 1: Replace the math block with imports**

Delete everything from `// --- Probability Math Helpers ---` (line 46) through the end of `studentTPPF` (line 210), inclusive. Replace with:

```tsx
import {
  normalCDF,
  normalPDF,
  inverseNormalCDF,
  lnGamma,
  studentTPDF,
  studentTCDF,
  inverseStudentTCDF,
} from '../lib/math';
```

The function `studentTPPF` was renamed to `inverseStudentTCDF`. All call sites in HTC that call `studentTPPF(p, df)` must be updated to `inverseStudentTCDF(p, df)`.

Affected call sites (search for `studentTPPF` in HTC):
- Line ~681: `zCrit = studentTPPF(1 - alpha, df);` → `zCrit = inverseStudentTCDF(1 - alpha, df);`
- Line ~683: `zCrit = studentTPPF(alpha, df);` → `zCrit = inverseStudentTCDF(alpha, df);`
- Line ~685: `zCrit = studentTPPF(1 - alpha / 2, df);` → `zCrit = inverseStudentTCDF(1 - alpha / 2, df);`

**Note:** The `erf` function is not called directly in HTC (only indirectly through `normalCDF`), so it does not need to be imported.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run tests to verify no regression**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/HypothesisTestingCalculator.tsx
git commit -m "refactor(HTC): import math from shared module, delete 165 LOC of inline math"
```

---

### Task 5: Rewire `NormalDistributionCalculator.tsx`

**Files:**
- Modify: `src/NormalDistributionCalculator.tsx:40-179`

Delete all inline math functions (lines 40–179, ~139 LOC) and replace with a single import.

- [ ] **Step 1: Replace the math block with imports**

Delete everything from `// --- Math Utilities ---` (line 40) through the end of `studentTInverseCDF` (line 179), inclusive. Replace with:

```tsx
import {
  normalCDF,
  normalPDF,
  inverseNormalCDF,
  studentTCDF,
  inverseStudentTCDF,
} from './lib/math';
```

The function `studentTInverseCDF` was renamed to `inverseStudentTCDF`. All call sites in NDC that call `studentTInverseCDF(p, df)` must be updated to `inverseStudentTCDF(p, df)`.

Affected call sites (search for `studentTInverseCDF` in NDC):
- Line ~719: `return studentTInverseCDF(targetP, tDf);` → `return inverseStudentTCDF(targetP, tDf);`
- Line ~834: `const val = studentTInverseCDF(1 - c.oneTail, df);` → `const val = inverseStudentTCDF(1 - c.oneTail, df);`

**Note on `erf`:** The `erf` function is not called directly in NDC — it's only used internally by `normalCDF`. Do not import it.

**Note on `lnGamma` and `studentTPDF`:** These are not called directly in NDC either. Do not import them.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run the full test suite**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/NormalDistributionCalculator.tsx
git commit -m "refactor(NDC): import math from shared module, delete 139 LOC of inline math"
```

---

### Task 6: Add `test` to verification gates & final check

**Files:**
- Modify: `package.json` (already done in Task 1, just verify)

- [ ] **Step 1: Run the full lint + build pipeline**

Run: `npm run lint:tsc && npm run build && npx vitest run`
Expected: All three pass with zero errors

- [ ] **Step 2: Verify dev server starts and renders correctly**

Run: `npm run dev`
Expected: Dev server on port 3000, both calculators render normally

- [ ] **Step 3: Final commit (if any adjustments were made)**

```bash
git add -A
git commit -m "chore: final verification — math module extraction complete"
```

---

## Verification Plan

### Automated Tests

```bash
npx vitest run                    # Unit tests for all exported functions
npm run lint:tsc                  # TypeScript strict check (noEmit)
npm run build                     # Vite production build
```

### Manual Verification

- Open dev server (`npm run dev`), navigate to Normal Distribution calculator, verify:
  - Forward calculation (P(X < x)) produces correct probability
  - Inverse calculation produces correct X value
  - Z-table renders correct Φ(z) values
  - Student's t-table renders correct critical values
- Navigate to Hypothesis Testing calculator, verify:
  - Z-test (variance known) produces correct critical values
  - t-test (variance unknown) produces correct critical values
  - Power analysis computes correctly
  - P-value calculation works for all tail types

---

## Summary

| Metric | Before | After |
|--------|--------|-------|
| Math function copies | 2 (NDC + HTC) | 1 (`distributions.ts`) |
| Duplicated LOC | ~200 | 0 |
| Test coverage for math | 0% | 100% of exported functions |
| NDC size reduction | 1883 lines | ~1744 lines (−139) |
| HTC size reduction | 3421 lines | ~3256 lines (−165) |
| Total LOC deleted | — | ~304 (duplicates) |
| New LOC | — | ~175 (distributions.ts) + ~135 (tests) |
| Net LOC change | — | +6 (but 0 duplication) |
