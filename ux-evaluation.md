# Steve Jobs Design Review — northstar-2.0 (Statistics Calculator)

**Date:** 2026-06-17
**Scope:** End-to-end experience — landing → calculator selection → parameter input → calculation → result interpretation → formula reference → help
**Method:** Binary verdicts, ruthless simplification, focus filter, "insanely great" standard

---

## The One Job

> **A Hebrew-speaking statistics student needs to compute probabilities / critical values / hypothesis tests accurately, understand the math, and trust the result — in under 60 seconds.**

Everything else is noise.

---

## Binary Verdicts by Screen/Flow

| Screen / Flow | Verdict | Rationale |
|---------------|---------|-----------|
| **Calculator Mode Selection** (Normal / Hypothesis / Formula Sheet) | **SHIT** | Three disparate calculators mashed into one tabbed interface. No clear entry point. Student doesn't think "I need NormalDistributionCalculator" — they think "I need P(X < 1.96)" or "I need to test H₀: μ = 100". The mode switch is a *system* concept, not a *user* concept. |
| **Normal Distribution Calculator — Input Panel** | **SHIT** | 12+ input fields visible simultaneously. Mean, SD, X1, X2, calc type (below/above/between/outside/conditional), conditional sub-type, conditional X1/X2. Cognitive overload. No progressive disclosure. No smart defaults (e.g., IQ, Z-score presets are buried in a table). |
| **Normal Distribution Calculator — Chart** | **BRILLIANT** | Live area chart with shaded regions is the **hero** — exactly what the spec calls "the bell curve is our hero." Real-time update, hover tooltip with Z-score + density. This is the one thing that makes students *feel* the distribution. |
| **Normal Distribution Calculator — Results Display** | **SHIT** | Probability shown as raw number + formula block + steps. No plain-language answer: "There's a 97.7% chance IQ is below 130." The math is there; the *meaning* is missing. |
| **Hypothesis Testing Calculator** | **SHIT** | 252KB monolith. Decision matrix, power calculation, effect size, multiple test types (Z, t, chi², proportion), all visible at once. A stats *professor* would struggle. The "one job" (run a hypothesis test) is buried under feature bloat. |
| **Formula Sheet** | **SHIT** | Dump of every formula. No context-aware filtering ("Show me formulas for t-test"). No progressive disclosure. Student hunts through 10 sections for the one they need. |
| **Statistical Helper Modal** | **SHIT** | Popup with definitions. Helpful content, wrong delivery. Contextual inline help (tooltips, empty states) would be 10x better. Modal = interruption. |
| **Dark/Light Mode** | **BRILLIANT** | Intentional inversion, accents preserved. Feels designed in both. Respects `prefers-color-scheme`. |
| **Hebrew RTL + Math LTR** | **BRILLIANT** | Flawless execution. `dir="rtl"` on containers, `dir="ltr"` on KaTeX. Assistant font for Hebrew. This *is* the craft. |
| **Signature Visual Identity** | **SHIT** | DESIGN.md defines `.accent-bar`, `.curve-glow`, `.stagger-in`, `.pulse-brass` — **none exist in code**. The "brass accent = H₀ reference" semantic system is the soul — but it's not *visible* as a signature. |

---

## The Cut List (Kill These)

| Feature / Element | Reason |
|-------------------|--------|
| **Mode tabs** (Normal / Hypothesis / Formula Sheet) | System-centric, not user-centric. Replace with *task-based entry*: "Find probability", "Test hypothesis", "Look up formula" |
| **Conditional probability UI in Normal calc** | Edge case. 95% of students need P(X < x), P(X > x), P(a < X < b). Hide conditional behind "Advanced" |
| **Decision matrix table in Hypothesis calc** | Reference material, not calculation. Move to Formula Sheet / Help |
| **Power calculation as default visible** | Advanced. Hide behind "Show power analysis" |
| **Effect size calculator** | Separate tool. Kill from Hypothesis calc. |
| **Chi² / Proportion tests in same UI** | Different mental models. Separate entry points. |
| **Statistical Helper Modal** | Replace with inline tooltips + contextual empty states |
| **Formula Sheet as monolithic list** | Replace with context-aware formula lookup (show formulas for *current task*) |
| **All `text-[10px]`, `text-[11px]` hardcoded sizes** | Design system violation. Kill during P0 remediation. |
| **Raw `slate-800` border** | Design system violation. Kill during P0 remediation. |

---

## The Keep List (Double Down on These)

| Element | Why It's the Hero |
|---------|-------------------|
| **Live bell curve chart with shaded regions** | The *only* thing that makes abstract statistics visceral. Real-time, responsive, accurate. |
| **Semantic color system** (brass=H₀, teal=power, crimson=α, cobalt=Z) | Not decoration — *meaning*. When a student sees brass, they know "this is the null hypothesis reference." |
| **Hebrew RTL + Assistant font + Math LTR isolation** | The craft that earns trust. No other tool does this right. |
| **Dark-first with intentional light mode** | Academic credibility. Feels like a precision instrument. |
| **KaTeX formula rendering** | Professional math typesetting. Non-negotiable for academic instrument. |
| **Exact math utilities** (erf, inverseNormalCDF, studentTCDF) | Accuracy is the product. No approximations. |

---

## The One Thing to Perfect

> **The live bell curve chart — from input to insight in one glance.**

Not the input panel. Not the formula blocks. Not the tables.
**The chart.**

A student enters μ=100, σ=15, X=130 → **instantly sees the shaded tail + "97.7%" in hero typography**.
That's the product. Everything else serves that moment.

---

## Jobs-Style Rationale

### On Simplicity
> "Simple can be harder than complex. You have to work hard to get your thinking clean to make it simple."

The current UI is *complex* because it avoids the hard choices:
- Which 3 calculations do 90% of students need? (Below / Above / Between)
- Where does "conditional probability" live? (Advanced → separate screen)
- How do we show the answer in plain Hebrew, not just math?

**Clean thinking = removing the conditional UI, the decision matrix, the power calc from the default view.**

### On Focus
> "Focus means saying no to the hundred other good ideas."

Good ideas killed: power analysis, effect size, chi² tests, proportion tests, conditional probability, formula dump, helper modal.
**Not because they're bad — because they dilute the one job.**

### On End-to-End Ownership
> Jobs reviewed the box, the unboxing, the first boot.

Our "box" = first load. Current: blank screen → chart mounts → inputs appear → chart draws.
**Target:** Chart draws *while* inputs hydrate. Skeleton with pulsing brass glow (`.pulse-brass` — currently missing).

Our "first boot" = first calculation. Current: raw probability + formula + steps.
**Target:** "יש סיכוי של 97.7% שהציון יהיה מתחת ל‑130" in `display-hero` brass, *then* the math.

### On Emotional Resonance
> "Usable is the floor. Makes the user feel understood is the bar."

A Hebrew statistics student feels: **anxiety** (exam tomorrow), **doubt** (is my calculation right?), **relief** (the chart confirms my mental model).
The chart *delivers relief*. The input panel *causes anxiety* (too many fields).
**Fix: smart defaults — "IQ scores", "Z-scores", "Custom" — pick one, get the chart.**

---

## Verdict: SHIP / DON'T SHIP

**DON'T SHIP** — not until:

1. **P0 remediation complete** (design-system-audit.md P0 items)
2. **Mode tabs replaced with task-based entry** (3 screens → 3 entry points)
3. **Normal Distribution default view** = 3 inputs (μ, σ, X) + calc type picker + **hero chart + plain-language answer**
4. **Hypothesis Testing** split into separate task flows (Z-test / t-test / proportion / chi²) each with own entry
5. **Signature elements implemented** (`.accent-bar`, `.curve-glow`, `.stagger-in`, `.pulse-brass`)
6. **First-load experience** chart-first with skeleton + pulse-brass

---

## What the Losers Teach Us

The **Formula Sheet** and **Statistical Helper Modal** teach: *reference material should be contextual, not cataloged*.
→ **FormulaBlock component** (from DESIGN.md) should appear *inline* in results: "הנה הנוסחה שהשתמשנו בה" with brass left border.

The **Decision Matrix** teaches: *decisions are outcomes, not inputs*.
→ Show the decision *after* the calculation: "תוצאה: דוחים את H₀ (p = 0.034 < α = 0.05)" in crimson badge.

The **Conditional Probability UI** teaches: *progressive disclosure is not optional*.
→ "Advanced" disclosure pattern (already exists as `Disclosure` in CustomComponents) must be used.

---

## Final Word

> "Design is not just what it looks like and feels like. Design is how it works."

**How it works today:** Student fights the UI to find the calculation, then fights the output to extract meaning.
**How it must work:** Student states the question → sees the bell curve → reads the answer in Hebrew → trusts it.

The **chart is brilliant**. The **semantic color system is brilliant**. The **RTL/Hebrew craft is brilliant**.
Everything else is **shit** — and that's the opportunity. Cut it. Perfect the chart. Ship the instrument.

---

**Next Action:** Execute `design-system-audit.md` P0 remediation → then rebuild Normal Distribution Calculator as **task-based entry: "Find Probability"** with chart-first UX.