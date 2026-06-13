# P-Value Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate an exact p-value calculation into the existing Hypothesis Testing calculator's results section.

**Architecture:** Augment the `decisionData` useMemo in `HypothesisTestingCalculator.tsx` to compute the observed test statistic (`statObs`) and its corresponding `pValue`. Then, display this value in the results UI.

**Tech Stack:** React, TypeScript. Note: No automated test framework is present in `package.json`, so we will rely on manual visual verification and TypeScript compilation checks.

---

### Task 1: Calculate and Return `pValue`

**Files:**
- Modify: `src/components/HypothesisTestingCalculator.tsx`

- [ ] **Step 1: Add pValue calculation to decisionData**
Modify the `decisionData` useMemo block to calculate and return `pValue` and `statObs`. We'll replace the existing return object with the updated one.

```typescript
// Replace lines in decisionData useMemo:
// from: const comparisonText = tailType ==='right' ? `גדולה מ-${mu0}` : tailType ==='left' ? `קטנה מ-${mu0}` : `שונה מ-${mu0}`;
// to the end of the return statement.

  const comparisonText = tailType ==='right' ? `גדולה מ-${mu0}` : tailType ==='left' ? `קטנה מ-${mu0}` : `שונה מ-${mu0}`;
  
  if (isReject) {
    verbalConclusion = `ברמת מובהקות של ${alpha}, קיימות ראיות סטטיסטיות מספקות המבוססות על המדגם כדי לדחות את השערת האפס ולקבוע כי תוחלת האוכלוסייה ${comparisonText}.`;
  } else {
    verbalConclusion = `ברמת מובהקות של ${alpha}, אין מספיק ראיות סטטיסטיות במדגם כדי לשלול את השערת האפס, ולכן לא ניתן לקבוע כי תוחלת האוכלוסייה ${comparisonText}.`;
  }

  // Calculate Exact P-Value
  let statObs = 0;
  let pValue = 0;
  
  statObs = (xBarValue - stats.effectH0Mean) / stats.se;
  
  if (stats.varianceKnown) {
    if (tailType === 'right') {
      pValue = 1 - normalCDF(statObs, 0, 1);
    } else if (tailType === 'left') {
      pValue = normalCDF(statObs, 0, 1);
    } else {
      pValue = 2 * Math.min(normalCDF(statObs, 0, 1), 1 - normalCDF(statObs, 0, 1));
    }
  } else {
    if (tailType === 'right') {
      pValue = 1 - studentTCDF(statObs, stats.df);
    } else if (tailType === 'left') {
      pValue = studentTCDF(statObs, stats.df);
    } else {
      pValue = 2 * Math.min(studentTCDF(statObs, stats.df), 1 - studentTCDF(statObs, stats.df));
    }
  }

  return {
    xBar: xBarValue,
    isReject,
    decisionHeading,
    verbalConclusion,
    zoneRejectionTeX,
    zoneAcceptanceTeX,
    belongingExplanationText,
    formattedXBar,
    pValue,
    statObs
  };
```

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Expected: PASS (No type errors)

- [ ] **Step 3: Commit**

```bash
git add src/components/HypothesisTestingCalculator.tsx
git commit -m "feat: add pValue calculation to decisionData"
```

### Task 2: Display `pValue` in the Results UI

**Files:**
- Modify: `src/components/HypothesisTestingCalculator.tsx`

- [ ] **Step 1: Update the UI to render the P-Value**
Locate the render block where `decisionData.verbalConclusion` is shown. We will inject a new div to display the `pValue`. 

Search for:
```tsx
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-sm leading-relaxed text-slate-300">
                  <span className="font-bold text-slate-200">מסקנה מילולית: </span>
                  {decisionData.verbalConclusion}
                </div>
```

Replace it with:
```tsx
                <div className="flex flex-col gap-3">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-sm leading-relaxed text-slate-300">
                    <span className="font-bold text-slate-200">מסקנה מילולית: </span>
                    {decisionData.verbalConclusion}
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 flex items-center justify-between">
                    <span className="font-bold text-slate-200">Exact P-Value:</span>
                    <span className={`font-mono text-lg font-bold ${decisionData.pValue < alpha ? 'text-emerald-400' : 'text-red-400'}`}>
                      {decisionData.pValue < 0.0001 ? '< 0.0001' : decisionData.pValue.toFixed(4)}
                    </span>
                  </div>
                </div>
```

- [ ] **Step 2: Start dev server for manual verification**

Run: `npm run dev`
Expected: Server starts on port 3000. 

- [ ] **Step 3: Commit**

```bash
git add src/components/HypothesisTestingCalculator.tsx
git commit -m "feat: display exact p-value in results UI"
```
