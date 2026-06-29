---
version: beta
name: Statistics Calculator
description: Academic-grade statistics calculator for Hebrew-speaking students. Modern-minimal aesthetic driven by clarity and component reuse.
---

# DESIGN.md

This document defines the **Modern Minimal** design system and the **Global Templating Architecture** that powers Statisti-Kal. 

> [!IMPORTANT]
> **Strict Adherence Rule**: All UI must be constructed using the templates defined in `web/src/components/ui`. No inline HTML `<div className="...">` should be used for foundational elements.

## 1. Visual Language & Tokens

The application uses a constrained, monochrome base palette with semantic blue accents. The source of truth for these variables is `web/src/index.css`.

### Base Layer
- **Background**: `--color-background` (`#171717`) – The core void.
- **Surface**: `--color-surface` (`#262626`) – Elevated panels and cards.
- **Surface Raised**: `--color-surface-raised` (`#404040`) – Interactive hover states.
- **Border**: `--color-border` (`#404040`) – Structural containment lines.

### Text Layer
- **Primary**: `--color-text-primary` (`#e5e5e5`)
- **Secondary (Muted)**: `--color-text-secondary` (`#a3a3a3`)

### Accent Layer
- **Primary / Brand**: `--color-primary` (`#3b82f6`)
- **Info / Cobalt**: `--color-accent-cobalt` (`#1e3a8a`)
- **Warning / Brass (Legacy)**: `--color-accent-brass` (`#60a5fa`)
- **Destructive**: `--color-accent-crimson` (`#ef4444`)

### Chart Palette
- `--chart-1`: `#60a5fa`
- `--chart-2`: `#3b82f6`
- `--chart-3`: `#2563eb`
- `--chart-4`: `#1d4ed8`
- `--chart-5`: `#1e40af`

## 2. Typography

We prioritize system fonts and highly legible modern typefaces.

* **Sans**: `Inter`, system-ui
* **Serif**: `Source Serif 4`, serif
* **Mono**: `Geist Mono`, monospace

### Hierarchy Rules
* **Page Titles**: `Inter` bold (`font-bold`, `text-2xl`)
* **Section Headers**: `Inter` semi-bold (`font-semibold`, `text-lg`)
* **Statistical Values / Math**: Rendered via `KaTeX` or `Geist Mono` for clarity.

## 3. Global Templates (The Architecture)

To prevent visual drift, **ALL calculators** must construct their interfaces using these global wrappers.

### `ChartWrapper`
* **Purpose**: Encapsulates Recharts graphics.
* **Style**: Applies `--color-surface` background, `--color-border` outlines, and manages the legend. 

### `ChartPrimitives` (Internal)
* **Purpose**: Standardized X/Y axis ticks and mean indicators.
* **Rule**: Charts must use `--chart-1` to `--chart-5` and uniform dashed reference lines for mean markers.

### `ParameterGrid`
* **Purpose**: Two-column responsive grid for numerical inputs.
* **Style**: Enforces consistent spacing (`gap-4`) and responsive breakpoints (`md:grid-cols-2`).

### `StepByStepResult`
* **Purpose**: Renders the decision workflow.
* **Style**: Employs `Accordion` or semantic `Card` blocks to present mathematical conclusions.