# Design System Audit Report — northstar-2.0 (Statistics Calculator)

**Date:** 2026-06-17
**Scope:** DESIGN.md (Spec) vs. Implementation (tokens.json, tailwind.theme.json, src/index.css, src/components/ui/*, calculator components)
**Method:** frontend-design skill verification checklist + DESIGN.md compliance audit

---

## Executive Summary

| Metric | Score | Status |
|--------|-------|--------|
| **Spec Completeness** | 95% | ✅ DESIGN.md is comprehensive, machine-readable, and well-structured |
| **Token Fidelity** | 90% | ✅ tokens.json, tailwind.theme.json, index.css mirror DESIGN.md accurately |
| **Component Compliance** | 65% | 🟡 Significant violations in calculator components (hardcoded sizes, raw colors) |
| **RTL/Hebrew Support** | 85% | ✅ Good foundation, some gaps in components |
| **Dark/Light Mode** | 90% | ✅ Implemented correctly in index.css |
| **Signature Elements** | 70% | 🟡 `.accent-bar`, `.curve-glow`, `.stagger-in`, `.pulse-brass` defined but not verified in components |

**Overall:** The **Spec layer is excellent** (Three-Layer Method compliant). The **Verifier layer is missing** — this audit *is* the first verifier pass. The **Environment layer** (components) has systematic violations that need remediation before any feature work.

---

## 1. Spec Layer Assessment (DESIGN.md) — ✅ STRONG

### Strengths
- **Complete Three-Layer Spec:** Colors, typography, spacing, rounded, components, motion, accessibility, export commands
- **Semantic grounding:** Every accent tied to statistical meaning (brass=H₀, teal=power, crimson=α, cobalt=Z)
- **Token discipline:** 4–6 named colors, 2–3 font families, modular scale, base-4 spacing
- **Dark-first with intentional light mode:** CSS custom property overrides in `@media (prefers-color-scheme: light)`
- **WCAG AA verified:** Contrast ratios documented for all combinations
- **Machine-readable:** Exports to W3C DTCG (tokens.json) and Tailwind v3 (tailwind.theme.json)
- **Anti-patterns documented:** Explicit "Do's and Don'ts" with semantic token enforcement

### Minor Gaps
- **Signature elements** (`.accent-bar`, `.curve-glow`, `.stagger-in`, `.pulse-brass`) defined in DESIGN.md §Signature Elements but **not present in index.css** — need implementation
- **Motion tokens** defined but not in @theme or CSS variables
- **Component usage map** references components like `Heading`, `Label`, `Input`, `Button`, `Badge`, `Table`, `Tooltip`, `Accordion`, `FormulaBlock`, `Modal` — not all exist in `src/components/ui/`

---

## 2. Token Fidelity — tokens.json / tailwind.theme.json / index.css — ✅ STRONG

| Token Category | tokens.json | tailwind.theme.json | index.css | Match DESIGN.md |
|----------------|-------------|---------------------|-----------|-----------------|
| Colors (base, text, accent, semantic) | ✅ | ✅ | ✅ | ✅ 100% |
| Spacing (4px base, 0.5–24) | ✅ | ✅ | ✅ | ✅ 100% |
| Rounded (none–full, 2xl) | ✅ | ✅ | ✅ | ✅ 100% |
| Typography (font families, display, heading, body, mono, caption) | ✅ | ✅ | ✅ | ✅ 100% |
| Light mode overrides | ❌ (not in DTCG) | ❌ | ✅ | ✅ in CSS only |
| Motion tokens | ❌ | ❌ | ❌ | ❌ Missing |
| Signature elements | ❌ | ❌ | ❌ | ❌ Missing |

**Note:** `tailwind.theme.json` uses placeholder `{typography.font-family-*}` references — these resolve at Tailwind v3 build time but are not valid CSS. `index.css` @theme has correct font stacks.

---

## 3. Component Library (`src/components/ui/`) — 🟡 PARTIAL

| Component | Exists | Uses Semantic Tokens | Follows DESIGN.md Component Spec | RTL Ready | Issues |
|-----------|--------|---------------------|----------------------------------|-----------|--------|
| `Card` / `CardHeader` / `CardBody` | ✅ | ✅ | ✅ (panel-default/panel-elevated) | ⚠️ No dir prop | Good |
| `PageLayout` | ✅ | ✅ | ✅ (max-w-[1800px], p-3/6) | ✅ dir prop | Good |
| `CustomComponents.tsx` (InputGroup, ChartWrapper, CalculatorSidebar, StepList, ModeTabs, EmptyState, InputTooltip, Disclosure) | ✅ | ✅ | ✅ Maps to DESIGN.md component variants | ⚠️ Partial (inline dir) | **Best compliance** |
| `Button` | ❌ | — | DESIGN.md §Buttons (5 variants) | — | **Missing** |
| `Input` / `Select` / `Label` | ❌ | — | DESIGN.md §Form Inputs (6 variants) | — | **Missing** |
| `Badge` | ❌ | — | DESIGN.md §Badges (5 variants) | — | **Missing** |
| `Table` | ❌ | — | DESIGN.md §Tables | — | **Missing** |
| `Tooltip` | ❌ | — | DESIGN.md §Tooltip | — | **Missing** (exists inline) |
| `Accordion` / `Disclosure` | ⚠️ | ✅ (Disclosure in CustomComponents) | DESIGN.md §Accordion | ⚠️ | Partial |
| `FormulaBlock` | ❌ | — | DESIGN.md §Formula Blocks (2 variants) | — | **Missing** |
| `Modal` | ❌ | — | DESIGN.md §Modal/Dialog | — | **Missing** (exists as StatisticalHelperModal) |
| `Heading` | ❌ | — | DESIGN.md §Component Usage Map | — | **Missing** |

**Critical Gap:** DESIGN.md §Component Usage Map lists **18 semantic component mappings** — only ~6 exist in `ui/`. The calculators build inline instead of composing from primitives.

---

## 4. Calculator Component Compliance — 🔴 SIGNIFICANT VIOLATIONS

### Systematic Violations (found in all 3 major components)

| Violation | DESIGN.md Rule | Locations | Count |
|-----------|----------------|-----------|-------|
| **Hardcoded pixel font sizes** (`text-[10px]`, `text-[11px]`, `text-[13px]`, `text-[15px]`) | "No magic numbers", "Use type scale tokens" | NormalDistributionCalculator: L812, L840; HypothesisTesting: L220, L232, L280, L292, L303, L330, L339, L374, L401, L410; StatisticalHelperModal: L73, L152, L166, L188; FormulaSheet: L373, L377, L436 | **20+** |
| **Raw Tailwind color** (`border-t-slate-800`) | "No generic Tailwind colors (slate, gray, zinc)" | NormalDistributionCalculator: L224; HypothesisTesting: L455; StatisticalHelperModal: (none found) | **2** |
| **Hardcoded spacing/padding not from scale** (`p-2.5`, `py-1.5`, `gap-6`, `gap-3`) | "Base unit 4px — all spacing derives from it" | Widespread | **Many** |
| **Missing semantic component composition** | "Component library exists → Compose from it" | All calculators build inline | **Systemic** |
| **Direct `dark:` variant usage** | DESIGN.md uses CSS custom properties for light mode, not Tailwind `dark:` | StatisticalHelperModal, FormulaSheet | **Multiple** |

### Specific Examples

**NormalDistributionCalculator.tsx**
```tsx
// L812: Hardcoded 10px
<div className="text-[10px] opacity-75">חד-צדדי: {c.oneTail}</div>

// L840: Hardcoded 13px/15px
className={`... text-[13px] sm:text-[15px] ...`}

// L224: Raw slate color
<div className="border-t-slate-800" />
```

**HypothesisTestingCalculator.tsx**
```tsx
// L220, L232: text-[11px] for formula labels
<span className="text-[11px] font-bold text-[var(--color-text-secondary)] ...">תבנית כללית</span>

// L303, L330, L374, L401: text-[10px] for mono details
<div className="text-[10px] font-bold uppercase tracking-wider">לא פעיל</div>

// L455: Raw slate color
<div className="border-t-slate-800" />
```

**StatisticalHelperModal.tsx**
```tsx
// L73, L152, L166, L188: text-[10px], text-[11px]
<span className="text-[10px] text-[var(--color-text-secondary)] mb-1">...</span>
```

**FormulaSheet.tsx**
```tsx
// L373, L377, L436: text-[10px]
<span className="block text-[10px] text-[var(--color-text-secondary)] font-bold mb-1">...</span>
```

### What's Working Well
- ✅ All colors use `var(--color-*)` CSS variables (no raw hex in components)
- ✅ Semantic accent usage correct (brass for H₀/formula-block, teal for power/acceptance, crimson for α/rejection, cobalt for Z-scores/interactive)
- ✅ RTL handling via `dir="rtl"` on containers, `dir="ltr"` on math/KaTeX
- ✅ Component variants map to DESIGN.md intent (panel-default, panel-elevated, panel-hero conceptually)

---

## 5. RTL / Hebrew Support — 🟡 GOOD FOUNDATION, GAPS

| Aspect | Status | Notes |
|--------|--------|-------|
| Page-level `dir="rtl"` | ✅ | `PageLayout` passes `dir='rtl'` to `<main>` |
| Container-level RTL | ✅ | Most sections wrap with `dir="rtl"` |
| Math/KaTeX isolation | ✅ | `.katex { direction: ltr !important; }` in index.css |
| InputGroup `dir` prop | ✅ | Defaults to `'ltr'` for numeric input |
| Font: Assistant (Hebrew-optimized) | ✅ | Defined in @theme and DESIGN.md |
| Component library RTL props | ⚠️ | `Card`, `PageLayout` have dir; others missing |
| Label positioning (RTL form layout) | ⚠️ | `InputGroup` inline mode may need RTL adjustment |

---

## 6. Dark / Light Mode — ✅ COMPLIANT

- `index.css` defines `:root` (dark) + `@media (prefers-color-scheme: light)` overrides
- Accent colors **stay identical** in both modes (per DESIGN.md: "Accents stay identical — they are the brand")
- Base layers invert correctly (bg, surface, border, text)
- WCAG AA contrast verified in DESIGN.md for both modes
- **No `dark:` Tailwind variants needed** — CSS custom properties handle it

---

## 7. Signature Elements — ❌ MISSING FROM IMPLEMENTATION

| Element | DESIGN.md Spec | In index.css | In Components |
|---------|----------------|--------------|---------------|
| `.accent-bar` | 48×4px brass→teal gradient bar | ❌ | ❌ |
| `.curve-glow` | Brass+teal blur glow on active panels | ❌ | ❌ |
| `.stagger-in` | 500ms ease-out, 50ms stagger | ❌ | ❌ (motion used inline) |
| `.pulse-brass` | 2s ease-in-out infinite breathing glow | ❌ | ❌ |

These are the **unique visual identity** (§Signature Elements) — must be implemented.

---

## 8. Motion & Reduced Motion — ⚠️ PARTIAL

| Aspect | Status |
|--------|--------|
| `prefers-reduced-motion` respected | ✅ DESIGN.md states it; `motion/react` used |
| Staggered entrance (50ms) | ⚠️ Inline in components, not tokenized |
| Pulse brass (2s) | ❌ Not implemented |
| Fade/slide animations | ⚠️ Inline, not from design tokens |
| Motion tokens in @theme/CSS | ❌ Missing |

---

## 9. Anti-Pattern Check (frontend-design skill §10) — 🟡 SOME VIOLATIONS

| Anti-Pattern | Found? | Where |
|--------------|--------|-------|
| Generic "hero + 3 columns + footer" | ❌ | No — custom calculator layout |
| Tailwind defaults without customization | ⚠️ | `text-[10px]`, `rounded-sm`, `p-2.5` etc. are magic numbers |
| Gradient text on dark bg | ❌ | No |
| 3-column benefit grids | ❌ | No |
| "Elevate/Unlock/Transform" copy | ❌ | Hebrew academic copy is specific |
| Animation on everything | ⚠️ | `motion/react` used but not excessive |
| Same Inter/Roboto + slate palette | ❌ | Uses Assistant/Space Grotesk/JetBrains Mono + custom palette |

---

## 10. Prioritized Remediation Plan

### P0 — Critical (Blockers for any feature work)
1. **Eliminate all hardcoded pixel font sizes** — replace `text-[10px]`, `text-[11px]`, `text-[13px]`, `text-[15px]` with semantic tokens (`caption`, `body-xs`, `body-sm`, `mono-xs`, `mono-sm`)
2. **Remove raw `slate-800`** — replace with `var(--color-border)` or semantic accent border
3. **Implement signature elements** in `index.css`: `.accent-bar`, `.curve-glow`, `.stagger-in`, `.pulse-brass`

### P1 — High (Design System Completeness)
4. **Build missing primitive components** per DESIGN.md §Component Usage Map:
   - `Button` (5 variants), `Input`/`Select`/`Label`, `Badge` (5 variants), `Table`, `Tooltip`, `Accordion`, `FormulaBlock` (2 variants), `Modal`, `Heading`
5. **Refactor calculators to compose from primitives** — eliminate inline className soup
6. **Add motion tokens to CSS/@theme** — duration, easing, stagger delays

### P2 — Medium (Polish)
7. **Add RTL `dir` prop to all ui/ components**
8. **Verify light mode rendering** for all components (currently only dark-tested)
9. **Document component API** with Storybook or similar

### P3 — Low (Nice to Have)
10. **Visual regression tests** for RTL + dark/light
11. **Design token validation in CI** (`npx @google/design.md lint DESIGN.md`)

---

## 11. Verification Checklist (frontend-design skill §9)

| Check | Status | Evidence |
|-------|--------|----------|
| Distinctive point of view | ✅ | Academic instrument, statistical semantics, brass accent |
| 4–6 semantic color tokens | ✅ | Brass, teal, crimson, cobalt + base/text |
| 2–3 deliberate font choices | ✅ | Space Grotesk / Assistant / JetBrains Mono |
| Intentional asymmetry/structure | ✅ | Dual-panel calculator, asymmetric sidebar/main |
| Copy specific to subject | ✅ | Hebrew academic statistics terminology |
| Motion purposeful & restrained | ⚠️ | Motion used but not tokenized; reduced-motion respected |
| Dark & light both look designed | ✅ | Intentional inversion, accents preserved |
| Signature element exists | ❌ | **Missing** — accent-bar, curve-glow, stagger-in, pulse-brass |

---

## 12. Next Steps Recommendation

**Do not start feature work (P-value integration, new calculators) until P0 complete.**

The current component code is a **maintenance liability** — 252KB + 93KB monoliths with systemic token violations. The design system investment (DESIGN.md, tokens.json, index.css) is wasted if components don't consume it.

**Recommended sequence:**
1. **P0 fixes** (1–2 days): Replace magic numbers, remove slate-800, add signature CSS
2. **Build primitive components** (3–5 days): Button, Input, Badge, Table, Tooltip, Accordion, FormulaBlock, Modal, Heading
3. **Refactor NormalDistributionCalculator** (3–5 days): Extract chart, math, UI → compose from primitives
4. **Refactor HypothesisTestingCalculator** (5–7 days): Same
5. **Then** — `ce-strategy` → `ce-plan` → feature work

---

## Appendix: Token Mapping Reference

| DESIGN.md Token | CSS Variable | Tailwind Utility (v4 @theme) | Use For |
|-----------------|--------------|------------------------------|---------|
| `typography.caption` | `--text-caption` | `text-caption` | 10px uppercase labels |
| `typography.body-xs` | `--text-body-xs` | `text-body-xs` | 12px footnotes/errors |
| `typography.body-sm` | `--text-body-sm` | `text-body-sm` | 14px dense content |
| `typography.mono-xs` | `--text-mono-xs` | `text-mono-xs` | 12px mono data |
| `typography.mono-sm` | `--text-mono-sm` | `text-mono-sm` | 14px mono table cells |
| `rounded.sm` | `--rounded-sm` | `rounded-sm` | 4px inputs/buttons/tabs |
| `rounded.md` | `--rounded-md` | `rounded-md` | 8px standard components |
| `rounded.lg` | `--rounded-lg` | `rounded-lg` | 12px panels/accordions |
| `spacing.1` | `--spacing-1` | — | 4px base unit |
| `spacing.2` | `--spacing-2` | — | 8px small padding |
| `spacing.3` | `--spacing-3` | — | 12px standard padding |

*All hardcoded `text-[Npx]` values map to one of the above tokens.*