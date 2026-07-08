---
version: 1.0
name: Statisti-Kal
description: Academic-grade statistics calculator for Hebrew-speaking students. Dark brass-and-teal aesthetic driven by clarity and component reuse.
---

# DESIGN.md

This document defines the **Precision Brass** design system and the **Global Templating Architecture** that powers Statisti-Kal. 

> [!IMPORTANT]
> **Strict Adherence Rule**: All UI must be constructed using the templates defined in `web/src/components/ui`. Use the `Heading` / `SectionHeader` components for page/section titles, not raw `<h1>`/`<h2>` tags. No inline hex colors — always reference tokens via `var(--color-*)`.

## 1. Visual Language & Tokens

The application uses a dark, high-contrast base palette with academic brass and teal accents. The source of truth for all token values is `web/src/index.css`.

### Base Layer
- **Background**: `--color-background` (`#000000`) — Pure black, the core void.
- **Surface**: `--color-surface` (`#121212`) — Elevated panels and cards.
- **Surface Raised**: `--color-surface-raised` (`#1E1E1E`) — Interactive hover states, tooltips.
- **Border**: `--color-border` (`#333333`) — Structural containment lines.

### Text Layer
- **Primary**: `--color-text-primary` (`#FFFFFF`) — Headings, math, primary content.
- **Secondary**: `--color-text-secondary` (`#A1A1AA`) — Muted descriptions, captions, labels.

### Accent Layer
- **Primary / Brand**: `--color-primary` (`#FFFFFF`) — Generic primary actions, emphasis.
- **Brass (H₀)**: `--color-accent-brass` (`#D4A843`) — Null hypothesis, critical values, primary reference.
- **Teal (H₁)**: `--color-accent-teal` (`#4ECDC4`) — Alternative hypothesis, power (1-β), acceptance regions.
- **Crimson**: `--color-accent-crimson` (`#E03E3E`) — Type I error (α), rejection regions, destructive actions.
- **Cobalt**: `--color-accent-cobalt` (`#D4A843`) — Mapped to brass; used for active/selected states and Z-scores.

### Accent Variants
- `--color-accent-cobalt-bg`: `rgba(212, 168, 67, 0.1)` — Light brass background.
- `--color-accent-cobalt-bg-hover`: `rgba(212, 168, 67, 0.2)` — Hover state.
- `--color-accent-cobalt-line`: `rgba(212, 168, 67, 0.4)` — Subtle borders.
- `--color-accent-cobalt-strong`: `#B88B2D` — Bold brass for primary buttons.
- `--color-accent-cobalt-dark`: `#966F1C` — Pressed state.

### Semantic Aliases
- `--color-success`: `#4ECDC4` (teal)
- `--color-error`: `#E03E3E` (crimson)
- `--color-warning`: `#D4A843` (brass)
- `--color-info`: `#C5C6C7`

### Chart Palette
- `--chart-1`: `#D4A843` — Brass (H₀ reference curve)
- `--chart-2`: `#4ECDC4` — Teal (H₁ reference curve)
- `--chart-3`: `#FFFFFF` — White
- `--chart-4`: `#4ECDC4` — Teal
- `--chart-5`: `#E03E3E` — Crimson
- `--chart-grid`: `#333333` — Grid lines, matches border
- `--chart-axis-label`: `#A1A1AA` — Axis ticks
- `--chart-rejection`: `rgba(224, 62, 62, 0.25)` — Type I error shaded region
- `--chart-acceptance`: `rgba(78, 205, 196, 0.25)` — Power (1-β) shaded region

## 2. Typography

### Font Families
- **Sans (RTL Body)**: `Assistant`, `Inter`, system-ui — Primary Hebrew text.
- **Sans (Display)**: `Inter`, system-ui — English headings and landing-page hero text.
- **Serif**: `Source Serif 4`, serif — Decorative elements (quote marks, Latin annotations).
- **Mono**: `Geist Mono`, monospace — Statistical values, Z-scores, parameter inputs.
- **Handwriting**: `Gveret Levin`, `Assistant`, cursive — Handwritten notes and annotations (`HandwrittenNote` component).

### Type Scale
All type sizes are defined as CSS custom properties in `@theme` and consumed via utility classes like `text-heading-page`, `text-body-base`, `text-mono-lg`.

| Category | Token | Size | Weight | Use |
|----------|-------|------|--------|-----|
| Display | `--text-display-hero` | 3.5rem | 800 | Landing page hero only |
| Display | `--text-display-h1` | 2.5rem | 700 | Major landing sections |
| Display | `--text-display-h2` | 1.875rem | 700 | Landing sub-sections |
| Display | `--text-display-h3` | 1.5rem | 600 | Landing feature cards |
| Heading | `--text-heading-page` | 1.5rem | 800 | Calculator page titles |
| Heading | `--text-heading-section` | 1.125rem | 700 | Section headers within calculators |
| Heading | `--text-heading-subsection` | 1rem | 700 | Sub-section labels |
| Heading | `--text-heading-label` | 0.75rem | 800 | Uppercase labels, badges |
| Body | `--text-body-lg` | 1.125rem | 400 | Lead paragraphs |
| Body | `--text-body-base` | 1rem | 400 | Standard body text |
| Body | `--text-body-sm` | 0.875rem | 400 | Small body, descriptions |
| Body | `--text-body-xs` | 0.75rem | 400 | Fine print, footnotes |
| Mono | `--text-mono-display` | 2rem | 600 | Large statistical results |
| Mono | `--text-mono-lg` | 1.125rem | 500 | Key numeric values |
| Mono | `--text-mono-base` | 1rem | 500 | Standard math/numbers |
| Mono | `--text-mono-sm` | 0.875rem | 500 | Small numeric labels |
| Mono | `--text-mono-xs` | 0.75rem | 500 | Table cell values |
| Caption | `--text-caption` | 0.6875rem | 700 | Chart labels, tiny UI text |

### Hierarchy Rules
- **Page Titles**: `Heading` component with `level="page"` and `withAccentBar` (brass→teal gradient bar).
- **Section Headers**: `Heading` component with `level="section"` or use the `SectionHeader` composite for title + description.
- **Statistical Values / Math**: Rendered via KaTeX or `Geist Mono` (`font-mono`).

## 3. Global Templates (The Architecture)

To prevent visual drift, **ALL calculators** must construct their interfaces using these global wrappers from `web/src/components/ui`.

### `Heading` / `SectionHeader`
- **File**: `ui/Heading.tsx`
- **Purpose**: Standardized page and section titles with optional brass→teal accent bar.
- **Levels**: `page`, `section`, `subsection`, `label` — each mapped to the heading type scale.
- **Accents**: `brass`, `teal`, `crimson`, `cobalt`, `none`.
- **Usage**: Replace all raw `<h1>`/`<h2>`/`<h3>` tags in calculator pages with `Heading` or `SectionHeader`.

### `Card` / `CardHeader` / `CardBody`
- **File**: `ui/Card.tsx`
- **Purpose**: Semantic card with surface background, border, and rounded corners.
- **Variants**: `default` (surface bg), `raised` (surface-raised bg), `transparent`.

### `ChartWrapper`
- **File**: `ui/CustomComponents.tsx`
- **Purpose**: Encapsulates Recharts graphics with title bar, legend, and empty state.
- **Style**: `--color-surface` background, `--color-border` outline, configurable height.

### `ChartPrimitives`
- **File**: `charts/ChartPrimitives.tsx`
- **Purpose**: Standardized X/Y axis ticks, mean indicators, and tooltip templates for Recharts.
- **Rule**: Charts must use `--chart-1` through `--chart-5` and dashed reference lines for mean markers.

### `InputGroup`
- **File**: `ui/CustomComponents.tsx`
- **Purpose**: Label + input + error + optional tooltip in one block. Replaces ad-hoc labeled inputs.
- **Features**: Inline layout mode, size variants (`sm`/`md`/`lg`), RTL-aware label, required indicator.

### `StepList`
- **File**: `ui/CustomComponents.tsx`
- **Purpose**: Numbered step workflow with title, content, and accent-colored step badges.
- **Accents**: `cobalt`, `brass`, `teal`, `crimson`.

### `ModeTabs`
- **File**: `ui/CustomComponents.tsx`
- **Purpose**: Tab button group for mode switching (vertical sidebar or horizontal bar).
- **Usage**: Test-type selectors, distribution mode pickers.

### `CalculatorSidebar`
- **File**: `ui/CustomComponents.tsx`
- **Purpose**: Panel wrapper for sidebar parameter controls.
- **Variants**: `panel` (surface bg), `card` (raised bg). Optional sticky positioning.

### `Disclosure`
- **File**: `ui/CustomComponents.tsx`
- **Purpose**: Expandable section with chevron toggle, animated open/close, optional watermark.
- **Usage**: Hypothesis testing steps, formula derivations, collapsible result panels.

### `EmptyState`
- **File**: `ui/CustomComponents.tsx`
- **Purpose**: Centered placeholder for empty/uninitialized views.
- **Tones**: `neutral`, `warning`, `error`, `info`, `muted`.

### Other Primitives
- **`Button`** (`ui/Button.tsx`): `primary`, `secondary`, `ghost`, `danger`, `success` variants. Includes `SegmentedButton` for toggle groups.
- **`Badge`** (`ui/Badge.tsx`): `brass`, `teal`, `crimson`, `cobalt`, `neutral` variants. Includes `StatusBadge` and `BadgeGroup`.
- **`Accordion`** (`ui/Accordion.tsx`): Multi-item expandable with `default`, `bordered`, `card` variants.
- **`FormulaBlock`** (`ui/FormulaBlock.tsx`): `formula` and `calculation` variants for KaTeX display. Includes `CalcBlock`, `ReadingFormulaBlock`, `ReadingCalcBlock`, `AlertBlock`, and `InsightBlock` composites.
- **`ResultBlock`** (`ui/ResultBlock.tsx`): Conclusion panel with Award icon, success/error color states.
- **`HandwrittenNote`** (`ui/HandwrittenNote.tsx`): Gveret Levin font annotation with pencil icon.
- **`Tooltip`** (`ui/Tooltip.tsx`): Standard, chart, and input-help tooltip variants.
- **`Input`** (`ui/Input.tsx`): Standalone input with label, error, and tooltip support.
- **`Modal`** (`ui/Modal.tsx`): Overlay modal with portal rendering.
- **`Table`** (`ui/Table.tsx`): Data table with sorting and selection support.
- **`PageLayout`** (`ui/PageLayout.tsx`): Sticky header, main content area, footer, TOC, scroll-to-top.
- **`CyberneticBackground`** (`ui/CyberneticBackground.tsx`): Floating math-chip drift animation background.

## 4. Signature Elements

Unique visual identity markers defined in `index.css`:

- **`.accent-bar`**: 48×4px brass→teal gradient bar. Marks hero sections, page titles.
- **`.curve-glow`**: Gold+teal blur glow on active calculation panels.
- **`.stagger-in`**: Choreographed entrance animation with 50ms stagger delays (8 children).
- **`.pulse-brass`**: Breathing brass glow for live calculation indicators.
- **`.pulse-success`** / **`.pulse-error`**: Breathing glows for conclusion panels (green/red).
- **`.toc-target-flash`**: Yellow+teal glow flash when navigating to a TOC target.
- **`.chart-legend-dashed-line`**: Animated dashed reference line for chart legends.
- **`.math-chip-drift`**: Floating math formula background animation.
- **`.font-handwriting`**: Gveret Levin handwriting font utility.

All signature animations respect `prefers-reduced-motion: reduce`.

## 5. Motion Tokens

CSS custom properties for consistent animation timing:

- `--motion-duration-fast`: `150ms`
- `--motion-duration-normal`: `280ms`
- `--motion-duration-slow`: `500ms`
- `--motion-duration-choreographed`: `1000ms`
- `--motion-easing-standard`: `cubic-bezier(0.4, 0, 0.2, 1)`
- `--motion-easing-entrance`: `cubic-bezier(0.16, 1, 0.3, 1)`
- `--motion-easing-exit`: `cubic-bezier(0.4, 0, 1, 1)`
- `--motion-stagger-delay`: `50ms`

Animations are implemented via Framer Motion (`motion` package). Page transitions use `PageTransition` with `AnimatePresence`.

## 6. KaTeX RTL Isolation

**Critical constraint**: KaTeX math rendering is force-isolated to LTR inside the RTL page. The `!important` rules on `.katex`, `.katex-display`, `.katex-html`, and `.katex .base` in `index.css` must not be modified. Any change here breaks formula rendering across all pages.

## 7. Spacing & Border Radius

Defined as CSS custom properties (not in `@theme` — consumed via `var()`):

- **Spacing** (4px base): `--spacing-0_5` (2px) through `--spacing-24` (96px)
- **Border Radius**: `--rounded-none` (0px) through `--rounded-full` (9999px)

Prefer Tailwind utility classes (`p-4`, `rounded-lg`) where they map to these scales; use `var(--spacing-*)` / `var(--rounded-*)` for design-precise values.