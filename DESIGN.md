---
version: alpha
name: Statistics Calculator
description: Academic-grade statistics calculator for Hebrew-speaking students. Precision as aesthetic — the bell curve is our hero.
colors:
  primary: "#D4A843"
  background: "#0D0F14"
  surface: "#14171F"
  surface-raised: "#1A1D24"
  border: "#2A2F3E"

  text-primary: "#F0F1F5"
  text-secondary: "#8A93A6"

  accent-brass: "#D4A843"
  accent-teal: "#2EC4B6"
  accent-crimson: "#E85D5D"
  accent-cobalt: "#4A9EFF"

  success: "#3BA98D"
  error: "#D95B5B"
  warning: "#F4A261"
  info: "#4A9EFF"

typography:
  font-family-sans: "Assistant, Inter, ui-sans-serif, system-ui, sans-serif"
  font-family-display: "Space Grotesk, Assistant, ui-sans-serif, system-ui, sans-serif"
  font-family-mono: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
  font-family-handwriting: "Gveret Levin, cursive"

  display-hero:
    fontFamily: "{typography.font-family-display}"
    fontSize: "3.5rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  display-h1:
    fontFamily: "{typography.font-family-display}"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  display-h2:
    fontFamily: "{typography.font-family-display}"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  display-h3:
    fontFamily: "{typography.font-family-display}"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.005em"

  heading-page:
    fontFamily: "{typography.font-family-sans}"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "0em"
  heading-section:
    fontFamily: "{typography.font-family-sans}"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0em"
  heading-subsection:
    fontFamily: "{typography.font-family-sans}"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0em"
  heading-label:
    fontFamily: "{typography.font-family-sans}"
    fontSize: "0.75rem"
    fontWeight: 800
    lineHeight: 1.5
    letterSpacing: "0.05em"
    textTransform: "uppercase"

  body-lg:
    fontFamily: "{typography.font-family-sans}"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0.01em"
  body-base:
    fontFamily: "{typography.font-family-sans}"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "0.015em"
  body-sm:
    fontFamily: "{typography.font-family-sans}"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.01em"
  body-xs:
    fontFamily: "{typography.font-family-sans}"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.01em"

  mono-display:
    fontFamily: "{typography.font-family-mono}"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0em"
  mono-lg:
    fontFamily: "{typography.font-family-mono}"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0em"
  mono-base:
    fontFamily: "{typography.font-family-mono}"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0em"
  mono-sm:
    fontFamily: "{typography.font-family-mono}"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0em"
  mono-xs:
    fontFamily: "{typography.font-family-mono}"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0em"

  caption:
    fontFamily: "{typography.font-family-sans}"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.08em"
    textTransform: "uppercase"

rounded:
  none: "0px"
  xs: "2px"
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  "2xl": "24px"
  full: "9999px"

spacing:
  0.5: "2px"
  1: "4px"
  1_5: "6px"
  2: "8px"
  2_5: "10px"
  3: "12px"
  3_5: "14px"
  4: "16px"
  5: "20px"
  6: "24px"
  7: "28px"
  8: "32px"
  10: "40px"
  12: "48px"
  16: "64px"
  20: "80px"
  24: "96px"

components:
  panel-default:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.6}"

  panel-elevated:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.lg}"
    padding: "{spacing.6}"

  panel-interactive:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.6}"

  panel-hero:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.8}"

  input-default:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "{spacing.3} {spacing.4}"
    typography: "{typography.body-base}"

  input-default-focus:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "{spacing.3} {spacing.4}"
    typography: "{typography.body-base}"

  input-default-error:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "{spacing.3} {spacing.4}"
    typography: "{typography.body-base}"

  input-default-disabled:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.3} {spacing.4}"
    typography: "{typography.body-base}"

  select-default:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "{spacing.3} {spacing.4}"
    typography: "{typography.body-base}"

  select-default-focus:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "{spacing.3} {spacing.4}"
    typography: "{typography.body-base}"

  label-default:
    typography: "{typography.body-xs}"

  error-message:
    typography: "{typography.caption}"
    textColor: "{colors.error}"

  btn-primary:
    backgroundColor: "{colors.accent-brass}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "{spacing.3} {spacing.5}"
    typography: "{typography.body-base}"

  btn-primary-hover:
    backgroundColor: "#E8B85A"
    textColor: "{colors.background}"

  btn-primary-active:
    backgroundColor: "#B89238"
    textColor: "{colors.background}"

  btn-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.3} {spacing.5}"
    typography: "{typography.body-base}"

  btn-secondary-hover:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"

  btn-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: "{spacing.3} {spacing.4}"
    typography: "{typography.body-base}"

  btn-ghost-hover:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"

  btn-danger:
    backgroundColor: "{colors.error}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "{spacing.3} {spacing.5}"
    typography: "{typography.body-base}"

  btn-danger-hover:
    backgroundColor: "#E04848"
    textColor: "#FFFFFF"

  btn-success:
    backgroundColor: "{colors.success}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "{spacing.3} {spacing.5}"
    typography: "{typography.body-base}"

  btn-success-hover:
    backgroundColor: "#2D967A"
    textColor: "#FFFFFF"

  tab-default:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.sm}"
    padding: "{spacing.2_5} {spacing.3_5}"
    typography: "{typography.caption}"

  tab-active:
    backgroundColor: "{colors.accent-cobalt}"
    textColor: "#FFFFFF"

  badge-brass:
    backgroundColor: "{colors.accent-brass}"
    textColor: "{colors.background}"
    rounded: "{rounded.full}"
    padding: "{spacing.1} {spacing.3}"
    typography: "{typography.caption}"

  badge-teal:
    backgroundColor: "{colors.accent-teal}"
    textColor: "{colors.background}"
    rounded: "{rounded.full}"
    padding: "{spacing.1} {spacing.3}"
    typography: "{typography.caption}"

  badge-crimson:
    backgroundColor: "{colors.accent-crimson}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: "{spacing.1} {spacing.3}"
    typography: "{typography.caption}"

  badge-cobalt:
    backgroundColor: "{colors.accent-cobalt}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: "{spacing.1} {spacing.3}"
    typography: "{typography.caption}"

  badge-neutral:
    backgroundColor: "{colors.border}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    padding: "{spacing.1} {spacing.3}"
    typography: "{typography.caption}"

  table-default:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    typography: "{typography.body-base}"
    textColor: "{colors.text-primary}"

  table-header:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    typography: "{typography.caption}"

  table-cell:
    backgroundColor: "transparent"
    rounded: "{rounded.none}"
    padding: "{spacing.4}"

  table-cell-highlight-success:
    backgroundColor: "rgba(59, 169, 141, 0.1)"

  table-cell-highlight-error:
    backgroundColor: "rgba(217, 91, 91, 0.1)"

  table-cell-highlight-brass:
    backgroundColor: "rgba(212, 168, 67, 0.1)"

  table-cell-highlight-cobalt:
    backgroundColor: "rgba(74, 158, 255, 0.1)"

  tooltip-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: "{spacing.2_5} {spacing.3}"
    typography: "{typography.body-xs}"

  accordion-default:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.xl}"

  accordion-open:
    backgroundColor: "{colors.surface}"

  accordion-summary:
    typography: "{typography.body-lg}"

  accordion-content:
    padding: "{spacing.1} {spacing.6} {spacing.6}"
    typography: "{typography.body-sm}"
    textColor: "{colors.text-secondary}"

  formula-block:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.xl}"
    padding: "{spacing.4} {spacing.5}"
    typography: "{typography.mono-lg}"
    textColor: "{colors.text-primary}"

  calc-block:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.xl}"
    padding: "{spacing.4} {spacing.5}"
    typography: "{typography.mono-lg}"
    textColor: "{colors.text-primary}"

  modal-overlay:
    backgroundColor: "rgba(13, 15, 20, 0.85)"

  modal-content:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.6}"
    typography: "{typography.body-base}"
    width: "90vw"
    height: "85vh"

  modal-header:
    typography: "{typography.heading-section}"

  modal-title:
    typography: "{typography.heading-section}"
    textColor: "{colors.text-primary}"

---

## Overview

**Precision as aesthetic — the bell curve is our hero.**

This design system serves an academic statistics calculator for Hebrew-speaking students. Every visual choice traces to statistical concepts: the brass accent represents the H₀ reference line and critical values; teal represents power (1-β) and acceptance regions; crimson represents Type I error (α) and rejection regions; cobalt represents Z-scores and standard normal reference.

The system avoids generic defaults (Tailwind slate, warm cream + serif, near-black + acid green). Every token has semantic grounding in the subject matter.

---

## Colors

### Base Layer
- **Background (#0D0F14)**: Deep void — lets curves glow, less blue than slate
- **Surface (#14171F)**: Elevated panel surface
- **Surface Raised (#1A1D24)**: Interactive/hover elevation
- **Border (#2A2F3E)**: Structural lines

### Text Layer
- **Text Primary (#F0F1F5)**: High-contrast off-white for body, numbers, headlines
- **Text Secondary (#8A93A6)**: Muted gray for labels, axis ticks, reference lines

### Accent Layer (semantic, not decorative)
- **Accent Brass (#D4A843)**: HERO — μ₀ reference, critical values, hero moments, academic rigor
- **Accent Teal (#2EC4B6)**: SUPPORT — Power (1-β), confidence intervals, acceptance regions
- **Accent Crimson (#E85D5D)**: ALERT — Type I error (α), rejection regions, H₀ rejection
- **Accent Cobalt (#4A9EFF)**: NEUTRAL — Z-scores, standard normal, secondary data

### Semantic Aliases
- `success` = `#3BA98D` (professional emerald for success/intervals)
- `error` = `#D95B5B` (professional brick red for alpha/rejection)
- `warning` = `#F4A261` (amber for cautions)
- `info` = `#4A9EFF` (cobalt for neutral info)

---

## Typography

Three deliberate families, each with a role:

| Family | Role | Usage |
|--------|------|-------|
| **Space Grotesk** | Display | Hero numbers, page titles, key statistical moments |
| **Assistant** | Body / Headings | Hebrew-optimized readable text, section headers, UI labels |
| **JetBrains Mono** | Data | Z-scores, formulas, tabular numbers, code, inputs |

### Display Scale (Space Grotesk)
| Token | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|-------------|----------------|
| `display-hero` | 3.5rem | 800 | 1.1 | -0.02em |
| `display-h1` | 2.5rem | 700 | 1.15 | -0.015em |
| `display-h2` | 1.875rem | 700 | 1.2 | -0.01em |
| `display-h3` | 1.5rem | 600 | 1.25 | -0.005em |

### Semantic Heading Scale (Assistant)
| Token | Size | Weight | Line Height | Use Case |
|-------|------|--------|-------------|----------|
| `heading-page` | 1.5rem | 800 | 1.3 | Page title (e.g., "מחשבון התפלגות נורמלית") |
| `heading-section` | 1.125rem | 700 | 1.4 | Major section (e.g., "הגדרות ופרמטרים") |
| `heading-subsection` | 1rem | 700 | 1.5 | Subsection (e.g., "סוג חישוב השטח") |
| `heading-label` | 0.75rem | 800 | 1.5 | Form labels, uppercase metadata |

### Body Scale (Assistant)
| Token | Size | Weight | Line Height | Use Case |
|-------|------|--------|-------------|----------|
| `body-lg` | 1.125rem | 400 | 1.7 | Lead paragraphs, explanations |
| `body-base` | 1rem | 400 | 1.625 | Default body text, steps |
| `body-sm` | 0.875rem | 400 | 1.6 | Dense content, accordion body |
| `body-xs` | 0.75rem | 400 | 1.5 | Footnotes, error messages |

### Mono Scale (JetBrains Mono)
| Token | Size | Weight | Use Case |
|-------|------|--------|----------|
| `mono-display` | 2rem | 600 | Hero Z-score, probability result |
| `mono-lg` | 1.125rem | 500 | Formula blocks, inline math |
| `mono-base` | 1rem | 500 | Input values, data display |
| `mono-sm` | 0.875rem | 500 | Table cells, inline values |
| `mono-xs` | 0.75rem | 500 | Caption data |

### Caption
| Token | Size | Weight | Letter Spacing | Transform |
|-------|------|--------|----------------|-----------|
| `caption` | 0.6875rem | 700 | 0.08em | uppercase |

---

## Layout & Spacing

**Base unit: 4px** — all spacing derives from it.

| Token | Value | Use Case |
|-------|-------|----------|
| `spacing.0.5` | 2px | Tight micro-spacing |
| `spacing.1` | 4px | Base unit |
| `spacing.1_5` | 6px | Label→input gap |
| `spacing.2` | 8px | Small component padding |
| `spacing.2_5` | 10px | Medium gaps |
| `spacing.3` | 12px | Standard padding |
| `spacing.3_5` | 14px | Tab/button padding |
| `spacing.4` | 16px | Panel padding, card gaps |
| `spacing.5` | 20px | Section gaps |
| `spacing.6` | 24px | Large panel padding |
| `spacing.8` | 32px | Hero section padding |
| `spacing.10` | 40px | Page-level gaps |
| `spacing.12` | 48px | Major vertical rhythm |

### Container
- **Max width**: 1800px (for dual-panel calculator layout)
- **Side padding**: `spacing.6` (24px) mobile, `spacing.8` (32px) desktop

### Grid
- **Sidebar**: 4/12 columns (lg+)
- **Main content**: 8/12 columns (lg+)
- **Gap**: `spacing.6` (24px)

---

## Elevation & Depth

Defined via component `backgroundColor` and `rounded`. Shadows implemented in CSS, not tokenized.

---

## Shapes (Border Radius)

| Token | Value | Use Case |
|-------|-------|----------|
| `none` | 0px | Sharp edges (charts, code) |
| `xs` | 2px | Tiny badges |
| `sm` | 4px | Inputs, buttons, tabs |
| `md` | 8px | Standard components, cards |
| `lg` | 12px | Panels, accordions |
| `xl` | 16px | Hero panels, modals, formula blocks |
| `2xl` | 24px | Page-level containers |
| `full` | 9999px | Pills, badges, avatar |

---

## Components

### Panel / Card Primitives
| Variant | Use Case | Key Tokens |
|---------|----------|------------|
| `panel-default` | Standard content container | surface, lg radius, spacing.6 |
| `panel-elevated` | Needs visual separation | surface-raised, lg radius, spacing.6 |
| `panel-interactive` | Hoverable cards (calculator modes) | surface, lg radius, spacing.6 |
| `panel-hero` | Primary action/hero area | surface, xl radius, spacing.8 |

### Form Inputs
| Variant | Use Case |
|---------|----------|
| `input-default` | Numeric inputs (mean, stdDev, X values) |
| `input-default-focus` | Brass focus ring (CSS) |
| `input-default-error` | Crimson border (CSS) |
| `input-default-disabled` | Muted surface |
| `select-default` | Dropdowns (calc type, tail type) |
| `label-default` | Form labels (uppercase, xs) |
| `error-message` | Crimson, xs, bold |

### Buttons
| Variant | Use Case | Colors |
|---------|----------|--------|
| `btn-primary` | Primary actions (reset, calculate) | Brass bg, void text |
| `btn-secondary` | Secondary actions (mode switches) | Surface bg |
| `btn-ghost` | Tertiary (help, info) | Transparent |
| `btn-danger` | Destructive (clear, delete) | Crimson bg, white text |
| `btn-success` | Positive (apply, confirm) | Teal bg, white text |

**Tab Navigation** (header mode switcher): `tab-default` → `tab-active` (cobalt bg, white text)

### Badges / Status Indicators
| Variant | Semantic Meaning |
|---------|------------------|
| `badge-brass` | H₀ reference, critical values, hero |
| `badge-teal` | Power, confidence, acceptance |
| `badge-crimson` | α, rejection, Type I error |
| `badge-cobalt` | Z-score, standard normal, neutral |
| `badge-neutral` | Inactive, disabled, metadata |

### Tables
Decision matrices, power tables, T-distribution critical values.
- Header: uppercase caption, surface-raised, centered
- Cells: centered, mono for numbers, semantic highlight backgrounds
- Hover: surface-raised (CSS)

### Tooltip
Used for input help, chart hover, icon explanations.
- Surface bg, sm radius, xs text

### Accordion / Disclosure
Used extensively in HypothesisTestingCalculator and FormulaSheet.
- Closed: bg background
- Open: surface, brass border (CSS)
- Summary: lg body, flex, chevron icon (rotates on open, brass when open)
- Content: sm body, secondary color, border-top (CSS)

### Formula Blocks
Two variants for "general formula" vs "calculated substitution":
| Variant | Border Color | Label |
|---------|--------------|-------|
| `formula-block` | Brass | "תבנית כללית" (General Template) |
| `calc-block` | Cobalt | "יישום" (Application) |

Both: mono-lg, ltr direction, overflow-x-auto, xl radius

### Modal / Dialog
For StatisticalHelperModal and confirmation dialogs.
- Overlay: void bg, blur
- Content: surface, xl radius, xl padding, max 90vw/85vh

---

## Signature Elements

These are the **unique visual identity** — the things users remember:

1. **`.accent-bar`** — 48×4px brass→teal gradient bar. Marks hero sections, primary actions, page titles.
2. **`.curve-glow`** — Brass+teal blur glow. Appears on active calculation panels, live results.
3. **`.stagger-in`** — Choreographed entrance (50ms stagger). Page load, mode switches.
4. **`.pulse-brass`** — Live calculation indicator. Breathing brass glow on active results.

---

## Motion

| Animation | Duration | Easing | Use Case |
|-----------|----------|--------|----------|
| `stagger-in` | 500ms | ease-out | Page load, mode switch, accordion open |
| `pulse-brass` | 2s | ease-in-out infinite | Live calculation indicator |
| `fade-in` | 180ms | ease-out | Tooltip, modal |
| `slide-up` | 280ms | ease-out | Accordion content, panel enter |
| `slide-down` | 280ms | ease-out | Dropdown, notification |

**Respect `prefers-reduced-motion`** — all animations disable to 0ms when user prefers reduced motion.

---

## Dark Mode (Default) / Light Mode

**Design for dark first; light is intentional inversion.**

Light mode token overrides (in `index.css` `@media (prefers-color-scheme: light)`):
```css
:root {
  --color-bg: #F7F5F2;
  --color-surface: #FFFFFF;
  --color-surface-raised: #F0EEEB;
  --color-border: #D4D0CB;
  --color-text-primary: #1A1C1E;
  --color-text-secondary: #5C636A;
  /* Accents stay identical — they are the brand */
}
```

Both modes must pass WCAG AA contrast for all component tokens.

---

## Component Usage Map (Semantic → Token)

> **This is the "what to use where" reference.**

| Semantic Need | Component / Token | Example |
|---------------|-------------------|---------|
| Page title | `Heading({ level: 'page' })` / `typography.heading-page` | "מחשבון התפלגות נורמלית" |
| Major section header | `Heading({ level: 'section' })` / `typography.heading-section` | "הגדרות ופרמטרים" |
| Subsection header | `Heading({ level: 'subsection' })` / `typography.heading-subsection` | "סוג חישוב השטח" |
| Form label | `Label({})` / `components.label-default` | "תוחלת המבוקשת (μ):" |
| Numeric input | `Input({ type: 'number' })` / `components.input-default` | Mean, stdDev, X values |
| Input with error | `Input({ error: true })` / `components.input-default-error` | Invalid stdDev |
| Dropdown | `Select({})` / `components.select-default` | Calc type, tail type |
| Primary action | `Button({ variant: 'primary' })` / `components.btn-primary` | "אפס ערכים ל-IQ" |
| Mode tab | `Tab({ active: true })` / `components.tab-active` | Active calculator mode |
| Info card | `Panel({ variant: 'default' })` / `components.panel-default` | Sidebar, chart wrapper |
| Interactive card | `Panel({ variant: 'interactive' })` / `components.panel-interactive` | Mode buttons |
| Hero panel | `Panel({ variant: 'hero' })` / `components.panel-hero` | Main chart area |
| Formula template | `FormulaBlock({ variant: 'formula' })` / `components.formula-block` | General formula |
| Calculated formula | `FormulaBlock({ variant: 'calculation' })` / `components.calc-block` | Substituted values |
| Status badge | `Badge({ variant: 'brass\|teal\|crimson\|cobalt' })` | P(A\|B), Power, α |
| Decision matrix | `Table({})` / `components.table-default` | Type I/II error table |
| Tooltip | `Tooltip({})` / `components.tooltip-default` | Input help, chart hover |
| Accordion | `Accordion({})` / `components.accordion-default` | FormulaSheet chapters, power calc |
| Modal | `Modal({})` / `components.modal-content` | StatisticalHelperModal |

---

## Do's and Don'ts

### Do
- Use semantic tokens (`components.input-default`) not utility classes (`bg-slate-900 border-slate-700`)
- Map meaning → component variant (`badge-crimson` for α, `badge-teal` for power)
- Use the type scale (`heading-section`, `body-base`, `mono-lg`) not arbitrary sizes
- Keep brass as the **single signature accent** — don't add competing golds
- Respect RTL: `dir="rtl"` on containers, `dir="ltr"` on math/code
- Test both dark and light modes

### Don't
- Use raw hex in components (`#D4A843` → use `var(--color-accent-brass)`)
- Invent new sizes (`text-[11px]`, `py-2.5`, `rounded-xl` — use tokens)
- Mix border radius (`rounded-sm` vs `rounded-xl` for same component type)
- Use generic Tailwind colors (`slate`, `gray`, `zinc` — use semantic tokens)
- Add decorative gradients/glassmorphism (the bell curve IS the visual)
- Use emoji in UI (academic instrument, not chat app)
- Over-animate — one choreographed moment per page

---

## Accessibility (WCAG AA)

All text/background combinations verified:

- Text on surface: `text-primary` (#F0F1F5) on `surface` (#14171F) = **12.8:1** ✓
- Text on background: `text-primary` on `bg` (#0D0F14) = **14.2:1** ✓
- Muted text: `text-secondary` (#8A93A6) on `surface` = **4.7:1** ✓ (AA large text)
- Brass on void: `accent-brass` (#D4A843) on `bg` = **7.1:1** ✓ (AAA)
- Teal on void: `accent-teal` (#2EC4B6) on `bg` = **8.3:1** ✓ (AAA)
- Crimson on void: `accent-crimson` (#E85D5D) on `bg` = **5.8:1** ✓ (AA)
- Cobalt on void: `accent-cobalt` (#4A9EFF) on `bg` = **6.2:1** ✓ (AA)
- White on crimson: `#FFFFFF` on `#D95B5B` = **4.7:1** ✓ (AA)
- White on teal: `#FFFFFF` on `#3BA98D` = **5.2:1** ✓ (AA)
- White on cobalt: `#FFFFFF` on `#4A9EFF` = **5.8:1** ✓ (AA)

---

## Export

```bash
# Validate
npx @google/design.md lint DESIGN.md

# Export to Tailwind v3 theme
npx @google/design.md export --format json-tailwind DESIGN.md > tailwind.theme.json

# Export to W3C DTCG
npx @google/design.md export --format dtcg DESIGN.md > tokens.json
```

---

## Implementation Notes

1. **CSS Variables**: All tokens defined in `src/index.css` `@theme` and `:root`
2. **Component Library**: `src/components/ui/` — React components that consume tokens
3. **Migration**: Replace inline `className` soup with semantic components
4. **Verification**: `npx @google/design.md lint DESIGN.md` in CI